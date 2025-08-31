/**
 * PermissionService - Role-based access control service
 * Provides comprehensive permission checking, menu filtering, and feature access control
 */

import LicenseManager from './LicenseManager';
import { 
    USER_ROLES, 
    ROLE_HIERARCHY, 
    getRolePermissions,
    DEFAULT_LICENSED_PROGRAMS 
} from '../config/firebaseDefaults';

/**
 * Permission interface
 * @typedef {Object} Permission
 * @property {string} resource - Resource name
 * @property {string[]} actions - Allowed actions (view, edit, delete, add)
 * @property {Object} conditions - Additional conditions
 */

/**
 * MenuItem interface
 * @typedef {Object} MenuItem
 * @property {string} id - Menu item ID
 * @property {string} label - Display label
 * @property {string} path - Route path
 * @property {string[]} permissions - Required permissions
 * @property {boolean} licenseRequired - Whether license is required
 * @property {string} roleRequired - Minimum role required
 */

class PermissionService {
    constructor() {
        this.currentUser = null;
        this.currentPermissions = [];
        this.currentLicenseStatus = null;
        this.permissionCache = new Map();
        this.cacheTimeout = 2 * 60 * 1000; // 2 minutes
    }

    /**
     * Initialize permission service with current user
     * @param {Object} user - Current user object
     * @returns {Promise<void>}
     */
    async initialize(user) {
        try {
            this.currentUser = user;
            
            if (user?.uid) {
                this.currentLicenseStatus = await LicenseManager.checkUserLicense(user.uid);
                this.currentPermissions = this.currentLicenseStatus.permissions || [];
            } else {
                this.currentLicenseStatus = null;
                this.currentPermissions = [];
            }

            // Clear cache when user changes
            this.permissionCache.clear();

        } catch (error) {
            console.error('Error initializing permission service:', error);
            this.currentLicenseStatus = null;
            this.currentPermissions = [];
        }
    }

    /**
     * Check if user has specific permission for a resource and action
     * @param {string} action - Action to check (view, edit, delete, add)
     * @param {string} resource - Resource to check
     * @returns {boolean} Whether user has permission
     */
    hasPermission(action, resource = '*') {
        try {
            if (!this.currentUser || !this.currentLicenseStatus) {
                return false;
            }

            // Cache key for this permission check
            const cacheKey = `${action}_${resource}`;
            const cached = this.permissionCache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                return cached.result;
            }

            let hasPermission = false;

            // Super admin and admin have all permissions
            if (this.currentLicenseStatus.role === USER_ROLES.SUPER_ADMIN || 
                this.currentLicenseStatus.role === USER_ROLES.ADMIN) {
                hasPermission = true;
            } else {
                // Check role-based permissions
                const rolePermissions = getRolePermissions(this.currentLicenseStatus.role);
                
                switch (action) {
                    case 'view':
                    case 'read':
                        hasPermission = rolePermissions.canRead;
                        break;
                    case 'edit':
                    case 'update':
                        hasPermission = rolePermissions.canEdit;
                        break;
                    case 'delete':
                        hasPermission = rolePermissions.canDelete;
                        break;
                    case 'add':
                    case 'create':
                        hasPermission = rolePermissions.canEdit; // Edit permission includes create
                        break;
                    case 'manage_users':
                        hasPermission = rolePermissions.canManageUsers;
                        break;
                    case 'assign_roles':
                        hasPermission = rolePermissions.canAssignRoles;
                        break;
                    default:
                        hasPermission = false;
                }

                // Check specific resource permissions
                if (hasPermission && resource !== '*') {
                    hasPermission = this.checkResourcePermission(action, resource);
                }

                // Check license validity for licensed features
                if (hasPermission && this.isLicensedResource(resource)) {
                    hasPermission = this.currentLicenseStatus.isValid;
                }
            }

            // Cache the result
            this.permissionCache.set(cacheKey, {
                result: hasPermission,
                timestamp: Date.now()
            });

            return hasPermission;

        } catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    }

    /**
     * Get all permissions for current user
     * @param {string} userId - User ID (optional, uses current user if not provided)
     * @returns {Promise<Permission[]>} Array of permissions
     */
    async getPermissions(userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.uid;
            
            if (!targetUserId) {
                return [];
            }

            if (userId && userId !== this.currentUser?.uid) {
                // Get permissions for different user
                const licenseStatus = await LicenseManager.checkUserLicense(userId);
                return licenseStatus.permissions || [];
            }

            return this.currentPermissions;

        } catch (error) {
            console.error('Error getting permissions:', error);
            return [];
        }
    }

    /**
     * Check if user has access to a specific feature
     * @param {string} feature - Feature name
     * @returns {Promise<boolean>} Whether user has access
     */
    async checkFeatureAccess(feature) {
        try {
            if (!this.currentUser?.uid) {
                return false;
            }

            return await LicenseManager.validateFeatureAccess(feature, this.currentUser.uid);

        } catch (error) {
            console.error('Error checking feature access:', error);
            return false;
        }
    }

    /**
     * Filter menu items based on user permissions and license
     * @param {MenuItem[]} menuItems - Array of menu items
     * @returns {MenuItem[]} Filtered menu items
     */
    filterMenuItems(menuItems) {
        try {
            if (!this.currentUser || !this.currentLicenseStatus) {
                return [];
            }

            return menuItems.filter(item => this.canAccessMenuItem(item))
                           .map(item => this.filterMenuItemChildren(item));

        } catch (error) {
            console.error('Error filtering menu items:', error);
            return [];
        }
    }

    /**
     * Check if user can access a specific menu item
     * @param {MenuItem} menuItem - Menu item to check
     * @returns {boolean} Whether user can access the item
     */
    canAccessMenuItem(menuItem) {
        try {
            // Check role requirement
            if (menuItem.roleRequired) {
                const requiredLevel = ROLE_HIERARCHY[menuItem.roleRequired] || 0;
                const userLevel = ROLE_HIERARCHY[this.currentLicenseStatus.role] || 0;
                
                if (userLevel < requiredLevel) {
                    return false;
                }
            }

            // Check license requirement
            if (menuItem.licenseRequired && !this.currentLicenseStatus.isValid) {
                // Allow access for admin users even without valid license
                if (this.currentLicenseStatus.role !== USER_ROLES.SUPER_ADMIN && 
                    this.currentLicenseStatus.role !== USER_ROLES.ADMIN) {
                    return false;
                }
            }

            // Check specific permissions
            if (menuItem.permissions && menuItem.permissions.length > 0) {
                return menuItem.permissions.some(permission => {
                    const [action, resource] = permission.split(':');
                    return this.hasPermission(action, resource || '*');
                });
            }

            // Check feature access for licensed programs
            if (menuItem.featureId) {
                const hasFeatureAccess = this.currentLicenseStatus.features.includes(menuItem.featureId);
                if (!hasFeatureAccess && this.currentLicenseStatus.role !== USER_ROLES.SUPER_ADMIN && 
                    this.currentLicenseStatus.role !== USER_ROLES.ADMIN) {
                    return false;
                }
            }

            return true;

        } catch (error) {
            console.error('Error checking menu item access:', error);
            return false;
        }
    }

    /**
     * Filter children of a menu item
     * @param {MenuItem} menuItem - Menu item with potential children
     * @returns {MenuItem} Menu item with filtered children
     */
    filterMenuItemChildren(menuItem) {
        if (menuItem.children && menuItem.children.length > 0) {
            return {
                ...menuItem,
                children: menuItem.children
                    .filter(child => this.canAccessMenuItem(child))
                    .map(child => this.filterMenuItemChildren(child))
            };
        }
        return menuItem;
    }

    /**
     * Check resource-specific permissions
     * @param {string} action - Action to check
     * @param {string} resource - Resource to check
     * @returns {boolean} Whether user has permission for this resource
     */
    checkResourcePermission(action, resource) {
        try {
            // Check if user has specific permission for this resource
            const hasSpecificPermission = this.currentPermissions.some(permission => {
                return (permission.resource === resource || permission.resource === '*') &&
                       permission.actions.includes(action);
            });

            if (hasSpecificPermission) {
                return true;
            }

            // Check program-specific permissions
            if (DEFAULT_LICENSED_PROGRAMS[resource]) {
                const program = DEFAULT_LICENSED_PROGRAMS[resource];
                const licenseData = this.currentLicenseStatus;
                
                if (licenseData.programPermissions && licenseData.programPermissions[resource]) {
                    const programConfig = licenseData.programPermissions[resource];
                    return programConfig.enabled && programConfig.permissions[action];
                }
            }

            return false;

        } catch (error) {
            console.error('Error checking resource permission:', error);
            return false;
        }
    }

    /**
     * Check if a resource requires a license
     * @param {string} resource - Resource to check
     * @returns {boolean} Whether resource requires license
     */
    isLicensedResource(resource) {
        return DEFAULT_LICENSED_PROGRAMS[resource] && 
               !DEFAULT_LICENSED_PROGRAMS[resource].defaultEnabled;
    }

    /**
     * Get permission summary for current user
     * @returns {Object} Permission summary
     */
    getPermissionSummary() {
        if (!this.currentLicenseStatus) {
            return {
                role: 'none',
                licenseLevel: 'none',
                isValid: false,
                permissions: {
                    canRead: false,
                    canEdit: false,
                    canDelete: false,
                    canAdd: false,
                    canManageUsers: false,
                    canAssignRoles: false
                },
                features: [],
                expiryDate: null
            };
        }

        const rolePermissions = getRolePermissions(this.currentLicenseStatus.role);

        return {
            role: this.currentLicenseStatus.role,
            licenseLevel: this.currentLicenseStatus.level,
            isValid: this.currentLicenseStatus.isValid,
            permissions: {
                canRead: this.hasPermission('view'),
                canEdit: this.hasPermission('edit'),
                canDelete: this.hasPermission('delete'),
                canAdd: this.hasPermission('add'),
                canManageUsers: rolePermissions.canManageUsers,
                canAssignRoles: rolePermissions.canAssignRoles
            },
            features: this.currentLicenseStatus.features,
            expiryDate: this.currentLicenseStatus.expiryDate
        };
    }

    /**
     * Refresh permissions for current user
     * @returns {Promise<void>}
     */
    async refreshPermissions() {
        if (this.currentUser?.uid) {
            await this.initialize(this.currentUser);
        }
    }

    /**
     * Clear permission cache
     */
    clearCache() {
        this.permissionCache.clear();
    }

    /**
     * Get current user's license status
     * @returns {Object|null} Current license status
     */
    getCurrentLicenseStatus() {
        return this.currentLicenseStatus;
    }

    /**
     * Check if current user is admin
     * @returns {boolean} Whether user is admin
     */
    isAdmin() {
        return this.currentLicenseStatus?.role === USER_ROLES.ADMIN || 
               this.currentLicenseStatus?.role === USER_ROLES.SUPER_ADMIN;
    }

    /**
     * Check if current user can perform bulk operations
     * @returns {boolean} Whether user can perform bulk operations
     */
    canPerformBulkOperations() {
        return this.hasPermission('edit') && this.hasPermission('delete');
    }
}

// Export singleton instance
export default new PermissionService();