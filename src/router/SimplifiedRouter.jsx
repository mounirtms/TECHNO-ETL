import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { PublicRouteGuard, RouteGuard } from './RouteGuard';

// Lazy Load Components
const Layout = lazy(() => import('../components/Layout/Layout.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const DocsPage = lazy(() => import('../pages/DocsPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

// Import TabProvider
import { TabProvider } from '../contexts/TabContext';

const EnhancedLoadingFallback = ({ routeName = 'page' }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading {routeName}...
    </Typography>
  </Box>
);

const SimplifiedRouter = () => {
  const { loading } = useAuth();

  if (loading) {
    return <EnhancedLoadingFallback routeName="Authentication" />;
  }

  return (
    <Suspense fallback={<EnhancedLoadingFallback routeName="Application" />}>
      <TabProvider>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRouteGuard>
                <Login />
              </PublicRouteGuard>
            } 
          />
          
          <Route 
            path="/docs/*" 
            element={
              <RouteGuard>
                <DocsPage />
              </RouteGuard>
            } 
          />

          <Route 
            path="/*" 
            element={
              <RouteGuard>
                <Layout />
              </RouteGuard>
            }
          />

          {/* Redirect root to dashboard */}
          <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
          />

          <Route 
            path="*" 
            element={<NotFoundPage />} 
          />
        </Routes>
      </TabProvider>
    </Suspense>
  );
};

export default SimplifiedRouter;