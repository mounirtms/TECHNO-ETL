/**
 * Settings Sync Example Component
 * Demonstrates how to use the SettingsSyncService and related hooks
 * This is an example component showing the sync functionality
 */

import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Stack,
    Card,
    CardContent,
    CardActions
} from '@mui/material';
import {
    Save as SaveIcon,
    CloudSync as CloudSyncIcon,
    Download as DownloadIcon
} from '@mui/icons-material';

import { useSettingsSync } from '../hooks/useSettingsSync';
import SyncStatusIndicator from '../components/common/SyncStatusIndicator';
import { useSettings } from '../contexts/SettingsContext';

const SettingsSyncExample = () => {
    const { settings, updateSettings } = useSettings();
    const {
        saveSettings,
        loadFromCloud,
        forceSyncAll,
        isLoading,
        error,
        getSyncStatusText,
        getSyncQueueStatus
    } = useSettingsSync();

    const [localChanges, setLocalChanges] = useState({
        theme: settings?.preferences?.theme || 'system',
        language: settings?.preferences?.language || 'en',
        fontSize: settings?.preferences?.fontSize || 'medium',
        animations: settings?.preferences?.animations !== false
    });

    const [feedback, setFeedback] = useState('');

    // Handle local changes
    const handleChange = (field, value) => {
        setLocalChanges(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Save settings using sync service
    const handleSave = async () => {
        try {
            const newSettings = {
                preferences: {
                    ...settings?.preferences,
                    ...localChanges
                }
            };

            // Update context first
            updateSettings(newSettings);

            // Save with sync service
            const result = await saveSettings(newSettings);

            if (result.success) {
                setFeedback('Settings saved successfully!');
            } else {
                setFeedback(`Error: ${result.error}`);
            }
        } catch (err) {
            setFeedback(`Error: ${err.message}`);
        }

        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback(''), 3000);
    };

    // Load from cloud
    const handleLoadFromCloud = async () => {
        try {
            const result = await loadFromCloud();
            
            if (result.success) {
                setLocalChanges({
                    theme: result.settings?.preferences?.theme || 'system',
                    language: result.settings?.preferences?.language || 'en',
                    fontSize: result.settings?.preferences?.fontSize || 'medium',
                    animations: result.settings?.preferences?.animations !== false
                });
                setFeedback(`Settings loaded from ${result.source}`);
            } else {
                setFeedback(`Error loading: ${result.error}`);
            }
        } catch (err) {
            setFeedback(`Error: ${err.message}`);
        }

        setTimeout(() => setFeedback(''), 3000);
    };

    // Force sync all
    const handleForceSyncAll = async () => {
        try {
            const success = await forceSyncAll();
            setFeedback(success ? 'All settings synchronized!' : 'Some settings failed to sync');
        } catch (err) {
            setFeedback(`Sync error: ${err.message}`);
        }

        setTimeout(() => setFeedback(''), 3000);
    };

    const queueStatus = getSyncQueueStatus();

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Settings Sync Example
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                    This example demonstrates the settings synchronization system with 
                    immediate local saves, cloud sync queuing, and conflict resolution.
                </Typography>

                {/* Sync Status */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Sync Status
                        </Typography>
                        
                        <Stack spacing={2}>
                            <SyncStatusIndicator 
                                variant="full" 
                                showDetails={true}
                                allowManualSync={true}
                            />
                            
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Status: {getSyncStatusText()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Queue: {queueStatus.queueLength} pending items
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Settings Form */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Example Settings
                        </Typography>
                        
                        <Stack spacing={3}>
                            <FormControl fullWidth>
                                <InputLabel>Theme</InputLabel>
                                <Select
                                    value={localChanges.theme}
                                    label="Theme"
                                    onChange={(e) => handleChange('theme', e.target.value)}
                                >
                                    <MenuItem value="light">Light</MenuItem>
                                    <MenuItem value="dark">Dark</MenuItem>
                                    <MenuItem value="system">System</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Language</InputLabel>
                                <Select
                                    value={localChanges.language}
                                    label="Language"
                                    onChange={(e) => handleChange('language', e.target.value)}
                                >
                                    <MenuItem value="en">English</MenuItem>
                                    <MenuItem value="fr">Français</MenuItem>
                                    <MenuItem value="ar">العربية</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Font Size</InputLabel>
                                <Select
                                    value={localChanges.fontSize}
                                    label="Font Size"
                                    onChange={(e) => handleChange('fontSize', e.target.value)}
                                >
                                    <MenuItem value="small">Small</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="large">Large</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={localChanges.animations}
                                        onChange={(e) => handleChange('animations', e.target.checked)}
                                    />
                                }
                                label="Enable Animations"
                            />
                        </Stack>
                    </CardContent>
                    
                    <CardActions>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            Save Settings
                        </Button>
                        
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleLoadFromCloud}
                            disabled={isLoading}
                        >
                            Load from Cloud
                        </Button>
                        
                        <Button
                            variant="outlined"
                            startIcon={<CloudSyncIcon />}
                            onClick={handleForceSyncAll}
                            disabled={isLoading}
                        >
                            Force Sync All
                        </Button>
                    </CardActions>
                </Card>

                {/* Feedback */}
                {feedback && (
                    <Alert 
                        severity={feedback.includes('Error') ? 'error' : 'success'}
                        sx={{ mb: 2 }}
                    >
                        {feedback}
                    </Alert>
                )}

                {/* Error Display */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Sync Error: {error}
                    </Alert>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Technical Details */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Technical Details
                        </Typography>
                        
                        <Typography variant="body2" paragraph>
                            <strong>How it works:</strong>
                        </Typography>
                        
                        <ul>
                            <li>Settings are saved locally immediately for instant feedback</li>
                            <li>Changes are queued for cloud synchronization</li>
                            <li>Sync happens automatically when online</li>
                            <li>Conflicts are detected and resolved automatically or with user input</li>
                            <li>Real-time sync keeps settings updated across devices</li>
                            <li>Offline support ensures settings are never lost</li>
                        </ul>
                        
                        <Typography variant="body2" paragraph>
                            <strong>Features demonstrated:</strong>
                        </Typography>
                        
                        <ul>
                            <li>Immediate local storage saves (Requirement 7.2)</li>
                            <li>Cloud sync queuing (Requirement 7.2)</li>
                            <li>Conflict resolution (Requirement 7.3)</li>
                            <li>Clear sync status feedback (Requirement 7.4, 7.5)</li>
                            <li>Error handling and retry logic</li>
                            <li>Network state awareness</li>
                        </ul>
                    </CardContent>
                </Card>
            </Paper>
        </Box>
    );
};

export default SettingsSyncExample;