import BaseAPIService from './BaseAPIService.js';

/**
 * Magento API Service
 * Handles all interactions with Magento REST API
 * Supports both direct connection and backend proxy routing
 */
class MagentoService extends BaseAPIService {
  constructor(config = {}) {
    super({
      enableCaching: false, // Magento data changes frequently
      ...config,
    });

    this.baseUrl = config.url || '';
    this.enableDirectConnection = config.enableDirectConnection || false;
    this.backendUrl = config.backendUrl || '';

    this.authConfig = {
      type: config.authMode || 'basic',
      username: config.username || '',
      password: config.password || '',
      consumerKey: config.consumerKey || '',
      consumerSecret: config.consumerSecret || '',
      accessToken: config.accessToken || '',
      accessTokenSecret: config.accessTokenSecret || '',
    };

    this.adminToken = null;
    this.tokenExpiry = null;
  }

  /**
     * Get the appropriate base URL based on connection mode
     */
  getApiUrl(endpoint) {
    if (this.enableDirectConnection) {
      return this.buildUrl(this.baseUrl, endpoint);
    } else {
      // Use backend proxy
      return this.buildUrl(this.backendUrl, `/api/magento${endpoint}`);
    }
  }

  /**
     * Get authentication headers
     */
  async getRequestHeaders() {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (this.enableDirectConnection) {
      if (this.authConfig.type === 'basic') {
        // For direct connection, get admin token
        const token = await this.getAdminToken();

        headers['Authorization'] = `Bearer ${token}`;
      } else if (this.authConfig.type === 'oauth') {
        // OAuth 1.0 implementation would go here
        throw new Error('OAuth 1.0 not implemented for direct connection');
      }
    } else {
      // Backend handles authentication
      headers['X-Magento-Auth'] = JSON.stringify(this.authConfig);
    }

    return headers;
  }

  /**
     * Get admin token for direct API access
     */
  async getAdminToken() {
    // Check if we have a valid token
    if (this.adminToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.adminToken;
    }

    try {
      const url = this.buildUrl(this.baseUrl, '/rest/V1/integration/admin/token');
      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.authConfig.username,
          password: this.authConfig.password,
        }),
      });

      this.adminToken = response.data;
      this.tokenExpiry = Date.now() + (3 * 60 * 60 * 1000); // 3 hours

      this.log('Admin token obtained', { expiry: new Date(this.tokenExpiry) });

      return this.adminToken;
    } catch (error) {
      this.log('Failed to get admin token', { error: error.message });
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
     * Products API
     */
  async getProducts(params = {}) {
    const searchCriteria = this.buildSearchCriteria(params);
    const url = this.getApiUrl(`/rest/V1/products?${searchCriteria}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getProduct(sku) {
    const url = this.getApiUrl(`/rest/V1/products/${encodeURIComponent(sku)}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async createProduct(productData) {
    const url = this.getApiUrl('/rest/V1/products');
    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify({ product: productData }),
    });

    return response.data;
  }

  async updateProduct(sku, productData) {
    const url = this.getApiUrl(`/rest/V1/products/${encodeURIComponent(sku)}`);
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify({ product: productData }),
    });

    return response.data;
  }

  async deleteProduct(sku) {
    const url = this.getApiUrl(`/rest/V1/products/${encodeURIComponent(sku)}`);
    const response = await this.makeRequest(url, {
      method: 'DELETE',
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Categories API
     */
  async getCategories() {
    const url = this.getApiUrl('/rest/V1/categories');
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getCategory(id) {
    const url = this.getApiUrl(`/rest/V1/categories/${id}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getCategoryTree() {
    const url = this.getApiUrl('/rest/V1/categories/list');
    const searchCriteria = 'searchCriteria[pageSize]=0';
    const response = await this.makeRequest(`${url}?${searchCriteria}`, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async createCategory(categoryData) {
    const url = this.getApiUrl('/rest/V1/categories');
    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify({ category: categoryData }),
    });

    return response.data;
  }

  async updateCategory(id, categoryData) {
    const url = this.getApiUrl(`/rest/V1/categories/${id}`);
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify({ category: categoryData }),
    });

    return response.data;
  }

  async deleteCategory(id) {
    const url = this.getApiUrl(`/rest/V1/categories/${id}`);
    const response = await this.makeRequest(url, {
      method: 'DELETE',
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Category-Product Management
     */
  async assignProductToCategory(categoryId, sku) {
    const url = this.getApiUrl(`/rest/V1/categories/${categoryId}/products`);
    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify({
        productLink: {
          sku: sku,
          position: 0,
          category_id: categoryId,
        },
      }),
    });

    return response.data;
  }

  async removeProductFromCategory(categoryId, sku) {
    const url = this.getApiUrl(`/rest/V1/categories/${categoryId}/products/${encodeURIComponent(sku)}`);
    const response = await this.makeRequest(url, {
      method: 'DELETE',
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getCategoryProducts(categoryId) {
    const url = this.getApiUrl(`/rest/V1/categories/${categoryId}/products`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Customers API
     */
  async getCustomers(params = {}) {
    const searchCriteria = this.buildSearchCriteria(params);
    const url = this.getApiUrl(`/rest/V1/customers/search?${searchCriteria}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getCustomer(id) {
    const url = this.getApiUrl(`/rest/V1/customers/${id}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Orders API
     */
  async getOrders(params = {}) {
    const searchCriteria = this.buildSearchCriteria(params);
    const url = this.getApiUrl(`/rest/V1/orders?${searchCriteria}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getOrder(id) {
    const url = this.getApiUrl(`/rest/V1/orders/${id}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Invoices API
     */
  async getInvoices(params = {}) {
    const searchCriteria = this.buildSearchCriteria(params);
    const url = this.getApiUrl(`/rest/V1/invoices?${searchCriteria}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Stock/Inventory API
     */
  async getStockItems(params = {}) {
    const searchCriteria = this.buildSearchCriteria(params);
    const url = this.getApiUrl(`/rest/V1/stockItems?${searchCriteria}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async updateStockItem(itemId, stockData) {
    const url = this.getApiUrl(`/rest/V1/products/${encodeURIComponent(itemId)}/stockItems/1`);
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify({ stockItem: stockData }),
    });

    return response.data;
  }

  /**
     * Bulk operations
     */
  async bulkUpdateProducts(products) {
    const promises = products.map(product =>
      this.updateProduct(product.sku, product),
    );

    return Promise.allSettled(promises);
  }

  /**
     * Search functionality
     */
  async searchProducts(query, filters = {}) {
    const searchCriteria = this.buildSearchCriteria({
      ...filters,
      'searchCriteria[filter_groups][0][filters][0][field]': 'name',
      'searchCriteria[filter_groups][0][filters][0][value]': `%${query}%`,
      'searchCriteria[filter_groups][0][filters][0][condition_type]': 'like',
    });

    const url = this.getApiUrl(`/rest/V1/products?${searchCriteria}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Build Magento search criteria from parameters
     */
  buildSearchCriteria(params) {
    const searchParams = new URLSearchParams();

    // Handle pagination
    if (params.page) {
      searchParams.append('searchCriteria[currentPage]', params.page);
    }
    if (params.pageSize) {
      searchParams.append('searchCriteria[pageSize]', params.pageSize);
    }

    // Handle sorting
    if (params.sortBy) {
      searchParams.append('searchCriteria[sortOrders][0][field]', params.sortBy);
      searchParams.append('searchCriteria[sortOrders][0][direction]', params.sortDirection || 'ASC');
    }

    // Handle filters
    if (params.filters) {
      params.filters.forEach((filter, index) => {
        searchParams.append(`searchCriteria[filter_groups][0][filters][${index}][field]`, filter.field);
        searchParams.append(`searchCriteria[filter_groups][0][filters][${index}][value]`, filter.value);
        searchParams.append(`searchCriteria[filter_groups][0][filters][${index}][condition_type]`, filter.condition || 'eq');
      });
    }

    return searchParams.toString();
  }

  /**
     * Health check endpoint
     */
  getHealthCheckUrl() {
    return this.getApiUrl('/rest/V1/modules');
  }

  /**
     * Configuration validation
     */
  validateConfig() {
    const errors = [];

    if (!this.baseUrl && this.enableDirectConnection) {
      errors.push('Magento URL is required for direct connection');
    }

    if (!this.backendUrl && !this.enableDirectConnection) {
      errors.push('Backend URL is required for proxy connection');
    }

    if (this.authConfig.type === 'basic') {
      if (!this.authConfig.username) errors.push('Username is required');
      if (!this.authConfig.password) errors.push('Password is required');
    } else if (this.authConfig.type === 'oauth') {
      if (!this.authConfig.consumerKey) errors.push('Consumer Key is required');
      if (!this.authConfig.consumerSecret) errors.push('Consumer Secret is required');
      if (!this.authConfig.accessToken) errors.push('Access Token is required');
      if (!this.authConfig.accessTokenSecret) errors.push('Access Token Secret is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
     * Test connection to Magento
     */
  async testConnection() {
    try {
      const validation = this.validateConfig();

      if (!validation.isValid) {
        throw new Error(`Configuration invalid: ${validation.errors.join(', ')}`);
      }

      // Test by getting modules list
      const health = await this.healthCheck();

      if (health.status === 'healthy') {
        return {
          success: true,
          message: 'Magento connection successful',
          mode: this.enableDirectConnection ? 'direct' : 'proxy',
          details: health.details,
        };
      } else {
        throw new Error(health.error);
      }
    } catch (error) {
      return {
        success: false,
        message: 'Magento connection failed',
        error: error.message,
      };
    }
  }

  /**
     * Clear admin token (for logout or token refresh)
     */
  clearToken() {
    this.adminToken = null;
    this.tokenExpiry = null;
    this.log('Admin token cleared');
  }
}

export default MagentoService;
