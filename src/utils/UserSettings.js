/**
 * User Settings Class - Extends BaseSettings with user-specific functionality
 * Handles global user preferences and settings inheritance
 */

import BaseSettings from './BaseSettings';

class UserSettings extends BaseSettings {
  constructor(userId, initialSettings = {}) {
    super(initialSettings);
    this.userId = userId;
    this.setupValidationRules();
    this.setupPermissions();
  }

  /**
   * Get default user settings
   */
  getDefaults() {
    return {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        profilePicture: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h'
      },
      preferences: {
        theme: 'system',
        language: 'en',
        fontSize: 'medium',
        density: 'standard',
        animations: true,
        highContrast: false,
        colorPreset: 'techno',
        soundEnabled: true,
        notificationsEnabled: true,
        autoSave: true,
        confirmActions: true
      },
      apiSettings: {
        magento: {
          baseUrl: '',
          apiKey: '',
          timeout: 30000,
          retryAttempts: 3,
          enableCache: true
        },
        cegid: {
          serverUrl: '',
          username: '',
          password: '',
          database: '',
          timeout: 30000
        },
        databases: {
          primary: {
            host: '',
            port: 5432,
            database: '',
            username: '',
            password: '',
            ssl: true
          }
        },
        general: {
          requestTimeout: 30000,
          maxRetries: 3,
          enableLogging: true,
          logLevel: 'info'
        }
      },
      gridSettings: {
        defaultPageSize: 25,
        enableVirtualization: true,
        showStatsCards: true,
        autoRefresh: false,
        refreshInterval: 300000, // 5 minutes
        exportFormat: 'xlsx',
        columnDefaults: {
          sortable: true,
          filterable: true,
          resizable: true
        }
      },
      dashboardSettings: {
        layout: 'default',
        widgets: [],
        refreshInterval: 60000, // 1 minute
        showWelcomeMessage: true,
        compactMode: false
      },
      securitySettings: {
        sessionTimeout: 3600000, // 1 hour
        requirePasswordConfirmation: true,
        enableTwoFactor: false,
        loginNotifications: true
      }
    };
  }

  /**
   * Setup validation rules for user settings
   */
  setupValidationRules() {
    // Personal Info validations
    this.addValidationRule('personalInfo.email', (value) => {
      if (!value) return true; // Optional
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    this.addValidationRule('personalInfo.phone', (value) => {
      if (!value) return true; // Optional
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
    });

    // Preferences validations
    this.addValidationRule('preferences.theme', (value) => {
      return ['light', 'dark', 'system'].includes(value);
    });

    this.addValidationRule('preferences.language', (value) => {
      const supportedLanguages = ['en', 'fr', 'ar', 'es', 'de'];
      return supportedLanguages.includes(value);
    });

    this.addValidationRule('preferences.fontSize', (value) => {
      return ['small', 'medium', 'large', 'extra-large'].includes(value);
    });

    this.addValidationRule('preferences.density', (value) => {
      return ['compact', 'standard', 'comfortable'].includes(value);
    });

    // API Settings validations
    this.addValidationRule('apiSettings.magento.baseUrl', (value) => {
      if (!value) return true; // Optional
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    });

    this.addValidationRule('apiSettings.general.requestTimeout', (value) => {
      return typeof value === 'number' && value > 0 && value <= 300000; // Max 5 minutes
    });

    // Grid Settings validations
    this.addValidationRule('gridSettings.defaultPageSize', (value) => {
      return typeof value === 'number' && value >= 10 && value <= 1000;
    });

    this.addValidationRule('gridSettings.refreshInterval', (value) => {
      return typeof value === 'number' && value >= 10000; // Min 10 seconds
    });
  }

  /**
   * Setup permissions for different user roles
   */
  setupPermissions() {
    // Admin users can modify all settings
    // Regular users have some restrictions
    
    // API settings might be restricted for some users
    this.setPermission('apiSettings.databases', 'write', this.hasRole('admin'));
    this.setPermission('securitySettings', 'write', this.hasRole('admin'));
    
    // All users can modify personal preferences
    this.setPermission('personalInfo', 'write', true);
    this.setPermission('preferences', 'write', true);
    this.setPermission('gridSettings', 'write', true);
    this.setPermission('dashboardSettings', 'write', true);
  }

  /**
   * Check if user has a specific role (placeholder - implement based on your auth system)
   */
  hasRole(role) {
    // This should be implemented based on your authentication system
    // For now, assume all users are regular users
    return role === 'user';
  }

  /**
   * Apply theme settings immediately
   */
  applyTheme() {
    const theme = this.get('preferences.theme');
    const colorPreset = this.get('preferences.colorPreset');
    const fontSize = this.get('preferences.fontSize');
    const density = this.get('preferences.density');
    const animations = this.get('preferences.animations');
    const highContrast = this.get('preferences.highContrast');

    // Apply to document root
    const root = document.documentElement;
    
    // Theme
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }

    // Color preset
    root.setAttribute('data-color-preset', colorPreset);

    // Font size
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[fontSize]);

    // Density
    const densityMap = {
      'compact': '0.8',
      'standard': '1.0',
      'comfortable': '1.2'
    };
    root.style.setProperty('--density-scale', densityMap[density]);

    // Animations
    root.style.setProperty('--animation-duration', animations ? '0.3s' : '0s');

    // High contrast
    root.setAttribute('data-high-contrast', highContrast ? 'true' : 'false');

    // Notify theme change
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme, colorPreset, fontSize, density, animations, highContrast }
    }));
  }

  /**
   * Apply language settings
   */
  applyLanguage() {
    const language = this.get('preferences.language');
    const supportedRTL = ['ar', 'he', 'fa'];
    const isRTL = supportedRTL.includes(language);

    // Set document language and direction
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

    // Notify language change
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language, isRTL }
    }));
  }

  /**
   * Get grid settings for a specific grid type
   */
  getGridSettings(gridType = 'default') {
    const baseGridSettings = this.get('gridSettings');
    const specificSettings = this.get(`gridSettings.${gridType}`) || {};
    
    return {
      ...baseGridSettings,
      ...specificSettings
    };
  }

  /**
   * Update grid settings for a specific grid type
   */
  updateGridSettings(gridType, settings) {
    this.set(`gridSettings.${gridType}`, {
      ...this.get(`gridSettings.${gridType}`, {}),
      ...settings
    });
    return this;
  }

  /**
   * Get API configuration for a specific service
   */
  getApiConfig(service) {
    return this.get(`apiSettings.${service}`, {});
  }

  /**
   * Update API configuration for a specific service
   */
  updateApiConfig(service, config) {
    this.set(`apiSettings.${service}`, {
      ...this.get(`apiSettings.${service}`, {}),
      ...config
    });
    return this;
  }

  /**
   * Export user settings with privacy filtering
   */
  exportSettings(includePrivate = false) {
    const settings = this.getSettings();
    
    if (!includePrivate) {
      // Remove sensitive information
      const filtered = { ...settings };
      
      // Remove passwords and API keys
      if (filtered.apiSettings) {
        Object.keys(filtered.apiSettings).forEach(service => {
          if (filtered.apiSettings[service]) {
            delete filtered.apiSettings[service].password;
            delete filtered.apiSettings[service].apiKey;
            delete filtered.apiSettings[service].token;
          }
        });
      }
      
      return filtered;
    }
    
    return settings;
  }

  /**
   * Save settings to localStorage with user-specific key
   */
  saveToLocal() {
    try {
      const key = `userSettings_${this.userId}`;
      localStorage.setItem(key, this.toJSON());
      localStorage.setItem(`${key}_lastModified`, Date.now().toString());
      return true;
    } catch (error) {
      console.error('Failed to save user settings to localStorage:', error);
      return false;
    }
  }

  /**
   * Load settings from localStorage
   */
  loadFromLocal() {
    try {
      const key = `userSettings_${this.userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        this.fromJSON(stored);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load user settings from localStorage:', error);
      return false;
    }
  }

  /**
   * Get last modified timestamp
   */
  getLastModified() {
    const key = `userSettings_${this.userId}_lastModified`;
    return localStorage.getItem(key);
  }
}

export default UserSettings;