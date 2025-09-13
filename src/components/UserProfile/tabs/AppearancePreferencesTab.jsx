import React, { useState, useRef } from 'react';
import {
  Box,
  Grid2 as Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Chip,
  Stack,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  InputLabel,
  useTheme
} from '@mui/material';
import {
  Save,
  Download,
  Upload,
  ExpandMore,
  RestoreFromTrash,
  Palette,
  Accessibility,
  Security,
  Speed,
  Notifications,
  Warning,
  ViewComfy
} from '@mui/icons-material';
import { useCustomTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { toast } from 'react-toastify';
import ErrorBoundary from '../../common/ErrorBoundary';
import { SettingsLoadingIndicator } from '../../common/LoadingStates';
import { ConfirmationDialog, useFeedback, SettingsSuccessFeedback } from '../../common/FeedbackSystem';
import { getDirectionalAnimation } from '../../../utils/rtlAnimations';

const AppearancePreferencesTab = ({ userData, onUpdateUserData, loading, error }) => {
  const theme = useTheme();
  const {
    mode,
    setThemeMode,
    setFontSize,
    colorPreset,
    setColorPreset,
    density,
    setDensity,
    setAnimations,
    setHighContrast,
    animations
  } = useCustomTheme();
  const { setLanguage, translate, languages, currentLanguage } = useLanguage();
  const { settings, updateSettings, saveSettings, resetSettings, exportSettings, importSettings, isDirty } = useSettings();
  const fileInputRef = useRef(null);
  const isRTL = languages[currentLanguage]?.dir === 'rtl';

  // Enhanced feedback system
  const {
    feedback,
    showSuccess,
    hideSuccess,
    showConfirmation,
    hideConfirmation
  } = useFeedback();

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

  const handlePreferenceChange = (key, value) => {
    // Update settings in the context
    updateSettings({ [key]: value }, 'preferences');

    // Update parent component if provided
    if (onUpdateUserData) {
      onUpdateUserData({ [key]: value });
    }

    // Apply theme changes immediately for better UX
    if (key === 'theme') {
      setThemeMode(value);
    } else if (key === 'fontSize') {
      setFontSize(value);
    } else if (key === 'colorPreset') {
      setColorPreset(value);
    } else if (key === 'density') {
      setDensity(value);
    } else if (key === 'animations') {
      setAnimations(value);
    } else if (key === 'highContrast') {
      setHighContrast(value);
    } else if (key === 'language') {
      setLanguage(value);
      // Apply RTL for Arabic
      if (value === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = value;
      }
    }

    console.log(`Preference ${key} changed to:`, value);
  };

  const handleSave = async () => {
    try {
      const result = await saveSettings(true);
      if (result.success) {
        showSuccess(
          translate('feedback.settings.saved'),
          'save',
          translate('feedback.settings.saveDetails')
        );
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(translate('errors.settings.operations.saving'));
    }
  };

  const handleReset = () => {
    showConfirmation(
      translate('errors.settings.reset.dialog.title'),
      translate('errors.settings.reset.dialog.description'),
      () => {
        resetSettings();
        showSuccess(
          translate('feedback.settings.reset'),
          'reset'
        );
        hideConfirmation();
      },
      {
        severity: 'warning',
        confirmText: translate('errors.settings.reset.dialog.confirm'),
        confirmColor: 'warning',
        additionalInfo: translate('errors.settings.reset.dialog.warning')
      }
    );
  };

  const handleExport = () => {
    try {
      exportSettings();
      showSuccess(
        translate('feedback.settings.exported'),
        'export'
      );
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(translate('errors.settings.operations.exporting'));
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await importSettings(file);
        showSuccess(
          translate('feedback.settings.imported'),
          'import'
        );
      } catch (error) {
        console.error('Import failed:', error);
        toast.error(translate('errors.settings.operations.importing'));
      }
    }
    event.target.value = ''; // Reset file input
  };

  const prefs = settings?.preferences || {};

  // Show loading state
  if (loading) {
    return (
      <SettingsLoadingIndicator
        operation="loading"
        message={translate('settings.operations.loading')}
      />
    );
  }

  return (
    <ErrorBoundary componentName="AppearancePreferencesTab">
      <Box
        sx={{
          p: 3,
          direction: isRTL ? 'rtl' : 'ltr',
          ...getDirectionalAnimation('slideAndFade', 'right', isRTL, {
            duration: animations ? '0.4s' : '0s',
            easing: 'ease-out'
          })
        }}
      >
        {/* Header with Actions */}
        <Box sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          ...getDirectionalAnimation('fadeIn', 'up', isRTL, {
            duration: animations ? '0.3s' : '0s',
            delay: '0.1s'
          })
        }}>
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

        {/* Enhanced Success Feedback */}
        <SettingsSuccessFeedback
          open={feedback.success.open}
          operation={feedback.success.operation}
          details={feedback.success.details}
          onClose={hideSuccess}
          showDetails={true}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={feedback.confirmation.open}
          title={feedback.confirmation.title}
          message={feedback.confirmation.message}
          onConfirm={feedback.confirmation.onConfirm}
          onCancel={hideConfirmation}
          severity={feedback.confirmation.severity}
          confirmText={feedback.confirmation.confirmText}
          confirmColor={feedback.confirmation.confirmColor}
          additionalInfo={feedback.confirmation.additionalInfo}
        />

        {/* Appearance Settings */}
        <Accordion
          expanded={expanded.appearance}
          onChange={handleAccordionChange('appearance')}
          sx={{
            ...getDirectionalAnimation('slideAndFade', 'up', isRTL, {
              duration: animations ? '0.3s' : '0s',
              delay: '0.2s'
            })
          }}
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
                      handlePreferenceChange('language', e.target.value);
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
                    value={prefs.theme || mode || 'system'}
                    onChange={(e) => {
                      handlePreferenceChange('theme', e.target.value);
                      setThemeMode(e.target.value);
                    }}
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
                      handlePreferenceChange('fontSize', e.target.value);
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
                    value={density || 'standard'}
                    onChange={(e) => {
                      handlePreferenceChange('density', e.target.value);
                      setDensity(e.target.value);
                    }}
                    label={translate('profile.preferences.appearance.density.title')}
                  >
                    <MenuItem value="compact">{translate('profile.preferences.appearance.density.compact')}</MenuItem>
                    <MenuItem value="standard">{translate('profile.preferences.appearance.density.standard')}</MenuItem>
                    <MenuItem value="comfortable">{translate('profile.preferences.appearance.density.comfortable')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Color Preset */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Color Theme</InputLabel>
                  <Select
                    value={colorPreset || 'techno'}
                    onChange={(e) => {
                      handlePreferenceChange('colorPreset', e.target.value);
                      setColorPreset(e.target.value);
                    }}
                    label="Color Theme"
                  >
                    <MenuItem value="techno">Techno Orange</MenuItem>
                    <MenuItem value="blue">Professional Blue</MenuItem>
                    <MenuItem value="green">Nature Green</MenuItem>
                    <MenuItem value="purple">Creative Purple</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Animations */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={prefs.animations !== false}
                      onChange={(e) => handlePreferenceChange('animations', e.target.checked)}
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
                  onChange={(e, value) => handlePreferenceChange('defaultPageSize', value)}
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
                  onChange={(e, value) => handlePreferenceChange('refreshInterval', value)}
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
                        onChange={(e) => handlePreferenceChange('enableVirtualization', e.target.checked)}
                      />
                    }
                    label={translate('profile.preferences.performance.enableVirtualization.title')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={prefs.cacheEnabled !== false}
                        onChange={(e) => handlePreferenceChange('cacheEnabled', e.target.checked)}
                      />
                    }
                    label={translate('profile.preferences.performance.cacheEnabled.title')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={prefs.autoRefresh === true}
                        onChange={(e) => handlePreferenceChange('autoRefresh', e.target.checked)}
                      />
                    }
                    label={translate('profile.preferences.performance.autoRefresh.title')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={prefs.lazyLoading !== false}
                        onChange={(e) => handlePreferenceChange('lazyLoading', e.target.checked)}
                      />
                    }
                    label={translate('profile.preferences.performance.lazyLoading.title')}
                  />
                </Stack>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Grid Settings */}
        <Accordion
          expanded={expanded.grid}
          onChange={handleAccordionChange('grid')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ViewComfy color="primary" />
              <Typography variant="h6">Grid Preferences</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={prefs.showStatsCards !== false}
                      onChange={(e) => handlePreferenceChange('showStatsCards', e.target.checked)}
                    />
                  }
                  label="Show Statistics Cards"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={prefs.enableGridFilters !== false}
                      onChange={(e) => handlePreferenceChange('enableGridFilters', e.target.checked)}
                    />
                  }
                  label="Enable Grid Filters"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={prefs.enableColumnResize !== false}
                      onChange={(e) => handlePreferenceChange('enableColumnResize', e.target.checked)}
                    />
                  }
                  label="Enable Column Resize"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={prefs.enableRowSelection !== false}
                      onChange={(e) => handlePreferenceChange('enableRowSelection', e.target.checked)}
                    />
                  }
                  label="Enable Row Selection"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

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
                      onChange={(e) => handlePreferenceChange('highContrast', e.target.checked)}
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
                      onChange={(e) => handlePreferenceChange('largeText', e.target.checked)}
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
                      onChange={(e) => handlePreferenceChange('keyboardNavigation', e.target.checked)}
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
                      onChange={(e) => handlePreferenceChange('screenReader', e.target.checked)}
                    />
                  }
                  label={translate('profile.preferences.accessibility.screenReader.title')}
                />
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
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
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
                      onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
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
                      onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                    />
                  }
                  label={translate('profile.preferences.notifications.soundEnabled.title')}
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
                  onChange={(e, value) => handlePreferenceChange('sessionTimeout', value)}
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
                        onChange={(e) => handlePreferenceChange('twoFactorEnabled', e.target.checked)}
                      />
                    }
                    label={translate('profile.preferences.security.twoFactorEnabled.title')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={prefs.auditLogging !== false}
                        onChange={(e) => handlePreferenceChange('auditLogging', e.target.checked)}
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
    </ErrorBoundary>
  );
};

export default AppearancePreferencesTab;