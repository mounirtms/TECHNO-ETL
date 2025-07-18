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
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLang = localStorage.getItem('language');
    return savedLang || 'en';
  });

  // Memoized language configuration to prevent unnecessary re-renders
  const currentLangConfig = useMemo(() => languages[currentLanguage], [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    document.documentElement.setAttribute('dir', currentLangConfig.dir);
    document.documentElement.setAttribute('lang', currentLangConfig.code);
  }, [currentLanguage, currentLangConfig]);

  // Memoized setLanguage function to prevent re-renders
  const setLanguage = useCallback((lang) => {
    if (languages[lang]) {
      setCurrentLanguage(lang);
      localStorage.setItem('language', lang);
      document.documentElement.setAttribute('dir', languages[lang].dir);
      document.documentElement.setAttribute('lang', languages[lang].code);
    }
  }, []);

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
    translate,
    languages
  }), [currentLanguage, setLanguage, translate]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;