import React, { useState } from 'react';
import { Box, Button, Tooltip, IconButton, Menu, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '@mui/material/styles';
import SettingsDialog from './CustomGridLyoutSettings';  
import { staticPrimaryKeys } from '../Layout/Constants';

const CustomGridToolbar = ({
  onRefresh,
  onFilter,
  onAdd,
  onEdit,
  onDelete,
  selectedCount,
  filterModel = { items: [] },
  columns,
  gridName,
  customFilters = [],
  onCustomFilterChange,
  currentCustomFilter,
  onError,
  succursaleOptions,
  currentSuccursale,
  onSuccursaleChange,
  sourceOptions,
  currentSource,
  onSourceChange
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const toolbarButtonStyle = {
    color: theme.palette.text.secondary,
    borderColor: theme.palette.divider,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.text.primary
    }
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsDialogOpen = () => {
    setSettingsDialogOpen(true);
    handleSettingsClose();
  };

  const handleRefresh = async () => {
    try {
      await onRefresh?.();
    } catch (error) {
      console.error('Error refreshing data:', error);
      onError?.(error);
    }
  };

  const handleCustomFilterChange = async (event) => {
    try {
      await onCustomFilterChange?.(event.target.value);
    } catch (error) {
      console.error('Error applying filter:', error);
      onError?.(error);
    }
  };

  // Dynamically get the primary key for the grid based on gridName
  const primaryKey = staticPrimaryKeys[gridName] || 'id'; // Default to 'id' if not found

  // Ensure filterModel.items is defined and not undefined
  const updatedFilterModel = {
    ...filterModel,
    items: (filterModel.items || []).map((filterItem) => {
      // Ensure the columnField is set (use primaryKey if missing)
      const columnField = filterItem.columnField || primaryKey; 

      // Ensure the operator is set (default to 'equals' if not provided)
      const operator = filterItem.operator || 'equals'; 

      return {
        ...filterItem,
        columnField,  // Ensure columnField is defined
        operator,      // Ensure operator is defined
        operatorValue: filterItem.operatorValue || '',  // Ensure operatorValue is set (empty string by default)
      };
    }),
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      p: 1
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Refresh Button */}
        <Tooltip title="Refresh Data">
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefresh}
            sx={toolbarButtonStyle}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Tooltip>

        {/* Succursale Filter */}
        {succursaleOptions && succursaleOptions.length > 0 && (
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 120 }}
          >
            <InputLabel>Succursale</InputLabel>
            <Select
              value={currentSuccursale}
              onChange={(e) => onSuccursaleChange?.(e.target.value)}
              label="Succursale"
              sx={toolbarButtonStyle}
            >
              {succursaleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Source Filter */}
        {sourceOptions && sourceOptions.length > 0 && (
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 120 }}
          >
            <InputLabel>Source</InputLabel>
            <Select
              value={currentSource}
              onChange={(e) => onSourceChange?.(e.target.value)}
              label="Source"
              sx={toolbarButtonStyle}
            >
              {sourceOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Custom Filter Dropdown */}
        {customFilters && customFilters.length > 0 && (
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 120 }}
          >
            <InputLabel>Custom Filter</InputLabel>
            <Select
              value={currentCustomFilter}
              onChange={handleCustomFilterChange}
              label="Custom Filter"
              sx={toolbarButtonStyle}
            >
              {customFilters.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Add, Edit, Delete Buttons */}
        <Tooltip title="Add Row">
          <Button
            variant="outlined"
            size="small"
            onClick={onAdd}
            sx={toolbarButtonStyle}
          >
            Add
          </Button>
        </Tooltip>

        <Tooltip title="Edit Row">
          <Button
            variant="outlined"
            size="small"
            onClick={onEdit}
            sx={toolbarButtonStyle}
            disabled={selectedCount === 0}
          >
            Edit
          </Button>
        </Tooltip>

        <Tooltip title="Delete Row">
          <Button
            variant="outlined"
            size="small"
            onClick={onDelete}
            sx={toolbarButtonStyle}
            disabled={selectedCount === 0}
          >
            Delete
          </Button>
        </Tooltip>

        {/* Grid Settings Icon */}
        <Tooltip title="Grid Settings">
          <IconButton
            size="small"
            onClick={handleSettingsClick}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        columns={columns}
        gridName={gridName}
        onSave={(newSettings) => {
          // Handle the saved settings (you might want to update the grid or state here)
          console.log('Saved Settings:', newSettings);
        }}
      />

      {/* Menu for settings */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSettingsClose}
      >
        <MenuItem onClick={handleSettingsDialogOpen}>
          Customize Columns
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CustomGridToolbar;
