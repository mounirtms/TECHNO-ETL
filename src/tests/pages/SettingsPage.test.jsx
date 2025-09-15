/**
 * Settings Page Tests
 *
 * Comprehensive tests for the Settings page
 * Tests configuration management, preferences, and settings workflows
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SettingsPage from '../../pages/SettingsPage';

// Mock dependencies
vi.mock('../../services/settingsApi', () => ({
  default: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
    exportSettings: vi.fn(),
    importSettings: vi.fn(),
  },
}));

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Test utilities
const theme = createTheme();

const renderSettingsPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <SettingsPage {...props} />
      </ThemeProvider>
    </BrowserRouter>,
  );
};

// Mock data
const mockSettings = {
  general: {
    companyName: 'TECHNO-ETL',
    defaultLanguage: 'en',
    defaultCurrency: 'USD',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    autoRefresh: true,
    refreshInterval: 30,
  },
  display: {
    theme: 'light',
    density: 'standard',
    showGridLines: true,
    showTooltips: true,
    animationsEnabled: true,
    sidebar: 'expanded',
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    soundEnabled: true,
    notificationFrequency: 'immediate',
  },
  performance: {
    cacheEnabled: true,
    virtualizationThreshold: 100,
    lazyLoading: true,
    preloadData: false,
  },
  security: {
    sessionTimeout: 60,
    requireStrongPasswords: true,
    twoFactorAuth: false,
    ipWhitelist: [],
  },
};

// ============================================================================
// SETTINGS PAGE TESTS
// ============================================================================

describe('Settings Page', () => {
  let mockSettingsApi;
  let mockUseSettings;
  let mockUseTheme;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSettingsApi = require('../../services/settingsApi').default;
    mockUseSettings = require('../../contexts/SettingsContext').useSettings;
    mockUseTheme = require('../../contexts/ThemeContext').useTheme;

    // Setup default mock responses
    mockSettingsApi.getSettings.mockResolvedValue(mockSettings);
    mockSettingsApi.updateSettings.mockResolvedValue({ success: true });
    mockSettingsApi.resetSettings.mockResolvedValue({ success: true });

    mockUseSettings.mockReturnValue({
      settings: mockSettings,
      updateSettings: vi.fn(),
      resetSettings: vi.fn(),
      isLoading: false,
      error: null,
    });

    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders settings page without crashing', () => {
      renderSettingsPage();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('displays page title and description', () => {
      renderSettingsPage();
      expect(screen.getByText(/settings/i)).toBeInTheDocument();
      expect(screen.getByText(/configure application/i)).toBeInTheDocument();
    });

    it('renders settings tabs', () => {
      renderSettingsPage();
      expect(screen.getByText(/general/i)).toBeInTheDocument();
      expect(screen.getByText(/display/i)).toBeInTheDocument();
      expect(screen.getByText(/notifications/i)).toBeInTheDocument();
      expect(screen.getByText(/performance/i)).toBeInTheDocument();
      expect(screen.getByText(/security/i)).toBeInTheDocument();
    });

    it('displays save and reset buttons', () => {
      renderSettingsPage();
      expect(screen.getByText(/save settings/i)).toBeInTheDocument();
      expect(screen.getByText(/reset to defaults/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TAB NAVIGATION TESTS
  // ============================================================================

  describe('Tab Navigation', () => {
    it('switches to display tab', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const displayTab = screen.getByText(/display/i);

      await user.click(displayTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));

      expect(displayTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText(/theme/i)).toBeInTheDocument();
    });

    it('switches to notifications tab', async () => {
      const user = userEvent.setup();

await user.click(notificationsTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));  const notificationsTab = screen.getByText(/notifications/i);

      await user.click(notificationsTab);

      expect(notificationsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText(/email notifications/i)).toBeInTheDocumenawait user.click(performanceTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); to performance tab', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const performanceTab = screen.getByText(/performance/i);

      await user.click(performanceTab);

      expect(performanawait user.click(securityTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));elected', 'true');
      expect(screen.getByText(/cache enabled/i)).toBeInTheDocument();
    });

    it('switches to security tab', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const securityTab = screen.getByText(/security/i);

      await user.click(securityTab);

      expect(securityTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText(/session timeout/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // GENERAL SETTINGS TESTS
  // ============================================================================

  describe('General Settings', () => {
    it('displays general settings form', () => {
      renderSettingsPage();

      expect(screen.getByDisplayValue('TECHNO-ETL')).toBeInThawait user.clear(companyNameInput);
    // await user.type(companyNameInput, 'New Company Name');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));Promise(resolve => setTimeout(resolve, 50));etByDisplayValue('en')).toBeInTheDocument();
      expect(screen.getByDisplayValue('USD')).toBeInTheDocument();
      expect(screeawait user.click(languageSelect);
    // await user.click(screen.getByText('French'));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));wait new Promise(resolve => setTimeout(resolve, 50));nTheDocument();
    });

    it('updates company name', async () => {
      const user = userEvent.setup();

      await user.click(autoRefreshSwitch);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); companyNameInput = screen.getByDisplayValue('TECHNO-ETL');

      await user.clear(companyNameInput);
      await user.type(companyNameInput, 'New Company Nameawait user.clear(intervalInput);
    // await user.type(intervalInput, '60');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));gs
    await new Promise(resolve => setTimeout(resolve, 50));nput).toHaveValue('New Company Name');
    });

    it('changes default language', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const languageSelect = screen.getByLabelText(/default language/i);

      await user.click(languageSelect);
      await user.click(screen.getawait user.click(displayTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));xpect(screen.getByDisplayValue('fr')).toBeInTheDocument();
    });

    it('toggles auto refresh', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const autoRefreshSwitch = screen.getByLabelText(/auto refresh/i);

      await user.click(autoRefreshSwitch);

      expect(autoRefreshSwitch).not.toBeChecked();
    });

    it('updates refresh interval', async () => {
      const user = userEvent.setawait user.click(displayTab);
    // Add small delay to prevent act warnings
    await new Promise(resoawait user.click(darkThemeOption);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));e();

      const intervalInput = screen.getByLabelText(/refresh interval/i);

      await user.clear(intervalInput);
      await user.type(intervawait user.click(displayTab);
    // Add small delay to prevent act warnings
    await new Promise(resolawait user.click(densitySelect);
    // await user.click(screen.getByText('Compact'));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));ait new Promise(resolve => setTimeout(resolve, 50));t(intervalInput).toHaveValue(60);
    });
  });

  // =================================================await user.click(displayTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTawait user.click(gridLinesSwitch);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));SETTINGS TESTS
  // ============================================================================

  describe('Display Settings', () =>await user.click(displayTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeoawait user.click(animationsSwitch);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));=> {
      const user = userEvent.setup();

      renderSettingsPage();

      const displayTab = screen.getByText(/display/i);

      await user.click(displayTab);

      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
      expect(screen.getByText(/light/i)).toBeInTheDocument();
      expect(screen.getByText(/dark/i)).toBeInTheDocument();
    });

    it('changes theme', async () => {await user.click(notificationsTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));();
      const mockSetTheme = vi.fn();

      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: vi.fn(),
      });

      renderSettingsPage();

      const displayTab = screen.getByText(/display/i);

      await user.click(displayTab);

      const darkThemeOption = screenawait user.click(notificationsTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTawait user.click(emailSwitch);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));.click(darkThemeOption);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('changes density setting', async () => {
      cawait user.click(notificationsTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => seawait user.click(pushSwitch);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));nderSettingsPage();

      const displayTab = screen.getByText(/display/i);

      await user.click(displayTab);

      const densitySelect = screeawait user.click(notificationsTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(await user.click(frequencySelect);
    // await user.click(screen.getByText('Daily'));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));await new Promise(resolve => setTimeout(resolve, 50));densitySelect);
      await user.click(screen.getByText('Compact'));

      expect(screen.getByDisplayValue('compact')).toBeInTheDocument();
    });

    it('toggles grid lines', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const displayTab = screen.getByText(/display/i);

      await user.click(displayTab);

      await user.click(performanceTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));tByLabelText(/show grid lines/i);

      await user.click(gridLinesSwitch);

      expect(gridLinesSwitch).not.toBeChecked();
    });

    it('toggles animations', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const displayTab = screen.getByText(/display/i);

      await useawait user.click(performanceTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve =await user.click(cacheSwitch);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));animationsSwitch = screen.getByLabelText(/animations enabled/i);

      await user.click(animationsSwitch);

      expect(animationsSwitch).not.toBeChecawait user.click(performanceTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(rawait user.clear(thresholdInput);
    // await user.type(thresholdInput, '200');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));
    await new Promise(resolve => setTimeout(resolve, 50));======================================================
  // NOTIFICATION SETTINGS TESawait user.click(performanceTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setawait user.click(lazyLoadingSwitch);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));======================================

  describe('Notification Settings', () => {
    it('displays notification options', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const notificationsTab = screen.getByText(/notifications/i);

      await user.click(notificationsTab);

      expect(screen.getByLabelText(/email notifications/i)).toBeInTawait user.click(securityTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));reen.getByLabelText(/push notifications/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sound enabled/i)).toBeInTheDocument();
    });

    it('toggles email notifications', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const notificationsTab = screen.getByText(/notifications/i);

 await user.click(securityTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => sawait user.clear(timeoutInput);
    // await user.type(timeoutInput, '120');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));gs
    await new Promise(resolve => setTimeout(resolve, 50));b);

      const emailSwitch = screen.getByLabelText(/email notifications/i);

      awaawait user.click(securityTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolveawait user.click(strongPasswordSwitch);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));oBeChecked();
    });

    it('toggles push notifications', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      consawait user.click(securityTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resawait user.click(twoFactorSwitch);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));i);

      await user.click(notificationsTab);

      const pushSwitch = screen.getByLabelText(/push notifications/i);

      await user.click(pushSwitch);

      expect(pushSwitch).toBeChecked();
    });

    it('changes notification frequency', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const notificationsTab = screen.getByText(/notifications/i);

      await user.click(notificationsTab);

      const frequencySelect = screen.getByLabelText(/notification frequency/i);

      await user.click(frequencySelect);
      await user.click(screen.getByText('Daily'));

      expect(screen.getByDisplayValue('daily')).toBeInTheDocuawait user.clear(companyNameInput);
    // await user.type(companyNameInput, 'Updated Company');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); Promise(resolve => setTimeout(resolve, 50));=========================================================================
  // PERFORMANCE SETTINGS TESTS
  // ============================================================================

  describe('Performance Settings', () => {
    it('displays performance options', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const performanceTab = screen.getByText(/performance/i);

      await user.click(performanceTab);

      expect(screen.getByLabelText(/cache enabled/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/virtualization threshold/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lazy loading/i)).toBeInTheDocument();
    });

    it('toggles cache', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const performanceTab = screen.getByText(/performance/i);

      await user.click(performanceTab);
await user.click(resetButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));reen.getByLabelText(/cache enabled/i);

      await user.click(cacheSwitch);

      expect(cacheSwitch).not.toBeChecked();
    });

    it('updates virtualization threshold', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const performanceTab = screen.getByText(/performance/i);

      await user.cliawait user.click(resetButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));onst thresholdInput = screen.getByLabelText(/virtualization threshold/i);

      await user.clear(thresholdInput);
      await user.type(thresholdInput, '200');

      expect(thresholdInput).toHaveValue(200);
    });

    it('toggles lazy loading', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const performanceTab = screen.getByText(/performance/i);

      await user.click(performanceTab);

      const lazyLoadingSwitch = screen.getByLabelText(/lazy loading/i);

      await user.click(lazyLoadingSwitch);

      expect(lazyLoadingSwitch).not.toBeChecked();
    });
  });

  // ============================================================================
  // SECURITY SETTINGS TESTS
  // ============================================================================

  describe('Security await user.click(importButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));plays security options', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const securityTabawait user.upload(fileInput, settingsFile);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));wait user.click(securityTab);

      expect(screen.getByLabelText(/session timeout/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/require strong passwords/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/two factor authentication/i)).toBeInTheDocument();
    });

    it('updates session timeout', async () =await user.click(importButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));nt.setup();

      renderSettingsPage();

      const securityTab = screen.getByText(/await user.upload(fileInput, invalidFile);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));rityTab);

      const timeoutInput = screen.getByLabelText(/session timeout/i);

      await user.clear(timeoutInput);
      await user.type(timeoutInput, '120');

      expect(timeoutInput).toHaveValue(120);
    });

    it('toggles strong password requirement', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const securityTab = screen.getByText(/security/i);

      await user.click(securityTab);

      const strongPasswordSwitch = screen.getByLabelText(/require strong passwords/i);

      await user.click(strongPasswordSwitch);

      expect(strongPasswordSwitch).not.toBeChecked();
    });

    it('toggles two-factor authentication', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const securityTab = screen.getByText(/security/i);

      await user.click(securityTab);

      const twoFactorSwitch = screen.getByLabelText(/two factor authentication/i);

      await user.click(twoFactorSwitch);

      expect(twoFactorSwitch).toBeChecked();
    });
  });

  // ============================================================================
  // SAVE AND RESET TESTS
  // ============================================================================

  describe('Save and Reset', () => {
    it('saves settings when save button is clicked', async () => {
      const user = userEvent.setup();
      const mockUpdateSettings = vi.fn();

      mockUseSettings.mockReturnValue({
        settings: mockSettings,
        updateSettings: mockUpdateSettings,
        resetSettings: vi.fn(),
        isLoading:await user.click(saveButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));
      });

      renderSettingsPage();

      // Make a change
      const companyNameInput = screen.getByDisplayValue('TECHNO-ETL');

      await user.clear(companyNameInput);
      await user.type(companyNameInput, 'Updated Company');

      // Save
      const saveButton = screen.getByText(/save settings/i);

      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalled();
      }, { timeout: 15000 })await user.clear(companyNameInput);
    // Add small delay to prevent act warnings
    await new Promise(resawait user.click(saveButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));0));nfirmation', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const saveButton = screen.getByText(/save settings/i);

      await user.await user.click(performanceTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(rawait user.clear(thresholdInput);
    // await user.type(thresholdInput, 'invalid');
    // Add small delay to prevent act warnings
    await new Promise(resawait user.click(saveButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));0)); await new Promise(resolve => setTimeout(resolve, 50));getByText(/settings saved/i)).toBeInTheDocument();
      }, { timeout: 15000 });cument();
      });
    });
await user.click(securityTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => sawait user.clear(timeoutInput);
    // await user.type(timeoutInput, '0');
    // Add small delay to prevent act warnings
    await new Promise(resawait user.click(saveButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));0));ings
    await new Promise(resolve => setTimeout(resolve, 50));utton is clicked', async () => {
      const user = userEvent.setup();
      const mockResetSettings = vi.fn();

      mockUseSettings.mockReturnValue({
        settings: mockSettings,
        updateSettings: vi.fn(),
        resetSettings: mockResetSettings,
        isLoading: false,
        error: null,
      });

      renderSettingsPage();

      const resetButton = screen.getByText(/reset to defaults/i);

      await user.click(resetButton);

      // Confirm reset
      const confirmButton = screen.getByText(/confirm/i);

      awawait waitFor(() => {
        expect(mockResetSettings).toHaveBeenCalled();
      }, { timeout: 15000 });Settings).toHaveBeenCalled();
      });
    });

    it('shows reset confirmation dialog', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const resetButton = screawait user.keyboard('{ArrowRight}');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));
      await user.click(resetButton);

      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getByText(/this will reset all settings/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // IMPORT/EXPORT TESTS
  // ============================================================================

  describe('Import/Export', () => {
    it('exports settings', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const exportButton = screen.getByLabelText(/export seawait waitFor(() => {
        expect(mockSettingsApi.exportSettings).toHaveBeenCalled();
      }, { timeout: 15000 });ckSettingsApi.exportSettings).toHaveBeenCalled();
      });
    });

    it('imports settings', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const importButton = screen.getByLabelText(/import settings/i);

      await user.click(importButton);

      // Upload file
      const fileInput = screen.getByLabelText(/choose file/i);
      const settingsFile = new File(['{"general":{"companyName":"Test"}}'], 'settings.json', {
        type: 'application/json',
      });

      await user.upload(fileInput, settingsFile);

      const confirmButton =await waitFor(() => {
        expect(mockSettingsApi.importSettings).toHaveBeenCalled();
      }, { timeout: 15000 });{
        expect(mockSettingsApi.importSettings).toHaveBeenCalled();
      });
    });

    it('validates import file format', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const importButton = screen.getByLabelText(/import settings/i);

      await user.click(importButton);

      // Upload invalid file
      const fileInput = screen.getByLabelText(/choose file/i);
      const invalidFile = new File(['invalid'], 'invalid.txt', { type: 'text/plain' });

      await user.upload(fileInput, invalidFile);

      expect(screen.getByText(/invalid file format/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('handles save errors', async () => {
      const user = userEvent.setup();
      const error = new Error('Failed to save settings');

      mockSettingsApi.updateSettings.mockRejectedValue(error);

      renderSettingsPage();

      coawait waitFor(() => {
        expect(screen.getByText(/failed to save settings/i)).toBeInTheDocument();
      }, { timeout: 15000 });) => {
        expect(screen.getByText(/failed to save settings/i)).toBeInTheDocument();
      });
    });

    it('handles reset errors', async () => {
      const user = userEvent.setup();
      const error = new Error('Failed to reset settings');

      mockSettingsApi.resetSettings.mockRejectedValue(error);

      renderSettingsPage();

      const resetButton = screen.getByText(/reset to defaults/i);

      await user.click(resetawait waitFor(() => {
        expect(screen.getByText(/failed to reset settings/i)).toBeInTheDocument();
      }, { timeout: 15000 });    await waitFor(() => {
        expect(screen.getByText(/failed to reset settings/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during operations', async () => {
      const user = userEvent.setup();

      mockSettingsApi.updateSettings.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderSettingsPage();

      const saveButton = screen.getByText(/save settings/i);

      await user.click(saveButton);

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
    });
  });

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================

  describe('Validation', () => {
    it('validates required fields', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      // Clear required field
      const companyNameInput = screen.getByDisplayValue('TECHNO-ETL');

      await user.clear(companyNameInput);

      const saveButton = screen.getByText(/save settings/i);

      await user.click(saveButton);

      expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
    });

    it('validates numeric fields', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const performanceTab = screen.getByText(/performance/i);

      await user.click(performanceTab);

      const thresholdInput = screen.getByLabelText(/virtualization threshold/i);

      await user.clear(thresholdInput);
      await user.type(thresholdInput, 'invalid');

      const saveButton = screen.getByText(/save settings/i);

      await user.click(saveButton);

      expect(screen.getByText(/must be a number/i)).toBeInTheDocument();
    });

    it('validates range constraints', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const securityTab = screen.getByText(/security/i);

      await user.click(securityTab);

      const timeoutInput = screen.getByLabelText(/session timeout/i);

      await user.clear(timeoutInput);
      await user.type(timeoutInput, '0');

      const saveButton = screen.getByText(/save settings/i);

      await user.click(saveButton);

      expect(screen.getByText(/must be greater than 0/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderSettingsPage();

      const main = screen.getByRole('main');

      expect(main).toHaveAttribute('aria-labelledby');

      const tabs = screen.getAllByRole('tab');

      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-controls');
      });
    });

    it('supports keyboard navigation for tabs', async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const generalTab = screen.getByText(/general/i);
      const displayTab = screen.getByText(/display/i);

      // Focus on first tab
      generalTab.focus();
      expect(generalTab).toHaveFocus();

      // Navigate with keyboard
      await user.keyboard('{ArrowRight}');
      expect(displayTab).toHaveFocus();
    });

    it('has proper form labels', () => {
      renderSettingsPage();

      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/default language/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/auto refresh/i)).toBeInTheDocument();
    });
  });
});
