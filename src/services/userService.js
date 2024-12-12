import { ref, set, get, update, onValue } from 'firebase/database';
import { database } from '../config/firebase';

// Default user settings
const defaultUserSettings = {
    personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        birthDate: '',
        gender: '',
    },
    apiSettings: {
        magento: {
            url: import.meta.env.VITE_MAGENTO_URL || '',
            username:  import.meta.env.VITE_MAGENTO_USERNAME || '',
            password:  import.meta.env.VITE_MAGENTO_PASSWORD || '',
            authMode:  import.meta.env.VITE_MAGENTO_AUTH_TYPE || 'basic'
        },
        cegid: {
            url: '',
            username: '',
            password: '',
            database: ''
        }
    },
    preferences: {
        language: 'en',
        theme: 'light'
    }
};

// Consolidated saveUserSettings function to handle all user settings together
export const saveUserSettings = async (userId, settings) => {
    try {
        const userRef = ref(database, `users/${userId}`);

        // Save all settings as a single object
        await set(userRef, {
            personalInfo: settings.personalInfo || defaultUserSettings.personalInfo,
            apiSettings: settings.apiSettings || defaultUserSettings.apiSettings,
            preferences: settings.preferences || defaultUserSettings.preferences,
            updatedAt: new Date().toISOString()
        });

        // Save to local storage for offline mode
        localStorage.setItem('userSettings', JSON.stringify(settings));

        return {
            success: true,
            message: 'User settings saved successfully'
        };
    } catch (error) {
        console.error('Error saving user settings:', error);
        throw {
            success: false,
            message: 'Failed to save user settings',
            error: error.message
        };
    }
};

// Reintroducing the applyUserPreferences function
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

// Function to get user profile data from Firebase
export const getUserProfileData = (userId, callback) => {
    const userRef = ref(database, `users/${userId}`);

    // Listen for value changes
    const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        console.log('User Data Retrieved:', data); // Log retrieved data
        callback(data);
    }, { onlyOnce: false });

    console.log('Unsubscribe Function:', unsubscribe); // Log the unsubscribe function

    return unsubscribe; // Return the unsubscribe function
};

// Helper function to encrypt sensitive data
const encryptValue = (value) => {
  return `encrypted_${value}`;
};

// Helper function to decrypt sensitive data
const decryptValue = (value) => {
  return value.replace('encrypted_', '');
};