/**
 * Production Logger Utility
 * Optimized logging for production environment with structured output and file logging
 *
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

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
 * Write log to file
 */
const writeToFile = (level, message, meta = {}) => {
    try {
        const logEntry = {
            timestamp: getTimestamp(),
            level: level.toUpperCase(),
            message,
            service: 'techno-etl-backend',
            environment: process.env.NODE_ENV || 'development',
            pid: process.pid,
            ...meta
        };

        const logLine = JSON.stringify(logEntry) + '\n';
        const today = new Date().toISOString().split('T')[0];

        // Write to combined log
        const combinedLogFile = path.join(logsDir, `combined-${today}.log`);
        fs.appendFileSync(combinedLogFile, logLine);

        // Write to level-specific log for errors and warnings
        if (level === 'error' || level === 'warn') {
            const levelLogFile = path.join(logsDir, `${level}-${today}.log`);
            fs.appendFileSync(levelLogFile, logLine);
        }
    } catch (error) {
        console.error('Failed to write to log file:', error.message);
    }
};

/**
 * Logger class with different log levels and file logging
 */
class Logger {
    /**
     * Log error messages (always shown)
     */
    error(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.error) {
            const formattedMessage = formatMessage('error', message, meta);
            console.error(formattedMessage);
            writeToFile('error', message, meta);
        }
    }

    /**
     * Log warning messages
     */
    warn(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.warn) {
            const formattedMessage = formatMessage('warn', message, meta);
            console.warn(formattedMessage);
            writeToFile('warn', message, meta);
        }
    }

    /**
     * Log info messages
     */
    info(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.info) {
            const formattedMessage = formatMessage('info', message, meta);
            console.log(formattedMessage);
            writeToFile('info', message, meta);
        }
    }

    /**
     * Log debug messages (only in development or when LOG_LEVEL=debug)
     */
    debug(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.debug) {
            const formattedMessage = formatMessage('debug', message, meta);
            console.log(formattedMessage);
            writeToFile('debug', message, meta);
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
