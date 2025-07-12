// Local development data imports
import ordersData from '../assets/data/orders.json';
import customersData from '../assets/data/customers.json';
import invoicesData from '../assets/data/invoices.json';
import productsData from '../assets/data/products.json';
import categoriesData from '../assets/data/category.json';
import salesRulesData from '../assets/data/salesRules.json';

/**
 * Data Service for Local Development
 * 
 * Features:
 * - Provides mock data for development
 * - Simulates API-like data retrieval
 * - Supports pagination and filtering
 */

const paginateAndSort = (data, params = {}) => {  // Utility function
  try {
    const { 
      pageSize = 10, 
      currentPage = 1, 
      sortField = 'created_at', 
      sortDirection = 'DESC' 
    } = params;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const sortedData = [...data].sort((a, b) => {
      if (!a[sortField] || !b[sortField]) return 0;
      if (sortDirection === 'DESC') {
        return a[sortField] < b[sortField] ? 1 : -1;
      } else {
        return a[sortField] > b[sortField] ? 1 : -1;
      }
    });

    return {
      data: sortedData.slice(startIndex, endIndex),
      total: data.length,  // Total count
      page: currentPage,
      pageSize: pageSize
    };
  } catch (err) {
    console.error('paginateAndSort error:', err);
    return { data: [], total: 0, page: 1, pageSize: 10 };
  }
};
class DataService {
  /**
   * Get orders with optional pagination and filtering
   * @param {Object} params - Pagination and filter parameters
   * @returns {Promise<Object>} Paginated orders data
   */




  static async getOrders(params = {}) {
    try {
      return paginateAndSort(ordersData, params);
    } catch (err) {
      console.error('getOrders error:', err);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  }
 

  /**
   * Get customers with optional pagination and filtering
   * @param {Object} params - Pagination and filter parameters
   * @returns {Promise<Object>} Paginated customers data
   */
  static async getCustomers(params = {}) {
    try {
      return paginateAndSort(customersData, params);
    } catch (err) {
      console.error('getCustomers error:', err);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  }

  /**
   * Get invoices with optional pagination and filtering
   * @param {Object} params - Pagination and filter parameters
   * @returns {Promise<Object>} Paginated invoices data
   */
  static async getInvoices(params = {}) {
    try {
      return paginateAndSort(invoicesData, params);
    } catch (err) {
      console.error('getInvoices error:', err);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  }

  /**
   * Get products with optional pagination and filtering
   * @param {Object} params - Pagination and filter parameters
   * @returns {Promise<Object>} Paginated products data
   */
  static async getProducts(params = {}) {
    try {
      return paginateAndSort(productsData, params);
    } catch (err) {
      console.error('getProducts error:', err);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  }
  /**
   * Get category tree
   * @returns {Promise<Array>} Category tree data
   */
  static async getCategoryTree() {
    try {
      return categoriesData;
    } catch (err) {
      console.error('getCategoryTree error:', err);
      return [];
    }
  }

  /**
   * Get sales rules
   * @returns {Promise<Array>} Sales rules data
   */
  static async getSalesRules() {
    try {
      return salesRulesData;
    } catch (err) {
      console.error('getSalesRules error:', err);
      return [];
    }
  }
}

export default DataService;
