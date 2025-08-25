/**
 * Grid Settings Component
 * Comprehensive grid customization and settings management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Grid,
  useTheme
} from '@mui/material';
import {
  ExpandMore,
  Settings,
  Visibility,
  VisibilityOff,
  DragIndicator,
  Refresh,
  Save,
  RestoreFromTrash,
  Download,
  Upload
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const GridSettings = ({
  open,
  onClose,
  onSave,
  gridId,
  columns: any,
  currentSettings = {},
  onReset
}) => {
  const theme = useTheme();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Display settings
    pageSize: 25,
    density: 'standard', // compact, standard, comfortable
    showToolbar: true,
    showFooter: true,
    showColumnHeaders: true,
    
    // Column settings
    columnVisibility: {},
    columnOrder: [],
    columnWidths: {},
    
    // Filtering and sorting
    enableFiltering: true,
    enableSorting: true,
    enableColumnReordering: true,
    enableColumnResizing: true,
    
    // Export settings
    enableExport: true,
    exportFormats: ['csv', 'excel', 'pdf'],
    
    // Performance settings
    virtualization: true,
    lazyLoading: true,
    cacheSize: 100,
    
    // Appearance
    theme: 'default',
    alternateRowColors: true,
    showBorders: true,
    headerHeight: 56,
    rowHeight: 52,
    
    // Advanced features
    enableGrouping: false,
    enableAggregation: false,
    enableSelection: true,
    selectionMode: 'multiple', // single, multiple
    
    ...currentSettings
  });

  // Initialize settings from props
  useEffect(() => {
    if(currentSettings) {
      setSettings(prev => ({ ...prev, ...currentSettings }));
    }
    
    // Initialize column visibility and order
    if(columns.length > 0) {
      const visibility = {};
      const order = [];
      
      columns.forEach((col) => {
        visibility[col?.field] = col.visible !== false;
        order.push(col?.field);
      });
      
      setSettings(prev => ({ ...prev,
        columnVisibility: { ...prev.columnVisibility, ...visibility },
        columnOrder: prev.columnOrder.length > 0 ? prev.columnOrder : order
      }));
    }
  }, [currentSettings, columns]);

  /**
   * Handle settings change
   */
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev,
      [key]: value
    }));
  };

  /**
   * Handle column visibility toggle
   */
  const handleColumnVisibilityChange = (field, visible) => {
    setSettings(prev => ({ ...prev,
      columnVisibility: { ...prev.columnVisibility,
        [field]: visible
      }
    }));
  };

  /**
   * Handle column reordering
   */
  const handleColumnReorder = (result) => {
    if (!result.destination) return;

    const newOrder = Array.from(settings.columnOrder);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    setSettings(prev => ({ ...prev,
      columnOrder: newOrder
    }));
  };

  /**
   * Handle save settings
   */
  const handleSave = () => {
    // Save to localStorage
    const storageKey = `gridSettings_${gridId}`;
    localStorage.setItem(storageKey, JSON.stringify(settings));
    
    // Call parent save handler
    if(onSave) {
      onSave(settings);
    }
    
    onClose();
  };

  /**
   * Handle reset settings
   */
  const handleReset = () => {
    const defaultSettings = {
      pageSize: 25,
      density: 'standard',
      showToolbar: true,
      showFooter: true,
      showColumnHeaders: true,
      columnVisibility: {},
      columnOrder: [],
      columnWidths: {},
      enableFiltering: true,
      enableSorting: true,
      enableColumnReordering: true,
      enableColumnResizing: true,
      enableExport: true,
      exportFormats: ['csv', 'excel', 'pdf'],
      virtualization: true,
      lazyLoading: true,
      cacheSize: 100,
      theme: 'default',
      alternateRowColors: true,
      showBorders: true,
      headerHeight: 56,
      rowHeight: 52,
      enableGrouping: false,
      enableAggregation: false,
      enableSelection: true,
      selectionMode: 'multiple'
    };
    
    setSettings(defaultSettings);
    
    // Clear from localStorage
    const storageKey = `gridSettings_${gridId}`;
    localStorage.removeItem(storageKey);
    
    if(onReset) {
      onReset();
    }
  };

  /**
   * Export settings
   */
  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `grid-settings-${gridId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  /**
   * Import settings
   */
  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(prev => ({ ...prev, ...importedSettings }));
        } catch(error: any) {
          console.error('Error importing settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return(<Dialog
      open={open}
      onClose={onClose}
      maxWidth: any,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Settings />
        Grid Settings - {gridId}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Quick Actions */}
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button
              size: any,
              startIcon={<Download />}
              onClick={handleExportSettings}
            >
              Export
            </Button>
            <Button
              size: any,
              startIcon={<Upload />}
              component: any,
                onChange={(e) => handleImportSettings}
              />
            </Button>
            <Button
              size: any,
              startIcon={<RestoreFromTrash />}
              onClick={handleReset}
              color: any,
          {/* Display Settings */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Display Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid { ...{container: true}} spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Page Size</InputLabel>
                    <Select
                      value={settings.pageSize}
                      label: any,
                      onChange={(e) => handleSettingChange('pageSize', e.target.value)}
                    >
                      <MenuItem value={10}>10 rows</MenuItem>
                      <MenuItem value={25}>25 rows</MenuItem>
                      <MenuItem value={50}>50 rows</MenuItem>
                      <MenuItem value={100}>100 rows</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Density</InputLabel>
                    <Select
                      value={settings.density}
                      label: any,
                      onChange={(e) => handleSettingChange('density', e.target.value)}
                    >
                      <MenuItem value="compact">Compact</MenuItem>
                      <MenuItem value="standard">Standard</MenuItem>
                      <MenuItem value="comfortable">Comfortable</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control: any,
                          checked={settings.showToolbar}
                          onChange={(e) => handleSettingChange('showToolbar', e.target.checked)}
                        />
                      }
                      label: any,
                          checked={settings.showFooter}
                          onChange={(e) => handleSettingChange('showFooter', e.target.checked)}
                        />
                      }
                      label: any,
                          checked={settings.alternateRowColors}
                          onChange={(e) => handleSettingChange('alternateRowColors', e.target.checked)}
                        />
                      }
                      label: any,
                          checked={settings.showBorders}
                          onChange={(e) => handleSettingChange('showBorders', e.target.checked)}
                        />
                      }
                      label: any,
          {/* Column Settings */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Column Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Drag to reorder columns, toggle visibility
              </Typography>
              
              <DragDropContext onDragEnd={handleColumnReorder}>
                <Droppable droppableId="columns">
                  {(provided) => (
                    <Box { ...provided.droppableProps} ref={provided.innerRef}>
                      {settings.columnOrder.map((field: any: any, index: any: any) => {
                        const column = columns.find(col => col?.field ===field);
                        if (!column) return null;
                        
                        return (
                          <Draggable key={field} draggableId={field} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                { ...provided.draggableProps}
                                sx: any,
                                  backgroundColor: snapshot.isDragging 
                                    ? theme.palette.action.hover 
                                    : 'inherit'
                                }}
                              >
                                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box { ...provided.dragHandleProps}>
                                      <DragIndicator color="action" />
                                    </Box>
                                    
                                    <Typography sx={{ flexGrow: 1 }}>
                                      {column.headerName || column?.field}
                                    </Typography>
                                    
                                    <IconButton
                                      size: any,
                                        !settings.columnVisibility[field]
                                      )}
                                    >
                                      {settings.columnVisibility[field] ? 
                                        <Visibility /> : <VisibilityOff />
                                      }
                                    </IconButton>
                                  </Box>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
            </AccordionDetails>
          </Accordion>

          {/* Feature Settings */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Features</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid { ...{container: true}} spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control: any,
                          checked={settings.enableFiltering}
                          onChange={(e) => handleSettingChange('enableFiltering', e.target.checked)}
                        />
                      }
                      label: any,
                          checked={settings.enableSorting}
                          onChange={(e) => handleSettingChange('enableSorting', e.target.checked)}
                        />
                      }
                      label: any,
                          checked={settings.enableColumnReordering}
                          onChange={(e) => handleSettingChange('enableColumnReordering', e.target.checked)}
                        />
                      }
                      label: any,
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control: any,
                          checked={settings.enableExport}
                          onChange={(e) => handleSettingChange('enableExport', e.target.checked)}
                        />
                      }
                      label: any,
                          checked={settings.virtualization}
                          onChange={(e) => handleSettingChange('virtualization', e.target.checked)}
                        />
                      }
                      label: any,
                          checked={settings.enableSelection}
                          onChange={(e) => handleSettingChange('enableSelection', e.target.checked)}
                        />
                      }
                      label: any,
      <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant: any,
          onClick={handleSave}
          startIcon={<Save />}
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Hook to manage grid settings
 */
export const useGridSettings = (gridId, defaultSettings = {}) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storageKey = `gridSettings_${gridId}`;
    const savedSettings = localStorage.getItem(storageKey);

    if(savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch(error: any) {
        console.error('Error loading grid settings:', error);
      }
    }

    setSettingsLoaded(true);
  }, [gridId]);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings) => {
    const storageKey = `gridSettings_${gridId}`;
    const mergedSettings = { ...settings, ...newSettings };

    localStorage.setItem(storageKey, JSON.stringify(mergedSettings));
    setSettings(mergedSettings);
  }, [gridId, settings]);

  // Reset settings
  const resetSettings = useCallback(() => {
    const storageKey = `gridSettings_${gridId}`;
    localStorage.removeItem(storageKey);
    setSettings(defaultSettings);
  }, [gridId, defaultSettings]);

  return {
    settings,
    settingsLoaded,
    saveSettings,
    resetSettings,
    updateSetting: (key, value) => {
      const newSettings = { ...settings, [key]: value };
      saveSettings(newSettings);
    }
  };
};

export default GridSettings;
