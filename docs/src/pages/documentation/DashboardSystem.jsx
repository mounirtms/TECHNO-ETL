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
  ListItemText
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

const DashboardSystem = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const dashboardFeatures = [
    {
      title: 'Real-time Analytics',
      description: 'Live data visualization with automatic updates',
      icon: <AnalyticsIcon />,
      color: '#1976d2'
    },
    {
      title: 'Performance Metrics',
      description: 'KPI tracking and monitoring dashboards',
      icon: <SpeedIcon />,
      color: '#388e3c'
    },
    {
      title: 'Interactive Charts',
      description: 'Dynamic data representation with drill-down',
      icon: <TrendingIcon />,
      color: '#f57c00'
    },
    {
      title: 'Customizable Widgets',
      description: 'User-configurable dashboard components',
      icon: <DashboardIcon />,
      color: '#7b1fa2'
    }
  ];

  const components = [
    'StatCards - KPI display cards with trends',
    'ChartComponents - Interactive data visualization',
    'RecentActivityFeed - Activity tracking and notifications',
    'PerformanceMetrics - System performance monitoring',
    'CustomizableWidgets - User-configurable components',
    'RealTimeUpdates - WebSocket-based live data'
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
                      boxShadow: 4
                    }
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
                          mr: 2
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
          <Grid container spacing={3}>
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
      </motion.div>
    </Container>
  );
};

export default DashboardSystem;
