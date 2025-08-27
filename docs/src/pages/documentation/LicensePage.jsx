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
  Button,
  Link
} from '@mui/material';
import {
  Security as SecurityIcon,
  Copyright as CopyrightIcon,
  Business as BusinessIcon,
  Code as CodeIcon,
  Shield as ShieldIcon,
  ContactMail as ContactIcon,
  Description as DocumentIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const LicensePage = () => {
  const licenseDetails = {
    projectName: 'TECHNO-ETL',
    version: '2.0.0',
    author: 'Mounir Abderrahmani',
    company: 'TECHNO-DZ',
    email: 'mounir.ab@techno-dz.com',
    year: '2024-2025',
    licenseType: 'Proprietary Commercial License'
  };

  const permissions = [
    {
      category: 'Authorized Use',
      items: [
        'Internal business operations within licensed organization',
        'Development and testing in authorized environments',
        'Customization for specific business requirements',
        'Integration with approved third-party systems',
        'Training and documentation for authorized users'
      ],
      color: 'success'
    },
    {
      category: 'Restrictions',
      items: [
        'No redistribution or resale of the software',
        'No reverse engineering or decompilation',
        'No modification of core licensing mechanisms',
        'No use outside of licensed organization',
        'No creation of derivative works for commercial distribution'
      ],
      color: 'error'
    },
    {
      category: 'Requirements',
      items: [
        'Maintain all copyright notices and attributions',
        'Report security vulnerabilities to the author',
        'Comply with all applicable laws and regulations',
        'Use only with valid license agreement',
        'Provide proper attribution in any public documentation'
      ],
      color: 'warning'
    }
  ];

  const technicalComponents = [
    {
      component: 'Frontend Application',
      technology: 'React 18 + Vite',
      license: 'Proprietary',
      description: 'User interface and client-side application logic'
    },
    {
      component: 'Backend API',
      technology: 'Node.js + Express',
      license: 'Proprietary',
      description: 'Server-side API and business logic'
    },
    {
      component: 'Database Integration',
      technology: 'Multiple DB Connectors',
      license: 'Proprietary',
      description: 'Custom database integration and ETL processes'
    },
    {
      component: 'Third-Party Libraries',
      technology: 'Various Open Source',
      license: 'Mixed (See package.json)',
      description: 'Open source dependencies with their respective licenses'
    }
  ];

  const supportOptions = [
    {
      type: 'Technical Support',
      description: 'Bug fixes, technical assistance, and troubleshooting',
      contact: 'mounir.ab@techno-dz.com',
      availability: 'Business hours (GMT+1)'
    },
    {
      type: 'Feature Requests',
      description: 'Custom feature development and enhancements',
      contact: 'mounir.webdev.tms@gmail.com',
      availability: 'By appointment'
    },
    {
      type: 'Licensing Inquiries',
      description: 'License terms, compliance, and commercial arrangements',
      contact: 'mounir.ab@techno-dz.com',
      availability: 'Business hours (GMT+1)'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          <SecurityIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Software License & Legal Information
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Comprehensive licensing information for TECHNO-ETL platform
        </Typography>
      </Box>

      {/* License Overview */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <CopyrightIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          License Overview
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Project Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Project Name"
                      secondary={licenseDetails.projectName}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Version"
                      secondary={licenseDetails.version}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="License Type"
                      secondary={licenseDetails.licenseType}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Copyright Year"
                      secondary={licenseDetails.year}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Author & Company
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Author"
                      secondary={licenseDetails.author}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Company"
                      secondary={licenseDetails.company}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Contact Email"
                      secondary={licenseDetails.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Portfolio"
                      secondary={
                        <Link href="https://mounir1.github.io" target="_blank" rel="noopener">
                          mounir1.github.io
                        </Link>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Permissions and Restrictions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <ShieldIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          License Terms & Conditions
        </Typography>

        <Grid container spacing={3}>
          {permissions.map((section, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {section.category}
                    </Typography>
                    <Chip 
                      size="small" 
                      color={section.color} 
                      label={section.items.length}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <List dense>
                    {section.items.map((item, itemIndex) => (
                      <ListItem key={itemIndex} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Chip 
                            size="small" 
                            label={itemIndex + 1} 
                            color={section.color}
                            variant="outlined"
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item}
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

      {/* Technical Components */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Technical Components & Licensing
        </Typography>

        <Grid container spacing={2}>
          {technicalComponents.map((component, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {component.component}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {component.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={component.technology} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      label={component.license} 
                      size="small" 
                      color={component.license === 'Proprietary' ? 'error' : 'success'}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Support & Contact */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <ContactIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Support & Contact Information
        </Typography>

        <Grid container spacing={3}>
          {supportOptions.map((support, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {support.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {support.description}
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Contact"
                        secondary={support.contact}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Availability"
                        secondary={support.availability}
                      />
                    </ListItem>
                  </List>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    href={`mailto:${support.contact}`}
                    startIcon={<ContactIcon />}
                  >
                    Contact
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Legal Notices */}
      <Alert severity="warning" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Important Legal Notice
        </Typography>
        <Typography paragraph>
          This software is proprietary and confidential. Unauthorized copying, distribution, 
          modification, or use is strictly prohibited and may result in legal action.
        </Typography>
        <Typography>
          All rights reserved. No part of this software may be reproduced, distributed, or 
          transmitted in any form or by any means without the prior written permission of the author.
        </Typography>
      </Alert>

      <Alert severity="info">
        <Typography variant="h6" gutterBottom>
          <DocumentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          License Compliance
        </Typography>
        <Typography>
          For questions about license compliance, commercial licensing, or to report violations, 
          please contact: <strong>mounir.ab@techno-dz.com</strong>
        </Typography>
      </Alert>
    </Container>
  );
};

export default LicensePage;