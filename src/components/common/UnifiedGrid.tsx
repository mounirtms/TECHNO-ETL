// UnifiedGrid - Optimized Grid System
// Merges the best features from BaseGrid and EnhancedBaseGrid with performance optimizations
import { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle, memo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Fade,
  Skeleton,
  Alert
} from '@mui/material';
// Removed unused toast import
import { useOptimizedGridTheme } from '../../hooks/useOptimizedTheme';

// Unified Grid Components
import UnifiedGridToolbar from './UnifiedGridToolbar';
import GridContextMenu from '../grids/GridContextMenu';
import FloatingActionButtons from '../grids/FloatingActionButtons';
import { StatsCards } from './StatsCards';
import GridCardView from './GridCardView';
import RecordDetailsDialog from './RecordDetailsDialog';

// Hooks and Utilities
import { useGridCache } from '../../hooks/useGridCache';
import { useGridState } from '../../hooks/useGridState';
import { useGridActions } from '../../hooks/useGridActions';
import { enhanceColumns, applySavedColumnSettings, rowNumberColumn } from '../../utils/gridUtils';
import { HEADER_HEIGHT, FOOTER_HEIGHT, STATS_CARD_HEIGHT } from '../Layout/Constants';

/**
 * UnifiedGrid - The ultimate grid component
 * Combines the best features from BaseGrid and EnhancedBaseGrid
 * Features:
 * - Advanced caching with useGridCache
 * - Comprehensive state management with useGridState
 * - Modular toolbar system
 * - Context menus and floating actions
 * - Card view and grid view modes
 * - Stats cards and analytics
 * - i18n and RTL support
 * - Performance optimizations
 */
const UnifiedGrid = forwardRef(({
  // Core props
  gridName,
  columns: gridColumns = [],
  data = [],
  loading = false,
  onRefresh,
  getRowId = (row) => row.id || row.entity_id,

  // Feature toggles
  enableCache = true,
  enableI18n = true,
  enableRTL = false,
  enableSelection = true,
  enableSorting = true,
  enableFiltering = true,
  enableColumnReordering = true,
  enableColumnResizing = true,

  // Performance options
  virtualizationThreshold = 1000,
  enableVirtualization = true,
  rowBuffer = 10,
  columnBuffer = 2,
  rowThreshold = 3,
  columnThreshold = 3,

  // View options
  showStatsCards = true,
  showCardView = true,
  defaultViewMode = 'grid', // 'grid' or 'card'
  gridCards = [],
  totalCount = 0,
  defaultPageSize = 25,
  paginationMode = "client", // "client" or "server"
  onPaginationModelChange, // For server-side pagination

  // Toolbar configuration
  toolbarConfig = {},
  customActions = [],

  // Context menu configuration
  contextMenuActions = {},

  // Floating actions configuration
  floatingActions = {},
  floatingPosition = 'bottom-right',
  floatingVariant = 'speedDial',
  enableFloatingActions = false,

  // Filter configuration
  filterOptions = [],
  currentFilter = 'all',
  onFilterChange,
  childFilterModel,
  searchableFields = ['sku', 'name', 'Code_MDM', 'reference'],

  // Event handlers
  onSelectionChange,
  onError,
  onExport,
  onAdd,
  onEdit,
  onDelete,
  onSync,
  onSearch,
  onSortChange,
  onFilterModelChange,
  onRowClick,
  onRowDoubleClick,

  // Advanced props
  preColumns = [],
  endColumns = [],
  initialVisibleColumns = [],
  toolbarProps = {}, // Legacy support
  sx = {}, // Style overrides

  // Custom filter props for MDM and other specialized grids
  succursaleOptions,
  currentSuccursale,
  onSuccursaleChange,
  sourceOptions,
  currentSource,
  onSourceChange,
  showChangedOnly,
  setShowChangedOnly,
  onSyncStocksHandler,
  onSyncAllHandler,
  canInfo,
  onInfo,
  mdmStocks = false, // Default value to prevent undefined error

  ...props
}, ref) => {
  // Optimized theme and translation hooks
  const gridTheme = useOptimizedGridTheme();

  // Stable translation function that doesn't change on every render
  const safeTranslate = useCallback((key, fallback = key) => {
    try {
      // Simple fallback translation without excessive dependencies
      return enableI18n ? (fallback || key) : (fallback || key);
    } catch (error) {
      return fallback || key;
    }
  }, [enableI18n]);

  // Grid state management with safety checks
  const {
    paginationModel,
    setPaginationModel,
    sortModel,
    setSortModel,
    filterModel,
    setFilterModel,
    selectedRows,
    setSelectedRows,
    columnVisibility,
    setColumnVisibility,
    density,
    setDensity,
    columnOrder,
    setColumnOrder,
    pinnedColumns,
    setPinnedColumns,
    exportState,
    importState,
    resetState
  } = useGridState(gridName, {
    enablePersistence: true,
    initialState: {
      paginationModel: { page: 0, pageSize: defaultPageSize },
      selectedRows: [],
      columnVisibility: {},
      density: 'standard'
    }
  });

  // Safety checks for state variables
  const safePaginationModel = useMemo(() => {
    return paginationModel || { page: 0, pageSize: defaultPageSize };
  }, [paginationModel, defaultPageSize]);

  const safeSelectedRows = useMemo(() => {
    return Array.isArray(selectedRows) ? selectedRows : [];
  }, [selectedRows]);

  const safeColumnVisibility = useMemo(() => {
    return columnVisibility || {};
  }, [columnVisibility]);

  // Cache management
  const {
    setCacheData,
    clearCache,
    invalidateCache,
    cacheStats
  } = useGridCache(gridName, enableCache);

  // Grid actions hook
  const {
    handleRefresh,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSync,
    handleExport,
    handleSearch
  } = useGridActions({
    onRefresh,
    onAdd,
    onEdit,
    onDelete,
    onSync,
    onExport,
    onSearch,
    selectedRows,
    data,
    gridName,
    searchableFields
  });

  // Local state
  const [contextMenu, setContextMenu] = useState(null);
  const [viewMode, setViewMode] = useState(defaultViewMode);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const gridRef = useRef(null);

  // Memoize data with performance optimizations
  const memoizedData = useMemo(() => {
    // Ensure data is always an array
    if (!Array.isArray(data)) {
      console.warn('UnifiedGrid: data prop is not an array, using empty array');
      return [];
    }

    // For large datasets, enable virtualization automatically
    if (data.length > (virtualizationThreshold || 1000)) {
      console.info(`UnifiedGrid: Large dataset detected (${data.length} rows), virtualization enabled`);
    }

    // Return data with performance metadata
    return data;
  }, [data, virtualizationThreshold]);

  // ===== COLUMN SETUP PROCESS =====
  // Professional column handling with proper async/sync separation
  //
  // STEPS TO FOLLOW:
  // 1. Build base columns synchronously (gridColumns + pre/end columns + row numbers)
  // 2. Apply saved column settings asynchronously (width, visibility, order)
  // 3. Enhance columns with translations and feature flags synchronously
  // 4. Always ensure columns is an array to prevent grid crashes

  const [processedColumns, setProcessedColumns] = useState([]);

  // Step 1: Build base columns synchronously
  const baseColumns = useMemo(() => {
    // Ensure gridColumns is always an array
    if (!Array.isArray(gridColumns)) {
      console.warn('UnifiedGrid: gridColumns is not an array, using empty array');
      return [];
    }

    let columns = [...gridColumns];

    // Add row number column if needed
    if (toolbarConfig.showRowNumbers) {
      columns = [rowNumberColumn, ...columns];
    }

    // Add pre and end columns
    columns = [...preColumns, ...columns, ...endColumns];

    return columns;
  }, [gridColumns, preColumns, endColumns, toolbarConfig.showRowNumbers]);

  // Processing state to prevent excessive re-renders
  const processingRef = useRef(false);
  const lastProcessedRef = useRef('');

  // Step 2: Apply async column settings and enhancements
  // This effect handles the async column processing pipeline
  useEffect(() => {
    // Create a stable key for this processing request
    const processingKey = `${baseColumns.length}-${gridName}-${enableI18n}-${enableSorting}-${enableFiltering}`;

    // Skip if already processing the same configuration
    if (processingRef.current || lastProcessedRef.current === processingKey) {
      return;
    }

    const processColumns = async () => {
      processingRef.current = true;

      try {
        // Start with base columns from Step 1
        let columns = baseColumns;

        // Apply saved column settings (ASYNC - loads from localStorage/database)
        // This handles: width, visibility, order, pinning
        if (gridName && columns.length > 0) {
          columns = await applySavedColumnSettings(gridName, columns);
        }

        // Enhance columns with translations and feature flags (SYNC)
        // This handles: i18n translations, sorting, filtering, resizing
        columns = enhanceColumns(columns, {
          enableI18n,
          translate: safeTranslate,
          enableSorting,
          enableFiltering
        });

        // CRITICAL: Always ensure columns is an array to prevent grid crashes
        if (!Array.isArray(columns)) {
          console.warn('UnifiedGrid: processColumns resulted in non-array, using base columns');
          columns = baseColumns;
        }

        // Step 3: Set final processed columns for grid rendering
        setProcessedColumns(columns);
        lastProcessedRef.current = processingKey;

      } catch (error) {
        console.error('UnifiedGrid: Error processing columns:', error);
        // FALLBACK: Use enhanced base columns without saved settings
        const fallbackColumns = enhanceColumns(baseColumns, {
          enableI18n,
          translate: safeTranslate,
          enableSorting,
          enableFiltering
        });
        setProcessedColumns(fallbackColumns);
        lastProcessedRef.current = processingKey;
      } finally {
        processingRef.current = false;
      }
    };

    // Only process if we have base columns
    if (baseColumns.length > 0) {
      processColumns();
    } else {
      // Handle empty columns case
      setProcessedColumns([]);
      lastProcessedRef.current = processingKey;
    }
  }, [baseColumns, gridName, enableI18n, enableSorting, enableFiltering]);

  // Calculate grid height
  const gridHeight = useMemo(() => {
    const baseHeight = window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
    const statsHeight = showStatsCards ? STATS_CARD_HEIGHT : 0;
    const toolbarHeight = 155; // Toolbar height
    return baseHeight - statsHeight - toolbarHeight; // 32px for padding
  }, [showStatsCards]);

  // Calculate responsive grid height with better handling
  const responsiveGridHeight = useMemo(() => {
    // Calculate available height minus known fixed elements
    const viewportHeight = window.innerHeight;
    const reservedHeight = HEADER_HEIGHT + FOOTER_HEIGHT + (showStatsCards ? STATS_CARD_HEIGHT : 0) + 155; // 155 for toolbar
    const calculatedHeight = viewportHeight - reservedHeight;
    
    // Ensure minimum height of 400px
    return Math.max(calculatedHeight, 400);
  }, [showStatsCards]);

  // Cache management effect
  useEffect(() => {
    if (enableCache && memoizedData.length > 0) {
      setCacheData(memoizedData, {
        pagination: paginationModel,
        sort: sortModel,
        filter: filterModel,
        timestamp: Date.now()
      });
    }
  }, [memoizedData, paginationModel, sortModel, filterModel, enableCache, setCacheData]);

  // Selection change handler
  const handleSelectionChange = useCallback((newSelection) => {
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  }, [setSelectedRows, onSelectionChange]);

  // Context menu handlers
  const handleContextMenu = useCallback((event, row) => {
    if (Object.keys(contextMenuActions).length === 0) return;

    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      row
    });
  }, [contextMenuActions]);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  // View mode toggle
  const handleViewModeChange = useCallback((_event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  }, []);

  // Imperative handle for ref
  useImperativeHandle(ref, () => ({
    exportState,
    importState,
    resetState,
    clearCache,
    invalidateCache,
    getSelectedRows: () => selectedRows,
    getGridData: () => data,
    getCacheStats: () => cacheStats,
    refreshGrid: handleRefresh,
    setViewMode,
    toggleFilters: () => setFiltersVisible(!filtersVisible)
  }), [exportState, importState, resetState, clearCache, invalidateCache, selectedRows, data, cacheStats, handleRefresh, filtersVisible]);

  // Show error message but keep grid visible
  const hasError = onError && data.length === 0 && !loading;

  // Helper function to determine grid type from grid name
  const getGridType = (name) => {
    if (name.toLowerCase().includes('mdm')) return 'mdm';
    if (name.toLowerCase().includes('cegid')) return 'cegid';
    if (name.toLowerCase().includes('dashboard')) return 'dashboard';
    return 'magento'; // Default to magento
  };

  return (


    <>
      {/* Unified Toolbar */}
      <UnifiedGridToolbar
        gridName={gridName}
        gridType={getGridType(gridName)}
        config={toolbarConfig}
        customActions={customActions}
        customLeftActions={toolbarConfig.customLeftActions || []}
        selectedRows={selectedRows}
        onRefresh={handleRefresh}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSync={handleSync}
        onExport={handleExport}
        onSearch={handleSearch}
        searchValue={searchValue}
        onFiltersToggle={() => setFiltersVisible(!filtersVisible)}
        filtersVisible={filtersVisible}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        density={density}
        onDensityChange={setDensity}
        enableI18n={enableI18n}
        isRTL={enableRTL}
        loading={loading}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showCardView={showCardView}
        mdmStocks={mdmStocks}


        // Custom filter props
        succursaleOptions={succursaleOptions}
        currentSuccursale={currentSuccursale}
        onSuccursaleChange={onSuccursaleChange}
        sourceOptions={sourceOptions}
        currentSource={currentSource}
        onSourceChange={onSourceChange}
        showChangedOnly={showChangedOnly}
        setShowChangedOnly={setShowChangedOnly}
        onSyncStocksHandler={onSyncStocksHandler}
        onSyncAllHandler={onSyncAllHandler}
        canInfo={canInfo}
        onInfo={onInfo}
      />

      {/* Main Content Area */}
      {loading && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
          <Skeleton variant="rectangular" height={4} />
        </Box>
      )}

      <Fade in={!loading} timeout={300}>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            maxHeight: responsiveGridHeight,
            height: responsiveGridHeight, // 固定高度以避免滚动条问题
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
          {viewMode === 'card' && showCardView ? (
            <GridCardView
              data={data}
              columns={processedColumns}
              onRowClick={(row) => {
                setSelectedRecord(row);
                setDetailsDialogOpen(true);
              }}
              loading={loading}
            />
          ) : (

            <DataGrid
              ref={gridRef}
              rows={memoizedData}
              columns={processedColumns}
              loading={loading}

              // Performance optimizations
              disableVirtualization={!enableVirtualization || memoizedData.length < virtualizationThreshold}
              rowBuffer={rowBuffer}
              columnBuffer={columnBuffer}
              rowThreshold={rowThreshold}
              columnThreshold={columnThreshold}

              // Ensure we have valid data before rendering
              {...((memoizedData.length === 0) ? {
                initialState: { pagination: { paginationModel: { page: 0, pageSize: defaultPageSize } } }
              } : {})}

              // Pagination - supports both client and server-side pagination
              // Ensure pagination model is always valid to prevent MUI errors
              paginationModel={{
                page: Math.max(0, safePaginationModel.page || 0),
                pageSize: Math.max(1, safePaginationModel.pageSize || defaultPageSize)
              }}
              onPaginationModelChange={useCallback((model) => {
                // Validate pagination model before setting
                const validModel = {
                  page: Math.max(0, model?.page || 0),
                  pageSize: Math.max(1, model?.pageSize || defaultPageSize)
                };
                setPaginationModel(validModel);
                // Call parent pagination handler if provided (for server-side pagination)
                if (onPaginationModelChange) {
                  onPaginationModelChange(validModel);
                }
              }, [onPaginationModelChange, defaultPageSize, setPaginationModel])}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationMode={paginationMode || "client"}
              // Only provide rowCount for server-side pagination to prevent warnings
              {...(paginationMode === "server" ? {
                rowCount: Math.max(0, typeof totalCount === 'number' ? totalCount : 0)
              } : {})}

              // Sorting with performance optimization
              sortModel={sortModel}
              onSortModelChange={useCallback((model) => {
                setSortModel?.(model);
                onSortChange?.(model);
              }, [setSortModel, onSortChange])}
              sortingOrder={['asc', 'desc']}

              // Filtering with performance optimization
              filterModel={filterModel}
              onFilterModelChange={useCallback((model) => {
                setFilterModel?.(model);
                onFilterChange?.(model);
                onFilterModelChange?.(model);
              }, [setFilterModel, onFilterChange, onFilterModelChange])}

              // Selection
              checkboxSelection={enableSelection}
              rowSelectionModel={safeSelectedRows}
              onRowSelectionModelChange={handleSelectionChange}

              // Column management
              columnVisibilityModel={safeColumnVisibility}
              onColumnVisibilityModelChange={setColumnVisibility}
              columnOrderModel={columnOrder}
              onColumnOrderModelChange={setColumnOrder}
              pinnedColumns={pinnedColumns}
              onPinnedColumnsChange={setPinnedColumns}

              // Density
              density={density}

              // Features
              disableColumnReorder={!enableColumnReordering}
              disableColumnResize={!enableColumnResizing}

              // Row configuration
              getRowId={getRowId}
              onRowClick={(params) => {
                onRowClick?.(params);
                setSelectedRecord(params.row);
                setDetailsDialogOpen(true);
              }}
              onRowDoubleClick={(params) => {
                onRowDoubleClick?.(params);
              }}
              onRowContextMenu={(params, event) => handleContextMenu(event, params.row)}



              // Disable default toolbar
              hideFooter={false}
              disableColumnMenu={false}

              {...props}
            />

          )}
        </Box>
      </Fade>
      {/* Stats Cards */}
      {showStatsCards && gridCards.length > 0 && (
        <Box
          className="stats-container"
          sx={{
            flexShrink: 0,
            borderTop: `1px solid ${gridTheme.borderColor}`,
            p: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <StatsCards cards={gridCards} />
        </Box>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <GridContextMenu
          contextMenu={contextMenu}
          onClose={handleContextMenuClose}
          actions={contextMenuActions}
          row={contextMenu.row}
        />
      )}

      {/* Floating Action Buttons */}
      {enableFloatingActions && (
        <FloatingActionButtons
          actions={floatingActions}
          position={floatingPosition}
          variant={floatingVariant}
        />
      )}

      {/* Record Details Dialog */}
      <RecordDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        record={selectedRecord}
        columns={processedColumns}
        title={safeTranslate('grid.common.recordDetails', 'Record Details')}
      />
    </>
  );
});

UnifiedGrid.displayName = 'UnifiedGrid';

// Memoize the component for performance optimization
const MemoizedUnifiedGrid = memo(UnifiedGrid, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  // Only re-render if critical props have changed
  const criticalProps = ['data', 'loading', 'columns', 'totalCount'];

  for (const prop of criticalProps) {
    if (prevProps[prop] !== nextProps[prop]) {
      return false; // Props changed, re-render
    }
  }

  // Check if data array contents changed (shallow comparison)
  if (Array.isArray(prevProps.data) && Array.isArray(nextProps.data)) {
    if (prevProps.data.length !== nextProps.data.length) {
      return false;
    }
    // For performance, only check first few items for changes
    const checkCount = Math.min(5, prevProps.data.length);
    for (let i = 0; i < checkCount; i++) {
      if (prevProps.data[i] !== nextProps.data[i]) {
        return false;
      }
    }
  }

  return true; // Props haven't changed significantly, skip re-render
});

MemoizedUnifiedGrid.displayName = 'MemoizedUnifiedGrid';

export default MemoizedUnifiedGrid;
