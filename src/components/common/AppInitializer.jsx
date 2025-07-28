/**
 * App Initializer Component
 * Handles theme and language initialization based on system defaults and user preferences
 */

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const AppInitializer = ({ children }) => {
  const { currentUser } = useAuth();
  const { mode, setThemeMode, applyUserThemeSettings } = useCustomTheme();
  const { currentLanguage, setLanguage, applyUserLanguageSettings } = useLanguage();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationStep, setInitializationStep] = useState('Starting...');
  const [userSettings, setUserSettings] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setInitializationStep('Detecting system preferences...');
        
        // Step 1: Apply system defaults first
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const browserLang = navigator.language.split('-')[0];
        const supportedLanguages = ['en', 'fr', 'ar'];
        const detectedLanguage = supportedLanguages.includes(browserLang) ? browserLang : 'en';
        
        // Apply system defaults if no user is logged in
        if (!currentUser) {
          setInitializationStep('Applying system defaults...');
          setThemeMode(systemPrefersDark ? 'dark' : 'light');
          setLanguage(detectedLanguage);
        }
        
        // Step 2: Load and apply user settings if available
        if (currentUser) {
          setInitializationStep('Loading user preferences...');

          try {
            // Try to load user settings from localStorage
            const userSettingsKey = `userSettings_${currentUser.uid}`;
            const savedSettings = localStorage.getItem(userSettingsKey);

            if (savedSettings) {
              const parsedSettings = JSON.parse(savedSettings);
              setUserSettings(parsedSettings);

              // Apply theme
              if (parsedSettings.preferences?.theme) {
                if (parsedSettings.preferences.theme === 'system') {
                  setThemeMode(systemPrefersDark ? 'dark' : 'light');
                } else {
                  setThemeMode(parsedSettings.preferences.theme);
                }
              }

              // Apply language
              if (parsedSettings.preferences?.language) {
                setLanguage(parsedSettings.preferences.language);
              }
            }
          } catch (error) {
            console.warn('Error loading user settings:', error);
          }
        }
        
        setInitializationStep('Finalizing...');
        
        // Small delay to ensure all contexts are updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsInitialized(true);
        
      } catch (error) {
        console.error('Error during app initialization:', error);
        // Continue with defaults on error
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [currentUser, setThemeMode, setLanguage]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 2,
          backgroundColor: mode === 'dark' ? '#121212' : '#ffffff',
          color: mode === 'dark' ? '#ffffff' : '#000000'
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          TECHNO-ETL
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {initializationStep}
        </Typography>
      </Box>
    );
  }

  return children;
};

export default AppInitializer;
