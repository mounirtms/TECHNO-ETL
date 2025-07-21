/**
 * Production Logger Utility
 * Optimized logging for production environment with structured output
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// Log levels hierarchy
const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

// Get current log level number
const currentLogLevel = LOG_LEVELS[logLevel] || LOG_LEVELS.info;

/**
 * Format timestamp for logs
 */
const getTimestamp = () => {
    return new Date().toISOString();
};

/**
 * Format log message with metadata
 */
const formatMessage = (level, message, meta = {}) => {
    const timestamp = getTimestamp();
    const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        message,
        ...meta
    };

    if (isProduction) {
        // Structured JSON logging for production
        return JSON.stringify(logEntry);
    } else {
        // Human-readable format for development
        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
    }
};

/**
 * Logger class with different log levels
 */
class Logger {
    /**
     * Log error messages (always shown)
     */
    error(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.error) {
            console.error(formatMessage('error', message, meta));
        }
    }

    /**
     * Log warning messages
     */
    warn(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.warn) {
            console.warn(formatMessage('warn', message, meta));
        }
    }

    /**
     * Log info messages
     */
    info(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.info) {
            console.log(formatMessage('info', message, meta));
        }
    }

    /**
     * Log debug messages (only in development or when LOG_LEVEL=debug)
     */
    debug(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.debug) {
            console.log(formatMessage('debug', message, meta));
        }
    }

    /**
     * Log API requests
     */
    request(req, res, responseTime) {
        const meta = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
        };

        if (res.statusCode >= 400) {
            this.warn(`API Request Failed`, meta);
        } else {
            this.info(`API Request`, meta);
        }
    }

    /**
     * Log database operations
     */
    database(operation, table, meta = {}) {
        this.debug(`Database ${operation}`, {
            table,
            ...meta
        });
    }

    /**
     * Log sync operations
     */
    sync(operation, source, status, meta = {}) {
        const message = `Sync ${operation} - ${source}`;
        
        if (status === 'success') {
            this.info(`✅ ${message}`, meta);
        } else if (status === 'error') {
            this.error(`❌ ${message}`, meta);
        } else {
            this.info(`🔄 ${message}`, meta);
        }
    }

    /**
     * Log server startup
     */
    startup(message, meta = {}) {
        this.info(`🚀 ${message}`, meta);
    }

    /**
     * Log server shutdown
     */
    shutdown(message, meta = {}) {
        this.info(`🔄 ${message}`, meta);
    }
}

// Create singleton logger instance
const logger = new Logger();

// Export logger and utilities
export {
    logger,
    isProduction,
    logLevel,
    LOG_LEVELS
};

// Default export
export default logger;
