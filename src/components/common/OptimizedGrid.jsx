
/**
 * Optimized Grid Component
 * High-performance data grid with virtualization and caching
 */

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { usePerformance, PerformanceUtils } from '../../hooks/usePerformance';

const OptimizedGrid = React.memo(({
  data = [],
  columns = [],
  loading = false,
  pageSize = 25,
  onRowClick,
  onSelectionChange,
  density = 'standard',
  disableVirtualization = false,
  cacheKey,
  ...props
}) => {
  const { trackUserAction, trackError } = usePerformance('OptimizedGrid');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize });

  // Memoized columns with optimizations
  const optimizedColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      // Add default sorting if not specified
      sortable: col.sortable !== false,
      // Optimize string rendering
      renderCell: col.renderCell || ((params) => {
        if (typeof params.value === 'string' && params.value.length > 100) {
          return (
            <div title={params.value}>
              {params.value.substring(0, 100)}...
            </div>
          );
        }

        return params.value;
      }),
    }));
  }, [columns]);

  // Memoized rows with performance optimization
  const optimizedRows = useMemo(() => {
    if (!Array.isArray(data)) {
      trackError(new Error('Data is not an array'));

      return [];
    }

    return data.map((row, index) => ({
      ...row,
      id: row.id || `row-${index}`,
    }));
  }, [data, trackError]);

  // Optimized handlers
  const handleRowClick = useCallback((params, event) => {
    trackUserAction('row_click', { rowId: params.id });
    onRowClick?.(params, event);
  }, [onRowClick, trackUserAction]);

  const handleSelectionChange = useCallback((selection) => {
    trackUserAction('selection_change', { count: selection.length });
    onSelectionChange?.(selection);
  }, [onSelectionChange, trackUserAction]);

  const handlePaginationModelChange = useCallback((model) => {
    trackUserAction('page_change', { page: model.page, pageSize: model.pageSize });
    setPaginationModel(model);
  }, [trackUserAction]);

  // Debounced sorting to improve performance
  const debouncedSortModelChange = useCallback(
    PerformanceUtils.debounce((sortModel) => {
      trackUserAction('sort_change', { sortModel });
    }, 300),
    [trackUserAction],
  );

  // Error boundary for grid
  useEffect(() => {
    const handleError = (error) => {
      trackError(error, { component: 'DataGrid' });
    };

    window.addEventListener('error', handleError);

    return () => window.removeEventListener('error', handleError);
  }, [trackError]);

  // Performance monitoring
  useEffect(() => {
    PerformanceUtils.trackMemoryUsage('OptimizedGrid');
  }, [data.length]);

  const gridProps = {
    rows: optimizedRows,
    columns: optimizedColumns,
    loading,
    density,
    paginationModel,
    onPaginationModelChange: handlePaginationModelChange,
    onRowClick: handleRowClick,
    onRowSelectionModelChange: handleSelectionChange,
    onSortModelChange: debouncedSortModelChange,

    // Performance optimizations
    disableRowSelectionOnClick: true,
    disableColumnMenu: false,
    disableColumnFilter: false,
    disableColumnSelector: false,
    disableDensitySelector: false,
    disableVirtualization,

    // Pagination settings
    pageSizeOptions: [10, 25, 50, 100],

    // Styling optimizations
    sx: {
      // Reduce border rendering overhead
      '& .MuiDataGrid-cell': {
        borderBottom: '1px solid rgba(224, 224, 224, 0.8)',
      },
      // Optimize hover performance
      '& .MuiDataGrid-row:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
      ...props.sx,
    },

    ...props,
  };

  return PerformanceUtils.measureRender('OptimizedGrid', () => (
    <DataGrid
      {...gridProps}
      slotProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 500 },
        },
      }}
    />
  ));
});

OptimizedGrid.displayName = 'OptimizedGrid';

export default OptimizedGrid;
