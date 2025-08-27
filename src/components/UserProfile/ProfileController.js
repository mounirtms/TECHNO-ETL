import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

export const useProfileController = () => {
    const { currentUser } = useAuth();
    const { settings, updateSettings, saveSettings, loading: settingsLoading, isDirty: settingsIsDirty } = useSettings();

    // Remove duplicate state - use SettingsContext state directly
    const [error, setError] = useState(null);

    // Simplified initialization - let SettingsContext handle the heavy lifting
    useEffect(() => {
        if (!currentUser) {
            setError(null);
            return;
        }

        // SettingsContext already handles Firebase sync, just clear any errors
        setError(null);
    }, [currentUser]);

    // Remove duplicate effects - SettingsContext handles this

    const updateUserData = (updates, section) => {
        if (!currentUser) {
            toast.error('User not authenticated');
            return;
        }

        // Use SettingsContext for updates - it handles everything
        updateSettings(updates, section);
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
        userData: settings, // Use settings directly from SettingsContext
        loading: settingsLoading, // Use loading from SettingsContext
        error,
        updateUserData,
        saveUserData,
        isDirty: settingsIsDirty, // Use isDirty from SettingsContext
        lastSyncTime: settings?.lastSyncTime || localStorage.getItem('lastSettingsSync')
    };
};