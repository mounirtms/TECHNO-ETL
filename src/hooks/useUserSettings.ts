/**
 * Enhanced User Settings Hook
 * Provides comprehensive user settings management with unified settings system integration
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCustomTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'react-toastify';
import { 
  applyAllSettings, 
  syncAllSettings, 
  getMergedSettings,
  applyThemeSettings,
  applyLanguageSettings
} from '../utils/settingsUtils';

// Types for user settings
interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  fontSize?: 'small' | 'medium' | 'large';
}

interface UserSettings {
  preferences?: UserPreferences;
  [key: string]: any;
}

interface User {
  uid: string;
  [key: string]: any;
}

interface AuthContextProps {
  currentUser: User | null;
}

interface ThemeContextProps {
  mode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  applyUserThemeSettings: (settings: any) => void;
}

interface LanguageContextProps {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  applyUserLanguageSettings: (settings: any) => void;
}

interface SettingsContextProps {
  settings: UserSettings | null;
  updateSettings: (newSettings: Partial<UserSettings>, scope?: string) => void;
  saveSettings: () => Promise<any>;
  loading: boolean;
}

interface UserSettingsResult {
  currentUser: User | null;
  mode: 'light' | 'dark';
  currentLanguage: string;
  fontSize: 'small' | 'medium' | 'large';
  settings: UserSettings | null;
  loading: boolean;
  isInitialized: boolean;
  applySystemDefaults: () => void;
  applyUserSettings: (userSettings: UserSettings) => void;
  saveCurrentPreferences: () => Promise<{ success: boolean; error?: string }>;
  resetToSystemDefaults: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setLanguage: (language: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>, scope?: string) => void;
  saveSettings: () => Promise<any>;
}

export const useUserSettings = (): UserSettingsResult => {
  const authContext = useAuth();
  const themeContext = useCustomTheme();
  const languageContext = useLanguage();
  const settingsContext = useSettings();
  
  // Safe type assertions with fallbacks
  const { currentUser } = (authContext as AuthContextProps) || { currentUser: null };
  const { 
    mode,
    setThemeMode = () => {}, 
    fontSize,
    setFontSize = () => {}, 
    applyUserThemeSettings = () => {} 
  } = (themeContext as ThemeContextProps) || {};
  const { 
    currentLanguage,
    setLanguage = () => {}, 
    applyUserLanguageSettings = () => {} 
  } = (languageContext as LanguageContextProps) || {};
  const { 
    settings,
    updateSettings = () => {}, 
    saveSettings = async () => ({}), 
    loading,
  } = (settingsContext as SettingsContextProps) || {};
  
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
   * Apply user settings after login with unified system
   */
  const applyUserSettings = useCallback((userSettings: UserSettings) => {
    if (!userSettings?.preferences) return;

    const { preferences } = userSettings;
    
    try {
      // Use unified settings application
      applyAllSettings(userSettings);
      
      // Emit settings sync event for other components
      window.dispatchEvent(new CustomEvent('settingsSync', {
        detail: { userSettings, userId: currentUser?.uid }
      }));
      
      console.log('User settings applied successfully with unified system:', preferences);
      
    } catch (error) {
      console.error('Error applying user settings:', error);
      toast.error('Failed to apply some user preferences');
    }
  }, [currentUser?.uid]);

  /**
   * Save current preferences to user settings with unified sync
   */
  const saveCurrentPreferences = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No user authenticated' };

    const currentPreferences = {
      theme: mode,
      language: currentLanguage,
      fontSize: fontSize
    };

    try {
      // Build complete settings object
      const completeSettings = { ...settings,
        preferences: { ...settings?.preferences,
          ...currentPreferences
        }
      };
      
      // Use unified sync system
      const success = syncAllSettings(completeSettings, currentUser.uid);
      
      if(success) {
        // Update contexts
        updateSettings({ preferences: currentPreferences }, 'preferences');
        await saveSettings();
        
        // Emit sync event for other components
        window.dispatchEvent(new CustomEvent('settingsSync', {
          detail: { userSettings: completeSettings, userId: currentUser.uid }
        }));
        
        return { success: true };
      } else {
        throw new Error('Failed to sync settings');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      return { success: false, error: (error as Error).message };
    }
  }, [currentUser, mode, currentLanguage, fontSize, settings, updateSettings, saveSettings]);

  /**
   * Reset to system defaults and clear all user preferences
   */
  const resetToSystemDefaults = useCallback(() => {
    try {
      applySystemDefaults();
      
      if(currentUser) {
        // Get default settings and apply them
        const defaultSettings = getMergedSettings();
        syncAllSettings(defaultSettings, currentUser.uid);
        
        // Update user settings to reflect system defaults
        const systemDefaults: UserPreferences = {
          theme: 'system',
          language: navigator.language.split('-')[0] ==='fr' ? 'fr' : 'en',
          fontSize: 'medium'
        };
        
        updateSettings({ preferences: systemDefaults }, 'preferences');
        
        // Emit sync event
        window.dispatchEvent(new CustomEvent('settingsSync', {
          detail: { userSettings: { preferences: systemDefaults }, userId: currentUser.uid }
        }));
      }
      toast.info('Settings reset to system defaults');
    } catch (error) {
      console.error('Error resetting to defaults:', error);
      toast.error('Failed to reset settings');
    }
  }, [applySystemDefaults, currentUser, updateSettings]);

  /**
   * Initialize settings based on user state
   */
  useEffect(() => {
    if(!isInitialized) {
      if(currentUser) {
        // User is logged in - apply their settings
        if(settings?.preferences) {
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
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only apply if user preference is set to 'system' or no user is logged in
      const shouldFollowSystem = !currentUser || settings?.preferences?.theme === 'system';
      
      if(shouldFollowSystem) {
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
    if(currentUser && isInitialized) {
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
interface AppearanceSettingsResult {
  isDark: boolean;
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  isRTL: boolean;
}

export const useAppearanceSettings = (): AppearanceSettingsResult => {
  const themeContext = useCustomTheme();
  const languageContext = useLanguage();
  
  const { mode, fontSize } = themeContext;
  // Use safe access for language context properties with proper type checking
  const currentLanguage = (languageContext && 'currentLanguage' in languageContext) 
    ? (languageContext as LanguageContextProps).currentLanguage 
    : 'en';
  
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
interface SystemPreferencesResult {
  systemTheme: 'light' | 'dark';
  systemLanguage: string;
  systemPrefersDark: boolean;
}

export const useSystemPreferences = (): SystemPreferencesResult => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const [systemLanguage] = useState<string>(() => {
    const browserLang = navigator.language.split('-')[0];
    return ['en', 'fr', 'ar'].includes(browserLang) ? browserLang : 'en';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
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
