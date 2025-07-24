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
  VOTING: '/voting',
  INVENTORY: '/inventory',
  ORDERS: '/orders',
  CUSTOMERS: '/customers',
  REPORTS: '/reports',
  SETTINGS: '/settings',

  // Enhanced Routes
  DATA_GRIDS: '/data-grids',
  GRID_TEST: '/grid-test',

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
  [ROUTES.VOTING]: {
    title: 'Voting System',
    description: 'Voting and decision management system',
    icon: 'HowToVote',
    requiresAuth: true,
    breadcrumb: 'Voting'
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
  [ROUTES.SETTINGS]: {
    title: 'System Settings',
    description: 'Application configuration and preferences',
    icon: 'Settings',
    requiresAuth: true,
    breadcrumb: 'Settings'
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

/**
 * Navigation menu items configuration with enhanced structure
 */
export const NAVIGATION_ITEMS = [
  {
    path: ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: 'Dashboard',
    order: 1,
    badge: null,
    submenu: []
  },
  {
    path: ROUTES.PRODUCTS,
    label: 'Products',
    icon: 'Inventory',
    order: 2,
    badge: null,
    submenu: [
      {
        path: '/products/catalog',
        label: 'Product Catalog',
        icon: 'Inventory',
        description: 'Manage product catalog'
      },
      {
        path: '/products/categories',
        label: 'Categories',
        icon: 'Category',
        description: 'Manage product categories'
      }
    ]
  },
  {
    path: ROUTES.INVENTORY,
    label: 'Inventory',
    icon: 'Warehouse',
    order: 3,
    badge: null,
    submenu: [
      {
        path: '/inventory/stock',
        label: 'Stock Levels',
        icon: 'Inventory',
        description: 'Monitor stock levels'
      },
      {
        path: '/inventory/warehouses',
        label: 'Warehouses',
        icon: 'Warehouse',
        description: 'Manage warehouses'
      }
    ]
  },
  {
    path: ROUTES.ORDERS,
    label: 'Orders',
    icon: 'ShoppingCart',
    order: 4,
    badge: null,
    submenu: [
      {
        path: '/orders/pending',
        label: 'Pending Orders',
        icon: 'Pending',
        description: 'Orders awaiting processing'
      },
      {
        path: '/orders/completed',
        label: 'Completed Orders',
        icon: 'CheckCircle',
        description: 'Completed orders'
      }
    ]
  },
  {
    path: ROUTES.CUSTOMERS,
    label: 'Customers',
    icon: 'People',
    order: 5,
    badge: null,
    submenu: []
  },
  {
    path: ROUTES.CHARTS,
    label: 'Analytics',
    icon: 'BarChart',
    order: 6,
    badge: null,
    submenu: [
      {
        path: '/charts/sales',
        label: 'Sales Analytics',
        icon: 'TrendingUp',
        description: 'Sales performance charts'
      },
      {
        path: '/charts/inventory',
        label: 'Inventory Analytics',
        icon: 'BarChart',
        description: 'Inventory performance charts'
      }
    ]
  },
  {
    path: ROUTES.REPORTS,
    label: 'Reports',
    icon: 'Assessment',
    order: 7,
    badge: null,
    submenu: [
      {
        path: '/reports/sales',
        label: 'Sales Reports',
        icon: 'Assessment',
        description: 'Sales performance reports'
      },
      {
        path: '/reports/inventory',
        label: 'Inventory Reports',
        icon: 'Inventory',
        description: 'Inventory reports'
      }
    ]
  },
  {
    path: ROUTES.VOTING,
    label: 'Voting',
    icon: 'HowToVote',
    order: 8,
    badge: null,
    submenu: []
  },
  {
    path: ROUTES.SETTINGS,
    label: 'Settings',
    icon: 'Settings',
    order: 9,
    badge: null,
    submenu: [
      {
        path: '/settings/system',
        label: 'System Settings',
        icon: 'Settings',
        description: 'System configuration'
      },
      {
        path: '/settings/users',
        label: 'User Management',
        icon: 'People',
        description: 'Manage users and permissions'
      }
    ]
  }
];

export default ROUTES;
