/**
 * Test Configuration and Setup
 * 
 * Centralized test configuration for Vitest and React Testing Library
 * Includes global mocks, utilities, and setup functions
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';

// ============================================================================
// TESTING LIBRARY CONFIGURATION
// ============================================================================

configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: true
});

// ============================================================================
// GLOBAL MOCKS
// ============================================================================

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    // Mock implementation
  }
  
  unobserve() {
    // Mock implementation
  }
  
  disconnect() {
    // Mock implementation
  }
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  
  observe() {
    // Mock implementation
  }
  
  unobserve() {
    // Mock implementation
  }
  
  disconnect() {
    // Mock implementation
  }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(callback => {
  setTimeout(callback, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// ============================================================================
// MOCK MODULES
// ============================================================================

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn()
  },
  ToastContainer: ({ children }) => children
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => {
      const React = require('react');
      return React.createElement('div', props, children);
    }),
    span: vi.fn(({ children, ...props }) => {
      const React = require('react');
      return React.createElement('span', props, children);
    }),
    button: vi.fn(({ children, ...props }) => {
      const React = require('react');
      return React.createElement('button', props, children);
    })
  },
  AnimatePresence: vi.fn(({ children }) => children),
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  })
}));

// Mock react-error-boundary
vi.mock('react-error-boundary', () => ({
  ErrorBoundary: vi.fn(({ children, fallback: FallbackComponent, onError }) => {
    try {
      return children;
    } catch (error) {
      onError?.(error, { componentStack: 'Mock component stack' });
      const React = require('react');
      return FallbackComponent ? 
        React.createElement(FallbackComponent, { error: error, resetErrorBoundary: () => {} }) : 
        React.createElement('div', null, 'Something went wrong');
    }
  }),
  withErrorBoundary: (Component, errorBoundaryProps) => {
    return (props) => {
      const React = require('react');
      const ErrorBoundary = require('react-error-boundary').ErrorBoundary;
      return React.createElement(ErrorBoundary, errorBoundaryProps,
        React.createElement(Component, props)
      );
    };
  }
}));

// Mock @mui/x-data-grid
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: vi.fn(({ children, ...props }) => {
    const React = require('react');
    
    const rows = props.rows?.map(row => 
      React.createElement('div', { key: row.id, role: 'row' },
        props.columns?.map(col => 
          React.createElement('div', { key: col.field, role: 'gridcell' }, row[col.field])
        )
      )
    ) || [];
    
    const loadingElement = props.loading ? 
      React.createElement('div', { role: 'progressbar' }, 'Loading...') : null;
      
    const noRowsElement = (!props.rows || props.rows.length === 0) && !props.loading ?
      React.createElement('div', null, 'No rows') : null;
    
    return React.createElement('div', { 
      role: 'grid', 
      'data-testid': 'data-grid',
      ...props 
    }, ...rows, loadingElement, noRowsElement);
  }),
  GridToolbar: vi.fn(() => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'grid-toolbar' }, 'Grid Toolbar');
  })
}));

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Create mock API service
 */
export const createMockApiService = () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn()
});

/**
 * Create mock grid data
 */
export const createMockGridData = (count = 10) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    status: index % 2 === 0 ? 'active' : 'inactive',
    sku: `SKU${(index + 1).toString().padStart(3, '0')}`,
    price: Math.round(Math.random() * 1000) / 100,
    createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
  }));
};

/**
 * Create mock columns
 */
export const createMockColumns = () => [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'sku', headerName: 'SKU', width: 150 },
  { field: 'price', headerName: 'Price', width: 100, type: 'number' },
  { field: 'createdAt', headerName: 'Created', width: 180, type: 'dateTime' }
];

/**
 * Create mock event handlers
 */
export const createMockHandlers = () => ({
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onRefresh: vi.fn(),
  onSearch: vi.fn(),
  onSelectionChange: vi.fn(),
  onError: vi.fn(),
  onExport: vi.fn(),
  onImport: vi.fn(),
  onSync: vi.fn()
});

/**
 * Simulate user interaction delay
 */
export const waitForUser = (ms = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Create test theme
 */
export const createTestTheme = () => {
  const { createTheme } = require('@mui/material/styles');
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2'
      },
      secondary: {
        main: '#dc004e'
      }
    }
  });
};

/**
 * Test wrapper with theme and providers
 */
export const TestWrapper = ({ children, theme }) => {
  const React = require('react');
  const { ThemeProvider } = require('@mui/material/styles');
  const testTheme = theme || createTestTheme();
  
  return React.createElement(ThemeProvider, { theme: testTheme }, children);
};

/**
 * Async test wrapper for Suspense testing
 */
export const AsyncTestWrapper = ({ children, fallback }) => {
  const React = require('react');
  const { Suspense } = require('react');
  
  if (!fallback) {
    fallback = React.createElement('div', null, 'Loading...');
  }
  
  return React.createElement(TestWrapper, null,
    React.createElement(Suspense, { fallback: fallback }, children)
  );
};

/**
 * Mock component that throws error for error boundary testing
 */
export const ThrowError = ({ message = 'Test error' }) => {
  throw new Error(message);
};

/**
 * Mock component that suspends for Suspense testing
 */
export const SuspendingComponent = ({ delay = 100, result = 'Loaded!' }) => {
  const React = require('react');
  const [data, setData] = React.useState(null);
  
  if (!data) {
    throw new Promise(resolve => {
      setTimeout(() => {
        setData(result);
        resolve(result);
      }, delay);
    });
  }
  
  return React.createElement('div', null, data);
};

/**
 * Custom render function with default providers
 */
export const renderWithProviders = (ui, options = {}) => {
  const React = require('react');
  const { render } = require('@testing-library/react');
  const { theme, ...renderOptions } = options;
  
  const Wrapper = ({ children }) => {
    return React.createElement(TestWrapper, { theme: theme }, children);
  };
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// ============================================================================
// PERFORMANCE TESTING UTILITIES
// ============================================================================

/**
 * Measure component render time
 */
export const measureRenderTime = async (renderFn) => {
  const start = performance.now();
  const result = await renderFn();
  const end = performance.now();
  
  return {
    time: end - start,
    result
  };
};

/**
 * Test component with large dataset
 */
export const testWithLargeDataset = (size = 1000) => {
  return createMockGridData(size);
};

// ============================================================================
// ACCESSIBILITY TESTING UTILITIES
// ============================================================================

/**
 * Check if element has proper ARIA attributes
 */
export const checkAriaAttributes = (element, expectedAttributes = []) => {
  expectedAttributes.forEach(attr => {
    expect(element).toHaveAttribute(attr);
  });
};

/**
 * Test keyboard navigation
 */
export const testKeyboardNavigation = async (user, elements) => {
  for (let i = 0; i < elements.length; i++) {
    await user.tab();
    expect(elements[i]).toHaveFocus();
  }
};

// ============================================================================
// CLEANUP
// ============================================================================

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reset fetch
  global.fetch.mockClear();
});

afterEach(() => {
  // Additional cleanup after each test
  vi.clearAllTimers();
});

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export {
  createMockApiService,
  createMockGridData,
  createMockColumns,
  createMockHandlers,
  waitForUser,
  createTestTheme,
  TestWrapper,
  AsyncTestWrapper,
  ThrowError,
  SuspendingComponent,
  renderWithProviders,
  measureRenderTime,
  testWithLargeDataset,
  checkAriaAttributes,
  testKeyboardNavigation
};