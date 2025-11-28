/**
 * Freepik API Service Module
 * Handles all interactions with Freepik AI APIs
 * Includes image generation (Gemini) and video generation (Minimax Hailuo)
 */

const axios = require('axios');
const logger = require('../utils/logger');
const fs = require('fs').promises;

// API Configuration
const FREEPIK_API_KEY = process.env.FREEPIK_API_KEY;
const IMAGE_API_URL = 'https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview';
const VIDEO_API_URL = 'https://api.freepik.com/v1/ai/image-to-video/minimax-hailuo-02-768p';

// Timeout configurations (in milliseconds)
const IMAGE_TIMEOUT = parseInt(process.env.IMAGE_GENERATION_TIMEOUT) || 300000; // 5 minutes
const VIDEO_TIMEOUT = parseInt(process.env.VIDEO_GENERATION_TIMEOUT) || 600000; // 10 minutes

/**
 * Validates that Freepik API key is configured
 * @throws {Error} If API key is missing
 */
const validateApiKey = () => {
  if (!FREEPIK_API_KEY) {
    logger.error('Freepik API key is not configured');
    throw new Error('FREEPIK_API_KEY is not configured in environment variables');
  }
};

/**
 * Converts an image file to base64 encoding
 * @param {string} filePath - Path to the image file
 * @returns {Promise<string>} Base64 encoded image string
 */
const convertImageToBase64 = async (filePath) => {
  try {
    logger.debug('Converting image to base64', { filePath });
    const imageBuffer = await fs.readFile(filePath);
    const base64Image = imageBuffer.toString('base64');
    logger.debug('Image converted to base64 successfully', { 
      filePath, 
      size: base64Image.length 
    });
    return base64Image;
  } catch (error) {
    logger.error('Failed to convert image to base64', { 
      filePath, 
      error: error.message 
    });
    throw new Error(`Failed to read image file: ${error.message}`);
  }
};

/**
 * Creates a prompt for image generation incorporating color scheme
 * @param {string} colorScheme - Hex color code from user input
 * @returns {string} Formatted prompt for AI image generation
 */
const createImagePrompt = (colorScheme) => {
  const prompt = `Create a professional product poster/mockup that combines the logo and design elements from the reference images. 
Apply a cohesive color scheme featuring ${colorScheme} as the primary color. 
The result should be a polished, marketing-ready product image with modern design aesthetics, 
professional lighting, and high-quality rendering suitable for promotional materials.`;
  
  logger.debug('Generated image prompt', { colorScheme, promptLength: prompt.length });
  return prompt;
};

/**
 * Creates a prompt for video generation
 * @param {string} customPrompt - Optional custom prompt from user
 * @returns {string} Formatted prompt for AI video generation
 */
const createVideoPrompt = (customPrompt) => {
  const defaultPrompt = 'A smooth, professional product showcase with dynamic camera movement, highlighting the product features in a real-world scenario with professional lighting and composition';
  const prompt = customPrompt || defaultPrompt;
  
  logger.debug('Generated video prompt', { 
    isCustom: !!customPrompt, 
    promptLength: prompt.length 
  });
  return prompt;
};

/**
 * Initiates image generation request to Freepik API
 * @param {string} logoPath - Path to logo image file
 * @param {string} prototypePath - Path to prototype design image file
 * @param {string} colorScheme - Hex color code for the color scheme
 * @returns {Promise<Object>} Response containing task_id and initial status
 */
const generateImage = async (logoPath, prototypePath, colorScheme) => {
  validateApiKey();
  
  logger.info('Starting image generation', { 
    logoPath, 
    prototypePath, 
    colorScheme 
  });
  
  try {
    // Convert uploaded images to base64
    const logoBase64 = await convertImageToBase64(logoPath);
    const prototypeBase64 = await convertImageToBase64(prototypePath);
    
    // Prepare request payload
    const payload = {
      prompt: createImagePrompt(colorScheme),
      reference_images: [logoBase64, prototypeBase64]
    };
    
    // Make API request
    logger.logApiCall('Freepik Image Generation', IMAGE_API_URL, 'POST');
    const response = await axios.post(IMAGE_API_URL, payload, {
      headers: {
        'x-freepik-api-key': FREEPIK_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout for initial request
    });
    
    if (response.status === 200) {
      const { task_id, status } = response.data.data;
      logger.info('Image generation initiated successfully', { 
        taskId: task_id, 
        status 
      });
      
      return {
        success: true,
        task_id,
        status,
        message: 'Image generation started'
      };
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    logger.error('Image generation failed', { 
      error: error.message,
      response: error.response?.data 
    });
    
    throw new Error(
      error.response?.data?.message || 
      `Failed to generate image: ${error.message}`
    );
  }
};

/**
 * Checks the status of an image generation task
 * @param {string} taskId - Task ID from initial generation request
 * @returns {Promise<Object>} Current task status and generated image URL (if complete)
 */
const checkImageStatus = async (taskId) => {
  validateApiKey();
  
  logger.logTaskStatus(taskId, 'checking', 'image');
  
  try {
    const statusUrl = `${IMAGE_API_URL}/${taskId}`;
    const response = await axios.get(statusUrl, {
      headers: {
        'x-freepik-api-key': FREEPIK_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (response.status === 200) {
      const { status, generated } = response.data.data;
      logger.logTaskStatus(taskId, status, 'image');
      
      const result = {
        success: true,
        status,
        task_id: taskId
      };
      
      // If completed, extract the image URL
      if (status === 'COMPLETED' && generated) {
        // Filter for HTTPS URLs only
        const imageUrl = generated.find(url => url.startsWith('https://'));
        result.imageUrl = imageUrl;
        logger.info('Image generation completed', { 
          taskId, 
          imageUrl 
        });
      }
      
      return result;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    logger.error('Failed to check image status', { 
      taskId, 
      error: error.message 
    });
    
    throw new Error(
      error.response?.data?.message || 
      `Failed to check status: ${error.message}`
    );
  }
};

/**
 * Initiates video generation request to Freepik API
 * @param {string} imageUrl - URL of the generated product image (or uploaded image)
 * @param {number} duration - Video duration (6 or 10 seconds)
 * @param {string} prompt - Optional custom prompt for video generation
 * @returns {Promise<Object>} Response containing task_id and initial status
 */
const generateVideo = async (imageUrl, duration = 6, prompt = null) => {
  validateApiKey();
  
  logger.info('Starting video generation', { 
    imageUrl, 
    duration, 
    hasCustomPrompt: !!prompt 
  });
  
  try {
    // Validate duration
    if (![6, 10].includes(parseInt(duration))) {
      throw new Error('Duration must be either 6 or 10 seconds');
    }
    
    // Prepare request payload
    const payload = {
      first_frame_image: imageUrl,
      prompt: createVideoPrompt(prompt),
      prompt_optimizer: true, // Enable automatic prompt optimization
      duration: duration.toString()
    };
    
    // Make API request
    logger.logApiCall('Freepik Video Generation', VIDEO_API_URL, 'POST');
    const response = await axios.post(VIDEO_API_URL, payload, {
      headers: {
        'x-freepik-api-key': FREEPIK_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout for initial request
    });
    
    if (response.status === 200) {
      const { task_id, status } = response.data.data;
      logger.info('Video generation initiated successfully', { 
        taskId: task_id, 
        status 
      });
      
      return {
        success: true,
        task_id,
        status,
        message: 'Video generation started'
      };
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    logger.error('Video generation failed', { 
      error: error.message,
      response: error.response?.data 
    });
    
    throw new Error(
      error.response?.data?.message || 
      `Failed to generate video: ${error.message}`
    );
  }
};

/**
 * Checks the status of a video generation task
 * @param {string} taskId - Task ID from initial generation request
 * @returns {Promise<Object>} Current task status and generated video URL (if complete)
 */
const checkVideoStatus = async (taskId) => {
  validateApiKey();
  
  logger.logTaskStatus(taskId, 'checking', 'video');
  
  try {
    const statusUrl = `${VIDEO_API_URL}/${taskId}`;
    const response = await axios.get(statusUrl, {
      headers: {
        'x-freepik-api-key': FREEPIK_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (response.status === 200) {
      const { status, generated } = response.data.data;
      logger.logTaskStatus(taskId, status, 'video');
      
      const result = {
        success: true,
        status,
        task_id: taskId
      };
      
      // If completed, extract the video URL
      if (status === 'COMPLETED' && generated && generated.length > 0) {
        result.videoUrl = generated[0];
        logger.info('Video generation completed', { 
          taskId, 
          videoUrl: result.videoUrl 
        });
      }
      
      return result;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    logger.error('Failed to check video status', { 
      taskId, 
      error: error.message 
    });
    
    throw new Error(
      error.response?.data?.message || 
      `Failed to check status: ${error.message}`
    );
  }
};

module.exports = {
  generateImage,
  checkImageStatus,
  generateVideo,
  checkVideoStatus,
  IMAGE_TIMEOUT,
  VIDEO_TIMEOUT
};

