import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from './AuthContext';

const LanguageContext = createContext();

export const useLanguage = () => {
    return useContext(LanguageContext);
};

// Available languages
export const languages = {
    en: {
        name: 'English',
        dir: 'ltr',
        // Add translations here
        translations: {
            dashboard: 'Dashboard',
            products: 'Products',
            orders: 'Orders',
            customers: 'Customers',
            settings: 'Settings',
            logout: 'Logout',
            // Add more translations
        }
    },
    fr: {
        name: 'Français',
        dir: 'ltr',
        translations: {
            dashboard: 'Tableau de bord',
            products: 'Produits',
            orders: 'Commandes',
            customers: 'Clients',
            settings: 'Paramètres',
            logout: 'Déconnexion',
        }
    },
    ar: {
        name: 'العربية',
        dir: 'rtl',
        translations: {
            dashboard: 'لوحة التحكم',
            products: 'المنتجات',
            orders: 'الطلبات',
            customers: 'العملاء',
            settings: 'الإعدادات',
            logout: 'تسجيل الخروج',
        }
    }
};

export const LanguageProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [showGooglePrompt, setShowGooglePrompt] = useState(false);

    const saveUserLanguage = async (lang) => {
        if (!currentUser) return;

        if (currentUser.isMagentoUser) {
            // For Magento users, store in localStorage
            localStorage.setItem('userLanguage', lang);
            setShowGooglePrompt(true); // Show prompt to link Google account
        } else {
            // For Google users, store in Firebase
            try {
                const userRef = ref(database, `users/${currentUser.uid}/settings`);
                await set(userRef, {
                    language: lang,
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error saving language preference:', error);
            }
        }
    };

    const loadUserLanguage = async () => {
        if (!currentUser) {
            setCurrentLanguage('en');
            return;
        }

        try {
            if (currentUser.isMagentoUser) {
                // For Magento users, load from localStorage
                const savedLanguage = localStorage.getItem('userLanguage');
                if (savedLanguage && languages[savedLanguage]) {
                    setCurrentLanguage(savedLanguage);
                }
            } else {
                // For Google users, load from Firebase
                const userRef = ref(database, `users/${currentUser.uid}/settings`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    if (data.language && languages[data.language]) {
                        setCurrentLanguage(data.language);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading language preference:', error);
        }
    };

    useEffect(() => {
        loadUserLanguage();
    }, [currentUser]);

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
        translate: (key) => languages[currentLanguage]?.translations[key] || key,
        showGooglePrompt,
        setShowGooglePrompt
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
