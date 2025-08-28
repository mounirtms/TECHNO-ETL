/**
 * Standardized Component Configuration System
 * 
 * Centralized configuration management for all components
 * Provides consistent defaults and easy customization
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import {
  GridToolbarConfig,
  GridDialogConfig,
  GridStatsConfig,
  GridPresetConfig,
  CustomAction
} from './types';

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default Grid Configuration
 */
export const DEFAULT_GRID_CONFIG = {
  // Performance settings
  virtualizationThreshold: 1000,
  rowBuffer: 10,
  columnBuffer: 2,
  
  // Pagination settings
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
  
  // Feature flags
  enableSuspense: true,
  enableErrorBoundary: true,
  enableVirtualization: true,
  enableSelection: true,
  enableSorting: true,
  enableFiltering: true,
  enableSearch: true,
  enableStats: false,
  enableActions: true,
  
  // Search configuration
  searchFields: ['name', 'sku', 'code', 'title'],
  searchDebounceMs: 300,
  
  // Cache configuration
  enableCache: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
};

/**
 * Default Toolbar Configuration
 */
export const DEFAULT_TOOLBAR_CONFIG: GridToolbarConfig = {
  showRefresh: true,
  showAdd: false,
  showEdit: false,
  showDelete: false,
  showSync: false,
  showExport: false,
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

/**
 * Default Dialog Configuration
 */
export const DEFAULT_DIALOG_CONFIG: GridDialogConfig = {
  add: {
    title: 'Add New Item',
    fields: [],
    validationRules: {}
  },
  edit: {
    title: 'Edit Item',
    fields: [],
    validationRules: {}
  },
  delete: {
    title: 'Confirm Delete',
    confirmMessage: 'Are you sure you want to delete this item?'
  }
};

/**
 * Default Stats Configuration
 */
export const DEFAULT_STATS_CONFIG: GridStatsConfig = {
  stats: [
    { key: 'total', title: 'Total', color: 'primary' },
    { key: 'active', title: 'Active', color: 'success' },
    { key: 'inactive', title: 'Inactive', color: 'warning' },
    { key: 'selected', title: 'Selected', color: 'info' }
  ]
};

// ============================================================================
// GRID TYPE CONFIGURATIONS
// ============================================================================

/**
 * Grid type specific configurations
 */
export const GRID_TYPE_CONFIGS = {
  // Magento Products Grid
  magentoProducts: {
    toolbar: {
      ...DEFAULT_TOOLBAR_CONFIG,
      showAdd: true,
      showEdit: true,
      showDelete: true,
      showSync: true,
      showImport: true,
      showExport: true
    },
    stats: {
      stats: [
        { key: 'total', title: 'Total Products', color: 'primary' },
        { key: 'active', title: 'Active', color: 'success' },
        { key: 'inactive', title: 'Inactive', color: 'warning' },
        { key: 'localProducts', title: 'Local Products', color: 'info' }
      ]
    },
    searchFields: ['name', 'sku', 'type_id', 'status'],
    enableStats: true,
    enableVirtualization: true
  },
  
  // Magento Customers Grid
  magentoCustomers: {
    toolbar: {
      ...DEFAULT_TOOLBAR_CONFIG,
      showAdd: true,
      showEdit: true,
      showDelete: true,
      showExport: true
    },
    stats: {
      stats: [
        { key: 'total', title: 'Total Customers', color: 'primary' },
        { key: 'active', title: 'Active', color: 'success' },
        { key: 'inactive', title: 'Inactive', color: 'warning' },
        { key: 'totalOrders', title: 'Total Orders', color: 'info' }
      ]
    },
    searchFields: ['firstname', 'lastname', 'email', 'group_id'],
    enableStats: true
  },
  
  // Magento Orders Grid
  magentoOrders: {
    toolbar: {
      ...DEFAULT_TOOLBAR_CONFIG,
      showAdd: false,
      showEdit: true,
      showDelete: false,
      showExport: true
    },
    stats: {
      stats: [
        { key: 'total', title: 'Total Orders', color: 'primary' },
        { key: 'pending', title: 'Pending', color: 'warning' },
        { key: 'processing', title: 'Processing', color: 'info' },
        { key: 'complete', title: 'Complete', color: 'success' }
      ]
    },
    searchFields: ['increment_id', 'status', 'customer_firstname', 'customer_lastname'],
    enableStats: true
  },
  
  // MDM Products Grid
  mdm: {
    toolbar: {
      ...DEFAULT_TOOLBAR_CONFIG,
      showSync: true,
      showSyncStocks: true,
      showSyncAll: true,
      showAdd: false,
      showEdit: false,
      showDelete: false,
      showExport: true
    },
    stats: {
      stats: [
        { key: 'total', title: 'Total Products', color: 'primary' },
        { key: 'changed', title: 'Changed', color: 'warning' },
        { key: 'synced', title: 'Synced', color: 'success' },
        { key: 'errors', title: 'Errors', color: 'error' }
      ]
    },
    searchFields: ['Code_MDM', 'Designation', 'reference', 'sku'],
    enableStats: true,
    enableVirtualization: true,
    defaultPageSize: 50
  },
  
  // CMS Pages Grid
  cmsPages: {
    toolbar: {
      ...DEFAULT_TOOLBAR_CONFIG,
      showAdd: true,
      showEdit: true,
      showDelete: true,
      showExport: true
    },
    stats: {
      stats: [
        { key: 'total', title: 'Total Pages', color: 'primary' },
        { key: 'published', title: 'Published', color: 'success' },
        { key: 'draft', title: 'Draft', color: 'warning' },
        { key: 'disabled', title: 'Disabled', color: 'error' }
      ]
    },
    searchFields: ['title', 'identifier', 'content'],
    enableStats: true
  },
  
  // Generic/Default Grid
  default: {
    toolbar: DEFAULT_TOOLBAR_CONFIG,
    stats: DEFAULT_STATS_CONFIG,
    searchFields: ['name', 'title', 'code'],
    enableStats: false
  }
};

// ============================================================================
// COMMON ACTION CONFIGURATIONS
// ============================================================================

/**
 * Standard action configurations
 */
export const STANDARD_ACTIONS = {
  refresh: {
    key: 'refresh',
    label: 'Refresh',
    color: 'primary' as const,
    variant: 'outlined' as const
  },
  add: {
    key: 'add',
    label: 'Add',
    color: 'primary' as const,
    variant: 'contained' as const
  },
  edit: {
    key: 'edit',
    label: 'Edit',
    color: 'secondary' as const,
    variant: 'outlined' as const,
    requiresSelection: true
  },
  delete: {
    key: 'delete',
    label: 'Delete',
    color: 'error' as const,
    variant: 'outlined' as const,
    requiresSelection: true
  },
  sync: {
    key: 'sync',
    label: 'Sync',
    color: 'info' as const,
    variant: 'outlined' as const
  },
  export: {
    key: 'export',
    label: 'Export',
    color: 'success' as const,
    variant: 'outlined' as const
  },
  import: {
    key: 'import',
    label: 'Import',
    color: 'warning' as const,
    variant: 'outlined' as const
  }
};

/**
 * Grid type specific custom actions
 */
export const GRID_CUSTOM_ACTIONS = {
  magentoProducts: [
    STANDARD_ACTIONS.sync,
    {
      key: 'importCsv',
      label: 'Import CSV',
      color: 'warning' as const,
      variant: 'outlined' as const
    },
    {
      key: 'bulkMediaUpload',
      label: 'Bulk Media Upload',
      color: 'info' as const,
      variant: 'outlined' as const
    },
    {
      key: 'catalogProcessor',
      label: 'Catalog Processor',
      color: 'secondary' as const,
      variant: 'outlined' as const
    }
  ],
  
  mdm: [
    {
      key: 'syncSelected',
      label: 'Sync Selected',
      color: 'primary' as const,
      variant: 'contained' as const,
      requiresSelection: true
    },
    {
      key: 'syncStocks',
      label: 'Sync Stocks',
      color: 'info' as const,
      variant: 'outlined' as const
    },
    {
      key: 'syncAll',
      label: 'Sync All',
      color: 'warning' as const,
      variant: 'outlined' as const
    }
  ],
  
  magentoCustomers: [
    STANDARD_ACTIONS.export,
    {
      key: 'newsletter',
      label: 'Newsletter Signup',
      color: 'info' as const,
      variant: 'outlined' as const,
      requiresSelection: true
    }
  ]
};

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

/**
 * Grid preset configurations
 */
export const GRID_PRESETS: Record<string, GridPresetConfig> = {
  crud: {
    enableSelection: true,
    enableSearch: true,
    enableStats: true,
    toolbarConfig: {
      ...DEFAULT_TOOLBAR_CONFIG,
      showAdd: true,
      showEdit: true,
      showDelete: true,
      showExport: true
    }
  },
  
  readonly: {
    enableSelection: false,
    enableSearch: true,
    enableStats: true,
    toolbarConfig: {
      ...DEFAULT_TOOLBAR_CONFIG,
      showAdd: false,
      showEdit: false,
      showDelete: false,
      showExport: true
    }
  },
  
  simple: {
    enableSelection: false,
    enableSearch: false,
    enableStats: false,
    toolbarConfig: {
      ...DEFAULT_TOOLBAR_CONFIG,
      showAdd: false,
      showEdit: false,
      showDelete: false,
      showExport: false,
      showSearch: false,
      showFilters: false
    }
  },
  
  management: {
    enableSelection: true,
    enableSearch: true,
    enableStats: true,
    enableVirtualization: true,
    toolbarConfig: {
      ...DEFAULT_TOOLBAR_CONFIG,
      showAdd: true,
      showEdit: true,
      showDelete: true,
      showSync: true,
      showExport: true,
      showImport: true
    }
  }
};

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

/**
 * Get configuration for a specific grid type
 */
export const getGridConfig = (gridType: string = 'default') => {
  return GRID_TYPE_CONFIGS[gridType] || GRID_TYPE_CONFIGS.default;
};

/**
 * Merge configurations with deep merge support
 */
export const mergeConfigs = <T extends Record<string, any>>(
  base: T,
  override: Partial<T>
): T => {
  const merged = { ...base } as T;
  
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      (merged as any)[key] = mergeConfigs((merged as any)[key] || {}, value);
    } else {
      (merged as any)[key] = value;
    }
  }
  
  return merged;
};

/**
 * Apply preset configuration with overrides
 */
export const applyGridPreset = (
  preset: string,
  overrides: Partial<GridPresetConfig> = {}
): GridPresetConfig => {
  const presetConfig = GRID_PRESETS[preset] || GRID_PRESETS.crud;
  return mergeConfigs(presetConfig, overrides);
};

/**
 * Get toolbar configuration for grid type
 */
export const getToolbarConfig = (
  gridType: string = 'default',
  overrides: Partial<GridToolbarConfig> = {}
): GridToolbarConfig => {
  const gridConfig = getGridConfig(gridType);
  return mergeConfigs(gridConfig.toolbar, overrides);
};

/**
 * Get stats configuration for grid type
 */
export const getStatsConfig = (
  gridType: string = 'default',
  overrides: Partial<GridStatsConfig> = {}
): GridStatsConfig => {
  const gridConfig = getGridConfig(gridType);
  return mergeConfigs(gridConfig.stats, overrides);
};

/**
 * Get custom actions for grid type
 */
export const getCustomActions = (gridType: string = 'default'): CustomAction[] => {
  return GRID_CUSTOM_ACTIONS[gridType] || [];
};

/**
 * Create complete grid configuration
 */
export const createGridConfiguration = (
  gridType: string,
  preset?: string,
  overrides: any = {}
) => {
  // Start with grid type configuration
  const typeConfig = getGridConfig(gridType);
  
  // Apply preset if specified
  let config = typeConfig;
  if (preset) {
    const presetConfig = applyGridPreset(preset);
    config = mergeConfigs(config, presetConfig);
  }
  
  // Apply custom overrides
  config = mergeConfigs(config, overrides);
  
  // Add custom actions
  const customActions = getCustomActions(gridType);
  
  return {
    ...config,
    customActions: [...customActions, ...(overrides.customActions || [])]
  };
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  DEFAULT_GRID_CONFIG,
  DEFAULT_TOOLBAR_CONFIG,
  DEFAULT_DIALOG_CONFIG,
  DEFAULT_STATS_CONFIG,
  GRID_TYPE_CONFIGS,
  STANDARD_ACTIONS,
  GRID_CUSTOM_ACTIONS,
  GRID_PRESETS,
  getGridConfig,
  mergeConfigs,
  applyGridPreset,
  getToolbarConfig,
  getStatsConfig,
  getCustomActions,
  createGridConfiguration
};