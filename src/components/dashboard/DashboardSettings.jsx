import React, { useState } from 'react';
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

/**
 * Dashboard Settings Component
 * Advanced settings for customizing dashboard visibility and behavior
 */
const DashboardSettings = ({ 
  open, 
  onClose, 
  settings, 
  onSettingsChange,
  onResetSettings 
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (category, key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    onResetSettings();
    setLocalSettings(settings);
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        pb: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <SettingsIcon />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Dashboard Settings
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Customize your dashboard layout and visibility
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Stats Cards Settings */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <StatsIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Statistics Cards
            </Typography>
            <Chip 
              label={`${Object.values(localSettings.statCards || {}).filter(Boolean).length}/8 visible`}
              color="primary"
              size="small"
            />
          </Box>
          
          <Grid container spacing={2}>
            {statCardSettings.map((card) => (
              <Grid item xs={12} sm={6} md={4} key={card.key}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    opacity: localSettings.statCards?.[card.key] ? 1 : 0.5,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6">{card.icon}</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {card.label}
                      </Typography>
                    </Box>
                    <Switch
                      checked={localSettings.statCards?.[card.key] || false}
                      onChange={(e) => handleSettingChange('statCards', card.key, e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Charts Settings */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ChartIcon color="secondary" />
            <Typography variant="h6" fontWeight={600}>
              Analytics Charts
            </Typography>
            <Chip 
              label={`${Object.values(localSettings.charts || {}).filter(Boolean).length}/8 visible`}
              color="secondary"
              size="small"
            />
          </Box>
          
          <Grid container spacing={2}>
            {chartSettings.map((chart) => (
              <Grid item xs={12} sm={6} md={4} key={chart.key}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    opacity: localSettings.charts?.[chart.key] ? 1 : 0.5,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6">{chart.icon}</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {chart.label}
                      </Typography>
                    </Box>
                    <Switch
                      checked={localSettings.charts?.[chart.key] || false}
                      onChange={(e) => handleSettingChange('charts', chart.key, e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* General Settings */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <DashboardIcon color="info" />
            <Typography variant="h6" fontWeight={600}>
              General Settings
            </Typography>
          </Box>
          
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.general?.autoRefresh || false}
                  onChange={(e) => handleSettingChange('general', 'autoRefresh', e.target.checked)}
                />
              }
              label="Auto-refresh data every 5 minutes"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.general?.animations || true}
                  onChange={(e) => handleSettingChange('general', 'animations', e.target.checked)}
                />
              }
              label="Enable animations and transitions"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.general?.compactMode || false}
                  onChange={(e) => handleSettingChange('general', 'compactMode', e.target.checked)}
                />
              }
              label="Compact mode (smaller cards and charts)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.general?.showTooltips || true}
                  onChange={(e) => handleSettingChange('general', 'showTooltips', e.target.checked)}
                />
              }
              label="Show helpful tooltips"
            />
          </FormGroup>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={handleReset} 
          startIcon={<RefreshIcon />}
          color="warning"
        >
          Reset to Default
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          startIcon={<SettingsIcon />}
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardSettings;
