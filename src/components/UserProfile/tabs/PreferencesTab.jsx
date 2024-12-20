import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, FormControl, Select, MenuItem, Switch, TextField, FormControlLabel } from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfileController } from '../ProfileController';
import { styled } from '@mui/material/styles';

const PreferencesTab = () => {
    const { mode, toggleTheme, fontSize, setFontSize } = useTheme();
    const { currentLanguage, setLanguage, translate, languages } = useLanguage();
    const { currentUser } = useAuth();
    const { updateUserData } = useProfileController();
    const [formData, setFormData] = useState({
        language: currentLanguage,
        theme: mode,
        fontSize: fontSize || 'medium'
    });

    // Load data only once on mount
    useEffect(() => {
        const remoteSettings = currentUser?.preferences;
        if (remoteSettings) {
            setFormData({
                ...remoteSettings,
                fontSize: remoteSettings.fontSize || 'medium'
            });
            
            // Apply settings
            if (remoteSettings.language !== currentLanguage) {
                setLanguage(remoteSettings.language);
            }
            if (remoteSettings.theme !== mode) {
                toggleTheme();
            }
            if (remoteSettings.fontSize && remoteSettings.fontSize !== fontSize) {
                setFontSize(remoteSettings.fontSize);
            }
        }
    }, [currentUser]);

    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        setLanguage(newLanguage);
        
        const updatedPreferences = {
            ...formData,
            language: newLanguage
        };
        setFormData(updatedPreferences);
        
        // Only update local storage
        localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    };

    const handleFontSizeChange = (event) => {
        const newSize = event.target.value;
        setFontSize(newSize);
        
        const updatedPreferences = {
            ...formData,
            fontSize: newSize
        };
        setFormData(updatedPreferences);
        
        // Only update local storage
        localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    };

    const handleThemeChange = () => {
        const newTheme = mode === 'light' ? 'dark' : 'light';
        toggleTheme();
        
        const updatedPreferences = {
            ...formData,
            theme: newTheme
        };
        setFormData(updatedPreferences);
        
        // Only update local storage
        localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* Language Settings */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        {translate('profile.preferences.language.title')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        {translate('profile.preferences.language.description')}
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            value={formData.language}
                            onChange={handleLanguageChange}
                            size="small"
                        >
                            {Object.entries(languages).map(([code, lang]) => (
                                <MenuItem key={code} value={code}>
                                    {translate(`profile.preferences.language.availableLanguages.${code}`)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Theme Settings */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        {translate('profile.preferences.theme.title')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        {translate('profile.preferences.theme.description')}
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.theme === 'dark'}
                                onChange={handleThemeChange}
                                name="themeMode"
                            />
                        }
                        label={translate(`profile.preferences.theme.${formData.theme}Mode`)}
                    />
                </Grid>

                {/* Notification Settings */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        {translate('profile.preferences.notifications.title')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        {translate('profile.preferences.notifications.description')}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={<Switch defaultChecked />}
                                label={translate('profile.preferences.notifications.email')}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={<Switch defaultChecked />}
                                label={translate('profile.preferences.notifications.push')}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={<Switch />}
                                label={translate('profile.preferences.notifications.sms')}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={<Switch defaultChecked />}
                                label={translate('profile.preferences.notifications.marketing')}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Accessibility Settings */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        {translate('profile.preferences.accessibility.title')}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={<Switch />}
                                label={translate('profile.preferences.accessibility.highContrast.title')}
                            />
                            <Typography variant="body2" color="textSecondary">
                                {translate('profile.preferences.accessibility.highContrast.description')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <Typography variant="subtitle2" gutterBottom>
                                    {translate('profile.preferences.accessibility.fontSize.title')}
                                </Typography>
                                <Select
                                    value={formData.fontSize}
                                    onChange={handleFontSizeChange}
                                    size="small"
                                >
                                    <MenuItem value="small">{translate('profile.preferences.accessibility.fontSize.small')}</MenuItem>
                                    <MenuItem value="medium">{translate('profile.preferences.accessibility.fontSize.medium')}</MenuItem>
                                    <MenuItem value="large">{translate('profile.preferences.accessibility.fontSize.large')}</MenuItem>
                                </Select>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    {translate('profile.preferences.accessibility.fontSize.description')}
                                </Typography>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PreferencesTab;