import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  Sync as SyncIcon,
  Star as StarIcon,
  Archive as ArchiveIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import EnhancedBaseGrid from '../components/grids/EnhancedBaseGrid';

/**
 * Comprehensive example of the Enhanced Grid System
 * Demonstrates all features and customization options
 */
const EnhancedGridExample = () => {
  const gridRef = useRef();
  
  // Sample data
  const [data, setData] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      lastLogin: '2024-01-15',
      department: 'IT',
      salary: 75000,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'User',
      status: 'pending',
      lastLogin: '2024-01-14',
      department: 'HR',
      salary: 65000,
      rating: 4.2
    },
    {
      id: 3,
      name: 'Ahmed Al-Rashid',
      email: 'ahmed@example.com',
      role: 'Manager',
      status: 'active',
      lastLogin: '2024-01-16',
      department: 'Sales',
      salary: 85000,
      rating: 4.8
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [addDialog, setAddDialog] = useState(false);

  // Column definitions with rich features
  const columns = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      type: 'number'
    },
    {
      field: 'name',
      headerName: 'Full Name',
      width: 150,
      editable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{params.value}</Typography>
          {params.row.rating > 4.5 && <StarIcon color="warning" fontSize="small" />}
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      editable: true
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      type: 'singleSelect',
      valueOptions: ['Admin', 'Manager', 'User'],
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Admin' ? 'error' : params.value === 'Manager' ? 'warning' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'active' ? 'success' : 'warning'}
          size="small"
        />
      )
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 120
    },
    {
      field: 'salary',
      headerName: 'Salary',
      width: 120,
      type: 'number',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <StarIcon color="warning" fontSize="small" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 120,
      type: 'date',
      valueGetter: (params) => new Date(params.value)
    }
  ], []);

  // Stats cards for the grid
  const statsCards = useMemo(() => [
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
      title: 'Average Rating',
      value: (data.reduce((sum, user) => sum + user.rating, 0) / data.length).toFixed(1),
      color: 'info',
      icon: '⭐'
    }
  ], [data]);

  // Toolbar configuration
  const toolbarConfig = {
    showRefresh: true,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showExport: true,
    showImport: true,
    showSync: true,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showSelection: true
  };

  // Custom toolbar actions
  const customActions = [
    {
      label: 'Bulk Approve',
      icon: <CheckIcon />,
      onClick: (selectedRows) => handleBulkApprove(selectedRows),
      tooltip: 'Approve selected users',
      variant: 'contained',
      color: 'success',
      disabled: (selectedRows) => selectedRows.length === 0
    },
    {
      label: 'Archive',
      icon: <ArchiveIcon />,
      onClick: (selectedRows) => handleArchive(selectedRows),
      tooltip: 'Archive selected users',
      variant: 'outlined',
      color: 'warning',
      disabled: (selectedRows) => selectedRows.length === 0
    }
  ];

  // Context menu actions
  const contextMenuActions = {
    edit: { 
      enabled: (rowData) => rowData.status !== 'archived',
      onClick: (rowData) => handleEdit(rowData)
    },
    delete: { 
      enabled: (rowData) => rowData.role !== 'Admin',
      onClick: (rowData) => handleDelete([rowData.id])
    },
    duplicate: {
      enabled: true,
      onClick: (rowData) => handleDuplicate(rowData)
    },
    approve: {
      icon: CheckIcon,
      label: 'Approve',
      enabled: (rowData) => rowData.status === 'pending',
      onClick: (rowData) => handleApprove(rowData)
    },
    reject: {
      icon: CloseIcon,
      label: 'Reject',
      color: 'error',
      enabled: (rowData) => rowData.status === 'pending',
      onClick: (rowData) => handleReject(rowData)
    },
    promote: {
      icon: StarIcon,
      label: 'Promote',
      enabled: (rowData) => rowData.role === 'User',
      onClick: (rowData) => handlePromote(rowData)
    }
  };

  // Floating actions
  const floatingActions = {
    add: { 
      enabled: true,
      priority: 1
    },
    edit: { 
      enabled: (selectedRows) => selectedRows.length === 1,
      priority: 2
    },
    delete: { 
      enabled: (selectedRows) => selectedRows.length > 0,
      priority: 3
    },
    export: { 
      enabled: true,
      priority: 4
    },
    sync: { 
      enabled: true,
      priority: 5
    }
  };

  // Event handlers
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdd = useCallback(() => {
    setAddDialog(true);
  }, []);

  const handleEdit = useCallback((rowData) => {
    setEditDialog({ open: true, user: rowData });
  }, []);

  const handleDelete = useCallback((selectedRows) => {
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} user(s)?`)) {
      setData(prev => prev.filter(user => !selectedRows.includes(user.id)));
      toast.success(`Deleted ${selectedRows.length} user(s)`);
    }
  }, []);

  const handleExport = useCallback((selectedRows) => {
    const exportData = selectedRows.length > 0 
      ? data.filter(user => selectedRows.includes(user.id))
      : data;
    
    console.log('Exporting data:', exportData);
    toast.success(`Exported ${exportData.length} records`);
  }, [data]);

  const handleSync = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Data synchronized successfully');
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBulkApprove = useCallback((selectedRows) => {
    setData(prev => prev.map(user => 
      selectedRows.includes(user.id) 
        ? { ...user, status: 'active' }
        : user
    ));
    toast.success(`Approved ${selectedRows.length} user(s)`);
  }, []);

  const handleArchive = useCallback((selectedRows) => {
    setData(prev => prev.map(user => 
      selectedRows.includes(user.id) 
        ? { ...user, status: 'archived' }
        : user
    ));
    toast.success(`Archived ${selectedRows.length} user(s)`);
  }, []);

  const handleApprove = useCallback((rowData) => {
    setData(prev => prev.map(user => 
      user.id === rowData.id 
        ? { ...user, status: 'active' }
        : user
    ));
    toast.success(`Approved user: ${rowData.name}`);
  }, []);

  const handleReject = useCallback((rowData) => {
    setData(prev => prev.filter(user => user.id !== rowData.id));
    toast.success(`Rejected user: ${rowData.name}`);
  }, []);

  const handlePromote = useCallback((rowData) => {
    setData(prev => prev.map(user => 
      user.id === rowData.id 
        ? { ...user, role: 'Manager' }
        : user
    ));
    toast.success(`Promoted user: ${rowData.name}`);
  }, []);

  const handleDuplicate = useCallback((rowData) => {
    const newUser = {
      ...rowData,
      id: Math.max(...data.map(u => u.id)) + 1,
      name: `${rowData.name} (Copy)`,
      email: `copy_${rowData.email}`
    };
    setData(prev => [...prev, newUser]);
    toast.success(`Duplicated user: ${rowData.name}`);
  }, [data]);

  const handleSelectionChange = useCallback((selection) => {
    console.log('Selection changed:', selection);
  }, []);

  const handleRowDoubleClick = useCallback((params) => {
    handleEdit(params.row);
  }, [handleEdit]);

  // Save user (for dialogs)
  const handleSaveUser = useCallback((userData, isEdit = false) => {
    if (isEdit) {
      setData(prev => prev.map(user => 
        user.id === userData.id ? userData : user
      ));
      toast.success('User updated successfully');
    } else {
      const newUser = {
        ...userData,
        id: Math.max(...data.map(u => u.id)) + 1
      };
      setData(prev => [...prev, newUser]);
      toast.success('User added successfully');
    }
    setEditDialog({ open: false, user: null });
    setAddDialog(false);
  }, [data]);

  return (
    <Box sx={{ height: '100vh', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Enhanced Grid Example
      </Typography>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        This example demonstrates all features of the Enhanced Grid System including
        caching, i18n, RTL support, context menus, floating actions, and more.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => gridRef.current?.clearCache()}
        >
          Clear Cache
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            const stats = gridRef.current?.getCacheStats();
            console.log('Cache Stats:', stats);
            toast.info(`Cache: ${stats?.size || 0} entries, ${Math.round((stats?.memoryUsage || 0) / 1024)}KB`);
          }}
        >
          Show Cache Stats
        </Button>
        <Button
          variant="outlined"
          onClick={() => gridRef.current?.resetState()}
        >
          Reset Grid State
        </Button>
      </Box>

      <EnhancedBaseGrid
        ref={gridRef}
        gridName="enhanced-users-example"
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
        showCardView={true}
        showStatsCards={true}
        defaultViewMode="grid"
        
        // Stats and cards
        gridCards={statsCards}
        totalCount={data.length}
        
        // Pagination
        defaultPageSize={25}
        pageSizeOptions={[10, 25, 50, 100]}
        
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
        
        // Error handling
        onError={(error) => {
          console.error('Grid error:', error);
          toast.error('Grid error occurred');
        }}
      />

      {/* Edit Dialog */}
      <UserDialog
        open={editDialog.open}
        user={editDialog.user}
        onClose={() => setEditDialog({ open: false, user: null })}
        onSave={(userData) => handleSaveUser(userData, true)}
        title="Edit User"
      />

      {/* Add Dialog */}
      <UserDialog
        open={addDialog}
        user={null}
        onClose={() => setAddDialog(false)}
        onSave={(userData) => handleSaveUser(userData, false)}
        title="Add User"
      />
    </Box>
  );
};

// User Dialog Component
const UserDialog = ({ open, user, onClose, onSave, title }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'User',
    department: '',
    salary: 0,
    rating: 0
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'User',
        department: '',
        salary: 0,
        rating: 0
      });
    }
  }, [user]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      status: user?.status || 'pending',
      lastLogin: user?.lastLogin || new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            >
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Salary"
            type="number"
            value={formData.salary}
            onChange={(e) => setFormData(prev => ({ ...prev, salary: Number(e.target.value) }))}
            fullWidth
          />
          <TextField
            label="Rating"
            type="number"
            inputProps={{ min: 0, max: 5, step: 0.1 }}
            value={formData.rating}
            onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedGridExample;
