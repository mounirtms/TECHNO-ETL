import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const AccessControlPage = () => {
  return (
    <Box className="dashboard-container" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AdminPanelSettingsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" gutterBottom>
          Access Control
        </Typography>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Access Control functionality is under development.
      </Alert>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Permission Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain access control and permission management functionality.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccessControlPage;