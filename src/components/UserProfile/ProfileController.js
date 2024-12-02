import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserProfileData, setUserData, applyUserPreferences } from '../../services/userService';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

export const useProfileController = () => {
    const { currentUser } = useAuth();
    const { setLanguage } = useLanguage();
    const { setThemeMode } = useTheme();
    const [userData, setUserDataState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setUserDataState(null);
            setLoading(false);
            return;
        }

        const unsubscribe = getUserProfileData(currentUser.uid, (data) => {
            try {
                setUserDataState(data);
                // Apply preferences using shared handler
                applyUserPreferences(data, { setLanguage, setThemeMode });
                setLoading(false);
            } catch (err) {
                console.error('Error loading user data:', err);
                setError(err);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [currentUser, setLanguage, setThemeMode]);

    const updateUserData = async (updates, updateType = '') => {
        if (!currentUser) {
            toast.error('User not authenticated');
            return;
        }

        try {
            // Merge updates with existing data to maintain structure
            const mergedData = {
                ...userData,
                ...updates,
                preferences: {
                    ...userData?.preferences,
                    ...updates.preferences
                },
                apiSettings: {
                    ...userData?.apiSettings,
                    ...updates.apiSettings
                }
            };

            await setUserData(currentUser.uid, mergedData);
            
            // Show success toast based on update type
            switch(updateType) {
                case 'preferences':
                    toast.success('Preferences updated successfully');
                    break;
                case 'personalInfo':
                    toast.success('Personal information updated successfully');
                    break;
                case 'apiSettings':
                    toast.success('API settings updated successfully');
                    break;
                default:
                    toast.success('User data updated successfully');
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            toast.error('Failed to update user data');
        }
    };

    return {
        userData,
        loading,
        error,
        updateUserData
    };
};