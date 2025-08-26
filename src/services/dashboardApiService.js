/**
 * Dashboard API Service for TECHNO-ETL
 * 
 * This service provides optimized API calls for dashboard statistics 
 * using local cached endpoints instead of hitting Magento directly.
 * 
 * Features:
 * - Local cache-first strategy
 * - Intelligent retry logic
 * - Performance monitoring
 * - Error resilience
 */

import { BaseApiService } from './BaseApiService';

class DashboardApiService extends BaseApiService {
    constructor() {
        super();
        this.baseUrl = this.getBaseUrl();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    getBaseUrl() {
        // Use the backend API URL, fallback to localhost if not configured
        return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    }

    /**
     * Generic cached API call
     * @param {string} endpoint - API endpoint 
     * @param {object} options - Request options
     * @returns {Promise<object>} API response
     */
    async cachedApiCall(endpoint, options = {}) {
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log(`📊 Cache hit for ${endpoint}`);
            return {
                ...cached.data,
                cached: true,
                cacheAge: Date.now() - cached.timestamp
            };
        }

        try {
            console.log(`📡 API call to ${endpoint}`);
            const response = await this.makeRequest(`/dashboard${endpoint}`, {
                method: 'GET',
                ...options
            });

            // Cache successful response
            this.cache.set(cacheKey, {
                data: response,
                timestamp: Date.now()
            });

            return {
                ...response,
                cached: false
            };
        } catch (error) {
            // Return cached data if available during error
            if (cached) {
                console.warn(`🔄 Using stale cache for ${endpoint} due to error:`, error.message);
                return {
                    ...cached.data,
                    cached: true,
                    stale: true,
                    error: error.message
                };
            }
            throw error;
        }
    }

    /**
     * Get products statistics from local dashboard endpoint
     * @returns {Promise<object>} Products statistics
     */
    async getProductsStats() {
        return this.cachedApiCall('/products/stats');
    }

    /**
     * Get brands distribution from local dashboard endpoint
     * @returns {Promise<object>} Brands distribution
     */
    async getBrandsDistribution() {
        return this.cachedApiCall('/brands/distribution');
    }

    /**
     * Get sales performance from local dashboard endpoint
     * @returns {Promise<object>} Sales performance metrics
     */
    async getSalesPerformance() {
        return this.cachedApiCall('/sales/performance');
    }

    /**
     * Get inventory status from local dashboard endpoint
     * @returns {Promise<object>} Inventory status
     */
    async getInventoryStatus() {
        return this.cachedApiCall('/inventory/status');
    }

    /**
     * Get categories distribution from local dashboard endpoint
     * @returns {Promise<object>} Categories distribution
     */
    async getCategoriesDistribution() {
        return this.cachedApiCall('/categories/distribution');
    }

    /**
     * Get products attributes from local dashboard endpoint
     * @returns {Promise<object>} Products attributes analysis
     */
    async getProductsAttributes() {
        return this.cachedApiCall('/products/attributes');
    }

    /**
     * Get overall dashboard stats
     * @returns {Promise<object>} Dashboard statistics
     */
    async getDashboardStats() {
        return this.cachedApiCall('/stats');
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
                    attributes: productsAttributes.status === 'fulfilled' ? productsAttributes.value : null
                },
                errors: {
                    products: productsStats.status === 'rejected' ? productsStats.reason.message : null,
                    brands: brandsDistribution.status === 'rejected' ? brandsDistribution.reason.message : null,
                    sales: salesPerformance.status === 'rejected' ? salesPerformance.reason.message : null,
                    inventory: inventoryStatus.status === 'rejected' ? inventoryStatus.reason.message : null,
                    categories: categoriesDistribution.status === 'rejected' ? categoriesDistribution.reason.message : null,
                    attributes: productsAttributes.status === 'rejected' ? productsAttributes.reason.message : null
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching dashboard metrics:', error);
            throw error;
        }
    }

    /**
     * Clear cache for specific endpoint or all cache
     * @param {string} endpoint - Specific endpoint to clear (optional)
     */
    clearCache(endpoint = null) {
        if (endpoint) {
            // Clear cache entries that match the endpoint
            const keysToDelete = [];
            for (const key of this.cache.keys()) {
                if (key.includes(endpoint)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.cache.delete(key));
            console.log(`🧹 Cleared cache for ${endpoint}`);
        } else {
            this.cache.clear();
            console.log('🧹 Cleared all dashboard API cache');
        }
    }

    /**
     * Get cache statistics
     * @returns {object} Cache statistics
     */
    getCacheStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;

        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp < this.cacheTimeout) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries,
            expiredEntries,
            cacheTimeoutMs: this.cacheTimeout
        };
    }

    /**
     * Cleanup expired cache entries
     */
    cleanupExpiredCache() {
        const now = Date.now();
        const keysToDelete = [];

        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp >= this.cacheTimeout) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
        
        if (keysToDelete.length > 0) {
            console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`);
        }
    }
}

// Create and export singleton instance
const dashboardApiService = new DashboardApiService();

// Setup automatic cache cleanup every 10 minutes
setInterval(() => {
    dashboardApiService.cleanupExpiredCache();
}, 10 * 60 * 1000);

export default dashboardApiService;

// Export individual methods for convenience
export const {
    getProductsStats,
    getBrandsDistribution,
    getSalesPerformance,
    getInventoryStatus,
    getCategoriesDistribution,
    getProductsAttributes,
    getDashboardStats,
    getAllDashboardMetrics,
    clearCache,
    getCacheStats
} = dashboardApiService;
