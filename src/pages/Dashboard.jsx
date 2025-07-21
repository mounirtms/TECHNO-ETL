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
  Tooltip,
  Button,
  Card,
  CardContent,
  Collapse
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Sync as SyncIcon,
  AttachMoney as PriceIcon,
  Inventory as StockIcon,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  ShoppingCart,
  People,
  Category
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StatsCards } from '../components/common/StatsCards';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// Import dashboard controller and services
import { useDashboardController } from '../services/DashboardController';
import {
  formatCurrency, formatDate, prepareCustomerChartData,
  formatChartDate, formatTooltipDate
} from '../services/dashboardService';

// Import dashboard components
import DashboardOverview from '../components/dashboard/DashboardOverview';
import QuickActions from '../components/dashboard/QuickActions';
import EnhancedStatsCards from '../components/dashboard/EnhancedStatsCards';
import DashboardSettings from '../components/dashboard/DashboardSettings';

// Import chart components
import {
  ProductStatsChart,
  BrandDistributionChart,
  CategoryTreeChart,
  ProductAttributesChart,
  SalesPerformanceChart,
  InventoryStatusChart
} from '../components/charts';

// Import dashboard data service
import dashboardDataService from '../services/dashboardDataService';

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

  // Chart visibility state
  const [visibleCharts, setVisibleCharts] = useState({
    orders: true,
    customers: true,
    products: true,
    analytics: true,
    enhanced: true
  });

  // Enhanced dashboard data
  const [enhancedData, setEnhancedData] = useState({
    productStats: [],
    brandDistribution: [],
    categoryDistribution: [],
    productAttributes: [],
    salesPerformance: [],
    inventoryStatus: []
  });
  const [enhancedLoading, setEnhancedLoading] = useState(false);

  // Dashboard settings
  const [dashboardSettings, setDashboardSettings] = useState({
    statCards: {
      revenue: true,
      orders: true,
      products: true,
      customers: true,
      categories: true,
      brands: true,
      lowStock: true,
      pendingOrders: true
    },
    charts: {
      orders: true,
      customers: true,
      productStats: true,
      brandDistribution: true,
      categoryTree: true,
      salesPerformance: true,
      inventoryStatus: true,
      productAttributes: true
    },
    general: {
      autoRefresh: false,
      animations: true,
      compactMode: false,
      showTooltips: true
    }
  });
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  
  // Dashboard controller
  const {
    stats,
    chartData,
    recentOrders,
    bestSellers,
    customerData,
    countryData,
    productTypeData,
    loading,
    error,
    getPrices,
    syncAllStocks,
    fetchDashboardData
  } = useDashboardController(startDate, endDate, refreshKey);

  // Load enhanced dashboard data
  const loadEnhancedData = async () => {
    try {
      setEnhancedLoading(true);
      const data = await dashboardDataService.getAllDashboardData();
      setEnhancedData(data);
    } catch (error) {
      console.error('Error loading enhanced dashboard data:', error);
    } finally {
      setEnhancedLoading(false);
    }
  };

  // Load enhanced data on mount and refresh
  useEffect(() => {
    loadEnhancedData();
  }, [refreshKey]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    loadEnhancedData();
  };

  // Handle sync operations
  const handleSyncPrices = async () => {
    try {
      await getPrices();
      toast.success('Prices synced successfully');
    } catch (error) {
      toast.error('Failed to sync prices');
    }
  };

  const handleSyncStocks = async () => {
    try {
      await syncAllStocks();
      toast.success('Stocks synced successfully');
    } catch (error) {
      toast.error('Failed to sync stocks');
    }
  };

  // Handle chart visibility toggle
  const toggleChartVisibility = (chartKey) => {
    setVisibleCharts(prev => ({ ...prev, [chartKey]: !prev[chartKey] }));
  };

  // Handle dashboard settings
  const handleSettingsChange = (newSettings) => {
    setDashboardSettings(newSettings);
    // Save to localStorage
    localStorage.setItem('dashboardSettings', JSON.stringify(newSettings));
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      statCards: {
        revenue: true,
        orders: true,
        products: true,
        customers: true,
        categories: true,
        brands: true,
        lowStock: true,
        pendingOrders: true
      },
      charts: {
        orders: true,
        customers: true,
        productStats: true,
        brandDistribution: true,
        categoryTree: true,
        salesPerformance: true,
        inventoryStatus: true,
        productAttributes: true
      },
      general: {
        autoRefresh: false,
        animations: true,
        compactMode: false,
        showTooltips: true
      }
    };
    setDashboardSettings(defaultSettings);
    localStorage.removeItem('dashboardSettings');
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      try {
        setDashboardSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading dashboard settings:', error);
      }
    }
  }, []);

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
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Date Range Pickers */}
              <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { size: 'small', sx: { width: 140 } } }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { size: 'small', sx: { width: 140 } } }}
                />
              </Box>

              {/* Sync Buttons */}
              <Tooltip title="Sync Prices">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSyncPrices}
                  startIcon={<PriceIcon />}
                  sx={{ mr: 1 }}
                >
                  Prices
                </Button>
              </Tooltip>

              <Tooltip title="Sync Stocks">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSyncStocks}
                  startIcon={<StockIcon />}
                  sx={{ mr: 1 }}
                >
                  Stocks
                </Button>
              </Tooltip>

              {/* Action Buttons */}
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
          <MenuItem onClick={() => {
            setSettingsDialogOpen(true);
            handleSettingsClose();
          }}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText>Dashboard Settings</ListItemText>
          </MenuItem>
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
          <>
            {/* Enhanced Stats Cards */}
            <Box sx={{ mb: 4 }}>
              <EnhancedStatsCards
                stats={stats}
                settings={dashboardSettings}
                loading={loading}
                onNavigate={handleNavigate}
                onCardAction={(cardKey, action) => {
                  console.log('Card action:', cardKey, action);
                  // Handle card-specific actions
                }}
              />
            </Box>

            <Grid container spacing={3}>
              {/* Main Dashboard Overview */}
              <Grid item xs={12} lg={8}>
                <DashboardOverview
                  stats={stats}
                  onNavigate={handleNavigate}
                />

                {/* Charts Section */}
                {dashboardSettings.charts.orders && (
                  <Card sx={{ mt: 3, borderRadius: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight={600}>
                          📈 Orders Overview
                        </Typography>
                        <IconButton onClick={() => toggleChartVisibility('orders')}>
                          <ExpandLess />
                        </IconButton>
                      </Box>
                      <ResponsiveContainer width="100%" height={dashboardSettings.general.compactMode ? 250 : 300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {dashboardSettings.charts.customers && (
                  <Card sx={{ mt: 3, borderRadius: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight={600}>
                          👥 Customer Growth
                        </Typography>
                        <IconButton onClick={() => toggleChartVisibility('customers')}>
                          <ExpandLess />
                        </IconButton>
                      </Box>
                      <ResponsiveContainer width="100%" height={dashboardSettings.general.compactMode ? 250 : 300}>
                        <BarChart data={customerData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="customers" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </Grid>

              {/* Quick Actions Sidebar */}
              <Grid item xs={12} lg={4}>
                <QuickActions
                  onAction={handleAction}
                />
              </Grid>
            </Grid>

            {/* Enhanced Analytics Section */}
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                  🚀 Enhanced Analytics
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setSettingsDialogOpen(true)}
                  startIcon={<SettingsIcon />}
                >
                  Customize Charts
                </Button>
              </Box>

              <Grid container spacing={3}>
                {/* Product Statistics */}
                {dashboardSettings.charts.productStats && (
                  <Grid item xs={12} md={6} lg={4}>
                    <ProductStatsChart
                      data={enhancedData.productStats}
                      title="📊 Product Status Distribution"
                      loading={enhancedLoading}
                      compact={dashboardSettings.general.compactMode}
                    />
                  </Grid>
                )}

                {/* Brand Distribution */}
                {dashboardSettings.charts.brandDistribution && (
                  <Grid item xs={12} md={6} lg={4}>
                    <BrandDistributionChart
                      data={enhancedData.brandDistribution}
                      title="🏷️ Top Brands"
                      loading={enhancedLoading}
                      compact={dashboardSettings.general.compactMode}
                    />
                  </Grid>
                )}

                {/* Product Attributes */}
                {dashboardSettings.charts.productAttributes && (
                  <Grid item xs={12} md={6} lg={4}>
                    <ProductAttributesChart
                      data={enhancedData.productAttributes}
                      title="🔧 Product Features"
                      loading={enhancedLoading}
                      compact={dashboardSettings.general.compactMode}
                    />
                  </Grid>
                )}

                {/* Category Tree */}
                {dashboardSettings.charts.categoryTree && (
                  <Grid item xs={12} md={6}>
                    <CategoryTreeChart
                      data={enhancedData.categoryDistribution}
                      title="🌳 Category Distribution"
                      loading={enhancedLoading}
                      compact={dashboardSettings.general.compactMode}
                    />
                  </Grid>
                )}

                {/* Sales Performance */}
                {dashboardSettings.charts.salesPerformance && (
                  <Grid item xs={12} md={6}>
                    <SalesPerformanceChart
                      data={enhancedData.salesPerformance}
                      title="💹 Sales Trends"
                      type="area"
                      loading={enhancedLoading}
                      compact={dashboardSettings.general.compactMode}
                    />
                  </Grid>
                )}

                {/* Inventory Status */}
                {dashboardSettings.charts.inventoryStatus && (
                  <Grid item xs={12}>
                    <InventoryStatusChart
                      data={enhancedData.inventoryStatus}
                      title="📦 Inventory Overview"
                      loading={enhancedLoading}
                      compact={dashboardSettings.general.compactMode}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </>
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

        {/* Dashboard Settings Dialog */}
        <DashboardSettings
          open={settingsDialogOpen}
          onClose={() => setSettingsDialogOpen(false)}
          settings={dashboardSettings}
          onSettingsChange={handleSettingsChange}
          onResetSettings={handleResetSettings}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;
