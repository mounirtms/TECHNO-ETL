/**
 * Production-Ready Grid Configuration
 * Standardized configuration for all grid components
 * Optimized for performance, consistency, and user experience
 */

// ===== LAYOUT DIMENSIONS =====
export const PRODUCTION_LAYOUT = {
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 64,
  TAB_HEADER_HEIGHT: 48,
  TOOLBAR_HEIGHT: 56,
  STATS_CARDS_HEIGHT: 120,
  FILTER_BAR_HEIGHT: 48,
  PAGINATION_HEIGHT: 52,
  PADDING: 16,
  MARGIN: 8
};

// ===== GRID PERFORMANCE SETTINGS =====
export const PERFORMANCE_CONFIG = {
  // Pagination
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
  
  // Virtualization
  ENABLE_VIRTUALIZATION: true,
  BUFFER_SIZE: 10,
  OVERSCAN: 5,
  
  // Caching
  CACHE_ENABLED: true,
  CACHE_TTL: 300000, // 5 minutes
  MAX_CACHE_SIZE: 50,
  
  // Performance thresholds
  LARGE_DATASET_THRESHOLD: 1000,
  ENABLE_LAZY_LOADING: true
};

// ===== STANDARD GRID FEATURES =====
export const STANDARD_FEATURES = {
  // Core features
  enableSorting: true,
  enableFiltering: true,
  enableColumnResize: true,
  enableColumnReorder: true,
  enableRowSelection: true,
  
  // Advanced features
  enableExport: false, // Disabled by default for performance
  enableImport: false, // Disabled by default for security
  enableBulkActions: true,
  enableContextMenu: true,
  enableSearch: true,
  
  // UI features
  enableDensitySelector: true,
  enableColumnVisibility: true,
  enableFullscreen: false, // Disabled for consistency
  enableRefresh: true,
  
  // Stats and analytics
  showStatsCards: false, // Default false, enable per grid
  showRowCount: true,
  showLoadingIndicator: true
};

// ===== TOOLBAR CONFIGURATION =====
export const PRODUCTION_TOOLBAR = {
  // Primary actions
  showAdd: true,
  showEdit: true,
  showDelete: true,
  showRefresh: true,
  showSearch: true,
  
  // Secondary actions
  showExport: false, // Disabled by default
  showImport: false, // Disabled by default
  showFilters: true,
  showSettings: true,
  showViewToggle: false, // Simplified for production
  
  // Bulk actions
  showBulkActions: true,
  showSelectAll: true,
  
  // Layout
  compact: true,
  responsive: true
};

// ===== COLUMN DEFAULTS =====
export const COLUMN_DEFAULTS = {
  sortable: true,
  filterable: true,
  resizable: true,
  hideable: true,
  minWidth: 80,
  maxWidth: 400,
  flex: 0,
  
  // Text columns
  textColumn: {
    type: 'string',
    align: 'left',
    headerAlign: 'left'
  },
  
  // Number columns
  numberColumn: {
    type: 'number',
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (params) => {
      if (params.value == null) return '';
      return new Intl.NumberFormat().format(params.value);
    }
  },
  
  // Date columns
  dateColumn: {
    type: 'date',
    align: 'center',
    headerAlign: 'center',
    valueFormatter: (params) => {
      if (!params.value) return '';
      return new Date(params.value).toLocaleDateString();
    }
  },
  
  // Boolean columns
  booleanColumn: {
    type: 'boolean',
    align: 'center',
    headerAlign: 'center',
    width: 100
  },
  
  // Action columns
  actionColumn: {
    sortable: false,
    filterable: false,
    resizable: false,
    hideable: false,
    disableExport: true,
    width: 120,
    align: 'center',
    headerAlign: 'center'
  }
};

// ===== THEME CONFIGURATION =====
export const PRODUCTION_THEME = {
  // Grid styling
  density: 'standard', // standard | compact | comfortable
  showBorders: true,
  alternateRowColors: true,
  
  // Colors
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  successColor: '#2e7d32',
  warningColor: '#ed6c02',
  errorColor: '#d32f2f',
  
  // Typography
  fontSize: 14,
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  
  // Spacing
  cellPadding: 16,
  headerHeight: 56,
  rowHeight: 52
};

// ===== RESPONSIVE BREAKPOINTS =====
export const RESPONSIVE_CONFIG = {
  mobile: {
    maxWidth: 768,
    pageSize: 10,
    hideColumns: ['description', 'details', 'metadata'],
    compactToolbar: true,
    stackedLayout: true
  },
  
  tablet: {
    maxWidth: 1024,
    pageSize: 25,
    hideColumns: ['metadata'],
    compactToolbar: false,
    stackedLayout: false
  },
  
  desktop: {
    minWidth: 1025,
    pageSize: 50,
    hideColumns: [],
    compactToolbar: false,
    stackedLayout: false
  }
};

// ===== ACCESSIBILITY CONFIGURATION =====
export const ACCESSIBILITY_CONFIG = {
  enableKeyboardNavigation: true,
  enableScreenReader: true,
  enableHighContrast: false,
  enableFocusIndicators: true,
  
  // ARIA labels
  ariaLabels: {
    grid: 'Data grid',
    toolbar: 'Grid toolbar',
    pagination: 'Grid pagination',
    columnHeader: 'Column header',
    cell: 'Grid cell',
    row: 'Grid row'
  }
};

// ===== VALIDATION RULES =====
export const VALIDATION_CONFIG = {
  // Required fields validation
  validateRequired: true,
  requiredMessage: 'This field is required',
  
  // Data type validation
  validateDataTypes: true,
  
  // Custom validation
  enableCustomValidation: true,
  
  // Error handling
  showInlineErrors: true,
  showErrorSummary: false
};

// ===== EXPORT CONFIGURATION =====
export const EXPORT_CONFIG = {
  // Supported formats
  supportedFormats: ['csv', 'xlsx', 'pdf'],
  defaultFormat: 'csv',
  
  // Export options
  includeHeaders: true,
  includeFilters: false,
  includeHiddenColumns: false,
  maxExportRows: 10000,
  
  // File naming
  fileNameTemplate: '{gridName}_{timestamp}',
  timestampFormat: 'YYYY-MM-DD_HH-mm-ss'
};

// ===== SECURITY CONFIGURATION =====
export const SECURITY_CONFIG = {
  // Data protection
  enableDataMasking: false,
  sensitiveFields: [],
  
  // User permissions
  enableRoleBasedAccess: true,
  defaultPermissions: {
    read: true,
    create: false,
    update: false,
    delete: false,
    export: false,
    import: false
  },
  
  // Audit
  enableAuditLog: true,
  logActions: ['create', 'update', 'delete', 'export']
};

// ===== PRODUCTION GRID FACTORY =====
export const createProductionGridConfig = (gridType, customConfig = {}) => {
  const baseConfig = {
    // Layout
    layout: PRODUCTION_LAYOUT,
    
    // Performance
    performance: PERFORMANCE_CONFIG,
    
    // Features
    features: { ...STANDARD_FEATURES, ...customConfig.features },
    
    // Toolbar
    toolbar: { ...PRODUCTION_TOOLBAR, ...customConfig.toolbar },
    
    // Columns
    columnDefaults: COLUMN_DEFAULTS,
    
    // Theme
    theme: PRODUCTION_THEME,
    
    // Responsive
    responsive: RESPONSIVE_CONFIG,
    
    // Accessibility
    accessibility: ACCESSIBILITY_CONFIG,
    
    // Validation
    validation: VALIDATION_CONFIG,
    
    // Export
    export: EXPORT_CONFIG,
    
    // Security
    security: SECURITY_CONFIG
  };
  
  // Grid-specific overrides
  switch (gridType) {
    case 'mdm':
      return {
        ...baseConfig,
        features: {
          ...baseConfig.features,
          showStatsCards: true,
          enableBulkActions: true
        },
        toolbar: {
          ...baseConfig.toolbar,
          showImport: true,
          showExport: true
        }
      };
      
    case 'magento':
      return {
        ...baseConfig,
        features: {
          ...baseConfig.features,
          enableSearch: true,
          showStatsCards: false
        },
        performance: {
          ...baseConfig.performance,
          DEFAULT_PAGE_SIZE: 50
        }
      };
      
    case 'dashboard':
      return {
        ...baseConfig,
        features: {
          ...baseConfig.features,
          showStatsCards: true,
          enableExport: false
        },
        theme: {
          ...baseConfig.theme,
          density: 'compact'
        }
      };
      
    default:
      return baseConfig;
  }
};
