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
import 'react-toastify/dist/ReactToastify.css';

// Lazy load the main router to avoid circular dependencies
const EnhancedRouter = lazy(() => import('./router/EnhancedRouter'));

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
      backgroundColor: '#f5f5f5'
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading TECHNO-ETL...
    </Typography>
  </Box>
);

const App = () => {
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
          <EnhancedRouter />
        </Suspense>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* Mounir Signature */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        <a href="https://mounir1.github.io" target="_blank" rel="noopener noreferrer">
          <img 
            src="/src/assets/images/mounir-icon.svg" 
            alt="Mounir Abderrahmani Signature" 
            style={{ width: 40, height: 40, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          />
        </a>
      </div>
    </>
  );
};

export default App;