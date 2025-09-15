/**
 * Optimized Service Factory
 * Centralized service management with lazy loading, caching, and error handling
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import { BaseApiService } from './BaseApiService';
import { getUnifiedSettings } from '../utils/unifiedSettingsManager';

/**
 * Enhanced Magento API Service
 */
class MagentoApiService extends BaseApiService {
  constructor() {
    super({
      cacheEnabled: true,
      cacheDuration: 10 * 60 * 1000, // 10 minutes for Magento data
      maxCacheSize: 200,
      retryAttempts: 3,
      timeout: 45000
    });
    
    this.baseURL = null;
    this.token = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const settings = getUnifiedSettings();
      const magentoSettings = settings.magentoSettings || {};
      
      this.baseURL = magentoSettings.baseURL || process.env.VITE_MAGENTO_BASE_URL;
      this.token = magentoSettings.token || process.env.VITE_MAGENTO_TOKEN;
      
      if (!this.baseURL || !this.token) {
        throw new Error('Magento API configuration missing');
      }
      
      this.initialized = true;
      console.log('✅ Magento API Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Magento API Service:', error);
      throw error;
    }
  }

  async request(method, endpoint, data, config = {}) {
    await this.initialize();
    
    const axios = (await import('axios')).default;
    
    const requestConfig = {
      method,
      url: `${this.baseURL}/rest/V1/${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...config.headers
      },
      timeout: this.config.timeout,
      ...config
    };

    if (data) {
      requestConfig.data = data;
    }

    return this._retryRequest(
      () => axios(requestConfig),
      0,
      { method, endpoint }
    );
  }

  // Specialized Magento methods
  async getProducts(params = {}) {
    const response = await this.get('products', params);
    return this.formatResponse(response);
  }

  async getCategories(params = {}) {
    const response = await this.get('categories', params);
    return this.formatResponse(response);
  }

  async getCustomers(params = {}) {
    const response = await this.get('customers/search', params);
    return this.formatResponse(response);
  }

  async getOrders(params = {}) {
    const response = await this.get('orders', params);
    return this.formatResponse(response);
  }

  async getInvoices(params = {}) {
    const response = await this.get('invoices', params);
    return this.formatResponse(response);
  }

  async getStockItems(params = {}) {
    const response = await this.get('stockItems/search', params);
    return this.formatResponse(response);
  }

  async getSources(params = {}) {
    const response = await this.get('inventory/sources', params);
    return this.formatResponse(response);
  }

  async getCmsPages(params = {}) {
    const response = await this.get('cmsPage/search', params);
    return this.formatResponse(response);
  }
}

/**
 * Enhanced MDM API Service
 */
class MDMApiService extends BaseApiService {
  constructor() {
    super({
      cacheEnabled: true,
      cacheDuration: 5 * 60 * 1000, // 5 minutes for MDM data
      maxCacheSize: 150,
      retryAttempts: 2,
      timeout: 30000
    });
    
    this.baseURL = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const settings = getUnifiedSettings();
      const mdmSettings = settings.mdmSettings || {};
      
      this.baseURL = mdmSettings.baseURL || process.env.VITE_MDM_BASE_URL || 'http://localhost:5000/api';
      
      this.initialized = true;
      console.log('✅ MDM API Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize MDM API Service:', error);
      throw error;
    }
  }

  async request(method, endpoint, data, config = {}) {
    await this.initialize();
    
    const axios = (await import('axios')).default;
    
    const requestConfig = {
      method,
      url: `${this.baseURL}/${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      timeout: this.config.timeout,
      ...config
    };

    if (data) {
      requestConfig.data = data;
    }

    return this._retryRequest(
      () => axios(requestConfig),
      0,
      { method, endpoint }
    );
  }

  // Specialized MDM methods
  async getMDMProducts(params = {}) {
    const response = await this.get('mdm/products', params);
    return this.formatResponse(response);
  }

  async getMDMStock(params = {}) {
    const response = await this.get('mdm/stock', params);
    return this.formatResponse(response);
  }

  async getMDMPrices(params = {}) {
    const response = await this.get('mdm/prices', params);
    return this.formatResponse(response);
  }

  async syncMDMData(type, data) {
    const response = await this.post(`mdm/sync/${type}`, data);
    return response.data;
  }
}

/**
 * Enhanced Cegid API Service
 */
class CegidApiService extends BaseApiService {
  constructor() {
    super({
      cacheEnabled: true,
      cacheDuration: 15 * 60 * 1000, // 15 minutes for Cegid data
      maxCacheSize: 100,
      retryAttempts: 2,
      timeout: 60000
    });
    
    this.baseURL = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const settings = getUnifiedSettings();
      const cegidSettings = settings.cegidSettings || {};
      
      this.baseURL = cegidSettings.baseURL || process.env.VITE_CEGID_BASE_URL;
      
      if (!this.baseURL) {
        console.warn('Cegid API configuration missing - service will be limited');
      }
      
      this.initialized = true;
      console.log('✅ Cegid API Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Cegid API Service:', error);
      throw error;
    }
  }

  async request(method, endpoint, data, config = {}) {
    await this.initialize();
    
    if (!this.baseURL) {
      throw new Error('Cegid API not configured');
    }
    
    const axios = (await import('axios')).default;
    
    const requestConfig = {
      method,
      url: `${this.baseURL}/${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      timeout: this.config.timeout,
      ...config
    };

    if (data) {
      requestConfig.data = data;
    }

    return this._retryRequest(
      () => axios(requestConfig),
      0,
      { method, endpoint }
    );
  }

  // Specialized Cegid methods
  async getCegidProducts(params = {}) {
    const response = await this.get('cegid/products', params);
    return this.formatResponse(response);
  }

  async syncCegidData(data) {
    const response = await this.post('cegid/sync', data);
    return response.data;
  }
}

/**
 * Service Factory with Lazy Loading and Caching
 */
class OptimizedServiceFactory {
  constructor() {
    this.services = new Map();
    this.initializationPromises = new Map();
  }

  /**
   * Get service instance with lazy loading
   */
  async getService(serviceName) {
    // Return cached service if available
    if (this.services.has(serviceName)) {
      return this.services.get(serviceName);
    }

    // Return existing initialization promise if in progress
    if (this.initializationPromises.has(serviceName)) {
      return this.initializationPromises.get(serviceName);
    }

    // Create new service instance
    const initPromise = this._createService(serviceName);
    this.initializationPromises.set(serviceName, initPromise);

    try {
      const service = await initPromise;
      this.services.set(serviceName, service);
      this.initializationPromises.delete(serviceName);
      return service;
    } catch (error) {
      this.initializationPromises.delete(serviceName);
      throw error;
    }
  }

  /**
   * Create service instance based on name
   */
  async _createService(serviceName) {
    switch (serviceName.toLowerCase()) {
      case 'magento':
        return new MagentoApiService();
      
      case 'mdm':
        return new MDMApiService();
      
      case 'cegid':
        return new CegidApiService();
      
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }

  /**
   * Get multiple services at once
   */
  async getServices(serviceNames) {
    const services = {};
    const promises = serviceNames.map(async (name) => {
      services[name] = await this.getService(name);
    });
    
    await Promise.all(promises);
    return services;
  }

  /**
   * Clear service cache
   */
  clearCache(serviceName = null) {
    if (serviceName) {
      const service = this.services.get(serviceName);
      if (service && typeof service.clearCache === 'function') {
        service.clearCache();
      }
    } else {
      // Clear all service caches
      for (const service of this.services.values()) {
        if (typeof service.clearCache === 'function') {
          service.clearCache();
        }
      }
    }
  }

  /**
   * Get service metrics
   */
  getMetrics(serviceName = null) {
    if (serviceName) {
      const service = this.services.get(serviceName);
      return service ? service.getMetrics() : null;
    }
    
    // Get metrics for all services
    const metrics = {};
    for (const [name, service] of this.services.entries()) {
      if (typeof service.getMetrics === 'function') {
        metrics[name] = service.getMetrics();
      }
    }
    return metrics;
  }

  /**
   * Health check for all services
   */
  async healthCheck() {
    const health = {};
    
    for (const [name, service] of this.services.entries()) {
      try {
        // Simple health check - try to make a basic request
        if (name === 'magento') {
          await service.get('store/storeConfigs');
        } else if (name === 'mdm') {
          await service.get('health');
        } else if (name === 'cegid') {
          await service.get('health');
        }
        
        health[name] = { status: 'healthy', metrics: service.getMetrics() };
      } catch (error) {
        health[name] = { 
          status: 'unhealthy', 
          error: error.message,
          metrics: service.getMetrics() 
        };
      }
    }
    
    return health;
  }

  /**
   * Reset all services
   */
  reset() {
    this.services.clear();
    this.initializationPromises.clear();
    console.log('🔄 Service factory reset');
  }
}

// Create singleton instance
const serviceFactory = new OptimizedServiceFactory();

// Export convenience methods
export const getMagentoService = () => serviceFactory.getService('magento');
export const getMDMService = () => serviceFactory.getService('mdm');
export const getCegidService = () => serviceFactory.getService('cegid');
export const getServices = (names) => serviceFactory.getServices(names);
export const clearServiceCache = (name) => serviceFactory.clearCache(name);
export const getServiceMetrics = (name) => serviceFactory.getMetrics(name);
export const checkServiceHealth = () => serviceFactory.healthCheck();
export const resetServices = () => serviceFactory.reset();

export default serviceFactory;