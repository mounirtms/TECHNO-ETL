/**
 * Modern Tailwind-based Theme Context for TECHNO-ETL
 * Replaces Material-UI with Tailwind CSS and CSS custom properties
 * Modern TypeScript implementation with optimized performance
 */
import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useMemo, 
  useCallback,
  type ReactNode 
} from 'react';
import {
  getUnifiedSettings,
  saveUnifiedSettings,
  getSystemPreferences
} from '../utils/settingsUtils';
// Removed LanguageContext dependency to avoid circular imports
// RTL detection will be handled via events

// Types
interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
}

interface ThemeConfig {
  mode: 'light' | 'dark';
  colorPreset: 'techno' | 'blue' | 'green' | 'purple';
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'standard' | 'comfortable';
  animations: boolean;
  highContrast: boolean;
  customizations: Record<string, any>;
}

interface ThemeContextType extends ThemeConfig {
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setColorPreset: (preset: 'techno' | 'blue' | 'green' | 'purple') => void;
  setDensity: (density: 'compact' | 'standard' | 'comfortable') => void;
  setAnimations: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setCustomizations: (customizations: Record<string, any>) => void;
  initializeTheme: () => void;
  applyUserThemeSettings: (userSettings: any) => void;
  colors: ThemeColors;
  isRTL: boolean;
  isDark: boolean;
  // Legacy compatibility
  themePresets: typeof colorPresets;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Color presets using CSS custom properties for Tailwind
const colorPresets = {
  techno: {
    primary: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316', // Main techno orange
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
      950: '#431407',
    },
    secondary: {
      50: '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
      950: '#042F2E',
    },
  },
  blue: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#172554',
    },
    secondary: {
      50: '#FCE7F3',
      100: '#F9A8D4',
      200: '#F472B6',
      300: '#EC4899',
      400: '#DB2777',
      500: '#BE185D',
      600: '#9D174D',
      700: '#831843',
      800: '#701A75',
      900: '#581C87',
      950: '#3B0764',
    },
  },
  green: {
    primary: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
      950: '#052E16',
    },
    secondary: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03',
    },
  },
  purple: {
    primary: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7',
      600: '#9333EA',
      700: '#7C3AED',
      800: '#6B21A8',
      900: '#581C87',
      950: '#3B0764',
    },
    secondary: {
      50: '#ECFEFF',
      100: '#CFFAFE',
      200: '#A5F3FC',
      300: '#67E8F9',
      400: '#22D3EE',
      500: '#06B6D4',
      600: '#0891B2',
      700: '#0E7490',
      800: '#155E75',
      900: '#164E63',
      950: '#083344',
    },
  },
};

// Legacy compatibility - convert new color format to old format
const legacyThemePresets = {
  techno: {
    primary: { main: colorPresets.techno.primary[500], light: colorPresets.techno.primary[300], dark: colorPresets.techno.primary[700] },
    secondary: { main: colorPresets.techno.secondary[500], light: colorPresets.techno.secondary[300], dark: colorPresets.techno.secondary[700] }
  },
  blue: {
    primary: { main: colorPresets.blue.primary[500], light: colorPresets.blue.primary[300], dark: colorPresets.blue.primary[700] },
    secondary: { main: colorPresets.blue.secondary[500], light: colorPresets.blue.secondary[300], dark: colorPresets.blue.secondary[700] }
  },
  green: {
    primary: { main: colorPresets.green.primary[500], light: colorPresets.green.primary[300], dark: colorPresets.green.primary[700] },
    secondary: { main: colorPresets.green.secondary[500], light: colorPresets.green.secondary[300], dark: colorPresets.green.secondary[700] }
  },
  purple: {
    primary: { main: colorPresets.purple.primary[500], light: colorPresets.purple.primary[300], dark: colorPresets.purple.primary[700] },
    secondary: { main: colorPresets.purple.secondary[500], light: colorPresets.purple.secondary[300], dark: colorPresets.purple.secondary[700] }
  }
};

// CSS variable names for theme integration
const setCSSVariables = (config: ThemeConfig) => {
  const root = document.documentElement;
  const colors = colorPresets[config.colorPreset];

  // Set color variables
  Object.entries(colors.primary).forEach(([shade, color]) => {
    root.style.setProperty(`--color-primary-${shade}`, color);
  });

  Object.entries(colors.secondary).forEach(([shade, color]) => {
    root.style.setProperty(`--color-secondary-${shade}`, color);
  });

  // Set theme mode
  root.setAttribute('data-theme', config.mode);
  
  // Set font size
  const fontSizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
  };
  root.style.setProperty('--base-font-size', fontSizes[config.fontSize]);

  // Set density
  const spacings = {
    compact: '0.375rem', // 6px
    standard: '0.5rem',   // 8px
    comfortable: '0.75rem', // 12px
  };
  root.style.setProperty('--base-spacing', spacings[config.density]);

  // Set border radius based on density
  const borderRadius = {
    compact: '0.375rem',
    standard: '0.5rem',
    comfortable: '0.75rem',
  };
  root.style.setProperty('--base-border-radius', borderRadius[config.density]);
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // RTL state is handled via events to avoid circular imports
  const [isRTL, setIsRTL] = useState(false);

  // Initialize theme states from unified settings
  const initializeFromSettings = (): ThemeConfig => {
    const settings = getUnifiedSettings();
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return {
      mode: settings.theme === 'system' ? 
        (systemPrefersDark ? 'dark' : 'light') : 
        (settings.theme || 'light'),
      fontSize: settings.fontSize || 'medium',
      colorPreset: settings.colorPreset || 'techno',
      density: settings.density || 'standard',
      animations: settings.animations !== false,
      highContrast: settings.highContrast === true,
      customizations: settings.customizations || {}
    };
  };

  const [config, setConfig] = useState<ThemeConfig>(initializeFromSettings);

  // System theme change listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const settings = getUnifiedSettings();
      const shouldFollowSystem = !settings?.theme || settings.theme === 'system';

      if (shouldFollowSystem) {
        console.log('🎨 ThemeContext: System theme changed to:', e.matches ? 'dark' : 'light');
        setConfig(prev => ({ ...prev, mode: e.matches ? 'dark' : 'light' }));
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Apply CSS variables when config changes
  useEffect(() => {
    setCSSVariables(config);
  }, [config]);

  // Apply accessibility and animation settings
  useEffect(() => {
    const root = document.documentElement;
    
    // Set dark/light mode class for Tailwind
    if (config.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // High contrast
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Animations
    if (!config.animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }

    // RTL
    if (isRTL) {
      root.setAttribute('dir', 'rtl');
    } else {
      root.setAttribute('dir', 'ltr');
    }
  }, [config, isRTL]);

  // Save to unified settings when any theme property changes (debounced)
  useEffect(() => {
    const settingsToSave = {
      theme: config.mode,
      fontSize: config.fontSize,
      colorPreset: config.colorPreset,
      density: config.density,
      animations: config.animations,
      highContrast: config.highContrast,
      customizations: config.customizations
    };

    // Debounce the save operation to prevent excessive calls
    const saveTimeout = setTimeout(() => {
      // Only log in development or if it's a significant change
      if (process.env.NODE_ENV === 'development') {
        console.log('🎨 ThemeContext: Saving unified settings:', settingsToSave);
      }
      saveUnifiedSettings(settingsToSave);
      
      // Also dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { config, settingsToSave }
      }));
    }, 500); // 500ms debounce

    return () => clearTimeout(saveTimeout);
  }, [config]);

  // Theme control functions
  const toggleTheme = useCallback(() => {
    setConfig(prev => ({ ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' }));
  }, []);

  // Set specific theme mode
  const setThemeMode = useCallback((mode: 'light' | 'dark' | 'system') => {
    if (mode === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setConfig(prev => ({ ...prev, mode: systemPrefersDark ? 'dark' : 'light' }));
    } else {
      setConfig(prev => ({ ...prev, mode }));
    }
  }, []);

  const setFontSize = useCallback((fontSize: 'small' | 'medium' | 'large') => {
    setConfig(prev => ({ ...prev, fontSize }));
  }, []);

  const setColorPreset = useCallback((colorPreset: 'techno' | 'blue' | 'green' | 'purple') => {
    setConfig(prev => ({ ...prev, colorPreset }));
  }, []);

  const setDensity = useCallback((density: 'compact' | 'standard' | 'comfortable') => {
    setConfig(prev => ({ ...prev, density }));
  }, []);

  const setAnimations = useCallback((animations: boolean) => {
    setConfig(prev => ({ ...prev, animations }));
  }, []);

  const setHighContrast = useCallback((highContrast: boolean) => {
    setConfig(prev => ({ ...prev, highContrast }));
  }, []);

  const setCustomizations = useCallback((customizations: Record<string, any>) => {
    setConfig(prev => ({ ...prev, customizations }));
  }, []);

  const initializeTheme = useCallback(() => {
    const settings = getUnifiedSettings();
    if (settings) {
      console.log('Initializing theme from unified settings:', settings);
      setConfig(initializeFromSettings());
    }
  }, []);

  // Apply user settings from login - legacy compatibility
  const applyUserThemeSettings = useCallback((userSettings: any) => {
    if (userSettings?.preferences) {
      const { theme, fontSize: userFontSize, colorPreset: userColorPreset, density: userDensity, animations: userAnimations, highContrast: userHighContrast } = userSettings.preferences;

      setConfig(prev => ({
        ...prev,
        ...(theme && { mode: theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme }),
        ...(userFontSize && { fontSize: userFontSize }),
        ...(userColorPreset && { colorPreset: userColorPreset }),
        ...(userDensity && { density: userDensity }),
        ...(userAnimations !== undefined && { animations: userAnimations }),
        ...(userHighContrast !== undefined && { highContrast: userHighContrast }),
      }));
    }
  }, []);
  
  // Listen for RTL changes from LanguageContext to avoid circular imports
  useEffect(() => {
    const handleRTLChange = (event: CustomEvent) => {
      const { isRTL: newRTL } = event.detail;
      console.log('🎨 ThemeContext: RTL changed to:', newRTL);
      setIsRTL(newRTL);
    };
    
    window.addEventListener('languageRTLChanged' as any, handleRTLChange);
    
    return () => {
      window.removeEventListener('languageRTLChanged' as any, handleRTLChange);
    };
  }, []);

  // Listen for settings changes from SettingsContext
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      const settings = event.detail;
      if (settings) {
        console.log('🎨 ThemeContext: Received settings change event:', settings);
        const newConfig = {
          mode: settings.theme === 'system' ? 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
            (settings.theme || config.mode),
          fontSize: settings.fontSize || config.fontSize,
          colorPreset: settings.colorPreset || config.colorPreset,
          density: settings.density || config.density,
          animations: settings.animations !== undefined ? settings.animations : config.animations,
          highContrast: settings.highContrast !== undefined ? settings.highContrast : config.highContrast,
          customizations: settings.customizations || config.customizations
        };
        setConfig(newConfig);
      }
    };
    
    const handleThemeRefresh = (event: CustomEvent) => {
      console.log('🔄 ThemeContext: Theme refresh requested');
      const refreshedConfig = initializeFromSettings();
      setConfig(refreshedConfig);
    };
    
    window.addEventListener('settingsChanged' as any, handleSettingsChange);
    window.addEventListener('themeRefresh' as any, handleThemeRefresh);
    
    return () => {
      window.removeEventListener('settingsChanged' as any, handleSettingsChange);
      window.removeEventListener('themeRefresh' as any, handleThemeRefresh);
    };
  }, [config, initializeFromSettings]);

  // Get current colors for the active preset
  const colors = useMemo(() => colorPresets[config.colorPreset], [config.colorPreset]);

  const contextValue: ThemeContextType = useMemo(() => ({
    ...config,
    toggleTheme,
    setThemeMode,
    setFontSize,
    setColorPreset,
    setDensity,
    setAnimations,
    setHighContrast,
    setCustomizations,
    initializeTheme,
    applyUserThemeSettings,
    colors,
    isRTL,
    isDark: config.mode === 'dark',
    // Legacy compatibility
    themePresets: legacyThemePresets,
  }), [config, toggleTheme, setThemeMode, setFontSize, setColorPreset, setDensity, setAnimations, setHighContrast, setCustomizations, initializeTheme, applyUserThemeSettings, colors, isRTL]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useCustomTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a ThemeProvider');
  }
  return context;
};

// Alias for compatibility
export const useTheme = useCustomTheme;

export default ThemeContext;
