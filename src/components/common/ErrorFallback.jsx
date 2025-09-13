import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const ErrorFallback = ({ error, resetError, componentName = 'Component' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        p: 3,
        textAlign: 'center',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      <Typography variant="h6" color="error" gutterBottom>
        {componentName} Error
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {error?.message || 'Something went wrong loading this component.'}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => window.location.reload()}
        sx={{ mt: 1 }}
      >
        Refresh Page
      </Button>
    </Box>
  );
};

export default ErrorFallback;