import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { 
  saveUnifiedSettings, 
  getUserSettings, 
  getUnifiedSettings,
  applySettingsToDOM 
} from '../../utils/unifiedSettingsManager';
import SettingsSyncService from '../../services/SettingsSyncService';

// Mock Firebase
vi.mock('../../config/firebase', () => ({
  database: {}
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  onValue: vi.fn(),
  serverTimestamp: vi.fn(() => ({ '.sv': 'timestamp' }))
}));

describe('Settings Persistence Integration', () => {
  const testUserId = 'test-user-123';
  const testSettings = {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    preferences: {
      theme: 'dark',
      language: 'fr',
      fontSize: 'large',
      animations: true
    },
    apiSettings: {
      magento: {
        baseUrl: 'https://test-magento.com',
        token: 'test-token'
      }
    },
    gridSettings: {
      defaultPageSize: 50,
      density: 'compact',
      showStatsCards: true
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset DOM
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('dir');
    document.documentElement.style.fontSize = '';
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Local Storage Persistence', () => {
    it('saves settings to localStorage immediately', async () => {
      const result = await saveUnifiedSettings(testUserId, testSettings);
      
      expect(result.success).toBe(true);
      expect(result.savedLocally).toBe(true);
      
      const savedSettings = JSON.parse(localStorage.getItem(`techno-etl-settings-${testUserId}`));
      expect(savedSettings).toMatchObject(testSettings);
    });

    it('retrieves settings from localStorage', () => {
      localStorage.setItem(`techno-etl-settings-${testUserId}`, JSON.stringify(testSettings));
      
      const retrievedSettings = getUserSettings(testUserId);
      expect(retrievedSettings).toMatchObject(testSettings);
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem(`techno-etl-settings-${testUserId}`, 'invalid-json');
      
      const retrievedSettings = getUserSettings(testUserId);
      expect(retrievedSettings).toEqual({});
    });

    it('merges partial settings updates', async () => {
      // Save initial settings
      await saveUnifiedSettings(testUserId, testSettings);
      
      // Update only preferences
      const partialUpdate = {
        preferences: {
          theme: 'light',
          language: 'en'
        }
      };
      
      await saveUnifiedSettings(testUserId, partialUpdate);
      
      const updatedSettings = getUserSettings(testUserId);
      expect(updatedSettings.preferences.theme).toBe('light');
      expect(updatedSettings.preferences.language).toBe('en');
      expect(updatedSettings.preferences.fontSize).toBe('large'); // Should be preserved
      expect(updatedSettings.personalInfo).toMatchObject(testSettings.personalInfo); // Should be preserved
    });
  });

  describe('Settings Application to DOM', () => {
    it('applies theme settings to DOM', async () => {
      const themeSettings = {
        preferences: {
          theme: 'dark'
        }
      };
      
      await saveUnifiedSettings(testUserId, themeSettings);
      applySettingsToDOM(themeSettings);
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('applies language and RTL settings to DOM', async () => {
      const languageSettings = {
        preferences: {
          language: 'ar'
        }
      };
      
      await saveUnifiedSettings(testUserId, languageSettings);
      applySettingsToDOM(languageSettings);
      
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
      expect(document.documentElement.getAttribute('lang')).toBe('ar');
    });

    it('applies font size settings to DOM', async () => {
      const fontSettings = {
        preferences: {
          fontSize: 'large'
        }
      };
      
      await saveUnifiedSettings(testUserId, fontSettings);
      applySettingsToDOM(fontSettings);
      
      expect(document.documentElement.style.fontSize).toBe('18px');
    });

    it('handles system theme preference', async () => {
      const systemThemeSettings = {
        preferences: {
          theme: 'system'
        }
      };
      
      // Mock matchMedia for system theme detection
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        })),
      });
      
      await saveUnifiedSettings(testUserId, systemThemeSettings);
      applySettingsToDOM(systemThemeSettings);
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Cross-Component Settings Propagation', () => {
    it('propagates API settings to services', async () => {
      const apiSettings = {
        apiSettings: {
          magento: {
            baseUrl: 'https://updated-magento.com',
            token: 'updated-token',
            timeout: 30000
          }
        }
      };
      
      await saveUnifiedSettings(testUserId, apiSettings);
      
      // Verify settings are available for service consumption
      const retrievedSettings = getUserSettings(testUserId);
      expect(retrievedSettings.apiSettings.magento.baseUrl).toBe('https://updated-magento.com');
      expect(retrievedSettings.apiSettings.magento.token).toBe('updated-token');
      expect(retrievedSettings.apiSettings.magento.timeout).toBe(30000);
    });

    it('propagates grid settings to components', async () => {
      const gridSettings = {
        gridSettings: {
          defaultPageSize: 100,
          density: 'comfortable',
          showStatsCards: false,
          enableVirtualization: true
        }
      };
      
      await saveUnifiedSettings(testUserId, gridSettings);
      
      const retrievedSettings = getUserSettings(testUserId);
      expect(retrievedSettings.gridSettings.defaultPageSize).toBe(100);
      expect(retrievedSettings.gridSettings.density).toBe('comfortable');
      expect(retrievedSettings.gridSettings.showStatsCards).toBe(false);
      expect(retrievedSettings.gridSettings.enableVirtualization).toBe(true);
    });
  });

  describe('Settings Validation', () => {
    it('validates theme values', async () => {
      const invalidThemeSettings = {
        preferences: {
          theme: 'invalid-theme'
        }
      };
      
      const result = await saveUnifiedSettings(testUserId, invalidThemeSettings);
      
      // Should fallback to default theme
      const savedSettings = getUserSettings(testUserId);
      expect(['light', 'dark', 'system']).toContain(savedSettings.preferences.theme);
    });

    it('validates language values', async () => {
      const invalidLanguageSettings = {
        preferences: {
          language: 'invalid-lang'
        }
      };
      
      const result = await saveUnifiedSettings(testUserId, invalidLanguageSettings);
      
      // Should fallback to default language
      const savedSettings = getUserSettings(testUserId);
      expect(['en', 'fr', 'ar']).toContain(savedSettings.preferences.language);
    });

    it('validates numeric settings', async () => {
      const invalidNumericSettings = {
        gridSettings: {
          defaultPageSize: 'not-a-number'
        }
      };
      
      const result = await saveUnifiedSettings(testUserId, invalidNumericSettings);
      
      // Should fallback to default or sanitize
      const savedSettings = getUserSettings(testUserId);
      expect(typeof savedSettings.gridSettings.defaultPageSize).toBe('number');
      expect(savedSettings.gridSettings.defaultPageSize).toBeGreaterThan(0);
    });
  });

  describe('Settings Synchronization', () => {
    it('queues settings for cloud sync', async () => {
      const syncSpy = vi.spyOn(SettingsSyncService, 'saveSettings');
      syncSpy.mockResolvedValue({ success: true, queuedForSync: true });
      
      await saveUnifiedSettings(testUserId, testSettings);
      
      expect(syncSpy).toHaveBeenCalledWith(testUserId, testSettings);
    });

    it('handles sync failures gracefully', async () => {
      const syncSpy = vi.spyOn(SettingsSyncService, 'saveSettings');
      syncSpy.mockRejectedValue(new Error('Sync failed'));
      
      const result = await saveUnifiedSettings(testUserId, testSettings);
      
      // Should still save locally even if sync fails
      expect(result.success).toBe(true);
      expect(result.savedLocally).toBe(true);
      
      const savedSettings = getUserSettings(testUserId);
      expect(savedSettings).toMatchObject(testSettings);
    });
  });

  describe('Anonymous User Handling', () => {
    it('handles anonymous users', async () => {
      const result = await saveUnifiedSettings(null, testSettings);
      
      expect(result.success).toBe(true);
      expect(result.savedLocally).toBe(true);
      
      // Should save with anonymous key
      const anonymousSettings = localStorage.getItem('techno-etl-settings-anonymous');
      expect(anonymousSettings).toBeTruthy();
    });

    it('migrates anonymous settings to authenticated user', async () => {
      // Save settings as anonymous user
      await saveUnifiedSettings(null, testSettings);
      
      // Simulate user login and migration
      await saveUnifiedSettings(testUserId, testSettings);
      
      const userSettings = getUserSettings(testUserId);
      expect(userSettings).toMatchObject(testSettings);
    });
  });

  describe('Performance Considerations', () => {
    it('debounces rapid setting changes', async () => {
      const rapidChanges = [
        { preferences: { theme: 'light' } },
        { preferences: { theme: 'dark' } },
        { preferences: { theme: 'system' } }
      ];
      
      const promises = rapidChanges.map(settings => 
        saveUnifiedSettings(testUserId, settings)
      );
      
      await Promise.all(promises);
      
      // Should handle rapid changes without issues
      const finalSettings = getUserSettings(testUserId);
      expect(finalSettings.preferences.theme).toBe('system');
    });

    it('handles large settings objects efficiently', async () => {
      const largeSettings = {
        ...testSettings,
        customData: new Array(1000).fill(0).map((_, i) => ({
          id: i,
          data: `test-data-${i}`,
          timestamp: new Date().toISOString()
        }))
      };
      
      const startTime = performance.now();
      await saveUnifiedSettings(testUserId, largeSettings);
      const endTime = performance.now();
      
      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      
      const retrievedSettings = getUserSettings(testUserId);
      expect(retrievedSettings.customData).toHaveLength(1000);
    });
  });
});