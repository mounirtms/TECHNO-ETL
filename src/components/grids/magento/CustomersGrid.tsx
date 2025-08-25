// CustomersGrid - Optimized Magento Customers Grid
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  ShoppingCart as ShoppingCartIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
// Unified Grid System
import UnifiedGrid from '../../common/UnifiedGrid';
import { getStandardGridProps, getStandardToolbarConfig } from '../../../config/gridConfig';
import { ColumnFactory } from '../../../utils/ColumnFactory.tsx';

// Services
import magentoApi from '../../../services/magentoApi';
import { toast } from 'react-toastify';

/**
 * CustomersGrid - Optimized Magento Customers Grid Component
 * Follows standardized structure for consistency across all grids
 */
const CustomersGrid = () => {
  // ===== 1. STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    totalOrders: 0
  });

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // ===== 2. DATA FETCHING =====
  const fetchCustomers = useCallback(async (filterParams = {}) => {
    setLoading(true);
    try {
      const response = await magentoApi.getCustomers(filterParams);
      // Handle {data: {items: []}} response structure
      const customersData = response?.data || response;
      const customers = customersData?.items || [];
      setData(customers);
      
      // Calculate stats
      const totalCustomers = customers.length;
      const activeCustomers = customers.filter((c: any: any: any: any) => c.is_active ===1).length;
      const inactiveCustomers = totalCustomers - activeCustomers;
      const totalOrders = customers.reduce((sum: any c: any: any: any: any) => sum + (c.orders_count || 0), 0);
      
      setStats({
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        totalOrders
      });
    } catch(error: any) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== 3. EVENT HANDLERS =====
  const handleView = useCallback((records) => {
    if(records.length ===1) {
      const customer = data.find(c => c?.id ===records[0]);
      setSelectedCustomer(customer);
      setViewDialogOpen(true);
    } else {
      toast.warning('Please select exactly one customer to view');
    }
  }, [data]);

  const handleEdit = useCallback((records) => {
    if(records.length ===1) {
      const customer = data.find(c => c?.id ===records[0]);
      setSelectedCustomer(customer);
      setEditDialogOpen(true);
    } else {
      toast.warning('Please select exactly one customer to edit');
    }
  }, [data]);

  const handleDelete = useCallback(async (records) => {
    if(records.length ===0) {
      toast.warning('Please select customers to delete');
      return;
    }

    try {
      for (const customerId of records) {
        await magentoApi?.deleteCustomer(customerId);
      }
      toast.success(`Deleted ${records.length} customer(s) successfully`);
      fetchCustomers();
    } catch(error: any) {
      console.error('Error deleting customers:', error);
      toast.error('Failed to delete customers');
    }
  }, [fetchCustomers]);

  const handleSync = useCallback(async () => {
    try {
      await magentoApi?.syncCustomers();
      toast.success('Customers synchronized successfully');
      fetchCustomers();
    } catch(error: any) {
      console.error('Error syncing customers:', error);
      toast.error('Failed to sync customers');
    }
  }, [fetchCustomers]);

  const handleFilterChange = useCallback((newFilter) => {
    setCurrentFilter(newFilter);
    const filterParams = newFilter === 'all' ? {} : { is_active: newFilter === 'active' ? 1 : 0 };
    fetchCustomers(filterParams);
  }, [fetchCustomers]);

  // ===== 4. COLUMN DEFINITIONS =====
  const columns = useMemo(() => [
    ColumnFactory.number('id', {
      headerName: 'ID',
      width: 80
    }),
    ColumnFactory.text('firstname', {
      headerName: 'First Name',
      width: 150
    }),
    ColumnFactory.text('lastname', {
      headerName: 'Last Name',
      width: 150
    }),
    ColumnFactory.text('email', {
      headerName: 'Email',
      width: 250
    }),
    ColumnFactory.boolean('is_active', {
      headerName: 'Status',
      width: 120
    }),
    ColumnFactory.number('orders_count', {
      headerName: 'Orders',
      width: 100
    }),
    ColumnFactory.dateTime('created_at', {
      headerName: 'Registered',
      width: 180
    })
  ], []);

  // ===== 5. TOOLBAR CONFIGURATION =====
  const toolbarConfig = {
    showRefresh: true,
    showAdd: false, // Customers typically register themselves
    showEdit: true,
    showDelete: true,
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
      label: 'View Customer',
      onClick: () => handleView(selectedRows),
      icon: <ViewIcon />,
      color: 'primary',
      variant: 'outlined',
      disabled: selectedRows.length !== 1
    },
    {
      label: 'Sync Customers',
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
      label: 'View Customer',
      icon: 'visibility',
      onClick: (row) => {
        setSelectedCustomer(row);
        setViewDialogOpen(true);
      }
    },
    edit: {
      enabled: true,
      label: 'Edit Customer',
      icon: 'edit',
      onClick: (row) => {
        setSelectedCustomer(row);
        setEditDialogOpen(true);
      }
    },
    delete: {
      enabled: true,
      label: 'Delete Customer',
      icon: 'delete',
      onClick: (row) => handleDelete([row?.id]),
      color: 'error'
    }
  }), [handleDelete]);

  // ===== 7. STATS CARDS =====
  const statusCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: <PersonIcon />,
      color: 'primary'
    },
    {
      title: 'Active',
      value: stats.activeCustomers,
      icon: <ActiveIcon />,
      color: 'success'
    },
    {
      title: 'Inactive',
      value: stats.inactiveCustomers,
      icon: <InactiveIcon />,
      color: 'warning'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingCartIcon />,
      color: 'info'
    }
  ];

  // ===== 8. FILTER OPTIONS =====
  const filterOptions = [
    { key: 'all', label: 'All Customers', value: 'all' },
    { key: 'active', label: 'Active Only', value: 'active' },
    { key: 'inactive', label: 'Inactive Only', value: 'inactive' }
  ];

  // ===== 9. EFFECTS =====
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ===== 10. RENDER =====
  return (
    <Box sx={{ display: "flex", height: '100%', width: '100%' }}>
      <UnifiedGrid
        { ...getStandardGridProps('magentoCustomers', {
          gridName: "CustomersGrid",
          columns,
          data,
          loading,
          totalCount: stats.totalCustomers,

          // Event handlers
          onRefresh: fetchCustomers,
          onRowDoubleClick: handleEdit,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onSelectionChange: setSelectedRows,
          onExport: (exportData, selectedRows) => {
            console.log('Exporting customers:', exportData);
            toast.success(`Exported ${exportData.length} customers`);
          },

          // Configuration
          toolbarConfig: getStandardToolbarConfig('magentoCustomers'),
          contextMenuActions,

          // Stats
          showStatsCards: true,
          gridCards: statusCards,

          // Filter configuration
          filterOptions,
          currentFilter,
          onFilterChange: handleFilterChange,

          // Row configuration
          getRowId: (row) => row?.id,

          // Error handling
          onError: (error) => toast.error(error.message)
        })}
      />

      {/* Add dialogs here when needed */}
    </Box>
  );
};

export default CustomersGrid;
