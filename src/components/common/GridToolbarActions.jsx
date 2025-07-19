// GridToolbarActions - Modular Action Buttons Component
import React from 'react';
import {
  Box,
  Button,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Sync as SyncIcon,
  Autorenew as AutorenewIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * GridToolbarActions - Action buttons section of the toolbar
 * Handles all action buttons like Add, Edit, Delete, Sync, Export, etc.
 */
const GridToolbarActions = ({
  config,
  selectedCount,
  hasSelection,
  onAdd,
  onEdit,
  onDelete,
  onSync,
  onExport,
  onImport,
  customActions = [],
  loading = false,
  buttonSize = 'medium',
  spacing = 1,
  translate,
  
  // Custom action handlers from CustomGridToolbar
  onSyncStocksHandler,
  onSyncAllHandler,
  canInfo,
  onInfo
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing }}>
      {/* Add Button */}
      {config.showAdd && (
        <Tooltip title={translate('add', 'Add New')}>
          <Button
            startIcon={<AddIcon />}
            onClick={onAdd}
            variant="contained"
            size={buttonSize}
            disabled={loading}
          >
            {config.compact ? '' : translate('add', 'Add')}
          </Button>
        </Tooltip>
      )}

      {/* Edit Button */}
      {config.showEdit && (
        <Tooltip title={translate('edit', 'Edit Selected')}>
          <Button
            startIcon={<EditIcon />}
            onClick={onEdit}
            variant="outlined"
            size={buttonSize}
            disabled={!hasSelection || loading}
          >
            {config.compact ? '' : translate('edit', 'Edit')}
          </Button>
        </Tooltip>
      )}

      {/* Delete Button */}
      {config.showDelete && (
        <Tooltip title={translate('delete', 'Delete Selected')}>
          <Button
            startIcon={<DeleteIcon />}
            onClick={onDelete}
            variant="outlined"
            color="error"
            size={buttonSize}
            disabled={!hasSelection || loading}
          >
            {config.compact ? '' : translate('delete', 'Delete')}
          </Button>
        </Tooltip>
      )}

      {/* Sync Button */}
      {config.showSync && (
        <Tooltip title={translate('sync', 'Sync Data')}>
          <Button
            startIcon={<SyncIcon />}
            onClick={onSync}
            variant="outlined"
            color="secondary"
            size={buttonSize}
            disabled={loading}
          >
            {config.compact ? '' : translate('sync', 'Sync')}
          </Button>
        </Tooltip>
      )}

      {/* Export Button */}
      {config.showExport && (
        <Tooltip title={translate('export', 'Export Data')}>
          <Button
            startIcon={<ExportIcon />}
            onClick={onExport}
            variant="outlined"
            size={buttonSize}
            disabled={loading}
          >
            {config.compact ? '' : translate('export', 'Export')}
          </Button>
        </Tooltip>
      )}

      {/* Import Button */}
      {config.showImport && (
        <Tooltip title={translate('import', 'Import Data')}>
          <Button
            startIcon={<ImportIcon />}
            onClick={onImport}
            variant="outlined"
            size={buttonSize}
            disabled={loading}
          >
            {config.compact ? '' : translate('import', 'Import')}
          </Button>
        </Tooltip>
      )}

      {/* Info Button */}
      {canInfo && (
        <Tooltip title={translate('info', 'Information')}>
          <Button
            startIcon={<InfoIcon />}
            onClick={onInfo}
            variant="outlined"
            size={buttonSize}
            disabled={loading}
          >
            {config.compact ? '' : translate('info', 'Info')}
          </Button>
        </Tooltip>
      )}

      {/* Sync Stocks Button (from CustomGridToolbar) */}
      {typeof onSyncStocksHandler === 'function' && (
        <Tooltip title={translate('syncStocks', 'Mark changed stocks for sync')}>
          <Button
            variant="outlined"
            size={buttonSize}
            onClick={onSyncStocksHandler}
            startIcon={<AutorenewIcon />}
            disabled={loading}
          >
            {config.compact ? '' : translate('syncStocks', 'Mark Changed Stocks')}
          </Button>
        </Tooltip>
      )}

      {/* Sync All Handler (from CustomGridToolbar) */}
      {typeof onSyncAllHandler === 'function' && (
        <Tooltip title={translate('syncAll', 'Sync all data')}>
          <Button
            variant="contained"
            color="secondary"
            size={buttonSize}
            onClick={onSyncAllHandler}
            startIcon={<SyncIcon />}
            disabled={loading}
          >
            {config.compact ? '' : translate('syncAll', 'Sync All')}
          </Button>
        </Tooltip>
      )}

      {/* Custom Actions */}
      {customActions.map((action, index) => {
        // Safely render icon - ensure it's a valid React element
        const renderIcon = () => {
          if (!action.icon) return null;

          // Handle Material-UI icon components (functions)
          if (typeof action.icon === 'function') {
            const IconComponent = action.icon;
            return <IconComponent />;
          }

          // Handle React elements
          if (React.isValidElement(action.icon)) {
            return action.icon;
          }

          // Invalid icon type - return null to avoid prop type warning
          return null;
        };

        return (
          <Tooltip key={index} title={action.tooltip || action.label}>
            <Button
              startIcon={renderIcon()}
              onClick={action.onClick}
              variant={action.variant || 'outlined'}
              color={action.color || 'primary'}
              size={buttonSize}
              disabled={action.disabled || loading}
            >
              {config.compact ? '' : action.label}
            </Button>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default GridToolbarActions;
