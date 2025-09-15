/**
 * Dashboard API Service
 * Handles all dashboard-related API calls with caching and error handling
 */

import axios from 'axios';
import { getApiUrl } from '../config/api';
import { logger } from '../utils/logger';

class DashboardApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get API URL with base path
   * @param {string} endpoint - API endpoint
   * @returns {string} Full API URL
   */
  getApiUrl(endpoint) {
    return `${getApiUrl()}${endpoint}`;
  }

  /**
   * Make API call with error handling
   * @param {string} endpoint - API endpoint
   * @param {object} options - Axios options
   * @returns {Promise<object>} API response data
   */
  async apiCall(endpoint, options = {}) {
    try {
      const url = this.getApiUrl(endpoint);
      const response = await axios({
        url,
        ...options,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'API call failed');
      }

      return response.data.data;
    } catch (error) {
      logger.error(`Dashboard API error: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Make cached API call
   * @param {string} endpoint - API endpoint
   * @param {object} options - Axios options
   * @returns {Promise<object>} Cached or fresh API response data
   */
  async cachedApiCall(endpoint, options = {}) {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const data = await this.apiCall(endpoint, options);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      // If we have cached data, return it even if stale
      if (cached) {
        console.warn(`Using stale cache for ${endpoint}:`, error.message);
        return cached.data;
      }
      
      throw error;
    }
  }

  /**
   * Clear cache for an endpoint or all endpoints
   * @param {string} endpoint - Specific endpoint to clear, or null to clear all
   */
  clearCache(endpoint = null) {
    if (endpoint) {
      this.cache.delete(endpoint);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get products statistics from local dashboard endpoint
   * @returns {Promise<object>} Product statistics
   */
  async getProductsStats() {
    return this.cachedApiCall('/dashboard/products/stats');
  }

  /**
   * Get brands distribution from local dashboard endpoint
   * @returns {Promise<object>} Brands distribution
   */
  async getBrandsDistribution() {
    return this.cachedApiCall('/dashboard/brands/distribution');
  }

  /**
   * Get sales performance from local dashboard endpoint
   * @returns {Promise<object>} Sales performance metrics
   */
  async getSalesPerformance() {
    return this.cachedApiCall('/dashboard/sales/performance');
  }

  /**
   * Get inventory status from local dashboard endpoint
   * @returns {Promise<object>} Inventory status
   */
  async getInventoryStatus() {
    return this.cachedApiCall('/dashboard/inventory/status');
  }

  /**
   * Get categories distribution from local dashboard endpoint
   * @returns {Promise<object>} Categories distribution
   */
  async getCategoriesDistribution() {
    return this.cachedApiCall('/dashboard/categories/distribution');
  }

  /**
   * Get products attributes from local dashboard endpoint
   * @returns {Promise<object>} Products attributes analysis
   */
  async getProductsAttributes() {
    return this.cachedApiCall('/dashboard/products/attributes');
  }

  /**
   * Get overall dashboard stats
   * @returns {Promise<object>} Dashboard statistics
   */
  async getDashboardStats() {
    return this.cachedApiCall('/dashboard/stats');
  }

  /**
   * Get all dashboard metrics in one call
   * @returns {Promise<object>} All dashboard metrics
   */
  async getAllDashboardMetrics() {
    try {
      const [
        productsStats,
        brandsDistribution,
        salesPerformance,
        inventoryStatus,
        categoriesDistribution,
        productsAttributes
      ] = await Promise.allSettled([
        this.getProductsStats(),
        this.getBrandsDistribution(),
        this.getSalesPerformance(),
        this.getInventoryStatus(),
        this.getCategoriesDistribution(),
        this.getProductsAttributes()
      ]);

      return {
        success: true,
        data: {
          products: productsStats.status === 'fulfilled' ? productsStats.value : null,
          brands: brandsDistribution.status === 'fulfilled' ? brandsDistribution.value : null,
          sales: salesPerformance.status === 'fulfilled' ? salesPerformance.value : null,
          inventory: inventoryStatus.status === 'fulfilled' ? inventoryStatus.value : null,
          categories: categoriesDistribution.status === 'fulfilled' ? categoriesDistribution.value : null,
          attributes: productsAttributes.status === 'fulfilled' ? productsAttributes.value : null,
        },
        errors: {
          products: productsStats.status === 'rejected' ? productsStats.reason.message : null,
          brands: brandsDistribution.status === 'rejected' ? brandsDistribution.reason.message : null,
          sales: salesPerformance.status === 'rejected' ? salesPerformance.reason.message : null,
          inventory: inventoryStatus.status === 'rejected' ? inventoryStatus.reason.message : null,
          categories: categoriesDistribution.status === 'rejected' ? categoriesDistribution.reason.message : null,
          attributes: productsAttributes.status === 'rejected' ? productsAttributes.reason.message : null,
        },
      };
    } catch (error) {
      logger.error('Dashboard metrics error', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new DashboardApiService();
