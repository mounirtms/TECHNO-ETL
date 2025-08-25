/**
 * Router Optimizations for TECHNO-ETL
 * Advanced route optimization, preloading, and performance enhancements
 */

import React, { Suspense, useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { usePerformanceMonitor, preloadResources, globalCache } from '../utils/performanceOptimizations';

/**
 * Smart route preloader
 */
export const useRoutePreloader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Preload likely next routes based on current route
  const getNextRoutes = useCallback((currentPath: string) => {
    const routeMap: Record<string, string[]> = {
      '/dashboard': ['/charts', '/products', '/orders'],
      '/charts': ['/dashboard', '/analytics'],
      '/products': ['/dashboard', '/orders', '/inventory'],
      '/orders': ['/products', '/customers', '/dashboard'],
      '/customers': ['/orders', '/dashboard'],
      '/inventory': ['/products', '/dashboard'],
      '/settings': ['/dashboard']
    };
    
    return routeMap[currentPath] || [];
  }, []);

  useEffect(() => {
    const nextRoutes = getNextRoutes(location.pathname);
    
    // Preload components for likely next routes
    const preloadTimeout = setTimeout(() => {
      nextRoutes.forEach(route => {
        const componentPath = getComponentPath(route);
        if (componentPath) {
          import(componentPath).catch(err => 
            console.log('Route preload failed (non-critical):', route, err.message)
          );
        }
      });
    }, 2000); // Preload after 2 seconds

    return () => clearTimeout(preloadTimeout);
  }, [location.pathname, getNextRoutes]);

  return { currentPath: location.pathname };
};

/**
 * Get component path for dynamic imports
 */
const getComponentPath = (route: string): string | null => {
  const componentMap: Record<string, string> = {
    '/dashboard': '../pages/Dashboard',
    '/charts': '../pages/ChartsPage',
    '/products': '../pages/ProductManagementPage',
    '/orders': '../pages/OrdersPage',
    '/customers': '../pages/CustomersPage',
    '/inventory': '../pages/InventoryPage',
    '/analytics': '../pages/AnalyticsPage',
    '/settings': '../pages/SettingsPage'
  };
  
  return componentMap[route] || null;
};

/**
 * Enhanced loading fallback with performance monitoring
 */
export const OptimizedLoadingFallback: React.FC<{ 
  routeName?: string;
  showProgress?: boolean;
  timeout?: number;
}> = ({ 
  routeName = 'page', 
  showProgress = true,
  timeout = 10000 
}) => {
  usePerformanceMonitor(`Loading-${routeName}`);
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (showTimeout) {
    return (
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
        <Alert severity="warning">
          Loading is taking longer than expected...
        </Alert>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading {routeName}...
        </Typography>
      </Box>
    );
  }

  return (
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
      {showProgress && <CircularProgress size={40} />}
      <Typography variant="body2" color="text.secondary">
        Loading {routeName}...
      </Typography>
    </Box>
  );
};

/**
 * Route caching wrapper
 */
export const CachedRoute: React.FC<{
  children: React.ReactNode;
  routeKey: string;
  cacheTTL?: number;
}> = ({ children, routeKey, cacheTTL = 5 * 60 * 1000 }) => {
  const [cachedContent, setCachedContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    // Try to get cached content
    const cached = globalCache.get(`route-${routeKey}`);
    if (cached) {
      setCachedContent(cached);
    }
  }, [routeKey]);

  useEffect(() => {
    // Cache the content after it loads
    if (children && !cachedContent) {
      globalCache.set(`route-${routeKey}`, children, cacheTTL);
      setCachedContent(children);
    }
  }, [children, routeKey, cacheTTL, cachedContent]);

  return <>{cachedContent || children}</>;
};

/**
 * Smart prefetch hook
 */
export const usePrefetch = () => {
  const prefetchRoute = useCallback((routePath: string) => {
    const componentPath = getComponentPath(routePath);
    if (componentPath) {
      // Prefetch the component
      import(componentPath)
        .then(() => {
          console.log(`✅ Prefetched route: ${routePath}`);
        })
        .catch(err => {
          console.log(`⚠️ Prefetch failed for ${routePath}:`, err.message);
        });
    }
  }, []);

  const prefetchResources = useCallback((resources: string[]) => {
    preloadResources(resources)
      .then(() => {
        console.log('✅ Resources prefetched successfully');
      })
      .catch(err => {
        console.log('⚠️ Resource prefetch failed:', err.message);
      });
  }, []);

  return { prefetchRoute, prefetchResources };
};

/**
 * Route transition wrapper
 */
export const RouteTransition: React.FC<{
  children: React.ReactNode;
  transitionKey: string;
  duration?: number;
}> = ({ children, transitionKey, duration = 300 }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentKey, setCurrentKey] = useState(transitionKey);

  useEffect(() => {
    if (transitionKey !== currentKey) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setCurrentKey(transitionKey);
        setIsTransitioning(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [transitionKey, currentKey, duration]);

  return (
    <Box
      sx={{
        opacity: isTransitioning ? 0.7 : 1,
        transition: `opacity ${duration}ms ease-in-out`,
        minHeight: '100vh'
      }}
    >
      {children}
    </Box>
  );
};

/**
 * Route analytics hook
 */
export const useRouteAnalytics = () => {
  const location = useLocation();
  const startTime = React.useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      const duration = Date.now() - startTime.current;
      
      // Log route timing
      console.log(`📊 Route timing for ${location.pathname}: ${duration}ms`);
      
      // Send to analytics if available
      if (window?..gtag) {
        window?..gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: location.pathname,
          custom_map: {
            load_time: duration
          }
        });
      }
      
      // Store in cache for performance monitoring
      globalCache.set(`route-timing-${location.pathname}`, duration, 60000);
    };
  }, [location.pathname]);

  return { pathname: location.pathname, startTime: startTime.current };
};

/**
 * Bundle splitting utility
 */
export const createSplitComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(importFn);
  
  return React.forwardRef<any, any>((props, ref) => (
    <Suspense fallback={fallback || <OptimizedLoadingFallback />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

/**
 * Route performance monitoring
 */
export const RoutePerformanceMonitor: React.FC<{
  children: React.ReactNode;
  routeName: string;
}> = ({ children, routeName }) => {
  usePerformanceMonitor(routeName);
  useRouteAnalytics();
  
  return <>{children}</>;
};

/**
 * Memory-aware route management
 */
export const useMemoryAwareRouting = () => {
  const navigate = useNavigate();

  const navigateWithCleanup = useCallback((to: string, options? as any) => {
    // Clear cache if memory usage is high
    if (globalCache.size() > 50) {
      console.log('🧹 Clearing route cache due to memory pressure');
      // Clear only route-specific caches, keep others
      const allKeys = globalCache.getStats().keys;
      allKeys.forEach(key => {
        if (typeof key === 'string' && key.startsWith('route-')) {
          globalCache.delete(key);
        }
      });
    }

    navigate(to, options);
  }, [navigate]);

  return { navigateWithCleanup };
};

export default {
  useRoutePreloader,
  OptimizedLoadingFallback,
  CachedRoute,
  usePrefetch,
  RouteTransition,
  useRouteAnalytics,
  createSplitComponent,
  RoutePerformanceMonitor,
  useMemoryAwareRouting
};
