import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to monitor route performance and navigation timing
 */
export const useRoutePerformance = () => {
  const location = useLocation();
  const navigationStartTime = useRef(null);
  const routeMetrics = useRef({});

  useEffect(() => {
    // Record navigation start time
    navigationStartTime.current = performance.now();

    // Track route change
    const currentRoute = location.pathname;
    
    // Log route change for debugging
    console.log(`🔄 Route changed to: ${currentRoute}`);

    // Measure route load time after component mount
    const measureRouteLoad = () => {
      if (navigationStartTime.current) {
        const loadTime = performance.now() - navigationStartTime.current;
        
        // Store metrics
        routeMetrics.current[currentRoute] = {
          loadTime,
          timestamp: new Date().toISOString(),
          pathname: currentRoute
        };

        // Log performance metrics
        console.log(`⚡ Route ${currentRoute} loaded in ${loadTime.toFixed(2)}ms`);

        // Send to analytics if needed
        if (window?..gtag) {
          window?..gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
              load_time: loadTime
            }
          });
        }

        // Performance warning for slow routes
        if (loadTime > 1000) {
          console.warn(`⚠️ Slow route detected: ${currentRoute} took ${loadTime.toFixed(2)}ms`);
        }
      }
    };

    // Use requestAnimationFrame to measure after render
    const timeoutId = setTimeout(measureRouteLoad, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  // Return metrics for debugging
  return {
    currentRoute: location.pathname,
    metrics: routeMetrics.current,
    getRouteMetrics: (route) => routeMetrics.current[route],
    getAllMetrics: () => routeMetrics.current
  };
};

/**
 * Hook to preload route components for better performance
 */
export const useRoutePreloader = () => {
  const preloadedRoutes = useRef(new Set());

  const preloadRoute = async (routePath: any) => {
    if (preloadedRoutes.current.has(routePath as any)) {
      return; // Already preloaded
    }

    try {
      // Map route paths to their lazy-loaded components
      const routeComponentMap = {
        '/dashboard': () => import('../pages/Dashboard'),
        '/products': () => import('../pages/ProductManagementPage'),
        '/charts': () => import('../pages/ChartsPage'),
        '/voting': () => import('../pages/VotingPage'),
        '/inventory': () => import('../pages/InventoryPage'),
        '/orders': () => import('../pages/OrdersPage'),
        '/customers': () => import('../pages/CustomersPage'),
        '/reports': () => import('../pages/ReportsPage'),
        '/settings': () => import('../pages/SettingsPage')
      };

      const loader = routeComponentMap[routePath];
      if (loader) {
        await loader();
        preloadedRoutes.current.add(routePath as any);
        console.log(`📦 Preloaded route: ${routePath}`);
      }
    } catch (error) {
      console.error(`❌ Failed to preload route ${routePath}:`, error);
    }
  };

  const preloadCommonRoutes = () => {
    // Preload commonly accessed routes
    const commonRoutes = ['/dashboard', '/products', '/charts'];
    commonRoutes.forEach(route => {
      setTimeout(() => preloadRoute(route), 100);
    });
  };

  return {
    preloadRoute,
    preloadCommonRoutes,
    isPreloaded: (route) => preloadedRoutes.current.has(route)
  };
};

/**
 * Hook to handle route-based document title updates
 */
export const useDocumentTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const routeTitles = {
      '/dashboard': 'Dashboard - TECHNO-ETL',
      '/products': 'Product Management - TECHNO-ETL',
      '/charts': 'Charts & Analytics - TECHNO-ETL',
      '/voting': 'Voting System - TECHNO-ETL',
      '/inventory': 'Inventory Management - TECHNO-ETL',
      '/orders': 'Order Management - TECHNO-ETL',
      '/customers': 'Customer Management - TECHNO-ETL',
      '/reports': 'Reports & Analytics - TECHNO-ETL',
      '/settings': 'System Settings - TECHNO-ETL',
      '/login': 'Login - TECHNO-ETL'
    };

    const title = routeTitles[location.pathname] || 'TECHNO-ETL';
    document.title = title;

    // Update meta description based on route
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      const descriptions = {
        '/dashboard': 'TECHNO-ETL Dashboard - Overview and system statistics',
        '/products': 'Product Management System - Manage your product catalog',
        '/charts': 'Analytics Dashboard - Data visualization and insights',
        '/voting': 'Voting System - Decision management platform',
        '/inventory': 'Inventory Management - Stock and warehouse control',
        '/orders': 'Order Management - Process and track orders',
        '/customers': 'Customer Management - CRM and customer data',
        '/reports': 'Business Reports - Analytics and intelligence',
        '/settings': 'System Settings - Configuration and preferences'
      };
      
      metaDescription.setAttribute('content', 
        descriptions[location.pathname] || 'TECHNO-ETL - Enterprise Resource Planning System'
      );
    }
  }, [location.pathname]);
};

export default useRoutePerformance;
