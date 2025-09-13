 
import BaseApiService from './BaseApiService';
import unifiedMagentoService from './unifiedMagentoService';
import { toast } from 'react-toastify';
import { getMagentoApiParams, handleMagentoGridError } from '../utils/magentoGridSettingsManager';

// Import local data
import customersData from '../assets/data/customers.json';
import productsData from '../assets/data/products.json';
import ordersData from '../assets/data/orders.json';
import invoicesData from '../assets/data/invoices.json';
import categoryData from '../assets/data/category.json';
import cmsPagesData from '../assets/data/cmsPages.json';

const API_URL = import.meta.env.VITE_MAGENTO_API_URL;

// Global settings reference for API calls
let globalUserSettings = null;

// Function to set user settings for API calls
export const setMagentoApiSettings = (userSettings) => {
  globalUserSettings = userSettings;
};

// Enhanced default params that respect user settings
const getDefaultParams = (gridType = 'magento', additionalParams = {}) => {
  if (globalUserSettings) {
    return getMagentoApiParams(gridType, globalUserSettings, additionalParams);
  }
  
  return {
    pageSize: 10,
    currentPage: 1,
    sortOrders: [
      { field: 'created_at', direction: 'DESC' }
    ],
    ...additionalParams
  };
};

// Mock data for development
const mockData = {
  sources: [
    {
      source_code: 'default',
      name: 'Default Source',
      enabled: true,
      description: 'Default source for the store',
      latitude: 0,
      longitude: 0,
      country_id: 'US',
      region_id: 0,
      region: 'California',
      city: 'San Francisco',
      street: '123 Main St',
      postcode: '94105',
      contact_name: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      priority: 1
    },
    {
      source_code: 'warehouse1',
      name: 'Warehouse 1',
      enabled: true,
      description: 'Main warehouse facility',
      latitude: 37.7749,
      longitude: -122.4194,
      country_id: 'US',
      region_id: 5,
      region: 'California',
      city: 'Los Angeles',
      street: '456 Warehouse Ave',
      postcode: '90001',
      contact_name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '(555) 987-6543',
      priority: 2
    }
  ],
  stocks: [
    {
      stock_id: 1,
      name: 'Default Stock',
      sales_channels: [
        { type: 'website', code: 'base' }
      ],
      source_codes: ['default']
    },
    {
      stock_id: 2,
      name: 'East Coast Stock',
      sales_channels: [
        { type: 'website', code: 'east_store' }
      ],
      source_codes: ['warehouse1']
    }
  ],
  sourceItems: [
    {
      sku: 'TEST-1',
      source_code: 'default',
      quantity: 100,
      status: 1
    },
    {
      sku: 'TEST-2',
      source_code: 'warehouse1',
      quantity: 50,
      status: 1
    }
  ]
};

const formatResponse = (response, mockDataKey) => {
  if (process.env.NODE_ENV === 'development' && (!response || !response.items)) {
    return {
      items: mockData[mockDataKey] || [],
      total_count: mockData[mockDataKey]?.length || 0
    };
  }
  return response;
};

class MagentoApi extends BaseApiService {
  constructor() {
    super({
      cacheEnabled: true,
      cacheDuration: 5 * 60 * 1000,
      maxCacheSize: 150,
      retryAttempts: 2,
      retryDelay: 1000
    });
    
    this.baseURL = API_URL;
    this.unifiedService = unifiedMagentoService;
  }

  // Get product media gallery by SKU (uses backend proxy)
  async getProductMedia(sku) {
    try {
      // Use unifiedMagentoService to ensure proxy and token usage
      const response = await unifiedMagentoService.get(`/products/${sku}/media`);
      // unifiedMagentoService returns { data: ... }
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch product media:', error);
      throw error;
    }
  }

  // Create a new product
  async createProduct(productData) {
    try {
      const payload = { product: productData };
      const response = await unifiedMagentoService.post('/products', payload);
      // Clear cache after creating a product to ensure lists are updated
      this.clearCache();
      return response.data;
    } catch (error) {
      console.error('Failed to create product:', error);
      toast.error(error.response?.data?.message || 'An error occurred while creating the product.');
      throw error;
    }
  }

  // Create multiple products in bulk
  async createProductsBulk(products) {
    const results = {
      success: [],
      errors: [],
    };

    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      const toastId = toast.loading(`Creating product ${i + 1} of ${products.length}: ${productData.sku || ''}`);
      
      try {
        // We don't use this.createProduct here to avoid the double toast on error
        const payload = { product: productData };
        const createdProduct = await unifiedMagentoService.post('/products', payload);
        results.success.push(createdProduct.data);
        toast.update(toastId, { render: `Successfully created ${productData.sku}`, type: 'success', isLoading: false, autoClose: 5000 });
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'An unknown error occurred';
        results.errors.push({ product: productData, error: errorMessage });
        toast.update(toastId, { render: `Failed to create ${productData.sku}: ${errorMessage}`, type: 'error', isLoading: false, autoClose: 10000 });
      }
    }

    this.clearCache(); // Clear cache once all operations are complete
    return results;
  }

  // Deprecated: getProductDetails (use local row data in grid instead)

  setBaseURL(newBaseURL) {
    if (!newBaseURL) {
      throw new Error('Base URL cannot be empty');
    }
    this.baseURL = newBaseURL;
    // Note: unifiedMagentoService doesn't expose setBaseURL method
  }

  getBaseURL() {
    return this.baseURL;
  }

  // Override buildSearchCriteria to use BaseApiService parameter validation
  buildSearchCriteria(params = {}) {
    const defaultParams = getDefaultParams();
    const searchCriteria = {
      pageSize: params.pageSize || defaultParams.pageSize,
      currentPage: params.currentPage || defaultParams.currentPage,
      sortOrders: params.sortOrders || defaultParams.sortOrders,
      filterGroups: params.filterGroups || []
    };
    
    // Use parent's parameter validation and flattening
    return this.validateAndFlattenParams({ searchCriteria, fieldName: params.fieldName });
  }

  // Use parent's cache methods with legacy compatibility
  getCacheKey(endpoint, params) {
    return super._getCacheKey('get', endpoint, params);
  }

  getCachedData(key) {
    return super._getCachedResponse(key);
  }

  setCachedData(key, data) {
    return super._setCachedResponse(key, data);
  }

  // API Methods with error handling and caching - using unified service
  async get(endpoint, config = {}) {
    try { 
      const response = await unifiedMagentoService.get(endpoint, config);
      return response;
    } catch (error) {
      // If there's an error and we have local data available, use it
      if (this.shouldUseLocalData(endpoint)) {
        toast.warning('Using local data due to API error');
        return this.getLocalDataResponse(endpoint);
      }
      throw error;
    }
  }

  async post(endpoint, data = {}, config = {}) {
    return unifiedMagentoService.post(endpoint, data, config);
  }

  async put(endpoint, data = {}, config = {}) {
    return unifiedMagentoService.put(endpoint, data, config);
  }

  async delete(endpoint, config = {}) {
    return unifiedMagentoService.delete(endpoint, config);
  }

  // Local data fallback helpers
  shouldUseLocalData(endpoint) {
    return endpoint.includes('products') || 
           endpoint.includes('customers') || 
           endpoint.includes('orders') ||
           endpoint.includes('invoices') ||
           endpoint.includes('categories') ||
           endpoint.includes('cms');
  }

  getLocalDataResponse(endpoint) {
    let localData;
    if (endpoint.includes('products')) {
      localData = productsData;
    } else if (endpoint.includes('customers')) {
      localData = customersData;
    } else if (endpoint.includes('orders')) {
      localData = ordersData;
    } else if (endpoint.includes('invoices')) {
      localData = invoicesData;
    } else if (endpoint.includes('categories')) {
      localData = categoryData;
    } else if (endpoint.includes('cms')) {
      localData = cmsPagesData;
    }

    // Apply basic filtering if params are provided
    const items = Array.isArray(localData) ? localData : [];
    
    return {
      data: {
        items: items,
        total_count: items.length,
        search_criteria: {}
      }
    };
  }

  async getOrders(params = {}) {
    try {
      const cacheKey = this.getCacheKey('/orders', params);
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        console.log('Using cached orders data');
        return cachedData;
      }

      const searchCriteria = this.buildSearchCriteria({
        ...params,
        sortOrders: params.sortOrders || [
          { field: 'created_at', direction: 'DESC' }
        ],
        pageSize: params.pageSize || 20,
        currentPage: params.currentPage || 1
      });

      console.log('Fetching orders with criteria:', searchCriteria);
      
      const response = await this.get('/orders', {
        params: searchCriteria
      });

      if (response?.data?.items) {
        const enrichedResponse = {
          items: response.data.items.map(order => ({
            ...order,
            id: order.entity_id || order.id,
            status: order.status || 'pending',
            customer_name: order.customer_firstname 
              ? `${order.customer_firstname} ${order.customer_lastname}`.trim()
              : 'Guest Customer'
          })),
          total_count: response.data.total_count || response.data.items.length,
          search_criteria: response.data.search_criteria
        };

        this.setCachedData(cacheKey, enrichedResponse);
        return enrichedResponse;
      }

      throw new Error('Failed to fetch orders');
    } catch (error) {
      console.error('Error fetching orders:', error);
      const localData = this.getLocalResponse('orders');
      console.log('Using local orders data:', localData);
      return localData;
    }
  }

  async getCustomers(params = {}) {
    try {
      const cacheKey = this.getCacheKey('/customers/search', params);
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        console.log('Using cached customers data');
        return cachedData;
      }

      const searchCriteria = this.buildSearchCriteria({
        ...params,
        sortOrders: params.sortOrders || [
          { field: 'created_at', direction: 'DESC' }
        ],
        pageSize: params.pageSize || 20,
        currentPage: params.currentPage || 1
      });

      console.log('Fetching customers with criteria:', searchCriteria);

      // Add required fieldName parameter for Magento API
      const requestParams = {
        params: searchCriteria,
        fieldName: params.fieldName || 'email'
      };

      const response = await this.get('/customers/search', requestParams);

      if (response?.data?.items) {
        const enrichedResponse = {
          items: response.data.items.map(customer => ({
            ...customer,
            id: customer.id || customer.entity_id,
            name: customer.firstname 
              ? `${customer.firstname} ${customer.lastname}`.trim()
              : 'Unknown',
            email: customer.email || 'No email'
          })),
          total_count: response.data.total_count || response.data.items.length,
          search_criteria: response.data.search_criteria
        };

        this.setCachedData(cacheKey, enrichedResponse);
        return enrichedResponse;
      }

      throw new Error('Failed to fetch customers');
    } catch (error) {
      console.error('Error fetching customers:', error);
      const localData = this.getLocalResponse('customers');
      console.log('Using local customers data:', localData);
      return localData;
    }
  }

  // ===== PRODUCT MEDIA OPERATIONS =====
  async uploadProductMedia(sku, entryData) {
    try {
      console.log(`🖼️ Uploading media for product: ${sku}`);
      console.log('Entry data:', entryData);

      const response = await this.post(
        `/products/${encodeURIComponent(sku)}/media`,
        entryData
      );

      console.log('✅ Media upload successful:', response);
      return response;
    } catch (error) {
      console.error('❌ Media upload failed:', error);
      throw new Error(`Failed to upload media for ${sku}: ${error.message}`);
    }
  }

  async deleteProductMedia(sku, entryId) {
    try {
      console.log(`🗑️ Deleting media ${entryId} for product: ${sku}`);
      const response = await this.delete(
        `/products/${encodeURIComponent(sku)}/media/${entryId}`
      );

      console.log('🗑️ Media deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('🗑️ Media deletion failed:', error);
      throw new Error(`Failed to delete media ${entryId} for ${sku}: ${error.message}`);
    }
  }
}

export default MagentoApi;
