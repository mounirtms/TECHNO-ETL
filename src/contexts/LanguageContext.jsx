import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    document.documentElement.setAttribute('dir', languages[currentLanguage].dir);
    document.documentElement.setAttribute('lang', languages[currentLanguage].code);
  }, [currentLanguage]);

  const setLanguage = (lang) => {
    if (languages[lang]) {
      setCurrentLanguage(lang);
    }
  };

  const translate = (key) => {
    const keys = key.split('.');
    let value = languages[currentLanguage].locale;

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
        return key;
      }
    }

    return value;
  };

  const contextValue = {
    currentLanguage,
    setLanguage,
    translate,
    languages
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;