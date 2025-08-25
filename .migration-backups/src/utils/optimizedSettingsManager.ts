/**
 * Optimized Unified Settings Manager for TECHNO-ETL
 * Consolidates all settings management logic and optimizes performance
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import { toast } from 'react-hot-toast';

// Types
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'standard' | 'comfortable';
  animations: boolean;
  highContrast: boolean;
  colorPreset: 'techno' | 'blue' | 'green' | 'purple';
}

export interface AppSettings {
  preferences: UserPreferences;
  performance: {
    enableVirtualization: boolean;
    chunkSize: number;
    cacheSize: number;
    lazyLoading: boolean;
  };
  accessibility: {
    screenReader: boolean;
    keyboardNavigation: boolean;
    reducedMotion: boolean;
  };
  grid: {
    defaultPageSize: number;
    showStatsCards: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
  };
  lastModified: number;
  userId?: string;
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  preferences: {
    language: 'en',
    theme: 'system',
    fontSize: 'medium',
    density: 'standard',
    animations: true,
    highContrast: false,
    colorPreset: 'techno',
  },
  performance: {
    enableVirtualization: true,
    chunkSize: 100,
    cacheSize: 1000,
    lazyLoading: true,
  },
  accessibility: {
    screenReader: false,
    keyboardNavigation: true,
    reducedMotion: false,
  },
  grid: {
    defaultPageSize: 25,
    showStatsCards: false,
    autoRefresh: false,
    refreshInterval: 30,
  },
  lastModified: Date.now(),
};

// Storage keys
const STORAGE_KEYS = {
  UNIFIED_SETTINGS: 'techno-etl-unified-settings',
  USER_SETTINGS: 'techno-etl-user-settings',
  THEME_SETTINGS: 'techno-etl-settings',
  LAST_SYNC: 'techno-etl-last-sync',
} as const;

/**
 * Optimized Settings Manager Class
 */
class OptimizedSettingsManager {
  private cache: Map<string, any> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Get system preferences
   */
  getSystemPreferences(): Partial<UserPreferences> {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const browserLanguage = navigator.language.substring(0, 2);

    return {
      theme: prefersDark ? 'dark' : 'light',
      language: ['en', 'fr', 'ar'].includes(browserLanguage) ? browserLanguage : 'en',
      animations: !prefersReducedMotion,
    };
  }

  /**
   * Merge settings with defaults
   */
  mergeWithDefaults(userSettings: Partial<AppSettings>): AppSettings {
    const systemPrefs = this.getSystemPreferences();

    return {
      ...DEFAULT_SETTINGS,
      ...userSettings,
      preferences: {
        ...DEFAULT_SETTINGS.preferences,
        ...systemPrefs,
        ...userSettings.preferences,
      },
      performance: {
        ...DEFAULT_SETTINGS.performance,
        ...userSettings.performance,
      },
      accessibility: {
        ...DEFAULT_SETTINGS.accessibility,
        ...userSettings.accessibility,
      },
      grid: {
        ...DEFAULT_SETTINGS.grid,
        ...userSettings.grid,
      },
      lastModified: Date.now(),
    };
  }

  /**
   * Get settings from cache or storage
   */
  getSettings(userId?: string): AppSettings {
    const cacheKey = userId ? `settings-${userId}` : 'settings-anonymous';
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let settings: Partial<AppSettings> = {};

      // Try to load user-specific settings first
      if (userId) {
        const userSettings = localStorage.getItem(`${STORAGE_KEYS.USER_SETTINGS}-${userId}`);
        if (userSettings) {
          settings = JSON.parse(userSettings);
        }
      }

      // Fallback to unified settings
      if (!settings || Object.keys(settings).length === 0) {
        const unifiedSettings = localStorage.getItem(STORAGE_KEYS.UNIFIED_SETTINGS);
        if (unifiedSettings) {
          settings = JSON.parse(unifiedSettings);
        }
      }

      // Merge with defaults
      const mergedSettings = this.mergeWithDefaults(settings);
      
      // Cache the result
      this.cache.set(cacheKey, mergedSettings);
      
      return mergedSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      const defaultSettings = this.mergeWithDefaults({});
      this.cache.set(cacheKey, defaultSettings);
      return defaultSettings;
    }
  }

  /**
   * Save settings with debouncing
   */
  saveSettings(settings: Partial<AppSettings>, userId?: string, immediate = false): boolean {
    const cacheKey = userId ? `settings-${userId}` : 'settings-anonymous';
    const storageKey = userId 
      ? `${STORAGE_KEYS.USER_SETTINGS}-${userId}` 
      : STORAGE_KEYS.UNIFIED_SETTINGS;

    // Update cache immediately
    const currentSettings = this.getSettings(userId);
    const updatedSettings = {
      ...currentSettings,
      ...settings,
      lastModified: Date.now(),
    };
    
    this.cache.set(cacheKey, updatedSettings);

    // Debounced storage save
    const saveToStorage = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedSettings));
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());

        // Also save to unified theme storage for compatibility
        localStorage.setItem(STORAGE_KEYS.THEME_SETTINGS, JSON.stringify(updatedSettings.preferences));

        console.log('Settings saved successfully');
        return true;
      } catch (error) {
        console.error('Failed to save settings:', error);
        toast.error('Failed to save settings');
        return false;
      }
    };

    if (immediate) {
      return saveToStorage();
    }

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(storageKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      saveToStorage();
      this.debounceTimers.delete(storageKey);
    }, 500); // 500ms debounce

    this.debounceTimers.set(storageKey, timer);
    return true;
  }

  /**
   * Update specific settings section
   */
  updateSettings(
    updates: Partial<AppSettings>,
    section?: keyof AppSettings,
    userId?: string,
    immediate = false
  ): boolean {
    const currentSettings = this.getSettings(userId);
    let updatedSettings: Partial<AppSettings>;

    if (section && typeof updates === 'object') {
      updatedSettings = {
        ...currentSettings,
        [section]: {
          ...currentSettings[section],
          ...updates,
        },
      };
    } else {
      updatedSettings = {
        ...currentSettings,
        ...updates,
      };
    }

    return this.saveSettings(updatedSettings, userId, immediate);
  }

  /**
   * Reset settings to defaults
   */
  resetSettings(userId?: string): boolean {
    const cacheKey = userId ? `settings-${userId}` : 'settings-anonymous';
    const storageKey = userId 
      ? `${STORAGE_KEYS.USER_SETTINGS}-${userId}` 
      : STORAGE_KEYS.UNIFIED_SETTINGS;

    try {
      const defaultSettings = this.mergeWithDefaults({});
      
      // Update cache
      this.cache.set(cacheKey, defaultSettings);
      
      // Clear storage
      localStorage.removeItem(storageKey);
      localStorage.removeItem(STORAGE_KEYS.THEME_SETTINGS);
      
      // Save defaults
      localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
      localStorage.setItem(STORAGE_KEYS.THEME_SETTINGS, JSON.stringify(defaultSettings.preferences));
      
      toast.success('Settings reset to defaults');
      return true;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error('Failed to reset settings');
      return false;
    }
  }

  /**
   * Export settings
   */
  exportSettings(userId?: string): string {
    const settings = this.getSettings(userId);
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings
   */
  importSettings(settingsJson: string, userId?: string): boolean {
    try {
      const importedSettings = JSON.parse(settingsJson);
      const validatedSettings = this.mergeWithDefaults(importedSettings);
      
      this.saveSettings(validatedSettings, userId, true);
      toast.success('Settings imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      toast.error('Invalid settings file');
      return false;
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  /**
   * Apply theme settings to DOM
   */
  applyThemeSettings(preferences: UserPreferences): void {
    const root = document.documentElement;
    
    // Theme mode
    root.setAttribute('data-theme', preferences.theme);
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Font size
    const fontSizes = { small: '14px', medium: '16px', large: '18px' };
    root.style.setProperty('--base-font-size', fontSizes[preferences.fontSize]);

    // Density
    const spacings = { compact: '0.375rem', standard: '0.5rem', comfortable: '0.75rem' };
    root.style.setProperty('--base-spacing', spacings[preferences.density]);

    // High contrast
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Animations
    if (!preferences.animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }

    // Language direction
    const isRTL = preferences.language === 'ar';
    root.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    root.setAttribute('lang', preferences.language);
  }
}

// Create singleton instance
export const optimizedSettingsManager = new OptimizedSettingsManager();

// Export convenience functions
export const getSettings = (userId?: string) => optimizedSettingsManager.getSettings(userId);
export const saveSettings = (settings: Partial<AppSettings>, userId?: string, immediate = false) => 
  optimizedSettingsManager.saveSettings(settings, userId, immediate);
export const updateSettings = (updates: Partial<AppSettings>, section?: keyof AppSettings, userId?: string, immediate = false) => 
  optimizedSettingsManager.updateSettings(updates, section, userId, immediate);
export const resetSettings = (userId?: string) => optimizedSettingsManager.resetSettings(userId);
export const applyThemeSettings = (preferences: UserPreferences) => optimizedSettingsManager.applyThemeSettings(preferences);
