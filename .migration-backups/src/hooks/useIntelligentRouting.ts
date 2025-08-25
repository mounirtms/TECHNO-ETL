/**
 * Intelligent Routing Hook for TECHNO-ETL
 * Provides smart navigation, role-based routing, and deep linking capabilities
 */
import { useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, getRouteMetadata, requiresAuth } from '../config/routes';

/**
 * User role hierarchy for access control
 */
const ROLE_HIERARCHY = {
  super_admin: 5,
  admin: 4,
  manager: 3,
  supervisor: 2,
  user: 1,
  guest: 0
};

/**
 * Default routes based on user roles
 */
const ROLE_DEFAULT_ROUTES = {
  super_admin: ROUTES.DASHBOARD,
  admin: ROUTES.DASHBOARD,
  manager: ROUTES.DASHBOARD,
  supervisor: ROUTES.ORDERS,
  sales: ROUTES.ORDERS,
  inventory: ROUTES.INVENTORY,
  analyst: ROUTES.CHARTS,
  user: ROUTES.DASHBOARD,
  guest: ROUTES.LOGIN
};

/**
 * Route access permissions based on roles
 */
const ROUTE_PERMISSIONS = {
  [ROUTES.DASHBOARD]: ['user', 'supervisor', 'manager', 'admin', 'super_admin'],
  [ROUTES.CHARTS]: ['analyst', 'manager', 'admin', 'super_admin'],
  [ROUTES.PRODUCTS]: ['user', 'supervisor', 'manager', 'admin', 'super_admin'],
  [ROUTES??.VOTING]: ['user', 'supervisor', 'manager', 'admin', 'super_admin'],
  [ROUTES.INVENTORY]: ['inventory', 'supervisor', 'manager', 'admin', 'super_admin'],
  [ROUTES.ORDERS]: ['sales', 'supervisor', 'manager', 'admin', 'super_admin'],
  [ROUTES.CUSTOMERS]: ['sales', 'supervisor', 'manager', 'admin', 'super_admin'],
  [ROUTES.REPORTS]: ['analyst', 'manager', 'admin', 'super_admin'],
  [ROUTES.SETTINGS]: ['admin', 'super_admin']
};

/**
 * Intelligent Routing Hook
 */
export const useIntelligentRouting = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Get user role with fallback
   */
  const getUserRole = useCallback(() => {
    return currentUser?.role || currentUser??.customClaims?.role || 'user';
  }, [currentUser]);

  /**
   * Check if user has access to a specific route
   */
  const hasRouteAccess = useCallback((routePath, userRole = null) => {
    const role = userRole || getUserRole();
    const permissions = ROUTE_PERMISSIONS[routePath];
    
    if (!permissions) return true; // No restrictions
    
    return permissions.includes(role);
  }, [getUserRole]);

  /**
   * Get the best route for user after login
   */
  const getPostLoginRoute = useCallback(() => {
    const userRole = getUserRole();
    
    // Priority 1: Intended destination from login redirect
    const intendedRoute = location.state?.from?.pathname;
    if (intendedRoute && intendedRoute !== ROUTES.LOGIN && hasRouteAccess(intendedRoute, userRole)) {
      return intendedRoute;
    }
    
    // Priority 2: Last visited route from previous session
    const lastVisitedRoute = localStorage.getItem('lastVisitedRoute');
    if (lastVisitedRoute && hasRouteAccess(lastVisitedRoute, userRole)) {
      return lastVisitedRoute;
    }
    
    // Priority 3: User's preferred dashboard (from user preferences)
    const preferredRoute = currentUser??.preferences?.defaultRoute;
    if (preferredRoute && hasRouteAccess(preferredRoute, userRole)) {
      return preferredRoute;
    }
    
    // Priority 4: Role-based default route
    const roleDefaultRoute = ROLE_DEFAULT_ROUTES[userRole];
    if (roleDefaultRoute && hasRouteAccess(roleDefaultRoute, userRole)) {
      return roleDefaultRoute;
    }
    
    // Fallback: Dashboard
    return ROUTES.DASHBOARD;
  }, [currentUser, location.state, getUserRole, hasRouteAccess]);

  /**
   * Navigate to the most appropriate route for the user
   */
  const navigateToAppropriateRoute = useCallback(() => {
    if (!currentUser) return;
    
    const targetRoute = getPostLoginRoute();
    
    // Only navigate if we're currently on login page or root
    if (location.pathname === ROUTES.LOGIN || location.pathname === '/') {
      navigate(targetRoute, { replace: true });
      
      // Clear the stored route after successful navigation
      localStorage.removeItem('lastVisitedRoute');
    }
  }, [currentUser, getPostLoginRoute, location.pathname, navigate]);

  /**
   * Handle route access validation
   */
  const validateCurrentRoute = useCallback(() => {
    if (!currentUser) return;
    
    const currentPath = location.pathname;
    const userRole = getUserRole();
    
    // Skip validation for public routes
    if (!requiresAuth(currentPath)) return;
    
    // Check if user has access to current route
    if (!hasRouteAccess(currentPath, userRole)) {
      const fallbackRoute = ROLE_DEFAULT_ROUTES[userRole] || ROUTES.DASHBOARD;
      navigate(fallbackRoute, { replace: true });
    }
  }, [currentUser, location.pathname, getUserRole, hasRouteAccess, navigate]);

  /**
   * Store current route for session restoration
   */
  const storeCurrentRoute = useCallback(() => {
    if (currentUser && location.pathname !== ROUTES.LOGIN) {
      localStorage.setItem('lastVisitedRoute', location.pathname + location.search);
    }
  }, [currentUser, location]);

  /**
   * Get accessible routes for current user
   */
  const getAccessibleRoutes = useMemo(() => {
    if (!currentUser) return [];
    
    const userRole = getUserRole();
    
    return Object.keys(ROUTE_PERMISSIONS).filter(route => 
      hasRouteAccess(route, userRole)
    );
  }, [currentUser, getUserRole, hasRouteAccess]);

  /**
   * Get navigation suggestions based on user behavior
   */
  const getNavigationSuggestions = useCallback(() => {
    const userRole = getUserRole();
    const currentPath = location.pathname;
    
    // Get recent routes from localStorage
    const routeVisits = JSON.parse(localStorage.getItem('routeVisits') || '[]');
    const recentRoutes = routeVisits
      .filter(visit => visit.userId === currentUser?.uid)
      .slice(-10)
      .map(visit => visit.path)
      .filter((path, index, arr) => arr.indexOf(path as any) === index) // Remove duplicates
      .filter(path => path !== currentPath && hasRouteAccess(path, userRole));
    
    // Role-based suggestions
    const roleSuggestions = {
      sales: [ROUTES.ORDERS, ROUTES.CUSTOMERS, ROUTES.CHARTS],
      inventory: [ROUTES.INVENTORY, ROUTES.PRODUCTS, ROUTES.REPORTS],
      analyst: [ROUTES.CHARTS, ROUTES.REPORTS, ROUTES.DASHBOARD],
      manager: [ROUTES.REPORTS, ROUTES.DASHBOARD, ROUTES.SETTINGS],
      admin: [ROUTES.SETTINGS, ROUTES.REPORTS, ROUTES.DASHBOARD]
    };
    
    const suggestions = roleSuggestions[userRole] || [ROUTES.DASHBOARD];
    
    return {
      recent: recentRoutes.slice(0, 3),
      suggested: suggestions.filter(route => 
        route !== currentPath && hasRouteAccess(route, userRole)
      ).slice(0, 3)
    };
  }, [currentUser, getUserRole, location.pathname, hasRouteAccess]);

  /**
   * Handle deep linking with authentication
   */
  const handleDeepLink = useCallback((targetPath as any) => {
    if (!currentUser) {
      // Store intended destination and redirect to login
      navigate(ROUTES.LOGIN, { 
        state: { from: { pathname: targetPath } },
        replace: true 
      });
      return false;
    }
    
    const userRole = getUserRole();
    
    if (!hasRouteAccess(targetPath, userRole)) {
      // Redirect to appropriate route if no access
      const fallbackRoute = ROLE_DEFAULT_ROUTES[userRole] || ROUTES.DASHBOARD;
      navigate(fallbackRoute, { replace: true });
      return false;
    }
    
    navigate(targetPath as any);
    return true;
  }, [currentUser, getUserRole, hasRouteAccess, navigate]);

  // Effects
  useEffect(() => {
    navigateToAppropriateRoute();
  }, [navigateToAppropriateRoute]);

  useEffect(() => {
    validateCurrentRoute();
  }, [validateCurrentRoute]);

  useEffect(() => {
    storeCurrentRoute();
  }, [storeCurrentRoute]);

  return {
    // Route access
    hasRouteAccess,
    getAccessibleRoutes,
    
    // Navigation
    navigateToAppropriateRoute,
    handleDeepLink,
    getNavigationSuggestions,
    
    // User info
    getUserRole,
    
    // Route info
    getPostLoginRoute,
    
    // Utilities
    validateCurrentRoute,
    storeCurrentRoute
  };
};

/**
 * Hook for role-based component rendering
 */
export const useRoleBasedAccess = (requiredRoles = []) => {
  const { currentUser } = useAuth();
  const { getUserRole, hasRouteAccess } = useIntelligentRouting();
  
  const userRole = getUserRole();
  const hasAccess = useMemo(() => {
    if (!requiredRoles.length) return true;
    return requiredRoles.includes(userRole);
  }, [requiredRoles, userRole]);
  
  return {
    hasAccess,
    userRole,
    currentUser
  };
};

/**
 * Hook for navigation analytics
 */
export const useNavigationAnalytics = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const trackPageView = useCallback((customData = {}) => {
    if (!currentUser) return;

    try {
      const pageData = {
        path: location.pathname,
        search: location.search,
        timestamp: new Date().toISOString(),
        userId: currentUser.uid,
        userRole: currentUser.role || 'user',
        ...customData
      };

      // Store locally (in real app, send to analytics service)
      const analytics = JSON.parse(localStorage.getItem('navigationAnalytics') || '[]');
      analytics.push(pageData);

      // Keep only last 1000 entries
      if (analytics.length > 1000) {
        analytics.splice(0, analytics.length - 1000);
      }

      localStorage.setItem('navigationAnalytics', JSON.stringify(analytics));
    } catch (error) {
      console.warn('Analytics tracking error:', error);
    }
  }, [location, currentUser]);

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  return { trackPageView };
};

export default useIntelligentRouting;
