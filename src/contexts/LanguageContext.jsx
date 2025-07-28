import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import enLocale from '../assets/locale/en.json';
import frLocale from '../assets/locale/fr.json';
import arLocale from '../assets/locale/ar.json';

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
  // Unified settings storage
  const getUnifiedSettings = () => {
    try {
      const unifiedSettings = localStorage.getItem('techno-etl-settings');
      if (unifiedSettings) {
        return JSON.parse(unifiedSettings);
      }
    } catch (error) {
      console.warn('Error parsing unified settings:', error);
    }
    return null;
  };

  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const settings = getUnifiedSettings();
    if (settings?.language && languages[settings.language]) {
      return settings.language;
    }

    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (languages[browserLang]) {
      return browserLang;
    }

    // Default to English
    return 'en';
  });

  // Unified settings save function
  const saveUnifiedSettings = useCallback((newSettings) => {
    try {
      const currentSettings = getUnifiedSettings() || {};
      const updatedSettings = { ...currentSettings, ...newSettings };
      localStorage.setItem('techno-etl-settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving unified settings:', error);
    }
  }, []);

  // Memoized language configuration to prevent unnecessary re-renders
  const currentLangConfig = useMemo(() => languages[currentLanguage], [currentLanguage]);

  // Smooth RTL transition - prevent flickering
  useEffect(() => {
    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      document.documentElement.setAttribute('dir', currentLangConfig.dir);
      document.documentElement.setAttribute('lang', currentLangConfig.code);

      // Add transition class for smooth layout changes
      document.body.style.transition = 'all 0.3s ease-in-out';

      // Save to unified settings
      saveUnifiedSettings({ language: currentLanguage });

      // Remove transition after animation completes
      setTimeout(() => {
        document.body.style.transition = '';
      }, 300);
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