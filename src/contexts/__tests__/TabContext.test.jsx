import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TabProvider, useTab } from '../TabContext.jsx';
import { PermissionProvider } from '../PermissionContext.jsx';
import { AuthProvider } from '../AuthContext.jsx';

// Mock the menu items
jest.mock('../components/Layout/MenuTree.js', () => ({
  MENU_ITEMS: [
    {
      id: 'Dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      permissions: []
    },
    {
      id: 'ProductsGrid',
      label: 'Products',
      path: '/products',
      permissions: ['products:view']
    }
  ]
}));

// Mock components
jest.mock('../pages/Dashboard.jsx', () => {
  return function Dashboard() {
    return <div data-testid="dashboard">Dashboard Component</div>;
  };
});

jest.mock('../components/grids/magento/ProductsGrid.jsx', () => {
  return function ProductsGrid() {
    return <div data-testid="products-grid">Products Grid Component</div>;
  };
});

// Test component that uses TabContext
function TestComponent() {
  const { tabs, activeTab, openTab, closeTab, canOpenTab } = useTab();
  
  return (
    <div>
      <div data-testid="active-tab">{activeTab}</div>
      <div data-testid="tab-count">{tabs.length}</div>
      <button 
        data-testid="open-products" 
        onClick={() => openTab('ProductsGrid')}
      >
        Open Products
      </button>
      <button 
        data-testid="close-products" 
        onClick={() => closeTab('ProductsGrid')}
      >
        Close Products
      </button>
      <div data-testid="can-open-products">
        {canOpenTab('ProductsGrid') ? 'yes' : 'no'}
      </div>
    </div>
  );
}

// Wrapper component with all providers
function TestWrapper({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PermissionProvider>
          <TabProvider>
            {children}
          </TabProvider>
        </PermissionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('TabContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should initialize with Dashboard tab', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-tab')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('tab-count')).toHaveTextContent('1');
    });
  });

  test('should open new tab when openTab is called', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-tab')).toHaveTextContent('Dashboard');
    });

    fireEvent.click(screen.getByTestId('open-products'));

    await waitFor(() => {
      expect(screen.getByTestId('active-tab')).toHaveTextContent('ProductsGrid');
      expect(screen.getByTestId('tab-count')).toHaveTextContent('2');
    });
  });

  test('should close tab when closeTab is called', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // First open products tab
    fireEvent.click(screen.getByTestId('open-products'));

    await waitFor(() => {
      expect(screen.getByTestId('tab-count')).toHaveTextContent('2');
    });

    // Then close it
    fireEvent.click(screen.getByTestId('close-products'));

    await waitFor(() => {
      expect(screen.getByTestId('tab-count')).toHaveTextContent('1');
      expect(screen.getByTestId('active-tab')).toHaveTextContent('Dashboard');
    });
  });

  test('should not allow closing Dashboard tab', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-tab')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('tab-count')).toHaveTextContent('1');
    });

    // Try to close Dashboard - should not work
    const { closeTab } = useTab();
    const result = closeTab('Dashboard');
    
    expect(result).toBe(false);
    expect(screen.getByTestId('tab-count')).toHaveTextContent('1');
  });

  test('should persist tab state to localStorage', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('open-products'));

    await waitFor(() => {
      expect(screen.getByTestId('tab-count')).toHaveTextContent('2');
    });

    // Check if state was persisted
    const savedState = localStorage.getItem('techno-etl-tab-state');
    expect(savedState).toBeTruthy();
    
    const parsedState = JSON.parse(savedState);
    expect(parsedState.tabs).toHaveLength(2);
    expect(parsedState.activeTab).toBe('ProductsGrid');
  });
});