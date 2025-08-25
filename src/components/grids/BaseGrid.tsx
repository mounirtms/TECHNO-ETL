/**
 * BaseGrid - Professional Unified Grid System
 * Consolidates all grid functionality into a single, optimized component
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import React, { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Fade,
  Skeleton,
  Alert,
  Typography,
  useTheme
} from '@mui/material';
import { toast } from 'react-toastify';

// Components
import GridToolbar from './components/GridToolbar';
import GridStatsCards from './components/GridStatsCards';
import GridErrorBoundary from '../common/GridErrorBoundary';
import ComponentErrorBoundary from '../common/ComponentErrorBoundary';

// Hooks
import { useCustomTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useStandardErrorHandling } from '../../hooks/useStandardErrorHandling';

// Utils
import { getStandardGridProps, getStandardToolbarConfig } from '../../config/standardGridConfig';

/**
 * BaseGrid - The ultimate grid component
 * Features:
 * - Professional error handling with boundaries
 * - Optimized performance with memoization
 * - Comprehensive toolbar system
 * - Stats cards with proper positioning
 * - Responsive design with proper height calculation
 * - RTL support and internationalization
 * - Accessibility features
 */
const BaseGrid = forwardRef(({
  // Core props
  gridName: any,
  columns: any,
  data: any,
  loading: any,
  error: any,
  // Grid configuration
  getRowId: any,
  checkboxSelection: any,
  disableRowSelectionOnClick: any,
  // Pagination
  paginationMode: any,
  pageSize: any,
  pageSizeOptions = [10, 25, 50, 100],
  
  // Toolbar configuration
  toolbarConfig: any,
  customActions: any,
  contextMenuActions: any,
  // Stats cards
  showStatsCards: any,
  statsCards: any,
  statsPosition = 'bottom', // 'top' | 'bottom'
  
  // Event handlers
  onRefresh,
  onRowClick,
  onRowDoubleClick,
  onSelectionModelChange,
  onError,
  
  // Filtering and sorting
  filterModel,
  onFilterModelChange,
  sortModel,
  onSortModelChange,
  
  // Performance
  enableVirtualization: any,
  virtualizationThreshold = 1000, // Added from OptimizedDataGrid
  rowBuffer: any,
  columnBuffer: any,
  // Styling
  height: any,
  minHeight: any,
  maxHeight: any,
  // Additional props
  ...otherProps
}, ref) => {
  const theme = useTheme();
  const { mode, density, animations } = useCustomTheme();
  const { translate, currentLanguage } = useLanguage();
  
  // Error handling
  const { 
    error: gridError, 
    executeWithErrorHandling, 
    clearError 
  } = useStandardErrorHandling(`${gridName}Grid`, {
    fallbackDataType: 'list',
    showToast: true
  });

  // State management
  const [paginationModel, setPaginationModel] = useState({ 
    page: 0, 
    pageSize 
  });
  const [selectionModel, setSelectionModel] = useState([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
  
  // Refs
  const gridRef = useRef(null);
  const containerRef = useRef(null);
  
  // Expose grid methods via ref
  useImperativeHandle(ref, () => ({
    getSelectedRows: () => selectionModel,
    clearSelection: () => setSelectionModel([]),
    refresh: () => onRefresh?.(),
    exportData: () => gridRef.current?.exportDataAsCsv(),
    getGridApi: () => gridRef.current
  }), [selectionModel, onRefresh]);

  // Calculate grid height based on container and stats cards
  const calculateGridHeight = useCallback(() => {
    if (height !== 'auto') return height;
    // Use window.innerHeight for a more reliable viewport height
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const statsHeight = showStatsCards ? 120 : 0;
    const toolbarHeight = 64;
    const filterPanelHeight = otherProps?.filterPanelHeight || 56; // Allow override from parent
    const paddingHeight = 32;
    // Subtract all UI elements from viewport
    const calculatedHeight = viewportHeight - statsHeight - toolbarHeight - filterPanelHeight - paddingHeight - 64; // 64 for header/footer if any
    // Always enforce min/max
    return Math.max(
      parseInt(minHeight.replace('px', '')),
      Math.min(calculatedHeight, parseInt(maxHeight.replace(/calc\(100vh - (\d+)px\)/, '$1')))
    );
  }, [height, minHeight, maxHeight, showStatsCards, otherProps?.filterPanelHeight]);

  // Memoized data processing
  const processedData = useMemo(() => {
    if (!Array.isArray(data)) {
      console.warn(`${gridName}: Data is not an array, using empty array`);
      return [];
    }
    
    return data.map((row: any: any, index: any: any) => ({ ...row,
      _gridIndex: index,
      _gridId: getRowId(row) || `row-${index}`
    }));
  }, [data, getRowId, gridName]);

  // Memoized columns processing
  const processedColumns = useMemo(() => {
    return columns.map((col: any: any) => ({ ...col,
      headerName: translate(col.headerName) || col.headerName,
      sortable: col.sortable !== false,
      filterable: col.filterable !== false,
      resizable: col.resizable !== false
    }));
  }, [columns, translate]);

  // Enhanced columns with performance optimizations (from OptimizedDataGrid)
  const enhancedColumns = useMemo(() => {
    return columns.map((column: any: any) => ({ ...column,
      width: column.width || 150,
      sortable: column.sortable !== false,
      filterable: column.filterable !== false,
      renderCell: column.renderCell ? (params) => {
        try {
          return column.renderCell(params);
        } catch(error: any) {
          console.error(`Error rendering cell for column ${column.field}:`, error);
          return <span>Error</span>;
        }
      } : undefined
    }));
  }, [columns]);

  // Toolbar configuration
  const finalToolbarConfig = useMemo(() => {
    return toolbarConfig || getStandardToolbarConfig(gridName);
  }, [toolbarConfig, gridName]);

  // Event handlers with error handling
  const handleRefresh = useCallback(async () => {
    if(onRefresh) {
      await executeWithErrorHandling(onRefresh, {
        operation: 'refresh',
        gridName
      });
    }
  }, [onRefresh, executeWithErrorHandling, gridName]);

  const handleSelectionChange = useCallback((newSelection) => {
    setSelectionModel(newSelection);
    onSelectionModelChange?.(newSelection);
  }, [onSelectionModelChange]);

  const handleError = useCallback((error) => {
    console.error(`${gridName} Error:`, error);
    onError?.(error);
    toast?.error(`Grid error: ${error.message}`);
  }, [gridName, onError]);

  // Grid height calculation
  const gridHeight = useMemo(() => calculateGridHeight(), [calculateGridHeight]);

  // Error state
  if(error || gridError) {
    return (
      <Alert 
        severity: any,
          <button onClick={clearError}>
            Retry
          </button>
        }
      >
        {error?.message || gridError?.message || 'An error occurred in the grid'}
      </Alert>
    );
  }

  return Boolean(Boolean((
    <ComponentErrorBoundary 
      componentName={`${gridName}Grid`}
      fallbackMessage={`Unable to load ${gridName.toLowerCase()} grid`}
    >
      <Box
        ref={containerRef}
        sx: any,
          minHeight: minHeight,
          maxHeight: maxHeight,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 1
        }}
      >
        {/* Stats Cards - Top Position */}
        {showStatsCards && statsPosition === 'top' && (
          <GridStatsCards 
            cards={statsCards}
            loading={loading}
            gridName={gridName}
          />
        )}

        {/* Toolbar */}
        <GridToolbar
          gridName={gridName}
          config={finalToolbarConfig}
          customActions={customActions}
          contextMenuActions={contextMenuActions}
          selectedRows={selectionModel}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* Main Grid Container */}
        <Paper
          elevation={1}
          sx: any,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: density === 'compact' ? 1 : 2
          }}
        >
          {loading && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
              <Skeleton variant="rectangular" height={4} />
            </Box>
          )}

          <GridErrorBoundary
            gridName={gridName}
            onError={handleError}
            fallbackComponent: any,
            }
          >
            <DataGrid
              ref={gridRef}
              rows={processedData}
              columns={enhancedColumns}
              loading={loading}
              
              // Pagination
              paginationMode={paginationMode}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={pageSizeOptions}
              
              // Selection
              checkboxSelection={checkboxSelection}
              disableRowSelectionOnClick={disableRowSelectionOnClick}
              rowSelectionModel={selectionModel}
              onRowSelectionModelChange={handleSelectionChange}
              
              // Events
              onRowClick={onRowClick}
              onRowDoubleClick={onRowDoubleClick}
              
              // Filtering and sorting
              filterModel={filterModel}
              onFilterModelChange={onFilterModelChange}
              sortModel={sortModel}
              onSortModelChange={onSortModelChange}
              
              // Column management
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={setColumnVisibilityModel}
              
              // Performance
              disableVirtualization={!enableVirtualization}
              rowBuffer={rowBuffer}
              columnBuffer={columnBuffer}
              
              // Styling
              sx: any,
                '& .MuiDataGrid-root': {
                  border: 'none'
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: theme.palette.background.paper,
                  borderBottom: `2px solid ${theme.palette.divider}`
                }
              }}
              
              // Row ID
              getRowId={(row) => row._gridId}
              
              // Additional props
              { ...otherProps}
            />
          </GridErrorBoundary>
        </Paper>

        {/* Stats Cards - Bottom Position */}
        {showStatsCards && statsPosition === 'bottom' && (
          <GridStatsCards 
            cards={statsCards}
            loading={loading}
            gridName={gridName}
          />
        )}
      </Box>
    </ComponentErrorBoundary>
  )));
});

BaseGrid.displayName = 'BaseGrid';

export default BaseGrid;
