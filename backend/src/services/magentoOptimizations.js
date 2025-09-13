
/**
 * Magento Service Optimizations
 * Reduces timeout errors and improves reliability
 */

export const magentoOptimizations = {
  // Request configuration
  requestConfig: {
    timeout: 60000, // 60 seconds
    maxRetries: 3,
    retryDelay: 2000,

    // Connection settings
    keepAlive: true,
    keepAliveMsecs: 30000,

    // Headers optimization
    headers: {
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=30, max=100',
      'User-Agent': 'TECHNO-ETL/2.0.0 (Optimized)',
      'Accept-Encoding': 'gzip, deflate',
      'Cache-Control': 'no-cache',
    },
  },

  // Circuit breaker settings
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 30000,
    monitoringPeriod: 10000,
  },

  // Cache optimization
  cacheConfig: {
    ttl: 300, // 5 minutes
    maxSize: 1000,
    checkPeriod: 600, // 10 minutes
  },

  // Batch processing settings
  batchConfig: {
    maxBatchSize: 100,
    batchDelay: 1000,
    maxConcurrent: 3,
  },

  // Error handling
  errorHandling: {
    // Categorize 404s as non-critical
    ignoredErrors: [404],

    // Retry specific status codes
    retryableErrors: [500, 502, 503, 504, 408, 429],

    // Custom error messages
    errorMessages: {
      404: 'Resource not found',
      429: 'Rate limit exceeded',
      500: 'Magento server error',
      502: 'Bad gateway',
      503: 'Service unavailable',
      504: 'Gateway timeout',
    },
  },
};

export default magentoOptimizations;
