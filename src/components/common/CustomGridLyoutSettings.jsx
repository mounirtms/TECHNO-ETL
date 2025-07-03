import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Checkbox, CircularProgress, TextField
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { applySavedColumnSettings, saveGridSettings } from '../../utils/gridUtils';  // Import grid utility functions

const SettingsDialog = ({ open, onClose, columns, gridName, onSave, defaultColumns }) => {
    const [columnSettings, setColumnSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                // Try to load saved settings
                const savedSettings = await applySavedColumnSettings(gridName, columns);

                // Ensure all columns have settings, even if some are missing
                const initializedSettings = columns.reduce((acc, col, index) => {
                    const savedColumn = savedSettings?.[col.field] || {}; // Get saved column setting or default to empty
                    acc[col.field] = {
                        visible: savedColumn.visible !== undefined ? savedColumn.visible : true,
                        index: savedColumn.index !== undefined ? savedColumn.index : index,
                        width: savedColumn.width !== undefined ? savedColumn.width : col.width || 150,
                        sorting: savedColumn.sorting || 'asc',
                    };
                    return acc;
                }, {});

                setColumnSettings(initializedSettings); // Apply initialized settings
            } catch (error) {
                console.error('Error loading grid settings:', error);
                setColumnSettings(columns.reduce((acc, col, index) => ({
                    ...acc,
                    [col.field]: { visible: true, index, width: col.width || 150, sorting: 'asc' },
                }), {}));
            }
            setLoading(false);
        };

        if (open) {
            loadSettings();
        }
    }, [open, columns, gridName]);

    const handleColumnSettingChange = (field, setting, value) => {
        setColumnSettings(prev => ({
            ...prev,
            [field]: { ...prev[field], [setting]: value }
        }));
    };
    
    const handleToggleColumn = (field) => {
        handleColumnSettingChange(field, 'visible', !columnSettings[field]?.visible);
    };

    const handleWidthChange = (field, event) => {
        const width = parseInt(event.target.value, 10);
        handleColumnSettingChange(field, 'width', isNaN(width) ? 150 : width);
    };
    
    const handleSortingChange = (field) => {
        handleColumnSettingChange(field, 'sorting', columnSettings[field]?.sorting === 'asc' ? 'desc' : 'asc');
    };
    
    const getColumnSetting = (field) => {
        return columnSettings[field] || { visible: true, index: 0, width: 150, sorting: 'asc' };
    };
   
    const resetToDefault = () => {
        if (!defaultColumns || defaultColumns.length === 0) {
            console.warn('No default columns provided');
            return;
        }
    
        const resetSettings = defaultColumns.reduce((acc, col, index) => ({
            ...acc,
            [col.field]: {
                visible: true,  // Resetting visibility to true
                index: index,   // Resetting index based on defaultColumns order
                width: col.width || 150, // Default width
                sorting: 'asc', // Default sorting
            },
        }), {});
    
        setColumnSettings(resetSettings);
    };
    

    const handleSave = async () => {
        try {
            await saveGridSettings(gridName, columnSettings);
            onSave(columnSettings);
            onClose();
        } catch (error) {
            console.error('Error saving grid settings:', error);
        }
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination || source.index === destination.index) return;
    
        const reorderedColumns = Array.from(columns);
        const [removed] = reorderedColumns.splice(source.index, 1);
        reorderedColumns.splice(destination.index, 0, removed);
    
        const updatedColumnSettings = reorderedColumns.reduce((acc, col, idx) => {
            acc[col.field] = {
                ...columnSettings[col.field],
                index: idx,
            };
            return acc;
        }, {});
    
        setColumnSettings(updatedColumnSettings);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Grid Settings</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : columns.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <Typography>No columns available</Typography>
                    </Box>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable
                            droppableId="droppable-column-list"
                            isDropDisabled={false} // Default value for isDropDisabled if not passed
                            renderClone={undefined} // Default value for renderClone if not passed
                        >
                            {(provided) => (
                                <table
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{ width: '100%', borderCollapse: 'collapse' }}
                                >
                                    <thead>
                                        <tr>
                                            <th>Column Name</th>
                                            <th>Visibility</th>
                                            <th>Index (Read-Only)</th>
                                            <th>Width</th>
                                            <th>Sorting</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {columns.map((column, index) => (
                                            <Draggable key={column.field} draggableId={column.field} index={index}>
                                                {(provided) => (
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            borderBottom: '1px solid #ddd',
                                                            backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                                                        }}
                                                    >
                                                        {/* Column Name */}
                                                        <td>{column.headerName || column.field}</td>

                                                        {/* Visibility */}
                                                        <td>
                                                            <Checkbox
                                                                checked={columnSettings[column.field]?.visible ?? true}
                                                                onChange={() => handleToggleColumn(column.field)}
                                                            />
                                                        </td>

                                                        {/* Read-only Index */}
                                                        <td>
                                                            <TextField
                                                                value={columnSettings[column.field]?.index || index}
                                                                InputProps={{
                                                                    readOnly: true,
                                                                }}
                                                                fullWidth
                                                            />
                                                        </td>

                                                        {/* Width */}
                                                        <td>
                                                            <TextField
                                                                value={columnSettings[column.field]?.width || 150}
                                                                onChange={(e) => handleWidthChange(column.field, e)}
                                                                type="number"
                                                                fullWidth
                                                            />
                                                        </td>

                                                        {/* Sorting */}
                                                        <td>
                                                            <Button
                                                                variant="outlined"
                                                                color={columnSettings[column.field]?.sorting === 'asc' ? 'primary' : 'secondary'}
                                                                onClick={() => handleSortingChange(column.field)}
                                                            >
                                                                {columnSettings[column.field]?.sorting === 'asc' ? 'ASC' : 'DESC'}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Draggable>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={resetToDefault}>Reset</Button>
                <Button onClick={handleSave} color="primary" disabled={loading}>Save Changes</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SettingsDialog;
