import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActionArea, Box, Paper, Link, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  const integrations = [
    {
      title: 'ETL Integration',
      description: 'Comprehensive ETL pipeline for data extraction, transformation, and loading across systems.',
      icon: <IntegrationInstructionsIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/etl-integration',
      color: '#e3f2fd'
    },
    {
      title: 'JDE Integration',
      description: 'Seamless integration with JD Edwards EnterpriseOne for business process automation.',
      icon: <BusinessIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
      path: '/jde-integration',
      color: '#f3e5f5'
    },
    {
      title: 'Magento Integration',
      description: 'Connect your Magento e-commerce platform with enterprise systems for unified commerce.',
      icon: <StorefrontIcon sx={{ fontSize: 60, color: 'error.main' }} />,
      path: '/magento-integration',
      color: '#fbe9e7'
    },
    {
      title: 'CEGID Integration',
      description: 'Integrate CEGID Business Retail with your enterprise ecosystem for retail excellence.',
      icon: <SettingsEthernetIcon sx={{ fontSize: 60, color: 'success.main' }} />,
      path: '/cegid-integration',
      color: '#e8f5e9'
    }
  ];

  const externalLinks = [
    {
      title: 'Production Environment',
      url: 'https://technostationery.com',
      description: 'Access the main production environment'
    },
    {
      title: 'Beta Environment',
      url: 'https://beta.technostationery.com',
      description: 'Test and preview new features'
    },
    {
      title: 'Admin Dashboard',
      url: 'https://dashboard.technostationery.com',
      description: 'Manage your Techno applications'
    },
    {
      title: 'Web Application',
      url: 'https://techno-webapp.web.app',
      description: 'Access the web application interface'
    },
    {
      title: 'API Documentation',
      url: 'https://www.postman.com/techno-e-commerce/techno-e-commerce-workspace/overview',
      description: 'Explore our API documentation on Postman'
    }
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
                src="public/assets/images/system-architecture.svg"
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
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardActionArea>
                    <Box
                      sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: integration.color
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
                        color: 'primary.main'
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
