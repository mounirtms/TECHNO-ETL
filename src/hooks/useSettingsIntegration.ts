/**
 * Settings Integration Hook for TECHNO-ETL
 * Ensures settings are properly applied across all contexts and components
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCustomTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  optimizedSettingsManager, 
  applyThemeSettings,
  type AppSettings,
  type UserPreferences 
} from '../utils/optimizedSettingsManager';
import { toast } from 'react-hot-toast';

export const useSettingsIntegration = () => {
  const { currentUser } = useAuth();
  const { setThemeMode, setFontSize, setColorPreset, setDensity, setAnimations, setHighContrast } = useCustomTheme();
  const { setLanguage } = useLanguage();
  const { updateSettings: updateSettingsContext } = useSettings();

  // Apply settings to all contexts
  const applySettingsToContexts = useCallback((settings: AppSettings) => {
    try {
      const { preferences } = settings;

      // Apply theme settings
      if(preferences.theme) {
        setThemeMode(preferences.theme);
      if(preferences.fontSize) {
        setFontSize(preferences.fontSize);
      if(preferences.colorPreset) {
        setColorPreset(preferences.colorPreset);
      if(preferences.density) {
        setDensity(preferences.density);
      if(preferences.animations !== undefined) {
        setAnimations(preferences.animations);
      if(preferences.highContrast !== undefined) {
        setHighContrast(preferences.highContrast);
      // Apply language settings
      if(preferences.language) {
        setLanguage(preferences.language);
      // Apply DOM theme settings
      applyThemeSettings(preferences);

      console.log('✅ Settings applied to all contexts:', preferences);
    } catch (error) {
      console.error('❌ Failed to apply settings to contexts:', error);
  }, [setThemeMode, setFontSize, setColorPreset, setDensity, setAnimations, setHighContrast, setLanguage]);

  // Load and apply user settings on login
  useEffect(() => {
    if(currentUser) {
      try {
        const userSettings = optimizedSettingsManager.getSettings(currentUser.uid);
        applySettingsToContexts(userSettings);
        
        // Update settings context
        updateSettingsContext(userSettings);
        
        toast.success('Settings loaded successfully');
      } catch (error) {
        console.error('Failed to load user settings:', error);
        toast.error('Failed to load user settings');
  }, [currentUser, applySettingsToContexts, updateSettingsContext]);

  // Save settings function
  const saveSettings = useCallback(async (settings: Partial<AppSettings>) => {
    try {
      const success = optimizedSettingsManager.saveSettings(settings, currentUser?.uid, true);
      
      if(success) {
        // Apply to contexts immediately
        const fullSettings = optimizedSettingsManager.getSettings(currentUser?.uid);
        applySettingsToContexts(fullSettings);
        
        // Update settings context
        updateSettingsContext(fullSettings);
        
        // Save to Firebase through auth context if available
        if(currentUser && typeof currentUser?.saveUserSettings === 'function') {
          currentUser?.saveUserSettings(settings);
        toast.success('Settings saved successfully');
        return true;
      throw new Error('Failed to save settings');
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
      return false;
  }, [currentUser, applySettingsToContexts, updateSettingsContext]);

  // Update specific preference
  const updatePreference = useCallback((key: keyof UserPreferences, value) => {
    const currentSettings = optimizedSettingsManager.getSettings(currentUser?.uid);
    const updatedSettings = { ...currentSettings,
      preferences: { ...currentSettings.preferences,
        [key]: value
    };
    
    return saveSettings(updatedSettings);
  }, [currentUser, saveSettings]);

  // Initialize settings on hook mount
  useEffect(() => {
    try {
      const settings = optimizedSettingsManager.getSettings(currentUser?.uid);
      applySettingsToContexts(settings);
    } catch (error) {
      console.error('Failed to initialize settings:', error);
  }, [currentUser, applySettingsToContexts]);

  return {
    saveSettings,
    updatePreference,
    applySettingsToContexts,
    getCurrentSettings: () => optimizedSettingsManager.getSettings(currentUser?.uid),
    resetSettings: () => {
      optimizedSettingsManager.resetSettings(currentUser?.uid);
      const defaultSettings = optimizedSettingsManager.getSettings(currentUser?.uid);
      applySettingsToContexts(defaultSettings);
      updateSettingsContext(defaultSettings);
      toast.success('Settings reset to defaults');
  };
};
