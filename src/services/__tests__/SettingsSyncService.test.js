/**
 * SettingsSyncService Tests
 * Tests for the settings synchronization service functionality
 */

import SettingsSyncService from '../SettingsSyncService';
import { getDefaultSettings } from '../../utils/unifiedSettingsManager';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
    database: {}
}));

// Mock Firebase database functions
jest.mock('firebase/database', () => ({
    ref: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    onValue: jest.fn(),
    serverTimestamp: jest.fn(() => ({ '.sv': 'timestamp' })),
    push: jest.fn()
}));

// Mock unified settings manager
jest.mock('../../utils/unifiedSettingsManager', () => ({
    saveUnifiedSettings: jest.fn(() => true),
    saveUserSettings: jest.fn(() => true),
    getUserSettings: jest.fn(() => ({})),
    getUnifiedSettings: jest.fn(() => ({})),
    getDefaultSettings: jest.fn(() => ({
        preferences: {
            theme: 'system',
            language: 'en'
        }
    }))
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        warning: jest.fn(),
        info: jest.fn()
    }
}));

describe('SettingsSyncService', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Reset service state
        SettingsSyncService.syncQueue = [];
        SettingsSyncService.syncStatus = {
            lastSync: null,
            pendingChanges: 0,
            isOnline: true,
            syncInProgress: false,
            lastError: null,
            conflictsDetected: 0
        };
    });

    describe('saveSettings', () => {
        it('should save settings locally immediately', async () => {
            const testSettings = {
                preferences: {
                    theme: 'dark',
                    language: 'fr'
                }
            };

            const result = await SettingsSyncService.saveSettings('user123', testSettings);

            expect(result.success).toBe(true);
            expect(result.savedLocally).toBe(true);
            expect(result.queuedForSync).toBe(true);
        });

        it('should queue settings for cloud sync', async () => {
            const testSettings = {
                preferences: {
                    theme: 'light'
                }
            };

            await SettingsSyncService.saveSettings('user123', testSettings);

            expect(SettingsSyncService.syncQueue.length).toBe(1);
            expect(SettingsSyncService.syncQueue[0].userId).toBe('user123');
            expect(SettingsSyncService.syncQueue[0].settings).toEqual(testSettings);
        });

        it('should handle anonymous users', async () => {
            const testSettings = {
                preferences: {
                    theme: 'dark'
                }
            };

            const result = await SettingsSyncService.saveSettings(null, testSettings);

            expect(result.success).toBe(true);
            expect(SettingsSyncService.syncQueue.length).toBe(1);
            expect(SettingsSyncService.syncQueue[0].userId).toBeNull();
        });
    });

    describe('conflict resolution', () => {
        it('should detect conflicts between local and remote settings', async () => {
            const localSettings = {
                preferences: { theme: 'dark' },
                lastModified: 1000
            };

            const remoteSettings = {
                preferences: { theme: 'light' },
                lastModified: 2000
            };

            // Mock Firebase get to return remote settings
            const { get } = require('firebase/database');
            get.mockResolvedValue({
                exists: () => true,
                val: () => remoteSettings
            });

            const conflictResult = await SettingsSyncService.checkForConflicts(
                'user123',
                localSettings,
                localSettings.lastModified
            );

            expect(conflictResult.hasConflict).toBe(true);
            expect(conflictResult.conflicts.length).toBeGreaterThan(0);
        });

        it('should merge settings intelligently', () => {
            const localSettings = {
                preferences: { theme: 'dark', language: 'fr' },
                personalInfo: { name: 'Local User' },
                apiSettings: { url: 'local.api.com' }
            };

            const remoteSettings = {
                preferences: { theme: 'light', fontSize: 'large' },
                personalInfo: { email: 'remote@example.com' },
                apiSettings: { url: 'remote.api.com', token: 'abc123' }
            };

            const conflicts = [
                { path: 'preferences.theme', localValue: 'dark', remoteValue: 'light' }
            ];

            const merged = SettingsSyncService.mergeSettings(localSettings, remoteSettings, conflicts);

            // Preferences should favor local
            expect(merged.preferences.theme).toBe('dark');
            expect(merged.preferences.language).toBe('fr');
            expect(merged.preferences.fontSize).toBe('large');

            // Personal info should merge
            expect(merged.personalInfo.name).toBe('Local User');
            expect(merged.personalInfo.email).toBe('remote@example.com');

            // API settings should favor remote
            expect(merged.apiSettings.url).toBe('remote.api.com');
            expect(merged.apiSettings.token).toBe('abc123');
        });
    });

    describe('sync status', () => {
        it('should update sync status correctly', () => {
            const updates = {
                pendingChanges: 5,
                lastError: 'Test error'
            };

            SettingsSyncService.updateSyncStatus(updates);

            const status = SettingsSyncService.getSyncStatus();
            expect(status.pendingChanges).toBe(5);
            expect(status.lastError).toBe('Test error');
        });

        it('should notify listeners of status changes', () => {
            const mockListener = jest.fn();
            const unsubscribe = SettingsSyncService.addSyncListener(mockListener);

            SettingsSyncService.updateSyncStatus({ pendingChanges: 3 });

            expect(mockListener).toHaveBeenCalledWith('statusUpdate', expect.objectContaining({
                pendingChanges: 3
            }));

            unsubscribe();
        });
    });

    describe('network handling', () => {
        it('should handle offline state', async () => {
            // Simulate offline
            SettingsSyncService.isOnline = false;

            const testSettings = { preferences: { theme: 'dark' } };
            const result = await SettingsSyncService.saveSettings('user123', testSettings);

            expect(result.success).toBe(true);
            expect(result.savedLocally).toBe(true);
            expect(SettingsSyncService.syncQueue.length).toBe(1);
        });

        it('should process queue when coming back online', async () => {
            // Add items to queue while offline
            SettingsSyncService.isOnline = false;
            await SettingsSyncService.saveSettings('user123', { preferences: { theme: 'dark' } });

            expect(SettingsSyncService.syncQueue.length).toBe(1);

            // Simulate coming back online
            SettingsSyncService.isOnline = true;
            
            // Mock successful cloud sync
            const { set } = require('firebase/database');
            set.mockResolvedValue();

            await SettingsSyncService.processSyncQueue();

            // Queue should be processed (though we can't easily test the actual processing
            // without more complex mocking of Firebase operations)
            expect(set).toHaveBeenCalled();
        });
    });

    describe('anonymous user handling', () => {
        it('should generate anonymous ID for cloud storage', () => {
            // Clear any existing anonymous ID
            localStorage.removeItem('techno-etl-anonymous-id');

            const id1 = SettingsSyncService.getAnonymousId();
            const id2 = SettingsSyncService.getAnonymousId();

            expect(id1).toBeTruthy();
            expect(id1).toBe(id2); // Should be consistent
            expect(id1.startsWith('anon_')).toBe(true);
        });
    });

    describe('sync queue management', () => {
        it('should provide queue status information', async () => {
            await SettingsSyncService.saveSettings('user1', { preferences: { theme: 'dark' } });
            await SettingsSyncService.saveSettings('user2', { preferences: { theme: 'light' } });

            const queueStatus = SettingsSyncService.getSyncQueueStatus();

            expect(queueStatus.queueLength).toBe(2);
            expect(queueStatus.oldestItem).toBeTruthy();
            expect(queueStatus.newestItem).toBeTruthy();
        });

        it('should clear sync queue when requested', async () => {
            await SettingsSyncService.saveSettings('user1', { preferences: { theme: 'dark' } });
            
            expect(SettingsSyncService.syncQueue.length).toBe(1);

            SettingsSyncService.clearSyncQueue();

            expect(SettingsSyncService.syncQueue.length).toBe(0);
            expect(SettingsSyncService.getSyncStatus().pendingChanges).toBe(0);
        });
    });
});