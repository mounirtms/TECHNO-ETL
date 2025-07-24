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
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
  },
}));

const PreferencesTab = () => {
    const { mode, toggleTheme, fontSize, setFontSize } = useTheme();
    const { currentLanguage, setLanguage, translate, languages } = useLanguage();
    const { currentUser } = useAuth();
    const { settings, updateSettings, saveSettings, resetSettings, exportSettings, importSettings, loading, isDirty } = useSettings();
    const fileInputRef = useRef(null);

    const [expanded, setExpanded] = useState({
        appearance: true,
        performance: false,
        notifications: false,
        security: false,
        accessibility: false,
        advanced: false
    });

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(prev => ({
            ...prev,
            [panel]: isExpanded
        }));
    };

    const handlePreferenceChange = (section, key, value) => {
        updateSettings({ [key]: value }, 'preferences');
    };

    const handleSave = async () => {
        const result = await saveSettings(true);
        if (result.success) {
            toast.success('Settings saved successfully!');
        }
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            resetSettings();
        }
    };

    const handleExport = () => {
        exportSettings();
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            importSettings(file);
        }
        event.target.value = ''; // Reset file input
    };

    const prefs = settings?.preferences || {};

    return (
        <Box sx={{ p: 3 }}>
            {/* Header with Actions */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" gutterBottom>
                        {translate('profile.preferences.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {translate('profile.preferences.description')}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {isDirty && (
                        <Chip
                            icon={<Warning />}
                            label={translate('profile.preferences.unsavedChanges')}
                            color="warning"
                            size="small"
                        />
                    )}
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Download />}
                        onClick={handleExport}
                    >
                        {translate('profile.preferences.export')}
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Upload />}
                        onClick={handleImport}
                    >
                        {translate('profile.preferences.import')}
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RestoreFromTrash />}
                        onClick={handleReset}
                        color="error"
                    >
                        {translate('profile.preferences.reset')}
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
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
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                style={{ display: 'none' }}
            />

            {/* Appearance Settings */}
            <Accordion
                expanded={expanded.appearance}
                onChange={handleAccordionChange('appearance')}
            >
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Palette color="primary" />
                        <Typography variant="h6">{translate('profile.preferences.appearance.title')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                        {/* Language */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>{translate('profile.preferences.appearance.language.title')}</InputLabel>
                                <Select
                                    value={prefs.language || 'en'}
                                    onChange={(e) => {
                                        handlePreferenceChange('preferences', 'language', e.target.value);
                                        setLanguage(e.target.value);
                                    }}
                                    label={translate('profile.preferences.appearance.language.title')}
                                >
                                    {Object.entries(languages).map(([key, lang]) => (
                                        <MenuItem key={key} value={key}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{lang.flag || '🌐'}</span>
                                                <span>{translate(`profile.preferences.appearance.language.availableLanguages.${key}`) || lang.name}</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Theme */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>{translate('profile.preferences.appearance.theme.title')}</InputLabel>
                                <Select
                                    value={prefs.theme || 'system'}
                                    onChange={(e) => handlePreferenceChange('preferences', 'theme', e.target.value)}
                                    label={translate('profile.preferences.appearance.theme.title')}
                                >
                                    <MenuItem value="light">{translate('profile.preferences.appearance.theme.light')}</MenuItem>
                                    <MenuItem value="dark">{translate('profile.preferences.appearance.theme.dark')}</MenuItem>
                                    <MenuItem value="system">{translate('profile.preferences.appearance.theme.system')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Font Size */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>{translate('profile.preferences.appearance.fontSize.title')}</InputLabel>
                                <Select
                                    value={prefs.fontSize || 'medium'}
                                    onChange={(e) => {
                                        handlePreferenceChange('preferences', 'fontSize', e.target.value);
                                        setFontSize(e.target.value);
                                    }}
                                    label={translate('profile.preferences.appearance.fontSize.title')}
                                >
                                    <MenuItem value="small">{translate('profile.preferences.appearance.fontSize.small')}</MenuItem>
                                    <MenuItem value="medium">{translate('profile.preferences.appearance.fontSize.medium')}</MenuItem>
                                    <MenuItem value="large">{translate('profile.preferences.appearance.fontSize.large')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Density */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>{translate('profile.preferences.appearance.density.title')}</InputLabel>
                                <Select
                                    value={prefs.density || 'standard'}
                                    onChange={(e) => handlePreferenceChange('preferences', 'density', e.target.value)}
                                    label={translate('profile.preferences.appearance.density.title')}
                                >
                                    <MenuItem value="compact">{translate('profile.preferences.appearance.density.compact')}</MenuItem>
                                    <MenuItem value="standard">{translate('profile.preferences.appearance.density.standard')}</MenuItem>
                                    <MenuItem value="comfortable">{translate('profile.preferences.appearance.density.comfortable')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Animations */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={prefs.animations !== false}
                                        onChange={(e) => handlePreferenceChange('preferences', 'animations', e.target.checked)}
                                    />
                                }
                                label={translate('profile.preferences.appearance.animations.title')}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Performance Settings */}
            <Accordion
                expanded={expanded.performance}
                onChange={handleAccordionChange('performance')}
            >
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Speed color="primary" />
                        <Typography variant="h6">{translate('profile.preferences.performance.title')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                {translate('profile.preferences.performance.defaultPageSize.title')}
                            </Typography>
                            <Slider
                                value={prefs.defaultPageSize || 25}
                                onChange={(e, value) => handlePreferenceChange('preferences', 'defaultPageSize', value)}
                                min={10}
                                max={100}
                                step={5}
                                marks={[
                                    { value: 10, label: '10' },
                                    { value: 25, label: '25' },
                                    { value: 50, label: '50' },
                                    { value: 100, label: '100' }
                                ]}
                                valueLabelDisplay="auto"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                {translate('profile.preferences.performance.refreshInterval.title')}
                            </Typography>
                            <Slider
                                value={prefs.refreshInterval || 30}
                                onChange={(e, value) => handlePreferenceChange('preferences', 'refreshInterval', value)}
                                min={10}
                                max={300}
                                step={10}
                                marks={[
                                    { value: 10, label: '10s' },
                                    { value: 30, label: '30s' },
                                    { value: 60, label: '1m' },
                                    { value: 300, label: '5m' }
                                ]}
                                valueLabelDisplay="auto"
                                disabled={!prefs.autoRefresh}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Stack spacing={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={prefs.enableVirtualization !== false}
                                            onChange={(e) => handlePreferenceChange('preferences', 'enableVirtualization', e.target.checked)}
                                        />
                                    }
                                    label={translate('profile.preferences.performance.enableVirtualization.title')}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={prefs.cacheEnabled !== false}
                                            onChange={(e) => handlePreferenceChange('preferences', 'cacheEnabled', e.target.checked)}
                                        />
                                    }
                                    label={translate('profile.preferences.performance.cacheEnabled.title')}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={prefs.autoRefresh === true}
                                            onChange={(e) => handlePreferenceChange('preferences', 'autoRefresh', e.target.checked)}
                                        />
                                    }
                                    label={translate('profile.preferences.performance.autoRefresh.title')}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={prefs.lazyLoading !== false}
                                            onChange={(e) => handlePreferenceChange('preferences', 'lazyLoading', e.target.checked)}
                                        />
                                    }
                                    label={translate('profile.preferences.performance.lazyLoading.title')}
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Notifications Settings */}
            <Accordion
                expanded={expanded.notifications}
                onChange={handleAccordionChange('notifications')}
            >
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Notifications color="primary" />
                        <Typography variant="h6">{translate('profile.preferences.notifications.title')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={prefs.emailNotifications !== false}
                                        onChange={(e) => handlePreferenceChange('preferences', 'emailNotifications', e.target.checked)}
                                    />
                                }
                                label={translate('profile.preferences.notifications.emailNotifications.title')}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={prefs.pushNotifications === true}
                                        onChange={(e) => handlePreferenceChange('preferences', 'pushNotifications', e.target.checked)}
                                    />
                                }
                                label={translate('profile.preferences.notifications.pushNotifications.title')}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={prefs.soundEnabled !== false}
                                        onChange={(e) => handlePreferenceChange('preferences', 'soundEnabled', e.target.checked)}
                                    />
                                }
                                label={translate('profile.preferences.notifications.soundEnabled.title')}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

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

            {/* Accessibility Settings */}
            <Accordion
                expanded={expanded.accessibility}
                onChange={handleAccordionChange('accessibility')}
            >
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Accessibility color="primary" />
                        <Typography variant="h6">{translate('profile.preferences.accessibility.title')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={prefs.highContrast === true}
                                        onChange={(e) => handlePreferenceChange('preferences', 'highContrast', e.target.checked)}
                                    />
                                }
                                label={translate('profile.preferences.accessibility.highContrast.title')}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={prefs.largeText === true}
                                        onChange={(e) => handlePreferenceChange('preferences', 'largeText', e.target.checked)}
                                    />
                                }
                                label={translate('profile.preferences.accessibility.largeText.title')}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={prefs.keyboardNavigation !== false}
                                        onChange={(e) => handlePreferenceChange('preferences', 'keyboardNavigation', e.target.checked)}
                                    />
                                }
                                label={translate('profile.preferences.accessibility.keyboardNavigation.title')}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={prefs.screenReader === true}
                                        onChange={(e) => handlePreferenceChange('preferences', 'screenReader', e.target.checked)}
                                    />
                                }
                                label={translate('profile.preferences.accessibility.screenReader.title')}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Security Settings */}
            <Accordion
                expanded={expanded.security}
                onChange={handleAccordionChange('security')}
            >
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Security color="primary" />
                        <Typography variant="h6">{translate('profile.preferences.security.title')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                {translate('profile.preferences.security.sessionTimeout.title')}
                            </Typography>
                            <Slider
                                value={prefs.sessionTimeout || 30}
                                onChange={(e, value) => handlePreferenceChange('preferences', 'sessionTimeout', value)}
                                min={5}
                                max={120}
                                step={5}
                                marks={[
                                    { value: 5, label: '5m' },
                                    { value: 30, label: '30m' },
                                    { value: 60, label: '1h' },
                                    { value: 120, label: '2h' }
                                ]}
                                valueLabelDisplay="auto"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Stack spacing={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={prefs.twoFactorEnabled === true}
                                            onChange={(e) => handlePreferenceChange('preferences', 'twoFactorEnabled', e.target.checked)}
                                        />
                                    }
                                    label={translate('profile.preferences.security.twoFactorEnabled.title')}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={prefs.auditLogging !== false}
                                            onChange={(e) => handlePreferenceChange('preferences', 'auditLogging', e.target.checked)}
                                        />
                                    }
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