import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import enLocale from '../assets/locale/en.json';
import frLocale from '../assets/locale/fr.json';
import arLocale from '../assets/locale/ar.json';
import { 
  getUnifiedSettings, 
  saveUnifiedSettings, 
  getUserSettings, 
  saveUserSettings,
  applyLanguageSettings,
  getSystemPreferences 
} from '../utils/unifiedSettingsManager';

const LanguageContext = createContext();

export const languages = {
  en: {
    name: 'English',
    locale: enLocale,
    dir: 'ltr',
    code: 'en-US'
  },
  fr: {
    name: 'Français',
    locale: frLocale,
    dir: 'ltr',
    code: 'fr-FR'
  },
  ar: {
    name: 'العربية',
    locale: arLocale,
    dir: 'rtl',
    code: 'ar-SA'
  }
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const settings = getUnifiedSettings();
    if (settings?.language && languages[settings.language]) {
      return settings.language;
    }

    // Fallback to system preferences
    const systemPrefs = getSystemPreferences();
    return systemPrefs.language;
  });

  // Memoized language configuration to prevent unnecessary re-renders
  const currentLangConfig = useMemo(() => languages[currentLanguage], [currentLanguage]);

  // Persistent RTL support - ensure it works across all tabs and components
  useEffect(() => {
    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      const isRTL = currentLangConfig.dir === 'rtl';
      
      // Set document attributes
      document.documentElement.setAttribute('dir', currentLangConfig.dir);
      document.documentElement.setAttribute('lang', currentLangConfig.code);
      
      // Add RTL class to body for additional styling
      if (isRTL) {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
      
      // Add/remove RTL class to root element
      const root = document.getElementById('root');
      if (root) {
        if (isRTL) {
          root.classList.add('rtl-layout');
          root.classList.remove('ltr-layout');
        } else {
          root.classList.add('ltr-layout');
          root.classList.remove('rtl-layout');
        }
      }

      // Add smooth transition class
      document.body.style.transition = 'all 0.3s ease-in-out';
      if (root) {
        root.style.transition = 'all 0.3s ease-in-out';
      }

      // Save to unified settings
      saveUnifiedSettings({ language: currentLanguage, dir: currentLangConfig.dir });

      // Remove transition after animation completes
      setTimeout(() => {
        document.body.style.transition = '';
        if (root) {
          root.style.transition = '';
        }
      }, 300);
      
      console.log(`Language changed to ${currentLanguage} (${currentLangConfig.dir})`);
    });
  }, [currentLanguage, currentLangConfig, saveUnifiedSettings]);

  // Enhanced setLanguage function with smooth transitions
  const setLanguage = useCallback((lang) => {
    if (languages[lang]) {
      setCurrentLanguage(lang);
      // The useEffect above will handle the DOM updates and storage
    }
  }, []);

  // Apply user language settings from login
  const applyUserLanguageSettings = useCallback((userSettings) => {
    if (userSettings?.preferences?.language) {
      const userLanguage = userSettings.preferences.language;
      if (languages[userLanguage]) {
        setLanguage(userLanguage);
      }
    }
  }, [setLanguage]);

  // Memoized translate function with caching to prevent excessive logging
  const translate = useCallback((key) => {
    const keys = key.split('.');
    let value = currentLangConfig.locale;

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Only log unique missing translations to prevent spam
        if (!translate._loggedMissing) translate._loggedMissing = new Set();
        const logKey = `${key}:${currentLanguage}`;
        if (!translate._loggedMissing.has(logKey)) {
          console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
          translate._loggedMissing.add(logKey);
        }
        return key;
      }
    }

    return value;
  }, [currentLangConfig, currentLanguage]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentLanguage,
    setLanguage,
    applyUserLanguageSettings,
    translate,
    languages
  }), [currentLanguage, setLanguage, applyUserLanguageSettings, translate]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;