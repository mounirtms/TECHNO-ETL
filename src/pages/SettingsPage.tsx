import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const SettingsPage = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            System Settings
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Application Configuration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page will contain system settings including user preferences, 
            application configuration, and administrative controls.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default SettingsPage;
