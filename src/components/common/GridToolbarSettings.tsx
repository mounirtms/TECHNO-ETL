// GridToolbarSettings - Modular Settings Menu Component
import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Box,
  Typography
} from '@mui/material';
import {
  ViewColumn as ColumnsIcon,
  TableRows as DensityIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FileDownload as ExportIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  Code as JsonIcon
} from '@mui/icons-material';

/**
 * GridToolbarSettings - Settings menu component
 * Handles column visibility, density settings, and other grid configurations
 */
const GridToolbarSettings = ({
  anchorEl,
  open,
  onClose,
  columnVisibility = {},
  onColumnVisibilityChange,
  density
  onDensityChange,
  gridName,
  translate,
  exportOptions = {},
  onExport
}) => {
  const handleDensityChange = (newDensity) => {
    onDensityChange?.(newDensity);
    onClose();
  };

  const densityOptions = [
    { value: 'compact', label: translate('compact', 'Compact') },
    { value: 'standard', label: translate('standard', 'Standard') },
    { value: 'comfortable', label: translate('comfortable', 'Comfortable') }
  ];

  return (
    <Menu anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps
        sx: { minWidth: 250, maxWidth: 350 }
      }}>
      {/* Density Settings */}
      <MenuItem></
        <ListItemIcon>
          <DensityIcon /></DensityIcon>
        <Box sx={{ display: "flex", flex: 1 }}></
          <Typography variant="subtitle2" gutterBottom>
            {translate('density', 'Row Density')}
          </Typography>
          <FormControl size="small" fullWidth></
            <Select value={density}
              onChange={(e) => handleDensityChange(e.target.value)}
              variant="outlined"
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </MenuItem>

      <Divider />

      {/* Column Visibility */}
      <MenuItem></
        <ListItemIcon>
          <ColumnsIcon /></ColumnsIcon>
        <ListItemText primary={translate('columns', 'Columns')} /></ListItemText>

      {/* Column Visibility Controls */}
      {Object.keys(columnVisibility).length > 0 && (
        <Box sx={{ display: "flex", maxHeight: 200, overflow: 'auto' }}>
          {Object.entries(columnVisibility).map(([field, visible]: any) => (<MenuItem key={field} dense></
              <FormControlLabel control
                    checked={visible}
                    onChange
                        [field]: e.target.checked
                      });
                    }}
                    size="small"
                label={field}
                sx={{ display: "flex", flex: 1, ml: 0 }}
              /></FormControlLabel>
          ))}
        </Box>
      )}

      <Divider />

      {/* Export Options */}
      {exportOptions.excel && (
        <MenuItem onClick={() => {
          onExport?.('excel');
          onClose();
        }}>
          <ListItemIcon></
            <ExcelIcon /></ExcelIcon>
          <ListItemText primary={translate('exportExcel', 'Export to Excel')} /></ListItemText>
      )}

      {exportOptions.csv && (
        <MenuItem onClick={() => {
          onExport?.('csv');
          onClose();
        }}>
          <ListItemIcon></
            <CsvIcon /></CsvIcon>
          <ListItemText primary={translate('exportCsv', 'Export to CSV')} /></ListItemText>
      )}

      {exportOptions.json && (
        <MenuItem onClick={() => {
          onExport?.('json');
          onClose();
        }}>
          <ListItemIcon></
            <JsonIcon /></JsonIcon>
          <ListItemText primary={translate('exportJson', 'Export to JSON')} /></ListItemText>
      )}

      {(exportOptions.excel || exportOptions.csv || exportOptions.json) && <Divider />}

      {/* Additional Settings */}
      <MenuItem onClick={onClose}></
        <ListItemIcon>
          <SettingsIcon /></SettingsIcon>
        <ListItemText primary={translate('moreSettings', 'More Settings')} /></ListItemText>

      <Divider />

      {/* Reset to Defaults */}
      <MenuItem onClick={() => {
        // Reset column visibility to show all columns
        const resetVisibility = {};
        Object.keys(columnVisibility).forEach((field) => {
          resetVisibility[field] = true;
        });
        onColumnVisibilityChange?.(resetVisibility);
        onDensityChange?.('standard');
        onClose();
      }}>
        <ListItemIcon></
          <VisibilityIcon /></VisibilityIcon>
        <ListItemText primary={translate('resetDefaults', 'Reset to Defaults')} /></ListItemText>
    </Menu>
  );
};

export default GridToolbarSettings;
