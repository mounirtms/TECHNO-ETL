/**
 * Production-Grade Logging Service for TECHNO-ETL
 * Comprehensive logging with structured format, rotation, and monitoring
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels configuration
const LOG_LEVELS = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
};

// Sensitive data patterns to redact
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /authorization/i,
  /cookie/i,
  /session/i,
  /credit.*card/i,
  /ssn/i,
  /social.*security/i
];

class ProductionLogger {
  constructor() {
    this.correlationStore = new Map();
    this.sessionStore = new Map();
    this.metricsStore = new Map();
    this.initializeLogger();
    this.startMetricsCollection();
  }

  initializeLogger() {
    // Simple console-based logger for now
    this.logger = {
      info: (message, meta = {}) => this.logToConsole('INFO', message, meta),
      warn: (message, meta = {}) => this.logToConsole('WARN', message, meta),
      error: (message, meta = {}) => this.logToConsole('ERROR', message, meta),
      debug: (message, meta = {}) => this.logToConsole('DEBUG', message, meta),
      log: (level, message, meta = {}) => this.logToConsole(level.toUpperCase(), message, meta)
    };

    // Create specialized loggers
    this.userActivityLogger = this.logger;
    this.apiRequestLogger = this.logger;
    this.performanceLogger = this.logger;
  }

  logToConsole(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'techno-etl-backend',
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid,
      ...this.sanitizeData(meta)
    };

    console.log(JSON.stringify(logEntry));
  }

    // Simple file logging (will be enhanced with proper logging library later)
    this.logToFile = (level, message, meta) => {
      try {
        const logEntry = {
          timestamp: new Date().toISOString(),
          level,
          message,
          service: 'techno-etl-backend',
          environment: process.env.NODE_ENV || 'development',
          pid: process.pid,
          ...this.sanitizeData(meta)
        };

        const logLine = JSON.stringify(logEntry) + '\n';
        const logFile = path.join(logsDir, `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`);

        fs.appendFileSync(logFile, logLine);
      } catch (error) {
        console.error('Failed to write to log file:', error.message);
      }
    };
  }

  // Generate correlation ID for request tracing
  generateCorrelationId() {
    return crypto.randomUUID();
  }

  // Sanitize sensitive data from logs
  sanitizeData(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    
    for (const key in sanitized) {
      if (SENSITIVE_PATTERNS.some(pattern => pattern.test(key))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  // Core logging methods
  fatal(message, meta = {}) {
    this.logger.log('fatal', message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  trace(message, meta = {}) {
    this.logger.log('trace', message, meta);
  }

  // User activity logging
  logUserActivity(activity, userId, sessionId, metadata = {}) {
    const logEntry = {
      category: 'user_activity',
      activity,
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    this.userActivityLogger.info('User activity logged', logEntry);
  }

  // API request logging
  logApiRequest(req, res, responseTime, metadata = {}) {
    const logEntry = {
      category: 'api_request',
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      statusCode: res.statusCode,
      responseTime,
      contentLength: res.get('Content-Length'),
      correlationId: req.correlationId,
      userId: req.userId,
      sessionId: req.sessionId,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    this.apiRequestLogger.info('API request logged', logEntry);
  }

  // Performance logging
  logPerformance(metric, value, metadata = {}) {
    const logEntry = {
      category: 'performance',
      metric,
      value,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    this.performanceLogger.info('Performance metric logged', logEntry);
  }

  // Error categorization
  logCategorizedError(error, category, context = {}) {
    const errorEntry = {
      category: 'error',
      errorCategory: category,
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      context: this.sanitizeData(context),
      timestamp: new Date().toISOString()
    };

    this.error('Categorized error logged', errorEntry);
  }

  // Start metrics collection
  startMetricsCollection() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.logPerformance('memory_usage', {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external
      });

      this.logPerformance('cpu_usage', {
        user: cpuUsage.user,
        system: cpuUsage.system
      });
    }, 60000); // Every minute
  }

  // Get logger instance for external use
  getLogger() {
    return this.logger;
  }

  // Get metrics for monitoring
  getMetrics() {
    return {
      correlationStoreSize: this.correlationStore.size,
      sessionStoreSize: this.sessionStore.size,
      metricsStoreSize: this.metricsStore.size,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }
}

// Create singleton instance
const productionLogger = new ProductionLogger();

export default productionLogger;
export { ProductionLogger };
