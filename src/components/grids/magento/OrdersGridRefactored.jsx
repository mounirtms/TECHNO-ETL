import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import BaseMagentoGrid from '../base/BaseMagentoGrid';
import { useSettings } from '../../../contexts/SettingsContext';
import { ColumnFactory } from '../../../utils/ColumnFactory';
import magentoApi from '../../../services/magentoApi';

/**
 * Refactored OrdersGrid using BaseMagentoGrid
 * Implements DRY principles and proper inheritance
 */
const OrdersGrid = () => {
  const { settings } = useSettings();
  
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Statistics
  const stats = useMemo(() => ({
    total: data.length,
    pending: data.filter(o => o.status === 'pending').length,
    processing: data.filter(o => o.status === 'processing').length,
    shipped: data.filter(o => o.status === 'shipped').length,
    completed: data.filter(o => o.status === 'complete').length
  }), [data]);

  // Order status options
  const orderStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'complete', label: 'Complete' },
    { value: 'canceled', label: 'Canceled' }
  ];

  // Payment status options
  const paymentStatuses = [
    { value: '', label: 'All Payment States' },
    { value: 'pending', label: 'Pending Payment' },
    { value: 'paid', label: 'Paid' },
    { value: 'refunded', label: 'Refunded' }
  ];

  // Optimized columns definition
  const columns = useMemo(() => [
    ColumnFactory.text('increment_id', {
      headerName: 'Order #',
      width: 120,
      pinned: 'left',
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            cursor: 'pointer'
          }}
          onClick={() => handleViewOrder(params.row)}
        >
          #{params.value}
        </Typography>
      )
    }),
    ColumnFactory.dateTime('created_at', {
      headerName: 'Date',
      width: 140,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }),
    ColumnFactory.text('customer_firstname', {
      headerName: 'Customer',
      width: 200,
      valueGetter: (params) => {
        return `${params.row.customer_firstname || ''} ${params.row.customer_lastname || ''}`.trim();
      }
    }),
    ColumnFactory.text('customer_email', {
      headerName: 'Email',
      width: 200
    }),
    ColumnFactory.status('status', {
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const getStatusColor = (status) => {
          switch (status?.toLowerCase()) {
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'shipped': return 'primary';
            case 'complete': return 'success';
            case 'canceled': return 'error';
            default: return 'default';
          }
        };

        return (
          <Chip
            label={params.value || 'Unknown'}
            size="small"
            color={getStatusColor(params.value)}
            variant="filled"
          />
        );
      }
    }),
    ColumnFactory.currency('grand_total', {
      headerName: 'Total',
      width: 100,
      valueFormatter: (params) => `${parseFloat(params.value || 0).toFixed(2)} DA`
    }),
    ColumnFactory.text('state', {
      headerName: 'State',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value || 'New'}
          size="small"
          variant="outlined"
        />
      )
    }),
    ColumnFactory.text('payment_method', {
      headerName: 'Payment Method',
      width: 150,
      valueGetter: (params) => {
        return params.row.payment?.method || params.row.payment_method || 'N/A';
      }
    }),
    ColumnFactory.text('shipping_method', {
      headerName: 'Shipping',
      width: 150,
      valueGetter: (params) => {
        return params.row.extension_attributes?.shipping_assignments?.[0]?.shipping?.method || 'N/A';
      }
    }),
    ColumnFactory.actions('actions', {
      headerName: 'Actions',
      width: 120,
      pinned: 'right',
      getActions: (params) => [
        {
          icon: 'visibility',
          label: 'View Order',
          onClick: () => handleViewOrder(params.row)
        },
        {
          icon: 'edit',
          label: 'Edit Order',
          onClick: () => handleEditOrder(params.row)
        },
        {
          icon: 'local_shipping',
          label: 'Ship Order',
          onClick: () => handleShipOrder(params.row),
          disabled: params.row.status === 'complete' || params.row.status === 'shipped'
        }
      ]
    })
  ], []);

  // Data fetching
  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await magentoApi.getOrders({
        pageSize: 25,
        currentPage: 1,
        ...params
      });
      
      const orders = response.data?.items || [];
      setData(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to load orders');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRowClick = useCallback((params) => {
    handleViewOrder(params.row);
  }, []);

  const handleViewOrder = useCallback((order) => {
    setSelectedOrder(order);
    toast.info(`Viewing order #${order.increment_id}`);
    // TODO: Open order details dialog
  }, []);

  const handleEditOrder = useCallback((order) => {
    setSelectedOrder(order);
    toast.info(`Editing order #${order.increment_id}`);
    // TODO: Open order edit dialog
  }, []);

  const handleShipOrder = useCallback((order) => {
    toast.info(`Shipping order #${order.increment_id}`);
    // TODO: Implement ship order functionality
  }, []);

  const handleExport = useCallback((selectedRows) => {
    console.log('Export orders:', selectedRows);
    toast.info('Export functionality will be implemented');
  }, []);

  const handleBulkAction = useCallback((actionType, selectedRows) => {
    switch (actionType) {
      case 'cancel':
        console.log('Cancel orders:', selectedRows);
        toast.info(`Cancel ${selectedRows.length} orders`);
        break;
      case 'ship':
        console.log('Ship orders:', selectedRows);
        toast.info(`Ship ${selectedRows.length} orders`);
        break;
      case 'refund':
        console.log('Refund orders:', selectedRows);
        toast.info(`Refund ${selectedRows.length} orders`);
        break;
      default:
        toast.warning(`Unknown action: ${actionType}`);
    }
  }, []);

  // Bulk actions configuration
  const bulkActions = useMemo(() => [
    { id: 'ship', label: 'Ship Orders', icon: 'local_shipping', color: 'primary' },
    { id: 'cancel', label: 'Cancel Orders', icon: 'cancel', color: 'error' },
    { id: 'refund', label: 'Refund Orders', icon: 'money_off', color: 'warning' }
  ], []);

  // Toolbar configuration
  const toolbarConfig = useMemo(() => ({
    customActions: [
      {
        label: 'Sync Orders',
        icon: 'sync',
        onClick: () => {
          toast.info('Syncing orders from Magento');
          fetchOrders();
        },
        color: 'info'
      }
    ],
    filters: [
      {
        field: 'status',
        label: 'Status',
        type: 'select',
        options: orderStatuses,
        value: statusFilter,
        onChange: (value) => {
          setStatusFilter(value);
          fetchOrders({ status: value, payment_state: paymentFilter });
        }
      },
      {
        field: 'payment_state',
        label: 'Payment',
        type: 'select',
        options: paymentStatuses,
        value: paymentFilter,
        onChange: (value) => {
          setPaymentFilter(value);
          fetchOrders({ status: statusFilter, payment_state: value });
        }
      }
    ]
  }), [statusFilter, paymentFilter, fetchOrders]);

  return (
    <BaseMagentoGrid
      title="Magento Orders"
      columns={columns}
      rows={data}
      loading={loading}
      error={error}
      onRowClick={handleRowClick}
      onRefresh={handleRefresh}
      onExport={handleExport}
      onBulkAction={handleBulkAction}
      toolbarConfig={toolbarConfig}
      bulkActions={bulkActions}
      enableSettings={true}
      enableExport={true}
      enableImport={false}
      enableBulkActions={true}
      gridConfig={{
        getRowId: (row) => row.entity_id || row.increment_id,
        rowHeight: 60
      }}
    >
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Chip label={`Total: ${stats.total}`} color="primary" />
        <Chip label={`Pending: ${stats.pending}`} color="warning" />
        <Chip label={`Processing: ${stats.processing}`} color="info" />
        <Chip label={`Shipped: ${stats.shipped}`} color="primary" />
        <Chip label={`Completed: ${stats.completed}`} color="success" />
      </Box>
    </BaseMagentoGrid>
  );
};

export default OrdersGrid;