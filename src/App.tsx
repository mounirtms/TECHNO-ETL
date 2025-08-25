/**
 * TECHNO-ETL Application - Optimized Version
 * Enhanced with unified contexts and optimized performance
 *
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 * @website https://mounir1.github.io
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import optimized components
import UnifiedProvider from './contexts/UnifiedProvider';
import { optimizedSettingsManager } from './utils/optimizedSettingsManager';
import { useSettingsInitializer } from './hooks/useSettingsInitializer';
import './styles/rtl.css';

// Lazy load the optimized router
const OptimizedRouter = lazy(() => import('./router/OptimizedRouter'));

// Enhanced loading component
const AppLoading = () => (
  <Box
    sx={{
      display: "flex",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      gap: 2,
      backgroundColor: 'var(--color-background, #f5f5f5)',
      transition: 'background-color 0.3s ease',
    }}
  >
    <CircularProgress 
      size={40} 
      sx={{
        display: "flex",
        color: 'var(--color-primary-500, #F97316)',
        '& .MuiCircularProgress-circle': {
          strokeLinecap: 'round',
        }
      }} 
    />
    <Typography 
      variant="body1"
      sx={{
        display: "flex",
        color: 'var(--color-text-secondary, #666)',
        fontWeight: 500,
        letterSpacing: '0.5px'
      }}
    >
      Loading TECHNO-ETL...
    </Typography>
  </Box>
);

// Settings initialization component that runs inside the provider context
const AppWithSettings: React.FC = () => {
  const { isInitialized, isLoading, error } = useSettingsInitializer();

  // Show loading state while settings are being initialized
  if(isLoading && !isInitialized) {
    return <AppLoading />;
  }

  // Show error state if settings failed to initialize
  if(error) {
    console.error('Settings initialization error:', error);
    // Continue with app even if settings failed
  }

  return (
    <Suspense fallback={<AppLoading />}>
      <OptimizedRouter />
    </Suspense>
  );
};

const App: React.FC = () => {
  // Initialize theme on app start (fallback for non-authenticated users)
  useEffect(() => {
    const settings = optimizedSettingsManager.getSettings();
    optimizedSettingsManager.applyThemeSettings(settings.preferences);
  }, []);

  return (
    <>
      <CssBaseline enableColorScheme />
      <BrowserRouter>
        <UnifiedProvider>
          <AppWithSettings />
        </UnifiedProvider>
      </BrowserRouter>
      
      {/* Enhanced Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          zIndex: 9999,
        }}
      />
      
      {/* Optimized Mounir Signature */}
      <div 
        style={{
          position: 'fixed',
          bottom: 16, 
          right: 16, 
          zIndex: 1000,
          transition: 'all 0.3s ease',
          borderRadius: '50%',
          padding: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <a 
          href="https://mounir1.github.io"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            borderRadius: '50%',
            overflow: 'hidden',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <img 
            src="https://mounir1.github.io/favicon.ico"
            alt="Mounir Abderrahmani"
            style={{
              width: 32,
              height: 32, 
              display: 'block',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
        </a>
      </div>
      
      {/* Global CSS Variables */}
      <style>{`
        :root {
          --color-background: #fafafa;
          --color-surface: #ffffff;
          --color-text-primary: #1a1a1a;
          --color-text-secondary: #666666;
        }
        
        [data-theme="dark"] {
          --color-background: #121212;
          --color-surface: #1e1e1e;
          --color-text-primary: #ffffff;
          --color-text-secondary: #b3b3b3;
        }
        
        .custom-toast {
          border-radius: 8px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .custom-progress {
          background: linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600));
        }
        
        .no-animations * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `}</style>
    </>
  );
};

export default App;