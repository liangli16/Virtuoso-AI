/**
 * Video Generation Routes
 * Handles endpoints for AI video generation and status polling
 */

const express = require('express');
const router = express.Router();
const { generateVideo, checkVideoStatus } = require('../services/freepik');
const logger = require('../utils/logger');

/**
 * POST /api/generate-video
 * Initiates AI video generation from a product image
 * 
 * Request Body (JSON):
 * - imageUrl: URL of the product image (from image generation step)
 * - duration: Video duration in seconds (6 or 10)
 * - prompt: Optional custom prompt for video generation
 * 
 * Response:
 * - task_id: Unique identifier for polling status
 * - status: Initial status of the generation task
 * 
 * @example
 * Request:
 * {
 *   "imageUrl": "https://example.com/product-image.jpg",
 *   "duration": 6,
 *   "prompt": "Smooth product showcase with dynamic camera movement"
 * }
 * 
 * @example
 * Response:
 * {
 *   "success": true,
 *   "task_id": "xyz789",
 *   "status": "PENDING",
 *   "message": "Video generation started"
 * }
 */
router.post('/generate-video', async (req, res) => {
  try {
    logger.logRequest(req, 'Video generation requested');
    
    // Extract and validate request data
    const { imageUrl, duration = 6, prompt = null } = req.body;
    
    // Validate required fields
    if (!imageUrl) {
      logger.warn('Missing image URL in video generation request');
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }
    
    // Validate image URL format
    try {
      new URL(imageUrl);
    } catch (error) {
      logger.warn('Invalid image URL format', { imageUrl });
      return res.status(400).json({
        success: false,
        message: 'Invalid image URL format'
      });
    }
    
    // Validate duration
    const durationNum = parseInt(duration);
    if (![6, 10].includes(durationNum)) {
      logger.warn('Invalid video duration', { duration });
      return res.status(400).json({
        success: false,
        message: 'Duration must be either 6 or 10 seconds'
      });
    }
    
    // Validate prompt length if provided
    if (prompt && prompt.length > 1000) {
      logger.warn('Prompt too long', { promptLength: prompt.length });
      return res.status(400).json({
        success: false,
        message: 'Prompt must be less than 1000 characters'
      });
    }
    
    logger.info('Processing video generation', {
      imageUrl,
      duration: durationNum,
      hasCustomPrompt: !!prompt,
      promptLength: prompt?.length || 0
    });
    
    // Call Freepik API service
    const result = await generateVideo(imageUrl, durationNum, prompt);
    
    // Return task ID for status polling
    res.json(result);
    
  } catch (error) {
    logger.error('Video generation endpoint error', { 
      error: error.message,
      stack: error.stack 
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate video'
    });
  }
});

/**
 * GET /api/video-status/:taskId
 * Polls the status of a video generation task
 * 
 * URL Parameters:
 * - taskId: Task identifier from initial generation request
 * 
 * Response:
 * - status: Current status (PENDING, PROCESSING, COMPLETED, FAILED)
 * - videoUrl: URL of generated video (only when status is COMPLETED)
 * 
 * @example
 * Response (Pending):
 * {
 *   "success": true,
 *   "status": "PROCESSING",
 *   "task_id": "xyz789"
 * }
 * 
 * @example
 * Response (Completed):
 * {
 *   "success": true,
 *   "status": "COMPLETED",
 *   "task_id": "xyz789",
 *   "videoUrl": "https://example.com/generated-video.mp4"
 * }
 */
router.get('/video-status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    logger.info('Video status check requested', { taskId });
    
    // Validate task ID
    if (!taskId || taskId.trim() === '') {
      logger.warn('Invalid task ID provided');
      return res.status(400).json({
        success: false,
        message: 'Valid task ID is required'
      });
    }
    
    // Check status via Freepik API service
    const result = await checkVideoStatus(taskId);
    
    // Log status progression
    if (result.status === 'COMPLETED') {
      logger.info('Video generation completed successfully', { 
        taskId, 
        videoUrl: result.videoUrl 
      });
    } else if (result.status === 'FAILED') {
      logger.warn('Video generation failed', { taskId });
    }
    
    res.json(result);
    
  } catch (error) {
    logger.error('Video status check endpoint error', { 
      taskId: req.params.taskId,
      error: error.message 
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check video status'
    });
  }
});

module.exports = router;

