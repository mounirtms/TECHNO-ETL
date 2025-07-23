import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

const CustomersPage = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PeopleIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Customer Management
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Customer Relationship Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page will contain customer management features including customer profiles, 
            communication history, and customer analytics.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default CustomersPage;
