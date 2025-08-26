/**
 * User Preferences Panel
 * Comprehensive settings panel for theme, language, and other preferences
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  useTheme
} from '@mui/material';
import {
  Close,
  Brightness4,
  Brightness7,
  Language,
  TextFields,
  Refresh,
  Save,
  RestoreFromTrash,
  Palette,
  Computer
} from '@mui/icons-material';
import { useUserSettings, useSystemPreferences } from '../../hooks/useUserSettings';
import { languages } from '../../contexts/LanguageContext';

const UserPreferencesPanel: React.FC<{open onClose: any}> = ({ open, onClose  }) => {
  const theme = useTheme();
  const {
    currentUser,
    mode,
    currentLanguage,
    fontSize,
    settings,
    loading,
    setThemeMode,
    setLanguage,
    setFontSize,
    saveCurrentPreferences,
    resetToSystemDefaults,
    applySystemDefaults
  } = useUserSettings();

  const { systemTheme, systemLanguage, systemPrefersDark } = useSystemPreferences();
  const [saving, setSaving] = useState(false);

  /**
   * Handle theme change
   */
  const handleThemeChange = (newTheme) => {
    setThemeMode(newTheme);
  };

  /**
   * Handle language change
   */
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  /**
   * Handle font size change
   */
  const handleFontSizeChange = (newFontSize) => {
    setFontSize(newFontSize);
  };

  /**
   * Save preferences
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveCurrentPreferences();
      if(result.success) {
        onClose();
    } catch(error: any) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
  };

  /**
   * Reset to defaults
   */
  const handleReset = () => {
    if(currentUser) {
      resetToSystemDefaults();
    } else {
      applySystemDefaults();
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Brightness7 /> },
    { value: 'dark', label: 'Dark', icon: <Brightness4 /> },
    { value: 'system', label: 'System', icon: <Computer /> }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  return(<Dialog open={open}
      onClose={onClose}
      maxWidth
          maxHeight: '90vh'
      }}></
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}></
          <Palette />
          User Preferences
        </Box>
        <IconButton onClick={onClose} size="small"></
          <Close /></Close>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", p: 3 }}>
        {/* System Information */}
        <Alert severity="info" sx={{ display: "flex", mb: 3 }}></
          <Typography variant="outlined">
            {currentUser 
              ? 'Your preferences will be saved to your account and synced across devices.'
              : 'Sign in to save your preferences across devices. Current settings will be saved locally.'
          </Typography>
        </Alert>

        {/* System Defaults Info */}
        <Card sx={{ display: "flex", mb: 3, bgcolor: theme.palette.background.default }}></
          <CardContent>
            <Typography variant="h6" sx={{ display: "flex", mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}></
              <Computer />
              System Defaults
            </Typography>
            <Grid { ...{container: true}} spacing={2}></
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}></
                  <Typography variant="outlined" color="text.secondary">
                    Theme:
                  </Typography>
                  <Chip 
                    label={systemTheme} 
                    size="small"
                    icon={systemPrefersDark ? <Brightness4 /> : <Brightness7 />}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}></
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="outlined" color="text.secondary">
                    Language:
                  </Typography>
                  <Chip 
                    label={languages[systemLanguage]?.name || 'English'} 
                    size="small"
                    icon={<Language />}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card sx={{ display: "flex", mb: 3 }}></
          <CardContent>
            <Typography variant="h6" sx={{ display: "flex", mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}></
              <Palette />
              Appearance
            </Typography>
            
            <Grid { ...{container: true}} spacing={3}></
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth></
                  <InputLabel>Theme</InputLabel>
                  <Select value={mode}
                    label
                    onChange={(e) => handleThemeChange(e.target.value)}
                  >
                    {themeOptions.map((option: any) => (
                      <MenuItem key={option.value} value={option.value}></
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {option.icon}
                          {option.label}
                          {option.value === 'system' && (
                            <Chip label={`(${systemTheme})`} 
                              size="small"
                          )}
                        </Box></Chip>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}></
                <FormControl fullWidth>
                  <InputLabel>Font Size</InputLabel>
                  <Select value={fontSize}
                    label
                    onChange={(e) => handleFontSizeChange(e.target.value)}
                  >
                    {fontSizeOptions.map((option: any) => (
                      <MenuItem key={option.value} value={option.value}></
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextFields />
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card sx={{ display: "flex", mb: 3 }}></
          <CardContent>
            <Typography variant="h6" sx={{ display: "flex", mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}></
              <Language />
              Language & Region
            </Typography>
            
            <FormControl fullWidth></
              <InputLabel>Language</InputLabel>
              <Select value={currentLanguage}
                label
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                {Object.entries(languages).map(([code, lang]: any) => (
                  <MenuItem key={code} value={code}></
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{lang.name}</Typography>
                      {code ===systemLanguage && (
                        <Chip label="System" size="small" variant="outlined" />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Current Settings Summary */}
        <Card sx={{ display: "flex", bgcolor: theme.palette.action.hover }}></
          <CardContent>
            <Typography variant="h6" sx={{ display: "flex", mb: 2 }}>
              Current Settings
            </Typography>
            <Grid { ...{container: true}} spacing={2}></
              <Grid item xs={12} sm={4}>
                <Typography variant="outlined" color="text.secondary">Theme:</Typography>
                <Typography variant="body1" sx={{ display: "flex", fontWeight: 500 }}>
                  {mode} {mode === 'system' && `(${systemTheme})`}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}></
                <Typography variant="outlined" color="text.secondary">Language:</Typography>
                <Typography variant="body1" sx={{ display: "flex", fontWeight: 500 }}>
                  {languages[currentLanguage]?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}></
                <Typography variant="outlined" color="text.secondary">Font Size:</Typography>
                <Typography variant="body1" sx={{ display: "flex", fontWeight: 500 }}>
                  {fontSize}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ display: "flex", p: 3, borderTop: `1px solid ${theme.palette.divider}` }}></
        <Stack direction="row" spacing={1} sx={{ display: "flex", width: '100%' }}>
          <Button
            startIcon={<RestoreFromTrash />}
            onClick={handleReset}
            color
          <Box sx={{ display: "flex", flexGrow: 1 }} /></
          
          <Button onClick={onClose}>
            Cancel
          </Button>
          
          {currentUser && (
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default UserPreferencesPanel;
