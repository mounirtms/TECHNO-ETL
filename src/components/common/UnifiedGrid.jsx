// UnifiedGrid - Optimized Grid System
// Merges the best features from BaseGrid and EnhancedBaseGrid
import React, { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Fade,
  Skeleton,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import { 
  GridView as GridViewIcon,
  ViewList as ViewListIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSafeTranslate } from '../../hooks/useOptimizedTranslation';
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
  
  // View options
  showStatsCards = false,
  showCardView = true,
  defaultViewMode = 'grid', // 'grid' or 'card'
  gridCards = [],
  totalCount = 0,
  defaultPageSize = 25,
  
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
  
  // Event handlers
  onSelectionChange,
  onError,
  onExport,
  onAdd,
  onEdit,
  onDelete,
  onSync,
  
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

  ...props
}, ref) => {
  // Optimized theme and translation hooks
  const gridTheme = useOptimizedGridTheme();
  const safeTranslate = useSafeTranslate(enableI18n);

  // Grid state management
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

  // Cache management
  const { 
    cacheData, 
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
    handleExport
  } = useGridActions({
    onRefresh,
    onAdd,
    onEdit,
    onDelete,
    onSync,
    onExport,
    selectedRows,
    data,
    gridName
  });

  // Local state
  const [contextMenu, setContextMenu] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [viewMode, setViewMode] = useState(defaultViewMode);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const gridRef = useRef(null);
  const isMounted = useRef(false);

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

  // Step 2: Apply async column settings and enhancements
  // This effect handles the async column processing pipeline
  useEffect(() => {
    const processColumns = async () => {
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
      }
    };

    // Only process if we have base columns
    if (baseColumns.length > 0) {
      processColumns();
    } else {
      // Handle empty columns case
      setProcessedColumns([]);
    }
  }, [baseColumns, gridName, enableI18n, safeTranslate, enableSorting, enableFiltering]);

  // Calculate grid height
  const gridHeight = useMemo(() => {
    const baseHeight = window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
    const statsHeight = showStatsCards ? STATS_CARD_HEIGHT : 0;
    const toolbarHeight = 56; // Toolbar height
    return baseHeight - statsHeight - toolbarHeight - 32; // 32px for padding
  }, [showStatsCards]);

  // Cache management effect
  useEffect(() => {
    if (enableCache && data.length > 0) {
      setCacheData(data, {
        pagination: paginationModel,
        sort: sortModel,
        filter: filterModel,
        timestamp: Date.now()
      });
    }
  }, [data, paginationModel, sortModel, filterModel, enableCache, setCacheData]);

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
  const handleViewModeChange = useCallback((event, newMode) => {
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

  return (
    <Paper
      elevation={1}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        direction: enableRTL ? 'rtl' : 'ltr',
        overflow: 'hidden',
        // Modern design with glass morphism
        background: gridTheme.palette.mode === 'light'
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(18, 18, 18, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: gridTheme.borderRadius,
        boxShadow: gridTheme.elevation,
        border: `1px solid ${gridTheme.borderColor}`,
        // Enhanced responsive design
        '@media (max-width: 768px)': {
          height: 'calc(100% - 8px)',
          margin: '4px 0',
          borderRadius: 2,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        },
        '@media (max-width: 480px)': {
          height: 'calc(100% - 4px)',
          margin: '2px 0',
          borderRadius: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        ...sx
      }}
    >
      {/* Error Message - Show above grid but keep grid visible */}
      {hasError && (
        <Alert severity="error" sx={{ m: 1, borderRadius: 1 }}>
          {safeTranslate('grid.common.error', 'Error loading data')} - Grid columns are shown below
        </Alert>
      )}

 

      {/* Unified Toolbar */}
      <UnifiedGridToolbar
        gridName={gridName}
        config={toolbarConfig}
        customActions={customActions}
        selectedRows={selectedRows}
        onRefresh={handleRefresh}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSync={handleSync}
        onExport={handleExport}
        onSearch={setSearchValue}
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
      <Box sx={{ flex: 1, position: 'relative' }}>
        {loading && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
            <Skeleton variant="rectangular" height={4} />
          </Box>
        )}

        <Fade in={!loading} timeout={300}>
          <Box sx={{ height: '100%' }}>
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
                rows={Array.isArray(data) ? data : []}
                columns={processedColumns}
                loading={loading}

                // Ensure we have valid data before rendering
                {...((!Array.isArray(data) || data.length === 0) ? {
                  initialState: { pagination: { paginationModel: { page: 0, pageSize: defaultPageSize } } }
                } : {})}

                // Pagination - client-side pagination without rowCount to prevent MUI warnings
                paginationModel={paginationModel || { page: 0, pageSize: defaultPageSize }}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50, 100]}
                paginationMode="client"
                // rowCount is not needed for client-side pagination and causes MUI warnings
                
                // Sorting
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                sortingOrder={['asc', 'desc']}
                
                // Filtering
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                
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
                density={density}
                
                // Features
                disableColumnReorder={!enableColumnReordering}
                disableColumnResize={!enableColumnResizing}
                
                // Row configuration
                getRowId={getRowId}
                onRowClick={(params) => {
                  setSelectedRecord(params.row);
                  setDetailsDialogOpen(true);
                }}
                onRowContextMenu={(params, event) => handleContextMenu(event, params.row)}
                
                // Styling
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-main': {
                    borderRadius: 0
                  },
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none'
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: gridTheme.rowHoverColor
                  }
                }}
                
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
        <Box sx={{ p: 2, borderBottom: `1px solid ${gridTheme.borderColor}` }}>
          <StatsCards cards={gridCards} />
        </Box>
      )}
      </Box>

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
    </Paper>
  );
});

UnifiedGrid.displayName = 'UnifiedGrid';

export default UnifiedGrid;
