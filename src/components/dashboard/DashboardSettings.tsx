import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Dashboard as DashboardIcon,
  BarChart as ChartIcon,
  Assessment as StatsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-toastify';

/**
 * Dashboard Settings Component
 * Advanced settings for customizing dashboard visibility and behavior
 */
const DashboardSettings = ({ open,
  onClose,
  settings,
  onSettingsChange,
  onResetSettings
 }: { open onClose settings onSettingsChange onResetSettings: any }) => {
  const { animations, density } = useCustomTheme();
  const { settings: globalSettings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  // Sync with global settings when dialog opens or settings change
  useEffect(() => {
    if(open) {
      // Initialize with current settings
      setLocalSettings(settings);

      // Merge with global settings if available
      if(globalSettings?.dashboard) {
        setLocalSettings(prev => ({ ...prev,
          ...globalSettings.dashboard
        }));
  }, [open, settings, globalSettings?.dashboard]);

  const handleSettingChange = (category, key, value) => {
    try {
      setLocalSettings(prev => {
        // Ensure the category exists
        const currentCategory = prev[category] || {};

        return { ...prev,
          [category]: { ...currentCategory,
            [key]: value
        };
      });
    } catch(error: any) {
      console.error('Error updating dashboard setting:', error);
  };

  const handleSave = async () => {
    try {
      // Validate settings before saving
      if(!localSettings || typeof localSettings !== 'object') {
        throw new Error('Invalid settings data');
      // Save to local dashboard settings
      onSettingsChange(localSettings);

      // Save to global unified settings
      if(updateSettings) {
        await updateSettings({ dashboard: localSettings }, 'dashboard');
        console.log('Dashboard settings saved to unified settings');
      // Show success feedback
      toast.success('Dashboard settings saved successfully!');

      onClose();
    } catch(error: any) {
      console.error('Failed to save dashboard settings:', error);

      // Show error feedback
      toast.error('Failed to save dashboard settings. Please try again.');
  };

  const handleReset = () => {
    try {
      onResetSettings();
      setLocalSettings(settings);
      toast.success('Dashboard settings reset to defaults!');
    } catch(error: any) {
      console.error('Error resetting dashboard settings:', error);
      toast.error('Failed to reset dashboard settings. Please try again.');
  };

  const statCardSettings = [
    { key: 'revenue', label: 'Total Revenue', icon: '💰' },
    { key: 'orders', label: 'Total Orders', icon: '🛒' },
    { key: 'products', label: 'Active Products', icon: '📦' },
    { key: 'customers', label: 'Total Customers', icon: '👥' },
    { key: 'categories', label: 'Product Categories', icon: '📂' },
    { key: 'brands', label: 'Active Brands', icon: '🏷️' },
    { key: 'lowStock', label: 'Low Stock Items', icon: '⚠️' },
    { key: 'pendingOrders', label: 'Pending Orders', icon: '⏳' }
  ];

  const chartSettings = [
    { key: 'orders', label: 'Orders Overview', icon: '📈' },
    { key: 'customers', label: 'Customer Growth', icon: '👥' },
    { key: 'productStats', label: 'Product Statistics', icon: '📊' },
    { key: 'brandDistribution', label: 'Brand Distribution', icon: '🏷️' },
    { key: 'categoryTree', label: 'Category Tree', icon: '🌳' },
    { key: 'salesPerformance', label: 'Sales Performance', icon: '💹' },
    { key: 'inventoryStatus', label: 'Inventory Status', icon: '📦' },
    { key: 'productAttributes', label: 'Product Attributes', icon: '🔧' }
  ];

  const widgetSettings = [
    { key: 'quickActions', label: 'Quick Actions', icon: '⚡' },
    { key: 'taskManagement', label: 'Task Management', icon: '✅' },
    { key: 'recentActivity', label: 'Recent Activity Feed', icon: '📋' },
    { key: 'performanceMetrics', label: 'Performance Metrics', icon: '📊' },
    { key: 'dashboardOverview', label: 'Dashboard Overview', icon: '🏠' }
  ];

  return (
    <Dialog open={open} 
      onClose={onClose} 
      maxWidth
          minHeight: density === 'compact' ? '60vh' : '70vh'
      }}></
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        pb: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <SettingsIcon /></
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Dashboard Settings
          </Typography>
          <Typography variant="outlined" sx={{ display: "flex", opacity: 0.9 }}>
            Customize your dashboard layout and visibility
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", p: 3 }}>
        {/* Stats Cards Settings */}
        <Box sx={{ display: "flex", mb: 4 }}></
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <StatsIcon color="primary" /></
            <Typography variant="h6" fontWeight={600}>
              Statistics Cards
            </Typography>
            <Chip 
              label={`${Object.values(localSettings.statCards || {}).filter(Boolean).length}/8 visible`}
              color
          <Grid container spacing={2}>
            {statCardSettings.map((card: any) => (<Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.key}></
                <Card variant="outlined"
                    transition: 'all 0.3s ease'
                  }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}></
                    <Typography variant="h6">{card.icon}</Typography>
                    <Box sx={{ display: "flex", flexGrow: 1 }}></
                      <Typography variant="outlined" fontWeight={500}>
                        {card.label}
                      </Typography>
                    </Box>
                    <Switch checked={localSettings.statCards?.[card.key] || false}
                      onChange={(e) => handleSettingChange('statCards', card.key, e.target.checked)}
                      size="small"
            ))}
          </Grid>
        </Box>

        <Divider sx={{ display: "flex", my: 3 }} />

        {/* Charts Settings */}
        <Box sx={{ display: "flex", mb: 4 }}></
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ChartIcon color="secondary" /></
            <Typography variant="h6" fontWeight={600}>
              Analytics Charts
            </Typography>
            <Chip 
              label={`${Object.values(localSettings.charts || {}).filter(Boolean).length}/8 visible`}
              color
          <Grid container spacing={2}>
            {chartSettings.map((chart: any) => (<Grid size={{ xs: 12, sm: 6, md: 4 }} key={chart.key}></
                <Card variant="outlined"
                    transition: 'all 0.3s ease'
                  }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}></
                    <Typography variant="h6">{chart.icon}</Typography>
                    <Box sx={{ display: "flex", flexGrow: 1 }}></
                      <Typography variant="outlined" fontWeight={500}>
                        {chart.label}
                      </Typography>
                    </Box>
                    <Switch checked={localSettings.charts?.[chart.key] || false}
                      onChange={(e) => handleSettingChange('charts', chart.key, e.target.checked)}
                      size="small"
            ))}
          </Grid>
        </Box>

        <Divider sx={{ display: "flex", my: 3 }} />

        {/* Widgets Settings */}
        <Box sx={{ display: "flex", mb: 4 }}></
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <DashboardIcon color="info" /></
            <Typography variant="h6" fontWeight={600}>
              Dashboard Widgets
            </Typography>
            <Chip
              label={`${Object.values(localSettings.widgets || {}).filter(Boolean).length}/5 visible`}
              color
          <Grid container spacing={2}>
            {widgetSettings.map((widget: any) => (<Grid size={{ xs: 12, sm: 6, md: 4 }} key={widget.key}></
                <Card variant="outlined"
                    transition: 'all 0.3s ease'
                  }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}></
                    <Typography variant="h6">{widget.icon}</Typography>
                    <Box sx={{ display: "flex", flexGrow: 1 }}></
                      <Typography variant="outlined" fontWeight={500}>
                        {widget.label}
                      </Typography>
                    </Box>
                    <Switch checked={localSettings.widgets?.[widget.key] || false}
                      onChange={(e) => handleSettingChange('widgets', widget.key, e.target.checked)}
                      size="small"
            ))}
          </Grid>
        </Box>

        <Divider sx={{ display: "flex", my: 3 }} />

        {/* General Settings */}
        <Box></
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <DashboardIcon color="info" /></
            <Typography variant="h6" fontWeight={600}>
              General Settings
            </Typography>
          </Box>
          
          <FormGroup></
            <FormControlLabel control
                  checked={localSettings.general?.autoRefresh || false}
                  onChange={(e) => handleSettingChange('general', 'autoRefresh', e.target.checked)}
                />
              label
                  checked={localSettings.general?.animations || true}
                  onChange={(e) => handleSettingChange('general', 'animations', e.target.checked)}
                />
              label
                  checked={localSettings.general?.compactMode || false}
                  onChange={(e) => handleSettingChange('general', 'compactMode', e.target.checked)}
                />
              label
                  checked={localSettings.general?.showTooltips || true}
                  onChange={(e) => handleSettingChange('general', 'showTooltips', e.target.checked)}
                />
              label
      <DialogActions sx={{ display: "flex", p: 3, gap: 1 }}></
        <Button 
          onClick={handleReset} 
          startIcon={<RefreshIcon />}
          color
        <Box sx={{ display: "flex", flexGrow: 1 }} /></
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="outlined"
          startIcon={<SettingsIcon />}
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardSettings;
