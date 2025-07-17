import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import EnhancedBaseGrid from '../components/grids/EnhancedBaseGrid';

/**
 * Grid Test Page - Demonstrates all enhanced grid features
 */
const GridTestPage = () => {
  // Sample test data
  const [data] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      department: 'IT',
      salary: 75000,
      lastLogin: '2024-01-15'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Manager',
      status: 'active',
      department: 'HR',
      salary: 65000,
      lastLogin: '2024-01-14'
    },
    {
      id: 3,
      name: 'Ahmed Al-Rashid',
      email: 'ahmed@example.com',
      role: 'User',
      status: 'pending',
      department: 'Sales',
      salary: 55000,
      lastLogin: '2024-01-13'
    },
    {
      id: 4,
      name: 'Marie Dubois',
      email: 'marie@example.com',
      role: 'Analyst',
      status: 'active',
      department: 'Finance',
      salary: 60000,
      lastLogin: '2024-01-12'
    },
    {
      id: 5,
      name: 'Carlos Rodriguez',
      email: 'carlos@example.com',
      role: 'Developer',
      status: 'inactive',
      department: 'IT',
      salary: 70000,
      lastLogin: '2024-01-11'
    }
  ]);

  const [loading, setLoading] = useState(false);

  // Column definitions
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Admin' ? 'error' : 'default'}
          size="small"
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'active' ? 'success' : params.value === 'pending' ? 'warning' : 'default'}
          size="small"
        />
      )
    },
    { field: 'department', headerName: 'Department', width: 120 },
    { 
      field: 'salary', 
      headerName: 'Salary', 
      width: 120, 
      type: 'number',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`
    },
    { field: 'lastLogin', headerName: 'Last Login', width: 120, type: 'date' }
  ];

  // Stats cards
  const statsCards = [
    {
      title: 'Total Users',
      value: data.length,
      color: 'primary',
      icon: '👥'
    },
    {
      title: 'Active Users',
      value: data.filter(user => user.status === 'active').length,
      color: 'success',
      icon: '✅'
    },
    {
      title: 'Pending Users',
      value: data.filter(user => user.status === 'pending').length,
      color: 'warning',
      icon: '⏳'
    },
    {
      title: 'Average Salary',
      value: `$${Math.round(data.reduce((sum, user) => sum + user.salary, 0) / data.length).toLocaleString()}`,
      color: 'info',
      icon: '💰'
    }
  ];

  // Event handlers
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Data refreshed successfully!');
    }, 1000);
  }, []);

  const handleAdd = useCallback(() => {
    toast.info('Add functionality - Ready for implementation');
  }, []);

  const handleEdit = useCallback((rowData) => {
    toast.info(`Edit functionality - User: ${rowData?.name || 'Selected user'}`);
  }, []);

  const handleDelete = useCallback((selectedRows) => {
    toast.warning(`Delete functionality - ${selectedRows.length} user(s) selected`);
  }, []);

  const handleExport = useCallback((selectedRows) => {
    const exportCount = selectedRows.length > 0 ? selectedRows.length : data.length;
    toast.success(`Export functionality - ${exportCount} records exported`);
  }, [data.length]);

  const handleSync = useCallback(() => {
    toast.info('Sync functionality - Ready for implementation');
  }, []);

  const handleRowDoubleClick = useCallback((params) => {
    toast.info(`Double-click detected - User: ${params.row.name}`);
  }, []);

  const handleSelectionChange = useCallback((selection) => {
    console.log('Selection changed:', selection);
  }, []);

  // Toolbar configuration
  const toolbarConfig = {
    showRefresh: true,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showExport: true,
    showSync: true,
    showSearch: true,
    showFilters: true,
    showSettings: true
  };

  // Custom actions
  const customActions = [
    {
      label: 'Bulk Approve',
      icon: <ViewIcon />,
      onClick: (selectedRows) => toast.info(`Bulk approve ${selectedRows.length} users`),
      tooltip: 'Approve selected users',
      variant: 'contained',
      color: 'success'
    }
  ];

  // Context menu actions
  const contextMenuActions = {
    edit: {
      enabled: true,
      onClick: (rowData) => handleEdit(rowData)
    },
    delete: {
      enabled: (rowData) => rowData.role !== 'Admin',
      onClick: (rowData) => handleDelete([rowData.id])
    },
    view: {
      enabled: true,
      onClick: (rowData) => toast.info(`Viewing user: ${rowData.name}`)
    },
    duplicate: {
      enabled: true,
      onClick: (rowData) => toast.info(`Duplicating user: ${rowData.name}`)
    }
  };

  // Floating actions
  const floatingActions = {
    add: { enabled: true, priority: 1 },
    edit: { enabled: (selectedRows) => selectedRows.length === 1, priority: 2 },
    delete: { enabled: (selectedRows) => selectedRows.length > 0, priority: 3 },
    export: { enabled: true, priority: 4 },
    sync: { enabled: true, priority: 5 }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Enhanced Grid System Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page demonstrates all features of the Enhanced Grid System including:
        caching, i18n, RTL support, context menus, floating actions, toolbar customization, and more.
      </Alert>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">Features Enabled</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label="✅ Caching" size="small" sx={{ m: 0.5 }} />
                <Chip label="✅ i18n Support" size="small" sx={{ m: 0.5 }} />
                <Chip label="✅ RTL Support" size="small" sx={{ m: 0.5 }} />
                <Chip label="✅ Context Menu" size="small" sx={{ m: 0.5 }} />
                <Chip label="✅ Floating Actions" size="small" sx={{ m: 0.5 }} />
                <Chip label="✅ Advanced Toolbar" size="small" sx={{ m: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="secondary">Test Instructions</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                • <strong>Right-click</strong> on any row to see context menu<br/>
                • <strong>Double-click</strong> on any row to trigger double-click handler<br/>
                • <strong>Select rows</strong> to enable/disable floating actions<br/>
                • <strong>Use toolbar</strong> to test search, filters, and actions<br/>
                • <strong>Try different languages</strong> using the language switcher
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ height: 600 }}>
        <EnhancedBaseGrid
          gridName="test-enhanced-grid"
          columns={columns}
          data={data}
          loading={loading}
          
          // Feature toggles
          enableCache={true}
          enableI18n={true}
          enableRTL={true}
          enableSelection={true}
          enableSorting={true}
          enableFiltering={true}
          enableColumnReordering={true}
          enableColumnResizing={true}
          
          // View options
          showStatsCards={true}
          showCardView={true}
          defaultViewMode="grid"
          gridCards={statsCards}
          totalCount={data.length}
          defaultPageSize={25}
          
          // Toolbar configuration
          toolbarConfig={toolbarConfig}
          customActions={customActions}
          
          // Context menu
          contextMenuActions={contextMenuActions}
          
          // Floating actions
          floatingActions={floatingActions}
          floatingPosition="bottom-right"
          floatingVariant="speedDial"
          
          // Event handlers
          onRefresh={handleRefresh}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExport={handleExport}
          onSync={handleSync}
          onSelectionChange={handleSelectionChange}
          onRowDoubleClick={handleRowDoubleClick}
          
          // Row configuration
          getRowId={(row) => row.id}
          
          // Error handling
          onError={(error) => {
            console.error('Grid error:', error);
            toast.error('Grid error occurred');
          }}
        />
      </Box>
    </Box>
  );
};

export default GridTestPage;
