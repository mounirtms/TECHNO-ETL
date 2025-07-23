import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';

const ReportsPage = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AssessmentIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Reports & Analytics
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Business Intelligence Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page will contain comprehensive reports and analytics including sales reports, 
            performance metrics, and business intelligence dashboards.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ReportsPage;
