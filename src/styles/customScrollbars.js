/**
 * Custom Scrollbar System
 * Platform-specific scrollbar styling with modern design
 * 
 * Features:
 * - Platform detection (Windows, macOS, Linux)
 * - Modern thin scrollbars with smooth animations
 * - Hover effects and transitions
 * - Theme-aware styling
 * - RTL support
 * - Accessibility compliance
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import { alpha } from '@mui/material/styles';

// ===== PLATFORM DETECTION =====

/**
 * Detect the current platform
 */
export const detectPlatform = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('linux')) return 'linux';
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('ios')) return 'ios';
  
  return 'unknown';
};

/**
 * Check if the browser supports custom scrollbars
 */
export const supportsCustomScrollbars = () => {
  // Check for webkit scrollbar support
  const testElement = document.createElement('div');
  testElement.style.cssText = '::-webkit-scrollbar { width: 0px; }';
  
  return testElement.style.cssText !== '';
};

// ===== SCROLLBAR CONFIGURATIONS =====

/**
 * Base scrollbar configuration
 */
const baseScrollbarConfig = {
  width: 8,
  height: 8,
  borderRadius: 4,
  trackColor: 'transparent',
  thumbColor: 'rgba(0, 0, 0, 0.2)',
  thumbHoverColor: 'rgba(0, 0, 0, 0.3)',
  thumbActiveColor: 'rgba(0, 0, 0, 0.4)',
  transition: 'all 0.2s ease-in-out'
};

/**
 * Platform-specific scrollbar configurations
 */
export const scrollbarConfigs = {
  windows: {
    ...baseScrollbarConfig,
    width: 12,
    height: 12,
    borderRadius: 6
  },
  
  macos: {
    ...baseScrollbarConfig,
    width: 8,
    height: 8,
    borderRadius: 4,
    thumbColor: 'rgba(0, 0, 0, 0.15)',
    thumbHoverColor: 'rgba(0, 0, 0, 0.25)'
  },
  
  linux: {
    ...baseScrollbarConfig,
    width: 10,
    height: 10,
    borderRadius: 5
  },
  
  mobile: {
    ...baseScrollbarConfig,
    width: 4,
    height: 4,
    borderRadius: 2
  }
};

/**
 * Get platform-specific scrollbar configuration
 */
export const getScrollbarConfig = (platform = null) => {
  const detectedPlatform = platform || detectPlatform();
  
  if (['android', 'ios'].includes(detectedPlatform)) {
    return scrollbarConfigs.mobile;
  }
  
  return scrollbarConfigs[detectedPlatform] || scrollbarConfigs.windows;
};

// ===== SCROLLBAR STYLES GENERATOR =====

/**
 * Generate custom scrollbar styles for a theme
 */
export const createScrollbarStyles = (theme, options = {}) => {
  const {
    platform = null,
    variant = 'default', // 'default', 'thin', 'thick', 'invisible'
    color = 'auto', // 'auto', 'primary', 'secondary', custom color
    rtl = false
  } = options;

  const config = getScrollbarConfig(platform);
  const isDark = theme.palette.mode === 'dark';
  
  // Determine colors based on theme and options
  let thumbColor, thumbHoverColor, thumbActiveColor, trackColor;
  
  if (color === 'primary') {
    thumbColor = alpha(theme.palette.primary.main, 0.3);
    thumbHoverColor = alpha(theme.palette.primary.main, 0.5);
    thumbActiveColor = alpha(theme.palette.primary.main, 0.7);
  } else if (color === 'secondary') {
    thumbColor = alpha(theme.palette.secondary.main, 0.3);
    thumbHoverColor = alpha(theme.palette.secondary.main, 0.5);
    thumbActiveColor = alpha(theme.palette.secondary.main, 0.7);
  } else if (color !== 'auto' && typeof color === 'string') {
    thumbColor = alpha(color, 0.3);
    thumbHoverColor = alpha(color, 0.5);
    thumbActiveColor = alpha(color, 0.7);
  } else {
    // Auto color based on theme
    thumbColor = isDark 
      ? alpha(theme.palette.common.white, 0.2)
      : alpha(theme.palette.common.black, 0.2);
    thumbHoverColor = isDark 
      ? alpha(theme.palette.common.white, 0.3)
      : alpha(theme.palette.common.black, 0.3);
    thumbActiveColor = isDark 
      ? alpha(theme.palette.common.white, 0.4)
      : alpha(theme.palette.common.black, 0.4);
  }
  
  trackColor = isDark 
    ? alpha(theme.palette.common.white, 0.05)
    : alpha(theme.palette.common.black, 0.05);

  // Adjust dimensions based on variant
  let width = config.width;
  let height = config.height;
  
  switch (variant) {
    case 'thin':
      width = Math.max(4, width - 2);
      height = Math.max(4, height - 2);
      break;
    case 'thick':
      width = width + 4;
      height = height + 4;
      break;
    case 'invisible':
      width = 0;
      height = 0;
      break;
  }

  return {
    // Webkit scrollbars (Chrome, Safari, Edge)
    '&::-webkit-scrollbar': {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: 'transparent'
    },
    
    '&::-webkit-scrollbar-track': {
      backgroundColor: trackColor,
      borderRadius: `${config.borderRadius}px`,
      margin: '2px'
    },
    
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: thumbColor,
      borderRadius: `${config.borderRadius}px`,
      border: `1px solid ${alpha(theme.palette.background.paper, 0.1)}`,
      transition: config.transition,
      
      '&:hover': {
        backgroundColor: thumbHoverColor,
        transform: 'scale(1.1)'
      },
      
      '&:active': {
        backgroundColor: thumbActiveColor,
        transform: 'scale(0.95)'
      }
    },
    
    '&::-webkit-scrollbar-corner': {
      backgroundColor: trackColor
    },
    
    // Firefox scrollbars
    scrollbarWidth: variant === 'invisible' ? 'none' : 'thin',
    scrollbarColor: `${thumbColor} ${trackColor}`,
    
    // RTL support
    ...(rtl && {
      '&::-webkit-scrollbar': {
        direction: 'rtl'
      }
    })
  };
};

// ===== PREDEFINED SCROLLBAR STYLES =====

/**
 * Default scrollbar styles
 */
export const defaultScrollbarStyles = (theme, rtl = false) => 
  createScrollbarStyles(theme, { variant: 'default', rtl });

/**
 * Thin scrollbar styles
 */
export const thinScrollbarStyles = (theme, rtl = false) => 
  createScrollbarStyles(theme, { variant: 'thin', rtl });

/**
 * Primary colored scrollbar styles
 */
export const primaryScrollbarStyles = (theme, rtl = false) => 
  createScrollbarStyles(theme, { color: 'primary', rtl });

/**
 * Secondary colored scrollbar styles
 */
export const secondaryScrollbarStyles = (theme, rtl = false) => 
  createScrollbarStyles(theme, { color: 'secondary', rtl });

/**
 * Invisible scrollbar styles (for custom scroll indicators)
 */
export const invisibleScrollbarStyles = (theme, rtl = false) => 
  createScrollbarStyles(theme, { variant: 'invisible', rtl });

// ===== COMPONENT-SPECIFIC SCROLLBAR STYLES =====

/**
 * DataGrid scrollbar styles
 */
export const dataGridScrollbarStyles = (theme, rtl = false) => ({
  ...createScrollbarStyles(theme, { variant: 'thin', color: 'primary', rtl }),
  
  // Additional DataGrid-specific styles
  '& .MuiDataGrid-virtualScroller': {
    ...createScrollbarStyles(theme, { variant: 'thin', color: 'primary', rtl })
  },
  
  '& .MuiDataGrid-columnsContainer': {
    ...createScrollbarStyles(theme, { variant: 'thin', color: 'primary', rtl })
  }
});

/**
 * Sidebar scrollbar styles
 */
export const sidebarScrollbarStyles = (theme, rtl = false) => ({
  ...createScrollbarStyles(theme, { variant: 'thin', rtl }),
  
  // Hide scrollbar when collapsed
  '&.collapsed': {
    ...createScrollbarStyles(theme, { variant: 'invisible', rtl })
  }
});

/**
 * Modal/Dialog scrollbar styles
 */
export const modalScrollbarStyles = (theme, rtl = false) => 
  createScrollbarStyles(theme, { variant: 'thin', color: 'secondary', rtl });

/**
 * Tab content scrollbar styles
 */
export const tabContentScrollbarStyles = (theme, rtl = false) => 
  createScrollbarStyles(theme, { variant: 'default', rtl });

// ===== UTILITY FUNCTIONS =====

/**
 * Apply scrollbar styles to a MUI styled component
 */
export const withScrollbarStyles = (StyledComponent, scrollbarOptions = {}) => {
  return (props) => {
    const { theme, ...otherProps } = props;
    const scrollbarStyles = createScrollbarStyles(theme, scrollbarOptions);
    
    return {
      ...otherProps,
      sx: {
        ...props.sx,
        ...scrollbarStyles
      }
    };
  };
};

/**
 * Create a scrollbar theme mixin
 */
export const createScrollbarTheme = (baseTheme, options = {}) => {
  const scrollbarStyles = createScrollbarStyles(baseTheme, options);
  
  return {
    ...baseTheme,
    components: {
      ...baseTheme.components,
      
      // Apply to common scrollable components
      MuiPaper: {
        styleOverrides: {
          root: {
            ...scrollbarStyles
          }
        }
      },
      
      MuiBox: {
        styleOverrides: {
          root: {
            '&.scrollable': scrollbarStyles
          }
        }
      },
      
      MuiContainer: {
        styleOverrides: {
          root: scrollbarStyles
        }
      }
    }
  };
};

/**
 * Global scrollbar styles for the entire application
 */
export const globalScrollbarStyles = (theme, rtl = false) => ({
  // Apply to body and html
  'html, body': {
    ...createScrollbarStyles(theme, { rtl })
  },
  
  // Apply to all scrollable elements
  '*': {
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px'
    },
    
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent'
    },
    
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: alpha(theme.palette.text.primary, 0.2),
      borderRadius: '4px',
      transition: 'all 0.2s ease-in-out',
      
      '&:hover': {
        backgroundColor: alpha(theme.palette.text.primary, 0.3)
      }
    }
  }
});

// ===== REACT HOOK =====

/**
 * Custom hook for scrollbar management
 */
export const useCustomScrollbars = (options = {}) => {
  const {
    variant = 'default',
    color = 'auto',
    rtl = false,
    platform = null
  } = options;

  const getScrollbarStyles = (theme) => {
    return createScrollbarStyles(theme, { variant, color, rtl, platform });
  };

  const applyScrollbarStyles = (element, theme) => {
    if (!element || !supportsCustomScrollbars()) return;

    const styles = getScrollbarStyles(theme);
    Object.assign(element.style, styles);
  };

  return {
    getScrollbarStyles,
    applyScrollbarStyles,
    supportsCustomScrollbars: supportsCustomScrollbars(),
    platform: detectPlatform()
  };
};

// ===== EXPORTS =====

export default {
  createScrollbarStyles,
  defaultScrollbarStyles,
  thinScrollbarStyles,
  primaryScrollbarStyles,
  secondaryScrollbarStyles,
  invisibleScrollbarStyles,
  dataGridScrollbarStyles,
  sidebarScrollbarStyles,
  modalScrollbarStyles,
  tabContentScrollbarStyles,
  withScrollbarStyles,
  createScrollbarTheme,
  globalScrollbarStyles,
  useCustomScrollbars,
  detectPlatform,
  supportsCustomScrollbars,
  getScrollbarConfig
};