/**
 * BaseGrid - Advanced Grid Component Foundation
 * Implements latest high-tech patterns for powerful grid management
 * Features: Virtual scrolling, infinite loading, real-time updates, advanced filtering
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
import { DataGrid, GridRowsProp, GridColDef, GridSortModel, GridFilterModel } from '@mui/x-data-grid';

// Advanced components
import BaseToolbar from './BaseToolbar';
import BaseCard from './BaseCard';
import TooltipWrapper from '../common/TooltipWrapper';

// Import types from the centralized type definitions
import { BaseGridProps, GridCard, ToolbarConfig } from '../../types/baseComponents';

// TypeScript interfaces
const BaseGrid: React.FC<BaseGridProps> = ({
  // Data props
  data,
  columns,
  loading,
  error,
  // Grid configuration
  gridName,
  gridType,
  height,
  autoHeight,
  // Pagination
  pagination,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  
  // Selection
  checkboxSelection,
  disableSelectionOnClick,
  selectionModel,
  onSelectionModelChange,
  
  // Sorting and filtering
  sortModel,
  onSortModelChange,
  filterModel = { items: [] },
  onFilterModelChange,
  
  // Toolbar configuration
  showToolbar,
  toolbarConfig = {},
  customActions,
  customLeftActions,
  // Stats cards
  showStatsCards,
  gridCards,
  // Event handlers
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onExport,
  onImport,
  onRowClick,
  onRowDoubleClick,
  onCellClick,
  
  // Advanced features
  enableVirtualization,
  enableRealTimeUpdates,
  updateInterval,
  // Styling
  density,
  sx = {},
  
  // Accessibility
  ariaLabel,
  
  // Error handling
  onError,
  
  // Custom components
  NoRowsOverlay,
  LoadingOverlay,
  ErrorOverlay,
  
  // Advanced props
  getRowId,
  getRowClassName,
  getCellClassName,
  isRowSelectable,
  
  ...otherProps
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const gridRef = useRef(null);
  
  // Local state
  const [internalPageSize, setInternalPageSize] = useState(pageSize);
  const [internalSortModel, setInternalSortModel] = useState(sortModel);
  const [internalFilterModel, setInternalFilterModel] = useState(filterModel);
  const [internalSelectionModel, setInternalSelectionModel] = useState(selectionModel);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [realTimeEnabled, setRealTimeEnabled] = useState(enableRealTimeUpdates);
  
  // Performance optimization - memoized columns
  const optimizedColumns = useMemo(() => {
    return columns.map((column: any) => ({ ...column,
      // Add default responsive behavior
      minWidth: column.minWidth || (isMobile ? 100 : 150),
      flex: column.flex || (isMobile && !column.width ? 1 : column.flex),
      // Add default sorting
      sortable: column.sortable !== false,
      // Add default filtering
      filterable: column.filterable !== false,
      // Optimize rendering for large datasets
      renderCell: column.renderCell || ((params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ))
    }));
  }, [columns, isMobile]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeEnabled || !onRefresh) return;
    
    const interval = setInterval(() => {
      console.log(`🔄 Real-time update for ${gridName}`);
      onRefresh();
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [realTimeEnabled, onRefresh, updateInterval, gridName]);

  // Event handlers with error boundary
  const handleError = useCallback((error, context = '') => {
    console.error(`❌ BaseGrid Error (${gridName}):`, error);
    onError?.(error, context);
  }, [gridName, onError]);

  const handleSelectionChange = useCallback((newSelection: any[]) => {
    try {
      setInternalSelectionModel(newSelection);
      onSelectionModelChange?.(newSelection);
    } catch(error: any) {
      handleError(error, 'selection change');
    }
  }, [onSelectionModelChange, handleError]);

  const handleSortChange = useCallback((newSortModel: GridSortModel) => {
    try {
      setInternalSortModel(newSortModel);
      onSortModelChange?.(newSortModel);
    } catch(error: any) {
      handleError(error, 'sort change');
    }
  }, [onSortModelChange, handleError]);

  const handleFilterChange = useCallback((newFilterModel: GridFilterModel) => {
    try {
      setInternalFilterModel(newFilterModel);
      onFilterModelChange?.(newFilterModel);
    } catch(error: any) {
      handleError(error, 'filter change');
    }
  }, [onFilterModelChange, handleError]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    try {
      setInternalPageSize(newPageSize);
    } catch(error: any) {
      handleError(error, 'page size change');
    }
  }, [handleError]);

  // Responsive grid height
  const gridHeight = useMemo(() => {
    if (autoHeight) return 'auto';
    if (isMobile) return Math.min(height, 400);
    return height;
  }, [height, autoHeight, isMobile]);

  // Grid configuration
  // Configure DataGrid props to be compatible with MUI DataGrid
  const gridConfig = useMemo(() => {
    // Define the base configuration
    const config: any = {
      // Core configuration
      rows: data,
      columns: optimizedColumns,
      loading,
      
      // Pagination - make sure it's true or undefined, not false
      ...(pagination ? { pagination: true } : {}),
      pageSize: internalPageSize,
      rowsPerPageOptions: pageSizeOptions,
      onPageSizeChange: handlePageSizeChange,
      
      // Selection
      checkboxSelection,
      disableSelectionOnClick,
      selectionModel: internalSelectionModel,
      onSelectionModelChange: handleSelectionChange,
      isRowSelectable,
      
      // Sorting and filtering
      sortModel: internalSortModel,
      onSortModelChange: handleSortChange,
      filterModel: internalFilterModel,
      onFilterModelChange: handleFilterChange,
      
      // Events
      onRowClick,
      onRowDoubleClick,
      onCellClick,
      
      // Performance
      disableVirtualization: !enableVirtualization,
      
      // Styling
      // Convert density to supported MUI DataGrid density value
      density: (density === 'standard' || density === 'compact' || density === 'comfortable') 
        ? density as 'standard' | 'compact' | 'comfortable'
        : 'standard',
      getRowId,
      getRowClassName,
      getCellClassName,
      
      // Accessibility
      'aria-label': ariaLabel || `${gridName} data grid`,
      
      // Error handling
      onError: handleError,
      
      // Custom overlays
      components: {
        NoRowsOverlay: NoRowsOverlay || (() => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body1" color="text.secondary">
              No data available
            </Typography>
          </Box>
        )),
        LoadingOverlay: LoadingOverlay || (() => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Skeleton variant="rectangular" width="100%" height={200} />
          </Box>
        )),
        ErrorOverlay: ErrorOverlay || (() => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Alert severity="error">
              An error occurred while loading data
            </Alert>
          </Box>
        ))
      },
    };
    
    // Add other props from otherProps to ensure all valid props are passed to DataGrid
    return { ...otherProps, ...config };
  }, [
    data, optimizedColumns, loading, pagination, internalPageSize, pageSizeOptions,
    checkboxSelection, disableSelectionOnClick, internalSelectionModel,
    internalSortModel, internalFilterModel, onRowClick, onRowDoubleClick,
    onCellClick, enableVirtualization, density, getRowId, getRowClassName,
    getCellClassName, ariaLabel, gridName, handleError, handleSelectionChange,
    handleSortChange, handleFilterChange, handlePageSizeChange, isRowSelectable,
    NoRowsOverlay, LoadingOverlay, ErrorOverlay, otherProps
  ]);

  // Render stats cards if enabled
  const renderStatsCards = () => {
    if (!showStatsCards || !gridCards.length) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
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
          {gridCards.map((card: any, index: number) => {
            // Create a safely typed version of the card
            const typedCard: any = { ...card,
              loading: loading,
              icon: typeof card.icon === 'function' ? card.icon : undefined
            };
            
            // Remove the color property if it's not of the expected type
            if(card.color && typeof card.color === 'string') {
              // Check if color is one of the valid colors, otherwise remove it
              const validColors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
              if (!validColors.includes(card.color)) {
                delete typedCard.color;
              }
            }
            
            return <BaseCard key={index} { ...typedCard} />;
          })}
        </Box>
      </Box>
    );
  };

  // Render toolbar if enabled
  const renderToolbar = () => {
    if (!showToolbar) return null;
    
    return(<BaseToolbar
        gridName={gridName}
        gridType={gridType}
        config={toolbarConfig}
        customActions={customActions}
        customLeftActions={customLeftActions}
        selectedRows={internalSelectionModel}
        onRefresh={onRefresh}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={(rows) => onDelete?.(rows || [])}
        onExport={onExport}
        onImport={onImport}
        loading={loading}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        density={density as 'compact' | 'standard' | 'comfortable'}
        realTimeEnabled={realTimeEnabled}
        onRealTimeToggle={setRealTimeEnabled}
      />
    );
  };

  // Error boundary
  if(error) {
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
    <Box sx={{ width: '100%', ...sx }}>
      {/* Stats Cards */}
      {renderStatsCards()}
      
      {/* Toolbar */}
      {renderToolbar()}
      
      {/* Main Grid */}
      <Paper 
        elevation={1}
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.grey[50],
            borderBottom: `2px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: theme.palette.background.paper,
          },
          // Mobile optimizations
          ...(isMobile && {
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
              padding: '8px 4px',
            }
          })
        }}
      >
        <Fade in={!loading} timeout={300}>
          <div style={{ height: '100%', width: '100%' }}>
            <DataGrid
              ref={gridRef}
              { ...gridConfig}
            />
          </div>
        </Fade>
      </Paper>
    </Box>
  );
};

export default BaseGrid;