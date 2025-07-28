/**
 * Settings Cleanup Utility
 * Removes duplicate localStorage keys and migrates to unified storage
 */

export const cleanupDuplicateSettings = () => {
  console.log('🧹 Cleaning up duplicate settings...');
  
  try {
    // Get existing settings from various sources
    const oldThemeMode = localStorage.getItem('themeMode');
    const oldLanguage = localStorage.getItem('language');
    const oldFontSize = localStorage.getItem('fontSize');
    const oldUserSettings = localStorage.getItem('userSettings');
    
    // Parse old user settings if they exist
    let oldUserPrefs = null;
    if (oldUserSettings) {
      try {
        oldUserPrefs = JSON.parse(oldUserSettings);
      } catch (error) {
        console.warn('Error parsing old user settings:', error);
      }
    }
    
    // Create unified settings object
    const unifiedSettings = {
      theme: oldUserPrefs?.preferences?.theme || oldThemeMode || 'light',
      language: oldUserPrefs?.preferences?.language || oldLanguage || 'en',
      fontSize: oldUserPrefs?.preferences?.fontSize || oldFontSize || 'medium'
    };
    
    // Save to unified storage
    localStorage.setItem('techno-etl-settings', JSON.stringify(unifiedSettings));
    
    // Remove old duplicate keys
    const keysToRemove = [
      'themeMode',
      'language', 
      'fontSize',
      'userSettings'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Removed duplicate key: ${key}`);
      }
    });
    
    console.log('✅ Settings cleanup completed');
    console.log('📦 Unified settings:', unifiedSettings);
    
    return unifiedSettings;
    
  } catch (error) {
    console.error('❌ Error during settings cleanup:', error);
    return null;
  }
};

export const getUnifiedSettings = () => {
  try {
    const settings = localStorage.getItem('techno-etl-settings');
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.warn('Error parsing unified settings:', error);
    return null;
  }
};

export const saveUnifiedSettings = (newSettings) => {
  try {
    const currentSettings = getUnifiedSettings() || {};
    const updatedSettings = { ...currentSettings, ...newSettings };
    localStorage.setItem('techno-etl-settings', JSON.stringify(updatedSettings));
    return updatedSettings;
  } catch (error) {
    console.error('Error saving unified settings:', error);
    return null;
  }
};

export const resetToSystemDefaults = () => {
  try {
    // Detect system preferences
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const browserLang = navigator.language.split('-')[0];
    const supportedLanguages = ['en', 'fr', 'ar'];
    
    const systemDefaults = {
      theme: systemPrefersDark ? 'dark' : 'light',
      language: supportedLanguages.includes(browserLang) ? browserLang : 'en',
      fontSize: 'medium'
    };
    
    localStorage.setItem('techno-etl-settings', JSON.stringify(systemDefaults));
    
    // Apply system defaults to DOM
    document.documentElement.setAttribute('dir', systemDefaults.language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', systemDefaults.language);
    
    console.log('✅ Reset to system defaults:', systemDefaults);
    return systemDefaults;
    
  } catch (error) {
    console.error('❌ Error resetting to system defaults:', error);
    return null;
  }
};

// Auto-cleanup on import (runs once when the module is loaded)
if (typeof window !== 'undefined') {
  // Check if cleanup is needed
  const hasOldKeys = ['themeMode', 'language', 'fontSize', 'userSettings'].some(
    key => localStorage.getItem(key) !== null
  );
  
  const hasUnifiedSettings = localStorage.getItem('techno-etl-settings') !== null;
  
  if (hasOldKeys && !hasUnifiedSettings) {
    console.log('🔄 Auto-migrating settings to unified storage...');
    cleanupDuplicateSettings();
  }
}
