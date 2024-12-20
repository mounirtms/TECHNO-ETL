import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserProfileData, saveUserSettings, applyUserPreferences } from '../../services/userService';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

const defaultUserSettings = {
    personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        birthDate: '',
        gender: '',
    },
    apiSettings: {
        magento: {
            url: import.meta.env.VITE_MAGENTO_URL || '',
            username: import.meta.env.VITE_MAGENTO_USERNAME || '',
            password: import.meta.env.VITE_MAGENTO_PASSWORD || '',
            authMode: import.meta.env.VITE_MAGENTO_AUTH_TYPE || 'basic'
        },
        cegid: {
            url: '',
            username: '',
            password: '',
            database: ''
        }
    },
    preferences: {
        language: 'en',
        theme: 'light'
    }
};

export const useProfileController = () => {
    const { currentUser } = useAuth();
    const { setLanguage } = useLanguage();
    const { toggleTheme } = useTheme();

    // Initialize state with local storage data or defaults
    const [userData, setUserDataState] = useState(() => {
        const storedData = localStorage.getItem('userSettings');
        return storedData ? JSON.parse(storedData) : defaultUserSettings;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(() => {
        return localStorage.getItem('lastSyncTime') || null;
    });

    // Sync with Firebase when component mounts
    useEffect(() => {
        if (!currentUser) {
            setUserDataState(defaultUserSettings);
            setLoading(false);
            return;
        }

        const unsubscribe = getUserProfileData(currentUser.uid, (data) => {
            try {
                if (data) {
                    // Merge with defaults to ensure all fields exist
                    const mergedData = {
                        personalInfo: { ...defaultUserSettings.personalInfo, ...data.personalInfo },
                        apiSettings: { ...defaultUserSettings.apiSettings, ...data.apiSettings },
                        preferences: { ...defaultUserSettings.preferences, ...data.preferences }
                    };

                    // Only update if data is newer than local storage
                    const serverTimestamp = data.lastModified || Date.now();
                    if (!lastSyncTime || serverTimestamp > parseInt(lastSyncTime)) {
                        setUserDataState(mergedData);
                        localStorage.setItem('userSettings', JSON.stringify(mergedData));
                        localStorage.setItem('lastSyncTime', serverTimestamp.toString());
                        setLastSyncTime(serverTimestamp.toString());
                        applyUserPreferences(mergedData, { setLanguage, toggleTheme });
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

        setUserDataState(prevData => {
            const newData = { ...prevData };
            
            if (section) {
                // Update specific section
                newData[section] = {
                    ...prevData[section],
                    ...updates
                };
            } else {
                // Merge all sections
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

        setIsDirty(true);
    };

    const saveUserData = async (forceSave = false) => {
        if (!currentUser) {
            toast.error('User not authenticated');
            return;
        }

        if (!isDirty && !forceSave) {
            return;
        }

        try {
            const timestamp = Date.now();
            const dataToSave = {
                ...userData,
                lastModified: timestamp
            };

           // await saveUserSettings(currentUser.uid, dataToSave);
            localStorage.setItem('lastSyncTime', timestamp.toString());
            setLastSyncTime(timestamp.toString());
            setIsDirty(false);
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving user data:', error);
            toast.error('Failed to save settings. Changes preserved locally.');
        }
    };

    // Auto-save when component unmounts if there are unsaved changes
    useEffect(() => {
        return () => {
            if (isDirty) {
                saveUserData();
            }
        };
    }, [isDirty]);

    return {
        userData,
        loading,
        error,
        updateUserData,
        saveUserData,
        isDirty,
        lastSyncTime
    };
};