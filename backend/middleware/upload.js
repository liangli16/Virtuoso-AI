/**
 * Multer Middleware Configuration
 * Handles file uploads for logo and prototype images
 * Includes validation for file types and sizes
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const logger = require('../utils/logger');

// Use temporary directory for Vercel compatibility
const uploadDir = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'tmp')  // Vercel: use tmp directory
  : path.join(__dirname, '../uploads'); // Development: use uploads directory

// Ensure uploads directory exists (only in development)
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info('Created uploads directory', { path: uploadDir });
}

/**
 * Storage configuration for multer
 * Stores files in appropriate directory based on environment
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // For Vercel, always use temporary directory
    const dest = process.env.NODE_ENV === 'production'
      ? os.tmpdir()
      : uploadDir;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;

    logger.debug('Saving uploaded file', {
      originalName: file.originalname,
      savedAs: filename,
      environment: process.env.NODE_ENV
    });

    cb(null, filename);
  }
});

/**
 * File filter to validate uploaded file types
 * Only allows image files (jpeg, jpg, png, gif, webp)
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  // Allowed image mime types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    logger.debug('File type accepted', { 
      filename: file.originalname, 
      mimetype: file.mimetype 
    });
    cb(null, true);
  } else {
    logger.warn('Invalid file type rejected', { 
      filename: file.originalname, 
      mimetype: file.mimetype 
    });
    cb(new Error(`Invalid file type. Only image files are allowed (${allowedMimeTypes.join(', ')})`), false);
  }
};

/**
 * Multer instance with configuration
 * - Max file size: 10MB per file
 * - Max files: 2 (logo and prototype)
 * - File type validation enabled
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 2 // Maximum 2 files (logo and prototype)
  },
  fileFilter: fileFilter
});

/**
 * Middleware to handle multiple file uploads for image generation
 * Expects two files: 'logo' and 'prototype'
 */
const uploadImages = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'prototype', maxCount: 1 }
]);

/**
 * Error handling middleware for multer errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    logger.error('Multer error during file upload', { error: err.message, code: err.code });
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 10MB limit'
      });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 2 files allowed'
      });
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in file upload'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    // Other errors (e.g., from fileFilter)
    logger.error('File upload error', { error: err.message });
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

/**
 * Utility function to clean up uploaded files
 * Used to remove temporary files after processing
 * @param {Array} filePaths - Array of file paths to delete
 */
const cleanupFiles = async (filePaths) => {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.debug('Cleaned up file', { path: filePath });
      }
    } catch (error) {
      logger.error('Failed to cleanup file', { path: filePath, error: error.message });
    }
  }
};

module.exports = {
  uploadImages,
  handleUploadError,
  cleanupFiles
};






