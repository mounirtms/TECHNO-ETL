/**
 * BaseGrid - Modern React 18 Base Grid Component
 * 
 * Features:
 * - React 18 Suspense integration
 * - Error Boundaries for robust error handling
 * - useId for unique identifiers
 * - useDeferredValue for search optimization
 * - useTransition for non-blocking updates
 * - Modern state management patterns
 * - Built-in CRUD operations
 * - Comprehensive memoization
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React, { 
  useState, 
  useCallback, 
  useMemo, 
  useEffect, 
  useId,
  useDeferredValue,
  useTransition,
  Suspense,
  memo,
  forwardRef,
  useImperativeHandle
} from 'react';
import { 
  Box, 
  Paper, 
  Skeleton, 
  Alert,
  Fade,
  CircularProgress,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';

// Error Boundary for component-level error handling
import { ErrorBoundary } from 'react-error-boundary';

// Modern hooks and utilities
import { useOptimizedGridTheme } from '../../hooks/useOptimizedTheme';
import { useSettings } from '../../contexts/SettingsContext';
import { useGridState } from '../../hooks/useGridState';
import { useGridCache } from '../../hooks/useGridCache';
import { useGridActions } from '../../hooks/useGridActions';

// Base components
import BaseToolbar from './BaseToolbar';
import BaseDialog from './BaseDialog';
import BaseCard from './BaseCard';

// Utilities
import { enhanceColumns, applySavedColumnSettings } from '../../utils/gridUtils';

/**
 * Error Fallback Component for Error Boundary
 */
const GridErrorFallback = memo(({ error, resetErrorBoundary }) => (
  <Alert 
    severity="error" 
    sx={{ m: 2 }}
    action={
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Typography variant="body2" color="error">
          {error.message}
        </Typography>
      </Box>
    }
  >
    <Typography variant="h6">Grid Error</Typography>
    <Typography variant="body2">
      Something went wrong while loading the grid. Please try refreshing.
    </Typography>
  </Alert>
));

/**
 * Loading Skeleton Component
 */
const GridLoadingSkeleton = memo(() => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={300} />
  </Box>
));

/**
 * BaseGrid Component with React 18 Features
 */
const BaseGrid = memo(forwardRef(({
  // Core props
  gridName,
  columns = [],
  data = [],
  loading = false,
  error = null,
  
  // API props
  apiService,
  apiEndpoint,
  apiParams = {},
  
  // Feature toggles
  enableSuspense = true,
  enableErrorBoundary = true,
  enableVirtualization = true,
  enableSelection = true,
  enableSorting = true,
  enableFiltering = true,
  enableSearch = true,
  enableStats = true,
  enableActions = true,
  
  // Toolbar configuration
  toolbarConfig = {},
  customActions = [],
  
  // Dialog configuration
  dialogConfig = {},
  
  // Stats configuration
  statsConfig = {},
  
  // Event handlers
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onSearch,
  onSelectionChange,
  onError,
  
  // Advanced props
  searchFields = ['name', 'sku', 'code'],
  getRowId = (row) => row.id || row.entity_id,
  sx = {},
  
  // Children for custom content
  children,
  
  ...props
}, ref) => {
  // Generate unique IDs for accessibility
  const gridId = useId();
  const searchId = useId();
  const toolbarId = useId();
  
  // React 18 transitions for non-blocking updates
  const [isPending, startTransition] = useTransition();
  
  // Local state with modern patterns
  const [localData, setLocalData] = useState(data);
  const [localLoading, setLocalLoading] = useState(loading);
  const [localError, setLocalError] = useState(error);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [dialogState, setDialogState] = useState({
    add: false,
    edit: false,
    delete: false,
    selectedRecord: null
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    selected: 0
  });
  
  // Deferred value for search optimization
  const deferredSearchQuery = useDeferredValue(searchQuery);
  
  // Optimized theme and settings
  const gridTheme = useOptimizedGridTheme();
  const { settings } = useSettings();
  
  // Grid state management
  const {
    paginationModel,
    setPaginationModel,
    sortModel,
    setSortModel,
    filterModel,
    setFilterModel,
    columnVisibility,
    setColumnVisibility,
    density,
    setDensity
  } = useGridState(gridName);
  
  // Cache management
  const {
    getCacheData,
    setCacheData,
    clearCache
  } = useGridCache(gridName);
  
  // Grid actions
  const {
    handleBulkAction,
    handleExport,
    handleImport
  } = useGridActions(gridName);
  
  // Enhanced columns with memoization
  const enhancedColumns = useMemo(() => {
    return enhanceColumns(columns, {
      enableSorting,
      enableFiltering,
      gridTheme,
      settings
    });
  }, [columns, enableSorting, enableFiltering, gridTheme, settings]);
  
  // Filtered data with deferred search
  const filteredData = useMemo(() => {
    if (!deferredSearchQuery) return localData;
    
    const query = deferredSearchQuery.toLowerCase();
    return localData.filter(row => 
      searchFields.some(field => 
        String(row[field] || '').toLowerCase().includes(query)
      )
    );
  }, [localData, deferredSearchQuery, searchFields]);
  
  // Stats calculation
  const calculatedStats = useMemo(() => {
    const total = filteredData.length;
    const active = filteredData.filter(row => row.status === 'active' || row.is_active).length;
    const inactive = total - active;
    const selected = selectedRows.length;
    
    return { total, active, inactive, selected };
  }, [filteredData, selectedRows]);
  
  // Data fetching with error handling
  const fetchData = useCallback(async () => {
    if (!apiService || !apiEndpoint) return;
    
    setLocalLoading(true);
    setLocalError(null);
    
    try {
      // Check cache first
      const cachedData = getCacheData();
      if (cachedData && !onRefresh) {
        setLocalData(cachedData);
        setLocalLoading(false);
        return;
      }
      
      const response = await apiService.get(apiEndpoint, { params: apiParams });
      const responseData = response.data?.items || response.data || response;
      
      startTransition(() => {
        setLocalData(responseData);
        setCacheData(responseData);
        setStats(calculatedStats);
      });
      
    } catch (error) {
      console.error(`Error fetching ${gridName} data:`, error);
      setLocalError(error);
      onError?.(error);
      toast.error(`Failed to load ${gridName} data`);
    } finally {
      setLocalLoading(false);
    }
  }, [apiService, apiEndpoint, apiParams, gridName, getCacheData, setCacheData, onError, onRefresh, calculatedStats]);
  
  // Modern event handlers with transitions
  const handleRefresh = useCallback(() => {
    startTransition(() => {
      clearCache();
      fetchData();
    });
    onRefresh?.();
  }, [clearCache, fetchData, onRefresh]);
  
  const handleSearchChange = useCallback((query) => {
    startTransition(() => {
      setSearchQuery(query);
    });
    onSearch?.(query);
  }, [onSearch]);
  
  const handleSelectionChange = useCallback((newSelection) => {
    startTransition(() => {
      setSelectedRows(newSelection);
    });
    onSelectionChange?.(newSelection);
  }, [onSelectionChange]);
  
  const handleAdd = useCallback(() => {
    setDialogState(prev => ({ ...prev, add: true, selectedRecord: null }));
    onAdd?.();
  }, [onAdd]);
  
  const handleEdit = useCallback((record) => {
    setDialogState(prev => ({ ...prev, edit: true, selectedRecord: record }));
    onEdit?.(record);
  }, [onEdit]);
  
  const handleDelete = useCallback((records) => {
    setDialogState(prev => ({ ...prev, delete: true, selectedRecord: records }));
    onDelete?.(records);
  }, [onDelete]);
  
  const handleDialogClose = useCallback((dialogType) => {
    setDialogState(prev => ({ ...prev, [dialogType]: false, selectedRecord: null }));
  }, []);
  
  // Imperative API for ref
  useImperativeHandle(ref, () => ({
    refresh: handleRefresh,
    clearCache,
    exportData: () => handleExport(filteredData),
    getSelectedRows: () => selectedRows,
    getStats: () => calculatedStats
  }), [handleRefresh, clearCache, handleExport, filteredData, selectedRows, calculatedStats]);
  
  // Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    setStats(calculatedStats);
  }, [calculatedStats]);
  
  // Error boundary error handler
  const handleError = useCallback((error, errorInfo) => {
    console.error('BaseGrid Error:', error, errorInfo);
    onError?.(error);
  }, [onError]);
  
  // Main grid content
  const GridContent = memo(() => (
    <Box 
      sx={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        opacity: isPending ? 0.7 : 1,
        transition: 'opacity 0.2s ease',
        ...sx 
      }}
      id={gridId}
      role="grid"
      aria-labelledby={toolbarId}
    >
      {/* Stats Cards */}
      {enableStats && (
        <Box sx={{ mb: 2 }}>
          <BaseCard
            stats={stats}
            config={statsConfig}
            loading={localLoading}
          />
        </Box>
      )}
      
      {/* Toolbar */}
      {enableActions && (
        <Box sx={{ mb: 1 }}>
          <BaseToolbar
            id={toolbarId}
            searchId={searchId}
            config={toolbarConfig}
            customActions={customActions}
            selectedCount={selectedRows.length}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onRefresh={handleRefresh}
            onAdd={handleAdd}
            onEdit={() => handleEdit(selectedRows[0])}
            onDelete={() => handleDelete(selectedRows)}
            loading={localLoading}
            enableSearch={enableSearch}
          />
        </Box>
      )}
      
      {/* Error Display */}
      {localError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {localError.message || 'An error occurred while loading data'}
        </Alert>
      )}
      
      {/* Data Grid */}
      <Paper 
        elevation={1} 
        sx={{ 
          flexGrow: 1, 
          height: 'auto',
          '& .MuiDataGrid-root': {
            border: 'none'
          }
        }}
      >
        <DataGrid
          {...props}
          rows={filteredData}
          columns={enhancedColumns}
          loading={localLoading}
          getRowId={getRowId}
          
          // Selection
          checkboxSelection={enableSelection}
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionChange}
          
          // Pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          
          // Sorting and filtering
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          
          // Column management
          columnVisibilityModel={columnVisibility}
          onColumnVisibilityModelChange={setColumnVisibility}
          density={density}
          
          // Performance
          virtualization={enableVirtualization}
          disableRowSelectionOnClick={!enableSelection}
          
          // Accessibility
          aria-labelledby={toolbarId}
          aria-describedby={searchId}
          
          // Styling
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'solid #2196f3 1px'
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: gridTheme.palette.action.hover
            }
          }}
        />
      </Paper>
      
      {/* Dialogs */}
      <BaseDialog
        type="add"
        open={dialogState.add}
        onClose={() => handleDialogClose('add')}
        config={dialogConfig}
        data={dialogState.selectedRecord}
      />
      
      <BaseDialog
        type="edit"
        open={dialogState.edit}
        onClose={() => handleDialogClose('edit')}
        config={dialogConfig}
        data={dialogState.selectedRecord}
      />
      
      <BaseDialog
        type="delete"
        open={dialogState.delete}
        onClose={() => handleDialogClose('delete')}
        config={dialogConfig}
        data={dialogState.selectedRecord}
      />
      
      {/* Custom content */}
      {children}
    </Box>
  ));
  
  // Render with optional Suspense and Error Boundary
  const content = enableSuspense ? (
    <Suspense fallback={<GridLoadingSkeleton />}>
      <GridContent />
    </Suspense>
  ) : (
    <GridContent />
  );
  
  return enableErrorBoundary ? (
    <ErrorBoundary
      FallbackComponent={GridErrorFallback}
      onError={handleError}
      resetKeys={[gridName, data]}
    >
      {content}
    </ErrorBoundary>
  ) : (
    content
  );
}));

BaseGrid.displayName = 'BaseGrid';

export default BaseGrid;