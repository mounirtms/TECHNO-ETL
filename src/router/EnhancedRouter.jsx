/**
 * Enhanced Router System for TECHNO-ETL
 * Provides intelligent routing, post-login redirects, and role-based navigation
 */
import React, { Suspense, lazy, useEffect } from 'react';
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
  RouteAnalytics,
} from './RouteGuard';

// Lazy Load Components with optimized chunking
const Layout = lazy(() => import('../components/Layout/Layout.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const Dashboard = lazy(() => import('../pages/Dashboard.jsx').catch(() => ({ default: () => <div>Dashboard loading error</div> })));
const ChartsPage = lazy(() => import('../pages/ChartsPage.jsx').catch(() => ({ default: () => <div>Charts loading error</div> })));
const ProductManagementPage = lazy(() => import('../pages/ProductManagementPage.jsx').catch(() => ({ default: () => <div>Products loading error</div> })));
const TaskPage = lazy(() => import('../pages/VotingPage.jsx').catch(() => ({ default: () => <div>Tasks loading error</div> })));
const InventoryPage = lazy(() => import('../pages/InventoryPage.jsx').catch(() => ({ default: () => <div>Inventory loading error</div> })));
const OrdersPage = lazy(() => import('../pages/OrdersPage.jsx').catch(() => ({ default: () => <div>Orders loading error</div> })));
const CustomersPage = lazy(() => import('../pages/CustomersPage.jsx').catch(() => ({ default: () => <div>Customers loading error</div> })));
const SettingsPage = lazy(() => import('../pages/SettingsPage.jsx').catch(() => ({ default: () => <div>Settings loading error</div> })));
const ReportsPage = lazy(() => import('../pages/ReportsPage.jsx').catch(() => ({ default: () => <div>Reports loading error</div> })));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage.jsx').catch(() => ({ default: () => <div>Analytics loading error</div> })));
const DocsPage = lazy(() => import('../pages/DocsPage.jsx').catch(() => ({ default: () => <div>Documentation loading error</div> })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx').catch(() => ({ default: () => <div>Page not found</div> })));

// Grid Test Page for development
const GridTestPage = lazy(() => import('../pages/GridTestPage.jsx').catch(() => ({ default: () => <div>Grid test loading error</div> })));
const DataGridsPage = lazy(() => import('../pages/DataGridsPage.jsx').catch(() => ({ default: () => <div>Data grids loading error</div> })));

// Test Page for route verification
const RouteTestPage = lazy(() => import('../pages/RouteTestPage.jsx').catch(() => ({ default: () => <div>Route test loading error</div> })));

// MDM Pages
const MDMProductsPage = lazy(() => import('../pages/MDMProductsPage.jsx').catch(() => ({ default: () => <div>MDM Products loading error</div> })));
const MDMStockPage = lazy(() => import('../pages/MDMStockPage.jsx').catch(() => ({ default: () => <div>MDM Stock loading error</div> })));
const MDMSourcesPage = lazy(() => import('../pages/MDMSourcesPage.jsx').catch(() => ({ default: () => <div>MDM Sources loading error</div> })));

// Magento Pages
const CategoriesPage = lazy(() => import('../pages/CategoriesPage.jsx').catch(() => ({ default: () => <div>Categories loading error</div> })));
const StocksPage = lazy(() => import('../pages/StocksPage.jsx').catch(() => ({ default: () => <div>Stocks loading error</div> })));
const SourcesPage = lazy(() => import('../pages/SourcesPage.jsx').catch(() => ({ default: () => <div>Sources loading error</div> })));
const InvoicesPage = lazy(() => import('../pages/InvoicesPage.jsx').catch(() => ({ default: () => <div>Invoices loading error</div> })));
const CmsPagesPage = lazy(() => import('../pages/CmsPagesPage.jsx').catch(() => ({ default: () => <div>CMS Pages loading error</div> })));
const CegidProductsPage = lazy(() => import('../pages/CegidProductsPage.jsx').catch(() => ({ default: () => <div>Cegid Products loading error</div> })));

// Analytics Pages
const SalesAnalyticsPage = lazy(() => import('../pages/SalesAnalyticsPage.jsx').catch(() => ({ default: () => <div>Sales Analytics loading error</div> })));
const InventoryAnalyticsPage = lazy(() => import('../pages/InventoryAnalyticsPage.jsx').catch(() => ({ default: () => <div>Inventory Analytics loading error</div> })));

// Security Pages
const SecureVaultPage = lazy(() => import('../pages/SecureVaultPage.jsx').catch(() => ({ default: () => <div>Secure Vault loading error</div> })));
const AccessControlPage = lazy(() => import('../pages/AccessControlPage.jsx').catch(() => ({ default: () => <div>Access Control loading error</div> })));

// Development Pages
const BugBountyPage = lazy(() => import('../pages/BugBountyPage.jsx').catch(() => ({ default: () => <div>Bug Bounty loading error</div> })));
const VotingPage = lazy(() => import('../pages/VotingPage.jsx').catch(() => ({ default: () => <div>Voting loading error</div> })));

// User Pages
const UserProfilePage = lazy(() => import('../pages/UserProfilePage.jsx').catch(() => ({ default: () => <div>User Profile loading error</div> })));

// License Pages
const LicenseManagementPage = lazy(() => import('../pages/LicenseManagementPage.jsx').catch(() => ({ default: () => <div>License Management loading error</div> })));
const LicenseStatusPage = lazy(() => import('../pages/LicenseStatusPage.jsx').catch(() => ({ default: () => <div>License Status loading error</div> })));

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
      gap: 2,
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
    user: ROUTES.DASHBOARD,
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
        fatal: false,
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
            textAlign: 'center',
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
                cursor: 'pointer',
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
                cursor: 'pointer',
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

              {/* Documentation Route - Public Access */}
              <Route
                path="docs"
                element={
                  <Suspense fallback={<EnhancedLoadingFallback routeName="Documentation" />}>
                    <DocsPage />
                  </Suspense>
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
                <Route
                  path="dashboard"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Dashboard" />}>
                      <Dashboard />
                    </Suspense>
                  }
                />

                <Route
                  path="charts"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Analytics" />}>
                      <ChartsPage />
                    </Suspense>
                  }
                />

                <Route
                  path="products/*"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Product Management" />}>
                      <ProductManagementPage />
                    </Suspense>
                  }
                />

                <Route
                  path="tasks"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Task Management" />}>
                      <TaskPage />
                    </Suspense>
                  }
                />

                <Route
                  path="analytics"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Looker Studio Analytics" />}>
                      <AnalyticsPage />
                    </Suspense>
                  }
                />

                <Route
                  path="data-grids"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Data Management" />}>
                      <DataGridsPage />
                    </Suspense>
                  }
                />

                <Route
                  path="inventory"
                  element={
                    <ManagerRouteGuard>
                      <Suspense fallback={<EnhancedLoadingFallback routeName="Inventory" />}>
                        <InventoryPage />
                      </Suspense>
                    </ManagerRouteGuard>
                  }
                />

                <Route
                  path="orders"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Orders" />}>
                      <OrdersPage />
                    </Suspense>
                  }
                />

                <Route
                  path="customers"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Customers" />}>
                      <CustomersPage />
                    </Suspense>
                  }
                />

                <Route
                  path="reports"
                  element={
                    <ManagerRouteGuard>
                      <Suspense fallback={<EnhancedLoadingFallback routeName="Reports" />}>
                        <ReportsPage />
                      </Suspense>
                    </ManagerRouteGuard>
                  }
                />

                <Route
                  path="settings"
                  element={
                    <AdminRouteGuard>
                      <Suspense fallback={<EnhancedLoadingFallback routeName="Settings" />}>
                        <SettingsPage />
                      </Suspense>
                    </AdminRouteGuard>
                  }
                />

                {/* MDM Routes */}
                <Route
                  path="mdmproducts"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="MDM Products" />}>
                      <MDMProductsPage />
                    </Suspense>
                  }
                />

                <Route
                  path="mdm-stock"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="MDM Stock" />}>
                      <MDMStockPage />
                    </Suspense>
                  }
                />

                <Route
                  path="mdm-sources"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="MDM Sources" />}>
                      <MDMSourcesPage />
                    </Suspense>
                  }
                />

                {/* Magento Routes */}
                <Route
                  path="categories"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Categories" />}>
                      <CategoriesPage />
                    </Suspense>
                  }
                />

                <Route
                  path="stocks"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Stocks" />}>
                      <StocksPage />
                    </Suspense>
                  }
                />

                <Route
                  path="sources"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Sources" />}>
                      <SourcesPage />
                    </Suspense>
                  }
                />

                <Route
                  path="invoices"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Invoices" />}>
                      <InvoicesPage />
                    </Suspense>
                  }
                />

                <Route
                  path="cms-pages"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="CMS Pages" />}>
                      <CmsPagesPage />
                    </Suspense>
                  }
                />

                <Route
                  path="cegid-products"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Cegid Products" />}>
                      <CegidProductsPage />
                    </Suspense>
                  }
                />

                {/* Analytics Routes */}
                <Route
                  path="analytics/sales"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Sales Analytics" />}>
                      <SalesAnalyticsPage />
                    </Suspense>
                  }
                />

                <Route
                  path="analytics/inventory"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Inventory Analytics" />}>
                      <InventoryAnalyticsPage />
                    </Suspense>
                  }
                />

                {/* Security Routes */}
                <Route
                  path="locker/vault"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Secure Vault" />}>
                      <SecureVaultPage />
                    </Suspense>
                  }
                />

                <Route
                  path="locker/access"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Access Control" />}>
                      <AccessControlPage />
                    </Suspense>
                  }
                />

                {/* Development Routes */}
                <Route
                  path="bug-bounty"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Bug Bounty" />}>
                      <BugBountyPage />
                    </Suspense>
                  }
                />

                <Route
                  path="voting"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Feature Voting" />}>
                      <VotingPage />
                    </Suspense>
                  }
                />

                {/* User Routes */}
                <Route
                  path="profile"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="User Profile" />}>
                      <UserProfilePage />
                    </Suspense>
                  }
                />

                {/* License Routes */}
                <Route
                  path="license-management"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="License Management" />}>
                      <LicenseManagementPage />
                    </Suspense>
                  }
                />

                <Route
                  path="license"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="License Status" />}>
                      <LicenseStatusPage />
                    </Suspense>
                  }
                />

                {/* Development Routes */}
                {process.env.NODE_ENV === 'development' && (
                  <>
                    <Route
                      path="grid-test"
                      element={
                        <Suspense fallback={<EnhancedLoadingFallback routeName="Grid Test" />}>
                          <GridTestPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="route-test"
                      element={
                        <Suspense fallback={<EnhancedLoadingFallback routeName="Route Test" />}>
                          <RouteTestPage />
                        </Suspense>
                      }
                    />
                  </>
                )}

                {/* 404 for protected routes */}
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<EnhancedLoadingFallback routeName="Page" />}>
                      <NotFoundPage />
                    </Suspense>
                  }
                />
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
