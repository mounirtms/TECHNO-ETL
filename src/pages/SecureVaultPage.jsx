import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

const SecureVaultPage = () => {
  return (
    <Box className="dashboard-container" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SecurityIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" gutterBottom>
          Secure Vault
        </Typography>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Secure Vault functionality is under development.
      </Alert>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Security Features
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain secure vault functionality for managing sensitive data and credentials.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SecureVaultPage;