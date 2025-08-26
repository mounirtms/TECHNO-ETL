// RecordDetailsDialog.tsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

interface RecordDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    record: Record<string, any>;
const RecordDetailsDialog: React.FC<RecordDetailsDialogProps> = ({ open, onClose, record }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth></
            <DialogTitle>Record Details</DialogTitle>
            <DialogContent></
                <Box sx={{ display: "flex", maxHeight: '70vh', overflow: 'auto' }}>
                    <Typography component="pre" variant="outlined">{JSON.stringify(record, null, 2)}</Typography>
                </Box>
            </DialogContent>
            <DialogActions></
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecordDetailsDialog;
