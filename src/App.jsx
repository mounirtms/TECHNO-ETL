/**
 * TECHNO-ETL Application
 * Enhanced with comprehensive theme and language system
 *
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 * @website https://mounir1.github.io
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { useRTL } from './contexts/RTLContext';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load the main router to avoid circular dependencies
const SimplifiedRouter = lazy(() => import('./router/SimplifiedRouter'));

// Import the settings conflict dialog
import SettingsConflictDialog from './components/dialogs/SettingsConflictDialog';

// Simple loading component
const AppLoading = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      gap: 2,
      backgroundColor: 'background.default'
    }}
  >
    <CircularProgress size={40} color="primary" />
    <Typography variant="body2" color="text.secondary">
      Loading TECHNO-ETL...
    </Typography>
  </Box>
);

const App = () => {
  const { isRTL } = useRTL();

  return (
    <>
      <CssBaseline />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Suspense fallback={<AppLoading />}>
          <SimplifiedRouter />
        </Suspense>
      </BrowserRouter>
      
      {/* Global Components */}
      <SettingsConflictDialog />
      
      <ToastContainer
        position={isRTL ? "top-left" : "top-right"}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={isRTL}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{
          direction: isRTL ? 'rtl' : 'ltr'
        }}
      />
    </>
  );
};

export default App;