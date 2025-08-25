import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  Fab,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp,
  Category,
  Inventory,
  ShoppingCart,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Import chart components
import {
  ProductStatsChart,
  BrandDistributionChart,
  CategoryTreeChart,
  ProductAttributesChart,
  SalesPerformanceChart,
  InventoryStatusChart
} from '../components/charts';

// Import unified service
import unifiedMagentoService from '../services/unifiedMagentoService';
import { useDashboardParams } from '../hooks/useHashParams';
import ComponentErrorBoundary from '../components/common/ComponentErrorBoundary';

/**
 * Charts Page - Dedicated analytics and charts page
 * Provides comprehensive data visualization and analytics
 */
const ChartsPage = () => {
  const theme = useTheme();
  const {
    getView,
    getPeriod,
    isRevenueView,
    params
  } = useDashboardParams();

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    productStats: [],
    brandDistribution: [],
    categoryDistribution: [],
    productAttributes: [],
    salesPerformance: [],
    inventoryStatus: []
  });

  // Load chart data
  const loadData = async () => {
    try {
      setLoading(true);
      const cacheKey = 'chartsPageData';
      const cachedData = unifiedMagentoService._getCachedResponse(cacheKey);

      if (cachedData) {
        console.log('Loaded charts data from cache');
        setData(cachedData);
      } else {
        const responses = await Promise.all([
          unifiedMagentoService.get('/products/stats'),
          unifiedMagentoService.get('/brands/distribution'),
          unifiedMagentoService.get('/categories/distribution'),
          unifiedMagentoService.get('/products/attributes'),
          unifiedMagentoService.get('/sales/performance'),
          unifiedMagentoService.get('/inventory/status')
        ]);
        const chartData = {
          productStats: responses[0].data,
          brandDistribution: responses[1].data,
          categoryDistribution: responses[2].data,
          productAttributes: responses[3].data,
          salesPerformance: responses[4].data,
          inventoryStatus: responses[5].data
        };
        setData(chartData);
        unifiedMagentoService._setCachedResponse(cacheKey, chartData);
        console.log('Stored charts data to cache');
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );

  const chartTabs = [
    {
      label: 'Overview',
      icon: <AnalyticsIcon />,
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ProductStatsChart 
              data={data.productStats}
              title="Product Status Distribution"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <BrandDistributionChart 
              data={data.brandDistribution}
              title="Top Brands"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CategoryTreeChart 
              data={data.categoryDistribution}
              title="Category Distribution"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProductAttributesChart 
              data={data.productAttributes}
              title="Product Features"
            />
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Sales',
      icon: <TrendingUp />,
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SalesPerformanceChart 
              data={data.salesPerformance}
              title="Sales Performance Trends"
              type="area"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SalesPerformanceChart 
              data={data.salesPerformance}
              title="Revenue Analysis"
              type="line"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProductStatsChart 
              data={data.productStats}
              title="Product Performance"
            />
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Inventory',
      icon: <Inventory />,
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InventoryStatusChart 
              data={data.inventoryStatus}
              title="Inventory Overview by Category"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CategoryTreeChart 
              data={data.categoryDistribution}
              title="Stock Distribution by Category"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProductAttributesChart 
              data={data.productAttributes}
              title="Product Attributes Analysis"
            />
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Products',
      icon: <ShoppingCart />,
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ProductStatsChart 
              data={data.productStats}
              title="Product Status"
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <BrandDistributionChart 
              data={data.brandDistribution}
              title="Brand Performance"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProductAttributesChart 
              data={data.productAttributes}
              title="Product Features Distribution"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CategoryTreeChart 
              data={data.categoryDistribution}
              title="Product Categories"
            />
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Categories',
      icon: <Category />,
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CategoryTreeChart 
              data={data.categoryDistribution}
              title="Category Hierarchy & Distribution"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InventoryStatusChart 
              data={data.inventoryStatus}
              title="Stock by Category"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <BrandDistributionChart 
              data={data.brandDistribution}
              title="Brands by Category"
            />
          </Grid>
        </Grid>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Dashboard Context Alert */}
      {isRevenueView() && (
        <Alert
          severity="info"
          icon={<TrendingUp />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              Dashboard navigation: Viewing revenue analytics
            </Typography>
            <Chip
              label={`Period: ${getPeriod()}`}
              color="primary"
              size="small"
            />
            {getView() !== 'overview' && (
              <Chip
                label={`View: ${getView()}`}
                color="secondary"
                size="small"
              />
            )}
          </Box>
        </Alert>
      )}

      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Analytics & Charts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive data visualization and business intelligence
          </Typography>
        </Box>
        
        <Tooltip title="Refresh Data">
          <Fab
            color="primary"
            size="medium"
            onClick={loadData}
            disabled={loading}
            sx={{ boxShadow: 3 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
          </Fab>
        </Tooltip>
      </Box>

      {/* Charts Content */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500
            }
          }}
        >
          {chartTabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          ))}
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3, minHeight: 600 }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: 400 
            }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            chartTabs.map((tab, index) => (
              <TabPanel key={index} value={activeTab} index={index}>
                <ComponentErrorBoundary componentName={`${tab.label} Charts`}>
                  {tab.content}
                </ComponentErrorBoundary>
              </TabPanel>
            ))
          )}
        </Box>
      </Paper>

      {/* Footer Info */}
      <Alert 
        severity="info" 
        sx={{ 
          mt: 3, 
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            📊 <strong>Analytics Dashboard:</strong> Real-time data visualization with interactive charts and comprehensive business insights.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Alert>
    </Box>
  );
};

export default ChartsPage;
