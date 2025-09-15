/**
 * Fallback Services
 * Provides safe fallback implementations when main services are unavailable
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

/**
 * Fallback Permission Service
 * Provides basic permission functionality when main service is unavailable
 */
export class FallbackPermissionService {
  constructor() {
    this.permissions = [];
    this.user = null;
    this.initialized = false;
  }

  async initialize(user) {
    this.user = user;
    this.permissions = [
      // Core permissions
      'dashboard.view',
      'analytics.view',
      'user.profile.view',
      'user.settings.view',
      
      // Magento permissions
      'magento.products.view',
      'magento.customers.view',
      'magento.orders.view',
      'magento.invoices.view',
      'magento.categories.view',
      'magento.inventory.view',
      'magento.sources.view',
      'magento.cms.view',
      
      // MDM permissions
      'mdm.products.view',
      'mdm.stock.view',
      
      // Cegid permissions
      'cegid.products.view',
      
      // Development permissions
      'development.test',
      'development.bugbounty',
      'development.voting',
      
      // Products permissions
      'products.catalog.view',
      
      // Security permissions (basic)
      'security.vault.view',
      'security.access.view',
      
      // System permissions (basic)
      'system.license.manage'
    ];
    this.initialized = true;
    console.log('🔧 Using fallback permission service with full permissions');
  }

  async getPermissions() {
    return this.permissions;
  }

  hasPermission(action, resource = '*') {
    if (!this.initialized) return false;
    return this.permissions.includes(action) || this.permissions.includes('*');
  }

  async checkFeatureAccess(feature) {
    return true; // Allow all features in fallback mode
  }

  filterMenuItems(menuItems) {
    return menuItems; // Return all items in fallback mode
  }

  canAccessMenuItem(menuItem) {
    return true; // Allow all menu items in fallback mode
  }

  getPermissionSummary() {
    return {
      permissions: this.permissions,
      user: this.user?.uid || 'anonymous',
      mode: 'fallback'
    };
  }

  isAdmin() {
    return this.user?.role === 'admin' || this.user?.role === 'super_admin';
  }

  canPerformBulkOperations() {
    return this.isAdmin();
  }

  async refreshPermissions() {
    // No-op in fallback mode
    return this.permissions;
  }
}

/**
 * Fallback License Manager
 * Provides basic license functionality when main service is unavailable
 */
export class FallbackLicenseManager {
  static async checkUserLicense(userId) {
    console.log('🔧 Using fallback license manager');
    return {
      isValid: true,
      level: 'basic',
      features: ['dashboard', 'basic_analytics'],
      expiresAt: null,
      mode: 'fallback'
    };
  }

  static listenToLicenseChanges(userId, callback) {
    // Return a no-op unsubscribe function
    return () => {};
  }

  static async refreshLicense(userId) {
    return this.checkUserLicense(userId);
  }
}

/**
 * Service availability checker
 */
export const checkServiceAvailability = () => {
  const services = {
    PermissionService: false,
    LicenseManager: false
  };

  try {
    // Try to import the main services
    const PermissionService = require('./PermissionService');
    services.PermissionService = !!PermissionService.default;
  } catch (error) {
    console.warn('PermissionService not available:', error.message);
  }

  try {
    const LicenseManager = require('./LicenseManager');
    services.LicenseManager = !!LicenseManager.default;
  } catch (error) {
    console.warn('LicenseManager not available:', error.message);
  }

  return services;
};

/**
 * Get service with fallback
 */
export const getServiceWithFallback = (serviceName) => {
  try {
    switch (serviceName) {
      case 'PermissionService':
        try {
          const PermissionService = require('./PermissionService');
          return PermissionService.default || PermissionService;
        } catch {
          return new FallbackPermissionService();
        }
      
      case 'LicenseManager':
        try {
          const LicenseManager = require('./LicenseManager');
          return LicenseManager.default || LicenseManager;
        } catch {
          return FallbackLicenseManager;
        }
      
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  } catch (error) {
    console.error(`Error getting service ${serviceName}:`, error);
    
    // Return appropriate fallback
    if (serviceName === 'PermissionService') {
      return new FallbackPermissionService();
    } else if (serviceName === 'LicenseManager') {
      return FallbackLicenseManager;
    }
    
    throw error;
  }
};

export default {
  FallbackPermissionService,
  FallbackLicenseManager,
  checkServiceAvailability,
  getServiceWithFallback
};