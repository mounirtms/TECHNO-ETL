import { ref, set, get, update, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';
import { toast } from 'react-toastify';

// Apply user preferences to contexts
export const applyUserPreferences = (data, { setLanguage, setThemeMode }) => {
    if (data?.preferences) {
        if (data.preferences.language && setLanguage) {
            setLanguage(data.preferences.language);
        }
        if (data.preferences.theme && setThemeMode) {
            setThemeMode(data.preferences.theme);
        }
    }
};

// Set user data (for all profile settings)
export const setUserData = async (userId, settings) => {
    if (!userId) {
        throw new Error('User ID is required');
    }
    try {
        const userRef = ref(database, `users/${userId}`);
        
        // Ensure we maintain the correct data structure
        const normalizedSettings = {
            preferences: settings.preferences || {},
            apiSettings: settings.apiSettings || {},
            personalInfo: settings.personalInfo || {}
        };

        await update(userRef, normalizedSettings);
        
        // Store API token if present in updates
        if (settings.apiSettings?.magento?.token) {
            localStorage.setItem('adminToken', settings.apiSettings.magento.token);
        }
        return true;
    } catch (error) {
        console.error('Error saving user settings:', error);
        throw error;
    }
};

// Get user profile data with real-time updates
export const getUserProfileData = (userId, callback) => {
    if (!userId) return null;
    
    const userRef = ref(database, `users/${userId}`);
    onValue(userRef, (snapshot) => {
        const data = snapshot.val() || defaultUserSettings;
        callback(data);
    });

    // Return cleanup function
    return () => off(userRef);
};

// Get user profile data once
export const getUserProfileDataOnce = async (userId) => {
    if (!userId) return null;
    
    try {
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);
        return snapshot.val() || defaultUserSettings;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

// Default user settings
export const defaultUserSettings = {
    preferences: {
        language: 'en',
        theme: 'light',
        notifications: {
            email: true,
            push: true
        }
    },
    apiSettings: {
        cegid: {
            url: '',
            username: '',
            password: '',
            database: ''
        },
        magento: {
            url: 'https://technostationery.com/rest/V1',
            username: '',
            token: '',
            password: ''
        }
    },
    personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        avatar: '/src/resources/images/customer01.jpg'
    }
};