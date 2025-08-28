import React, { useMemo, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';

// Theme and context
import { useCustomTheme } from '../../../contexts/ThemeContext';

// Unified Systems
import { useMDMGrid } from '../../../hooks/useBaseGrid';
import { useUnifiedToolbar } from '../../common/UnifiedToolbar';
import { useUnifiedFilters } from '../../common/UnifiedFilters';

// Components
import MDMStatsCards from './MDMStatsCards';
import UnifiedGrid from '../../common/UnifiedGrid';
import GridErrorBoundary from '../../common/GridErrorBoundary';

// Utils
import sourceMapping from '../../../utils/sources';

/**
 * Optimized MDM Products Grid Component
 * Uses unified grid system with inheritance for better maintainability
 * Features:
 * - Unified toolbar and filter system
 * - Optimized data fetching with base grid hooks
 * - Consistent UI patterns
 * - Better error handling
 */
const MDMProductsGrid = () => {
  // ===== THEME AND UI =====
  const theme = useTheme();
  const { mode, isDark, colorPreset, density, animations } = useCustomTheme();
  
  // ===== DATA FETCHER =====
  const dataFetcher = useCallback(async (params) => {
    try {
      const apiParams = {
        page: params.page || 0,
        pageSize: params.pageSize || 25,
        sourceCode: params.sourceCode || '',
        succursale: params.succursale || '',
        sortField: params.sortModel?.[0]?.field,
        sortOrder: params.sortModel?.[0]?.sort,
        showChangedOnly: params.showChangedOnly || false,
        search: params.search || ''
      };

      console.log('📡 MDM Grid: Making API call with params:', apiParams);
      const response = await axios.get('/api/mdm/inventory', { params: apiParams });
      
      const processedData = response.data.data || [];
      const totalCount = response.data.totalCount || processedData.length;

      // Calculate statistics
      const stats = {
        total: totalCount,
        inStock: processedData.filter(item => item.QteStock > 0).length,
        outOfStock: processedData.filter(item => item.QteStock === 0).length,
        lowStock: processedData.filter(item => item.QteStock > 0 && item.QteStock < 2).length,
        newChanges: processedData.filter(item => item.changed === 1).length,
        synced: processedData.filter(item => item.changed === 0).length,
        totalValue: processedData.reduce((acc, curr) => acc + ((curr.Tarif || 0) * (curr.QteStock || 0)), 0),
        averagePrice: processedData.length > 0 ? processedData.reduce((acc, curr) => acc + (curr.Tarif || 0), 0) / processedData.length : 0
      };

      return { data: processedData, stats };
    } catch (error) {
      console.error('MDM Grid: API call failed:', error);
      throw error;
    }
  }, []);

  // ===== UNIFIED GRID HOOK =====
  const gridState = useMDMGrid('mdmProducts', dataFetcher, {
    enableSyncStocks: true,
    enableSyncAll: true,
    enableSourceFilter: true,
    enableSuccursaleFilter: true
  });

  // ===== OPTIONS FOR FILTERS =====
  const succursaleOptions = useMemo(() => {
    const uniqueSuccursales = [...new Set(sourceMapping.map(s => s.succursale))];
    return uniqueSuccursales.map(succ => ({
      value: succ.toString(),
      label: `Branch ${succ}`
    }));
  }, []);

  const sourceFilterOptions = useMemo(() => {
    const filteredSources = gridState.succursaleFilter === 'all'
      ? sourceMapping
      : sourceMapping.filter(s => s.succursale.toString() === gridState.succursaleFilter);

    return filteredSources.sort((a, b) =>
      a.code_source.toString().localeCompare(b.code_source.toString())
    ).map(source => ({
      value: source.code_source.toString(),
      label: source.source
    }));
  }, [gridState.succursaleFilter]);

  // ===== UNIFIED TOOLBAR CONFIGURATION =====
  const { renderToolbar } = useUnifiedToolbar('mdm', {
    onRefresh: gridState.onRefresh,
    onSync: gridState.onSyncSelected,
    onSyncStocks: gridState.onSyncStocks,
    onSyncAll: gridState.onSyncAll,
    enableSyncStocks: gridState.sourceFilter !== 'all',
    enableSyncAll: gridState.stats?.newChanges > 0,
    syncBadge: gridState.selectedRows?.length || null,
    syncAllBadge: gridState.stats?.newChanges || null,
    loading: gridState.loading
  });

  // ===== UNIFIED FILTERS =====
  const { renderFilters } = useUnifiedFilters('mdm', {
    sources: sourceFilterOptions,
    succursales: succursaleOptions,
    sourceFilter: gridState.sourceFilter,
    succursaleFilter: gridState.succursaleFilter,
    showChangedOnly: gridState.showChangedOnly,
    onSourceChange: gridState.setSourceFilter,
    onSuccursaleChange: gridState.setSuccursaleFilter,
    onShowChangedOnlyChange: gridState.setShowChangedOnly,
    onFiltersChange: (filters) => {
      // Update multiple filters at once
      Object.entries(filters).forEach(([key, value]) => {
        switch (key) {
          case 'source':
            gridState.setSourceFilter(value);
            break;
          case 'succursale':
            gridState.setSuccursaleFilter(value);
            break;
          case 'showChangedOnly':
            gridState.setShowChangedOnly(value);
            break;
        }
      });
    }
  });

  // ===== COLUMN DEFINITIONS =====
  const columns = useMemo(() => [
    {
      field: 'Code_MDM',
      headerName: 'SKU',
      width: 150,
      type: 'string',
      sortable: true,
      filterable: true,
      renderCell: (params) => params.value || ''
    },
    {
      field: 'Code_JDE',
      headerName: 'JDE Code',
      width: 120,
      type: 'string',
      sortable: true,
      renderCell: (params) => params.value || ''
    },
    {
      field: 'TypeProd',
      headerName: 'Type',
      width: 100,
      type: 'string',
      renderCell: (params) => params.value || ''
    },
    {
      field: 'Source',
      headerName: 'Source',
      width: 100,
      type: 'string'
    },
    {
      field: 'Succursale',
      headerName: 'Branch',
      width: 100,
      type: 'number'
    },
    {
      field: 'QteStock',
      headerName: 'Stock',
      width: 100,
      type: 'number',
      sortable: true,
      renderCell: (params) => {
        const value = Number(params.value) || 0;
        return (
          <Box
            sx={{
              color: value === 0 ? 'error.main' : value < 2 ? 'warning.main' : 'success.main',
              fontWeight: 'bold'
            }}
          >
            {value}
          </Box>
        );
      }
    },
    {
      field: 'Tarif',
      headerName: 'Price',
      width: 120,
      type: 'number',
      sortable: true,
      renderCell: (params) => {
        const value = Number(params.value) || 0;
        return `${value.toFixed(2)} DZD`;
      }
    },
    {
      field: 'DateDernierMaJ',
      headerName: 'Last Update',
      width: 160,
      type: 'string',
      sortable: true,
      valueGetter: (params) => {
        if (!params.value) return '';
        try {
          return new Date(params.value).toLocaleDateString('fr-DZ');
        } catch (error) {
          return params.value?.toString() || '';
        }
      }
    },
    {
      field: 'changed',
      headerName: 'Changed',
      width: 100,
      type: 'boolean',
      sortable: true,
      renderCell: (params) => params.value ? '✓' : ''
    }
  ], []);

  // ===== ROW STYLING =====
  const getRowClassName = useCallback((params) =>
    params.row.changed ? 'row-changed' : '', []);

  // ===== MAIN RENDER =====
  return (
    <GridErrorBoundary>
      {/* Filters Panel */}
      <Box sx={{ flexShrink: 0, mb: 0.5 }}>
        {renderFilters()}
      </Box>

      {/* Toolbar Panel */}
      <Box sx={{ flexShrink: 0, mb: 1 }}>
        {renderToolbar()}
      </Box>

      {/* Main Grid */}
      <UnifiedGrid
        gridName="MDMProductsGrid"
        columns={columns}
        data={gridState.data}
        loading={gridState.loading}
        totalCount={gridState.stats?.total || 0}
        paginationModel={gridState.paginationModel}
        onPaginationModelChange={gridState.onPaginationModelChange}
        sortModel={gridState.sortModel}
        onSortModelChange={gridState.onSortModelChange}
        filterModel={gridState.filterModel}
        onFilterModelChange={gridState.onFilterModelChange}
        onRowDoubleClick={(params) => {
          console.log('Row double-clicked:', params.row);
        }}
        showStatsCards={true}
        gridCards={<MDMStatsCards stats={gridState.stats} />}
        defaultPageSize={25}
        onSelectionChange={gridState.onSelectionChange}
        onSearch={gridState.onSearch}
        searchableFields={['Code_MDM', 'Code_JDE', 'TypeProd', 'Source']}
        getRowId={(row) => `${row.Source}-${row.Code_MDM}`}
        getRowClassName={getRowClassName}
        onError={(error) => toast.error(error.message)}
        enableVirtualization={gridState.data?.length > 100}
      />
    </GridErrorBoundary>
  );
};

export default MDMProductsGrid;

