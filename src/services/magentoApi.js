import axios from 'axios';
import magentoService from './magentoService';
import { toast } from 'react-toastify';

// Import local data
import customersData from '../assets/data/customers.json';
import productsData from '../assets/data/products.json';
import ordersData from '../assets/data/orders.json';
import invoicesData from '../assets/data/invoices.json';
import categoryData from '../assets/data/category.json';
import cmsPagesData from '../assets/data/cmsPages.json'; // Import local CMS pages data

const API_URL = import.meta.env.VITE_MAGENTO_API_URL;

const DEFAULT_PARAMS = {
  pageSize: 10,
  currentPage: 1,
  sortOrders: [
    { field: 'created_at', direction: 'DESC' }
  ]
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

class MagentoApi {
  constructor() {
    this.baseURL = API_URL;

    // Initialize cache
    this.cache = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  setBaseURL(newBaseURL) {
    if (!newBaseURL) {
      throw new Error('Base URL cannot be empty');
    }
    this.baseURL = newBaseURL;
    magentoService.setBaseURL(newBaseURL);
  }

  getBaseURL() {
    return this.baseURL;
  }

  buildSearchCriteria(params = {}) {
    const {
      pageSize = DEFAULT_PARAMS.pageSize,
      currentPage = DEFAULT_PARAMS.currentPage,
      sortOrders = DEFAULT_PARAMS.sortOrders,
      filterGroups = []
    } = params;

    const searchCriteria = {
      'searchCriteria[pageSize]': pageSize,
      'searchCriteria[currentPage]': currentPage
    };

    // Add sort orders
    sortOrders.forEach((sort, index) => {
      searchCriteria[`searchCriteria[sortOrders][${index}][field]`] = sort.field;
      searchCriteria[`searchCriteria[sortOrders][${index}][direction]`] = sort.direction;
    });

    // Add filter groups
    filterGroups.forEach((group, groupIndex) => {
      group.filters.forEach((filter, filterIndex) => {
        searchCriteria[`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][field]`] = filter.field;
        searchCriteria[`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][value]`] = filter.value;
        searchCriteria[`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][condition_type]`] = filter.conditionType || 'eq';
      });
    });

    return searchCriteria;
  }

  // Cache management
  getCacheKey(endpoint, params) {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // API Methods with error handling and caching
  async get(endpoint, config = {}) {
    try { 
      const response = await magentoService.get(endpoint, config);
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
    try {
      debugger
      const response = await magentoService.post(endpoint, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await magentoService.put(endpoint, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async delete(endpoint, config = {}) {
    try {
      const response = await magentoService.delete(endpoint, config);
      return response;
    } catch (error) {
      throw error;
    }
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
      
      const response = await this.get('/customers/search', {
        params: searchCriteria
      });

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

  async getProducts(params = {}) {
    try {
      const cacheKey = this.getCacheKey('/products', params);
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
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

      const response = await this.get('/products', {
        params: searchCriteria
      });

      // Format the response data
      const formattedResponse = {
        data: {
          items: response?.data?.items || [],
          total_count: response?.data?.total_count || 0,
          search_criteria: response?.data?.search_criteria || {}
        }
      };

      this.setCachedData(cacheKey, formattedResponse);
      return formattedResponse;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use local data as fallback
      const localResponse = this.getLocalDataResponse('/products');
      return localResponse;
    }
  }

  async getOrderDetails(orderId) {
    try {
      return await this.get(`/orders/${orderId}`);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.warn('Using local data: Unable to fetch from API');
      return this.getLocalData('orders').find(order => order.id === orderId);
    }
  }

  async getCustomerDetails(customerId) {
    try {
      return await this.get(`/customers/${customerId}`);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast.warn('Using local data: Unable to fetch from API');
      return this.getLocalData('customers').find(customer => customer.id === customerId);
    }
  }

  async createCustomer(customerData) {
    return this.post('/customers', { customer: customerData });
  }

  async getProduct(sku) {
    try {
      return await this.get(`/products/${sku}`);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.warn('Using local data: Unable to fetch from API');
      return this.getLocalData('products').find(product => product.sku === sku);
    }
  }

  async getCategories(params = {}) {
    try {
      const searchCriteria = this.buildSearchCriteria(params);
      const response = await this.get('/categories/list', searchCriteria);
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.warn('Using local data: Unable to fetch from API');
      return this.getLocalResponse('categories');
    }
  }

  async getCategory(categoryId) {
    return this.get(`/categories/${categoryId}`);
  }

  async getStockItems(params = {}) {
    try {
      const searchCriteria = this.buildSearchCriteria(params);
      const response = await this.get('/stockItems', {
        params: searchCriteria
      });

      if (response?.data) {
        return response.data;
      }

      throw new Error('Failed to fetch stock items');
    } catch (error) {
      console.error('Error fetching stock items:', error);
      throw error;
    }
  }

  async updateStockItem(productSku, stockItem) {
    try {
      const response = await this.put(`/products/${productSku}/stockItems/${stockItem.item_id}`, {
        stockItem: {
          ...stockItem,
          qty: parseFloat(stockItem.qty),
          is_in_stock: stockItem.qty > 0
        }
      });

      if (response?.data) {
        // Clear product cache to ensure fresh data
        this.cache.delete(this.getCacheKey('/products', {}));
        return response.data;
      }

      throw new Error('Failed to update stock item');
    } catch (error) {
      console.error('Error updating stock item:', error);
      throw error;
    }
  }

  async getCmsPages(params = {}) {
    try {
      const cacheKey = this.getCacheKey('/cmsPage/search', params);
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('Using cached CMS pages data');
        return cachedData;
      } 
      const searchCriteria = this.buildSearchCriteria(params);
      console.log('Fetching products with criteria:', searchCriteria);
      
      const response = await this.get('/cmsPage/search', searchCriteria);

      if (response && response.items) {
        this.setCachedData(cacheKey, response);
        return response;
      }

      throw new Error('No data returned from API');
    } catch (error) {
      console.error('Failed to fetch CMS pages:', error);
      const localData = this.getLocalResponse('cmsPages');
      console.log('Using local CMS pages data:', localData);
      return localData;
    }
  }

  async getCmsBlocks(searchCriteria = {}) {
    try {
      // Ensure that searchCriteria includes required fields
      const params = {
        searchCriteria: {
          filterGroups: searchCriteria.filterGroups || [],
          pageSize: searchCriteria.pageSize || 10,
          currentPage: searchCriteria.currentPage || 1
        }
      };
      const response = await this.get('/cmsBlock/search', { params });
      return {
        items: response.items || [],
        total_count: response.total_count || 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch CMS blocks: ${error.message}`);
    }
  }

  async getCmsPage(id) {
    return this.get(`/cmsPage/${id}`);
  }

  async createCmsPage(data) {
    return this.post('/cmsPage', data);
  }

  async updateCmsPage(id, data) {
    return this.put(`/cmsPage/${id}`, data);
  }

  async deleteCmsPage(id) {
    return this.delete(`/cmsPage/${id}`);
  }

  async shipOrder(orderId, items, notify = true) {
    return this.post(`/order/${orderId}/ship`, { items, notify });
  }

  async getInvoices(searchCriteria = {}) {
    try {
      const params = this.formatSearchCriteria(searchCriteria);
      const response = await this.get('/invoices', { params });
      return {
        items: response.items || [],
        total_count: response.total_count || 0,
        search_criteria: response.search_criteria
      };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw new Error('Failed to fetch invoices');
    }
  }

  /**
   * Format search criteria for Magento API
   * @param {Object} searchCriteria - The search criteria object
   * @returns {Object} Formatted search criteria
   */
  formatSearchCriteria(searchCriteria) {
    const formattedCriteria = {};
    
    if (searchCriteria.filterGroups) {
      searchCriteria.filterGroups.forEach((group, groupIndex) => {
        group.filters.forEach((filter, filterIndex) => {
          formattedCriteria[`searchCriteria[filter_groups][${groupIndex}][filters][${filterIndex}][field]`] = filter.field;
          formattedCriteria[`searchCriteria[filter_groups][${groupIndex}][filters][${filterIndex}][value]`] = filter.value;
          formattedCriteria[`searchCriteria[filter_groups][${groupIndex}][filters][${filterIndex}][condition_type]`] = filter.condition_type;
        });
      });
    }

    if (searchCriteria.pageSize) {
      formattedCriteria['searchCriteria[pageSize]'] = searchCriteria.pageSize;
    }

    if (searchCriteria.currentPage) {
      formattedCriteria['searchCriteria[currentPage]'] = searchCriteria.currentPage;
    }

    if (searchCriteria.sortOrders) {
      searchCriteria.sortOrders.forEach((sort, index) => {
        formattedCriteria[`searchCriteria[sortOrders][${index}][field]`] = sort.field;
        formattedCriteria[`searchCriteria[sortOrders][${index}][direction]`] = sort.direction;
      });
    }

    return formattedCriteria;
  }

  async getSources(params = {}) {
    try {
      const searchCriteria = this.buildSearchCriteria(params);
      const response = await this.get('/inventory/sources', searchCriteria);
      return formatResponse(response.data, 'sources');
    } catch (error) {
      console.error('Error fetching sources:', error);
      return formatResponse(null, 'sources');
    }
  }

  async getStocks(params = {}) {
    try {
      const searchCriteria = this.buildSearchCriteria(params);
      const response = await this.get('/inventory/stocks', searchCriteria);
      return formatResponse(response.data, 'stocks');
    } catch (error) {
      console.error('Error fetching stocks:', error);
      return formatResponse(null, 'stocks');
    }
  }

  async getSourceItems(params = {}) {
    try {
      const searchCriteria = this.buildSearchCriteria(params);
      const response = await this.get('/inventory/source-items', searchCriteria);
      return formatResponse(response.data, 'sourceItems');
    } catch (error) {
      console.error('Error fetching source items:', error);
      return formatResponse(null, 'sourceItems');
    }
  }

  // Local data utilities
  getLocalData(type) {
    switch (type) {
      case 'orders':
        return ordersData;
      case 'customers':
        return customersData;
      case 'products':
        return productsData;
      case 'invoices':
        return invoicesData;
      case 'categories':
        return categoryData;
      case 'cmsPages':
        return cmsPagesData; // Return local CMS pages data
      default:
        return null;
    }
  }

  getLocalResponse(type) {
    const items = this.getLocalData(type);
    return {
      items,
      total_count: items.length,
      search_criteria: {}
    };
  }

  // Error handling
  handleApiError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Return null to trigger local data fallback
          return null;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error occurred');
          break;
        default:
          toast.error(data.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      toast.error('Network error - please check your connection');
    }

    return Promise.reject(error);
  }

  // Token management
  getToken() {
    return localStorage.getItem('adminToken');
  }

  magentoServiceException(response) {
    let errorMessage = ' ';
    if (response.status)
      switch (response.status) {
        case 400:
          errorMessage = response.data?.message || 'Bad Request: Invalid parameters';
          break;
        case 401:
          errorMessage = 'Invalid credentials. Please check your username and password.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 422:
          errorMessage = response.data?.message || 'Validation failed';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = response.data?.message || 'An unexpected error occurred';
      }
    console.log(errorMessage)
  }

  formatResponse(response) {
    return {
      items: response?.items || [],
      total_count: response?.total_count || 0,
      search_criteria: response?.search_criteria || this.buildSearchCriteria()
    };
  }

  async updateOrder(orderId, orderData) {
    try {
      const response = await this.put(`/orders/${orderId}`, { order: orderData });
      return response.data;
    } catch (error) {
      console.error('Failed to update order:', error);
      throw error;
    }
  }
}

// Create a single instance
const magentoApi = new MagentoApi();

// Export the instance as default
export default magentoApi;

// Export individual methods
export const {
  getOrders,
  getOrderDetails,
  shipOrder,
  getCustomers,
  getCustomerDetails,
  createCustomer,
  getProducts,
  getProduct,
  getCategories,
  getCategory,
  getStockItems,
  updateStockItem,
  getCmsPages,
  getCmsBlocks,
  getCmsPage,
  createCmsPage,
  updateCmsPage,
  deleteCmsPage,
  request,
  buildSearchCriteria,
  getToken,
  magentoServiceException,
  getLocalData,
  getInvoices,
  updateOrder,
  getSources,
  getStocks,
  getSourceItems
} = magentoApi;

