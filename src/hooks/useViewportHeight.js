/**
 * useViewportHeight Hook
 * Intelligent height calculations for responsive layouts
 * 
 * Features:
 * - Accurate viewport height detection
 * - Mobile viewport handling (100vh issues)
 * - Dynamic height calculation with header/footer/tabs
 * - Responsive height management
 * - Performance optimization with debouncing
 * - CSS custom properties integration
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { debounce } from 'lodash';

// ===== CONSTANTS =====

const VIEWPORT_CONSTANTS = {
  // Default heights (fallbacks)
  DEFAULT_HEADER_HEIGHT: 64,
  DEFAULT_FOOTER_HEIGHT: 48,
  DEFAULT_TAB_HEIGHT: 48,
  
  // Mobile adjustments
  MOBILE_HEADER_HEIGHT: 56,
  MOBILE_FOOTER_HEIGHT: 40,
  MOBILE_TAB_HEIGHT: 40,
  
  // Debounce delays
  RESIZE_DEBOUNCE_DELAY: 150,
  ORIENTATION_DEBOUNCE_DELAY: 300,
  
  // CSS custom property names
  CSS_VARS: {
    VIEWPORT_HEIGHT: '--viewport-height',
    CONTENT_HEIGHT: '--content-height',
    AVAILABLE_HEIGHT: '--available-height',
    HEADER_HEIGHT: '--header-height',
    FOOTER_HEIGHT: '--footer-height',
    TAB_HEIGHT: '--tab-height'
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get the actual viewport height (handles mobile viewport issues)
 */
const getViewportHeight = () => {
  // Use visualViewport API if available (better for mobile)
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  
  // Fallback to window.innerHeight
  return window.innerHeight;
};

/**
 * Get element height safely
 */
const getElementHeight = (selector) => {
  try {
    const element = document.querySelector(selector);
    return element ? element.offsetHeight : 0;
  } catch (error) {
    console.warn(`Failed to get height for selector: ${selector}`, error);
    return 0;
  }
};

/**
 * Detect if device is mobile
 */
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Get safe area insets (for devices with notches)
 */
const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0', 10)
  };
};

// ===== MAIN HOOK =====

/**
 * useViewportHeight Hook
 * 
 * Provides intelligent viewport height calculations with responsive support
 */
export const useViewportHeight = (options = {}) => {
  const {
    // Element selectors for height calculation
    headerSelector = '[data-testid="app-header"], header, .MuiAppBar-root',
    footerSelector = '[data-testid="app-footer"], footer',
    tabsSelector = '[data-testid="tab-container"], .MuiTabs-root',
    
    // Manual height overrides
    headerHeight = null,
    footerHeight = null,
    tabHeight = null,
    
    // Behavior options
    includeHeader = true,
    includeFooter = true,
    includeTabs = true,
    includeSafeArea = true,
    
    // Performance options
    debounceResize = true,
    updateCSSVars = true,
    
    // Callbacks
    onHeightChange = null,
    onOrientationChange = null
  } = options;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // State
  const [viewportHeight, setViewportHeight] = useState(() => getViewportHeight());
  const [orientation, setOrientation] = useState(() => 
    window.screen?.orientation?.angle || 0
  );
  const [isReady, setIsReady] = useState(false);
  
  // Refs for cleanup
  const resizeObserverRef = useRef(null);
  const orientationTimeoutRef = useRef(null);

  // Calculate component heights
  const componentHeights = useMemo(() => {
    const safeArea = includeSafeArea ? getSafeAreaInsets() : { top: 0, bottom: 0 };
    
    // Use provided heights or detect from DOM
    const calculatedHeaderHeight = headerHeight !== null 
      ? headerHeight 
      : (includeHeader 
          ? (getElementHeight(headerSelector) || (isMobile ? VIEWPORT_CONSTANTS.MOBILE_HEADER_HEIGHT : VIEWPORT_CONSTANTS.DEFAULT_HEADER_HEIGHT))
          : 0);
    
    const calculatedFooterHeight = footerHeight !== null 
      ? footerHeight 
      : (includeFooter 
          ? (getElementHeight(footerSelector) || (isMobile ? VIEWPORT_CONSTANTS.MOBILE_FOOTER_HEIGHT : VIEWPORT_CONSTANTS.DEFAULT_FOOTER_HEIGHT))
          : 0);
    
    const calculatedTabHeight = tabHeight !== null 
      ? tabHeight 
      : (includeTabs 
          ? (getElementHeight(tabsSelector) || (isMobile ? VIEWPORT_CONSTANTS.MOBILE_TAB_HEIGHT : VIEWPORT_CONSTANTS.DEFAULT_TAB_HEIGHT))
          : 0);

    return {
      header: calculatedHeaderHeight,
      footer: calculatedFooterHeight,
      tabs: calculatedTabHeight,
      safeAreaTop: safeArea.top,
      safeAreaBottom: safeArea.bottom
    };
  }, [
    headerHeight, footerHeight, tabHeight,
    includeHeader, includeFooter, includeTabs, includeSafeArea,
    headerSelector, footerSelector, tabsSelector,
    isMobile, viewportHeight // Re-calculate when viewport changes
  ]);

  // Calculate available heights
  const heights = useMemo(() => {
    const totalFixedHeight = componentHeights.header + 
                            componentHeights.footer + 
                            componentHeights.tabs +
                            componentHeights.safeAreaTop +
                            componentHeights.safeAreaBottom;

    const contentHeight = Math.max(0, viewportHeight - totalFixedHeight);
    const availableHeight = Math.max(0, viewportHeight - componentHeights.safeAreaTop - componentHeights.safeAreaBottom);

    return {
      viewport: viewportHeight,
      content: contentHeight,
      available: availableHeight,
      fixed: totalFixedHeight,
      components: componentHeights
    };
  }, [viewportHeight, componentHeights]);

  // Update CSS custom properties
  const updateCSSProperties = useCallback(() => {
    if (!updateCSSVars) return;

    const root = document.documentElement;
    
    root.style.setProperty(VIEWPORT_CONSTANTS.CSS_VARS.VIEWPORT_HEIGHT, `${heights.viewport}px`);
    root.style.setProperty(VIEWPORT_CONSTANTS.CSS_VARS.CONTENT_HEIGHT, `${heights.content}px`);
    root.style.setProperty(VIEWPORT_CONSTANTS.CSS_VARS.AVAILABLE_HEIGHT, `${heights.available}px`);
    root.style.setProperty(VIEWPORT_CONSTANTS.CSS_VARS.HEADER_HEIGHT, `${heights.components.header}px`);
    root.style.setProperty(VIEWPORT_CONSTANTS.CSS_VARS.FOOTER_HEIGHT, `${heights.components.footer}px`);
    root.style.setProperty(VIEWPORT_CONSTANTS.CSS_VARS.TAB_HEIGHT, `${heights.components.tabs}px`);
  }, [heights, updateCSSVars]);

  // Handle viewport height changes
  const handleViewportChange = useCallback(() => {
    const newHeight = getViewportHeight();
    
    if (newHeight !== viewportHeight) {
      setViewportHeight(newHeight);
      onHeightChange?.(newHeight, heights);
    }
  }, [viewportHeight, heights, onHeightChange]);

  // Handle orientation changes
  const handleOrientationChange = useCallback(() => {
    const newOrientation = window.screen?.orientation?.angle || 0;
    
    if (newOrientation !== orientation) {
      setOrientation(newOrientation);
      
      // Clear existing timeout
      if (orientationTimeoutRef.current) {
        clearTimeout(orientationTimeoutRef.current);
      }
      
      // Delay viewport update to allow for orientation transition
      orientationTimeoutRef.current = setTimeout(() => {
        handleViewportChange();
        onOrientationChange?.(newOrientation);
      }, VIEWPORT_CONSTANTS.ORIENTATION_DEBOUNCE_DELAY);
    }
  }, [orientation, handleViewportChange, onOrientationChange]);

  // Debounced resize handler
  const debouncedResizeHandler = useMemo(() => {
    return debounceResize 
      ? debounce(handleViewportChange, VIEWPORT_CONSTANTS.RESIZE_DEBOUNCE_DELAY)
      : handleViewportChange;
  }, [handleViewportChange, debounceResize]);

  // Setup event listeners
  useEffect(() => {
    // Initial setup
    handleViewportChange();
    setIsReady(true);

    // Window resize listener
    window.addEventListener('resize', debouncedResizeHandler);
    
    // Visual viewport listener (better mobile support)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', debouncedResizeHandler);
    }
    
    // Orientation change listener
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    // ResizeObserver for component height changes
    if (window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(
        debounce(() => {
          handleViewportChange();
        }, 100)
      );

      // Observe header, footer, and tabs elements
      [headerSelector, footerSelector, tabsSelector].forEach(selector => {
        const element = document.querySelector(selector);
        if (element && resizeObserverRef.current) {
          resizeObserverRef.current.observe(element);
        }
      });
    }

    return () => {
      // Cleanup
      window.removeEventListener('resize', debouncedResizeHandler);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', debouncedResizeHandler);
      }
      
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      } else {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      if (orientationTimeoutRef.current) {
        clearTimeout(orientationTimeoutRef.current);
      }
    };
  }, [
    debouncedResizeHandler,
    handleOrientationChange,
    handleViewportChange,
    headerSelector,
    footerSelector,
    tabsSelector
  ]);

  // Update CSS properties when heights change
  useEffect(() => {
    if (isReady) {
      updateCSSProperties();
    }
  }, [heights, isReady, updateCSSProperties]);

  // Utility functions
  const getContentHeight = useCallback((additionalOffset = 0) => {
    return Math.max(0, heights.content - additionalOffset);
  }, [heights.content]);

  const getAvailableHeight = useCallback((additionalOffset = 0) => {
    return Math.max(0, heights.available - additionalOffset);
  }, [heights.available]);

  const isLandscape = useMemo(() => {
    return Math.abs(orientation) === 90;
  }, [orientation]);

  const isPortrait = useMemo(() => {
    return Math.abs(orientation) === 0 || Math.abs(orientation) === 180;
  }, [orientation]);

  // CSS helper functions
  const getCSSHeight = useCallback((type = 'content') => {
    switch (type) {
      case 'viewport':
        return `var(${VIEWPORT_CONSTANTS.CSS_VARS.VIEWPORT_HEIGHT}, ${heights.viewport}px)`;
      case 'available':
        return `var(${VIEWPORT_CONSTANTS.CSS_VARS.AVAILABLE_HEIGHT}, ${heights.available}px)`;
      case 'content':
      default:
        return `var(${VIEWPORT_CONSTANTS.CSS_VARS.CONTENT_HEIGHT}, ${heights.content}px)`;
    }
  }, [heights]);

  const getInlineStyles = useCallback((type = 'content') => {
    return {
      height: getCSSHeight(type),
      minHeight: getCSSHeight(type)
    };
  }, [getCSSHeight]);

  return {
    // Height values
    heights,
    viewportHeight: heights.viewport,
    contentHeight: heights.content,
    availableHeight: heights.available,
    
    // Component heights
    headerHeight: heights.components.header,
    footerHeight: heights.components.footer,
    tabHeight: heights.components.tabs,
    
    // Device info
    isMobile,
    isTablet,
    isLandscape,
    isPortrait,
    orientation,
    
    // State
    isReady,
    
    // Utility functions
    getContentHeight,
    getAvailableHeight,
    getCSSHeight,
    getInlineStyles,
    
    // CSS custom properties
    cssVars: VIEWPORT_CONSTANTS.CSS_VARS,
    
    // Manual refresh
    refresh: handleViewportChange
  };
};

export default useViewportHeight;