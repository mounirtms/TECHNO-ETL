import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Optimized theme and RTL hook that prevents excessive re-renders
 * Memoizes theme-related calculations and RTL properties
 */
export const useOptimizedTheme = () => {
  const theme = useTheme();
  const { currentLanguage, languages } = useLanguage();

  // Memoize RTL and language properties to prevent re-renders
  const themeConfig = useMemo(() => {
    const currentLangConfig = languages[currentLanguage];
    const isRTL = currentLangConfig?.dir === 'rtl';

    return {
      theme,
      isRTL,
      direction: currentLangConfig?.dir || 'ltr',
      language: currentLanguage,
      languageCode: currentLangConfig?.code || 'en-US',
      // Common RTL-aware styles
      marginStart: isRTL ? 'marginRight' : 'marginLeft',
      marginEnd: isRTL ? 'marginLeft' : 'marginRight',
      paddingStart: isRTL ? 'paddingRight' : 'paddingLeft',
      paddingEnd: isRTL ? 'paddingLeft' : 'paddingRight',
      textAlign: isRTL ? 'right' : 'left',
      // Flexbox direction helpers
      flexDirection: isRTL ? 'row-reverse' : 'row',
      // Transform helpers for icons/arrows
      transform: isRTL ? 'scaleX(-1)' : 'none',
    };
  }, [theme, currentLanguage, languages]);

  return themeConfig;
};

/**
 * Optimized grid theme hook specifically for data grids
 * Provides memoized theme properties commonly used in grids
 */
export const useOptimizedGridTheme = () => {
  const { theme, isRTL, direction } = useOptimizedTheme();

  // Memoize grid-specific theme properties
  const gridTheme = useMemo(() => ({
    // Basic theme properties
    palette: theme.palette,
    spacing: theme.spacing,
    breakpoints: theme.breakpoints,

    // RTL properties
    isRTL,
    direction,

    // Common grid colors
    headerBackground: theme.palette.background.paper,
    rowHoverColor: theme.palette.action.hover,
    selectedRowColor: theme.palette.action.selected,
    borderColor: theme.palette.divider,

    // Grid spacing
    cellPadding: theme.spacing(1),
    headerHeight: 56,
    rowHeight: 52,

    // Typography
    headerFontWeight: theme.typography.fontWeightMedium,
    cellFontSize: theme.typography.body2.fontSize,

    // Shadows and borders
    elevation: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,

    // RTL-aware positioning
    textAlign: isRTL ? 'right' : 'left',
    iconTransform: isRTL ? 'scaleX(-1)' : 'none',
  }), [theme, isRTL, direction]);

  return gridTheme;
};

/**
 * Optimized component theme hook for specific components
 * Prevents re-renders by memoizing component-specific theme properties
 */
export const useOptimizedComponentTheme = (componentName) => {
  const { theme, isRTL } = useOptimizedTheme();

  // Memoize component-specific theme based on component name
  const componentTheme = useMemo(() => {
    const baseTheme = {
      palette: theme.palette,
      spacing: theme.spacing,
      isRTL,
      borderRadius: theme.shape.borderRadius,
    };

    // Component-specific optimizations
    switch (componentName) {
    case 'dashboard':
      return {
        ...baseTheme,
        cardElevation: theme.shadows[2],
        cardPadding: theme.spacing(3),
        statCardHeight: 120,
        chartColors: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
        ],
      };

    case 'sidebar':
      return {
        ...baseTheme,
        width: 280,
        collapsedWidth: 64,
        backgroundColor: theme.palette.background.sidebar,
        itemHeight: 48,
        iconSize: 24,
      };

    case 'header':
      return {
        ...baseTheme,
        height: 64,
        backgroundColor: theme.palette.background.header,
        elevation: theme.shadows[1],
      };

    case 'grid':
      return {
        ...baseTheme,
        headerHeight: 56,
        rowHeight: 52,
        borderColor: theme.palette.divider,
        hoverColor: theme.palette.action.hover,
      };

    default:
      return baseTheme;
    }
  }, [theme, isRTL, componentName]);

  return componentTheme;
};

export default useOptimizedTheme;
