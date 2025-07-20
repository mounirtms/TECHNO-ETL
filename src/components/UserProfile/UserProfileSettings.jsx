import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Switch, FormControlLabel, Select, MenuItem,
  FormControl, InputLabel, Divider, Button, Alert, Snackbar,
  Grid, Card, CardContent, CardHeader, Slider, TextField,
  Accordion, AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import {
  Settings, Palette, Language, Notifications, Security,
  Dashboard, GridView, Speed, Accessibility, ExpandMore,
  Save, RestoreFromTrash, Brightness4, Brightness7
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const UserProfileSettings = ({ user, onSettingsChange }) => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'system',
    language: 'en',
    density: 'standard',
    animations: true,
    
    // Grid preferences
    defaultPageSize: 25,
    enableVirtualization: true,
    showStatsCards: false,
    autoRefresh: false,
    refreshInterval: 30,
    
    // Performance
    cacheEnabled: true,
    lazyLoading: true,
    compressionEnabled: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    soundEnabled: true,
    
    // Security
    sessionTimeout: 30,
    twoFactorEnabled: false,
    auditLogging: true,
    
    // Accessibility
    highContrast: false,
    largeText: false,
    keyboardNavigation: true,
    screenReader: false
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem(`userSettings_${user?.id}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [user]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      // Save to localStorage
      localStorage.setItem(`userSettings_${user?.id}`, JSON.stringify(settings));
      
      // Call parent callback
      if (onSettingsChange) {
        onSettingsChange(settings);
      }
      
      setIsDirty(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setShowError(true);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      theme: 'system',
      language: 'en',
      density: 'standard',
      animations: true,
      defaultPageSize: 25,
      enableVirtualization: true,
      showStatsCards: false,
      autoRefresh: false,
      refreshInterval: 30,
      cacheEnabled: true,
      lazyLoading: true,
      compressionEnabled: true,
      emailNotifications: true,
      pushNotifications: false,
      soundEnabled: true,
      sessionTimeout: 30,
      twoFactorEnabled: false,
      auditLogging: true,
      highContrast: false,
      largeText: false,
      keyboardNavigation: true,
      screenReader: false
    };
    
    setSettings(defaultSettings);
    setIsDirty(true);
  };

  const SettingsSection = ({ title, icon, children }) => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          {children}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const SettingItem = ({ label, description, children, fullWidth = false }) => (
    <Grid item xs={12} md={fullWidth ? 12 : 6}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
          {label}
        </Typography>
        {description && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            {description}
          </Typography>
        )}
        {children}
      </Box>
    </Grid>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          User Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your experience and preferences
        </Typography>
      </Box>

      {/* Settings Sections */}
      <Box sx={{ mb: 3 }}>
        {/* Appearance Settings */}
        <SettingsSection title="Appearance" icon={<Palette />}>
          <SettingItem 
            label="Theme" 
            description="Choose your preferred color scheme"
          >
            <FormControl fullWidth size="small">
              <Select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
              >
                <MenuItem value="light">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Brightness7 fontSize="small" />
                    Light
                  </Box>
                </MenuItem>
                <MenuItem value="dark">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Brightness4 fontSize="small" />
                    Dark
                  </Box>
                </MenuItem>
                <MenuItem value="system">System Default</MenuItem>
              </Select>
            </FormControl>
          </SettingItem>

          <SettingItem 
            label="Language" 
            description="Select your preferred language"
          >
            <FormControl fullWidth size="small">
              <Select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ar">العربية</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
              </Select>
            </FormControl>
          </SettingItem>

          <SettingItem 
            label="Interface Density" 
            description="Adjust spacing and component sizes"
          >
            <FormControl fullWidth size="small">
              <Select
                value={settings.density}
                onChange={(e) => handleSettingChange('density', e.target.value)}
              >
                <MenuItem value="compact">Compact</MenuItem>
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="comfortable">Comfortable</MenuItem>
              </Select>
            </FormControl>
          </SettingItem>

          <SettingItem 
            label="Animations" 
            description="Enable smooth transitions and animations"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.animations}
                  onChange={(e) => handleSettingChange('animations', e.target.checked)}
                />
              }
              label="Enable animations"
            />
          </SettingItem>
        </SettingsSection>

        {/* Grid Preferences */}
        <SettingsSection title="Grid Preferences" icon={<GridView />}>
          <SettingItem 
            label="Default Page Size" 
            description="Number of rows to display per page"
          >
            <FormControl fullWidth size="small">
              <Select
                value={settings.defaultPageSize}
                onChange={(e) => handleSettingChange('defaultPageSize', e.target.value)}
              >
                <MenuItem value={10}>10 rows</MenuItem>
                <MenuItem value={25}>25 rows</MenuItem>
                <MenuItem value={50}>50 rows</MenuItem>
                <MenuItem value={100}>100 rows</MenuItem>
              </Select>
            </FormControl>
          </SettingItem>

          <SettingItem 
            label="Virtualization" 
            description="Improve performance for large datasets"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableVirtualization}
                  onChange={(e) => handleSettingChange('enableVirtualization', e.target.checked)}
                />
              }
              label="Enable virtualization"
            />
          </SettingItem>

          <SettingItem 
            label="Stats Cards" 
            description="Show statistics cards by default"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showStatsCards}
                  onChange={(e) => handleSettingChange('showStatsCards', e.target.checked)}
                />
              }
              label="Show stats cards"
            />
          </SettingItem>

          <SettingItem 
            label="Auto Refresh" 
            description="Automatically refresh data"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoRefresh}
                  onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                />
              }
              label="Enable auto refresh"
            />
          </SettingItem>

          {settings.autoRefresh && (
            <SettingItem 
              label="Refresh Interval" 
              description="How often to refresh data (seconds)"
              fullWidth
            >
              <Box sx={{ px: 2 }}>
                <Slider
                  value={settings.refreshInterval}
                  onChange={(e, value) => handleSettingChange('refreshInterval', value)}
                  min={10}
                  max={300}
                  step={10}
                  marks={[
                    { value: 10, label: '10s' },
                    { value: 60, label: '1m' },
                    { value: 180, label: '3m' },
                    { value: 300, label: '5m' }
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}s`}
                />
              </Box>
            </SettingItem>
          )}
        </SettingsSection>

        {/* Performance Settings */}
        <SettingsSection title="Performance" icon={<Speed />}>
          <SettingItem
            label="Cache"
            description="Enable data caching for better performance"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.cacheEnabled}
                  onChange={(e) => handleSettingChange('cacheEnabled', e.target.checked)}
                />
              }
              label="Enable caching"
            />
          </SettingItem>

          <SettingItem
            label="Lazy Loading"
            description="Load data as needed to improve initial load time"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.lazyLoading}
                  onChange={(e) => handleSettingChange('lazyLoading', e.target.checked)}
                />
              }
              label="Enable lazy loading"
            />
          </SettingItem>

          <SettingItem
            label="Compression"
            description="Compress data transfers to reduce bandwidth"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.compressionEnabled}
                  onChange={(e) => handleSettingChange('compressionEnabled', e.target.checked)}
                />
              }
              label="Enable compression"
            />
          </SettingItem>
        </SettingsSection>

        {/* Notifications Settings */}
        <SettingsSection title="Notifications" icon={<Notifications />}>
          <SettingItem
            label="Email Notifications"
            description="Receive notifications via email"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                />
              }
              label="Enable email notifications"
            />
          </SettingItem>

          <SettingItem
            label="Push Notifications"
            description="Receive browser push notifications"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                />
              }
              label="Enable push notifications"
            />
          </SettingItem>

          <SettingItem
            label="Sound"
            description="Play notification sounds"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                />
              }
              label="Enable notification sounds"
            />
          </SettingItem>
        </SettingsSection>

        {/* Security Settings */}
        <SettingsSection title="Security" icon={<Security />}>
          <SettingItem
            label="Session Timeout"
            description="Automatically log out after inactivity (minutes)"
          >
            <FormControl fullWidth size="small">
              <Select
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
              >
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
                <MenuItem value={480}>8 hours</MenuItem>
              </Select>
            </FormControl>
          </SettingItem>

          <SettingItem
            label="Two-Factor Authentication"
            description="Add an extra layer of security"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.twoFactorEnabled}
                  onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                />
              }
              label="Enable 2FA"
            />
          </SettingItem>

          <SettingItem
            label="Audit Logging"
            description="Log user actions for security monitoring"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.auditLogging}
                  onChange={(e) => handleSettingChange('auditLogging', e.target.checked)}
                />
              }
              label="Enable audit logging"
            />
          </SettingItem>
        </SettingsSection>

        {/* Accessibility Settings */}
        <SettingsSection title="Accessibility" icon={<Accessibility />}>
          <SettingItem
            label="High Contrast"
            description="Increase contrast for better visibility"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.highContrast}
                  onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                />
              }
              label="Enable high contrast"
            />
          </SettingItem>

          <SettingItem
            label="Large Text"
            description="Increase text size for better readability"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.largeText}
                  onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                />
              }
              label="Enable large text"
            />
          </SettingItem>

          <SettingItem
            label="Keyboard Navigation"
            description="Navigate using keyboard shortcuts"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.keyboardNavigation}
                  onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}
                />
              }
              label="Enable keyboard navigation"
            />
          </SettingItem>

          <SettingItem
            label="Screen Reader"
            description="Optimize for screen reader compatibility"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.screenReader}
                  onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
                />
              }
              label="Enable screen reader support"
            />
          </SettingItem>
        </SettingsSection>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        justifyContent: 'flex-end',
        pt: 3,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Button
          variant="outlined"
          startIcon={<RestoreFromTrash />}
          onClick={handleReset}
        >
          Reset to Defaults
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={!isDirty}
        >
          Save Settings
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
          Failed to save settings. Please try again.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfileSettings;
