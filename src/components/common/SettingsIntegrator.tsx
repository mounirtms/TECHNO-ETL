/**
 * Settings Integrator Component
 * Ensures optimizedSettingsManager is properly connected to theme context
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import { useEffect, useCallback } from 'react';
// Avoid circular dependencies by using custom events instead of direct context imports
// import { useAuth } from '../../contexts/AuthContext';
// import { useCustomTheme } from '../../contexts/ThemeContext';
// import { useLanguage } from '../../contexts/LanguageContext';
// import { useSettings } from '../../contexts/SettingsContext';

// Simple theme application function
const applyThemeSettings = (settings: any) => {
  try {
    if (settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
    if (settings.colorPreset) {
      document.documentElement.setAttribute('data-color-preset', settings.colorPreset);
    }
    if (settings.fontSize) {
      document.documentElement.setAttribute('data-font-size', settings.fontSize);
    }
    if (settings.density) {
      document.documentElement.setAttribute('data-density', settings.density);
    }
    console.log('✅ Theme settings applied to DOM');
  } catch (error) {
    console.error('❌ Failed to apply theme settings:', error);
  }
};

/**
 * Simplified Settings Integrator
 * Applies settings from localStorage to DOM without circular dependencies
 */
const SettingsIntegrator: React.FC = () => {
  // Apply settings on mount and when they change
  useEffect(() => {
    const applySettings = () => {
      try {
        // Get settings from localStorage
        const settings = localStorage.getItem('techno-etl-settings');
        if (settings) {
          const parsed = JSON.parse(settings);
          console.log('🔄 SettingsIntegrator: Applying settings from localStorage:', parsed);
          
          // Apply to DOM
          applyThemeSettings(parsed);
        }
      } catch (error) {
        console.warn('Failed to apply settings:', error);
      }
    };

    // Apply on mount
    applySettings();

    // Listen for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'techno-etl-settings' || event.key?.includes('userSettings')) {
        console.log('🔄 Settings changed in localStorage, reapplying...');
        applySettings();
      }
    };

    // Listen for custom settings events
    const handleSettingsChanged = (event: CustomEvent) => {
      console.log('🔄 Settings changed via event, applying to DOM...');
      if (event.detail) {
        applyThemeSettings(event.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settingsChanged' as any, handleSettingsChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsChanged' as any, handleSettingsChanged);
    };
  }, []);

  // This component doesn't render anything, it just manages DOM synchronization
  return null;
};

export default SettingsIntegrator;
