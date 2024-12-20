import React, { useState, useEffect } from 'react';
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
import { useLanguage } from '../../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import cegidApi from '../../../services/cegidService';
import magentoApi from '../../../services/magentoService';

const ApiSettingsTab = () => {
    const { userData, updateUserData, loading } = useProfileController();
    const [testingMagentoConnection, setTestingMagentoConnection] = useState(false);
    const [testingCegidConnection, setTestingCegidConnection] = useState(false);

    const { translate } = useLanguage();
    const [formData, setFormData] = useState({
        magento: {
            url: '',
            username: '',
            password: '',
            authMode: 'basic',
            consumerKey: '',
            consumerSecret: '',
            accessToken: '',
            accessTokenSecret: '',
        },
        cegid: {
            url: '',
            username: '',
            password: '',
            database: ''
        }
    });

    // Load data only once on mount
    useEffect(() => {
        const remoteSettings = userData?.apiSettings;
        if (remoteSettings) {
            setFormData({
                magento: {
                    url: remoteSettings?.magento?.url || import.meta.env.VITE_MAGENTO_API_URL || '',
                    username: remoteSettings?.magento?.username || import.meta.env.VITE_MAGENTO_ADMIN_USERNAME || '',
                    password: remoteSettings?.magento?.password || import.meta.env.VITE_MAGENTO_ADMIN_PASSWORD || '',
                    authMode: remoteSettings?.magento?.authMode || 'basic',
                    consumerKey: remoteSettings?.magento?.consumerKey || import.meta.env.VITE_MAGENTO_CONSUMER_KEY || '',
                    consumerSecret: remoteSettings?.magento?.consumerSecret || import.meta.env.VITE_MAGENTO_CONSUMER_SECRET || '',
                    accessToken: remoteSettings?.magento?.accessToken || import.meta.env.VITE_MAGENTO_ACCESS_TOKEN || '',
                    accessTokenSecret: remoteSettings?.magento?.accessTokenSecret || import.meta.env.VITE_MAGENTO_ACCESS_TOKEN_SECRET || ''
                },
                cegid: {
                    url: remoteSettings?.cegid?.url || import.meta.env.VITE_Cegid_API_URL || '',
                    username: remoteSettings?.cegid?.username || import.meta.env.VITE_Cegid_ADMIN_USERNAME || '',
                    password: remoteSettings?.cegid?.password || import.meta.env.VITE_Cegid_ADMIN_PASSWORD || '',
                    database: remoteSettings?.cegid?.database || import.meta.env.VITE_Cegid_ADMIN_DATABASE || ''
                }
            });
        }
    }, []);

    const handleInputChange = (service, field, value) => {
        const updatedFormData = {
            ...formData,
            [service]: {
                ...formData[service],
                [field]: value
            }
        };
        setFormData(updatedFormData);
        
        // Only update local storage
        localStorage.setItem('userApiSettings', JSON.stringify(updatedFormData));
    };

    const handleMagentoBasicAuth = async () => {
        try {
            setTestingMagentoConnection(true);
            const token = await magentoApi.login(
                formData.magento.username,
                formData.magento.password,
                formData.magento.url
            );
            // Update form data with the received token
            handleInputChange('magento', 'accessToken', token);
            toast.success(translate('profile.apiSettings.magento.tokenSuccess'));
        } catch (error) {
            console.error('Magento token error:', error);
            toast.error(error.message || translate('profile.apiSettings.magento.tokenError'));
        } finally {
            setTestingMagentoConnection(false);
        }
    };

    const handleMagentoOAuthConnect = async () => {
        try {
            setTestingMagentoConnection(true);
            const success = await magentoApi.connectOAuth(
                formData.magento.url,
                formData.magento.consumerKey,
                formData.magento.consumerSecret,
                formData.magento.accessToken,
                formData.magento.accessTokenSecret
            );
            if (success) {
                toast.success(translate('profile.apiSettings.magento.oauthSuccess'));
            }
        } catch (error) {
            console.error('Magento OAuth error:', error);
            toast.error(error.message || translate('profile.apiSettings.magento.oauthError'));
        } finally {
            setTestingMagentoConnection(false);
        }
    };

    const handleTestCegidConnection = async () => {
        try {
            setTestingCegidConnection(true);
            await cegidApi.handleCegidConnect(
                formData.cegid.url,
                formData.cegid.username,
                formData.cegid.password,
                formData.cegid.database
            );
            toast.success(translate('profile.apiSettings.cegid.testSuccess'));
        } catch (error) {
            console.error('Cegid connection error:', error);
            toast.error(error.message || translate('profile.apiSettings.cegid.testError'));
        } finally {
            setTestingCegidConnection(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Magento API Settings */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                {translate('profile.apiSettings.magento.title')}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <TextField
                        size="small"
                        fullWidth
                        label={translate('profile.apiSettings.magento.url')}
                        value={formData.magento.url}
                        onChange={(e) => handleInputChange('magento', 'url', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>{translate('profile.apiSettings.magento.authMode')}</InputLabel>
                        <Select
                            value={formData.magento.authMode}
                            onChange={(e) => handleInputChange('magento', 'authMode', e.target.value)}
                            label={translate('profile.apiSettings.magento.authMode')}
                        >
                            <MenuItem value="basic">Basic Auth</MenuItem>
                            <MenuItem value="oauth">OAuth</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Basic Auth Fields */}
                <Collapse in={formData.magento.authMode === 'basic'} sx={{ width: '100%' }}>
                    <Grid container spacing={2} sx={{ mt: 0, ml: 0 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                size="small"
                                fullWidth
                                label={translate('profile.apiSettings.magento.username')}
                                value={formData.magento.username}
                                onChange={(e) => handleInputChange('magento', 'username', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                size="small"
                                fullWidth
                                type="password"
                                label={translate('profile.apiSettings.magento.password')}
                                value={formData.magento.password}
                                onChange={(e) => handleInputChange('magento', 'password', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleMagentoBasicAuth}
                                disabled={testingMagentoConnection}
                                sx={{ mt: 1 }}
                            >
                                {testingMagentoConnection ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    translate('profile.apiSettings.magento.getToken')
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </Collapse>

                {/* OAuth Fields */}
                <Collapse in={formData.magento.authMode === 'oauth'} sx={{ width: '100%' }}>
                    <Grid container spacing={2} sx={{ mt: 0, ml: 0 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                size="small"
                                fullWidth
                                label={translate('profile.apiSettings.magento.consumerKey')}
                                value={formData.magento.consumerKey || ''}
                                onChange={(e) => handleInputChange('magento', 'consumerKey', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                size="small"
                                fullWidth
                                label={translate('profile.apiSettings.magento.consumerSecret')}
                                value={formData.magento.consumerSecret || ''}
                                onChange={(e) => handleInputChange('magento', 'consumerSecret', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                size="small"
                                fullWidth
                                label={translate('profile.apiSettings.magento.accessToken')}
                                value={formData.magento.accessToken || ''}
                                onChange={(e) => handleInputChange('magento', 'accessToken', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                size="small"
                                fullWidth
                                label={translate('profile.apiSettings.magento.accessTokenSecret')}
                                value={formData.magento.accessTokenSecret || ''}
                                onChange={(e) => handleInputChange('magento', 'accessTokenSecret', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleMagentoOAuthConnect}
                                disabled={testingMagentoConnection}
                                sx={{ mt: 1 }}
                            >
                                {testingMagentoConnection ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    translate('profile.apiSettings.magento.connect')
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </Collapse> 
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
                        label={translate('profile.apiSettings.cegid.url')}
                        value={formData.cegid.url}
                        onChange={(e) => handleInputChange('cegid', 'url', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        size="small"
                        fullWidth
                        label={translate('profile.apiSettings.cegid.username')}
                        value={formData.cegid.username}
                        onChange={(e) => handleInputChange('cegid', 'username', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        size="small"
                        fullWidth
                        type="password"
                        label={translate('profile.apiSettings.cegid.password')}
                        value={formData.cegid.password}
                        onChange={(e) => handleInputChange('cegid', 'password', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        size="small"
                        fullWidth
                        label={translate('profile.apiSettings.cegid.database')}
                        value={formData.cegid.database}
                        onChange={(e) => handleInputChange('cegid', 'database', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleTestCegidConnection}
                        disabled={testingCegidConnection || !formData.cegid.url || !formData.cegid.username || !formData.cegid.password || !formData.cegid.database}
                        startIcon={testingCegidConnection ? <CircularProgress size={20} color="inherit" /> : null}
                        sx={{ mt: 2 }}
                    >
                        {testingCegidConnection ? (
                            <CircularProgress size={24} />
                        ) : (
                            translate('profile.apiSettings.cegid.testConnection')
                        )}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ApiSettingsTab;