/**
 * TECHNO-ETL Application
 * Enhanced with comprehensive theme and language system
 *
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 */

import React, { useEffect } from 'react';
import { useUserSettings } from './hooks/useUserSettings';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';

const App = () => {
  const { isInitialized, loading } = useUserSettings();

  // Show loading screen while initializing
  if (!isInitialized || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Initializing TECHNO-ETL...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      {/* The main app content is handled by main.jsx routing */}
    </>
  );
};

export default App;