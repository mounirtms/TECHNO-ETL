import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import CustomGridToolbar from '../../common/CustomGridToolbar';
import GridSettings from '../../common/GridSettings';
import GridErrorBoundary from '../../common/GridErrorBoundary';
import { useSettings } from '../../../contexts/SettingsContext';

/**
 * BaseMagentoGrid - Reusable base component for all Magento grids
 * Implements DRY principles and provides common functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Grid title
 * @param {Array} props.columns - Grid columns configuration
 * @param {Array} props.rows - Grid data rows
 * @param {Function} props.onRowClick - Row click handler
 * @param {Function} props.onSelectionChange - Selection change handler
 * @param {Function} props.onRefresh - Refresh data handler
 * @param {Function} props.onExport - Export data handler
 * @param {Function} props.onImport - Import data handler
 * @param {Object} props.toolbarConfig - Toolbar configuration
 * @param {Object} props.gridConfig - Additional grid configuration
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {React.Component} props.customToolbar - Custom toolbar component
 * @param {Object} props.bulkActions - Bulk action configuration
 */
const BaseMagentoGrid = ({
  title,
  columns = [],
  rows = [],
  onRowClick,
  onSelectionChange,
  onRefresh,
  onExport,
  onImport,
  onBulkAction,
  toolbarConfig = {},
  gridConfig = {},
  loading = false,
  error = null,
  customToolbar: CustomToolbar,
  bulkActions = [],
  enableSettings = true,
  enableExport = true,
  enableImport = false,
  enableBulkActions = true,
  children,
  ...otherProps
}) => {
  const theme = useTheme();
  const { settings } = useSettings();
  const [selectedRows, setSelectedRows] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  // Grid state management
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: settings?.gridSettings?.pageSize || 25,
  });
  
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });

  // Memoized grid configuration
  const gridProps = useMemo(() => ({
    rows,
    columns,
    loading,
    paginationModel,
    onPaginationModelChange: setPaginationModel,
    sortModel,
    onSortModelChange: setSortModel,
    filterModel,
    onFilterModelChange: setFilterModel,
    checkboxSelection: enableBulkActions,
    disableRowSelectionOnClick: !enableBulkActions,
    rowSelectionModel: selectedRows,
    onRowSelectionModelChange: (newSelection) => {
      setSelectedRows(newSelection);
      onSelectionChange?.(newSelection);
    },
    onRowClick: (params, event) => {
      if (!event.defaultPrevented) {
        onRowClick?.(params);
      }
    },
    pageSizeOptions: [10, 25, 50, 100],
    density: settings?.gridSettings?.density || 'standard',
    ...gridConfig
  }), [
    rows, 
    columns, 
    loading, 
    paginationModel, 
    sortModel, 
    filterModel, 
    selectedRows, 
    enableBulkActions, 
    onRowClick, 
    onSelectionChange, 
    settings,
    gridConfig
  ]);

  // Default toolbar configuration
  const defaultToolbarConfig = {
    title,
    enableRefresh: !!onRefresh,
    enableExport,
    enableImport,
    enableSettings,
    enableBulkActions: enableBulkActions && selectedRows.length > 0,
    selectedCount: selectedRows.length,
    bulkActions,
    onRefresh: handleRefresh,
    onExport: handleExport,
    onImport: handleImport,
    onBulkAction: handleBulkAction,
    onSettings: () => setSettingsOpen(true),
    ...toolbarConfig
  };

  // Event handlers
  function handleRefresh() {
    if (onRefresh) {
      onRefresh();
      showSnackbar('Data refreshed successfully', 'success');
    }
  }

  function handleExport() {
    if (onExport) {
      onExport(selectedRows.length > 0 ? selectedRows : null);
      showSnackbar('Export started', 'info');
    }
  }

  function handleImport() {
    if (onImport) {
      onImport();
    }
  }

  function handleBulkAction(actionType) {
    if (onBulkAction && selectedRows.length > 0) {
      onBulkAction(actionType, selectedRows);
      setSelectedRows([]);
      showSnackbar(`Bulk action "${actionType}" executed successfully`, 'success');
    }
  }

  function showSnackbar(message, severity = 'info') {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }

  // Error handling
  if (error) {
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Unable to load {title.toLowerCase()}. Please try refreshing the page.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <GridErrorBoundary>
      <Paper 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Custom Toolbar or Default Toolbar */}
        {CustomToolbar ? (
          <CustomToolbar 
            {...defaultToolbarConfig}
            selectedRows={selectedRows}
            onClearSelection={() => setSelectedRows([])}
          />
        ) : (
          <CustomGridToolbar {...defaultToolbarConfig} />
        )}
        
        <Divider />
        
        {/* Additional content above grid */}
        {children && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            {children}
          </Box>
        )}
        
        {/* Main Data Grid */}
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <DataGrid
            {...gridProps}
            sx={{
              border: 0,
              '& .MuiDataGrid-main': {
                borderRadius: 0,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? theme.palette.grey[800] 
                  : theme.palette.grey[100],
                borderBottom: `2px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '& .MuiDataGrid-row.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                '&:hover': {
                  backgroundColor: theme.palette.action.selected,
                },
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? theme.palette.grey[900] 
                  : theme.palette.grey[50],
              },
            }}
            {...otherProps}
          />
        </Box>

        {/* Grid Settings Dialog */}
        {enableSettings && (
          <GridSettings
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            columns={columns}
            gridTitle={title}
          />
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </GridErrorBoundary>
  );
};

export default BaseMagentoGrid;