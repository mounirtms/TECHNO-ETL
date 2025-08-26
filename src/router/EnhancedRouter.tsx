/**
 * Enhanced Router System for TECHNO-ETL
 * Provides intelligent routing, post-login redirects, and role-based navigation
 */
import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Define routes constants inline for now
const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CHARTS: '/charts',
  SETTINGS: '/settings',
  PRODUCTS: '/products',
  INVENTORY: '/inventory',
  ORDERS: '/orders',
  CUSTOMERS: '/customers',
  REPORTS: '/reports',
  ANALYTICS: '/analytics',
  GRID_TEST: '/grid-test',
  DATA_GRIDS: '/data-grids'
};

// Lazy Load Components
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ChartsPage = lazy(() => import('../pages/ChartsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

// Create simple placeholder components for missing pages
const PlaceholderPage = ({ name }: { name: string }) => (
  <Box sx={{ display: "flex", p: 3 }}></
    <Typography variant="h4">{name} Page</Typography>
    <Typography>This page is under development.</Typography>
  </Box>
);

const ProductManagementPage = () => <PlaceholderPage name="Product Management" />;
const InventoryPage = () => <PlaceholderPage name="Inventory" />;
const OrdersPage = () => <PlaceholderPage name="Orders" />;
const CustomersPage = () => <PlaceholderPage name="Customers" />;
const ReportsPage = () => <PlaceholderPage name="Reports" />;
const AnalyticsPage = () => <PlaceholderPage name="Analytics" />;
const GridTestPage = () => <PlaceholderPage name="Grid Test" />;
const DataGridsPage = () => <PlaceholderPage name="Data Grids" />;
const NotFoundPage = () => <PlaceholderPage name="404 - Page Not Found" />;
const TaskPage = () => <PlaceholderPage name="Task Management" />;

/**
 * Enhanced Loading Fallback with route information
 */
interface EnhancedLoadingFallbackProps {
  routeName?: string;
const EnhancedLoadingFallback = ({ routeName = 'page' }: EnhancedLoadingFallbackProps) => (
  <Box sx={{
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 2
    }}></
    <CircularProgress size={40} />
    <Typography variant="outlined" color="text.secondary">
      Loading {routeName}...
    </Typography>
  </Box>
);

/**
 * Simple Route Guard - checks if user is authenticated
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <EnhancedLoadingFallback />;
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
};

/**
 * Main Enhanced Router Component
 */
const EnhancedRouter = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <Suspense fallback={<EnhancedLoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path={ROUTES.LOGIN} 
          element={currentUser ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Login />}
        />

        {/* Protected Routes */}
        <Route 
          path = {}; // Fixed invalid assignment
                {/* Root redirect */}
                <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

                {/* Core Application Routes */}
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.CHARTS} element={<ChartsPage />} />
                <Route path={ROUTES.PRODUCTS} element={<ProductManagementPage />} />
                <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
                <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
                <Route path={ROUTES.CUSTOMERS} element={<CustomersPage />} />
                <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
                <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
                <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
                <Route path={ROUTES.GRID_TEST} element={<GridTestPage />} />
                <Route path={ROUTES.DATA_GRIDS} element={<DataGridsPage />} />
                
                {/* 404 for protected routes */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ProtectedRoute>
        />
      </Routes>
    </Suspense>
  );
};

export default EnhancedRouter;
