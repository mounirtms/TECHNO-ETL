import BaseAPIService from './BaseAPIService.js';

/**
 * CEGID ERP API Service
 * Handles all interactions with CEGID ERP system
 */
class CegidService extends BaseAPIService {
  constructor(config = {}) {
    super({
      enableCaching: true,
      cacheTimeout: 600000, // 10 minutes for ERP data
      ...config,
    });

    this.baseUrl = config.url || '';
    this.database = config.database || '';

    this.authConfig = {
      username: config.username || '',
      password: config.password || '',
      database: config.database || '',
    };

    this.sessionToken = null;
    this.sessionExpiry = null;
  }

  /**
     * Get authentication headers for CEGID requests
     */
  async getRequestHeaders() {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Database': this.database,
    };

    // Get session token if needed
    const token = await this.getSessionToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
     * Get session token for CEGID API
     */
  async getSessionToken() {
    // Check if we have a valid token
    if (this.sessionToken && this.sessionExpiry && Date.now() < this.sessionExpiry) {
      return this.sessionToken;
    }

    try {
      const url = this.buildUrl(this.baseUrl, '/api/auth/login');
      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Database': this.database,
        },
        body: JSON.stringify({
          username: this.authConfig.username,
          password: this.authConfig.password,
          database: this.authConfig.database,
        }),
      });

      this.sessionToken = response.data.token;
      this.sessionExpiry = Date.now() + (response.data.expiresIn * 1000);

      this.log('Session token obtained', {
        expiry: new Date(this.sessionExpiry),
        database: this.database,
      });

      return this.sessionToken;
    } catch (error) {
      this.log('Failed to get session token', { error: error.message });
      throw new Error(`CEGID authentication failed: ${error.message}`);
    }
  }

  /**
     * Products API
     */
  async getProducts(params = {}) {
    const url = this.buildUrl(this.baseUrl, '/api/products', params);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getProduct(id) {
    const url = this.buildUrl(this.baseUrl, `/api/products/${id}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async createProduct(productData) {
    const url = this.buildUrl(this.baseUrl, '/api/products');
    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify(productData),
    });

    return response.data;
  }

  async updateProduct(id, productData) {
    const url = this.buildUrl(this.baseUrl, `/api/products/${id}`);
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify(productData),
    });

    return response.data;
  }

  async deleteProduct(id) {
    const url = this.buildUrl(this.baseUrl, `/api/products/${id}`);
    const response = await this.makeRequest(url, {
      method: 'DELETE',
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Inventory/Stock API
     */
  async getInventory(params = {}) {
    const url = this.buildUrl(this.baseUrl, '/api/inventory', params);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getProductInventory(productId) {
    const url = this.buildUrl(this.baseUrl, `/api/inventory/product/${productId}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async updateInventory(productId, inventoryData) {
    const url = this.buildUrl(this.baseUrl, `/api/inventory/product/${productId}`);
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify(inventoryData),
    });

    return response.data;
  }

  /**
     * Suppliers API
     */
  async getSuppliers(params = {}) {
    const url = this.buildUrl(this.baseUrl, '/api/suppliers', params);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getSupplier(id) {
    const url = this.buildUrl(this.baseUrl, `/api/suppliers/${id}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Purchase Orders API
     */
  async getPurchaseOrders(params = {}) {
    const url = this.buildUrl(this.baseUrl, '/api/purchase-orders', params);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getPurchaseOrder(id) {
    const url = this.buildUrl(this.baseUrl, `/api/purchase-orders/${id}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async createPurchaseOrder(orderData) {
    const url = this.buildUrl(this.baseUrl, '/api/purchase-orders');
    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify(orderData),
    });

    return response.data;
  }

  /**
     * Financial/Accounting API
     */
  async getAccounts(params = {}) {
    const url = this.buildUrl(this.baseUrl, '/api/accounts', params);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getTransactions(params = {}) {
    const url = this.buildUrl(this.baseUrl, '/api/transactions', params);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Reports API
     */
  async getReport(reportType, params = {}) {
    const url = this.buildUrl(this.baseUrl, `/api/reports/${reportType}`, params);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async getInventoryReport(params = {}) {
    return this.getReport('inventory', params);
  }

  async getSalesReport(params = {}) {
    return this.getReport('sales', params);
  }

  async getPurchaseReport(params = {}) {
    return this.getReport('purchases', params);
  }

  /**
     * Synchronization API
     */
  async syncData(syncType, params = {}) {
    const url = this.buildUrl(this.baseUrl, `/api/sync/${syncType}`);
    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify(params),
    });

    return response.data;
  }

  async syncProducts() {
    return this.syncData('products');
  }

  async syncInventory() {
    return this.syncData('inventory');
  }

  async getSyncStatus(syncId) {
    const url = this.buildUrl(this.baseUrl, `/api/sync/status/${syncId}`);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Bulk operations
     */
  async bulkUpdateProducts(products) {
    const url = this.buildUrl(this.baseUrl, '/api/products/bulk');
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify({ products }),
    });

    return response.data;
  }

  async bulkUpdateInventory(inventoryItems) {
    const url = this.buildUrl(this.baseUrl, '/api/inventory/bulk');
    const response = await this.makeRequest(url, {
      method: 'PUT',
      headers: await this.getRequestHeaders(),
      body: JSON.stringify({ items: inventoryItems }),
    });

    return response.data;
  }

  /**
     * Search functionality
     */
  async searchProducts(query, filters = {}) {
    const params = {
      search: query,
      ...filters,
    };
    const url = this.buildUrl(this.baseUrl, '/api/products/search', params);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  async searchSuppliers(query, filters = {}) {
    const params = {
      search: query,
      ...filters,
    };
    const url = this.buildUrl(this.baseUrl, '/api/suppliers/search', params);
    const response = await this.makeRequest(url, {
      headers: await this.getRequestHeaders(),
    });

    return response.data;
  }

  /**
     * Health check endpoint
     */
  getHealthCheckUrl() {
    return this.buildUrl(this.baseUrl, '/api/health');
  }

  /**
     * Configuration validation
     */
  validateConfig() {
    const errors = [];

    if (!this.baseUrl) {
      errors.push('CEGID URL is required');
    }

    if (!this.authConfig.username) {
      errors.push('Username is required');
    }

    if (!this.authConfig.password) {
      errors.push('Password is required');
    }

    if (!this.authConfig.database) {
      errors.push('Database name is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
     * Test connection to CEGID system
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
          message: 'CEGID connection successful',
          database: this.database,
          details: health.details,
        };
      } else {
        throw new Error(health.error);
      }
    } catch (error) {
      return {
        success: false,
        message: 'CEGID connection failed',
        error: error.message,
      };
    }
  }

  /**
     * Clear session token (for logout or token refresh)
     */
  clearToken() {
    this.sessionToken = null;
    this.sessionExpiry = null;
    this.log('Session token cleared');
  }

  /**
     * Logout from CEGID system
     */
  async logout() {
    if (this.sessionToken) {
      try {
        const url = this.buildUrl(this.baseUrl, '/api/auth/logout');

        await this.makeRequest(url, {
          method: 'POST',
          headers: await this.getRequestHeaders(),
        });
      } catch (error) {
        this.log('Logout failed', { error: error.message });
      } finally {
        this.clearToken();
      }
    }
  }
}

export default CegidService;
