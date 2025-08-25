/**
 * Optimized Dashboard Widgets for TECHNO-ETL
 * High-performance, configurable widgets with real-time updates
 */
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Chip,
  Avatar,
  LinearProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Paper
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  ShoppingCart,
  People,
  Inventory,
  AttachMoney,
  Speed,
  Warning,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

/**
 * Widget Configuration Types
 */
const WIDGET_TYPES = {
  METRIC: 'metric',
  CHART: 'chart',
  LIST: 'list',
  PROGRESS: 'progress',
  STATUS: 'status'
};

/**
 * Default Widget Configurations
 */
const DEFAULT_WIDGETS = {
  sales: {
    id: 'sales',
    title: 'Sales Overview',
    type: WIDGET_TYPES.METRIC,
    icon: AttachMoney,
    color: 'success',
    refreshInterval: 30000,
    size: { xs: 12, sm: 6, md: 3 },
    visible: true,
    order: 1
  },
  orders: {
    id: 'orders',
    title: 'Orders',
    type: WIDGET_TYPES.METRIC,
    icon: ShoppingCart,
    color: 'primary',
    refreshInterval: 15000,
    size: { xs: 12, sm: 6, md: 3 },
    visible: true,
    order: 2
  },
  customers: {
    id: 'customers',
    title: 'Customers',
    type: WIDGET_TYPES.METRIC,
    icon: People,
    color: 'info',
    refreshInterval: 60000,
    size: { xs: 12, sm: 6, md: 3 },
    visible: true,
    order: 3
  },
  inventory: {
    id: 'inventory',
    title: 'Inventory Status',
    type: WIDGET_TYPES.PROGRESS,
    icon: Inventory,
    color: 'warning',
    refreshInterval: 45000,
    size: { xs: 12, sm: 6, md: 3 },
    visible: true,
    order: 4
  },
  salesChart: {
    id: 'salesChart',
    title: 'Sales Trend',
    type: WIDGET_TYPES.CHART,
    chartType: 'line',
    refreshInterval: 60000,
    size: { xs: 12, md: 8 },
    visible: true,
    order: 5
  },
  recentOrders: {
    id: 'recentOrders',
    title: 'Recent Orders',
    type: WIDGET_TYPES.LIST,
    refreshInterval: 30000,
    size: { xs: 12, md: 4 },
    visible: true,
    order: 6
  }
};

/**
 * Widget Loading Skeleton
 */
const WidgetSkeleton = memo(({ height = 200 }) => (
  <Card>
    <CardHeader
      title={<Skeleton width="60%" />}
      action={<Skeleton variant="circular" width={24} height={24} />}
    />
    <CardContent>
      <Skeleton variant="rectangular" height={height} />
    </CardContent>
  </Card>
));

/**
 * Metric Widget Component
 */
const MetricWidget = memo(({ 
  widget, 
  data, 
  loading, 
  onRefresh, 
  onToggleVisibility,
  onSettings 
}) => {
  const { t } = useTranslation();
  const [menuAnchor, setMenuAnchor] = useState(null);
  
  const IconComponent = widget.icon;
  const trend = data?.trend || 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : TrendingFlat;
  const trendColor = trend > 0 ? 'success' : trend < 0 ? 'error' : 'default';

  if (loading) return <WidgetSkeleton height={120} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardHeader
          avatar: any,
            <Avatar sx={{ bgcolor: `${widget.color}.main` }}>
              <IconComponent />
            </Avatar>
          }
          title: any,
              {t(widget.title)}
            </Typography>
          }
          action: any,
            <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => (e: React.MouseEvent<HTMLButtonElement>) => (e) => setMenuAnchor(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h4" component="div" fontWeight="bold">
                {data?.value || '0'}
              </Typography>
              <Chip
                icon={<TrendIcon />}
                label={`${Math.abs(trend)}%`}
                color={trendColor}
                size: any,
              {data?.description || 'No data available'}
            </Typography>
          </Stack>
        </CardContent>
        
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => { onRefresh(widget.id); setMenuAnchor(null); }}>
            <ListItemIcon><RefreshIcon /></ListItemIcon>
            <ListItemText>Refresh</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onToggleVisibility(widget.id); setMenuAnchor(null); }}>
            <ListItemIcon>
              {widget.visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </ListItemIcon>
            <ListItemText>{widget.visible ? 'Hide' : 'Show'}</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onSettings(widget.id); setMenuAnchor(null); }}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    </motion.div>
  );
});

/**
 * Chart Widget Component
 */
const ChartWidget = memo(({ 
  widget, 
  data, 
  loading, 
  onRefresh, 
  onToggleVisibility,
  onSettings 
}) => {
  const { t } = useTranslation();
  const [menuAnchor, setMenuAnchor] = useState(null);

  if (loading) return <WidgetSkeleton height={300} />;

  const chartData = data?.chartData || [];

  return Boolean(Boolean((
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title={t(widget.title)}
          action: any,
            <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => (e: React.MouseEvent<HTMLButtonElement>) => (e) => setMenuAnchor(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
          }
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {widget.chartType === 'line' && (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line 
                  type: any,
                  strokeWidth={2}
                  dot={{ fill: '#1976d2' }}
                />
              </LineChart>
            )}
            {widget.chartType === 'area' && (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Area 
                  type: any,
                  fillOpacity={0.3}
                />
              </AreaChart>
            )}
            {widget.chartType === 'bar' && (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#1976d2" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
        
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => { onRefresh(widget.id))); setMenuAnchor(null); }}>
            <ListItemIcon><RefreshIcon /></ListItemIcon>
            <ListItemText>Refresh</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onToggleVisibility(widget.id); setMenuAnchor(null); }}>
            <ListItemIcon>
              {widget.visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </ListItemIcon>
            <ListItemText>{widget.visible ? 'Hide' : 'Show'}</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onSettings(widget.id); setMenuAnchor(null); }}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    </motion.div>
  );
});

/**
 * Progress Widget Component
 */
const ProgressWidget = memo(({ 
  widget, 
  data, 
  loading, 
  onRefresh, 
  onToggleVisibility,
  onSettings 
}) => {
  const { t } = useTranslation();
  const [menuAnchor, setMenuAnchor] = useState(null);
  
  const IconComponent = widget.icon;
  const progress = data?.progress || 0;
  const status = data?.status || 'normal';
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'good': return 'success';
      default: return 'primary';
    }
  };

  if (loading) return <WidgetSkeleton height={150} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardHeader
          avatar: any,
            <Avatar sx={{ bgcolor: `${widget.color}.main` }}>
              <IconComponent />
            </Avatar>
          }
          title={t(widget.title)}
          action: any,
            <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => (e: React.MouseEvent<HTMLButtonElement>) => (e) => setMenuAnchor(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {data?.label || 'Progress'}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant: any,
              value={progress}
              color={getStatusColor(status)}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary">
              {data?.description || 'No description available'}
            </Typography>
          </Stack>
        </CardContent>
        
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => { onRefresh(widget.id); setMenuAnchor(null); }}>
            <ListItemIcon><RefreshIcon /></ListItemIcon>
            <ListItemText>Refresh</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onToggleVisibility(widget.id); setMenuAnchor(null); }}>
            <ListItemIcon>
              {widget.visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </ListItemIcon>
            <ListItemText>{widget.visible ? 'Hide' : 'Show'}</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onSettings(widget.id); setMenuAnchor(null); }}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    </motion.div>
  );
});

/**
 * Widget Factory - renders appropriate widget based on type
 */
const WidgetFactory = memo((props) => {
  const { widget } = props;
  
  switch(widget.type) {
    case WIDGET_TYPES.METRIC:
      return <MetricWidget { ...props} />;
    case WIDGET_TYPES.CHART:
      return <ChartWidget { ...props} />;
    case WIDGET_TYPES.PROGRESS:
      return <ProgressWidget { ...props} />;
    default:
      return <MetricWidget { ...props} />;
  }
});

/**
 * Main Optimized Dashboard Widgets Component
 */
const OptimizedDashboardWidgets = ({ 
  customWidgets = {},
  enableRealTime: any,
  enableCustomization: any,
}) => {
  const { t } = useTranslation();
  
  // State management
  const [widgets, setWidgets] = useState(() => ({ ...DEFAULT_WIDGETS, ...customWidgets }));
  const [widgetData, setWidgetData] = useState({});
  const [loading, setLoading] = useState({});
  const [refreshIntervals, setRefreshIntervals] = useState({});

  // Memoized visible widgets sorted by order
  const visibleWidgets = useMemo(() => {
    return Object.values(widgets)
      .filter((widget: any: any) => widget.visible)
      .sort((a, b) => a.order - b.order);
  }, [widgets]);

  // Mock data fetcher (replace with real API calls)
  const fetchWidgetData = useCallback(async (widgetId) => {
    setLoading(prev => ({ ...prev, [widgetId]: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data based on widget type
    const mockData = {
      sales: {
        value: '€125,430',
        trend: 12.5,
        description: 'vs last month'
      },
      orders: {
        value: '1,247',
        trend: -3.2,
        description: 'pending orders'
      },
      customers: {
        value: '8,932',
        trend: 8.1,
        description: 'active customers'
      },
      inventory: {
        progress: 78,
        status: 'warning',
        label: 'Stock Level',
        description: '22% items low stock'
      },
      salesChart: {
        chartData: [
          { name: 'Jan', value: 4000 },
          { name: 'Feb', value: 3000 },
          { name: 'Mar', value: 5000 },
          { name: 'Apr', value: 4500 },
          { name: 'May', value: 6000 },
          { name: 'Jun', value: 5500 }
        ]
      }
    };
    
    setWidgetData(prev => ({ ...prev, [widgetId]: mockData[widgetId] }));
    setLoading(prev => ({ ...prev, [widgetId]: false }));
  }, []);

  // Handle widget refresh
  const handleRefresh = useCallback((widgetId) => {
    fetchWidgetData(widgetId);
  }, [fetchWidgetData]);

  // Handle widget visibility toggle
  const handleToggleVisibility = useCallback((widgetId) => {
    setWidgets(prev => ({ ...prev,
      [widgetId]: { ...prev[widgetId],
        visible: !prev[widgetId].visible
      }
    }));
  }, []);

  // Handle widget settings
  const handleSettings = useCallback((widgetId) => {
    console.log('Settings for widget:', widgetId);
    // Implement settings dialog
  }, []);

  // Setup refresh intervals
  useEffect(() => {
    if (!enableRealTime) return;

    const intervals = {};
    
    visibleWidgets.forEach((widget) => {
      if(widget.refreshInterval) {
        intervals[widget.id] = setInterval(() => {
          fetchWidgetData(widget.id);
        }, widget.refreshInterval);
      }
    });

    setRefreshIntervals(intervals);

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [visibleWidgets, enableRealTime, fetchWidgetData]);

  // Initial data fetch
  useEffect(() => {
    visibleWidgets.forEach((widget) => {
      fetchWidgetData(widget.id);
    });
  }, [visibleWidgets, fetchWidgetData]);

  return(<Box sx={{ flexGrow: 1 }}>
      <Grid { ...{container: true}} spacing={3}>
        <AnimatePresence>
          {visibleWidgets.map((widget: any: any) => (
            <Grid item 
              key={widget.id}
              xs={widget.size.xs}
              sm={widget.size.sm}
              md={widget.size.md}
              lg={widget.size.lg}
            >
              <WidgetFactory
                widget={widget}
                data={widgetData[widget.id]}
                loading={loading[widget.id]}
                onRefresh={handleRefresh}
                onToggleVisibility={handleToggleVisibility}
                onSettings={handleSettings}
              />
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>
    </Box>
  );
};

export default OptimizedDashboardWidgets;
