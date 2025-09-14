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
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore as ExpandMoreIcon,
  Architecture as ArchitectureIcon,
  Web as WebIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';

const TechnicalArchitecture = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

  const architectureLayers = [
    {
      title: 'Frontend Layer (React.js)',
      description: 'Modern React application with Material-UI components',
      components: [
        'Components Layer - Reusable UI components',
        'Context Layer - State management with React Context',
        'Services Layer - API communication services',
        'Utils Layer - Helper functions and utilities',
      ],
      color: '#1976d2',
    },
    {
      title: 'Backend Layer (Node.js + Express)',
      description: 'RESTful API server with business logic',
      components: [
        'Controllers Layer - Request handling and routing',
        'Services Layer - Business logic implementation',
        'Middleware Layer - Cross-cutting concerns',
        'Data Access Layer - Database operations',
      ],
      color: '#388e3c',
    },
    {
      title: 'Data Layer',
      description: 'Multi-database architecture for different data types',
      components: [
        'SQL Server - MDM and transactional data',
        'Firebase - Authentication and real-time features',
        'Redis - Caching and session storage',
        'File System - Logs and static assets',
      ],
      color: '#f57c00',
    },
    {
      title: 'External Integrations',
      description: 'Third-party system integrations',
      components: [
        'Magento 2.4+ - E-commerce platform',
        'RFID Systems - Inventory tracking',
        'POS Systems - Point of sale integration',
        'Warehouse Management - Inventory systems',
      ],
      color: '#7b1fa2',
    },
  ];

  const frontendStructure = {
    'src/components/': {
      description: 'Reusable UI components',
      items: [
        'common/ - Shared components (UnifiedGrid, ErrorBoundary)',
        'grids/ - Professional grid system components',
        'dashboard/ - Dashboard-specific components',
        'Layout/ - Application layout components',
        'UserProfile/ - User management components',
      ],
    },
    'src/contexts/': {
      description: 'React Context providers',
      items: [
        'AuthContext.jsx - Authentication management',
        'ThemeContext.jsx - UI theme management',
        'LanguageContext.jsx - Internationalization',
        'SettingsContext.jsx - Unified settings management',
      ],
    },
    'src/services/': {
      description: 'API and business logic',
      items: [
        'magentoService.js - Magento API integration',
        'mdmService.js - MDM system integration',
        'unifiedSettingsService.js - Settings management',
        'authService.js - Authentication services',
      ],
    },
    'src/hooks/': {
      description: 'Custom React hooks',
      items: [
        'useStandardErrorHandling.js - Error management',
        'useGridState.js - Grid state management',
        'useAuth.js - Authentication hooks',
      ],
    },
  };

  const backendStructure = {
    'backend/src/controllers/': {
      description: 'Request handlers',
      items: [
        'mdmController.js - MDM operations',
        'magentoController.js - Magento operations',
        'syncController.js - Sync operations',
        'authController.js - Authentication handling',
      ],
    },
    'backend/src/services/': {
      description: 'Business logic layer',
      items: [
        'syncService.js - ETL orchestration',
        'magentoService.js - Magento business logic',
        'mdmDataService.js - MDM business logic',
        'cacheService.js - Caching strategies',
      ],
    },
    'backend/src/middleware/': {
      description: 'Cross-cutting concerns',
      items: [
        'auth.js - Authentication middleware',
        'validation.js - Request validation',
        'errorHandler.js - Error handling',
        'logging.js - Request logging',
      ],
    },
  };

  const securityLayers = [
    'Firebase Authentication (Identity Provider)',
    'JWT Token Validation (API Security)',
    'Role-Based Access Control (Authorization)',
    'API Rate Limiting (DDoS Protection)',
    'Input Validation (Data Security)',
    'HTTPS Encryption (Transport Security)',
  ];

  const performanceOptimizations = [
    {
      category: 'Caching Strategy',
      items: [
        'Browser Cache - Static Assets (1 year)',
        'CDN Cache - Global Distribution',
        'Redis Cache - API Responses (5 minutes)',
        'Application Cache - In-Memory',
        'Database Cache - Query Results',
      ],
    },
    {
      category: 'Database Optimization',
      items: [
        'Connection Pooling (Max: 20, Min: 5)',
        'Query Optimization with Indexes',
        'Read Replicas for Scaling',
        'Partitioned Tables for Large Datasets',
      ],
    },
    {
      category: 'Frontend Optimization',
      items: [
        'Code Splitting with React.lazy()',
        'Component Memoization',
        'Virtual Scrolling for Large Lists',
        'Image Optimization and Lazy Loading',
      ],
    },
  ];

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`architecture-tabpanel-${index}`}
      aria-labelledby={`architecture-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🏗️ Technical Architecture
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Comprehensive system architecture and technical implementation details
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Microservices" color="primary" />
              <Chip label="Scalable" color="success" />
              <Chip label="Production Ready" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* System Overview */}
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              🎯 Architecture Overview
            </Typography>
            TECHNO-ETL follows a modern, scalable microservices-inspired architecture with clear separation of concerns,
            ensuring high performance, maintainability, and scalability for enterprise operations.
          </Alert>
        </motion.div>

        {/* Architecture Layers */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📐 System Layers
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {architectureLayers.map((layer, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderLeft: `4px solid ${layer.color}`,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: layer.color, fontWeight: 600 }}>
                      {layer.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {layer.description}
                    </Typography>
                    <List dense>
                      {layer.components.map((component, idx) => (
                        <ListItem key={idx} sx={{ py: 0.25 }}>
                          <ListItemText
                            primary={component}
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Detailed Architecture Tabs */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🔍 Detailed Architecture
          </Typography>
          <Paper sx={{ mb: 6 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Frontend Structure" icon={<WebIcon />} />
              <Tab label="Backend Structure" icon={<StorageIcon />} />
              <Tab label="Security" icon={<SecurityIcon />} />
              <Tab label="Performance" icon={<SpeedIcon />} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>Frontend Architecture (React.js)</Typography>
              {Object.entries(frontendStructure).map(([path, details]) => (
                <Accordion key={path} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight={600}>{path}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {details.description}
                    </Typography>
                    <List dense>
                      {details.items.map((item, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>Backend Architecture (Node.js + Express)</Typography>
              {Object.entries(backendStructure).map(([path, details]) => (
                <Accordion key={path} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight={600}>{path}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {details.description}
                    </Typography>
                    <List dense>
                      {details.items.map((item, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>Security Architecture</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Multi-layered security approach ensuring data protection and access control:
              </Typography>
              <List>
                {securityLayers.map((layer, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={layer}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Performance Optimizations</Typography>
              <Grid container spacing={3}>
                {performanceOptimizations.map((category, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary.main">
                          {category.category}
                        </Typography>
                        <List dense>
                          {category.items.map((item, itemIdx) => (
                            <ListItem key={itemIdx} sx={{ py: 0.25 }}>
                              <ListItemText
                                primary={item}
                                primaryTypographyProps={{ fontSize: '0.875rem' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          </Paper>
        </motion.div>

        {/* Deployment Architecture */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🚀 Deployment Architecture
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary.main">
                Production Environment Stack
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Infrastructure Components:
                  </Typography>
                  <List dense>
                    <ListItem><ListItemText primary="Load Balancer (Nginx)" /></ListItem>
                    <ListItem><ListItemText primary="Application Servers (Node.js Cluster)" /></ListItem>
                    <ListItem><ListItemText primary="Database Cluster (SQL Server Always On)" /></ListItem>
                    <ListItem><ListItemText primary="Cache Cluster (Redis Sentinel)" /></ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Deployment Pipeline:
                  </Typography>
                  <List dense>
                    <ListItem><ListItemText primary="Development → Unit Tests" /></ListItem>
                    <ListItem><ListItemText primary="Testing → Integration Tests" /></ListItem>
                    <ListItem><ListItemText primary="Staging → UAT" /></ListItem>
                    <ListItem><ListItemText primary="Production → Blue-Green Deployment" /></ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default TechnicalArchitecture;
