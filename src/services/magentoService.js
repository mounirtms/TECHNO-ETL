import axios from 'axios';
import { toast } from 'react-toastify';

// Import local data
import customersData from '../assets/data/customers.json';
import productsData from '../assets/data/products.json';
import ordersData from '../assets/data/orders.json';
import invoicesData from '../assets/data/invoices.json';
import categoryData from '../assets/data/category.json';

class MagentoService {
     constructor() {
        this.baseURL = '/api/magento';	 // Your backend API URL
        this.instance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async get(endpoint, params = {}) { 
        return this.instance.get(endpoint, params );
    }


    async post(endpoint, data = {}, config = {}) {
        return this.instance.post(endpoint, data, config);
    }

    async put(endpoint, data = {}, config = {}) {
        return this.instance.put(endpoint, data, config);
    }

    async delete(endpoint, config = {}) {
        return this.instance.delete(endpoint, config);
    }

  /*  constructor() {
        this.baseURL = import.meta.env.VITE_MAGENTO_API_URL;
        this.instance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.instance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('adminToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.instance.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                return this.handleApiError(error);
            }
        );
    }
 
    // HTTP Methods
    async get(endpoint, params = {}) {
        try {
            console.log('Making GET request to:', endpoint, 'with params:', params);
            
            let url = endpoint;
            if (params.params) {
                const queryParams = new URLSearchParams();
                Object.entries(params.params).forEach(([key, value]) => {
                    queryParams.append(key, value);
                });
                url += `?${queryParams.toString()}`;
            }

            console.log('Final URL:', url);

            // Try to get from cache first
            const cachedData = await this.getCachedResponse(url);
            if (cachedData) {
                console.log('Retrieved from cache:', url);
                return cachedData;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await this.instance.get(url, config);
            console.log('GET response:', response);
            
            if (response?.status === 200) {
                // Cache the successful response
                await this.setCachedResponse(url, response.data);
                return {
                    data: response.data,
                    status: response.status
                };
            }

            // If response is not 200, try to get local data
            const localData = this.getLocalData(endpoint);
            if (localData) {
                console.log('Using local data for:', endpoint);
                return {
                    data: localData,
                    status: 200,
                    fromLocal: true
                };
            }

            return this.handleApiError(response);
        } catch (error) {
            console.error('GET request error:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.');
                this.handleAuthError();
                return null;
            }
            // On error, try to get local data
            const localData = this.getLocalData(endpoint);
            if (localData) {
                console.log('Using local data after error for:', endpoint);
                return {
                    data: localData,
                    status: 200,
                    fromLocal: true
                };
            }
            throw {
                message: 'Invalid request. Please check your input.',
                code: 'INVALID_REQUEST',
                originalError: error
            };
        }
    }

    async post(endpoint, data = {}) {
        try {
            const response = await this.instance.post(endpoint, data);
            return response;
        } catch (error) {
            throw this.handleApiError(error);
        }
    }

    async put(endpoint, data = {}) {
        try {
            const response = await this.instance.put(endpoint, data);
            return response;
        } catch (error) {
            throw this.handleApiError(error);
        }
    }

    async delete(endpoint) {
        try {
            const response = await this.instance.delete(endpoint);
            return response;
        } catch (error) {
            throw this.handleApiError(error);
        }
    }
*/
    // Utility to flatten nested object into URL parameters
    flattenObject(obj, urlParams, prefix = '') {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                const paramKey = prefix ? `${prefix}[${key}]` : key;

                if (value !== null && typeof value === 'object') {
                    if (Array.isArray(value)) {
                        value.forEach((item, index) => {
                            if (typeof item === 'object') {
                                this.flattenObject(item, urlParams, `${paramKey}[${index}]`);
                            } else {
                                urlParams.append(`${paramKey}[${index}]`, item);
                            }
                        });
                    } else {
                        this.flattenObject(value, urlParams, paramKey);
                    }
                } else {
                    urlParams.append(paramKey, value);
                }
            }
        }
    }

    // Cache management
    async getCachedResponse(url) {
        try {
            const cacheKey = this.generateCacheKey(url);
            const cachedData = localStorage.getItem(cacheKey);
            
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData);
                const now = Date.now();
                // Cache for 5 minutes
                if (now - timestamp < 5 * 60 * 1000) {
                    return { data, status: 200, fromCache: true };
                }
                localStorage.removeItem(cacheKey);
            }
            return null;
        } catch (error) {
            console.warn('Cache read error:', error);
            return null;
        }
    }

    async setCachedResponse(url, data) {
        try {
            const cacheKey = this.generateCacheKey(url);
            localStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Cache write error:', error);
        }
    }

    generateCacheKey(url) {
        // Remove API base URL and clean up the URL for caching
        const cleanUrl = url.replace(this.baseURL, '').replace(/^\/+/, '');
        return `magento_cache_${cleanUrl}`;
    }

    getLocalData(endpoint) {
        try {
            // Extract the entity type from the endpoint
            const entityType = endpoint.split('/')[1]; // e.g., 'products', 'orders', etc.
            const localDataMap = {
                products: productsData,
                orders: ordersData,
                customers: customersData,
                invoices: invoicesData,
                categories: categoryData
            };

            return localDataMap[entityType] || null;
        } catch (error) {
            console.error('Error getting local data:', error);
            return null;
        }
    }

    clearCache() {
        try {
            // Clear only Magento-related cache items
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('magento_cache_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    // Authentication
    async login(username, password, customBaseURL = null) {
        try {
            if (customBaseURL) {
                this.setBaseURL(customBaseURL);
            }
        
            const response = await this.post('/integration/admin/token', { username, password });
            if (response) {
                // Clear any existing cache when logging in
                this.clearCache();
                localStorage.setItem('adminToken', response);
                return response;
            }
            throw new Error('Invalid response from authentication server');
        } catch (error) {
            throw this.handleApiError(error);
        }
    }

    logout() {
        localStorage.removeItem('adminToken');
        toast.success('Logged out successfully');
    }

    // Token Management
    getToken() {
        return localStorage.getItem('adminToken');
    }

    setToken(token) {
        localStorage.setItem('adminToken', token);
    }

    // Base URL management
    setBaseURL(newBaseURL) {
        if (!newBaseURL) {
            throw new Error('Base URL cannot be empty');
        }
        this.baseURL = newBaseURL;
        this.instance.defaults.baseURL = newBaseURL;
    }

    getBaseURL() {
        return this.baseURL;
    }

    // Error Handler
    handleApiError(error) {
        console.error('API Error:', error);
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 400:
                    toast.error('Invalid request. Please check your input.');
                    break;
                case 401:
                    toast.error('Authentication failed. Please log in again.');
                    this.handleAuthError();
                    break;
                case 403:
                    toast.error('Access denied. You do not have permission to perform this action.');
                    break;
                case 404:
                    toast.error('Resource not found.');
                    break;
                case 500:
                    toast.error('Server error. Please try again later.');
                    break;
                default:
                    toast.error('An error occurred. Please try again.');
            }

            throw {
                message: data.message || 'An error occurred',
                code: data.code || 'API_ERROR',
                originalError: error
            };
        } else if (error.request) {
            // The request was made but no response was received
            toast.error('No response from server. Please check your connection.');
            throw {
                message: 'No response from server',
                code: 'NETWORK_ERROR',
                originalError: error
            };
        } else {
            // Something happened in setting up the request that triggered an Error
            toast.error('Request configuration error.');
            throw {
                message: error.message || 'Request setup error',
                code: 'REQUEST_ERROR',
                originalError: error
            };
        }
    }

    handleAuthError() {
        //localStorage.removeItem('adminToken');
        //localStorage.removeItem('user');
        //window.location.href = '/login';
    }

    async getProducts({ currentPage = 1, pageSize = 20, sortOrders = [], filters = [] } = {}) {
        try {
            // Build query parameters
            const params = {
                currentPage,
                pageSize,
            };

            // Add sort orders if any
            if (sortOrders.length > 0) {
                params.sortOrders = JSON.stringify(sortOrders);
            }

            // Add filters if any
            if (filters.length > 0) {
                params.filters = JSON.stringify(filters);
            }

            const response = await this.get('/products', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }
}

// Create and export a single instance
const magentoService = new MagentoService();
export default magentoService;