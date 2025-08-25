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
  density: any,
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
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps: any,
        sx: { minWidth: 250, maxWidth: 350 }
      }}
    >
      {/* Density Settings */}
      <MenuItem>
        <ListItemIcon>
          <DensityIcon />
        </ListItemIcon>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {translate('density', 'Row Density')}
          </Typography>
          <FormControl size="small" fullWidth>
            <Select
              value={density}
              onChange={(e) => handleDensityChange(e.target.value)}
              variant: any,
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
      <MenuItem>
        <ListItemIcon>
          <ColumnsIcon />
        </ListItemIcon>
        <ListItemText primary={translate('columns', 'Columns')} />
      </MenuItem>

      {/* Column Visibility Controls */}
      {Object.keys(columnVisibility).length > 0 && (
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          {Object.entries(columnVisibility).map(([field: any: any, visible]: any: any) => (<MenuItem key={field} dense>
              <FormControlLabel
                control: any,
                    checked={visible}
                    onChange: any,
                        [field]: e.target.checked
                      });
                    }}
                    size: any,
                }
                label={field}
                sx={{ flex: 1, ml: 0 }}
              />
            </MenuItem>
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
          <ListItemIcon>
            <ExcelIcon />
          </ListItemIcon>
          <ListItemText primary={translate('exportExcel', 'Export to Excel')} />
        </MenuItem>
      )}

      {exportOptions.csv && (
        <MenuItem onClick={() => {
          onExport?.('csv');
          onClose();
        }}>
          <ListItemIcon>
            <CsvIcon />
          </ListItemIcon>
          <ListItemText primary={translate('exportCsv', 'Export to CSV')} />
        </MenuItem>
      )}

      {exportOptions.json && (
        <MenuItem onClick={() => {
          onExport?.('json');
          onClose();
        }}>
          <ListItemIcon>
            <JsonIcon />
          </ListItemIcon>
          <ListItemText primary={translate('exportJson', 'Export to JSON')} />
        </MenuItem>
      )}

      {(exportOptions.excel || exportOptions.csv || exportOptions.json) && <Divider />}

      {/* Additional Settings */}
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary={translate('moreSettings', 'More Settings')} />
      </MenuItem>

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
        <ListItemIcon>
          <VisibilityIcon />
        </ListItemIcon>
        <ListItemText primary={translate('resetDefaults', 'Reset to Defaults')} />
      </MenuItem>
    </Menu>
  );
};

export default GridToolbarSettings;
