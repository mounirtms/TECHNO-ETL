import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const DashboardSystem = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const dashboardFeatures = [
    {
      title: 'Real-time Analytics',
      description: 'Live data visualization with automatic updates',
      icon: <AnalyticsIcon />,
      color: '#1976d2',
    },
    {
      title: 'Performance Metrics',
      description: 'KPI tracking and monitoring dashboards',
      icon: <SpeedIcon />,
      color: '#388e3c',
    },
    {
      title: 'Interactive Charts',
      description: 'Dynamic data representation with drill-down',
      icon: <TrendingIcon />,
      color: '#f57c00',
    },
    {
      title: 'Customizable Widgets',
      description: 'User-configurable dashboard components',
      icon: <DashboardIcon />,
      color: '#7b1fa2',
    },
  ];

  const components = [
    'StatCards - KPI display cards with trends',
    'ChartComponents - Interactive data visualization',
    'RecentActivityFeed - Activity tracking and notifications',
    'PerformanceMetrics - System performance monitoring',
    'CustomizableWidgets - User-configurable components',
    'RealTimeUpdates - WebSocket-based live data',
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              📊 Dashboard System
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Real-time analytics and monitoring dashboard for TECHNO-ETL
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Real-time" color="primary" />
              <Chip label="Interactive" color="success" />
              <Chip label="Customizable" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* Overview */}
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>🎯 Dashboard Overview</Typography>
            The TECHNO-ETL Dashboard System provides comprehensive real-time analytics, performance monitoring,
            and interactive data visualization. Built with React and Material-UI, it offers customizable widgets,
            live data updates, and professional KPI tracking for enterprise operations.
          </Alert>
        </motion.div>

        {/* Key Features */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🌟 Key Features
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {dashboardFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: `${feature.color}20`,
                          color: feature.color,
                          mr: 2,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Components */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🧩 Dashboard Components
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary.main">
                Core Components:
              </Typography>
              <List>
                {components.map((component, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={component} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technical Implementation */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🔧 Technical Implementation
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Frontend Technologies
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="React.js with hooks for state management" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Material-UI for consistent styling" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Chart.js/Recharts for data visualization" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="WebSocket for real-time updates" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary.main">
                    Performance Features
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Lazy loading for dashboard widgets" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Memoized chart components" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Efficient data caching" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Responsive design optimization" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Dashboard Architecture */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🏗️ Dashboard Architecture
          </Typography>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Component Structure</Typography>
            The dashboard follows a modular architecture with reusable widgets, centralized state management,
            and efficient data flow patterns for optimal performance and maintainability.
          </Alert>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary.main">
                Dashboard Component Hierarchy
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto' }}>
                <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {`Dashboard.jsx
├── StatCards/
│   ├── KPICard.jsx
│   ├── TrendCard.jsx
│   └── MetricCard.jsx
├── Charts/
│   ├── LineChart.jsx
│   ├── BarChart.jsx
│   ├── PieChart.jsx
│   └── AreaChart.jsx
├── RecentActivityFeed/
│   ├── ActivityItem.jsx
│   ├── ActivityFilter.jsx
│   └── ActivityPagination.jsx
├── PerformanceMetrics/
│   ├── SystemHealth.jsx
│   ├── APIMetrics.jsx
│   └── SyncStatus.jsx
└── CustomWidgets/
    ├── WidgetContainer.jsx
    ├── WidgetConfig.jsx
    └── WidgetLibrary.jsx`}
                </pre>
              </Paper>
            </CardContent>
          </Card>
        </motion.div>

        {/* Real-time Features */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            ⚡ Real-time Features
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Live Data Updates
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="WebSocket connections for instant updates" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Automatic reconnection handling" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Optimistic UI updates" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    Performance Monitoring
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="System resource tracking" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="API response time monitoring" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Error rate tracking" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="info.main">
                    User Customization
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Drag-and-drop widget arrangement" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Personalized dashboard layouts" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Custom widget configurations" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Implementation Examples */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            💻 Implementation Examples
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Dashboard Component Implementation:
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto', mb: 3 }}>
            <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
              {`// Dashboard.jsx - Main dashboard component
import React, { useState, useEffect } from 'react';
import { Grid, Box, Container } from '@mui/material';
import StatCards from './components/StatCards';
import ChartComponents from './components/ChartComponents';
import RecentActivityFeed from './components/RecentActivityFeed';
import PerformanceMetrics from './components/PerformanceMetrics';
import { useWebSocket } from '../hooks/useWebSocket';
import { useDashboardData } from '../hooks/useDashboardData';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const { data, loading, error, refresh } = useDashboardData();

  // WebSocket for real-time updates
  const { lastMessage, connectionStatus } = useWebSocket('/ws/dashboard');

  useEffect(() => {
    if (lastMessage) {
      const update = JSON.parse(lastMessage.data);
      setDashboardData(prev => ({
        ...prev,
        [update.type]: update.data
      }));
    }
  }, [lastMessage]);

  const statsCards = [
    {
      title: 'Total Products',
      value: dashboardData.totalProducts || 0,
      trend: dashboardData.productsTrend || 0,
      color: 'primary',
      icon: 'Inventory'
    },
    {
      title: 'Active Syncs',
      value: dashboardData.activeSyncs || 0,
      trend: dashboardData.syncsTrend || 0,
      color: 'success',
      icon: 'Sync'
    },
    {
      title: 'API Calls Today',
      value: dashboardData.apiCalls || 0,
      trend: dashboardData.apiTrend || 0,
      color: 'info',
      icon: 'Api'
    },
    {
      title: 'System Health',
      value: dashboardData.systemHealth || '100%',
      trend: 0,
      color: 'warning',
      icon: 'Health'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12}>
          <StatCards cards={statsCards} loading={loading} />
        </Grid>

        {/* Charts Row */}
        <Grid item xs={12} md={8}>
          <ChartComponents
            data={dashboardData.chartData}
            loading={loading}
          />
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={4}>
          <PerformanceMetrics
            metrics={dashboardData.performance}
            connectionStatus={connectionStatus}
          />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <RecentActivityFeed
            activities={dashboardData.recentActivity}
            onRefresh={refresh}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;`}
            </pre>
          </Paper>

          <Typography variant="h6" gutterBottom>
            Real-time WebSocket Hook:
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto' }}>
            <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
              {`// useWebSocket.js - Real-time data hook
import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting');
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(\`ws://localhost:3001\${url}\`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('Connected');
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('Disconnected');

        // Automatic reconnection
        reconnectTimeoutRef.current = setTimeout(() => {
          setConnectionStatus('Reconnecting');
          connectWebSocket();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error');
      };
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url]);

  return { lastMessage, connectionStatus };
};`}
            </pre>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default DashboardSystem;
