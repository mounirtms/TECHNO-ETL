import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import cegidApi from '../../../services/cegidService';
import magentoApi from '../../../services/magentoService';

import { useLanguage } from '../../../contexts/LanguageContext';
import { useProfileController } from '../ProfileController';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Paper
} from '@mui/material';

const ApiSettingsTab = () => {
    const { translate } = useLanguage();
    const { userData, updateUserData } = useProfileController();
    const [apiSettings, setApiSettings] = useState({
        cegid: {
            url: userData?.apiSettings?.cegid?.url || '',
            username: userData?.apiSettings?.cegid?.username || '',
            password: userData?.apiSettings?.cegid?.password || '',
            database: userData?.apiSettings?.cegid?.database || ''
        },
        magento: {
            url: userData?.apiSettings?.magento?.url || '',
            username: userData?.apiSettings?.magento?.username || '',
            password: userData?.apiSettings?.magento?.password || '',
            token: userData?.apiSettings?.magento?.token || ''
        }
    });

    // Update local state when userData changes
    useEffect(() => {
        if (userData?.apiSettings) {
            setApiSettings(prev => ({
                ...prev,
                cegid: {
                    ...prev.cegid,
                    ...userData.apiSettings.cegid
                },
                magento: {
                    ...prev.magento,
                    ...userData.apiSettings.magento
                }
            }));
        }
    }, [userData]);

    const handleInputChange = (e, service) => {
        const { name, value } = e.target;
        setApiSettings(prev => ({
            ...prev,
            [service]: {
                ...prev[service],
                [name]: value
            }
        }));
    };

    const handleSaveSettings = async () => {
        try {
            await updateUserData({
                apiSettings: apiSettings
            }, 'apiSettings');
              toast.success(translate('profile.apiSettings.saveSuccess'));
        } catch (error) {
            toast.error(translate('profile.apiSettings.saveError'));
        }
    };

    const handleCegidConnect = async () => {
        const { url, username, password, database } = apiSettings.cegid;

        // Validate inputs
        if (!url || !username || !password || !database) {
            toast.error(translate('profile.apiSettings.validation.missingCegidCredentials'));
            return;
        }

        try {
            // Use cegidApi to connect
            const result = await cegidApi.handleCegidConnect(url, username, password, database);

            // Update API settings with session token
            await updateUserData({
                apiSettings: {
                    cegid: {
                        ...apiSettings.cegid,
                        sessionToken: result.sessionToken
                    }
                }
            }, 'apiSettings');

            toast.success(translate('profile.apiSettings.cegidConnectSuccess'));
        } catch (error) {
            console.error('Cegid connection error:', error);
            toast.error(translate('profile.apiSettings.cegidConnectError'));
        }
    };

    const handleGenerateMagentoToken = async () => {
        const { url, username, password } = apiSettings.magento;

        try {
            setLoading(true);
            // Use magentoService login to get token
            const token = await magentoApi.login(url, username, password);
            
            // Update apiSettings with new token
            const updatedSettings = {
                ...apiSettings,
                magento: {
                    ...apiSettings.magento,
                    token
                }
            };

            // Save to user profile
            await updateUserData({
                apiSettings: updatedSettings
            }, 'apiSettings');

            setApiSettings(updatedSettings);
            toast.success(translate('profile.apiSettings.magento.tokenSuccess'));
        } catch (error) {
            console.error('Magento token generation error:', error);
            toast.error(translate('profile.apiSettings.magento.tokenError'));
        } finally {
            setLoading(false);
        }
    };
 

    return (
        <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                {translate('profile.apiSettings.cegid.title')}
            </Typography>

            <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        margin="dense"
                        label={translate('profile.apiSettings.cegid.url')}
                        name="url"
                        value={apiSettings.cegid.url}
                        onChange={(e) => handleInputChange(e, 'cegid')}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        margin="dense"
                        label={translate('profile.apiSettings.cegid.username')}
                        name="username"
                        value={apiSettings.cegid.username}
                        onChange={(e) => handleInputChange(e, 'cegid')}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        margin="dense"
                        label={translate('profile.apiSettings.cegid.password')}
                        type="password"
                        name="password"
                        value={apiSettings.cegid.password}
                        onChange={(e) => handleInputChange(e, 'cegid')}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        margin="dense"
                        label={translate('profile.apiSettings.cegid.database')}
                        name="database"
                        value={apiSettings.cegid.database}
                        onChange={(e) => handleInputChange(e, 'cegid')}
                    />
                </Grid>
            </Grid>

            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleCegidConnect}
                sx={{ mt: 2, mr: 2 }}
            >
                {translate('profile.apiSettings.cegid.connect')}
            </Button>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                {translate('profile.apiSettings.magento.title')}
            </Typography>

            <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        margin="dense"
                        label={translate('profile.apiSettings.magento.url')}
                        name="url"
                        value={apiSettings.magento.url}
                        onChange={(e) => handleInputChange(e, 'magento')}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        margin="dense"
                        label={translate('profile.apiSettings.magento.username')}
                        name="username"
                        value={apiSettings.magento.username}
                        onChange={(e) => handleInputChange(e, 'magento')}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        margin="dense"
                        label={translate('profile.apiSettings.magento.password')}
                        type="password"
                        name="password"
                        value={apiSettings.magento.password}
                        onChange={(e) => handleInputChange(e, 'magento')}
                    />
                </Grid>
            </Grid>

            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleGenerateMagentoToken}
                sx={{ mt: 2 }}
            >
                {translate('profile.apiSettings.magento.generateToken')}
            </Button>

            <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveSettings}
                >
                    {translate('profile.apiSettings.save')}
                </Button>
        </Paper>
    );
};

export default ApiSettingsTab;