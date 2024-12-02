import { getToken, logout } from './magentoService';

const API_URL = import.meta.env.VITE_MAGENTO_API_URL;

const DEFAULT_PARAMS = {
  pageSize: 10,
  currentPage: 1,
  sortOrders: [
    { field: 'created_at', direction: 'DESC' }
  ]
};

class MagentoApi {
  async request(endpoint, options = {}) {
    const token = getToken();
    if (!token) {
      logout(); // Clear any invalid token
      throw new Error('Authentication required');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.trim()}`,
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        logout(); // Clear invalid token
        throw new Error('Authentication expired. Please login again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for endpoint ${endpoint}:`, error);
      throw error;
    }
  }

  buildSearchCriteria(params = {}) {
    const searchParams = new URLSearchParams();
    const mergedParams = {
      ...DEFAULT_PARAMS,
      ...params
    };

    // Page size and current page
    searchParams.append('searchCriteria[pageSize]', mergedParams.pageSize);
    searchParams.append('searchCriteria[currentPage]', mergedParams.currentPage);

    // Sort orders
    if (mergedParams.sortOrders?.length > 0) {
      mergedParams.sortOrders.forEach((sort, index) => {
        searchParams.append(`searchCriteria[sortOrders][${index}][field]`, sort.field);
        searchParams.append(`searchCriteria[sortOrders][${index}][direction]`, sort.direction);
      });
    }

    return searchParams.toString();
  }

  async getProducts(params) {
    const searchCriteria = this.buildSearchCriteria(params);
    return this.request(`/products?${searchCriteria}`);
  }

  async getCustomers(params) {
    const searchCriteria = this.buildSearchCriteria(params);
    return this.request(`/customers/search?${searchCriteria}`);
  }

  async getOrders(params) {
    const searchCriteria = this.buildSearchCriteria(params);
    return this.request(`/orders?${searchCriteria}`);
  }

  async getInvoices(params) {
    const searchCriteria = this.buildSearchCriteria(params);
    return this.request(`/invoices?${searchCriteria}`);
  }

  async getOrderDetails(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  async getCustomerDetails(customerId) {
    return this.request(`/customers/${customerId}`);
  }
}

export default new MagentoApi();
