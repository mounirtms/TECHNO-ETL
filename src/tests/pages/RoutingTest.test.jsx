import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from '../../contexts/AuthContext';
import { SettingsProvider } from '../../contexts/SettingsContext';
import theme from '../../theme';
import i18n from '../../config/i18n';
import SimplifiedRouter from '../../router/SimplifiedRouter';

// Mock the components to avoid loading issues in tests
jest.mock('../../pages/Dashboard', () => () => <div data-testid="dashboard">Dashboard</div>);
jest.mock('../../pages/CmsPagesPage', () => () => <div data-testid="cms-pages">CMS Pages</div>);
jest.mock('../../pages/CategoriesPage', () => () => <div data-testid="categories">Categories</div>);
jest.mock('../../pages/Login', () => () => <div data-testid="login">Login</div>);
jest.mock('../../pages/NotFoundPage', () => () => <div data-testid="not-found">Not Found</div>);

// Mock the layout component
jest.mock('../../components/Layout/Layout', () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

// Mock the auth context
const mockAuthContext = {
  isAuthenticated: true,
  user: { id: 1, name: 'Test User' },
  login: jest.fn(),
  logout: jest.fn(),
};

// Mock the settings context
const mockSettingsContext = {
  settings: {},
  updateSettings: jest.fn(),
  resetSettings: jest.fn(),
};

const renderWithProviders = (component, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <AuthProvider value={mockAuthContext}>
          <SettingsProvider value={mockSettingsContext}>
            <BrowserRouter>
              {component}
            </BrowserRouter>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>,
  );
};

describe('SimplifiedRouter', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Public Routes', () => {
    test('should render login page for /login route', async () => {
      renderWithProviders(<SimplifiedRouter />, { route: '/login' });

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      }, { timeout: 15000 });
    });

    test('should render docs page for /docs route', async () => {
      renderWithProviders(<SimplifiedRouter />, { route: 'await waitFor(() => {
        expect(screen.getByTestId('docs')).toBeInTheDocument();
      }, { timeout: 15000 });cument();
      });
    });
  });

  describe('Protected Routes', () => {
    test('should render dashboard for root route', async () => {
      renderWithProviders(<Simplifawait waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      }, { timeout: 15000 });board')).toBeInTheDocument();
      });
    });

    test('should render dashboard for /dashboard route', async () => {
      renderWithProvideawait waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      }, { timeout: 15000 });en.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    test('should render CMS pages for /cms-pages route', async () => {
   await waitFor(() => {
        expect(screen.getByTestId('cms-pages')).toBeInTheDocument();
      }, { timeout: 15000 });
        expect(screen.getByTestId('cms-pages')).toBeInTheDocument();
      });
    });

    test('should render categories for /categories route',await waitFor(() => {
        expect(screen.getByTestId('categories')).toBeInTheDocument();
      }, { timeout: 15000 });it waitFor(() => {
        expect(screen.getByTestId('categories')).toBeInTheDocument();
      });
    });

    test('should render not found forawait waitFor(() => {
        expect(screen.getByTestId('not-found')).toBeInTheDocument();
      }, { timeout: 15000 });ute' });

      await waitFor(() => {
        expect(screen.getByTestId('not-found')).toBeInTheDocument();
      });
    });
  });

  describe('MDM Routes', () => {
    test('should rendeawait waitFor(() => {
        expect(screen.getByTestId('mdm-products')).toBeInTheDocument();
      }, { timeout: 15000 });route: '/mdmproducts' });

      await waitFor(() => {
        expect(screen.getByTestId('mdm-products')).toBeInTheDocument();
      });
    })await waitFor(() => {
        expect(screen.getByTestId('mdm-stock')).toBeInTheDocument();
      }, { timeout: 15000 });(<SimplifiedRouter />, { route: '/mdm-stock' });

      await waitFor(() => {
        expect(screen.getByTestId('mdm-stock')).toBeInTheDocument();
   await waitFor(() => {
        expect(screen.getByTestId('mdm-sources')).toBeInTheDocument();
      }, { timeout: 15000 });derWithProviders(<SimplifiedRouter />, { route: '/mdm-sources' });

      await waitFor(() => {
        expect(screen.getByTestId('mdm-sources')).toBeInTheDocument();
      });
  await waitFor(() => {
        expect(screen.getByTestId('stocks')).toBeInTheDocument();
      }, { timeout: 15000 });ute', async () => {
      renderWithProviders(<SimplifiedRouter />, { route: '/stocks' });

      await waitFor(() => {
        expect(scrawait waitFor(() => {
        expect(screen.getByTestId('sources')).toBeInTheDocument();
      }, { timeout: 15000 });es for /sources route', async () => {
      renderWithProviders(<SimplifiedRouter />, { route: '/sources' });

      await waitFor(() => {
  await waitFor(() => {
        expect(screen.getByTestId('invoices')).toBeInTheDocument();
      }, { timeout: 15000 });uld render invoices for /invoices route', async () => {
      renderWithProviders(<SimplifiedRouter />, { route: '/invoices' });

      await waitFor(() => {
 await waitFor(() => {
        expect(screen.getByTestId('cegid-products')).toBeInTheDocument();
      }, { timeout: 15000 });render Cegid products for /cegid-products route', async () => {
      renderWithProviders(<SimplifiedRouter />, { route: '/cegid-products' });

      await waitFor(() => {
        expect(screen.getByTestId('ceawait waitFor(() => {
        expect(screen.getByTestId('sales-analytics')).toBeInTheDocument();
      }, { timeout: 15000 });   test('should render sales analytics for /analytics/sales route', async () => {
      renderWithProviders(<SimplifiedRouter />, { route: '/analytics/sales' });

      await await waitFor(() => {
        expect(screen.getByTestId('inventory-analytics')).toBeInTheDocument();
      }, { timeout: 15000 });

    test('should render inventory analytics for /analytics/inventory route', async () => {
      renderWithProviders(<SimplifiedRouter />, { route: '/analytics/inventory' });

      await waitFor((await waitFor(() => {
        expect(screen.getByTestId('secure-vault')).toBeInTheDocument();
      }, { timeout: 15000 });;
  });

  describe('Security Routes', () => {
    test('should render secure vault for /locker/vault route', async () => {
      renderWithProviders(<Simplawait waitFor(() => {
        expect(screen.getByTestId('access-control')).toBeInTheDocument();
      }, { timeout: 15000 });tId('secure-vault')).toBeInTheDocument();
      });
    });

    test('should render access control for /locker/access route', async () => {
      renderWithProviders(<SimplifiedRouterawait waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      }, { timeout: 15000 });ess-control')).toBeInTheDocument();
      });
    });
  });

  describe('User Routes', () => {
    test('should render user profile for /profile route', async () => {
      renderWithProviders(<SimplifiedRouter />await waitFor(() => {
        expect(screen.getByTestId('license-management')).toBeInTheDocument();
      }, { timeout: 15000 });BeInTheDocument();
      });
    });
  });

  describe('License Routes', () => {
    test('should render license management for /license-manageawait waitFor(() => {
        expect(screen.getByTestId('license-status')).toBeInTheDocument();
      }, { timeout: 15000 });});

      await waitFor(() => {
        expect(screen.getByTestId('license-management')).toBeInTheDocument();
      });
    });

    test('should render license status for /license route', asyawait waitFor(() => {
        expect(screen.getByTestId('bug-bounty')).toBeInTheDocument();
      }, { timeout: 15000 });For(() => {
        expect(screen.getByTestId('license-status')).toBeInTheDocument();
      });
    });
  });

  describe('Developmenawait waitFor(() => {
        expect(screen.getByTestId('voting')).toBeInTheDocument();
      }, { timeout: 15000 }); renderWithProviders(<SimplifiedRouter />, { route: '/bug-bounty' });

      await waitFor(() => {
        expect(screen.getByTestId('bug-bounty')).toBeInTheDocument();
      });
    });

    test('should render voting for /voting route', async () => {
      renderWithProviders(<SimplifiedRouter />, { route: '/voting' });

      await waitFor(() => {
await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      }, { timeout: 15000 }); describe('Error Handling', () => {
    test('should handle component loading errors gracefully', async () => {
      // Mock a component that throws an error
      jest.doMock('../../pages/Dashboard', () => {
        throw new Error('Component loading error');
      });

      renderWithProviders(<Simplawait waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      }, { timeout: 15000 });ext(/error/i)).toBeInTheDocument();
      });
    });

    test('should show loading state while components are loading', async () => {
      renderWithProviders(<SimplifiedRouter />, { route: '/dashboard' });

      // Shouawait waitFor(() => {
        expect(screen.getByTestId('cms-pages')).toBeInTheDocument();
      }, { timeout: 15000 }); Should eventually show the component
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    test('should lazy load components efficiently', async () => {
      const startTime = performance.now();

      renderWithProviders(<SimplifiedRouter />, { route: '/cms-pages' });

      await waitFor(() => {
        expect(screen.getByTestId('cms-pages')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(1000);
    });
  });
});
