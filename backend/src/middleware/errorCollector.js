/**
 * Error and Warning Collection System
 * Comprehensive error tracking with categorization and context collection
 */

import productionLogger from '../services/productionLogger.js';

// Error categories
export const ERROR_CATEGORIES = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  DATABASE: 'database',
  EXTERNAL_SERVICE: 'external_service',
  SYSTEM: 'system',
  NETWORK: 'network',
  RATE_LIMIT: 'rate_limit',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

// Warning types
export const WARNING_TYPES = {
  PERFORMANCE_DEGRADATION: 'performance_degradation',
  HIGH_MEMORY_USAGE: 'high_memory_usage',
  HIGH_CPU_USAGE: 'high_cpu_usage',
  SLOW_QUERY: 'slow_query',
  RATE_LIMIT_APPROACHING: 'rate_limit_approaching',
  EXTERNAL_SERVICE_SLOW: 'external_service_slow',
  CACHE_MISS_HIGH: 'cache_miss_high',
  DISK_SPACE_LOW: 'disk_space_low'
};

class ErrorCollector {
  constructor() {
    this.errorStats = {
      total: 0,
      byCategory: {},
      byEndpoint: {},
      byUser: {},
      recent: []
    };
    
    this.warningStats = {
      total: 0,
      byType: {},
      recent: []
    };

    this.performanceThresholds = {
      responseTime: 1000, // ms
      memoryUsage: 0.8, // 80% of available memory
      cpuUsage: 0.8, // 80% CPU usage
      diskUsage: 0.9 // 90% disk usage
    };

    this.startPerformanceMonitoring();
  }

  // Categorize error based on error object and context
  categorizeError(error, context = {}) {
    const message = error.message?.toLowerCase() || '';
    const code = error.code;
    const status = error.status || error.statusCode;

    // Authentication errors
    if (status === 401 || message.includes('unauthorized') || message.includes('authentication')) {
      return ERROR_CATEGORIES.AUTHENTICATION;
    }

    // Authorization errors
    if (status === 403 || message.includes('forbidden') || message.includes('permission')) {
      return ERROR_CATEGORIES.AUTHORIZATION;
    }

    // Validation errors
    if (status === 400 || message.includes('validation') || message.includes('invalid')) {
      return ERROR_CATEGORIES.VALIDATION;
    }

    // Database errors
    if (code === 'ECONNREFUSED' || message.includes('database') || message.includes('sql')) {
      return ERROR_CATEGORIES.DATABASE;
    }

    // Network errors
    if (code === 'ENOTFOUND' || code === 'ETIMEDOUT' || message.includes('network')) {
      return ERROR_CATEGORIES.NETWORK;
    }

    // Timeout errors
    if (code === 'ETIMEDOUT' || message.includes('timeout')) {
      return ERROR_CATEGORIES.TIMEOUT;
    }

    // Rate limit errors
    if (status === 429 || message.includes('rate limit')) {
      return ERROR_CATEGORIES.RATE_LIMIT;
    }

    // External service errors
    if (context.isExternalService || message.includes('external') || message.includes('api')) {
      return ERROR_CATEGORIES.EXTERNAL_SERVICE;
    }

    // System errors
    if (message.includes('system') || message.includes('internal')) {
      return ERROR_CATEGORIES.SYSTEM;
    }

    return ERROR_CATEGORIES.UNKNOWN;
  }

  // Collect error with full context
  collectError(error, req = null, additionalContext = {}) {
    const category = this.categorizeError(error, additionalContext);
    const timestamp = new Date().toISOString();
    
    const errorData = {
      category,
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      status: error.status || error.statusCode,
      timestamp,
      ...additionalContext
    };

    // Add request context if available
    if (req) {
      errorData.request = {
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        correlationId: req.correlationId,
        userId: req.user?.id || req.headers['x-user-id'],
        sessionId: req.sessionID || req.headers['x-session-id']
      };
    }

    // Add system context
    errorData.system = {
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version
    };

    // Update statistics
    this.updateErrorStats(errorData);

    // Log the error
    productionLogger.logCategorizedError(error, category, errorData);

    return errorData;
  }

  // Collect warning
  collectWarning(type, message, context = {}) {
    const timestamp = new Date().toISOString();
    
    const warningData = {
      type,
      message,
      timestamp,
      ...context
    };

    // Update statistics
    this.updateWarningStats(warningData);

    // Log the warning
    productionLogger.warn('System warning collected', {
      category: 'system_warning',
      warningType: type,
      ...warningData
    });

    return warningData;
  }

  // Update error statistics
  updateErrorStats(errorData) {
    this.errorStats.total++;

    // By category
    if (!this.errorStats.byCategory[errorData.category]) {
      this.errorStats.byCategory[errorData.category] = 0;
    }
    this.errorStats.byCategory[errorData.category]++;

    // By endpoint
    if (errorData.request?.url) {
      const endpoint = `${errorData.request.method} ${errorData.request.url}`;
      if (!this.errorStats.byEndpoint[endpoint]) {
        this.errorStats.byEndpoint[endpoint] = 0;
      }
      this.errorStats.byEndpoint[endpoint]++;
    }

    // By user
    if (errorData.request?.userId) {
      if (!this.errorStats.byUser[errorData.request.userId]) {
        this.errorStats.byUser[errorData.request.userId] = 0;
      }
      this.errorStats.byUser[errorData.request.userId]++;
    }

    // Recent errors (keep last 100)
    this.errorStats.recent.push(errorData);
    if (this.errorStats.recent.length > 100) {
      this.errorStats.recent.shift();
    }
  }

  // Update warning statistics
  updateWarningStats(warningData) {
    this.warningStats.total++;

    // By type
    if (!this.warningStats.byType[warningData.type]) {
      this.warningStats.byType[warningData.type] = 0;
    }
    this.warningStats.byType[warningData.type]++;

    // Recent warnings (keep last 100)
    this.warningStats.recent.push(warningData);
    if (this.warningStats.recent.length > 100) {
      this.warningStats.recent.shift();
    }
  }

  // Start performance monitoring
  startPerformanceMonitoring() {
    setInterval(() => {
      this.checkPerformanceThresholds();
    }, 30000); // Check every 30 seconds
  }

  // Check performance thresholds and generate warnings
  checkPerformanceThresholds() {
    const memUsage = process.memoryUsage();
    const memUsagePercent = memUsage.heapUsed / memUsage.heapTotal;

    // Memory usage warning
    if (memUsagePercent > this.performanceThresholds.memoryUsage) {
      this.collectWarning(WARNING_TYPES.HIGH_MEMORY_USAGE, 
        `Memory usage at ${(memUsagePercent * 100).toFixed(1)}%`, {
          memoryUsage: memUsage,
          threshold: this.performanceThresholds.memoryUsage
        });
    }

    // Add more performance checks as needed
  }

  // Get error statistics
  getErrorStats() {
    return {
      ...this.errorStats,
      errorRate: this.calculateErrorRate(),
      topErrors: this.getTopErrors(),
      recentErrors: this.errorStats.recent.slice(-10)
    };
  }

  // Get warning statistics
  getWarningStats() {
    return {
      ...this.warningStats,
      recentWarnings: this.warningStats.recent.slice(-10)
    };
  }

  // Calculate error rate
  calculateErrorRate() {
    const recentErrors = this.errorStats.recent.filter(
      error => Date.now() - new Date(error.timestamp).getTime() < 3600000 // Last hour
    );
    return recentErrors.length;
  }

  // Get top errors by frequency
  getTopErrors() {
    return Object.entries(this.errorStats.byCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));
  }
}

// Create singleton instance
const errorCollector = new ErrorCollector();

// Error handling middleware
export const errorHandlingMiddleware = (err, req, res, next) => {
  // Collect the error
  const errorData = errorCollector.collectError(err, req, {
    isMiddleware: true,
    endpoint: `${req.method} ${req.path}`
  });

  // Set correlation ID in response headers
  if (req.correlationId) {
    res.setHeader('X-Correlation-ID', req.correlationId);
  }

  // Send appropriate error response
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;

  res.status(statusCode).json({
    error: {
      message,
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

// Warning collection middleware
export const warningMiddleware = (req, res, next) => {
  // Add warning collection method to request
  req.collectWarning = (type, message, context = {}) => {
    return errorCollector.collectWarning(type, message, {
      ...context,
      request: {
        method: req.method,
        url: req.originalUrl,
        correlationId: req.correlationId,
        userId: req.user?.id
      }
    });
  };

  next();
};

// Performance degradation detection middleware
export const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Check for slow responses
    if (responseTime > errorCollector.performanceThresholds.responseTime) {
      errorCollector.collectWarning(WARNING_TYPES.PERFORMANCE_DEGRADATION,
        `Slow response detected: ${responseTime}ms`, {
          responseTime,
          endpoint: `${req.method} ${req.path}`,
          threshold: errorCollector.performanceThresholds.responseTime
        });
    }
  });

  next();
};

export default errorCollector;
export { ErrorCollector };
