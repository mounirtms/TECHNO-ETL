import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, update, get } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from './AuthContext';
import enTranslations from '../assets/locale/en.json';
import frTranslations from '../assets/locale/fr.json';
import arTranslations from '../assets/locale/ar.json';

const LanguageContext = createContext();

export const useLanguage = () => {
    return useContext(LanguageContext);
};

// Available languages
export const languages = {
    en: {
        name: 'English',
        dir: 'ltr',
        translations: enTranslations
    },
    fr: {
        name: 'Français',
        dir: 'ltr',
        translations: frTranslations
    },
    ar: {
        name: 'العربية',
        dir: 'rtl',
        translations: arTranslations
    }
};

export const LanguageProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [currentLanguage, setCurrentLanguage] = useState(() => {
        return localStorage.getItem('userLanguage') || 'en';
    });

    const saveUserLanguage = async (lang) => {
        if (!currentUser || !languages[lang]) return;

        try {
            // Save to localStorage for immediate access
            localStorage.setItem('userLanguage', lang);
            
            // Save to Firebase for persistence
            const userRef = ref(database, `users/${currentUser.uid}/preferences`);
            await update(userRef, { language: lang });
        } catch (error) {
            console.error('Error saving user language:', error);
        }
    };

    const loadUserLanguage = async () => {
        if (!currentUser) {
            const localLang = localStorage.getItem('userLanguage');
            if (localLang && languages[localLang]) {
                setCurrentLanguage(localLang);
            }
            return;
        }

        try {
            const userRef = ref(database, `users/${currentUser.uid}/preferences`);
            const snapshot = await get(userRef);
            const preferences = snapshot.val();
            
            if (preferences?.language && languages[preferences.language]) {
                setCurrentLanguage(preferences.language);
                localStorage.setItem('userLanguage', preferences.language);
            } else {
                // If no Firebase preference, check localStorage
                const localLang = localStorage.getItem('userLanguage');
                if (localLang && languages[localLang]) {
                    setCurrentLanguage(localLang);
                    // Sync localStorage preference to Firebase
                    await update(userRef, { language: localLang });
                }
            }
        } catch (error) {
            console.error('Error loading user language:', error);
            const localLang = localStorage.getItem('userLanguage');
            if (localLang && languages[localLang]) {
                setCurrentLanguage(localLang);
            }
        }
    };

    useEffect(() => {
        loadUserLanguage();
    }, [currentUser]);

    const getNestedTranslation = (obj, path) => {
        return path.split('.').reduce((prev, curr) => {
            return prev ? prev[curr] : undefined;
        }, obj);
    };

    const value = {
        currentLanguage,
        languages,
        setLanguage: async (lang) => {
            if (languages[lang]) {
                setCurrentLanguage(lang);
                await saveUserLanguage(lang);
            }
        },
        getDirection: () => languages[currentLanguage]?.dir || 'ltr',
        translate: (key) => {
            const translation = getNestedTranslation(languages[currentLanguage]?.translations, key);
            return translation || key;
        }
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};