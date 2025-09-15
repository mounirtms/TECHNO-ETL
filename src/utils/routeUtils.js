import { MENU_ITEMS } from '../components/Layout/MenuTree.js';
import { ROUTES, ROUTE_METADATA } from '../config/routes';

/**
 * Route utilities for enhanced routing with permission integration
 */

/**
 * Get menu item by route path
 */
export const getMenuItemByPath = (path) => {
  return MENU_ITEMS.find(item => item.path === path);
};

/**
 * Get menu item by ID
 */
export const getMenuItemById = (id) => {
  return MENU_ITEMS.find(item => item.id === id);
};

/**
 * Check if a route requires authentication
 */
export const requiresAuth = (path) => {
  const metadata = ROUTE_METADATA[path];

  return metadata?.requiresAuth !== false;
};

/**
 * Check if a route requires specific permissions
 */
export const getRoutePermissions = (path) => {
  const menuItem = getMenuItemByPath(path);

  return menuItem?.permissions || [];
};

/**
 * Check if a route requires a specific role
 */
export const getRouteRole = (path) => {
  const menuItem = getMenuItemByPath(path);

  return menuItem?.roleRequired || null;
};

/**
 * Check if a route requires a license
 */
export const requiresLicense = (path) => {
  const menuItem = getMenuItemByPath(path);

  return menuItem?.licenseRequired === true;
};

/**
 * Get all routes that a user can access based on permissions
 */
export const getAccessibleRoutes = (userPermissions, userRole, licenseLevel) => {
  return MENU_ITEMS.filter(item => {
    // Check license requirement
    if (item.licenseRequired && !licenseLevel) {
      return false;
    }

    // Check role requirement
    if (item.roleRequired) {
      const roleHierarchy = ['user', 'manager', 'admin', 'super_admin'];
      const userRoleIndex = roleHierarchy.indexOf(userRole);
      const requiredRoleIndex = roleHierarchy.indexOf(item.roleRequired);

      if (userRoleIndex < requiredRoleIndex) {
        return false;
      }
    }

    // Check permissions
    if (item.permissions && item.permissions.length > 0) {
      return item.permissions.some(permission =>
        userPermissions.includes(permission),
      );
    }

    return true;
  });
};

/**
 * Get route breadcrumb
 */
export const getRouteBreadcrumb = (path) => {
  const metadata = ROUTE_METADATA[path];
  const menuItem = getMenuItemByPath(path);

  return {
    title: menuItem?.label || metadata?.title || 'Unknown Page',
    path: path,
    icon: menuItem?.icon || metadata?.icon,
  };
};

/**
 * Generate navigation breadcrumbs for a route
 */
export const generateBreadcrumbs = (path) => {
  const breadcrumbs = [];

  // Always start with Dashboard
  breadcrumbs.push({
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'Dashboard',
  });

  // Add current page if it's not dashboard
  if (path !== '/dashboard') {
    const currentBreadcrumb = getRouteBreadcrumb(path);

    if (currentBreadcrumb.title !== 'Unknown Page') {
      breadcrumbs.push(currentBreadcrumb);
    }
  }

  return breadcrumbs;
};

/**
 * Check if a route is valid and accessible
 */
export const isValidRoute = (path, userPermissions, userRole, licenseLevel) => {
  const menuItem = getMenuItemByPath(path);

  if (!menuItem) {
    // Check if it's a system route
    const systemRoutes = ['/login', '/docs'];

    return systemRoutes.includes(path);
  }

  // Check license requirement
  if (menuItem.licenseRequired && !licenseLevel) {
    return false;
  }

  // Check role requirement
  if (menuItem.roleRequired) {
    const roleHierarchy = ['user', 'manager', 'admin', 'super_admin'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const requiredRoleIndex = roleHierarchy.indexOf(menuItem.roleRequired);

    if (userRoleIndex < requiredRoleIndex) {
      return false;
    }
  }

  // Check permissions
  if (menuItem.permissions && menuItem.permissions.length > 0) {
    return menuItem.permissions.some(permission =>
      userPermissions.includes(permission),
    );
  }

  return true;
};

/**
 * Get default route for a user based on their permissions
 */
export const getDefaultRoute = (userPermissions, userRole, licenseLevel) => {
  // Always try dashboard first
  if (isValidRoute('/dashboard', userPermissions, userRole, licenseLevel)) {
    return '/dashboard';
  }

  // Find the first accessible route
  const accessibleRoutes = getAccessibleRoutes(userPermissions, userRole, licenseLevel);

  if (accessibleRoutes.length > 0) {
    return accessibleRoutes[0].path;
  }

  // Fallback to dashboard (should always be accessible)
  return '/dashboard';
};

/**
 * Route validation middleware
 */
export const validateRoute = (path, userContext) => {
  const { permissions = [], role = 'user', licenseLevel = null } = userContext;

  return {
    isValid: isValidRoute(path, permissions, role, licenseLevel),
    menuItem: getMenuItemByPath(path),
    metadata: ROUTE_METADATA[path],
    breadcrumbs: generateBreadcrumbs(path),
    defaultRoute: getDefaultRoute(permissions, role, licenseLevel),
  };
};

export default {
  getMenuItemByPath,
  getMenuItemById,
  requiresAuth,
  getRoutePermissions,
  getRouteRole,
  requiresLicense,
  getAccessibleRoutes,
  getRouteBreadcrumb,
  generateBreadcrumbs,
  isValidRoute,
  getDefaultRoute,
  validateRoute,
};
