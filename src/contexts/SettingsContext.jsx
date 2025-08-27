/**
 * Enhanced Settings Context for TECHNO-ETL
 * Manages all user preferences, settings, and their persistence
 * Professional unified settings management system
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from './AuthContext';
import {
    saveUserSettings
} from '../services/userService';
import {
    getUnifiedSettings,
    saveUnifiedSettings,
    getUserSettings,
    getDefaultSettings,
    resetToSystemDefaults,
    applyLanguageSettings,
    getSystemPreferences
} from '../utils/unifiedSettingsManager';
import SettingsSyncService from '../services/SettingsSyncService';
import { toast } from 'react-toastify';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const { currentUser } = useAuth();

    // Initialize settings with defaults first
    const [settings, setSettings] = useState(null);

    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(() => {
        return localStorage.getItem('settingsLastModified') || null;
    });

    // Simple merge function for settings
    const mergeWithDefaults = (userSettings) => {
        const defaults = getDefaultSettings();
        return { ...defaults, ...userSettings };
    };

    // Initialize settings on mount with comprehensive error handling
    useEffect(() => {
        const initializeSettings = async () => {
            setLoading(true);
            try {
                let initialSettings;

                if (currentUser) {
                    // Try to get user settings with fallback
                    try {
                        initialSettings = getUserSettings(currentUser.uid);
                        if (!initialSettings || Object.keys(initialSettings).length === 0) {
                            console.warn('Empty user settings, using defaults');
                            initialSettings = getDefaultSettings();
                        }
                    } catch (userError) {
                        console.warn('Failed to load user settings, using defaults:', userError);
                        initialSettings = getDefaultSettings();
                    }
                } else {
                    // Try to get unified settings with fallback
                    try {
                        initialSettings = getUnifiedSettings();
                        if (!initialSettings || Object.keys(initialSettings).length === 0) {
                            console.warn('Empty unified settings, using defaults');
                            initialSettings = getDefaultSettings();
                        }
                    } catch (unifiedError) {
                        console.warn('Failed to load unified settings, using defaults:', unifiedError);
                        initialSettings = getDefaultSettings();
                    }
                }

                // Validate settings structure
                const validatedSettings = mergeWithDefaults(initialSettings);
                setSettings(validatedSettings);

                // Apply language settings with error handling
                if (validatedSettings.language) {
                    try {
                        applyLanguageSettings(validatedSettings.language);
                    } catch (langError) {
                        console.warn('Failed to apply language settings:', langError);
                    }
                }

                console.log('✅ Settings initialized successfully');
            } catch (error) {
                console.error('❌ Critical error initializing settings:', error);
                // Last resort fallback
                const fallbackSettings = getDefaultSettings();
                setSettings(fallbackSettings);
                toast.error('Failed to load user preferences. Using defaults.');
            } finally {
                setLoading(false);
            }
        };

        initializeSettings();
    }, [currentUser]);

    // Apply settings when they change
    useEffect(() => {
        if (settings) {
            // Apply language settings immediately
            if (settings.language) {
                applyLanguageSettings(settings.language);
            }

            // Notify other contexts about settings changes
            window.dispatchEvent(new CustomEvent('settingsChanged', {
                detail: settings
            }));
        }
    }, [settings]);



    // Enhanced settings persistence with new sync service
    const persistSettings = useCallback(async (newSettings) => {
        try {
            // Use the new SettingsSyncService for enhanced sync capabilities
            const result = await SettingsSyncService.saveSettings(
                currentUser?.uid,
                newSettings,
                { immediate: false }
            );
            
            if (result.success) {
                console.log('✅ Settings saved with sync service');
                return true;
            } else {
                console.error('❌ Sync service failed:', result.error);
                // Fallback to direct local save
                if (currentUser) {
                    saveUserSettings(currentUser.uid, newSettings);
                } else {
                    saveUnifiedSettings(newSettings);
                }
                return true;
            }
        } catch (error) {
            console.error('❌ Failed to persist settings:', error);
            // Fallback to direct local save
            try {
                if (currentUser) {
                    saveUserSettings(currentUser.uid, newSettings);
                } else {
                    saveUnifiedSettings(newSettings);
                }
                return true;
            } catch (fallbackError) {
                console.error('❌ Fallback save also failed:', fallbackError);
                return false;
            }
        }
    }, [currentUser]);

    // Define loadRemoteSettings first
    const loadRemoteSettings = useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            // Try to load from Firebase/remote first
            let userSettings = null;

            try {
                // In a real app, you would fetch from your backend/Firebase
                // For now, we'll simulate remote loading with local storage
                const remoteSettings = localStorage.getItem(`userSettings_${currentUser.uid}`);
                if (remoteSettings) {
                    userSettings = JSON.parse(remoteSettings);
                }
            } catch (remoteError) {
                console.warn('Failed to load remote settings, using local:', remoteError);
            }

            // Fallback to local settings
            if (!userSettings) {
                userSettings = getUserSettings();
            }

            // Merge with defaults to ensure all properties exist
            const mergedSettings = mergeWithDefaults(userSettings);
            setSettings(mergedSettings);

            // Apply settings through unified system
            if (mergedSettings.language) {
                applyLanguageSettings(mergedSettings.language);
            }

            // Notify other contexts about user settings
            window.dispatchEvent(new CustomEvent('userSettingsLoaded', {
                detail: mergedSettings
            }));

            console.log('User settings loaded and applied successfully');
            toast.success('Welcome back! Your preferences have been restored.');

        } catch (error) {
            console.error('Error loading user settings:', error);
            toast.error('Failed to load your settings. Using defaults.');

            // Load defaults on error
            const defaults = getDefaultSettings();
            setSettings(defaults);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Load settings when user logs in with enhanced sync service
    useEffect(() => {
        let realtimeSyncUnsubscribe = null;
        
        if (currentUser) {
            // Load settings using sync service
            const loadSettingsWithSync = async () => {
                try {
                    const result = await SettingsSyncService.loadFromCloud(currentUser.uid);
                    if (result.success) {
                        const mergedSettings = mergeWithDefaults(result.settings);
                        setSettings(mergedSettings);
                        
                        // Apply settings immediately
                        if (mergedSettings.language) {
                            applyLanguageSettings(mergedSettings.language);
                        }
                        
                        if (result.hadConflicts) {
                            toast.info('Settings conflicts were resolved automatically');
                        }
                        
                        console.log(`✅ Settings loaded from ${result.source}`);
                    }
                } catch (error) {
                    console.error('❌ Error loading settings with sync service:', error);
                    // Fallback to original method
                    loadRemoteSettings();
                }
            };
            
            loadSettingsWithSync();
            
            // Set up real-time sync using the sync service
            realtimeSyncUnsubscribe = SettingsSyncService.setupRealtimeSync(currentUser.uid);
            
            // Listen for remote updates
            const handleRemoteUpdate = (event) => {
                if (event.detail.userId === currentUser.uid) {
                    const mergedSettings = mergeWithDefaults(event.detail.settings);
                    setSettings(mergedSettings);
                    
                    // Apply settings immediately
                    if (mergedSettings.language) {
                        applyLanguageSettings(mergedSettings.language);
                    }
                }
            };
            
            SettingsSyncService.addSyncListener((eventType, data) => {
                if (eventType === 'remoteUpdate') {
                    handleRemoteUpdate({ detail: data });
                }
            });
            
        } else {
            // Reset to system defaults when user logs out but preserve anonymous settings
            const anonymousSettings = localStorage.getItem('techno-etl-unified-settings');
            if (anonymousSettings) {
                try {
                    const parsed = JSON.parse(anonymousSettings);
                    const defaults = mergeWithDefaults(parsed);
                    setSettings(defaults);
                } catch (error) {
                    console.warn('Failed to parse anonymous settings, using defaults');
                    const defaults = getDefaultSettings();
                    setSettings(defaults);
                }
            } else {
                const defaults = getDefaultSettings();
                setSettings(defaults);
            }
            setIsDirty(false);
        }
        
        return () => {
            if (realtimeSyncUnsubscribe) {
                realtimeSyncUnsubscribe();
            }
        };
    }, [currentUser, loadRemoteSettings]);

    // Auto-save to local storage when settings change
    useEffect(() => {
        if (isDirty) {
            const timeoutId = setTimeout(() => {
                if (currentUser) {
                    saveUserSettings(currentUser.uid, settings);
                } else {
                    saveUnifiedSettings(settings);
                }
                setIsDirty(false);
            }, 1000); // 1 second debounce

            return () => clearTimeout(timeoutId);
        }
    }, [settings, isDirty]);

    const updateSettings = useCallback((updates, section = null) => {
        setSettings(prevSettings => {
            let newSettings;

            if (section) {
                // Update specific section
                newSettings = {
                    ...prevSettings,
                    [section]: {
                        ...prevSettings[section],
                        ...updates
                    }
                };
            } else {
                // Merge all updates
                newSettings = mergeWithDefaults({
                    ...prevSettings,
                    ...updates
                });
            }

            // Save to unified storage - sync preferences to theme storage
            if (section === 'preferences' || newSettings.preferences) {
                const unifiedThemeSettings = {
                    theme: newSettings.preferences?.theme || 'system',
                    fontSize: newSettings.preferences?.fontSize || 'medium',
                    colorPreset: newSettings.preferences?.colorPreset || 'techno',
                    density: newSettings.preferences?.density || 'standard',
                    animations: newSettings.preferences?.animations !== false,
                    highContrast: newSettings.preferences?.highContrast === true,
                    language: newSettings.preferences?.language || 'en'
                };
                
                // Save to unified theme storage
                try {
                    localStorage.setItem('techno-etl-settings', JSON.stringify(unifiedThemeSettings));
                    console.log('Settings synced to unified theme storage:', unifiedThemeSettings);
                } catch (error) {
                    console.error('Error syncing to unified theme storage:', error);
                }
            }

            // Also save to legacy settings storage
            saveUnifiedSettings(newSettings);

            return newSettings;
        });

        setIsDirty(true);
    }, [saveUnifiedSettings]);

    const saveSettings = useCallback(async (forceSave = false) => {
        if (!isDirty && !forceSave) {
            return { success: true, message: 'No changes to save' };
        }

        setLoading(true);
        try {
            // Save locally first
            let localSaved;
            if (currentUser) {
                localSaved = saveUserSettings(currentUser.uid, settings);
            } else {
                localSaved = saveUnifiedSettings(settings);
            }

            if (!localSaved) {
                throw new Error('Failed to save settings locally');
            }

            // Save remotely if user is authenticated
            if (currentUser) {
                try {
                    await saveUserSettings(currentUser.uid, settings);
                    setLastSyncTime(Date.now().toString());
                } catch (remoteError) {
                    console.warn('Failed to save to remote, but local save succeeded:', remoteError);
                    toast.warning('Settings saved locally. Will sync when connection is restored.');
                }
            }

            setIsDirty(false);
            toast.success('Settings saved successfully');
            return { success: true, message: 'Settings saved successfully' };
            
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, [settings, isDirty, currentUser]);

    const resetSettings = useCallback(() => {
        const defaults = resetToSystemDefaults(currentUser?.uid);
        setSettings(defaults);
        setIsDirty(true);
        toast.info('Settings reset to defaults');
    }, [currentUser]);

    const exportSettings = useCallback(() => {
        try {
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `techno-etl-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success('Settings exported successfully');
        } catch (error) {
            console.error('Error exporting settings:', error);
            toast.error('Failed to export settings');
        }
    }, [settings]);

    const importSettings = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedSettings = JSON.parse(e.target.result);
                    const mergedSettings = mergeWithDefaults(importedSettings);
                    
                    setSettings(mergedSettings);
                    setIsDirty(true);
                    
                    toast.success('Settings imported successfully');
                    resolve(mergedSettings);
                } catch (error) {
                    console.error('Error importing settings:', error);
                    toast.error('Invalid settings file');
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                toast.error('Failed to read settings file');
                reject(new Error('File read error'));
            };
            
            reader.readAsText(file);
        });
    }, []);

    // Memoized context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        settings,
        loading,
        isDirty,
        lastSyncTime,
        updateSettings,
        saveSettings,
        resetSettings,
        exportSettings,
        importSettings,
        loadRemoteSettings
    }), [
        settings,
        loading,
        isDirty,
        lastSyncTime,
        updateSettings,
        saveSettings,
        resetSettings,
        exportSettings,
        importSettings,
        loadRemoteSettings
    ]);

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;
