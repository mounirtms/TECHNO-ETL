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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Architecture as ArchitectureIcon,
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
} from '@mui/icons-material';

const SystemOverview = () => {
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

  const systemFeatures = [
    {
      title: 'Real-time Data Synchronization',
      description: 'Bidirectional sync between MDM and Magento systems with 99.9% accuracy',
      icon: <IntegrationIcon />,
      color: '#1976d2',
      metrics: ['10,000+ records/min', '< 1 second latency', '99.9% accuracy'],
    },
    {
      title: 'Advanced Grid Management',
      description: 'Professional data grids with filtering, sorting, and export capabilities',
      icon: <GridIcon />,
      color: '#388e3c',
      metrics: ['Virtual scrolling', '100K+ rows', 'Real-time updates'],
    },
    {
      title: 'Comprehensive Analytics',
      description: 'Real-time dashboards with KPI tracking and performance monitoring',
      icon: <AnalyticsIcon />,
      color: '#f57c00',
      metrics: ['Live dashboards', 'Custom widgets', 'Performance metrics'],
    },
    {
      title: 'Enterprise Security',
      description: 'Role-based access control with Firebase authentication and audit trails',
      icon: <SecurityIcon />,
      color: '#d32f2f',
      metrics: ['JWT tokens', 'RBAC', 'Audit logging'],
    },
    {
      title: 'High Performance',
      description: 'Optimized for 1000+ concurrent users and enterprise-scale operations',
      icon: <SpeedIcon />,
      color: '#7b1fa2',
      metrics: ['< 2s load time', '1000+ users', '< 500ms API'],
    },
    {
      title: 'Cloud Ready',
      description: 'Production-ready deployment with scalable architecture and monitoring',
      icon: <CloudIcon />,
      color: '#0288d1',
      metrics: ['Auto-scaling', 'Load balancing', 'Health monitoring'],
    },
  ];

  const architectureComponents = [
    {
      layer: 'Frontend Layer',
      description: 'Modern React.js application with Material-UI components',
      technologies: ['React.js 18+', 'Material-UI', 'Vite', 'React Router', 'Framer Motion'],
      color: '#1976d2',
    },
    {
      layer: 'Backend Layer',
      description: 'RESTful API server with comprehensive business logic',
      technologies: ['Node.js 18+', 'Express.js', 'JWT Auth', 'Joi Validation', 'Winston Logging'],
      color: '#388e3c',
    },
    {
      layer: 'Data Layer',
      description: 'Multi-database architecture for different data types',
      technologies: ['SQL Server', 'Firebase', 'Redis Cache', 'File Storage'],
      color: '#f57c00',
    },
    {
      layer: 'Integration Layer',
      description: 'External system integrations and API connections',
      technologies: ['Magento 2.4+', 'RFID Systems', 'POS Systems', 'Warehouse Management'],
      color: '#7b1fa2',
    },
  ];

  const performanceMetrics = [
    { label: 'System Load Time', value: '< 2 seconds', progress: 95, color: 'primary' },
    { label: 'API Response Time', value: '< 500ms', progress: 90, color: 'success' },
    { label: 'Data Sync Accuracy', value: '99.9%', progress: 99, color: 'info' },
    { label: 'System Uptime', value: '99.95%', progress: 99, color: 'warning' },
    { label: 'Concurrent Users', value: '1000+', progress: 85, color: 'secondary' },
    { label: 'ETL Throughput', value: '10K+ records/min', progress: 92, color: 'error' },
  ];

  const businessValue = [
    {
      category: 'Operational Efficiency',
      benefits: [
        '50% reduction in manual data entry',
        '75% faster inventory updates',
        '90% improvement in data accuracy',
        'Real-time visibility across all systems',
      ],
      icon: <SpeedIcon />,
      color: '#4caf50',
    },
    {
      category: 'Cost Savings',
      benefits: [
        'Reduced operational costs through automation',
        'Minimized data errors and associated costs',
        'Improved resource utilization',
        'Faster time-to-market for new products',
      ],
      icon: <AnalyticsIcon />,
      color: '#2196f3',
    },
    {
      category: 'Scalability & Growth',
      benefits: [
        'Support for 1000+ concurrent users',
        'Horizontal scaling capabilities',
        'Multi-tenant architecture ready',
        'Cloud-native deployment options',
      ],
      icon: <CloudIcon />,
      color: '#ff9800',
    },
  ];

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`overview-tabpanel-${index}`}
      aria-labelledby={`overview-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🚀 TECHNO-ETL System Overview
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Enterprise-grade data management platform bridging MDM and Magento systems
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Version 2.1.0" color="primary" />
              <Chip label="Production Ready" color="success" />
              <Chip label="Enterprise Scale" color="info" />
              <Chip label="August 2025" color="secondary" />
            </Box>
          </Box>
        </motion.div>

        {/* Mission Statement */}
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ mb: 6, fontSize: '1.1rem' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🎯 Core Mission
            </Typography>
            <Typography variant="body1">
              "Streamline data operations between multiple systems while maintaining data integrity,
              providing real-time analytics, and ensuring scalable performance for enterprise e-commerce operations."
            </Typography>
          </Alert>
        </motion.div>

        {/* System Features */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🌟 Core System Features
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {systemFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    borderLeft: `4px solid ${feature.color}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
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
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {feature.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {feature.metrics.map((metric, idx) => (
                        <Chip
                          key={idx}
                          label={metric}
                          size="small"
                          variant="outlined"
                          sx={{ color: feature.color, borderColor: feature.color }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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

        {/* Detailed Information Tabs */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🔍 Detailed System Information
          </Typography>
          <Paper sx={{ mb: 6 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Architecture" icon={<ArchitectureIcon />} />
              <Tab label="Business Value" icon={<AnalyticsIcon />} />
              <Tab label="Technology Stack" icon={<SettingsIcon />} />
              <Tab label="Integration Points" icon={<IntegrationIcon />} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>System Architecture Layers</Typography>
              <Grid container spacing={3}>
                {architectureComponents.map((component, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card sx={{ height: '100%', borderTop: `4px solid ${component.color}` }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: component.color, fontWeight: 600 }}>
                          {component.layer}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {component.description}
                        </Typography>
                        <List dense>
                          {component.technologies.map((tech, idx) => (
                            <ListItem key={idx} sx={{ py: 0.25 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={tech} />
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
              <Typography variant="h6" gutterBottom>Business Value Proposition</Typography>
              <Grid container spacing={3}>
                {businessValue.map((value, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              backgroundColor: `${value.color}20`,
                              color: value.color,
                              mr: 2,
                            }}
                          >
                            {value.icon}
                          </Box>
                          <Typography variant="h6" fontWeight={600} sx={{ color: value.color }}>
                            {value.category}
                          </Typography>
                        </Box>
                        <List dense>
                          {value.benefits.map((benefit, idx) => (
                            <ListItem key={idx} sx={{ py: 0.25 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={benefit} />
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
              <Typography variant="h6" gutterBottom>Technology Stack Overview</Typography>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600}>Modern Technology Stack:</Typography>
                Built with cutting-edge technologies for performance, scalability, and maintainability.
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary.main">
                        Frontend Technologies
                      </Typography>
                      <List dense>
                        {['React.js 18+', 'Material-UI (MUI)', 'Vite Build Tool', 'React Router', 'Framer Motion', 'React Query'].map((tech, idx) => (
                          <ListItem key={idx} sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={tech} />
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
                        Backend Technologies
                      </Typography>
                      <List dense>
                        {['Node.js 18+', 'Express.js', 'SQL Server', 'Redis Cache', 'Firebase Auth', 'Winston Logging'].map((tech, idx) => (
                          <ListItem key={idx} sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={tech} />
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
                        DevOps & Tools
                      </Typography>
                      <List dense>
                        {['Docker', 'Nginx', 'PM2', 'ESLint', 'Prettier', 'Jest Testing'].map((tool, idx) => (
                          <ListItem key={idx} sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={tool} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>External System Integrations</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary.main">
                        E-commerce Integration
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                          <ListItemText primary="Magento 2.4+ REST API" secondary="Product, inventory, and order sync" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                          <ListItemText primary="Real-time Data Sync" secondary="Bidirectional synchronization" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                          <ListItemText primary="Customer Management" secondary="Customer data and segmentation" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="secondary.main">
                        Enterprise Systems
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                          <ListItemText primary="RFID Systems" secondary="Real-time inventory tracking" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                          <ListItemText primary="POS Systems" secondary="Point of sale integration" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                          <ListItemText primary="Warehouse Management" secondary="Multi-location inventory" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </motion.div>

        {/* Contact Information */}
        <motion.div variants={itemVariants}>
          <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                📧 Developer Contact
              </Typography>
              <Divider sx={{ my: 2, backgroundColor: 'primary.contrastText', opacity: 0.3 }} />
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Typography variant="h6">Mounir Abderrahmani</Typography>
                  <Typography variant="body1">Lead Developer & Architect</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1">📧 mounir.ab@techno-dz.com</Typography>
                  <Typography variant="body1">📧 mounir.webdev.tms@gmail.com</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default SystemOverview;
