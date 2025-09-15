/**
 * useLayoutResponsive Hook
 * Comprehensive responsive layout management system
 * 
 * Features:
 * - Sidebar state management with persistence
 * - Responsive layout calculations
 * - Mobile-specific handling
 * - RTL support
 * - Performance optimization
 * - Settings integration
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { useRTL } from '../contexts/RTLContext';

// ===== CONSTANTS =====

const LAYOUT_CONSTANTS = {
  // Sidebar widths
  SIDEBAR_WIDTH_EXPANDED: 280,
  SIDEBAR_WIDTH_COLLAPSED: 64,
  SIDEBAR_WIDTH_MOBILE: 280,
  
  // Header and footer heights
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,
  TAB_HEIGHT: 48,
  
  // Breakpoints
  MOBILE_BREAKPOINT: 'md',
  TABLET_BREAKPOINT: 'lg',
  
  // Animation durations
  TRANSITION_DURATION: 300,
  
  // Z-index values
  SIDEBAR_Z_INDEX: 1200,
  HEADER_Z_INDEX: 1100,
  FOOTER_Z_INDEX: 1000,
  
  // Storage keys
  STORAGE_KEY_SIDEBAR_STATE: 'techno-etl-sidebar-state',
  STORAGE_KEY_LAYOUT_PREFERENCES: 'techno-etl-layout-preferences'
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get stored sidebar state
 */
const getStoredSidebarState = () => {
  try {
    const stored = localStorage.getItem(LAYOUT_CONSTANTS.STORAGE_KEY_SIDEBAR_STATE);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to parse stored sidebar state:', error);
    return null;
  }
};

/**
 * Store sidebar state
 */
const storeSidebarState = (state) => {
  try {
    localStorage.setItem(LAYOUT_CONSTANTS.STORAGE_KEY_SIDEBAR_STATE, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to store sidebar state:', error);
  }
};

/**
 * Get stored layout preferences
 */
const getStoredLayoutPreferences = () => {
  try {
    const stored = localStorage.getItem(LAYOUT_CONSTANTS.STORAGE_KEY_LAYOUT_PREFERENCES);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to parse stored layout preferences:', error);
    return {};
  }
};

/**
 * Store layout preferences
 */
const storeLayoutPreferences = (preferences) => {
  try {
    localStorage.setItem(LAYOUT_CONSTANTS.STORAGE_KEY_LAYOUT_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to store layout preferences:', error);
  }
};

/**
 * Calculate content dimensions
 */
const calculateContentDimensions = (sidebarWidth, headerHeight, footerHeight, tabHeight, isRTL) => {
  const contentWidth = `calc(100vw - ${sidebarWidth}px)`;
  const contentHeight = `calc(100vh - ${headerHeight + footerHeight + tabHeight}px)`;
  
  return {
    width: contentWidth,
    height: contentHeight,
    marginLeft: isRTL ? 0 : sidebarWidth,
    marginRight: isRTL ? sidebarWidth : 0,
    paddingTop: headerHeight,
    paddingBottom: footerHeight,
    // Add flex properties for better centering
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };
};

// ===== MAIN HOOK =====

/**
 * useLayoutResponsive Hook
 * 
 * Provides comprehensive layout state management and responsive calculations
 */
export const useLayoutResponsive = (options = {}) => {
  const {
    defaultSidebarOpen = true,
    persistState = true,
    enableMobileOverlay = true,
    customBreakpoints = {},
    onSidebarToggle = null,
    onLayoutChange = null
  } = options;

  const theme = useTheme();
  const { isRTL, rtlUtils } = useRTL();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down(customBreakpoints.mobile || LAYOUT_CONSTANTS.MOBILE_BREAKPOINT));
  const isTablet = useMediaQuery(theme.breakpoints.down(customBreakpoints.tablet || LAYOUT_CONSTANTS.TABLET_BREAKPOINT));
  const isDesktop = useMediaQuery(theme.breakpoints.up(customBreakpoints.tablet || LAYOUT_CONSTANTS.TABLET_BREAKPOINT));
  
  // Layout preferences
  const [layoutPreferences, setLayoutPreferences] = useState(() => ({
    compactMode: false,
    density: 'standard', // 'compact', 'standard', 'comfortable'
    showFooter: true,
    showTabs: true,
    ...getStoredLayoutPreferences()
  }));

  // Sidebar state
  const [sidebarState, setSidebarState] = useState(() => {
    const stored = persistState ? getStoredSidebarState() : null;
    return {
      isOpen: stored?.isOpen ?? (isMobile ? false : defaultSidebarOpen),
      isCollapsed: stored?.isCollapsed ?? false,
      isPinned: stored?.isPinned ?? !isMobile,
      isTemporary: isMobile && enableMobileOverlay,
      ...stored
    };
  });

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef(null);

  // Update sidebar state when mobile breakpoint changes
  useEffect(() => {
    setSidebarState(prev => ({
      ...prev,
      isTemporary: isMobile && enableMobileOverlay,
      isPinned: !isMobile,
      ...(isMobile && { isOpen: false }) // Close sidebar on mobile by default
    }));
  }, [isMobile, enableMobileOverlay]);

  // Persist sidebar state
  useEffect(() => {
    if (persistState) {
      storeSidebarState(sidebarState);
    }
  }, [sidebarState, persistState]);

  // Persist layout preferences
  useEffect(() => {
    if (persistState) {
      storeLayoutPreferences(layoutPreferences);
    }
  }, [layoutPreferences, persistState]);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsAnimating(true);
    
    setSidebarState(prev => {
      const newState = { 
        ...prev, 
        isOpen: !prev.isOpen,
        // Reset collapsed state when opening/closing
        isCollapsed: !prev.isOpen ? false : prev.isCollapsed
      };
      onSidebarToggle?.(newState);
      return newState;
    });

    // Clear existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Set animation timeout
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, LAYOUT_CONSTANTS.TRANSITION_DURATION);
  }, [onSidebarToggle]);

  // Collapse/expand sidebar
  const toggleSidebarCollapse = useCallback(() => {
    // Only allow collapse/expand if sidebar is open and not on mobile
    if (!sidebarState.isOpen || isMobile) return;
    
    setIsAnimating(true);
    
    setSidebarState(prev => {
      const newState = { ...prev, isCollapsed: !prev.isCollapsed };
      onSidebarToggle?.(newState);
      return newState;
    });

    // Clear existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, LAYOUT_CONSTANTS.TRANSITION_DURATION);
  }, [onSidebarToggle, sidebarState.isOpen, isMobile]);

  // Pin/unpin sidebar
  const toggleSidebarPin = useCallback(() => {
    setSidebarState(prev => {
      const newState = { ...prev, isPinned: !prev.isPinned };
      onSidebarToggle?.(newState);
      return newState;
    });
  }, [onSidebarToggle]);

  // Close sidebar (for mobile overlay)
  const closeSidebar = useCallback(() => {
    if (sidebarState.isTemporary) {
      setSidebarState(prev => ({ ...prev, isOpen: false }));
    }
  }, [sidebarState.isTemporary]);

  // Update layout preferences
  const updateLayoutPreferences = useCallback((updates) => {
    setLayoutPreferences(prev => {
      const newPreferences = { ...prev, ...updates };
      onLayoutChange?.(newPreferences);
      return newPreferences;
    });
  }, [onLayoutChange]);

  // Calculate dimensions with enhanced responsive behavior
  const dimensions = useMemo(() => {
    const sidebarWidth = sidebarState.isOpen 
      ? (sidebarState.isCollapsed 
          ? LAYOUT_CONSTANTS.SIDEBAR_WIDTH_COLLAPSED 
          : (isMobile ? LAYOUT_CONSTANTS.SIDEBAR_WIDTH_MOBILE : LAYOUT_CONSTANTS.SIDEBAR_WIDTH_EXPANDED))
      : 0;

    const headerHeight = LAYOUT_CONSTANTS.HEADER_HEIGHT;
    const footerHeight = layoutPreferences.showFooter ? LAYOUT_CONSTANTS.FOOTER_HEIGHT : 0;
    const tabHeight = layoutPreferences.showTabs ? LAYOUT_CONSTANTS.TAB_HEIGHT : 0;

    return {
      sidebar: {
        width: sidebarWidth,
        expandedWidth: isMobile ? LAYOUT_CONSTANTS.SIDEBAR_WIDTH_MOBILE : LAYOUT_CONSTANTS.SIDEBAR_WIDTH_EXPANDED,
        collapsedWidth: LAYOUT_CONSTANTS.SIDEBAR_WIDTH_COLLAPSED
      },
      header: {
        height: headerHeight,
        width: `calc(100vw - ${sidebarState.isTemporary ? 0 : sidebarWidth}px)`,
        left: isRTL ? 0 : (sidebarState.isTemporary ? 0 : sidebarWidth),
        right: isRTL ? (sidebarState.isTemporary ? 0 : sidebarWidth) : 0
      },
      footer: {
        height: footerHeight,
        width: `calc(100vw - ${sidebarState.isTemporary ? 0 : sidebarWidth}px)`,
        left: isRTL ? 0 : (sidebarState.isTemporary ? 0 : sidebarWidth),
        right: isRTL ? (sidebarState.isTemporary ? 0 : sidebarWidth) : 0
      },
      content: calculateContentDimensions(
        sidebarState.isTemporary ? 0 : sidebarWidth,
        headerHeight,
        footerHeight,
        tabHeight,
        isRTL
      ),
      tabs: {
        height: tabHeight,
        width: `calc(100vw - ${sidebarState.isTemporary ? 0 : sidebarWidth}px)`,
        left: isRTL ? 0 : (sidebarState.isTemporary ? 0 : sidebarWidth),
        right: isRTL ? (sidebarState.isTemporary ? 0 : sidebarWidth) : 0
      }
    };
  }, [sidebarState, layoutPreferences, isMobile, isRTL]);

  // Layout configuration
  const layoutConfig = useMemo(() => ({
    // Responsive flags
    isMobile,
    isTablet,
    isDesktop,
    
    // RTL support
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr',
    
    // Animation state
    isAnimating,
    transitionDuration: LAYOUT_CONSTANTS.TRANSITION_DURATION,
    
    // Z-index values
    zIndex: {
      sidebar: LAYOUT_CONSTANTS.SIDEBAR_Z_INDEX,
      header: LAYOUT_CONSTANTS.HEADER_Z_INDEX,
      footer: LAYOUT_CONSTANTS.FOOTER_Z_INDEX
    },
    
    // Breakpoints
    breakpoints: {
      mobile: customBreakpoints.mobile || LAYOUT_CONSTANTS.MOBILE_BREAKPOINT,
      tablet: customBreakpoints.tablet || LAYOUT_CONSTANTS.TABLET_BREAKPOINT
    }
  }), [isMobile, isTablet, isDesktop, isRTL, isAnimating, customBreakpoints]);

  // CSS variables for dynamic styling
  const cssVariables = useMemo(() => ({
    '--sidebar-width': `${dimensions.sidebar.width}px`,
    '--sidebar-expanded-width': `${dimensions.sidebar.expandedWidth}px`,
    '--sidebar-collapsed-width': `${dimensions.sidebar.collapsedWidth}px`,
    '--header-height': `${dimensions.header.height}px`,
    '--footer-height': `${dimensions.footer.height}px`,
    '--tab-height': `${dimensions.tabs.height}px`,
    '--content-width': dimensions.content.width,
    '--content-height': dimensions.content.height,
    '--transition-duration': `${LAYOUT_CONSTANTS.TRANSITION_DURATION}ms`,
    '--direction': isRTL ? 'rtl' : 'ltr'
  }), [dimensions, isRTL]);

  // Cleanup animation timeout
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    sidebarState,
    layoutPreferences,
    layoutConfig,
    dimensions,
    cssVariables,
    
    // Actions
    toggleSidebar,
    toggleSidebarCollapse,
    toggleSidebarPin,
    closeSidebar,
    updateLayoutPreferences,
    
    // Utilities
    rtlUtils,
    
    // Constants (for external use)
    constants: LAYOUT_CONSTANTS
  };
};

export default useLayoutResponsive;