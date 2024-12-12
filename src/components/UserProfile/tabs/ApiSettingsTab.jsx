import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Collapse,
    Typography,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import { useProfileController } from '../ProfileController';

const ApiSettingsTab = () => {
    const { userData, updateUserData, loading } = useProfileController();
    const [testingConnection, setTestingConnection] = useState(false);

    const handleChange = (service, field, value) => {
        const newApiSettings = {
            ...userData.apiSettings,
            [service]: {
                ...userData.apiSettings[service],
                [field]: value
            }
        };

        if (service === 'magento' && field === 'authMode') {
            // Reset token when switching auth modes
            newApiSettings.magento.token = '';
        }

        updateUserData({ apiSettings: newApiSettings }, 'apiSettings');
    };

    const handleOAuthChange = (field, value) => {
        const newApiSettings = {
            ...userData.apiSettings,
            magento: {
                ...userData.apiSettings.magento,
                oauth: {
                    ...userData.apiSettings.magento.oauth,
                    [field]: value
                }
            }
        };
        updateUserData({ apiSettings: newApiSettings }, 'apiSettings');
    };

    const testConnection = async (service) => {
        setTestingConnection(true);
        try {
            // Implement connection test logic here
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Show success message
        } catch (error) {
            // Show error message
        } finally {
            setTestingConnection(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Magento API Settings */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                Magento API Settings
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Magento API URL"
                        value={userData?.apiSettings?.magento?.url || ''}
                        onChange={(e) => handleChange('magento', 'url', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Auth Mode</InputLabel>
                        <Select
                            value={userData?.apiSettings?.magento?.authMode || 'basic'}
                            onChange={(e) => handleChange('magento', 'authMode', e.target.value)}
                            label="Auth Mode"
                        >
                            <MenuItem value="basic">Basic Auth</MenuItem>
                            <MenuItem value="oauth">OAuth 1.0</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Basic Auth Fields */}
                <Collapse in={userData?.apiSettings?.magento?.authMode === 'basic'} sx={{ width: '100%' }}>
                    <Grid container spacing={2} sx={{ mt: 0, ml: 0 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                size="small"
                                fullWidth
                                label="Username"
                                value={userData?.apiSettings?.magento?.username || ''}
                                onChange={(e) => handleChange('magento', 'username', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                size="small"
                                fullWidth
                                type="password"
                                label="Password"
                                value={userData?.apiSettings?.magento?.password || ''}
                                onChange={(e) => handleChange('magento', 'password', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Collapse>

                {/* OAuth Fields */}
                <Collapse in={userData?.apiSettings?.magento?.authMode === 'oauth'} sx={{ width: '100%' }}>
                    <Grid container spacing={2} sx={{ mt: 0, ml: 0 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                size="small"
                                fullWidth
                                label="Consumer Key"
                                value={userData?.apiSettings?.magento?.oauth?.consumerKey || ''}
                                onChange={(e) => handleOAuthChange('consumerKey', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                size="small"
                                fullWidth
                                label="Consumer Secret"
                                type="password"
                                value={userData?.apiSettings?.magento?.oauth?.consumerSecret || ''}
                                onChange={(e) => handleOAuthChange('consumerSecret', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                size="small"
                                fullWidth
                                label="Access Token"
                                value={userData?.apiSettings?.magento?.oauth?.accessToken || ''}
                                onChange={(e) => handleOAuthChange('accessToken', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                size="small"
                                fullWidth
                                label="Token Secret"
                                type="password"
                                value={userData?.apiSettings?.magento?.oauth?.tokenSecret || ''}
                                onChange={(e) => handleOAuthChange('tokenSecret', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Collapse>

                <Grid item xs={12}>
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        disabled={testingConnection}
                        onClick={() => testConnection('magento')}
                        sx={{ mr: 2, mt: 1 }}
                        startIcon={testingConnection && <CircularProgress size={16} color="inherit" />}
                    >
                        {testingConnection ? 'Testing...' : 'Test Connection'}
                    </Button>
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Cegid API Settings */}
            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 'medium' }}>
                Cegid API Settings
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Cegid API URL"
                        value={userData?.apiSettings?.cegid?.url || ''}
                        onChange={(e) => handleChange('cegid', 'url', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Username"
                        value={userData?.apiSettings?.cegid?.username || ''}
                        onChange={(e) => handleChange('cegid', 'username', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        size="small"
                        fullWidth
                        type="password"
                        label="Password"
                        value={userData?.apiSettings?.cegid?.password || ''}
                        onChange={(e) => handleChange('cegid', 'password', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Database"
                        value={userData?.apiSettings?.cegid?.database || ''}
                        onChange={(e) => handleChange('cegid', 'database', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        disabled={testingConnection}
                        onClick={() => testConnection('cegid')}
                        sx={{ mr: 2, mt: 1 }}
                        startIcon={testingConnection && <CircularProgress size={16} color="inherit" />}
                    >
                        {testingConnection ? 'Testing...' : 'Test Connection'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ApiSettingsTab;