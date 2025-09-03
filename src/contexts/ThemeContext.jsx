import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  getUnifiedSettings,
  saveUnifiedSettings,
  getSystemPreferences,
} from '../utils/unifiedSettingsManager';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { useLanguage } from './LanguageContext';

const ThemeContext = createContext();

// Advanced theme customization options
const themePresets = {
  techno: {
    primary: { main: '#ff5501', light: '#ff7733', dark: '#cc4400' },
    secondary: { main: '#26A69A', light: '#51b7ae', dark: '#1a746b' },
  },
  blue: {
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
    secondary: { main: '#dc004e', light: '#ff5983', dark: '#9a0036' },
  },
  green: {
    primary: { main: '#388e3c', light: '#66bb6a', dark: '#2e7d32' },
    secondary: { main: '#f57c00', light: '#ffb74d', dark: '#ef6c00' },
  },
  purple: {
    primary: { main: '#7b1fa2', light: '#ba68c8', dark: '#6a1b9a' },
    secondary: { main: '#00acc1', light: '#4dd0e1', dark: '#00838f' },
  },
};

// Density configurations
const densityConfigs = {
  compact: { spacing: 6, borderRadius: 6, typography: { body1: { fontSize: '0.8rem' } } },
  standard: { spacing: 8, borderRadius: 8, typography: { body1: { fontSize: '0.875rem' } } },
  comfortable: { spacing: 12, borderRadius: 12, typography: { body1: { fontSize: '1rem' } } },
};

// Font size configurations
const fontSizeConfigs = {
  small: { fontSize: 12, htmlFontSize: 14 },
  medium: { fontSize: 14, htmlFontSize: 16 },
  large: { fontSize: 16, htmlFontSize: 18 },
};

const lightPalette = {
  primary: {
    main: '#ff5501',
    light: '#ff7733',
    dark: '#cc4400',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#26A69A',
    light: '#51b7ae',
    dark: '#1a746b',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
    sidebar: '#ffffff',
    header: '#ffffff',
  },
  text: {
    primary: '#2b2b2b',
    secondary: '#666666',
    disabled: '#9e9e9e',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  action: {
    active: '#2b2b2b',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(255, 85, 1, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
  },
};

const darkPalette = {
  primary: {
    main: '#ff6b22',
    light: '#ff8c55',
    dark: '#cc4400',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#4DB6AC',
    light: '#71c5bc',
    dark: '#357f78',
    contrastText: '#ffffff',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
    sidebar: '#1a1a1a',
    header: '#1a1a1a',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    disabled: '#666666',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    active: '#ffffff',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 107, 34, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
};

const createCustomTheme = (mode, colorPreset = 'techno', density = 'standard', fontSize = 'medium', customizations = {}, direction = 'ltr') => {
  let palette = mode === 'dark' ? darkPalette : lightPalette;

  // Apply color preset if different from default
  if (colorPreset !== 'techno' && themePresets[colorPreset]) {
    palette = {
      ...palette,
      primary: themePresets[colorPreset].primary,
      secondary: themePresets[colorPreset].secondary,
    };
  }

  // Apply custom color overrides
  if (customizations.colors) {
    palette = {
      ...palette,
      ...customizations.colors,
    };
  }

  const densityConfig = densityConfigs[density];
  const fontConfig = fontSizeConfigs[fontSize];

  return createTheme({
    direction,
    palette: {
      mode,
      ...palette,
    },
    spacing: densityConfig.spacing,
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: fontConfig.fontSize,
      htmlFontSize: fontConfig.htmlFontSize,
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      ...densityConfig.typography,
      ...customizations.typography,
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundColor: theme.palette.background.sidebar,
            backgroundImage: 'none',
            transition: theme.transitions.create(['background-color', 'box-shadow'], {
              duration: theme.transitions.duration.standard,
            }),
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: '8px',
            margin: '4px 8px',
            transition: theme.transitions.create(
              ['background-color', 'color', 'padding-left', 'border-radius'],
              { duration: 200 },
            ),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              paddingLeft: '24px',
              borderRadius: '8px',
            },
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.16),
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                height: '60%',
                width: '4px',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '0 4px 4px 0',
              },
            },
          }),
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.secondary,
            minWidth: 40,
            transition: theme.transitions.create(['color'], {
              duration: theme.transitions.duration.shorter,
            }),
            '.Mui-selected > &': {
              color: theme.palette.primary.main,
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.header,
            backgroundImage: 'none',
            color: theme.palette.text.primary,
            transition: theme.transitions.create(
              ['background-color', 'box-shadow', 'color'],
              { duration: theme.transitions.duration.standard },
            ),
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            transition: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  });
};

export const ThemeProvider = ({ children }) => {
  // Detect language direction for RTL/LTR theme and Emotion cache
  const { currentLanguage, languages } = useLanguage();
  const isRTL = languages[currentLanguage]?.dir === 'rtl';
  const direction = isRTL ? 'rtl' : 'ltr';

  // Initialize theme states from unified settings
  const initializeFromSettings = () => {
    const settings = getUnifiedSettings();

    return {
      mode: settings.theme === 'system' ?
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') :
        (settings.theme || 'light'),
      fontSize: settings.fontSize || 'medium',
      colorPreset: settings.colorPreset || 'techno',
      density: settings.density || 'standard',
      animations: settings.animations !== false,
      highContrast: settings.highContrast === true,
      customizations: settings.customizations || {},
    };
  };

  // Initialize all theme states from unified settings
  const initialSettings = initializeFromSettings();

  const [mode, setMode] = useState(initialSettings.mode);
  const [fontSize, setFontSize] = useState(initialSettings.fontSize);
  const [colorPreset, setColorPreset] = useState(initialSettings.colorPreset);
  const [density, setDensity] = useState(initialSettings.density);
  const [customizations, setCustomizations] = useState(initialSettings.customizations);
  const [animations, setAnimations] = useState(initialSettings.animations);
  const [highContrast, setHighContrast] = useState(initialSettings.highContrast);

  // System theme change listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e) => {
      const settings = getUnifiedSettings();
      const shouldFollowSystem = !settings?.theme || settings.theme === 'system';

      if (shouldFollowSystem) {
        console.log('🎨 ThemeContext: System theme changed to:', e.matches ? 'dark' : 'light');
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Save to unified settings when any theme property changes
  useEffect(() => {
    const currentSettings = {
      theme: mode,
      fontSize,
      colorPreset,
      density,
      animations,
      highContrast,
      customizations,
    };

    console.log('🎨 ThemeContext: Saving unified settings:', currentSettings);
    saveUnifiedSettings(currentSettings);
  }, [mode, fontSize, colorPreset, density, animations, highContrast, customizations]);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (!animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
  }, [highContrast, animations]);

  // Memoized theme creation to prevent unnecessary re-renders
  const theme = useMemo(() => createCustomTheme(mode, colorPreset, density, fontSize, customizations, direction), [mode, colorPreset, density, fontSize, customizations, direction]);

  // Enhanced toggle function that respects user preferences
  const toggleTheme = useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  // Set specific theme mode
  const setThemeMode = useCallback((newMode) => {
    if (['light', 'dark', 'system'].includes(newMode)) {
      if (newMode === 'system') {
        // Apply system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        setMode(systemPrefersDark ? 'dark' : 'light');
      } else {
        setMode(newMode);
      }
    }
  }, []);

  // Initialize theme from unified settings
  const initializeTheme = useCallback(() => {
    const settings = getUnifiedSettings();

    if (settings) {
      console.log('Initializing theme from unified settings:', settings);

      // Apply all theme settings from unified storage
      if (settings.theme && settings.theme !== mode) {
        if (settings.theme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

          setMode(systemPrefersDark ? 'dark' : 'light');
        } else {
          setMode(settings.theme);
        }
      }

      if (settings.fontSize && settings.fontSize !== fontSize) {
        setFontSize(settings.fontSize);
      }

      if (settings.colorPreset && settings.colorPreset !== colorPreset) {
        setColorPreset(settings.colorPreset);
      }

      if (settings.density && settings.density !== density) {
        setDensity(settings.density);
      }

      if (settings.animations !== undefined && settings.animations !== animations) {
        setAnimations(settings.animations);
      }

      if (settings.highContrast !== undefined && settings.highContrast !== highContrast) {
        setHighContrast(settings.highContrast);
      }
    }
  }, [mode, fontSize, colorPreset, density, animations, highContrast]);

  // Apply user settings from login
  const applyUserThemeSettings = useCallback((userSettings) => {
    if (userSettings?.preferences) {
      const { theme, fontSize: userFontSize, colorPreset: userColorPreset, density: userDensity, animations: userAnimations, highContrast: userHighContrast } = userSettings.preferences;

      if (theme) {
        setThemeMode(theme);
      }

      if (userFontSize) {
        setFontSize(userFontSize);
      }

      if (userColorPreset) {
        setColorPreset(userColorPreset);
      }

      if (userDensity) {
        setDensity(userDensity);
      }

      if (userAnimations !== undefined) {
        setAnimations(userAnimations);
      }

      if (userHighContrast !== undefined) {
        setHighContrast(userHighContrast);
      }
    }
  }, [setThemeMode]);

  // Memoized setFontSize to prevent re-renders
  const memoizedSetFontSize = useCallback((newFontSize) => {
    setFontSize(newFontSize);
  }, []);

  // Memoized setter functions
  const memoizedSetColorPreset = useCallback((newPreset) => {
    if (themePresets[newPreset]) {
      setColorPreset(newPreset);
    }
  }, []);

  const memoizedSetDensity = useCallback((newDensity) => {
    if (['compact', 'standard', 'comfortable'].includes(newDensity)) {
      setDensity(newDensity);
    }
  }, []);

  const memoizedSetAnimations = useCallback((enabled) => {
    setAnimations(enabled);
  }, []);

  const memoizedSetHighContrast = useCallback((enabled) => {
    setHighContrast(enabled);
  }, []);

  const memoizedSetCustomizations = useCallback((newCustomizations) => {
    setCustomizations(prev => ({ ...prev, ...newCustomizations }));
  }, []);

  // Emotion Cache for RTL/LTR
  const cache = useMemo(() => {
    const options = { key: isRTL ? 'mui-rtl' : 'mui' };

    if (isRTL) options.stylisPlugins = [rtlPlugin];

    return createCache(options);
  }, [isRTL]);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // Theme mode
    mode,
    toggleTheme,
    setThemeMode,
    applyUserThemeSettings,
    isDark: mode === 'dark',

    // Font size
    fontSize,
    setFontSize: memoizedSetFontSize,

    // Color presets
    colorPreset,
    setColorPreset: memoizedSetColorPreset,
    themePresets,

    // Density
    density,
    setDensity: memoizedSetDensity,

    // Animations
    animations,
    setAnimations: memoizedSetAnimations,

    // High contrast
    highContrast,
    setHighContrast: memoizedSetHighContrast,

    // Customizations
    customizations,
    setCustomizations: memoizedSetCustomizations,
  }), [
    mode, toggleTheme, setThemeMode, applyUserThemeSettings,
    fontSize, memoizedSetFontSize,
    colorPreset, memoizedSetColorPreset,
    density, memoizedSetDensity,
    animations, memoizedSetAnimations,
    highContrast, memoizedSetHighContrast,
    customizations, memoizedSetCustomizations,
  ]);

  return (
    <ThemeContext.Provider value={value}>
      <CacheProvider value={cache}>
        <MuiThemeProvider theme={theme}>
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
};

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useCustomTheme must be used within a ThemeProvider');
  }

  return context;
};

export default ThemeContext;
