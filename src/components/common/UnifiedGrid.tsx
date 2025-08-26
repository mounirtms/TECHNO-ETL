import React from 'react';
// UnifiedGrid - Optimized Grid System
// Merges the best features from BaseGrid and EnhancedBaseGrid with performance optimizations
import { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle, memo } from 'react';
import { DataGrid, GridColDef, GridRowsProp, GridSortModel, GridFilterModel, GridRowId } from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Fade,
  Skeleton,
  Alert
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
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

// Types
import { ToolbarConfig, GridCard } from '../../types/baseComponents';

/**
 * UnifiedGrid Props Interface
 */
export interface UnifiedGridProps {
  // Core props
  gridName: string;
  columns?: GridColDef[];
  data?: any[];
  loading?: boolean;
  onRefresh?: () => void;
  getRowId?: (row) => GridRowId;

  // Feature toggles
  enableCache?: boolean;
  enableI18n?: boolean;
  enableRTL?: boolean;
  enableSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnReordering?: boolean;
  enableColumnResizing?: boolean;

  // Performance options
  virtualizationThreshold?: number;
  enableVirtualization?: boolean;
  rowBuffer?: number;
  columnBuffer?: number;
  rowThreshold?: number;
  columnThreshold?: number;

  // View options
  showStatsCards?: boolean;
  showCardView?: boolean;
  defaultViewMode?: 'grid' | 'card';
  gridCards?: GridCard[];
  totalCount?: number;
  defaultPageSize?: number;
  paginationMode?: 'client' | 'server';
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;

  // Toolbar configuration
  toolbarConfig?: Partial<ToolbarConfig>;
  customActions?: any[];

  // Context menu configuration
  contextMenuActions?: Record<string, any>;

  // Floating actions configuration
  floatingActions?: Record<string, any>;
  floatingPosition?: string;
  floatingVariant?: string;
  enableFloatingActions?: boolean;

  // Filter configuration
  filterOptions?: any[];
  currentFilter?: string;
  onFilterChange?: (filter) => void;
  childFilterModel?: any;
  searchableFields?: string[];

  // Event handlers
  onSelectionChange?: (selection: any[]) => void;
  onError?: (error: Error) => void;
  onExport?: () => void;
  onAdd?: () => void;
  onEdit?: (row?) => void;
  onDelete?: (rows?: any[]) => void;
  onSync?: () => void;
  onSearch?: (value: string) => void;
  onSortChange?: (model: GridSortModel) => void;
  onFilterModelChange?: (model: GridFilterModel) => void;
  onRowClick?: (params) => void;
  onRowDoubleClick?: (params) => void;

  // Advanced props
  preColumns?: GridColDef[];
  endColumns?: GridColDef[];
  initialVisibleColumns?: string[];
  toolbarProps?: Record<string, any>;
  sx?: SxProps<Theme>;

  // Custom filter props for MDM and other specialized grids
  succursaleOptions?: any[];
  currentSuccursale?: any;
  onSuccursaleChange?: (value) => void;
  sourceOptions?: any[];
  currentSource?: any;
  onSourceChange?: (value) => void;
  showChangedOnly?: boolean;
  setShowChangedOnly?: (value: boolean) => void;
  onSyncStocksHandler?: () => void;
  onSyncAllHandler?: () => void;
  canInfo?: boolean;
  onInfo?: (row?) => void;
  mdmStocks?: boolean;

  // Other props
  [key: string]: any;
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
const UnifiedGrid = forwardRef<any, UnifiedGridProps>(({
  // Core props
  gridName,
  columns: gridColumns = [],
  data = [],
  loading = false,
  onRefresh,
  getRowId = undefined,
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
  virtualizationThreshold = 100,
  enableVirtualization = true,
  rowBuffer = 10,
  columnBuffer = 10,
  rowThreshold = 50,
  columnThreshold = 50,
  // View options
  showStatsCards = false,
  showCardView = false,
  defaultViewMode = 'grid',
  gridCards = [],
  totalCount = 0,
  defaultPageSize = 10,
  paginationMode = 'client',
  onPaginationModelChange,

  // Toolbar configuration
  toolbarConfig = {},
  customActions = [],
  // Context menu configuration
  contextMenuActions = {},

  // Floating actions configuration
  floatingActions = {},
  floatingPosition = 'bottom-right',
  floatingVariant = 'extended',
  enableFloatingActions = false,
  // Filter configuration
  filterOptions = [],
  currentFilter = '',
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
  toolbarProps = {},
  sx = {},

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
  mdmStocks = false,
  ...props
}, ref) => {
  // Optimized theme and translation hooks
  const gridTheme = useOptimizedGridTheme();

  // Stable translation function that doesn't change on every render
  const safeTranslate = useCallback((key: string, fallback: string = key) => {
    try {
      // Simple fallback translation without excessive dependencies
      return enableI18n ? (fallback || key) : (fallback || key);
    } catch(error: any) {
      return fallback || key;
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

  // Memoize data with performance optimizations
  const memoizedData = useMemo(() => {
    // Ensure data is always an array
    if (!Array.isArray(data)) {
      console.warn('UnifiedGrid: data prop is not an array, using empty array');
      return [];
    // For large datasets, enable virtualization automatically
    if (data.length > (virtualizationThreshold || 1000)) {
      console.info(`UnifiedGrid: Large dataset detected (${data.length} rows), virtualization enabled`);
    // Return data with performance metadata
    return data;
  }, [data, virtualizationThreshold]);

  // Cache management
  const {
    setCacheData,
    clearCache,
    invalidateCache,
    cacheStats
  } = useGridCache(gridName, enableCache);

  // Grid actions hook
  const gridActionsResult = useGridActions({
    onRefresh,
    onAdd,
    onEdit,
    onDelete,
    onSync,
    onExport,
    onSearch,
    selectedRows: safeSelectedRows,
    data: memoizedData,
    gridName,
    searchableFields
  });

  const {
    handleRefresh,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSync,
    handleExport,
    handleSearch
  } = gridActionsResult;

  // Local state
  const [contextMenu, setContextMenu] = useState(null);
  const [viewMode, setViewMode] = useState<'grid' | 'card'>(defaultViewMode);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const gridRef = useRef(null);

  // ===== COLUMN SETUP PROCESS =====
  const [processedColumns, setProcessedColumns] = useState<GridColDef[]>([]);

  // Step 1: Build base columns synchronously
  const baseColumns = useMemo(() => {
    // Ensure gridColumns is always an array
    if (!Array.isArray(gridColumns)) {
      console.warn('UnifiedGrid: gridColumns is not an array, using empty array');
      return [];
    let columns = [...gridColumns];

    // Add row number column if needed
    if(toolbarConfig?.showRowNumbers) {
      columns = [rowNumberColumn, ...columns];
    // Add pre and end columns
    columns = [...(preColumns || []), ...columns, ...(endColumns || [])];

    return columns;
  }, [gridColumns, preColumns, endColumns, toolbarConfig?.showRowNumbers]);

  // Processing state to prevent excessive re-renders
  const processingRef = useRef<boolean>(false);
  const lastProcessedRef = useRef<string>('');

  // Step 2: Apply async column settings and enhancements
  useEffect(() => {
    // Create a stable key for this processing request
    const processingKey = `${baseColumns.length}-${gridName}-${enableI18n}-${enableSorting}-${enableFiltering}`;

    // Skip if already processing the same configuration
    if(processingRef.current || lastProcessedRef.current ===processingKey) {
      return;
    const processColumns = async () => {
      processingRef.current = true;

      try {
        // Start with base columns from Step 1
        let columns = baseColumns;

        // Apply saved column settings (ASYNC - loads from localStorage/database)
        if(gridName && columns.length > 0) {
          columns = await applySavedColumnSettings(gridName, columns);
        // Enhance columns with translations and feature flags (SYNC)
        columns = enhanceColumns(columns, {
          enableI18n,
          translate: safeTranslate,
          enableSorting,
          enableFiltering
        }) as GridColDef[];

        // CRITICAL: Always ensure columns is an array to prevent grid crashes
        if (!Array.isArray(columns)) {
          console.warn('UnifiedGrid: processColumns resulted in non-array, using base columns');
          columns = [];
        // Step 3: Set final processed columns for grid rendering
        setProcessedColumns(columns);
        lastProcessedRef.current = processingKey;

      } catch(error) {
        console.error('UnifiedGrid: Error processing columns:', error);
        // FALLBACK: Use enhanced base columns without saved settings
        const fallbackColumns = enhanceColumns(baseColumns, {
          enableI18n,
          translate: safeTranslate,
          enableSorting,
          enableFiltering
        }) as GridColDef[];
        setProcessedColumns(fallbackColumns);
        lastProcessedRef.current = processingKey;
      } finally {
        processingRef.current = false;
    };

    // Only process if we have base columns
    if(baseColumns.length > 0) {
      processColumns();
    } else {
      // Handle empty columns case
      setProcessedColumns([]);
      lastProcessedRef.current = processingKey;
  }, [baseColumns, gridName, enableI18n, enableSorting, enableFiltering, safeTranslate]);

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
    if(enableCache && memoizedData.length > 0) {
      setCacheData(memoizedData, {
        pagination: paginationModel,
        sort: sortModel,
        filter: filterModel,
        timestamp: Date.now()
      });
  }, [memoizedData, paginationModel, sortModel, filterModel, enableCache, setCacheData]);

  // Selection change handler
  const handleSelectionChange = useCallback((newSelection) => {
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  }, [setSelectedRows, onSelectionChange]);

  // Context menu handlers
  const handleContextMenu = useCallback((event: React.MouseEvent, row) => {
    if (Object.keys(contextMenuActions || {}).length ===0) return;

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
  const handleViewModeChange = useCallback((_event, newMode: 'grid' | 'card') => {
    if(newMode !== null) {
      setViewMode(newMode);
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
  const getGridType = (name: string) => {
    if (name?.toLowerCase().includes('mdm')) return 'mdm';
    if (name?.toLowerCase().includes('cegid')) return 'cegid';
    if (name?.toLowerCase().includes('dashboard')) return 'dashboard';
    return 'magento'; // Default to magento
  };

  return (
    <>
      {/* Unified Toolbar */}
      <UnifiedGridToolbar gridName={gridName}
        gridType={getGridType(gridName)}
        config={toolbarConfig}
        customActions={customActions}
        customLeftActions={toolbarConfig?.customLeftActions || []}
        selectedRows={selectedRows}
        onRefresh={handleRefresh}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSync={handleSync}
        onExport={handleExport}
        onImport={() => {}}
        onSearch={handleSearch}
        searchValue={searchValue}
        onClearSearch={() => setSearchValue('')}
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
        onCustomFilterChange={() => {}}
        currentCustomFilter={currentFilter}

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
        <Box sx={{ display: "flex", position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}></
          <Skeleton variant="rectangular" height={4} /></Skeleton>
      )}

      <Fade in={!loading} timeout={300}></
        <Box sx={{
            minHeight: 0,
            maxHeight: responsiveGridHeight,
            height: responsiveGridHeight,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
          {viewMode === 'card' && showCardView ? (<GridCardView
              data={data}
              columns={processedColumns}
              onRowClick = {}; // Fixed invalid assignment
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
              disableVirtualization={!enableVirtualization || memoizedData.length < (virtualizationThreshold || 1000)}

              // Ensure we have valid data before rendering
              { ...((memoizedData.length ===0) ? {
                initialState: { pagination: { paginationModel: { page: 0, pageSize: defaultPageSize } } }
              } : {})}

              // Pagination - supports both client and server-side pagination
              paginationModel = {}; // Fixed invalid assignment
                page: Math.max(0, safePaginationModel.page || 0),
                pageSize: Math.max(1, safePaginationModel.pageSize || defaultPageSize)
              }}
              onPaginationModelChange = {}; // Fixed invalid assignment
                  page: Math.max(0, model?.page || 0),
                  pageSize: Math.max(1, model?.pageSize || defaultPageSize)
                }));
                setPaginationModel(validModel);
                // Call parent pagination handler if provided (for server-side pagination)
                if(onPaginationModelChange) {
                  onPaginationModelChange(validModel);
              }, [onPaginationModelChange, defaultPageSize, setPaginationModel])}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationMode={paginationMode || "client"}
              // Only provide rowCount for server-side pagination to prevent warnings
              { ...(paginationMode === "server" ? {
                rowCount: Math.max(0, typeof totalCount === 'number' ? totalCount : 0)
              } : {})}

              // Sorting with performance optimization
              sortModel={sortModel}
              onSortModelChange = {}; // Fixed invalid assignment
              }, [setSortModel, onSortChange])}
              sortingOrder={['asc', 'desc']}

              // Filtering with performance optimization
              filterModel={filterModel}
              onFilterModelChange = {}; // Fixed invalid assignment
              }, [setFilterModel, onFilterChange, onFilterModelChange])}

              // Selection
              checkboxSelection={enableSelection}
              rowSelectionModel={safeSelectedRows}
              onRowSelectionModelChange={handleSelectionChange}

              // Column management
              columnVisibilityModel={safeColumnVisibility}
              onColumnVisibilityModelChange={setColumnVisibility}

              // Density
              density={density}

              // Features
              disableColumnResize={!enableColumnResizing}

              // Row configuration
              getRowId={getRowId}
              onRowClick = {}; // Fixed invalid assignment
              }}
              onRowDoubleClick = {}; // Fixed invalid assignment
              }}

              // Disable default toolbar
              hideFooter={false}
              disableColumnMenu={false}

              { ...props}
            />
          )}
        </Box>
      </Fade>

      {/* Stats Cards */}
      {showStatsCards && gridCards.length > 0 && (
        <Box
          className = {}; // Fixed invalid assignment
            borderTop: `1px solid ${gridTheme.borderColor}`,
            p: 2,
            backgroundColor: 'background.paper'
          }}
        ></
          <StatsCards cards={gridCards} /></StatsCards>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <GridContextMenu contextMenu={contextMenu}
          onClose={handleContextMenuClose}
          actions={contextMenuActions || {}}
          onAction={() => {}}
        />
      )}

      {/* Floating Action Buttons */}
      {enableFloatingActions && (
        <FloatingActionButtons actions={floatingActions || {}}
          position={floatingPosition}
          variant={floatingVariant}
          onAction={() => {}}
        />
      )}

      {/* Record Details Dialog */}
      <RecordDetailsDialog open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        record={selectedRecord}
      />
    </>
  );
});

UnifiedGrid.displayName = 'UnifiedGrid';

// Memoize the component for performance optimization
const MemoizedUnifiedGrid = memo(UnifiedGrid, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  // Only re-render if critical props have changed
  const criticalProps: string[] = ['data', 'loading', 'columns', 'totalCount'];

  for (const prop of criticalProps) {
    if(prevProps[prop] !== nextProps[prop]) {
      return false; // Props changed, re-render
  // Check if data array contents changed (shallow comparison)
  if (Array.isArray(prevProps?.data) && Array.isArray(nextProps?.data)) {
    if(prevProps?.data.length !== nextProps?.data.length) {
      return false;
    // For performance, only check first few items for changes
    const checkCount = Math.min(5, prevProps?.data.length);
    for(let i = 0; i < checkCount; i++) {
      if(prevProps?.data[i] !== nextProps?.data[i]) {
        return false;
  return true; // Props haven't changed significantly, skip re-render
});

MemoizedUnifiedGrid.displayName = 'MemoizedUnifiedGrid';

export default MemoizedUnifiedGrid;