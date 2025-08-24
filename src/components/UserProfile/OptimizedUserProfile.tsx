/**
 * Optimized User Profile Component for TECHNO-ETL
 * Consolidates all user profile and settings functionality with optimized performance
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Settings,
  Language,
  Palette,
  Save,
  RestoreFromTrash,
  Download,
  Upload,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { getUnifiedSettings, saveUnifiedSettings } from '../../utils/unifiedSettingsManager';
import { toast } from 'react-hot-toast';

// Tab panel component
const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({
  children,
  value,
  index,
}) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const OptimizedUserProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const { translate } = useLanguage();
  const theme = useCustomTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Get current settings from unified settings manager
  const currentSettings = useMemo(() => getUnifiedSettings(), []);
  const [localSettings, setLocalSettings] = useState(currentSettings);

  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    bio: '',
    location: '',
    website: '',
    showEmail: false,
  });

  // Update local settings when unified settings change
  useEffect(() => {
    const updatedSettings = getUnifiedSettings();
    setLocalSettings(updatedSettings);
  }, []);

  // Handle theme-specific settings update
  const handleThemeSettingUpdate = useCallback((setting: string, value: any) => {
    const updatedSettings = {
      ...localSettings,
      [setting]: value,
    };
    
    setLocalSettings(updatedSettings);
    setIsDirty(true);

    // Apply theme changes immediately through ThemeContext
    switch (setting) {
      case 'theme':
        theme.setThemeMode(value);
        break;
      case 'fontSize':
        theme.setFontSize(value);
        break;
      case 'colorPreset':
        theme.setColorPreset(value);
        break;
      case 'density':
        theme.setDensity(value);
        break;
      case 'animations':
        theme.setAnimations(value);
        break;
      case 'highContrast':
        theme.setHighContrast(value);
        break;
    }
  }, [localSettings, theme]);

  // Handle non-theme settings update  
  const handleSettingUpdate = useCallback((updates: any, section?: string) => {
    const updatedSettings = section 
      ? {
          ...localSettings,
          [section]: {
            ...localSettings[section],
            ...updates,
          },
        }
      : {
          ...localSettings,
          ...updates,
        };
    
    setLocalSettings(updatedSettings);
    setIsDirty(true);
  }, [localSettings]);

  // Save all settings
  const handleSave = useCallback(async () => {
    try {
      const result = saveUnifiedSettings(localSettings);
      
      if (result) {
        setIsDirty(false);
        setShowSuccess(true);
        toast.success('Settings saved successfully!');
        
        // Dispatch event to notify theme context
        window.dispatchEvent(new CustomEvent('settingsChanged', {
          detail: localSettings
        }));
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setShowError(true);
      toast.error('Failed to save settings');
    }
  }, [localSettings]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    try {
      // Clear local storage and reset to defaults
      localStorage.removeItem('techno-etl-unified-settings');
      const defaultSettings = getUnifiedSettings();
      setLocalSettings(defaultSettings);
      setIsDirty(true);
      
      // Reset theme through context
      theme.setThemeMode(defaultSettings.theme || 'system');
      theme.setFontSize(defaultSettings.fontSize || 'medium');
      theme.setColorPreset(defaultSettings.colorPreset || 'techno');
      theme.setDensity(defaultSettings.density || 'standard');
      theme.setAnimations(defaultSettings.animations !== false);
      theme.setHighContrast(defaultSettings.highContrast === true);
      
      toast.success('Settings reset to defaults');
      setShowSuccess(true);
    } catch (error) {
      console.error('Reset error:', error);
      setErrorMessage('Failed to reset settings');
      setShowError(true);
      toast.error('Failed to reset settings');
    }
  }, [theme]);

  // Export settings
  const handleExport = useCallback(() => {
    try {
      const dataStr = JSON.stringify(localSettings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `techno-etl-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Settings exported successfully!');
      setShowSuccess(true);
    } catch (error) {
      console.error('Export error:', error);
      setErrorMessage('Failed to export settings');
      setShowError(true);
      toast.error('Failed to export settings');
    }
  }, [localSettings]);

  // Import settings
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setLocalSettings(importedSettings);
        setIsDirty(true);
        
        // Apply imported theme settings
        if (importedSettings.theme) theme.setThemeMode(importedSettings.theme);
        if (importedSettings.fontSize) theme.setFontSize(importedSettings.fontSize);
        if (importedSettings.colorPreset) theme.setColorPreset(importedSettings.colorPreset);
        if (importedSettings.density) theme.setDensity(importedSettings.density);
        if (importedSettings.animations !== undefined) theme.setAnimations(importedSettings.animations);
        if (importedSettings.highContrast !== undefined) theme.setHighContrast(importedSettings.highContrast);
        
        toast.success('Settings imported successfully!');
        setShowSuccess(true);
      } catch (error) {
        console.error('Import error:', error);
        setErrorMessage('Invalid settings file');
        setShowError(true);
        toast.error('Invalid settings file');
      }
    };
    reader.readAsText(file);
  }, [theme]);

  // Personal Info Tab
  const PersonalInfoTab = useMemo(() => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Display Name"
          value={personalInfo.displayName}
          onChange={(e) => setPersonalInfo(prev => ({ ...prev, displayName: e.target.value }))}
          variant="outlined"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Email"
          value={personalInfo.email}
          disabled
          variant="outlined"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Bio"
          value={personalInfo.bio}
          onChange={(e) => setPersonalInfo(prev => ({ ...prev, bio: e.target.value }))}
          variant="outlined"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Location"
          value={personalInfo.location}
          onChange={(e) => setPersonalInfo(prev => ({ ...prev, location: e.target.value }))}
          variant="outlined"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Website"
          value={personalInfo.website}
          onChange={(e) => setPersonalInfo(prev => ({ ...prev, website: e.target.value }))}
          variant="outlined"
        />
      </Grid>
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={personalInfo.showEmail}
              onChange={(e) => setPersonalInfo(prev => ({ ...prev, showEmail: e.target.checked }))}
            />
          }
          label="Show email publicly"
        />
      </Grid>
    </Grid>
  ), [personalInfo]);

  // Appearance Settings Tab
  const AppearanceTab = useMemo(() => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Theme</InputLabel>
          <Select
            value={localSettings.theme || theme.mode}
            onChange={(e) => handleThemeSettingUpdate('theme', e.target.value)}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="system">System</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Language</InputLabel>
          <Select
            value={localSettings.language || 'en'}
            onChange={(e) => handleSettingUpdate({ language: e.target.value })}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="fr">Français</MenuItem>
            <MenuItem value="ar">العربية</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Font Size</InputLabel>
          <Select
            value={localSettings.fontSize || theme.fontSize}
            onChange={(e) => handleThemeSettingUpdate('fontSize', e.target.value)}
          >
            <MenuItem value="small">Small</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="large">Large</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Density</InputLabel>
          <Select
            value={localSettings.density || theme.density}
            onChange={(e) => handleThemeSettingUpdate('density', e.target.value)}
          >
            <MenuItem value="compact">Compact</MenuItem>
            <MenuItem value="standard">Standard</MenuItem>
            <MenuItem value="comfortable">Comfortable</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Color Preset</InputLabel>
          <Select
            value={localSettings.colorPreset || theme.colorPreset}
            onChange={(e) => handleThemeSettingUpdate('colorPreset', e.target.value)}
          >
            <MenuItem value="techno">Techno Orange</MenuItem>
            <MenuItem value="blue">Blue</MenuItem>
            <MenuItem value="green">Green</MenuItem>
            <MenuItem value="purple">Purple</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.animations ?? theme.animations}
              onChange={(e) => handleThemeSettingUpdate('animations', e.target.checked)}
            />
          }
          label="Enable animations"
        />
      </Grid>
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.highContrast ?? theme.highContrast}
              onChange={(e) => handleThemeSettingUpdate('highContrast', e.target.checked)}
            />
          }
          label="High contrast mode"
        />
      </Grid>
    </Grid>
  ), [localSettings, theme, handleThemeSettingUpdate, handleSettingUpdate]);

  // Performance Settings Tab
  const PerformanceTab = useMemo(() => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Default Page Size</InputLabel>
          <Select
            value={localSettings.performance?.defaultPageSize || 25}
            onChange={(e) => handleSettingUpdate({ defaultPageSize: e.target.value as number }, 'performance')}
          >
            <MenuItem value={10}>10 rows</MenuItem>
            <MenuItem value={25}>25 rows</MenuItem>
            <MenuItem value={50}>50 rows</MenuItem>
            <MenuItem value={100}>100 rows</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.performance?.enableVirtualization ?? true}
              onChange={(e) => handleSettingUpdate({ enableVirtualization: e.target.checked }, 'performance')}
            />
          }
          label="Enable virtualization for large datasets"
        />
      </Grid>
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.performance?.lazyLoading ?? true}
              onChange={(e) => handleSettingUpdate({ lazyLoading: e.target.checked }, 'performance')}
            />
          }
          label="Enable lazy loading"
        />
      </Grid>
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.performance?.cacheEnabled ?? true}
              onChange={(e) => handleSettingUpdate({ cacheEnabled: e.target.checked }, 'performance')}
            />
          }
          label="Enable caching"
        />
      </Grid>
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.performance?.autoRefresh ?? false}
              onChange={(e) => handleSettingUpdate({ autoRefresh: e.target.checked }, 'performance')}
            />
          }
          label="Auto refresh data"
        />
      </Grid>
    </Grid>
  ), [localSettings, handleSettingUpdate]);

  return (
    <Paper elevation={3} sx={{ maxWidth: 1000, margin: 'auto', mt: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="profile tabs"
        >
          <Tab icon={<Person />} label="Personal Info" />
          <Tab icon={<Palette />} label="Appearance" />
          <Tab icon={<Settings />} label="Performance" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {PersonalInfoTab}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {AppearanceTab}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {PerformanceTab}
      </TabPanel>

      {/* Action Bar */}
      <Box sx={{ 
        p: 3, 
        borderTop: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export
          </Button>
          <input
            accept=".json"
            style={{ display: 'none' }}
            id="import-settings-file"
            type="file"
            onChange={handleImport}
          />
          <label htmlFor="import-settings-file">
            <Button
              variant="outlined"
              startIcon={<Upload />}
              component="span"
            >
              Import
            </Button>
          </label>
          <Button
            variant="outlined"
            startIcon={<RestoreFromTrash />}
            onClick={handleReset}
            color="warning"
          >
            Reset
          </Button>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={!isDirty}
          color="primary"
        >
          Save Changes
        </Button>
      </Box>

      {/* Success/Error Notifications */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Settings saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={5000}
        onClose={() => setShowError(false)}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default React.memo(OptimizedUserProfile);
