/**
 * DEPRECATED: Standard Grid Configuration
 *
 * This file is deprecated and will be removed in a future version.
 * Please use src/config/gridConfig.js instead for all grid configurations.
 *
 * This file now re-exports from the unified gridConfig.js to maintain
 * backward compatibility during the transition period.
 */

// Import from the unified configuration
import {
  STANDARD_PAGINATION_CONFIG as _STANDARD_PAGINATION_CONFIG,
  STANDARD_TOOLBAR_CONFIG as _STANDARD_TOOLBAR_CONFIG,
  STANDARD_FEATURES as _STANDARD_FEATURES,
  GRID_TOOLBAR_CONFIGS as _GRID_TOOLBAR_CONFIGS,
  getStandardGridProps as _getStandardGridProps,
  getStandardToolbarConfig as _getStandardToolbarConfig,
  getGridConfig as _getGridConfig,
  STANDARD_CONTEXT_MENU_ACTIONS as _STANDARD_CONTEXT_MENU_ACTIONS
} from './gridConfig.js';

// Re-export for backward compatibility
export const STANDARD_PAGINATION_CONFIG = {
  ..._STANDARD_PAGINATION_CONFIG,
  paginationMode: "server", // Override default for backward compatibility
  rowCount: 0 // Default to 0, will be overridden by individual grids
};

export const STANDARD_TOOLBAR_CONFIG = _STANDARD_TOOLBAR_CONFIG;
export const STANDARD_FEATURES = _STANDARD_FEATURES;
export const GRID_TOOLBAR_CONFIGS = _GRID_TOOLBAR_CONFIGS;
export const STANDARD_CONTEXT_MENU_ACTIONS = _STANDARD_CONTEXT_MENU_ACTIONS;

// Additional backward compatibility exports
export const STANDARD_VIEW_OPTIONS = {
  showStatsCards: false,
  showCardView: true,
  defaultViewMode: "grid"
};

export const STANDARD_GRID_CONTAINER_STYLES = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

export const STANDARD_GRID_AREA_STYLES = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  mb: 1
};

export const STANDARD_STATS_CONTAINER_STYLES = {
  flexShrink: 0,
  borderTop: '1px solid rgba(224, 224, 224, 1)',
  pt: 1,
  backgroundColor: 'background.paper'
};

export const STANDARD_ERROR_CONFIG = {
  showErrorBoundary: true,
  errorFallback: 'Failed to load data',
  retryEnabled: true,
  maxRetries: 3
};

export const STANDARD_LOADING_CONFIG = {
  showLoadingOverlay: true,
  loadingMessage: 'Loading data...',
  skeletonRows: 10
};

/**
 * Get standard grid configuration (backward compatibility)
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} Complete grid configuration
 */
export const getStandardGridConfig = (overrides = {}) => {
  return {
    // Core features
    ...STANDARD_FEATURES,

    // Pagination with proper rowCount handling
    ...STANDARD_PAGINATION_CONFIG,
    // Ensure totalCount is properly set for server pagination
    totalCount: overrides?..totalCount || 0,

    // Toolbar
    toolbarConfig: {
      ...STANDARD_TOOLBAR_CONFIG,
      ...overrides??.toolbarConfig
    },

    // View options
    ...STANDARD_VIEW_OPTIONS,

    // Custom overrides
    ...overrides
  };
};

/**
 * Get standard toolbar configuration for a specific grid type (backward compatibility)
 * @param {string} gridType - Type of grid (mdm, magentoProducts, etc.)
 * @param {Object} overrides - Optional overrides for specific toolbar props
 * @returns {Object} Toolbar configuration
 */
export const getStandardToolbarConfig = (gridType = 'default', overrides = {}) => {
  return _getStandardToolbarConfig(gridType, overrides);
};

/**
 * Get standard grid props for a specific grid type (backward compatibility)
 * @param {string} gridType - Type of grid (mdm, magento, cegid, etc.)
 * @param {Object} customConfig - Custom configuration
 * @returns {Object} Standard grid props
 */
export const getStandardGridProps = (gridType, customConfig = {}) => {
  // Map legacy grid types to new ones
  const gridTypeMapping = {
    'magento': 'magentoProducts',
    'customers': 'magentoCustomers',
    'orders': 'magentoOrders'
  };

  const mappedGridType = gridTypeMapping[gridType] || gridType;

  // Use the unified configuration with server-side pagination override for backward compatibility
  const props = _getStandardGridProps(mappedGridType, customConfig);

  // Override pagination mode for backward compatibility
  return {
    ...props,
    paginationMode: "server",
    totalCount: customConfig?..totalCount || 0
  };
};

// Default export for backward compatibility
export default {
  STANDARD_PAGINATION_CONFIG,
  STANDARD_TOOLBAR_CONFIG,
  GRID_TOOLBAR_CONFIGS,
  STANDARD_FEATURES,
  STANDARD_VIEW_OPTIONS,
  STANDARD_GRID_CONTAINER_STYLES,
  STANDARD_GRID_AREA_STYLES,
  STANDARD_STATS_CONTAINER_STYLES,
  getStandardGridConfig,
  getStandardGridProps,
  getStandardToolbarConfig,
  STANDARD_CONTEXT_MENU_ACTIONS,
  STANDARD_ERROR_CONFIG,
  STANDARD_LOADING_CONFIG
};
