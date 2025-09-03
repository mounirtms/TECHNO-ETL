/**
 * Settings Synchronization Service
 * Handles cloud storage integration, immediate local saves with cloud sync queuing,
 * conflict resolution, and sync status feedback for user settings
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { ref, set, get, onValue, serverTimestamp, push } from 'firebase/database';
import { database } from '../config/firebase';
import {
  saveUnifiedSettings,
  saveUserSettings,
  getUserSettings,
  getUnifiedSettings,
  getDefaultSettings,
} from '../utils/unifiedSettingsManager';
import { toast } from 'react-toastify';

class SettingsSyncService {
  constructor() {
    this.database = database;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.syncListeners = new Set();
    this.conflictResolvers = new Map();
    this.retryAttempts = 0;
    this.maxRetryAttempts = 3;
    this.retryDelay = 1000; // Start with 1 second

    // Initialize online/offline listeners
    this.initializeNetworkListeners();

    // Initialize sync status
    this.syncStatus = {
      lastSync: null,
      pendingChanges: 0,
      isOnline: this.isOnline,
      syncInProgress: false,
      lastError: null,
      conflictsDetected: 0,
    };
  }

  /**
     * Initialize network status listeners
     */
  initializeNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateSyncStatus({ isOnline: true, lastError: null });
      this.processSyncQueue();
      this.notifyListeners('network', { online: true });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateSyncStatus({ isOnline: false });
      this.notifyListeners('network', { online: false });
    });
  }

  /**
     * Save settings with immediate local storage and cloud sync queuing
     * Requirement 7.1, 7.2
     */
  async saveSettings(userId, settings, options = {}) {
    const { immediate = false, skipLocal = false } = options;

    try {
      // Step 1: Immediate local storage save (Requirement 7.2)
      if (!skipLocal) {
        const localSaveResult = userId
          ? saveUserSettings(userId, settings)
          : saveUnifiedSettings(settings);

        if (!localSaveResult) {
          throw new Error('Failed to save settings locally');
        }

        console.log('✅ Settings saved locally immediately');
      }

      // Step 2: Queue for cloud sync (Requirement 7.2)
      const syncItem = {
        id: Date.now() + Math.random(),
        userId,
        settings,
        timestamp: Date.now(),
        attempts: 0,
        immediate,
      };

      this.syncQueue.push(syncItem);
      this.updateSyncStatus({ pendingChanges: this.syncQueue.length });

      // Step 3: Process sync queue if online
      if (this.isOnline && !this.syncInProgress) {
        await this.processSyncQueue();
      }

      return {
        success: true,
        savedLocally: true,
        queuedForSync: true,
        syncStatus: this.syncStatus,
      };

    } catch (error) {
      console.error('❌ Error saving settings:', error);
      this.updateSyncStatus({ lastError: error.message });

      return {
        success: false,
        error: error.message,
        savedLocally: false,
        queuedForSync: false,
      };
    }
  }

  /**
     * Process the sync queue with retry logic
     * Requirement 7.2
     */
  async processSyncQueue() {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.updateSyncStatus({ syncInProgress: true });
    this.notifyListeners('syncStart', { queueLength: this.syncQueue.length });

    const processedItems = [];
    const failedItems = [];

    for (const item of this.syncQueue) {
      try {
        const result = await this.syncToCloud(item);

        if (result.success) {
          processedItems.push(item);
          console.log(`✅ Synced settings for ${item.userId || 'anonymous'}`);
        } else {
          item.attempts++;
          if (item.attempts >= this.maxRetryAttempts) {
            failedItems.push(item);
            console.error(`❌ Failed to sync after ${this.maxRetryAttempts} attempts:`, result.error);
          } else {
            // Keep in queue for retry with exponential backoff
            setTimeout(() => {
              console.log(`🔄 Retrying sync for ${item.userId || 'anonymous'} (attempt ${item.attempts + 1})`);
            }, this.retryDelay * Math.pow(2, item.attempts));
          }
        }
      } catch (error) {
        console.error('❌ Sync processing error:', error);
        item.attempts++;
        if (item.attempts >= this.maxRetryAttempts) {
          failedItems.push(item);
        }
      }
    }

    // Remove processed items from queue
    this.syncQueue = this.syncQueue.filter(item =>
      !processedItems.includes(item) && !failedItems.includes(item),
    );

    // Update sync status
    const now = Date.now();

    this.updateSyncStatus({
      lastSync: processedItems.length > 0 ? now : this.syncStatus.lastSync,
      pendingChanges: this.syncQueue.length,
      syncInProgress: false,
      lastError: failedItems.length > 0 ? `${failedItems.length} items failed to sync` : null,
    });

    this.syncInProgress = false;
    this.notifyListeners('syncComplete', {
      processed: processedItems.length,
      failed: failedItems.length,
      remaining: this.syncQueue.length,
    });

    // Show user feedback
    if (processedItems.length > 0) {
      toast.success(`Settings synced successfully (${processedItems.length} items)`);
    }

    if (failedItems.length > 0) {
      toast.warning(`Some settings failed to sync (${failedItems.length} items). Will retry later.`);
    }
  }

  /**
     * Sync individual item to cloud storage
     * Requirement 7.1
     */
  async syncToCloud(syncItem) {
    try {
      const { userId, timestamp } = syncItem;
      let { settings } = syncItem;
      const settingsRef = userId
        ? ref(this.database, `users/${userId}/settings`)
        : ref(this.database, `anonymous/${this.getAnonymousId()}/settings`);

      // Check for conflicts before saving (Requirement 7.3)
      const conflictResult = await this.checkForConflicts(userId, settings, timestamp);

      if (conflictResult.hasConflict) {
        const resolution = await this.resolveConflict(conflictResult);

        if (!resolution.resolved) {
          return {
            success: false,
            error: 'Conflict resolution failed',
            conflict: conflictResult,
          };
        }
        // Use resolved settings
        settings = resolution.resolvedSettings;
      }

      // Prepare cloud data
      const cloudData = {
        ...settings,
        syncedAt: serverTimestamp(),
        lastModified: timestamp,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: Date.now(),
        },
        version: '2.1.0',
      };

      // Save to Firebase
      await set(settingsRef, cloudData);

      return { success: true };

    } catch (error) {
      console.error('❌ Cloud sync error:', error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
     * Check for conflicts between local and remote settings
     * Requirement 7.3
     */
  async checkForConflicts(userId, localSettings, localTimestamp) {
    try {
      const settingsRef = userId
        ? ref(this.database, `users/${userId}/settings`)
        : ref(this.database, `anonymous/${this.getAnonymousId()}/settings`);

      const snapshot = await get(settingsRef);

      if (!snapshot.exists()) {
        return { hasConflict: false };
      }

      const remoteSettings = snapshot.val();
      const remoteTimestamp = remoteSettings.lastModified || 0;

      // Check if remote is newer than local
      if (remoteTimestamp > localTimestamp) {
        // Find specific conflicts
        const conflicts = this.findSettingsDifferences(localSettings, remoteSettings);

        if (conflicts.length > 0) {
          this.updateSyncStatus({
            conflictsDetected: this.syncStatus.conflictsDetected + 1,
          });

          return {
            hasConflict: true,
            localSettings,
            remoteSettings,
            conflicts,
            localTimestamp,
            remoteTimestamp,
          };
        }
      }

      return { hasConflict: false };

    } catch (error) {
      console.error('❌ Error checking for conflicts:', error);

      return { hasConflict: false, error: error.message };
    }
  }

  /**
     * Find differences between local and remote settings
     */
  findSettingsDifferences(local, remote) {
    const conflicts = [];

    const compareObjects = (localObj, remoteObj, path = '') => {
      for (const key in localObj) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof localObj[key] === 'object' && localObj[key] !== null) {
          if (typeof remoteObj[key] === 'object' && remoteObj[key] !== null) {
            compareObjects(localObj[key], remoteObj[key], currentPath);
          } else {
            conflicts.push({
              path: currentPath,
              localValue: localObj[key],
              remoteValue: remoteObj[key],
              type: 'object_mismatch',
            });
          }
        } else if (localObj[key] !== remoteObj[key]) {
          conflicts.push({
            path: currentPath,
            localValue: localObj[key],
            remoteValue: remoteObj[key],
            type: 'value_mismatch',
          });
        }
      }
    };

    compareObjects(local, remote);

    return conflicts;
  }

  /**
     * Resolve conflicts between local and remote settings
     * Requirement 7.3
     */
  async resolveConflict(conflictResult) {
    const { localSettings, remoteSettings, conflicts, localTimestamp, remoteTimestamp } = conflictResult;

    try {
      // Check if there's a custom conflict resolver
      const customResolver = this.conflictResolvers.get('settings');

      if (customResolver) {
        const resolution = await customResolver(conflictResult);

        if (resolution) {
          return {
            resolved: true,
            resolvedSettings: resolution,
            strategy: 'custom',
          };
        }
      }

      // Default conflict resolution strategies
      const strategy = await this.getConflictResolutionStrategy(conflicts);

      let resolvedSettings;

      switch (strategy) {
      case 'use_remote':
        resolvedSettings = remoteSettings;
        toast.info('Using remote settings (newer version found)');
        break;

      case 'use_local':
        resolvedSettings = localSettings;
        toast.info('Using local settings (keeping your changes)');
        break;

      case 'merge':
        resolvedSettings = this.mergeSettings(localSettings, remoteSettings, conflicts);
        toast.info('Merged local and remote settings');
        break;

      case 'user_choice':
        resolvedSettings = await this.promptUserForResolution(conflictResult);
        break;

      default:
        // Fallback to remote if newer, otherwise local
        resolvedSettings = remoteTimestamp > localTimestamp ? remoteSettings : localSettings;
        break;
      }

      // Update local storage with resolved settings
      if (conflictResult.userId) {
        saveUserSettings(conflictResult.userId, resolvedSettings);
      } else {
        saveUnifiedSettings(resolvedSettings);
      }

      return {
        resolved: true,
        resolvedSettings,
        strategy,
      };

    } catch (error) {
      console.error('❌ Error resolving conflict:', error);

      return {
        resolved: false,
        error: error.message,
      };
    }
  }

  /**
     * Determine conflict resolution strategy based on conflict types
     */
  async getConflictResolutionStrategy(conflicts) {
    // Analyze conflicts to determine best strategy
    const criticalConflicts = conflicts.filter(c =>
      c.path.includes('apiSettings') ||
            c.path.includes('personalInfo'),
    );

    const preferenceConflicts = conflicts.filter(c =>
      c.path.includes('preferences') ||
            c.path.includes('theme') ||
            c.path.includes('language'),
    );

    // Critical settings require user choice
    if (criticalConflicts.length > 0) {
      return 'user_choice';
    }

    // Preference conflicts can be merged
    if (preferenceConflicts.length > 0 && criticalConflicts.length === 0) {
      return 'merge';
    }

    // Default to using remote if it's newer
    return 'use_remote';
  }

  /**
     * Merge settings intelligently
     */
  mergeSettings(localSettings, remoteSettings, conflicts) {
    const merged = { ...remoteSettings };

    // For preferences, prefer local changes
    if (localSettings.preferences && remoteSettings.preferences) {
      merged.preferences = {
        ...remoteSettings.preferences,
        ...localSettings.preferences,
      };
    }

    // For API settings, prefer remote (more likely to be correct)
    if (remoteSettings.apiSettings) {
      merged.apiSettings = remoteSettings.apiSettings;
    }

    // For personal info, prefer local (user might have updated)
    if (localSettings.personalInfo) {
      merged.personalInfo = {
        ...remoteSettings.personalInfo || {},
        ...localSettings.personalInfo,
      };
    }

    return merged;
  }

  /**
     * Prompt user for conflict resolution
     * Requirement 7.4
     */
  async promptUserForResolution(conflictResult) {
    return new Promise((resolve) => {
      // Create a custom event that the UI can listen to
      const conflictEvent = new CustomEvent('settingsConflict', {
        detail: {
          conflictResult,
          resolve: (choice) => {
            switch (choice) {
            case 'local':
              resolve(conflictResult.localSettings);
              break;
            case 'remote':
              resolve(conflictResult.remoteSettings);
              break;
            case 'merge':
              resolve(this.mergeSettings(
                conflictResult.localSettings,
                conflictResult.remoteSettings,
                conflictResult.conflicts,
              ));
              break;
            default:
              resolve(conflictResult.remoteSettings);
            }
          },
        },
      });

      window.dispatchEvent(conflictEvent);

      // Fallback timeout - use remote after 30 seconds
      setTimeout(() => {
        resolve(conflictResult.remoteSettings);
        toast.warning('Conflict resolution timed out. Using remote settings.');
      }, 30000);
    });
  }

  /**
     * Load settings from cloud with conflict detection
     * Requirement 7.1, 7.3
     */
  async loadFromCloud(userId) {
    try {
      const settingsRef = userId
        ? ref(this.database, `users/${userId}/settings`)
        : ref(this.database, `anonymous/${this.getAnonymousId()}/settings`);

      const snapshot = await get(settingsRef);

      if (!snapshot.exists()) {
        console.log('No cloud settings found, using local/defaults');

        return {
          success: true,
          settings: userId ? getUserSettings(userId) : getUnifiedSettings(),
          source: 'local',
        };
      }

      const cloudSettings = snapshot.val();
      const localSettings = userId ? getUserSettings(userId) : getUnifiedSettings();

      // Check for conflicts
      const conflictResult = await this.checkForConflicts(
        userId,
        localSettings,
        localSettings.lastModified || 0,
      );

      if (conflictResult.hasConflict) {
        const resolution = await this.resolveConflict(conflictResult);

        return {
          success: true,
          settings: resolution.resolvedSettings,
          source: 'resolved',
          hadConflicts: true,
        };
      }

      // No conflicts, use cloud settings if newer
      const useCloud = cloudSettings.lastModified > (localSettings.lastModified || 0);
      const finalSettings = useCloud ? cloudSettings : localSettings;

      // Update local storage if using cloud settings
      if (useCloud) {
        if (userId) {
          saveUserSettings(userId, finalSettings);
        } else {
          saveUnifiedSettings(finalSettings);
        }
      }

      return {
        success: true,
        settings: finalSettings,
        source: useCloud ? 'cloud' : 'local',
      };

    } catch (error) {
      console.error('❌ Error loading from cloud:', error);
      this.updateSyncStatus({ lastError: error.message });

      // Fallback to local settings
      const fallbackSettings = userId ? getUserSettings(userId) : getUnifiedSettings();

      return {
        success: false,
        settings: fallbackSettings,
        source: 'local_fallback',
        error: error.message,
      };
    }
  }

  /**
     * Set up real-time sync listener for a user
     * Requirement 7.1
     */
  setupRealtimeSync(userId) {
    const settingsRef = userId
      ? ref(this.database, `users/${userId}/settings`)
      : ref(this.database, `anonymous/${this.getAnonymousId()}/settings`);

    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteSettings = snapshot.val();
        const localSettings = userId ? getUserSettings(userId) : getUnifiedSettings();

        // Only apply if remote is newer
        if (remoteSettings.lastModified > (localSettings.lastModified || 0)) {
          console.log('🔄 Applying newer remote settings');

          if (userId) {
            saveUserSettings(userId, remoteSettings);
          } else {
            saveUnifiedSettings(remoteSettings);
          }

          // Notify listeners
          this.notifyListeners('remoteUpdate', {
            userId,
            settings: remoteSettings,
          });

          toast.info('Settings updated from another device');
        }
      }
    }, (error) => {
      console.warn('❌ Real-time sync error:', error);
      this.updateSyncStatus({ lastError: error.message });
    });

    return unsubscribe;
  }

  /**
     * Get anonymous user ID for cloud storage
     */
  getAnonymousId() {
    let anonymousId = localStorage.getItem('techno-etl-anonymous-id');

    if (!anonymousId) {
      anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('techno-etl-anonymous-id', anonymousId);
    }

    return anonymousId;
  }

  /**
     * Update sync status and notify listeners
     * Requirement 7.4, 7.5
     */
  updateSyncStatus(updates) {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.notifyListeners('statusUpdate', this.syncStatus);
  }

  /**
     * Add sync status listener
     * Requirement 7.4, 7.5
     */
  addSyncListener(callback) {
    this.syncListeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.syncListeners.delete(callback);
    };
  }

  /**
     * Notify all sync listeners
     */
  notifyListeners(event, data) {
    this.syncListeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('❌ Error in sync listener:', error);
      }
    });
  }

  /**
     * Register custom conflict resolver
     */
  registerConflictResolver(type, resolver) {
    this.conflictResolvers.set(type, resolver);
  }

  /**
     * Get current sync status
     * Requirement 7.4, 7.5
     */
  getSyncStatus() {
    return { ...this.syncStatus };
  }

  /**
     * Force sync all pending changes
     */
  async forceSyncAll() {
    if (!this.isOnline) {
      toast.error('Cannot sync while offline');

      return false;
    }

    await this.processSyncQueue();

    return this.syncQueue.length === 0;
  }

  /**
     * Clear sync queue (use with caution)
     */
  clearSyncQueue() {
    this.syncQueue = [];
    this.updateSyncStatus({ pendingChanges: 0 });
  }

  /**
     * Get sync queue status
     */
  getSyncQueueStatus() {
    return {
      queueLength: this.syncQueue.length,
      oldestItem: this.syncQueue.length > 0 ? this.syncQueue[0].timestamp : null,
      newestItem: this.syncQueue.length > 0 ? this.syncQueue[this.syncQueue.length - 1].timestamp : null,
    };
  }
}

// Export singleton instance
export default new SettingsSyncService();
