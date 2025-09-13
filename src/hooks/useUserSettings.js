/**
 * Enhanced User Settings Hook
 * Provides comprehensive user settings management with system defaults
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCustomTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'react-toastify';
import { saveUserSettings } from '../utils/unifiedSettingsManager';

export const useUserSettings = () => {
  const { currentUser } = useAuth();
  const { mode, setThemeMode, fontSize, setFontSize, applyUserThemeSettings } = useCustomTheme();
  const { currentLanguage, setLanguage, applyUserLanguageSettings } = useLanguage();
  const { settings, updateSettings, saveSettings, loading } = useSettings();
  
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Apply system defaults when no user is logged in
   */
  const applySystemDefaults = useCallback(() => {
    // Detect system theme preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeMode(systemPrefersDark ? 'dark' : 'light');
    
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    const supportedLanguages = ['en', 'fr', 'ar'];
    const detectedLanguage = supportedLanguages.includes(browserLang) ? browserLang : 'en';
    setLanguage(detectedLanguage);
    
    // Set default font size
    setFontSize('medium');
    
    console.log('Applied system defaults:', {
      theme: systemPrefersDark ? 'dark' : 'light',
      language: detectedLanguage,
      fontSize: 'medium'
    });
  }, [setThemeMode, setLanguage, setFontSize]);

  /**
   * Apply user settings after login
   */
  const applyUserSettings = useCallback((userSettings) => {
    if (!userSettings?.preferences) return;

    const { preferences } = userSettings;
    
    try {
      // Apply theme settings
      if (preferences.theme) {
        if (preferences.theme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setThemeMode(systemPrefersDark ? 'dark' : 'light');
        } else {
          setThemeMode(preferences.theme);
        }
      }

      // Apply language settings
      if (preferences.language) {
        setLanguage(preferences.language);
      }

      // Apply font size settings
      if (preferences.fontSize) {
        setFontSize(preferences.fontSize);
      }

      console.log('Applied user settings:', preferences);
      
    } catch (error) {
      console.error('Error applying user settings:', error);
      toast.error('Failed to apply some user preferences');
    }
  }, [setThemeMode, setLanguage, setFontSize]);

  /**
   * Save current preferences to user settings
   */
  const saveCurrentPreferences = useCallback(async () => {
    if (!currentUser) return;

    const currentPreferences = {
      theme: mode,
      language: currentLanguage,
      fontSize: fontSize
    };

    try {
      await updateSettings({ preferences: currentPreferences }, 'preferences');
      await saveSettings();
      
      // Save through unified settings manager
      saveUserSettings(currentUser.uid, { preferences: currentPreferences });
      
      return { success: true };
    } catch (error) {
      console.error('Error saving preferences:', error);
      return { success: false, error: error.message };
    }
  }, [currentUser, mode, currentLanguage, fontSize, updateSettings, saveSettings]);

  /**
   * Reset to system defaults
   */
  const resetToSystemDefaults = useCallback(() => {
    applySystemDefaults();
    
    if (currentUser) {
      // Update user settings to reflect system defaults
      const systemDefaults = {
        theme: 'system',
        language: navigator.language.split('-')[0] === 'fr' ? 'fr' : 'en',
        fontSize: 'medium'
      };
      
      updateSettings({ preferences: systemDefaults }, 'preferences');
    }
    
    toast.info('Settings reset to system defaults');
  }, [applySystemDefaults, currentUser, updateSettings]);

  /**
   * Initialize settings based on user state
   */
  useEffect(() => {
    if (!isInitialized) {
      if (currentUser) {
        // User is logged in - apply their settings
        if (settings?.preferences) {
          applyUserSettings(settings);
        }
      } else {
        // No user logged in - apply system defaults
        applySystemDefaults();
      }
      setIsInitialized(true);
    }
  }, [currentUser, settings, applyUserSettings, applySystemDefaults, isInitialized]);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Only apply if user preference is set to 'system' or no user is logged in
      const shouldFollowSystem = !currentUser || settings?.preferences?.theme === 'system';
      
      if (shouldFollowSystem) {
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [currentUser, settings?.preferences?.theme, setThemeMode]);

  /**
   * Auto-save preferences when they change (for logged-in users)
   */
  useEffect(() => {
    if (currentUser && isInitialized) {
      const timeoutId = setTimeout(() => {
        saveCurrentPreferences();
      }, 2000); // 2-second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, mode, currentLanguage, fontSize, isInitialized, saveCurrentPreferences]);

  return {
    // Current state
    currentUser,
    mode,
    currentLanguage,
    fontSize,
    settings,
    loading,
    isInitialized,
    
    // Actions
    applySystemDefaults,
    applyUserSettings,
    saveCurrentPreferences,
    resetToSystemDefaults,
    
    // Theme actions
    setThemeMode,
    setFontSize,
    
    // Language actions
    setLanguage,
    
    // Settings actions
    updateSettings,
    saveSettings
  };
};

/**
 * Hook for components that need to react to theme/language changes
 */
export const useAppearanceSettings = () => {
  const { mode, fontSize } = useCustomTheme();
  const { currentLanguage } = useLanguage();
  
  return {
    isDark: mode === 'dark',
    theme: mode,
    fontSize,
    language: currentLanguage,
    isRTL: currentLanguage === 'ar'
  };
};

/**
 * Hook for getting system preferences
 */
export const useSystemPreferences = () => {
  const [systemTheme, setSystemTheme] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const [systemLanguage] = useState(() => {
    const browserLang = navigator.language.split('-')[0];
    return ['en', 'fr', 'ar'].includes(browserLang) ? browserLang : 'en';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    systemTheme,
    systemLanguage,
    systemPrefersDark: systemTheme === 'dark'
  };
};

export default useUserSettings;
