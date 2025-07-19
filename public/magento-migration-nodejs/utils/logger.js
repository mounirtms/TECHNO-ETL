/**
 * Logger Utility
 *
 * Centralized logging system for the Magento migration application.
 * Provides structured logging with different levels and output formats.
 *
 * @author Magento Migration Tool
 * @version 1.0.0
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format for migration operations
const migrationFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, operation, ...meta }) => {
    let logMessage = `[${timestamp}] ${level.toUpperCase()}`;

    if (service) logMessage += ` [${service}]`;
    if (operation) logMessage += ` [${operation}]`;

    logMessage += `: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }

    return logMessage;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: migrationFormat,
  defaultMeta: {
    service: 'magento-migration'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    }),

    // Migration-specific log file
    new winston.transports.File({
      filename: path.join(logsDir, 'migration.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, service, operation }) => {
        let logMessage = `${level}`;
        if (service) logMessage += ` [${service}]`;
        if (operation) logMessage += ` [${operation}]`;
        return `${logMessage}: ${message}`;
      })
    )
  }));
}

/**
 * Create operation-specific logger
 * @param {string} operation - Operation name (e.g., 'product-migration', 'attribute-creation')
 * @returns {Object} Logger instance with operation context
 */
function createOperationLogger(operation) {
  return {
    info: (message, meta = {}) => logger.info(message, { operation, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { operation, ...meta }),
    error: (message, meta = {}) => logger.error(message, { operation, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { operation, ...meta })
  };
}

/**
 * Log migration progress
 * @param {string} operation - Operation name
 * @param {number} current - Current progress count
 * @param {number} total - Total items to process
 * @param {Object} meta - Additional metadata
 */
function logProgress(operation, current, total, meta = {}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  logger.info(`Progress: ${current}/${total} (${percentage}%)`, {
    operation,
    progress: {
      current,
      total,
      percentage
    },
    ...meta
  });
}

/**
 * Log API request/response
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} statusCode - Response status code
 * @param {number} duration - Request duration in ms
 * @param {Object} meta - Additional metadata
 */
function logApiCall(method, url, statusCode, duration, meta = {}) {
  const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
  logger[level](`API ${method} ${url} - ${statusCode} (${duration}ms)`, {
    operation: 'api-call',
    api: {
      method,
      url,
      statusCode,
      duration
    },
    ...meta
  });
}

/**
 * Log batch operation
 * @param {string} operation - Operation name
 * @param {number} batchNumber - Current batch number
 * @param {number} totalBatches - Total number of batches
 * @param {number} batchSize - Size of current batch
 * @param {Object} results - Batch results
 */
function logBatch(operation, batchNumber, totalBatches, batchSize, results = {}) {
  logger.info(`Batch ${batchNumber}/${totalBatches} completed`, {
    operation,
    batch: {
      number: batchNumber,
      total: totalBatches,
      size: batchSize,
      ...results
    }
  });
}

/**
 * Log migration summary
 * @param {string} operation - Operation name
 * @param {Object} summary - Migration summary data
 */
function logSummary(operation, summary) {
  logger.info('Migration summary', {
    operation,
    summary
  });
}

/**
 * Log error with context
 * @param {string} operation - Operation name
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
function logError(operation, error, context = {}) {
  logger.error(`Operation failed: ${error.message}`, {
    operation,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context
  });
}

module.exports = {
  logger,
  createOperationLogger,
  logProgress,
  logApiCall,
  logBatch,
  logSummary,
  logError
};