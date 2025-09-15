// UnifiedGrid - Optimized Grid System
// Merges the best features from BaseGrid and EnhancedBaseGrid with performance optimizations
import { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle, memo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Skeleton,
} from '@mui/material';
// Removed unused toast import
import { useOptimizedGridTheme } from '../../hooks/useOptimizedTheme';
import { useSettings } from '../../contexts/SettingsContext';

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
import { HEADER_HEIGHT, FOOTER_HEIGHT, STATS_CARD_HEIGHT, TOOLBAR_HEIGHT } from '../Layout/Constants';

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
  density = 'standard', // Grid density prop with default value

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
  paginationMode = 'client', // "client" or "server"
  onPaginationModelChange, // For server-side pagination

  // Toolbar configuration
  toolbarConfig = {},

  // Context menu configuration
  contextMenuActions = {},

  // Floating actions configuration
  floatingActions = {},
  floatingPosition = 'bottom-right',
  floatingVariant = 'speedDial',
  enableFloatingActions = false,

  // Filter configuration
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
  customActions = [],
  ...props
}, ref) => {
  // Optimized theme and translation hooks
  const gridTheme = useOptimizedGridTheme();

  // Settings integration
  const { settings } = useSettings();
  const userPreferences = settings?.preferences || {};
  const gridSettings = settings?.gridSettings || {};

  // Apply user density preference if not explicitly set
  const effectiveDensity = (density !== undefined ? density : userPreferences.density) || 'standard';

  // Apply user page size preference if not explicitly set
  const effectivePageSize = defaultPageSize ||
                           gridSettings.defaultPageSize ||
                           userPreferences.defaultPageSize ||
                           25;

  // Stable translation function that doesn't change on every render
  const safeTranslate = useCallback((key, fallback = key) => {
    try {
      // Simple fallback translation without excessive dependencies
      return enableI18n ? (fallback || key) : (fallback || key);
    } catch (error) {
      return fallback || key;
    }
  }, [enableI18n]);

  // Grid state management with settings integration
  const gridState = useGridState(gridName, {
    enablePersistence: true,
    initialState: {
      paginationModel: { page: 0, pageSize: effectivePageSize },
      selectedRows: [],
      columnVisibility: {},
      density: effectiveDensity,
    },
  });

  // Destructure grid state after initialization
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
    density: gridStateDensity,
    setDensity,
    columnOrder,
    setColumnOrder,
    pinnedColumns,
    setPinnedColumns,
    exportState,
    importState,
    resetState,
  } = gridState;

  // Use the grid state density or fallback to effective density
  const finalDensity = gridStateDensity || effectiveDensity;

  // Search state
  const [searchValue, setSearchValue] = useState('');

  // View mode state
  const [viewMode, setViewMode] = useState(defaultViewMode);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);

  // Details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filters visibility state
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Cache management
  const { clearCache, invalidateCache, stats: cacheStats } = useGridCache(gridName, {
    enabled: enableCache,
    data,
  });

  // Grid reference for direct access
  const gridRef = useRef(null);

  // Calculate grid height based on available space and features
  const gridHeight = useMemo(() => {
    let height = `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT + TOOLBAR_HEIGHT}px)`;
    
    if (showStatsCards && gridCards.length > 0) {
      height = `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT + TOOLBAR_HEIGHT + STATS_CARD_HEIGHT}px)`;
    }
    
    return height;
  }, [showStatsCards, gridCards.length]);

  // Process columns with enhancements
  const processedColumns = useMemo(() => {
    // Apply saved column settings if available
    const columnsWithSettings = applySavedColumnSettings(gridColumns, gridSettings);
    
    // Ensure columnsWithSettings is an array
    const safeColumnsWithSettings = Array.isArray(columnsWithSettings) ? columnsWithSettings : [];
    
    // Add row number column if enabled
    let finalColumns = [...safeColumnsWithSettings];
    if (toolbarConfig.showRowNumbers !== false) {
      finalColumns = [rowNumberColumn, ...finalColumns];
    }

    // Add pre-columns and end-columns if provided
    if (preColumns.length > 0) {
      finalColumns = [...preColumns, ...finalColumns];
    }
    
    if (endColumns.length > 0) {
      finalColumns = [...finalColumns, ...endColumns];
    }

    // Enhance columns with additional features
    return enhanceColumns(finalColumns, {
      enableSorting,
      enableFiltering,
      enableColumnReordering,
      enableColumnResizing,
    });
  }, [gridColumns, gridSettings, toolbarConfig.showRowNumbers, preColumns, endColumns, 
      enableSorting, enableFiltering, enableColumnReordering, enableColumnResizing]);

  // Memoize data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data || [], [data]);

  // Handle refresh action
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Fallback to clearing cache and invalidating
      clearCache();
      invalidateCache();
    }
  }, [onRefresh, clearCache, invalidateCache]);

  // Handle selection change
  const handleSelectionChange = useCallback((newSelectionModel) => {
    setSelectedRows(newSelectionModel);
    onSelectionChange?.(newSelectionModel);
  }, [onSelectionChange, setSelectedRows]);

  // Handle add action
  const handleAdd = useCallback(() => {
    onAdd?.();
  }, [onAdd]);

  // Handle edit action
  const handleEdit = useCallback(() => {
    if (selectedRows.length > 0) {
      onEdit?.(selectedRows);
    }
  }, [onEdit, selectedRows]);

  // Handle delete action
  const handleDelete = useCallback(() => {
    if (selectedRows.length > 0) {
      onDelete?.(selectedRows);
    }
  }, [onDelete, selectedRows]);

  // Handle sync action
  const handleSync = useCallback(() => {
    if (selectedRows.length > 0) {
      onSync?.(selectedRows);
    }
  }, [onSync, selectedRows]);

  // Handle export action
  const handleExport = useCallback(() => {
    onExport?.();
  }, [onExport]);

  // Handle search action
  const handleSearch = useCallback((value) => {
    setSearchValue(value);
    onSearch?.(value);
  }, [onSearch]);

  // Handle context menu
  const handleContextMenu = useCallback((event, row) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      row,
    });
  }, []);

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
    toggleFilters: () => setFiltersVisible(!filtersVisible),
  }), [exportState, importState, resetState, clearCache, invalidateCache, selectedRows, data, cacheStats, handleRefresh, filtersVisible]);

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
        density={finalDensity}
        onDensityChange={setDensity}
        enableI18n={enableI18n}
        isRTL={enableRTL}
        loading={loading}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showCardView={showCardView}
      />

      {/* Main Content Area */}
      {loading && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
          <Skeleton variant="rectangular" height={4} />
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 400, // Ensure minimum height to prevent 0px height issue
          height: gridHeight,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
              initialState: { pagination: { paginationModel: { page: 0, pageSize: defaultPageSize } } },
            } : {})}

            // Pagination - supports both client and server-side pagination
            paginationModel={paginationModel || { page: 0, pageSize: defaultPageSize }}
            onPaginationModelChange={(model) => {
              setPaginationModel(model);
              // Call parent pagination handler if provided (for server-side pagination)
              if (onPaginationModelChange) {
                onPaginationModelChange(model);
              }
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationMode={paginationMode || 'client'}
            // rowCount is only set for server-side pagination to avoid MUI warning
            // Ensure rowCount is always a valid number for server-side pagination
            {...(paginationMode === 'server' ? {
              rowCount: typeof totalCount === 'number' && totalCount >= 0 ? totalCount : memoizedData.length,
            } : {})}
            // For client-side pagination, let MUI handle the row count automatically

            // Sorting with performance optimization
            sortModel={sortModel}
            onSortModelChange={(model) => {
              setSortModel(model);
              onSortChange?.(model);
            }}
            sortingOrder={['asc', 'desc']}

            // Filtering with performance optimization
            filterModel={filterModel}
            onFilterModelChange={(model) => {
              setFilterModel(model);
              onFilterChange?.(model);
              onFilterModelChange?.(model);
            }}

            // Selection
            checkboxSelection={enableSelection}
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={handleSelectionChange}

            // Column management
            columnVisibilityModel={columnVisibility}
            onColumnVisibilityModelChange={setColumnVisibility}
            columnOrderModel={columnOrder}
            onColumnOrderModelChange={setColumnOrder}
            pinnedColumns={pinnedColumns}
            onPinnedColumnsChange={setPinnedColumns}

            // Density
            density={finalDensity}

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
      
      {/* Stats Cards */}
      {showStatsCards && gridCards.length > 0 && (
        <Box
          className="stats-container"
          sx={{
            flexShrink: 0,
            borderTop: `1px solid ${gridTheme.borderColor}`,
            p: 2,
            backgroundColor: 'background.paper',
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