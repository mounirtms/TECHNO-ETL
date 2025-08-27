import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Api as ApiIcon,
  Palette as PaletteIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Grid3x3 as GridIcon,
  Sync as SyncIcon
} from '@mui/icons-material';

const UserSettingsGuide = () => {
  const settingsCategories = [
    {
      title: 'Personal Information',
      icon: <PersonIcon />,
      description: 'Manage your profile information and contact details',
      features: [
        'First Name and Last Name',
        'Email Address',
        'Phone Number',
        'Address Information',
        'Profile Picture Upload',
        'Account Preferences'
      ]
    },
    {
      title: 'API Settings',
      icon: <ApiIcon />,
      description: 'Configure API connections and integrations',
      features: [
        'Magento API Configuration',
        'Cegid System Integration',
        'Database Connections',
        'Authentication Tokens',
        'API Rate Limiting',
        'Connection Testing'
      ]
    },
    {
      title: 'Appearance & Preferences',
      icon: <PaletteIcon />,
      description: 'Customize the interface and user experience',
      features: [
        'Theme Selection (Light/Dark/System)',
        'Language Settings with RTL Support',
        'Font Size and Density',
        'Animation Preferences',
        'Grid Display Options',
        'Accessibility Settings'
      ]
    }
  ];

  const globalSettings = [
    {
      category: 'Theme & Appearance',
      settings: [
        'Global theme application across all components',
        'Immediate theme switching without page reload',
        'RTL layout support for Arabic and other RTL languages',
        'Professional layout animations',
        'Consistent styling patterns'
      ]
    },
    {
      category: 'Grid Preferences',
      settings: [
        'Default pagination size',
        'Grid density (compact/standard/comfortable)',
        'Column visibility preferences',
        'Sorting and filtering defaults',
        'Export format preferences'
      ]
    },
    {
      category: 'Performance Settings',
      settings: [
        'Virtualization for large datasets',
        'Auto-refresh intervals',
        'Caching preferences',
        'Background sync settings',
        'Memory optimization options'
      ]
    }
  ];

  const pageSpecificSettings = [
    {
      page: 'Dashboard',
      settings: [
        'Widget layout and positioning',
        'Data refresh intervals',
        'Chart and graph preferences',
        'Notification settings',
        'Quick action shortcuts'
      ]
    },
    {
      page: 'Product Grids',
      settings: [
        'Column configuration per grid type',
        'Filter presets and saved searches',
        'Bulk operation preferences',
        'Export templates',
        'View mode defaults'
      ]
    },
    {
      page: 'Reports',
      settings: [
        'Default report formats',
        'Scheduling preferences',
        'Email notification settings',
        'Data visualization options',
        'Archive and retention settings'
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          <SettingsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          User Settings System Guide
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Comprehensive guide to the enhanced user settings system with global and page-specific configurations
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          🎯 Enhanced Settings Architecture
        </Typography>
        <Typography>
          The user settings system now supports both global settings that apply across the entire application 
          and page-specific settings that customize individual page experiences. All settings are persistent 
          and synchronized across sessions.
        </Typography>
      </Alert>

      {/* Main Settings Categories */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Main Settings Categories
        </Typography>
        <Grid container spacing={3}>
          {settingsCategories.map((category, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {category.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {category.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {category.description}
                  </Typography>
                  <List dense>
                    {category.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} sx={{ px: 0 }}>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Global Settings */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Global Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Settings that apply across all components and pages in the application
        </Typography>

        {globalSettings.map((section, index) => (
          <Accordion key={index} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{section.category}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {section.settings.map((setting, settingIndex) => (
                  <ListItem key={settingIndex}>
                    <ListItemIcon>
                      <Chip size="small" label={settingIndex + 1} />
                    </ListItemIcon>
                    <ListItemText primary={setting} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Page-Specific Settings */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <GridIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Page-Specific Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Customizable settings that are specific to individual pages and components
        </Typography>

        <Grid container spacing={3}>
          {pageSpecificSettings.map((page, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {page.page}
                  </Typography>
                  <List dense>
                    {page.settings.map((setting, settingIndex) => (
                      <ListItem key={settingIndex} sx={{ px: 0 }}>
                        <ListItemText 
                          primary={setting}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Settings Architecture */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <SyncIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Settings Architecture & Inheritance
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Object-Oriented Design
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Chip size="small" label="1" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Base Settings Class"
                  secondary="Core settings functionality and validation"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Chip size="small" label="2" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="User Settings Inheritance"
                  secondary="Extends base with user-specific preferences"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Chip size="small" label="3" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Page Settings Override"
                  secondary="Page-specific settings override global defaults"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Chip size="small" label="4" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Permission-Based Access"
                  secondary="Settings visibility based on user permissions"
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              DRY Principles Applied
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Shared Components"
                  secondary="Reusable settings components across pages"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <GridIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Common Grid Logic"
                  secondary="Unified grid settings applied consistently"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PaletteIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Theme Inheritance"
                  secondary="Cascading theme settings from global to local"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Permission Mixins"
                  secondary="Reusable permission checking logic"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      <Alert severity="success" sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          ✅ Settings System Benefits
        </Typography>
        <Typography>
          • <strong>Consistent Experience:</strong> Global settings ensure uniform behavior across all pages<br/>
          • <strong>Personalization:</strong> Page-specific settings allow detailed customization<br/>
          • <strong>Performance:</strong> Optimized settings application with minimal re-renders<br/>
          • <strong>Maintainability:</strong> Object-oriented design with clear inheritance patterns<br/>
          • <strong>Accessibility:</strong> Built-in support for RTL languages and accessibility features
        </Typography>
      </Alert>
    </Container>
  );
};

export default UserSettingsGuide;