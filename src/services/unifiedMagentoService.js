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
      timeout: 30000,
    });

    this.proxyClient = axios.create({
      baseURL: '/api/magento',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: this.config.timeout,
    });

    this.magentoState = {
      directEnabled: false,
      proxyMetrics: { success: 0, errors: 0 },
      directMetrics: { success: 0, errors: 0 },
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
  async request(method, endpoint, data, config = {}) {
    const startTime = Date.now();

    try {
      let response;

      // Try direct connection first if enabled
      if (this.magentoState.directEnabled && directMagentoClient.initialized) {
        try {
          console.log(`🔗 Direct API call: ${method.toUpperCase()} ${endpoint}`);
          response = await directMagentoClient[method.toLowerCase()](endpoint, data, config);
          this.magentoState.directMetrics.success++;
          this.state.metrics.success++;

          return { data: response };
        } catch (directError) {
          console.warn(`❌ Direct connection failed for ${endpoint}:`, directError.message);
          this.magentoState.directMetrics.errors++;

          // Don't fallback to proxy for 404 errors (endpoint doesn't exist)
          if (directError.response?.status === 404) {
            throw directError;
          }
        }
      }

      // Fallback to proxy connection
      console.log(`🔄 Proxy API call: ${method.toUpperCase()} ${endpoint}`);
      response = await this.proxyClient.request({
        method,
        url: endpoint,
        data,
        ...config,
      });

      this.magentoState.proxyMetrics.success++;
      this.state.metrics.success++;

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      this.state.metrics.errors++;
      this.state.metrics.lastError = {
        endpoint,
        method,
        message: error.message,
        timestamp: new Date().toISOString(),
      };

      // Enhanced error logging
      console.error(`🚨 API Error [${method} ${endpoint}]:`, {
        message: error.message,
        status: error.response?.status,
        duration: `${duration}ms`,
        directEnabled: this.magentoState.directEnabled,
        proxyEnabled: true,
      });

      // Don't show toast for 404 errors (expected for non-existent endpoints)
      if (error.response?.status !== 404) {
        this._handleError(error, method, endpoint);
      }

      throw error;
    } finally {
      const duration = Date.now() - startTime;

      this.state.metrics.avgResponseTime =
            (this.state.metrics.avgResponseTime + duration) / 2;
    }
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
        proxyMetrics: this.magentoState.proxyMetrics,
      },
    };
  }

  async testConnection() {
    try {
      const response = await this.get('/admin/token', { skipCache: true });

      return {
        success: true,
        message: 'Connection successful',
        mode: this.state.directEnabled ? 'Direct' : 'Proxy',
        response,
      };
    } catch (error) {
      return {
        success: false,
        message: this._getErrorMessage(error),
        mode: this.state.directEnabled ? 'Direct' : 'Proxy',
        error,
      };
    }
  }
}

// Create singleton instance
const unifiedMagentoService = new UnifiedMagentoService();

export default unifiedMagentoService;
