import React, { useState } from 'react';
import { Box, Button, IconButton, Menu, MenuItem, Select, FormControl, InputLabel, Checkbox, Typography } from '@mui/material';
import TooltipWrapper from './TooltipWrapper';
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/Sync';
import SettingsIcon from '@mui/icons-material/Settings';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useTheme } from '@mui/material/styles';
// import SettingsDialog from './CustomGridLayoutSettings'; // Temporarily disabled
import { staticPrimaryKeys } from '../Layout/Constants';

/**
 * CustomGridToolbar - DEPRECATED
 * This component is being phased out in favor of UnifiedGridToolbar
 * Use UnifiedGridToolbar for new implementations
 *
 * @deprecated Use UnifiedGridToolbar instead
 */
const CustomGridToolbar = ({
  onRefresh,
  onFilter,
  canAdd,
  canEdit,
  canSync,
  canSyncAll,
  canDelete,
  onAdd,
  onEdit,
  onDelete,
  selectedCount,
  filterModel = { items: [] },
  columns,
  gridName,
  customFilters
  onSyncAllHandler,
  onCustomFilterChange,
  currentCustomFilter,
  onError,
  succursaleOptions,
  currentSuccursale,
  onSuccursaleChange,
  sourceOptions,
  currentSource,
  onSourceChange,
  onSyncHandler,
  showChangedOnly,
  setShowChangedOnly,
  onSyncStocksHandler, // New handler for Sync Stocks
  canInfo,
  onInfo
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Style for toolbar buttons
  const toolbarButtonStyle = {
    color: theme.palette.text.secondary,
    borderColor: theme.palette.divider,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.text.primary,
    },
  };


  // Open settings menu
  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  // Close settings menu
  const handleSettingsClose = () => {
    setAnchorEl(null);
  };
  // Open settings dialog
  const handleSettingsDialogOpen = () => {
    setSettingsDialogOpen(true);
    handleSettingsClose();
  };
  // Refresh grid data
  const handleRefresh = async () => {
    try {
      await onRefresh?.();
    } catch(error: any) {
      console.error('Error refreshing data:', error);
      onError?.(error);
    }
  };
  // Handle custom filter change
  const handleCustomFilterChange = async(event) => {
    try {
      await onCustomFilterChange?.(event.target?.value);
    } catch(error: any) {
      console.error('Error applying filter:', error);
      onError?.(error);
    }
  };



  // --- Toolbar Layout ---
  return(<Box sx={{ display: "flex", display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', p: 1 }}>
      <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Refresh Button */}
        <TooltipWrapper title="Refresh Data">
          <Button variant="outlined" size="small" onClick={handleRefresh} sx={toolbarButtonStyle} startIcon={<RefreshIcon />}>
            Refresh
          </Button>
        </TooltipWrapper>

      


        {/* Succursale Filter */}
        {succursaleOptions?.length > 0 && (
          <FormControl variant="outlined" size="small" sx={{ display: "flex", minWidth: 120 }}>
            <InputLabel>Succursale</InputLabel>
            <Select value={currentSuccursale} onChange={(e) => onSuccursaleChange?.(e.target?.value)} label="Succursale" sx={toolbarButtonStyle}>
              {succursaleOptions.map((option: any: any: any: any) => (
                <MenuItem key={option?.value} value={option?.value}>
                  {option?.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
          {/* Source Filter */}
        {sourceOptions?.length > 0 && (<FormControl variant="outlined" size="small" sx={{ display: "flex", minWidth: 120 }}>
            <InputLabel>Source</InputLabel>
            <Select value={currentSource} onChange={(e) => onSourceChange?.(e.target?.value)} label="Source" sx={toolbarButtonStyle}>
              {sourceOptions.map((option: any: any: any: any) => (
                <MenuItem key={option?.value} value={option?.value}>
                  {option?.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Inventory Changes Only Checkbox - right after Source filter */}
        {typeof showChangedOnly !== 'undefined' && typeof setShowChangedOnly === 'function' && canSyncAll && (<TooltipWrapper title="Show only products with inventory changes">
            <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', pl: 1 }}>
              <Checkbox
                checked={showChangedOnly}
                onChange={(e) => setShowChangedOnly(e.target.checked)}
                color
                inputProps={{ 'aria-label': 'Show only products with inventory changes' }}
              />
              <Typography variant="body2" sx={{ display: "flex", whiteSpace: 'nowrap' }}>
                Inventory Changes Only
              </Typography>
            </Box>
          </TooltipWrapper>
        )}
        {/* Custom Filter Dropdown */}
        {customFilters?.length > 0 && (<FormControl variant="outlined" size="small" sx={{ display: "flex", minWidth: 120 }}>
            <InputLabel>Custom Filter</InputLabel>
            <Select value={currentCustomFilter} onChange={(e) => handleCustomFilterChange} label="Custom Filter" sx={toolbarButtonStyle}>
              {customFilters.map((option: any: any: any: any) => (
                <MenuItem key={option?.value} value={option?.value}>
                  {option?.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* --- Action Buttons: Add, Edit, Delete, Sync Stocks, Sync, Settings --- */}
      <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Add Row Button */}
        {canAdd && (
          <TooltipWrapper title="Add Row">
            <Button variant="outlined" size="small" onClick={onAdd} sx={toolbarButtonStyle}>
              Add
            </Button>
          </TooltipWrapper>
        )}
        {/* Edit Row Button */}
        {canEdit && (
          <TooltipWrapper title="Edit Row" disabled={selectedCount ===0}>
            <Button variant="outlined" size="small" onClick={onEdit} sx={toolbarButtonStyle} disabled={selectedCount ===0}>
              Edit
            </Button>
          </TooltipWrapper>
        )}
        {/* Delete Row Button */}
        {canDelete && (
          <TooltipWrapper title="Delete Row" disabled={selectedCount ===0}>
            <Button variant="outlined" size="small" onClick={onDelete} sx={toolbarButtonStyle} disabled={selectedCount ===0}>
              Delete
            </Button>
          </TooltipWrapper>
        )}
        {/* Sync Stocks Button (mark changed) */}
        {typeof onSyncStocksHandler === 'function' && canSyncAll && (
          <TooltipWrapper title="Mark changed stocks for sync (selected source)">
            <Button
              variant="body2"
              onClick={onSyncStocksHandler}
              sx={toolbarButtonStyle}
              startIcon={<AutorenewIcon />}
            >
              Mark Changed Stocks
            </Button>
          </TooltipWrapper>
        )}

        {/* Sync All Stock Button (no source) */}
        {typeof onSyncAllStockHandler === 'function' && (
          <TooltipWrapper title="Sync all stock (all sources)">
            <Button
              variant="body2"
              onClick={onSyncAllStockHandler}
              sx={toolbarButtonStyle}
              startIcon={<SyncIcon />}
            >
              Sync All Stock
            </Button>
          </TooltipWrapper>
        )}
        {/* Sync Selected Button */}
        {canSync && (
          <TooltipWrapper title="Sync Selected Rows" disabled={selectedCount ===0}>
            <Button
              variant="body2"
              onClick={onSyncHandler}
              sx={toolbarButtonStyle}
              disabled={selectedCount ===0}
              startIcon={<SyncIcon />}
            >
              Sync
            </Button>
          </TooltipWrapper>
        )}
        {/* Sync All Button */}
        {canSyncAll && (
          <TooltipWrapper title="Sync All Items for Source">
            <Button
              variant="body2"
              onClick={onSyncAllHandler}
              sx={toolbarButtonStyle}
              startIcon={<SyncIcon />}
            >
              Sync All
            </Button>
          </TooltipWrapper>
        )}
        {/* Grid Settings Icon */}
        <TooltipWrapper title="Grid Settings">
          <IconButton size="small" onClick={handleSettingsClick} sx={{ display: "flex", color: theme.palette.text.secondary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
            <SettingsIcon />
          </IconButton>
        </TooltipWrapper>
        {/* Info Button - rightmost */}
        {canInfo && (
          <TooltipWrapper title="Product Info">
            <Button variant="outlined" size="small" onClick={onInfo} sx={{ display: "flex", ...toolbarButtonStyle, minWidth: 40, px: 1.5, ml: 1 }}>
              Info
            </Button>
          </TooltipWrapper>
        )}
      </Box>

      {/* --- Settings Dialog and Menu --- */}
      {/* Settings Dialog temporarily disabled */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleSettingsClose}>
        <MenuItem onClick={() => console.log('Settings temporarily disabled')}>Customize Columns (Disabled)</MenuItem>
      </Menu>
    </Box>
  );
};

export default CustomGridToolbar;
