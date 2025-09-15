import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the entire app structure for E2E testing
const MockApp = ({ children }) => {
  const theme = createTheme();

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Mock contexts with realistic implementations
const createMockAuthContext = (user = null) => ({
  currentUser: user,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
});

const createMockSettingsContext = (settings = {}) => ({
  settings: {
    personalInfo: {},
    preferences: { theme: 'light', language: 'en' },
    apiSettings: {},
    gridSettings: {},
    ...settings,
  },
  updateSettings: vi.fn(),
  resetSettings: vi.fn(),
});

const createMockLanguageContext = (language = 'en') => ({
  currentLanguage: language,
  translate: vi.fn((key) => key),
  changeLanguage: vi.fn(),
  languages: {
    en: { dir: 'ltr', name: 'English' },
    fr: { dir: 'ltr', name: 'Français' },
    ar: { dir: 'rtl', name: 'العربية' },
  },
});

// Mock components
const MockUserProfile = ({ onSettingsChange }) => (
  <div data-testid="user-profile">
    <div data-testid="personal-info-tab">
      <input
        data-testid="first-name-input"
        placeholder="First Name"
        onChange={(e) => onSettingsChange?.({ personalInfo: { firstName: e.target.value } })}
      />
    </div>
    <div data-testid="api-settings-tab">
      <input
        data-testid="magento-url-input"
        placeholder="Magento URL"
        onChange={(e) => onSettingsChange?.({ apiSettings: { magento: { baseUrl: e.target.value } } })}
      />
    </div>
    <div data-testid="preferences-tab">
      <select
        data-testid="theme-select"
        onChange={(e) => onSettingsChange?.({ preferences: { theme: e.target.value } })}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      <select
        data-testid="language-select"
        onChange={(e) => onSettingsChange?.({ preferences: { language: e.target.value } })}
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  </div>
);

const MockProductsGrid = ({ settings }) => (
  <div data-testid="products-grid">
    <div data-testid="grid-settings">
      Page Size: {settings?.gridSettings?.defaultPageSize || 25}
    </div>
    <div data-testid="api-status">
      API URL: {settings?.apiSettings?.magento?.baseUrl || 'Not configured'}
    </div>
    <table data-testid="products-table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr data-testid="product-row-1">
          <td>TEST-001</td>
          <td>Test Product 1</td>
          <td>Active</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const MockLicenseStatus = ({ user }) => (
  <div data-testid="license-status">
    <div data-testid="license-user">User: {user?.email || 'Not authenticated'}</div>
    <div data-testid="license-validity">Status: {user ? 'Valid' : 'Invalid'}</div>
    <button data-testid="activate-license-btn">Activate License</button>
  </div>
);

describe('End-to-End User Workflows', () => {
  let mockAuthContext;
  let mockSettingsContext;
  let mockLanguageContext;
  let user;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();

    mockAuthContext = createMockAuthContext({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
    });

    mockSettingsContext = createMockSettingsContext();
    mockLanguageContext = createMockLanguageContext();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    global.localStorage = localStorageMock;
  });

  describe('User Login and Settings Application Workflow', () => {
    it('applies user settings immediately after login', async () => {
      const savedSettings = {
        preferences: {
          theme: 'dark',
          language: 'fr',
        },
        apiSettings: {
          magento: {
            baseUrl: 'https://my-magento.com',
          },
        },
      };

      // Mock localStorage to return saved settings
      global.localStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const TestComponent = () => {
        const [currentSettings, setCurrentSettings] = React.useState(savedSettings);

        React.useEffect(() => {
          // Simulate settings loading on login
          const loadedSettings = JSON.parse(localStorage.getItem('techno-etl-settings-test-user-123') || '{}');

          setCurrentSettings(loadedSettings);
        }, []);

        return (
          <MockApp>
            <div data-testid="app-theme" data-theme={currentSettings.preferences?.theme}>
              <div data-testid="app-language" lang={currentSettings.preferences?.language}>
                <MockProductsGrid settings={currentSettings} />
              </div>
            </div>
          </MockApp>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('app-theme')).toHaveAttribute('data-theme', 'dark');
        expect(screen.getByTestId('app-language')).toHaveAttribute('lang', 'fr');
        expect(screen.getByTestId('api-status')).toHaveTextContent('API URL: https://my-magento.com');
      }, { timeout: 15000 });
    });

    it('handles first-time user with default settings', async () => {
      // Mock localStorage to return empty settings
      global.localStorage.getItem.mockReturnValue(null);

      const TestComponent = () => {
        const [currentSettings, setCurrentSettings] = React.useState({
          preferences: { theme: 'light', language: 'en' },
          apiSettings: {},
          gridSettings: { defaultPageSize: 25 },
        });

        return (
          <MockApp>
            <div data-testid="app-theme" data-theme={currentSettings.preferences.theme}>
              <MockProductsGrid settings={currentSettings} />
            </div>
          </MockApp>
        );
      };

      render(<TestCompawait waitFor(() => {
        expect(screen.getByTestId('app-theme')).toHaveAttribute('data-theme', 'light');
        expect(screen.getByTestId('grid-settings')).toHaveTextContent('Page Size: 25');
        expect(screen.getByTestId('api-status')).toHaveTextContent('API URL: Not configured');
      }, { timeout: 15000 });igured');
      });
    });
  });

  describe('Settings Configuration Workflow', () => {
    it('completes full settings configuration workflow', async () => {
      let currentSettings = {
        personalInfo: {},
        preferences: { theme: 'light', language: 'en' },
        apiSettings: {},
        gridSettings: {},
      };

      const TestComponent = () => {
        const [settings, setSettings] = React.useState(currentSettings);

        const handleSettingsChange = (newSettings) => {
          const updatedSettings = { ...settings, ...newSettings };

          setSettings(updatedSettings);
          currentSettings = updatedSettings;

          // Simulate saving to localStorage
          localStorage.setItem('techno-etl-settings-test-user-123', JSON.stringify(updatedSettings));
        };

        return (
          <MockApp>
            <div data-testid="settings-page">
              <MockUserProfile onSettingsChange={handleSettingsChange} />
              <div data-testid="current-theme" data-theme={settings.preferences.theme}>
                Current Theme: {settings.preferences.theme}
              </div>
            </div>
          </MockApp>
        );
      };

      render(<TestComponent />);

      // Step 1: Configure personal information
      const firstNameInput = screen.getByTestId('first-name-input');

      await userawait waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'techno-etl-settings-test-user-123',
          expect.stringContaining('"firstName":"John"'),
        );
      }, { timeout: 15000 });stName":"John"'),
        );
      });

      // Step 2: Configure API settings
      const magentoUrlInput = screen.getByTestId('magento-url-input');

      await uawait waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'techno-etl-settings-test-user-123',
          expect.stringContaining('"baseUrl":"https://my-store.com"'),
        );
      }, { timeout: 15000 });('"baseUrl":"https://my-store.com"'),
        );
      });

      // Step 3: Configure preferences
      const themeSelect = screen.getByTestId('await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveAttribute('data-theme', 'dark');
        expect(screen.getByTestId('current-theme')).toHaveTextContent('Current Theme: dark');
      }, { timeout: 15000 });tByTestId('current-theme')).toHaveTextContent('Current Theme: dark');
      });

      const languageSelect = screawait waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'techno-etl-settings-test-user-123',
          expect.stringContaining('"language":"fr"'),
        );
      }, { timeout: 15000 });ttings-test-user-123',
          expect.stringContaining('"language":"fr"'),
        );
      });
    });

    it('handles settings validation and error recovery', async () => {
      const TestComponent = () => {
        const [settings, setSettings] = React.useState({
          preferences: { theme: 'light' },
        });
        const [error, setError] = React.useState(null);

        const handleSettingsChange = (newSettings) => {
          try {
            // Simulate validation
            if (newSettings.apiSettings?.magento?.baseUrl &&
                !newSettings.apiSettings.magento.baseUrl.startsWith('http')) {
              throw new Error('Invalid URL format');
            }

            setSettings({ ...settings, ...newSettings });
            setError(null);
          } catch (err) {
            setError(err.message);
          }
        };

        return (
          <MockApp>
            <div data-testid="settings-form">
              {error && <div data-testid="error-message">{error}</div>}
              <input
                data-testid="url-input"
                placeholder="Enter URL"
                onChange={(e) => handleSettingsChange({
                  apiSettings: { magento: { baseUrl: e.target.value } },
                })}
              />
            </div>
          </MockApp>
        );
      };

      render(<TestComponent />);

      // Enter invalid await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid URL format');
      }, { timeout: 15000 });waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid URL format');
      });
await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      }, { timeout: 15000 });//valid-url.com');

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });
  });

  describe('Cross-Component Settings Propagation Workflow', () => {
    it('propagates settings changes across multiple components', async () => {
      let globalSettings = {
        preferences: { theme: 'light' },
        gridSettings: { defaultPageSize: 25 },
        apiSettings: { magento: { baseUrl: '' } },
      };

      const TestComponent = () => {
        const [settings, setSettings] = React.useState(globalSettings);

        const updateGlobalSettings = (newSettings) => {
          const updated = { ...settings, ...newSettings };

          setSettings(updated);
          globalSettings = updated;
        };

        return (
          <MockApp>
            <div data-testid="app-container" data-theme={settings.preferences.theme}>
              <div data-testid="settings-panel">
                <MockUserProfile onSettingsChange={updateGlobalSettings} />
              </div>
              <div data-testid="products-panel">
                <MockProductsGrid settings={settings} />
              </div>
              <div data-testid="license-panel">
                <MockLicenseStatus user={mockAuthContext.currentUser} />
              </div>
            </div>
          </MockApp>
        );
      };

      render(<TestComponent />);

 await waitFor(() => {
        // Theme should be applied to the entire app
        expect(screen.getByTestId('app-container')).toHaveAttribute('data-theme', 'dark');
      }, { timeout: 15000 });> {
        // Theme should be applied to the entire app
        expect(screen.getByTestId('app-container')).toHaveAttribute('data-theme', 'dark');
      })await waitFor(() => {
        // API settings should be reflected in products grid
        expect(screen.getByTestId('api-status')).toHaveTextContent('API URL: https://new-api.com');
      }, { timeout: 15000 });) => {
        // API settings should be reflected in products grid
        expect(screen.getByTestId('api-status')).toHaveTextContent('API URL: https://new-api.com');
      });
    });
  });

  describe('License Management Workflow', () => {
    it('completes license activation workflow', async () => {
      const TestComponent = () => {
        const [licenseStatus, setLicenseStatus] = React.useState('invalid');
        const [user] = React.useState(mockAuthContext.currentUser);

        const handleLicenseActivation = () => {
          setLicenseStatus('valid');
        };

        return (
          <MockApp>
            <div data-testid="license-management">
              <div data-testid="license-status">Status: {licenseStatus}</div>
              <div data-testid="user-info">User: {user.email}</div>
              <button
                data-testid="activate-btn"
                onClick={handleLicenseActivation}
              >
                Activate License
              </button>
            </div>
          </MockApp>
        );
      };

      render(<TestComponent />);

      // Initial state
      expect(screen.getByTestId('license-status')).toHaveTextContent('Status: invalid');
      expect(screen.getByTestIdawait waitFor(() => {
        expect(screen.getByTestId('license-status')).toHaveTextContent('Status: valid');
      }, { timeout: 15000 });.getByTestId('activate-btn');

      await user.click(activateBtn);

      await waitFor(() => {
        expect(screen.getByTestId('license-status')).toHaveTextContent('Status: valid');
      });
    });
  });

  describe('Grid Functionality Workflow', () => {
    it('completes product grid interaction workflow', async () => {
      const TestComponent = () => {
        const [selectedProduct, setSelectedProduct] = React.useState(null);
        const [gridSettings] = React.useState({
          gridSettings: { defaultPageSize: 25 },
        });

        const handleProductSelect = (product) => {
          setSelectedProduct(product);
        };

        return (
          <MockApp>
            <div data-testid="grid-container">
              <MockProductsGrid settings={gridSettings} />
              <div
                data-testid="product-row-1"
                onClick={() => handleProductSelect({ sku: 'TEST-001', name: 'Test Product 1' })}
                style={{ cursor: 'pointer' }}
              >
                Click to select product
              </div>
              {selectedProduct && (
                <div data-testid="selected-product">
                  Selected: {selectedProduct.name} ({selectedProduct.sku})
                </div>
              )}
            </div>
          </MockApp>
        );
      };

      render(<TestComponent />);

      // Verify grid is rendered with correct settings
     await waitFor(() => {
        expect(screen.getByTestId('selected-product')).toHaveTextContent('Selected: Test Product 1 (TEST-001)');
      }, { timeout: 15000 });ByTestId('product-row-1');

      await user.click(productRow);

      await waitFor(() => {
        expect(screen.getByTestId('selected-product')).toHaveTextContent('Selected: Test Product 1 (TEST-001)');
      });
    });
  });

  describe('Error Handling and Recovery Workflow', () => {
    it('handles and recovers from various error scenarios', async () => {
      const TestComponent = () => {
        const [error, setError] = React.useState(null);
        const [retryCount, setRetryCount] = React.useState(0);

        const simulateError = () => {
          setError('Network error occurred');
        };

        const handleRetry = () => {
          setRetryCount(prev => prev + 1);
          if (retryCount >= 2) {
            setError(null); // Simulate successful retry
          } else {
            setError('Retry failed, please try again');
          }
        };

        return (
          <MockApp>
            <div data-testid="error-handling">
              {error ? (
                <div data-testid="error-state">
                  <div data-testid="error-message">{error}</div>
                  <button data-testid="retry-btn" onClick={handleRetry}>
                    Retry ({retryCount}/3)
                  </button>
                </div>
              ) : (
                <div data-testid="success-state">
                  <div>Application loaded successfully</div>
                  <button data-testid="simulate-error-btn" onClick={simulateError}>
                    Simulate Error
                  </button>
                </div>
              )}
            </div>
          </MockApp>
        );
      };

      render(<TestComponent />);

      // Initial await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toHaveTextContent('Network error occurred');
      }, { timeout: 15000 });ser.click(simulateErrorBtn);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDawait waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Retry failed, please try again');
        expect(screen.getByTestId('retry-btn')).toHaveTextContent('Retry (1/3)');
      }, { timeout: 15000 });  await user.click(retryBtn);

      await waitFor(() => {
  await waitFor(() => {
        expect(screen.getByTestId('retry-btn')).toHaveTextContent('Retry (2/3)');
      }, { timeout: 15000 });ect(screen.getByTestId('retry-btn')).toHaveTextContent('Retry (1/3await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument();
      }, { timeout: 15000 });aitFor(() => {
        expect(screen.getByTestId('retry-btn')).toHaveTextContent('Retry (2/3)');
      });

      // Third retry (should succeed)
      await user.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument();
      });
    });
  });
});
