/**
 * Request/Response Logging Middleware
 * Comprehensive HTTP request/response logging with correlation IDs and rate limiting tracking
 */

import productionLogger from '../services/productionLogger.js';
import crypto from 'crypto';

class RequestResponseLogger {
  constructor() {
    this.activeRequests = new Map();
    this.rateLimitEvents = new Map();
    this.requestMetrics = {
      totalRequests: 0,
      totalResponseTime: 0,
      statusCodes: {},
      endpoints: {},
      userAgents: {},
      ips: {}
    };
  }

  // Generate correlation ID for request tracing
  generateCorrelationId() {
    return crypto.randomUUID();
  }

  // Extract request information
  extractRequestInfo(req) {
    const correlationId = req.headers['x-correlation-id'] || this.generateCorrelationId();
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const contentLength = req.get('Content-Length') || 0;
    
    return {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      query: req.query,
      headers: this.sanitizeHeaders(req.headers),
      userAgent,
      ip,
      contentLength: parseInt(contentLength),
      timestamp: new Date().toISOString(),
      userId: req.user?.id || req.headers['x-user-id'] || null,
      sessionId: req.sessionID || req.headers['x-session-id'] || null
    };
  }

  // Sanitize headers to remove sensitive information
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'x-session-token'
    ];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  // Extract response information
  extractResponseInfo(res, responseTime) {
    const contentLength = res.get('Content-Length') || 0;
    
    return {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      headers: this.sanitizeHeaders(res.getHeaders()),
      contentLength: parseInt(contentLength),
      responseTime,
      timestamp: new Date().toISOString()
    };
  }

  // Log request start
  logRequestStart(req) {
    const requestInfo = this.extractRequestInfo(req);
    const startTime = Date.now();

    // Store request info for completion logging
    this.activeRequests.set(requestInfo.correlationId, {
      ...requestInfo,
      startTime
    });

    // Add correlation ID to request for downstream use
    req.correlationId = requestInfo.correlationId;

    // Update metrics
    this.updateRequestMetrics(requestInfo);

    // Log request start
    productionLogger.info('HTTP request started', {
      category: 'http_request_start',
      ...requestInfo
    });

    return requestInfo.correlationId;
  }

  // Log request completion
  logRequestComplete(correlationId, res) {
    const requestData = this.activeRequests.get(correlationId);
    if (!requestData) {
      return;
    }

    const responseTime = Date.now() - requestData.startTime;
    const responseInfo = this.extractResponseInfo(res, responseTime);

    const completeLogData = {
      category: 'http_request_complete',
      request: requestData,
      response: responseInfo,
      correlationId
    };

    // Log to API request logger
    productionLogger.logApiRequest(
      { 
        method: requestData.method,
        originalUrl: requestData.url,
        get: (header) => requestData.headers[header.toLowerCase()],
        ip: requestData.ip,
        correlationId,
        userId: requestData.userId,
        sessionId: requestData.sessionId
      },
      res,
      responseTime
    );

    // Log completion
    if (res.statusCode >= 400) {
      productionLogger.warn('HTTP request completed with error', completeLogData);
    } else {
      productionLogger.info('HTTP request completed successfully', completeLogData);
    }

    // Update response metrics
    this.updateResponseMetrics(responseInfo, requestData);

    // Clean up
    this.activeRequests.delete(correlationId);
  }

  // Update request metrics
  updateRequestMetrics(requestInfo) {
    this.requestMetrics.totalRequests++;
    
    // Track endpoints
    const endpoint = `${requestInfo.method} ${requestInfo.path}`;
    if (!this.requestMetrics.endpoints[endpoint]) {
      this.requestMetrics.endpoints[endpoint] = 0;
    }
    this.requestMetrics.endpoints[endpoint]++;

    // Track user agents
    if (!this.requestMetrics.userAgents[requestInfo.userAgent]) {
      this.requestMetrics.userAgents[requestInfo.userAgent] = 0;
    }
    this.requestMetrics.userAgents[requestInfo.userAgent]++;

    // Track IPs
    if (!this.requestMetrics.ips[requestInfo.ip]) {
      this.requestMetrics.ips[requestInfo.ip] = 0;
    }
    this.requestMetrics.ips[requestInfo.ip]++;
  }

  // Update response metrics
  updateResponseMetrics(responseInfo, requestInfo) {
    this.requestMetrics.totalResponseTime += responseInfo.responseTime;

    // Track status codes
    if (!this.requestMetrics.statusCodes[responseInfo.statusCode]) {
      this.requestMetrics.statusCodes[responseInfo.statusCode] = 0;
    }
    this.requestMetrics.statusCodes[responseInfo.statusCode]++;

    // Log performance metrics
    productionLogger.logPerformance('http_response_time', responseInfo.responseTime, {
      endpoint: `${requestInfo.method} ${requestInfo.path}`,
      statusCode: responseInfo.statusCode,
      correlationId: requestInfo.correlationId
    });
  }

  // Log rate limiting events
  logRateLimitEvent(req, limitInfo) {
    const rateLimitData = {
      category: 'rate_limit',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: `${req.method} ${req.path}`,
      correlationId: req.correlationId,
      userId: req.user?.id || null,
      limit: limitInfo.limit,
      remaining: limitInfo.remaining,
      resetTime: limitInfo.resetTime,
      timestamp: new Date().toISOString()
    };

    if (limitInfo.remaining === 0) {
      productionLogger.warn('Rate limit exceeded', rateLimitData);
    } else if (limitInfo.remaining <= 5) {
      productionLogger.info('Rate limit warning', rateLimitData);
    }

    // Store rate limit events for analysis
    const key = `${req.ip}_${req.path}`;
    if (!this.rateLimitEvents.has(key)) {
      this.rateLimitEvents.set(key, []);
    }
    this.rateLimitEvents.get(key).push(rateLimitData);

    // Keep only last 100 events per key
    if (this.rateLimitEvents.get(key).length > 100) {
      this.rateLimitEvents.get(key).shift();
    }
  }

  // Get request metrics
  getMetrics() {
    const avgResponseTime = this.requestMetrics.totalRequests > 0 
      ? this.requestMetrics.totalResponseTime / this.requestMetrics.totalRequests 
      : 0;

    return {
      ...this.requestMetrics,
      averageResponseTime: avgResponseTime,
      activeRequests: this.activeRequests.size,
      rateLimitEvents: this.rateLimitEvents.size
    };
  }

  // Clean up old data
  cleanup() {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    // Clean up hanging requests
    for (const [correlationId, requestData] of this.activeRequests.entries()) {
      if (now - requestData.startTime > timeout) {
        productionLogger.warn('Request timeout detected', {
          category: 'request_timeout',
          correlationId,
          duration: now - requestData.startTime,
          request: requestData
        });
        this.activeRequests.delete(correlationId);
      }
    }
  }
}

// Create singleton instance
const requestResponseLogger = new RequestResponseLogger();

// Clean up old data every 5 minutes
setInterval(() => {
  requestResponseLogger.cleanup();
}, 5 * 60 * 1000);

// Main middleware function
export const requestResponseMiddleware = (req, res, next) => {
  // Log request start and get correlation ID
  const correlationId = requestResponseLogger.logRequestStart(req);

  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // Log request completion
    requestResponseLogger.logRequestComplete(correlationId, res);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  // Add rate limit logging capability to request
  req.logRateLimit = (limitInfo) => {
    requestResponseLogger.logRateLimitEvent(req, limitInfo);
  };

  next();
};

// Rate limiting middleware integration
export const rateLimitLogger = (req, res, next) => {
  // This should be used with express-rate-limit
  const rateLimitInfo = {
    limit: res.getHeader('X-RateLimit-Limit'),
    remaining: res.getHeader('X-RateLimit-Remaining'),
    resetTime: res.getHeader('X-RateLimit-Reset')
  };

  if (rateLimitInfo.limit) {
    requestResponseLogger.logRateLimitEvent(req, rateLimitInfo);
  }

  next();
};

export default requestResponseLogger;
export { RequestResponseLogger };
