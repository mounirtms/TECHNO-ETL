
import React, { createContext, useState, useContext, useEffect,useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { ref, set, get } from 'firebase/database';
// Removed useNavigate to avoid circular dependency with Router
import magentoApi from '../services/magentoService';
import { USER_ROLES, createDefaultUserLicense, initializeFirebaseDefaults } from '../config/firebaseDefaults';
import firebaseSyncService from '../services/firebaseSyncService';
import LicenseManager from '../services/LicenseManager';
import PermissionService from '../services/PermissionService';
const AuthContext = createContext();
const MAGENTO_API_URL = import.meta.env.VITE_MAGENTO_API_URL;

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            return {
                uid: 'magento-user',
                isMagentoUser: true,
                token
            };
        }
        return null;
    });
    // Removed navigate to avoid circular dependency
    const [loading, setLoading] = useState(true);     
    const [adminToken, setMagentoToken] = useState(() => localStorage.getItem('adminToken'));
    const [isUsingLocalData, setIsUsingLocalData] = useState(false);

    // Helper functions for settings management with local cache priority
    const initializeUserSettings = useCallback(async (user) => {
        try {
            const sanitizedUserId = user.uid.replace(/[.#$\[\]]/g, '_');
            const userSettingsKey = `userSettings_${sanitizedUserId}`;
            
            // Use unified settings manager
            const { getUserSettings } = await import('../utils/unifiedSettingsManager');
            const userSettings = getUserSettings(sanitizedUserId);
            if (userSettings) {
                console.log('User settings loaded from local cache');
                
                // Minimal sync to Firebase only if cache is old (> 24 hours)
                const lastSync = new Date(userSettings.lastSync || 0);
                const now = new Date();
                const hoursSinceSync = (now - lastSync) / (1000 * 60 * 60);
                
                if (hoursSinceSync > 24) {
                    syncSettingsToFirebase(user, userSettings);
                }
            } else {
                // If no local cache, try to fetch from Firebase
                await loadSettingsFromFirebase(user);
            }
        } catch (error) {
            console.error('Error initializing user settings:', error);
        }
    }, []);
    
    // Sync settings to Firebase (minimal)
    const syncSettingsToFirebase = async (user, settings) => {
        try {
            const sanitizedUserId = user.uid.replace(/[.#$\[\]]/g, '_');
            const settingsRef = ref(database, `userSettings/${sanitizedUserId}`);
            
            const settingsData = {
                preferences: settings,
                lastSync: new Date().toISOString(),
                userId: user.uid,
                email: user.email
            };
            
            await set(settingsRef, settingsData);
            
            // Save through unified settings manager
            const { saveUserSettings } = await import('../utils/unifiedSettingsManager');
            saveUserSettings(sanitizedUserId, settingsData);
            
            console.log('Settings synced to Firebase');
        } catch (error) {
            console.error('Error syncing settings to Firebase:', error);
        }
    };
    
    // Load settings from Firebase
    const loadSettingsFromFirebase = async (user) => {
        try {
            const sanitizedUserId = user.uid.replace(/[.#$\[\]]/g, '_');
            const settingsRef = ref(database, `userSettings/${sanitizedUserId}`);
            const snapshot = await get(settingsRef);
            
            if (snapshot.exists()) {
                const firebaseSettings = snapshot.val();
                const userSettingsKey = `userSettings_${sanitizedUserId}`;
                
                // Save through unified settings manager
                const { saveUserSettings } = await import('../utils/unifiedSettingsManager');
                saveUserSettings(sanitizedUserId, firebaseSettings);
                
                console.log('Settings loaded from Firebase');
            }
        } catch (error) {
            console.error('Error loading settings from Firebase:', error);
        }
    };
    
    // Save settings (always local first, sync later)
    const saveUserSettings = useCallback((settings) => {
        try {
            if (!currentUser) return;
            
            const sanitizedUserId = currentUser.uid.replace(/[.#$\[\]]/g, '_');
            const userSettingsKey = `userSettings_${sanitizedUserId}`;
            
            const settingsData = {
                preferences: settings,
                lastSync: new Date().toISOString(),
                userId: currentUser.uid,
                email: currentUser.email
            };
            
            // Always save to local cache first
            localStorage.setItem(userSettingsKey, JSON.stringify(settingsData));
            localStorage.setItem('techno-etl-settings', JSON.stringify(settings));
            
            // Async sync to Firebase (non-blocking)
            setTimeout(() => {
                syncSettingsToFirebase(currentUser, settings);
            }, 1000);
            
            console.log('Settings saved locally');
        } catch (error) {
            console.error('Error saving user settings:', error);
        }
    }, [currentUser]);

    const clearUserSettings = useCallback(() => {
        try {
            // Clear unified settings when user logs out
            localStorage.removeItem('techno-etl-settings');
            console.log('User settings cleared on logout');
        } catch (error) {
            console.error('Error clearing user settings:', error);
        }
    }, []);

    // Register user in database and initialize license
    const registerUserInDatabase = async (user) => {
        try {
            const sanitizedUserId = user.uid.replace(/[.#$\[\]]/g, '_');
            const userRef = ref(database, `users/${sanitizedUserId}`);
            const licenseRef = ref(database, `licenses/${sanitizedUserId}`);
            
            // Check if user already exists
            const [userSnapshot, licenseSnapshot] = await Promise.all([
                get(userRef),
                get(licenseRef)
            ]);
            
            if (!userSnapshot.exists()) {
                // Check if this is the first user (super_admin)
                const usersRef = ref(database, 'users');
                const usersSnapshot = await get(usersRef);
                const isFirstUser = !usersSnapshot.exists() || Object.keys(usersSnapshot.val() || {}).length === 0;
                const role = isFirstUser ? USER_ROLES.SUPER_ADMIN : USER_ROLES.USER;
                
                // Create user record
                await set(userRef, {
                    email: user.email,
                    displayName: user.displayName,
                    role: role,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    isMagentoUser: user.isMagentoUser || false
                });
                
                console.log(`User ${user.email} registered in database with role: ${isFirstUser ? 'super_admin' : 'user'}`);
            } else {
                // Update last login
                const userData = userSnapshot.val();
                await set(userRef, {
                    ...userData,
                    lastLogin: new Date().toISOString()
                });
            }

            // Initialize license if it doesn't exist
            if (!licenseSnapshot.exists()) {
                const defaultLicense = createDefaultUserLicense(user.uid, 'FREE');
                await set(licenseRef, defaultLicense);
                console.log(`Default license created for user ${user.email}`);
            }

            // Initialize permission service for this user
            await PermissionService.initialize(user);
            
        } catch (error) {
            console.error('Error registering user in database:', error);
        }
    };

    // Monitor Firebase auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && !currentUser?.isMagentoUser) {
                setCurrentUser({
                    ...user,
                    isMagentoUser: false
                });
                toast.success('Welcome back, ' + user.displayName);
                
                // Register user in database and initialize settings
                registerUserInDatabase(user);
                initializeUserSettings(user);
                
                // Sync with Firebase
                firebaseSyncService.syncUserOnLogin(user);
            } else if (!user && !currentUser?.isMagentoUser) {
                setCurrentUser(null);
                // Clear settings on logout
                clearUserSettings();
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser?.isMagentoUser, initializeUserSettings, clearUserSettings]);

    const validateMagentoToken = async (token) => {
        if (!token) {
            toast.error('No authentication token found');
            return false;
        }

        try {
            const response =   await magentoApi.get('/store/storeConfigs')

            if (!response.ok) {
                if (response.status === 401) {
                    toast.warning('Session expired. Using local cached data.', {
                        autoClose: 5000,
                        style: { backgroundColor: '#FFA500', color: '#FFFFFF' }
                    });
                    setIsUsingLocalData(true);
                    setMagentoToken(null);
                    localStorage.removeItem('adminToken');
                    return true; // Allow using local data
                }
                toast.warning('Connection issues. Using cached session.');
                return true;
            }

            // Reset local data flag if token is valid
            setIsUsingLocalData(false);
            return true;
        } catch (error) {
            toast.error('Network error. Please check your connection.');
            console.error('Token validation error:', error);
            setIsUsingLocalData(true);
            return true;
        }
    };

    const signInWithGoogle = async () => {
        try {
              
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            const result = await signInWithPopup(auth, provider);

            // User data will be set by the auth state observer
            toast.success('Successfully logged in with Google!');
            // Navigation will be handled by the component using this context
            return result;
        } catch (error) {
            console.error('Google sign-in error:', error);
            toast.error('Failed to sign in with Google');
            throw error;
        }
    };

    const signInWithMagento = async (username, password) => {
        try {
            const response = await magentoApi.login(username, password);
 debugger
 

            const magentoUser = {
                uid: username,
                email: username,
                displayName: username,
                isMagentoUser: true,
                token:response
            };

            setCurrentUser(magentoUser);
            
            // Register Magento user and initialize settings
            registerUserInDatabase(magentoUser);
            initializeUserSettings(magentoUser);
            
            // Sync with Firebase
            firebaseSyncService.syncUserOnLogin(magentoUser);
 
            toast.success('Successfully logged in!');

            return magentoUser;
        } catch (error) {
            console.error('Magento login error:', error);
            toast.error(error.message || 'Failed to login. Please check your credentials.');
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (currentUser?.isMagentoUser) {
                // Clear Magento token
                setMagentoToken(null);
                localStorage.removeItem('adminToken');
            } else {
                // Sign out from Firebase
                await signOut(auth);
            }
            setCurrentUser(null);
            toast.success('Successfully logged out');
            window.location.href = '/login';  // Force a full page reload to clear all states
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
            throw error;
        }
    };

    // Check Magento token validity
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                if (adminToken) {
                    const isValid = await validateMagentoToken(adminToken);
                
                    if (!isValid && mounted) {
                        setMagentoToken(null);
                        setCurrentUser(null);
                        localStorage.removeItem('adminToken');
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        return () => {
            mounted = false;
        };
    }, [adminToken]);

    // Get user permissions and license status
    const getUserPermissions = useCallback(async () => {
        if (!currentUser?.uid) return [];
        try {
            return await PermissionService.getPermissions();
        } catch (error) {
            console.error('Error getting user permissions:', error);
            return [];
        }
    }, [currentUser?.uid]);

    const getUserLicenseStatus = useCallback(async () => {
        if (!currentUser?.uid) return null;
        try {
            return await LicenseManager.checkUserLicense(currentUser.uid);
        } catch (error) {
            console.error('Error getting user license status:', error);
            return null;
        }
    }, [currentUser?.uid]);

    const hasPermission = useCallback((action, resource = '*') => {
        return PermissionService.hasPermission(action, resource);
    }, []);

    const checkFeatureAccess = useCallback(async (feature) => {
        if (!currentUser?.uid) return false;
        try {
            return await LicenseManager.validateFeatureAccess(feature, currentUser.uid);
        } catch (error) {
            console.error('Error checking feature access:', error);
            return false;
        }
    }, [currentUser?.uid]);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        currentUser,
        loading,
        signInWithGoogle,
        signInWithMagento,
        logout,
        adminToken,
        isUsingLocalData,
        validateMagentoToken,
        saveUserSettings,
        // Permission and license functions
        getUserPermissions,
        getUserLicenseStatus,
        hasPermission,
        checkFeatureAccess
    }), [
        // State dependencies
        JSON.stringify(currentUser),
        loading,
        adminToken,
        isUsingLocalData,
        
        // Function dependencies (these are already memoized with useCallback)
        signInWithGoogle,
        signInWithMagento,
        logout,
        validateMagentoToken,
        saveUserSettings,
        getUserPermissions,
        getUserLicenseStatus,
        hasPermission,
        checkFeatureAccess
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};