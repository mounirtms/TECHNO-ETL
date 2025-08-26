/**
 * Enhanced Base Grid Permissions System
 * Professional-grade access control for all grids and components
 * Integrates with license management and role-based access control
 */
import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { check_license_status, get_license_details } from '../../utils/licenseUtils';
import { USER_ROLES, getRolePermissions } from '../../config/firebaseDefaults';

// Grid Permission Context
const GridPermissionContext = createContext<any>(null);

export const useGridPermissions = () => {
    const context = useContext(GridPermissionContext);
    if(!context) {
        throw new Error('useGridPermissions must be used within a GridPermissionProvider');
    return context;
};

/**
 * Permission levels for grid operations
 */
export const PERMISSION_LEVELS = {
    NONE: 'none',
    READ: 'read',
    WRITE: 'write',
    DELETE: 'delete',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
};

/**
 * Default grid permissions structure
 */
export const DEFAULT_GRID_PERMISSIONS = {
    canView: false,
    canRead: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canImport: false,
    canBulkEdit: false,
    canManage: false,
    maxRows: 25,
    allowedActions: [],
    restrictedFields: [],
    level: PERMISSION_LEVELS.NONE
};

/**
 * Component-specific permission mappings
 */
export const COMPONENT_PERMISSIONS = {
    // Core Dashboard
    'Dashboard': {
        requiredLicense: true,
        minimumRole: USER_ROLES.USER,
        basePermissions: {
            canView: true,
            canRead: true,
            canExport: true,
            level: PERMISSION_LEVELS.READ
    },
    'Charts': {
        requiredLicense: true,
        minimumRole: USER_ROLES.USER,
        basePermissions: {
            canView: true,
            canRead: true,
            canExport: true,
            level: PERMISSION_LEVELS.READ
    },
    
    // MDM System
    'MDMProductsGrid': {
        requiredLicense: true,
        minimumRole: USER_ROLES.ADMIN,
        basePermissions: {
            canView: true,
            canRead: true,
            canEdit: true,
            canExport: true,
            canBulkEdit: true,
            maxRows: 100,
            level: PERMISSION_LEVELS.WRITE
    },
    'MDMStock': {
        requiredLicense: true,
        minimumRole: USER_ROLES.ADMIN,
        basePermissions: {
            canView: true,
            canRead: true,
            canEdit: true,
            canExport: true,
            level: PERMISSION_LEVELS.WRITE
    },
    'MDMSources': {
        requiredLicense: true,
        minimumRole: USER_ROLES.ADMIN,
        basePermissions: {
            canView: true,
            canRead: true,
            canEdit: true,
            canDelete: true,
            canExport: true,
            canImport: true,
            canManage: true,
            level: PERMISSION_LEVELS.DELETE
    },
    
    // Magento System
    'ProductsGrid': {
        requiredLicense: true,
        minimumRole: USER_ROLES.ADMIN,
        basePermissions: {
            canView: true,
            canRead: true,
            canEdit: true,
            canExport: true,
            canBulkEdit: true,
            maxRows: 50,
            level: PERMISSION_LEVELS.WRITE
    },
    'OrdersGrid': {
        requiredLicense: true,
        minimumRole: USER_ROLES.USER,
        basePermissions: {
            canView: true,
            canRead: true,
            canExport: true,
            restrictedFields: ['payment_info', 'customer_notes'],
            level: PERMISSION_LEVELS.READ
    },
    'CustomersGrid': {
        requiredLicense: true,
        minimumRole: USER_ROLES.ADMIN,
        basePermissions: {
            canView: true,
            canRead: true,
            canEdit: true,
            canExport: true,
            restrictedFields: ['password_hash', 'payment_methods'],
            level: PERMISSION_LEVELS.WRITE
    },
    'InvoicesGrid': {
        requiredLicense: true,
        minimumRole: USER_ROLES.USER,
        basePermissions: {
            canView: true,
            canRead: true,
            canExport: true,
            level: PERMISSION_LEVELS.READ
    },
    
    // System Management
    'LicenseManagement': {
        requiredLicense: false, // Always accessible for admins
        minimumRole: USER_ROLES.SUPER_ADMIN,
        basePermissions: {
            canView: true,
            canRead: true,
            canEdit: true,
            canDelete: true,
            canManage: true,
            level: PERMISSION_LEVELS.SUPER_ADMIN
    },
    'LicenseStatus': {
        requiredLicense: false, // Always accessible to check license
        minimumRole: USER_ROLES.USER,
        basePermissions: {
            canView: true,
            canRead: true,
            level: PERMISSION_LEVELS.READ
};

/**
 * Enhanced Permission Provider with Professional Features
 */
export const GridPermissionProvider: React.FC<{children: any}> = ({ children  }) => {
    const { currentUser } = useAuth();
    
    // Permission cache for performance
    const permissionCache = useMemo(() => new Map(), []);
    
    /**
     * Check if user has required license
     */
    const checkLicense = useCallback(async (componentId) => {
        if (!currentUser) return false;
        
        const cacheKey = `license_${currentUser.uid}_${componentId}`;
        if (permissionCache.has(cacheKey)) {
            return permissionCache.get(cacheKey);
        try {
            // For development/localhost, always return true
            if(window.location.hostname === 'localhost' || import.meta.env.DEV) {
                permissionCache.set(cacheKey, true);
                return true;
            const hasLicense = await check_license_status(currentUser.uid);
            permissionCache.set(cacheKey, hasLicense);
            return hasLicense;
        } catch(error: any) {
            console.error('License check failed:', error);
            return false;
    }, [currentUser, permissionCache]);
    
    /**
     * Get user role and validate hierarchy
     */
    const getUserRole = useCallback(() => {
        if (!currentUser) return USER_ROLES.VIEWER;
        return currentUser.role || USER_ROLES.USER;
    }, [currentUser]);
    
    /**
     * Check if user role meets minimum requirement
     */
    const checkRolePermission = useCallback((minimumRole) => {
        const userRole = getUserRole();
        const roleHierarchy = {
            [USER_ROLES.VIEWER]: 0,
            [USER_ROLES.USER]: 1,
            [USER_ROLES.ADMIN]: 2,
            [USER_ROLES.ADMIN]: 3,
            [USER_ROLES.SUPER_ADMIN]: 4
        };
        
        return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
    }, [getUserRole]);
    
    /**
     * Calculate comprehensive permissions for a component
     */
    const calculatePermissions = useCallback(async (componentId, customPermissions = {}) => {
        const componentConfig = COMPONENT_PERMISSIONS[componentId];
        
        if(!componentConfig) {
            console.warn(`No permission configuration found for component: ${componentId}`);
            return { ...DEFAULT_GRID_PERMISSIONS, ...customPermissions };
        // Base permissions from configuration
        let permissions = { ...DEFAULT_GRID_PERMISSIONS,
            ...componentConfig.basePermissions,
            ...customPermissions
        };
        
        // Check license requirement
        if(componentConfig.requiredLicense) {
            const hasLicense = await checkLicense(componentId);
            if(!hasLicense) {
                return { ...DEFAULT_GRID_PERMISSIONS,
                    canView: false,
                    level: PERMISSION_LEVELS.NONE,
                    licenseRequired: true
                };
        // Check role requirement
        const hasRolePermission = checkRolePermission(componentConfig.minimumRole);
        if(!hasRolePermission) {
            return { ...DEFAULT_GRID_PERMISSIONS,
                canView: false,
                level: PERMISSION_LEVELS.NONE,
                insufficientRole: true,
                requiredRole: componentConfig.minimumRole
            };
        // Apply user-specific license details
        try {
            const licenseDetails = await get_license_details(currentUser?.uid);
            if(licenseDetails) {
                // Override permissions based on license details
                permissions
                    canRead: permissions.canRead && (licenseDetails.canRead !== false),
                    canEdit: permissions.canEdit && (licenseDetails.canEdit !== false),
                    canDelete: permissions.canDelete && (licenseDetails.canDelete !== false),
                    licenseType: licenseDetails.licenseType,
                    licenseValid: licenseDetails.isValid
                };
        } catch(error: any) {
            console.warn('Failed to get license details:', error);
        return permissions;
    }, [currentUser, checkLicense, checkRolePermission]);
    
    /**
     * Check specific permission for an action
     */
    const hasPermission = useCallback(async (componentId, action, customPermissions = {}) => {
        const permissions = await calculatePermissions(componentId, customPermissions);
        
        const actionMap = {
            'view': permissions.canView,
            'read': permissions.canRead,
            'create': permissions.canCreate,
            'edit': permissions.canEdit,
            'delete': permissions.canDelete,
            'export': permissions.canExport,
            'import': permissions.canImport,
            'bulk_edit': permissions.canBulkEdit,
            'manage': permissions.canManage
        };
        
        return actionMap[action] || false;
    }, [calculatePermissions]);
    
    /**
     * Get allowed actions for a component
     */
    const getAllowedActions = useCallback(async (componentId, customPermissions = {}) => {
        const permissions = await calculatePermissions(componentId, customPermissions);
        const actions = [];
        
        if (permissions.canView) actions.push('view');
        if (permissions.canRead) actions.push('read');
        if (permissions.canCreate) actions.push('create');
        if (permissions.canEdit) actions.push('edit');
        if (permissions.canDelete) actions.push('delete');
        if (permissions.canExport) actions.push('export');
        if (permissions.canImport) actions.push('import');
        if (permissions.canBulkEdit) actions.push('bulk_edit');
        if (permissions.canManage) actions.push('manage');
        
        return actions;
    }, [calculatePermissions]);
    
    /**
     * Check if field should be restricted
     */
    const isFieldRestricted = useCallback(async (componentId, fieldName, customPermissions = {}) => {
        const permissions = await calculatePermissions(componentId, customPermissions);
        return permissions.restrictedFields?.includes(fieldName) || false;
    }, [calculatePermissions]);
    
    /**
     * Get maximum allowed rows for pagination
     */
    const getMaxRows = useCallback(async (componentId, customPermissions = {}) => {
        const permissions = await calculatePermissions(componentId, customPermissions);
        return permissions.maxRows || 25;
    }, [calculatePermissions]);
    
    // Context value
    const contextValue = useMemo(() => ({
        calculatePermissions,
        hasPermission,
        getAllowedActions,
        isFieldRestricted,
        getMaxRows,
        checkLicense,
        getUserRole,
        checkRolePermission,
        PERMISSION_LEVELS,
        COMPONENT_PERMISSIONS
    }), [
        calculatePermissions,
        hasPermission,
        getAllowedActions,
        isFieldRestricted,
        getMaxRows,
        checkLicense,
        getUserRole,
        checkRolePermission
    ]);
    
    return (
        <GridPermissionContext.Provider value={contextValue}>
            {children}
        </GridPermissionContext.Provider>
    );
};

/**
 * HOC for wrapping components with permission checks
 */
export const withPermissions = (WrappedComponent, componentId, requiredPermissions = ['view']) => {
    return React.forwardRef((props, ref) => {
        const { hasPermission } = useGridPermissions();
        const [allowed, setAllowed] = React.useState(false);
        const [loading, setLoading] = React.useState(true);
        
        React.useEffect(() => {
            const checkPermissions = async () => {
                try {
                    const permissionPromises = requiredPermissions.map((permission: any) => 
                        hasPermission(componentId, permission, props.customPermissions)
                    );
                    
                    const results = await Promise.all(permissionPromises);
                    const hasAllPermissions = results.every(result => result ===true);
                    
                    setAllowed(hasAllPermissions);
                } catch(error: any) {
                    console.error('Permission check failed:', error);
                    setAllowed(false);
                } finally {
                    setLoading(false);
            };
            
            checkPermissions();
        }, [hasPermission, props.customPermissions]);
        
        if(loading) {
            return <div>Checking permissions...</div>;
        if(!allowed) {
            return (
                <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#666',
                    border: '1px dashed #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <h3>Access Restricted</h3>
                    <p>You don't have sufficient permissions to access this component.</p>
                    <p>Required permissions: {requiredPermissions.join(', ')}</p>
                </div>
            );
        return <WrappedComponent { ...props} ref={ref} componentId={componentId} />;
    });
};

export default GridPermissionProvider;
