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
            
            // Convert searchCriteria object to URL parameters
            let url = endpoint;
            if (params.searchCriteria) {
                const queryParams = new URLSearchParams();
                this.flattenObject(params.searchCriteria, queryParams, 'searchCriteria');
                url += `?${queryParams.toString()}`;
            }

            const response = await this.instance.get(url);
            console.log('GET response:', response);
            
            if (response?.status === 200) {
                return {
                    data: response.data,
                    status: response.status
                };
            }
            return this.handleApiError(response);
            //throw new Error('Request failed');
        } catch (error) {
            console.error('GET request error:', error);
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

    // Authentication
    async login(username, password) {
        try {
            const response = await this.post('/integration/admin/token', { username, password });
            if (response.data) {
                this.setToken(response.data);
                return response.data;
            }
            throw new Error('Login failed: No token received');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
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

    // Error Handler
    handleApiError(error) {
        console.log('Handling API error:', error);
        let errorMessage = 'An unexpected error occurred';

        if (error.response) {
            const { status, data } = error.response;
            console.log('Error response status:', status);

            switch (status) {
                case 400:
                    errorMessage = data.message || 'Invalid request';
                    break;
                case 401:
                    toast.warn('Authentication required. Using local data.');
                    return this.handleApi401Error(error);
                case 403:
                    errorMessage = 'Access forbidden';
                    break;
                case 404:
                    errorMessage = 'Resource not found';
                    break;
                case 500:
                    errorMessage = 'Internal server error';
                    break;
                default:
                    errorMessage = data.message || 'Server error';
            }
        } else if (error.request) {
            console.log('No response received from server');
            errorMessage = 'No response from server';
        }

        console.error('API Error:', errorMessage);
        toast.error(errorMessage);

        // Return null to trigger local data fallback
        return null;
    }

    // Error handling function with fallback to local data
    handleApi401Error = async (error) => {
        console.log('Handling 401 error with local data fallback');
        let entityType;
        const url = error.config?.url || '';

        if (url.includes('orders')) {
            entityType = 'orders';
        } else if (url.includes('products')) {
            entityType = 'products';
        } else if (url.includes('customers')) {
            entityType = 'customers';
        } else if (url.includes('invoice')) {
            entityType = 'invoices';
        } else if (url.includes('categories')) {
            entityType = 'categories';
        }

        console.log('Entity type for local data:', entityType);
        const localData = this.getLocalData(entityType);
        console.log('Retrieved local data:', localData);

        return {
            data: {
                items: localData,
                total_count: localData.length,
                search_criteria: {}
            }
        };
    };

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