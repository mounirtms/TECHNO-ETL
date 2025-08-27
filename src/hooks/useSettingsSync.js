/**
 * useSettingsSync Hook
 * React hook for managing settings synchronization with real-time status updates
 * Provides easy access to sync functionality and status for components
 * 
 * Requirements: 7.4, 7.5 (Clear sync status and error feedback)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import SettingsSyncService from '../services/SettingsSyncService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export const useSettingsSync = (options = {}) => {
    const { autoSync = true, enableRealtimeSync = true } = options;
    const { currentUser } = useAuth();
    const [syncStatus, setSyncStatus] = useState(SettingsSyncService.getSyncStatus());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const realtimeSyncUnsubscribe = useRef(null);

    // Update sync status when it changes
    useEffect(() => {
        const unsubscribe = SettingsSyncService.addSyncListener((event, data) => {
            switch (event) {
                case 'statusUpdate':
                    setSyncStatus(data);
                    if (data.lastError) {
                        setError(data.lastError);
                    } else {
                        setError(null);
                    }
                    break;
                    
                case 'syncStart':
                    setIsLoading(true);
                    setError(null);
                    break;
                    
                case 'syncComplete':
                    setIsLoading(false);
                    if (data.failed > 0) {
                        setError(`${data.failed} items failed to sync`);
                    }
                    break;
                    
                case 'network':
                    if (data.online && autoSync) {
                        // Auto-sync when coming back online
                        SettingsSyncService.processSyncQueue();
                    }
                    break;
                    
                case 'remoteUpdate':
                    // Settings were updated from another device
                    toast.info('Settings synchronized from another device');
                    break;
                    
                default:
                    break;
            }
        });

        return unsubscribe;
    }, [autoSync]);

    // Set up real-time sync when user changes
    useEffect(() => {
        if (enableRealtimeSync && currentUser) {
            // Clean up previous listener
            if (realtimeSyncUnsubscribe.current) {
                realtimeSyncUnsubscribe.current();
            }
            
            // Set up new listener
            realtimeSyncUnsubscribe.current = SettingsSyncService.setupRealtimeSync(currentUser.uid);
        }
        
        return () => {
            if (realtimeSyncUnsubscribe.current) {
                realtimeSyncUnsubscribe.current();
                realtimeSyncUnsubscribe.current = null;
            }
        };
    }, [currentUser, enableRealtimeSync]);

    // Save settings with sync
    const saveSettings = useCallback(async (settings, options = {}) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await SettingsSyncService.saveSettings(
                currentUser?.uid,
                settings,
                options
            );
            
            if (!result.success) {
                setError(result.error);
                return result;
            }
            
            return result;
        } catch (err) {
            const errorMessage = err.message || 'Failed to save settings';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    // Load settings from cloud
    const loadFromCloud = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await SettingsSyncService.loadFromCloud(currentUser?.uid);
            
            if (!result.success) {
                setError(result.error);
            }
            
            return result;
        } catch (err) {
            const errorMessage = err.message || 'Failed to load settings from cloud';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    // Force sync all pending changes
    const forceSyncAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const success = await SettingsSyncService.forceSyncAll();
            
            if (success) {
                toast.success('All settings synchronized successfully');
            } else {
                setError('Some settings failed to synchronize');
                toast.warning('Some settings failed to synchronize');
            }
            
            return success;
        } catch (err) {
            const errorMessage = err.message || 'Failed to force sync';
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get sync queue status
    const getSyncQueueStatus = useCallback(() => {
        return SettingsSyncService.getSyncQueueStatus();
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Get human-readable sync status
    const getSyncStatusText = useCallback(() => {
        if (!syncStatus.isOnline) {
            return 'Offline - Changes will sync when connection is restored';
        }
        
        if (syncStatus.syncInProgress) {
            return 'Synchronizing settings...';
        }
        
        if (syncStatus.pendingChanges > 0) {
            return `${syncStatus.pendingChanges} changes pending sync`;
        }
        
        if (syncStatus.lastSync) {
            const lastSyncDate = new Date(syncStatus.lastSync);
            const now = new Date();
            const diffMinutes = Math.floor((now - lastSyncDate) / (1000 * 60));
            
            if (diffMinutes < 1) {
                return 'Synced just now';
            } else if (diffMinutes < 60) {
                return `Synced ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
            } else {
                const diffHours = Math.floor(diffMinutes / 60);
                return `Synced ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            }
        }
        
        return 'Ready to sync';
    }, [syncStatus]);

    // Get sync status color for UI indicators
    const getSyncStatusColor = useCallback(() => {
        if (error || syncStatus.lastError) {
            return 'error'; // Red
        }
        
        if (!syncStatus.isOnline) {
            return 'warning'; // Orange
        }
        
        if (syncStatus.syncInProgress) {
            return 'info'; // Blue
        }
        
        if (syncStatus.pendingChanges > 0) {
            return 'warning'; // Orange
        }
        
        return 'success'; // Green
    }, [syncStatus, error]);

    return {
        // Status
        syncStatus,
        isLoading,
        error,
        
        // Actions
        saveSettings,
        loadFromCloud,
        forceSyncAll,
        clearError,
        
        // Utilities
        getSyncQueueStatus,
        getSyncStatusText,
        getSyncStatusColor,
        
        // Direct access to service for advanced usage
        syncService: SettingsSyncService
    };
};

export default useSettingsSync;