/**
 * Enhanced Navigation Hook
 * Provides unified navigation state management with React Router integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, ROUTE_METADATA, NAVIGATION_ITEMS } from '../config/routes';

/**
 * Custom hook for navigation state management
 */
export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [navigationState, setNavigationState] = useState({
    currentRoute: location.pathname,
    previousRoute: null,
    breadcrumbs: [],
    activeMenuItem: null,
    navigationHistory: []
  });

  // Update navigation state when location changes
  useEffect(() => {
    const currentPath = location.pathname;
    const routeMetadata = ROUTE_METADATA[currentPath];
    
    // Find active menu item
    const activeItem = NAVIGATION_ITEMS.find(item => item.path === currentPath);
    
    // Generate breadcrumbs
    const breadcrumbs = generateBreadcrumbs(currentPath);
    
    setNavigationState(prev => ({
      ...prev,
      previousRoute: prev.currentRoute,
      currentRoute: currentPath,
      activeMenuItem: activeItem,
      breadcrumbs,
      navigationHistory: [
        ...prev.navigationHistory.slice(-9), // Keep last 10 items
        {
          path: currentPath,
          timestamp: Date.now(),
          metadata: routeMetadata
        }
      ]
    }));
  }, [location.pathname]);

  // Navigate to a specific route
  const navigateTo = useCallback((path, options = {}) => {
    const { replace = false, state = null } = options;
    
    if (replace) {
      navigate(path, { replace: true, state });
    } else {
      navigate(path, { state });
    }
  }, [navigate]);

  // Navigate back
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Navigate forward
  const goForward = useCallback(() => {
    navigate(1);
  }, [navigate]);

  // Check if route is active
  const isRouteActive = useCallback((path) => {
    return location.pathname === path;
  }, [location.pathname]);

  // Check if route is accessible
  const isRouteAccessible = useCallback((path) => {
    const metadata = ROUTE_METADATA[path];
    return metadata && metadata.requiresAuth !== false;
  }, []);

  // Get route metadata
  const getRouteMetadata = useCallback((path) => {
    return ROUTE_METADATA[path] || null;
  }, []);

  // Get navigation menu items with active state
  const getMenuItems = useCallback(() => {
    return NAVIGATION_ITEMS.map(item => ({
      ...item,
      isActive: isRouteActive(item.path),
      isAccessible: isRouteAccessible(item.path),
      metadata: getRouteMetadata(item.path)
    }));
  }, [isRouteActive, isRouteAccessible, getRouteMetadata]);

  return {
    // Current state
    currentRoute: navigationState.currentRoute,
    previousRoute: navigationState.previousRoute,
    activeMenuItem: navigationState.activeMenuItem,
    breadcrumbs: navigationState.breadcrumbs,
    navigationHistory: navigationState.navigationHistory,
    
    // Navigation actions
    navigateTo,
    goBack,
    goForward,
    
    // Utility functions
    isRouteActive,
    isRouteAccessible,
    getRouteMetadata,
    getMenuItems,
    
    // Route constants
    ROUTES,
    NAVIGATION_ITEMS
  };
};

/**
 * Generate breadcrumbs for a given path
 */
function generateBreadcrumbs(path) {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  // Always start with Dashboard
  if (path !== '/dashboard') {
    breadcrumbs.push({
      label: 'Dashboard',
      path: '/dashboard',
      isActive: false
    });
  }
  
  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const metadata = ROUTE_METADATA[currentPath];
    const isLast = index === segments.length - 1;
    
    if (metadata) {
      breadcrumbs.push({
        label: metadata.breadcrumb || metadata.title || segment,
        path: currentPath,
        isActive: isLast
      });
    } else {
      // Handle dynamic segments
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath,
        isActive: isLast
      });
    }
  });
  
  return breadcrumbs;
}

/**
 * Hook for menu state management
 */
export const useMenuState = () => {
  const [menuState, setMenuState] = useState({
    isOpen: false,
    activeSubmenu: null,
    hoveredItem: null
  });

  const openMenu = useCallback(() => {
    setMenuState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const closeMenu = useCallback(() => {
    setMenuState(prev => ({ ...prev, isOpen: false, activeSubmenu: null }));
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const setActiveSubmenu = useCallback((submenu) => {
    setMenuState(prev => ({ ...prev, activeSubmenu: submenu }));
  }, []);

  const setHoveredItem = useCallback((item) => {
    setMenuState(prev => ({ ...prev, hoveredItem: item }));
  }, []);

  return {
    ...menuState,
    openMenu,
    closeMenu,
    toggleMenu,
    setActiveSubmenu,
    setHoveredItem
  };
};

/**
 * Hook for breadcrumb navigation
 */
export const useBreadcrumbs = () => {
  const { breadcrumbs, navigateTo } = useNavigation();

  const navigateToBreadcrumb = useCallback((breadcrumb) => {
    if (breadcrumb.path && !breadcrumb.isActive) {
      navigateTo(breadcrumb.path);
    }
  }, [navigateTo]);

  return {
    breadcrumbs,
    navigateToBreadcrumb
  };
};

/**
 * Hook for navigation performance tracking
 */
export const useNavigationPerformance = () => {
  const [performanceData, setPerformanceData] = useState({
    navigationTimes: [],
    averageNavigationTime: 0,
    slowNavigations: []
  });

  const location = useLocation();

  useEffect(() => {
    const startTime = performance.now();

    const handleNavigationComplete = () => {
      const endTime = performance.now();
      const navigationTime = endTime - startTime;

      setPerformanceData(prev => {
        const newTimes = [...prev.navigationTimes, navigationTime].slice(-20); // Keep last 20
        const average = newTimes.reduce((sum, time) => sum + time, 0) / newTimes.length;
        const slowNavs = navigationTime > 1000 ? 
          [...prev.slowNavigations, { path: location.pathname, time: navigationTime }].slice(-10) :
          prev.slowNavigations;

        return {
          navigationTimes: newTimes,
          averageNavigationTime: average,
          slowNavigations: slowNavs
        };
      });

      if (navigationTime > 1000) {
        console.warn(`🐌 Slow navigation detected: ${location.pathname} took ${navigationTime.toFixed(2)}ms`);
      }
    };

    // Use requestAnimationFrame to measure after render
    const timeoutId = setTimeout(handleNavigationComplete, 0);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return performanceData;
};

export default useNavigation;
