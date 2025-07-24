import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { getUserProfileData, saveUserSettings, getDefaultSettings } from '../../services/userService';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

export const useProfileController = () => {
    const { currentUser } = useAuth();
    const { settings, updateSettings, saveSettings } = useSettings();

    // Use settings from SettingsContext instead of local state
    const [userData, setUserDataState] = useState(settings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(() => {
        return localStorage.getItem('lastSyncTime') || null;
    });

    // Sync with Firebase when component mounts
    useEffect(() => {
        if (!currentUser) {
            setUserDataState(getDefaultSettings());
            setLoading(false);
            return;
        }

        const unsubscribe = getUserProfileData(currentUser.uid, (data) => {
            try {
                if (data) {
                    // Merge with defaults to ensure all fields exist
                    const defaults = getDefaultSettings();
                    const mergedData = {
                        personalInfo: { ...defaults.personalInfo, ...data.personalInfo },
                        apiSettings: { ...defaults.apiSettings, ...data.apiSettings },
                        preferences: { ...defaults.preferences, ...data.preferences }
                    };

                    // Only update if data is newer than local storage
                    const serverTimestamp = data.lastModified || Date.now();
                    if (!lastSyncTime || serverTimestamp > parseInt(lastSyncTime)) {
                        setUserDataState(mergedData);
                        // Update settings context which will handle preference application
                        updateSettings(mergedData);
                        localStorage.setItem('userSettings', JSON.stringify(mergedData));
                        localStorage.setItem('lastSyncTime', serverTimestamp.toString());
                        setLastSyncTime(serverTimestamp.toString());
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error('Error loading user data:', err);
                setError(err);
                setLoading(false);
            }
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [currentUser]);

    // Sync userData with settings when settings change
    useEffect(() => {
        setUserDataState(settings);
    }, [settings]);

    // Debounced auto-save to local storage
    useEffect(() => {
        if (userData) {
            const timeoutId = setTimeout(() => {
                localStorage.setItem('userSettings', JSON.stringify(userData));
                setIsDirty(true);
            }, 500); // 500ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [userData]);

    const updateUserData = (updates, section) => {
        if (!currentUser) {
            toast.error('User not authenticated');
            return;
        }

        // Use SettingsContext for updates
        updateSettings(updates, section);

        // Also update local state for immediate UI feedback
        setUserDataState(prevData => {
            const newData = { ...prevData };

            if (section) {
                newData[section] = {
                    ...prevData[section],
                    ...updates
                };
            } else {
                Object.keys(updates).forEach(key => {
                    if (newData[key]) {
                        newData[key] = {
                            ...newData[key],
                            ...updates[key]
                        };
                    }
                });
            }

            return newData;
        });
    };

    const saveUserData = async (forceSave = false) => {
        if (!currentUser) {
            toast.error('User not authenticated');
            return;
        }

        // Use SettingsContext save function
        return await saveSettings(forceSave);
    };

    return {
        userData,
        loading,
        error,
        updateUserData,
        saveUserData
    };
};