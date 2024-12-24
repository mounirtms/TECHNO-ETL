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
            if (params.searchCriteria) {
                const queryParams = new URLSearchParams();
                this.flattenObject(params.searchCriteria, queryParams, 'searchCriteria');
                url += `?${queryParams.toString()}`;
            }

            const cachedResponse = await this.getCachedResponse({ method: 'GET', url, params });
            if (cachedResponse) {
                return cachedResponse;
            }

            const response = await this.instance.get(url);
            console.log('GET response:', response);
            
            if (response?.status === 200) {
                await this.setCachedResponse({ method: 'GET', url, params }, response.data);
                return {
                    data: response.data,
                    status: response.status
                };
            }
            return this.handleApiError(response);
        } catch (error) {
            console.error('GET request error:', error);
            // If there's a quota exceeded error or any other cache error, use local fallback data
            const fallbackData = this.getLocalFallbackData(endpoint);
            if (fallbackData) {
                console.log('Using local fallback data for:', endpoint);
                return {
                    data: fallbackData,
                    status: 200,
                    fromFallback: true
                };
            }
            return this.handleApiError(error);
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

    // Get local fallback data based on endpoint
    getLocalFallbackData(endpoint) {
        if (endpoint.includes('/customers')) return customersData;
        if (endpoint.includes('/products')) return productsData;
        if (endpoint.includes('/orders')) return ordersData;
        if (endpoint.includes('/invoices')) return invoicesData;
        if (endpoint.includes('/categories')) return categoryData;
        return null;
    }

    // Authentication
    async login(username, password, customBaseURL = null) {
        try {
            if (customBaseURL) {
                this.setBaseURL(customBaseURL);
            }
            
            const response = await this.post('/integration/admin/token', { username, password });
            if (response.data) {
                localStorage.setItem('adminToken', response.data);
                // Clear any existing cache when logging in
                this.clearCache();
                return response.data;
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

    // Cache management
    async getCachedResponse(config) {
        try {
            const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
            const cache = await caches.open('magento-api-cache');
            const cachedResponse = await cache.match(cacheKey);
            
            if (cachedResponse) {
                const { data, timestamp } = await cachedResponse.json();
                const now = Date.now();
                if (now - timestamp < 5 * 60 * 1000) { // 5 minutes cache
                    return { data, status: 200, fromCache: true };
                }
                await cache.delete(cacheKey); // Remove expired cache
            }
            return null;
        } catch (error) {
            console.warn('Cache read error:', error);
            return null;
        }
    }

    async setCachedResponse(config, data) {
        try {
            const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
            const cache = await caches.open('magento-api-cache');
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            await cache.put(cacheKey, new Response(JSON.stringify(cacheData)));
        } catch (error) {
            console.warn('Cache write error:', error);
        }
    }

    clearCache() {
        Object.keys(localStorage).forEach(key => {
            if (key.includes(':')) { // Only clear API cache entries
                localStorage.removeItem(key);
            }
        });
    }

    // Error Handler
    handleApiError(error) {
        let errorMessage = 'An unexpected error occurred';
        let errorCode = 'UNKNOWN_ERROR';

        if (error.response) {
            const { status, data } = error.response;
            switch (status) {
                case 400:
                    errorMessage = 'Invalid request. Please check your input.';
                    errorCode = 'INVALID_REQUEST';
                    break;
                case 401:
                    errorMessage = 'Authentication failed. Please log in again.';
                    errorCode = 'AUTH_ERROR';
                    this.handleAuthError();
                    break;
                case 403:
                    errorMessage = 'You do not have permission to perform this action.';
                    errorCode = 'PERMISSION_ERROR';
                    break;
                case 404:
                    errorMessage = 'The requested resource was not found.';
                    errorCode = 'NOT_FOUND';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please try again later.';
                    errorCode = 'RATE_LIMIT';
                    break;
                case 500:
                    errorMessage = 'Server error. Please try again later.';
                    errorCode = 'SERVER_ERROR';
                    break;
                default:
                    errorMessage = data?.message || 'An error occurred with the request.';
                    errorCode = `HTTP_${status}`;
            }
        } else if (error.request) {
            errorMessage = 'Network error. Please check your connection.';
            errorCode = 'NETWORK_ERROR';
        }

        toast.error(errorMessage);
        return Promise.reject({ message: errorMessage, code: errorCode, originalError: error });
    }

    handleAuthError() {
        //localStorage.removeItem('adminToken');
        //localStorage.removeItem('user');
        //window.location.href = '/login';
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
    }
}

// Create and export a single instance
const magentoService = new MagentoService();
export default magentoService;