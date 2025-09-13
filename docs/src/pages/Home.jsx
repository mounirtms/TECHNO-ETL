import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActionArea, Box, Paper, Link, Divider, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DescriptionIcon from '@mui/icons-material/Description';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import SyncIcon from '@mui/icons-material/Sync';
import GridOnIcon from '@mui/icons-material/GridOn';
import ApiIcon from '@mui/icons-material/Api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BugReportIcon from '@mui/icons-material/BugReport';
import SettingsIcon from '@mui/icons-material/Settings';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const integrations = [
    {
      title: 'ETL Integration',
      description: 'Comprehensive ETL pipeline for data extraction, transformation, and loading across systems.',
      icon: <IntegrationInstructionsIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/etl-integration',
      color: '#e3f2fd',
    },
    {
      title: 'JDE Integration',
      description: 'Seamless integration with JD Edwards EnterpriseOne for business process automation.',
      icon: <BusinessIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
      path: '/jde-integration',
      color: '#f3e5f5',
    },
    {
      title: 'Magento Integration',
      description: 'Connect your Magento e-commerce platform with enterprise systems for unified commerce.',
      icon: <StorefrontIcon sx={{ fontSize: 60, color: 'error.main' }} />,
      path: '/magento-integration',
      color: '#fbe9e7',
    },
    {
      title: 'CEGID Integration',
      description: 'Integrate CEGID Business Retail with your enterprise ecosystem for retail excellence.',
      icon: <SettingsEthernetIcon sx={{ fontSize: 60, color: 'success.main' }} />,
      path: '/cegid-integration',
      color: '#e8f5e9',
    },
  ];

  const externalLinks = [
    {
      title: 'Production Environment',
      url: 'https://technostationery.com',
      description: 'Access the main production environment',
    },
    {
      title: 'Beta Environment',
      url: 'https://beta.technostationery.com',
      description: 'Test and preview new features',
    },
    {
      title: 'Admin Dashboard',
      url: 'https://dashboard.technostationery.com',
      description: 'Manage your Techno applications',
    },
    {
      title: 'Web Application',
      url: 'https://techno-webapp.web.app',
      description: 'Access the web application interface',
    },
    {
      title: 'Techno Magento API Documentation',
      url: '    https://doc.echoapi.com/docs/43c070988402000?locale=en&target_id=14e6b4ecb9a468',
      description: 'Explore our API documentation on Postman',
    },
    {
      title: 'API Documentation',
      url: 'https://www.postman.com/techno-e-commerce/techno-e-commerce-workspace/overview',
      description: 'Explore our API documentation on Postman',
    },

  ];

  const documentationSections = [
    {
      title: 'System Overview',
      description: 'Complete system overview with features, architecture, and business value',
      icon: <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/docs/system-overview',
      color: '#e3f2fd',
      category: 'Overview',
    },
    {
      title: 'Getting Started',
      description: 'Step-by-step setup guide to get TECHNO-ETL running in your environment',
      icon: <SettingsIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      path: '/docs/getting-started',
      color: '#e8f5e9',
      category: 'Setup',
    },
    {
      title: 'Features Showcase',
      description: 'Comprehensive overview of all features and capabilities',
      icon: <DashboardIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      path: '/docs/features-showcase',
      color: '#fff3e0',
      category: 'Features',
    },
    {
      title: 'Project Overview',
      description: 'Comprehensive overview of TECHNO-ETL system architecture and features',
      icon: <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/docs/project-overview',
      color: '#e3f2fd',
      category: 'Overview',
    },
    {
      title: 'Technical Architecture',
      description: 'Detailed system architecture, components, and technical implementation',
      icon: <ArchitectureIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      path: '/docs/technical-architecture',
      color: '#f3e5f5',
      category: 'Architecture',
    },
    {
      title: 'ETL Process',
      description: 'Extract, Transform, Load process documentation with examples',
      icon: <SyncIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      path: '/docs/etl-process',
      color: '#e8f5e9',
      category: 'Process',
    },
    {
      title: 'Grid System',
      description: 'Professional data grid system with advanced features',
      icon: <GridOnIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      path: '/docs/grid-system',
      color: '#fff3e0',
      category: 'Components',
    },
    {
      title: 'API Documentation',
      description: 'Complete REST API documentation with examples and endpoints',
      icon: <ApiIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      path: '/docs/api-documentation',
      color: '#e1f5fe',
      category: 'API',
    },
    {
      title: 'Dashboard System',
      description: 'Real-time analytics and monitoring dashboard documentation',
      icon: <DashboardIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      path: '/docs/dashboard-system',
      color: '#fbe9e7',
      category: 'UI',
    },
    {
      title: 'Product Management',
      description: 'Product lifecycle management and synchronization guide',
      icon: <ShoppingCartIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/docs/product-management',
      color: '#e8eaf6',
      category: 'Business',
    },
    {
      title: 'Configuration & Setup',
      description: 'Complete environment setup and configuration guide',
      icon: <SettingsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      path: '/docs/configuration-setup',
      color: '#f3e5f5',
      category: 'Setup',
    },
    {
      title: 'Deployment Guide',
      description: 'Complete deployment guide for production environments',
      icon: <CloudUploadIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      path: '/docs/deployment-guide',
      color: '#e0f2f1',
      category: 'DevOps',
    },
    {
      title: 'Troubleshooting',
      description: 'Common issues, solutions, and debugging techniques',
      icon: <BugReportIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      path: '/docs/troubleshooting',
      color: '#fffde7',
      category: 'Support',
    },
  ];

  return (
    <Container maxWidth={false}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Typography variant="h2" component="h1" gutterBottom>
            Integration Documentation
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" paragraph>
            Welcome to the comprehensive documentation for Techno's integration solutions.
            This guide provides detailed information about our various integration options and APIs.
          </Typography>
        </motion.div>

        <Divider sx={{ my: 4 }} />

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              System Architecture
            </Typography>
            <Box sx={{ my: 2 }}>
              <img
                src="/docs/images/system-architecture.svg"
                alt="System Architecture"
                style={{ width: '100%', maxWidth: '100%', height: 'auto', margin: '0 auto', display: 'block' }}
              />
            </Box>
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
            Integration Options
          </Typography>
        </motion.div>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {integrations.map((integration) => (
            <Grid item xs={12} sm={6} key={integration.title}>
              <motion.div variants={itemVariants}>
                <Card
                  component={RouterLink}
                  to={integration.path}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardActionArea>
                    <Box
                      sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: integration.color,
                      }}
                    >
                      {integration.icon}
                    </Box>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {integration.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {integration.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Documentation Section */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 2 }}>
            📚 Documentation
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Comprehensive documentation covering all aspects of TECHNO-ETL system
          </Typography>
        </motion.div>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {documentationSections.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.title}>
              <motion.div variants={itemVariants}>
                <Card
                  component={RouterLink}
                  to={doc.path}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardActionArea sx={{ height: '100%' }}>
                    <Box
                      sx={{
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: doc.color,
                        minHeight: 120,
                      }}
                    >
                      {doc.icon}
                      <Chip
                        label={doc.category}
                        size="small"
                        sx={{ mt: 1 }}
                        color="primary"
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" fontWeight={600}>
                        {doc.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doc.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom>
            Quick Links
          </Typography>
          <Grid container spacing={3}>
            {externalLinks.map((link) => (
              <Grid item xs={12} sm={6} md={4} key={link.title}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {link.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {link.description}
                    </Typography>
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'primary.main',
                      }}
                    >
                      Visit {link.title}
                      <OpenInNewIcon sx={{ fontSize: 16 }} />
                    </Link>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default Home;
