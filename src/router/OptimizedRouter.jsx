import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { ComponentOptimizer } from '../utils/componentOptimizer';

// Lazy load pages for better performance
const LazyDashboard = lazy(() => import('../pages/Dashboard'));
const LazyProducts = lazy(() => import('../pages/ProductManagementPage'));
const LazyCategories = lazy(() => import('../pages/CategoriesPage'));
const LazyMDMProducts = lazy(() => import('../pages/MDMProductsPage'));
const LazyBulkUpload = lazy(() => import('../components/BulkUpload/BulkMediaUpload'));
const LazySettings = lazy(() => import('../pages/SettingsPage'));

// Loading fallback
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <CircularProgress />
  </div>
);

// Route configuration with metadata
const routes = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: <LazyDashboard />,
    title: 'Dashboard',
  },
  {
    path: '/products/*',
    element: <LazyProducts />,
    title: 'Product Management',
    routes: [
      {
        path: 'edit/:id',
        element: <LazyProducts mode="edit" />,
        title: 'Edit Product',
      },
      {
        path: 'gallery/:id',
        element: <LazyProducts mode="gallery" />,
        title: 'Product Gallery',
      },
    ],
  },
  {
    path: '/categories/*',
    element: <LazyCategories />,
    title: 'Categories',
    routes: [
      {
        path: 'manage',
        element: <LazyCategories mode="manage" />,
        title: 'Manage Categories',
      },
    ],
  },
  {
    path: '/mdm/products',
    element: <LazyMDMProducts />,
    title: 'MDM Products',
  },
  {
    path: '/media/bulk-upload',
    element: <LazyBulkUpload />,
    title: 'Bulk Media Upload',
  },
  {
    path: '/settings',
    element: <LazySettings />,
    title: 'Settings',
  },
];

// Render route with suspense
const RouteWithSuspense = ComponentOptimizer.optimizeComponent(({ element: Element }) => (
  <Suspense fallback={<LoadingFallback />}>
    {Element}
  </Suspense>
));

// Router component
const OptimizedRouter = ComponentOptimizer.optimizeComponent(() => (
  <Routes>
    {routes.map(({ path, element, routes: childRoutes = [] }) => [
      <Route 
        key={path}
        path={path}
        element={<RouteWithSuspense element={element} />}
      />,
      // Render child routes
      ...childRoutes.map(({ path: childPath, element: childElement }) => (
        <Route
          key={`${path}/${childPath}`}
          path={`${path}/${childPath}`}
          element={<RouteWithSuspense element={childElement} />}
        />
      )),
    ])}
  </Routes>
));

export default OptimizedRouter;