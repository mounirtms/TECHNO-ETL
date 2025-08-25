// StandardGridTemplate - Template for all child grids
// This template provides a consistent structure for all grid components
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import UnifiedGrid from '../../common/UnifiedGrid';
import { toast } from 'react-toastify';

/**
 * StandardGridTemplate - Template for consistent grid structure
 * 
 * STRUCTURE:
 * 1. Imports (React, MUI, Icons, Services, Utils)
 * 2. Component Definition with JSDoc
 * 3. State Management (loading, data, filters, stats, dialogs)
 * 4. Data Fetching Functions
 * 5. Event Handlers (CRUD operations)
 * 6. Column Definitions
 * 7. Toolbar Configuration
 * 8. Context Menu Actions
 * 9. Stats Cards Configuration
 * 10. Filter Options
 * 11. UnifiedGrid Configuration
 * 12. Return JSX
 */

const StandardGridTemplate = () => {
  // ===== 1. STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ===== 2. DATA FETCHING =====
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const response = await apiService.getData();
      setData(response.data || []);
      
      // Calculate stats
      const total = response.data?.length || 0;
      const active = response.data?.filter(item => item.status === 'active').length || 0;
      const inactive = total - active;
      
      setStats({ total, active, inactive });
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== 3. EVENT HANDLERS =====
  const handleAdd = useCallback(() => {
    setSelectedRecord(null);
    setAddDialogOpen(true);
  }, []);

  const handleEdit = useCallback((records) => {
    if (records.length === 1) {
      setSelectedRecord(records[0]);
      setEditDialogOpen(true);
    } else {
      toast.warning('Please select exactly one record to edit');
    }
  }, []);

  const handleDelete = useCallback(async (records) => {
    if (records.length === 0) {
      toast.warning('Please select records to delete');
      return;
    }

    try {
      // Replace with actual delete API call
      await apiService.deleteRecords(records);
      toast.success(`Deleted ${records.length} record(s)`);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting records:', error);
      toast.error('Failed to delete records');
    }
  }, [fetchData]);

  const handleSync = useCallback(async () => {
    try {
      // Replace with actual sync API call
      await apiService.syncData();
      toast.success('Data synchronized successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error syncing data:', error);
      toast.error('Failed to sync data');
    }
  }, [fetchData]);

  const handleFilterChange = useCallback((newFilter) => {
    setCurrentFilter(newFilter);
    // Apply filter logic here
  }, []);

  // ===== 4. COLUMN DEFINITIONS =====
  const columns = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      sortable: true
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      sortable: true,
      filterable: true
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 180,
      valueFormatter: (params: any) => 
        params.value ? new Date(params.value).toLocaleString() : 'N/A'
    }
  ], []);

  // ===== 5. TOOLBAR CONFIGURATION =====
  const toolbarConfig = {
    showRefresh: true,
    showAdd: true,
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
      label: 'Add New',
      onClick: handleAdd,
      icon: <AddIcon />,
      color: 'primary',
      variant: 'contained'
    },
    {
      label: 'Sync Data',
      onClick: handleSync,
      icon: <SyncIcon />,
      color: 'secondary',
      variant: 'outlined'
    }
  ];

  // ===== 6. CONTEXT MENU ACTIONS =====
  const contextMenuActions = {
    view: {
      label: 'View Details',
      icon: <ViewIcon />,
      onClick: (row: any) => {
        setSelectedRecord(row as any);
        // Open details dialog
      }
    },
    edit: {
      label: 'Edit',
      icon: <EditIcon />,
      onClick: (row: any) => {
        setSelectedRecord(row as any);
        setEditDialogOpen(true);
      }
    },
    delete: {
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: (row: any) => handleDelete([row]),
      color: 'error'
    }
  };

  // ===== 7. STATS CARDS =====
  const statusCards = [
    {
      title: 'Total Records',
      value: stats.total,
      icon: <ViewIcon />,
      color: 'primary'
    },
    {
      title: 'Active',
      value: stats.active,
      icon: <AddIcon />,
      color: 'success'
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      icon: <DeleteIcon />,
      color: 'warning'
    }
  ];

  // ===== 8. FILTER OPTIONS =====
  const filterOptions = [
    { key: 'all', label: 'All Records', value: 'all' },
    { key: 'active', label: 'Active Only', value: 'active' },
    { key: 'inactive', label: 'Inactive Only', value: 'inactive' }
  ];

  // ===== 9. EFFECTS =====
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===== 10. RENDER =====
  return (
    <Box sx={{ height: '100%', width: '100%' } as any}>
      <UnifiedGrid
        gridName="StandardGrid"
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
        totalCount={stats.total}
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
        onRefresh={fetchData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSync={handleSync}
        onSelectionChange={(e: any) => (e: any) => (e: any) => (e: any) => (e: any) => (e: any) => (e: any) => (e: any) => setSelectedRows}
        onExport={(exportData, selectedRows) => {
          console.log('Exporting data:', exportData);
          toast.success(`Exported ${exportData.length} records`);
        }}
        
        // Row configuration
        getRowId={(row: any) => row.id}
        
        // Error handling
        onError={(error: any) => toast.error(error.message)}
      />

      {/* Add your dialogs and other components here */}
    </Box>
  );
};

export default StandardGridTemplate;
