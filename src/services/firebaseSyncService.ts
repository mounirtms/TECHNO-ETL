/**
 * Firebase Sync Service
 * Manages synchronization of database schema with Firebase Realtime Database
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import { database } from '../config/firebase';
import { ref, set, get, update } from 'firebase/database';
import { USER_ROLES, MENU_CATEGORIES, DEFAULT_LICENSED_PROGRAMS } from '../config/firebaseDefaults';

class FirebaseSyncService {
    constructor() {
        this.database = database;
    }

    /**
     * Initialize Firebase database with schema data
     */
    async initializeSchema() {
        try {
            console.log('Initializing Firebase schema...');
            
            // Initialize system settings
            await this.initializeSystemSettings();
            
            // Initialize menu categories
            await this.initializeMenuCategories();
            
            // Initialize licensed programs
            await this.initializeLicensedPrograms();
            
            console.log('Firebase schema initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing Firebase schema:', error);
            return false;
        }
    }

    /**
     * Initialize system settings
     */
    async initializeSystemSettings() {
        const systemRef = ref(this.database, 'system/settings');
        const snapshot = await get(systemRef);
        
        if (!snapshot.exists()) {
            const systemSettings = {
                appVersion: '2.1.0',
                lastUpdated: new Date().toISOString(),
                maintenanceMode: false,
                registrationEnabled: true,
                defaultUserRole: USER_ROLES.USER,
                maxUsersPerLicense: {
                    free: 3,
                    basic: 10,
                    professional: 50,
                    enterprise: -1
                },
                defaultLicensedPrograms: ['bug_bounty', 'task_voting', 'core_dashboard']
            };
            
            await set(systemRef, systemSettings);
            console.log('System settings initialized');
        }
    }

    /**
     * Initialize menu categories
     */
    async initializeMenuCategories() {
        const categoriesRef = ref(this.database, 'system/menuCategories');
        const snapshot = await get(categoriesRef);
        
        if (!snapshot.exists()) {
            await set(categoriesRef, MENU_CATEGORIES);
            console.log('Menu categories initialized');
        }
    }

    /**
     * Initialize licensed programs
     */
    async initializeLicensedPrograms() {
        const programsRef = ref(this.database, 'system/licensedPrograms');
        const snapshot = await get(programsRef);
        
        if (!snapshot.exists()) {
            await set(programsRef, DEFAULT_LICENSED_PROGRAMS);
            console.log('Licensed programs initialized');
        }
    }

    /**
     * Sync user data with Firebase on login
     */
    async syncUserOnLogin(user) {
        try {
            const sanitizedUserId = user.uid.replace(/[.#$\[\]]/g, '_');
            const userRef = ref(this.database, `users/${sanitizedUserId}`);
            
            // Check if user exists
            const snapshot = await get(userRef);
            
            if (!snapshot.exists()) {
                // Check if this is the first user (super_admin)
                const usersRef = ref(this.database, 'users');
                const usersSnapshot = await get(usersRef);
                const isFirstUser = !usersSnapshot.exists() || Object.keys(usersSnapshot.val() || {}).length === 0;
                
                const userData = {
                    email: user.email,
                    displayName: user.displayName || user.email,
                    role: isFirstUser ? USER_ROLES.SUPER_ADMIN : USER_ROLES.USER,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    isMagentoUser: user.isMagentoUser || false,
                    licenses: {
                        isValid: true,
                        licenseType: 'free',
                        features: ['bug_bounty', 'task_voting', 'core_dashboard'],
                        createdAt: new Date().toISOString(),
                        expiryDate: null // Free license never expires
                    }
                };
                
                await set(userRef, userData);
                console.log(`New user ${user.email} registered with role: ${userData.role}`);
                
                // Initialize Firebase schema if this is the first user
                if (isFirstUser) {
                    await this.initializeSchema();
                }
            } else {
                // Update last login
                const userData = snapshot.val();
                await update(userRef, {
                    lastLogin: new Date().toISOString()
                });
                console.log(`User ${user.email} login updated`);
            }
            
            return true;
        } catch (error) {
            console.error('Error syncing user on login:', error);
            return false;
        }
    }

    /**
     * Get user role and permissions
     */
    async getUserRole(userId) {
        try {
            const sanitizedUserId = userId.replace(/[.#$\[\]]/g, '_');
            const userRef = ref(this.database, `users/${sanitizedUserId}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                return userData.role || USER_ROLES.USER;
            }
            
            return USER_ROLES.USER;
        } catch (error) {
            console.error('Error getting user role:', error);
            return USER_ROLES.USER;
        }
    }

    /**
     * Check if user has required role for menu access
     */
    async hasRequiredRole(userId, requiredRole) {
        try {
            const userRole = await this.getUserRole(userId);
            const roleHierarchy = {
                [USER_ROLES.VIEWER]: 20,
                [USER_ROLES.USER]: 40,
                [USER_ROLES.MANAGER]: 60,
                [USER_ROLES.ADMIN]: 80,
                [USER_ROLES.SUPER_ADMIN]: 100
            };
            
            const userLevel = roleHierarchy[userRole] || 0;
            const requiredLevel = roleHierarchy[requiredRole] || 0;
            
            return userLevel >= requiredLevel;
        } catch (error) {
            console.error('Error checking role permissions:', error);
            return false;
        }
    }

    /**
     * Push updated schema to Firebase
     */
    async pushSchemaToFirebase() {
        try {
            console.log('Pushing schema to Firebase...');
            
            // Read the schema file
            const schemaResponse = await fetch('/db/firebaseSchema.json');
            const schema = await schemaResponse.json();
            
            // Push to Firebase
            const schemaRef = ref(this.database, '/');
            await update(schemaRef, schema);
            
            console.log('Schema pushed to Firebase successfully');
            return true;
        } catch (error) {
            console.error('Error pushing schema to Firebase:', error);
            return false;
        }
    }
}

export default new FirebaseSyncService();
