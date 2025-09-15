/**
 * Settings Manager - Coordinates between User and Page Settings
 * Implements DRY principles and object-oriented architecture
 */

import UserSettings from './UserSettings';
import PageSettings from './PageSettings';

class SettingsManager {
  constructor() {
    this.userSettings = null;
    this.pageSettings = new Map();
    this.currentPageId = null;
    this.listeners = new Map();
    this.permissionChecker = null;
  }

  /**
   * Initialize with user ID
   */
  initialize(userId) {
    this.userSettings = new UserSettings(userId);

    // Load user settings from localStorage
    this.userSettings.loadFromLocal();

    // Apply initial theme and language
    this.userSettings.applyTheme();
    this.userSettings.applyLanguage();

    // Setup auto-save
    this.userSettings.addListener('*', () => {
      this.userSettings.saveToLocal();
    });

    return this;
  }

  /**
   * Set permission checker function
   */
  setPermissionChecker(checker) {
    this.permissionChecker = checker;

    return this;
  }

  /**
   * Check if user has permission for a setting
   */
  hasPermission(key, permission = 'write') {
    if (this.permissionChecker) {
      return this.permissionChecker(key, permission);
    }

    return true; // Default to allowing all permissions
  }

  /**
   * Get or create page settings
   */
  getPageSettings(pageId) {
    if (!this.pageSettings.has(pageId)) {
      const pageSettings = new PageSettings(pageId, this.userSettings);

      pageSettings.loadFromLocal();

      // Setup auto-save for page settings
      pageSettings.addListener('*', () => {
        pageSettings.saveToLocal();
      });

      this.pageSettings.set(pageId, pageSettings);
    }

    return this.pageSettings.get(pageId);
  }

  /**
   * Set current page
   */
  setCurrentPage(pageId) {
    this.currentPageId = pageId;
    const pageSettings = this.getPageSettings(pageId);

    // Notify listeners about page change
    this.notifyListeners('pageChanged', { pageId, pageSettings });

    return pageSettings;
  }

  /**
   * Get current page settings
   */
  getCurrentPageSettings() {
    if (!this.currentPageId) {
      throw new Error('No current page set. Call setCurrentPage() first.');
    }

    return this.getPageSettings(this.currentPageId);
  }

  /**
   * Get user settings
   */
  getUserSettings() {
    if (!this.userSettings) {
      throw new Error('Settings manager not initialized. Call initialize() first.');
    }

    return this.userSettings;
  }

  /**
   * Get effective setting value (page override or user default)
   */
  get(key, pageId = null) {
    const targetPageId = pageId || this.currentPageId;

    if (targetPageId) {
      const pageSettings = this.getPageSettings(targetPageId);

      return pageSettings.getEffective(key);
    }

    return this.userSettings?.get(key);
  }

  /**
   * Set a setting value
   */
  set(key, value, options = {}) {
    const { pageId = null, scope = 'auto', validate = true } = options;

    // Check permissions
    if (!this.hasPermission(key, 'write')) {
      throw new Error(`No permission to modify setting: ${key}`);
    }

    // Determine scope
    let targetScope = scope;

    if (scope === 'auto') {
      targetScope = this.determineScope(key);
    }

    if (targetScope === 'page' && (pageId || this.currentPageId)) {
      const targetPageId = pageId || this.currentPageId;
      const pageSettings = this.getPageSettings(targetPageId);

      pageSettings.set(key, value, { validate });
    } else {
      this.userSettings.set(key, value, { validate });
    }

    return this;
  }

  /**
   * Determine appropriate scope for a setting
   */
  determineScope(key) {
    const pageSpecificKeys = [
      'grid.columns',
      'grid.filters',
      'grid.sorting',
      'layout',
      'filters.defaultFilters',
      'display.showStats',
      'display.showToolbar',
    ];

    const userGlobalKeys = [
      'preferences',
      'personalInfo',
      'apiSettings',
      'securitySettings',
    ];

    // Check if key starts with any page-specific pattern
    if (pageSpecificKeys.some(pattern => key.startsWith(pattern))) {
      return 'page';
    }

    // Check if key starts with any user-global pattern
    if (userGlobalKeys.some(pattern => key.startsWith(pattern))) {
      return 'user';
    }

    // Default to user scope
    return 'user';
  }

  /**
   * Update multiple settings at once
   */
  update(updates, options = {}) {
    const { pageId = null, scope = 'auto' } = options;

    for (const [key, value] of Object.entries(updates)) {
      this.set(key, value, { pageId, scope });
    }

    return this;
  }

  /**
   * Reset settings to defaults
   */
  reset(scope = 'user', pageId = null) {
    if (scope === 'user') {
      this.userSettings.reset();
    } else if (scope === 'page') {
      const targetPageId = pageId || this.currentPageId;

      if (targetPageId) {
        const pageSettings = this.getPageSettings(targetPageId);

        pageSettings.resetToDefaults();
      }
    } else if (scope === 'all') {
      this.userSettings.reset();
      this.pageSettings.forEach(pageSettings => {
        pageSettings.resetToDefaults();
      });
    }

    return this;
  }

  /**
   * Export settings
   */
  export(scope = 'all', includePrivate = false) {
    const exported = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      scope,
    };

    if (scope === 'user' || scope === 'all') {
      exported.userSettings = this.userSettings.exportSettings(includePrivate);
    }

    if (scope === 'page' || scope === 'all') {
      exported.pageSettings = {};
      this.pageSettings.forEach((settings, pageId) => {
        exported.pageSettings[pageId] = settings.getSettings();
      });
    }

    return exported;
  }

  /**
   * Import settings
   */
  import(data, options = {}) {
    const { merge = true, validate = true } = options;

    if (data.userSettings) {
      if (merge) {
        this.userSettings.merge(data.userSettings, { validate });
      } else {
        this.userSettings.fromJSON(data.userSettings);
      }
    }

    if (data.pageSettings) {
      for (const [pageId, settings] of Object.entries(data.pageSettings)) {
        const pageSettings = this.getPageSettings(pageId);

        if (merge) {
          pageSettings.merge(settings, { validate });
        } else {
          pageSettings.fromJSON(settings);
        }
      }
    }

    return this;
  }

  /**
   * Get settings summary for debugging
   */
  getSummary() {
    return {
      userSettings: this.userSettings ? {
        userId: this.userSettings.userId,
        settingsCount: Object.keys(this.userSettings.getSettings()).length,
        lastModified: this.userSettings.getLastModified(),
      } : null,
      pageSettings: Array.from(this.pageSettings.entries()).map(([pageId, settings]) => ({
        pageId,
        settingsCount: Object.keys(settings.getSettings()).length,
        inheritedCount: settings.getInheritedSettings().length,
        overriddenCount: settings.getOverriddenSettings().length,
      })),
      currentPage: this.currentPageId,
      totalListeners: this.listeners.size,
    };
  }

  /**
   * Add listener for settings changes
   */
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return this;
  }

  /**
   * Remove listener
   */
  removeListener(event, callback) {
    const eventListeners = this.listeners.get(event);

    if (eventListeners) {
      eventListeners.delete(callback);
    }

    return this;
  }

  /**
   * Notify listeners
   */
  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);

    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in settings manager listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Create a settings hook for React components
   */
  createHook() {
    return (pageId = null) => {
      const targetPageId = pageId || this.currentPageId;

      return {
        userSettings: this.userSettings,
        pageSettings: targetPageId ? this.getPageSettings(targetPageId) : null,
        get: (key) => this.get(key, targetPageId),
        set: (key, value, options = {}) => this.set(key, value, { ...options, pageId: targetPageId }),
        update: (updates, options = {}) => this.update(updates, { ...options, pageId: targetPageId }),
        reset: (scope = 'page') => this.reset(scope, targetPageId),
        hasPermission: (key, permission = 'write') => this.hasPermission(key, permission),
      };
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Save all settings before cleanup
    if (this.userSettings) {
      this.userSettings.saveToLocal();
    }

    this.pageSettings.forEach(pageSettings => {
      pageSettings.saveToLocal();
    });

    // Clear listeners
    this.listeners.clear();

    // Clear page settings
    this.pageSettings.clear();

    this.currentPageId = null;
  }
}

// Create singleton instance
const settingsManager = new SettingsManager();

export default settingsManager;
export { SettingsManager };
