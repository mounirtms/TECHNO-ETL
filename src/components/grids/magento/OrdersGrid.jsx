// OrdersGrid - Optimized Magento Orders Grid
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as LocalShippingIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  SyncAlt as SyncAltIcon,
  Paid as PaidIcon,
  TrendingUp as TrendingUpIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import UnifiedGrid from '../../common/UnifiedGrid';
import magentoApi from '../../../services/magentoApi';
import { toast } from 'react-toastify';

/**
 * OrdersGrid - Optimized Magento Orders Grid Component
 * Follows standardized structure for consistency across all grids
 */
const OrdersGrid = () => {
  // ===== 1. STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  });

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ===== 2. DATA FETCHING =====
  const fetchOrders = useCallback(async (filterParams = {}) => {
    setLoading(true);
    try {
      const response = await magentoApi.getOrders(filterParams);
      // Handle {data: {items: []}} response structure
      const ordersData = response?.data || response;
      const orders = ordersData?.items || [];
      setData(orders);
      
      // Calculate stats
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const processingOrders = orders.filter(o => o.status === 'processing').length;
      const completedOrders = orders.filter(o => o.status === 'complete').length;
      const cancelledOrders = orders.filter(o => o.status === 'canceled').length;
      const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.grand_total) || 0), 0);
      
      setStats({
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== 3. EVENT HANDLERS =====
  const handleView = useCallback((records) => {
    if (records.length === 1) {
      const order = data.find(o => o.entity_id === records[0]);
      setSelectedOrder(order);
      setViewDialogOpen(true);
    } else {
      toast.warning('Please select exactly one order to view');
    }
  }, [data]);

  const handleEdit = useCallback((records) => {
    if (records.length === 1) {
      const order = data.find(o => o.entity_id === records[0]);
      setSelectedOrder(order);
      setEditDialogOpen(true);
    } else {
      toast.warning('Please select exactly one order to edit');
    }
  }, [data]);

  const handleCancel = useCallback(async (records) => {
    if (records.length === 0) {
      toast.warning('Please select orders to cancel');
      return;
    }

    try {
      for (const orderId of records) {
        await magentoApi.cancelOrder(orderId);
      }
      toast.success(`Cancelled ${records.length} order(s) successfully`);
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling orders:', error);
      toast.error('Failed to cancel orders');
    }
  }, [fetchOrders]);

  const handleSync = useCallback(async () => {
    try {
      await magentoApi.syncOrders();
      toast.success('Orders synchronized successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error syncing orders:', error);
      toast.error('Failed to sync orders');
    }
  }, [fetchOrders]);

  const handleFilterChange = useCallback((newFilter) => {
    setCurrentFilter(newFilter);
    const filterParams = newFilter === 'all' ? {} : { status: newFilter };
    fetchOrders(filterParams);
  }, [fetchOrders]);

  // ===== 4. COLUMN DEFINITIONS =====
  const columns = useMemo(() => [
    {
      field: 'increment_id',
      headerName: 'Order #',
      width: 120,
      sortable: true,
      filterable: true
    },
    {
      field: 'customer_email',
      headerName: 'Customer Email',
      width: 200,
      sortable: true,
      filterable: true
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const statusColors = {
          pending: 'warning',
          processing: 'info',
          complete: 'success',
          canceled: 'error',
          closed: 'default'
        };
        return (
          <Chip
            label={params.value}
            color={statusColors[params.value] || 'default'}
            size="small"
          />
        );
      }
    },
    {
      field: 'grand_total',
      headerName: 'Total',
      width: 120,
      type: 'number',
      valueFormatter: (params) => params.value ? `$${parseFloat(params.value).toFixed(2)}` : 'N/A'
    },
    {
      field: 'total_qty_ordered',
      headerName: 'Items',
      width: 80,
      type: 'number'
    },
    {
      field: 'created_at',
      headerName: 'Order Date',
      width: 180,
      valueFormatter: (params) => 
        params.value ? new Date(params.value).toLocaleString() : 'N/A'
    }
  ], []);

  // ===== 5. TOOLBAR CONFIGURATION =====
  const toolbarConfig = {
    showRefresh: true,
    showAdd: false, // Orders are not typically added manually
    showEdit: true,
    showDelete: false, // Orders are cancelled, not deleted
    showExport: true,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showViewToggle: true,
    compact: false,
    size: 'medium'
  };

  const customActions = [
    {
      label: 'View Order',
      onClick: () => handleView(selectedRows),
      icon: <ViewIcon />,
      color: 'primary',
      variant: 'outlined',
      disabled: selectedRows.length !== 1
    },
    {
      label: 'Cancel Orders',
      onClick: () => handleCancel(selectedRows),
      icon: <CancelIcon />,
      color: 'error',
      variant: 'outlined',
      disabled: selectedRows.length === 0
    },
    {
      label: 'Sync Orders',
      onClick: handleSync,
      icon: <SyncIcon />,
      color: 'secondary',
      variant: 'outlined'
    }
  ];

  // ===== 6. CONTEXT MENU ACTIONS =====
  const contextMenuActions = {
    view: {
      label: 'View Order',
      icon: <ViewIcon />,
      onClick: (row) => {
        setSelectedOrder(row);
        setViewDialogOpen(true);
      }
    },
    edit: {
      label: 'Edit Order',
      icon: <EditIcon />,
      onClick: (row) => {
        setSelectedOrder(row);
        setEditDialogOpen(true);
      }
    },
    cancel: {
      label: 'Cancel Order',
      icon: <CancelIcon />,
      onClick: (row) => handleCancel([row.entity_id]),
      color: 'error'
    }
  };

  // ===== 7. STATS CARDS =====
  const statusCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingBagIcon />,
      color: 'primary'
    },
    {
      title: 'Pending',
      value: stats.pendingOrders,
      icon: <HourglassEmptyIcon />,
      color: 'warning'
    },
    {
      title: 'Processing',
      value: stats.processingOrders,
      icon: <LocalShippingIcon />,
      color: 'info'
    },
    {
      title: 'Completed',
      value: stats.completedOrders,
      icon: <CheckCircleOutlineIcon />,
      color: 'success'
    },
    {
      title: 'Cancelled',
      value: stats.cancelledOrders,
      icon: <CancelIcon />,
      color: 'error'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <PaidIcon />,
      color: 'success'
    }
  ];

  // ===== 8. FILTER OPTIONS =====
  const filterOptions = [
    { key: 'all', label: 'All Orders', value: 'all' },
    { key: 'pending', label: 'Pending', value: 'pending' },
    { key: 'processing', label: 'Processing', value: 'processing' },
    { key: 'complete', label: 'Completed', value: 'complete' },
    { key: 'canceled', label: 'Cancelled', value: 'canceled' }
  ];

  // ===== 9. EFFECTS =====
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ===== 10. RENDER =====
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <UnifiedGrid
        gridName="OrdersGrid"
        columns={columns}
        data={data}
        loading={loading}
        
        // Feature toggles
        enableCache={true}
        enableI18n={true}
        enableRTL={false}
        enableSelection={true}
        enableSorting={true}
        enableFiltering={true}
        enableColumnReordering={true}
        enableColumnResizing={true}
        
        // View options
        showStatsCards={true}
        showCardView={true}
        defaultViewMode="grid"
        gridCards={statusCards}
        totalCount={stats.totalOrders}
        defaultPageSize={25}
        
        // Toolbar configuration
        toolbarConfig={toolbarConfig}
        customActions={customActions}
        
        // Context menu
        contextMenuActions={contextMenuActions}
        
        // Filter configuration
        filterOptions={filterOptions}
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        
        // Event handlers
        onRefresh={fetchOrders}
        onEdit={handleEdit}
        onSelectionChange={setSelectedRows}
        onExport={(exportData, selectedRows) => {
          console.log('Exporting orders:', exportData);
          toast.success(`Exported ${exportData.length} orders`);
        }}
        
        // Row configuration
        getRowId={(row) => row.entity_id}
        
        // Error handling
        onError={(error) => toast.error(error.message)}
      />

      {/* Add dialogs here when needed */}
    </Box>
  );
};

export default OrdersGrid;
