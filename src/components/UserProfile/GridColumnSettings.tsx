import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Switch, FormControlLabel, Select, MenuItem,
  FormControl, InputLabel, Divider, Button, Alert, Snackbar,
  Grid, Card, CardContent, CardHeader, Slider, TextField,
  Accordion, AccordionSummary, AccordionDetails, Chip, List,
  ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox,
  FormGroup, Tooltip, Autocomplete
} from '@mui/material';
import {
  Settings, GridView, Visibility, VisibilityOff, DragIndicator,
  Add, Delete, Edit, Save, RestoreFromTrash, ExpandMore,
  FilterList, Search, ViewColumn, Reorder
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTheme } from '@mui/material/styles';

const GridColumnSettings: React.FC<any> = ({ user, onSettingsChange }) => {
  const theme = useTheme();
  
  // Grid types and their default columns
  const gridTypes = {
    mdm: {
      name: 'MDM Products',
      defaultColumns: [
        { field: 'sku', headerName: 'SKU', width: 150, visible: true, pinned: false },
        { field: 'name', headerName: 'Product Name', width: 200, visible: true, pinned: false },
        { field: 'price', headerName: 'Price', width: 120, visible: true, pinned: false },
        { field: 'quantity', headerName: 'Quantity', width: 100, visible: true, pinned: false },
        { field: 'category', headerName: 'Category', width: 150, visible: true, pinned: false },
        { field: 'status', headerName: 'Status', width: 100, visible: true, pinned: false },
        { field: 'source', headerName: 'Source', width: 120, visible: true, pinned: false },
        { field: 'lastUpdated', headerName: 'Last Updated', width: 150, visible: true, pinned: false }
      ]
    },
    magentoProducts: {
      name: 'Magento Products',
      defaultColumns: [
        { field: 'sku', headerName: 'SKU', width: 150, visible: true, pinned: true },
        { field: 'name', headerName: 'Product Name', width: 250, visible: true, pinned: false },
        { field: 'price', headerName: 'Price', width: 120, visible: true, pinned: false },
        { field: 'quantity', headerName: 'Stock', width: 100, visible: true, pinned: false },
        { field: 'status', headerName: 'Status', width: 100, visible: true, pinned: false },
        { field: 'type', headerName: 'Type', width: 120, visible: true, pinned: false },
        { field: 'visibility', headerName: 'Visibility', width: 120, visible: false, pinned: false },
        { field: 'weight', headerName: 'Weight', width: 100, visible: false, pinned: false },
        { field: 'createdAt', headerName: 'Created', width: 150, visible: true, pinned: false }
      ]
    },
    customers: {
      name: 'Customers',
      defaultColumns: [
        { field: 'id', headerName: 'ID', width: 80, visible: true, pinned: true },
        { field: 'firstName', headerName: 'First Name', width: 150, visible: true, pinned: false },
        { field: 'lastName', headerName: 'Last Name', width: 150, visible: true, pinned: false },
        { field: 'email', headerName: 'Email', width: 200, visible: true, pinned: false },
        { field: 'phone', headerName: 'Phone', width: 150, visible: true, pinned: false },
        { field: 'group', headerName: 'Group', width: 120, visible: true, pinned: false },
        { field: 'orders', headerName: 'Orders', width: 100, visible: true, pinned: false },
        { field: 'totalSpent', headerName: 'Total Spent', width: 120, visible: true, pinned: false },
        { field: 'lastLogin', headerName: 'Last Login', width: 150, visible: false, pinned: false }
      ]
    },
    sources: {
      name: 'Sources',
      defaultColumns: [
        { field: 'code', headerName: 'Code', width: 120, visible: true, pinned: true },
        { field: 'name', headerName: 'Name', width: 200, visible: true, pinned: false },
        { field: 'enabled', headerName: 'Enabled', width: 100, visible: true, pinned: false },
        { field: 'priority', headerName: 'Priority', width: 100, visible: true, pinned: false },
        { field: 'country', headerName: 'Country', width: 120, visible: true, pinned: false },
        { field: 'region', headerName: 'Region', width: 120, visible: true, pinned: false },
        { field: 'postcode', headerName: 'Postcode', width: 100, visible: false, pinned: false },
        { field: 'contactInfo', headerName: 'Contact', width: 150, visible: false, pinned: false }
      ]
    },
    orders: {
      name: 'Orders',
      defaultColumns: [
        { field: 'incrementId', headerName: 'Order #', width: 120, visible: true, pinned: true },
        { field: 'status', headerName: 'Status', width: 120, visible: true, pinned: false },
        { field: 'customerName', headerName: 'Customer', width: 180, visible: true, pinned: false },
        { field: 'grandTotal', headerName: 'Total', width: 120, visible: true, pinned: false },
        { field: 'createdAt', headerName: 'Date', width: 150, visible: true, pinned: false },
        { field: 'items', headerName: 'Items', width: 80, visible: true, pinned: false },
        { field: 'paymentMethod', headerName: 'Payment', width: 120, visible: false, pinned: false },
        { field: 'shippingMethod', headerName: 'Shipping', width: 120, visible: false, pinned: false }
      ]
    }
  };

  const [columnSettings, setColumnSettings] = useState({});
  const [filterPresets, setFilterPresets] = useState({});
  const [selectedGridType, setSelectedGridType] = useState('mdm');
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const savedColumnSettings = localStorage.getItem(`columnSettings_${user?.id}`);
    const savedFilterPresets = localStorage.getItem(`filterPresets_${user?.id}`);
    
    if(savedColumnSettings) {
      setColumnSettings(JSON.parse(savedColumnSettings));
    } else {
      // Initialize with default settings
      const defaultSettings = {};
      Object.keys(gridTypes).forEach((gridType) => {
        defaultSettings[gridType] = {
          columns: gridTypes[gridType].defaultColumns,
          density: 'standard',
          grouping: false,
          autoHeight: false
        };
      });
      setColumnSettings(defaultSettings);
    }

    if(savedFilterPresets) {
      setFilterPresets(JSON.parse(savedFilterPresets));
    }
  }, [user]);

  const handleColumnVisibilityChange = (gridType, columnField, visible) => {
    setColumnSettings(prev => ({ ...prev,
      [gridType]: { ...prev[gridType],
        columns: prev[gridType]?.columns?.map((col: any: any: any: any) => 
          col.field = ==columnField ? { ...col, visible } : col
        ) || []
      }
    }));
  };

  const handleColumnWidthChange = (gridType, columnField, width) => {
    setColumnSettings(prev => ({ ...prev,
      [gridType]: { ...prev[gridType],
        columns: prev[gridType]?.columns?.map((col: any: any: any: any) => 
          col.field = ==columnField ? { ...col, width } : col
        ) || []
      }
    }));
  };

  const handleColumnPinChange = (gridType, columnField, pinned) => {
    setColumnSettings(prev => ({ ...prev,
      [gridType]: { ...prev[gridType],
        columns: prev[gridType]?.columns?.map((col: any: any: any: any) => 
          col.field = ==columnField ? { ...col, pinned } : col
        ) || []
      }
    }));
  };

  const handleColumnReorder = (gridType, result) => {
    if (!result.destination) return;

    const columns = Array.from(columnSettings[gridType]?.columns || []);
    const [reorderedColumn] = columns.splice(result.source.index, 1);
    columns.splice(result.destination.index, 0, reorderedColumn);

    setColumnSettings(prev => ({ ...prev,
      [gridType]: { ...prev[gridType],
        columns
      }
    }));
  };

  const handleDensityChange = (gridType, density) => {
    setColumnSettings(prev => ({ ...prev,
      [gridType]: { ...prev[gridType],
        density
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      localStorage.setItem(`columnSettings_${user?.id}`, JSON.stringify(columnSettings));
      localStorage.setItem(`filterPresets_${user?.id}`, JSON.stringify(filterPresets));
      
      if(onSettingsChange) {
        onSettingsChange({ columnSettings, filterPresets });
      }
      
      setShowSuccess(true);
    } catch(error: any) {
      console.error('Failed to save column settings:', error);
      setShowError(true);
    }
  };

  const handleResetToDefaults = (gridType) => {
    setColumnSettings(prev => ({ ...prev,
      [gridType]: {
        columns: gridTypes[gridType].defaultColumns,
        density: 'standard',
        grouping: false,
        autoHeight: false
      }
    }));
  };

  const currentColumns = columnSettings[selectedGridType]?.columns || [];
  const currentDensity = columnSettings[selectedGridType]?.density || 'standard';

  return(<Box sx={{ display: "flex", p: 3 } as any}>
      {/* Header */}
      <Box sx={{ display: "flex", mb: 4 } as any}>
        <Typography variant="h5" sx={{ display: "flex", mb: 1, fontWeight: 600 } as any}>
          Grid Columns & Display Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize column visibility, order, and display preferences for each grid
        </Typography>
      </Box>

      {/* Grid Type Selector */}
      <Card sx={{ display: "flex", mb: 3 } as any}>
        <CardContent>
          <FormControl fullWidth sx={{ display: "flex", mb: 2 } as any}>
            <InputLabel>Select Grid Type</InputLabel>
            <Select
              value={selectedGridType}
              onChange={(e) => setSelectedGridType(e.target.value)}
              label
              {Object.entries(gridTypes).map(([key: any config]: any: any: any: any) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 } as any}>
                    <GridView fontSize="small" />
                    {config.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Density Settings */}
          <Box sx={{ display: "flex", mb: 3 } as any}>
            <Typography variant="subtitle2" sx={{ display: "flex", mb: 1, fontWeight: 600 } as any}>
              Grid Density
            </Typography>
            <FormControl size="small" sx={{ display: "flex", minWidth: 150 } as any}>
              <Select
                value={currentDensity}
                onChange={(e) => handleDensityChange(selectedGridType, e.target.value)}
              >
                <MenuItem value="compact">Compact</MenuItem>
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="comfortable">Comfortable</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Column Configuration */}
      <Card>
        <CardHeader
          title
            <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 } as any}>
              <ViewColumn />
              <Typography variant="h6">
                {gridTypes[selectedGridType]?.name} Columns
              </Typography>
            </Box>
          }
          action
            <Box sx={{ display: "flex", display: 'flex', gap: 1 } as any}>
              <Button
                size="small"
                startIcon={<RestoreFromTrash />}
                onClick={() => handleResetToDefaults(selectedGridType)}
              >
                Reset
              </Button>
              <Button
                size="small"
                startIcon={<Reorder />}
                onClick={() => setShowColumnDialog(true)}
              >
                Reorder
              </Button>
            </Box>
          }
        />
        <CardContent>
          <DragDropContext onDragEnd={(result) => handleColumnReorder(selectedGridType, result)}>
            <Droppable droppableId="columns">
              {(provided) => (
                <List { ...provided.droppableProps} ref={provided.innerRef}>
                  {currentColumns.map((column: any index: any: any: any: any) => (
                    <Draggable key={column.field} draggableId={column.field} index={index}>
                      {(provided, snapshot) => (<ListItem
                          ref={provided.innerRef}
                          { ...provided.draggableProps}
                          sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            mb: 1,
                            backgroundColor: snapshot.isDragging 
                              ? theme.palette.action.hover 
                              : 'transparent'
                          }}
                        >
                          <Box { ...provided.dragHandleProps} sx={{ display: "flex", mr: 1 }}>
                            <DragIndicator color="action" />
                          </Box>
                          
                          <ListItemText
                            primary={column.headerName}
                            secondary={`Field: ${column.field}`}
                          />
                          
                          <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 2 } as any}>
                            {/* Width Control */}
                            <TextField
                              size="small"
                              value={column.width}
                              onChange
                                column.field, 
                                parseInt(e.target.value) || 100
                              )}
                              sx={{ display: "flex", width: 80 } as any}
                            />
                            
                            {/* Pin Control */}
                            <Tooltip title="Pin Column">
                              <Checkbox
                                checked={column.pinned}
                                onChange
                                  column.field, 
                                  e.target.checked
                                )}
                                icon={<ViewColumn />}
                                checkedIcon={<ViewColumn color="primary" />}
                              />
                            </Tooltip>
                            
                            {/* Visibility Control */}
                            <Tooltip title="Show/Hide Column">
                              <IconButton
                                onClick
                                  column.field, 
                                  !column.visible
                                )}
                                color={column.visible ? 'primary' : 'default'}
                              >
                                {column.visible ? <Visibility /> : <VisibilityOff />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ 
        display: "flex", 
        display: 'flex', 
        gap: 2, 
        justifyContent: 'flex-end',
        pt: 3,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 3
      }}>
        <Button
          variant="body2"
          startIcon={<Save />}
          onClick={handleSaveSettings}
        >
          Save Column Settings
        </Button>
      </Box>

      {/* Success/Error Notifications */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Column settings saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={5000}
        onClose={() => setShowError(false)}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          Failed to save column settings. Please try again.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GridColumnSettings;
