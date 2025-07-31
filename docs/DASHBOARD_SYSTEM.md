# 📊 Dashboard System Documentation

## Overview

The Enhanced Dashboard System provides a comprehensive business intelligence interface with 8 professional stat cards, interactive charts, and advanced customization capabilities. Built with React 18 and Material-UI 5, it offers real-time data visualization and professional-grade analytics.

## 🎯 Key Features

### **8 Professional Stat Cards**
- **Total Revenue** - Monthly revenue tracking with growth indicators
- **Total Orders** - Order volume with trend analysis
- **Active Products** - Product catalog metrics with progress tracking
- **Total Customers** - Customer base expansion analytics
- **Product Categories** - Catalog organization metrics
- **Active Brands** - Brand portfolio growth tracking
- **Low Stock Items** - Inventory alerts with status indicators
- **Pending Orders** - Order fulfillment tracking

### **Advanced Settings System**
- **Individual Card Visibility** - Toggle any of the 8 stat cards
- **Chart Customization** - Show/hide analytics charts
- **General Settings** - Auto-refresh, animations, compact mode
- **Persistent Preferences** - Settings saved to localStorage
- **Professional Dialog** - Organized settings interface

### **Interactive Charts**
- **Orders Overview** - Line chart with trend visualization
- **Customer Growth** - Bar chart with monthly analytics
- **Product Statistics** - Pie chart with status distribution
- **Brand Distribution** - Donut chart with top brands
- **Category Tree** - Treemap with hierarchical structure
- **Sales Performance** - Area chart with performance trends
- **Inventory Status** - Bar chart with stock levels
- **Product Attributes** - Radar chart with feature analysis

## 📋 Component Architecture

### **Main Dashboard Component**

```jsx
// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import EnhancedStatsCards from '../components/dashboard/EnhancedStatsCards';
import DashboardSettings from '../components/dashboard/DashboardSettings';

const Dashboard = () => {
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

  return (
    <Box>
      <EnhancedStatsCards
        stats={stats}
        settings={dashboardSettings}
        loading={loading}
        onNavigate={handleNavigate}
        onCardAction={handleCardAction}
      />
      
      <DashboardSettings
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        settings={dashboardSettings}
        onSettingsChange={handleSettingsChange}
        onResetSettings={handleResetSettings}
      />
    </Box>
  );
};
```

### **Enhanced Stats Cards Component**

```jsx
// src/components/dashboard/EnhancedStatsCards.jsx
const EnhancedStatsCards = ({ 
  stats, 
  settings, 
  loading = false, 
  onNavigate,
  onCardAction 
}) => {
  const statCards = [
    {
      key: 'revenue',
      title: 'Total Revenue',
      value: stats?.totalRevenue ? `${(stats.totalRevenue / 1000000).toFixed(1)}M DA` : '2.8M DA',
      change: '+12.5%',
      trend: 'up',
      icon: AttachMoney,
      color: 'success',
      progress: 75,
      subtitle: 'This month',
      description: 'Monthly revenue growth',
      target: 3000000,
      current: stats?.totalRevenue || 2800000
    },
    // ... 7 more cards
  ];

  return (
    <Grid container spacing={3}>
      {visibleCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={card.key}>
          <Card sx={{ /* Professional styling */ }}>
            <CardContent>
              {/* Card content with animations and interactions */}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
```

### **Dashboard Settings Component**

```jsx
// src/components/dashboard/DashboardSettings.jsx
const DashboardSettings = ({ 
  open, 
  onClose, 
  settings, 
  onSettingsChange,
  onResetSettings 
}) => {
  const statCardSettings = [
    { key: 'revenue', label: 'Total Revenue', icon: '💰' },
    { key: 'orders', label: 'Total Orders', icon: '🛒' },
    // ... 6 more cards
  ];

  const chartSettings = [
    { key: 'orders', label: 'Orders Overview', icon: '📈' },
    { key: 'customers', label: 'Customer Growth', icon: '👥' },
    // ... 6 more charts
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Dashboard Settings</DialogTitle>
      <DialogContent>
        {/* Stats Cards Settings */}
        <Grid container spacing={2}>
          {statCardSettings.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.key}>
              <Card>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6">{card.icon}</Typography>
                  <Typography variant="body2">{card.label}</Typography>
                  <Switch
                    checked={settings.statCards?.[card.key] || false}
                    onChange={(e) => handleSettingChange('statCards', card.key, e.target.checked)}
                  />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Settings */}
        {/* General Settings */}
      </DialogContent>
    </Dialog>
  );
};
```

## 🎨 Design System

### **Color Palette**

```javascript
const cardColors = {
  revenue: 'success',    // Green for positive financial metrics
  orders: 'primary',     // Blue for order-related data
  products: 'info',      // Light blue for product metrics
  customers: 'secondary', // Purple for customer data
  categories: 'warning',  // Orange for organizational metrics
  brands: 'info',        // Light blue for brand data
  lowStock: 'error',     // Red for alerts and warnings
  pendingOrders: 'warning' // Orange for pending items
};
```

### **Typography Scale**

```javascript
const typography = {
  cardTitle: 'h6',        // Card titles
  cardValue: 'h4',        // Main metric values
  cardSubtitle: 'body2',  // Secondary information
  cardDescription: 'caption', // Descriptive text
  sectionTitle: 'h5',     // Section headers
  dialogTitle: 'h6'       // Dialog headers
};
```

### **Spacing System**

```javascript
const spacing = {
  cardPadding: 3,         // 24px padding for cards
  gridSpacing: 3,         // 24px spacing between grid items
  sectionMargin: 4,       // 32px margin between sections
  compactPadding: 2,      // 16px padding in compact mode
  compactSpacing: 2       // 16px spacing in compact mode
};
```

## 📊 Data Flow

### **Data Sources**

```javascript
// Dashboard data comes from multiple sources
const dataSources = {
  // MDM Database (SQL Server)
  mdm: {
    products: '/api/products/stats',
    categories: '/api/categories/stats',
    brands: '/api/brands/stats'
  },
  
  // Magento API
  magento: {
    orders: '/api/magento/orders/stats',
    customers: '/api/magento/customers/stats',
    revenue: '/api/magento/sales/stats'
  },
  
  // Calculated Metrics
  calculated: {
    lowStock: 'products.filter(p => p.stock < threshold)',
    pendingOrders: 'orders.filter(o => o.status === "pending")',
    growthRates: 'calculateGrowthRates(currentData, previousData)'
  }
};
```

### **Real-time Updates**

```javascript
// Auto-refresh functionality
const useAutoRefresh = (enabled, interval = 300000) => { // 5 minutes
  useEffect(() => {
    if (!enabled) return;
    
    const timer = setInterval(() => {
      refreshDashboardData();
    }, interval);
    
    return () => clearInterval(timer);
  }, [enabled, interval]);
};

// Manual refresh
const handleRefresh = async () => {
  setLoading(true);
  try {
    const [statsData, chartsData] = await Promise.all([
      fetchDashboardStats(),
      fetchChartsData()
    ]);
    
    setStats(statsData);
    setChartsData(chartsData);
    
    // Update cache
    cacheService.set('dashboard-stats', statsData, 300); // 5 minutes
    cacheService.set('dashboard-charts', chartsData, 600); // 10 minutes
  } catch (error) {
    showErrorNotification('Failed to refresh dashboard data');
  } finally {
    setLoading(false);
  }
};
```

## ⚙️ Configuration Options

### **Dashboard Settings Schema**

```javascript
const dashboardSettingsSchema = {
  statCards: {
    revenue: boolean,
    orders: boolean,
    products: boolean,
    customers: boolean,
    categories: boolean,
    brands: boolean,
    lowStock: boolean,
    pendingOrders: boolean
  },
  charts: {
    orders: boolean,
    customers: boolean,
    productStats: boolean,
    brandDistribution: boolean,
    categoryTree: boolean,
    salesPerformance: boolean,
    inventoryStatus: boolean,
    productAttributes: boolean
  },
  general: {
    autoRefresh: boolean,
    animations: boolean,
    compactMode: boolean,
    showTooltips: boolean
  }
};
```

### **Default Configuration**

```javascript
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
```

### **Settings Persistence**

```javascript
// Save settings to localStorage
const saveSettings = (settings) => {
  try {
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save dashboard settings:', error);
  }
};

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('dashboardSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  } catch (error) {
    console.error('Failed to load dashboard settings:', error);
    return defaultSettings;
  }
};
```

## 🚀 Performance Optimization

### **React.memo Implementation**

```javascript
// Memoized stat card component
const StatCard = React.memo(({ card, settings, onNavigate, onCardAction }) => {
  return (
    <Card sx={{ /* styling */ }}>
      {/* Card content */}
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.card.value === nextProps.card.value &&
    prevProps.settings.general.compactMode === nextProps.settings.general.compactMode &&
    prevProps.settings.general.animations === nextProps.settings.general.animations
  );
});
```

### **Lazy Loading**

```javascript
// Lazy load chart components
const OrdersChart = lazy(() => import('../charts/OrdersChart'));
const CustomersChart = lazy(() => import('../charts/CustomersChart'));

// Usage with Suspense
<Suspense fallback={<ChartSkeleton />}>
  {settings.charts.orders && <OrdersChart data={chartData.orders} />}
</Suspense>
```

### **Virtual Scrolling for Large Datasets**

```javascript
// Virtual scrolling for chart data
const VirtualizedChart = ({ data, height = 300 }) => {
  const [visibleData, setVisibleData] = useState([]);
  
  useEffect(() => {
    // Only render visible data points
    const visible = data.slice(0, 100); // Limit to 100 points
    setVisibleData(visible);
  }, [data]);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={visibleData}>
        {/* Chart components */}
      </LineChart>
    </ResponsiveContainer>
  );
};
```

## 📱 Responsive Design

### **Breakpoint Configuration**

```javascript
const breakpoints = {
  xs: 0,     // Extra small devices (phones)
  sm: 600,   // Small devices (tablets)
  md: 900,   // Medium devices (small laptops)
  lg: 1200,  // Large devices (desktops)
  xl: 1536   // Extra large devices (large desktops)
};

// Grid layout for different screen sizes
const getGridLayout = (cardCount) => {
  if (cardCount <= 4) {
    return { xs: 12, sm: 6, md: 4, lg: 3 }; // 4 cards per row on large screens
  } else if (cardCount <= 6) {
    return { xs: 12, sm: 6, md: 4, lg: 4 }; // 3 cards per row on large screens
  } else {
    return { xs: 12, sm: 6, md: 4, lg: 3 }; // 4 cards per row on large screens
  }
};
```

### **Compact Mode**

```javascript
// Compact mode adjustments
const getCardHeight = (compactMode) => compactMode ? 180 : 220;
const getIconSize = (compactMode) => compactMode ? 40 : 56;
const getChartHeight = (compactMode) => compactMode ? 250 : 300;
```

## 🔧 API Integration

### **Dashboard Stats Endpoint**

```javascript
// GET /api/dashboard/stats
const fetchDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return {
    totalRevenue: response.data.revenue,
    totalOrders: response.data.orders,
    totalProducts: response.data.products,
    totalCustomers: response.data.customers,
    totalCategories: response.data.categories,
    totalBrands: response.data.brands,
    lowStockItems: response.data.lowStock,
    pendingOrders: response.data.pending
  };
};
```

### **Charts Data Endpoint**

```javascript
// GET /api/dashboard/charts
const fetchChartsData = async () => {
  const response = await api.get('/dashboard/charts');
  return {
    orders: response.data.ordersChart,
    customers: response.data.customersChart,
    productStats: response.data.productStatsChart,
    brandDistribution: response.data.brandChart,
    categoryTree: response.data.categoryChart,
    salesPerformance: response.data.salesChart,
    inventoryStatus: response.data.inventoryChart,
    productAttributes: response.data.attributesChart
  };
};
```

## 🔄 Price Sync System

### **Enhanced Price Synchronization**

The dashboard includes a professional price sync system that integrates with Magento's bulk API for efficient price updates.

#### **Features**

**🚀 Magento Bulk API Integration**
- Uses `async/bulk/V1/products` endpoint for efficient bulk operations
- Automatic fallback to individual product updates if bulk API fails
- Proper handling of French Magento error messages
- Comprehensive error handling and retry logic

**📊 Professional UI Interface**
- Material-UI dialog with professional design
- Real-time progress tracking with visual indicators
- Detailed results table with success/failure breakdown
- Export functionality for sync results to CSV
- Sample data preview before sync operation

**⚡ Performance Optimization**
- Batch processing with rate limiting to avoid API overload
- Smart caching of price data with 1-hour expiry
- Efficient data transformation and validation
- Memory usage optimization for large datasets

#### **Implementation**

**Backend Integration:**
```javascript
// Enhanced syncPricesToMagento function
async function syncPricesToMagento(req) {
  try {
    const priceData = req.body;

    // Try Magento bulk API first
    const bulkOperations = priceData.map(item => ({
      "product": {
        "sku": item.sku.toString(),
        "price": parseFloat(item.price)
      }
    }));

    const response = await magento.post("async/bulk/V1/products", bulkOperations);

    return {
      success: true,
      method: 'bulk',
      total: priceData.length,
      bulkId: response.bulk_uuid,
      message: 'Bulk operation submitted successfully'
    };

  } catch (bulkError) {
    // Fallback to individual updates with batch processing
    const results = [];
    const batchSize = 5;

    for (let i = 0; i < priceData.length; i += batchSize) {
      const batch = priceData.slice(i, i + batchSize);

      for (const item of batch) {
        try {
          const endpoint = `products/${encodeURIComponent(item.sku)}`;
          const productData = {
            "product": {
              "sku": item.sku.toString(),
              "price": parseFloat(item.price)
            }
          };

          const response = await magento.put(endpoint, productData);
          results.push({
            sku: item.sku,
            status: 'success',
            price: item.price,
            method: 'individual'
          });

          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          results.push({
            sku: item.sku,
            status: 'error',
            price: item.price,
            method: 'individual',
            error: error.message
          });
        }
      }
    }

    return {
      success: true,
      method: 'fallback',
      total: priceData.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results
    };
  }
}
```

**Frontend Component:**
```jsx
// PriceSyncDialog component
const PriceSyncDialog = ({ open, onClose, priceData }) => {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncResults, setSyncResults] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleSync = async () => {
    setSyncStatus('loading');
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const response = await axios.post('/api/techno/prices-sync', priceData);

      clearInterval(progressInterval);
      setProgress(100);

      setSyncResults({
        success: true,
        method: response.data.method || 'bulk',
        total: priceData.length,
        successful: response.data.successful || priceData.length,
        failed: response.data.failed || 0,
        results: response.data.results || []
      });

      setSyncStatus('success');

    } catch (error) {
      clearInterval(progressInterval);
      setSyncStatus('error');
      setSyncResults({
        success: false,
        error: error.response?.data?.message || error.message
      });
    }
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SyncIcon />
          <Typography variant="h6">Price Sync to Magento</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Progress tracking */}
        {syncStatus === 'loading' && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mb: 2 }}
          />
        )}

        {/* Results display */}
        {syncResults && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Method</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {syncResults.results?.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.sku}</TableCell>
                    <TableCell>{result.price}</TableCell>
                    <TableCell>
                      <Chip
                        label={result.status}
                        color={result.status === 'success' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{result.method}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={handleSync}
          variant="contained"
          disabled={syncStatus === 'loading'}
        >
          {syncStatus === 'loading' ? 'Syncing...' : 'Start Sync'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

*Continue reading the next sections for Product Management Tools, Grid System, and API Reference...*
