
/**
 * Optimized API Service
 * Enhanced error handling, retries, and performance monitoring
 */

import axios from 'axios';

class OptimizedAPIService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    this.timeout = 60000; // 60 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000;

    // Create axios instance with optimizations
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TECHNO-ETL-Frontend/2.0.0',
      },
    });

    // Add request interceptor for correlation IDs
    this.api.interceptors.request.use((config) => {
      config.headers['X-Correlation-ID'] = this.generateCorrelationId();
      config.metadata = { startTime: Date.now() };

      return config;
    });

    // Add response interceptor for performance tracking
    this.api.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;

        console.log(`✅ API Request successful: ${response.config.method.toUpperCase()} ${response.config.url} (${duration}ms)`);

        return response;
      },
      async (error) => {
        const duration = error.config?.metadata ?
          Date.now() - error.config.metadata.startTime : 'unknown';

        console.error(`❌ API Request failed: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`);

        // Retry logic for specific error types
        if (this.shouldRetry(error) && error.config && !error.config.__retryCount) {
          return this.retryRequest(error);
        }

        return Promise.reject(this.normalizeError(error));
      },
    );
  }

  generateCorrelationId() {
    return 'frontend-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  shouldRetry(error) {
    // Retry on network errors and 5xx status codes
    return !error.response ||
               error.code === 'ECONNABORTED' ||
               error.code === 'NETWORK_ERROR' ||
               (error.response.status >= 500 && error.response.status < 600);
  }

  async retryRequest(error) {
    const config = error.config;

    config.__retryCount = config.__retryCount || 0;

    if (config.__retryCount >= this.retryAttempts) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;

    // Exponential backoff
    const delay = this.retryDelay * Math.pow(2, config.__retryCount - 1);

    console.log(`🔄 Retrying request (${config.__retryCount}/${this.retryAttempts}) after ${delay}ms`);

    await new Promise(resolve => setTimeout(resolve, delay));

    return this.api(config);
  }

  normalizeError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        status: error.response.status,
        message: error.response.data?.message || error.response.statusText,
        data: error.response.data,
        type: 'response_error',
      };
    } else if (error.request) {
      // Network error
      return {
        status: 0,
        message: 'Network error - please check your connection',
        type: 'network_error',
      };
    } else {
      // Request setup error
      return {
        status: -1,
        message: error.message || 'Request configuration error',
        type: 'request_error',
      };
    }
  }

  // Optimized request methods with built-in error handling
  async get(url, config = {}) {
    try {
      const response = await this.api.get(url, {
        ...config,
        timeout: config.timeout || this.timeout,
      });

      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async post(url, data, config = {}) {
    try {
      const response = await this.api.post(url, data, {
        ...config,
        timeout: config.timeout || this.timeout,
      });

      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async put(url, data, config = {}) {
    try {
      const response = await this.api.put(url, data, {
        ...config,
        timeout: config.timeout || this.timeout,
      });

      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.api.delete(url, {
        ...config,
        timeout: config.timeout || this.timeout,
      });

      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Batch request handling for better performance
  async batch(requests) {
    try {
      const promises = requests.map(req => {
        const { method, url, data, config = {} } = req;

        return this[method.toLowerCase()](url, data, config);
      });

      return await Promise.allSettled(promises);
    } catch (error) {
      console.error('Batch request failed:', error);
      throw error;
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await this.get('/api/health', { timeout: 5000 });

      console.log('🏥 Backend health check passed:', response);

      return true;
    } catch (error) {
      console.warn('🏥 Backend health check failed:', error.message);

      return false;
    }
  }
}

// Export singleton instance
export const apiService = new OptimizedAPIService();
export default apiService;
