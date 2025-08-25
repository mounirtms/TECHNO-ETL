/**
 * Settings Initializer Hook
 * Ensures proper settings application after login and prevents conflicts
 */

import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettings } from './useUserSettings';
import { getMergedSettings, applyAllSettings, syncAllSettings } from '../utils/settingsUtils';
import { toast } from 'react-hot-toast';

interface SettingsInitializerResult {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  forceReinitialize: () => void;
}

export const useSettingsInitializer = (): SettingsInitializerResult => {
  const { currentUser, loading: authLoading } = useAuth();
  const { 
    settings, 
    loading: settingsLoading, 
    isInitialized: userSettingsInitialized,
    applyUserSettings
  } = useUserSettings();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if(authLoading || settingsLoading) {
        return; // Wait for auth and settings to load
      }

      // Get merged settings from all sources
      const mergedSettings = getMergedSettings(currentUser?.uid);
      
      if(currentUser) {
        // User is logged in - apply their settings
        console.log('Initializing settings for user:', currentUser.uid);
        
        // Apply user settings if available
        if(settings?.preferences) {
          applyUserSettings(settings);
        } else {
          // Apply merged settings as fallback
          applyAllSettings(mergedSettings);
        }
        
        // Sync settings to ensure consistency
        syncAllSettings(mergedSettings, currentUser.uid);
      } else {
        // No user - apply system defaults
        console.log('Initializing settings for anonymous user');
        applyAllSettings(mergedSettings);
      }

      setIsInitialized(true);
      console.log('Settings initialized successfully');
    } catch (err) {
      console.error('Failed to initialize settings:', err);
      setError((err as Error).message);
      toast.error('Failed to load user preferences');
    } finally {
      setIsLoading(false);
    }
  }, [
    currentUser,
    authLoading,
    settingsLoading,
    settings,
    userSettingsInitialized,
    applyUserSettings
  ]);

  const forceReinitialize = useCallback(() => {
    setIsInitialized(false);
    initializeSettings();
  }, [initializeSettings]);

  // Initialize settings when auth state changes
  useEffect(() => {
    if(!authLoading && userSettingsInitialized) {
      initializeSettings();
    }
  }, [authLoading, userSettingsInitialized, currentUser?.uid, initializeSettings]);

  // Listen for settings sync events
  useEffect(() => {
    const handleSettingsSync = (event: CustomEvent) => {
      console.log('Settings sync event received:', event.detail);
      // Re-initialize if needed
      if(!isInitialized) {
        initializeSettings();
      }
    };

    window.addEventListener('settingsSync', handleSettingsSync as EventListener);
    return () => {
      window.removeEventListener('settingsSync', handleSettingsSync as EventListener);
    };
  }, [isInitialized, initializeSettings]);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('Auth state changed, reinitializing settings');
      setIsInitialized(false);
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    forceReinitialize
  };
};

export default useSettingsInitializer;