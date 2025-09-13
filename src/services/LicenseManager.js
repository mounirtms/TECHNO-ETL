/**
 * LicenseManager - Enhanced license management service with Firebase integration
 * Provides comprehensive license validation, feature access control, and user management
 */

import { database } from '../config/firebase';
import { ref, get, set, onValue, off } from 'firebase/database';
import { 
    LICENSE_TYPES, 
    createDefaultUserLicense, 
    USER_ROLES,
    ROLE_HIERARCHY 
} from '../config/firebaseDefaults';

/**
 * License status interface
 * @typedef {Object} LicenseStatus
 * @property {boolean} isValid - Whether the license is currently valid
 * @property {'basic'|'professional'|'enterprise'|'admin'} level - License level
 * @property {Date} expiryDate - When the license expires
 * @property {string[]} features - Available features
 * @property {Permission[]} permissions - User permissions
 */

/**
 * License interface
 * @typedef {Object} License
 * @property {string} id - License ID
 * @property {string} userId - User ID
 * @property {string} level - License level
 * @property {string[]} features - Available features
 * @property {boolean} isValid - License validity
 * @property {Date} expiryDate - Expiry date
 * @property {number} maxUsers - Maximum users allowed
 */

class LicenseManager {
    constructor() {
        this.cache = new Map();
        this.listeners = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Sanitize user ID for Firebase key usage
     * @param {string} userId - User ID to sanitize
     * @returns {string} Sanitized user ID
     */
    sanitizeUserId(userId) {
        return userId.replace(/[.#$\[\]]/g, '_');
    }

    /**
     * Check user license status with caching
     * @param {string} userId - User ID to check
     * @returns {Promise<LicenseStatus>} License status
     */
    async checkUserLicense(userId) {
        try {
            // Check cache first
            const cacheKey = `license_${userId}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                return cached.data;
            }

            const sanitizedUserId = this.sanitizeUserId(userId);
            const licenseRef = ref(database, `licenses/${sanitizedUserId}`);
            const userRef = ref(database, `users/${sanitizedUserId}`);

            const [licenseSnapshot, userSnapshot] = await Promise.all([
                get(licenseRef),
                get(userRef)
            ]);

            let licenseData = null;
            let userData = null;

            if (licenseSnapshot.exists()) {
                licenseData = licenseSnapshot.val();
            }

            if (userSnapshot.exists()) {
                userData = userSnapshot.val();
            }

            // Create default license if none exists
            if (!licenseData) {
                licenseData = createDefaultUserLicense(userId, 'FREE');
                await set(licenseRef, licenseData);
            }

            // Determine license level based on role and license type
            const userRole = userData?.role || USER_ROLES.USER;
            const licenseLevel = this.determineLicenseLevel(licenseData, userRole);

            // Check expiry
            const now = new Date();
            const expiryDate = licenseData.expiryDate ? new Date(licenseData.expiryDate) : null;
            const isExpired = expiryDate && expiryDate <= now;

            const licenseStatus = {
                isValid: licenseData.isValid && !isExpired,
                level: licenseLevel,
                expiryDate: expiryDate,
                features: licenseData.features || [],
                permissions: this.extractPermissions(licenseData, userData),
                licenseType: licenseData.licenseType || 'free',
                maxUsers: licenseData.maxUsers || 3,
                role: userRole
            };

            // Cache the result
            this.cache.set(cacheKey, {
                data: licenseStatus,
                timestamp: Date.now()
            });

            return licenseStatus;

        } catch (error) {
            console.error('Error checking user license:', error);
            
            // Return minimal valid license on error
            return {
                isValid: false,
                level: 'basic',
                expiryDate: null,
                features: [],
                permissions: [],
                licenseType: 'free',
                maxUsers: 1,
                role: USER_ROLES.USER
            };
        }
    }

    /**
     * Validate feature access for a user
     * @param {string} feature - Feature to check
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Whether user has access
     */
    async validateFeatureAccess(feature, userId) {
        try {
            const licenseStatus = await this.checkUserLicense(userId);
            
            // Admin users have access to all features
            if (licenseStatus.role === USER_ROLES.SUPER_ADMIN || 
                licenseStatus.role === USER_ROLES.ADMIN) {
                return true;
            }

            // Check if feature is in allowed features
            return licenseStatus.isValid && licenseStatus.features.includes(feature);

        } catch (error) {
            console.error('Error validating feature access:', error);
            return false;
        }
    }

    /**
     * Get license level for a user
     * @param {string} userId - User ID
     * @returns {Promise<string>} License level
     */
    async getLicenseLevel(userId) {
        try {
            const licenseStatus = await this.checkUserLicense(userId);
            return licenseStatus.level;
        } catch (error) {
            console.error('Error getting license level:', error);
            return 'basic';
        }
    }

    /**
     * Update license status for a user
     * @param {string} userId - User ID
     * @param {License} license - License data to update
     * @returns {Promise<void>}
     */
    async updateLicenseStatus(userId, license) {
        try {
            const sanitizedUserId = this.sanitizeUserId(userId);
            const licenseRef = ref(database, `licenses/${sanitizedUserId}`);

            // Get current license data
            const currentSnapshot = await get(licenseRef);
            const currentLicense = currentSnapshot.exists() ? currentSnapshot.val() : {};

            // Merge with new license data
            const updatedLicense = {
                ...currentLicense,
                ...license,
                updatedAt: new Date().toISOString(),
                updatedBy: 'system' // Could be enhanced to track who made the change
            };

            await set(licenseRef, updatedLicense);

            // Clear cache for this user
            this.cache.delete(`license_${userId}`);

            console.log(`License updated for user ${userId}`);

        } catch (error) {
            console.error('Error updating license status:', error);
            throw error;
        }
    }

    /**
     * Listen to license changes for a user
     * @param {string} userId - User ID to listen for
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    listenToLicenseChanges(userId, callback) {
        const sanitizedUserId = this.sanitizeUserId(userId);
        const licenseRef = ref(database, `licenses/${sanitizedUserId}`);

        const listener = onValue(licenseRef, (snapshot) => {
            if (snapshot.exists()) {
                const licenseData = snapshot.val();
                // Clear cache when data changes
                this.cache.delete(`license_${userId}`);
                callback(licenseData);
            }
        });

        // Store listener for cleanup
        this.listeners.set(userId, { ref: licenseRef, listener });

        // Return unsubscribe function
        return () => {
            off(licenseRef, listener);
            this.listeners.delete(userId);
        };
    }

    /**
     * Determine license level based on license data and user role
     * @param {Object} licenseData - License data
     * @param {string} userRole - User role
     * @returns {string} License level
     */
    determineLicenseLevel(licenseData, userRole) {
        // Admin roles get admin level
        if (userRole === USER_ROLES.SUPER_ADMIN || userRole === USER_ROLES.ADMIN) {
            return 'admin';
        }

        // Map license types to levels
        const licenseType = licenseData.licenseType || 'free';
        const levelMap = {
            'free': 'basic',
            'basic': 'basic',
            'professional': 'professional',
            'enterprise': 'enterprise'
        };

        return levelMap[licenseType] || 'basic';
    }

    /**
     * Extract permissions from license and user data
     * @param {Object} licenseData - License data
     * @param {Object} userData - User data
     * @returns {Array} Permissions array
     */
    extractPermissions(licenseData, userData) {
        const permissions = [];
        const userRole = userData?.role || USER_ROLES.USER;
        const roleLevel = ROLE_HIERARCHY[userRole] || 0;

        // Basic permissions based on role
        if (roleLevel >= ROLE_HIERARCHY[USER_ROLES.VIEWER]) {
            permissions.push({ resource: '*', actions: ['view'] });
        }

        if (roleLevel >= ROLE_HIERARCHY[USER_ROLES.USER]) {
            permissions.push({ resource: '*', actions: ['view', 'edit'] });
        }

        if (roleLevel >= ROLE_HIERARCHY[USER_ROLES.MANAGER]) {
            permissions.push({ resource: '*', actions: ['view', 'edit', 'delete'] });
        }

        if (roleLevel >= ROLE_HIERARCHY[USER_ROLES.ADMIN]) {
            permissions.push({ resource: '*', actions: ['view', 'edit', 'delete', 'add'] });
        }

        // Add license-specific permissions
        if (licenseData.programPermissions) {
            Object.entries(licenseData.programPermissions).forEach(([program, config]) => {
                if (config.enabled && config.permissions) {
                    Object.entries(config.permissions).forEach(([action, allowed]) => {
                        if (allowed) {
                            permissions.push({
                                resource: program,
                                actions: [action],
                                conditions: { licenseRequired: true }
                            });
                        }
                    });
                }
            });
        }

        return permissions;
    }

    /**
     * Get all users with their license status
     * @returns {Promise<Array>} Array of users with license status
     */
    async getAllUsersWithLicenses() {
        try {
            const usersRef = ref(database, 'users');
            const licensesRef = ref(database, 'licenses');

            const [usersSnapshot, licensesSnapshot] = await Promise.all([
                get(usersRef),
                get(licensesRef)
            ]);

            const users = [];
            const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
            const licensesData = licensesSnapshot.exists() ? licensesSnapshot.val() : {};

            for (const [userId, userData] of Object.entries(usersData)) {
                const licenseData = licensesData[userId];
                const licenseStatus = await this.checkUserLicense(userId);

                users.push({
                    userId,
                    userData,
                    licenseData,
                    licenseStatus
                });
            }

            return users;

        } catch (error) {
            console.error('Error getting all users with licenses:', error);
            return [];
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        // Clear all listeners
        this.listeners.forEach(({ ref, listener }) => {
            off(ref, listener);
        });
        this.listeners.clear();

        // Clear cache
        this.cache.clear();
    }
}

// Export singleton instance
export default new LicenseManager();