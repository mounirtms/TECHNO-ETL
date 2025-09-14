/**
 * Centralized Route Configuration
 * Single source of truth for all routes, permissions, and tab mappings
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import { lazy } from 'react';

// Lazy load all page components for better performance
const Dashboard = lazy(() => import('../components/dashboard/ComprehensiveDashboard.jsx'));
const ChartsPage = lazy(() => import('../pages/ChartsPage.jsx'));
const ProductsGrid = lazy(() => import('../components/grids/magento/ProductsGrid.jsx'));
const MDMProductsGrid = lazy(() => import('../components/grids/MDMProductsGrid/MDMProductsGrid.jsx'));
const CegidGrid = lazy(() => import('../components/grids/CegidGrid.jsx'));
const CustomersGrid = lazy(() => import('../components/grids/magento/CustomersGrid.jsx'));
const OrdersGrid = lazy(() => import('../components/grids/magento/OrdersGrid.jsx'));
const InvoicesGrid = lazy(() => import('../components/grids/magento/InvoicesGrid.jsx'));
const CategoryTree = lazy(() => import('../components/grids/magento/CategoryGrid.jsx'));
const StocksGrid = lazy(() => import('../components/grids/magento/StocksGrid.jsx'));
const SourcesGrid = lazy(() => import('../components/grids/magento/SourcesGrid.jsx'));
const MDMStockGrid = lazy(() => import('../components/grids/MDMStockGrid.jsx'));
const CmsPageGrid = lazy(() => import('../components/grids/magento/CmsPagesGrid.jsx'));
const GridTestPage = lazy(() => import('../pages/GridTestPage.jsx'));
const BugBountyPage = lazy(() => import('../pages/BugBountyPage.jsx'));
const VotingPage = lazy(() => import('../pages/VotingPage.jsx'));
const LicenseManagement = lazy(() => import('../components/License/LicenseManagement.jsx'));
const UserProfile = lazy(() => import('../components/UserProfile/index.jsx'));

// Public routes (no authentication required)
export const PUBLIC_ROUTES = [
  {
    path: '/login',
    component: lazy(() => import('../pages/Login.jsx')),
    exact: true
  },
  {
    path: '/docs/*',
    component: lazy(() => import('../pages/DocsPage.jsx')),
    exact: false
  }
];

// Protected routes configuration with permissions and tab settings
export const PROTECTED_ROUTES = [
  // === CORE DASHBOARD ===
  {
    path: '/dashboard',
    component: Dashboard,
    tabId: 'Dashboard',
    label: 'Dashboard',
    permissions: ['dashboard.view'],
    category: 'core',
    closeable: false,
    preload: true
  },
  {
    path: '/charts',
    component: ChartsPage,
    tabId: 'Charts',
    label: 'Analytics & Charts',
    permissions: ['analytics.view'],
    category: 'core',
    closeable: true
  },

  // === MDM SYSTEM ===
  {
    path: '/mdmproducts',
    component: MDMProductsGrid,
    tabId: 'MDMProductsGrid',
    label: 'MDM Products',
    permissions: ['mdm.products.view'],
    category: 'mdm',
    closeable: true,
    services: ['mdm']
  },
  {
    path: '/mdm-stock',
    component: MDMStockGrid,
    tabId: 'MDMStockGrid',
    label: 'MDM Stock',
    permissions: ['mdm.stock.view'],
    category: 'mdm',
    closeable: true,
    services: ['mdm']
  },

  // === MAGENTO SYSTEM ===
  {
    path: '/products',
    component: ProductsGrid,
    tabId: 'ProductsGrid',
    label: 'Products',
    permissions: ['magento.products.view'],
    category: 'magento',
    closeable: true,
    services: ['magento']
  },
  {
    path: '/customers',
    component: CustomersGrid,
    tabId: 'CustomersGrid',
    label: 'Customers',
    permissions: ['magento.customers.view'],
    category: 'magento',
    closeable: true,
    services: ['magento']
  },
  {
    path: '/orders',
    component: OrdersGrid,
    tabId: 'OrdersGrid',
    label: 'Orders',
    permissions: ['magento.orders.view'],
    category: 'magento',
    closeable: true,
    services: ['magento']
  },
  {
    path: '/invoices',
    component: InvoicesGrid,
    tabId: 'InvoicesGrid',
    label: 'Invoices',
    permissions: ['magento.invoices.view'],
    category: 'magento',
    closeable: true,
    services: ['magento']
  },
  {
    path: '/categories',
    component: CategoryTree,
    tabId: 'CategoryTree',
    label: 'Categories',
    permissions: ['magento.categories.view'],
    category: 'magento',
    closeable: true,
    services: ['magento']
  },
  {
    path: '/stocks',
    component: StocksGrid,
    tabId: 'StocksGrid',
    label: 'Inventory & Stocks',
    permissions: ['magento.inventory.view'],
    category: 'magento',
    closeable: true,
    services: ['magento']
  },
  {
    path: '/sources',
    component: SourcesGrid,
    tabId: 'SourcesGrid',
    label: 'Sources & Warehouses',
    permissions: ['magento.sources.view'],
    category: 'magento',
    closeable: true,
    services: ['magento']
  },
  {
    path: '/cms-pages',
    component: CmsPageGrid,
    tabId: 'CmsPageGrid',
    label: 'CMS Pages',
    permissions: ['magento.cms.view'],
    category: 'magento',
    closeable: true,
    services: ['magento']
  },

  // === CEGID SYSTEM ===
  {
    path: '/cegid-products',
    component: CegidGrid,
    tabId: 'CegidProductsGrid',
    label: 'Cegid Products',
    permissions: ['cegid.products.view'],
    category: 'cegid',
    closeable: true,
    services: ['cegid']
  },

  // === DEVELOPMENT & TESTING ===
  {
    path: '/grid-test',
    component: GridTestPage,
    tabId: 'GridTestPage',
    label: 'Grid Testing',
    permissions: ['development.test'],
    category: 'development',
    closeable: true
  },
  {
    path: '/bug-bounty',
    component: BugBountyPage,
    tabId: 'BugBountyPage',
    label: 'Bug Bounty',
    permissions: ['development.bugbounty'],
    category: 'development',
    closeable: true
  },
  {
    path: '/voting',
    component: VotingPage,
    tabId: 'Voting',
    label: 'Feature Voting',
    permissions: ['development.voting'],
    category: 'development',
    closeable: true
  },

  // === SYSTEM MANAGEMENT ===
  {
    path: '/license-management',
    component: LicenseManagement,
    tabId: 'LicenseManagement',
    label: 'License Management',
    permissions: ['system.license.manage'],
    category: 'system',
    closeable: true,
    roleRequired: 'admin'
  },

  // === USER PROFILE & SETTINGS ===
  {
    path: '/profile',
    component: UserProfile,
    tabId: 'UserProfile',
    label: 'User Profile',
    permissions: ['user.profile.view'],
    category: 'user',
    closeable: true
  },
  {
    path: '/settings',
    component: UserProfile, // Use the same component for settings
    tabId: 'Settings',
    label: 'Settings',
    permissions: ['user.settings.view'],
    category: 'user',
    closeable: true
  },

  // === ADDITIONAL ROUTES ===
  {
    path: '/product-catalog',
    component: lazy(() => import('../pages/ProductManagementPage.jsx')),
    tabId: 'ProductCatalog',
    label: 'Product Catalog',
    permissions: ['products.catalog.view'],
    category: 'products',
    closeable: true
  },
  {
    path: '/secure-vault',
    component: lazy(() => import('../pages/SecureVaultPage.jsx')),
    tabId: 'SecureVault',
    label: 'Secure Vault',
    permissions: ['security.vault.view'],
    category: 'security',
    closeable: true
  },
  {
    path: '/access-control',
    component: lazy(() => import('../pages/AccessControlPage.jsx')),
    tabId: 'AccessControl',
    label: 'Access Control',
    permissions: ['security.access.view'],
    category: 'security',
    closeable: true
  }
];

// Create lookup maps for performance with Object.freeze for immutability
export const PATH_TO_ROUTE_MAP = Object.freeze(PROTECTED_ROUTES.reduce((acc, route) => {
  acc[route.path] = route;
  return acc;
}, {}));

export const TAB_ID_TO_ROUTE_MAP = Object.freeze(PROTECTED_ROUTES.reduce((acc, route) => {
  if (route.tabId) {
    acc[route.tabId] = route;
  }
  return acc;
}, {}));

// Optimized route utilities with better error handling
export const getRouteByPath = (path) => {
  if (!path) return undefined;
  return PATH_TO_ROUTE_MAP[path];
};

export const getRouteByTabId = (tabId) => {
  if (!tabId) return undefined;
  return TAB_ID_TO_ROUTE_MAP[tabId];
};

// Permission utilities with optimized checking
export const hasRoutePermission = (route, userPermissions = []) => {
  // If no permissions required, allow access
  if (!route?.permissions || route.permissions.length === 0) return true;
  
  // Check if user has any of the required permissions
  return route.permissions.some(permission => 
    userPermissions.includes(permission)
  );
};

export const hasRouteRole = (route, userRole) => {
  // If no role required, allow access
  if (!route?.roleRequired) return true;
  
  // Super admin can access everything
  if (userRole === 'super_admin') return true;
  
  // Check if user has the required role
  return userRole === route.roleRequired;
};

// Service utilities
export const getRequiredServices = (route) => route?.services || [];

// Default route
export const DEFAULT_ROUTE = '/dashboard';

// Routes that should show in tabs with optimized filtering
export const TAB_ROUTES = Object.freeze(
  PROTECTED_ROUTES
    .filter(route => route.tabId)
    .map(route => route.path)
);

export default {
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  PATH_TO_ROUTE_MAP,
  TAB_ID_TO_ROUTE_MAP,
  getRouteByPath,
  getRouteByTabId,
  hasRoutePermission,
  hasRouteRole,
  getRequiredServices,
  DEFAULT_ROUTE,
  TAB_ROUTES
};