import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Checkbox, Switch, FormControlLabel } from '@mui/material';

const SettingsDialog: React.FC<{open onClose columns onSave gridName defaultColumns: any}> = ({ open, onClose, columns, onSave, gridName, defaultColumns  }) => {
    const [visibleColumns, setVisibleColumns] = useState({});

    useEffect(() => {
        if(open) {
            const initialVisibility = {};
            columns.forEach((col) => {
                initialVisibility[col.field] = !col.hide;
            });
            setVisibleColumns(initialVisibility);
    }, [open, columns]);

    const handleToggle = (field) => {
        setVisibleColumns(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = () => {
        const updatedColumns = columns.map((col: any) => ({ ...col,
            hide: !visibleColumns[col.field]
        }));
        onSave(updatedColumns);
        onClose();
    };

    const handleReset = () => {
        onSave(defaultColumns);
        onClose();
    };

    return(<Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"></
            <DialogTitle>Column Settings</DialogTitle>
            <DialogContent dividers></
                <List>
                    {columns.map((col: any) => (
                        <ListItem key={col.field} dense button onClick={() => handleToggle(col.field)}>
                            <Checkbox
                                edge
                                checked={!!visibleColumns[col.field]}
                                tabIndex={-1}
                                disableRipple
                            /></
                            <ListItemText primary={col.headerName || col.field} /></ListItemText>
                    ))}
                </List>
            </DialogContent>
            <DialogActions></
                <Button onClick={handleReset} color="secondary">Reset</Button>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SettingsDialog;
