// GridToolbarActions - Modular Action Buttons Component
import React from 'react';
import {
  Box,
  Button
} from '@mui/material';
import TooltipWrapper from './TooltipWrapper';
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
  mdmStocks,
  
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
        <TooltipWrapper title={translate('add', 'Add New')} disabled={loading}>
          <Button
            startIcon={<AddIcon />}
            onClick={onAdd}
            variant="contained"
            size={buttonSize}
            disabled={loading}
          >
            {config.compact ? '' : translate('add', 'Add')}
          </Button>
        </TooltipWrapper>
      )}

      {/* Edit Button */}
      {config.showEdit && (
        <TooltipWrapper title={translate('edit', 'Edit Selected')} disabled={!hasSelection || loading}>
          <Button
            startIcon={<EditIcon />}
            onClick={onEdit}
            variant="outlined"
            size={buttonSize}
            disabled={!hasSelection || loading}
          >
            {config.compact ? '' : translate('edit', 'Edit')}
          </Button>
        </TooltipWrapper>
      )}

      {/* Delete Button */}
      {config.showDelete && (
        <TooltipWrapper title={translate('delete', 'Delete Selected')} disabled={!hasSelection || loading}>
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
        </TooltipWrapper>
      )}

      {/* Sync Button */}
      {config.showSync && (
        <TooltipWrapper title={translate('sync', 'Sync Data')} disabled={loading}>
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
        </TooltipWrapper>
      )}

       

      {/* Import Button */}
      {config.showImport && (
        <TooltipWrapper title={translate('import', 'Import Data')} disabled={loading}>
          <Button
            startIcon={<ImportIcon />}
            onClick={onImport}
            variant="outlined"
            size={buttonSize}
            disabled={loading}
          >
            {config.compact ? '' : translate('import', 'Import')}
          </Button>
        </TooltipWrapper>
      )}

      {/* Info Button */}
      {canInfo && (
        <TooltipWrapper title={translate('info', 'Information')} disabled={loading}>
          <Button
            startIcon={<InfoIcon />}
            onClick={onInfo}
            variant="outlined"
            size={buttonSize}
            disabled={loading}
          >
            {config.compact ? '' : translate('info', 'Info')}
          </Button>
        </TooltipWrapper>
      )}

      {/* Export Button */}
      {config.showExport && (
        <TooltipWrapper title={translate('export', 'Export Data')} disabled={loading}>
          <Button
            startIcon={<ExportIcon />}
            onClick={onExport}
            variant="outlined"
            size={buttonSize}
            disabled={loading}
          >
            {config.compact ? '' : translate('export', 'Export')}
          </Button>
        </TooltipWrapper>
      )}

      {/* Sync Stocks Button - Only for MDM grids */}
      {mdmStocks && typeof onSyncStocksHandler === 'function' && (
        <TooltipWrapper title={translate('syncStocks', 'Mark changed stocks for sync')} disabled={loading}>
          <Button
            variant="outlined"
            color="warning"
            size={buttonSize}
            onClick={onSyncStocksHandler}
            startIcon={<AutorenewIcon />}
            disabled={loading}
          >
            {config.compact ? '' : translate('syncStocks', 'Mark Changed Stocks')}
          </Button>
        </TooltipWrapper>
      )}

      {/* Sync All Handler - Only for MDM grids */}
      {mdmStocks && typeof onSyncAllHandler === 'function' && (
        <TooltipWrapper title={translate('syncAll', 'Sync all data')} disabled={loading}>
          <Button
            variant="outlined"
            color="secondary"
            size={buttonSize}
            onClick={onSyncAllHandler}
            startIcon={<SyncIcon />}
            disabled={loading}
          >
            {config.compact ? '' : translate('syncAll', 'Sync All')}
          </Button>
        </TooltipWrapper>
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
          <TooltipWrapper 
            key={index} 
            title={action.tooltip || action.label}
            disabled={action.disabled || loading}
          >
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
          </TooltipWrapper>
        );
      })}
    </Box>
  );
};

export default GridToolbarActions;
