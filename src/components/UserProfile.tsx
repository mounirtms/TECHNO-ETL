import React from 'react';
import { Paper, Box, Typography, Alert, Button } from '@mui/material';
import { Settings, Person, Language } from '@mui/icons-material';
import { useCustomTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Simplified UserProfile component to prevent dynamic import errors
 * This version provides basic functionality without complex dependencies
 */

const UserProfile = () => {
  const { toggleTheme, mode } = useCustomTheme();
  const { currentLanguage, setLanguage, translate, languages } = useLanguage();

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 1200, margin: 'auto', mt: 2, p: 3 }}></
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Person color="primary" />
        User Profile
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Simplified user profile interface. Full functionality is being loaded.
      </Alert>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Quick Theme Toggle */}
        <Box></
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings color="primary" />
            Quick Settings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}></
            <Button variant={mode === 'light' ? 'contained' : 'outlined'}
              onClick={() => handleThemeToggle()}
              size="small"
            >
              {mode === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            </Button>
          </Box>
        </Box>

        {/* Quick Language Selector */}
        <Box></
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Language color="primary" />
            Language
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(languages).map(([code, lang]: [string, any]) => (
              <Button key={code}
                variant={currentLanguage === code ? 'contained' : 'outlined'}
                onClick={() => handleLanguageChange(code)}
                size="small"
              >
                {lang.name}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Navigation Help */}
        <Box></
          <Typography variant="h6" gutterBottom>
            Available Features
          </Typography>
          <Typography variant="outlined" color="text.secondary">
            • Access full settings via the main navigation menu<br/>
            • Theme and language changes are applied immediately<br/>
            • Profile information can be managed through the account settings<br/>
            • API configurations are available in the settings panel
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default UserProfile;