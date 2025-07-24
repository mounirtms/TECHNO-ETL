/**
 * Enhanced Settings Context for TECHNO-ETL
 * Manages all user preferences, settings, and their persistence
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
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
    const { mode, toggleTheme, fontSize, setFontSize } = useTheme();
    const { currentLanguage, setLanguage } = useLanguage();
    
    const [settings, setSettings] = useState(() => getUserSettings());
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(() => {
        return localStorage.getItem('settingsLastModified') || null;
    });

    // Apply settings when they change
    useEffect(() => {
        if (settings?.preferences) {
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
    }, [settings?.preferences, setLanguage, toggleTheme, setFontSize, mode]);

    // Load settings from remote when user logs in
    useEffect(() => {
        if (currentUser) {
            loadRemoteSettings();
        } else {
            // Reset to defaults when user logs out
            const defaults = getDefaultSettings();
            setSettings(defaults);
            setIsDirty(false);
        }
    }, [currentUser]);

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
            // In a real app, you would fetch from your backend/Firebase
            // For now, we'll use local storage as the source of truth
            const localSettings = getUserSettings();
            setSettings(localSettings);
            
            console.log('Settings loaded successfully');
        } catch (error) {
            console.error('Error loading remote settings:', error);
            toast.error('Failed to load settings from server');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

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
            
            return newSettings;
        });
        
        setIsDirty(true);
    }, []);

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
