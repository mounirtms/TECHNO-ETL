import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import enLocale from '../assets/locale/en.json';
import frLocale from '../assets/locale/fr.json';
import arLocale from '../assets/locale/ar.json';
import {
  getUnifiedSettings,
  saveUnifiedSettings,
  getSystemPreferences
} from '../utils/settingsUtils';

const LanguageContext = createContext<any>(null);

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
  if(!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    console.log('🌐 Initializing LanguageProvider...');
    
    try {
      console.log('🌐 Getting unified settings...');
      const settings = getUnifiedSettings();
      console.log('🌐 Settings received:', settings);
      
      if(settings?.preferences?.language && languages[settings.preferences.language]) {
        console.log('🌐 Using preferences language:', settings.preferences.language);
        return settings.preferences.language;
      }
      // Also check top-level language for backward compatibility
      if(settings?.language && languages[settings.language]) {
        console.log('🌐 Using top-level language:', settings.language);
        return settings.language;
      }
      // Fallback to system preferences
      console.log('🌐 Getting system preferences...');
      const systemPrefs = getSystemPreferences();
      console.log('🌐 System preferences:', systemPrefs);
      
      if(systemPrefs?.language && languages[systemPrefs.language]) {
        console.log('🌐 Using system language:', systemPrefs.language);
        return systemPrefs.language;
      }
    } catch(error: any) {
      console.error('Failed to get language settings:', error);
    }
    // Final fallback to English
    console.log('🌐 Using fallback language: en');
    return 'en';
  });

  // Memoized language configuration to prevent unnecessary re-renders
  const currentLangConfig = useMemo(() => {
    const config = languages[currentLanguage];
    if(!config) {
      console.warn(`Invalid language: ${currentLanguage}, falling back to English`);
      return languages.en;
    }
    return config;
  }, [currentLanguage]);

  // Persistent RTL support - ensure it works across all tabs and components
  useEffect(() => {
    // Safety check to ensure currentLangConfig is valid
    if(!currentLangConfig || !currentLangConfig.dir || !currentLangConfig.code) {
      console.warn('Invalid currentLangConfig:', currentLangConfig);
      return;
    }
    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      const isRTL = currentLangConfig.dir === 'rtl';
      
      // Set document attributes
      document.documentElement.setAttribute('dir', currentLangConfig.dir);
      document.documentElement.setAttribute('lang', currentLangConfig.code);
      
      // Add RTL class to body for additional styling
      if(isRTL) {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
      // Add/remove RTL class to root element
      const root = document.getElementById('root');
      if(root) {
        if(isRTL) {
          root.classList.add('rtl-layout');
          root.classList.remove('ltr-layout');
        } else {
          root.classList.add('ltr-layout');
          root.classList.remove('rtl-layout');
        }
      }
      // Add smooth transition class
      document.body.style.transition = 'all 0.3s ease-in-out';
      if(root) {
        root.style.transition = 'all 0.3s ease-in-out';
      }
      // Save to unified settings with proper structure
      saveUnifiedSettings({ 
        preferences: {
          language: currentLanguage, 
          dir: currentLangConfig.dir 
        }
      });

      // Dispatch RTL change event for ThemeContext to avoid circular imports
      window.dispatchEvent(new CustomEvent('languageRTLChanged', {
        detail: { isRTL, language: currentLanguage, dir: currentLangConfig.dir }
      }));

      // Remove transition after animation completes
      setTimeout(() => {
        document.body.style.transition = '';
        if(root) {
          root.style.transition = '';
        }
      }, 300);
      
      console.log(`🌐 Language changed to ${currentLanguage} (${currentLangConfig.dir})`);
    });
  }, [currentLanguage, currentLangConfig]);

  // Enhanced setLanguage function with smooth transitions
  const setLanguage = useCallback((lang) => {
    if(languages[lang]) {
      setCurrentLanguage(lang);
      // The useEffect above will handle the DOM updates and storage
    }
  }, []);

  // Apply user language settings from login
  const applyUserLanguageSettings = useCallback((userSettings) => {
    if(userSettings?.preferences?.language) {
      const userLanguage = userSettings.preferences.language;
      if(languages[userLanguage]) {
        setLanguage(userLanguage);
      }
    }
  }, [setLanguage]);

  // Memoized translate function with caching to prevent excessive logging
  const translate = useCallback((key) => {
    // Safety checks
    if(!key || typeof key !== 'string') {
      console.warn('Invalid translation key:', key);
      return key || '';
    }
    if(!currentLangConfig || !currentLangConfig.locale) {
      console.warn('Translation attempted before language config loaded');
      return key;
    }
    const keys = key.split('.');
    let value = currentLangConfig.locale;

    for(const k of keys) {
      if(value && value[k]) {
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