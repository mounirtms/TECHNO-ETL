import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Sync as SyncIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// Import sync dialogs
import PriceSyncDialog from './PriceSyncDialog';
import StockSyncDialog from './StockSyncDialog';

// Import other dashboard components
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import TooltipWrapper from '../common/TooltipWrapper';

/**
 * Comprehensive Dashboard Component
 * Features sync buttons, charts, stats, and real-time data
 */
const ComprehensiveDashboard = () => {
  const theme = useTheme();
  const { translate } = useLanguage();
  const { currentUser } = useAuth();

  // State management
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [priceSyncOpen, setPriceSyncOpen] = useState(false);
  const [stockSyncOpen, setStockSyncOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    price: { active: false, progress: 0, message: '' },
    stock: { active: false, progress: 0, message: '' }
  });

  // Mock data for demonstration
  const mockData = useMemo(() => ({
    stats: [
      {
        title: translate('dashboard.totalProducts') || 'Total Products',
        value: '2,847',
        change: '+12.5%',
        changeType: 'positive',
        icon: <InventoryIcon />,
        color: theme.palette.primary.main,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        title: translate('dashboard.totalOrders') || 'Total Orders',
        value: '1,234',
        change: '+8.2%',
        changeType: 'positive',
        icon: <ShoppingCartIcon />,
        color: theme.palette.success.main,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        title: translate('dashboard.totalCustomers') || 'Total Customers',
        value: '5,678',
        change: '+3.1%',
        changeType: 'positive',
        icon: <PeopleIcon />,
        color: theme.palette.info.main,
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      },
      {
        title: translate('dashboard.totalRevenue') || 'Total Revenue',
        value: '$89,247',
        change: '+15.8%',
        changeType: 'positive',
        icon: <MoneyIcon />,
        color: theme.palette.warning.main,
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      }
    ],
    salesData: [
      { name: 'Jan', sales: 4000, orders: 240, customers: 120 },
      { name: 'Feb', sales: 3000, orders: 198, customers: 110 },
      { name: 'Mar', sales: 2000, orders: 180, customers: 95 },
      { name: 'Apr', sales: 2780, orders: 220, customers: 140 },
      { name: 'May', sales: 1890, orders: 160, customers: 85 },
      { name: 'Jun', sales: 2390, orders: 200, customers: 125 }
    ],
    categoryData: [
      { name: 'Electronics', value: 400, color: theme.palette.primary.main },
      { name: 'Clothing', value: 300, color: theme.palette.secondary.main },
      { name: 'Books', value: 200, color: theme.palette.success.main },
      { name: 'Home & Garden', value: 150, color: theme.palette.warning.main },
      { name: 'Sports', value: 100, color: theme.palette.error.main }
    ],
    recentActivity: [
      { id: 1, action: 'Price sync completed', time: '2 minutes ago', status: 'success' },
      { id: 2, action: 'New order received', time: '5 minutes ago', status: 'info' },
      { id: 3, action: 'Stock sync in progress', time: '10 minutes ago', status: 'warning' },
      { id: 4, action: 'Customer registered', time: '15 minutes ago', status: 'success' }
    ]
  }), [theme.palette, translate]);

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDashboardData(mockData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mockData]);

  // Handle price sync
  const handlePriceSync = useCallback(async () => {
    setSyncStatus(prev => ({
      ...prev,
      price: { active: true, progress: 0, message: 'Starting price sync...' }
    }));

    try {
      // Simulate sync progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSyncStatus(prev => ({
          ...prev,
          price: { 
            active: i < 100, 
            progress: i, 
            message: i < 100 ? `Syncing prices... ${i}%` : 'Price sync completed!' 
          }
        }));
      }
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        price: { active: false, progress: 0, message: 'Price sync failed!' }
      }));
    }
  }, []);

  // Handle stock sync
  const handleStockSync = useCallback(async () => {
    setSyncStatus(prev => ({
      ...prev,
      stock: { active: true, progress: 0, message: 'Starting stock sync...' }
    }));

    try {
      // Simulate sync progress
      for (let i = 0; i <= 100; i += 15) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setSyncStatus(prev => ({
          ...prev,
          stock: { 
            active: i < 100, 
            progress: i, 
            message: i < 100 ? `Syncing stock... ${i}%` : 'Stock sync completed!' 
          }
        }));
      }
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        stock: { active: false, progress: 0, message: 'Stock sync failed!' }
      }));
    }
  }, []);

  // Refresh dashboard
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setDashboardData({ ...mockData });
      setLoading(false);
    }, 1000);
  }, [mockData]);

  if (loading && !dashboardData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          {translate('dashboard.loading') || 'Loading Dashboard...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Dashboard Header */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DashboardIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>
                {translate('dashboard.title') || 'Dashboard'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Welcome back, {currentUser?.displayName || 'User'}! Here's your business overview.
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<SyncIcon />}
              onClick={() => setPriceSyncOpen(true)}
              disabled={syncStatus.price.active}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                }
              }}
            >
              {syncStatus.price.active ? 'Syncing Prices...' : 'Sync Prices'}
            </Button>

            <Button
              variant="contained"
              startIcon={<StorageIcon />}
              onClick={() => setStockSyncOpen(true)}
              disabled={syncStatus.stock.active}
              sx={{
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                }
              }}
            >
              {syncStatus.stock.active ? 'Syncing Stock...' : 'Sync Stock'}
            </Button>

            <TooltipWrapper title="Refresh dashboard data">
              <IconButton
                onClick={handleRefresh}
                disabled={loading}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </TooltipWrapper>
          </Box>
        </Box>
      </Fade>

      {/* Sync Status Alerts */}
      {(syncStatus.price.message || syncStatus.stock.message) && (
        <Box sx={{ mb: 3 }}>
          {syncStatus.price.message && (
            <Alert 
              severity={syncStatus.price.active ? 'info' : 'success'} 
              sx={{ mb: 1 }}
              action={
                syncStatus.price.active && (
                  <CircularProgress size={20} color="inherit" />
                )
              }
            >
              {syncStatus.price.message}
            </Alert>
          )}
          {syncStatus.stock.message && (
            <Alert 
              severity={syncStatus.stock.active ? 'info' : 'success'}
              action={
                syncStatus.stock.active && (
                  <CircularProgress size={20} color="inherit" />
                )
              }
            >
              {syncStatus.stock.message}
            </Alert>
          )}
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardData?.stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Zoom in timeout={600 + index * 100}>
              <Card sx={{ 
                height: '100%',
                background: stat.gradient,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                },
                transition: 'all 0.3s ease-in-out'
              }}>
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: alpha('#fff', 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {stat.icon}
                    </Box>
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{
                        backgroundColor: alpha('#fff', 0.2),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  <Typography variant="h4" component="div" fontWeight={700} gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {stat.title}
                  </Typography>
                </CardContent>
                <Box sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  backgroundColor: alpha('#fff', 0.1),
                  zIndex: 0
                }} />
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Fade in timeout={800}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <TimelineIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Sales Trend Analysis
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.salesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#salesGradient)"
                    name="Sales ($)"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={3}
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <Fade in timeout={1000}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CategoryIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Category Distribution
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData?.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardData?.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Fade in timeout={1200}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <SpeedIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Recent Activity
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {dashboardData?.recentActivity.map((activity, index) => (
              <Box
                key={activity.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <Chip
                  size="small"
                  color={activity.status}
                  label={activity.status}
                  sx={{ minWidth: 80 }}
                />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {activity.action}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Fade>

      {/* Sync Dialogs */}
      <PriceSyncDialog
        open={priceSyncOpen}
        onClose={() => setPriceSyncOpen(false)}
        onSync={handlePriceSync}
        priceData={[
          { sku: 'PROD-001', price: 29.99 },
          { sku: 'PROD-002', price: 49.99 },
          { sku: 'PROD-003', price: 19.99 }
        ]}
      />

      <StockSyncDialog
        open={stockSyncOpen}
        onClose={() => setStockSyncOpen(false)}
        onSync={handleStockSync}
        syncProgress={{
          current: syncStatus.stock.progress / 25,
          total: 4,
          isActive: syncStatus.stock.active,
          completed: syncStatus.stock.progress === 100,
          currentStep: syncStatus.stock.message,
          sources: [
            { code_source: 'WH001', source: 'Main Warehouse' },
            { code_source: 'WH002', source: 'Secondary Warehouse' }
          ]
        }}
      />
    </Box>
  );
};

export default ComprehensiveDashboard;