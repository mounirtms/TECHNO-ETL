import BaseAPIService from './BaseAPIService.js';

/**
 * MDM (Master Data Management) Service
 * Handles all interactions with the MDM system
 */
class MDMService extends BaseAPIService {
  constructor(config = {}) {
    super({
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes for MDM data
      ...config,
    });

    this.baseUrl = config.url || '';
    this.authConfig = {
      type: config.authMode || 'apikey',
      apiKey: config.apiKey || '',
      token: config.token || '',
      username: config.username || '',
      password: config.password || '',
    };

    this.endpoints = {
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      stocks: '/api/v1/stocks',
      sources: '/api/v1/sources',
      analytics: '/api/v1/analytics',
      health: '/api/v1/health',
      ...config.endpoints,
    };
  }

  /**
     * Get authentication headers for MDM requests
     */
  getRequestHeaders() {
    return {
      ...this.getAuthHeaders(this.authConfig),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /**
     * Products API
     */
  async getProducts(params = {}) {
    const url = this.buildUrl(this.baseUrl, this.endpoints.products, params);
    const response = await this.makeRequest(url, {
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  async getProduct(id) {
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.products}/${id}`);
    const response = await this.makeRequest(url, {
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  async createProduct(productData) {
    const url = this.buildUrl(this.baseUrl, this.endpoints.products);
    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: this.getRequestHeaders(),
      body: JSON.stringify(productData),
    });

    return response.data;
  }

  async updateProduct(id, productData) {
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.products}/${id}`);
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: this.getRequestHeaders(),
      body: JSON.stringify(productData),
    });

    return response.data;
  }

  async deleteProduct(id) {
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.products}/${id}`);
    const response = await this.makeRequest(url, {
      method: 'DELETE',
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Categories API
     */
  async getCategories(params = {}) {
    const url = this.buildUrl(this.baseUrl, this.endpoints.categories, params);
    const response = await this.makeRequest(url, {
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  async getCategory(id) {
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.categories}/${id}`);
    const response = await this.makeRequest(url, {
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  async getCategoryTree() {
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.categories}/tree`);
    const response = await this.makeRequest(url, {
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Stocks API
     */
  async getStocks(params = {}) {
    const url = this.buildUrl(this.baseUrl, this.endpoints.stocks, params);
    const response = await this.makeRequest(url, {
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  async getProductStock(productId) {
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.stocks}/product/${productId}`);
    const response = await this.makeRequest(url, {
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  async updateStock(productId, stockData) {
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.stocks}/product/${productId}`);
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: this.getRequestHeaders(),
      body: JSON.stringify(stockData),
    });

    return response.data;
  }

  /**
     * Sources API
     */
  async getSources(params = {}) {
    const url = this.buildUrl(this.baseUrl, this.endpoints.sources, params);
    const response = await this.makeRequest(url, {
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  async getSource(id) {
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.sources}/${id}`);
    const response = await this.makeRequest(url, {
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Analytics API
     */
  async getAnalytics(type, params = {}) {
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.analytics}/${type}`, params);
    const response = await this.makeRequest(url, {
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  async getDashboardMetrics() {
    return this.getAnalytics('dashboard');
  }

  async getSalesAnalytics(dateRange = {}) {
    return this.getAnalytics('sales', dateRange);
  }

  async getInventoryAnalytics(params = {}) {
    return this.getAnalytics('inventory', params);
  }

  /**
     * Bulk operations
     */
  async bulkUpdateProducts(products) {
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.products}/bulk`);
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: this.getRequestHeaders(),
      body: JSON.stringify({ products }),
    });

    return response.data;
  }

  async bulkUpdateStocks(stocks) {
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.stocks}/bulk`);
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: this.getRequestHeaders(),
      body: JSON.stringify({ stocks }),
    });

    return response.data;
  }

  /**
     * Search functionality
     */
  async searchProducts(query, filters = {}) {
    const params = {
      q: query,
      ...filters,
    };
    const url = this.buildUrl(this.baseUrl, `${this.endpoints.products}/search`, params);
    const response = await this.makeRequest(url, {
      headers: this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Health check endpoint
     */
  getHealthCheckUrl() {
    return this.buildUrl(this.baseUrl, this.endpoints.health);
  }

  /**
     * Configuration validation
     */
  validateConfig() {
    const errors = [];

    if (!this.baseUrl) {
      errors.push('MDM base URL is required');
    }

    if (this.authConfig.type === 'apikey' && !this.authConfig.apiKey) {
      errors.push('API key is required for MDM authentication');
    }

    if (this.authConfig.type === 'bearer' && !this.authConfig.token) {
      errors.push('Bearer token is required for MDM authentication');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
     * Test connection to MDM system
     */
  async testConnection() {
    try {
      const validation = this.validateConfig();

      if (!validation.isValid) {
        throw new Error(`Configuration invalid: ${validation.errors.join(', ')}`);
      }

      const health = await this.healthCheck();

      if (health.status === 'healthy') {
        return {
          success: true,
          message: 'MDM connection successful',
          details: health.details,
        };
      } else {
        throw new Error(health.error);
      }
    } catch (error) {
      return {
        success: false,
        message: 'MDM connection failed',
        error: error.message,
      };
    }
  }
}

export default MDMService;
