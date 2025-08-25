/**
 * Enhanced Route Guard System for TECHNO-ETL
 * Provides comprehensive route protection, role-based access, and intelligent redirects
 */
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, requiresAuth, getRouteMetadata } from '../config/routes';

/**
 * Loading component for route transitions
 */
const RouteLoading = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 2
    } as any}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

/**
 * Enhanced Route Guard with role-based access control
 */
export const RouteGuard: React.FC<any> = ({ children, requiredRole = null, fallbackPath = ROUTES.DASHBOARD }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      setAuthLoading(true);
      
      // Wait for auth to complete
      if (loading) return;
      
      // Check if route requires authentication
      const routeRequiresAuth = requiresAuth(location.pathname);
      
      if (!routeRequiresAuth) {
        setIsAuthorized(true);
        setAuthLoading(false);
        return;
      }
      
      // Check if user is authenticated
      if (!currentUser) {
        setIsAuthorized(false);
        setAuthLoading(false);
        return;
      }
      
      // Check role-based access if required
      if (requiredRole) {
        const userRole = currentUser.role || 'user';
        const hasRequiredRole = Array.isArray(requiredRole) 
          ? requiredRole?.includes(userRole)
          : userRole === requiredRole;
        
        setIsAuthorized(hasRequiredRole);
      } else {
        setIsAuthorized(true);
      }
      
      setAuthLoading(false);
    };

    checkAuthorization();
  }, [currentUser, loading, location.pathname, requiredRole]);

  // Show loading while checking authorization
  if (loading || authLoading) {
    return <RouteLoading message="Checking permissions..." />;
  }

  // Redirect to login if not authenticated
  if (requiresAuth(location.pathname) && !currentUser) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Redirect if not authorized for this route
  if (!isAuthorized && currentUser) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

/**
 * Public Route Guard - redirects authenticated users
 */
export const PublicRouteGuard: React.FC<any> = ({ children, redirectTo = ROUTES.DASHBOARD }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoading message="Checking authentication..." />;
  }

  // Redirect authenticated users away from public routes
  if (currentUser) {
    const intendedDestination = location.state?.from?.pathname || redirectTo;
    return <Navigate to={intendedDestination} replace />;
  }

  return children;
};

/**
 * Admin Route Guard - requires admin role
 */
export const AdminRouteGuard: React.FC<any> = ({ children }) => {
  return (
    <RouteGuard requiredRole={['admin', 'super_admin']} fallbackPath={ROUTES.DASHBOARD}>
      {children}
    </RouteGuard>
  );
};

/**
 * Manager Route Guard - requires manager or admin role
 */
export const ManagerRouteGuard: React.FC<any> = ({ children }) => {
  return (
    <RouteGuard requiredRole={['manager', 'admin', 'super_admin']} fallbackPath={ROUTES.DASHBOARD}>
      {children}
    </RouteGuard>
  );
};

/**
 * Route Metadata Provider - provides route information to components
 */
export const RouteMetadataProvider: React.FC<any> = ({ children }) => {
  const location = useLocation();
  const metadata = getRouteMetadata(location.pathname);

  // Add route metadata to document
  useEffect(() => {
    document.title = `${metadata.title} - TECHNO-ETL`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', metadata.description);
    }
  }, [metadata]);

  return children;
};

/**
 * Route Transition Wrapper - handles smooth transitions between routes
 */
export const RouteTransition: React.FC<any> = ({ children, transitionKey }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 150);
    return () => clearTimeout(timer);
  }, [transitionKey]);

  return (
    <Box
      sx={{
        opacity: isTransitioning ? 0.7 : 1,
        transition: 'opacity 0.15s ease-in-out',
        minHeight: '100%'
      } as any}
    >
      {children}
    </Box>
  );
};

/**
 * Deep Link Handler - handles deep linking and route restoration
 */
export const DeepLinkHandler = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) {
      // Store the current route for restoration after logout/login
      localStorage.setItem('lastVisitedRoute', location.pathname + location.search);
    }
  }, [currentUser, location]);

  return null;
};

/**
 * Route Analytics - tracks route visits for analytics
 */
export const RouteAnalytics = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && location.pathname !== ROUTES.LOGIN) {
      // Track route visit
      const routeData = {
        path: location.pathname,
        timestamp: new Date().toISOString(),
        userId: currentUser.uid,
        userAgent: navigator.userAgent
      };

      // Store in localStorage for now (can be sent to analytics service)
      const visits = JSON.parse(localStorage.getItem('routeVisits') || '[]');
      visits.push(routeData);
      
      // Keep only last 100 visits
      if (visits.length > 100) {
        visits.splice(0, visits.length - 100);
      }
      
      localStorage.setItem('routeVisits', JSON.stringify(visits));
    }
  }, [location, currentUser]);

  return null;
};

export default RouteGuard;
