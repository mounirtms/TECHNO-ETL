/**
 * useSettingsResponsive Hook
 * Settings-driven responsive behavior system
 * 
 * Features:
 * - User preference-based responsive behavior
 * - Compact mode toggle with density controls
 * - Density controls (comfortable, compact, dense)
 * - Theme and layout customization
 * - Accessibility preferences
 * - Performance-based auto-adjustments
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useContext,
  createContext
} from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { useRTL } from '../contexts/RTLContext';

// ===== CONSTANTS =====

const SETTINGS_CONSTANTS = {
  // Density levels
  DENSITY_LEVELS: {
    COMFORTABLE: 'comfortable',
    STANDARD: 'standard', 
    COMPACT: 'compact',
    DENSE: 'dense'
  },
  
  // Spacing multipliers for each density
  DENSITY_SPACING: {
    comfortable: 1.5,
    standard: 1.0,
    compact: 0.75,
    dense: 0.5
  },
  
  // Font size multipliers
  DENSITY_FONT_SIZE: {
    comfortable: 1.1,
    standard: 1.0,
    compact: 0.95,
    dense: 0.9
  },
  
  // Component height multipliers
  DENSITY_HEIGHT: {
    comfortable: 1.2,
    standard: 1.0,
    compact: 0.9,
    dense: 0.8
  },
  
  // Storage keys
  STORAGE_KEYS: {
    SETTINGS: 'techno-etl-settings-responsive',
    DENSITY: 'techno-etl-density-preference',
    COMPACT_MODE: 'techno-etl-compact-mode',
    ACCESSIBILITY: 'techno-etl-accessibility-settings'
  },
  
  // Default settings
  DEFAULT_SETTINGS: {
    density: 'standard',
    compactMode: false,
    autoCompactOnMobile: true,
    respectSystemPreferences: true,
    highContrastMode: false,
    reducedMotion: false,
    largeText: false,
    keyboardNavigation: true,
    screenReaderOptimized: false,
    customSpacing: null,
    customFontSize: null,
    adaptiveLayout: true,
    performanceMode: false
  }
};

// ===== SETTINGS CONTEXT =====

const SettingsResponsiveContext = createContext(null);

// ===== UTILITY FUNCTIONS =====

/**
 * Get stored settings
 */
const getStoredSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_CONSTANTS.STORAGE_KEYS.SETTINGS);
    return stored ? { ...SETTINGS_CONSTANTS.DEFAULT_SETTINGS, ...JSON.parse(stored) } : SETTINGS_CONSTANTS.DEFAULT_SETTINGS;
  } catch (error) {
    console.warn('Failed to parse stored settings:', error);
    return SETTINGS_CONSTANTS.DEFAULT_SETTINGS;
  }
};

/**
 * Store settings
 */
const storeSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_CONSTANTS.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to store settings:', error);
  }
};

/**
 * Detect system preferences
 */
const detectSystemPreferences = () => {
  return {
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
    prefersLargeText: window.matchMedia('(prefers-reduced-data: reduce)').matches,
    prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
  };
};

/**
 * Calculate responsive spacing
 */
const calculateSpacing = (baseSpacing, density, customSpacing = null) => {
  if (customSpacing !== null) return customSpacing;
  
  const multiplier = SETTINGS_CONSTANTS.DENSITY_SPACING[density] || 1;
  return baseSpacing * multiplier;
};

/**
 * Calculate responsive font size
 */
const calculateFontSize = (baseFontSize, density, customFontSize = null, largeText = false) => {
  if (customFontSize !== null) return customFontSize;
  
  let multiplier = SETTINGS_CONSTANTS.DENSITY_FONT_SIZE[density] || 1;
  
  if (largeText) {
    multiplier *= 1.2;
  }
  
  return baseFontSize * multiplier;
};

/**
 * Calculate component dimensions
 */
const calculateDimensions = (baseDimensions, density) => {
  const multiplier = SETTINGS_CONSTANTS.DENSITY_HEIGHT[density] || 1;
  
  return {
    height: baseDimensions.height * multiplier,
    minHeight: baseDimensions.minHeight * multiplier,
    padding: baseDimensions.padding * SETTINGS_CONSTANTS.DENSITY_SPACING[density]
  };
};

// ===== MAIN HOOK =====

/**
 * useSettingsResponsive Hook
 * 
 * Provides settings-driven responsive behavior
 */
export const useSettingsResponsive = (options = {}) => {
  const {
    enableAutoCompact = true,
    enableSystemPreferences = true,
    enablePerformanceMode = true,
    onSettingsChange = null
  } = options;

  const theme = useTheme();
  const { isRTL } = useRTL();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // State
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [systemPreferences, setSystemPreferences] = useState(() => detectSystemPreferences());
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    isLowPerformance: false
  });

  // Effective settings (considering system preferences and auto-adjustments)
  const effectiveSettings = useMemo(() => {
    let effective = { ...settings };
    
    // Auto-compact on mobile
    if (enableAutoCompact && isMobile && settings.autoCompactOnMobile) {
      effective.compactMode = true;
      if (settings.density === 'comfortable') {
        effective.density = 'standard';
      }
    }
    
    // System preferences
    if (enableSystemPreferences && settings.respectSystemPreferences) {
      if (systemPreferences.prefersReducedMotion) {
        effective.reducedMotion = true;
      }
      if (systemPreferences.prefersHighContrast) {
        effective.highContrastMode = true;
      }
    }
    
    // Performance mode adjustments
    if (enablePerformanceMode && (settings.performanceMode || performanceMetrics.isLowPerformance)) {
      effective.density = 'compact';
      effective.reducedMotion = true;
      effective.compactMode = true;
    }
    
    return effective;
  }, [
    settings, 
    systemPreferences, 
    performanceMetrics, 
    isMobile, 
    enableAutoCompact, 
    enableSystemPreferences, 
    enablePerformanceMode
  ]);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    storeSettings(updatedSettings);
    onSettingsChange?.(updatedSettings);
  }, [settings, onSettingsChange]);

  // Toggle compact mode
  const toggleCompactMode = useCallback(() => {
    updateSettings({ compactMode: !settings.compactMode });
  }, [settings.compactMode, updateSettings]);

  // Set density
  const setDensity = useCallback((density) => {
    if (Object.values(SETTINGS_CONSTANTS.DENSITY_LEVELS).includes(density)) {
      updateSettings({ density });
    }
  }, [updateSettings]);

  // Toggle accessibility features
  const toggleAccessibilityFeature = useCallback((feature) => {
    updateSettings({ [feature]: !settings[feature] });
  }, [settings, updateSettings]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(SETTINGS_CONSTANTS.DEFAULT_SETTINGS);
    storeSettings(SETTINGS_CONSTANTS.DEFAULT_SETTINGS);
    onSettingsChange?.(SETTINGS_CONSTANTS.DEFAULT_SETTINGS);
  }, [onSettingsChange]);

  // Responsive calculations
  const responsiveValues = useMemo(() => {
    const baseSpacing = theme.spacing(1);
    const baseFontSize = 14; // Base font size in px
    
    return {
      // Spacing
      spacing: {
        xs: calculateSpacing(baseSpacing * 0.5, effectiveSettings.density, effectiveSettings.customSpacing),
        sm: calculateSpacing(baseSpacing * 1, effectiveSettings.density, effectiveSettings.customSpacing),
        md: calculateSpacing(baseSpacing * 1.5, effectiveSettings.density, effectiveSettings.customSpacing),
        lg: calculateSpacing(baseSpacing * 2, effectiveSettings.density, effectiveSettings.customSpacing),
        xl: calculateSpacing(baseSpacing * 3, effectiveSettings.density, effectiveSettings.customSpacing)
      },
      
      // Typography
      typography: {
        fontSize: {
          xs: calculateFontSize(baseFontSize * 0.75, effectiveSettings.density, effectiveSettings.customFontSize, effectiveSettings.largeText),
          sm: calculateFontSize(baseFontSize * 0.875, effectiveSettings.density, effectiveSettings.customFontSize, effectiveSettings.largeText),
          md: calculateFontSize(baseFontSize, effectiveSettings.density, effectiveSettings.customFontSize, effectiveSettings.largeText),
          lg: calculateFontSize(baseFontSize * 1.125, effectiveSettings.density, effectiveSettings.customFontSize, effectiveSettings.largeText),
          xl: calculateFontSize(baseFontSize * 1.25, effectiveSettings.density, effectiveSettings.customFontSize, effectiveSettings.largeText)
        },
        lineHeight: effectiveSettings.largeText ? 1.6 : 1.4
      },
      
      // Component dimensions
      components: {
        button: calculateDimensions({ height: 36, minHeight: 32, padding: 8 }, effectiveSettings.density),
        input: calculateDimensions({ height: 40, minHeight: 36, padding: 12 }, effectiveSettings.density),
        card: calculateDimensions({ height: 'auto', minHeight: 120, padding: 16 }, effectiveSettings.density),
        listItem: calculateDimensions({ height: 48, minHeight: 40, padding: 8 }, effectiveSettings.density),
        tab: calculateDimensions({ height: 48, minHeight: 40, padding: 12 }, effectiveSettings.density),
        toolbar: calculateDimensions({ height: 56, minHeight: 48, padding: 8 }, effectiveSettings.density)
      },
      
      // Animations
      transitions: {
        duration: effectiveSettings.reducedMotion ? 0 : theme.transitions.duration.standard,
        easing: effectiveSettings.reducedMotion ? 'linear' : theme.transitions.easing.easeInOut
      }
    };
  }, [theme, effectiveSettings]);

  // Theme overrides based on settings
  const themeOverrides = useMemo(() => {
    const overrides = {
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              height: responsiveValues.components.button.height,
              minHeight: responsiveValues.components.button.minHeight,
              padding: `${responsiveValues.components.button.padding}px ${responsiveValues.components.button.padding * 2}px`,
              fontSize: responsiveValues.typography.fontSize.md,
              transition: `all ${responsiveValues.transitions.duration}ms ${responsiveValues.transitions.easing}`
            }
          }
        },
        
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiInputBase-root': {
                height: responsiveValues.components.input.height,
                minHeight: responsiveValues.components.input.minHeight,
                fontSize: responsiveValues.typography.fontSize.md
              }
            }
          }
        },
        
        MuiCard: {
          styleOverrides: {
            root: {
              padding: responsiveValues.components.card.padding,
              minHeight: responsiveValues.components.card.minHeight
            }
          }
        },
        
        MuiListItem: {
          styleOverrides: {
            root: {
              minHeight: responsiveValues.components.listItem.minHeight,
              padding: `${responsiveValues.components.listItem.padding}px ${responsiveValues.components.listItem.padding * 2}px`
            }
          }
        },
        
        MuiTab: {
          styleOverrides: {
            root: {
              minHeight: responsiveValues.components.tab.minHeight,
              padding: `${responsiveValues.components.tab.padding}px ${responsiveValues.components.tab.padding * 2}px`,
              fontSize: responsiveValues.typography.fontSize.sm
            }
          }
        }
      },
      
      // High contrast mode
      ...(effectiveSettings.highContrastMode && {
        palette: {
          ...theme.palette,
          primary: {
            ...theme.palette.primary,
            main: theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
          },
          text: {
            primary: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            secondary: theme.palette.mode === 'dark' ? '#cccccc' : '#333333'
          }
        }
      })
    };
    
    return overrides;
  }, [theme, responsiveValues, effectiveSettings.highContrastMode]);

  // CSS custom properties
  const cssVariables = useMemo(() => ({
    '--density-spacing-xs': `${responsiveValues.spacing.xs}px`,
    '--density-spacing-sm': `${responsiveValues.spacing.sm}px`,
    '--density-spacing-md': `${responsiveValues.spacing.md}px`,
    '--density-spacing-lg': `${responsiveValues.spacing.lg}px`,
    '--density-spacing-xl': `${responsiveValues.spacing.xl}px`,
    '--density-font-size-xs': `${responsiveValues.typography.fontSize.xs}px`,
    '--density-font-size-sm': `${responsiveValues.typography.fontSize.sm}px`,
    '--density-font-size-md': `${responsiveValues.typography.fontSize.md}px`,
    '--density-font-size-lg': `${responsiveValues.typography.fontSize.lg}px`,
    '--density-font-size-xl': `${responsiveValues.typography.fontSize.xl}px`,
    '--density-line-height': responsiveValues.typography.lineHeight,
    '--transition-duration': `${responsiveValues.transitions.duration}ms`,
    '--transition-easing': responsiveValues.transitions.easing,
    '--compact-mode': effectiveSettings.compactMode ? '1' : '0',
    '--high-contrast': effectiveSettings.highContrastMode ? '1' : '0',
    '--reduced-motion': effectiveSettings.reducedMotion ? '1' : '0'
  }), [responsiveValues, effectiveSettings]);

  // Apply CSS variables to document
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [cssVariables]);

  // Listen for system preference changes
  useEffect(() => {
    if (!enableSystemPreferences) return;

    const mediaQueries = [
      { query: '(prefers-reduced-motion: reduce)', key: 'prefersReducedMotion' },
      { query: '(prefers-contrast: high)', key: 'prefersHighContrast' },
      { query: '(prefers-color-scheme: dark)', key: 'prefersDarkMode' }
    ];

    const listeners = mediaQueries.map(({ query, key }) => {
      const mq = window.matchMedia(query);
      const listener = (e) => {
        setSystemPreferences(prev => ({ ...prev, [key]: e.matches }));
      };
      mq.addListener(listener);
      return { mq, listener };
    });

    return () => {
      listeners.forEach(({ mq, listener }) => {
        mq.removeListener(listener);
      });
    };
  }, [enableSystemPreferences]);

  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMode) return;

    let frameCount = 0;
    let lastTime = performance.now();
    
    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        const memoryUsage = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;
        
        setPerformanceMetrics({
          fps,
          memoryUsage,
          isLowPerformance: fps < 30 || memoryUsage > 100
        });
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measurePerformance);
    };
    
    measurePerformance();
  }, [enablePerformanceMode]);

  return {
    // Settings
    settings: effectiveSettings,
    rawSettings: settings,
    systemPreferences,
    
    // Actions
    updateSettings,
    toggleCompactMode,
    setDensity,
    toggleAccessibilityFeature,
    resetToDefaults,
    
    // Responsive values
    responsiveValues,
    themeOverrides,
    cssVariables,
    
    // State
    isCompactMode: effectiveSettings.compactMode,
    density: effectiveSettings.density,
    isHighContrast: effectiveSettings.highContrastMode,
    isReducedMotion: effectiveSettings.reducedMotion,
    isLargeText: effectiveSettings.largeText,
    
    // Device info
    isMobile,
    isTablet,
    isRTL,
    
    // Performance
    performanceMetrics,
    isPerformanceMode: effectiveSettings.performanceMode || performanceMetrics.isLowPerformance,
    
    // Constants
    densityLevels: SETTINGS_CONSTANTS.DENSITY_LEVELS
  };
};

// ===== PROVIDER COMPONENT =====

export const SettingsResponsiveProvider = ({ children, ...options }) => {
  const settingsResponsive = useSettingsResponsive(options);
  
  return (
    <SettingsResponsiveContext.Provider value={settingsResponsive}>
      {children}
    </SettingsResponsiveContext.Provider>
  );
};

// ===== CONTEXT HOOK =====

export const useSettingsResponsiveContext = () => {
  const context = useContext(SettingsResponsiveContext);
  if (!context) {
    throw new Error('useSettingsResponsiveContext must be used within a SettingsResponsiveProvider');
  }
  return context;
};

export default useSettingsResponsive;