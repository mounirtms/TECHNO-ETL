/**
 * BaseGrid - Enhanced Grid Component Foundation
 * Combines the best features from UnifiedGrid and BaseGrid with DRY optimization
 * Features: Advanced state management, performance optimization, standardized patterns
 */

import React, { useState, useCallback, useMemo, useEffect, useRef, forwardRef, useImperativeHandle, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Skeleton,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';

// Enhanced components
import BaseToolbar from './BaseToolbar';
import BaseCard from './BaseCard';
import BaseDialog from './BaseDialog';
import TooltipWrapper from '../common/TooltipWrapper';
import GridContextMenu from '../grids/GridContextMenu';
import FloatingActionButtons from '../grids/FloatingActionButtons';
import GridCardView from '../common/GridCardView';
import RecordDetailsDialog from '../common/RecordDetailsDialog';

// Hooks and utilities
import { useGridCache } from '../../hooks/useGridCache';
import { useGridState } from '../../hooks/useGridState';
import { useGridActions } from '../../hooks/useGridActions';
import { useOptimizedGridTheme } from '../../hooks/useOptimizedTheme';
import { useSettings } from '../../contexts/SettingsContext';
import { enhanceColumns, applySavedColumnSettings, rowNumberColumn } from '../../utils/gridUtils';
import { HEADER_HEIGHT, FOOTER_HEIGHT, STATS_CARD_HEIGHT } from '../Layout/Constants';

/**
 * Enhanced BaseGrid Component
 * 
 * Combines the best features from UnifiedGrid and BaseGrid with DRY optimization:
 * - Advanced state management with useGridState
 * - Performance optimization with caching
 * - Comprehensive feature set with modular design
 * - Responsive design and accessibility
 * - Context menus, floating actions, and card view
 */
const BaseGrid = forwardRef(({
  // Core props
  gridName = 'BaseGrid',
  columns: gridColumns = [],
  data = [],
  loading = false,
  error = null,
  getRowId = (row) => row.id || row.entity_id,
  density = 'standard',

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
  defaultViewMode = 'grid',
  gridCards = [],
  totalCount = 0,
  defaultPageSize = 25,
  paginationMode = "client",
  onPaginationModelChange,

  // Toolbar configuration
  toolbarConfig = {},
  customActions = [],
  customLeftActions = [],

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
  onRefresh,

  // Advanced props
  preColumns = [],
  endColumns = [],
  initialVisibleColumns = [],
  sx = {},

  // Custom filter props for specialized grids
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
  mdmStocks = false,

  ...props
}, ref) => {
  // Optimized theme and settings
  const gridTheme = useOptimizedGridTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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

  // Stable translation function
  const safeTranslate = useCallback((key, fallback = key) => {
    try {
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
      density: effectiveDensity
    }
  });

  // Destructure grid state
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
    resetState
  } = gridState;

  // Use the grid state density or fallback to effective density
  const finalDensity = gridStateDensity || effectiveDensity;

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
    if (!Array.isArray(data)) {
      console.warn('BaseGrid: data prop is not an array, using empty array');
      return [];
    }

    if (data.length > (virtualizationThreshold || 1000)) {
      console.info(`BaseGrid: Large dataset detected (${data.length} rows), virtualization enabled`);
    }

    return data;
  }, [data, virtualizationThreshold]);

  // Column processing state
  const [processedColumns, setProcessedColumns] = useState([]);

  // Build base columns synchronously
  const baseColumns = useMemo(() => {
    if (!Array.isArray(gridColumns)) {
      console.warn('BaseGrid: gridColumns is not an array, using empty array');
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

  // Apply async column settings and enhancements
  useEffect(() => {
    const processingKey = `${baseColumns.length}-${gridName}-${enableI18n}-${enableSorting}-${enableFiltering}`;

    if (processingRef.current || lastProcessedRef.current === processingKey) {
      return;
    }

    const processColumns = async () => {
      processingRef.current = true;

      try {
        let columns = baseColumns;

        // Apply saved column settings (ASYNC)
        if (gridName && columns.length > 0) {
          columns = await applySavedColumnSettings(gridName, columns);
        }

        // Enhance columns with translations and feature flags (SYNC)
        columns = enhanceColumns(columns, {
          enableI18n,
          translate: safeTranslate,
          enableSorting,
          enableFiltering
        });

        if (!Array.isArray(columns)) {
          console.warn('BaseGrid: processColumns resulted in non-array, using base columns');
          columns = baseColumns;
        }

        setProcessedColumns(columns);
        lastProcessedRef.current = processingKey;

      } catch (error) {
        console.error('BaseGrid: Error processing columns:', error);
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

    if (baseColumns.length > 0) {
      processColumns();
    } else {
      setProcessedColumns([]);
      lastProcessedRef.current = processingKey;
    }
  }, [baseColumns, gridName, enableI18n, enableSorting, enableFiltering, safeTranslate]);

  // Calculate grid height
  const gridHeight = useMemo(() => {
    const baseHeight = window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
    const statsHeight = showStatsCards ? STATS_CARD_HEIGHT : 0;
    const toolbarHeight = 155;
    return baseHeight - statsHeight - toolbarHeight;
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

  // Helper function to determine grid type from grid name
  const getGridType = (name) => {
    if (name.toLowerCase().includes('mdm')) return 'mdm';
    if (name.toLowerCase().includes('cegid')) return 'cegid';
    if (name.toLowerCase().includes('dashboard')) return 'dashboard';
    return 'magento';
  };

  // Error boundary
  if (error) {
    return (
      <Paper sx={{ p: 3, ...sx }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Grid Error
          </Typography>
          <Typography variant="body2">
            {error.message || 'An unexpected error occurred'}
          </Typography>
        </Alert>
      </Paper>
    );
  }

  return (
    <>
      {/* Enhanced Toolbar */}
      <BaseToolbar
        gridName={gridName}
        gridType={getGridType(gridName)}
        config={toolbarConfig}
        customActions={customActions}
        customLeftActions={customLeftActions}
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
            maxHeight: gridHeight,
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

              // Pagination
              paginationModel={paginationModel || { page: 0, pageSize: defaultPageSize }}
              onPaginationModelChange={useCallback((model) => {
                setPaginationModel(model);
                if (onPaginationModelChange) {
                  onPaginationModelChange(model);
                }
              }, [setPaginationModel, onPaginationModelChange])}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationMode={paginationMode || "client"}
              {...(paginationMode === "server" ? {
                rowCount: typeof totalCount === 'number' && totalCount >= 0 ? totalCount : memoizedData.length
              } : {})}

              // Sorting
              sortModel={sortModel}
              onSortModelChange={useCallback((model) => {
                setSortModel(model);
                onSortChange?.(model);
              }, [setSortModel, onSortChange])}
              sortingOrder={['asc', 'desc']}

              // Filtering
              filterModel={filterModel}
              onFilterModelChange={useCallback((model) => {
                setFilterModel(model);
                onFilterChange?.(model);
                onFilterModelChange?.(model);
              }, [setFilterModel, onFilterChange, onFilterModelChange])}

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
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: `repeat(${Math.min(gridCards.length, 4)}, 1fr)`
              },
              gap: 2
            }}
          >
            {gridCards.map((card, index) => (
              <BaseCard
                key={index}
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                loading={loading}
                {...card}
              />
            ))}
          </Box>
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

BaseGrid.displayName = 'BaseGrid';

BaseGrid.propTypes = {
  // Core props
  gridName: PropTypes.string,
  columns: PropTypes.array,
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.object,
  getRowId: PropTypes.func,
  density: PropTypes.oneOf(['compact', 'standard', 'comfortable']),

  // Feature toggles
  enableCache: PropTypes.bool,
  enableI18n: PropTypes.bool,
  enableRTL: PropTypes.bool,
  enableSelection: PropTypes.bool,
  enableSorting: PropTypes.bool,
  enableFiltering: PropTypes.bool,
  enableColumnReordering: PropTypes.bool,
  enableColumnResizing: PropTypes.bool,

  // Performance options
  virtualizationThreshold: PropTypes.number,
  enableVirtualization: PropTypes.bool,
  rowBuffer: PropTypes.number,
  columnBuffer: PropTypes.number,
  rowThreshold: PropTypes.number,
  columnThreshold: PropTypes.number,

  // View options
  showStatsCards: PropTypes.bool,
  showCardView: PropTypes.bool,
  defaultViewMode: PropTypes.oneOf(['grid', 'card']),
  gridCards: PropTypes.array,
  totalCount: PropTypes.number,
  defaultPageSize: PropTypes.number,
  paginationMode: PropTypes.oneOf(['client', 'server']),
  onPaginationModelChange: PropTypes.func,

  // Toolbar configuration
  toolbarConfig: PropTypes.object,
  customActions: PropTypes.array,
  customLeftActions: PropTypes.array,

  // Context menu configuration
  contextMenuActions: PropTypes.object,

  // Floating actions configuration
  floatingActions: PropTypes.object,
  floatingPosition: PropTypes.string,
  floatingVariant: PropTypes.string,
  enableFloatingActions: PropTypes.bool,

  // Filter configuration
  filterOptions: PropTypes.array,
  currentFilter: PropTypes.string,
  onFilterChange: PropTypes.func,
  childFilterModel: PropTypes.object,
  searchableFields: PropTypes.array,

  // Event handlers
  onSelectionChange: PropTypes.func,
  onError: PropTypes.func,
  onExport: PropTypes.func,
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSync: PropTypes.func,
  onSearch: PropTypes.func,
  onSortChange: PropTypes.func,
  onFilterModelChange: PropTypes.func,
  onRowClick: PropTypes.func,
  onRowDoubleClick: PropTypes.func,
  onRefresh: PropTypes.func,

  // Advanced props
  preColumns: PropTypes.array,
  endColumns: PropTypes.array,
  initialVisibleColumns: PropTypes.array,
  sx: PropTypes.object,

  // Custom filter props
  succursaleOptions: PropTypes.array,
  currentSuccursale: PropTypes.string,
  onSuccursaleChange: PropTypes.func,
  sourceOptions: PropTypes.array,
  currentSource: PropTypes.string,
  onSourceChange: PropTypes.func,
  showChangedOnly: PropTypes.bool,
  setShowChangedOnly: PropTypes.func,
  onSyncStocksHandler: PropTypes.func,
  onSyncAllHandler: PropTypes.func,
  canInfo: PropTypes.bool,
  onInfo: PropTypes.func,
  mdmStocks: PropTypes.bool
};

// Memoize the component for performance optimization
const MemoizedBaseGrid = memo(BaseGrid, (prevProps, nextProps) => {
  const criticalProps = ['data', 'loading', 'columns', 'totalCount'];

  for (const prop of criticalProps) {
    if (prevProps[prop] !== nextProps[prop]) {
      return false;
    }
  }

  if (Array.isArray(prevProps.data) && Array.isArray(nextProps.data)) {
    if (prevProps.data.length !== nextProps.data.length) {
      return false;
    }
    const checkCount = Math.min(5, prevProps.data.length);
    for (let i = 0; i < checkCount; i++) {
      if (prevProps.data[i] !== nextProps.data[i]) {
        return false;
      }
    }
  }

  return true;
});

MemoizedBaseGrid.displayName = 'MemoizedBaseGrid';

export default MemoizedBaseGrid;