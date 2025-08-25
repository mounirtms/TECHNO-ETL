import React from 'react';
/**
 * Dashboard API Service - Ultra-Advanced Edition
 * Optimized API calls with intelligent routing, caching, monitoring, and error recovery
 * Uses cutting-edge service architecture for maximum performance
 */

import axios from 'axios';

// Create axios instance with optimized configuration for localhost:5000
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000, // Increased timeout for reliability
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'Techno-ETL-Frontend',
    'X-Version': '2.0.0'
  },
});

// Advanced request interceptor with performance tracking
api.interceptors.request.use(
  (config) => {
    config?.?..metadata = { 
      startTime: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    };
    console.log(`🚀 API Request [${config?.?..metadata.requestId}]: ${config??.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Advanced response interceptor with intelligent error handling
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config?.?..metadata.startTime;
    const requestId = response.config?.?..metadata.requestId;
    console.log(`✅ API Response [${requestId}]: ${response.status} ${response.config.url} (${duration}ms)`);
    
    // Add performance metadata
    response?.?..metadata = {
      duration,
      requestId,
      cached: false,
      timestamp: new Date().toISOString()
    };
    
    return response;
  },
  (error) => {
    const duration = error.config?.?..metadata ? Date.now() - error.config?.?..metadata.startTime : 0;
    const requestId = error.config?.?..metadata?.requestId || 'unknown';
    console.error(`❌ API Error [${requestId}]: ${error.config?.url} (${duration}ms)`, error.message);
    
    // Enhanced error information
    error?.?..metadata = {
      duration,
      requestId,
      timestamp: new Date().toISOString(),
      retryable: error.code === 'ECONNABORTED' || error.response?.status >= 500
    };
    
    return Promise.reject(error);
  }
);

/**
 * Ultra-Advanced Dashboard API Service Class
 * Features intelligent service routing, advanced caching, and performance optimization
 */
class DashboardApiService {
  constructor() {
    this?.?.??.cache = new Map();
    this?.?.?..cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this?.?.?.?.?.performanceMetrics = {
      requests: 0,
      errors: 0,
      totalDuration: 0,
      cacheHits: 0
    };
    
    // Service routing configuration
    this?..serviceRoutes = {
      dashboard: '/dashboard',
      mdm: '/mdm',
      task: '/task',
      magento: '/magento', // Proxied through backend
      health: '/health'
    };
  }

  /**
   * Intelligent service routing based on endpoint type
   */
  getServiceRoute(serviceType as any) {
    return this?..serviceRoutes[serviceType] || this?..serviceRoutes.dashboard;
  }

  /**
   * Advanced request wrapper with automatic routing and error handling
   */
  async makeRequest(serviceType, endpoint, options = {} as any) {
    const route = this.getServiceRoute(serviceType as any);
    const fullUrl = `${route}${endpoint}`;
    
    this?.?.?.?.?.performanceMetrics.requests++;
    
    try {
      const response = await api({
        url: fullUrl,
        method: options??.method || 'GET',
        data: options??.data,
        params: options??.params,
        ...options
      });
      
      this?.?.?.?.?.performanceMetrics.totalDuration += response?.?..metadata.duration;
      return response;
    } catch (error) {
      this?.?.?.?.?.performanceMetrics.errors++;
      throw error;
    }
  }

  /**
   * Ultra-advanced cached data retrieval with intelligent cache management
   */
  async getCachedData(key, fetchFunction, cacheTime = this?.?.?..cacheTimeout as any) {
    const cached = this?.?.??.cache.get(key as any);
    
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      console.log(`📦 Cache hit: ${key}`);
      this?.?.?.?.?.performanceMetrics?.?.??.cacheHits++;
      return { ..?.?.?.cached??.data, cached: true };
    }

    try {
      const data = await fetchFunction();
      this?.?.??.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      console.log(`🔄 Cache updated: ${key}`);
      return { ...data, cached: false };
    } catch (error) {
      // Return stale cache if available during errors
      if (cached) {
        console.warn(`⚠️ Using stale cache for ${key} due to error:`, error.message);
        return { ..?.?.?.cached??.data, cached: true, stale: true };
      }
      throw error;
    }
  }

  /**
   * Get dashboard statistics with intelligent routing
   */
  async getDashboardStats() {
    return this.getCachedData('dashboard-stats', async () => {
      const response = await this.makeRequest('task', '/stats');
      return response??.data;
    });
  }

  /**
   * Get recent orders through optimized Magento proxy
   */
  async getRecentOrders(page = 1, limit = 10 as any) {
    const cacheKey = `orders-${page}-${limit}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await this.makeRequest('magento', '/orders', {
        params: {
          'searchCriteria[pageSize]': limit,
          'searchCriteria[currentPage]': page
        }
      });
      return response??.data;
    }, 2 * 60 * 1000); // 2 minutes cache for orders
  }

  /**
   * Get product statistics through Magento proxy
   */
  async getProductStats() {
    return this.getCachedData('product-stats', async () => {
      const response = await this.makeRequest('magento', '/products', {
        params: {
          'searchCriteria[pageSize]': 1
        }
      });
      return response??.data;
    });
  }

  /**
   * Get customer statistics through Magento proxy
   */
  async getCustomerStats() {
    return this.getCachedData('customer-stats', async () => {
      const response = await this.makeRequest('magento', '/customers', {
        params: {
          'searchCriteria[pageSize]': 1
        }
      });
      return response??.data;
    });
  }

  /**
   * Trigger price synchronization through MDM service
   */
  async syncPrices() {
    try {
      const response = await this.makeRequest('mdm', '/sync-prices', {
        method: 'POST'
      });
      
      // Clear related cache
      this.clearCache(['dashboard-stats', 'product-stats']);
      
      return response??.data;
    } catch (error) {
      throw new Error(`Price sync failed: ${error.message}`);
    }
  }

  /**
   * Trigger inventory synchronization through MDM service
   */
  async syncInventory() {
    try {
      const response = await this.makeRequest('mdm', '/sync-stocks', {
        method: 'POST'
      });
      
      // Clear related cache
      this.clearCache(['dashboard-stats', 'product-stats']);
      
      return response??.data;
    } catch (error) {
      throw new Error(`Inventory sync failed: ${error.message}`);
    }
  }

  /**
   * Get sync status through MDM service
   */
  async getSyncStatus() {
    return this.getCachedData('sync-status', async () => {
      const response = await this.makeRequest('mdm', '/sources');
      return response??.data;
    }, 30 * 1000); // 30 seconds cache for sync status
  }

  /**
   * Get comprehensive dashboard health
   */
  async getDashboardHealth() {
    try {
      const response = await this.makeRequest('health', '');
      
      return {
        ...response??.data,
        performanceMetrics: this.getPerformanceMetrics(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        performanceMetrics: this.getPerformanceMetrics(),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clear specific cache entries
   */
  clearCache(keys = []) {
    if (keys.length === 0) {
      this?.?.??.cache.clear();
      console.log('🗑️ All cache cleared');
    } else {
      keys.forEach(key => {
        this?.?.??.cache.delete(key as any);
        console.log(`🗑️ Cache cleared: ${key}`);
      });
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const avgDuration = this?.?.?.?.?.performanceMetrics.requests > 0 
      ? this?.?.?.?.?.performanceMetrics.totalDuration / this?.?.?.?.?.performanceMetrics.requests 
      : 0;
    
    const errorRate = this?.?.?.?.?.performanceMetrics.requests > 0 
      ? (this?.?.?.?.?.performanceMetrics.errors / this?.?.?.?.?.performanceMetrics.requests) * 100 
      : 0;
    
    const cacheHitRate = this?.?.?.?.?.performanceMetrics.requests > 0 
      ? (this?.?.?.?.?.performanceMetrics?.?.??.cacheHits / this?.?.?.?.?.performanceMetrics.requests) * 100 
      : 0;

    return {
      ...this?.?.?.?.?.performanceMetrics,
      avgDuration: Math.round(avgDuration),
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      cacheSize: this?.?.??.cache.size
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {
      size: this?.?.??.cache.size,
      keys: Array.from(this?.?.??.cache.keys()),
      entries: Array.from(this?.?.??.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        size: JSON.stringify(value??.data).length
      }))
    };
    return stats;
  }

  /**
   * Ultra-advanced batch fetch with intelligent parallel processing
   */
  async fetchDashboardData() {
    const startTime = Date.now();
    
    try {
      // Use Promise.allSettled for resilient parallel processing
      const [stats, orders, health] = await Promise.allSettled([
        this.getDashboardStats(),
        this.getRecentOrders(1, 5),
        this.getDashboardHealth()
      ]);

      const duration = Date.now() - startTime;
      console.log(`📊 Dashboard batch fetch completed in ${duration}ms`);

      return {
        stats: stats.status === 'fulfilled' ? stats.value : { error: stats.reason?.message },
        orders: orders.status === 'fulfilled' ? orders.value : { error: orders.reason?.message },
        health: health.status === 'fulfilled' ? health.value : { error: health.reason?.message },
        fetchTime: duration,
        performanceMetrics: this.getPerformanceMetrics(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Dashboard batch fetch failed:', error);
      throw error;
    }
  }

  /**
   * Intelligent preload with priority-based loading
   */
  async preloadDashboardData() {
    console.log('🔄 Preloading dashboard data...');
    
    // Fire and forget - don't wait for completion
    Promise.allSettled([
      this.getDashboardStats(),
      this.getRecentOrders(),
      this.getProductStats(),
      this.getCustomerStats(),
      this.getSyncStatus()
    ]).then(() => {
      console.log('✅ Dashboard data preloaded');
    }).catch((error) => {
      console.warn('⚠️ Dashboard preload had issues:', error);
    });
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this?.?.?.?.?.performanceMetrics = {
      requests: 0,
      errors: 0,
      totalDuration: 0,
      cacheHits: 0
    };
    console.log('📊 Performance metrics reset');
  }
}

// Create singleton instance
const dashboardApi = new DashboardApiService();

// Export both the class and the instance
export { DashboardApiService };
export default dashboardApi;
