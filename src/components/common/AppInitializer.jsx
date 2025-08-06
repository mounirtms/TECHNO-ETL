/**
 * App Initializer Component
 * Handles theme and language initialization based on system defaults and user preferences
 */

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getUnifiedSettings, saveUnifiedSettings } from '../../utils/settingsCleanup';

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
        
        // Step 1: Check unified settings first
        const unifiedSettings = localStorage.getItem('techno-etl-settings');
        let hasUnifiedSettings = false;
        
        if (unifiedSettings) {
          try {
            const settings = JSON.parse(unifiedSettings);
            hasUnifiedSettings = true;
            setInitializationStep('Applying saved preferences...');
            
            // Apply theme from unified settings
            if (settings.theme) {
              if (settings.theme === 'system') {
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setThemeMode(systemPrefersDark ? 'dark' : 'light');
              } else {
                setThemeMode(settings.theme);
              }
            }
            
            // Apply language from unified settings
            if (settings.language) {
              setLanguage(settings.language);
            }
            
            console.log('Applied unified settings:', settings);
          } catch (error) {
            console.warn('Error parsing unified settings:', error);
            hasUnifiedSettings = false;
          }
        }
        
        // Step 2: Apply system defaults if no unified settings
        if (!hasUnifiedSettings) {
          setInitializationStep('Applying system defaults...');
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const browserLang = navigator.language.split('-')[0];
          const supportedLanguages = ['en', 'fr', 'ar'];
          const detectedLanguage = supportedLanguages.includes(browserLang) ? browserLang : 'en';
          
          setThemeMode(systemPrefersDark ? 'dark' : 'light');
          setLanguage(detectedLanguage);
          
          // Save detected settings as defaults for future use
          saveUnifiedSettings({
            language: detectedLanguage,
            theme: systemPrefersDark ? 'dark' : 'light'
          });
        }
        
        setInitializationStep('Finalizing...');
        
        // Small delay to ensure all contexts are updated
        await new Promise(resolve => setTimeout(resolve, 300));
        
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
