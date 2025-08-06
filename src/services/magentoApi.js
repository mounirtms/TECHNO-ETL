 
import BaseApiService from './BaseApiService';
import unifiedMagentoService from './unifiedMagentoService';
import { toast } from 'react-toastify';

// Import local data
import customersData from '../assets/data/customers.json';
import productsData from '../assets/data/products.json';
import ordersData from '../assets/data/orders.json';
import invoicesData from '../assets/data/invoices.json';
import categoryData from '../assets/data/category.json';
import cmsPagesData from '../assets/data/cmsPages.json';

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
    const searchCriteria = {
      pageSize: params.pageSize || DEFAULT_PARAMS.pageSize,
      currentPage: params.currentPage || DEFAULT_PARAMS.currentPage,
      sortOrders: params.sortOrders || DEFAULT_PARAMS.sortOrders,
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
    try {
      const response = await unifiedMagentoService.post(endpoint, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await unifiedMagentoService.put(endpoint, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async delete(endpoint, config = {}) {
    try {
      const response = await unifiedMagentoService.delete(endpoint, config);
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

  async getProductMedia(sku) {
    try {
      console.log(`🖼️ Getting media for product: ${sku}`);

      const response = await this.get(
        `/products/${encodeURIComponent(sku)}/media`
      );

      console.log('✅ Media retrieved successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to get product media:', error);
      throw new Error(`Failed to get media for ${sku}: ${error.message}`);
    }
  }

  async deleteProductMedia(sku, entryId) {
    try {
      console.log(`🗑️ Deleting media ${entryId} for product: ${sku}`);

      const response = await this.delete(
        `/products/${encodeURIComponent(sku)}/media/${entryId}`
      );

      console.log('✅ Media deleted successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to delete product media:', error);
      throw new Error(`Failed to delete media for ${sku}: ${error.message}`);
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

  // ===== PRODUCT ATTRIBUTES MANAGEMENT =====

  async getProductAttributes(params = {}) {
    try {
      const searchCriteria = this.buildSearchCriteria(params);
      const requestParams = {
        ...searchCriteria,
        fieldName: params.fieldName || 'attribute_code'
      };
      const response = await this.get('/products/attributes', requestParams);
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error fetching product attributes:', error);
      toast.warn('Using mock data: Unable to fetch attributes from API');
      return this.getMockProductAttributes();
    }
  }

  async getProductAttribute(attributeCode) {
    try {
      const response = await this.get(`/products/attributes/${attributeCode}`);
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error fetching product attribute:', error);
      return this.getMockProductAttribute(attributeCode);
    }
  }

  async updateProductAttribute(attributeCode, attributeData) {
    try {
      const response = await this.put(`/products/attributes/${attributeCode}`, attributeData);
      toast.success(`Attribute ${attributeCode} updated successfully`);
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error updating product attribute:', error);
      toast.error(`Failed to update attribute ${attributeCode}`);
      throw error;
    }
  }

  async createProductAttribute(attributeData) {
    try {
      const response = await this.post('/products/attributes', attributeData);
      toast.success(`Attribute ${attributeData.attribute_code} created successfully`);
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error creating product attribute:', error);
      toast.error('Failed to create attribute');
      throw error;
    }
  }

  // ===== PRODUCT CATEGORIES MANAGEMENT =====

  async getProductCategories(productId) {
    try {
      const response = await this.get(`/products/${productId}/categories`);
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error fetching product categories:', error);
      return this.getMockProductCategories(productId);
    }
  }

  async assignProductToCategories(productId, categoryIds) {
    try {
      const response = await this.put(`/products/${productId}/categories`, {
        categoryIds: categoryIds
      });
      toast.success('Product categories updated successfully');
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error assigning product to categories:', error);
      toast.error('Failed to update product categories');
      throw error;
    }
  }

  // ===== PRODUCT ATTRIBUTE VALUES =====

  async getProductAttributeValues(productId, attributeCode) {
    try {
      const response = await this.get(`/products/${productId}/attributes/${attributeCode}`);
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error fetching product attribute values:', error);
      return this.getMockAttributeValue(productId, attributeCode);
    }
  }

  async updateProductAttributeValue(productId, attributeCode, value) {
    try {
      const response = await this.put(`/products/${productId}/attributes/${attributeCode}`, {
        value: value
      });
      toast.success(`Product attribute ${attributeCode} updated`);
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error updating product attribute value:', error);
      toast.error(`Failed to update ${attributeCode}`);
      throw error;
    }
  }

  async getCategories(params = {}) {
    try {
      const searchCriteria = this.buildSearchCriteria(params);
      // Add required fieldName parameter for Magento API
      const requestParams = {
        ...searchCriteria,
        fieldName: params.fieldName || 'name'
      };
      const response = await this.get('/categories', requestParams);

      // Format the response to ensure proper structure
      const formattedResponse = this.formatResponse(response);

      // If the response has the expected structure, add IDs if missing
      if (formattedResponse && formattedResponse.data) {
        formattedResponse.data = this.addCategoryIds(formattedResponse.data);
      }

      return formattedResponse;
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.warn('Using local data: Unable to fetch from API');
      return this.getLocalCategoriesResponse();
    }
  }

  // Helper method to add IDs to categories if missing
  addCategoryIds(categoryData, startId = 1) {
    let currentId = startId;

    const addIds = (categories) => {
      if (Array.isArray(categories)) {
        return categories.map(category => {
          const categoryWithId = {
            ...category,
            id: category.id || currentId++
          };

          if (category.children_data && category.children_data.length > 0) {
            categoryWithId.children_data = addIds(category.children_data);
          }

          return categoryWithId;
        });
      } else if (categoryData && typeof categoryData === 'object') {
        // Handle single category object
        const categoryWithId = {
          ...categoryData,
          id: categoryData.id || currentId++
        };

        if (categoryData.children_data && categoryData.children_data.length > 0) {
          categoryWithId.children_data = addIds(categoryData.children_data);
        }

        return categoryWithId;
      }

      return categories;
    };

    return addIds(categoryData);
  }

  // Get local categories with proper formatting
  getLocalCategoriesResponse() {
    try {
      const localData = this.getLocalResponse('categories');

      // Format the local category data to match expected structure
      if (localData && localData.data) {
        const formattedData = this.addCategoryIds(localData.data);

        // Ensure it's in the expected array format
        const categoriesArray = Array.isArray(formattedData) ? formattedData : [formattedData];

        return {
          data: {
            items: categoriesArray,
            total_count: categoriesArray.length
          },
          success: true
        };
      }

      return localData;
    } catch (error) {
      console.error('Error formatting local categories:', error);
      return this.getMockCategoriesResponse();
    }
  }

  // Fallback mock categories
  getMockCategoriesResponse() {
    return {
      data: {
        items: [
          {
            id: 1,
            name: 'Root Category',
            level: 0,
            children_data: [
              { id: 2, name: 'Electronics', level: 1, children_data: [] },
              { id: 3, name: 'Clothing', level: 1, children_data: [] },
              { id: 4, name: 'Home & Garden', level: 1, children_data: [] }
            ]
          }
        ],
        total_count: 1
      },
      success: true
    };
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

      // Build proper search criteria to fix "%fieldName" error
      const searchCriteria = params.searchCriteria || {
        filterGroups: [],
        pageSize: 25,
        currentPage: 1,
        sortOrders: [{ field: 'creation_time', direction: 'DESC' }]
      };

      // Ensure all filter groups have proper field names
      if (searchCriteria.filterGroups) {
        searchCriteria.filterGroups.forEach(group => {
          if (group.filters) {
            group.filters.forEach(filter => {
              // Ensure field name is properly set and not a template variable
              if (!filter.field || filter.field.includes('%') || filter.field.includes('fieldName')) {
                console.warn('⚠️ Invalid field name detected:', filter.field);
                filter.field = 'title'; // Default to title field
              }
            });
          }
        });
      }

      console.log('🔍 Fetching CMS pages with criteria:', searchCriteria);

      // Add required fieldName parameter for Magento API
      const requestParams = {
        searchCriteria,
        fieldName: params.fieldName || 'title'
      };

      const response = await this.get('/cmsPage/search', requestParams);

      if (response && response.items) {
        this.setCachedData(cacheKey, response);
        return response;
      }

      throw new Error('No data returned from API');
    } catch (error) {
      console.error('❌ Failed to fetch CMS pages:', error);
      const localData = this.getLocalResponse('cmsPages');
      console.log('📦 Using local CMS pages data:', localData);
      return localData;
    }
  }

  async getCmsBlocks(params = {}) {
    try {
      const cacheKey = this.getCacheKey('/cmsBlock/search', params);
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('Using cached CMS blocks data');
        return cachedData;
      }

      // Build proper search criteria to fix "%fieldName" error
      const searchCriteria = params.searchCriteria || {
        filterGroups: [],
        pageSize: 25,
        currentPage: 1,
        sortOrders: [{ field: 'creation_time', direction: 'DESC' }]
      };

      // Ensure all filter groups have proper field names
      if (searchCriteria.filterGroups) {
        searchCriteria.filterGroups.forEach(group => {
          if (group.filters) {
            group.filters.forEach(filter => {
              // Ensure field name is properly set and not a template variable
              if (!filter.field || filter.field.includes('%') || filter.field.includes('fieldName')) {
                console.warn('⚠️ Invalid field name detected:', filter.field);
                filter.field = 'title'; // Default to title field
              }
            });
          }
        });
      }

      console.log('🔍 Fetching CMS blocks with criteria:', searchCriteria);

      // Add required fieldName parameter for Magento API
      const requestParams = {
        searchCriteria,
        fieldName: params.fieldName || 'title'
      };

      const response = await this.get('/cmsBlock/search', requestParams);

      const result = {
        items: response.items || [],
        total_count: response.total_count || 0,
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch CMS blocks:', error);
      const localData = this.getLocalResponse('cmsBlocks');
      console.log('📦 Using local CMS blocks data:', localData);
      return localData;
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

  // ===== BRANDS MANAGEMENT =====

  async getBrands(useCache = true) {
    const cacheKey = 'brands_mgs_brand';

    if (useCache) {
      const cachedBrands = this.getCachedData(cacheKey);
      if (cachedBrands) {
        console.log('📦 Using cached brands data');
        return cachedBrands;
      }
    }

    try {
      console.log('🔄 Fetching brands from additional_attributes...');

      // Try to get brands from additional_attributes with code 'mgs_brand'
      const response = await this.get('/products/attributes/mgs_brand/options');
      const brands = this.formatResponse(response);

      // Cache the brands data
      this.setCachedData(cacheKey, brands);
      console.log('✅ Brands cached successfully');

      return brands;
    } catch (error) {
      console.error('❌ Error fetching brands:', error);
      console.log('📦 Using mock brands data');

      const mockBrands = this.getMockBrands();
      this.setCachedData(cacheKey, mockBrands);
      return mockBrands;
    }
  }

  async addBrand(brandData) {
    try {
      console.log('➕ Adding new brand:', brandData);

      const response = await this.post('/products/attributes/mgs_brand/options', {
        option: {
          label: brandData.label,
          value: brandData.value || brandData.label.toLowerCase().replace(/\s+/g, '_'),
          sort_order: brandData.sort_order || 0
        }
      });

      // Clear cache to force refresh
      this.clearCachedData('brands_mgs_brand');

      toast.success(`Brand "${brandData.label}" added successfully`);
      return this.formatResponse(response);
    } catch (error) {
      console.error('❌ Error adding brand:', error);
      toast.error('Failed to add brand');
      throw error;
    }
  }

  async updateBrand(brandId, brandData) {
    try {
      console.log('✏️ Updating brand:', brandId, brandData);

      const response = await this.put(`/products/attributes/mgs_brand/options/${brandId}`, {
        option: brandData
      });

      // Clear cache to force refresh
      this.clearCachedData('brands_mgs_brand');

      toast.success(`Brand updated successfully`);
      return this.formatResponse(response);
    } catch (error) {
      console.error('❌ Error updating brand:', error);
      toast.error('Failed to update brand');
      throw error;
    }
  }

  async deleteBrand(brandId) {
    try {
      console.log('🗑️ Deleting brand:', brandId);

      await this.delete(`/products/attributes/mgs_brand/options/${brandId}`);

      // Clear cache to force refresh
      this.clearCachedData('brands_mgs_brand');

      toast.success('Brand deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting brand:', error);
      toast.error('Failed to delete brand');
      throw error;
    }
  }

  // ===== ADDITIONAL ATTRIBUTES MANAGEMENT =====

  async getAdditionalAttributes(productId) {
    try {
      console.log('🔄 Fetching additional attributes for product:', productId);

      const response = await this.get(`/products/${productId}/additional-attributes`);
      return this.formatResponse(response);
    } catch (error) {
      console.error('❌ Error fetching additional attributes:', error);
      return this.getMockAdditionalAttributes(productId);
    }
  }

  async updateAdditionalAttribute(productId, attributeCode, value) {
    try {
      console.log('✏️ Updating additional attribute:', { productId, attributeCode, value });

      const response = await this.put(`/products/${productId}/additional-attributes/${attributeCode}`, {
        value: value
      });

      toast.success(`Additional attribute ${attributeCode} updated`);
      return this.formatResponse(response);
    } catch (error) {
      console.error('❌ Error updating additional attribute:', error);
      toast.error(`Failed to update ${attributeCode}`);
      throw error;
    }
  }

  // ===== MOCK DATA FOR PRODUCT ATTRIBUTES =====

  getMockProductAttributes() {
    return {
      items: [
        {
          attribute_id: 1,
          attribute_code: 'name',
          frontend_label: 'Product Name',
          frontend_input: 'text',
          is_required: true,
          is_user_defined: false,
          is_system: true,
          is_visible: true,
          scope: 'store'
        },
        {
          attribute_id: 2,
          attribute_code: 'description',
          frontend_label: 'Description',
          frontend_input: 'textarea',
          is_required: false,
          is_user_defined: false,
          is_system: true,
          is_visible: true,
          scope: 'store'
        },
        {
          attribute_id: 3,
          attribute_code: 'price',
          frontend_label: 'Price',
          frontend_input: 'price',
          is_required: true,
          is_user_defined: false,
          is_system: true,
          is_visible: true,
          scope: 'global'
        },
        {
          attribute_id: 4,
          attribute_code: 'color',
          frontend_label: 'Color',
          frontend_input: 'select',
          is_required: false,
          is_user_defined: true,
          is_system: false,
          is_visible: true,
          scope: 'global',
          options: [
            { value: '1', label: 'Red' },
            { value: '2', label: 'Blue' },
            { value: '3', label: 'Green' },
            { value: '4', label: 'Black' },
            { value: '5', label: 'White' }
          ]
        },
        {
          attribute_id: 5,
          attribute_code: 'size',
          frontend_label: 'Size',
          frontend_input: 'select',
          is_required: false,
          is_user_defined: true,
          is_system: false,
          is_visible: true,
          scope: 'global',
          options: [
            { value: '10', label: 'XS' },
            { value: '11', label: 'S' },
            { value: '12', label: 'M' },
            { value: '13', label: 'L' },
            { value: '14', label: 'XL' },
            { value: '15', label: 'XXL' }
          ]
        }
      ],
      total_count: 5
    };
  }

  getMockProductAttribute(attributeCode) {
    const attributes = this.getMockProductAttributes().items;
    return attributes.find(attr => attr.attribute_code === attributeCode) || null;
  }

  getMockProductCategories(productId) {
    return {
      categories: [
        { id: 1, name: 'Electronics', level: 1, path: '1/2' },
        { id: 3, name: 'Smartphones', level: 2, path: '1/2/3' },
        { id: 5, name: 'Clothing', level: 1, path: '1/5' }
      ]
    };
  }

  getMockAttributeValue(productId, attributeCode) {
    const mockValues = {
      name: `Product ${productId}`,
      description: `Description for product ${productId}`,
      price: Math.floor(Math.random() * 1000) + 10,
      color: Math.floor(Math.random() * 5) + 1,
      size: Math.floor(Math.random() * 6) + 10
    };

    return {
      attribute_code: attributeCode,
      value: mockValues[attributeCode] || `Value for ${attributeCode}`
    };
  }

  // ===== MOCK DATA FOR BRANDS =====

  getMockBrands() {
    return {
      items: [
        {
          value: 'nike',
          label: 'Nike',
          sort_order: 1,
          is_default: false
        },
        {
          value: 'adidas',
          label: 'Adidas',
          sort_order: 2,
          is_default: false
        },
        {
          value: 'puma',
          label: 'Puma',
          sort_order: 3,
          is_default: false
        },
        {
          value: 'under_armour',
          label: 'Under Armour',
          sort_order: 4,
          is_default: false
        },
        {
          value: 'reebok',
          label: 'Reebok',
          sort_order: 5,
          is_default: false
        },
        {
          value: 'new_balance',
          label: 'New Balance',
          sort_order: 6,
          is_default: false
        },
        {
          value: 'converse',
          label: 'Converse',
          sort_order: 7,
          is_default: false
        },
        {
          value: 'vans',
          label: 'Vans',
          sort_order: 8,
          is_default: false
        },
        {
          value: 'asics',
          label: 'ASICS',
          sort_order: 9,
          is_default: false
        },
        {
          value: 'jordan',
          label: 'Jordan',
          sort_order: 10,
          is_default: false
        }
      ],
      total_count: 10
    };
  }

  getMockAdditionalAttributes(productId) {
    const brands = this.getMockBrands().items;
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];

    return {
      additional_attributes: [
        {
          attribute_code: 'mgs_brand',
          value: randomBrand.value,
          label: randomBrand.label
        },
        {
          attribute_code: 'manufacturer',
          value: randomBrand.label,
          label: randomBrand.label
        },
        {
          attribute_code: 'country_of_manufacture',
          value: 'US',
          label: 'United States'
        },
        {
          attribute_code: 'warranty',
          value: '1_year',
          label: '1 Year'
        }
      ]
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
  getProductAttributes,
  getProductAttribute,
  updateProductAttribute,
  createProductAttribute,
  getProductCategories,
  assignProductToCategories,
  getProductAttributeValues,
  updateProductAttributeValue,
  getBrands,
  addBrand,
  updateBrand,
  deleteBrand,
  getAdditionalAttributes,
  updateAdditionalAttribute,
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
