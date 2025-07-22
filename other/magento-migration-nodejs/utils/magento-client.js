/**
 * Magento API Client
 *
 * Centralized HTTP client for Magento REST API interactions.
 * Handles authentication, rate limiting, retries, and error handling.
 *
 * @author Magento Migration Tool
 * @version 1.0.0
 */

const axios = require('axios');
const config = require('../config/app-config');
const { logApiCall, logError } = require('./logger');

class MagentoClient {
  constructor() {
    this.baseURL = config.magento.baseUrl;
    this.adminToken = config.magento.adminToken;
    this.timeout = config.magento.timeout;
    this.retryAttempts = config.magento.retryAttempts;
    this.retryDelay = config.magento.retryDelay;

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.adminToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: Date.now() };
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        logApiCall(
          response.config.method.toUpperCase(),
          response.config.url,
          response.status,
          duration
        );
        return response;
      },
      (error) => {
        if (error.response) {
          const duration = Date.now() - error.config.metadata.startTime;
          logApiCall(
            error.config.method.toUpperCase(),
            error.config.url,
            error.response.status,
            duration,
            { error: error.response.data }
          );
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make HTTP request with retry logic
   * @param {Object} requestConfig - Axios request configuration
   * @param {number} attempt - Current attempt number
   * @returns {Promise} Response data
   */
  async makeRequest(requestConfig, attempt = 1) {
    try {
      const response = await this.client(requestConfig);
      return response.data;
    } catch (error) {
      // Check if we should retry
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.makeRequest(requestConfig, attempt + 1);
      }

      // Log error and throw
      logError('api-request', error, {
        url: requestConfig.url,
        method: requestConfig.method,
        attempt,
        maxAttempts: this.retryAttempts
      });

      throw this.formatError(error);
    }
  }

  /**
   * Determine if request should be retried
   * @param {Error} error - Request error
   * @returns {boolean} Whether to retry
   */
  shouldRetry(error) {
    if (!error.response) {
      // Network errors should be retried
      return true;
    }

    const status = error.response.status;
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429;
  }

  /**
   * Format error for consistent error handling
   * @param {Error} error - Original error
   * @returns {Error} Formatted error
   */
  formatError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || data?.error_description || `HTTP ${status} Error`;

      const formattedError = new Error(message);
      formattedError.status = status;
      formattedError.data = data;
      formattedError.isApiError = true;

      return formattedError;
    }

    return error;
  }

  /**
   * Delay execution
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      await this.makeRequest({
        method: 'GET',
        url: '/rest/V1/store/storeConfigs'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * GET request
   * @param {string} url - Request URL
   * @param {Object} params - Query parameters
   * @returns {Promise} Response data
   */
  async get(url, params = {}) {
    return this.makeRequest({
      method: 'GET',
      url,
      params
    });
  }

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {Object} data - Request body
   * @returns {Promise} Response data
   */
  async post(url, data = {}) {
    return this.makeRequest({
      method: 'POST',
      url,
      data
    });
  }

  /**
   * PUT request
   * @param {string} url - Request URL
   * @param {Object} data - Request body
   * @returns {Promise} Response data
   */
  async put(url, data = {}) {
    return this.makeRequest({
      method: 'PUT',
      url,
      data
    });
  }

  /**
   * DELETE request
   * @param {string} url - Request URL
   * @returns {Promise} Response data
   */
  async delete(url) {
    return this.makeRequest({
      method: 'DELETE',
      url
    });
  }

  // Specialized Magento API methods

  /**
   * Get product by SKU
   * @param {string} sku - Product SKU
   * @returns {Promise} Product data
   */
  async getProductBySku(sku) {
    return this.get(`/rest/V1/products/${encodeURIComponent(sku)}`);
  }

  /**
   * Create product
   * @param {Object} productData - Product data
   * @returns {Promise} Created product data
   */
  async createProduct(productData) {
    return this.post('/rest/V1/products', { product: productData });
  }

  /**
   * Update product by SKU
   * @param {string} sku - Product SKU
   * @param {Object} productData - Product data
   * @returns {Promise} Updated product data
   */
  async updateProduct(sku, productData) {
    return this.put(`/rest/V1/products/${encodeURIComponent(sku)}`, { product: productData });
  }

  /**
   * Get categories
   * @returns {Promise} Categories data
   */
  async getCategories() {
    return this.get('/rest/V1/categories');
  }

  /**
   * Create category
   * @param {Object} categoryData - Category data
   * @returns {Promise} Created category data
   */
  async createCategory(categoryData) {
    return this.post('/rest/V1/categories', { category: categoryData });
  }

  /**
   * Get product attributes
   * @returns {Promise} Attributes data
   */
  async getProductAttributes() {
    return this.get('/rest/V1/products/attributes');
  }

  /**
   * Create product attribute
   * @param {Object} attributeData - Attribute data
   * @returns {Promise} Created attribute data
   */
  async createProductAttribute(attributeData) {
    return this.post('/rest/V1/products/attributes', { attribute: attributeData });
  }

  /**
   * Get attribute sets
   * @returns {Promise} Attribute sets data
   */
  async getAttributeSets() {
    return this.get('/rest/V1/eav/attribute-sets/list', {
      searchCriteria: {}
    });
  }

  /**
   * Create attribute set
   * @param {Object} attributeSetData - Attribute set data
   * @returns {Promise} Created attribute set data
   */
  async createAttributeSet(attributeSetData) {
    return this.post('/rest/V1/eav/attribute-sets', { attributeSet: attributeSetData });
  }

  /**
   * Get store configuration
   * @returns {Promise} Store configuration
   */
  async getStoreConfig() {
    return this.get('/rest/V1/store/storeConfigs');
  }
}

// Create singleton instance
const magentoClient = new MagentoClient();

module.exports = magentoClient;