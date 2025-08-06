import axios from 'axios';
import directMagentoClient from './directMagentoClient';
import BaseApiService from './BaseApiService';

/**
 * Unified Magento Service - Extends BaseApiService
 * Intelligent API service with auto-failover between direct and proxy connections
 */
class UnifiedMagentoService extends BaseApiService {
  constructor() {
    super({
      cacheEnabled: true,
      cacheDuration: 5 * 60 * 1000,
      maxCacheSize: 100,
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 30000
    });

    this.proxyClient = axios.create({
      baseURL: '/api/magento',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: this.config.timeout
    });

    this.magentoState = {
      directEnabled: false,
      proxyMetrics: { success: 0, errors: 0 },
      directMetrics: { success: 0, errors: 0 }
    };

    this._initializeMagento();
  }

  _initializeMagento() {
    this._loadMagentoSettings();
  }

  _loadMagentoSettings() {
    try {
      const settings = this.state.settings?.magento;
      if (settings) this.initializeMagento(settings);
    } catch (error) {
      console.warn('Failed to load Magento settings:', error.message);
    }
  }

  // Public initialize method (alias for initializeMagento for compatibility)
  initialize(settings) {
    return this.initializeMagento(settings);
  }

  initializeMagento(settings) {
    // Update parent settings
    try {
      if (this.updateSettings) {
        this.updateSettings({ magento: settings });
      }
    } catch (error) {
      console.warn('Failed to update parent settings:', error.message);
    }
    
    this.magentoState.directEnabled = settings?.enableDirectConnection || false;
    
    if (this.magentoState.directEnabled) {
      try {
        directMagentoClient.initialize(settings);
        console.log('✅ Direct Magento connection enabled');
      } catch (error) {
        console.error('❌ Direct Magento connection failed:', error.message);
        this.magentoState.directEnabled = false;
      }
    }
    
    console.log(`🔌 Magento Mode: ${this.magentoState.directEnabled ? 'Direct' : 'Proxy'}`);
  }

  // Override main request method with intelligent routing
  async request(method, endpoint, data = {}, config = {}) {
    const context = { method, endpoint, showToast: config.showToast };
    
    return this._retryRequest(async () => {
      let response;
      
      if (this.magentoState.directEnabled && directMagentoClient.initialized) {
        try {
          console.log('🔄 Direct:', method.toUpperCase(), endpoint);
          response = await directMagentoClient[method.toLowerCase()](endpoint, data, config);
          this.magentoState.directMetrics.success++;
        } catch (error) {
          console.warn('⚠️ Direct failed, using proxy:', error.message);
          this.magentoState.directMetrics.errors++;
          response = await this.proxyClient.request({ ...config, method, url: endpoint, data });
          this.magentoState.proxyMetrics.success++;
        }
      } else {
        console.log('🔄 Proxy:', method.toUpperCase(), endpoint);
        response = await this.proxyClient.request({ ...config, method, url: endpoint, data });
        this.magentoState.proxyMetrics.success++;
      }
      
      return response;
    }, 0, context);
  }

  // Override HTTP methods to use parent's parameter validation
  async get(endpoint, params = {}) {
    return super.get(endpoint, params);
  }

  // Enhanced metrics including Magento-specific data
  getMetrics() {
    return {
      ...super.getMetrics(),
      magento: {
        directEnabled: this.magentoState.directEnabled,
        directMetrics: this.magentoState.directMetrics,
        proxyMetrics: this.magentoState.proxyMetrics
      }
    };
  }

  async testConnection() {
    try {
      const response = await this.get('/admin/token', { skipCache: true });
      return {
        success: true,
        message: 'Connection successful',
        mode: this.state.directEnabled ? 'Direct' : 'Proxy',
        response
      };
    } catch (error) {
      return {
        success: false,
        message: this._getErrorMessage(error),
        mode: this.state.directEnabled ? 'Direct' : 'Proxy',
        error
      };
    }
  }
}

// Create singleton instance
const unifiedMagentoService = new UnifiedMagentoService();
export default unifiedMagentoService;
