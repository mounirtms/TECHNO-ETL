import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Box, Paper, useTheme, alpha } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
//import { UnifiedGridToolbar } from './UnifiedGridToolbar';
import { StatsCards } from './StatsCards';
import { createProductionGridConfig } from '../../config/productionGridConfig';
import { useGridPerformance } from '../../hooks/useGridPerformance';
import { useGridCache } from '../../hooks/useGridCache';

/**
 * Production-Ready Grid Component
 * Standardized, optimized, and consistent grid for all use cases
 */
const ProductionGrid = ({
  // Data props
  data = [],
  columns = [],
  loading = false,
  error = null,
  totalCount = 0,
  
  // Grid configuration
  gridType = 'default',
  gridName = 'ProductionGrid',
  customConfig = {},
  
  // Features
  enableStats = false,
  statsCards = [],
  enableToolbar = true,
  enablePagination = true,
  enableSelection = true,
  
  // Event handlers
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  onSortChange,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onExport,
  onImport,
  
  // Styling
  sx = {},
  className = '',
  
  // Advanced props
  getRowId,
  getRowClassName,
  isRowSelectable,
  
  ...otherProps
}) => {
  const theme = useTheme();
  
  // Get production configuration
  const config = useMemo(() => 
    createProductionGridConfig(gridType, customConfig), 
    [gridType, customConfig]
  );
  
  // Performance monitoring
  const { trackPerformance, getMetrics } = useGridPerformance(gridName);
  
  // Data caching
  const { getCachedData, setCachedData, clearCache } = useGridCache(gridName);
  
  // Grid state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: config.performance.DEFAULT_PAGE_SIZE
  });
  
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [selectionModel, setSelectionModel] = useState([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
  
  // Enhanced columns with production defaults
  const enhancedColumns = useMemo(() => {
    return columns.map(column => ({
      ...config.columnDefaults.textColumn,
      ...column,
      // Apply type-specific defaults
      ...(column.type === 'number' && config.columnDefaults.numberColumn),
      ...(column.type === 'date' && config.columnDefaults.dateColumn),
      ...(column.type === 'boolean' && config.columnDefaults.booleanColumn),
      ...(column.field === 'actions' && config.columnDefaults.actionColumn),
    }));
  }, [columns, config.columnDefaults]);
  
  // Performance tracking
  useEffect(() => {
    trackPerformance('render', data.length);
  }, [data, trackPerformance]);
  
  // Event handlers with performance tracking
  const handleSortModelChange = useCallback((newSortModel) => {
    trackPerformance('sort');
    setSortModel(newSortModel);
    onSortChange?.(newSortModel);
  }, [onSortChange, trackPerformance]);
  
  const handleFilterModelChange = useCallback((newFilterModel) => {
    trackPerformance('filter');
    setFilterModel(newFilterModel);
    onFilterChange?.(newFilterModel);
  }, [onFilterChange, trackPerformance]);
  
  const handlePaginationModelChange = useCallback((newPaginationModel) => {
    trackPerformance('pagination');
    setPaginationModel(newPaginationModel);
    onPageChange?.(newPaginationModel.page);
    onPageSizeChange?.(newPaginationModel.pageSize);
  }, [onPageChange, onPageSizeChange, trackPerformance]);
  
  const handleSelectionModelChange = useCallback((newSelectionModel) => {
    setSelectionModel(newSelectionModel);
    onSelectionChange?.(newSelectionModel);
  }, [onSelectionChange]);
  
  const handleRowClick = useCallback((params, event) => {
    trackPerformance('rowClick');
    onRowClick?.(params, event);
  }, [onRowClick, trackPerformance]);
  
  const handleRowDoubleClick = useCallback((params, event) => {
    trackPerformance('rowDoubleClick');
    onRowDoubleClick?.(params, event);
  }, [onRowDoubleClick, trackPerformance]);
  
  // Refresh handler with cache clearing
  const handleRefresh = useCallback(() => {
    clearCache();
    trackPerformance('refresh');
    onRefresh?.();
  }, [clearCache, onRefresh, trackPerformance]);
  
  // Grid theme with production styling
  const gridTheme = useMemo(() => ({
    palette: theme.palette,
    elevation: theme.shadows[1],
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.paper,
    headerBackgroundColor: alpha(theme.palette.primary.main, 0.05),
    rowHoverColor: alpha(theme.palette.primary.main, 0.04),
    selectedRowColor: alpha(theme.palette.primary.main, 0.08),
  }), [theme]);
  
  // Responsive column visibility
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newVisibility = {};
      
      if (width <= config.responsive.mobile.maxWidth) {
        config.responsive.mobile.hideColumns.forEach(col => {
          newVisibility[col] = false;
        });
      } else if (width <= config.responsive.tablet.maxWidth) {
        config.responsive.tablet.hideColumns.forEach(col => {
          newVisibility[col] = false;
        });
      }
      
      setColumnVisibilityModel(newVisibility);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config.responsive]);
  
  return (
    <Paper
      elevation={1}
      className={className}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        
        // Production styling
        background: gridTheme.backgroundColor,
        border: `1px solid ${gridTheme.borderColor}`,
        borderRadius: 2,
        
        // Responsive design
        '@media (max-width: 768px)': {
          borderRadius: 1,
          margin: '4px 0',
        },
        
        ...sx
      }}
    >
      {/*  
      {enableToolbar && (
        <UnifiedGridToolbar
          gridName={gridName}
          selectedRows={selectionModel}
          totalRows={totalCount}
          loading={loading}
          config={config.toolbar}
          
          // Event handlers
          onRefresh={handleRefresh}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onExport={onExport}
          onImport={onImport}
          
          // Performance metrics
          metrics={getMetrics()}
        />
      )}
      
      {/* Main Grid Container */}
      <Box
        className="grid-container"
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <DataGrid
          // Data
          rows={data}
          columns={enhancedColumns}
          loading={loading}
          rowCount={totalCount}
          
          // Configuration
          {...config.features}
          
          // Pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={config.performance.PAGE_SIZE_OPTIONS}
          
          // Sorting
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          
          // Filtering
          filterMode="server"
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          
          // Selection
          checkboxSelection={enableSelection}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={handleSelectionModelChange}
          isRowSelectable={isRowSelectable}
          
          // Column management
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          
          // Event handlers
          onRowClick={handleRowClick}
          onRowDoubleClick={handleRowDoubleClick}
          
          // Row configuration
          getRowId={getRowId}
          getRowClassName={getRowClassName}
          
          // Performance optimizations
          disableRowSelectionOnClick={true}
          disableColumnMenu={false}
          disableColumnFilter={false}
          disableColumnSelector={false}
          disableDensitySelector={false}
          
          // Styling
          sx={{
            height: '100%',
            flex: 1,
            border: 'none',
            
            // Header styling
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: gridTheme.headerBackgroundColor,
              borderBottom: `2px solid ${gridTheme.borderColor}`,
              fontSize: config.theme.fontSize,
              fontWeight: 600,
            },
            
            // Row styling
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: gridTheme.rowHoverColor,
              },
              '&.Mui-selected': {
                backgroundColor: gridTheme.selectedRowColor,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
              },
            },
            
            // Cell styling
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${alpha(gridTheme.borderColor, 0.5)}`,
              fontSize: config.theme.fontSize,
              padding: `0 ${config.theme.cellPadding}px`,
            },
            
            // Scrollbar styling
            '& .MuiDataGrid-virtualScroller': {
              '&::-webkit-scrollbar': {
                width: 8,
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: alpha(theme.palette.grey[300], 0.3),
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.grey[500], 0.5),
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.grey[500], 0.7),
                },
              },
            },
            
            // Footer styling
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${gridTheme.borderColor}`,
              backgroundColor: alpha(theme.palette.background.default, 0.5),
            },
          }}
          
          {...otherProps}
        />
      </Box>
      
      {/* Stats Cards */}
      {enableStats && statsCards.length > 0 && (
        <Box
          className="stats-container"
          sx={{
            flexShrink: 0,
            borderTop: `1px solid ${gridTheme.borderColor}`,
            p: 2,
            backgroundColor: alpha(theme.palette.background.default, 0.3),
          }}
        >
          <StatsCards cards={statsCards} />
        </Box>
      )}
    </Paper>
  );
};

export default ProductionGrid;
