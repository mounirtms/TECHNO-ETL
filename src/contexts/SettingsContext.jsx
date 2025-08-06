/**
 * Enhanced Settings Context for TECHNO-ETL
 * Manages all user preferences, settings, and their persistence
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from './AuthContext';
import { useCustomTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { 
    getUserSettings, 
    saveSettingsLocally, 
    getDefaultSettings, 
    resetSettingsToDefaults,
    mergeWithDefaults,
    applyUserPreferences,
    saveUserSettings
} from '../services/userService';
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
    const { mode, toggleTheme, fontSize, setFontSize, applyUserThemeSettings } = useCustomTheme();
    const { currentLanguage, setLanguage, applyUserLanguageSettings } = useLanguage();
    
    const [settings, setSettings] = useState(() => getUserSettings());
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(() => {
        return localStorage.getItem('settingsLastModified') || null;
    });

    // Apply settings when they change - integrate with unified theme system
    useEffect(() => {
        if (settings?.preferences) {
            // Apply theme settings through the unified theme context
            applyUserThemeSettings(settings);

            // Apply language settings
            if (applyUserLanguageSettings) {
                applyUserLanguageSettings(settings);
            }

            // Apply other user preferences
            applyUserPreferences(settings, {
                setLanguage,
                setTheme: (theme) => {
                    if (theme !== mode) {
                        toggleTheme();
                    }
                },
                setFontSize
            });
        }
    }, [settings?.preferences, applyUserThemeSettings, applyUserLanguageSettings, setLanguage, toggleTheme, setFontSize, mode]);

    // Unified settings management
    const getUnifiedSettings = useCallback(() => {
        try {
            const unifiedSettings = localStorage.getItem('techno-etl-settings');
            if (unifiedSettings) {
                return JSON.parse(unifiedSettings);
            }
        } catch (error) {
            console.warn('Error parsing unified settings:', error);
        }
        return null;
    }, []);

    const saveUnifiedSettings = useCallback((newSettings) => {
        try {
            const currentSettings = getUnifiedSettings() || {};
            const updatedSettings = { ...currentSettings, ...newSettings };
            localStorage.setItem('techno-etl-settings', JSON.stringify(updatedSettings));
        } catch (error) {
            console.error('Error saving unified settings:', error);
        }
    }, [getUnifiedSettings]);

    // Enhanced settings persistence with session management
    const persistSettings = useCallback(async (newSettings) => {
        try {
            // Always save locally first for immediate availability
            saveSettingsLocally(newSettings);
            
            // Save to unified localStorage system
            const unifiedSettings = {
                preferences: {
                    language: newSettings.preferences?.language || 'en',
                    theme: newSettings.preferences?.theme || 'system',
                    fontSize: newSettings.preferences?.fontSize || 'medium',
                    density: newSettings.preferences?.density || 'standard',
                    animations: newSettings.preferences?.animations !== false,
                    highContrast: newSettings.preferences?.highContrast === true,
                    colorPreset: newSettings.preferences?.colorPreset || 'techno'
                },
                performance: newSettings.performance || {},
                accessibility: newSettings.accessibility || {},
                lastModified: Date.now(),
                userId: currentUser?.uid || 'anonymous'
            };
            
            localStorage.setItem('techno-etl-unified-settings', JSON.stringify(unifiedSettings));
            
            // If user is authenticated, also save to Firebase for cross-device sync
            if (currentUser) {
                try {
                    const userSettingsRef = ref(database, `users/${currentUser.uid}/settings`);
                    await set(userSettingsRef, {
                        ...unifiedSettings,
                        syncedAt: Date.now(),
                        deviceInfo: {
                            userAgent: navigator.userAgent,
                            platform: navigator.platform,
                            timestamp: Date.now()
                        }
                    });
                    console.log('✅ Settings synced to Firebase');
                } catch (firebaseError) {
                    console.warn('⚠️ Firebase sync failed, settings saved locally:', firebaseError);
                }
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to persist settings:', error);
            return false;
        }
    }, [currentUser]);

    // Load settings when user logs in with enhanced session management
    useEffect(() => {
        if (currentUser) {
            loadRemoteSettings();
            
            // Set up real-time settings sync listener
            const userSettingsRef = ref(database, `users/${currentUser.uid}/settings`);
            const unsubscribeSettings = onValue(userSettingsRef, (snapshot) => {
                if (snapshot.exists()) {
                    const remoteSettings = snapshot.val();
                    const localLastModified = localStorage.getItem('settingsLastModified');
                    
                    // Only apply if remote is newer than local
                    if (!localLastModified || remoteSettings.lastModified > parseInt(localLastModified)) {
                        console.log('🔄 Applying newer remote settings');
                        const mergedSettings = mergeWithDefaults(remoteSettings);
                        setSettings(mergedSettings);
                        localStorage.setItem('settingsLastModified', remoteSettings.lastModified.toString());
                        
                        // Apply settings immediately
                        applyUserThemeSettings(mergedSettings);
                        if (applyUserLanguageSettings) {
                            applyUserLanguageSettings(mergedSettings);
                        }
                    }
                }
            }, (error) => {
                console.warn('Settings sync listener error:', error);
            });
            
            return () => {
                if (unsubscribeSettings) {
                    unsubscribeSettings();
                }
            };
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
    }, [currentUser, loadRemoteSettings, applyUserThemeSettings, applyUserLanguageSettings]);

    // Auto-save to local storage when settings change
    useEffect(() => {
        if (isDirty) {
            const timeoutId = setTimeout(() => {
                saveSettingsLocally(settings);
                setIsDirty(false);
            }, 1000); // 1 second debounce

            return () => clearTimeout(timeoutId);
        }
    }, [settings, isDirty]);

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

            // Apply theme and language settings immediately
            applyUserThemeSettings(mergedSettings);
            applyUserLanguageSettings(mergedSettings);

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
    }, [currentUser, applyUserThemeSettings, applyUserLanguageSettings]);

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
            const localSaved = saveSettingsLocally(settings);
            
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
        const defaults = resetSettingsToDefaults();
        setSettings(defaults);
        setIsDirty(true);
        toast.info('Settings reset to defaults');
    }, []);

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
