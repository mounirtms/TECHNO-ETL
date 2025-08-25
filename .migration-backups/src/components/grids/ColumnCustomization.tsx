import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Switch,
  Typography,
  Box,
  Divider,
  Tooltip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Paper
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DragHandle as DragHandleIcon,
  Settings as SettingsIcon,
  Restore as RestoreIcon,
  Save as SaveIcon,
  ViewColumn as ColumnIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

/**
 * ColumnCustomization - Advanced column management
 * Features: Show/hide, reorder, width adjustment, alignment, formatting
 */
const ColumnCustomization: React.FC<any> = ({ 
  open, 
  onClose, 
  columns, 
  onColumnsChange,
  columnSettings,
  onColumnSettingsChange 
}) => {
  // ===== STATE MANAGEMENT =====
  const [localColumns, setLocalColumns] = useState(columns);
  const [localSettings, setLocalSettings] = useState(columnSettings || {});
  const [selectedColumn, setSelectedColumn] = useState(null);

  // ===== COLUMN OPERATIONS =====
  const handleColumnVisibilityToggle = useCallback((columnField as any) => {
    setLocalColumns(prev => 
      prev.map(col => 
        col?.?..field === columnField 
          ? { ...col, hide: !col.hide }
          : col
      )
    );
  }, []);

  const handleColumnReorder = useCallback((result) => {
    if (!result.destination) return;

    const items = Array.from(localColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalColumns(items);
  }, [localColumns]);

  const handleColumnWidthChange = useCallback((columnField, width) => {
    setLocalColumns(prev =>
      prev.map(col =>
        col?.?..field === columnField
          ? { ...col, width: width }
          : col
      )
    );
  }, []);

  const handleColumnAlignmentChange = useCallback((columnField, align) => {
    setLocalColumns(prev =>
      prev.map(col =>
        col?.?..field === columnField
          ? { ...col, align: align }
          : col
      )
    );
  }, []);

  const handleColumnFormatChange = useCallback((columnField, format) => {
    setLocalSettings(prev => ({
      ...prev,
      [columnField]: {
        ...prev[columnField],
        format: format
      }
    }));
  }, []);

  const handleSave = useCallback(() => {
    onColumnsChange(localColumns);
    onColumnSettingsChange(localSettings);
    
    // Save to localStorage for persistence
    localStorage.setItem('grid_column_config', JSON.stringify({
      columns: localColumns,
      settings: localSettings
    }));
    
    onClose();
  }, [localColumns, localSettings, onColumnsChange, onColumnSettingsChange, onClose]);

  const handleReset = useCallback(() => {
    // Reset to default configuration
    const defaultColumns = columns.map(col => ({ ...col, hide: false }));
    setLocalColumns(defaultColumns);
    setLocalSettings({});
    
    // Clear localStorage
    localStorage.removeItem('grid_column_config');
  }, [columns]);

  // ===== COMPUTED VALUES =====
  const visibleColumnsCount = useMemo(() => 
    localColumns.filter(col => !col.hide).length
  , [localColumns]);

  const totalColumnsCount = localColumns.length;

  // ===== RENDER COLUMN ITEM =====
  const renderColumnItem = (column, index) => (
    <Draggable key={column?.?..field} draggableId={column?.?..field} index={index}>
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            backgroundColor: snapshot.isDragging ? 'action.hover' : 'transparent',
            border: snapshot.isDragging ? '1px dashed' : 'none',
            borderColor: 'primary.main',
            borderRadius: 1,
            mb: 0.5
          } as any}
        >
          <ListItemIcon {...provided.dragHandleProps}>
            <DragHandleIcon color="action" />
          </ListItemIcon>
          
          <ListItemIcon>
            <Checkbox
              checked={!column.hide}
              onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => () => handleColumnVisibilityToggle(column?.?..field)}
              color="primary"
            />
          </ListItemIcon>
          
          <ListItemText
            primary={column??.headerName || column?.?..field}
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 } as any}>
                <Chip label={column?.?..field} size="small" variant="outlined" />
                <Chip 
                  label={`Width: ${column?..width || 'Auto'}`} 
                  size="small" 
                  variant="outlined" 
                />
                {column?..type && (
                  <Chip 
                    label={column?..type} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                )}
              </Box>
            }
          />
          
          <ListItemSecondaryAction>
            <Tooltip title="Column Settings">
              <IconButton
                size="small"
                onClick={() => setSelectedColumn(column as any)}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
      )}
    </Draggable>
  );

  // ===== RENDER COLUMN SETTINGS PANEL =====
  const renderColumnSettings = () => {
    if (!selectedColumn) return null;

    const columnSetting = localSettings[selectedColumn?.?..field] || {};

    return (
      <Paper sx={{ p: 2, mt: 2 } as any}>
        <Typography variant="h6" gutterBottom>
          Settings for: {selectedColumn??.headerName || selectedColumn?.?..field}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 } as any}>
          {/* Width Setting */}
          <Box>
            <Typography variant="body2" gutterBottom>
              Column Width: {selectedColumn?..width || 150}px
            </Typography>
            <Slider
              value={selectedColumn?..width || 150}
              onChange={(e) => (e as any) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e, value) => handleColumnWidthChange(selectedColumn?.?..field, value)}
              min={50}
              max={500}
              step={10}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Alignment Setting */}
          <Box>
            <Typography variant="body2" gutterBottom>
              Text Alignment
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 } as any}>
              {['left', 'center', 'right'].map((align as any) => (
                <Button
                  key={align}
                  variant={selectedColumn??.align === align ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleColumnAlignmentChange(selectedColumn?.?..field, align)}
                  startIcon={
                    align === 'left' ? <AlignLeftIcon /> :
                    align === 'center' ? <AlignCenterIcon /> :
                    <AlignRightIcon />
                  }
                >
                  {align}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Format Setting */}
          {selectedColumn?..type && (
            <FormControl fullWidth size="small">
              <InputLabel>Display Format</InputLabel>
              <Select
                value={columnSetting.format || 'default'}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => handleColumnFormatChange(selectedColumn?.?..field, e.target.value)}
                label="Display Format"
              >
                <MenuItem value="default">Default</MenuItem>
                {selectedColumn?..type === 'number' && (
                  <>
                    <MenuItem value="currency">Currency</MenuItem>
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="decimal">Decimal (2 places)</MenuItem>
                  </>
                )}
                {selectedColumn?..type === 'date' && (
                  <>
                    <MenuItem value="short">Short Date</MenuItem>
                    <MenuItem value="long">Long Date</MenuItem>
                    <MenuItem value="relative">Relative (e.g., "2 days ago")</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          )}

          {/* Sortable Setting */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as any}>
            <Typography variant="body2">
              Allow Sorting
            </Typography>
            <Switch
              checked={selectedColumn??.sortable !== false}
              onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => {
                setLocalColumns(prev =>
                  prev.map(col =>
                    col?.?..field === selectedColumn?.?..field
                      ? { ...col, sortable: e.target.checked }
                      : col
                  )
                );
                setSelectedColumn(prev => ({ ...prev, sortable: e.target.checked }));
              }}
            />
          </Box>

          {/* Filterable Setting */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as any}>
            <Typography variant="body2">
              Allow Filtering
            </Typography>
            <Switch
              checked={selectedColumn??.filterable !== false}
              onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => {
                setLocalColumns(prev =>
                  prev.map(col =>
                    col?.?..field === selectedColumn?.?..field
                      ? { ...col, filterable: e.target.checked }
                      : col
                  )
                );
                setSelectedColumn(prev => ({ ...prev, filterable: e.target.checked }));
              }}
            />
          </Box>

          <Button
            variant="outlined"
            onClick={() => setSelectedColumn(null)}
            fullWidth
          >
            Close Settings
          </Button>
        </Box>
      </Paper>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as any}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}>
            <ColumnIcon />
            <Typography variant="h6">
              Column Customization
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}>
            <Chip
              label={`${visibleColumnsCount}/${totalColumnsCount} visible`}
              color="primary"
              size="small"
            />
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 } as any}>
          Drag to reorder columns, use checkboxes to show/hide, and click settings to customize individual columns.
        </Typography>

        <DragDropContext onDragEnd={handleColumnReorder}>
          <Droppable droppableId="columns">
            {(provided) => (
              <List
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ maxHeight: 400, overflow: 'auto' } as any}
              >
                {localColumns.map((column, index) => renderColumnItem(column, index))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>

        {renderColumnSettings()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleReset} startIcon={<RestoreIcon />}>
          Reset to Default
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnCustomization;
