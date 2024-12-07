import axios from 'axios';
import { defaultGridSettings } from '../config/gridConfig';
import customersData from '../assets/data/customers.json';
import productsData from '../assets/data/products.json';
import ordersData from '../assets/data/orders.json';
import invoicesData from '../assets/data/invoices.json';
import categoryData from '../assets/data/category.json';
import { toast } from 'react-toastify';

class MagentoApi {
    constructor() {
        this.baseURL = import.meta.env.VITE_MAGENTO_API_URL || 'https://technostationery.com/rest/V1';

        this.api = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000, // Increased timeout
            validateStatus: status => status < 500 // Handle 4xx errors in response interceptor
        });

        // Add request interceptor
        this.api.interceptors.request.use(
            (config) => {
                const adminToken = this.getToken();
                if (adminToken) {
                    if (!config.url.includes('admin/token')) {
                        config.headers['Authorization'] = `Bearer ${adminToken}`;
                    }
                }

                // Log request details
                console.log('Magento API Request:', {
                    url: config.url,
                    method: config.method,
                    headers: config.headers,
                    data: config.data
                });

                return config;
            },
            (error) => {
                console.error('Request Interceptor Error:', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor
        this.api.interceptors.response.use(
            response => {

                // Log full response for debugging
                console.log('Magento API Full Response:', {
                    status: response.status,
                    data: response.data,
                    headers: response.headers
                });

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
            error => {
                console.error('Magento API Error:', error);
                return this.magentoServiceException(error.response);
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
            pageSize = defaultGridSettings.pageSize,
            currentPage = 1,
            sortOrders = [{
                field: defaultGridSettings.defaultSort.field,
                direction: defaultGridSettings.defaultSort.sort
            }]
        } = params;

        const searchCriteria = {
            searchCriteria: {
                filterGroups,
                pageSize,
                currentPage,
                sortOrders
            }
        };

        return searchCriteria;
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
    async getOrders(searchCriteria) {
        return this.fetchData('GET', '/orders', this.buildSearchCriteria(searchCriteria));
    }

    async getCustomers(searchCriteria) {
        return this.fetchData('GET', '/customers/search', this.buildSearchCriteria(searchCriteria));
    }

    async getProducts(searchCriteria) {
        return this.fetchData('GET', '/products', this.buildSearchCriteria(searchCriteria));
    }

    // Additional methods for specific operations
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
    async getCategories() {
        return this.fetchData('GET', '/categories');
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

    // Cache management
    async cleanCache(types = ['full_page']) {
        return this.fetchData('POST', '/cacheType/clean', { types });
    }
}
// Utility function to get local data
const getLocalData = (entityType) => {
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
const handleApi401Error = async (error) => {

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

    let localData = getLocalData(entityType);

    return {
        items: localData,
        total_count: localData.length,
        search_criteria: {}
    };


};
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
    getSources, getSource, getStocks, getStock
} = magentoApi;