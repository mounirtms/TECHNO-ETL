/**
 * Page Settings Class - Extends BaseSettings with page-specific functionality
 * Handles page-specific settings that override global settings
 */

import BaseSettings from './BaseSettings';

class PageSettings extends BaseSettings {
  constructor(pageId, userSettings = null, initialSettings = {}) {
    super(initialSettings);
    this.pageId = pageId;
    this.userSettings = userSettings;
    this.setupInheritance();
  }

  /**
   * Get default page settings based on page type
   */
  getDefaults() {
    const commonDefaults = {
      layout: {
        sidebar: true,
        breadcrumbs: true,
        pageTitle: true,
        helpButton: true
      },
      grid: {
        pageSize: null, // Inherit from user settings
        density: null, // Inherit from user settings
        columns: [],
        filters: {},
        sorting: [],
        grouping: null
      },
      filters: {
        persistent: true,
        showAdvanced: false,
        defaultFilters: {}
      },
      display: {
        theme: null, // Inherit from user settings
        animations: null, // Inherit from user settings
        showStats: true,
        showToolbar: true
      }
    };

    // Page-specific defaults
    const pageDefaults = {
      dashboard: {
        ...commonDefaults,
        widgets: {
          layout: 'grid',
          columns: 3,
          spacing: 'standard',
          autoRefresh: true,
          refreshInterval: 60000
        },
        charts: {
          type: 'line',
          showLegend: true,
          showTooltips: true,
          animations: true
        }
      },
      products: {
        ...commonDefaults,
        grid: {
          ...commonDefaults.grid,
          pageSize: 50,
          density: 'standard',
          columns: [
            { field: 'sku', visible: true, width: 120 },
            { field: 'name', visible: true, width: 200 },
            { field: 'price', visible: true, width: 100 },
            { field: 'stock', visible: true, width: 80 },
            { field: 'status', visible: true, width: 100 }
          ],
          sorting: [{ field: 'name', direction: 'asc' }]
        },
        export: {
          format: 'xlsx',
          includeImages: false,
          includeVariants: true
        }
      },
      orders: {
        ...commonDefaults,
        grid: {
          ...commonDefaults.grid,
          pageSize: 25,
          columns: [
            { field: 'orderNumber', visible: true, width: 120 },
            { field: 'customer', visible: true, width: 150 },
            { field: 'date', visible: true, width: 120 },
            { field: 'total', visible: true, width: 100 },
            { field: 'status', visible: true, width: 100 }
          ],
          sorting: [{ field: 'date', direction: 'desc' }]
        },
        notifications: {
          newOrders: true,
          statusChanges: true,
          paymentUpdates: true
        }
      },
      customers: {
        ...commonDefaults,
        grid: {
          ...commonDefaults.grid,
          pageSize: 30,
          columns: [
            { field: 'name', visible: true, width: 150 },
            { field: 'email', visible: true, width: 200 },
            { field: 'phone', visible: true, width: 120 },
            { field: 'orders', visible: true, width: 80 },
            { field: 'lastOrder', visible: true, width: 120 }
          ]
        },
        privacy: {
          showSensitiveData: false,
          requireConfirmation: true
        }
      },
      reports: {
        ...commonDefaults,
        defaultReport: 'sales-summary',
        dateRange: {
          default: 'last-30-days',
          allowCustom: true
        },
        charts: {
          type: 'bar',
          showDataLabels: true,
          exportFormat: 'png'
        },
        scheduling: {
          enabled: true,
          defaultFrequency: 'weekly',
          emailNotifications: true
        }
      },
      settings: {
        ...commonDefaults,
        tabs: {
          defaultTab: 'personal-info',
          showProgress: true,
          confirmChanges: true
        },
        validation: {
          realTime: true,
          showErrors: true,
          requireConfirmation: true
        }
      }
    };

    return pageDefaults[this.pageId] || commonDefaults;
  }

  /**
   * Setup inheritance from user settings
   */
  setupInheritance() {
    if (this.userSettings) {
      // Listen for user settings changes
      this.userSettings.addListener('*', (newSettings, oldSettings, key) => {
        this.handleUserSettingsChange(key, newSettings);
      });
    }
  }

  /**
   * Handle changes in user settings that affect this page
   */
  handleUserSettingsChange(key, userSettings) {
    // Update inherited settings
    if (key.startsWith('preferences.')) {
      this.updateInheritedPreferences(userSettings.preferences);
    } else if (key.startsWith('gridSettings.')) {
      this.updateInheritedGridSettings(userSettings.gridSettings);
    }
  }

  /**
   * Update inherited preferences
   */
  updateInheritedPreferences(preferences) {
    const updates = {};
    
    // Inherit theme if not overridden
    if (this.get('display.theme') === null) {
      updates['display.theme'] = preferences.theme;
    }
    
    // Inherit animations if not overridden
    if (this.get('display.animations') === null) {
      updates['display.animations'] = preferences.animations;
    }
    
    // Inherit density if not overridden
    if (this.get('grid.density') === null) {
      updates['grid.density'] = preferences.density;
    }
    
    if (Object.keys(updates).length > 0) {
      this.update(updates, { notify: true });
    }
  }

  /**
   * Update inherited grid settings
   */
  updateInheritedGridSettings(gridSettings) {
    const updates = {};
    
    // Inherit page size if not overridden
    if (this.get('grid.pageSize') === null) {
      updates['grid.pageSize'] = gridSettings.defaultPageSize;
    }
    
    if (Object.keys(updates).length > 0) {
      this.update(updates, { notify: true });
    }
  }

  /**
   * Get effective setting value (with inheritance)
   */
  getEffective(key, defaultValue = null) {
    const value = this.get(key);
    
    // If value is null, try to inherit from user settings
    if (value === null && this.userSettings) {
      const inheritanceMap = {
        'display.theme': 'preferences.theme',
        'display.animations': 'preferences.animations',
        'grid.density': 'preferences.density',
        'grid.pageSize': 'gridSettings.defaultPageSize'
      };
      
      const userKey = inheritanceMap[key];
      if (userKey) {
        return this.userSettings.get(userKey, defaultValue);
      }
    }
    
    return value !== null ? value : defaultValue;
  }

  /**
   * Override a setting (break inheritance)
   */
  override(key, value) {
    this.set(key, value);
    return this;
  }

  /**
   * Reset to inherit from user settings
   */
  inherit(key) {
    this.set(key, null);
    return this;
  }

  /**
   * Get column configuration for grids
   */
  getColumnConfig() {
    return this.get('grid.columns', []);
  }

  /**
   * Update column configuration
   */
  updateColumnConfig(columns) {
    this.set('grid.columns', columns);
    return this;
  }

  /**
   * Get filter configuration
   */
  getFilterConfig() {
    return {
      persistent: this.get('filters.persistent', true),
      showAdvanced: this.get('filters.showAdvanced', false),
      defaultFilters: this.get('filters.defaultFilters', {}),
      currentFilters: this.get('grid.filters', {})
    };
  }

  /**
   * Update filter configuration
   */
  updateFilterConfig(filters) {
    this.set('grid.filters', filters);
    return this;
  }

  /**
   * Get sorting configuration
   */
  getSortingConfig() {
    return this.get('grid.sorting', []);
  }

  /**
   * Update sorting configuration
   */
  updateSortingConfig(sorting) {
    this.set('grid.sorting', sorting);
    return this;
  }

  /**
   * Get layout configuration
   */
  getLayoutConfig() {
    return this.get('layout', {});
  }

  /**
   * Update layout configuration
   */
  updateLayoutConfig(layout) {
    this.update({ layout: { ...this.get('layout', {}), ...layout } });
    return this;
  }

  /**
   * Save page settings to localStorage
   */
  saveToLocal() {
    try {
      const key = `pageSettings_${this.pageId}`;
      localStorage.setItem(key, this.toJSON());
      localStorage.setItem(`${key}_lastModified`, Date.now().toString());
      return true;
    } catch (error) {
      console.error(`Failed to save page settings for ${this.pageId}:`, error);
      return false;
    }
  }

  /**
   * Load page settings from localStorage
   */
  loadFromLocal() {
    try {
      const key = `pageSettings_${this.pageId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        this.fromJSON(stored);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to load page settings for ${this.pageId}:`, error);
      return false;
    }
  }

  /**
   * Reset page settings to defaults
   */
  resetToDefaults() {
    this.settings = { ...this.getDefaults() };
    this.notifyChange('*', this.settings, {});
    return this;
  }

  /**
   * Get settings summary for debugging
   */
  getSummary() {
    return {
      pageId: this.pageId,
      hasUserSettings: !!this.userSettings,
      settingsCount: Object.keys(this.settings).length,
      inheritedSettings: this.getInheritedSettings(),
      overriddenSettings: this.getOverriddenSettings()
    };
  }

  /**
   * Get list of settings that are inherited
   */
  getInheritedSettings() {
    const inherited = [];
    const checkInherited = (obj, path = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (value === null) {
          inherited.push(currentPath);
        } else if (typeof value === 'object' && value !== null) {
          checkInherited(value, currentPath);
        }
      }
    };
    
    checkInherited(this.settings);
    return inherited;
  }

  /**
   * Get list of settings that are overridden
   */
  getOverriddenSettings() {
    const overridden = [];
    const defaults = this.getDefaults();
    
    const checkOverridden = (current, defaultObj, path = '') => {
      for (const [key, value] of Object.entries(current)) {
        const currentPath = path ? `${path}.${key}` : key;
        const defaultValue = defaultObj[key];
        
        if (value !== null && value !== defaultValue) {
          if (typeof value === 'object' && typeof defaultValue === 'object') {
            checkOverridden(value, defaultValue, currentPath);
          } else {
            overridden.push(currentPath);
          }
        }
      }
    };
    
    checkOverridden(this.settings, defaults);
    return overridden;
  }
}

export default PageSettings;