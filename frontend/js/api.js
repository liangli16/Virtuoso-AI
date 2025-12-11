/**
 * API Client Module
 * Handles all HTTP requests to the backend API
 * Provides clean interface for image and video generation
 */

const API = {
  /**
   * Base URL for API endpoints
   * Defaults to current origin for production deployment
   */
  baseURL: window.location.origin,

  /**
   * Initiates image generation with uploaded files and color scheme
   * @param {File} logoFile - Logo image file
   * @param {File} prototypeFile - Prototype design image file
   * @param {string} colorScheme - Hex color code (e.g., #FF5733)
   * @param {string} imageStyle - Selected image style (realistic, comic, etc.)
   * @param {string} orientation - Image orientation (landscape or portrait)
   * @returns {Promise<Object>} Response with task_id and status
   */
  async generateImage(logoFile, prototypeFile, colorScheme, imageStyle = 'realistic', orientation = 'landscape') {
    console.log('API: Initiating image generation', { 
      logo: logoFile.name, 
      prototype: prototypeFile.name, 
      colorScheme,
      imageStyle,
      orientation
    });

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('logo', logoFile);
    formData.append('prototype', prototypeFile);
    formData.append('colorScheme', colorScheme);
    formData.append('imageStyle', imageStyle);
    formData.append('orientation', orientation);

    try {
      const response = await fetch(`${this.baseURL}/api/generate-image`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate image');
      }

      console.log('API: Image generation initiated', data);
      return data;
    } catch (error) {
      console.error('API: Image generation failed', error);
      throw error;
    }
  },

  /**
   * Polls the status of an image generation task
   * @param {string} taskId - Task identifier from initial generation request
   * @returns {Promise<Object>} Current status and image URL (if complete)
   */
  async checkImageStatus(taskId) {
    console.log('API: Checking image status', { taskId });

    try {
      const response = await fetch(`${this.baseURL}/api/image-status/${taskId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check image status');
      }

      console.log('API: Image status received', { taskId, status: data.status });
      return data;
    } catch (error) {
      console.error('API: Image status check failed', error);
      throw error;
    }
  },

  /**
   * Polls image status with automatic retry until completion or timeout
   * @param {string} taskId - Task identifier
   * @param {number} timeout - Maximum time to wait in milliseconds (default: 5 minutes)
   * @param {Function} onProgress - Callback function for status updates
   * @returns {Promise<Object>} Final result with imageUrl
   */
  async pollImageStatus(taskId, timeout = 300000, onProgress = null) {
    console.log('API: Starting image status polling', { taskId, timeout });

    const startTime = Date.now();
    const pollInterval = 2000; // Poll every 2 seconds

    while (true) {
      // Check for timeout
      if (Date.now() - startTime > timeout) {
        throw new Error('Image generation timed out after 5 minutes');
      }

      // Check status
      const result = await this.checkImageStatus(taskId);

      // Call progress callback if provided
      if (onProgress) {
        onProgress(result.status);
      }

      // Handle completion
      if (result.status === 'COMPLETED') {
        console.log('API: Image generation completed', result);
        return result;
      }

      // Handle failure
      if (result.status === 'FAILED') {
        throw new Error('Image generation failed');
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  },

  /**
   * Initiates video generation from a product image
   * @param {string} imageUrl - URL of the product image
   * @param {number} duration - Video duration (6 or 10 seconds)
   * @param {string} videoContentStyle - Video content style (showcase, coming-soon, lifestyle)
   * @param {string} imageStyle - The image style used for generation (to align video style)
   * @returns {Promise<Object>} Response with task_id and status
   */
  async generateVideo(imageUrl, duration = 6, videoContentStyle = 'showcase', imageStyle = 'realistic') {
    console.log('API: Initiating video generation', { 
      imageUrl, 
      duration, 
      videoContentStyle,
      imageStyle
    });

    try {
      const response = await fetch(`${this.baseURL}/api/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl,
          duration: parseInt(duration),
          videoContentStyle,
          imageStyle
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate video');
      }

      console.log('API: Video generation initiated', data);
      return data;
    } catch (error) {
      console.error('API: Video generation failed', error);
      throw error;
    }
  },

  /**
   * Polls the status of a video generation task
   * @param {string} taskId - Task identifier from initial generation request
   * @returns {Promise<Object>} Current status and video URL (if complete)
   */
  async checkVideoStatus(taskId) {
    console.log('API: Checking video status', { taskId });

    try {
      const response = await fetch(`${this.baseURL}/api/video-status/${taskId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check video status');
      }

      console.log('API: Video status received', { taskId, status: data.status });
      return data;
    } catch (error) {
      console.error('API: Video status check failed', error);
      throw error;
    }
  },

  /**
   * Polls video status with automatic retry until completion or timeout
   * @param {string} taskId - Task identifier
   * @param {number} timeout - Maximum time to wait in milliseconds (default: 10 minutes)
   * @param {Function} onProgress - Callback function for status updates
   * @returns {Promise<Object>} Final result with videoUrl
   */
  async pollVideoStatus(taskId, timeout = 600000, onProgress = null) {
    console.log('API: Starting video status polling', { taskId, timeout });

    const startTime = Date.now();
    const pollInterval = 2000; // Poll every 2 seconds

    while (true) {
      // Check for timeout
      if (Date.now() - startTime > timeout) {
        throw new Error('Video generation timed out after 10 minutes');
      }

      // Check status
      const result = await this.checkVideoStatus(taskId);

      // Call progress callback if provided
      if (onProgress) {
        onProgress(result.status);
      }

      // Handle completion
      if (result.status === 'COMPLETED') {
        console.log('API: Video generation completed', result);
        return result;
      }

      // Handle failure
      if (result.status === 'FAILED') {
        throw new Error('Video generation failed');
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  },

  /**
   * Health check endpoint to verify API connectivity
   * @returns {Promise<Object>} Health check response
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      const data = await response.json();
      console.log('API: Health check', data);
      return data;
    } catch (error) {
      console.error('API: Health check failed', error);
      throw error;
    }
  }
};

