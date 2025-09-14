import React, { Suspense, lazy, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import { PublicRouteGuard, RouteGuard } from './RouteGuard';
import { PUBLIC_ROUTES, PROTECTED_ROUTES, DEFAULT_ROUTE } from './RouteConfig';

// Lazy Load Components
const Layout = lazy(() => import('../components/Layout/Layout.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

// Import TabProvider
import { TabProvider } from '../contexts/TabContext';

/**
 * Enhanced Loading Fallback with better UX
 */
const EnhancedLoadingFallback = ({ routeName = 'page' }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 2,
      backgroundColor: 'background.default'
    }}
  >
    <CircularProgress size={40} color="primary" />
    <Typography variant="body2" color="text.secondary">
      Loading {routeName}...
    </Typography>
  </Box>
);

/**
 * Permission-aware Route Component with optimized rendering
 */
const PermissionRoute = ({ route, children }) => {
  const { hasPermission, hasRole, loading } = usePermissions();
  
  // Check permissions and roles with optimized memoization
  const hasAccess = useMemo(() => {
    // If still loading permissions, don't block the route
    if (loading) return true;
    
    // Check permissions
    if (route.permissions && route.permissions.length > 0) {
      const hasRequiredPermission = route.permissions.some(p => hasPermission(p));
      if (!hasRequiredPermission) {
        return false;
      }
    }
    
    // Check role requirements
    if (route.roleRequired) {
      const hasRequiredRole = hasRole(route.roleRequired);
      if (!hasRequiredRole) {
        return false;
      }
    }
    
    return true;
  }, [route.permissions, route.roleRequired, hasPermission, hasRole, loading]);

  // Show loading state while checking permissions
  if (loading) {
    return <EnhancedLoadingFallback routeName="Permissions" />;
  }

  // Redirect if no access
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * Optimized Router with Dynamic Route Generation and Enhanced Performance
 * 
 * Features:
 * - Eliminates DRY violations by using route configuration
 * - Permission-based route access with optimized checking
 * - Lazy loading for better performance
 * - Centralized route management
 * - Enhanced error boundaries and loading states
 */
const SimplifiedRouter = () => {
  const { loading: authLoading } = useAuth();

  // Memoize route elements for performance with optimized keys
  const publicRouteElements = useMemo(() => 
    PUBLIC_ROUTES.map(route => (
      <Route 
        key={`public-${route.path}`}
        path={route.path} 
        element={
          <PublicRouteGuard>
            <Suspense fallback={<EnhancedLoadingFallback routeName={route.path.replace('/', '') || 'Page'} />}>
              <route.component />
            </Suspense>
          </PublicRouteGuard>
        } 
      />
    )), []);

  const protectedRouteElements = useMemo(() => 
    PROTECTED_ROUTES.map(route => (
      <Route 
        key={`protected-${route.path}`}
        path={route.path} 
        element={
          <RouteGuard>
            <PermissionRoute route={route}>
              <Layout />
            </PermissionRoute>
          </RouteGuard>
        } 
      />
    )), []);

  // Show auth loading state
  if (authLoading) {
    return <EnhancedLoadingFallback routeName="Authentication" />;
  }

  return (
    <Suspense fallback={<EnhancedLoadingFallback routeName="Application" />}>
      <TabProvider>
        <Routes>
          {/* Public Routes */}
          {publicRouteElements}
          
          {/* Protected Routes */}
          {protectedRouteElements}

          {/* 404 Route */}
          <Route 
            path="/404" 
            element={<NotFoundPage />} 
          />

          {/* Default redirect */}
          <Route 
            path="/" 
            element={<Navigate to={DEFAULT_ROUTE} replace />} 
          />

          {/* Catch all - redirect to 404 */}
          <Route 
            path="*" 
            element={<Navigate to="/404" replace />} 
          />
        </Routes>
      </TabProvider>
    </Suspense>
  );
};

export default SimplifiedRouter;