/**
 * Standard Toolbar Configuration
 * Provides consistent toolbar configuration across all grid components
 */

/**
 * Standard toolbar configuration for different grid types
 */
export const STANDARD_TOOLBAR_CONFIGS = {
  // MDM Grid Toolbar Configuration
  mdm: {
    showRefresh: true,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showExport: true,
    showImport: false,
    showSync: false,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showSelection: true,
    showViewToggle: true,
    showCustomFilters: true,
    compact: false,
    size: 'medium',
    // MDM-specific features
    mdmStocks: true,
    showSyncStocks: true,
    showSyncAll: true
  },
  
  // Magento Grid Toolbar Configuration
  magento: {
    showRefresh: true,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showExport: false,
    showImport: false,
    showSync: true,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showSelection: true,
    showViewToggle: true,
    showCustomFilters: false,
    compact: false,
    size: 'medium',
    // Magento-specific features
    mdmStocks: false,
    showSyncStocks: false,
    showSyncAll: false
  },
  
  // Cegid Grid Toolbar Configuration
  cegid: {
    showRefresh: true,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showExport: true,
    showImport: false,
    showSync: false,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showSelection: false,
    showViewToggle: false,
    showCustomFilters: true,
    compact: false,
    size: 'medium',
    // Cegid-specific features
    mdmStocks: false,
    showSyncStocks: false,
    showSyncAll: false
  },
  
  // Dashboard Grid Toolbar Configuration
  dashboard: {
    showRefresh: true,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showExport: true,
    showImport: false,
    showSync: false,
    showSearch: false,
    showFilters: false,
    showSettings: true,
    showSelection: false,
    showViewToggle: false,
    showCustomFilters: false,
    compact: true,
    size: 'small',
    // Dashboard-specific features
    mdmStocks: false,
    showSyncStocks: false,
    showSyncAll: false
  }
};

/**
 * Get standard toolbar configuration for a specific grid type
 * @param {string} gridType - Type of grid (mdm, magento, cegid, dashboard)
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} Complete toolbar configuration
 */
export const getStandardToolbarConfig = (gridType, overrides = {}) => {
  const baseConfig = STANDARD_TOOLBAR_CONFIGS[gridType] || STANDARD_TOOLBAR_CONFIGS.magento;
  
  return {
    ...baseConfig,
    ...overrides
  };
};

/**
 * Standard action handlers configuration
 */
export const STANDARD_ACTION_HANDLERS = {
  // Common handlers
  onRefresh: null,
  onAdd: null,
  onEdit: null,
  onDelete: null,
  onSync: null,
  onExport: null,
  onImport: null,
  onSearch: null,
  onFiltersToggle: null,
  
  // MDM-specific handlers
  onSyncStocks: null,
  onSyncAll: null,
  
  // Custom handlers
  onInfo: null,
  onSettings: null
};

/**
 * Standard custom actions for different grid types
 */
export const STANDARD_CUSTOM_ACTIONS = {
  mdm: [
    {
      id: 'syncStocks',
      label: 'Mark Changed Stocks',
      icon: 'AutorenewIcon',
      variant: 'outlined',
      color: 'warning',
      tooltip: 'Mark changed stocks for synchronization',
      requiresSelection: false,
      mdmOnly: true
    },
    {
      id: 'syncAll',
      label: 'Sync All',
      icon: 'SyncIcon',
      variant: 'outlined',
      color: 'secondary',
      tooltip: 'Synchronize all data',
      requiresSelection: false,
      mdmOnly: true
    }
  ],
  
  magento: [
    {
      id: 'bulkSync',
      label: 'Bulk Sync',
      icon: 'SyncIcon',
      variant: 'outlined',
      color: 'primary',
      tooltip: 'Sync selected items to Magento',
      requiresSelection: true,
      magentoOnly: true
    }
  ],
  
  cegid: [],
  
  dashboard: []
};

/**
 * Standard filter configurations
 */
export const STANDARD_FILTER_CONFIGS = {
  mdm: {
    showCustomFilters: true,
    showSourceFilter: true,
    showBranchFilter: true,
    showChangedOnlyFilter: true,
    customFilters: [
      { value: 'all', label: 'All Products' },
      { value: 'inStock', label: 'In Stock' },
      { value: 'outOfStock', label: 'Out of Stock' },
      { value: 'changed', label: 'Recently Changed' }
    ]
  },
  
  magento: {
    showCustomFilters: true,
    showSourceFilter: false,
    showBranchFilter: false,
    showChangedOnlyFilter: false,
    customFilters: [
      { value: 'all', label: 'All Products' },
      { value: 'enabled', label: 'Enabled' },
      { value: 'disabled', label: 'Disabled' },
      { value: 'local', label: 'Local Products' }
    ]
  },
  
  cegid: {
    showCustomFilters: true,
    showSourceFilter: false,
    showBranchFilter: false,
    showChangedOnlyFilter: false,
    customFilters: [
      { value: 'all', label: 'All Items' },
      { value: 'available', label: 'Available' },
      { value: 'unavailable', label: 'Unavailable' }
    ]
  },
  
  dashboard: {
    showCustomFilters: false,
    showSourceFilter: false,
    showBranchFilter: false,
    showChangedOnlyFilter: false,
    customFilters: []
  }
};

/**
 * Get standard filter configuration for a specific grid type
 * @param {string} gridType - Type of grid
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} Filter configuration
 */
export const getStandardFilterConfig = (gridType, overrides = {}) => {
  const baseConfig = STANDARD_FILTER_CONFIGS[gridType] || STANDARD_FILTER_CONFIGS.magento;
  
  return {
    ...baseConfig,
    ...overrides
  };
};

/**
 * Standard export options
 */
export const STANDARD_EXPORT_OPTIONS = {
  excel: {
    enabled: true,
    label: 'Export to Excel',
    format: 'xlsx',
    icon: 'FileDownloadIcon'
  },
  csv: {
    enabled: true,
    label: 'Export to CSV',
    format: 'csv',
    icon: 'FileDownloadIcon'
  },
  json: {
    enabled: true,
    label: 'Export to JSON',
    format: 'json',
    icon: 'FileDownloadIcon'
  },
  pdf: {
    enabled: false,
    label: 'Export to PDF',
    format: 'pdf',
    icon: 'PictureAsPdfIcon'
  }
};

/**
 * Create complete toolbar configuration for a grid
 * @param {string} gridType - Type of grid
 * @param {Object} customConfig - Custom configuration
 * @returns {Object} Complete toolbar configuration
 */
export const createToolbarConfig = (gridType, customConfig = {}) => {
  const toolbarConfig = getStandardToolbarConfig(gridType, customConfig??.toolbar);
  const filterConfig = getStandardFilterConfig(gridType, customConfig??.filters);
  const customActions = STANDARD_CUSTOM_ACTIONS[gridType] || [];
  
  return {
    toolbar: toolbarConfig,
    filters: filterConfig,
    customActions: customActions,
    exportOptions: STANDARD_EXPORT_OPTIONS,
    handlers: {
      ...STANDARD_ACTION_HANDLERS,
      ...customConfig??.handlers
    }
  };
};

export default {
  STANDARD_TOOLBAR_CONFIGS,
  getStandardToolbarConfig,
  STANDARD_CUSTOM_ACTIONS,
  STANDARD_FILTER_CONFIGS,
  getStandardFilterConfig,
  STANDARD_EXPORT_OPTIONS,
  createToolbarConfig
};
