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
  DOCS: '/docs',

  // Enhanced Routes
  DATA_GRIDS: '/data-grids',
  GRID_TEST: '/grid-test',

  // MDM Routes
  MDM_PRODUCTS: '/mdmproducts',
  MDM_STOCK: '/mdm-stock',
  MDM_SOURCES: '/mdm-sources',

  // Magento Routes
  CATEGORIES: '/categories',
  STOCKS: '/stocks',
  SOURCES: '/sources',
  INVOICES: '/invoices',
  CMS_PAGES: '/cms-pages',
  CEGID_PRODUCTS: '/cegid-products',

  // Analytics Routes
  SALES_ANALYTICS: '/analytics/sales',
  INVENTORY_ANALYTICS: '/analytics/inventory',

  // Security Routes
  SECURE_VAULT: '/locker/vault',
  ACCESS_CONTROL: '/locker/access',

  // Development Routes
  BUG_BOUNTY: '/bug-bounty',
  VOTING: '/voting',
  ROUTE_TEST: '/route-test',

  // User Routes
  USER_PROFILE: '/profile',

  // License Routes
  LICENSE_MANAGEMENT: '/license-management',
  LICENSE_STATUS: '/license',

  // Nested Routes
  PRODUCT_DETAIL: '/products/:id',
  PRODUCT_CATEGORY: '/products/category/:categoryId',
};

export const ROUTE_METADATA = {
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    description: 'Main dashboard with overview and statistics',
    icon: 'Dashboard',
    requiresAuth: true,
    breadcrumb: 'Dashboard',
  },
  [ROUTES.CHARTS]: {
    title: 'Charts & Analytics',
    description: 'Data visualization and analytics',
    icon: 'BarChart',
    requiresAuth: true,
    breadcrumb: 'Charts',
  },
  [ROUTES.PRODUCTS]: {
    title: 'Product Management',
    description: 'Manage products, categories, and inventory',
    icon: 'Inventory',
    requiresAuth: true,
    breadcrumb: 'Products',
  },
  [ROUTES.TASKS]: {
    title: 'Task Management',
    description: 'Task management and project tracking system',
    icon: 'Task',
    requiresAuth: true,
    breadcrumb: 'Tasks',
  },
  [ROUTES.INVENTORY]: {
    title: 'Inventory Management',
    description: 'Stock levels and warehouse management',
    icon: 'Inventory',
    requiresAuth: true,
    breadcrumb: 'Inventory',
  },
  [ROUTES.ORDERS]: {
    title: 'Order Management',
    description: 'Process and track customer orders',
    icon: 'ShoppingCart',
    requiresAuth: true,
    breadcrumb: 'Orders',
  },
  [ROUTES.CUSTOMERS]: {
    title: 'Customer Management',
    description: 'Customer profiles and relationship management',
    icon: 'People',
    requiresAuth: true,
    breadcrumb: 'Customers',
  },
  [ROUTES.REPORTS]: {
    title: 'Reports & Analytics',
    description: 'Business intelligence and reporting',
    icon: 'Assessment',
    requiresAuth: true,
    breadcrumb: 'Reports',
  },
  [ROUTES.ANALYTICS]: {
    title: 'Looker Studio Analytics',
    description: 'Interactive business intelligence dashboards',
    icon: 'Analytics',
    requiresAuth: true,
    breadcrumb: 'Analytics',
  },
  [ROUTES.SETTINGS]: {
    title: 'System Settings',
    description: 'Application configuration and preferences',
    icon: 'Settings',
    requiresAuth: true,
    breadcrumb: 'Settings',
  },
  [ROUTES.DOCS]: {
    title: 'Documentation',
    description: 'Interactive documentation and API guides',
    icon: 'Book',
    requiresAuth: false, // Public access to docs
    breadcrumb: 'Documentation',
  },
  [ROUTES.DATA_GRIDS]: {
    title: 'Data Management',
    description: 'Comprehensive data grid interface with tabbed navigation',
    icon: 'GridView',
    requiresAuth: true,
    breadcrumb: 'Data Grids',
  },
  [ROUTES.GRID_TEST]: {
    title: 'Grid Testing',
    description: 'Performance testing and validation for grid components',
    icon: 'Speed',
    requiresAuth: true,
    breadcrumb: 'Grid Test',
  },
  // MDM Routes
  [ROUTES.MDM_PRODUCTS]: {
    title: 'MDM Products',
    description: 'Master Data Management for products',
    icon: 'Inventory',
    requiresAuth: true,
    breadcrumb: 'MDM Products',
  },
  [ROUTES.MDM_STOCK]: {
    title: 'MDM Stock',
    description: 'Master Data Management for stock levels',
    icon: 'Inventory2',
    requiresAuth: true,
    breadcrumb: 'MDM Stock',
  },
  [ROUTES.MDM_SOURCES]: {
    title: 'MDM Sources',
    description: 'Master Data Management for data sources',
    icon: 'Warehouse',
    requiresAuth: true,
    breadcrumb: 'MDM Sources',
  },
  // Magento Routes
  [ROUTES.CATEGORIES]: {
    title: 'Categories',
    description: 'Product category management',
    icon: 'Category',
    requiresAuth: true,
    breadcrumb: 'Categories',
  },
  [ROUTES.STOCKS]: {
    title: 'Stocks',
    description: 'Inventory and stock management',
    icon: 'Inventory2',
    requiresAuth: true,
    breadcrumb: 'Stocks',
  },
  [ROUTES.SOURCES]: {
    title: 'Sources',
    description: 'Warehouse and source management',
    icon: 'Warehouse',
    requiresAuth: true,
    breadcrumb: 'Sources',
  },
  [ROUTES.INVOICES]: {
    title: 'Invoices',
    description: 'Invoice management',
    icon: 'Receipt',
    requiresAuth: true,
    breadcrumb: 'Invoices',
  },
  [ROUTES.CMS_PAGES]: {
    title: 'CMS Pages',
    description: 'Content management system pages',
    icon: 'Description',
    requiresAuth: true,
    breadcrumb: 'CMS Pages',
  },
  [ROUTES.CEGID_PRODUCTS]: {
    title: 'Cegid Products',
    description: 'Cegid product integration',
    icon: 'Storefront',
    requiresAuth: true,
    breadcrumb: 'Cegid Products',
  },
  // Analytics Routes
  [ROUTES.SALES_ANALYTICS]: {
    title: 'Sales Analytics',
    description: 'Sales performance analytics',
    icon: 'Analytics',
    requiresAuth: true,
    breadcrumb: 'Sales Analytics',
  },
  [ROUTES.INVENTORY_ANALYTICS]: {
    title: 'Inventory Analytics',
    description: 'Inventory performance analytics',
    icon: 'Inventory2',
    requiresAuth: true,
    breadcrumb: 'Inventory Analytics',
  },
  // Security Routes
  [ROUTES.SECURE_VAULT]: {
    title: 'Secure Vault',
    description: 'Encrypted document storage',
    icon: 'Security',
    requiresAuth: true,
    breadcrumb: 'Secure Vault',
  },
  [ROUTES.ACCESS_CONTROL]: {
    title: 'Access Control',
    description: 'User access management',
    icon: 'AdminPanelSettings',
    requiresAuth: true,
    breadcrumb: 'Access Control',
  },
  // Development Routes
  [ROUTES.BUG_BOUNTY]: {
    title: 'Bug Bounty',
    description: 'Bug reporting and tracking',
    icon: 'BugReport',
    requiresAuth: true,
    breadcrumb: 'Bug Bounty',
  },
  [ROUTES.VOTING]: {
    title: 'Feature Voting',
    description: 'Feature request voting system',
    icon: 'HowToVote',
    requiresAuth: true,
    breadcrumb: 'Feature Voting',
  },
  [ROUTES.ROUTE_TEST]: {
    title: 'Route Test',
    description: 'Test page for verifying routes',
    icon: 'Route',
    requiresAuth: true,
    breadcrumb: 'Route Test',
  },
  // User Routes
  [ROUTES.USER_PROFILE]: {
    title: 'User Profile',
    description: 'User profile and settings',
    icon: 'AccountCircle',
    requiresAuth: false, // Always accessible
    breadcrumb: 'User Profile',
  },
  // License Routes
  [ROUTES.LICENSE_MANAGEMENT]: {
    title: 'License Management',
    description: 'License configuration and management',
    icon: 'VerifiedUser',
    requiresAuth: true,
    breadcrumb: 'License Management',
  },
  [ROUTES.LICENSE_STATUS]: {
    title: 'License Status',
    description: 'License status and information',
    icon: 'VerifiedUser',
    requiresAuth: false, // Always accessible
    breadcrumb: 'License Status',
  },
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
    submenu: [],
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
        description: 'Manage product catalog',
      },
      {
        path: '/products/categories',
        label: 'Categories',
        icon: 'Category',
        description: 'Manage product categories',
      },
    ],
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
        description: 'Monitor stock levels',
      },
      {
        path: '/inventory/warehouses',
        label: 'Warehouses',
        icon: 'Warehouse',
        description: 'Manage warehouses',
      },
    ],
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
        description: 'Orders awaiting processing',
      },
      {
        path: '/orders/completed',
        label: 'Completed Orders',
        icon: 'CheckCircle',
        description: 'Completed orders',
      },
    ],
  },
  {
    path: ROUTES.CUSTOMERS,
    label: 'Customers',
    icon: 'People',
    order: 5,
    badge: null,
    submenu: [],
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
        description: 'Sales performance charts',
      },
      {
        path: '/charts/inventory',
        label: 'Inventory Analytics',
        icon: 'BarChart',
        description: 'Inventory performance charts',
      },
    ],
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
        description: 'Sales performance reports',
      },
      {
        path: '/reports/inventory',
        label: 'Inventory Reports',
        icon: 'Inventory',
        description: 'Inventory reports',
      },
    ],
  },
  {
    path: ROUTES.ANALYTICS,
    label: 'Analytics',
    icon: 'Analytics',
    order: 8,
    badge: null,
    submenu: [],
  },
  {
    path: ROUTES.TASKS,
    label: 'Tasks',
    icon: 'Task',
    order: 9,
    badge: null,
    submenu: [],
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
        description: 'System configuration',
      },
      {
        path: '/settings/users',
        label: 'User Management',
        icon: 'People',
        description: 'Manage users and permissions',
      },
    ],
  },
];

/**
 * Get route metadata by path
 */
export const getRouteMetadata = (path) => {
  return ROUTE_METADATA[path] || {
    title: 'Unknown Page',
    description: '',
    icon: 'Help',
    requiresAuth: true,
    breadcrumb: 'Unknown',
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
    ROUTE_METADATA[route].requiresAuth !== false,
  );
};

export default ROUTES;
