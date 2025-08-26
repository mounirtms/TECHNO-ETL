/**
 * Unified Settings Utility Functions
 * Centralized settings management to prevent duplicate handling
 */

// Complete default settings structure
export const getDefaultSettings = () => ({
  preferences: {
    language: 'en',
    theme: 'system',
    fontSize: 'medium',
    density: 'standard',
    animations: true,
    highContrast: false,
    colorPreset: 'techno',
    // Grid preferences
    defaultPageSize: 25,
    showStatsCards: false,
    autoRefresh: false,
    refreshInterval: 30,
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    soundEnabled: true,
    // Security
    sessionTimeout: 30,
    twoFactorEnabled: false,
    auditLogging: true
  },
  performance: {
    enableVirtualization: true,
    chunkSize: 100,
    cacheSize: 1000,
    cacheEnabled: true,
    lazyLoading: true,
    compressionEnabled: true
  },
  accessibility: {
    screenReader: false,
    keyboardNavigation: true,
    reducedMotion: false,
    largeText: false
  },
  lastModified: Date.now(),
  userId: 'anonymous'
});

// Get settings from localStorage
export const getUnifiedSettings = () => {
  try {
    const stored = localStorage.getItem('techno-etl-settings');
    if(stored) {
      const parsed = JSON.parse(stored);
      return { ...getDefaultSettings(), ...parsed };
    }
  } catch(error: any) {
    console.warn('Failed to parse unified settings:', error);
  }
  return getDefaultSettings();
};

// Save settings to localStorage
export const saveUnifiedSettings = (settings: any) => {
  try {
    const settingsToSave = { ...getDefaultSettings(),
      ...settings,
      lastModified: Date.now()
    };
    localStorage.setItem('techno-etl-settings', JSON.stringify(settingsToSave));
    return true;
  } catch(error: any) {
    console.error('Failed to save unified settings:', error);
    return false;
};

// Get user-specific settings
export const getUserSettings = (userId?: string) => {
  try {
    const key = userId ? `userSettings_${userId}` : 'techno-etl-settings';
    const stored = localStorage.getItem(key);
    if(stored) {
      const parsed = JSON.parse(stored);
      return { ...getDefaultSettings(), ...parsed };
    }
  } catch(error: any) {
    console.warn('Failed to parse user settings:', error);
  }
  return getDefaultSettings();
};

// Save user-specific settings
export const saveUserSettings = (userId: string, settings: any) => {
  try {
    const settingsToSave = { ...getDefaultSettings(),
      ...settings,
      lastModified: Date.now(),
      userId
    };
    localStorage.setItem(`userSettings_${userId}`, JSON.stringify(settingsToSave));
    // Also save to unified storage
    localStorage.setItem('techno-etl-settings', JSON.stringify(settingsToSave.preferences));
    return true;
  } catch(error: any) {
    console.error('Failed to save user settings:', error);
    return false;
};

// Reset settings to defaults
export const resetToSystemDefaults = () => {
  try {
    const defaults = getDefaultSettings();
    localStorage.setItem('techno-etl-settings', JSON.stringify(defaults));
    return defaults;
  } catch(error: any) {
    console.error('Failed to reset settings:', error);
    return getDefaultSettings();
};

// Apply theme settings immediately
export const applyThemeSettings = (settings: any) => {
  try {
    const { theme, fontSize, density, animations, highContrast, colorPreset } = settings;
    
    // Apply to document root for CSS variables
    const root = document.documentElement;
    
    // Handle system theme detection
    let actualTheme = theme || 'light';
    if(theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if(theme) {
      root.setAttribute('data-theme', actualTheme);
    }
    if(fontSize) {
      root.setAttribute('data-font-size', fontSize);
    }
    if(density) {
      root.setAttribute('data-density', density);
    }
    if(colorPreset) {
      root.setAttribute('data-color-preset', colorPreset);
    }
    // Apply animation preferences
    if(animations === false) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    // Apply high contrast
    if(highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: actualTheme, fontSize, density, animations, highContrast, colorPreset }
    }));
    
  } catch(error: any) {
    console.warn('Failed to apply theme settings:', error);
  }
};

// Unified settings application function
export const applyAllSettings = (settings: any) => {
  try {
    // Apply theme settings
    if(settings.preferences) {
      applyThemeSettings(settings.preferences);
    }
    // Apply language settings
    if(settings.preferences?.language) {
      applyLanguageSettings(settings.preferences.language);
    }
    // Store complete settings
    saveUnifiedSettings(settings);
    
    console.log('All settings applied successfully:', settings);
  } catch(error: any) {
    console.error('Failed to apply all settings:', error);
  }
};

// Synchronize settings across all storage locations
export const syncAllSettings = (settings: any = {}, userId?: string) => {
  try {
    // Save to all relevant locations
    saveUnifiedSettings(settings);
    
    if(userId) {
      saveUserSettings(userId, settings);
    }
    // Apply settings immediately
    applyAllSettings(settings);
    
    // Notify all contexts
    window.dispatchEvent(new CustomEvent('settingsSync', {
      detail: { settings, userId }
    }));
    
    return true;
  } catch(error: any) {
    console.error('Failed to sync settings:', error);
    return false;
  }
};

// Get merged settings from all sources
export const getMergedSettings = (userId?: string) => {
  try {
    const defaults = getDefaultSettings();
    const unified = getUnifiedSettings();
    const user = userId ? getUserSettings(userId) : null;
    
    // Merge in priority order: defaults < unified < user
    const merged = { ...defaults,
      ...unified,
      ...(user || {})
    };
    
    return merged;
  } catch(error: any) {
    console.error('Failed to get merged settings:', error);
    return getDefaultSettings();
};

// Get system preferences
export const getSystemPreferences = () => {
  // Detect browser language with fallback
  let browserLanguage = 'en';
  try {
    const lang = navigator.language || navigator.languages?.[0] || 'en-US';
    const shortLang = lang.split('-')[0].toLowerCase();
    // Only use supported languages
    if (['en', 'fr', 'ar'].includes(shortLang)) {
      browserLanguage = shortLang;
    }
  } catch(error) {
    console.warn('Failed to detect browser language:', error);
  }
  return {
    language: browserLanguage,
    prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches
  };
};

// Enhanced language settings application
export const applyLanguageSettings = (language: string) => {
  try {
    // Store language preference
    localStorage.setItem('preferred-language', language);
    
    // Apply RTL/LTR direction
    const isRTL = language === 'ar';
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    
    // Dispatch event for language context
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language, direction: isRTL ? 'rtl' : 'ltr' } 
    }));
    
  } catch(error: any) {
    console.warn('Failed to apply language settings:', error);
  }
};
