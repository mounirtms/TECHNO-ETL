/**
 * Standard Grid Template Configuration
 * Use this template to ensure consistency across all grid components
 */

// Default props that should be used by all grids
export const getStandardGridTemplate = (gridName, customConfig = {}) => {
  return {
    // Core Configuration
    gridName,
    enableCache: true,
    enableI18n: true,
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableColumnReordering: true,
    enableColumnResizing: true,

    // Performance Settings
    virtualizationThreshold: 1000,
    enableVirtualization: true,
    defaultPageSize: 25,

    // View Options
    showStatsCards: true,
    showCardView: true,
    defaultViewMode: 'grid',

    // Error Handling
    onError: (error) => {
      console.error(`Grid ${gridName} error:`, error);
      // Add your global error handling here
    },

    // Loading States
    loading: false,

    // Data Processing
    getRowId: (row) => row.id || row.entity_id || row.Code_MDM || row.sku,

    // Merge with custom configuration
    ...customConfig,
  };
};

// Standard toolbar configuration template
export const getStandardToolbarTemplate = (gridType = 'default', customActions = {}) => {
  const baseConfig = {
    showSearch: true,
    showRefresh: true,
    showColumnVisibility: true,
    showDensity: true,
    showExport: true,
    showFilters: true,
    showViewToggle: true,
  };

  // Grid-specific toolbar configurations
  const typeConfigs = {
    mdm: {
      ...baseConfig,
      showSync: true,
      showSuccursaleFilter: true,
      showSourceFilter: true,
      customLeftActions: ['syncSelected', 'syncAll'],
    },
    magento: {
      ...baseConfig,
      showAdd: true,
      showBulkActions: true,
      customLeftActions: ['addProduct', 'importCSV', 'bulkEdit'],
    },
    cegid: {
      ...baseConfig,
      showSync: true,
      customLeftActions: ['syncCegid'],
    },
    dashboard: {
      ...baseConfig,
      showAdd: false,
      showSync: false,
    },
  };

  return {
    ...baseConfig,
    ...(typeConfigs[gridType] || {}),
    ...customActions,
  };
};

// Standard column templates
export const getStandardColumnTemplates = () => {
  return {
    // ID/SKU column
    idColumn: {
      field: 'id',
      headerName: 'ID',
      width: 120,
      pinned: 'left',
      sortable: true,
      filterable: true,
    },

    // SKU column
    skuColumn: {
      field: 'sku',
      headerName: 'SKU',
      width: 140,
      pinned: 'left',
      sortable: true,
      filterable: true,
    },

    // Name column
    nameColumn: {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 250,
      sortable: true,
      filterable: true,
      renderCell: (params) => {
        return React.createElement('div', {
          style: {
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            lineHeight: '1.2',
            padding: '4px 0',
          },
        }, params.value);
      },
    },

    // Status column
    statusColumn: {
      field: 'status',
      headerName: 'Status',
      width: 100,
      sortable: true,
      filterable: true,
      type: 'singleSelect',
      valueOptions: ['active', 'inactive', 'enabled', 'disabled'],
    },

    // Price column
    priceColumn: {
      field: 'price',
      headerName: 'Price',
      width: 120,
      type: 'number',
      sortable: true,
      filterable: true,
      valueFormatter: (params) => `${params.value || 0} DA`,
    },

    // Date column
    dateColumn: {
      field: 'created_at',
      headerName: 'Created At',
      width: 150,
      type: 'dateTime',
      sortable: true,
      filterable: true,
      valueFormatter: (params) => {
        if (!params.value) return '-';

        return new Date(params.value).toLocaleDateString();
      },
    },
  };
};

// Validation helper
export const validateGridProps = (props, gridName) => {
  const errors = [];

  if (!gridName) {
    errors.push('gridName is required');
  }

  if (!Array.isArray(props.columns)) {
    errors.push('columns must be an array');
  }

  if (!Array.isArray(props.data)) {
    errors.push('data must be an array');
  }

  if (typeof props.getRowId !== 'function') {
    errors.push('getRowId must be a function');
  }

  if (errors.length > 0) {
    console.error(`Grid ${gridName} validation errors:`, errors);

    return false;
  }

  return true;
};
