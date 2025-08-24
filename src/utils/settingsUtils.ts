/**
 * Simple Settings Utility Functions
 * Replaces complex unifiedSettingsManager with lightweight functions
 */

// Default settings structure
export const getDefaultSettings = () => ({
  preferences: {
    language: 'en',
    theme: 'system',
    fontSize: 'medium',
    density: 'standard',
    animations: true,
    highContrast: false,
    colorPreset: 'techno'
  },
  performance: {
    enableVirtualization: true,
    chunkSize: 100,
    cacheSize: 1000
  },
  accessibility: {
    screenReader: false,
    keyboardNavigation: true,
    reducedMotion: false
  },
  lastModified: Date.now(),
  userId: 'anonymous'
});

// Get settings from localStorage
export const getUnifiedSettings = () => {
  try {
    const stored = localStorage.getItem('techno-etl-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...getDefaultSettings(), ...parsed };
    }
  } catch (error) {
    console.warn('Failed to parse unified settings:', error);
  }
  return getDefaultSettings();
};

// Save settings to localStorage
export const saveUnifiedSettings = (settings: any) => {
  try {
    const settingsToSave = {
      ...getDefaultSettings(),
      ...settings,
      lastModified: Date.now()
    };
    localStorage.setItem('techno-etl-settings', JSON.stringify(settingsToSave));
    return true;
  } catch (error) {
    console.error('Failed to save unified settings:', error);
    return false;
  }
};

// Get user-specific settings
export const getUserSettings = (userId?: string) => {
  try {
    const key = userId ? `userSettings_${userId}` : 'techno-etl-settings';
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...getDefaultSettings(), ...parsed };
    }
  } catch (error) {
    console.warn('Failed to parse user settings:', error);
  }
  return getDefaultSettings();
};

// Save user-specific settings
export const saveUserSettings = (userId: string, settings: any) => {
  try {
    const settingsToSave = {
      ...getDefaultSettings(),
      ...settings,
      lastModified: Date.now(),
      userId
    };
    localStorage.setItem(`userSettings_${userId}`, JSON.stringify(settingsToSave));
    // Also save to unified storage
    localStorage.setItem('techno-etl-settings', JSON.stringify(settingsToSave.preferences));
    return true;
  } catch (error) {
    console.error('Failed to save user settings:', error);
    return false;
  }
};

// Reset settings to defaults
export const resetToSystemDefaults = () => {
  try {
    const defaults = getDefaultSettings();
    localStorage.setItem('techno-etl-settings', JSON.stringify(defaults));
    return defaults;
  } catch (error) {
    console.error('Failed to reset settings:', error);
    return getDefaultSettings();
  }
};

// Apply language settings (stub function)
export const applyLanguageSettings = (language: string) => {
  try {
    // Store language preference
    localStorage.setItem('preferred-language', language);
    // Dispatch event for language context
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
  } catch (error) {
    console.warn('Failed to apply language settings:', error);
  }
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
  } catch (error) {
    console.warn('Failed to detect browser language:', error);
  }

  return {
    language: browserLanguage,
    prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches
  };
};
