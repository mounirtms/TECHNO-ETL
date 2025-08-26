import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Alert, Snackbar,
  Grid, Card, CardContent, CardHeader, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Chip,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Tooltip, Divider, Switch, FormControlLabel
} from '@mui/material';
import {
  FilterList, Add, Delete, Edit, Save, RestoreFromTrash,
  DateRange, Numbers, TextFields, Category, Star,
  PlayArrow, Pause, Clear
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from '@mui/material/styles';

const GridFilterSettings: React.FC<any> = ({ user, onSettingsChange }) => {
  const theme = useTheme();

  // Filter operators for different data types
  const filterOperators = {
    text: [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'startsWith', label: 'Starts with' },
      { value: 'endsWith', label: 'Ends with' },
      { value: 'notEquals', label: 'Not equals' },
      { value: 'isEmpty', label: 'Is empty' },
      { value: 'isNotEmpty', label: 'Is not empty' }
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Not equals' },
      { value: 'greaterThan', label: 'Greater than' },
      { value: 'greaterThanOrEqual', label: 'Greater than or equal' },
      { value: 'lessThan', label: 'Less than' },
      { value: 'lessThanOrEqual', label: 'Less than or equal' },
      { value: 'between', label: 'Between' },
      { value: 'isEmpty', label: 'Is empty' },
      { value: 'isNotEmpty', label: 'Is not empty' }
    ],
    date: [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Not equals' },
      { value: 'after', label: 'After' },
      { value: 'onOrAfter', label: 'On or after' },
      { value: 'before', label: 'Before' },
      { value: 'onOrBefore', label: 'On or before' },
      { value: 'between', label: 'Between' },
      { value: 'isEmpty', label: 'Is empty' },
      { value: 'isNotEmpty', label: 'Is not empty' }
    ],
    boolean: [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Not equals' }
    ]
  };

  // Date range presets
  const datePresets = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const [filterPresets, setFilterPresets] = useState<any>({});
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [editingPreset, setEditingPreset] = useState<any>(null);
  const [newPreset, setNewPreset] = useState<any>({
    name: '',
    gridType: 'mdm',
    filters: [],
    logic: 'AND'
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Available fields for each grid type
  const gridFields = {
    mdm: [
      { field: 'sku', label: 'SKU', type: 'text' },
      { field: 'name', label: 'Product Name', type: 'text' },
      { field: 'price', label: 'Price', type: 'number' },
      { field: 'quantity', label: 'Quantity', type: 'number' },
      { field: 'category', label: 'Category', type: 'text' },
      { field: 'status', label: 'Status', type: 'text' },
      { field: 'lastUpdated', label: 'Last Updated', type: 'date' }
    ],
    magentoProducts: [
      { field: 'sku', label: 'SKU', type: 'text' },
      { field: 'name', label: 'Product Name', type: 'text' },
      { field: 'price', label: 'Price', type: 'number' },
      { field: 'quantity', label: 'Stock', type: 'number' },
      { field: 'status', label: 'Status', type: 'text' },
      { field: 'type', label: 'Type', type: 'text' },
      { field: 'createdAt', label: 'Created', type: 'date' }
    ],
    customers: [
      { field: 'firstName', label: 'First Name', type: 'text' },
      { field: 'lastName', label: 'Last Name', type: 'text' },
      { field: 'email', label: 'Email', type: 'text' },
      { field: 'group', label: 'Group', type: 'text' },
      { field: 'orders', label: 'Orders', type: 'number' },
      { field: 'totalSpent', label: 'Total Spent', type: 'number' },
      { field: 'lastLogin', label: 'Last Login', type: 'date' }
    ],
    orders: [
      { field: 'incrementId', label: 'Order #', type: 'text' },
      { field: 'status', label: 'Status', type: 'text' },
      { field: 'customerName', label: 'Customer', type: 'text' },
      { field: 'grandTotal', label: 'Total', type: 'number' },
      { field: 'items', label: 'Items', type: 'number' },
      { field: 'createdAt', label: 'Date', type: 'date' }
    ]
  };

  // Load filter presets on component mount
  useEffect(() => {
    const savedPresets = localStorage.getItem(`filterPresets_${user?.id}`);
    if(savedPresets) {
      setFilterPresets(JSON.parse(savedPresets));
  }, [user]);

  const handleAddFilter = () => {
    setNewPreset((prev: any) => ({ ...prev,
      filters: [
        ...prev.filters,
        {
          id: Date.now(),
          field: '',
          operator: 'contains',
          value: '',
          type: 'text'
      ]
    }));
  };

  const handleUpdateFilter = (filterId: number, updates: any) => {
    setNewPreset((prev: any) => ({ ...prev,
      filters: prev.filters.map((filter: any) =>
        filter.id === filterId ? { ...filter, ...updates } : filter
    }));
  };

  const handleRemoveFilter = (filterId: number) => {
    setNewPreset((prev: any) => ({ ...prev,
      filters: prev.filters.filter((filter: any) => filter?.id !== filterId)
    }));
  };

  const handleSavePreset = () => {
    if (!newPreset.name.trim()) {
      setShowError(true);
      return;
    const presetId = editingPreset?.id || Date.now();
    const preset = { ...newPreset,
      id: presetId,
      createdAt: editingPreset?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFilterPresets((prev: any) => ({ ...prev,
      [presetId]: preset
    }));

    setShowPresetDialog(false);
    setEditingPreset(null);
    setNewPreset({
      name: '',
      gridType: 'mdm',
      filters: [],
      logic: 'AND'
    });
    setShowSuccess(true);
  };

  const handleEditPreset = (preset: any) => {
    setEditingPreset(preset);
    setNewPreset({ ...preset });
    setShowPresetDialog(true);
  };

  const handleDeletePreset = (presetId: number) => {
    setFilterPresets((prev: any) => {
      const updated = { ...prev };
      delete updated[presetId];
      return updated;
    });
  };

  const handleSaveAllSettings = async () => {
    try {
      localStorage.setItem(`filterPresets_${user?.id}`, JSON.stringify(filterPresets));
      
      if(onSettingsChange) {
        onSettingsChange({ filterPresets });
      setShowSuccess(true);
    } catch(error: any) {
      console.error('Failed to save filter settings:', error);
      setShowError(true);
  };

  const getFieldType = (gridType: string, fieldName: string) => {
    const field = gridFields[gridType]?.find((f: any) => f?.field === fieldName);
    return field?.type || 'text';
  };

  const renderFilterValue = (filter: any, index: number) => {
    const fieldType = getFieldType(newPreset.gridType, filter?.field);
    
    if(filter?.operator === 'isEmpty' || filter?.operator === 'isNotEmpty') {
      return null;
    switch(fieldType) {
      case 'number':
        if(filter?.operator === 'between') {
          return(
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}></
              <TextField size="small"
                type="number"
                value={filter.value?.min || ''}
                onChange={(e) => handleUpdateFilter(filter?.id, {
                  value: { ...filter.value, min: e.target.value }
                })}
              />
              <Typography variant="outlined">to</Typography>
              <TextField size="small"
                type="number"
                value={filter.value?.max || ''}
                onChange={(e) => handleUpdateFilter(filter?.id, {
                  value: { ...filter.value, max: e.target.value }
                })}
              />
            </Box>
          );
        return(
          <TextField size="small"
            type="number"
            value={filter.value || ''}
            onChange={(e) => handleUpdateFilter(filter?.id, { value: e.target.value })}
          />
        );

      case 'date':
        if(filter?.operator === 'between') {
          return(
            <LocalizationProvider dateAdapter={AdapterDateFns}></
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <DatePicker label="From"
                  value={filter.value?.from || null}
                  onChange={(date) => handleUpdateFilter(filter?.id, {
                    value: { ...filter.value, from: date }
                  })}
                  renderInput={(params: any) => <TextField {...params} size="small" />}
                />
                <DatePicker label="To"
                  value={filter.value?.to || null}
                  onChange={(date) => handleUpdateFilter(filter?.id, {
                    value: { ...filter.value, to: date }
                  })}
                  renderInput={(params: any) => <TextField {...params} size="small" />}
                />
              </Box>
            </LocalizationProvider>
          );
        return(
          <LocalizationProvider dateAdapter={AdapterDateFns}></
            <DatePicker label="Date"
              value={filter.value || null}
              onChange={(date) => handleUpdateFilter(filter?.id, { value: date })}
              renderInput={(params: any) => <TextField {...params} size="small" />}
            />
          </LocalizationProvider>
        );

      case 'boolean':
        return(
          <FormControl size="small" sx={{ minWidth: 120 }}></
            <Select value={filter.value || 'true'}
              onChange={(e) => handleUpdateFilter(filter?.id, { value: e.target.value })}
            >
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </Select>
          </FormControl>
        );

      default:
        return(
          <TextField size="small"
            value={filter.value || ''}
            onChange={(e) => handleUpdateFilter(filter?.id, { value: e.target.value })}
          />
        );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}></
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          Filter Presets & Advanced Filtering
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage reusable filter presets for all grid types
        </Typography>
      </Box>

      {/* Filter Presets List */}
      <Card sx={{ mb: 3 }}></
        <CardHeader title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}></
              <FilterList />
              <Typography variant="h6">Saved Filter Presets</Typography>
            </Box>
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowPresetDialog(true)}
            >
              Create Preset
            </Button>
        />
        <CardContent>
          {Object.values(filterPresets).length === 0 ? (
            <Typography variant="outlined" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No filter presets created yet. Click "Create Preset" to get started.
            </Typography>
          ) : (
            <List>
              {Object.values(filterPresets).map((preset: any) => (
                <ListItem key={preset?.id} divider></
                  <ListItemText primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}></
                        <Typography variant="subtitle1" fontWeight={600}>
                          {preset.name}
                        </Typography>
                        <Chip 
                          size="small"
                          label={preset.gridType.toUpperCase()} 
                          color="primary"
                        /></
                        <Chip 
                          size="small"
                          label={`${preset.filters.length} filters`} 
                          variant="outlined"
                        />
                        <Chip size="small"
                          label={preset.logic} 
                          color="secondary"
                        /></Chip>
                    secondary={`Created: ${new Date(preset?.createdAt).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction></
                    <Tooltip title="Edit Preset">
                      <IconButton onClick={() => handleEditPreset(preset)}>
                        <Edit /></Edit>
                    </Tooltip>
                    <Tooltip title="Delete Preset"></
                      <IconButton onClick={() => handleDeletePreset(preset?.id)} color="error">
                        <Delete /></Delete>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        justifyContent: 'flex-end',
        pt: 3,
        borderTop: `1px solid ${theme.palette.divider}`
      }}></
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveAllSettings}
        >
          Save Filter Settings
        </Button>
      </Box>

      {/* Create/Edit Preset Dialog */}
      <Dialog open={showPresetDialog} 
        onClose={() => setShowPresetDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPreset ? 'Edit Filter Preset' : 'Create Filter Preset'}
        </DialogTitle>
        <DialogContent></
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}></
              <TextField fullWidth
                label="Preset Name"
                value={newPreset.name}
                onChange={(e) => setNewPreset((prev: any) => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}></
              <FormControl fullWidth>
                <InputLabel>Grid Type</InputLabel>
                <Select value={newPreset.gridType}
                  onChange={(e) => setNewPreset((prev: any) => ({ ...prev, gridType: e.target.value }))}
                  label="Grid Type"
                >
                  {Object.entries(gridFields).map(([key, value]) => (
                    <MenuItem key={key} value={key}>{value.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Filter Logic */}
          <Box sx={{ mb: 2 }}></
            <FormControlLabel control={
                <Switch
                  checked={newPreset.logic === 'OR'}
                  onChange={(e) => setNewPreset((prev: any) => ({ ...prev, 
                    logic: e.target.checked ? 'OR' : 'AND' 
                  }))}
                />
              label={`Filter Logic: ${newPreset.logic}`}
            />
          </Box>

          {/* Filters */}
          <Box sx={{ mb: 2 }}></
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Filters</Typography>
              <Button startIcon={<Add />} onClick={handleAddFilter}>
                Add Filter
              </Button>
            </Box>

            {newPreset.filters.map((filter: any, index: number) => (
              <Card key={filter?.id} sx={{ mb: 2, p: 2 }}></
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}></
                    <FormControl fullWidth size="small">
                      <InputLabel>Field</InputLabel>
                      <Select value={filter?.field}
                        onChange={(e) => {
                          const fieldType = getFieldType(newPreset.gridType, e.target.value);
                          handleUpdateFilter(filter?.id, { 
                            field: e.target.value,
                            type: fieldType,
                            operator: filterOperators[fieldType]?.[0]?.value || 'contains'
                          });
                        }}
                        label="Field"
                      >
                        {gridFields[newPreset.gridType].map((field: any) => (
                          <MenuItem key={field?.field} value={field?.field}>
                            {field.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}></
                    <FormControl fullWidth size="small">
                      <InputLabel>Operator</InputLabel>
                      <Select value={filter?.operator}
                        onChange={(e) => handleUpdateFilter(filter?.id, { operator: e.target.value })}
                        label="Operator"
                      >
                        {filterOperators[getFieldType(newPreset.gridType, filter.field)].map((op: any) => (
                          <MenuItem key={op.value} value={op.value}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={5}>
                    {renderFilterValue(filter, index)}
                  </Grid>
                  
                  <Grid item xs={12} md={1}></
                    <IconButton onClick={() => handleRemoveFilter(filter?.id)}
                      color="error"
                    >
                      <Delete /></Delete>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions></
          <Button onClick={() => setShowPresetDialog(false)}>Cancel</Button>
          <Button onClick={handleSavePreset} variant="contained">
            {editingPreset ? 'Update' : 'Create'} Preset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Notifications */}
      <Snackbar open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Filter settings saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar open={showError}
        autoHideDuration={5000}
        onClose={() => setShowError(false)}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          Failed to save filter settings. Please try again.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GridFilterSettings;