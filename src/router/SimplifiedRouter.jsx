import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../config/routes';
import { RouteGuard, PublicRouteGuard } from './RouteGuard';

// Lazy Load Components with optimized chunking
const Layout = lazy(() => import('../components/Layout/Layout.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'));
const ChartsPage = lazy(() => import('../pages/ChartsPage.jsx'));
const ProductManagementPage = lazy(() => import('../pages/ProductManagementPage.jsx'));
const VotingPage = lazy(() => import('../pages/VotingPage.jsx'));
const InventoryPage = lazy(() => import('../pages/InventoryPage.jsx'));
const OrdersPage = lazy(() => import('../pages/OrdersPage.jsx'));
const CustomersPage = lazy(() => import('../pages/CustomersPage.jsx'));
const SettingsPage = lazy(() => import('../pages/SettingsPage.jsx'));
const ReportsPage = lazy(() => import('../pages/ReportsPage.jsx'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage.jsx'));
const DocsPage = lazy(() => import('../pages/DocsPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

// Grid Test Page for development
const GridTestPage = lazy(() => import('../pages/GridTestPage.jsx'));
const DataGridsPage = lazy(() => import('../pages/DataGridsPage.jsx'));

// Test Page for route verification
const RouteTestPage = lazy(() => import('../pages/RouteTestPage.jsx'));

// MDM Pages
const MDMProductsPage = lazy(() => import('../pages/MDMProductsPage.jsx'));
const MDMStockPage = lazy(() => import('../pages/MDMStockPage.jsx'));
const MDMSourcesPage = lazy(() => import('../pages/MDMSourcesPage.jsx'));

// Magento Pages - Now using direct routing instead of tab-based
const CategoriesPage = lazy(() => import('../pages/CategoriesPage.jsx'));
const StocksPage = lazy(() => import('../pages/StocksPage.jsx'));
const SourcesPage = lazy(() => import('../pages/SourcesPage.jsx'));
const InvoicesPage = lazy(() => import('../pages/InvoicesPage.jsx'));
const CmsPagesPage = lazy(() => import('../pages/CmsPagesPage.jsx'));
const CegidProductsPage = lazy(() => import('../pages/CegidProductsPage.jsx'));

// Analytics Pages
const SalesAnalyticsPage = lazy(() => import('../pages/SalesAnalyticsPage.jsx'));
const InventoryAnalyticsPage = lazy(() => import('../pages/InventoryAnalyticsPage.jsx'));

// Security Pages
const SecureVaultPage = lazy(() => import('../pages/SecureVaultPage.jsx'));
const AccessControlPage = lazy(() => import('../pages/AccessControlPage.jsx'));

// Development Pages
const BugBountyPage = lazy(() => import('../pages/BugBountyPage.jsx'));

// User Pages
const UserProfilePage = lazy(() => import('../pages/UserProfilePage.jsx'));

// License Pages
const LicenseManagementPage = lazy(() => import('../pages/LicenseManagementPage.jsx'));
const LicenseStatusPage = lazy(() => import('../pages/LicenseStatusPage.jsx'));

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
 * Simplified Router Component
 * Provides direct routing without complex tab management
 */
const SimplifiedRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<EnhancedLoadingFallback />}>
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
                <VotingPage />
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
              <Suspense fallback={<EnhancedLoadingFallback routeName="Inventory" />}>
                <InventoryPage />
              </Suspense>
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
              <Suspense fallback={<EnhancedLoadingFallback routeName="Reports" />}>
                <ReportsPage />
              </Suspense>
            } 
          />
          
          <Route 
            path="settings" 
            element={
              <Suspense fallback={<EnhancedLoadingFallback routeName="Settings" />}>
                <SettingsPage />
              </Suspense>
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

          {/* Magento Routes - Now using direct routing */}
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
    </Suspense>
  );
};

export default SimplifiedRouter;
