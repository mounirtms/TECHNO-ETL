/**
 * Optimized Data Grid Component
 * High-performance grid with virtual scrolling, filtering, and memory optimization
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
  GridRowModes,
  GridRowModesModel,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ViewColumn as ViewColumnIcon
} from '@mui/icons-material';

import { useGridPerformance } from '../../hooks/useGridPerformance';

const OptimizedDataGrid = ({
  // Data props
  data = [],
  columns = [],
  loading = false,
  error = null,
  
  // Grid configuration
  gridName = 'OptimizedGrid',
  height = 600,
  enableVirtualization = true,
  virtualizationThreshold = 1000,
  
  // Features
  enableFiltering = true,
  enableSorting = true,
  enableSelection = true,
  enableEditing = false,
  enableToolbar = true,
  enablePagination = true,
  
  // Pagination
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  paginationMode = 'client', // 'client' | 'server'
  
  // Event handlers
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  onRowEdit,
  onRowDelete,
  onRefresh,
  
  // Performance options
  rowBuffer = 10,
  columnBuffer = 2,
  
  // Styling
  sx = {},
  ...otherProps
}) => {
  const theme = useTheme();
  const gridRef = useRef(null);
  
  // Performance monitoring
  const {
    visibleData,
    performanceMetrics,
    handleScroll,
    clearCache
  } = useGridPerformance({
    data,
    pageSize,
    virtualizeThreshold: virtualizationThreshold,
    enableVirtualization: enableVirtualization && data.length > virtualizationThreshold
  });

  // Grid state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: pageSize
  });
  
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [selectionModel, setSelectionModel] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

  // Memoized data processing
  const processedData = useMemo(() => {
    if (!Array.isArray(data)) {
      console.warn('OptimizedDataGrid: data is not an array');
      return [];
    }

    // Add row IDs if missing
    return data.map((row, index) => ({
      ...row,
      id: row.id || row.entity_id || `row-${index}`
    }));
  }, [data]);

  // Enhanced columns with performance optimizations
  const enhancedColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      // Add default width if not specified
      width: column.width || 150,
      // Enable sorting by default
      sortable: column.sortable !== false,
      // Enable filtering by default
      filterable: column.filterable !== false,
      // Optimize rendering for large datasets
      renderCell: column.renderCell ? (params) => {
        try {
          return column.renderCell(params);
        } catch (error) {
          console.error(`Error rendering cell for column ${column.field}:`, error);
          return <span>Error</span>;
        }
      } : undefined
    }));
  }, [columns]);

  // Handle pagination changes
  const handlePaginationModelChange = useCallback((newModel) => {
    setPaginationModel(newModel);
  }, []);

  // Handle sort changes
  const handleSortModelChange = useCallback((newModel) => {
    setSortModel(newModel);
  }, []);

  // Handle filter changes
  const handleFilterModelChange = useCallback((newModel) => {
    setFilterModel(newModel);
  }, []);

  // Handle selection changes
  const handleSelectionModelChange = useCallback((newSelection) => {
    setSelectionModel(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  }, [onSelectionChange]);

  // Handle row editing
  const handleRowEditStop = useCallback((params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  }, []);

  const handleEditClick = useCallback((id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  }, [rowModesModel]);

  const handleSaveClick = useCallback((id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  }, [rowModesModel]);

  const handleDeleteClick = useCallback((id) => () => {
    if (onRowDelete) {
      onRowDelete(id);
    }
  }, [onRowDelete]);

  const handleCancelClick = useCallback((id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  }, [rowModesModel]);

  // Process row update
  const processRowUpdate = useCallback((newRow) => {
    if (onRowEdit) {
      return onRowEdit(newRow);
    }
    return newRow;
  }, [onRowEdit]);

  // Add action columns for editing
  const columnsWithActions = useMemo(() => {
    if (!enableEditing) return enhancedColumns;

    return [
      ...enhancedColumns,
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 100,
        cellClassName: 'actions',
        getActions: ({ id }) => {
          const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

          if (isInEditMode) {
            return [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                sx={{ color: 'primary.main' }}
                onClick={handleSaveClick(id)}
              />,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />,
            ];
          }

          return [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={handleDeleteClick(id)}
              color="inherit"
            />,
          ];
        },
      },
    ];
  }, [enhancedColumns, enableEditing, rowModesModel, handleSaveClick, handleCancelClick, handleEditClick, handleDeleteClick]);

  // Performance metrics display
  const renderPerformanceInfo = () => {
    if (!performanceMetrics) return null;

    return (
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="caption" color="text.secondary">
          Performance: {performanceMetrics.renderTime}ms | 
          Rows: {processedData.length} | 
          Visible: {visibleData.length} |
          Memory: {(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
        </Typography>
      </Box>
    );
  };

  // Custom toolbar
  const CustomToolbar = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6">{gridName}</Typography>
        <Chip 
          label={`${processedData.length} rows`} 
          size="small" 
          variant="outlined" 
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Refresh Data">
          <IconButton onClick={onRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear Cache">
          <IconButton onClick={clearCache} size="small">
            <FilterIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        height, 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        ...sx 
      }}
    >
      {/* Custom Toolbar */}
      {enableToolbar && <CustomToolbar />}
      
      {/* Performance Info */}
      {process.env.NODE_ENV === 'development' && renderPerformanceInfo()}
      
      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ m: 1 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading Progress */}
      {loading && <LinearProgress />}
      
      {/* Data Grid */}
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          ref={gridRef}
          rows={processedData}
          columns={columnsWithActions}
          loading={loading}
          
          // Performance optimizations
          disableVirtualization={!enableVirtualization || processedData.length < virtualizationThreshold}
          rowBuffer={rowBuffer}
          columnBuffer={columnBuffer}
          
          // Pagination
          pagination={enablePagination}
          paginationMode={paginationMode}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={pageSizeOptions}
          
          // Sorting
          sortingMode={paginationMode === 'server' ? 'server' : 'client'}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          
          // Filtering
          filterMode={paginationMode === 'server' ? 'server' : 'client'}
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          
          // Selection
          checkboxSelection={enableSelection}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={handleSelectionModelChange}
          
          // Editing
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={setRowModesModel}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          
          // Column management
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          
          // Event handlers
          onRowClick={onRowClick}
          onRowDoubleClick={onRowDoubleClick}
          onScroll={handleScroll}
          
          // Styling
          sx={{
            border: 0,
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '& .actions': {
              color: 'text.secondary',
            },
            '& .actions:hover': {
              color: 'text.primary',
            },
          }}
          
          // Additional props
          {...otherProps}
        />
      </Box>
    </Paper>
  );
};

export default OptimizedDataGrid;
