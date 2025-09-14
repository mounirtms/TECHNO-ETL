import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircle as CheckIcon,
  Architecture as ArchitectureIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudUpload as CloudIcon,
  Analytics as AnalyticsIcon,
  IntegrationInstructions as IntegrationIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

const ProjectOverview = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    {
      title: 'Real-time Data Synchronization',
      description: 'Bidirectional sync between MDM and Magento systems',
      icon: <IntegrationIcon />,
      color: '#1976d2',
    },
    {
      title: 'Advanced Grid Management',
      description: 'Professional data grids with filtering, sorting, and export',
      icon: <StorageIcon />,
      color: '#388e3c',
    },
    {
      title: 'Comprehensive Analytics',
      description: 'Real-time dashboards with KPI tracking and monitoring',
      icon: <AnalyticsIcon />,
      color: '#f57c00',
    },
    {
      title: 'Enterprise Security',
      description: 'Role-based access control with Firebase authentication',
      icon: <SecurityIcon />,
      color: '#d32f2f',
    },
    {
      title: 'High Performance',
      description: 'Optimized for 1000+ concurrent users and 10K+ records/min',
      icon: <SpeedIcon />,
      color: '#7b1fa2',
    },
    {
      title: 'Cloud Ready',
      description: 'Production-ready deployment with scalable architecture',
      icon: <CloudIcon />,
      color: '#0288d1',
    },
  ];

  const metrics = [
    { label: 'Load Time', value: '< 2 seconds', progress: 95 },
    { label: 'API Response', value: '< 500ms', progress: 90 },
    { label: 'Data Sync Accuracy', value: '99.9%', progress: 99 },
    { label: 'System Uptime', value: '99.95%', progress: 99 },
  ];

  const techStack = {
    frontend: ['React.js 18+', 'Material-UI (MUI)', 'Vite', 'React Router', 'Framer Motion'],
    backend: ['Node.js 18+', 'Express.js', 'SQL Server', 'Redis', 'Firebase'],
    tools: ['ESLint', 'Prettier', 'Babel', 'Webpack', 'Jest'],
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🚀 TECHNO-ETL Project Overview
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Enterprise-grade data management platform bridging MDM and Magento systems
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Version 2.1.0" color="primary" />
              <Chip label="Production Ready" color="success" />
              <Chip label="August 2025" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* Mission Statement */}
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ mb: 4, fontSize: '1.1rem' }}>
            <Typography variant="h6" gutterBottom>
              🎯 Core Mission
            </Typography>
            "Streamline data operations between multiple systems while maintaining data integrity,
            providing real-time analytics, and ensuring scalable performance for enterprise e-commerce operations."
          </Alert>
        </motion.div>

        {/* Key Features Grid */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🌟 Key Features
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {features.map((feature, index) => (
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

        {/* Performance Metrics */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📊 Performance Metrics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {metrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {metric.label}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={metric.progress}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Technology Stack */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🔧 Technology Stack
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary.main" fontWeight={600}>
                    Frontend Technologies
                  </Typography>
                  <List dense>
                    {techStack.frontend.map((tech, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
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
                  <Typography variant="h6" gutterBottom color="secondary.main" fontWeight={600}>
                    Backend Technologies
                  </Typography>
                  <List dense>
                    {techStack.backend.map((tech, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
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
                  <Typography variant="h6" gutterBottom color="warning.main" fontWeight={600}>
                    Development Tools
                  </Typography>
                  <List dense>
                    {techStack.tools.map((tool, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
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
        </motion.div>

        {/* Business Value */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🎯 Business Value
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main" fontWeight={600}>
                    Operational Efficiency
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="50% reduction in manual data entry" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="75% faster inventory updates" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="90% improvement in data accuracy" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Real-time visibility across all systems" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="info.main" fontWeight={600}>
                    Cost Savings
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Reduced operational costs through automation" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Minimized data errors and associated costs" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Improved resource utilization" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Faster time-to-market for new products" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Contact Information */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mt: 6, p: 3, backgroundColor: 'primary.light', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              📧 Contact Information
            </Typography>
            <Typography variant="body1">
              <strong>Developer:</strong> Mounir Abderrahmani
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> mounir.ab@techno-dz.com
            </Typography>
            <Typography variant="body1">
              <strong>Alternative:</strong> mounir.webdev.tms@gmail.com
            </Typography>
          </Box>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default ProjectOverview;
