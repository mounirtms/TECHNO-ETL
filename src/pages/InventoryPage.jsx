import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';

const InventoryPage = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <InventoryIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Inventory Management
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Inventory Management System
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page will contain inventory management features including stock levels, 
            warehouse management, and inventory tracking.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default InventoryPage;
