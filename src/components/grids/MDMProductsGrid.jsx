import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, LinearProgress, Typography, Button } from '@mui/material';
import UnifiedGrid from '../common/UnifiedGrid';
import MDMFilterPanel from './MDMFilterPanel';
import { StatsCards } from '../common/StatsCards';
import { toast } from 'react-toastify';
import axios from 'axios';
import magentoApi from '../../services/magentoApi';
import sourceMapping from '../../utils/sources';
import {
  Category as CategoryIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  ReportProblem as ReportProblemIcon,
  SyncAlt as SyncAltIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  AccountBalance as AccountBalanceIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

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
      filterable: true
    },
    {
      field: 'Code_JDE',
      headerName: 'JDE Code',
      width: 120,
      type: 'string',
      sortable: true
    },
    {
      field: 'Code_Fil_JDE',
      headerName: 'JDE Fil.',
      width: 120,
      type: 'string'
    },
    {
      field: 'TypeProd',
      headerName: 'Type',
      width: 120,
      sortable: true,
      filterable: true
    },
    {
      field: 'Source',
      headerName: 'Source',
      width: 150,
      sortable: true,
      filterable: true
    },
    {
      field: 'Succursale',
      headerName: 'Branch',
      width: 100,
      type: 'number',
      sortable: true
    },
    {
      field: 'QteStock',
      headerName: 'Stock',
      width: 100,
      type: 'number',
      sortable: true,
      filterable: true,
      valueFormatter: (params) => params.value?.toString() || '0'
    },
    {
      field: 'Tarif',
      headerName: 'Price',
      width: 120,
      type: 'number',
      sortable: true,
      valueFormatter: (params) => {
        if (!params.value || isNaN(params.value)) return '0.00 DZD';
        return new Intl.NumberFormat('fr-DZ', {
          style: 'currency',
          currency: 'DZD'
        }).format(params.value);
      }
    },
    {
      field: 'QteReceptionner',
      headerName: 'Received',
      width: 100,
      type: 'number'
    },
    {
      field: 'VenteMoyen',
      headerName: 'Avg Sales',
      width: 110,
      type: 'number',
      valueFormatter: (params) => (params.value || 0).toFixed(2)
    },
    {
      field: 'DateDernierMaJ',
      headerName: 'Last Update',
      width: 160,
      type: 'date',
      valueFormatter: (params) => 
        params.value ? new Date(params.value).toLocaleDateString('fr-DZ') : ''
    },
    {
      field: 'changed',
      headerName: 'Changed',
      width: 100,
      type: 'boolean',
      renderCell: (params) => params.value ? '✓' : ''
    }
  ].filter(col => columnVisibility[col.field] !== false), [columnVisibility]);

  const statusCards = useMemo(() => [
    { title: 'Total Products', value: stats.total, icon: CategoryIcon, color: 'primary' },
    { title: 'In Stock', value: stats.inStock, icon: CheckCircleOutlineIcon, color: 'success' },
    { title: 'Out of Stock', value: stats.outOfStock, icon: ErrorOutlineIcon, color: 'error' },
    { title: 'Low Stock', value: stats.lowStock, icon: ReportProblemIcon, color: 'warning' },
    { title: 'New Changes', value: stats.newChanges, icon: SyncAltIcon, color: 'secondary' },
    { title: 'Synced Items', value: stats.synced, icon: TrendingUpIcon, color: 'info' },
    { title: 'Avg Price', value: `${stats.averagePrice.toFixed(2)} DZD`, icon: AttachMoneyIcon, color: 'info' },
    { title: 'Total Value', value: `${(stats.totalValue / 1000).toFixed(1)}K DZD`, icon: AccountBalanceIcon, color: 'success' }
  ].slice(0, 8), [stats]);

  const toolbarConfig = useMemo(() => ({
    showRefresh: true,
    showSync: false,
    showExport: true,
    showSearch: false,
    showFilters: false,
    showSettings: true,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showViewToggle: true,
    compact: false,
    size: 'medium',
    spacing: 2,
    maxWidth: '70%',
    actionAreaWidth: '30%'
  }), []);

  // ===== DATA FETCHING =====
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

  // ===== EVENT HANDLERS =====
  const handleManualRefresh = useCallback(() => {
    fetchProducts({});
    toast.info('Refreshing data...');
  }, [fetchProducts]);

  const handleSourceChange = useCallback((value) => {
    setSourceFilter(value);
  }, []);

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
        .filter(item => item.source_code)
    };
  }, []);

  const processBatch = useCallback(async (items) => {
    try {
      const response = await magentoApi.post('inventory/source-items', { sourceItems: items });
      toast.success('Items synced successfully.');
      return response.data;
    } catch (error) {
      console.error('Batch processing error:', error);
      throw error;
    }
  }, []);

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

  const customActions = useMemo(() => [
    {
      label: 'Refresh Data',
      icon: <RefreshIcon />,
      onClick: handleManualRefresh,
      tooltip: 'Manually refresh grid data with current filters',
      variant: 'contained',
      color: 'info',
      size: 'small',
      priority: 0
    },
    {
      label: 'Sync All Products',
      icon: <SyncAltIcon />,
      onClick: onSyncAllHandler,
      tooltip: 'Synchronize all products from selected source',
      variant: 'contained',
      color: 'primary',
      size: 'small',
      disabled: sourceFilter === 'all',
      priority: 1
    },
    {
      label: 'Sync Stocks',
      icon: <AttachMoneyIcon />,
      onClick: onSyncStocksHandler,
      tooltip: 'Synchronize stock levels and pricing',
      variant: 'outlined',
      color: 'secondary',
      size: 'small',
      priority: 2
    }
  ], [handleManualRefresh, onSyncAllHandler, onSyncStocksHandler, sourceFilter]);

  const contextMenuActions = useMemo(() => ({
    sync: {
      icon: SyncAltIcon,
      label: 'Sync Product',
      enabled: true,
      onClick: (rowData) => onSyncHandler(rowData)
    },
    view: {
      enabled: true,
      onClick: (rowData) => {
        toast.info(`Viewing product: ${rowData.Code_MDM}`);
      }
    }
  }), [onSyncHandler]);

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

      {/* Main Grid Container */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <UnifiedGrid
          gridName="MDMProductsGrid"
          columns={columns}
          data={data}
          loading={loading}
          onRefresh={handleManualRefresh}
          enableCache={true}
          enableSelection={true}
          enableSorting={true}
          enableFiltering={true}
          enableColumnReordering={true}
          showStatsCards={false}
          showCardView={true}
          defaultViewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={stats.total}
          defaultPageSize={25}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          sx={{
            height: '100%',
            '& .MuiDataGrid-root': {
              height: '100%'
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
              ? data.filter(product => selectedRows.includes(`${product.Source}-${product.Code_MDM}`))
              : data;
            toast.success(`Exported ${exportData.length} products`);
          }}
          getRowId={(row) => `${row.Source}-${row.Code_MDM}`}
          getRowClassName={getRowClassName}
          onError={(error) => toast.error(error.message)}
        />

        {/* Stats Cards at Bottom */}
        <Box sx={{ flexShrink: 0, mt: 1 }}>
          <StatsCards cards={statusCards} />
        </Box>
      </Box>
    </Box>
  );
};

export default MDMProductsGrid;