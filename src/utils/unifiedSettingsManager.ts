/**
 * Unified Settings Manager
 * Handles all user settings persistence including language, theme, and other preferences
 * Eliminates duplicate localStorage keys and provides a single source of truth
 */

const UNIFIED_SETTINGS_KEY = 'techno-etl-unified-settings';
const USER_SETTINGS_PREFIX = 'techno-etl-user-';

/**
 * Default settings structure
 */
const DEFAULT_SETTINGS = {
  language: 'en',
  theme: 'system',
  fontSize: 'medium',
  density: 'standard',
  animations: true,
  notifications: {
    email: true,
    push: false,
    sound: true
  },
  performance: {
    cacheEnabled: true,
    lazyLoading: true,
    defaultPageSize: 25,
    enableVirtualization: true,
    autoRefresh: false,
    refreshInterval: 30
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    keyboardNavigation: true,
    screenReader: false
  },
  security: {
    sessionTimeout: 30,
    twoFactorEnabled: false,
    auditLogging: true
  }
};

/**
 * Legacy keys to clean up during migration
 */
const LEGACY_KEYS = [
  'language',
  'themeMode',
  'fontSize',
  'density',
  'userSettings',
  'techno-etl-settings',
  'dashboardSettings'
];

/**
 * Get unified settings for anonymous users
 */
export const getUnifiedSettings = () => {
  try {
    const settings = localStorage.getItem(UNIFIED_SETTINGS_KEY);
    if(settings) {
      const parsedSettings = JSON.parse(settings);
      return { ...DEFAULT_SETTINGS, ...parsedSettings };
    }
  } catch(error: any) {
    console.warn('Error parsing unified settings:', error);
  }
  return { ...DEFAULT_SETTINGS };
};

/**
 * Save unified settings for anonymous users with optimization
 */
export const saveUnifiedSettings = (settings: any) => {
  try {
    // Validate settings structure
    if(!settings || typeof settings !== 'object') {
      console.warn('Invalid settings provided to saveUnifiedSettings');
      return false;
    }

    const currentSettings = getUnifiedSettings();
    const updatedSettings = { ...currentSettings,
      ...settings,
      lastModified: Date.now(),
      version: '2.1.0'
    };

    // Debounce localStorage writes to prevent excessive I/O
    if((saveUnifiedSettings as any)?._timeout) {
      clearTimeout((saveUnifiedSettings as any)?._timeout);
    }

    (saveUnifiedSettings as any)._timeout = setTimeout(() => {
      try {
        localStorage.setItem(UNIFIED_SETTINGS_KEY, JSON.stringify(updatedSettings));
        console.log('✅ Unified settings saved successfully');
      } catch(storageError: any) {
        console.error('❌ Failed to save to localStorage:', storageError);
        // Try to clear some space and retry
        try {
          localStorage.removeItem('temp_data');
          localStorage.setItem(UNIFIED_SETTINGS_KEY, JSON.stringify(updatedSettings));
          console.log('✅ Settings saved after cleanup');
        } catch(retryError: any) {
          console.error('❌ Failed to save even after cleanup:', retryError);
        }
      }
    }, 100); // 100ms debounce

    return updatedSettings;
  } catch(error: any) {
    console.error('❌ Error saving unified settings:', error);
    return null;
  }
};

/**
 * Get user-specific settings (for logged-in users)
 */
export const getUserSettings = (userId: string) => {
  if (!userId) return getUnifiedSettings();
  
  try {
    const userKey = `${USER_SETTINGS_PREFIX}${userId}`;
    const settings = localStorage.getItem(userKey);
    if(settings) {
      const parsedSettings = JSON.parse(settings);
      return { ...DEFAULT_SETTINGS, ...parsedSettings };
    }
  } catch(error: any) {
    console.warn('Error parsing user settings:', error);
  }
  return { ...DEFAULT_SETTINGS };
};

/**
 * Save user-specific settings (for logged-in users)
 */
export const saveUserSettings = (userId: string, settings: any) => {
  if (!userId) return saveUnifiedSettings(settings);
  
  try {
    const userKey = `${USER_SETTINGS_PREFIX}${userId}`;
    const currentSettings = getUserSettings(userId);
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(userKey, JSON.stringify(updatedSettings));
    return updatedSettings;
  } catch(error: any) {
    console.error('Error saving user settings:', error);
    return null;
  }
};

/**
 * Apply language settings to DOM
 */
export const applyLanguageSettings = (language: string) => {
  const languageConfig: {[key: string]: {dir: string, code: string}} = {
    en: { dir: 'ltr', code: 'en-US' },
    fr: { dir: 'ltr', code: 'fr-FR' },
    ar: { dir: 'rtl', code: 'ar-SA' }
  };

  const config = languageConfig[language] || languageConfig.en;
  
  // Apply to document
  document.documentElement.setAttribute('dir', config.dir);
  document.documentElement.setAttribute('lang', config.code);
  
  // Add RTL class to body
  if(config.dir === 'rtl') {
    document.body.classList.add('rtl');
    document.body.classList.remove('ltr');
  } else {
    document.body.classList.add('ltr');
    document.body.classList.remove('rtl');
  }
  
  // Add/remove RTL class to root element
  const root = document.getElementById('root');
  if(root) {
    if(config.dir === 'rtl') {
      root.classList.add('rtl-layout');
      root.classList.remove('ltr-layout');
    } else {
      root.classList.add('ltr-layout');
      root.classList.remove('rtl-layout');
    }
  }
};

/**
 * Detect system preferences
 */
export const getSystemPreferences = () => {
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const browserLang = navigator?.language.split('-')[0];
  const supportedLanguages = ['en', 'fr', 'ar'];
  
  return {
    theme: systemPrefersDark ? 'dark' : 'light',
    language: supportedLanguages.includes(browserLang) ? browserLang : 'en',
    prefersDark: systemPrefersDark
  };
};

/**
 * Initialize settings system (call on app startup)
 */
export const initializeSettingsSystem = (userId = null) => {
  console.log('🔧 Initializing unified settings system...');
  
  // Check if migration is needed
  const needsMigration = LEGACY_KEYS.some(key => localStorage.getItem(key) !== null);
  
  if(needsMigration) {
    migrateLegacySettings(userId);
  }
  
  // Get current settings
  const settings = userId ? getUserSettings(userId) : getUnifiedSettings();
  
  // Apply language settings immediately
  applyLanguageSettings(settings?.language);
  
  console.log('✅ Settings system initialized:', settings);
  return settings;
};

/**
 * Migrate legacy settings to unified system
 */
const migrateLegacySettings = (userId = null) => {
  console.log('🔄 Migrating legacy settings...');
  
  try {
    // Collect legacy settings
    const legacyData: any = {};
    
    // Individual keys
    const oldLanguage = localStorage.getItem('language');
    const oldTheme = localStorage.getItem('themeMode');
    const oldFontSize = localStorage.getItem('fontSize');
    
    if (oldLanguage) legacyData.language = oldLanguage;
    if (oldTheme) legacyData.theme = oldTheme;
    if (oldFontSize) legacyData.fontSize = oldFontSize;
    
    // Old unified settings
    const oldUnified = localStorage.getItem('techno-etl-settings');
    if(oldUnified) {
      try {
        const parsed = JSON.parse(oldUnified);
        Object.assign(legacyData, parsed);
      } catch(e: any) {
        console.warn('Failed to parse old unified settings');
      }
    }
    
    // Old user settings
    const oldUserSettings = localStorage.getItem('userSettings');
    if(oldUserSettings) {
      try {
        const parsed = JSON.parse(oldUserSettings);
        if(parsed.preferences) {
          Object.assign(legacyData, parsed.preferences);
        }
      } catch(e: any) {
        console.warn('Failed to parse old user settings');
      }
    }
    
    // Save migrated settings
    if (Object.keys(legacyData).length > 0) {
      if(userId) {
        saveUserSettings(userId, legacyData);
      } else {
        saveUnifiedSettings(legacyData);
      }
      console.log('✅ Legacy settings migrated:', legacyData);
    }
    
    // Clean up legacy keys
    LEGACY_KEYS.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed legacy key: ${key}`);
      }
    });
    
  } catch(error: any) {
    console.error('❌ Error during migration:', error);
  }
};

/**
 * Get default settings
 */
export const getDefaultSettings = () => {
  return { ...DEFAULT_SETTINGS };
};

/**
 * Reset settings to system defaults
 */
export const resetToSystemDefaults = (userId = null) => {
  const systemPrefs = getSystemPreferences();
  const defaultSettings = { ...DEFAULT_SETTINGS,
    theme: 'system',
    language: systemPrefs?.language
  };

  if(userId) {
    return saveUserSettings(userId, defaultSettings);
  } else {
    return saveUnifiedSettings(defaultSettings);
  }
};

/**
 * Export settings for backup
 */
export const exportSettings = (userId = null) => {
  const settings = userId ? getUserSettings(userId) : getUnifiedSettings();
  const exportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    userId: userId || 'anonymous',
    settings
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `techno-etl-settings-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return exportData;
};

/**
 * Import settings from backup file
 */
export const importSettings = (file: File, userId: string | null = null) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if(!result) {
          throw new Error('Failed to read file');
        }
        const importData = JSON.parse(result);
        
        if(!importData.settings) {
          throw new Error('Invalid settings file format');
        }
        
        const mergedSettings = { ...DEFAULT_SETTINGS, ...importData.settings };
        
        if(userId) {
          saveUserSettings(userId, mergedSettings);
        } else {
          saveUnifiedSettings(mergedSettings);
        }
        
        // Apply language settings immediately
        applyLanguageSettings(mergedSettings?.language);
        
        resolve(mergedSettings);
      } catch(error: any) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Clean up all user data (for logout)
 */
export const cleanupUserData = (userId: string) => {
  if(userId) {
    const userKey = `${USER_SETTINGS_PREFIX}${userId}`;
    localStorage.removeItem(userKey);
  }
  
  // Reset to system defaults for anonymous use
  const systemDefaults = resetToSystemDefaults();
  applyLanguageSettings(systemDefaults?.language);
  
  return systemDefaults;
};

export default {
  getUnifiedSettings,
  saveUnifiedSettings,
  getUserSettings,
  saveUserSettings,
  getDefaultSettings,
  applyLanguageSettings,
  getSystemPreferences,
  initializeSettingsSystem,
  resetToSystemDefaults,
  exportSettings,
  importSettings,
  cleanupUserData
};
