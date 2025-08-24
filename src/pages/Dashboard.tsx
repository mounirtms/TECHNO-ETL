import React, { useState, useEffect, useMemo } from 'react';
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
  Category,
  AttachMoney
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useCustomTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { useTab } from '../contexts/TabContext';
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
import TaskManagementWidget from '../components/dashboard/TaskManagementWidget';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import PerformanceMetricsWidget from '../components/dashboard/PerformanceMetricsWidget';
import DashboardTestSummary from '../components/dashboard/DashboardTestSummary';
import {
  ProfessionalMetricCard,
  ProfessionalChartWidget,
  ProfessionalProgressWidget,
  ProfessionalStatusWidget
} from '../components/dashboard/ProfessionalWidgets';
import PriceSyncDialog from '../components/dashboard/PriceSyncDialog';

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
import unifiedMagentoService from '../services/unifiedMagentoService';
import SyncProgressBar from '../components/SyncProgressBar';

/**
 * Modern, Clean Dashboard Component
 * Simplified and professional dashboard with modular components
 * Enhanced with proper theme and language persistence
 */
const Dashboard = () => {
  const muiTheme = useTheme(); // MUI theme for shadows and other MUI-specific properties
  const { mode, isDark, colorPreset, density, animations } = useCustomTheme();
  const { currentLanguage, translate, languages } = useLanguage();
  const { openTab } = useTab();
  
  // Check if current language is RTL
  const isRTL = useMemo(() => languages[currentLanguage]?.dir === 'rtl', [languages, currentLanguage]);
  
  // Use custom theme colors based on current color preset and mode
  const customColors = muiTheme.palette; // This will reflect the current theme
  
  // Debug logging for theme persistence issues
  useEffect(() => {
    console.log('🎨 Dashboard theme state:', {
      mode,
      isDark,
      colorPreset,
      currentLanguage,
      isRTL,
      paletteMode: muiTheme.palette.mode
    });
  }, [mode, isDark, colorPreset, currentLanguage, isRTL, muiTheme.palette.mode]);
  
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

  // Dashboard settings with unified settings integration
  const [dashboardSettings, setDashboardSettings] = useState(() => {
    // Try to load from unified settings first
    const unifiedSettings = JSON.parse(localStorage.getItem('techno-etl-settings') || '{}');
    const savedDashboardSettings = unifiedSettings.dashboard;

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
      widgets: {
        taskManagement: true,
        recentActivity: true,
        performanceMetrics: true,
        quickActions: true,
        dashboardOverview: true
      },
      general: {
        autoRefresh: false,
        animations: true,
        compactMode: false,
        showTooltips: true
      }
    };

    return savedDashboardSettings ? { ...defaultSettings, ...savedDashboardSettings } : defaultSettings;
  });
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Price sync dialog state
  const [priceSyncDialogOpen, setPriceSyncDialogOpen] = useState(false);
  const [priceData, setPriceData] = useState([]);
  
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
    fetchDashboardData,
    syncProgress
  } = useDashboardController(startDate, endDate, refreshKey);

  // Load enhanced dashboard data with optimized performance
  const loadEnhancedData = async () => {
    try {
        setEnhancedLoading(true);
        const cacheKey = 'enhancedDashboardData';
        const cachedData = unifiedMagentoService._getCachedResponse && unifiedMagentoService._getCachedResponse(cacheKey);

        if (cachedData) {
            console.log('✅ Loaded enhanced data from cache');
            setEnhancedData(cachedData);
            setEnhancedLoading(false);
            return;
        }

        // Optimized endpoints with shorter timeout
        const endpoints = [
            { path: '/products/stats', key: 'productStats', timeout: 10000 },
            { path: '/products/types', key: 'productTypes', timeout: 8000 }, 
            { path: '/brands/distribution', key: 'brandDistribution', timeout: 8000 },
            { path: '/categories/distribution', key: 'categoryDistribution', timeout: 8000 },
            { path: '/products/attributes', key: 'productAttributes', timeout: 8000 },
            { path: '/sales/performance', key: 'salesPerformance', timeout: 12000 },
            { path: '/inventory/status', key: 'inventoryStatus', timeout: 10000 }
        ];
        
        console.log('🔄 Loading dashboard data from API...');
        
        // Create timeout promise for each endpoint
        const createTimeoutPromise = (endpoint) => {
            return Promise.race([
                unifiedMagentoService.get(endpoint.path),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Timeout: ${endpoint.path} exceeded ${endpoint.timeout}ms`)), endpoint.timeout)
                )
            ]);
        };
        
        // Execute all requests with individual timeouts
        const responses = await Promise.allSettled(
            endpoints.map(endpoint => 
                createTimeoutPromise(endpoint).catch(error => {
                    console.warn(`⚠️ Endpoint ${endpoint.path} failed:`, error.message);
                    return { data: null, error: error.message };
                })
            )
        );
        
        // Build data object with proper error handling
        const data = {};
        endpoints.forEach((endpoint, index) => {
            const response = responses[index];
            if (response.status === 'fulfilled' && response.value?.data) {
                data[endpoint.key] = response.value.data;
            } else {
                data[endpoint.key] = endpoint.key.includes('Distribution') || endpoint.key === 'productTypes' ? [] : null;
                console.warn(`📊 Using fallback data for ${endpoint.key}`);
            }
        });
        
        setEnhancedData(data);
        
        // Cache successful data
        if (unifiedMagentoService._setCachedResponse) {
            unifiedMagentoService._setCachedResponse(cacheKey, data);
            console.log('💾 Cached enhanced data for faster subsequent loads');
        }
        
        // Log successful loads
        const successfulLoads = responses.filter(r => r.status === 'fulfilled' && r.value?.data).length;
        console.log(`✅ Dashboard data loaded: ${successfulLoads}/${endpoints.length} endpoints successful`);
        
    } catch (error) {
        console.error('❌ Error loading enhanced dashboard data:', error);
        
        // Set empty fallback data to prevent UI breaking
        setEnhancedData({
            productStats: null,
            productTypes: [],
            brandDistribution: [],
            categoryDistribution: [],
            productAttributes: [],
            salesPerformance: null,
            inventoryStatus: null
        });
        
        // Only show error for unexpected failures
        if (!error.message?.includes('Timeout') && error.response?.status !== 404) {
            toast.error('Some dashboard data could not be loaded. Using cached or default values.', {
                position: 'top-center',
                autoClose: 4000
            });
        }
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
      toast.success('Prices synced successfully', {
        position: 'top-center',
        autoClose: 2000
      });
    } catch (error) {
      toast.error('Failed to sync prices', {
        position: 'top-center',
        autoClose: 3000
      });
    }
  };

  const handleSyncStocks = async () => {
    try {
      await syncAllStocks();
      // Success notification is handled in the controller
    } catch (error) {
      toast.error('Failed to sync stocks', {
        position: 'top-center',
        autoClose: 3000
      });
    }
  };

  // Handle chart visibility toggle
  const toggleChartVisibility = (chartKey) => {
    setVisibleCharts(prev => ({ ...prev, [chartKey]: !prev[chartKey] }));
  };

  // Handle dashboard settings with unified settings integration
  const handleSettingsChange = (newSettings) => {
    setDashboardSettings(newSettings);

    // Save to unified settings
    try {
      const currentUnifiedSettings = JSON.parse(localStorage.getItem('techno-etl-settings') || '{}');
      const updatedUnifiedSettings = {
        ...currentUnifiedSettings,
        dashboard: newSettings
      };
      localStorage.setItem('techno-etl-settings', JSON.stringify(updatedUnifiedSettings));
      console.log('Dashboard settings saved to unified settings');
    } catch (error) {
      console.error('Failed to save dashboard settings to unified settings:', error);
      // Fallback to local storage
      localStorage.setItem('dashboardSettings', JSON.stringify(newSettings));
    }
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
      widgets: {
        taskManagement: true,
        recentActivity: true,
        performanceMetrics: true,
        quickActions: true,
        dashboardOverview: true
      },
      general: {
        autoRefresh: false,
        animations: true,
        compactMode: false,
        showTooltips: true
      }
    };
    setDashboardSettings(defaultSettings);

    // Remove from unified settings
    try {
      const currentUnifiedSettings = JSON.parse(localStorage.getItem('techno-etl-settings') || '{}');
      delete currentUnifiedSettings.dashboard;
      localStorage.setItem('techno-etl-settings', JSON.stringify(currentUnifiedSettings));
    } catch (error) {
      console.error('Failed to reset dashboard settings in unified settings:', error);
    }

    // Also remove old localStorage key for backward compatibility
    localStorage.removeItem('dashboardSettings');
  };

  // Settings are now loaded in the initial state from unified settings
  // This effect is kept for backward compatibility and migration
  useEffect(() => {
    const oldSettings = localStorage.getItem('dashboardSettings');
    if (oldSettings) {
      try {
        const parsedOldSettings = JSON.parse(oldSettings);
        // Migrate old settings to unified settings
        const currentUnifiedSettings = JSON.parse(localStorage.getItem('techno-etl-settings') || '{}');
        if (!currentUnifiedSettings.dashboard) {
          const updatedUnifiedSettings = {
            ...currentUnifiedSettings,
            dashboard: parsedOldSettings
          };
          localStorage.setItem('techno-etl-settings', JSON.stringify(updatedUnifiedSettings));
          localStorage.removeItem('dashboardSettings'); // Clean up old storage
          console.log('Migrated dashboard settings to unified settings');
        }
      } catch (error) {
        console.error('Error migrating dashboard settings:', error);
      }
    }
  }, []);

  // Handle price sync
  const handlePriceSync = async () => {
    try {
      // Use getPrices from the controller, which manages loading
      const pricesData = await getPrices();
      console.log('📊 Price data received:', pricesData.data);

      if (pricesData.data) {
        setPriceData(pricesData.data);
        setPriceSyncDialogOpen(true);
      } else {
        alert('No price data available for sync');
      }
    } catch (error) {
      console.error('❌ Failed to fetch price data:', error);
      alert('Failed to fetch price data: ' + error.message);
    }
  };

  // Handle settings menu
  const handleSettingsOpen = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  // Handle navigation using tab system (like sidebar)
  const handleNavigate = (section, params = {}) => {
    console.log('Dashboard: Navigating to section:', section, 'with params:', params);

    switch (section) {
      case 'revenue':
      case 'analytics':
        openTab('Charts');
        break;
      case 'orders':
      case 'pendingOrders':
        openTab('OrdersGrid');
        break;
      case 'products':
      case 'categories':
      case 'brands':
        openTab('ProductsGrid');
        break;
      case 'customers':
        openTab('CustomersGrid');
        break;
      case 'lowStock':
        openTab('StocksGrid'); // This is the inventory/stocks tab
        break;
      default:
        console.log('Unknown section:', section);
        // Try to open the section directly as a tab ID
        openTab(section);
    }
  };

  // Handle actions
  const handleAction = (action) => {
    switch (action) {
      case 'add-product':
      case 'import-data':
      case 'bulk-media-upload':
        openTab('ProductsGrid');
        break;
      case 'sync-products':
        console.log('Sync products');
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
      <Box 
        sx={{ 
          p: 3, 
          minHeight: '100vh', 
          bgcolor: 'background.default',
          direction: isRTL ? 'rtl' : 'ltr',
          // Ensure the dashboard respects theme changes
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}
      >
        {/* Header */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}15, ${muiTheme.palette.secondary.main}08)`,
            border: `1px solid ${muiTheme.palette.primary.light}20`,
            // Ensure RTL support for the header
            direction: isRTL ? 'rtl' : 'ltr',
            transition: 'all 0.3s ease'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {translate('navigation.dashboard') || 'Dashboard'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Date Range Pickers */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                mr: isRTL ? 0 : 2,
                ml: isRTL ? 2 : 0,
                direction: isRTL ? 'rtl' : 'ltr'
              }}>
                <DatePicker
                  label={translate('dashboard.startDate') || 'Start Date'}
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { size: 'small', sx: { width: 140 } } }}
                />
                <DatePicker
                  label={translate('dashboard.endDate') || 'End Date'}
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { size: 'small', sx: { width: 140 } } }}
                />
              </Box>

              {/* Sync Buttons */}
              <Tooltip title={translate('dashboard.syncPrices') || 'Sync Prices to Magento'}>
                <span>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handlePriceSync}
                    startIcon={<PriceIcon />}
                    sx={{ 
                      mr: isRTL ? 0 : 1,
                      ml: isRTL ? 1 : 0
                    }}
                    disabled={loading}
                  >
                    {translate('dashboard.syncPrices') || 'Sync Prices'}
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title={translate('dashboard.syncStocks') || 'Sync Stocks'}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSyncStocks}
                  startIcon={<StockIcon />}
                  sx={{ 
                    mr: isRTL ? 0 : 1,
                    ml: isRTL ? 1 : 0
                  }}
                >
                  {translate('dashboard.syncStocks') || 'Stocks'}
                </Button>
              </Tooltip>

              {/* Action Buttons */}
              <Tooltip title={translate('dashboard.viewAnalytics') || 'View Analytics'}>
                <Fab
                  size="medium"
                  color="secondary"
                  onClick={() => openTab('Charts')}
                  sx={{ 
                    boxShadow: 3,
                    margin: isRTL ? '0 4px 0 0' : '0 0 0 4px'
                  }}
                >
                  <AnalyticsIcon />
                </Fab>
              </Tooltip>

              <Tooltip title={loading ? (translate('common.refreshing') || 'Refreshing...') : (translate('common.refresh') || 'Refresh Data')}>
                <span>
                  <Fab
                    size="medium"
                    color="primary"
                    onClick={handleRefresh}
                    disabled={loading}
                    sx={{ 
                      boxShadow: 3,
                      margin: isRTL ? '0 4px 0 0' : '0 0 0 4px'
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
                  </Fab>
                </span>
              </Tooltip>

              <Tooltip title={translate('common.settings') || 'Settings'}>
                <IconButton
                  onClick={handleSettingsOpen}
                  sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { boxShadow: 4 },
                    margin: isRTL ? '0 4px 0 0' : '0 0 0 4px'
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
                boxShadow: muiTheme.shadows[8]
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
          <MenuItem onClick={() => openTab('Charts')}>
            <ListItemIcon><AnalyticsIcon /></ListItemIcon>
            <ListItemText>Analytics Dashboard</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleRefresh}>
            <ListItemIcon><RefreshIcon /></ListItemIcon>
            <ListItemText>Refresh Data</ListItemText>
          </MenuItem>
        </Menu>

        {/* Sync Progress Bar */}
        <SyncProgressBar progressData={syncProgress} />

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

            {/* Professional Metric Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <ProfessionalMetricCard
                  title="Total Revenue"
                  value={stats?.totalRevenue || 0}
                  previousValue={stats?.previousRevenue || 0}
                  icon={AttachMoney}
                  color="success"
                  loading={loading}
                  subtitle="This month"
                  trend="vs last month"
                  onClick={() => openTab('Orders')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <ProfessionalMetricCard
                  title="Active Orders"
                  value={stats?.totalOrders || 0}
                  previousValue={stats?.previousOrders || 0}
                  icon={ShoppingCart}
                  color="primary"
                  loading={loading}
                  subtitle="Processing"
                  trend="vs last month"
                  onClick={() => openTab('Orders')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <ProfessionalMetricCard
                  title="Total Customers"
                  value={stats?.totalCustomers || 0}
                  previousValue={stats?.previousCustomers || 0}
                  icon={People}
                  color="info"
                  loading={loading}
                  subtitle="Registered"
                  trend="vs last month"
                  onClick={() => openTab('Customers')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <ProfessionalMetricCard
                  title="Products"
                  value={stats?.totalProducts || 0}
                  previousValue={stats?.previousProducts || 0}
                  icon={Category}
                  color="warning"
                  loading={loading}
                  subtitle="In catalog"
                  trend="vs last month"
                  onClick={() => openTab('ProductsGrid')}
                />
              </Grid>
            </Grid>

            {/* Dashboard Test Summary (temporary for testing) */}
            <DashboardTestSummary />

            <Grid container spacing={3}>
              {/* Main Dashboard Overview */}
              <Grid size={{ xs: 12, lg: 8 }}>
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

              {/* Dashboard Widgets Sidebar */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Quick Actions */}
                  {dashboardSettings.widgets?.quickActions && (
                    <QuickActions onAction={handleAction} />
                  )}

                  {/* Task Management Widget */}
                  {dashboardSettings.widgets?.taskManagement && (
                    <TaskManagementWidget />
                  )}

                  {/* Recent Activity Feed */}
                  {dashboardSettings.widgets?.recentActivity && (
                    <RecentActivityFeed />
                  )}
                </Box>
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
                {/* Professional Chart Widgets */}
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ProfessionalChartWidget
                    title="📈 Revenue Trend"
                    data={chartData}
                    chartType="area"
                    loading={enhancedLoading}
                    color="success"
                    onRefresh={() => handleRefresh()}
                    onExpand={() => openTab('Charts')}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ProfessionalChartWidget
                    title="📊 Order Volume"
                    data={customerData}
                    chartType="bar"
                    loading={enhancedLoading}
                    color="primary"
                    onRefresh={() => handleRefresh()}
                    onExpand={() => openTab('Charts')}
                  />
                </Grid>

                {/* Performance Metrics Widget */}
                {dashboardSettings.widgets?.performanceMetrics ? (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <PerformanceMetricsWidget />
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <ProfessionalProgressWidget
                      title="🎯 Performance Metrics"
                      loading={enhancedLoading}
                      items={[
                        { label: 'Order Fulfillment', value: 85, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                        { label: 'Customer Satisfaction', value: 92, color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
                        { label: 'Inventory Accuracy', value: 78, color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
                        { label: 'System Uptime', value: 99, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
                      ]}
                    />
                  </Grid>
                )}

                {/* Product Statistics */}
                {dashboardSettings.charts.productStats && (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
                  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <BrandDistributionChart
                      data={enhancedData.brandDistribution}
                      title="🏷️ Top Brands"
                      loading={enhancedLoading}
                      compact={dashboardSettings.general.compactMode}
                    />
                  </Grid>
                )}

                {/* System Status Widget */}
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ProfessionalStatusWidget
                    title="🔧 System Status"
                    loading={enhancedLoading}
                    items={[
                      { label: 'Database Connection', status: 'success', description: 'All systems operational', badge: 'Online' },
                      { label: 'API Services', status: 'success', description: 'Response time: 120ms', badge: 'Healthy' },
                      { label: 'Cache System', status: 'warning', description: 'Memory usage: 78%', badge: 'Monitor' },
                      { label: 'Background Jobs', status: 'success', description: '12 jobs completed', badge: 'Active' }
                    ]}
                  />
                </Grid>

                {/* Product Attributes */}
                {dashboardSettings.charts.productAttributes && (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
                  <Grid size={{ xs: 12, md: 6 }}>
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
                  <Grid size={{ xs: 12, md: 6 }}>
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
                  <Grid size={{ xs: 12 }}>
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

        {/* Price Sync Dialog */}
        <PriceSyncDialog
          open={priceSyncDialogOpen}
          onClose={() => setPriceSyncDialogOpen(false)}
          priceData={priceData}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;
