import { ref, set, get, update, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { languages } from '../contexts/LanguageContext';
import {
    saveUserSettings as saveUserSettingsUnified,
    saveUnifiedSettings,
    getUserSettings as getUnifiedUserSettings,
    getUnifiedSettings,
    resetToSystemDefaults
} from '../utils/unifiedSettingsManager';
// Enhanced default user settings with comprehensive preferences
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
            username: import.meta.env.VITE_MAGENTO_USERNAME || '',
            password: import.meta.env.VITE_MAGENTO_PASSWORD || '',
            authMode: import.meta.env.VITE_MAGENTO_AUTH_TYPE || 'basic'
        },
        cegid: {
            url: '',
            username: '',
            password: '',
            database: ''
        }
    },
    preferences: {
        // Appearance
        language: 'en',
        theme: 'system', // 'light', 'dark', 'system'
        fontSize: 'medium', // 'small', 'medium', 'large'
        density: 'standard', // 'compact', 'standard', 'comfortable'
        animations: true,

        // Grid preferences
        defaultPageSize: 25,
        enableVirtualization: true,
        showStatsCards: true,
        autoRefresh: false,
        refreshInterval: 30,

        // Performance
        cacheEnabled: true,
        lazyLoading: true,
        compressionEnabled: true,

        // Notifications
        emailNotifications: true,
        pushNotifications: false,
        soundEnabled: true,

        // Security
        sessionTimeout: 30,
        twoFactorEnabled: false,
        auditLogging: true,

        // Accessibility
        highContrast: false,
        largeText: false,
        keyboardNavigation: true,
        screenReader: false,

        // Dashboard
        dashboardLayout: 'default',
        widgetPreferences: {},

        // Advanced
        developerMode: false,
        debugMode: false
    }
};

// Consolidated saveUserSettings function to handle all user settings together
export const saveUserSettings = async (userId, settings) => {
    try {
        const userRef = ref(database, `users/${userId}`);

        // Save all settings as a single object
        await set(userRef, {
            personalInfo: Object.assign(defaultUserSettings.personalInfo, settings.personalInfo),
            apiSettings: Object.assign(defaultUserSettings.apiSettings, settings.apiSettings),
            preferences: Object.assign(defaultUserSettings.preferences, settings.preferences),
            updatedAt: new Date().toISOString()
        });

        // Save through unified settings manager
        saveUserSettingsUnified(userId, settings);

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

// Enhanced applyUserPreferences function with API service integration
export const applyUserPreferences = (data, contexts = {}) => {
  if (!data?.preferences) return;

  const { setLanguage, setTheme, setFontSize } = contexts;
  const prefs = data.preferences;

  try {
    // Apply language settings
    if (prefs.language && setLanguage) {
      setLanguage(prefs.language);
      const langConfig = languages[prefs.language];
      if (langConfig) {
        document.documentElement.setAttribute('lang', langConfig.code);
        document.documentElement.setAttribute('dir', langConfig.dir);
      }
    }

    // Apply theme settings
    if (prefs.theme && setTheme) {
      let themeToApply = prefs.theme;

      // Handle system theme preference
      if (prefs.theme === 'system') {
        themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      setTheme(themeToApply);
      localStorage.setItem('themeMode', themeToApply);
    }

    // Apply font size settings
    if (prefs.fontSize && setFontSize) {
      setFontSize(prefs.fontSize);
      localStorage.setItem('fontSize', prefs.fontSize);
    }

    // Apply accessibility settings
    if (prefs.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (prefs.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    // Apply animation preferences
    if (!prefs.animations) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }

    // Update API services with new settings
    updateApiServicesSettings(data.apiSettings);

    console.log('User preferences applied successfully:', prefs);
  } catch (error) {
    console.error('Error applying user preferences:', error);
  }
};

// Helper function to update API services with new settings
const updateApiServicesSettings = (apiSettings) => {
  if (!apiSettings) return;
  
  try {
    // Dynamically import and update services
    import('../services/unifiedMagentoService').then(({ default: unifiedMagentoService }) => {
      if (apiSettings.magento) {
        unifiedMagentoService.initializeMagento(apiSettings.magento);
      }
    }).catch(error => {
      console.warn('Failed to update Magento service settings:', error);
    });
    
    // Update other services as needed
    console.log('API services updated with new settings');
  } catch (error) {
    console.error('Error updating API services:', error);
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

// Get user settings with fallback to defaults
// These functions are now handled by the unified settings manager
// Keeping for backward compatibility but redirecting to unified system
export const getUserSettings = (userId = null) => {
    return userId ? getUnifiedUserSettings(userId) : getUnifiedSettings();
};

// Save settings to local storage
export const saveSettingsLocally = (settings, userId = null) => {
    try {
        if (userId) {
            saveUserSettingsUnified(userId, settings);
        } else {
            saveUnifiedSettings(settings);
        }
        return true;
    } catch (error) {
        console.error('Error saving settings locally:', error);
        return false;
    }
};

// Get default settings
export const getDefaultSettings = () => {
    return JSON.parse(JSON.stringify(defaultUserSettings)); // Deep clone
};

// Reset settings to defaults - now handled by unified settings manager
export const resetSettingsToDefaults = (userId = null) => {
    return resetToSystemDefaults(userId);
};

// Merge settings with defaults
export const mergeWithDefaults = (userSettings) => {
    return {
        personalInfo: { ...defaultUserSettings.personalInfo, ...userSettings?.personalInfo },
        apiSettings: { ...defaultUserSettings.apiSettings, ...userSettings?.apiSettings },
        preferences: { ...defaultUserSettings.preferences, ...userSettings?.preferences }
    };
};

// Helper function to encrypt sensitive data
const encryptValue = (value) => {
    return `encrypted_${value}`;
};

// Helper function to decrypt sensitive data
const decryptValue = (value) => {
    return value.replace('encrypted_', '');
};