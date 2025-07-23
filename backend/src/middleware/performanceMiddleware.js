/**
 * Performance Monitoring Middleware
 * Tracks request performance and collects metrics
 */
import { logger } from '../utils/logger.js';
import metricsService from '../services/metricsService.js';

/**
 * Request timing middleware
 * Measures response time and logs slow requests
 */
export const requestTimingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Record metrics
    metricsService.recordRequest(req.method, req.path, res.statusCode, responseTime);
    
    // Log slow requests (> 1 second)
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        responseTime: `${responseTime}ms`,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    }
    
    // Log request
    logger.request(req, res, responseTime);
    
    // Call original end
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Memory monitoring middleware
 * Tracks memory usage and warns on high usage
 */
export const memoryMonitoringMiddleware = (req, res, next) => {
  const memory = process.memoryUsage();
  const heapUsedMB = Math.round(memory.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memory.heapTotal / 1024 / 1024);
  const usagePercent = (memory.heapUsed / memory.heapTotal) * 100;
  
  // Warn on high memory usage
  if (usagePercent > 85) {
    logger.warn('High memory usage detected', {
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      usagePercent: `${usagePercent.toFixed(1)}%`,
      path: req.path
    });
  }
  
  // Add memory info to response headers in development
  if (process.env.NODE_ENV === 'development') {
    res.set('X-Memory-Usage', `${heapUsedMB}MB`);
    res.set('X-Memory-Percent', `${usagePercent.toFixed(1)}%`);
  }
  
  next();
};

/**
 * Rate limiting monitoring middleware
 * Tracks request rates and identifies potential abuse
 */
export const rateLimitMonitoringMiddleware = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const key = `rate_limit:${clientIP}`;
  
  // This is a simple in-memory rate tracking
  // In production, use Redis for distributed rate limiting
  if (!global.rateLimitTracker) {
    global.rateLimitTracker = new Map();
  }
  
  const now = Date.now();
  const windowSize = 60000; // 1 minute window
  const maxRequests = 100; // Max requests per minute
  
  const clientData = global.rateLimitTracker.get(key) || { requests: [], warnings: 0 };
  
  // Remove old requests outside the window
  clientData.requests = clientData.requests.filter(timestamp => now - timestamp < windowSize);
  
  // Add current request
  clientData.requests.push(now);
  
  // Check if rate limit exceeded
  if (clientData.requests.length > maxRequests) {
    clientData.warnings++;
    
    logger.warn('Rate limit exceeded', {
      clientIP,
      requestCount: clientData.requests.length,
      maxRequests,
      warnings: clientData.warnings,
      path: req.path,
      userAgent: req.get('User-Agent')
    });
    
    // Add rate limit headers
    res.set('X-RateLimit-Limit', maxRequests);
    res.set('X-RateLimit-Remaining', Math.max(0, maxRequests - clientData.requests.length));
    res.set('X-RateLimit-Reset', new Date(now + windowSize).toISOString());
  }
  
  global.rateLimitTracker.set(key, clientData);
  
  next();
};

/**
 * Error tracking middleware
 * Captures and logs application errors with context
 */
export const errorTrackingMiddleware = (err, req, res, next) => {
  const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log error with full context
  logger.error('Application error', {
    errorId,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: req.headers,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    timestamp: new Date().toISOString()
  });
  
  // Record error metric
  metricsService.recordRequest(req.method, req.path, 500, 0);
  
  // Send error response
  res.status(500).json({
    error: 'Internal Server Error',
    errorId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Database query monitoring wrapper
 * Wraps database queries to track performance
 */
export const monitorDatabaseQuery = async (queryFn, queryName = 'unknown') => {
  const startTime = Date.now();
  let success = true;
  
  try {
    const result = await queryFn();
    return result;
  } catch (error) {
    success = false;
    logger.error('Database query failed', {
      queryName,
      error: error.message,
      duration: Date.now() - startTime
    });
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    metricsService.recordDatabaseQuery(duration, success);
    
    // Log slow queries (> 500ms)
    if (duration > 500) {
      logger.warn('Slow database query', {
        queryName,
        duration: `${duration}ms`,
        success
      });
    }
  }
};

/**
 * Sync job monitoring wrapper
 * Wraps sync operations to track performance
 */
export const monitorSyncJob = async (syncFn, jobName = 'unknown') => {
  const startTime = Date.now();
  let success = true;
  
  logger.info(`Starting sync job: ${jobName}`);
  
  try {
    const result = await syncFn();
    logger.info(`Sync job completed: ${jobName}`, {
      duration: `${Date.now() - startTime}ms`
    });
    return result;
  } catch (error) {
    success = false;
    logger.error(`Sync job failed: ${jobName}`, {
      error: error.message,
      duration: `${Date.now() - startTime}ms`
    });
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    metricsService.recordSyncJob(duration, success);
  }
};
