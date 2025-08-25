import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Switch, FormControlLabel, Select, MenuItem,
  FormControl, InputLabel, Divider, Button, Alert, Snackbar,
  Grid, Card, CardContent, CardHeader, Slider, TextField,
  Accordion, AccordionSummary, AccordionDetails, Chip, Tabs, Tab
} from '@mui/material';
import {
  Settings, Palette, Language, Notifications, Security,
  Dashboard, GridView, Speed, Accessibility, ExpandMore,
  Save, RestoreFromTrash, Brightness4, Brightness7, ViewColumn, FilterList
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-hot-toast';
import GridColumnSettings from './GridColumnSettings';
import GridFilterSettings from './GridFilterSettings';
import FeatureFlags from './FeatureFlags';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';

// TypeScript interfaces
interface UserProfileSettingsProps {
  user?: any;
  onSettingsChange?: (settings) => void;
}

interface UserSettingsState {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  language: string;
  density: 'compact' | 'standard' | 'comfortable';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  
  // Grid preferences
  defaultPageSize: number;
  enableVirtualization: boolean;
  showStatsCards: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Performance
  cacheEnabled: boolean;
  lazyLoading: boolean;
  compressionEnabled: boolean;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  
  // Security
  sessionTimeout: number;
  twoFactorEnabled: boolean;
  auditLogging: boolean;
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  screenReader: boolean;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ user, onSettingsChange }) => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const {
    mode,
    currentLanguage, 
    fontSize,
    settings: userSettings,
    loading: userSettingsLoading,
    setThemeMode,
    setLanguage,
    setFontSize,
    saveCurrentPreferences,
    resetToSystemDefaults
  } = useUserSettings();
  
  const { 
    density,
    animations,
    highContrast,
    setDensity,
    setAnimations,
    setHighContrast
  } = useCustomTheme();
  
  const {
    settings: globalSettings,
    updateSettings: updateGlobalSettings,
    saveSettings: saveGlobalSettings,
    isDirty: globalIsDirty
  } = useSettings();

  // Local state for UI feedback
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [localIsDirty, setLocalIsDirty] = useState(false);

  // Combined settings state from all sources
  const [settings, setSettings] = useState<UserSettingsState>(() => ({
    // Appearance - from useUserSettings
    theme: mode,
    language: currentLanguage,
    fontSize: fontSize,
    density: density,
    animations: animations,
    
    // Grid preferences - from global settings or defaults
    defaultPageSize: globalSettings?.preferences?.defaultPageSize || 25,
    enableVirtualization: globalSettings?.performance?.enableVirtualization ?? true,
    showStatsCards: globalSettings?.preferences?.showStatsCards ?? false,
    autoRefresh: globalSettings?.preferences?.autoRefresh ?? false,
    refreshInterval: globalSettings?.preferences?.refreshInterval || 30,
    
    // Performance - from global settings or defaults
    cacheEnabled: globalSettings?.performance?.cacheEnabled ?? true,
    lazyLoading: globalSettings?.performance?.lazyLoading ?? true,
    compressionEnabled: globalSettings?.performance?.compressionEnabled ?? true,
    
    // Notifications - from global settings or defaults
    emailNotifications: globalSettings?.preferences?.emailNotifications ?? true,
    pushNotifications: globalSettings?.preferences?.pushNotifications ?? false,
    soundEnabled: globalSettings?.preferences?.soundEnabled ?? true,
    
    // Security - from global settings or defaults
    sessionTimeout: globalSettings?.preferences?.sessionTimeout || 30,
    twoFactorEnabled: globalSettings?.preferences?.twoFactorEnabled ?? false,
    auditLogging: globalSettings?.preferences?.auditLogging ?? true,
    
    // Accessibility - from theme context and global settings
    highContrast: highContrast,
    largeText: fontSize === 'large',
    keyboardNavigation: globalSettings?.accessibility?.keyboardNavigation ?? true,
    screenReader: globalSettings?.accessibility?.screenReader ?? false
  }));

  // Sync settings when contexts change
  useEffect(() => {
    if (!userSettingsLoading && currentUser) {
      setSettings(prev => ({
        ...prev,
        theme: mode,
        language: currentLanguage,
        fontSize: fontSize,
        density: density,
        animations: animations,
        highContrast: highContrast,
        largeText: fontSize === 'large',
        // Update other settings from global context
        defaultPageSize: globalSettings?.preferences?.defaultPageSize || prev.defaultPageSize,
        enableVirtualization: globalSettings?.performance?.enableVirtualization ?? prev.enableVirtualization,
        showStatsCards: globalSettings?.preferences?.showStatsCards ?? prev.showStatsCards,
        autoRefresh: globalSettings?.preferences?.autoRefresh ?? prev.autoRefresh,
        refreshInterval: globalSettings?.preferences?.refreshInterval || prev.refreshInterval,
        cacheEnabled: globalSettings?.performance?.cacheEnabled ?? prev.cacheEnabled,
        lazyLoading: globalSettings?.performance?.lazyLoading ?? prev.lazyLoading,
        compressionEnabled: globalSettings?.performance?.compressionEnabled ?? prev.compressionEnabled,
        emailNotifications: globalSettings?.preferences?.emailNotifications ?? prev.emailNotifications,
        pushNotifications: globalSettings?.preferences?.pushNotifications ?? prev.pushNotifications,
        soundEnabled: globalSettings?.preferences?.soundEnabled ?? prev.soundEnabled,
        sessionTimeout: globalSettings?.preferences?.sessionTimeout || prev.sessionTimeout,
        twoFactorEnabled: globalSettings?.preferences?.twoFactorEnabled ?? prev.twoFactorEnabled,
        auditLogging: globalSettings?.preferences?.auditLogging ?? prev.auditLogging,
        keyboardNavigation: globalSettings?.accessibility?.keyboardNavigation ?? prev.keyboardNavigation,
        screenReader: globalSettings?.accessibility?.screenReader ?? prev.screenReader
      }));
    }
  }, [mode, currentLanguage, fontSize, density, animations, highContrast, globalSettings, userSettingsLoading, currentUser]);

  // Enhanced settings change handler that updates appropriate contexts
  const handleSettingChange = useCallback(async (key: keyof UserSettingsState, value as any) => {
    // Update local state immediately for UI responsiveness
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setLocalIsDirty(true);

    // Update appropriate context based on the setting type
    try {
      switch (key) {
        case 'theme':
          await setThemeMode(value as any);
          break;
        case 'language':
          await setLanguage(value as any);
          break;
        case 'fontSize':
          await setFontSize(value as any);
          break;
        case 'density':
          setDensity(value as any);
          break;
        case 'animations':
          setAnimations(value as any);
          break;
        case 'highContrast':
          setHighContrast(value as any);
          break;
        case 'largeText':
          // Convert to fontSize setting
          await setFontSize(value ? 'large' : 'medium');
          break;
        // Handle global settings
        default:
          // Determine which section this setting belongs to
          let section = 'preferences';
          if (['cacheEnabled', 'lazyLoading', 'compressionEnabled', 'enableVirtualization'].includes(key)) {
            section = 'performance';
          } else if (['keyboardNavigation', 'screenReader'].includes(key)) {
            section = 'accessibility';
          }
          
          updateGlobalSettings({ [key]: value }, section);
          break;
      }
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error);
      toast.error(`Failed to update ${key} setting`);
      // Revert local state on error
      setSettings(prev => ({
        ...prev,
        [key]: prev[key] // Revert to previous value
      }));
    }
  }, [setThemeMode, setLanguage, setFontSize, setDensity, setAnimations, setHighContrast, updateGlobalSettings]);

  // Enhanced save handler that saves all settings
  const handleSave = useCallback(async () => {
    if (!currentUser) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Save user preferences (theme, language, fontSize)
      const preferencesResult = await saveCurrentPreferences();
      
      // Save global settings if dirty
      if (globalIsDirty) {
        await saveGlobalSettings();
      }
      
      // Call parent callback if provided
      if (onSettingsChange) {
        onSettingsChange(settings as any);
      }
      
      setLocalIsDirty(false);
      setShowSuccess(true);
      toast.success('Settings saved successfully!');
      
      if (!preferencesResult.success) {
        console.warn('Some preferences may not have been saved:', preferencesResult.error);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setShowError(true);
      toast.error('Failed to save settings. Please try again.');
    }
  }, [currentUser, saveCurrentPreferences, globalIsDirty, saveGlobalSettings, onSettingsChange, settings]);

  // Enhanced reset handler that resets all settings to defaults
  const handleReset = useCallback(async () => {
    try {
      // Reset user preferences to system defaults
      resetToSystemDefaults();
      
      // Reset global settings
      updateGlobalSettings({
        preferences: {
          defaultPageSize: 25,
          showStatsCards: false,
          autoRefresh: false,
          refreshInterval: 30,
          emailNotifications: true,
          pushNotifications: false,
          soundEnabled: true,
          sessionTimeout: 30,
          twoFactorEnabled: false,
          auditLogging: true
        },
        performance: {
          enableVirtualization: true,
          cacheEnabled: true,
          lazyLoading: true,
          compressionEnabled: true
        },
        accessibility: {
          keyboardNavigation: true,
          screenReader: false
        }
      });
      
      setLocalIsDirty(true);
      toast('Settings reset to defaults. Click Save to apply.', {
        icon: 'ℹ️',
        style: {
          background: '#2196f3',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error('Failed to reset settings');
    }
  }, [resetToSystemDefaults, updateGlobalSettings]);

  // Check if any settings are dirty
  const isDirty = localIsDirty || globalIsDirty;

  // Component interfaces
  interface SettingsSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }

  interface SettingItemProps {
    label: string;
    description?: string;
    children: React.ReactNode;
    fullWidth?: boolean;
  }

  interface TabPanelProps {
    children: React.ReactNode;
    value: number;
    index: number;
  }

  const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon, children }) => (
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

  const SettingItem: React.FC<SettingItemProps> = ({ label, description, children, fullWidth = false }) => (
    <Grid size={{ xs: 12, md: fullWidth ? 12 : 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
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

  const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  // Show loading state while settings are being loaded
  if (userSettingsLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Typography>Loading settings...</Typography>
      </Box>
    );
  }

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

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e) => (e) => (e) => (e) => (e, newValue) => setActiveTab(newValue as any)}
          aria-label="settings tabs"
        >
          <Tab
            icon={<Settings />}
            label="General"
            id="settings-tab-0"
            aria-controls="settings-tabpanel-0"
          />
          <Tab
            icon={<ViewColumn />}
            label="Grid Columns"
            id="settings-tab-1"
            aria-controls="settings-tabpanel-1"
          />
          <Tab
            icon={<FilterList />}
            label="Filters"
            id="settings-tab-2"
            aria-controls="settings-tabpanel-2"
          />
          <Tab
            icon={<Settings />}
            label="Features"
            id="settings-tab-3"
            aria-controls="settings-tabpanel-3"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* General Settings */}
        
        {/* Appearance Settings */}
        <SettingsSection title="Appearance" icon={<Palette />}>
          <SettingItem 
            label="Theme" 
            description="Choose your preferred color scheme"
          >
            <FormControl fullWidth size="small">
              <Select
                value={settings.theme}
                onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('theme', e.target.value)}
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
                onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('language', e.target.value)}
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
                onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('density', e.target.value)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('animations', e.target.checked)}
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
                onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('defaultPageSize', e.target.value)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('enableVirtualization', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('showStatsCards', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('autoRefresh', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e, value) => handleSettingChange('refreshInterval', value)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('cacheEnabled', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('lazyLoading', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('compressionEnabled', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('emailNotifications', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('pushNotifications', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('soundEnabled', e.target.checked)}
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
                onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('sessionTimeout', e.target.value)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('auditLogging', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('highContrast', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('largeText', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('keyboardNavigation', e.target.checked)}
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
                  onChange={(e) => (e) => (e) => (e) => (e) => handleSettingChange('screenReader', e.target.checked)}
                />
              }
              label="Enable screen reader support"
            />
          </SettingItem>
        </SettingsSection>

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
      </TabPanel>

      {/* Grid Columns Tab */}
      <TabPanel value={activeTab} index={1}>
        <GridColumnSettings user={user} onSettingsChange={onSettingsChange} />
      </TabPanel>

      {/* Filters Tab */}
      <TabPanel value={activeTab} index={2}>
        <GridFilterSettings user={user} onSettingsChange={onSettingsChange} />
      </TabPanel>

      {/* Feature Flags Tab */}
      <TabPanel value={activeTab} index={3}>
        <FeatureFlags user={user} onSettingsChange={onSettingsChange} />
      </TabPanel>

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
