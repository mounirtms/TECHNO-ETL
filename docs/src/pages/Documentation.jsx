import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  GridOn as GridIcon,
  Settings as SettingsIcon,
  Api as ApiIcon,
  Storage as DatabaseIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  Language as I18nIcon,
  Build as ToolsIcon,
  Description as DocsIcon,
  Rocket as DeployIcon,
  BugReport as TroubleshootIcon
} from '@mui/icons-material';

const Documentation = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const documentationSections = [
    {
      id: 'overview',
      title: 'Project Overview',
      icon: <DocsIcon />,
      description: 'Complete overview of the Techno-ETL system',
      content: 'overview'
    },
    {
      id: 'dashboard',
      title: 'Dashboard System',
      icon: <DashboardIcon />,
      description: 'Enhanced dashboard with 8 professional stat cards',
      content: 'dashboard'
    },
    {
      id: 'product-management',
      title: 'Product Management',
      icon: <ToolsIcon />,
      description: 'Comprehensive product catalog management tools',
      content: 'product-management'
    },
    {
      id: 'grids',
      title: 'Grid System',
      icon: <GridIcon />,
      description: 'Advanced data grids with Magento integration',
      content: 'grids'
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: <ApiIcon />,
      description: 'Backend API endpoints and integration',
      content: 'api'
    },
    {
      id: 'database',
      title: 'Database & MDM',
      icon: <DatabaseIcon />,
      description: 'MDM integration and data correlation',
      content: 'database'
    },
    {
      id: 'deployment',
      title: 'Deployment Guide',
      icon: <DeployIcon />,
      description: 'Production deployment and configuration',
      content: 'deployment'
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <TroubleshootIcon />,
      description: 'Common issues and solutions',
      content: 'troubleshooting'
    }
  ];

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`documentation-tabpanel-${index}`}
      aria-labelledby={`documentation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  const OverviewContent = () => (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        🚀 Techno-ETL Documentation
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Version 1.0.0-210725 | Professional E-commerce Management System
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Latest Release:</strong> Enhanced dashboard with 8 professional stat cards, 
          advanced product management tools, and comprehensive image processing capabilities.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {documentationSections.map((section) => (
          <Grid item xs={12} md={6} lg={4} key={section.id}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {section.icon}
                  <Typography variant="h6" sx={{ ml: 1 }} fontWeight={600}>
                    {section.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {section.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  onClick={() => setActiveTab(documentationSections.findIndex(s => s.id === section.id) + 1)}
                >
                  View Documentation
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          🎯 Key Features
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon><DashboardIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Enhanced Dashboard" 
                  secondary="8 professional stat cards with advanced analytics"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><ToolsIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Product Management" 
                  secondary="Comprehensive catalog tools with image processing"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><GridIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Advanced Grids" 
                  secondary="Professional data grids with Magento integration"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><DatabaseIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="MDM Integration" 
                  secondary="Seamless correlation with master data management"
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon><ApiIcon color="secondary" /></ListItemIcon>
                <ListItemText 
                  primary="RESTful API" 
                  secondary="Comprehensive backend with caching and optimization"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><SecurityIcon color="secondary" /></ListItemIcon>
                <ListItemText 
                  primary="Security" 
                  secondary="Authentication, authorization, and data protection"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><PerformanceIcon color="secondary" /></ListItemIcon>
                <ListItemText 
                  primary="Performance" 
                  secondary="Optimized for large datasets and real-time updates"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><I18nIcon color="secondary" /></ListItemIcon>
                <ListItemText 
                  primary="Internationalization" 
                  secondary="Multi-language support with RTL compatibility"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          📋 Release Notes - Version 1.0.0-210725
        </Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">🎉 Latest Features</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Enhanced Dashboard" 
                  secondary="8 professional stat cards with real-time metrics, progress indicators, and interactive hover effects"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Advanced Settings System" 
                  secondary="Comprehensive dashboard customization with visibility toggles and persistent preferences"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Product Management Tools" 
                  secondary="Professional tabbed interface with image processing, renaming, and resizing capabilities"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Smart Caching" 
                  secondary="Intelligent caching system for attributes, brands, and categories with 1-hour expiry"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">🔧 Technical Improvements</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemText 
                  primary="React Router v7 Compatibility" 
                  secondary="Future-proof configuration with v7 transition flags"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="MUI Component Optimization" 
                  secondary="Fixed tooltip warnings and improved component interactions"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Backend Server Fixes" 
                  secondary="Resolved module loading issues and improved ES module compatibility"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Performance Enhancements" 
                  secondary="React.memo optimization, virtualization, and smart state management"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            <Tab label="Overview" />
            {documentationSections.map((section) => (
              <Tab key={section.id} label={section.title} />
            ))}
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <OverviewContent />
        </TabPanel>

        {documentationSections.map((section, index) => (
          <TabPanel key={section.id} value={activeTab} index={index + 1}>
            <Typography variant="h4" gutterBottom>
              {section.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {section.description}
            </Typography>
            {/* Content will be added for each section */}
            <Alert severity="info">
              Detailed documentation for {section.title} is being prepared...
            </Alert>
          </TabPanel>
        ))}
      </Paper>
    </Container>
  );
};

export default Documentation;
