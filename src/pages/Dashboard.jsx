import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Import dashboard controller and services
import { useDashboardController } from '../services/DashboardController';

// Import dashboard components
import DashboardOverview from '../components/dashboard/DashboardOverview';
import QuickActions from '../components/dashboard/QuickActions';

/**
 * Modern, Clean Dashboard Component
 * Simplified and professional dashboard with modular components
 */
const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Settings menu state
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  
  // Dashboard controller
  const {
    stats,
    loading,
    error
  } = useDashboardController(startDate, endDate, refreshKey);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Handle settings menu
  const handleSettingsOpen = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  // Handle navigation
  const handleNavigate = (section) => {
    switch (section) {
      case 'products':
        navigate('/products');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'customers':
        navigate('/customers');
        break;
      case 'analytics':
        navigate('/charts');
        break;
      default:
        console.log('Navigate to:', section);
    }
  };

  // Handle actions
  const handleAction = (action) => {
    switch (action) {
      case 'add-product':
        navigate('/products');
        break;
      case 'import-data':
        navigate('/products');
        break;
      case 'sync-products':
        console.log('Sync products');
        break;
      case 'bulk-media-upload':
        navigate('/products');
        break;
      case 'export-report':
        console.log('Export report');
        break;
      case 'settings':
        console.log('Open settings');
        break;
      default:
        console.log('Action:', action);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}08)`,
            border: `1px solid ${theme.palette.primary.light}20`
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Welcome back! Here's what's happening with your business today.
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="View Analytics">
                <Fab
                  size="medium"
                  color="secondary"
                  onClick={() => navigate('/charts')}
                  sx={{ boxShadow: 3 }}
                >
                  <AnalyticsIcon />
                </Fab>
              </Tooltip>
              
              <Tooltip title="Refresh Data">
                <Fab
                  size="medium"
                  color="primary"
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{ boxShadow: 3 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
                </Fab>
              </Tooltip>
              
              <Tooltip title="Settings">
                <IconButton
                  onClick={handleSettingsOpen}
                  sx={{ 
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { boxShadow: 4 }
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Settings Menu */}
        <Menu
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={handleSettingsClose}
          slotProps={{
            paper: {
              sx: { 
                minWidth: 240, 
                borderRadius: 2, 
                boxShadow: theme.shadows[8] 
              }
            }
          }}
        >
          <MenuItem onClick={() => navigate('/charts')}>
            <ListItemIcon><AnalyticsIcon /></ListItemIcon>
            <ListItemText>Analytics Dashboard</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleRefresh}>
            <ListItemIcon><RefreshIcon /></ListItemIcon>
            <ListItemText>Refresh Data</ListItemText>
          </MenuItem>
        </Menu>

        {/* Main Content */}
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '60vh'
          }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {error && (
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="h6">Error loading dashboard data</Typography>
            <Typography variant="body2">{error}</Typography>
          </Paper>
        )}

        {!loading && !error && (
          <Grid container spacing={3}>
            {/* Main Dashboard Overview */}
            <Grid item xs={12} lg={8}>
              <DashboardOverview 
                stats={stats}
                onNavigate={handleNavigate}
              />
            </Grid>
            
            {/* Quick Actions Sidebar */}
            <Grid item xs={12} lg={4}>
              <QuickActions 
                onAction={handleAction}
              />
            </Grid>
          </Grid>
        )}

        {/* Footer */}
        <Box sx={{ 
          mt: 4, 
          pt: 3, 
          borderTop: 1, 
          borderColor: 'divider',
          textAlign: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            🚀 <strong>Techno-ETL Dashboard</strong> - Professional e-commerce management system
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Last updated: {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;
