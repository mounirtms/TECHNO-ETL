/**
 * Base Settings Class - Object-Oriented Settings Architecture
 * Provides core functionality for all settings types with inheritance support
 */

class BaseSettings {
  constructor(initialSettings = {}) {
    this.settings = { ...this.getDefaults(), ...initialSettings };
    this.listeners = new Map();
    this.validationRules = new Map();
    this.permissions = new Map();
  }

  /**
   * Get default settings - to be overridden by subclasses
   */
  getDefaults() {
    return {};
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Get a specific setting value with dot notation support
   */
  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.settings;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  /**
   * Set a setting value with validation and permissions check
   */
  set(key, value, options = {}) {
    const { validate = true, checkPermissions = true, notify = true } = options;

    // Check permissions
    if (checkPermissions && !this.hasPermission(key, 'write')) {
      throw new Error(`No permission to modify setting: ${key}`);
    }

    // Validate value
    if (validate && !this.validateSetting(key, value)) {
      throw new Error(`Invalid value for setting: ${key}`);
    }

    // Set the value using dot notation
    const keys = key.split('.');
    let target = this.settings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in target) || typeof target[k] !== 'object') {
        target[k] = {};
      }
      target = target[k];
    }
    
    const lastKey = keys[keys.length - 1];
    const oldValue = target[lastKey];
    target[lastKey] = value;

    // Notify listeners
    if (notify) {
      this.notifyChange(key, value, oldValue);
    }

    return this;
  }

  /**
   * Update multiple settings at once
   */
  update(updates, options = {}) {
    const { validate = true, checkPermissions = true, notify = true } = options;
    const changes = [];

    // Validate all changes first
    for (const [key, value] of Object.entries(updates)) {
      if (checkPermissions && !this.hasPermission(key, 'write')) {
        throw new Error(`No permission to modify setting: ${key}`);
      }
      
      if (validate && !this.validateSetting(key, value)) {
        throw new Error(`Invalid value for setting: ${key}`);
      }
      
      changes.push({ key, value, oldValue: this.get(key) });
    }

    // Apply all changes
    for (const { key, value } of changes) {
      this.set(key, value, { validate: false, checkPermissions: false, notify: false });
    }

    // Notify all changes at once
    if (notify) {
      for (const { key, value, oldValue } of changes) {
        this.notifyChange(key, value, oldValue);
      }
    }

    return this;
  }

  /**
   * Reset settings to defaults
   */
  reset(keys = null) {
    const defaults = this.getDefaults();
    
    if (keys) {
      // Reset specific keys
      const keysArray = Array.isArray(keys) ? keys : [keys];
      for (const key of keysArray) {
        const defaultValue = this.getNestedValue(defaults, key);
        if (defaultValue !== undefined) {
          this.set(key, defaultValue);
        }
      }
    } else {
      // Reset all settings
      this.settings = { ...defaults };
      this.notifyChange('*', this.settings, {});
    }

    return this;
  }

  /**
   * Add validation rule for a setting
   */
  addValidationRule(key, validator) {
    this.validationRules.set(key, validator);
    return this;
  }

  /**
   * Validate a setting value
   */
  validateSetting(key, value) {
    const validator = this.validationRules.get(key);
    if (validator) {
      return validator(value, this.settings);
    }
    return true; // No validator means valid
  }

  /**
   * Set permission for a setting
   */
  setPermission(key, permission, allowed = true) {
    if (!this.permissions.has(key)) {
      this.permissions.set(key, {});
    }
    this.permissions.get(key)[permission] = allowed;
    return this;
  }

  /**
   * Check if user has permission for a setting
   */
  hasPermission(key, permission) {
    const keyPermissions = this.permissions.get(key);
    if (!keyPermissions) {
      return true; // No restrictions means allowed
    }
    return keyPermissions[permission] !== false;
  }

  /**
   * Add change listener
   */
  addListener(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return this;
  }

  /**
   * Remove change listener
   */
  removeListener(key, callback) {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.delete(callback);
    }
    return this;
  }

  /**
   * Notify listeners of changes
   */
  notifyChange(key, newValue, oldValue) {
    // Notify specific key listeners
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error(`Error in settings listener for ${key}:`, error);
        }
      });
    }

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => {
        try {
          callback(this.settings, { [key]: oldValue }, key);
        } catch (error) {
          console.error(`Error in wildcard settings listener:`, error);
        }
      });
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, key) {
    const keys = key.split('.');
    let value = obj;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Serialize settings to JSON
   */
  toJSON() {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Load settings from JSON
   */
  fromJSON(json) {
    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      this.settings = { ...this.getDefaults(), ...parsed };
      this.notifyChange('*', this.settings, {});
      return this;
    } catch (error) {
      throw new Error(`Invalid JSON settings: ${error.message}`);
    }
  }

  /**
   * Clone settings instance
   */
  clone() {
    const cloned = new this.constructor(this.settings);
    
    // Copy validation rules
    for (const [key, validator] of this.validationRules) {
      cloned.addValidationRule(key, validator);
    }
    
    // Copy permissions
    for (const [key, permissions] of this.permissions) {
      for (const [permission, allowed] of Object.entries(permissions)) {
        cloned.setPermission(key, permission, allowed);
      }
    }
    
    return cloned;
  }

  /**
   * Merge with another settings instance
   */
  merge(otherSettings, options = {}) {
    const { overwrite = true, validate = true } = options;
    const other = otherSettings instanceof BaseSettings ? otherSettings.getSettings() : otherSettings;
    
    for (const [key, value] of Object.entries(other)) {
      if (overwrite || this.get(key) === undefined) {
        this.set(key, value, { validate });
      }
    }
    
    return this;
  }

  /**
   * Get settings diff between this and another settings instance
   */
  diff(otherSettings) {
    const other = otherSettings instanceof BaseSettings ? otherSettings.getSettings() : otherSettings;
    const differences = {};
    
    const checkDiff = (obj1, obj2, path = '') => {
      for (const key in obj1) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!(key in obj2)) {
          differences[currentPath] = { current: obj1[key], other: undefined };
        } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
          checkDiff(obj1[key], obj2[key], currentPath);
        } else if (obj1[key] !== obj2[key]) {
          differences[currentPath] = { current: obj1[key], other: obj2[key] };
        }
      }
      
      for (const key in obj2) {
        const currentPath = path ? `${path}.${key}` : key;
        if (!(key in obj1)) {
          differences[currentPath] = { current: undefined, other: obj2[key] };
        }
      }
    };
    
    checkDiff(this.settings, other);
    return differences;
  }
}

export default BaseSettings;