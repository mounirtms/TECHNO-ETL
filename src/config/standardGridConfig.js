/**
 * Standard Grid Configuration
 * Provides consistent configuration across all grid components
 */

/**
 * Standard grid height configuration
 * Uses fixed height calculation for consistent layout
 */
export const STANDARD_GRID_HEIGHT = 'calc(100vh - 200px)';

/**
 * Standard pagination configuration
 * Server-side pagination with consistent page sizes
 */
export const STANDARD_PAGINATION_CONFIG = {
  paginationMode: "server",
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
  rowCount: 0 // Default to 0, will be overridden by individual grids
};

/**
 * Standard toolbar configuration
 * Consistent toolbar across all grids
 */
export const STANDARD_TOOLBAR_CONFIG = {
  showRefresh: true,
  showExport: false, // Export moved to settings menu
  showSearch: true,
  showFilters: true,
  showSettings: true,
  showDensity: true,
  showColumns: true,
  exportOptions: {
    excel: true,
    csv: true,
    json: true
  }
};

/**
 * Standard feature toggles
 * Consistent features across all grids
 */
export const STANDARD_FEATURES = {
  enableCache: true,
  enableI18n: true,
  enableRTL: false, // Disabled by default, can be overridden
  enableSelection: true,
  enableSorting: true,
  enableFiltering: true,
  enableColumnReordering: true,
  enableColumnResizing: true
};

/**
 * Standard view options
 * Consistent view configuration
 */
export const STANDARD_VIEW_OPTIONS = {
  showStatsCards: true,
  showCardView: true,
  defaultViewMode: "grid"
};

/**
 * Standard grid container styling
 * Consistent layout and scrolling behavior
 */
export const STANDARD_GRID_CONTAINER_STYLES = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: STANDARD_GRID_HEIGHT,
  overflow: 'hidden'
};

/**
 * Standard grid area styling
 * Ensures only grid content scrolls
 */
export const STANDARD_GRID_AREA_STYLES = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  mb: 1
};

/**
 * Standard stats cards container styling
 * Always visible at bottom
 */
export const STANDARD_STATS_CONTAINER_STYLES = {
  flexShrink: 0,
  borderTop: '1px solid rgba(224, 224, 224, 1)',
  pt: 1,
  backgroundColor: 'background.paper'
};

/**
 * Get standard grid configuration
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
    totalCount: overrides.totalCount || 0,

    // Toolbar
    toolbarConfig: {
      ...STANDARD_TOOLBAR_CONFIG,
      ...overrides.toolbarConfig
    },

    // View options
    ...STANDARD_VIEW_OPTIONS,

    // Custom overrides
    ...overrides
  };
};

/**
 * Standard context menu actions
 * Common actions across all grids
 */
export const STANDARD_CONTEXT_MENU_ACTIONS = {
  view: {
    enabled: true,
    label: 'View Details',
    icon: 'visibility'
  },
  edit: {
    enabled: true,
    label: 'Edit',
    icon: 'edit'
  },
  delete: {
    enabled: true,
    label: 'Delete',
    icon: 'delete',
    confirmRequired: true
  }
};

/**
 * Standard error handling configuration
 */
export const STANDARD_ERROR_CONFIG = {
  showErrorBoundary: true,
  errorFallback: 'Failed to load data',
  retryEnabled: true,
  maxRetries: 3
};

/**
 * Standard loading configuration
 */
export const STANDARD_LOADING_CONFIG = {
  showLoadingOverlay: true,
  loadingMessage: 'Loading data...',
  skeletonRows: 10
};

/**
 * Get standard grid props for a specific grid type
 * @param {string} gridType - Type of grid (mdm, magento, cegid, etc.)
 * @param {Object} customConfig - Custom configuration
 * @returns {Object} Standard grid props
 */
export const getStandardGridProps = (gridType, customConfig = {}) => {
  const baseConfig = getStandardGridConfig(customConfig);
  
  // Grid-specific configurations
  const gridSpecificConfig = {
    mdm: {
      enableRTL: false,
      paginationMode: "server",
      defaultPageSize: 25
    },
    magento: {
      enableRTL: false,
      paginationMode: "server",
      defaultPageSize: 25
    },
    cegid: {
      enableRTL: false,
      paginationMode: "client",
      defaultPageSize: 50
    }
  };
  
  return {
    ...baseConfig,
    ...gridSpecificConfig[gridType],
    ...customConfig
  };
};

export default {
  STANDARD_GRID_HEIGHT,
  STANDARD_PAGINATION_CONFIG,
  STANDARD_TOOLBAR_CONFIG,
  STANDARD_FEATURES,
  STANDARD_VIEW_OPTIONS,
  STANDARD_GRID_CONTAINER_STYLES,
  STANDARD_GRID_AREA_STYLES,
  STANDARD_STATS_CONTAINER_STYLES,
  getStandardGridConfig,
  getStandardGridProps,
  STANDARD_CONTEXT_MENU_ACTIONS,
  STANDARD_ERROR_CONFIG,
  STANDARD_LOADING_CONFIG
};
