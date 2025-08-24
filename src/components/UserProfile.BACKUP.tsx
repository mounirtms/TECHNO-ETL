import React from 'react';
import { Paper, Box, Typography, Alert } from '@mui/material';

/**
 * Emergency fallback UserProfile component
 * This is a simplified version to prevent dynamic import failures
 */
const UserProfileFallback = () => {
  return (
    <Paper elevation={3} sx={{ maxWidth: 1200, margin: 'auto', mt: 2, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        User Profile
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        The full user profile interface is temporarily unavailable. 
        You can access your settings through the main settings page.
      </Alert>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Access settings via the main navigation
          • Theme and language changes are available in the header
          • Profile information can be managed through the account menu
        </Typography>
      </Box>
    </Paper>
  );
};

export default UserProfileFallback;
