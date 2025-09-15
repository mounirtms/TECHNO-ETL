/**
 * useAccessibility Hook
 * Comprehensive accessibility enhancements for the application
 * 
 * Features:
 * - Keyboard navigation support
 * - ARIA labels and descriptions
 * - Screen reader friendly announcements
 * - High contrast theme support
 * - Focus management throughout the application
 * - Skip links and navigation aids
 * - Reduced motion preferences
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import { 
  useState, 
  useEffect, 
  useCallback, 
  useRef, 
  useMemo,
  createContext,
  useContext
} from 'react';
import { useTheme } from '@mui/material';
import { useRTL } from '../contexts/RTLContext';

// ===== CONSTANTS =====

const ACCESSIBILITY_CONSTANTS = {
  // Keyboard navigation
  KEYBOARD_KEYS: {
    TAB: 'Tab',
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
  },
  
  // ARIA roles
  ARIA_ROLES: {
    BUTTON: 'button',
    LINK: 'link',
    TAB: 'tab',
    TABPANEL: 'tabpanel',
    TABLIST: 'tablist',
    MENU: 'menu',
    MENUITEM: 'menuitem',
    DIALOG: 'dialog',
    ALERT: 'alert',
    STATUS: 'status',
    REGION: 'region',
    NAVIGATION: 'navigation',
    MAIN: 'main',
    BANNER: 'banner',
    CONTENTINFO: 'contentinfo'
  },
  
  // Focus management
  FOCUS_SELECTORS: {
    FOCUSABLE: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    TABBABLE: 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  },
  
  // Announcement types
  ANNOUNCEMENT_TYPES: {
    POLITE: 'polite',
    ASSERTIVE: 'assertive',
    OFF: 'off'
  },
  
  // Storage keys
  STORAGE_KEYS: {
    PREFERENCES: 'techno-etl-accessibility-preferences',
    HIGH_CONTRAST: 'techno-etl-high-contrast',
    REDUCED_MOTION: 'techno-etl-reduced-motion',
    LARGE_TEXT: 'techno-etl-large-text'
  }
};

// ===== ACCESSIBILITY CONTEXT =====

const AccessibilityContext = createContext(null);

// ===== UTILITY FUNCTIONS =====

/**
 * Get stored accessibility preferences
 */
const getStoredPreferences = () => {
  try {
    const stored = localStorage.getItem(ACCESSIBILITY_CONSTANTS.STORAGE_KEYS.PREFERENCES);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to parse stored accessibility preferences:', error);
    return {};
  }
};

/**
 * Store accessibility preferences
 */
const storePreferences = (preferences) => {
  try {
    localStorage.setItem(ACCESSIBILITY_CONSTANTS.STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to store accessibility preferences:', error);
  }
};

/**
 * Detect system accessibility preferences
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
 * Check if element is focusable
 */
const isFocusable = (element) => {
  if (!element) return false;
  
  const focusableElements = element.matches(ACCESSIBILITY_CONSTANTS.FOCUS_SELECTORS.FOCUSABLE);
  const isVisible = element.offsetWidth > 0 && element.offsetHeight > 0;
  const isNotDisabled = !element.disabled && !element.hasAttribute('aria-disabled');
  
  return focusableElements && isVisible && isNotDisabled;
};

/**
 * Get all focusable elements within a container
 */
const getFocusableElements = (container) => {
  if (!container) return [];
  
  const elements = container.querySelectorAll(ACCESSIBILITY_CONSTANTS.FOCUS_SELECTORS.TABBABLE);
  return Array.from(elements).filter(isFocusable);
};

/**
 * Create announcement element for screen readers
 */
const createAnnouncementElement = (type = ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_TYPES.POLITE) => {
  const element = document.createElement('div');
  element.setAttribute('aria-live', type);
  element.setAttribute('aria-atomic', 'true');
  element.style.position = 'absolute';
  element.style.left = '-10000px';
  element.style.width = '1px';
  element.style.height = '1px';
  element.style.overflow = 'hidden';
  
  document.body.appendChild(element);
  return element;
};

// ===== MAIN HOOK =====

/**
 * useAccessibility Hook
 * 
 * Provides comprehensive accessibility features
 */
export const useAccessibility = (options = {}) => {
  const {
    enableKeyboardNavigation = true,
    enableScreenReaderSupport = true,
    enableFocusManagement = true,
    enableHighContrast = true,
    respectSystemPreferences = true,
    onFocusChange = null,
    onKeyboardNavigation = null
  } = options;

  const theme = useTheme();
  const { isRTL } = useRTL();
  
  // State
  const [preferences, setPreferences] = useState(() => ({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    keyboardNavigation: true,
    screenReaderOptimized: false,
    ...getStoredPreferences()
  }));
  
  const [systemPreferences, setSystemPreferences] = useState(() => detectSystemPreferences());
  const [currentFocus, setCurrentFocus] = useState(null);
  const [focusHistory, setFocusHistory] = useState([]);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  
  // Refs
  const announcementElementRef = useRef(null);
  const assertiveAnnouncementElementRef = useRef(null);
  const focusTimeoutRef = useRef(null);
  const keyboardDetectionRef = useRef(false);

  // Initialize announcement elements
  useEffect(() => {
    if (enableScreenReaderSupport) {
      announcementElementRef.current = createAnnouncementElement(ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_TYPES.POLITE);
      assertiveAnnouncementElementRef.current = createAnnouncementElement(ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_TYPES.ASSERTIVE);
      
      return () => {
        if (announcementElementRef.current) {
          document.body.removeChild(announcementElementRef.current);
        }
        if (assertiveAnnouncementElementRef.current) {
          document.body.removeChild(assertiveAnnouncementElementRef.current);
        }
      };
    }
  }, [enableScreenReaderSupport]);

  // Update preferences
  const updatePreferences = useCallback((newPreferences) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    storePreferences(updated);
  }, [preferences]);

  // Announce to screen readers
  const announce = useCallback((message, type = ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_TYPES.POLITE) => {
    if (!enableScreenReaderSupport || !message) return;
    
    const element = type === ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_TYPES.ASSERTIVE 
      ? assertiveAnnouncementElementRef.current 
      : announcementElementRef.current;
    
    if (element) {
      element.textContent = '';
      setTimeout(() => {
        element.textContent = message;
      }, 100);
    }
  }, [enableScreenReaderSupport]);

  // Focus management
  const focusElement = useCallback((element, options = {}) => {
    if (!enableFocusManagement || !element) return false;
    
    const { preventScroll = false, restoreFocus = true } = options;
    
    try {
      if (restoreFocus && currentFocus) {
        setFocusHistory(prev => [...prev, currentFocus]);
      }
      
      element.focus({ preventScroll });
      setCurrentFocus(element);
      onFocusChange?.(element);
      
      return true;
    } catch (error) {
      console.warn('Failed to focus element:', error);
      return false;
    }
  }, [enableFocusManagement, currentFocus, onFocusChange]);

  // Restore previous focus
  const restoreFocus = useCallback(() => {
    if (!enableFocusManagement || focusHistory.length === 0) return false;
    
    const previousElement = focusHistory[focusHistory.length - 1];
    setFocusHistory(prev => prev.slice(0, -1));
    
    if (previousElement && document.contains(previousElement)) {
      return focusElement(previousElement, { restoreFocus: false });
    }
    
    return false;
  }, [enableFocusManagement, focusHistory, focusElement]);

  // Focus first element in container
  const focusFirst = useCallback((container) => {
    if (!enableFocusManagement || !container) return false;
    
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      return focusElement(focusableElements[0]);
    }
    
    return false;
  }, [enableFocusManagement, focusElement]);

  // Focus last element in container
  const focusLast = useCallback((container) => {
    if (!enableFocusManagement || !container) return false;
    
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      return focusElement(focusableElements[focusableElements.length - 1]);
    }
    
    return false;
  }, [enableFocusManagement, focusElement]);

  // Focus next element
  const focusNext = useCallback((container, currentElement) => {
    if (!enableFocusManagement || !container) return false;
    
    const focusableElements = getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(currentElement || document.activeElement);
    
    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
      return focusElement(focusableElements[currentIndex + 1]);
    } else if (focusableElements.length > 0) {
      return focusElement(focusableElements[0]); // Wrap to first
    }
    
    return false;
  }, [enableFocusManagement, focusElement]);

  // Focus previous element
  const focusPrevious = useCallback((container, currentElement) => {
    if (!enableFocusManagement || !container) return false;
    
    const focusableElements = getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(currentElement || document.activeElement);
    
    if (currentIndex > 0) {
      return focusElement(focusableElements[currentIndex - 1]);
    } else if (focusableElements.length > 0) {
      return focusElement(focusableElements[focusableElements.length - 1]); // Wrap to last
    }
    
    return false;
  }, [enableFocusManagement, focusElement]);

  // Trap focus within container
  const trapFocus = useCallback((container) => {
    if (!enableFocusManagement || !container) return () => {};
    
    const handleKeyDown = (event) => {
      if (event.key !== ACCESSIBILITY_CONSTANTS.KEYBOARD_KEYS.TAB) return;
      
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          focusElement(lastElement);
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          focusElement(firstElement);
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableFocusManagement, focusElement]);

  // Keyboard navigation handler
  const createKeyboardHandler = useCallback((handlers = {}) => {
    if (!enableKeyboardNavigation) return () => {};
    
    return (event) => {
      const handler = handlers[event.key];
      if (handler) {
        const result = handler(event);
        if (result !== false) {
          event.preventDefault();
          onKeyboardNavigation?.(event.key, event);
        }
      }
    };
  }, [enableKeyboardNavigation, onKeyboardNavigation]);

  // Skip link functionality
  const createSkipLink = useCallback((targetId, label = 'Skip to main content') => {
    const handleSkip = (event) => {
      event.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        focusElement(target);
        announce(`Skipped to ${label}`);
      }
    };
    
    return {
      href: `#${targetId}`,
      onClick: handleSkip,
      className: 'skip-link',
      'aria-label': label
    };
  }, [focusElement, announce]);

  // Detect keyboard usage
  useEffect(() => {
    const handleKeyDown = () => {
      if (!keyboardDetectionRef.current) {
        keyboardDetectionRef.current = true;
        setIsKeyboardUser(true);
        document.body.classList.add('keyboard-user');
      }
    };
    
    const handleMouseDown = () => {
      if (keyboardDetectionRef.current) {
        keyboardDetectionRef.current = false;
        setIsKeyboardUser(false);
        document.body.classList.remove('keyboard-user');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (!respectSystemPreferences) return;

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
  }, [respectSystemPreferences]);

  // Apply accessibility styles
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (preferences.highContrast || systemPreferences.prefersHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (preferences.reducedMotion || systemPreferences.prefersReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Large text
    if (preferences.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Screen reader optimized
    if (preferences.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
  }, [preferences, systemPreferences]);

  // Effective preferences (considering system preferences)
  const effectivePreferences = useMemo(() => ({
    ...preferences,
    highContrast: preferences.highContrast || (respectSystemPreferences && systemPreferences.prefersHighContrast),
    reducedMotion: preferences.reducedMotion || (respectSystemPreferences && systemPreferences.prefersReducedMotion)
  }), [preferences, systemPreferences, respectSystemPreferences]);

  // ARIA helpers
  const ariaHelpers = useMemo(() => ({
    // Generate unique IDs for ARIA relationships
    generateId: (prefix = 'aria') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    
    // Create ARIA attributes for form controls
    createFormControlAria: (id, label, description, error) => ({
      id,
      'aria-label': label,
      'aria-describedby': [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined,
      'aria-invalid': error ? 'true' : undefined
    }),
    
    // Create ARIA attributes for buttons
    createButtonAria: (label, pressed, expanded, controls) => ({
      'aria-label': label,
      'aria-pressed': pressed !== undefined ? pressed.toString() : undefined,
      'aria-expanded': expanded !== undefined ? expanded.toString() : undefined,
      'aria-controls': controls
    }),
    
    // Create ARIA attributes for tabs
    createTabAria: (id, selected, controls) => ({
      id,
      role: ACCESSIBILITY_CONSTANTS.ARIA_ROLES.TAB,
      'aria-selected': selected.toString(),
      'aria-controls': controls,
      tabIndex: selected ? 0 : -1
    }),
    
    // Create ARIA attributes for tab panels
    createTabPanelAria: (id, labelledBy, hidden) => ({
      id,
      role: ACCESSIBILITY_CONSTANTS.ARIA_ROLES.TABPANEL,
      'aria-labelledby': labelledBy,
      hidden: hidden || undefined,
      tabIndex: 0
    })
  }), []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Preferences
    preferences: effectivePreferences,
    systemPreferences,
    updatePreferences,
    
    // Focus management
    currentFocus,
    focusHistory,
    focusElement,
    restoreFocus,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    trapFocus,
    
    // Screen reader support
    announce,
    
    // Keyboard navigation
    createKeyboardHandler,
    isKeyboardUser,
    
    // Skip links
    createSkipLink,
    
    // ARIA helpers
    ariaHelpers,
    
    // Utilities
    isFocusable,
    getFocusableElements,
    
    // Constants
    KEYBOARD_KEYS: ACCESSIBILITY_CONSTANTS.KEYBOARD_KEYS,
    ARIA_ROLES: ACCESSIBILITY_CONSTANTS.ARIA_ROLES,
    ANNOUNCEMENT_TYPES: ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_TYPES
  };
};

// ===== PROVIDER COMPONENT =====

export const AccessibilityProvider = ({ children, ...options }) => {
  const accessibility = useAccessibility(options);
  
  return (
    <AccessibilityContext.Provider value={accessibility}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// ===== CONTEXT HOOK =====

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};

export default useAccessibility;