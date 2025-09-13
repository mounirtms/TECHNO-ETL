/**
 * Route Configuration for TECHNO-ETL
 * Centralized route definitions with metadata
 */

export const ROUTES = {
  // Public Routes
  LOGIN: '/login',
  
  // Protected Routes
  DASHBOARD: '/dashboard',
  CHARTS: '/charts',
  PRODUCTS: '/products',
  TASKS: '/tasks',
  INVENTORY: '/inventory',
  ORDERS: '/orders',
  CUSTOMERS: '/customers',
  REPORTS: '/reports',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',

  // Enhanced Routes
  DATA_GRIDS: '/data-grids',
  GRID_TEST: '/grid-test',
  MDM_PRODUCTS: '/mdm-products',

  // Nested Routes
  PRODUCT_DETAIL: '/products/:id',
  PRODUCT_CATEGORY: '/products/category/:categoryId'
};

export const ROUTE_METADATA = {
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    description: 'Main dashboard with overview and statistics',
    icon: 'Dashboard',
    requiresAuth: true,
    breadcrumb: 'Dashboard'
  },
  [ROUTES.CHARTS]: {
    title: 'Charts & Analytics',
    description: 'Data visualization and analytics',
    icon: 'BarChart',
    requiresAuth: true,
    breadcrumb: 'Charts'
  },
  [ROUTES.PRODUCTS]: {
    title: 'Product Management',
    description: 'Manage products, categories, and inventory',
    icon: 'Inventory',
    requiresAuth: true,
    breadcrumb: 'Products'
  },
  [ROUTES.TASKS]: {
    title: 'Task Management',
    description: 'Task management and project tracking system',
    icon: 'Task',
    requiresAuth: true,
    breadcrumb: 'Tasks'
  },
  [ROUTES.INVENTORY]: {
    title: 'Inventory Management',
    description: 'Stock levels and warehouse management',
    icon: 'Inventory',
    requiresAuth: true,
    breadcrumb: 'Inventory'
  },
  [ROUTES.ORDERS]: {
    title: 'Order Management',
    description: 'Process and track customer orders',
    icon: 'ShoppingCart',
    requiresAuth: true,
    breadcrumb: 'Orders'
  },
  [ROUTES.CUSTOMERS]: {
    title: 'Customer Management',
    description: 'Customer profiles and relationship management',
    icon: 'People',
    requiresAuth: true,
    breadcrumb: 'Customers'
  },
  [ROUTES.REPORTS]: {
    title: 'Reports & Analytics',
    description: 'Business intelligence and reporting',
    icon: 'Assessment',
    requiresAuth: true,
    breadcrumb: 'Reports'
  },
  [ROUTES.ANALYTICS]: {
    title: 'Looker Studio Analytics',
    description: 'Interactive business intelligence dashboards',
    icon: 'Analytics',
    requiresAuth: true,
    breadcrumb: 'Analytics'
  },
  [ROUTES.SETTINGS]: {
    title: 'System Settings',
    description: 'Application configuration and preferences',
    icon: 'Settings',
    requiresAuth: true,
    breadcrumb: 'Settings'
  },
  [ROUTES.MDM_PRODUCTS]: {
    title: 'MDM Products',
    description: 'Master Data Management for products across all channels',
    icon: 'Inventory2',
    requiresAuth: true,
    breadcrumb: 'MDM Products'
  },
  [ROUTES.DATA_GRIDS]: {
    title: 'Data Management',
    description: 'Comprehensive data grid interface with tabbed navigation',
    icon: 'GridView',
    requiresAuth: true,
    breadcrumb: 'Data Grids'
  },
  [ROUTES.GRID_TEST]: {
    title: 'Grid Testing',
    description: 'Performance testing and validation for grid components',
    icon: 'Speed',
    requiresAuth: true,
    breadcrumb: 'Grid Test'
  }
};

/**
 * Get route metadata by path
 */
export const getRouteMetadata = (path) => {
  return ROUTE_METADATA[path] || {
    title: 'Unknown Page',
    description: '',
    icon: 'Help',
    requiresAuth: true,
    breadcrumb: 'Unknown'
  };
};

/**
 * Check if route requires authentication
 */
export const requiresAuth = (path) => {
  const metadata = getRouteMetadata(path);
  return metadata.requiresAuth !== false;
};

/**
 * Get all protected routes
 */
export const getProtectedRoutes = () => {
  return Object.keys(ROUTE_METADATA).filter(route => 
    ROUTE_METADATA[route].requiresAuth !== false
  );
};