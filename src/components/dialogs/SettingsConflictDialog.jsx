/**
 * Settings Conflict Resolution Dialog
 * Provides user interface for resolving settings conflicts between local and remote versions
 * 
 * Requirements: 7.3, 7.4 (Conflict resolution and clear user feedback)
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Card,
    CardContent,
    CardActions,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert,
    Stack,
    Divider,
    Grid
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Warning as WarningIcon,
    Schedule as ScheduleIcon,
    Computer as ComputerIcon,
    Cloud as CloudIcon,
    Merge as MergeIcon
} from '@mui/icons-material';

const SettingsConflictDialog = () => {
    const [open, setOpen] = useState(false);
    const [conflictData, setConflictData] = useState(null);
    const [selectedResolution, setSelectedResolution] = useState(null);
    const [resolveCallback, setResolveCallback] = useState(null);

    // Listen for conflict events
    useEffect(() => {
        const handleConflict = (event) => {
            const { conflictResult, resolve } = event.detail;
            setConflictData(conflictResult);
            setResolveCallback(() => resolve);
            setOpen(true);
        };

        window.addEventListener('settingsConflict', handleConflict);
        
        return () => {
            window.removeEventListener('settingsConflict', handleConflict);
        };
    }, []);

    const handleClose = () => {
        setOpen(false);
        setConflictData(null);
        setSelectedResolution(null);
        setResolveCallback(null);
    };

    const handleResolve = (choice) => {
        if (resolveCallback) {
            resolveCallback(choice);
        }
        handleClose();
    };

    if (!conflictData) {
        return null;
    }

    const { localSettings, remoteSettings, conflicts, localTimestamp, remoteTimestamp } = conflictData;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '60vh' }
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="warning" />
                    <Typography variant="h6">
                        Settings Conflict Detected
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3}>
                    {/* Explanation */}
                    <Alert severity="info">
                        Your local settings conflict with settings from another device or session. 
                        Please choose how to resolve these conflicts.
                    </Alert>

                    {/* Conflict Summary */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Conflict Summary
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <ComputerIcon fontSize="small" />
                                            <Typography variant="subtitle2">
                                                Local Settings
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            <ScheduleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                            {new Date(localTimestamp).toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <CloudIcon fontSize="small" />
                                            <Typography variant="subtitle2">
                                                Remote Settings
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            <ScheduleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                            {new Date(remoteTimestamp).toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Conflicts Details */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Conflicting Settings ({conflicts.length})
                        </Typography>
                        
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>View Detailed Conflicts</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack spacing={2}>
                                    {conflicts.map((conflict, index) => (
                                        <ConflictItem key={index} conflict={conflict} />
                                    ))}
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    </Box>

                    {/* Resolution Options */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Resolution Options
                        </Typography>
                        
                        <Stack spacing={2}>
                            {/* Use Local */}
                            <Card 
                                variant={selectedResolution === 'local' ? 'elevation' : 'outlined'}
                                sx={{ 
                                    cursor: 'pointer',
                                    border: selectedResolution === 'local' ? 2 : 1,
                                    borderColor: selectedResolution === 'local' ? 'primary.main' : 'divider'
                                }}
                                onClick={() => setSelectedResolution('local')}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <ComputerIcon color={selectedResolution === 'local' ? 'primary' : 'inherit'} />
                                        <Typography variant="subtitle2">
                                            Keep Local Settings
                                        </Typography>
                                        {localTimestamp > remoteTimestamp && (
                                            <Chip label="Newer" size="small" color="success" />
                                        )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Use your current local settings and overwrite the remote version.
                                        This will preserve all your recent changes.
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* Use Remote */}
                            <Card 
                                variant={selectedResolution === 'remote' ? 'elevation' : 'outlined'}
                                sx={{ 
                                    cursor: 'pointer',
                                    border: selectedResolution === 'remote' ? 2 : 1,
                                    borderColor: selectedResolution === 'remote' ? 'primary.main' : 'divider'
                                }}
                                onClick={() => setSelectedResolution('remote')}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <CloudIcon color={selectedResolution === 'remote' ? 'primary' : 'inherit'} />
                                        <Typography variant="subtitle2">
                                            Use Remote Settings
                                        </Typography>
                                        {remoteTimestamp > localTimestamp && (
                                            <Chip label="Newer" size="small" color="success" />
                                        )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Use the settings from the cloud/other device and replace your local settings.
                                        This will discard your local changes.
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* Merge */}
                            <Card 
                                variant={selectedResolution === 'merge' ? 'elevation' : 'outlined'}
                                sx={{ 
                                    cursor: 'pointer',
                                    border: selectedResolution === 'merge' ? 2 : 1,
                                    borderColor: selectedResolution === 'merge' ? 'primary.main' : 'divider'
                                }}
                                onClick={() => setSelectedResolution('merge')}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <MergeIcon color={selectedResolution === 'merge' ? 'primary' : 'inherit'} />
                                        <Typography variant="subtitle2">
                                            Merge Settings (Recommended)
                                        </Typography>
                                        <Chip label="Smart" size="small" color="info" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Intelligently combine both versions. Preferences will favor local changes,
                                        while API settings will favor remote changes for consistency.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button 
                    onClick={() => handleResolve(selectedResolution || 'remote')}
                    variant="contained"
                    disabled={!selectedResolution}
                >
                    Apply Resolution
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Individual conflict item component
const ConflictItem = ({ conflict }) => {
    const { path, localValue, remoteValue, type } = conflict;

    const formatValue = (value) => {
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const getConflictTypeColor = (type) => {
        switch (type) {
            case 'value_mismatch':
                return 'warning';
            case 'object_mismatch':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Card variant="outlined">
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="subtitle2">
                        {path}
                    </Typography>
                    <Chip 
                        label={type.replace('_', ' ')} 
                        size="small" 
                        color={getConflictTypeColor(type)}
                    />
                </Box>
                
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Local Value:
                        </Typography>
                        <Box 
                            sx={{ 
                                p: 1, 
                                bgcolor: 'grey.50', 
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                maxHeight: 100,
                                overflow: 'auto'
                            }}
                        >
                            {formatValue(localValue)}
                        </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Remote Value:
                        </Typography>
                        <Box 
                            sx={{ 
                                p: 1, 
                                bgcolor: 'grey.50', 
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                maxHeight: 100,
                                overflow: 'auto'
                            }}
                        >
                            {formatValue(remoteValue)}
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default SettingsConflictDialog;