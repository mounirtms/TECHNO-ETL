import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * Direct Magento API Client
 * Handles direct communication from frontend to Magento API
 * Bypasses the backend proxy when enabled in user settings
 */
class DirectMagentoClient {
  constructor() {
    this.baseURL = null;
    this.token = null;
    this.instance = null;
    this.initialized = false;
  }

  /**
     * Initialize the client with user settings
     * @param {Object} magentoSettings - User's Magento API settings
     */
  initialize(magentoSettings) {
    if (!magentoSettings || !magentoSettings.url) {
      throw new Error('Magento URL is required');
    }

    // Clean and format base URL
    this.baseURL = magentoSettings.url.replace(/\/$/, '');
    if (!this.baseURL.includes('/rest/V1')) {
      this.baseURL += '/rest/V1';
    }

    this.token = magentoSettings.accessToken;

    // Create axios instance
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Note: User-Agent cannot be set from browsers for security reasons
      },
    });

    // Add request interceptor for authentication
    this.instance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Add response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
          case 401:
            toast.error('Authentication failed. Please check your access token.');
            break;
          case 403:
            toast.error('Access forbidden. Please check your permissions.');
            break;
          case 404:
            console.warn('Resource not found:', error.config.url);
            break;
          case 429:
            toast.error('Rate limit exceeded. Please try again later.');
            break;
          case 500:
            toast.error('Magento server error. Please try again later.');
            break;
          default:
            if (data && data.message) {
              toast.error(`Magento API Error: ${data.message}`);
            }
          }
        } else if (error.code === 'ERR_NETWORK') {
          toast.error('Network error. Please check your connection and CORS settings.');
        } else if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout. Please try again.');
        }

        return Promise.reject(error);
      },
    );

    this.initialized = true;
    console.log('✅ Direct Magento Client initialized:', this.baseURL);
  }

  /**
     * Check if client is properly initialized
     */
  checkInitialization() {
    if (!this.initialized || !this.instance) {
      throw new Error('Direct Magento Client not initialized. Please check your API settings.');
    }
  }

  /**
     * Update access token
     * @param {string} token - New access token
     */
  updateToken(token) {
    this.token = token;
    if (this.instance) {
      // Update default authorization header
      this.instance.defaults.headers.Authorization = `Bearer ${token}`;
    }
  }

  /**
     * Test connection to Magento
     */
  async testConnection() {
    this.checkInitialization();

    try {
      console.log('🔄 Testing direct connection to Magento...');
      const response = await this.instance.get('/store/storeConfigs');

      console.log('✅ Direct Magento connection successful');

      return {
        success: true,
        data: response.data,
        message: 'Direct connection to Magento successful',
      };
    } catch (error) {
      console.error('❌ Direct Magento connection failed:', error);
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  /**
     * Generic GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     */
  async get(endpoint, params = {}) {
    this.checkInitialization();

    try {
      const response = await this.instance.get(endpoint, { params });

      return response.data;
    } catch (error) {
      console.error(`Direct Magento GET error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
     * Generic POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     */
  async post(endpoint, data = {}) {
    this.checkInitialization();

    try {
      const response = await this.instance.post(endpoint, data);

      return response.data;
    } catch (error) {
      console.error(`Direct Magento POST error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
     * Generic PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     */
  async put(endpoint, data = {}) {
    this.checkInitialization();

    try {
      const response = await this.instance.put(endpoint, data);

      return response.data;
    } catch (error) {
      console.error(`Direct Magento PUT error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
     * Generic DELETE request
     * @param {string} endpoint - API endpoint
     */
  async delete(endpoint) {
    this.checkInitialization();

    try {
      const response = await this.instance.delete(endpoint);

      return response.data;
    } catch (error) {
      console.error(`Direct Magento DELETE error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
     * Get products with search criteria
     * @param {Object} searchCriteria - Magento search criteria
     */
  async getProducts(searchCriteria = {}) {
    const params = this.buildSearchCriteriaParams(searchCriteria);

    return await this.get('/products', params);
  }

  /**
     * Get single product by SKU
     * @param {string} sku - Product SKU
     */
  async getProduct(sku) {
    return await this.get(`/products/${encodeURIComponent(sku)}`);
  }

  /**
     * Create a new product
     * @param {Object} productData - Product data
     */
  async createProduct(productData) {
    return await this.post('/products', { product: productData });
  }

  /**
     * Update existing product
     * @param {string} sku - Product SKU
     * @param {Object} productData - Updated product data
     */
  async updateProduct(sku, productData) {
    return await this.put(`/products/${encodeURIComponent(sku)}`, { product: productData });
  }

  /**
     * Delete product
     * @param {string} sku - Product SKU
     */
  async deleteProduct(sku) {
    return await this.delete(`/products/${encodeURIComponent(sku)}`);
  }

  /**
     * Get categories
     * @param {Object} searchCriteria - Search criteria
     */
  async getCategories(searchCriteria = {}) {
    const params = this.buildSearchCriteriaParams(searchCriteria);

    return await this.get('/categories/list', params);
  }

  /**
     * Get orders
     * @param {Object} searchCriteria - Search criteria
     */
  async getOrders(searchCriteria = {}) {
    const params = this.buildSearchCriteriaParams(searchCriteria);

    return await this.get('/orders', params);
  }

  /**
     * Get customers
     * @param {Object} searchCriteria - Search criteria
     */
  async getCustomers(searchCriteria = {}) {
    const params = this.buildSearchCriteriaParams(searchCriteria);

    return await this.get('/customers/search', params);
  }

  /**
     * Get inventory sources
     */
  async getSources() {
    return await this.get('/inventory/sources');
  }

  /**
     * Get inventory stocks
     */
  async getStocks() {
    return await this.get('/inventory/stocks');
  }

  /**
     * Get source items (inventory)
     * @param {Object} searchCriteria - Search criteria
     */
  async getSourceItems(searchCriteria = {}) {
    const params = this.buildSearchCriteriaParams(searchCriteria);

    return await this.get('/inventory/source-items', params);
  }

  /**
     * Build search criteria parameters for Magento API
     * @param {Object} criteria - Search criteria object
     * @returns {Object} Formatted parameters
     */
  buildSearchCriteriaParams(criteria) {
    const params = {};

    // Handle pagination
    if (criteria.pageSize) {
      params['searchCriteria[pageSize]'] = criteria.pageSize;
    }
    if (criteria.currentPage) {
      params['searchCriteria[currentPage]'] = criteria.currentPage;
    }

    // Handle sorting
    if (criteria.sortOrders && criteria.sortOrders.length > 0) {
      criteria.sortOrders.forEach((sort, index) => {
        params[`searchCriteria[sortOrders][${index}][field]`] = sort.field;
        params[`searchCriteria[sortOrders][${index}][direction]`] = sort.direction;
      });
    }

    // Handle filters
    if (criteria.filterGroups && criteria.filterGroups.length > 0) {
      criteria.filterGroups.forEach((group, groupIndex) => {
        if (group.filters && group.filters.length > 0) {
          group.filters.forEach((filter, filterIndex) => {
            params[`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][field]`] = filter.field;
            params[`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][value]`] = filter.value;
            params[`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][conditionType]`] = filter.conditionType || 'eq';
          });
        }
      });
    }

    return params;
  }

  /**
     * Login to Magento and get access token
     * @param {string} username - Admin username
     * @param {string} password - Admin password
     */
  async login(username, password) {
    if (!this.baseURL) {
      throw new Error('Magento URL not configured');
    }

    try {
      // Create temporary instance for login (no auth required)
      const loginInstance = axios.create({
        baseURL: this.baseURL,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('🔄 Logging in to Magento directly...');
      const response = await loginInstance.post('/integration/admin/token', {
        username,
        password,
      });

      const token = response.data;

      this.updateToken(token);

      console.log('✅ Direct Magento login successful');
      toast.success('Successfully connected to Magento directly!');

      return token;
    } catch (error) {
      console.error('❌ Direct Magento login failed:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Login failed. Please check your credentials and Magento URL.');
      }
    }
  }

  /**
     * Get current configuration info
     */
  getInfo() {
    return {
      baseURL: this.baseURL,
      initialized: this.initialized,
      hasToken: !!this.token,
    };
  }
}

// Create singleton instance
const directMagentoClient = new DirectMagentoClient();

export default directMagentoClient;
