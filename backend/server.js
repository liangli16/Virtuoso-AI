/**
 * AI Product Generator - Express Server
 * Main entry point for the backend API
 * Handles file uploads, AI image generation, and video creation using Freepik API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Configuration
// ============================================================================

/**
 * CORS configuration
 * Allows frontend to communicate with backend from different origins
 */
app.use(cors({
  origin: '*', // In production, specify exact frontend URL
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * Body parsing middleware
 * Parses JSON and URL-encoded request bodies
 */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/**
 * Request logging middleware
 * Logs all incoming HTTP requests with method, path, and IP
 */
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

/**
 * Static file serving
 * Serves frontend files from the frontend directory
 */
const frontendPath = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'frontend')  // Vercel: use current working directory
  : path.join(__dirname, '../frontend');  // Development: use relative path
app.use(express.static(frontendPath));

// Routes
// ============================================================================

/**
 * Health check endpoint
 * Used to verify server is running
 */
app.get('/api/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AI Product Generator API'
  });
});

/**
 * Image generation routes
 * Handles AI image generation requests and status polling
 */
const imageRoutes = require('./routes/image');
app.use('/api', imageRoutes);

/**
 * Video generation routes
 * Handles AI video generation requests and status polling
 */
const videoRoutes = require('./routes/video');
app.use('/api', videoRoutes);

/**
 * Root endpoint - serves the main HTML page
 */
app.get('/', (req, res) => {
  const indexPath = process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'frontend', 'index.html')  // Vercel: use current working directory
    : path.join(__dirname, '../frontend', 'index.html');  // Development: use relative path
  res.sendFile(indexPath);
});

// Error Handling Middleware
// ============================================================================

/**
 * 404 handler for undefined routes
 */
app.use((req, res) => {
  logger.warn('Route not found', { path: req.path, method: req.method });
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/**
 * Global error handler
 * Catches all errors and returns appropriate response
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server Initialization
// ============================================================================

/**
 * Start the Express server
 * Listens on configured port and logs startup information
 */
let server;
if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), export the app instead of starting a server
  module.exports = app;
} else {
  // In development, start the server normally
  server = app.listen(PORT, () => {
    logger.info('='.repeat(60));
    logger.info('Virtuoso Ads Server Started', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    });
    logger.info(`Server running at http://localhost:${PORT}`);
    logger.info(`Virtuoso Ads available at http://localhost:${PORT}`);
    logger.info(`API endpoints at http://localhost:${PORT}/api`);
    logger.info('='.repeat(60));
  });
}

/**
 * Graceful shutdown handler
 * Closes server connections cleanly on SIGTERM/SIGINT
 */
const gracefulShutdown = () => {
  if (server) { // Only run if server is defined (development environment)
    logger.info('Received shutdown signal, closing server gracefully...');

    server.close(() => {
      logger.info('Server closed successfully');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/**
 * Unhandled rejection handler
 * Logs unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason,
    promise: promise
  });
});

/**
 * Uncaught exception handler
 * Logs uncaught exceptions and exits
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

module.exports = app;

