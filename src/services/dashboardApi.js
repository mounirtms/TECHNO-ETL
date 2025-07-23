/**
 * Dashboard API Service
 * Optimized API calls with error handling, caching, and loading states
 */

import axios from 'axios';

// Create axios instance with optimized configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and performance tracking
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`✅ API Response: ${response.config.url} (${duration}ms)`);
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? Date.now() - error.config.metadata.startTime : 0;
    console.error(`❌ API Error: ${error.config?.url} (${duration}ms)`, error.message);
    return Promise.reject(error);
  }
);

/**
 * Dashboard API Service Class
 */
class DashboardApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached data or fetch fresh data
   */
  async getCachedData(key, fetchFunction, cacheTime = this.cacheTimeout) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      console.log(`📦 Cache hit: ${key}`);
      return { ...cached.data, cached: true };
    }

    try {
      const data = await fetchFunction();
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      console.log(`🔄 Cache updated: ${key}`);
      return { ...data, cached: false };
    } catch (error) {
      // Return cached data if available, even if expired
      if (cached) {
        console.warn(`⚠️ Using stale cache for ${key} due to error:`, error.message);
        return { ...cached.data, cached: true, stale: true };
      }
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    return this.getCachedData('dashboard-stats', async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    });
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(page = 1, limit = 10) {
    const cacheKey = `orders-${page}-${limit}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await api.get(`/dashboard/orders?page=${page}&limit=${limit}`);
      return response.data;
    }, 2 * 60 * 1000); // 2 minutes cache for orders
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    return this.getCachedData('product-stats', async () => {
      const response = await api.get('/dashboard/products');
      return response.data;
    });
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats() {
    return this.getCachedData('customer-stats', async () => {
      const response = await api.get('/dashboard/customers');
      return response.data;
    });
  }

  /**
   * Trigger price synchronization
   */
  async syncPrices() {
    try {
      const response = await api.post('/mdm/sync/prices');
      
      // Clear related cache
      this.clearCache(['dashboard-stats', 'product-stats']);
      
      return response.data;
    } catch (error) {
      throw new Error(`Price sync failed: ${error.message}`);
    }
  }

  /**
   * Trigger inventory synchronization
   */
  async syncInventory() {
    try {
      const response = await api.post('/mdm/sync/inventory');
      
      // Clear related cache
      this.clearCache(['dashboard-stats', 'product-stats']);
      
      return response.data;
    } catch (error) {
      throw new Error(`Inventory sync failed: ${error.message}`);
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    return this.getCachedData('sync-status', async () => {
      const response = await api.get('/mdm/sync/status');
      return response.data;
    }, 30 * 1000); // 30 seconds cache for sync status
  }

  /**
   * Get dashboard health
   */
  async getDashboardHealth() {
    try {
      const response = await api.get('/dashboard/health');
      return response.data;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clear specific cache entries
   */
  clearCache(keys = []) {
    if (keys.length === 0) {
      this.cache.clear();
      console.log('🗑️ All cache cleared');
    } else {
      keys.forEach(key => {
        this.cache.delete(key);
        console.log(`🗑️ Cache cleared: ${key}`);
      });
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        size: JSON.stringify(value.data).length
      }))
    };
    return stats;
  }

  /**
   * Batch fetch multiple dashboard data
   */
  async fetchDashboardData() {
    const startTime = Date.now();
    
    try {
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
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Dashboard batch fetch failed:', error);
      throw error;
    }
  }

  /**
   * Preload dashboard data
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
}

// Create singleton instance
const dashboardApi = new DashboardApiService();

// Export both the class and the instance
export { DashboardApiService };
export default dashboardApi;
