// Unified MagentoService using shared node-cache from config/magento.js

import { getMagentoToken } from '../config/magento.js';
import { logger } from '../utils/logger.js';
import { getFromCache, setInCache } from './cacheService.js';
import RequestBuilder from './requestBuilder.js';
import MemoryMonitor from '../utils/memoryMonitor.js';

let gotPromise = null;

async function getGot() {
  if (!gotPromise) {
    gotPromise = import('got').then(mod => mod.default);
  }

  return gotPromise;
}

class MagentoService {
  constructor(config) {
    this.config = config;
    this.url = config.url.replace(/\/$/, ''); // ensure no trailing slash
    this.defaultCacheTTL = config.cacheTTL || 3600*5; // seconds
    
    // Initialize memory monitor
    this.memoryMonitor = MemoryMonitor.getInstance(config);
    this.memoryMonitor.start();
  }

  async getToken(forceRefresh = false) {
    return getMagentoToken(this.config, forceRefresh);
  }

  buildUrl(endpoint) {
    // Clean up the endpoint path
    let path = endpoint.replace(/^\/+/, ''); // Remove leading slashes

    // If endpoint already has V1 prefix or is a full path, use as-is
    if (!/^V1\b|^rest\/V1\b|^async\//.test(path)) {
      path = `V1/${path}`;
    }

    // Ensure proper URL construction with forward slash
    const finalUrl = `${this.url}/${path}`.replace(/([^:])\/{2,}/g, '$1/');

    return finalUrl;
  }

  async request(method, endpoint, data = null, customHeaders = {}, options = {}) {
    const token = await this.getToken();
    const got = await getGot();
    const url = this.buildUrl(endpoint);
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Techno',
      ...customHeaders,
    };

    const retryOptions = {
      limit: this.config.retries || 2, // Use config setting or default to 2
      methods: ['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE'],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
      calculateDelay: ({ attemptCount }) => {
        return attemptCount > 1 ? Math.min(Math.pow(2, attemptCount) * 200, 5000) : 0; // Exponential backoff
      },
    };

    const gotOptions = {
      method,
      headers,
      throwHttpErrors: false,
      timeout: { request: 30000 }, // 30s timeout
      maxResponseSize: this.config.maxResponseSize || 10 * 1024 * 1024, // 10MB default
      ...options,
    };

    if (options.retry !== false) gotOptions.retry = retryOptions;
    if (data) {
      gotOptions.json = data;
    }

    const startTime = Date.now();

    try {
      const response = await got(url, gotOptions);
      const elapsed = Date.now() - startTime;

      this.logSuccess(method, endpoint, elapsed, response.statusCode, response.retryCount);

      if (response.statusCode >= 400) {
        const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;

        throw new Error((body && body.message) || `Magento API Error: ${response.statusCode}`);
      }

      return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
    } catch (error) {
      this.logError(error, method, endpoint);
      throw error;
    }
  }

  /**
     * GET request with caching.
     * @param {string} endpointWithQuery
     * @param {object} options - got options + { cache: { ttl, forceRefresh } }
     */
  async get(endpointWithQuery, options = {}) {
    const { cache = {}, params = {} } = options;
    
    // Build proper request parameters
    let processedParams = params;

    if (endpointWithQuery.includes('distribution')) {
      processedParams = RequestBuilder.buildDistributionParams(params);
    } else {
      processedParams = RequestBuilder.buildSearchParams(params);
    }
    
    // Append processed parameters to endpoint
    const queryString = new URLSearchParams(processedParams).toString();
    const finalEndpoint = endpointWithQuery + (queryString ? '?' + queryString : '');

    const cacheKey = `magento:get:${finalEndpoint}`;
    const ttl = cache.ttl ?? this.defaultCacheTTL;

    if (!cache.forceRefresh) {
      const cached = await getFromCache(cacheKey);

      if (cached) {
        logger.debug('[MagentoService] Cache HIT', {
          key: cacheKey,
          dataType: typeof cached,
          hasItems: cached && typeof cached === 'object' && 'items' in cached,
        });

        return cached;
      } else {
        logger.debug('[MagentoService] Cache MISS', { key: cacheKey });
      }
    } else {
      logger.info('[MagentoService] Cache FORCE REFRESH', { key: cacheKey });
    }

    const response = await this.request('GET', finalEndpoint, null, {}, options);

    if (response && typeof response === 'object' && response !== null) {
      await setInCache(cacheKey, response, ttl * 1000); // cacheService uses ms
      logger.debug('[MagentoService] Cache SET', { key: cacheKey, ttl: `${ttl}s` });
    } else {
      logger.warn('[MagentoService] Did not cache non-object response', {
        key: cacheKey,
        responseType: typeof response,
      });
    }

    return response;
  }

  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, {}, options);
  }

  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, {}, options);
  }

  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, {}, options);
  }

  logError(error, method, endpoint) {
    logger.error('[MagentoService] Request failed', {
      method,
      endpoint,
      message: error.message,
      // stack: error.stack // Stack can be too verbose for regular logs
    });
  }

  logSuccess(method, endpoint, ms, statusCode, retryCount) {
    const meta = { method, endpoint, statusCode, durationMs: ms, component: 'MagentoService' };

    if (retryCount > 0) {
      meta.retries = retryCount;
    }
    logger.info('[MagentoService] Request successful', meta);
  }
}

export default MagentoService;
