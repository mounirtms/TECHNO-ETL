/**
 * RTL Context and Configuration System
 * Provides comprehensive RTL support with language detection and utilities
 * 
 * Features:
 * - Automatic RTL detection based on language
 * - Manual RTL toggle support
 * - RTL-aware styling utilities
 * - Theme integration for RTL layouts
 * - Performance optimized with memoization
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import PropTypes from 'prop-types';

// ===== RTL LANGUAGE DETECTION =====

/**
 * List of RTL languages with their codes and names
 */
const RTL_LANGUAGES = {
  'ar': { name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  'he': { name: 'Hebrew', nativeName: 'עברית', direction: 'rtl' },
  'fa': { name: 'Persian', nativeName: 'فارسی', direction: 'rtl' },
  'ur': { name: 'Urdu', nativeName: 'اردو', direction: 'rtl' },
  'ku': { name: 'Kurdish', nativeName: 'کوردی', direction: 'rtl' },
  'ps': { name: 'Pashto', nativeName: 'پښتو', direction: 'rtl' },
  'sd': { name: 'Sindhi', nativeName: 'سنڌي', direction: 'rtl' },
  'ug': { name: 'Uyghur', nativeName: 'ئۇيغۇرچە', direction: 'rtl' },
  'yi': { name: 'Yiddish', nativeName: 'ייִדיש', direction: 'rtl' }
};

/**
 * Detect if a language code is RTL
 */
const isRTLLanguage = (languageCode) => {
  if (!languageCode) return false;
  const code = languageCode.toLowerCase().split('-')[0]; // Handle locale codes like 'ar-SA'
  return code in RTL_LANGUAGES;
};

/**
 * Get browser language preference
 */
const getBrowserLanguage = () => {
  return navigator.language || navigator.languages?.[0] || 'en';
};

/**
 * Detect RTL from various sources
 */
const detectRTL = () => {
  // Check localStorage first
  const storedRTL = localStorage.getItem('techno-etl-rtl');
  if (storedRTL !== null) {
    return storedRTL === 'true';
  }

  // Check HTML dir attribute
  const htmlDir = document.documentElement.dir;
  if (htmlDir === 'rtl') return true;
  if (htmlDir === 'ltr') return false;

  // Check browser language
  const browserLang = getBrowserLanguage();
  return isRTLLanguage(browserLang);
};

// ===== EMOTION CACHE SETUP =====

/**
 * Create RTL-aware Emotion cache
 */
const createRTLCache = (isRTL) => {
  return createCache({
    key: isRTL ? 'muirtl' : 'muiltr',
    stylisPlugins: isRTL ? [prefixer, rtlPlugin] : [prefixer],
  });
};

// ===== RTL CONTEXT =====

/**
 * RTL Context interface
 */
const RTLContext = createContext({
  isRTL: false,
  language: 'en',
  direction: 'ltr',
  toggleRTL: () => {},
  setLanguage: () => {},
  rtlUtils: {},
  theme: null,
  emotionCache: null
});

/**
 * RTL utilities for styling and layout
 */
const createRTLUtils = (isRTL) => ({
  // Direction utilities
  direction: isRTL ? 'rtl' : 'ltr',
  opposite: isRTL ? 'ltr' : 'rtl',
  
  // Margin utilities
  marginLeft: (value) => isRTL ? { marginRight: value } : { marginLeft: value },
  marginRight: (value) => isRTL ? { marginLeft: value } : { marginRight: value },
  marginStart: (value) => isRTL ? { marginRight: value } : { marginLeft: value },
  marginEnd: (value) => isRTL ? { marginLeft: value } : { marginRight: value },
  
  // Padding utilities
  paddingLeft: (value) => isRTL ? { paddingRight: value } : { paddingLeft: value },
  paddingRight: (value) => isRTL ? { paddingLeft: value } : { paddingRight: value },
  paddingStart: (value) => isRTL ? { paddingRight: value } : { paddingLeft: value },
  paddingEnd: (value) => isRTL ? { paddingLeft: value } : { paddingRight: value },
  
  // Position utilities
  left: (value) => isRTL ? { right: value } : { left: value },
  right: (value) => isRTL ? { left: value } : { right: value },
  start: (value) => isRTL ? { right: value } : { left: value },
  end: (value) => isRTL ? { left: value } : { right: value },
  
  // Border utilities
  borderLeft: (value) => isRTL ? { borderRight: value } : { borderLeft: value },
  borderRight: (value) => isRTL ? { borderLeft: value } : { borderRight: value },
  borderStart: (value) => isRTL ? { borderRight: value } : { borderLeft: value },
  borderEnd: (value) => isRTL ? { borderLeft: value } : { borderRight: value },
  
  // Transform utilities
  translateX: (value) => ({ transform: `translateX(${isRTL ? -value : value})` }),
  scaleX: (value) => ({ transform: `scaleX(${isRTL ? -value : value})` }),
  
  // Flexbox utilities
  flexDirection: (direction) => {
    const directionMap = {
      'row': isRTL ? 'row-reverse' : 'row',
      'row-reverse': isRTL ? 'row' : 'row-reverse',
      'column': 'column',
      'column-reverse': 'column-reverse'
    };
    return { flexDirection: directionMap[direction] || direction };
  },
  
  // Text alignment utilities
  textAlign: (align) => {
    const alignMap = {
      'left': isRTL ? 'right' : 'left',
      'right': isRTL ? 'left' : 'right',
      'start': isRTL ? 'right' : 'left',
      'end': isRTL ? 'left' : 'right',
      'center': 'center',
      'justify': 'justify'
    };
    return { textAlign: alignMap[align] || align };
  },
  
  // Icon mirroring utility
  mirrorIcon: () => isRTL ? { transform: 'scaleX(-1)' } : {},
  
  // Conditional styling
  when: (rtlStyles, ltrStyles = {}) => isRTL ? rtlStyles : ltrStyles,
  
  // CSS custom properties
  cssVars: {
    '--direction': isRTL ? 'rtl' : 'ltr',
    '--start': isRTL ? 'right' : 'left',
    '--end': isRTL ? 'left' : 'right'
  }
});

/**
 * Create RTL-aware theme
 */
const createRTLTheme = (isRTL, baseTheme) => {
  return createTheme({
    ...baseTheme,
    direction: isRTL ? 'rtl' : 'ltr',
    components: {
      ...baseTheme?.components,
      // Override MUI components for RTL
      MuiDrawer: {
        styleOverrides: {
          paper: {
            ...(isRTL && {
              borderLeft: 'none',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)'
            })
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            ...(isRTL && {
              '& .MuiTabs-indicator': {
                right: 'auto',
                left: 0
              }
            })
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            ...(isRTL && {
              textAlign: 'right'
            })
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            ...(isRTL && {
              textAlign: 'right'
            })
          }
        }
      }
    }
  });
};

// ===== RTL PROVIDER COMPONENT =====

/**
 * RTL Provider Component
 * Provides RTL context and theme to the entire application
 */
export const RTLProvider = ({ 
  children, 
  defaultRTL = null, 
  defaultLanguage = null,
  baseTheme = null,
  onRTLChange = null,
  onLanguageChange = null
}) => {
  // Initialize RTL state
  const [isRTL, setIsRTL] = useState(() => {
    return defaultRTL !== null ? defaultRTL : detectRTL();
  });

  // Initialize language state
  const [language, setLanguageState] = useState(() => {
    return defaultLanguage || getBrowserLanguage();
  });

  // Update document direction
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Store preference
    localStorage.setItem('techno-etl-rtl', isRTL.toString());
    localStorage.setItem('techno-etl-language', language);
  }, [isRTL, language]);

  // Toggle RTL function
  const toggleRTL = useCallback(() => {
    const newRTL = !isRTL;
    setIsRTL(newRTL);
    onRTLChange?.(newRTL);
  }, [isRTL, onRTLChange]);

  // Set language function
  const setLanguage = useCallback((newLanguage) => {
    setLanguageState(newLanguage);
    
    // Auto-detect RTL from language if not manually set
    const shouldBeRTL = isRTLLanguage(newLanguage);
    if (shouldBeRTL !== isRTL) {
      setIsRTL(shouldBeRTL);
      onRTLChange?.(shouldBeRTL);
    }
    
    onLanguageChange?.(newLanguage);
  }, [isRTL, onRTLChange, onLanguageChange]);

  // Memoized utilities
  const rtlUtils = useMemo(() => createRTLUtils(isRTL), [isRTL]);

  // Memoized theme
  const theme = useMemo(() => createRTLTheme(isRTL, baseTheme), [isRTL, baseTheme]);

  // Memoized emotion cache
  const emotionCache = useMemo(() => createRTLCache(isRTL), [isRTL]);

  // Memoized additional utilities (defined before useMemo to follow Hook rules)
  const memoizedIsRTLLanguage = useCallback((lang) => isRTLLanguage(lang), []);
  const memoizedGetRTLLanguages = useCallback(() => RTL_LANGUAGES, []);
  const memoizedGetBrowserLanguage = useCallback(() => getBrowserLanguage(), []);
  
  // Context value with optimized memoization
  const contextValue = useMemo(() => ({
    isRTL,
    language,
    direction: isRTL ? 'rtl' : 'ltr',
    toggleRTL,
    setLanguage,
    rtlUtils,
    theme,
    emotionCache,
    
    // Additional utilities
    isRTLLanguage: memoizedIsRTLLanguage,
    getRTLLanguages: memoizedGetRTLLanguages,
    getBrowserLanguage: memoizedGetBrowserLanguage,
    
    // Language info
    currentLanguageInfo: RTL_LANGUAGES[language.split('-')[0]] || {
      name: 'Unknown',
      nativeName: language,
      direction: isRTL ? 'rtl' : 'ltr'
    }
  }), [isRTL, language, toggleRTL, setLanguage, rtlUtils, theme, emotionCache, memoizedIsRTLLanguage, memoizedGetRTLLanguages, memoizedGetBrowserLanguage]);

  return (
    <RTLContext.Provider value={contextValue}>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </CacheProvider>
    </RTLContext.Provider>
  );
};

RTLProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultRTL: PropTypes.bool,
  defaultLanguage: PropTypes.string,
  baseTheme: PropTypes.object,
  onRTLChange: PropTypes.func,
  onLanguageChange: PropTypes.func
};

// ===== CUSTOM HOOK =====

/**
 * useRTL Hook
 * Provides access to RTL context and utilities
 */
export const useRTL = () => {
  const context = useContext(RTLContext);
  
  if (!context) {
    throw new Error('useRTL must be used within an RTLProvider');
  }
  
  return context;
};

// ===== HIGHER-ORDER COMPONENT =====

/**
 * withRTL HOC
 * Wraps a component with RTL context
 */
export const withRTL = (Component) => {
  const RTLWrappedComponent = (props) => {
    const rtlContext = useRTL();
    return <Component {...props} rtl={rtlContext} />;
  };
  
  RTLWrappedComponent.displayName = `withRTL(${Component.displayName || Component.name})`;
  return RTLWrappedComponent;
};

// ===== UTILITY COMPONENTS =====

/**
 * RTLBox Component
 * A Box component with RTL-aware styling
 */
export const RTLBox = ({ children, sx = {}, ...props }) => {
  const { rtlUtils } = useRTL();
  
  return (
    <div
      style={{
        ...rtlUtils.cssVars,
        ...sx
      }}
      {...props}
    >
      {children}
    </div>
  );
};

RTLBox.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object
};

/**
 * RTLText Component
 * Text component with proper RTL alignment
 */
export const RTLText = ({ children, align = 'start', ...props }) => {
  const { rtlUtils } = useRTL();
  
  return (
    <span
      style={{
        ...rtlUtils.textAlign(align),
        display: 'block'
      }}
      {...props}
    >
      {children}
    </span>
  );
};

RTLText.propTypes = {
  children: PropTypes.node,
  align: PropTypes.oneOf(['left', 'right', 'center', 'justify', 'start', 'end'])
};

// ===== EXPORTS =====

export default RTLContext;

export {
  RTL_LANGUAGES,
  isRTLLanguage,
  getBrowserLanguage,
  detectRTL,
  createRTLUtils,
  createRTLTheme,
  createRTLCache
};