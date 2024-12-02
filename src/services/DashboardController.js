import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export const useDashboardController = () => {
    const { currentUser } = useAuth();
    const { setLanguage } = useLanguage();
    const { setThemeMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            // Listen to user preferences in real-time
            const userPrefsRef = ref(database, `users/${currentUser.uid}/preferences`);
            const unsubscribe = onValue(userPrefsRef, (snapshot) => {
                const preferences = snapshot.val();
                
                if (preferences) {
                    // Apply language preference
                    if (preferences.language) {
                        setLanguage(preferences.language);
                        localStorage.setItem('userLanguage', preferences.language);
                    }
                    
                    // Apply theme preference
                    if (preferences.theme) {
                        setThemeMode(preferences.theme);
                        localStorage.setItem('theme', preferences.theme);
                    }
                } else {
                    // If no preferences found, use localStorage values or defaults
                    const localLang = localStorage.getItem('userLanguage') || 'en';
                    const localTheme = localStorage.getItem('theme') || 'light';
                    
                    setLanguage(localLang);
                    setThemeMode(localTheme);
                }
                
                setLoading(false);
            }, (error) => {
                console.error('Error loading preferences:', error);
                setError(error);
                setLoading(false);
                
                // Fallback to localStorage if Firebase fails
                const localLang = localStorage.getItem('userLanguage') || 'en';
                const localTheme = localStorage.getItem('theme') || 'light';
                
                setLanguage(localLang);
                setThemeMode(localTheme);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error('Error in dashboard controller:', err);
            setError(err);
            setLoading(false);
        }
    }, [currentUser, setLanguage, setThemeMode]);
    
    return {
        loading,
        error
    };
};