import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Grid, 
    Paper, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Switch, 
    FormControlLabel, 
    RadioGroup, 
    Radio,
    Divider,
    Button
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { languages } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';

const PreferencesTab = ({ onUpdateUserData }) => {
    const { currentUser } = useAuth();
    const { translate, currentLanguage, setLanguage } = useLanguage();
    const { themeMode, setThemeMode } = useTheme();
    
    const [preferences, setPreferences] = useState({
        language: currentLanguage,
        theme: themeMode,
        fontSize: 'medium',
        notifications: {
            email: false,
            sms: false,
            push: false,
            marketing: false
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPreferences(prev => ({
            ...prev,
            [name]: value
        }));
    
        // Apply changes immediately
        if (name === 'language') {
            setLanguage(value);
        }
        if (name === 'theme') {
            setThemeMode(value);
        }
      onUpdateUserData({
        preferences: {
            ...preferences,
            [name]: value
        }
    }, 'preferences');    };
    
    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setPreferences(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [name]: checked
            }
        }));
    };

    const handleSave = async () => {
        try {
            await onUpdateUserData({
                preferences: {
                    language: preferences.language,
                    theme: preferences.theme,
                    fontSize: preferences.fontSize,
                    notifications: preferences.notifications
                }
            }, 'preferences');

            toast.success(translate('preferences.saveSuccess'));
        } catch (error) {
            console.error('Error saving preferences:', error);
            toast.error(translate('preferences.saveError'));
        }
    };

    return (
        <Paper sx={{ p: 3, m: 2 }}>
            <Typography variant="h6" gutterBottom>
                {translate('preferences.title')}
            </Typography>

            <FormControl fullWidth margin="normal">
    <InputLabel>{translate('preferences.language')}</InputLabel>
    <Select
        name="language"
        value={preferences.language}
        label={translate('preferences.language')}
        onChange={handleChange}
    >
        {Object.entries(languages).map(([code, langData]) => (
            <MenuItem key={code} value={code}>
                {langData.name}
            </MenuItem>
        ))}
    </Select>
</FormControl>
            {/* Theme Selection */}
            <FormControl fullWidth margin="normal">
                <InputLabel>{translate('preferences.theme')}</InputLabel>
                <Select
                    name="theme"
                    value={preferences.theme}
                    label={translate('preferences.theme')}
                    onChange={handleChange}
                >
                    <MenuItem value="light">{translate('preferences.lightTheme')}</MenuItem>
                    <MenuItem value="dark">{translate('preferences.darkTheme')}</MenuItem>
                </Select>
            </FormControl>

            {/* Notifications */}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
                {translate('preferences.notifications')}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={preferences.notifications.email}
                                onChange={handleNotificationChange}
                                name="email"
                            />
                        }
                        label={translate('preferences.emailNotifications')}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={preferences.notifications.sms}
                                onChange={handleNotificationChange}
                                name="sms"
                            />
                        }
                        label={translate('preferences.smsNotifications')}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={preferences.notifications.push}
                                onChange={handleNotificationChange}
                                name="push"
                            />
                        }
                        label={translate('preferences.pushNotifications')}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={preferences.notifications.marketing}
                                onChange={handleNotificationChange}
                                name="marketing"
                            />
                        }
                        label={translate('preferences.marketingNotifications')}
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                fullWidth
            >
                {translate('preferences.save')}
            </Button>
        </Paper>
    );
};

export default PreferencesTab;