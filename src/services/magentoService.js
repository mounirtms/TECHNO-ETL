import axios from 'axios';
import { defaultGridSettings } from '../config/gridConfig';
import customersData from '../assets/data/customers.json';
import productsData from '../assets/data/products.json';
import ordersData from '../assets/data/orders.json';
import invoicesData from '../assets/data/invoices.json';
import categoryData from '../assets/data/category.json';
import { toast } from 'react-toastify';

class MagentoApi {
    #cache = new Map();
    #cacheTimeout = 5 * 60 * 1000; // 5 minutes

    constructor() {
        this.baseURL = localStorage.getItem('magentoApiUrl') || 
                      import.meta.env.VITE_MAGENTO_API_URL || 
                      'https://technostationery.com/rest/V1';

        this.api = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: status => status < 500
        });

        // Add request interceptor
        this.api.interceptors.request.use(
            (config) => {
                const currentApiUrl = localStorage.getItem('magentoApiUrl');
                if (currentApiUrl && currentApiUrl !== this.baseURL) {
                    this.baseURL = currentApiUrl;
                    config.baseURL = currentApiUrl;
                }
               
                const adminToken = this.getToken();
                if (adminToken) {
                    if (!config.url.includes('admin/token')) {
                        config.headers['Authorization'] = `Bearer ${adminToken}`;
                    }
                }

                return config;
            },
            (error) => {
                console.error('Request Interceptor Error:', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for better error handling
        this.api.interceptors.response.use(
            response => {

                  // Check for different response structures
                if (response.status === 200) {
                    // Successful response
                    if (response.data) {
                        // If response is an object with error properties
                        if (response.data.error) {
                            throw new Error(response.data.error.message || 'Unknown API error');
                        }

                        // If response is an object with a message indicating failure
                        if (response.data.message && response.data.message.includes('error')) {
                            throw new Error(response.data.message);
                        }

                        // Return the data if it passes all checks
                        return response.data;
                    }

                    // If no data in successful response
                    throw new Error('Empty response received');
                }

                // Handle other successful status codes
                if (response.status >= 200 && response.status < 300) {
                    return response.data;
                }
                return this.magentoServiceException(response);

            },
            (error) => {
                if (error.response) {
                    console.error('Magento API Error Response:', {
                        status: error.response.status,
                        data: error.response.data,
                        headers: error.response.headers
                    });
                    
                    // Handle specific error cases
                    switch (error.response.status) {
                        case 401:
                            return this.handleApi401Error(error);
                        case 403:
                            console.error('Access Forbidden - Check API permissions');
                            break;
                        default:
                            console.error('API Error:', error.response.data);
                    }
                } else if (error.code === 'ERR_NETWORK') {
                    console.error('Network Error - Possible CORS issue:', {
                        message: error.message,
                        config: error.config
                    });
                    // You might want to implement a retry mechanism here
                }
                return Promise.reject(error);
            }
        );
    }

    // Authentication
    async login(username, password, apiUrl = this.baseURL) {
        try {
            // Update base URL if a new one is provided
            if (apiUrl) {
                this.baseURL = apiUrl;
            }

            console.log('Attempting Magento login for:', username);

            // Validate inputs
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            // Create a specialized login instance with specific configurations
            const loginInstance = axios.create({
                baseURL: this.api.defaults.baseURL,
                headers: {
                    'Content-Type': 'application/json',

                },
                timeout: 30000,
                // Explicitly handle all status codes
                validateStatus: function (status) {
                    return status >= 200 && status < 600; // Allow all status codes for detailed error handling
                }
            });

            // Make login request with detailed configuration
            const response = await loginInstance.post('/integration/admin/token',
                {
                    username,
                    password
                },
                {
                    // Additional axios request config
                    transformResponse: [function (data) {
                        // Custom response transformation
                        try {
                            return JSON.parse(data);
                        } catch (e) {
                            return data;
                        }
                    }]
                }
            );

            console.log('Full Login Response:', {
                status: response.status,
                data: response.data,
                headers: response.headers
            });

            // Explicit handling of different response scenarios
            if (response.status === 401) {
                // Specific handling for unauthorized access
                const errorDetails = response.data || {};
                const errorMessage = errorDetails.message
                    || errorDetails.error
                    || 'Authentication failed. Please check your credentials.';

                throw new Error(`Authentication Error: ${errorMessage}`);
            }

            // Check for successful token retrieval
            if (response.status === 200 && response.data) {
                // Validate token format
                if (typeof response.data !== 'string' || response.data.trim() === '') {
                    throw new Error('Invalid token format received');
                }

                console.log('Login successful, token received');
                localStorage.setItem('adminToken', response.data)
                return response.data;
            }

            // Catch-all for unexpected responses
            throw new Error(`Unexpected login response: ${response.status}`);

        } catch (error) {
            console.error('Magento login error:', error);

            // Detailed error parsing
            let errorMessage = 'Login failed';

            if (error.response) {
                // Server responded with an error
                errorMessage = error.response.data?.message
                    || `Server error: ${error.response.status}`;
            } else if (error.request) {
                // Request made but no response received
                errorMessage = 'No response from server. Check your connection.';
            } else {
                // Error in request setup
                errorMessage = error.message || 'An unexpected error occurred';
            }

            // Show error toast
            toast.error(`Login failed: ${errorMessage}`, { autoClose: 5000 });

            // Rethrow for further handling
            throw error;
        }
    }

    async connectOAuth(clientId, clientSecret) {
        try {
            const response = await this.api.post('/oauth/token', {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            });
            const token = response.data.access_token;
            this.setToken(token); // Store the token for future requests
            return token;
        } catch (error) {
            console.error('OAuth connection error:', error);
            throw new Error('Failed to connect using OAuth');
        }
    }

    // Logout
    async logout() {
        try {
            this.clearToken();
            toast.success('Successfully logged out from Magento', { autoClose: 3000 });
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to log out from Magento', { autoClose: 5000 });
            throw error;
        }
    }

    magentoServiceException(response) {
        let errorMessage = ' ';
   
            if (response.status)
                switch (response.status) {
                    case 400:
                        errorMessage = error.response.data?.message || 'Bad Request: Invalid parameters';
                        break;
                    case 401:
                        errorMessage = 'Invalid credentials. Please check your username and password.';
                        return handleApi401Error(response);
                        this.clearToken(); // Clear invalid token
                        break;
                    case 403:
                        errorMessage = 'Access denied. You do not have permission to perform this action.';
                        break;
                    case 404:
                        errorMessage = 'The requested resource was not found.';
                        break;
                    case 422:
                        // Unprocessable Entity - often validation errors
                        errorMessage = error.response.data?.message || 'Validation failed';
                        break;
                    case 500:
                        errorMessage = 'Internal server error. Please try again later.';
                        break;
                    default:
                        errorMessage = error.response.data?.message || 'An unexpected error occurred';
                }
        console.log(errorMessage)
    };

    // Token Management Methods
    setToken(token) {
        const tokenData = {
            value: token,
            timestamp: Date.now()
        };
        localStorage.setItem('adminToken', JSON.stringify(tokenData));
    }

    getToken() {

        return localStorage.getItem('adminToken');
    }

    clearToken() {
        localStorage.removeItem('adminToken');
    }


    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }

    // Helper method to build search criteria
    buildSearchCriteria(params = {}) {
        const {
            filterGroups = [],
            pageSize = 10,
            currentPage = 1,
            sortOrders = [{
                field: 'created_at',
                direction: 'DESC'
            }],
            startDate,
            endDate
        } = params;

        let updatedFilterGroups = [...filterGroups];
        
        if (startDate || endDate) {
            const dateFilters = [];
            if (startDate) {
                dateFilters.push({
                    field: 'created_at',
                    value: startDate,
                    condition_type: 'gteq'
                });
            }
            if (endDate) {
                dateFilters.push({
                    field: 'created_at',
                    value: endDate,
                    condition_type: 'lteq'
                });
            }
            if (dateFilters.length > 0) {
                updatedFilterGroups.push({ filters: dateFilters });
            }
        }

        return {
            searchCriteria: {
                filterGroups: updatedFilterGroups,
                pageSize,
                currentPage,
                sortOrders
            }
        };
    }

    // Generic data fetching
    async fetchData(method, endpoint, data = null) {
        try {
            const config = {
                method,
                url: endpoint,
                ...(data && (method === 'GET' ? { params: data } : { data }))
            };

            if (this.getToken()) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${this.getToken()}`
                };
            }

            return await this.api.request(config);
        } catch (error) {
            console.error(`Error in ${method} request to ${endpoint}:`, error);
            throw error;
        }
    }

    // Specific API methods
    async getOrders(searchCriteria = {}) {
        try {
            const cacheKey = `orders-${JSON.stringify(searchCriteria)}`;
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;

            // Ensure filterGroups is an array
            if (!searchCriteria.filterGroups) {
                searchCriteria.filterGroups = [];
            }

            // Format the search criteria for Magento's API
            const formattedCriteria = {
                searchCriteria: {
                    filterGroups: searchCriteria.filterGroups.map(group => ({
                        filters: group.filters.map(filter => ({
                            field: filter.field,
                            value: filter.value,
                            condition_type: filter.conditionType || 'eq'
                        }))
                    })),
                    pageSize: searchCriteria.pageSize || 10,
                    currentPage: searchCriteria.currentPage || 1
                }
            };

            // Make the API call
            const response = await this.api.get('/orders', {
                params: formattedCriteria
            });

            // Return the response data
            const result = {
                items: response.items || [],
                total_count: response.total_count || 0,
                search_criteria: response.search_criteria || {}
            };
            
            this.setCachedData(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error fetching orders:', error);
            const localData = { 
                items: this.getLocalData('orders'), 
                total_count: this.getLocalData('orders').length 
            };
            this.setCachedData('orders-local', localData);
            return localData;
        }
    }

    async getProducts(searchCriteria = {}) {
        try {
            const cacheKey = `products-${JSON.stringify(searchCriteria)}`;
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;

            // Format the search criteria for Magento's API
            const formattedCriteria = {
                searchCriteria: {
                    filterGroups: searchCriteria.filterGroups || [],
                    pageSize: searchCriteria.pageSize || 10,
                    currentPage: searchCriteria.currentPage || 1,
                    sortOrders: searchCriteria.sortOrders || []
                }
            };

            // Make the API call
            const response = await this.api.get('/products', {
                params: formattedCriteria
            });

            // Return the response data
            const result = {
                items: response.items || [],
                total_count: response.total_count || 0,
                search_criteria: response.search_criteria || {}
            };
            
            this.setCachedData(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error fetching products:', error);
            const localData = { 
                items: this.getLocalData('products'), 
                total_count: this.getLocalData('products').length 
            };
            this.setCachedData('products-local', localData);
            return localData;
        }
    }

    async getOrder(orderId) {
        return this.api.get(`/orders/${orderId}`);
    }

    async getCustomer(customerId) {
        return this.api.get(`/customers/${customerId}`);
    }

    async getProduct(sku) {
        return this.api.get(`/products/${sku}`);
    }

    // Catalog endpoints
    async getCategories(searchCriteria = {}) {
        try {
            const cacheKey = `categories-${JSON.stringify(searchCriteria)}`;
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;

            const formattedCriteria = {
                searchCriteria: {
                    filterGroups: searchCriteria.filterGroups || [],
                    pageSize: searchCriteria.pageSize || 100,
                    currentPage: searchCriteria.currentPage || 1,
                    sortOrders: [{
                        field: 'position',
                        direction: 'ASC'
                    }]
                }
            };

            console.log('Fetching categories with criteria:', formattedCriteria);
            
            try {
                const response = await this.api.get('/categories/list', {
                    params: formattedCriteria
                });
                console.log('Raw category response:', response);

                if (!response || !response.items) {
                    throw new Error('Invalid response format');
                }

                const result = {
                    items: response.items.map(cat => ({
                        entity_id: cat.id || cat.entity_id,
                        parent_id: cat.parent_id || '0',
                        name: cat.name || 'Unnamed Category',
                        position: parseInt(cat.position) || 0,
                        level: parseInt(cat.level) || 0,
                        is_active: Boolean(cat.is_active),
                        product_count: parseInt(cat.product_count) || 0
                    })),
                    total_count: response.total_count || response.items.length,
                    search_criteria: response.search_criteria || {}
                };

                console.log('Processed category result:', result);
                this.setCachedData(cacheKey, result);
                return result;
            } catch (apiError) {
                console.error('API Error:', apiError);
                throw apiError;
            }
        } catch (error) {
            console.error('Error in getCategories:', error);
            
            // Fallback to local data
            const localCategories = [
                {
                    entity_id: '1',
                    parent_id: '0',
                    name: 'Root Catalog',
                    position: 0,
                    level: 0,
                    is_active: true,
                    product_count: 0
                },
                {
                    entity_id: '2',
                    parent_id: '1',
                    name: 'Default Category',
                    position: 1,
                    level: 1,
                    is_active: true,
                    product_count: 0
                }
                // Add more sample categories if needed
            ];

            const localData = { 
                items: localCategories,
                total_count: localCategories.length,
                search_criteria: searchCriteria
            };
            
            this.setCachedData('categories-local', localData);
            return localData;
        }
    }

    async getCategory(categoryId) {
        return this.fetchData('GET', `/categories/${categoryId}`);
    }

    // Order endpoints
    async shipOrder(orderId, items, notify = true) {
        return this.fetchData('POST', `/order/${orderId}/ship`, {
            items,
            notify
        });
    }

    // Customer endpoints
    async createCustomer(customerData) {
        return this.fetchData('POST', '/customers', { customer: customerData });
    }

    // Inventory endpoints
    async getStockItems(searchCriteria = {}) {
        return this.fetchData('GET', '/stockItems', this.buildSearchCriteria(searchCriteria));
    }

    async updateStockItem(productSku, stockItem) {
        return this.fetchData('PUT', `/products/${encodeURIComponent(productSku)}/stockItems/${stockItem.item_id}`, stockItem);
    }

    // Sales endpoints
    async getInvoices(searchCriteria = {}) {
        return this.fetchData('GET', '/invoices', this.buildSearchCriteria(searchCriteria));
    }

    async getShipments(searchCriteria = {}) {
        return this.fetchData('GET', '/shipments', this.buildSearchCriteria(searchCriteria));
    }

    // Inventory Source endpoints
    async getSources(searchCriteria = {}) {
        try {
            const response = await this.api.get('/inventory/sources', {
                params: this.buildSearchCriteria(searchCriteria)
            });
            return response;
        } catch (error) {
            return this.handleApi401Error(error);
        }
    }

    async getSource(sourceCode) {
        try {
            const response = await this.api.get(`/inventory/sources/${sourceCode}`);
            return response;
        } catch (error) {
            return this.handleApi401Error(error);
        }
    }

    // Stock endpoints
    async getStocks(searchCriteria = {}) {
        try {
            const response = await this.api.get('/inventory/stocks', {
                params: this.buildSearchCriteria(searchCriteria)
            });
            return response;
        } catch (error) {
            return this.handleApi401Error(error);
        }
    }

    async getStock(stockId) {
        try {
            const response = await this.api.get(`/inventory/stocks/${stockId}`);
            return response;
        } catch (error) {
            return this.handleApi401Error(error);
        }
    }

    getCachedData(key) {
        const cached = this.#cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.#cacheTimeout) {
            console.log('Cache hit for:', key);
            return cached.data;
        }
        console.log('Cache miss for:', key);
        return null;
    }

    setCachedData(key, data) {
        console.log('Caching data for:', key);
        this.#cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        console.log('Clearing cache');
        this.#cache.clear();
    }

    async getCustomers(searchCriteria = {}) {
        try {
            const cacheKey = `customers-${JSON.stringify(searchCriteria)}`;
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;

            const formattedCriteria = {
                searchCriteria: {
                    filterGroups: searchCriteria.filterGroups || [],
                    pageSize: searchCriteria.pageSize || 10,
                    currentPage: searchCriteria.currentPage || 1,
                    sortOrders: searchCriteria.sortOrders || []
                }
            };

            const response = await this.api.get('/customers/search', { params: formattedCriteria });
            const result = {
                items: response.items || [],
                total_count: response.total_count || 0,
                search_criteria: response.search_criteria || {}
            };
            
            this.setCachedData(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error fetching customers:', error);
            const localData = { 
                items: this.getLocalData('customers'), 
                total_count: this.getLocalData('customers').length 
            };
            this.setCachedData('customers-local', localData);
            return localData;
        }
    }

    async cleanCache(types = ['full_page']) {
        return this.fetchData('POST', '/cacheType/clean', { types });
    }

    // Utility function to get local data
    getLocalData(entityType) {
        const dataMap = {
            customers: customersData,
            products: productsData,
            orders: ordersData,
            invoices: invoicesData,
            categories: categoryData
        };
        return dataMap[entityType] || [];
    };

    // Error handling function with fallback to local data
    handleApi401Error = async (error) => {

        let entityType;
        if ((error.request.responseURL).includes('orders')) {
            entityType = 'orders'
        } else {
            if ((error.request.responseURL).includes('products')) {
                entityType = 'products'
            }
            else if ((error.request.responseURL).includes('customers')) {
                entityType = 'customers'
            }
            else if ((error.request.responseURL).includes('invoice')) {
                entityType = 'invoices'
            }
            else if ((error.request.responseURL).includes('categories')) {
                entityType = 'categories'
            }
        }

        let localData = this.getLocalData(entityType);

        return {
            items: localData,
            total_count: localData.length,
            search_criteria: {}
        };
    };
}

const magentoApi = new MagentoApi();
export default magentoApi;

// Export individual methods for convenience
export const {
    login, logout, fetchData,
    getOrders, getOrder, getCustomers, getCustomer, createCustomer,
    getProducts, getProduct, getCategories, getCategory,
    getStockItems, updateStockItem,
    getInvoices, getShipments,
    cleanCache, shipOrder,
    getSources, getSource, getStocks, getStock,
    connectOAuth
} = magentoApi;