/**
 * useSettingsManager Hook - React integration for the Settings Manager
 * Provides easy access to user and page settings with automatic updates
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import settingsManager from '../utils/SettingsManager';
import { useAuth } from '../contexts/AuthContext';

export const useSettingsManager = (pageId = null) => {
  const { currentUser } = useAuth();
  const [userSettings, setUserSettings] = useState(null);
  const [pageSettings, setPageSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize settings manager when user changes
  useEffect(() => {
    if (currentUser) {
      try {
        settingsManager.initialize(currentUser.uid);
        setUserSettings(settingsManager.getUserSettings());
        setError(null);
      } catch (err) {
        console.error('Failed to initialize settings manager:', err);
        setError(err.message);
      }
    } else {
      setUserSettings(null);
      setPageSettings(null);
    }
    setLoading(false);
  }, [currentUser]);

  // Set up page settings when pageId changes
  useEffect(() => {
    if (pageId && userSettings) {
      try {
        const pageSettingsInstance = settingsManager.setCurrentPage(pageId);

        setPageSettings(pageSettingsInstance);
        setError(null);
      } catch (err) {
        console.error(`Failed to set up page settings for ${pageId}:`, err);
        setError(err.message);
      }
    }
  }, [pageId, userSettings]);

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      // Force re-render by updating state
      setUserSettings(settingsManager.getUserSettings());
      if (pageId) {
        setPageSettings(settingsManager.getPageSettings(pageId));
      }
    };

    // Listen for user settings changes
    if (userSettings) {
      userSettings.addListener('*', handleSettingsChange);
    }

    // Listen for page settings changes
    if (pageSettings) {
      pageSettings.addListener('*', handleSettingsChange);
    }

    return () => {
      if (userSettings) {
        userSettings.removeListener('*', handleSettingsChange);
      }
      if (pageSettings) {
        pageSettings.removeListener('*', handleSettingsChange);
      }
    };
  }, [userSettings, pageSettings, pageId]);

  // Get setting value with inheritance
  const getSetting = useCallback((key, defaultValue = null) => {
    try {
      return settingsManager.get(key, pageId) ?? defaultValue;
    } catch (err) {
      console.error(`Failed to get setting ${key}:`, err);

      return defaultValue;
    }
  }, [pageId]);

  // Set setting value
  const setSetting = useCallback((key, value, options = {}) => {
    try {
      settingsManager.set(key, value, { ...options, pageId });

      return true;
    } catch (err) {
      console.error(`Failed to set setting ${key}:`, err);
      setError(err.message);

      return false;
    }
  }, [pageId]);

  // Update multiple settings
  const updateSettings = useCallback((updates, options = {}) => {
    try {
      settingsManager.update(updates, { ...options, pageId });

      return true;
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err.message);

      return false;
    }
  }, [pageId]);

  // Reset settings
  const resetSettings = useCallback((scope = 'page') => {
    try {
      settingsManager.reset(scope, pageId);

      return true;
    } catch (err) {
      console.error(`Failed to reset ${scope} settings:`, err);
      setError(err.message);

      return false;
    }
  }, [pageId]);

  // Check permissions
  const hasPermission = useCallback((key, permission = 'write') => {
    try {
      return settingsManager.hasPermission(key, permission);
    } catch (err) {
      console.error(`Failed to check permission for ${key}:`, err);

      return false;
    }
  }, []);

  // Export settings
  const exportSettings = useCallback((scope = 'all', includePrivate = false) => {
    try {
      return settingsManager.export(scope, includePrivate);
    } catch (err) {
      console.error('Failed to export settings:', err);
      setError(err.message);

      return null;
    }
  }, []);

  // Import settings
  const importSettings = useCallback((data, options = {}) => {
    try {
      settingsManager.import(data, options);

      return true;
    } catch (err) {
      console.error('Failed to import settings:', err);
      setError(err.message);

      return false;
    }
  }, []);

  // Get grid settings for current page
  const getGridSettings = useCallback(() => {
    if (!pageSettings) return null;

    return {
      pageSize: getSetting('grid.pageSize', 25),
      density: getSetting('grid.density', 'standard'),
      columns: getSetting('grid.columns', []),
      filters: getSetting('grid.filters', {}),
      sorting: getSetting('grid.sorting', []),
      showStats: getSetting('display.showStats', true),
      showToolbar: getSetting('display.showToolbar', true),
    };
  }, [pageSettings, getSetting]);

  // Update grid settings
  const updateGridSettings = useCallback((gridUpdates) => {
    const updates = {};

    Object.entries(gridUpdates).forEach(([key, value]) => {
      if (key === 'showStats' || key === 'showToolbar') {
        updates[`display.${key}`] = value;
      } else {
        updates[`grid.${key}`] = value;
      }
    });

    return updateSettings(updates);
  }, [updateSettings]);

  // Get theme settings
  const getThemeSettings = useCallback(() => {
    return {
      theme: getSetting('preferences.theme', 'system'),
      colorPreset: getSetting('preferences.colorPreset', 'techno'),
      fontSize: getSetting('preferences.fontSize', 'medium'),
      density: getSetting('preferences.density', 'standard'),
      animations: getSetting('preferences.animations', true),
      highContrast: getSetting('preferences.highContrast', false),
    };
  }, [getSetting]);

  // Get API settings
  const getApiSettings = useCallback((service) => {
    return getSetting(`apiSettings.${service}`, {});
  }, [getSetting]);

  // Memoized return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    // State
    userSettings,
    pageSettings,
    loading,
    error,

    // Core functions
    getSetting,
    setSetting,
    updateSettings,
    resetSettings,
    hasPermission,
    exportSettings,
    importSettings,

    // Specialized functions
    getGridSettings,
    updateGridSettings,
    getThemeSettings,
    getApiSettings,

    // Utilities
    isInitialized: !!userSettings,
    hasPageSettings: !!pageSettings,
    currentPageId: pageId,

    // Direct access to settings instances (for advanced usage)
    settingsManager,
  }), [
    userSettings,
    pageSettings,
    loading,
    error,
    getSetting,
    setSetting,
    updateSettings,
    resetSettings,
    hasPermission,
    exportSettings,
    importSettings,
    getGridSettings,
    updateGridSettings,
    getThemeSettings,
    getApiSettings,
    pageId,
  ]);

  return returnValue;
};

// Hook for grid-specific settings
export const useGridSettings = (pageId) => {
  const settings = useSettingsManager(pageId);

  return useMemo(() => ({
    ...settings.getGridSettings(),
    updateSettings: settings.updateGridSettings,
    resetToDefaults: () => settings.resetSettings('page'),
    hasPermission: settings.hasPermission,
  }), [settings]);
};

// Hook for theme settings
export const useThemeSettings = () => {
  const settings = useSettingsManager();

  return useMemo(() => ({
    ...settings.getThemeSettings(),
    updateTheme: (themeUpdates) => settings.updateSettings(
      Object.fromEntries(
        Object.entries(themeUpdates).map(([key, value]) => [`preferences.${key}`, value]),
      ),
    ),
    applyTheme: () => {
      if (settings.userSettings) {
        settings.userSettings.applyTheme();
      }
    },
    applyLanguage: () => {
      if (settings.userSettings) {
        settings.userSettings.applyLanguage();
      }
    },
  }), [settings]);
};

// Hook for API settings
export const useApiSettings = (service) => {
  const settings = useSettingsManager();

  return useMemo(() => ({
    config: settings.getApiSettings(service),
    updateConfig: (configUpdates) => settings.updateSettings({
      [`apiSettings.${service}`]: {
        ...settings.getApiSettings(service),
        ...configUpdates,
      },
    }),
    hasPermission: (permission = 'write') => settings.hasPermission(`apiSettings.${service}`, permission),
  }), [settings, service]);
};

export default useSettingsManager;
