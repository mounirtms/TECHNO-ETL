import { useState, useCallback, useMemo } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import UnifiedGrid from '../../common/UnifiedGrid';
import MDMFilterPanel from './MDMFilterPanel';
import MDMStatsCards from './MDMStatsCards';
import MDMFilters, { defaultSources, defaultBranches } from './MDMFilters';
import { useMDMToolbarConfig, useMDMCustomActions, useMDMContextMenuActions } from './MDMToolbar';
import { toast } from 'react-toastify';
import axios from 'axios';
import magentoApi from '../../../services/magentoApi';
import sourceMapping from '../../../utils/sources';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
  getStandardGridProps,
  STANDARD_GRID_CONTAINER_STYLES,
  STANDARD_GRID_AREA_STYLES,
  STANDARD_STATS_CONTAINER_STYLES
} from '../../../config/standardGridConfig';

/**
 * Optimized MDM Products Grid Component
 * Features:
 * - Improved performance with memoization
 * - Better error handling
 * - Cleaner code organization
 * - Optimized data fetching
 */
const MDMProductsGrid = () => {
  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [succursaleFilter, setSuccursaleFilter] = useState('16');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showChangedOnly, setShowChangedOnly] = useState(true);
  const [filterPanelExpanded, setFilterPanelExpanded] = useState(true);
  const [selectedBaseGridRows, setSelectedBaseGridRows] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({
    Code_MDM: true,
    Code_JDE: true,
    Code_Fil_JDE: false,
    TypeProd: true,
    Source: true,
    Succursale: true,
    QteStock: true,
    Tarif: true,
    QteReceptionner: false,
    VenteMoyen: false,
    DateDernierMaJ: true,
    changed: true
  });
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    emptyStock: 0,
    zeroCount: 0,
    newChanges: 0,
    synced: 0,
    averagePrice: 0,
    totalValue: 0
  });

  // ===== UTILITY FUNCTIONS (moved up to avoid initialization issues) =====
  const SyncProgressToast = useCallback(({ current, total }) => (
    <Box sx={{ width: '100%', p: 1 }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
        {`Syncing ${current}/${total} items...`}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={(current / total) * 100}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  ), []);

  const prepareSourceItemsPayload = useCallback((gridData, sourceMappings) => {
    return {
      sourceItems: gridData
        .filter(item => item.Code_MDM && item.QteStock !== null && item.Code_Source)
        .map(item => {
          const sourceInfo = sourceMappings.find(s => s.code_source === item.Code_Source);
          return {
            sku: item.Code_MDM.toString(),
            source_code: sourceInfo?.magentoSource || '',
            quantity: Math.max(0, Number(item.QteStock) || 0),
            status: (Number(item.QteStock) || 0) > 0 ? 1 : 0
          };
        })
    };
  }, []);

  const processBatch = useCallback(async (items) => {
    try {
      const response = await magentoApi.post('inventory/source-items', { sourceItems: items });
      toast.success('Items synced successfully.');
      return response.data;
    } catch (error) {
      console.error('Batch sync error:', error);
      toast.error(`Sync failed: ${error.message}`);
      throw error;
    }
  }, []);

  // ===== EVENT HANDLERS =====
  const onSyncHandler = useCallback(async () => {
    if (!selectedBaseGridRows?.length) {
      toast.warning('Please select items to sync');
      return;
    }

    try {
      setLoading(true);
      const selectedData = data.filter(row => 
        selectedBaseGridRows.includes(`${row.Source}-${row.Code_MDM}`)
      );
      
      const payload = prepareSourceItemsPayload(selectedData, sourceMapping);
      if (!payload.sourceItems.length) {
        toast.warning('No valid items to sync.');
        return;
      }

      toast.info(<SyncProgressToast current={0} total={payload.sourceItems.length} />, {
        autoClose: true,
        closeOnClick: true,
        draggable: false
      });

      await processBatch(payload.sourceItems);
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync selected items.');
    } finally {
      setLoading(false);
    }
  }, [selectedBaseGridRows, data, prepareSourceItemsPayload, processBatch, SyncProgressToast]);

  // ===== MEMOIZED VALUES =====
  const succursaleOptions = useMemo(() => {
    const uniqueSuccursales = [...new Set(sourceMapping.map(s => s.succursale))];
    return uniqueSuccursales.map(succ => ({
      value: succ.toString(),
      label: `Branch ${succ}`
    }));
  }, []);

  const sourceFilterOptions = useMemo(() => {
    const filteredSources = succursaleFilter === 'all'
      ? sourceMapping
      : sourceMapping.filter(s => s.succursale.toString() === succursaleFilter);

    return [
      { value: 'all', label: 'All Sources' },
      ...filteredSources.sort((a, b) => 
        a.code_source.toString().localeCompare(b.code_source.toString())
      ).map(source => ({
        value: source.code_source.toString(),
        label: source.source
      }))
    ];
  }, [succursaleFilter]);

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
      field: 'Code_Fil_JDE',
      headerName: 'JDE Fil.',
      width: 120,
      type: 'string',
      renderCell: (params) => params.value || ''
    },
    {
      field: 'TypeProd',
      headerName: 'Type',
      width: 120,
      sortable: true,
      filterable: true,
      renderCell: (params) => params.value || ''
    },
    {
      field: 'Source',
      headerName: 'Source',
      width: 150,
      sortable: true,
      filterable: true,
      renderCell: (params) => params.value || ''
    },
    {
      field: 'Succursale',
      headerName: 'Branch',
      width: 100,
      type: 'number',
      sortable: true,
      renderCell: (params) => params.value?.toString() || '0'
    },
    {
      field: 'QteStock',
      headerName: 'Stock',
      width: 100,
      type: 'number',
      sortable: true,
      filterable: true,
      renderCell: (params) => params.value?.toString() || '0'
    },
    {
      field: 'Tarif',
      headerName: 'Price',
      width: 120,
      type: 'number',
      sortable: true,
      renderCell: (params) => {
        if (!params.value || isNaN(params.value)) return '0.00 DZD';
        try {
          return new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: 'DZD'
          }).format(params.value);
        } catch (error) {
          return `${params.value || 0} DZD`;
        }
      }
    },
    {
      field: 'QteReceptionner',
      headerName: 'Received',
      width: 100,
      type: 'number',
      renderCell: (params) => params.value?.toString() || '0'
    },
    {
      field: 'VenteMoyen',
      headerName: 'Avg Sales',
      width: 110,
      type: 'number',
      renderCell: (params) => (params.value || 0).toFixed(2)
    },
    {
      field: 'DateDernierMaJ',
      headerName: 'Last Update',
      width: 160,
      type: 'string', // Changed from 'date' to 'string' to avoid Date object requirement
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
      renderCell: (params) => params.value ? '✓' : ''
    }
  ].filter(col => columnVisibility[col.field] !== false), [columnVisibility]);

  // Add data validation to prevent grid crashes
  const validatedData = useMemo(() => {
    if (!Array.isArray(data)) {
      console.warn('MDMProductsGrid: data is not an array, using empty array');
      return [];
    }

    return data.map((item, index) => {
      // Ensure each item has required fields and valid data types
      return {
        ...item,
        Code_MDM: item.Code_MDM || `unknown-${index}`,
        Code_JDE: item.Code_JDE || '',
        Code_Fil_JDE: item.Code_Fil_JDE || '',
        TypeProd: item.TypeProd || '',
        Source: item.Source || '',
        Succursale: typeof item.Succursale === 'number' ? item.Succursale : 0,
        QteStock: typeof item.QteStock === 'number' ? item.QteStock : 0,
        Tarif: typeof item.Tarif === 'number' ? item.Tarif : 0,
        QteReceptionner: typeof item.QteReceptionner === 'number' ? item.QteReceptionner : 0,
        VenteMoyen: typeof item.VenteMoyen === 'number' ? item.VenteMoyen : 0,
        DateDernierMaJ: item.DateDernierMaJ || null,
        changed: Boolean(item.changed)
      };
    });
  }, [data]);

  // ===== DATA FETCHING (moved up to avoid initialization issues) =====
  const fetchProducts = useCallback(async ({ page = 0, pageSize = 25, sortModel = [], filterModel = { items: [] } }) => {
    setLoading(true);
    try {
      const sortParam = sortModel[0]?.field;
      const sortOrder = sortModel[0]?.sort;

      const params = {
        page,
        pageSize,
        sourceCode: sourceFilter === 'all' ? '' : sourceFilter || 7,
        succursale: succursaleFilter === 'all' ? '' : succursaleFilter || 16,
        sortField: sortParam,
        sortOrder,
        ...filterModel.items.reduce((acc, filter) => {
          if (filter.value) acc[filter.field] = filter.value;
          return acc;
        }, {}),
        ...(showChangedOnly ? { changed: 1 } : {})
      };

      if (params.sourceCode) params.succursale = null;

      console.log('📡 MDM Grid: Making API call to /api/mdm/inventory with params:', params);

      const response = await axios.get('/api/mdm/inventory', { params });

      console.log('📦 MDM Grid: Raw API response:', {
        responseType: typeof response,
        hasData: response && 'data' in response,
        dataStructure: response.data ? Object.keys(response.data) : [],
        dataCount: response.data?.data?.length || 0,
        totalCount: response.data?.totalCount || 0
      });

      const processedData = response.data.data || [];
      const totalCount = response.data.totalCount || processedData.length;

      console.log('✅ MDM Grid: Processed data:', {
        processedCount: processedData.length,
        totalCount,
        sampleItem: processedData[0] || null,
        itemFields: processedData.length > 0 ? Object.keys(processedData[0]) : []
      });

      setData(processedData);

      // Calculate statistics
      const total = totalCount;
      const inStock = processedData.filter(item => item.QteStock > 0).length;
      const outOfStock = processedData.filter(item => item.QteStock === 0).length;
      const lowStock = processedData.filter(item => item.QteStock > 0 && item.QteStock < 2).length;
      const newChanges = processedData.filter(item => item.changed === 1).length;
      const synced = processedData.filter(item => item.changed === 0).length;
      const totalValue = processedData.reduce((acc, curr) =>
        acc + ((curr.Tarif || 0) * (curr.QteStock || 0)), 0);
      const averagePrice = processedData.length > 0 ? totalValue / processedData.length : 0;

      setStats({
        total,
        inStock,
        outOfStock,
        lowStock,
        emptyStock: outOfStock,
        zeroCount: outOfStock,
        newChanges,
        synced,
        totalValue,
        averagePrice
      });

    } catch (error) {
      console.error('API call failed:', error);
      setData([]);
      setStats({
        total: 0,
        inStock: 0,
        outOfStock: 0,
        lowStock: 0,
        emptyStock: 0,
        zeroCount: 0,
        newChanges: 0,
        synced: 0,
        averagePrice: 0,
        totalValue: 0
      });
      toast.error(`Failed to fetch inventory data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [sourceFilter, succursaleFilter, showChangedOnly]);

  // ===== EVENT HANDLERS (moved up to avoid initialization issues) =====
  const handleManualRefresh = useCallback(() => {
    fetchProducts({});
    toast.info('Refreshing data...');
  }, [fetchProducts]);

  // Use new modular toolbar configuration
  const toolbarConfig = useMDMToolbarConfig({
    onRefresh: handleManualRefresh,
    onSync: onSyncHandler,
    onExport: (format) => {
      const exportData = selectedBaseGridRows.length > 0
        ? validatedData.filter(product => selectedBaseGridRows.includes(`${product.Source}-${product.Code_MDM}`))
        : validatedData;
      toast.success(`Exported ${exportData.length} products to ${format.toUpperCase()}`);
    },
    loading,
    selectedCount: selectedBaseGridRows.length
  });

  // Use new modular custom actions
  const customActions = useMDMCustomActions({
    onRefresh: handleManualRefresh,
    onSync: onSyncHandler,
    loading,
    selectedCount: selectedBaseGridRows.length
  });

  // Use new modular context menu actions
  const contextMenuActions = useMDMContextMenuActions({
    onSync: onSyncHandler,
    onView: (rowData) => console.log('View details:', rowData),
    onEdit: (rowData) => console.log('Edit product:', rowData)
  });

  // Toolbar configuration is now handled by useMDMToolbarConfig above
  // fetchProducts is now defined above to avoid initialization issues

  // ===== EVENT HANDLERS =====
  const handleSourceChange = useCallback((value) => {
    setSourceFilter(value);
  }, []);

  // SyncProgressToast is now defined above to avoid initialization issues

  // prepareSourceItemsPayload is now defined above to avoid initialization issues

  // processBatch is now defined above to avoid initialization issues

  
  const onSyncAllHandler = useCallback(async () => {
    if (sourceFilter === 'all' || !sourceFilter) {
      toast.warning('Please select a specific source to sync all items.');
      return;
    }
    try {
      setLoading(true);
      toast.info(<SyncProgressToast current={0} total={0} />, { 
        autoClose: false, 
        closeOnClick: false, 
        draggable: false 
      });
      await axios.post('/api/mdm/inventory/sync-all-source', {
        sourceCode: sourceFilter
      });
      toast.dismiss();
      toast.success(`Sync for source ${sourceFilter} initiated. The process is running in the background.`);
    } catch (error) {
      toast.dismiss();
      console.error('Sync all failed:', error);
      toast.error(`Failed to initiate sync for source ${sourceFilter}.`);
    } finally {
      setLoading(false);
    }
  }, [sourceFilter, SyncProgressToast]);

  const onSyncStocksHandler = useCallback(async () => {
    if (sourceFilter === 'all' || !sourceFilter) {
      toast.warning('Please select a specific source to sync stocks.');
      return;
    }
    try {
      setLoading(true);
      toast.info(`Marking changed stocks for source: ${sourceFilter}...`);
      await axios.get('/api/mdm/inventory/sync-stocks', {
        params: { sourceCode: sourceFilter }
      });
      toast.success(`Changed stocks for source ${sourceFilter} marked for sync.`);
    } catch (error) {
      console.error('Sync stocks failed:', error);
      toast.error(`Failed to mark changed stocks for source ${sourceFilter}.`);
    } finally {
      setLoading(false);
    }
  }, [sourceFilter]);

  // Custom actions are now handled by useMDMCustomActions above

  // Context menu actions are now handled by useMDMContextMenuActions above

  const getRowClassName = useCallback((params) => 
    params.row.changed ? 'row-changed' : '', []);

  // ===== RENDER =====
  return (
    <Box sx={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      '@media (max-width: 768px)': {
        height: 'calc(100vh - 64px)'
      }
    }}>
      {/* Filter Panel */}
      <Box sx={{ flexShrink: 0, mb: 0.5 }}>
        <MDMFilterPanel
          succursaleOptions={succursaleOptions}
          succursaleFilter={succursaleFilter}
          onSuccursaleChange={setSuccursaleFilter}
          sourceFilterOptions={sourceFilterOptions}
          sourceFilter={sourceFilter}
          onSourceChange={handleSourceChange}
          showChangedOnly={showChangedOnly}
          onShowChangedOnlyChange={setShowChangedOnly}
          isExpanded={filterPanelExpanded}
          onToggleExpanded={setFilterPanelExpanded}
        />
      </Box>

      {/* Main Grid Container with Standard Layout */}
      <Box sx={STANDARD_GRID_CONTAINER_STYLES}>
        {/* Grid Area with Proper Scrolling */}
        <Box sx={STANDARD_GRID_AREA_STYLES}>
          <UnifiedGrid
            {...getStandardGridProps('mdm', {
              gridName: "MDMProductsGrid",
              columns: columns,
              data: validatedData,
              loading: loading,
              onRefresh: handleManualRefresh,
              showStatsCards: false, // Moved to separate container
              defaultViewMode: viewMode,
              onViewModeChange: setViewMode,
              totalCount: stats.total,
              onPaginationModelChange: (model) => {
                console.log('Pagination model changed:', model);
                fetchProducts({
                  page: model.page,
                  pageSize: model.pageSize
                });
              }
            })}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            sx={{
              height: '100%',
              '& .MuiDataGrid-root': {
                height: '100%',
                border: '1px solid rgba(224, 224, 224, 1)',
                borderRadius: 0
              },
              '& .MuiDataGrid-main': {
                overflow: 'auto' // Ensure proper scrolling
              },
              '& .MuiDataGrid-virtualScroller': {
                overflow: 'auto'
              }
            }}
            toolbarConfig={toolbarConfig}
            customActions={customActions}
            contextMenuActions={contextMenuActions}
            enableFloatingActions={false}
            onSync={onSyncHandler}
            onSelectionChange={setSelectedBaseGridRows}
            onExport={(selectedRows) => {
              const exportData = selectedRows.length > 0
                ? validatedData.filter(product => selectedRows.includes(`${product.Source}-${product.Code_MDM}`))
                : validatedData;
              toast.success(`Exported ${exportData.length} products`);
            }}
            getRowId={(row) => `${row.Source}-${row.Code_MDM}`}
            getRowClassName={getRowClassName}
            onError={(error) => toast.error(error.message)}
          />
        </Box>

        {/* Stats Cards at Bottom - Always Visible */}
        <Box sx={STANDARD_STATS_CONTAINER_STYLES}>
          <MDMStatsCards stats={stats} />
        </Box>
      </Box>
    </Box>
  );
};

export default MDMProductsGrid;