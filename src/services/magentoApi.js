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

class MagentoApi {
  constructor() {
    this.baseURL = API_URL;

    // Initialize cache
    this.cache = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  buildSearchCriteria(params = {}) {
    const {
      pageSize = DEFAULT_PARAMS.pageSize,
      currentPage = DEFAULT_PARAMS.currentPage,
      sortOrders = DEFAULT_PARAMS.sortOrders,
      filterGroups = []
    } = params;

    // Create the search criteria object according to Magento's API format
    const searchCriteria = {
      searchCriteria: {
        pageSize: pageSize,
        currentPage: currentPage,
        sortOrders: sortOrders.map(sort => ({
          field: sort.field,
          direction: sort.direction
        })),
        filterGroups: filterGroups.map(group => ({
          filters: group.filters.map(filter => ({
            field: filter.field,
            value: filter.value,
            conditionType: filter.conditionType
          }))
        }))
      }
    };

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

  // API Methods
  async get(endpoint, config = {}) {
    return magentoService.get(endpoint, config);
  }

  async post(endpoint, data = {}, config = {}) {
    return magentoService.post(endpoint, data, config);
  }

  async put(endpoint, data = {}, config = {}) {
    return magentoService.put(endpoint, data, config);
  }

  async delete(endpoint, config = {}) {
    return magentoService.delete(endpoint, config);
  }

  async getOrders(params = {}) {
    try {
      const cacheKey = this.getCacheKey('/orders', params);
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        console.log('Using cached orders data');
        return cachedData;
      }

      const searchCriteria = this.buildSearchCriteria(params);
      console.log('Fetching orders with criteria:', searchCriteria);
      
      const response = await this.get('/orders', searchCriteria);

      if (response && response.data) {
        this.setCachedData(cacheKey, response.data);
        console.log('Fetched orders from API:', response.data);
        return response.data;
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
      const cacheKey = this.getCacheKey('/customers', params);
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        console.log('Using cached customers data');
        return cachedData;
      }

      const searchCriteria = this.buildSearchCriteria(params);
      console.log('Fetching customers with criteria:', searchCriteria);
      
      const response = await this.get('/customers/search', searchCriteria);

      if (response && response.data) {
        this.setCachedData(cacheKey, response.data);
        console.log('Fetched customers from API:', response.data);
        return response.data;
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
        console.log('Using cached products data');
        return cachedData;
      }

      const searchCriteria = this.buildSearchCriteria(params);
      console.log('Fetching products with criteria:', searchCriteria);
      
      const response = await this.get('/products', searchCriteria);

      if (response && response.data) {
        this.setCachedData(cacheKey, response.data);
        console.log('Fetched products from API:', response.data);
        return response.data;
      }

      throw new Error('Failed to fetch products');
    } catch (error) {
      console.error('Error fetching products:', error);
      const localData = this.getLocalResponse('products');
      console.log('Using local products data:', localData);
      return localData;
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
    const searchCriteria = this.buildSearchCriteria(params);
    return this.get('/stockItems', searchCriteria);
  }

  async updateStockItem(productSku, stockItem) {
    return this.put(`/products/${encodeURIComponent(productSku)}/stockItems/${stockItem.item_id}`, stockItem);
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
  updateOrder
} = magentoApi;
