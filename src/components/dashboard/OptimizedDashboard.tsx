import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
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
import { useCustomTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { useTab } from '../../contexts/TabContext';
import { StatsCards } from '../common/StatsCards';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useOptimizedContext } from '../../utils/contextOptimization';
import { processGridRows, generateOptimizedColumns } from '../../utils/optimizedGridUtils';

// Memoized dashboard components
const MemoizedStatsCards = memo(StatsCards);

const OptimizedDashboard = () => {
  // Performance monitoring
  const performance = usePerformanceMonitor('OptimizedDashboard');
  
  // Contexts with optimization
  const { theme } = useOptimizedContext(ThemeContext, (context) => ({ theme: context.theme }));
  const { language, t } = useOptimizedContext(LanguageContext, (context) => ({
    language: context.language,
    t: context.t
  }));
  const { activeTab, setActiveTab } = useOptimizedContext(TabContext, (context) => ({
    activeTab: context.activeTab,
    setActiveTab: context.setActiveTab
  }));
  
  const muiTheme = useTheme();
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [expandedSections, setExpandedSections] = useState({
    sales: true,
    inventory: true,
    customers: true
  });
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Memoized data processing
  const processedData = useMemo(() => {
    if (!dashboardData) return null;
    
    return performance.trackExpensiveCalculation('processDashboardData',
      (data) => ({
        salesData: processGridRows(data.sales || [], {
          revenue: (value) => parseFloat(value),
          growth: (value) => parseFloat(value)
        }),
        inventoryData: processGridRows(data.inventory || [], {
          stock: (value) => parseInt(value),
          price: (value) => parseFloat(value)
        }),
        customerData: processGridRows(data.customers || [], {
          orders: (value) => parseInt(value),
          value: (value) => parseFloat(value)
        })
      }),
      dashboardData
    );
  }, [dashboardData, performance]);

  // Toggle section expansion
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({ ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Refresh dashboard data
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setDashboardData({
        sales: [
          { name: 'Jan', revenue: 4000, growth: 24 },
          { name: 'Feb', revenue: 3000, growth: 15 },
          { name: 'Mar', revenue: 2000, growth: -5 },
          { name: 'Apr', revenue: 2780, growth: 12 },
          { name: 'May', revenue: 1890, growth: 8 }
        ],
        inventory: [
          { id: 1, name: 'Product A', stock: 120, price: 29.99 },
          { id: 2, name: 'Product B', stock: 85, price: 49.99 },
          { id: 3, name: 'Product C', stock: 210, price: 19.99 }
        ],
        customers: [
          { id: 1, name: 'John Doe', orders: 5, value: 245.50 },
          { id: 2, name: 'Jane Smith', orders: 3, value: 189.25 },
          { id: 3, name: 'Bob Johnson', orders: 7, value: 412.75 }
        ]
      });
      
      toast.success(t('dashboard.refreshSuccess') || 'Dashboard refreshed successfully');
    } catch(error: any) {
      toast.error(t('dashboard.refreshError') || 'Failed to refresh dashboard');
      console.error('Dashboard refresh error:', error);
    } finally {
      setLoading(false);
  }, [t]);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Chart colors
  const chartColors = useMemo(() => [
    muiTheme.palette.primary.main,
    muiTheme.palette.secondary.main,
    muiTheme.palette.success.main,
    muiTheme.palette.warning.main,
    muiTheme.palette.error.main
  ], [muiTheme.palette]);

  // Render loading state
  if(loading && !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh"></
        <CircularProgress />
        <Typography variant="body1" sx={{ display: "flex", ml: 2 }}>
          {t('dashboard.loading') || 'Loading dashboard...'}
        </Typography>
      </Box>
    );
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}></
      <Box sx={{ display: "flex", p: 3 }}>
        {/* Dashboard Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}></
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {t('dashboard.title') || 'Dashboard'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {t('dashboard.subtitle') || 'Welcome to your TECHNO-ETL dashboard'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}></
            <IconButton onClick={refreshData}
              color
              disabled={loading}>
              <RefreshIcon /></RefreshIcon>
            <IconButton color="primary"></
              <SettingsIcon /></SettingsIcon>
          </Box>
        </Box>

        {/* Date Range Selector */}
        <Paper sx={{ display: "flex", p: 2, mb: 3 }}></
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker label={t('dashboard.startDate') || 'Start Date'}
              value={dateRange.start}
              onChange={(e) => (newValue) => setDateRange(prev => ({ ...prev, start: newValue }))}
              renderInput={(params) => <TextField { ...params} />}
            />
            <DatePicker label={t('dashboard.endDate') || 'End Date'}
              value={dateRange.end}
              onChange={(e) => (newValue) => setDateRange(prev => ({ ...prev, end: newValue }))}
              renderInput={(params) => <TextField { ...params} />}
            />
          </Box>
        </Paper>

        {/* Stats Cards */}
        {processedData && (
          <MemoizedStatsCards
            data
                value: '$24,569',
                change: '+12.5%',
                icon: <TrendingUp />,
                color: 'primary'
              },
              {
                title: t('dashboard.orders') || 'Orders',
                value: '1,234',
                change: '+8.2%',
                icon: <ShoppingCart />,
                color: 'secondary'
              },
              {
                title: t('dashboard.customers') || 'Customers',
                value: '2,543',
                change: '+3.1%',
                icon: <People />,
                color: 'success'
              },
              {
                title: t('dashboard.products') || 'Products',
                value: '128',
                change: '-1.2%',
                icon: <Category />,
                color: 'warning'
            ]}
          />
        )}

        <Divider sx={{ display: "flex", my: 3 }} />

        {/* Charts Section */}
        <Grid { ...{container: true}} spacing={3}>
          {/* Sales Chart */}
          <Grid size={12}></
            <Paper sx={{ display: "flex", p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}></
                <Typography variant="h6">
                  {t('dashboard.salesChart') || 'Sales Overview'}
                </Typography>
                <IconButton onClick={() => toggleSection('sales')} size="small">
                  {expandedSections.sales ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.sales}>
                {processedData.salesData && (
                  <Box sx={{ display: "flex", height: 400 }}></
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processedData.salesData}></
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" /></
                        <YAxis />
                        <RechartsTooltip /></
                        <Legend />
                        <Line 
                          type
                          stroke={chartColors[0]} 
                          activeDot={{ r: 8 }} 
                          name={t('dashboard.revenue') || 'Revenue'}
                        /></
                        <Line type
                          stroke={chartColors[1]} 
                          name={t('dashboard.growth') || 'Growth %'}
                        /></Line>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Collapse>
            </Paper>
          </Grid>

          {/* Inventory and Customers */}
          <Grid size={{ xs: 12, md: 6 }}></
            <Paper sx={{ display: "flex", p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}></
                <Typography variant="h6">
                  {t('dashboard.inventory') || 'Inventory Status'}
                </Typography>
                <IconButton onClick={() => toggleSection('inventory')} size="small">
                  {expandedSections.inventory ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.inventory}>
                {processedData.inventoryData && (
                  <Box sx={{ display: "flex", height: 300 }}></
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData.inventoryData}></
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" /></
                        <YAxis />
                        <RechartsTooltip /></
                        <Legend />
                        <Bar 
                          dataKey
                          fill={chartColors[2]} 
                          name={t('dashboard.stock') || 'Stock'} 
                        /></
                        <Bar dataKey
                          fill={chartColors[3]} 
                          name={t('dashboard.price') || 'Price'} 
                        /></Bar>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Collapse>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}></
            <Paper sx={{ display: "flex", p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}></
                <Typography variant="h6">
                  {t('dashboard.customers') || 'Top Customers'}
                </Typography>
                <IconButton onClick={() => toggleSection('customers')} size="small">
                  {expandedSections.customers ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.customers}>
                {processedData?.customerData && (
                  <Box sx={{ display: "flex", height: 300 }}></
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart></
                        <Pie data={processedData.customerData}
                          cx
                          labelLine={false}
                          outerRadius={80}
                          fill
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {processedData.customerData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [`$${value.toFixed(2)}`, t('dashboard.value')]} />
                        <Legend /></Legend>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Collapse>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default memo(OptimizedDashboard);