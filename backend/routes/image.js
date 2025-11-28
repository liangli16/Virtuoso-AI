/**
 * Image Generation Routes
 * Handles endpoints for AI image generation and status polling
 */

const express = require('express');
const router = express.Router();
const { uploadImages, handleUploadError, cleanupFiles } = require('../middleware/upload');
const { generateImage, checkImageStatus } = require('../services/freepik');
const logger = require('../utils/logger');

/**
 * POST /api/generate-image
 * Initiates AI image generation with uploaded images and color scheme
 * 
 * Request:
 * - Form Data:
 *   - logo: Image file (logo)
 *   - prototype: Image file (prototype design)
 *   - colorScheme: Hex color code (e.g., #FF5733)
 * 
 * Response:
 * - task_id: Unique identifier for polling status
 * - status: Initial status of the generation task
 * 
 * @example
 * Response:
 * {
 *   "success": true,
 *   "task_id": "abc123",
 *   "status": "PENDING",
 *   "message": "Image generation started"
 * }
 */
router.post('/generate-image', uploadImages, handleUploadError, async (req, res) => {
  const filesToCleanup = [];
  
  try {
    logger.logRequest(req, 'Image generation requested');
    
    // Validate uploaded files
    if (!req.files || !req.files.logo || !req.files.prototype) {
      logger.warn('Missing required files', { 
        hasLogo: !!req.files?.logo, 
        hasPrototype: !!req.files?.prototype 
      });
      return res.status(400).json({
        success: false,
        message: 'Both logo and prototype images are required'
      });
    }
    
    // Validate color scheme
    const { colorScheme } = req.body;
    if (!colorScheme) {
      logger.warn('Missing color scheme in request');
      return res.status(400).json({
        success: false,
        message: 'Color scheme is required'
      });
    }
    
    // Validate hex color format
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (!hexColorRegex.test(colorScheme)) {
      logger.warn('Invalid color scheme format', { colorScheme });
      return res.status(400).json({
        success: false,
        message: 'Color scheme must be a valid hex color (e.g., #FF5733)'
      });
    }
    
    // Extract file paths
    const logoPath = req.files.logo[0].path;
    const prototypePath = req.files.prototype[0].path;
    
    logger.info('Processing image generation', {
      logo: req.files.logo[0].originalname,
      prototype: req.files.prototype[0].originalname,
      colorScheme,
      logoSize: req.files.logo[0].size,
      prototypeSize: req.files.prototype[0].size
    });
    
    // Track files for cleanup
    filesToCleanup.push(logoPath, prototypePath);
    
    // Call Freepik API service
    const result = await generateImage(logoPath, prototypePath, colorScheme);
    
    // Cleanup uploaded files after processing
    await cleanupFiles(filesToCleanup);
    logger.debug('Cleaned up uploaded files after processing');
    
    // Return task ID for status polling
    res.json(result);
    
  } catch (error) {
    logger.error('Image generation endpoint error', { 
      error: error.message,
      stack: error.stack 
    });
    
    // Cleanup files on error
    if (filesToCleanup.length > 0) {
      await cleanupFiles(filesToCleanup);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate image'
    });
  }
});

/**
 * GET /api/image-status/:taskId
 * Polls the status of an image generation task
 * 
 * URL Parameters:
 * - taskId: Task identifier from initial generation request
 * 
 * Response:
 * - status: Current status (PENDING, PROCESSING, COMPLETED, FAILED)
 * - imageUrl: URL of generated image (only when status is COMPLETED)
 * 
 * @example
 * Response (Pending):
 * {
 *   "success": true,
 *   "status": "PROCESSING",
 *   "task_id": "abc123"
 * }
 * 
 * @example
 * Response (Completed):
 * {
 *   "success": true,
 *   "status": "COMPLETED",
 *   "task_id": "abc123",
 *   "imageUrl": "https://example.com/generated-image.jpg"
 * }
 */
router.get('/image-status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    logger.info('Image status check requested', { taskId });
    
    // Validate task ID
    if (!taskId || taskId.trim() === '') {
      logger.warn('Invalid task ID provided');
      return res.status(400).json({
        success: false,
        message: 'Valid task ID is required'
      });
    }
    
    // Check status via Freepik API service
    const result = await checkImageStatus(taskId);
    
    // Log status progression
    if (result.status === 'COMPLETED') {
      logger.info('Image generation completed successfully', { 
        taskId, 
        imageUrl: result.imageUrl 
      });
    } else if (result.status === 'FAILED') {
      logger.warn('Image generation failed', { taskId });
    }
    
    res.json(result);
    
  } catch (error) {
    logger.error('Image status check endpoint error', { 
      taskId: req.params.taskId,
      error: error.message 
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check image status'
    });
  }
});

module.exports = router;

