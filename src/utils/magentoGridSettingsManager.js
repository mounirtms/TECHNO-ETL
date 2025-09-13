/**
 * Magento Grid Settings Manager
 * Handles settings-aware configuration for all Magento grid components
 * Integrates user preferences with grid behavior and API settings
 */

import { toast } from 'react-toastify';

/**
 * Default Magento grid preferences
 */
const DEFAULT_MAGENTO_GRID_SETTINGS = {
  pagination: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    enableServerSidePagination: true
  },
  density: 'standard', // 'compact', 'standard', 'comfortable'
  sorting: {
    defaultSort: { field: 'created_at', direction: 'DESC' },
    enableMultiSort: true
  },
  filtering: {
    enableQuickFilter: true,
    enableAdvancedFilter: true,
    persistFilters: true
  },
  display: {
    showStatsCards: true,
    enableVirtualization: true,
    virtualizationThreshold: 500
  },
  performance: {
    cacheEnabled: true,
    autoRefresh: false,
    refreshInterval: 30000 // 30 seconds
  }
};

/**
 * Grid-specific default settings
 */
const GRID_SPECIFIC_DEFAULTS = {
  magentoProducts: {
    ...DEFAULT_MAGENTO_GRID_SETTINGS,
    pagination: {
      ...DEFAULT_MAGENTO_GRID_SETTINGS.pagination,
      defaultPageSize: 50
    },
    sorting: {
      ...DEFAULT_MAGENTO_GRID_SETTINGS.sorting,
      defaultSort: { field: 'sku', direction: 'ASC' }
    }
  },
  magentoOrders: {
    ...DEFAULT_MAGENTO_GRID_SETTINGS,
    sorting: {
      ...DEFAULT_MAGENTO_GRID_SETTINGS.sorting,
      defaultSort: { field: 'created_at', direction: 'DESC' }
    }
  },
  magentoCustomers: {
    ...DEFAULT_MAGENTO_GRID_SETTINGS,
    sorting: {
      ...DEFAULT_MAGENTO_GRID_SETTINGS.sorting,
      defaultSort: { field: 'created_at', direction: 'DESC' }
    }
  },
  magentoInvoices: {
    ...DEFAULT_MAGENTO_GRID_SETTINGS,
    sorting: {
      ...DEFAULT_MAGENTO_GRID_SETTINGS.sorting,
      defaultSort: { field: 'created_at', direction: 'DESC' }
    }
  },
  magentoCmsPages: {
    ...DEFAULT_MAGENTO_GRID_SETTINGS,
    pagination: {
      ...DEFAULT_MAGENTO_GRID_SETTINGS.pagination,
      defaultPageSize: 25
    },
    sorting: {
      ...DEFAULT_MAGENTO_GRID_SETTINGS.sorting,
      defaultSort: { field: 'title', direction: 'ASC' }
    }
  }
};

/**
 * Get settings-aware grid configuration
 * @param {string} gridType - Type of Magento grid (e.g., 'magentoProducts')
 * @param {object} userSettings - User settings from SettingsContext
 * @returns {object} Grid configuration with user preferences applied
 */
export const getMagentoGridConfig = (gridType, userSettings = {}) => {
  try {
    // Get base configuration for the grid type
    const baseConfig = GRID_SPECIFIC_DEFAULTS[gridType] || DEFAULT_MAGENTO_GRID_SETTINGS;
    
    // Extract relevant user preferences
    const preferences = userSettings.preferences || {};
    const performance = userSettings.performance || {};
    const gridSettings = userSettings.gridSettings || {};
    
    // Apply user preferences to grid configuration
    const config = {
      ...baseConfig,
      pagination: {
        ...baseConfig.pagination,
        defaultPageSize: gridSettings.defaultPageSize || 
                        performance.defaultPageSize || 
                        baseConfig.pagination.defaultPageSize,
        enableServerSidePagination: performance.enableServerSidePagination !== false
      },
      density: preferences.density || baseConfig.density,
      display: {
        ...baseConfig.display,
        showStatsCards: gridSettings.showStatsCards !== false,
        enableVirtualization: performance.enableVirtualization !== false,
        virtualizationThreshold: performance.virtualizationThreshold || 
                                baseConfig.display.virtualizationThreshold
      },
      performance: {
        ...baseConfig.performance,
        cacheEnabled: performance.cacheEnabled !== false,
        autoRefresh: gridSettings.autoRefresh === true,
        refreshInterval: gridSettings.refreshInterval || baseConfig.performance.refreshInterval
      },
      filtering: {
        ...baseConfig.filtering,
        persistFilters: gridSettings.persistFilters !== false
      }
    };
    
    return config;
  } catch (error) {
    console.error('Error getting Magento grid config:', error);
    return GRID_SPECIFIC_DEFAULTS[gridType] || DEFAULT_MAGENTO_GRID_SETTINGS;
  }
};

/**
 * Get API parameters based on user settings and grid configuration
 * @param {string} gridType - Type of Magento grid
 * @param {object} userSettings - User settings from SettingsContext
 * @param {object} additionalParams - Additional API parameters
 * @returns {object} API parameters with user preferences applied
 */
export const getMagentoApiParams = (gridType, userSettings = {}, additionalParams = {}) => {
  try {
    const gridConfig = getMagentoGridConfig(gridType, userSettings);
    const apiSettings = userSettings.apiSettings?.magento || {};
    
    // Base API parameters
    const baseParams = {
      pageSize: gridConfig.pagination.defaultPageSize,
      currentPage: 1,
      sortOrders: [gridConfig.sorting.defaultSort],
      ...additionalParams
    };
    
    // Apply API-specific settings
    if (apiSettings.timeout) {
      baseParams.timeout = apiSettings.timeout;
    }
    
    if (apiSettings.retryAttempts) {
      baseParams.retryAttempts = apiSettings.retryAttempts;
    }
    
    // Apply performance settings
    if (gridConfig.performance.cacheEnabled) {
      baseParams.useCache = true;
    }
    
    return baseParams;
  } catch (error) {
    console.error('Error getting Magento API params:', error);
    return {
      pageSize: 25,
      currentPage: 1,
      sortOrders: [{ field: 'created_at', direction: 'DESC' }],
      ...additionalParams
    };
  }
};

/**
 * Apply user settings to grid props
 * @param {object} baseProps - Base grid props
 * @param {string} gridType - Type of Magento grid
 * @param {object} userSettings - User settings from SettingsContext
 * @returns {object} Enhanced grid props with user settings applied
 */
export const applySettingsToGridProps = (baseProps, gridType, userSettings = {}) => {
  try {
    const gridConfig = getMagentoGridConfig(gridType, userSettings);
    
    return {
      ...baseProps,
      defaultPageSize: gridConfig.pagination.defaultPageSize,
      pageSizeOptions: gridConfig.pagination.pageSizeOptions,
      paginationMode: gridConfig.pagination.enableServerSidePagination ? 'server' : 'client',
      density: gridConfig.density,
      showStatsCards: gridConfig.display.showStatsCards,
      enableVirtualization: gridConfig.display.enableVirtualization,
      virtualizationThreshold: gridConfig.display.virtualizationThreshold,
      enableCache: gridConfig.performance.cacheEnabled,
      autoRefresh: gridConfig.performance.autoRefresh,
      refreshInterval: gridConfig.performance.refreshInterval,
      enableQuickFilter: gridConfig.filtering.enableQuickFilter,
      enableAdvancedFilter: gridConfig.filtering.enableAdvancedFilter
    };
  } catch (error) {
    console.error('Error applying settings to grid props:', error);
    return baseProps;
  }
};

/**
 * Get error handling configuration based on user settings
 * @param {object} userSettings - User settings from SettingsContext
 * @returns {object} Error handling configuration
 */
export const getErrorHandlingConfig = (userSettings = {}) => {
  const preferences = userSettings.preferences || {};
  const notifications = userSettings.notifications || {};
  
  return {
    showToastErrors: notifications.showErrors !== false,
    showDetailedErrors: preferences.showDetailedErrors === true,
    retryOnError: preferences.autoRetryOnError === true,
    maxRetries: preferences.maxRetries || 3,
    retryDelay: preferences.retryDelay || 1000
  };
};

/**
 * Handle API errors with user-configured error handling
 * @param {Error} error - The error object
 * @param {string} operation - The operation that failed
 * @param {object} userSettings - User settings from SettingsContext
 */
export const handleMagentoGridError = (error, operation, userSettings = {}) => {
  const errorConfig = getErrorHandlingConfig(userSettings);
  
  console.error(`Magento Grid Error (${operation}):`, error);
  
  if (errorConfig.showToastErrors) {
    const message = errorConfig.showDetailedErrors 
      ? `${operation} failed: ${error.message}`
      : `Failed to ${operation.toLowerCase()}`;
    
    toast.error(message, {
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true
    });
  }
  
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Magento Grid Error Details`);
    console.log('Operation:', operation);
    console.log('Error:', error);
    console.log('User Settings:', userSettings);
    console.groupEnd();
  }
};

/**
 * Save grid-specific user preferences
 * @param {string} gridType - Type of Magento grid
 * @param {object} preferences - Grid preferences to save
 * @param {function} updateSettings - Settings update function from context
 */
export const saveMagentoGridPreferences = (gridType, preferences, updateSettings) => {
  try {
    const gridSettingsKey = `${gridType}Settings`;
    
    updateSettings({
      gridSettings: {
        [gridSettingsKey]: {
          ...preferences,
          lastModified: Date.now()
        }
      }
    }, 'gridSettings');
    
    console.log(`✅ Saved preferences for ${gridType}:`, preferences);
  } catch (error) {
    console.error(`❌ Failed to save preferences for ${gridType}:`, error);
  }
};

/**
 * Get saved grid preferences for a specific grid type
 * @param {string} gridType - Type of Magento grid
 * @param {object} userSettings - User settings from SettingsContext
 * @returns {object} Saved grid preferences
 */
export const getMagentoGridPreferences = (gridType, userSettings = {}) => {
  try {
    const gridSettings = userSettings.gridSettings || {};
    const gridSettingsKey = `${gridType}Settings`;
    
    return gridSettings[gridSettingsKey] || {};
  } catch (error) {
    console.error(`Error getting preferences for ${gridType}:`, error);
    return {};
  }
};

export default {
  getMagentoGridConfig,
  getMagentoApiParams,
  applySettingsToGridProps,
  getErrorHandlingConfig,
  handleMagentoGridError,
  saveMagentoGridPreferences,
  getMagentoGridPreferences
};