import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Switch,
  TextField,
  FormControlLabel,
  Card,
  CardContent,
  Button,
  Divider,
  Alert,
  Chip,
  Stack,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Tooltip,
  IconButton,
  InputLabel
} from '@mui/material';
import {
  Save,
  Refresh,
  Download,
  Upload,
  ExpandMore,
  RestoreFromTrash,
  Palette,
  Language,
  Accessibility,
  Security,
  Dashboard,
  Speed,
  Notifications,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { useUserSettings } from '../../../hooks/useUserSettings';
import { useLanguage, languages } from '../../../contexts/LanguageContext';
import { useCustomTheme } from '../../../contexts/ThemeContext';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
  },
}));

const PreferencesTab = () => {
    const { currentUser } = useAuth();
    const { settings, updateSettings, saveSettings, resetSettings, exportSettings, importSettings, loading, isDirty } = useSettings();
    const {
        mode,
        currentLanguage,
        fontSize,
        setThemeMode,
        setLanguage,
        setFontSize,
        saveCurrentPreferences,
        resetToSystemDefaults
    } = useUserSettings();
    const languageContext = useLanguage();
    const translate = (languageContext)?.translate || ((key: string) => key);
    const { density, colorPreset, setDensity, setColorPreset } = useCustomTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [expanded, setExpanded] = useState({
        appearance: true,
        performance: false,
        notifications: false,
        security: false,
        accessibility: false,
        advanced: false
    });

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(prev => ({ ...prev,
            [panel]: isExpanded
        }));
    };

    const handlePreferenceChange = async(section: string, key: string, value) => {
        try {
            // Update settings in the context
            updateSettings({ [key]: value }, 'preferences');
            
            // Apply changes immediately using unified system
            if(key === 'theme') {
                setThemeMode(value);
            } else if(key === 'fontSize') {
                setFontSize(value);
            } else if(key === 'language') {
                setLanguage(value);
            // Auto-save after a short delay
            setTimeout(async () => {
                await saveCurrentPreferences();
            }, 1000);
            
        } catch(error: any) {
            console.error('Error updating preference:', error);
            toast.error('Failed to update preference');
    };

    const handleSave = async () => {
        try {
            await saveCurrentPreferences();
            await saveSettings();
            toast.success('Settings saved successfully');
        } catch(error: any) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
    };

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            try {
                resetToSystemDefaults();
                resetSettings();
                toast.info('Settings reset to defaults');
            } catch(error: any) {
                console.error('Error resetting settings:', error);
                toast.error('Failed to reset settings');
    };

    const handleExport = () => {
        if(exportSettings) {
            exportSettings();
    };

    const handleImport = () => {
        if(fileInputRef.current) {
            fileInputRef.current.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if(file && importSettings) {
            importSettings(file);
        event.target.value = ''; // Reset file input
    };

    const prefs = settings?.preferences || {};

    return (
        <Box sx={{ p: 3 }}>
            {/* Header with Actions */
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}></
                <Box>
                    <Typography variant="h5" gutterBottom>
                        {translate('profile.preferences.title')}
                    </Typography>
                    <Typography variant="outlined" color="text.secondary">
                        {translate('profile.preferences.description')}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {isDirty && (
                        <Chip
                            icon={<Warning />}
                            label={translate('profile.preferences.unsavedChanges')}
                            color
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleExport}
                    >
                        {translate('profile.preferences.export')}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        onClick={handleImport}
                    >
                        {translate('profile.preferences.import')}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<RestoreFromTrash />}
                        onClick={handleReset}
                        color
                        {translate('profile.preferences.reset')}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                        onClick={handleSave}
                        disabled={loading || !isDirty}
                    >
                        {translate('profile.preferences.save')}
                    </Button>
                </Stack>
            </Box>

            {/* Hidden file input for import */}
            <input
                type
                ref={fileInputRef}
                onChange={(e) => handleFileImport}
                accept
                style={{ display: 'none' }}
            />

            {/* Appearance Settings */}
            <Accordion expanded={expanded.appearance}
                onChange={(e) => handleAccordionChange('appearance')}
            >
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}></
                        <Palette color="primary" />
                        <Typography variant="h6">{translate('profile.preferences.appearance.title')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails></
                    <Grid container spacing={3}>
                        {/* Language */}
                        <Grid size={{ xs: 12, md: 6 }}></
                            <FormControl fullWidth>
                                <InputLabel>{translate('profile.preferences.appearance.language.title')}</InputLabel>
                                <Select value={prefs.language || 'en'}
                                    onChange
                                        handlePreferenceChange('preferences', 'language', e.target.value);
                                        setLanguage(e.target.value);
                                    }}
                                    label={translate('profile.preferences.appearance.language.title')}>
                                    {Object.entries(languages).map(([key, lang]: any) => (
                                        <MenuItem key={key} value={key}></
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>🌐</span>
                                                <span>{translate(`profile.preferences.appearance.language.availableLanguages.${key}`) || lang.name}</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Theme */}
                        <Grid size={{ xs: 12, md: 6 }}></
                            <FormControl fullWidth>
                                <InputLabel>{translate('profile.preferences.appearance.theme.title')}</InputLabel>
                                <Select value={prefs.theme || mode || 'system'}
                                    onChange
                                        handlePreferenceChange('preferences', 'theme', e.target.value);
                                        setThemeMode(e.target.value as 'light' | 'dark' | 'system');
                                    }}
                                    label={translate('profile.preferences.appearance.theme.title')}></
                                    <MenuItem value="light">{translate('profile.preferences.appearance.theme.light')}</MenuItem>
                                    <MenuItem value="dark">{translate('profile.preferences.appearance.theme.dark')}</MenuItem>
                                    <MenuItem value="system">{translate('profile.preferences.appearance.theme.system')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Font Size */}
                        <Grid size={{ xs: 12, md: 6 }}></
                            <FormControl fullWidth>
                                <InputLabel>{translate('profile.preferences.appearance.fontSize.title')}</InputLabel>
                                <Select value={prefs.fontSize || 'medium'}
                                    onChange
                                        handlePreferenceChange('preferences', 'fontSize', e.target.value);
                                        setFontSize(e.target.value as 'small' | 'medium' | 'large');
                                    }}
                                    label={translate('profile.preferences.appearance.fontSize.title')}></
                                    <MenuItem value="small">{translate('profile.preferences.appearance.fontSize.small')}</MenuItem>
                                    <MenuItem value="medium">{translate('profile.preferences.appearance.fontSize.medium')}</MenuItem>
                                    <MenuItem value="large">{translate('profile.preferences.appearance.fontSize.large')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Density */}
                        <Grid size={{ xs: 12, md: 6 }}></
                            <FormControl fullWidth>
                                <InputLabel>{translate('profile.preferences.appearance.density.title')}</InputLabel>
                                <Select value={density || 'standard'}
                                    onChange
                                        handlePreferenceChange('preferences', 'density', e.target.value);
                                        setDensity(e.target.value);
                                    }}
                                    label={translate('profile.preferences.appearance.density.title')}></
                                    <MenuItem value="compact">{translate('profile.preferences.appearance.density.compact')}</MenuItem>
                                    <MenuItem value="standard">{translate('profile.preferences.appearance.density.standard')}</MenuItem>
                                    <MenuItem value="comfortable">{translate('profile.preferences.appearance.density.comfortable')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Color Preset */}
                        <Grid size={{ xs: 12, md: 6 }}></
                            <FormControl fullWidth>
                                <InputLabel>Color Theme</InputLabel>
                                <Select
                                    value={colorPreset || 'techno'}
                                    onChange
                                        handlePreferenceChange('preferences', 'colorPreset', e.target.value);
                                        setColorPreset(e.target.value);
                                    }}
                                    label
                        {/* Animations */}
                        <Grid size={{ xs: 12 }}></
                            <FormControlLabel control
                                        checked={prefs.animations !== false}
                                        onChange={(e) => handlePreferenceChange('preferences', 'animations', e.target.checked)}
                                    />
                                label={translate('profile.preferences.appearance.animations.title')}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Performance Settings */}
            <Accordion expanded={expanded.performance}
                onChange={(e) => handleAccordionChange('performance')}
            >
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}></
                        <Speed color="primary" />
                        <Typography variant="h6">{translate('profile.preferences.performance.title')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails></
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}></
                            <Typography variant="subtitle1" gutterBottom>
                                {translate('profile.preferences.performance.defaultPageSize.title')}
                            </Typography>
                            <Slider value={prefs.defaultPageSize || 25}
                                onChange={(e, value) => handlePreferenceChange('preferences', 'defaultPageSize', value)}
                                min={10}
                                max={100}
                                step={5}
                                marks
                                    { value: 10, label: '10' },
                                    { value: 25, label: '25' },
                                    { value: 50, label: '50' },
                                    { value: 100, label: '100' }
                                ]}
                                valueLabelDisplay
                        <Grid size={{ xs: 12, md: 6 }}></
                            <Typography variant="subtitle1" gutterBottom>
                                {translate('profile.preferences.performance.refreshInterval.title')}
                            </Typography>
                            <Slider value={prefs.refreshInterval || 30}
                                onChange={(e, value) => handlePreferenceChange('preferences', 'refreshInterval', value)}
                                min={10}
                                max={300}
                                step={10}
                                marks
                                    { value: 10, label: '10s' },
                                    { value: 30, label: '30s' },
                                    { value: 60, label: '1m' },
                                    { value: 300, label: '5m' }
                                ]}
                                valueLabelDisplay
                                disabled={!prefs.autoRefresh}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}></
                            <Stack spacing={2}>
                                <FormControlLabel control
                                            checked={(prefs)?.enableVirtualization !== false}
                                            onChange={(e) => handlePreferenceChange('preferences', 'enableVirtualization', e.target.checked)}
                                        />
                                    label={translate('profile.preferences.performance?.enableVirtualization.title')}
                                />
                                <FormControlLabel control
                                            checked={(prefs)?.cacheEnabled !== false}
                                            onChange={(e) => handlePreferenceChange('preferences', 'cacheEnabled', e.target.checked)}
                                        />
                                    label={translate('profile.preferences.performance?.cacheEnabled.title')}
                                />
                                <FormControlLabel control
                                            checked={prefs.autoRefresh ===true}
                                            onChange={(e) => handlePreferenceChange('preferences', 'autoRefresh', e.target.checked)}
                                        />
                                    label={translate('profile.preferences.performance.autoRefresh.title')}
                                />
                                <FormControlLabel control
                                            checked={(prefs)?.lazyLoading !== false}
                                            onChange={(e) => handlePreferenceChange('preferences', 'lazyLoading', e.target.checked)}
                                        />
                                    label={translate('profile.preferences.performance?.lazyLoading.title')}
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Notifications Settings */}
            <Accordion expanded={expanded.notifications}
                onChange={(e) => handleAccordionChange('notifications')}
            >
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}></
                        <Notifications color="primary" />
                        <Typography variant="h6">{translate('profile.preferences.notifications.title')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails></
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}></
                            <FormControlLabel control
                                        checked={prefs.emailNotifications !== false}
                                        onChange={(e) => handlePreferenceChange('preferences', 'emailNotifications', e.target.checked)}
                                    />
                                label={translate('profile.preferences.notifications.emailNotifications.title')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}></
                            <FormControlLabel control
                                        checked={prefs.pushNotifications ===true}
                                        onChange={(e) => handlePreferenceChange('preferences', 'pushNotifications', e.target.checked)}
                                    />
                                label={translate('profile.preferences.notifications.pushNotifications.title')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}></
                            <FormControlLabel control
                                        checked={prefs.soundEnabled !== false}
                                        onChange={(e) => handlePreferenceChange('preferences', 'soundEnabled', e.target.checked)}
                                    />
                                label={translate('profile.preferences.notifications.soundEnabled.title')}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Accessibility Settings */}
            <Accordion expanded={expanded.accessibility}
                onChange={(e) => handleAccordionChange('accessibility')}
            >
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}></
                        <Accessibility color="primary" />
                        <Typography variant="h6">{translate('profile.preferences.accessibility.title')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails></
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}></
                            <FormControlLabel control
                                        checked={prefs.highContrast ===true}
                                        onChange={(e) => handlePreferenceChange('preferences', 'highContrast', e.target.checked)}
                                    />
                                label={translate('profile.preferences.accessibility.highContrast.title')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}></
                            <FormControlLabel control
                                        checked={(prefs)?.largeText ===true}
                                        onChange={(e) => handlePreferenceChange('preferences', 'largeText', e.target.checked)}
                                    />
                                label={translate('profile.preferences.accessibility?.largeText.title')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}></
                            <FormControlLabel control
                                        checked={(prefs)?.keyboardNavigation !== false}
                                        onChange={(e) => handlePreferenceChange('preferences', 'keyboardNavigation', e.target.checked)}
                                    />
                                label={translate('profile.preferences.accessibility?.keyboardNavigation.title')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}></
                            <FormControlLabel control
                                        checked={(prefs)?.screenReader ===true}
                                        onChange={(e) => handlePreferenceChange('preferences', 'screenReader', e.target.checked)}
                                    />
                                label={translate('profile.preferences.accessibility?.screenReader.title')}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Security Settings */}
            <Accordion expanded={expanded.security}
                onChange={(e) => handleAccordionChange('security')}
            >
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}></
                        <Security color="primary" />
                        <Typography variant="h6">{translate('profile.preferences.security.title')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails></
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}></
                            <Typography variant="subtitle1" gutterBottom>
                                {translate('profile.preferences.security.sessionTimeout.title')}
                            </Typography>
                            <Slider value={prefs.sessionTimeout || 30}
                                onChange={(e, value) => handlePreferenceChange('preferences', 'sessionTimeout', value)}
                                min={5}
                                max={120}
                                step={5}
                                marks
                                    { value: 5, label: '5m' },
                                    { value: 30, label: '30m' },
                                    { value: 60, label: '1h' },
                                    { value: 120, label: '2h' }
                                ]}
                                valueLabelDisplay
                        <Grid size={{ xs: 12 }}></
                            <Stack spacing={2}>
                                <FormControlLabel control
                                            checked={prefs.twoFactorEnabled ===true}
                                            onChange={(e) => handlePreferenceChange('preferences', 'twoFactorEnabled', e.target.checked)}
                                        />
                                    label={translate('profile.preferences.security.twoFactorEnabled.title')}
                                />
                                <FormControlLabel control
                                            checked={prefs.auditLogging !== false}
                                            onChange={(e) => handlePreferenceChange('preferences', 'auditLogging', e.target.checked)}
                                        />
                                    label={translate('profile.preferences.security.auditLogging.title')}
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default PreferencesTab;