import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserProfileData, saveUserSettings, applyUserPreferences } from '../../services/userService';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

const defaultUserSettings = {
  personalInfo: {},
  apiSettings: {},
  preferences: {}
};

export const useProfileController = () => {
    const { currentUser } = useAuth();
    const { setLanguage } = useLanguage();
    const { setThemeMode } = useTheme();
    const [userData, setUserDataState] = useState(() => {
        const storedData = localStorage.getItem('userSettings');
        return storedData ? JSON.parse(storedData) : null;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false); // Track dirty state

    useEffect(() => {
        if (!currentUser) {
            setUserDataState(null);
            setLoading(false);
            return;
        }

        const unsubscribe = getUserProfileData(currentUser.uid, (data) => {
            try {
                // Update user data state
                setUserDataState(data);
                // Save to local storage for offline mode
                localStorage.setItem('userSettings', JSON.stringify(data));
                // Apply preferences using shared handler
                applyUserPreferences(data, { setLanguage, setThemeMode });
                setLoading(false);
            } catch (err) {
                console.error('Error loading user data:', err);
                setError(err);
                setLoading(false);
            }
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe(); // Ensure unsubscribe is called correctly
            }
        };
    }, [currentUser, setLanguage, setThemeMode]);

    const updateUserData = (updates) => {
        if (!currentUser) {
            toast.error('User not authenticated');
            return;
        }

        // Log existing userData and updates for debugging
        console.log('Current User Data:', userData);
        console.log('Updates:', updates);

        // Merge updates with existing data to maintain structure
        const mergedData = {
            ...defaultUserSettings, // Start with default settings
            ...userData,
            ...updates,
            preferences: {
                ...defaultUserSettings.preferences,
                ...userData?.preferences,
                ...updates.preferences
            },
            apiSettings: {
                ...defaultUserSettings.apiSettings,
                ...userData?.apiSettings,
                ...updates.apiSettings
            }
        };

        // Log mergedData for debugging
        console.log('Merged Data:', mergedData);

        // Validate mergedData to ensure no undefined values
        if (!mergedData.personalInfo || !mergedData.apiSettings || !mergedData.preferences) {
            throw new Error('Merged data contains undefined values');
        }

        // Save to local storage for offline mode
        localStorage.setItem('userSettings', JSON.stringify(mergedData));
        setUserDataState(mergedData); // Update userData state
        setIsDirty(true); // Mark as dirty when updates are made
    };

    const saveUserData = async () => {
        if (!currentUser) {
            toast.error('User not authenticated');
            return;
        }

        try {
            await saveUserSettings(currentUser.uid, userData);
            toast.success('User settings saved successfully');
            setIsDirty(false); // Reset dirty state after saving
        } catch (error) {
            console.error('Error saving user data:', error);
            toast.error('Failed to save user data');
        }
    };

    return {
        userData,
        loading,
        error,
        updateUserData,
        saveUserData,
        isDirty // Expose dirty state
    };
};