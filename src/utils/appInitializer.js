/**
 * App Initializer
 * Sets up the unified settings system and initializes user preferences
 */

import { initializeSettingsSystem, cleanupUserData } from './unifiedSettingsManager';
import { toast } from 'react-toastify';

/**
 * Initialize the application with proper settings
 */
export const initializeApp = (currentUser = null) => {
  console.log('🚀 Initializing Techno-ETL application...');
  
  try {
    // Initialize unified settings system
    const settings = initializeSettingsSystem(currentUser?.uid);
    
    // Setup theme watchers for system preference changes
    setupSystemThemeWatcher();
    
    console.log('✅ Application initialized successfully');
    return settings;
    
  } catch (error) {
    console.error('❌ Error initializing application:', error);
    toast.error('Failed to initialize application settings');
    return null;
  }
};

/**
 * Handle user login - apply their saved settings
 */
export const onUserLogin = (user) => {
  console.log('👤 User logged in, applying settings...');
  
  try {
    const settings = initializeSettingsSystem(user.uid);
    toast.success(`Welcome back! Your preferences have been restored.`);
    return settings;
  } catch (error) {
    console.error('❌ Error applying user settings:', error);
    toast.error('Failed to restore your settings');
    return null;
  }
};

/**
 * Handle user logout - clean up user data and reset to system defaults
 */
export const onUserLogout = (userId) => {
  console.log('👋 User logged out, cleaning up...');
  
  try {
    const systemSettings = cleanupUserData(userId);
    toast.info('Logged out. Settings reset to system defaults.');
    return systemSettings;
  } catch (error) {
    console.error('❌ Error during logout cleanup:', error);
    return null;
  }
};

/**
 * Setup system theme preference watcher
 */
const setupSystemThemeWatcher = () => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      console.log('🌓 System theme preference changed:', e.matches ? 'dark' : 'light');
      
      // Notify theme context about the change
      window.dispatchEvent(new CustomEvent('system-theme-change', {
        detail: { prefersDark: e.matches }
      }));
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }
};

/**
 * Performance monitoring helper
 */
export const logPerformanceMetrics = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = window.performance.getEntriesByType('navigation')[0];
    if (navigation) {
      console.log('⚡ Performance Metrics:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      });
    }
  }
};

/**
 * Error boundary helper for settings-related errors
 */
export const handleSettingsError = (error, context = 'settings') => {
  console.error(`❌ Settings error in ${context}:`, error);
  
  // Log to external service if available
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: `Settings error: ${error.message}`,
      fatal: false
    });
  }
  
  // Show user-friendly message
  toast.error(`Settings error: ${error.message || 'Unknown error occurred'}`);
};

export default {
  initializeApp,
  onUserLogin,
  onUserLogout,
  logPerformanceMetrics,
  handleSettingsError
};
