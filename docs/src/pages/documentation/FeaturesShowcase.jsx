import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  LinearProgress,
  Avatar,
  Badge,
  Divider,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudUpload as CloudIcon,
  Analytics as AnalyticsIcon,
  IntegrationInstructions as IntegrationIcon,
  Storage as StorageIcon,
  Dashboard as DashboardIcon,
  Api as ApiIcon,
  Sync as SyncIcon,
  GridOn as GridIcon,
  ShoppingCart as ProductIcon,
  Settings as SettingsIcon,
  BugReport as TroubleshootIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingIcon,
  Group as TeamIcon,
  Language as LanguageIcon,
  Palette as ThemeIcon,
} from '@mui/icons-material';

const FeaturesShowcase = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const coreFeatures = [
    {
      category: 'Data Management',
      icon: <StorageIcon />,
      color: '#1976d2',
      features: [
        {
          name: 'Real-time Bidirectional Sync',
          description: 'Seamless data synchronization between MDM and Magento systems',
          metrics: ['99.9% accuracy', '< 1 second latency', '10,000+ records/min'],
          status: 'production',
        },
        {
          name: 'Multi-source Inventory Management',
          description: 'Unified inventory tracking across warehouses, POS, and RFID systems',
          metrics: ['Multiple sources', 'Real-time updates', 'Conflict resolution'],
          status: 'production',
        },
        {
          name: 'Advanced Data Validation',
          description: 'Comprehensive data quality assurance with business rule validation',
          metrics: ['Custom rules', 'Auto-correction', 'Quality scoring'],
          status: 'production',
        },
      ],
    },
    {
      category: 'User Experience',
      icon: <DashboardIcon />,
      color: '#388e3c',
      features: [
        {
          name: 'Professional Grid System',
          description: 'Advanced data grids with filtering, sorting, and virtualization',
          metrics: ['100K+ rows', 'Virtual scrolling', 'Export/Import'],
          status: 'production',
        },
        {
          name: 'Real-time Dashboards',
          description: 'Interactive dashboards with live KPI tracking and analytics',
          metrics: ['Live updates', 'Custom widgets', 'Drill-down'],
          status: 'production',
        },
        {
          name: 'Multi-language Support',
          description: 'Full internationalization with RTL support',
          metrics: ['English', 'French', 'Arabic', 'RTL support'],
          status: 'production',
        },
      ],
    },
    {
      category: 'Enterprise Features',
      icon: <SecurityIcon />,
      color: '#f57c00',
      features: [
        {
          name: 'Role-based Access Control',
          description: 'Granular permissions with Firebase authentication',
          metrics: ['Multiple roles', 'Fine-grained', 'Audit trails'],
          status: 'production',
        },
        {
          name: 'High Performance Architecture',
          description: 'Optimized for 1000+ concurrent users and enterprise scale',
          metrics: ['1000+ users', '< 2s load time', 'Auto-scaling'],
          status: 'production',
        },
        {
          name: 'Comprehensive Monitoring',
          description: 'Full system monitoring with alerting and health checks',
          metrics: ['Health checks', 'Performance metrics', 'Error tracking'],
          status: 'production',
        },
      ],
    },
  ];

  const technicalHighlights = [
    {
      title: 'Modern React Architecture',
      description: 'Built with React 18+ hooks, Material-UI, and modern development practices',
      icon: <ApiIcon />,
      color: '#2196f3',
      details: [
        'React 18+ with concurrent features',
        'Material-UI component library',
        'Vite for fast development builds',
        'React Router for client-side routing',
        'Framer Motion for smooth animations',
      ],
    },
    {
      title: 'Robust Backend Services',
      description: 'Enterprise-grade Node.js backend with comprehensive API design',
      icon: <StorageIcon />,
      color: '#4caf50',
      details: [
        'Node.js 18+ with Express framework',
        'RESTful API with OpenAPI documentation',
        'JWT authentication with refresh tokens',
        'Comprehensive input validation',
        'Structured logging with Winston',
      ],
    },
    {
      title: 'Scalable Data Layer',
      description: 'Multi-database architecture optimized for different data types',
      icon: <CloudIcon />,
      color: '#ff9800',
      details: [
        'SQL Server for transactional data',
        'Firebase for real-time features',
        'Redis for caching and sessions',
        'Optimized database indexes',
        'Connection pooling and management',
      ],
    },
    {
      title: 'Production-Ready Deployment',
      description: 'Cloud-native architecture with monitoring and scaling capabilities',
      icon: <SettingsIcon />,
      color: '#9c27b0',
      details: [
        'Docker containerization',
        'Load balancing with Nginx',
        'PM2 process management',
        'Health monitoring and alerting',
        'Automated backup strategies',
      ],
    },
  ];

  const performanceMetrics = [
    { label: 'Page Load Time', value: '< 2 seconds', progress: 95, color: 'primary' },
    { label: 'API Response Time', value: '< 500ms', progress: 90, color: 'success' },
    { label: 'Data Sync Accuracy', value: '99.9%', progress: 99, color: 'info' },
    { label: 'System Uptime', value: '99.95%', progress: 99, color: 'warning' },
    { label: 'Concurrent Users', value: '1000+', progress: 85, color: 'secondary' },
    { label: 'ETL Throughput', value: '10K+ records/min', progress: 92, color: 'error' },
  ];

  const integrationCapabilities = [
    {
      system: 'Magento 2.4+',
      description: 'Complete e-commerce platform integration',
      features: ['Product sync', 'Inventory management', 'Order processing', 'Customer data'],
      status: 'active',
      icon: <ShoppingCart />,
    },
    {
      system: 'RFID Systems',
      description: 'Real-time inventory tracking integration',
      features: ['Real-time tracking', 'Location mapping', 'Movement history', 'Alerts'],
      status: 'active',
      icon: <SyncIcon />,
    },
    {
      system: 'POS Systems',
      description: 'Point of sale system integration',
      features: ['Sales data', 'Transaction sync', 'Inventory updates', 'Reporting'],
      status: 'active',
      icon: <TrendingIcon />,
    },
    {
      system: 'Warehouse Management',
      description: 'Multi-location warehouse integration',
      features: ['Stock levels', 'Transfers', 'Picking lists', 'Cycle counts'],
      status: 'active',
      icon: <StorageIcon />,
    },
  ];

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`features-tabpanel-${index}`}
      aria-labelledby={`features-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
    case 'production': return 'success';
    case 'beta': return 'warning';
    case 'development': return 'info';
    default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              ✨ Features Showcase
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Comprehensive overview of TECHNO-ETL's powerful features and capabilities
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Production Ready" color="success" />
              <Chip label="Enterprise Scale" color="primary" />
              <Chip label="Modern Architecture" color="info" />
              <Chip label="High Performance" color="warning" />
            </Box>
          </Box>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div variants={itemVariants}>
          <Alert severity="success" sx={{ mb: 6, fontSize: '1.1rem' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🚀 Feature Highlights
            </Typography>
            <Typography variant="body1">
              TECHNO-ETL delivers enterprise-grade data management with real-time synchronization,
              advanced analytics, and professional user interfaces. Built for scalability and performance
              with modern technologies and best practices.
            </Typography>
          </Alert>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📊 Performance Metrics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {performanceMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h5" fontWeight={700} color={`${metric.color}.main`} gutterBottom>
                    {metric.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {metric.label}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={metric.progress}
                    color={metric.color}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {metric.progress}% Performance Score
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Feature Categories */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🌟 Core Features by Category
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {coreFeatures.map((category, categoryIndex) => (
              <Grid item xs={12} key={categoryIndex}>
                <Card sx={{ borderLeft: `4px solid ${category.color}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: `${category.color}20`, color: category.color, mr: 2 }}>
                        {category.icon}
                      </Avatar>
                      <Typography variant="h5" fontWeight={600} sx={{ color: category.color }}>
                        {category.category}
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {category.features.map((feature, featureIndex) => (
                        <Grid item xs={12} md={4} key={featureIndex}>
                          <Paper sx={{ p: 2, height: '100%', backgroundColor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
                                {feature.name}
                              </Typography>
                              <Chip
                                label={feature.status}
                                color={getStatusColor(feature.status)}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {feature.description}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {feature.metrics.map((metric, idx) => (
                                <Chip
                                  key={idx}
                                  label={metric}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              ))}
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Detailed Feature Tabs */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🔍 Detailed Feature Information
          </Typography>
          <Paper sx={{ mb: 6 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Technical Highlights" icon={<ApiIcon />} />
              <Tab label="Integration Capabilities" icon={<IntegrationIcon />} />
              <Tab label="User Experience" icon={<DashboardIcon />} />
              <Tab label="Enterprise Features" icon={<SecurityIcon />} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>Technical Architecture Highlights</Typography>
              <Grid container spacing={3}>
                {technicalHighlights.map((highlight, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card sx={{ height: '100%', borderTop: `4px solid ${highlight.color}` }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: `${highlight.color}20`, color: highlight.color, mr: 2 }}>
                            {highlight.icon}
                          </Avatar>
                          <Typography variant="h6" fontWeight={600} sx={{ color: highlight.color }}>
                            {highlight.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {highlight.description}
                        </Typography>
                        <List dense>
                          {highlight.details.map((detail, idx) => (
                            <ListItem key={idx} sx={{ py: 0.25 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={detail} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>External System Integrations</Typography>
              <Grid container spacing={3}>
                {integrationCapabilities.map((integration, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', mr: 2 }}>
                            {integration.icon}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight={600}>
                              {integration.system}
                            </Typography>
                            <Badge
                              badgeContent={integration.status}
                              color="success"
                              sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none' } }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {integration.description}
                        </Typography>
                        <List dense>
                          {integration.features.map((feature, idx) => (
                            <ListItem key={idx} sx={{ py: 0.25 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={feature} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>User Experience Features</Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600}>Modern User Interface:</Typography>
                Built with Material-UI components and modern design principles for exceptional user experience.
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary.main">
                        <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Interface Design
                      </Typography>
                      <List dense>
                        {['Material-UI components', 'Responsive design', 'Dark/light themes', 'Accessibility support'].map((feature, idx) => (
                          <ListItem key={idx} sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="secondary.main">
                        <LanguageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Internationalization
                      </Typography>
                      <List dense>
                        {['Multi-language support', 'RTL text support', 'Locale formatting', 'Cultural adaptations'].map((feature, idx) => (
                          <ListItem key={idx} sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="warning.main">
                        <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Performance
                      </Typography>
                      <List dense>
                        {['Fast loading times', 'Smooth animations', 'Optimized rendering', 'Efficient caching'].map((feature, idx) => (
                          <ListItem key={idx} sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Enterprise-Grade Features</Typography>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600}>Enterprise Ready:</Typography>
                Built for enterprise environments with security, scalability, and reliability in mind.
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="error.main">
                        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Security & Compliance
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="JWT token authentication" secondary="Secure API access with refresh tokens" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Role-based access control" secondary="Granular permissions management" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Audit trail logging" secondary="Complete activity tracking" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Data encryption" secondary="At rest and in transit" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="info.main">
                        <CloudIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Scalability & Reliability
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Horizontal scaling" secondary="Support for multiple instances" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Load balancing" secondary="Distribute traffic efficiently" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Health monitoring" secondary="Automated health checks" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Backup strategies" secondary="Automated data protection" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={itemVariants}>
          <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', textAlign: 'center' }}>
            <CardContent sx={{ py: 4 }}>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                🚀 Ready to Experience TECHNO-ETL?
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Explore our comprehensive documentation and get started with the most advanced
                data management platform for enterprise e-commerce operations.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                sx={{ mr: 2 }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText' }}
                size="large"
              >
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default FeaturesShowcase;
