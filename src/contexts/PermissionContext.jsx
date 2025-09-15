import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getServiceWithFallback } from '../services/FallbackServices';
import { useAuth } from './AuthContext';

// Get services with fallback
const PermissionService = getServiceWithFallback('PermissionService');
const LicenseManager = getServiceWithFallback('LicenseManager');

const PermissionContext = createContext();

/**
 * Enhanced usePermissions hook with better error handling and defaults
 */
export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        console.warn('usePermissions must be used within a PermissionProvider');
        // Return safe defaults
        return {
            permissions: [],
            userPermissions: [],
            userRole: 'user',
            licenseStatus: null,
            loading: false,
            initialized: false,
            hasPermission: () => false,
            hasRole: () => false,
            checkFeatureAccess: () => Promise.resolve(false),
            filterMenuItems: (items) => [],
            canAccessMenuItem: () => false,
            isLicenseValid: () => false,
            getLicenseLevel: () => 'basic',
            refreshLicense: () => Promise.resolve(null),
            isAdmin: () => false,
            canPerformBulkOperations: () => false,
            refreshPermissions: () => Promise.resolve()
        };
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
        getLicenseLevel: context.getLicenseLevel
    };
};

export const PermissionProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [userRole, setUserRole] = useState('user');
    const [licenseStatus, setLicenseStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Initialize permission service when user changes
    const initializePermissions = useCallback(async (user) => {
        try {
            setLoading(true);
            
            if (user?.uid) {
                try {
                    // Try to initialize permission service
                    if (PermissionService && typeof PermissionService.initialize === 'function') {
                        await PermissionService.initialize(user);
                        
                        // Get current permissions and license status
                        const [userPermissions, userLicenseStatus] = await Promise.all([
                            PermissionService.getPermissions(),
                            LicenseManager?.checkUserLicense ? 
                                LicenseManager.checkUserLicense(user.uid) : 
                                Promise.resolve({ isValid: true, level: 'basic' })
                        ]);

                        setPermissions(userPermissions || []);
                        setUserRole(user.role || 'user');
                        setLicenseStatus(userLicenseStatus);
                        setInitialized(true);
                    } else {
                        // Fallback: set basic permissions
                        console.warn('PermissionService not available, using fallback permissions');
                        setPermissions(['dashboard.view', 'user.profile.view']);
                        setUserRole(user.role || 'user');
                        setLicenseStatus({ isValid: true, level: 'basic' });
                        setInitialized(true);
                    }
                } catch (serviceError) {
                    console.warn('Permission service error, using fallback:', serviceError);
                    // Fallback permissions for basic functionality
                    setPermissions(['dashboard.view', 'user.profile.view']);
                    setUserRole(user.role || 'user');
                    setLicenseStatus({ isValid: true, level: 'basic' });
                    setInitialized(true);
                }
            } else {
                // Clear permissions when no user
                setPermissions([]);
                setUserRole('user');
                setLicenseStatus(null);
                setInitialized(false);
            }
        } catch (error) {
            console.error('Error initializing permissions:', error);
            // Set safe defaults
            setPermissions([]);
            setUserRole('user');
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
                }
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

    // Role checking functions
    const hasRole = useCallback((role) => {
        if (!initialized) return false;
        return userRole === role || userRole === 'super_admin';
    }, [initialized, userRole]);

    // Admin functions
    const isAdmin = useCallback(() => {
        if (!initialized) return false;
        return hasRole('admin') || hasRole('super_admin');
    }, [initialized, hasRole]);

    const canPerformBulkOperations = useCallback(() => {
        if (!initialized) return false;
        return hasPermission('bulk.operations') || isAdmin();
    }, [initialized, hasPermission, isAdmin]);

    // Refresh all permissions and license data
    const refreshPermissions = useCallback(async () => {
        if (currentUser?.uid) {
            await initializePermissions(currentUser);
        }
    }, [currentUser, initializePermissions]);

    // Memoized user permissions array for compatibility
    const userPermissions = useMemo(() => permissions, [permissions]);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        // State
        permissions,
        userPermissions,
        userRole,
        licenseStatus,
        loading,
        initialized,

        // Permission functions
        hasPermission,
        hasRole,
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
        refreshPermissions
    }), [
        // State dependencies
        JSON.stringify(permissions),
        userRole,
        JSON.stringify(licenseStatus),
        loading,
        initialized,
        
        // Function dependencies (these are already memoized with useCallback)
        hasPermission,
        hasRole,
        checkFeatureAccess,
        filterMenuItems,
        canAccessMenuItem,
        getPermissionSummary,
        isLicenseValid,
        getLicenseLevel,
        refreshLicense,
        isAdmin,
        canPerformBulkOperations,
        refreshPermissions
    ]);

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};

export default PermissionContext;