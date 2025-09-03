import MDMService from './MDMService.js';
import MagentoService from './MagentoService.js';
import CegidService from './CegidService.js';

/**
 * API Service Factory
 * Manages creation and configuration of all API services
 * Provides a centralized way to access different API services
 */
class APIServiceFactory {
  constructor() {
    this.services = new Map();
    this.configurations = new Map();
    this.initialized = false;
  }

  /**
     * Initialize the factory with user configurations
     */
  initialize(userConfig = {}) {
    try {
      this.configurations.clear();
      this.services.clear();

      // Store configurations
      if (userConfig.mdm) {
        this.configurations.set('mdm', userConfig.mdm);
      }
      if (userConfig.magento) {
        this.configurations.set('magento', userConfig.magento);
      }
      if (userConfig.cegid) {
        this.configurations.set('cegid', userConfig.cegid);
      }
      if (userConfig.general) {
        this.configurations.set('general', userConfig.general);
      }

      this.initialized = true;
      console.log('API Service Factory initialized with configurations:',
        Array.from(this.configurations.keys()));
    } catch (error) {
      console.error('Failed to initialize API Service Factory:', error);
      throw error;
    }
  }

  /**
     * Get or create MDM service instance
     */
  getMDMService() {
    if (!this.services.has('mdm')) {
      const config = this.configurations.get('mdm') || {};
      const generalConfig = this.configurations.get('general') || {};

      const service = new MDMService({
        ...config,
        ...generalConfig,
      });

      this.services.set('mdm', service);
    }

    return this.services.get('mdm');
  }

  /**
     * Get or create Magento service instance
     */
  getMagentoService() {
    if (!this.services.has('magento')) {
      const config = this.configurations.get('magento') || {};
      const generalConfig = this.configurations.get('general') || {};

      const service = new MagentoService({
        ...config,
        backendUrl: generalConfig.backendServer,
        ...generalConfig,
      });

      this.services.set('magento', service);
    }

    return this.services.get('magento');
  }

  /**
     * Get or create CEGID service instance
     */
  getCegidService() {
    if (!this.services.has('cegid')) {
      const config = this.configurations.get('cegid') || {};
      const generalConfig = this.configurations.get('general') || {};

      const service = new CegidService({
        ...config,
        ...generalConfig,
      });

      this.services.set('cegid', service);
    }

    return this.services.get('cegid');
  }

  /**
     * Get service by name
     */
  getService(serviceName) {
    switch (serviceName.toLowerCase()) {
    case 'mdm':
      return this.getMDMService();
    case 'magento':
      return this.getMagentoService();
    case 'cegid':
      return this.getCegidService();
    default:
      throw new Error(`Unknown service: ${serviceName}`);
    }
  }

  /**
     * Test all configured services
     */
  async testAllConnections() {
    const results = {};

    for (const [serviceName, config] of this.configurations) {
      if (serviceName === 'general') continue;

      try {
        if (config.enabled !== false) {
          const service = this.getService(serviceName);

          results[serviceName] = await service.testConnection();
        } else {
          results[serviceName] = {
            success: false,
            message: `${serviceName} is disabled`,
            disabled: true,
          };
        }
      } catch (error) {
        results[serviceName] = {
          success: false,
          message: `Failed to test ${serviceName}`,
          error: error.message,
        };
      }
    }

    return results;
  }

  /**
     * Get health status of all services
     */
  async getHealthStatus() {
    const status = {};

    for (const [serviceName, config] of this.configurations) {
      if (serviceName === 'general') continue;

      try {
        if (config.enabled !== false) {
          const service = this.getService(serviceName);

          status[serviceName] = await service.healthCheck();
        } else {
          status[serviceName] = {
            status: 'disabled',
            message: `${serviceName} is disabled`,
          };
        }
      } catch (error) {
        status[serviceName] = {
          status: 'error',
          error: error.message,
        };
      }
    }

    return status;
  }

  /**
     * Update configuration for a specific service
     */
  updateServiceConfig(serviceName, config) {
    this.configurations.set(serviceName, config);

    // Remove existing service instance to force recreation with new config
    if (this.services.has(serviceName)) {
      const service = this.services.get(serviceName);

      if (service.destroy) {
        service.destroy();
      }
      this.services.delete(serviceName);
    }

    console.log(`Updated configuration for ${serviceName}`);
  }

  /**
     * Get available services
     */
  getAvailableServices() {
    return Array.from(this.configurations.keys()).filter(key => key !== 'general');
  }

  /**
     * Get service configuration
     */
  getServiceConfig(serviceName) {
    return this.configurations.get(serviceName);
  }

  /**
     * Check if service is enabled
     */
  isServiceEnabled(serviceName) {
    const config = this.configurations.get(serviceName);

    return config && config.enabled !== false;
  }

  /**
     * Validate all service configurations
     */
  validateConfigurations() {
    const results = {};

    for (const [serviceName, config] of this.configurations) {
      if (serviceName === 'general') continue;

      try {
        if (config.enabled !== false) {
          const service = this.getService(serviceName);

          results[serviceName] = service.validateConfig();
        } else {
          results[serviceName] = {
            isValid: true,
            disabled: true,
          };
        }
      } catch (error) {
        results[serviceName] = {
          isValid: false,
          errors: [error.message],
        };
      }
    }

    return results;
  }

  /**
     * Clear all caches
     */
  clearAllCaches() {
    for (const service of this.services.values()) {
      if (service.clearCache) {
        service.clearCache();
      }
    }
    console.log('All service caches cleared');
  }

  /**
     * Destroy all services and clean up resources
     */
  destroy() {
    for (const service of this.services.values()) {
      if (service.destroy) {
        service.destroy();
      }
    }

    this.services.clear();
    this.configurations.clear();
    this.initialized = false;

    console.log('API Service Factory destroyed');
  }

  /**
     * Get factory status
     */
  getStatus() {
    return {
      initialized: this.initialized,
      servicesCount: this.services.size,
      configurationsCount: this.configurations.size,
      availableServices: this.getAvailableServices(),
      activeServices: Array.from(this.services.keys()),
    };
  }

  /**
     * Refresh all service instances (useful after configuration changes)
     */
  refreshServices() {
    // Destroy existing services
    for (const service of this.services.values()) {
      if (service.destroy) {
        service.destroy();
      }
    }

    this.services.clear();
    console.log('All services refreshed');
  }
}

// Create singleton instance
const apiServiceFactory = new APIServiceFactory();

export default apiServiceFactory;
export { APIServiceFactory };
