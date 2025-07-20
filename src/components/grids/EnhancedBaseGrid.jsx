/**
 * DEPRECATED: EnhancedBaseGrid Component
 *
 * This component is deprecated and will be removed in a future version.
 * Please use UnifiedGrid from '../common/UnifiedGrid' instead.
 *
 * UnifiedGrid already includes all the features from EnhancedBaseGrid:
 * - Advanced caching with useGridCache
 * - Comprehensive state management with useGridState
 * - i18n and RTL support
 * - Context menus and floating actions
 * - Performance optimizations
 *
 * @deprecated Use UnifiedGrid instead
 */

// Enhanced BaseGrid with comprehensive features, caching, i18n, RTL support
import React, { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

// Show deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'EnhancedBaseGrid is deprecated. Please use UnifiedGrid instead. ' +
    'UnifiedGrid already includes all EnhancedBaseGrid features.'
  );
}

// Throw error in production to prevent usage
if (process.env.NODE_ENV === 'production') {
  throw new Error(
    'EnhancedBaseGrid is deprecated and disabled in production. ' +
    'Please migrate to UnifiedGrid from ../common/UnifiedGrid'
  );
}
import { DataGrid } from '@mui/x-data-grid';
import { 
  Box, 
  Paper, 
  Fade, 
  useTheme, 
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
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import GridToolbar from './GridToolbar';
import GridContextMenu from './GridContextMenu';
import FloatingActionButtons from './FloatingActionButtons';
import { useGridCache } from '../../hooks/useGridCache';
import { useGridState } from '../../hooks/useGridState';
import { StatsCards } from '../common/StatsCards';
import GridCardView from '../common/GridCardView';
import RecordDetailsDialog from '../common/RecordDetailsDialog';
// import SettingsDialog from '../common/CustomGridLayoutSettings'; // Temporarily disabled
import { generateColumns, applySavedColumnSettings, rowNumberColumn } from '../../utils/gridUtils';
import { HEADER_HEIGHT, FOOTER_HEIGHT, STATS_CARD_HEIGHT } from '../Layout/Constants';

/**
 * Enhanced BaseGrid Component
 * A comprehensive, feature-rich data grid with caching, i18n, RTL support, and extensive customization
 */
const EnhancedBaseGrid = forwardRef(({
  // Core props
  gridName,
  columns: gridColumns = [],
  data = [],
  loading = false,
  onRefresh,
  getRowId = (row) => row.id || row.entity_id,
  
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
  
  // Feature toggles
  enableCache = true,
  enableI18n = true,
  enableRTL = true,
  enableVirtualization = true,
  enableSelection = true,
  enableSorting = true,
  enableFiltering = true,
  enableColumnReordering = true,
  enableColumnResizing = true,
  enableRowReordering = false,
  
  // View options
  showCardView = true,
  showStatsCards = true,
  defaultViewMode = 'grid', // 'grid' | 'card'
  
  // Stats and cards
  gridCards = [],
  totalCount = 0,
  totalItemsCount = 0,
  
  // Pagination
  defaultPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  
  // Columns configuration
  preColumns = [],
  endColumns = [],
  initialVisibleColumns = [],
  
  // Event handlers
  onSelectionChange,
  onRowDoubleClick,
  onCellClick,
  onRowClick,
  onError,
  onExport,
  onImport,
  onAdd,
  onEdit,
  onDelete,
  onSync,
  
  // Filter configuration
  filterOptions = [],
  currentFilter,
  onFilterChange,
  childFilterModel,
  
  // Additional props
  ...gridProps
}, ref) => {
  const theme = useTheme();

  // Safe translation hook with fallback
  let t, i18n;
  try {
    const translation = useTranslation();
    t = translation.t;
    i18n = translation.i18n;
  } catch (error) {
    console.warn('Translation system not available, using fallback:', error);
    t = (key, fallback) => fallback || key;
    i18n = { dir: () => 'ltr' };
  }

  const isRTL = enableRTL && i18n.dir() === 'rtl';

  // Debug columns
  console.log(`EnhancedBaseGrid (${gridName}): Received columns:`, gridColumns);
  console.log(`EnhancedBaseGrid (${gridName}): Columns is array:`, Array.isArray(gridColumns));
  console.log(`EnhancedBaseGrid (${gridName}): Columns length:`, gridColumns?.length);
  
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
    resetState,
    exportState,
    importState
  } = useGridState(gridName, {
    enablePersistence: true,
    initialState: {
      paginationModel: { page: 0, pageSize: defaultPageSize }
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

  // Local state
  const [contextMenu, setContextMenu] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [viewMode, setViewMode] = useState(defaultViewMode);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const gridRef = useRef(null);
  const isMounted = useRef(false);

  // Enhanced columns with i18n and configuration
  const enhancedColumns = useMemo(() => {
    // Ensure gridColumns is always a valid array
    if (!Array.isArray(gridColumns)) {
      console.error('EnhancedBaseGrid: gridColumns is not an array:', gridColumns);
      return [];
    }

    let processedColumns = [...gridColumns];
    
    // Add pre-columns (like row numbers)
    if (preColumns.length > 0) {
      processedColumns = [...preColumns, ...processedColumns];
    }
    
    // Add end columns
    if (endColumns.length > 0) {
      processedColumns = [...processedColumns, ...endColumns];
    }
    
    // Apply i18n translations with robust fallback to original headerName
    processedColumns = processedColumns.map(col => {
      let headerName = col.headerName || col.field; // Fallback to field name if no headerName

      if (enableI18n && t) {
        try {
          const translationKey = `grid.${gridName}.columns.${col.field}`;
          const translated = t(translationKey, col.headerName || col.field);

          // Only use translation if it's meaningful and different from the key
          if (translated && translated !== translationKey && translated.trim() !== '') {
            headerName = translated;
          }
        } catch (error) {
          console.warn(`Translation failed for ${col.field}, using original headerName:`, error);
          // Keep the original headerName as fallback
        }
      }

      return {
        ...col,
        headerName,
        sortable: enableSorting && (col.sortable !== false),
        filterable: enableFiltering && (col.filterable !== false),
        resizable: enableColumnResizing && (col.resizable !== false),
        hideable: col.hideable !== false,
      };
    });
    
    // Apply saved column settings
    // Final safety check
    if (!Array.isArray(processedColumns) || processedColumns.length === 0) {
      console.error('EnhancedBaseGrid: processedColumns is invalid:', processedColumns);
      return [{ field: 'id', headerName: 'ID', width: 100 }]; // Fallback column
    }

    return applySavedColumnSettings(processedColumns, gridName);
  }, [gridColumns, preColumns, endColumns, enableI18n, t, gridName, enableSorting, enableFiltering, enableColumnResizing]);

  // Calculate grid height
  const gridHeight = useMemo(() => {
    const baseHeight = window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
    const statsHeight = showStatsCards ? STATS_CARD_HEIGHT : 0;
    const toolbarHeight = 56; // Toolbar height
    return baseHeight - statsHeight - toolbarHeight - 32; // 32px for padding
  }, [showStatsCards]);

  // Cache management
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

  // Context menu handlers
  const handleContextMenu = useCallback((event) => {
    if (!Object.keys(contextMenuActions).length) return;
    
    event.preventDefault();
    const rowId = event.currentTarget.getAttribute('data-id');
    const rowData = data.find(row => getRowId(row) === rowId);
    
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      rowId,
      rowData
    });
  }, [data, getRowId, contextMenuActions]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Row interaction handlers
  const handleRowDoubleClick = useCallback((params, event) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(params, event);
    } else {
      // Default behavior: open details dialog
      setSelectedRecord(params.row);
      setDetailsDialogOpen(true);
    }
  }, [onRowDoubleClick]);

  const handleRowClick = useCallback((params, event) => {
    onRowClick?.(params, event);
  }, [onRowClick]);

  const handleCellClick = useCallback((params, event) => {
    onCellClick?.(params, event);
  }, [onCellClick]);

  // Selection handlers
  const handleSelectionModelChange = useCallback((newSelection) => {
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  }, [onSelectionChange, setSelectedRows]);

  // Toolbar handlers
  const handleRefresh = useCallback(() => {
    clearCache();
    onRefresh?.();
  }, [clearCache, onRefresh]);

  const handleSearch = useCallback((value) => {
    setSearchValue(value);
    // Implement search logic here
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  const handleFiltersToggle = useCallback(() => {
    setFiltersVisible(!filtersVisible);
  }, [filtersVisible]);

  const handleSettings = useCallback((type) => {
    if (type === 'reset') {
      resetState();
      const message = enableI18n && t ? t('grid.settings.resetSuccess', 'Grid layout reset successfully') : 'Grid layout reset successfully';
      toast.success(message);
    } else {
      setSettingsDialogOpen(true);
    }
  }, [resetState, t, enableI18n]);

  // Action handlers
  const handleContextMenuAction = useCallback((actionKey, rowData, rowId, selectedRows) => {
    switch (actionKey) {
      case 'edit':
        onEdit?.(rowData, rowId);
        break;
      case 'delete':
        onDelete?.(rowData, rowId);
        break;
      case 'view':
        setSelectedRecord(rowData);
        setDetailsDialogOpen(true);
        break;
      default:
        // Handle custom actions
        break;
    }
  }, [onEdit, onDelete]);

  const handleFloatingAction = useCallback((actionKey, selectedRows) => {
    switch (actionKey) {
      case 'add':
        onAdd?.();
        break;
      case 'edit':
        if (selectedRows.length === 1) {
          const rowData = data.find(row => getRowId(row) === selectedRows[0]);
          onEdit?.(rowData, selectedRows[0]);
        }
        break;
      case 'delete':
        onDelete?.(selectedRows);
        break;
      case 'export':
        onExport?.(selectedRows);
        break;
      case 'sync':
        onSync?.();
        break;
      case 'refresh':
        handleRefresh();
        break;
      default:
        // Handle custom actions
        break;
    }
  }, [onAdd, onEdit, onDelete, onExport, onSync, handleRefresh, data, getRowId]);

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
    refreshGrid: handleRefresh
  }), [exportState, importState, resetState, clearCache, invalidateCache, selectedRows, data, cacheStats, handleRefresh]);

  // Error boundary
  if (onError && data.length === 0 && !loading) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {t('grid.common.error', 'Error loading data')}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      {/* Stats Cards */}
      {showStatsCards && gridCards.length > 0 && (
        <StatsCards cards={gridCards} />
      )}

      {/* View Mode Toggle */}
      {showCardView && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="grid">
              <Tooltip title={t('grid.common.gridView', 'Grid View')}>
                <GridViewIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="card">
              <Tooltip title={t('grid.common.cardView', 'Card View')}>
                <ViewListIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {/* Main Content */}
      {viewMode === 'card' && showCardView ? (
        <GridCardView
          data={data}
          loading={loading}
          onRefresh={onRefresh}
          selectedRows={selectedRows}
          onSelectionChange={handleSelectionModelChange}
        />
      ) : (
        <Paper 
          elevation={1} 
          sx={{ 
            height: gridHeight,
            width: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {loading && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
              <Skeleton variant="rectangular" height={gridHeight} />
            </Box>
          )}
          
          <DataGrid
            ref={gridRef}
            rows={data}
            columns={Array.isArray(enhancedColumns) && enhancedColumns.length > 0 ? enhancedColumns : [{ field: 'id', headerName: 'ID', width: 100 }]}
            loading={loading}
            getRowId={getRowId}

            // Responsive settings
            density="compact"
            rowHeight={52}
            headerHeight={56}
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none',
                direction: isRTL ? 'rtl' : 'ltr'
              },
              '& .MuiDataGrid-cell': {
                borderBottom: 'none',
                fontSize: '0.875rem',
                borderRight: isRTL ? 'none' : `1px solid ${theme.palette.divider}`,
                borderLeft: isRTL ? `1px solid ${theme.palette.divider}` : 'none',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.background.default,
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                color: theme.palette.text.primary,
                fontSize: '0.875rem',
                fontWeight: 600,
              },
              '& .MuiDataGrid-virtualScroller': {
                backgroundColor: theme.palette.background.paper,
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: theme.palette.background.default,
                borderTop: `1px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                },
              },
              // Mobile responsive styles
              [theme.breakpoints.down('md')]: {
                '& .MuiDataGrid-columnHeaders': {
                  fontSize: '0.75rem',
                },
                '& .MuiDataGrid-cell': {
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                },
              },
              [theme.breakpoints.down('sm')]: {
                '& .MuiDataGrid-columnHeaders': {
                  fontSize: '0.7rem',
                  minHeight: '40px',
                },
                '& .MuiDataGrid-cell': {
                  fontSize: '0.7rem',
                  padding: '2px 4px',
                },
                '& .MuiDataGrid-row': {
                  minHeight: '36px',
                },
              },
            }}
            
            // Pagination
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={pageSizeOptions}
            paginationMode={totalCount && totalCount > 0 ? "server" : "client"}
            rowCount={totalCount && totalCount > 0 ? totalCount : data.length}
            
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
            onRowSelectionModelChange={handleSelectionModelChange}
            
            // Column management
            columnVisibilityModel={columnVisibility}
            onColumnVisibilityModelChange={setColumnVisibility}
            columnOrderModel={columnOrder}
            onColumnOrderModelChange={setColumnOrder}
            
            // Row interactions
            onRowDoubleClick={handleRowDoubleClick}
            onRowClick={handleRowClick}
            onCellClick={handleCellClick}
            
            // Toolbar
            slots={{
              toolbar: () => (
                <GridToolbar
                  gridName={gridName}
                  onRefresh={handleRefresh}
                  selectedRows={selectedRows}
                  config={toolbarConfig}
                  columnVisibility={columnVisibility}
                  onColumnVisibilityChange={setColumnVisibility}
                  density={density}
                  onDensityChange={setDensity}
                  enableI18n={enableI18n}
                  isRTL={isRTL}
                  onSearch={handleSearch}
                  searchValue={searchValue}
                  onClearSearch={handleClearSearch}
                  onExport={onExport}
                  onImport={onImport}
                  onAdd={onAdd}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSync={onSync}
                  onSettings={handleSettings}
                  onFiltersToggle={handleFiltersToggle}
                  filtersVisible={filtersVisible}
                  customActions={customActions}
                  loading={loading}
                />
              )
            }}

            
            // Row props for context menu
            slotProps={{
              row: { 
                onContextMenu: handleContextMenu,
                style: { cursor: 'pointer' }
              }
            }}
            
            // Additional props
            {...gridProps}
          />

          {/* Floating Action Buttons */}
          {enableFloatingActions && Object.keys(floatingActions).length > 0 && (
            <FloatingActionButtons
              actions={floatingActions}
              selectedRows={selectedRows}
              isRTL={isRTL}
              enableI18n={enableI18n}
              position={floatingPosition}
              variant={floatingVariant}
              onAction={handleFloatingAction}
            />
          )}
        </Paper>
      )}

      {/* Context Menu */}
      <GridContextMenu
        contextMenu={contextMenu}
        onClose={handleCloseContextMenu}
        actions={contextMenuActions}
        enableI18n={enableI18n}
        isRTL={isRTL}
        selectedRows={selectedRows}
        onAction={handleContextMenuAction}
      />

      {/* Details Dialog */}
      <RecordDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        record={selectedRecord}
        gridName={gridName}
      />

      {/* Settings Dialog - Temporarily disabled */}
      {false && (
        <div>Settings Dialog Placeholder</div>
      )}
    </Box>
  );
});

EnhancedBaseGrid.displayName = 'EnhancedBaseGrid';

export default EnhancedBaseGrid;
