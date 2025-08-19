// OrdersGrid - Optimized Magento Orders Grid
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as LocalShippingIcon,
  Sync as SyncIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Paid as PaidIcon,
  TrendingUp as TrendingUpIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import UnifiedGrid from '../../common/UnifiedGrid';
import magentoApi from '../../../services/magentoApi';
import { toast } from 'react-toastify';
import {
  getStandardGridProps,
  getStandardToolbarConfig
} from '../../../config/gridConfig';
import { ColumnFactory } from '../../../utils/ColumnFactory.tsx';
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
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

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

  const handlePaginationChange = useCallback((newPaginationModel) => {
    setPaginationModel(newPaginationModel);
    fetchOrders({
      pageSize: newPaginationModel.pageSize,
      currentPage: newPaginationModel.page + 1
    });
  }, [fetchOrders]);

  // ===== 4. COLUMN DEFINITIONS =====
  const columns = useMemo(() => [
    ColumnFactory.text('increment_id', {
      headerName: 'Order #',
      width: 120
    }),
    ColumnFactory.text('customer_email', {
      headerName: 'Customer Email',
      width: 200
    }),
    ColumnFactory.status('status', {
      headerName: 'Status',
      width: 120,
      valueOptions: ['pending', 'processing', 'complete', 'canceled', 'closed'],
      statusColors: {
        pending: 'warning',
        processing: 'info',
        complete: 'success',
        canceled: 'error',
        closed: 'default'
      }
    }),
    ColumnFactory.currency('grand_total', {
      headerName: 'Total',
      width: 120,
      currency: 'USD'
    }),
    ColumnFactory.number('total_qty_ordered', {
      headerName: 'Items',
      width: 80
    }),
    ColumnFactory.dateTime('created_at', {
      headerName: 'Order Date',
      width: 180
    })
  ], []);

  // ===== 5. CUSTOM ACTIONS (Grid-specific actions not covered by standard config) =====
  // Toolbar configuration is now handled by getStandardGridProps('magentoOrders')

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
  const contextMenuActions = useMemo(() => ({
    view: {
      enabled: true,
      label: 'View Order',
      icon: 'visibility',
      onClick: (row) => {
        setSelectedOrder(row);
        setViewDialogOpen(true);
      }
    },
    edit: {
      enabled: true,
      label: 'Edit Order',
      icon: 'edit',
      onClick: (row) => {
        setSelectedOrder(row);
        setEditDialogOpen(true);
      }
    },
    cancel: {
      enabled: true,
      label: 'Cancel Order',
      icon: 'cancel',
      onClick: (row) => handleCancel([row.entity_id]),
      color: 'error'
    }
  }), [handleCancel]);

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
    <UnifiedGrid
      {...getStandardGridProps('magentoOrders', {
        gridName: "OrdersGrid",
        columns,
        data,
        loading,
        totalCount: stats.totalOrders,

        // Pagination configuration
        paginationMode: "server",
        paginationModel,
        onPaginationModelChange: handlePaginationChange,
        defaultPageSize: 25,

        // Event handlers
        onRefresh: fetchOrders,
        onRowDoubleClick: handleEdit,
        onEdit: handleEdit,
        onCancel: handleCancel,
        onSync: handleSync,

        // Configuration
        toolbarConfig: getStandardToolbarConfig('magentoOrders'),
        contextMenuActions,

        // Stats
        showStatsCards: true,
        gridCards: statusCards,

        // Filter configuration
        filterOptions,
        currentFilter,
        onFilterChange: handleFilterChange,

        // Row configuration
        getRowId: (row) => row.increment_id || row.id,

        // Error handling
        onError: (error) => {
          console.error('Orders Grid Error:', error);
          toast.error('Error loading orders');
        }
      })}
    />
  );
};

export default OrdersGrid;
