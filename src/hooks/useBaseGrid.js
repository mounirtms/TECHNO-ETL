/**
 * Base Grid System with Inheritance
 * Unified grid management with OOP principles and DRY patterns
 *
 * @author Techno-ETL Team
 * @version 4.0.0
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Base Grid Configuration Class
 * Provides common configuration and behavior for all grids
 */
export class BaseGridConfig {
  constructor(gridName, options = {}) {
    this.gridName = gridName;
    this.options = {
      defaultPageSize: 25,
      enableVirtualization: true,
      enableStats: true,
      enableFilters: true,
      enableSearch: true,
      enableExport: true,
      enableRefresh: true,
      ...options,
    };

    this.defaultFilters = {};
    this.defaultSortModel = [];
    this.searchableFields = ['name', 'sku', 'code'];
  }

  /**
   * Get toolbar configuration
   * Override in subclasses for specific functionality
   */
  getToolbarConfig() {
    return {
      showRefresh: this.options.enableRefresh,
      showSearch: this.options.enableSearch,
      showFilters: this.options.enableFilters,
      showExport: this.options.enableExport,
      showSettings: true,
      customActions: this.getCustomActions(),
    };
  }

  /**
   * Get custom actions for toolbar
   * Override in subclasses
   */
  getCustomActions() {
    return [];
  }

  /**
   * Get context menu actions
   * Override in subclasses
   */
  getContextMenuActions() {
    return {
      view: {
        enabled: true,
        label: 'View Details',
        icon: 'visibility',
      },
      edit: {
        enabled: true,
        label: 'Edit',
        icon: 'edit',
      },
    };
  }

  /**
   * Get filter configuration
   * Override in subclasses
   */
  getFilterConfig() {
    return {
      enabled: this.options.enableFilters,
      filters: this.defaultFilters,
    };
  }

  /**
   * Get searchable fields
   */
  getSearchableFields() {
    return this.searchableFields;
  }

  /**
   * Get stats configuration
   * Override in subclasses
   */
  getStatsConfig() {
    return {
      enabled: this.options.enableStats,
      cards: [
        { key: 'total', title: 'Total', color: 'primary' },
        { key: 'active', title: 'Active', color: 'success' },
        { key: 'inactive', title: 'Inactive', color: 'error' },
      ],
    };
  }
}

/**
 * Magento Grid Configuration
 * Specialized configuration for Magento-related grids
 */
export class MagentoGridConfig extends BaseGridConfig {
  constructor(gridName, options = {}) {
    super(gridName, {
      enableSync: true,
      enableImport: true,
      enableBulkOperations: true,
      ...options,
    });

    this.searchableFields = ['sku', 'name', 'type_id', 'status'];
  }

  getCustomActions() {
    const actions = super.getCustomActions();

    if (this.options.enableSync) {
      actions.push({
        id: 'sync',
        label: 'Sync',
        icon: 'sync',
        color: 'primary',
        enabled: true,
      });
    }

    if (this.options.enableImport) {
      actions.push({
        id: 'import',
        label: 'Import',
        icon: 'upload',
        color: 'secondary',
        enabled: true,
      });
    }

    return actions;
  }

  getContextMenuActions() {
    const actions = super.getContextMenuActions();

    if (this.options.enableSync) {
      actions.sync = {
        enabled: true,
        label: 'Sync to Magento',
        icon: 'sync',
        color: 'primary',
      };
    }

    return actions;
  }

  getStatsConfig() {
    return {
      enabled: this.options.enableStats,
      cards: [
        { key: 'total', title: 'Total Products', color: 'primary' },
        { key: 'enabled', title: 'Enabled', color: 'success' },
        { key: 'disabled', title: 'Disabled', color: 'error' },
        { key: 'simple', title: 'Simple', color: 'info' },
        { key: 'configurable', title: 'Configurable', color: 'warning' },
      ],
    };
  }
}

/**
 * MDM Grid Configuration
 * Specialized configuration for MDM-related grids
 */
export class MDMGridConfig extends BaseGridConfig {
  constructor(gridName, options = {}) {
    super(gridName, {
      enableSync: true,
      enableSyncStocks: true,
      enableSyncAll: true,
      enableSourceFilter: true,
      enableSuccursaleFilter: true,
      ...options,
    });

    this.searchableFields = ['Code_MDM', 'Code_JDE', 'TypeProd', 'Source'];
    this.defaultFilters = {
      source: 'all',
      succursale: 'all',
      showChangedOnly: false,
    };
  }

  getCustomActions() {
    const actions = super.getCustomActions();

    actions.push(
      {
        id: 'sync',
        label: 'Sync Selected',
        icon: 'sync',
        color: 'primary',
        enabled: true,
      },
      {
        id: 'syncStocks',
        label: 'Sync Stocks',
        icon: 'inventory',
        color: 'secondary',
        enabled: this.options.enableSyncStocks,
      },
      {
        id: 'syncAll',
        label: 'Sync All Changes',
        icon: 'sync_alt',
        color: 'warning',
        enabled: this.options.enableSyncAll,
      },
    );

    return actions;
  }

  getFilterConfig() {
    return {
      enabled: this.options.enableFilters,
      filters: this.defaultFilters,
      sourceFilter: this.options.enableSourceFilter,
      succursaleFilter: this.options.enableSuccursaleFilter,
      showChangedOnlyFilter: true,
    };
  }

  getStatsConfig() {
    return {
      enabled: this.options.enableStats,
      cards: [
        { key: 'total', title: 'Total Products', color: 'primary' },
        { key: 'inStock', title: 'In Stock', color: 'success' },
        { key: 'outOfStock', title: 'Out of Stock', color: 'error' },
        { key: 'lowStock', title: 'Low Stock', color: 'warning' },
        { key: 'newChanges', title: 'New Changes', color: 'info' },
        { key: 'synced', title: 'Synced', color: 'success' },
      ],
    };
  }
}

/**
 * Base Grid Hook
 * Provides common grid functionality using OOP principles with enhanced features
 */
export function useBaseGrid(config, dataFetcher) {
  // Core state management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  // Pagination state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: config.options.defaultPageSize,
  });

  // Sorting and filtering state
  const [sortModel, setSortModel] = useState(config.defaultSortModel);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Memoized configurations for performance
  const toolbarConfig = useMemo(() => config.getToolbarConfig(), [config]);
  const contextMenuActions = useMemo(() => config.getContextMenuActions(), [config]);
  const filterConfig = useMemo(() => config.getFilterConfig(), [config]);
  const statsConfig = useMemo(() => config.getStatsConfig(), [config]);

  // Enhanced data fetching with error handling and retry logic
  const fetchData = useCallback(async (params = {}, retryCount = 0) => {
    if (!dataFetcher) {
      console.warn(`No data fetcher provided for ${config.gridName}`);

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestParams = {
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        sortModel,
        filterModel,
        search: searchValue?.trim() || '',
        ...params,
      };

      console.log(`🔄 ${config.gridName}: Fetching data with params:`, requestParams);

      const result = await dataFetcher(requestParams);

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format from data fetcher');
      }

      const processedData = Array.isArray(result.data) ? result.data : [];
      const processedStats = result.stats || {};

      setData(processedData);
      setStats(processedStats);

      console.log(`✅ ${config.gridName}: Loaded ${processedData.length} items successfully`);

      if (processedData.length > 0) {
        toast.success(`Loaded ${processedData.length} items`);
      }

    } catch (error) {
      console.error(`❌ ${config.gridName}: Data fetch error:`, error);
      setError(error);

      // Retry logic for transient errors
      if (retryCount < 2 && (error.name === 'NetworkError' || error.code === 'ECONNRESET')) {
        console.log(`🔄 ${config.gridName}: Retrying... (${retryCount + 1}/2)`);
        setTimeout(() => fetchData(params, retryCount + 1), 1000 * (retryCount + 1));

        return;
      }

      toast.error(`Failed to load ${config.gridName} data: ${error.message}`);
      setData([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  }, [config.gridName, dataFetcher, paginationModel, sortModel, filterModel, searchValue]);

  // Optimized event handlers with debouncing
  const handleRefresh = useCallback(() => {
    console.log(`🔄 ${config.gridName}: Manual refresh triggered`);
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback((value) => {
    console.log(`🔍 ${config.gridName}: Search triggered:`, value);
    setSearchValue(value || '');
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  }, []);

  const handlePaginationChange = useCallback((model) => {
    console.log(`📄 ${config.gridName}: Pagination changed:`, model);
    setPaginationModel(model);
  }, []);

  const handleSortChange = useCallback((model) => {
    console.log(`🔄 ${config.gridName}: Sort changed:`, model);
    setSortModel(model);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  }, []);

  const handleFilterChange = useCallback((model) => {
    console.log(`🔍 ${config.gridName}: Filter changed:`, model);
    setFilterModel(model);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  }, []);

  const handleSelectionChange = useCallback((selection) => {
    console.log(`✅ ${config.gridName}: Selection changed:`, selection?.length || 0, 'items');
    setSelectedRows(Array.isArray(selection) ? selection : []);
  }, []);

  // Generic action handler with loading state management
  const handleAction = useCallback(async (actionName, actionFn, ...args) => {
    if (typeof actionFn !== 'function') {
      console.warn(`Action ${actionName} is not a function`);

      return;
    }

    setLoading(true);
    try {
      console.log(`🎬 ${config.gridName}: Executing action:`, actionName);
      const result = await actionFn(...args);

      // Auto-refresh after successful actions
      if (result !== false) {
        await fetchData();
      }

      return result;
    } catch (error) {
      console.error(`❌ ${config.gridName}: Action ${actionName} failed:`, error);
      toast.error(`${actionName} failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [config.gridName, fetchData]);

  // Auto-fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [paginationModel.page, paginationModel.pageSize]);

  useEffect(() => {
    // Reset to first page and fetch when sort/filter/search changes
    if (sortModel.length > 0 || filterModel.items.length > 0 || searchValue) {
      fetchData();
    }
  }, [sortModel, filterModel, searchValue]);

  // Initialize data on mount
  useEffect(() => {
    fetchData();
  }, []); // Only run once on mount

  // Return comprehensive grid state and handlers
  return {
    // Core data
    data,
    stats,
    loading,
    error,

    // Pagination
    paginationModel,
    onPaginationModelChange: handlePaginationChange,

    // Sorting
    sortModel,
    onSortModelChange: handleSortChange,

    // Filtering
    filterModel,
    onFilterModelChange: handleFilterChange,

    // Search
    searchValue,
    onSearch: handleSearch,
    searchableFields: config.getSearchableFields(),

    // Selection
    selectedRows,
    onSelectionChange: handleSelectionChange,

    // Actions
    onRefresh: handleRefresh,
    handleAction, // Generic action handler

    // Configurations
    toolbarConfig,
    contextMenuActions,
    filterConfig,
    statsConfig,

    // Grid metadata
    gridName: config.gridName,
    enableVirtualization: config.options.enableVirtualization,
    defaultPageSize: config.options.defaultPageSize,

    // Utility functions
    fetchData,
    hasData: data.length > 0,
    hasSelection: selectedRows.length > 0,
    hasError: !!error,
  };
}

/**
 * Specialized Magento Grid Hook
 * Extends base functionality with Magento-specific features
 */
export function useMagentoGrid(gridName, dataFetcher, options = {}) {
  const config = new MagentoGridConfig(gridName, options);
  const gridState = useBaseGrid(config, dataFetcher);

  // Magento-specific actions with enhanced error handling
  const handleSync = useCallback(async (selectedIds = []) => {
    return gridState.handleAction('Sync', async () => {
      console.log(`🔄 Magento Sync: Processing ${selectedIds.length || 'all'} items`);

      // Implement actual sync logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(`Synced ${selectedIds.length || 'all'} items to Magento`);

      return true; // Indicates successful action that should trigger refresh
    });
  }, [gridState]);

  const handleImport = useCallback(async (importData, importType = 'csv') => {
    return gridState.handleAction('Import', async () => {
      console.log(`📥 Magento Import: Processing ${importType} data`);

      if (!importData) {
        throw new Error('No import data provided');
      }

      // Implement actual import logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

      toast.success(`Import completed successfully (${importType})`);

      return true;
    });
  }, [gridState]);

  const handleBulkAction = useCallback(async (action, selectedIds) => {
    return gridState.handleAction(`Bulk ${action}`, async () => {
      if (!selectedIds || selectedIds.length === 0) {
        throw new Error('No items selected for bulk action');
      }

      console.log(`🎯 Magento Bulk ${action}: Processing ${selectedIds.length} items`);

      // Implement bulk action logic here
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(`Bulk ${action} completed for ${selectedIds.length} items`);

      return true;
    });
  }, [gridState]);

  return {
    ...gridState,

    // Magento-specific actions
    onSync: handleSync,
    onImport: handleImport,
    onBulkAction: handleBulkAction,

    // Magento-specific computed properties
    canSync: gridState.hasData,
    canImport: !gridState.loading,
    canBulkAction: gridState.hasSelection && !gridState.loading,
  };
}

/**
 * Specialized MDM Grid Hook
 * Extends base functionality with MDM-specific features and filters
 */
export function useMDMGrid(gridName, dataFetcher, options = {}) {
  const config = new MDMGridConfig(gridName, options);
  const gridState = useBaseGrid(config, dataFetcher);

  // MDM-specific filter state
  const [sourceFilter, setSourceFilter] = useState(config.defaultFilters.source);
  const [succursaleFilter, setSuccursaleFilter] = useState(config.defaultFilters.succursale);
  const [showChangedOnly, setShowChangedOnly] = useState(config.defaultFilters.showChangedOnly);

  // Enhanced data fetcher that includes MDM-specific filters
  const enhancedDataFetcher = useCallback(async (params) => {
    const mdmParams = {
      ...params,
      sourceCode: sourceFilter === 'all' ? '' : sourceFilter,
      succursale: succursaleFilter === 'all' ? '' : succursaleFilter,
      showChangedOnly,
    };

    console.log('📊 MDM Data Fetch: Including filters:', {
      sourceCode: mdmParams.sourceCode,
      succursale: mdmParams.succursale,
      showChangedOnly,
    });

    return dataFetcher(mdmParams);
  }, [dataFetcher, sourceFilter, succursaleFilter, showChangedOnly]);

  // MDM-specific action handlers
  const handleSyncSelected = useCallback(async (selectedIds = []) => {
    if (!selectedIds || selectedIds.length === 0) {
      toast.warning('Please select items to sync');

      return;
    }

    return gridState.handleAction('Sync Selected', async () => {
      console.log(`🔄 MDM Sync Selected: Processing ${selectedIds.length} items`);

      // Implement MDM sync logic here
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(`Synced ${selectedIds.length} selected items`);

      return true;
    });
  }, [gridState]);

  const handleSyncStocks = useCallback(async () => {
    if (sourceFilter === 'all') {
      toast.warning('Please select a specific source to sync stocks');

      return;
    }

    return gridState.handleAction('Sync Stocks', async () => {
      console.log(`📦 MDM Sync Stocks: Processing source ${sourceFilter}`);

      // Implement stock sync logic here
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(`Stock sync completed for source: ${sourceFilter}`);

      return true;
    });
  }, [sourceFilter, gridState]);

  const handleSyncAll = useCallback(async () => {
    const changedCount = gridState.stats?.newChanges || 0;

    if (changedCount === 0) {
      toast.info('No changes to sync');

      return;
    }

    return gridState.handleAction('Sync All Changes', async () => {
      console.log(`🔄 MDM Sync All: Processing ${changedCount} changed items`);

      // Implement sync all logic here
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast.success(`All ${changedCount} changes synced successfully`);

      return true;
    });
  }, [gridState]);

  // Filter change handlers with automatic data refresh
  const handleSourceFilterChange = useCallback((value) => {
    console.log('🔍 MDM: Source filter changed to:', value);
    setSourceFilter(value);
  }, []);

  const handleSuccursaleFilterChange = useCallback((value) => {
    console.log('🏢 MDM: Succursale filter changed to:', value);
    setSuccursaleFilter(value);
  }, []);

  const handleShowChangedOnlyChange = useCallback((value) => {
    console.log('🔄 MDM: Show changed only filter changed to:', value);
    setShowChangedOnly(value);
  }, []);

  // Auto-refresh when MDM filters change
  useEffect(() => {
    if (dataFetcher) {
      console.log('🔄 MDM: Filters changed, refreshing data...');
      enhancedDataFetcher({}).then(result => {
        if (result) {
          gridState.fetchData();
        }
      }).catch(error => {
        console.error('MDM filter refresh failed:', error);
      });
    }
  }, [sourceFilter, succursaleFilter, showChangedOnly]);

  return {
    ...gridState,

    // Override data fetcher to include MDM filters
    fetchData: enhancedDataFetcher,

    // MDM-specific filter state
    sourceFilter,
    setSourceFilter: handleSourceFilterChange,
    succursaleFilter,
    setSuccursaleFilter: handleSuccursaleFilterChange,
    showChangedOnly,
    setShowChangedOnly: handleShowChangedOnlyChange,

    // MDM-specific actions
    onSyncSelected: handleSyncSelected,
    onSyncStocks: handleSyncStocks,
    onSyncAll: handleSyncAll,

    // MDM-specific computed properties
    canSyncSelected: gridState.hasSelection && !gridState.loading,
    canSyncStocks: sourceFilter !== 'all' && !gridState.loading,
    canSyncAll: (gridState.stats?.newChanges || 0) > 0 && !gridState.loading,
    hasChanges: (gridState.stats?.newChanges || 0) > 0,
  };
}

/**
 * Enhanced Factory function to create appropriate grid hook
 * Provides type safety and better error handling
 */
export function createGridHook(gridType, gridName, dataFetcher, options = {}) {
  // Validate inputs
  if (!gridType || typeof gridType !== 'string') {
    console.warn('createGridHook: gridType must be a non-empty string');
    gridType = 'base';
  }

  if (!gridName || typeof gridName !== 'string') {
    console.warn('createGridHook: gridName must be a non-empty string');
    gridName = 'DefaultGrid';
  }

  if (!dataFetcher || typeof dataFetcher !== 'function') {
    console.warn('createGridHook: dataFetcher must be a function');
    dataFetcher = async () => ({ data: [], stats: {} });
  }

  console.log(`🏭 Grid Factory: Creating ${gridType} grid hook for ${gridName}`);

  switch (gridType.toLowerCase()) {
  case 'magento':
    console.log('📭 Creating Magento grid hook with options:', options);

    return useMagentoGrid(gridName, dataFetcher, options);

  case 'mdm':
    console.log('📊 Creating MDM grid hook with options:', options);

    return useMDMGrid(gridName, dataFetcher, options);

  case 'base':
  case 'default':
  default:
    if (gridType !== 'base' && gridType !== 'default') {
      console.warn(`Unknown grid type: ${gridType}, falling back to base grid`);
    }
    console.log('📊 Creating base grid hook with options:', options);
    const config = new BaseGridConfig(gridName, options);

    return useBaseGrid(config, dataFetcher);
  }
}

/**
 * Utility function to create grid configuration objects
 * Useful for testing and advanced use cases
 */
export function createGridConfig(gridType, gridName, options = {}) {
  switch (gridType?.toLowerCase()) {
  case 'magento':
    return new MagentoGridConfig(gridName, options);
  case 'mdm':
    return new MDMGridConfig(gridName, options);
  default:
    return new BaseGridConfig(gridName, options);
  }
}

