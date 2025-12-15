/**
 * Winston Logger Configuration Module
 * Provides centralized logging functionality for the application
 * Supports multiple log levels and output formats
 */

const winston = require('winston');
const path = require('path');

/**
 * Custom log format with timestamp and colorization
 * Formats: timestamp [level]: message
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Append metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  })
);

/**
 * Winston logger instance with multiple transports
 * - Console: All logs with colorization
 * - File (error.log): Error level logs only
 * - File (combined.log): All logs
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console transport with colorization for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let logMessage = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(meta).length > 0) {
            logMessage += ` ${JSON.stringify(meta)}`;
          }
          return logMessage;
        })
      )
    }),
    // File transport for error logs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // File transport for all logs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

/**
 * Helper function to log HTTP request details
 * @param {Object} req - Express request object
 * @param {string} action - Description of the action being performed
 */
logger.logRequest = (req, action) => {
  logger.info(`${action} - ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

/**
 * Helper function to log API calls to external services
 * @param {string} service - Name of the external service
 * @param {string} endpoint - API endpoint being called
 * @param {string} method - HTTP method
 */
logger.logApiCall = (service, endpoint, method) => {
  logger.info(`External API Call: ${service}`, {
    endpoint,
    method
  });
};

/**
 * Helper function to log task status updates
 * @param {string} taskId - Task identifier
 * @param {string} status - Current status
 * @param {string} type - Type of task (image/video)
 */
logger.logTaskStatus = (taskId, status, type) => {
  logger.info(`Task Status Update: ${type}`, {
    taskId,
    status
  });
};

module.exports = logger;






