/**
 * Optimized Router for TECHNO-ETL
 * Fixes routing issues and improves navigation performance
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import React, { Suspense, lazy, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import {
  useRoutePreloader,
  OptimizedLoadingFallback,
  RoutePerformanceMonitor,
  useMemoryAwareRouting
} from './RouteOptimizations';
import { usePerformanceMonitor, optimizeMemory } from '../utils/performanceOptimizations';

// Loading component
const LoadingFallback: React.FC<{ routeName?: string }> = ({ routeName = 'page' }) => (
  <Box
    sx={{
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      gap: 2,
    } as any}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading {routeName}...
    </Typography>
  </Box>
);

// Error boundary component
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route error:', error, errorInfo);
  }

  override render() {
    if(this.state.hasError) {
      return (
        <Box
          sx={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            p: 3,
            textAlign: 'center',
          } as any}
        >
          <Alert severity="error" sx={{ maxWidth: 600 } as any}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2">
              Please refresh the page or try again later.
            </Typography>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Route guard component
interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRoles?: string[];
  redirectTo?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth
  requireRoles
  redirectTo
}) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if(requireAuth && !currentUser) {
      // Store intended destination
      const intendedPath = location.pathname + location.search;
      localStorage.setItem('intendedPath', intendedPath);
      navigate(redirectTo, { replace: true });
      return;
    }

    if(requireRoles.length > 0 && currentUser) {
      const userRoles = Array.isArray(currentUser?.roles) ? currentUser?.roles : [currentUser.role].filter(Boolean);
      const hasRequiredRole = requireRoles.some(role => userRoles.includes(role));
      
      if(!hasRequiredRole) {
        navigate('/unauthorized', { replace: true });
        return;
      }
    }
  }, [currentUser, loading, requireAuth, requireRoles, navigate, location, redirectTo]);

  if(loading) {
    return <LoadingFallback routeName="Authentication" />;
  }

  if(requireAuth && !currentUser) {
    return null; // Navigation will happen in useEffect
  }

  return <>{children}</>;
};

// Lazy loaded components with better error handling
const lazyWithErrorBoundary = (importFunc: () => Promise<{ default: React.ComponentType<any> }>, name: string) => {
  return lazy(() =>
    importFunc().catch((error) => {
      console.error(`Failed to load ${name}:`, error);
      return {
        default: () => (
          <Alert severity="error">
            Failed to load {name}. Please refresh the page.
          </Alert>
        ),
      };
    })
  );
};

// Lazy loaded components
const Layout = lazyWithErrorBoundary(() => import('../components/Layout/Layout'), 'Layout');
const Login = lazyWithErrorBoundary(() => import('../pages/Login'), 'Login');
const Dashboard = lazyWithErrorBoundary(() => import('../pages/Dashboard'), 'Dashboard');
const ChartsPage = lazyWithErrorBoundary(() => import('../pages/ChartsPage'), 'Charts');
const ProductManagementPage = lazyWithErrorBoundary(() => import('../pages/ProductManagementPage'), 'Product Management');
const VotingPage = lazyWithErrorBoundary(() => import('../pages/VotingPage'), 'Voting');
const InventoryPage = lazyWithErrorBoundary(() => import('../pages/InventoryPage'), 'Inventory');
const OrdersPage = lazyWithErrorBoundary(() => import('../pages/OrdersPage'), 'Orders');
const CustomersPage = lazyWithErrorBoundary(() => import('../pages/CustomersPage'), 'Customers');
const SettingsPage = lazyWithErrorBoundary(() => import('../pages/SettingsPage'), 'Settings');
const ReportsPage = lazyWithErrorBoundary(() => import('../pages/ReportsPage'), 'Reports');
const AnalyticsPage = lazyWithErrorBoundary(() => import('../pages/AnalyticsPage'), 'Analytics');
const DataGridsPage = lazyWithErrorBoundary(() => import('../pages/DataGridsPage'), 'Data Grids');
const NotFoundPage = lazyWithErrorBoundary(() => import('../pages/NotFoundPage'), 'Not Found');
const OptimizedUserProfile = lazyWithErrorBoundary(() => import('../components/UserProfile'), 'User Profile');

// Development only
const GridTestPage = process.env.NODE_ENV === 'development' 
  ? lazyWithErrorBoundary(() => import('../pages/GridTestPage'), 'Grid Test')
  : null;

// Route definitions
interface RouteDefinition {
  path: string;
  component: React.ComponentType<any>;
  requireAuth?: boolean;
  requireRoles?: string[];
  exact?: boolean;
  title: string;
}

const ROUTES: RouteDefinition[] = [
  // Public routes
  { path: '/login', component: Login, requireAuth: false, title: 'Login' },
  
  // Protected routes
  { path: 'dashboard', component: Dashboard, title: 'Dashboard' },
  { path: 'charts', component: ChartsPage, title: 'Charts' },
  { path: 'products/*', component: ProductManagementPage, title: 'Products' },
  { path: 'voting', component: VotingPage, title: 'Voting' },
  { path: 'analytics', component: AnalyticsPage, title: 'Analytics' },
  { path: 'data-grids', component: DataGridsPage, title: 'Data Management' },
  { path: 'profile', component: OptimizedUserProfile, title: 'User Profile' },
  
  // Manager+ routes
  { path: 'inventory', component: InventoryPage, requireRoles: ['admin', 'manager'], title: 'Inventory' },
  { path: 'orders', component: OrdersPage, title: 'Orders' },
  { path: 'customers', component: CustomersPage, title: 'Customers' },
  { path: 'reports', component: ReportsPage, requireRoles: ['admin', 'manager'], title: 'Reports' },
  
  // Admin only routes
  { path: 'settings', component: SettingsPage, requireRoles: ['admin'], title: 'Settings' },
];

// Add development routes
if(GridTestPage && process.env.NODE_ENV === 'development') {
  ROUTES.push({ path: 'grid-test', component: GridTestPage, title: 'Grid Test' });
}

// Post-login redirect handler
const PostLoginHandler: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) return;

    // Get intended destination
    const intendedPath = localStorage.getItem('intendedPath') || '/dashboard';
    localStorage.removeItem('intendedPath');

    // Only redirect if we're on login page
    if(location.pathname === '/login') {
      navigate(intendedPath, { replace: true });
    }
  }, [currentUser, navigate, location]);

  return null;
};

// Main router component
const OptimizedRouter: React.FC = () => {
  const location = useLocation();

  // Update document title based on route
  useEffect(() => {
    const currentRoute = ROUTES.find(route => {
      if (route.path.includes('*')) {
        const basePath = route.path.replace('/*', '');
        return location.pathname.startsWith(basePath);
      }
      return route.path ===location.pathname || (route.path === '/' && location.pathname === '/');
    });

    if(currentRoute) {
      document.title = `${currentRoute.title} | TECHNO-ETL`;
    }
  }, [location]);

  // Memoized route elements for performance
  const protectedRoutes = useMemo(() => 
    ROUTES.filter((route: any: any) => route.requireAuth !== false).map((route: any: any) => {
      const RouteComponent = route.component;
      return (
        <Route
          key={route.path}
          path={route.path}
          element
            <RouteGuard requireRoles={route.requireRoles}>
              <Suspense fallback={<LoadingFallback routeName={route.title} />}>
                <RouteComponent />
              </Suspense>
            </RouteGuard>
          }
        />
      );
    }), []);

  const publicRoutes = useMemo(() =>
    ROUTES.filter((route: any: any) => route.requireAuth ===false).map((route: any: any) => {
      const RouteComponent = route.component;
      return (
        <Route
          key={route.path}
          path={route.path}
          element
            <Suspense fallback={<LoadingFallback routeName={route.title} />}>
              <RouteComponent />
            </Suspense>
          }
        />
      );
    }), []);

  return (
    <RouteErrorBoundary>
      <PostLoginHandler />
      <Routes>
        {/* Public routes */}
        {publicRoutes}

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected routes wrapped in Layout */}
        <Route
          path
              <Suspense fallback={<LoadingFallback routeName="Layout" />}>
                <Layout />
              </Suspense>
            </RouteGuard>
          }
        >
          {protectedRoutes}
          
          {/* Special routes */}
          <Route 
            path
            } 
          />
          <Route
            path
              <Suspense fallback={<LoadingFallback routeName="Page" />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>

        {/* Catch-all for unauthenticated users */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </RouteErrorBoundary>
  );
};

export default OptimizedRouter;
