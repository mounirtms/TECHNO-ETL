import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PermissionService from '../services/PermissionService';
import LicenseManager from '../services/LicenseManager';
import { useAuth } from './AuthContext';

const PermissionContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }

  return context;
};

export const useLicense = () => {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error('useLicense must be used within a PermissionProvider');
  }

  return {
    licenseStatus: context.licenseStatus,
    checkFeatureAccess: context.checkFeatureAccess,
    refreshLicense: context.refreshLicense,
    isLicenseValid: context.isLicenseValid,
    getLicenseLevel: context.getLicenseLevel,
  };
};

export const PermissionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize permission service when user changes
  const initializePermissions = useCallback(async (user) => {
    try {
      setLoading(true);

      if (user?.uid) {
        // Initialize permission service
        await PermissionService.initialize(user);

        // Get current permissions and license status
        const [userPermissions, userLicenseStatus] = await Promise.all([
          PermissionService.getPermissions(),
          LicenseManager.checkUserLicense(user.uid),
        ]);

        setPermissions(userPermissions);
        setLicenseStatus(userLicenseStatus);
        setInitialized(true);
      } else {
        // Clear permissions when no user
        setPermissions([]);
        setLicenseStatus(null);
        setInitialized(false);
      }
    } catch (error) {
      console.error('Error initializing permissions:', error);
      setPermissions([]);
      setLicenseStatus(null);
      setInitialized(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize permissions when user changes
  useEffect(() => {
    initializePermissions(currentUser);
  }, [currentUser, initializePermissions]);

  // Set up license change listener
  useEffect(() => {
    let unsubscribe = null;

    if (currentUser?.uid && initialized) {
      unsubscribe = LicenseManager.listenToLicenseChanges(
        currentUser.uid,
        async (licenseData) => {
          try {
            // Refresh license status when it changes
            const updatedLicenseStatus = await LicenseManager.checkUserLicense(currentUser.uid);

            setLicenseStatus(updatedLicenseStatus);

            // Refresh permissions as they might have changed
            await PermissionService.refreshPermissions();
            const updatedPermissions = await PermissionService.getPermissions();

            setPermissions(updatedPermissions);
          } catch (error) {
            console.error('Error handling license change:', error);
          }
        },
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser?.uid, initialized]);

  // Permission checking functions
  const hasPermission = useCallback((action, resource = '*') => {
    if (!initialized) return false;

    return PermissionService.hasPermission(action, resource);
  }, [initialized]);

  const checkFeatureAccess = useCallback(async (feature) => {
    if (!initialized || !currentUser?.uid) return false;

    return await PermissionService.checkFeatureAccess(feature);
  }, [initialized, currentUser?.uid]);

  const filterMenuItems = useCallback((menuItems) => {
    if (!initialized) return [];

    return PermissionService.filterMenuItems(menuItems);
  }, [initialized]);

  const canAccessMenuItem = useCallback((menuItem) => {
    if (!initialized) return false;

    return PermissionService.canAccessMenuItem(menuItem);
  }, [initialized]);

  // License-specific functions
  const isLicenseValid = useCallback(() => {
    return licenseStatus?.isValid || false;
  }, [licenseStatus]);

  const getLicenseLevel = useCallback(() => {
    return licenseStatus?.level || 'basic';
  }, [licenseStatus]);

  const refreshLicense = useCallback(async () => {
    if (currentUser?.uid) {
      try {
        const updatedLicenseStatus = await LicenseManager.checkUserLicense(currentUser.uid);

        setLicenseStatus(updatedLicenseStatus);

        return updatedLicenseStatus;
      } catch (error) {
        console.error('Error refreshing license:', error);

        return null;
      }
    }

    return null;
  }, [currentUser?.uid]);

  // Permission summary for debugging/admin purposes
  const getPermissionSummary = useCallback(() => {
    if (!initialized) return null;

    return PermissionService.getPermissionSummary();
  }, [initialized]);

  // Admin functions
  const isAdmin = useCallback(() => {
    if (!initialized) return false;

    return PermissionService.isAdmin();
  }, [initialized]);

  const canPerformBulkOperations = useCallback(() => {
    if (!initialized) return false;

    return PermissionService.canPerformBulkOperations();
  }, [initialized]);

  // Refresh all permissions and license data
  const refreshPermissions = useCallback(async () => {
    if (currentUser?.uid) {
      await initializePermissions(currentUser);
    }
  }, [currentUser, initializePermissions]);

  const value = {
    // State
    permissions,
    licenseStatus,
    loading,
    initialized,

    // Permission functions
    hasPermission,
    checkFeatureAccess,
    filterMenuItems,
    canAccessMenuItem,
    getPermissionSummary,

    // License functions
    isLicenseValid,
    getLicenseLevel,
    refreshLicense,

    // Admin functions
    isAdmin,
    canPerformBulkOperations,

    // Utility functions
    refreshPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;
