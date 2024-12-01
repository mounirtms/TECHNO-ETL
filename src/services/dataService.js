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
  const { 
    pageSize = 10, 
    currentPage = 1, 
    sortField = 'created_at', 
    sortDirection = 'DESC' 
  } = params;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const sortedData = data.sort((a, b) => { //... (same sorting logic)
  });

  return {
    data: sortedData.slice(startIndex, endIndex),
    total: data.length,  // Total count
    page: currentPage,
    pageSize: pageSize
  };
};
class DataService {
  /**
   * Get orders with optional pagination and filtering
   * @param {Object} params - Pagination and filter parameters
   * @returns {Promise<Object>} Paginated orders data
   */




static async getOrders(params = {}) {
  return paginateAndSort(ordersData, params);
}
 

  /**
   * Get customers with optional pagination and filtering
   * @param {Object} params - Pagination and filter parameters
   * @returns {Promise<Object>} Paginated customers data
   */
  static async getCustomers(params = {}) {
    return paginateAndSort(ordersData, params);
  }

  /**
   * Get invoices with optional pagination and filtering
   * @param {Object} params - Pagination and filter parameters
   * @returns {Promise<Object>} Paginated invoices data
   */
  static async getInvoices(params = {}) {
    return paginateAndSort(ordersData, params);
  }

  /**
   * Get products with optional pagination and filtering
   * @param {Object} params - Pagination and filter parameters
   * @returns {Promise<Object>} Paginated products data
   */
  static async getProducts(params = {}) {
    return paginateAndSort(ordersData, params);
  };
  /**
   * Get category tree
   * @returns {Promise<Array>} Category tree data
   */
  static async getCategoryTree() {
    return categoriesData;
  }

  /**
   * Get sales rules
   * @returns {Promise<Array>} Sales rules data
   */
  static async getSalesRules() {
    return salesRulesData;
  }
}

export default DataService;
