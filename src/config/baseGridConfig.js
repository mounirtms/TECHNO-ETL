/**
 * Base Grid Configuration
 * Standardized configuration objects for different grid types
 * Provides consistent defaults and patterns across all grids
 */

import {
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Sync as SyncIcon,
  Category as CategoryIcon,
  Store as StoreIcon
} from '@mui/icons-material';

// ===== BASE TOOLBAR CONFIGURATIONS =====

export const baseToolbarConfigs = {
  default: {
    showRefresh: true,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showExport: true,
    showImport: false,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showSelection: true,
    showViewToggle: false,
    compact: false,
    size: 'medium'
  },

  magento: {
    showRefresh: true,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showSync: true,
    showExport: true,
    showImport: true,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showSelection: true,
    showViewToggle: true,
    compact: false,
    size: 'medium',
    exportOptions: {
      formats: ['csv', 'excel'],
      includeHeaders: true
    }
  },

  mdm: {
    showRefresh: true,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showSync: true,
    showExport: true,
    showImport: false,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showSelection: true,
    showViewToggle: false,
    showCustomFilters: true,
    compact: false,
    size: 'medium',
    mdmStocks: true,
    exportOptions: {
      formats: ['csv', 'excel'],
      includeHeaders: true
    }
  },

  cegid: {
    showRefresh: true,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showSync: true,
    showExport: true,
    showImport: false,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showSelection: true,
    showViewToggle: false,
    compact: false,
    size: 'medium',
    exportOptions: {
      formats: ['csv'],
      includeHeaders: true
    }
  },

  dashboard: {
    showRefresh: true,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showSync: false,
    showExport: true,
    showImport: false,
    showSearch: true,
    showFilters: true,
    showSettings: false,
    showSelection: false,
    showViewToggle: true,
    compact: true,
    size: 'small',
    exportOptions: {
      formats: ['csv', 'pdf'],
      includeHeaders: true
    }
  }
};

// ===== BASE GRID CONFIGURATIONS =====

export const baseGridConfigs = {
  default: {
    enableCache: true,
    enableI18n: true,
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableColumnReordering: true,
    enableColumnResizing: true,
    enableVirtualization: true,
    virtualizationThreshold: 1000,
    defaultPageSize: 25,
    paginationMode: 'client',
    showStatsCards: false,
    showCardView: false,
    defaultViewMode: 'grid',
    searchableFields: ['name', 'id']
  },

  magento: {
    enableCache: true,
    enableI18n: true,
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableColumnReordering: true,
    enableColumnResizing: true,
    enableVirtualization: true,
    virtualizationThreshold: 500,
    defaultPageSize: 25,
    paginationMode: 'client',
    showStatsCards: true,
    showCardView: true,
    defaultViewMode: 'grid',
    searchableFields: ['sku', 'name', 'entity_id'],
    contextMenuActions: {
      view: 'View Details',
      edit: 'Edit',
      delete: 'Delete',
      sync: 'Sync to Magento'
    }
  },

  mdm: {
    enableCache: true,
    enableI18n: true,
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableColumnReordering: true,
    enableColumnResizing: true,
    enableVirtualization: true,
    virtualizationThreshold: 1000,
    defaultPageSize: 50,
    paginationMode: 'client',
    showStatsCards: true,
    showCardView: false,
    defaultViewMode: 'grid',
    searchableFields: ['Code_MDM', 'reference', 'designation'],
    contextMenuActions: {
      view: 'View Details',
      sync: 'Sync Stock'
    }
  },

  cegid: {
    enableCache: true,
    enableI18n: true,
    enableSelection: false,
    enableSorting: true,
    enableFiltering: true,
    enableColumnReordering: false,
    enableColumnResizing: true,
    enableVirtualization: true,
    virtualizationThreshold: 2000,
    defaultPageSize: 100,
    paginationMode: 'client',
    showStatsCards: false,
    showCardView: false,
    defaultViewMode: 'grid',
    searchableFields: ['code', 'libelle']
  },

  dashboard: {
    enableCache: false,
    enableI18n: true,
    enableSelection: false,
    enableSorting: true,
    enableFiltering: false,
    enableColumnReordering: false,
    enableColumnResizing: false,
    enableVirtualization: false,
    defaultPageSize: 10,
    paginationMode: 'client',
    showStatsCards: true,
    showCardView: true,
    defaultViewMode: 'card',
    searchableFields: ['title', 'description']
  }
};

// ===== STATS CARD CONFIGURATIONS =====

export const baseStatsCardConfigs = {
  magento: {
    products: {
      title: 'Total Products',
      icon: InventoryIcon,
      color: 'primary',
      showTrend: true,
      animateValue: true
    },
    orders: {
      title: 'Total Orders',
      icon: ShoppingCartIcon,
      color: 'success',
      showTrend: true,
      animateValue: true
    },
    customers: {
      title: 'Total Customers',
      icon: PeopleIcon,
      color: 'info',
      showTrend: true,
      animateValue: true
    },
    categories: {
      title: 'Categories',
      icon: CategoryIcon,
      color: 'secondary',
      showTrend: false,
      animateValue: false
    }
  },

  mdm: {
    totalItems: {
      title: 'Total Items',
      icon: InventoryIcon,
      color: 'primary',
      showTrend: false,
      animateValue: true
    },
    syncedItems: {
      title: 'Synced Items',
      icon: SyncIcon,
      color: 'success',
      showTrend: true,
      animateValue: true
    },
    pendingSync: {
      title: 'Pending Sync',
      icon: AssessmentIcon,
      color: 'warning',
      showTrend: false,
      animateValue: true
    },
    sources: {
      title: 'Data Sources',
      icon: StoreIcon,
      color: 'info',
      showTrend: false,
      animateValue: false
    }
  },

  dashboard: {
    overview: {
      title: 'Overview',
      icon: AssessmentIcon,
      color: 'primary',
      showTrend: true,
      animateValue: true,
      clickable: true
    }
  }
};

// ===== COLUMN CONFIGURATIONS =====

export const baseColumnConfigs = {
  common: {
    id: {
      field: 'id',
      headerName: 'ID',
      width: 80,
      type: 'number',
      sortable: true,
      filterable: false,
      hideable: true,
      priority: 1
    },
    name: {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      sortable: true,
      filterable: true,
      hideable: false,
      priority: 1,
      searchable: true
    },
    createdAt: {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      type: 'dateTime',
      sortable: true,
      filterable: true,
      hideable: true,
      priority: 3
    },
    updatedAt: {
      field: 'updated_at',
      headerName: 'Updated',
      width: 150,
      type: 'dateTime',
      sortable: true,
      filterable: true,
      hideable: true,
      priority: 3
    }
  },

  magento: {
    entityId: {
      field: 'entity_id',
      headerName: 'Entity ID',
      width: 100,
      type: 'number',
      sortable: true,
      filterable: true,
      hideable: true,
      priority: 2
    },
    sku: {
      field: 'sku',
      headerName: 'SKU',
      width: 150,
      sortable: true,
      filterable: true,
      hideable: false,
      priority: 1,
      searchable: true
    },
    status: {
      field: 'status',
      headerName: 'Status',
      width: 120,
      type: 'singleSelect',
      valueOptions: ['Enabled', 'Disabled'],
      sortable: true,
      filterable: true,
      hideable: true,
      priority: 2
    },
    price: {
      field: 'price',
      headerName: 'Price',
      width: 120,
      type: 'number',
      sortable: true,
      filterable: true,
      hideable: true,
      priority: 2
    }
  },

  mdm: {
    codeMDM: {
      field: 'Code_MDM',
      headerName: 'Code MDM',
      width: 150,
      sortable: true,
      filterable: true,
      hideable: false,
      priority: 1,
      searchable: true
    },
    reference: {
      field: 'reference',
      headerName: 'Reference',
      width: 150,
      sortable: true,
      filterable: true,
      hideable: true,
      priority: 2,
      searchable: true
    },
    designation: {
      field: 'designation',
      headerName: 'Designation',
      flex: 1,
      minWidth: 200,
      sortable: true,
      filterable: true,
      hideable: false,
      priority: 1,
      searchable: true
    },
    stock: {
      field: 'stock',
      headerName: 'Stock',
      width: 100,
      type: 'number',
      sortable: true,
      filterable: true,
      hideable: true,
      priority: 2
    }
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get standard grid props for a specific grid type
 */
export const getStandardGridProps = (gridType, overrides = {}) => {
  const baseConfig = baseGridConfigs[gridType] || baseGridConfigs.default;
  const toolbarConfig = baseToolbarConfigs[gridType] || baseToolbarConfigs.default;

  return {
    ...baseConfig,
    toolbarConfig: {
      ...toolbarConfig,
      ...overrides.toolbarConfig
    },
    ...overrides
  };
};

/**
 * Get standard toolbar config for a specific grid type
 */
export const getStandardToolbarConfig = (gridType, overrides = {}) => {
  const baseConfig = baseToolbarConfigs[gridType] || baseToolbarConfigs.default;
  
  return {
    ...baseConfig,
    ...overrides
  };
};

/**
 * Get standard stats cards for a specific grid type
 */
export const getStandardStatsCards = (gridType, data = {}) => {
  const cardConfigs = baseStatsCardConfigs[gridType] || {};
  
  return Object.entries(cardConfigs).map(([key, config]) => ({
    ...config,
    value: data[key] || 0,
    key
  }));
};

/**
 * Get standard columns for a specific grid type
 */
export const getStandardColumns = (gridType, customColumns = []) => {
  const commonColumns = baseColumnConfigs.common;
  const typeColumns = baseColumnConfigs[gridType] || {};
  
  const standardColumns = {
    ...commonColumns,
    ...typeColumns
  };

  // Merge with custom columns
  const mergedColumns = [...customColumns];
  
  // Add standard columns that aren't already present
  Object.values(standardColumns).forEach(column => {
    if (!mergedColumns.find(col => col.field === column.field)) {
      mergedColumns.push(column);
    }
  });

  // Sort by priority
  return mergedColumns.sort((a, b) => (a.priority || 999) - (b.priority || 999));
};

/**
 * Create a complete grid configuration
 */
export const createGridConfig = (gridType, options = {}) => {
  const {
    customColumns = [],
    customActions = [],
    customToolbarConfig = {},
    customGridProps = {},
    statsData = {}
  } = options;

  return {
    gridType,
    gridProps: getStandardGridProps(gridType, customGridProps),
    toolbarConfig: getStandardToolbarConfig(gridType, customToolbarConfig),
    columns: getStandardColumns(gridType, customColumns),
    statsCards: getStandardStatsCards(gridType, statsData),
    customActions
  };
};

// ===== GRID TYPE DETECTION =====

/**
 * Detect grid type from grid name
 */
export const detectGridType = (gridName = '') => {
  const name = gridName.toLowerCase();
  
  if (name.includes('mdm')) return 'mdm';
  if (name.includes('cegid')) return 'cegid';
  if (name.includes('dashboard')) return 'dashboard';
  if (name.includes('magento') || name.includes('product') || name.includes('order') || name.includes('customer')) return 'magento';
  
  return 'default';
};

/**
 * Get grid configuration by name
 */
export const getGridConfigByName = (gridName, options = {}) => {
  const gridType = detectGridType(gridName);
  return createGridConfig(gridType, options);
};

// ===== EXPORT CONFIGURATIONS =====

export const gridConfigurations = {
  baseToolbarConfigs,
  baseGridConfigs,
  baseStatsCardConfigs,
  baseColumnConfigs
};

export default {
  getStandardGridProps,
  getStandardToolbarConfig,
  getStandardStatsCards,
  getStandardColumns,
  createGridConfig,
  detectGridType,
  getGridConfigByName,
  gridConfigurations
};