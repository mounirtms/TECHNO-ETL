import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Chip, Avatar, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import BaseMagentoGrid from '../base/BaseMagentoGrid';
import { useSettings } from '../../../contexts/SettingsContext';
import { ColumnFactory } from '../../../utils/ColumnFactory';
import magentoApi from '../../../services/magentoApi';

/**
 * Refactored CustomersGrid using BaseMagentoGrid
 * Implements DRY principles and proper inheritance
 */
const CustomersGrid = () => {
  const { settings } = useSettings();
  
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Filter states
  const [groupFilter, setGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Statistics
  const stats = useMemo(() => ({
    total: data.length,
    active: data.filter(c => c.is_active !== false).length,
    inactive: data.filter(c => c.is_active === false).length,
    withOrders: data.filter(c => c.orders_count > 0).length
  }), [data]);

  // Customer group options
  const customerGroups = [
    { value: '', label: 'All Groups' },
    { value: '1', label: 'General' },
    { value: '2', label: 'Wholesale' },
    { value: '3', label: 'Retailer' }
  ];

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Optimized columns definition
  const columns = useMemo(() => [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      pinned: 'left',
      sortable: false,
      renderCell: (params) => (
        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
          {(params.row.firstname?.[0] || '') + (params.row.lastname?.[0] || '')}
        </Avatar>
      )
    },
    ColumnFactory.text('id', {
      headerName: 'ID',
      width: 80,
      pinned: 'left'
    }),
    ColumnFactory.text('firstname', {
      headerName: 'First Name',
      width: 120
    }),
    ColumnFactory.text('lastname', {
      headerName: 'Last Name',
      width: 120
    }),
    ColumnFactory.text('email', {
      headerName: 'Email',
      width: 200,
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={() => handleViewCustomer(params.row)}
        >
          {params.value}
        </Typography>
      )
    }),
    {
      field: 'group_id',
      headerName: 'Group',
      width: 120,
      renderCell: (params) => {
        const getGroupLabel = (groupId) => {
          const group = customerGroups.find(g => g.value === groupId?.toString());
          return group ? group.label : `Group ${groupId}`;
        };

        return (
          <Chip
            label={getGroupLabel(params.value)}
            size="small"
            variant="outlined"
            color="info"
          />
        );
      }
    },
    ColumnFactory.dateTime('created_at', {
      headerName: 'Created',
      width: 140,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    }),
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value !== false ? 'Active' : 'Inactive'}
          size="small"
          color={params.value !== false ? 'success' : 'error'}
          variant="filled"
        />
      )
    },
    {
      field: 'orders_count',
      headerName: 'Orders',
      width: 80,
      type: 'number',
      valueGetter: (params) => params.row.orders_count || 0,
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          size="small"
          color={params.value > 0 ? 'primary' : 'default'}
          variant="outlined"
        />
      )
    },
    {
      field: 'total_spent',
      headerName: 'Total Spent',
      width: 120,
      valueGetter: (params) => params.row.total_spent || 0,
      valueFormatter: (params) => `${parseFloat(params.value || 0).toFixed(2)} DA`
    },
    ColumnFactory.actions('actions', {
      headerName: 'Actions',
      width: 120,
      pinned: 'right',
      getActions: (params) => [
        {
          icon: 'visibility',
          label: 'View Customer',
          onClick: () => handleViewCustomer(params.row)
        },
        {
          icon: 'edit',
          label: 'Edit Customer',
          onClick: () => handleEditCustomer(params.row)
        },
        {
          icon: 'shopping_cart',
          label: 'View Orders',
          onClick: () => handleViewOrders(params.row)
        }
      ]
    })
  ], []);

  // Data fetching
  const fetchCustomers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await magentoApi.getCustomers({
        pageSize: 25,
        currentPage: 1,
        ...params
      });
      
      const customers = response.data?.items || [];
      setData(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error.message || 'Failed to load customers');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleRowClick = useCallback((params) => {
    handleViewCustomer(params.row);
  }, []);

  const handleViewCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    toast.info(`Viewing customer: ${customer.firstname} ${customer.lastname}`);
    // TODO: Open customer details dialog
  }, []);

  const handleEditCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    toast.info(`Editing customer: ${customer.firstname} ${customer.lastname}`);
    // TODO: Open customer edit dialog
  }, []);

  const handleViewOrders = useCallback((customer) => {
    toast.info(`Viewing orders for: ${customer.firstname} ${customer.lastname}`);
    // TODO: Navigate to orders filtered by customer
  }, []);

  const handleExport = useCallback((selectedRows) => {
    console.log('Export customers:', selectedRows);
    toast.info('Export functionality will be implemented');
  }, []);

  const handleImport = useCallback(() => {
    toast.info('Import functionality will be implemented');
  }, []);

  const handleBulkAction = useCallback((actionType, selectedRows) => {
    switch (actionType) {
      case 'activate':
        console.log('Activate customers:', selectedRows);
        toast.info(`Activate ${selectedRows.length} customers`);
        break;
      case 'deactivate':
        console.log('Deactivate customers:', selectedRows);
        toast.info(`Deactivate ${selectedRows.length} customers`);
        break;
      case 'delete':
        console.log('Delete customers:', selectedRows);
        toast.info(`Delete ${selectedRows.length} customers`);
        break;
      case 'newsletter':
        console.log('Subscribe to newsletter:', selectedRows);
        toast.info(`Subscribe ${selectedRows.length} customers to newsletter`);
        break;
      default:
        toast.warning(`Unknown action: ${actionType}`);
    }
  }, []);

  // Bulk actions configuration
  const bulkActions = useMemo(() => [
    { id: 'activate', label: 'Activate Customers', icon: 'check_circle', color: 'success' },
    { id: 'deactivate', label: 'Deactivate Customers', icon: 'block', color: 'warning' },
    { id: 'newsletter', label: 'Subscribe to Newsletter', icon: 'email', color: 'info' },
    { id: 'delete', label: 'Delete Customers', icon: 'delete', color: 'error' }
  ], []);

  // Toolbar configuration
  const toolbarConfig = useMemo(() => ({
    customActions: [
      {
        label: 'Sync Customers',
        icon: 'sync',
        onClick: () => {
          toast.info('Syncing customers from Magento');
          fetchCustomers();
        },
        color: 'info'
      },
      {
        label: 'Add Customer',
        icon: 'person_add',
        onClick: () => {
          toast.info('Add customer functionality will be implemented');
        },
        color: 'primary'
      }
    ],
    filters: [
      {
        field: 'group_id',
        label: 'Group',
        type: 'select',
        options: customerGroups,
        value: groupFilter,
        onChange: (value) => {
          setGroupFilter(value);
          fetchCustomers({ group_id: value, status: statusFilter });
        }
      },
      {
        field: 'status',
        label: 'Status',
        type: 'select',
        options: statusOptions,
        value: statusFilter,
        onChange: (value) => {
          setStatusFilter(value);
          fetchCustomers({ group_id: groupFilter, status: value });
        }
      }
    ]
  }), [groupFilter, statusFilter, fetchCustomers]);

  return (
    <BaseMagentoGrid
      title="Magento Customers"
      columns={columns}
      rows={data}
      loading={loading}
      error={error}
      onRowClick={handleRowClick}
      onRefresh={handleRefresh}
      onExport={handleExport}
      onImport={handleImport}
      onBulkAction={handleBulkAction}
      toolbarConfig={toolbarConfig}
      bulkActions={bulkActions}
      enableSettings={true}
      enableExport={true}
      enableImport={true}
      enableBulkActions={true}
      gridConfig={{
        getRowId: (row) => row.id,
        rowHeight: 60
      }}
    >
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Chip label={`Total: ${stats.total}`} color="primary" />
        <Chip label={`Active: ${stats.active}`} color="success" />
        <Chip label={`Inactive: ${stats.inactive}`} color="error" />
        <Chip label={`With Orders: ${stats.withOrders}`} color="info" />
      </Box>
    </BaseMagentoGrid>
  );
};

export default CustomersGrid;