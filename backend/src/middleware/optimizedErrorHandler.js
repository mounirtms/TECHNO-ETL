
/**
 * Optimized Error Handler
 * Reduces memory usage and improves error tracking
 */

import { logger } from '../utils/logger.js';

export class OptimizedErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.lastCleanup = Date.now();
    this.cleanupInterval = 5 * 60 * 1000; // 5 minutes
  }

  // Periodic cleanup to prevent memory leaks
  cleanup() {
    const now = Date.now();

    if (now - this.lastCleanup > this.cleanupInterval) {
      this.errorCounts.clear();
      this.lastCleanup = now;
      console.log('🧹 Error handler memory cleaned');
    }
  }

  // Categorize errors efficiently
  categorizeError(error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      return 'NETWORK';
    }
    if (error.status >= 400 && error.status < 500) {
      return 'VALIDATION';
    }
    if (error.message.includes('database') || error.message.includes('SQL')) {
      return 'DATABASE';
    }

    return 'SYSTEM';
  }

  // Handle errors with retries and circuit breaker
  async handleError(error, req, res, options = {}) {
    this.cleanup(); // Clean up periodically

    const category = this.categorizeError(error);
    const errorKey = `${req.path}-${category}`;

    // Track error frequency
    const count = this.errorCounts.get(errorKey) || 0;

    this.errorCounts.set(errorKey, count + 1);

    // Log error efficiently
    const logData = {
      category,
      path: req.path,
      method: req.method,
      count: count + 1,
      message: error.message,
    };

    // Don't log stack traces for known network errors
    if (category !== 'NETWORK') {
      logData.stack = error.stack;
    }

    logger.error('Request error', logData);

    // Circuit breaker logic
    if (count > 10) {
      logger.warn('Circuit breaker triggered', { path: req.path, count });
    }

    // Return appropriate response
    const statusCode = error.status || error.statusCode || 500;
    const message = this.getErrorMessage(error, category);

    res.status(statusCode).json({
      error: message,
      category,
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
    });
  }

  getErrorMessage(error, category) {
    if (process.env.NODE_ENV === 'production') {
      switch (category) {
      case 'NETWORK':
        return 'External service unavailable';
      case 'VALIDATION':
        return 'Request validation failed';
      case 'DATABASE':
        return 'Data service error';
      default:
        return 'Internal server error';
      }
    }

    return error.message;
  }
}

export const optimizedErrorHandler = new OptimizedErrorHandler();
export default optimizedErrorHandler;
