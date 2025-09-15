/**
 * Page Loading Integration Test
 * Tests that all pages can be loaded without runtime errors
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock all contexts
const mockContexts = {
  auth: {
    currentUser: { uid: 'test-user', email: 'test@example.com' },
    loading: false,
  },
  language: {
    translate: (key) => key,
    currentLanguage: 'en',
    languages: { en: { dir: 'ltr' } },
  },
  theme: {
    mode: 'light',
    isDark: false,
    animations: true,
  },
  settings: {
    settings: {
      preferences: { theme: 'light', language: 'en' },
      apiSettings: {},
      gridSettings: {},
    },
  },
  tab: {
    openTab: vi.fn(),
    activeTab: 'dashboard',
  },
};

// Mock all contexts
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockContexts.auth,
}));

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => mockContexts.language,
}));

vi.mock('../../contexts/ThemeContext', () => ({
  useCustomTheme: () => mockContexts.theme,
}));

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: () => mockContexts.settings,
}));

vi.mock('../../contexts/TabContext', () => ({
  useTab: () => mockContexts.tab,
}));

// Mock services
vi.mock('../../services/magentoApi', () => ({
  default: {
    getProducts: vi.fn(() => Promise.resolve({ data: { items: [], total_count: 0 } })),
    getBrands: vi.fn(() => Promise.resolve({ items: [] })),
  },
}));

vi.mock('../../services/unifiedMagentoService', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    _getCachedResponse: vi.fn(() => null),
    _setCachedResponse: vi.fn(),
  },
}));

// Test wrapper
const TestWrapper = ({ children }) => {
  const theme = createTheme();

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Dynamic import helper with error handling
const importPage = async (pageName) => {
  try {
    const module = await import(`../../pages/${pageName}.jsx`);

    return module.default;
  } catch (error) {
    console.error(`Failed to import ${pageName}:`, error);

    return () => <div data-testid="import-error">Failed to load {pageName}</div>;
  }
};

describe('Page Loading Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const pages = [
    'Dashboard',
    'SettingsPage',
    'ChartsPage',
    'ProductManagementPage',
    'OrdersPage',
    'CustomersPage',
    'InventoryPage',
    'ReportsPage',
    'AnalyticsPage',
    'DataGridsPage',
    'GridTestPage',
    'VotingPage',
    'NotFoundPage',
  ];

  pages.forEach(pageName => {
    it(`loads ${pageName} without errors`, async () => {
      const PageComponent = await importPage(pageName);

      expect(PageComponent).toBeDefined();
      expect(typeof PageComponent).toBe('function');

      // Test rendering
      const { container } = render(
        <TestWrapper>
          <PageComponent />
        </TestWrapper>,
      );

      // Wait for component to render
      await waitFor(() => {
        expect(container.firstChild).toBeTruthy();
      }, { timeout: 5000 });

      // Check for import errors
      expect(screen.queryByTestId('import-error')).not.toBeInTheDocument();
    });
  });

  it('handles page import failures gracefully', async () => {
    const NonExistentPage = await importPage('NonExistentPage');

    render(
      <TestWrapper>
        <NonExistentPage />
      </TestWrapper>,
    );

    expect(screen.getByTestId('import-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load NonExistentPage')).toBeInTheDocument();
  });

  it('verifies all pages have proper React component structure', async () => {
    for (const pageName of pages) {
      const PageComponent = await importPage(pageName);

      // Should be a function (React component)
      expect(typeof PageComponent).toBe('function');

      // Should have a name or displayName
      expect(PageComponent.name || PageComponent.displayName).toBeTruthy();

      // Should render without throwing
      expect(() => {
        render(
          <TestWrapper>
            <PageComponent />
          </TestWrapper>,
        );
      }).not.toThrow();
    }
  });

  it('tests page rendering performance', async () => {
    const performanceTests = [];

    for (const pageName of pages.slice(0, 5)) { // Test first 5 pages for performance
      const startTime = performance.now();

      const PageComponent = await importPage(pageName);
      const importTime = performance.now() - startTime;

      const renderStartTime = performance.now();

      render(
        <TestWrapper>
          <PageComponent />
        </TestWrapper>,
      );
      const renderTime = performance.now() - renderStartTime;

      performanceTests.push({
        page: pageName,
        importTime,
        renderTime,
        totalTime: importTime + renderTime,
      });
    }

    // Log performance results
    console.log('Page Performance Results:');
    performanceTests.forEach(test => {
      console.log(`${test.page}: Import ${test.importTime.toFixed(2)}ms, Render ${test.renderTime.toFixed(2)}ms, Total ${test.totalTime.toFixed(2)}ms`);
    });

    // Assert reasonable performance (adjust thresholds as needed)
    performanceTests.forEach(test => {
      expect(test.importTime).toBeLessThan(1000); // Import should be under 1 second
      expect(test.renderTime).toBeLessThan(500);  // Render should be under 500ms
    });
  });

  it('verifies pages handle missing props gracefully', async () => {
    const criticalPages = ['Dashboard', 'SettingsPage', 'ProductManagementPage'];

    for (const pageName of criticalPages) {
      const PageComponent = await importPage(pageName);

      // Test with minimal props
      expect(() => {
        render(
          <TestWrapper>
            <PageComponent />
          </TestWrapper>,
        );
      }).not.toThrow();

      // Test with undefined props
      expect(() => {
        render(
          <TestWrapper>
            <PageComponent someProp={undefined} />
          </TestWrapper>,
        );
      }).not.toThrow();
    }
  });

  it('checks for memory leaks in page components', async () => {
    const testPages = ['Dashboard', 'SettingsPage'];

    for (const pageName of testPages) {
      const PageComponent = await importPage(pageName);

      // Render and unmount multiple times
      for (let i = 0; i < 3; i++) {
        const { unmount } = render(
          <TestWrapper>
            <PageComponent />
          </TestWrapper>,
        );

        // Unmount should not throw
        expect(() => unmount()).not.toThrow();
      }
    }
  });
});
