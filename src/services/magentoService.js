import axios from 'axios';
import { toast } from 'react-toastify';

class MagentoApi {
    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_MAGENTO_API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor
        this.api.interceptors.request.use(
            (config) => {
                const adminToken = localStorage.getItem('adminToken');
                if (adminToken) {
                    config.headers['Authorization'] = `Bearer ${adminToken}`;
                }
                // Add CORS headers
                config.headers['Access-Control-Allow-Origin'] = '*';
                config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
                config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    switch (error.response.status) {
                        case 401:
                            localStorage.removeItem('adminToken');
                            toast.error('Authentication failed. Please log in again.');
                            break;
                        case 403:
                            toast.error('Access denied. Insufficient permissions.');
                            break;
                        default:
                            toast.error('An error occurred while processing your request.');
                    }
                } else if (error.request) {
                    toast.error('Network error. Please check your connection.');
                }
                return Promise.reject(error);
            }
        );
    }

    // Authentication
    async login(username, password) {
        try {
            const response = await this.api.post('/V1/integration/admin/token', {
                username,
                password
            });

            const token = response.data;
            localStorage.setItem('adminToken', token);
            toast.success('Successfully logged in to Magento');
            return token;
        } catch (error) {
            console.error('Magento login error:', error);
            toast.error('Failed to log in to Magento');
            throw error;
        }
    }

    async logout() {
        try {
            localStorage.removeItem('adminToken');
            toast.success('Successfully logged out');
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to log out');
            throw error;
        }
    }

    // Generic data fetching
    async fetchData(endpoint, method = 'GET', data = null) {
        try {
            const config = {
                method,
                url: endpoint,
                data: method !== 'GET' ? data : undefined,
                params: method === 'GET' ? data : undefined
            };

            const response = await this.api(config);
            return response.data;
        } catch (error) {
            console.error('Error fetching Magento data:', error);
            throw error;
        }
    }

    // Catalog endpoints
    async getProducts(searchCriteria = {}) {
        return this.fetchData('/V1/products', 'GET', { searchCriteria });
    }

    async getProduct(sku) {
        return this.fetchData(`/V1/products/${encodeURIComponent(sku)}`);
    }

    async getCategories() {
        return this.fetchData('/V1/categories');
    }

    async getCategory(categoryId) {
        return this.fetchData(`/V1/categories/${categoryId}`);
    }

    // Order endpoints
    async getOrders(searchCriteria = {}) {
        return this.fetchData('/V1/orders', 'GET', { searchCriteria });
    }

    async getOrder(orderId) {
        return this.fetchData(`/V1/orders/${orderId}`);
    }

    async shipOrder(orderId, items, notify = true) {
        return this.fetchData(`/V1/order/${orderId}/ship`, 'POST', {
            items,
            notify
        });
    }

    // Customer endpoints
    async getCustomers(searchCriteria = {}) {
        return this.fetchData('/V1/customers/search', 'GET', { searchCriteria });
    }

    async getCustomer(customerId) {
        return this.fetchData(`/V1/customers/${customerId}`);
    }

    async createCustomer(customerData) {
        return this.fetchData('/V1/customers', 'POST', { customer: customerData });
    }

    // Inventory endpoints
    async getStockItems(searchCriteria = {}) {
        return this.fetchData('/V1/stockItems', 'GET', { searchCriteria });
    }

    async updateStockItem(productSku, stockItem) {
        return this.fetchData(`/V1/products/${encodeURIComponent(productSku)}/stockItems/${stockItem.item_id}`, 'PUT', stockItem);
    }

    // Sales endpoints
    async getInvoices(searchCriteria = {}) {
        return this.fetchData('/V1/invoices', 'GET', { searchCriteria });
    }

    async getShipments(searchCriteria = {}) {
        return this.fetchData('/V1/shipments', 'GET', { searchCriteria });
    }

    // Cache management
    async cleanCache(types = ['full_page']) {
        return this.fetchData('/V1/cacheType/clean', 'POST', { types });
    }
}

const magentoApi = new MagentoApi();
export default magentoApi;

// Export individual methods for convenience
export const {
    login, logout, fetchData,
    getProducts, getProduct, getCategories, getCategory,
    getOrders, getOrder, shipOrder,
    getCustomers, getCustomer, createCustomer,
    getStockItems, updateStockItem,
    getInvoices, getShipments,
    cleanCache
} = magentoApi;