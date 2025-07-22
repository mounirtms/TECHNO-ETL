/**
 * UNIFIED GRID CONFIGURATION SYSTEM
 * Single source of truth for all grid configurations
 * This file consolidates all grid configuration logic
 */

// ===== STANDARD PAGINATION CONFIG =====
export const STANDARD_PAGINATION_CONFIG = {
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
  showSizeSelector: true,
  paginationMode: "client" // Default to client-side, can be overridden
};

// ===== STANDARD FEATURES CONFIG =====
export const STANDARD_FEATURES = {
  enableCache: true,
  enableI18n: true,
  enableRTL: false, // Disabled by default for performance
  enableVirtualization: true,
  enableSelection: true,
  enableSorting: true,
  enableFiltering: true,
  enableColumnReordering: true,
  enableColumnResizing: true,
  checkboxSelection: true,
  disableRowSelectionOnClick: false,
  showStatsCards: false, // Default to false, grids can override
  showCardView: true,
  defaultViewMode: "grid"
};

// ===== STANDARD TOOLBAR CONFIG =====
export const STANDARD_TOOLBAR_CONFIG = {
  showRefresh: true,
  showAdd: false,
  showEdit: false,
  showDelete: false,
  showSync: false,
  showExport: false, // Moved to settings menu
  showImport: false,
  showSearch: true,
  showFilters: true,
  showSettings: true,
  showDensity: true,
  showColumns: true,
  showViewToggle: true,
  showSelection: false,
  compact: false,
  size: 'medium',
  spacing: 1,
  exportOptions: {
    excel: true,
    csv: true,
    json: true
  }
};

// ===== PERFORMANCE CONFIG =====
export const PERFORMANCE_CONFIG = {
  virtualizationThreshold: 1000,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  batchSize: 100,
  debounceDelay: 300,
  enableMemoization: true,

  // Virtualization settings
  rowBuffer: 10,
  columnBuffer: 2,
  rowThreshold: 3,
  columnThreshold: 3,

  // Memory management
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  gcThreshold: 0.8, // Trigger GC at 80% memory usage

  // Rendering optimizations
  enableLazyLoading: true,
  enableProgressiveLoading: true,
  chunkSize: 50
};

// ===== CONTEXT MENU ACTIONS =====
export const STANDARD_CONTEXT_MENU_ACTIONS = {
  view: {
    enabled: true,
    icon: 'visibility',
    label: 'View Details'
  },
  edit: {
    enabled: false,
    icon: 'edit',
    label: 'Edit'
  },
  delete: {
    enabled: false,
    icon: 'delete',
    label: 'Delete'
  }
};

// ===== BASE GRID CONFIG (Legacy compatibility) =====
export const BASE_GRID_CONFIG = {
  pagination: STANDARD_PAGINATION_CONFIG,
  features: STANDARD_FEATURES,
  toolbar: STANDARD_TOOLBAR_CONFIG,
  performance: PERFORMANCE_CONFIG
};

// ===== GRID-SPECIFIC TOOLBAR CONFIGURATIONS =====
export const GRID_TOOLBAR_CONFIGS = {
  mdm: {
    ...STANDARD_TOOLBAR_CONFIG,
    showSync: true,
    showSyncStocks: true,
    showSyncAll: true,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    customActions: ['sync-selected', 'sync-stocks', 'sync-all']
  },

  magentoProducts: {
    ...STANDARD_TOOLBAR_CONFIG,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showSync: true,
    showImport: true,
    customActions: ['add', 'edit', 'delete', 'sync', 'import']
  },

  magentoOrders: {
    ...STANDARD_TOOLBAR_CONFIG,
    showAdd: false,
    showEdit: true,
    showDelete: false,
    showSync: false,
    customActions: ['edit', 'cancel', 'fulfill']
  },

  magentoCustomers: {
    ...STANDARD_TOOLBAR_CONFIG,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showSync: false,
    customActions: ['add', 'edit', 'delete']
  },

  cmsPages: {
    ...STANDARD_TOOLBAR_CONFIG,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showSync: false,
    customActions: ['add', 'edit', 'delete']
  },

  sources: {
    ...STANDARD_TOOLBAR_CONFIG,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showSync: false,
    customActions: []
  },

  cegid: {
    ...STANDARD_TOOLBAR_CONFIG,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showSync: false,
    customActions: []
  }
};

// ===== GRID-SPECIFIC CONFIGURATIONS =====
export const GRID_CONFIGS = {
  // MDM Products Grid
  mdm: {
    ...BASE_GRID_CONFIG,
    pagination: {
      ...STANDARD_PAGINATION_CONFIG,
      defaultPageSize: 50
    },
    toolbar: GRID_TOOLBAR_CONFIGS.mdm,
    features: {
      ...STANDARD_FEATURES,
      showStatsCards: true,
      enableBulkActions: true
    },
    performance: {
      ...PERFORMANCE_CONFIG,
      virtualizationThreshold: 500, // Lower threshold for MDM due to complex data
      enableProgressiveLoading: true,
      chunkSize: 25
    },
    contextMenuActions: {
      ...STANDARD_CONTEXT_MENU_ACTIONS,
      sync: { enabled: true, icon: 'sync', label: 'Sync to Magento' }
    }
  },

  // Magento Products Grid
  magentoProducts: {
    ...BASE_GRID_CONFIG,
    toolbar: GRID_TOOLBAR_CONFIGS.magentoProducts,
    features: {
      ...STANDARD_FEATURES,
      showStatsCards: true
    },
    performance: {
      ...PERFORMANCE_CONFIG,
      virtualizationThreshold: 750, // Medium threshold for product grids
      enableLazyLoading: true
    },
    contextMenuActions: {
      ...STANDARD_CONTEXT_MENU_ACTIONS,
      edit: { enabled: true, icon: 'edit', label: 'Edit Product' },
      delete: { enabled: true, icon: 'delete', label: 'Delete Product' }
    }
  },

  // Magento Orders Grid
  magentoOrders: {
    ...BASE_GRID_CONFIG,
    toolbar: GRID_TOOLBAR_CONFIGS.magentoOrders,
    features: {
      ...STANDARD_FEATURES,
      showStatsCards: true
    },
    contextMenuActions: {
      ...STANDARD_CONTEXT_MENU_ACTIONS,
      edit: { enabled: true, icon: 'edit', label: 'Edit Order' }
    }
  },

  // Magento Customers Grid
  magentoCustomers: {
    ...BASE_GRID_CONFIG,
    toolbar: GRID_TOOLBAR_CONFIGS.magentoCustomers,
    features: {
      ...STANDARD_FEATURES,
      showStatsCards: true
    },
    contextMenuActions: {
      ...STANDARD_CONTEXT_MENU_ACTIONS,
      edit: { enabled: true, icon: 'edit', label: 'Edit Customer' },
      delete: { enabled: true, icon: 'delete', label: 'Delete Customer' }
    }
  },

  // CMS Pages/Blocks Grid
  cmsPages: {
    ...BASE_GRID_CONFIG,
    toolbar: GRID_TOOLBAR_CONFIGS.cmsPages,
    contextMenuActions: {
      ...STANDARD_CONTEXT_MENU_ACTIONS,
      edit: { enabled: true, icon: 'edit', label: 'Edit Page' },
      delete: { enabled: true, icon: 'delete', label: 'Delete Page' }
    }
  },

  // Sources Grid
  sources: {
    ...BASE_GRID_CONFIG,
    toolbar: GRID_TOOLBAR_CONFIGS.sources,
    features: {
      ...STANDARD_FEATURES,
      showStatsCards: true
    }
  },

  // Cegid Grid
  cegid: {
    ...BASE_GRID_CONFIG,
    toolbar: GRID_TOOLBAR_CONFIGS.cegid,
    features: {
      ...STANDARD_FEATURES,
      enableRTL: false,
      paginationMode: "client",
      defaultPageSize: 50
    }
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get grid configuration by type
 */
export const getGridConfig = (gridType) => {
  return GRID_CONFIGS[gridType] || BASE_GRID_CONFIG;
};

/**
 * Get standard grid props with configuration
 * This is the main function used by all grids to get their configuration
 */
export const getStandardGridProps = (gridType, overrides = {}) => {
  const config = getGridConfig(gridType);

  return {
    // Core grid features
    enableCache: config.features.enableCache,
    enableI18n: config.features.enableI18n,
    enableRTL: config.features.enableRTL,
    enableVirtualization: config.features.enableVirtualization,
    enableSelection: config.features.enableSelection,
    enableSorting: config.features.enableSorting,
    enableFiltering: config.features.enableFiltering,
    enableColumnReordering: config.features.enableColumnReordering,
    enableColumnResizing: config.features.enableColumnResizing,
    checkboxSelection: config.features.checkboxSelection,
    disableRowSelectionOnClick: config.features.disableRowSelectionOnClick,

    // View options
    showStatsCards: config.features.showStatsCards,
    showCardView: config.features.showCardView,
    defaultViewMode: config.features.defaultViewMode,

    // Pagination
    paginationModel: {
      page: 0,
      pageSize: config.pagination.defaultPageSize
    },
    pageSizeOptions: config.pagination.pageSizeOptions,
    paginationMode: config.pagination.paginationMode,

    // Performance optimizations
    virtualizationThreshold: config.performance?.virtualizationThreshold || PERFORMANCE_CONFIG.virtualizationThreshold,
    rowBuffer: config.performance?.rowBuffer || PERFORMANCE_CONFIG.rowBuffer,
    columnBuffer: config.performance?.columnBuffer || PERFORMANCE_CONFIG.columnBuffer,
    rowThreshold: config.performance?.rowThreshold || PERFORMANCE_CONFIG.rowThreshold,
    columnThreshold: config.performance?.columnThreshold || PERFORMANCE_CONFIG.columnThreshold,
    enableLazyLoading: config.performance?.enableLazyLoading || PERFORMANCE_CONFIG.enableLazyLoading,
    enableProgressiveLoading: config.performance?.enableProgressiveLoading || PERFORMANCE_CONFIG.enableProgressiveLoading,
    chunkSize: config.performance?.chunkSize || PERFORMANCE_CONFIG.chunkSize,

    // Context menu
    contextMenuActions: config.contextMenuActions || STANDARD_CONTEXT_MENU_ACTIONS,

    // Apply overrides last to allow customization
    ...overrides
  };
};

/**
 * Get standard toolbar configuration
 * Returns the toolbar configuration for a specific grid type
 */
export const getStandardToolbarConfig = (gridType, overrides = {}) => {
  const config = getGridConfig(gridType);
  const toolbarConfig = config.toolbar || STANDARD_TOOLBAR_CONFIG;

  return {
    // Basic toolbar features
    showRefresh: toolbarConfig.showRefresh,
    showAdd: toolbarConfig.showAdd,
    showEdit: toolbarConfig.showEdit,
    showDelete: toolbarConfig.showDelete,
    showSync: toolbarConfig.showSync,
    showExport: toolbarConfig.showExport,
    showImport: toolbarConfig.showImport,
    showSearch: toolbarConfig.showSearch,
    showFilters: toolbarConfig.showFilters,
    showSettings: toolbarConfig.showSettings,
    showDensity: toolbarConfig.showDensity,
    showColumns: toolbarConfig.showColumns,
    showViewToggle: toolbarConfig.showViewToggle,
    showSelection: toolbarConfig.showSelection,

    // Layout options
    compact: toolbarConfig.compact,
    size: toolbarConfig.size,
    spacing: toolbarConfig.spacing,

    // Export options
    exportOptions: toolbarConfig.exportOptions,

    // Custom actions
    customActions: toolbarConfig.customActions || [],

    // MDM-specific features
    showSyncAll: toolbarConfig.showSyncAll,
    showSyncStocks: toolbarConfig.showSyncStocks,

    // Apply overrides
    ...overrides
  };
};

/**
 * Get context menu actions for a grid type
 */
export const getStandardContextMenuActions = (gridType, overrides = {}) => {
  const config = getGridConfig(gridType);
  return {
    ...STANDARD_CONTEXT_MENU_ACTIONS,
    ...config.contextMenuActions,
    ...overrides
  };
};

/**
 * Validate grid configuration
 */
export const validateGridConfig = (gridType, config) => {
  const errors = [];
  const warnings = [];

  // Required validations
  if (!gridType) {
    errors.push('Grid type is required');
  } else if (!GRID_CONFIGS[gridType]) {
    warnings.push(`Unknown grid type: ${gridType}. Using default configuration.`);
  }

  if (!config) {
    errors.push('Grid configuration is required');
    return { isValid: false, errors, warnings };
  }

  // Features validation
  if (config.features) {
    if (typeof config.features.enableVirtualization !== 'undefined' && typeof config.features.enableVirtualization !== 'boolean') {
      errors.push('features.enableVirtualization must be a boolean');
    }
    if (typeof config.features.enableCache !== 'undefined' && typeof config.features.enableCache !== 'boolean') {
      errors.push('features.enableCache must be a boolean');
    }
  }

  // Toolbar validation
  if (config.toolbar) {
    const requiredToolbarProps = ['showRefresh', 'showSearch', 'showSettings'];
    requiredToolbarProps.forEach(prop => {
      if (typeof config.toolbar[prop] !== 'undefined' && typeof config.toolbar[prop] !== 'boolean') {
        errors.push(`toolbar.${prop} must be a boolean`);
      }
    });
  }

  // Performance validation
  if (config.performance) {
    if (config.performance.virtualizationThreshold && typeof config.performance.virtualizationThreshold !== 'number') {
      errors.push('performance.virtualizationThreshold must be a number');
    }
    if (config.performance.cacheTimeout && typeof config.performance.cacheTimeout !== 'number') {
      errors.push('performance.cacheTimeout must be a number');
    }
  }

  // Pagination validation
  if (config.pagination) {
    if (config.pagination.defaultPageSize && typeof config.pagination.defaultPageSize !== 'number') {
      errors.push('pagination.defaultPageSize must be a number');
    }
    if (config.pagination.pageSizeOptions && !Array.isArray(config.pagination.pageSizeOptions)) {
      errors.push('pagination.pageSizeOptions must be an array');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate grid props before rendering
 */
export const validateGridProps = (props) => {
  const errors = [];
  const warnings = [];

  // Required props
  if (!props.gridName) {
    errors.push('gridName is required');
  }

  if (!props.columns || !Array.isArray(props.columns)) {
    errors.push('columns must be an array');
  }

  if (!props.data || !Array.isArray(props.data)) {
    errors.push('data must be an array');
  }

  // Performance warnings
  if (props.data && props.data.length > 1000 && !props.enableVirtualization) {
    warnings.push('Large dataset detected. Consider enabling virtualization for better performance.');
  }

  if (props.columns && props.columns.length > 20) {
    warnings.push('Many columns detected. Consider using column grouping or hiding less important columns.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Sanitize and normalize grid configuration
 */
export const sanitizeGridConfig = (config) => {
  const sanitized = { ...config };

  // Ensure required properties exist
  if (!sanitized.features) {
    sanitized.features = { ...STANDARD_FEATURES };
  }

  if (!sanitized.toolbar) {
    sanitized.toolbar = { ...STANDARD_TOOLBAR_CONFIG };
  }

  if (!sanitized.pagination) {
    sanitized.pagination = { ...STANDARD_PAGINATION_CONFIG };
  }

  if (!sanitized.performance) {
    sanitized.performance = { ...PERFORMANCE_CONFIG };
  }

  // Sanitize numeric values
  if (sanitized.pagination.defaultPageSize) {
    sanitized.pagination.defaultPageSize = Math.max(1, Math.min(1000, sanitized.pagination.defaultPageSize));
  }

  if (sanitized.performance.virtualizationThreshold) {
    sanitized.performance.virtualizationThreshold = Math.max(100, sanitized.performance.virtualizationThreshold);
  }

  return sanitized;
};

// ===== EXPORTS =====
export default {
  // Configuration objects
  STANDARD_PAGINATION_CONFIG,
  STANDARD_FEATURES,
  STANDARD_TOOLBAR_CONFIG,
  PERFORMANCE_CONFIG,
  STANDARD_CONTEXT_MENU_ACTIONS,
  GRID_TOOLBAR_CONFIGS,
  GRID_CONFIGS,
  BASE_GRID_CONFIG,

  // Utility functions
  getGridConfig,
  getStandardGridProps,
  getStandardToolbarConfig,
  getStandardContextMenuActions,
  validateGridConfig,
  validateGridProps,
  sanitizeGridConfig
};
