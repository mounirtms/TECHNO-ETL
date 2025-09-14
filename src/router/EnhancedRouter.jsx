/**
 * Enhanced Router System for TECHNO-ETL
 * Provides intelligent routing, post-login redirects, and role-based navigation
 */
import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../config/routes';
import {
  RouteGuard,
  PublicRouteGuard,
  AdminRouteGuard,
  ManagerRouteGuard,
  RouteMetadataProvider,
  RouteTransition,
  DeepLinkHandler,
  RouteAnalytics
} from './RouteGuard';

// Lazy Load Components with optimized chunking and preloading
const Layout = lazy(() => import('../components/Layout/Layout'));
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ChartsPage = lazy(() => import('../pages/ChartsPage'));
const ProductManagementPage = lazy(() => import('../pages/ProductManagementPage'));
const TaskPage = lazy(() => import('../pages/VotingPage'));
const InventoryPage = lazy(() => import('../pages/InventoryPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const CustomersPage = lazy(() => import('../pages/CustomersPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Grid Test Page for development
const GridTestPage = lazy(() => import('../pages/GridTestPage'));
const DataGridsPage = lazy(() => import('../pages/DataGridsPage'));

// Preload important routes for better performance
const preloadRoute = (importPromise) => {
  importPromise.catch(err => {
    console.warn('Route preload failed:', err);
  });
};

/**
 * Enhanced Loading Fallback with route information
 */
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

/**
 * Intelligent Post-Login Router
 * Handles smart redirects after authentication
 */
const PostLoginRouter = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) {
      // Get intended destination from various sources
      const intendedRoute = 
        location.state?.from?.pathname || // From login redirect
        localStorage.getItem('lastVisitedRoute') || // From previous session
        getDefaultRouteForUser(currentUser) || // Based on user role
        ROUTES.DASHBOARD; // Fallback

      // Clean up stored route
      localStorage.removeItem('lastVisitedRoute');

      // Navigate to intended destination
      if (location.pathname === ROUTES.LOGIN) {
        navigate(intendedRoute, { replace: true });
      }
    }
  }, [currentUser, navigate, location]);

  return null;
};

/**
 * Get default route based on user role and preferences
 */
const getDefaultRouteForUser = (user) => {
  if (!user) return ROUTES.DASHBOARD;

  // Role-based default routes
  const roleDefaults = {
    admin: ROUTES.DASHBOARD,
    manager: ROUTES.DASHBOARD,
    sales: ROUTES.ORDERS,
    inventory: ROUTES.INVENTORY,
    analyst: ROUTES.CHARTS,
    user: ROUTES.DASHBOARD
  };

  const userRole = user.role || 'user';
  return roleDefaults[userRole] || ROUTES.DASHBOARD;
};

/**
 * Route Error Boundary with enhanced error handling
 */
class EnhancedRouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route Error:', error, errorInfo);
    this.setState({ errorInfo });

    // Log error to analytics service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            flexDirection: 'column',
            gap: 2,
            p: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We encountered an unexpected error while loading this page.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                padding: '8px 16px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Dashboard
            </button>
          </Box>
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxWidth: 600 }}>
              <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {this.state.error && this.state.error.toString()}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * Main Enhanced Router Component
 */
const EnhancedRouter = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Preload critical routes based on user role
  useEffect(() => {
    // Preload dashboard and core pages
    preloadRoute(import('../pages/Dashboard'));
    preloadRoute(import('../components/Layout/Layout'));
    
    // Preload based on user role
    if (currentUser) {
      if (currentUser.role === 'admin') {
        preloadRoute(import('../pages/SettingsPage'));
      }
      if (['manager', 'admin'].includes(currentUser.role)) {
        preloadRoute(import('../pages/ReportsPage'));
        preloadRoute(import('../pages/InventoryPage'));
      }
    }
  }, [currentUser]);

  // Memoize route components for better performance
  const routeComponents = useMemo(() => ({
    dashboard: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Dashboard" />}>
        <Dashboard />
      </Suspense>
    ),
    charts: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Analytics" />}>
        <ChartsPage />
      </Suspense>
    ),
    products: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Product Management" />}>
        <ProductManagementPage />
      </Suspense>
    ),
    tasks: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Task Management" />}>
        <TaskPage />
      </Suspense>
    ),
    analytics: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Looker Studio Analytics" />}>
        <AnalyticsPage />
      </Suspense>
    ),
    dataGrids: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Data Management" />}>
        <DataGridsPage />
      </Suspense>
    ),
    inventory: (
      <ManagerRouteGuard>
        <Suspense fallback={<EnhancedLoadingFallback routeName="Inventory" />}>
          <InventoryPage />
        </Suspense>
      </ManagerRouteGuard>
    ),
    orders: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Orders" />}>
        <OrdersPage />
      </Suspense>
    ),
    customers: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Customers" />}>
        <CustomersPage />
      </Suspense>
    ),
    reports: (
      <ManagerRouteGuard>
        <Suspense fallback={<EnhancedLoadingFallback routeName="Reports" />}>
          <ReportsPage />
        </Suspense>
      </ManagerRouteGuard>
    ),
    settings: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Settings" />}>
        <SettingsPage />
      </Suspense>
    ),
    mdmproducts: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="MDM Products" />}>
        <ProductManagementPage />
      </Suspense>
    ),
    mdmStock: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="MDM Stock" />}>
        <InventoryPage />
      </Suspense>
    ),
    categories: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Categories" />}>
        <ProductManagementPage />
      </Suspense>
    ),
    stocks: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Stocks" />}>
        <InventoryPage />
      </Suspense>
    ),
    sources: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Sources" />}>
        <InventoryPage />
      </Suspense>
    ),
    invoices: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Invoices" />}>
        <OrdersPage />
      </Suspense>
    ),
    cmsPages: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="CMS Pages" />}>
        <ProductManagementPage />
      </Suspense>
    ),
    cegidProducts: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Cegid Products" />}>
        <ProductManagementPage />
      </Suspense>
    ),
    profile: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="User Profile" />}>
        <SettingsPage />
      </Suspense>
    ),
    bugBounty: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Bug Bounty" />}>
        <Dashboard />
      </Suspense>
    ),
    voting: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Feature Voting" />}>
        <TaskPage />
      </Suspense>
    ),
    licenseManagement: (
      <AdminRouteGuard>
        <Suspense fallback={<EnhancedLoadingFallback routeName="License Management" />}>
          <SettingsPage />
        </Suspense>
      </AdminRouteGuard>
    ),
    license: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="License Status" />}>
        <SettingsPage />
      </Suspense>
    ),
    gridTest: process.env.NODE_ENV === 'development' ? (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Grid Test" />}>
        <GridTestPage />
      </Suspense>
    ) : null,
    notFound: (
      <Suspense fallback={<EnhancedLoadingFallback routeName="Page" />}>
        <NotFoundPage />
      </Suspense>
    )
  }), [currentUser]);

  return (
    <RouteMetadataProvider>
      <DeepLinkHandler />
      <RouteAnalytics />
      <PostLoginRouter />
      
      <EnhancedRouteErrorBoundary>
        <Suspense fallback={<EnhancedLoadingFallback />}>
          <RouteTransition transitionKey={location.pathname}>
            <Routes>
              {/* Public Routes */}
              <Route 
                path={ROUTES.LOGIN} 
                element={
                  <PublicRouteGuard>
                    <Login />
                  </PublicRouteGuard>
                } 
              />

              {/* Protected Routes */}
              <Route 
                element={
                  <RouteGuard>
                    <Layout />
                  </RouteGuard>
                }
              >
                {/* Root redirect */}
                <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />

                {/* Core Application Routes */}
                <Route path="dashboard" element={routeComponents.dashboard} />
                <Route path="charts" element={routeComponents.charts} />
                <Route path="products/*" element={routeComponents.products} />
                <Route path="tasks" element={routeComponents.tasks} />
                <Route path="analytics" element={routeComponents.analytics} />
                <Route path="data-grids" element={routeComponents.dataGrids} />
                <Route path="inventory" element={routeComponents.inventory} />
                <Route path="orders" element={routeComponents.orders} />
                <Route path="customers" element={routeComponents.customers} />
                <Route path="reports" element={routeComponents.reports} />
                <Route path="settings" element={routeComponents.settings} />

                {/* MDM Routes */}
                <Route path="mdmproducts" element={routeComponents.mdmproducts} />
                <Route path="mdm-stock" element={routeComponents.mdmStock} />

                {/* Magento Routes */}
                <Route path="categories" element={routeComponents.categories} />
                <Route path="stocks" element={routeComponents.stocks} />
                <Route path="sources" element={routeComponents.sources} />
                <Route path="invoices" element={routeComponents.invoices} />
                <Route path="cms-pages" element={routeComponents.cmsPages} />
                <Route path="cegid-products" element={routeComponents.cegidProducts} />

                {/* User Routes */}
                <Route path="profile" element={routeComponents.profile} />

                {/* Development Routes */}
                <Route path="bug-bounty" element={routeComponents.bugBounty} />
                <Route path="voting" element={routeComponents.voting} />

                {/* License Routes */}
                <Route path="license-management" element={routeComponents.licenseManagement} />
                <Route path="license" element={routeComponents.license} />

                {/* Development Routes */}
                {routeComponents.gridTest && (
                  <Route path="grid-test" element={routeComponents.gridTest} />
                )}

                {/* 404 for protected routes */}
                <Route path="*" element={routeComponents.notFound} />
              </Route>

              {/* Fallback for unauthenticated users */}
              <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
            </Routes>
          </RouteTransition>
        </Suspense>
      </EnhancedRouteErrorBoundary>
    </RouteMetadataProvider>
  );
};

export default EnhancedRouter;