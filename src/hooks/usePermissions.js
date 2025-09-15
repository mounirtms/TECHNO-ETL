import { useContext, useCallback, useMemo } from 'react';
import { usePermissions as usePermissionContext } from '../contexts/PermissionContext';

/**
 * Custom hook for permission checking
 * Provides convenient methods for checking user permissions
 */
export const usePermissions = () => {
  const context = usePermissionContext();

  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }

  const {
    permissions,
    hasPermission,
    filterMenuItems,
    canAccessMenuItem,
    getPermissionSummary,
    isAdmin,
    canPerformBulkOperations,
    refreshPermissions,
    loading,
    initialized,
  } = context;

  // Convenience methods for common permission checks
  const canView = useCallback((resource = '*') => {
    return hasPermission('view', resource);
  }, [hasPermission]);

  const canEdit = useCallback((resource = '*') => {
    return hasPermission('edit', resource);
  }, [hasPermission]);

  const canDelete = useCallback((resource = '*') => {
    return hasPermission('delete', resource);
  }, [hasPermission]);

  const canAdd = useCallback((resource = '*') => {
    return hasPermission('add', resource);
  }, [hasPermission]);

  const canManageUsers = useCallback(() => {
    return hasPermission('manage_users');
  }, [hasPermission]);

  const canAssignRoles = useCallback(() => {
    return hasPermission('assign_roles');
  }, [hasPermission]);

  // Check multiple permissions at once
  const hasAnyPermission = useCallback((permissionChecks) => {
    return permissionChecks.some(({ action, resource }) =>
      hasPermission(action, resource),
    );
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissionChecks) => {
    return permissionChecks.every(({ action, resource }) =>
      hasPermission(action, resource),
    );
  }, [hasPermission]);

  // Get CRUD permissions for a resource
  const getCrudPermissions = useCallback((resource = '*') => {
    return {
      canView: hasPermission('view', resource),
      canEdit: hasPermission('edit', resource),
      canDelete: hasPermission('delete', resource),
      canAdd: hasPermission('add', resource),
    };
  }, [hasPermission]);

  // Memoized permission summary
  const permissionSummary = useMemo(() => {
    if (!initialized) return null;

    return getPermissionSummary();
  }, [initialized, getPermissionSummary]);

  return {
    // State
    permissions,
    loading,
    initialized,
    permissionSummary,

    // Basic permission checks
    hasPermission,
    canView,
    canEdit,
    canDelete,
    canAdd,

    // Advanced permission checks
    hasAnyPermission,
    hasAllPermissions,
    getCrudPermissions,

    // Admin functions
    canManageUsers,
    canAssignRoles,
    isAdmin,
    canPerformBulkOperations,

    // Menu functions
    filterMenuItems,
    canAccessMenuItem,

    // Utility functions
    refreshPermissions,
  };
};

export default usePermissions;
