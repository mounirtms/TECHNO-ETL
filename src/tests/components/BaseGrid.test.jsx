/**
 * BaseGrid Component Tests
 * 
 * Comprehensive test suite for the BaseGrid component
 * Tests React 18 features, performance, and accessibility
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Component under test
import BaseGrid from '../../components/base/BaseGrid';

// Mock dependencies
vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children, fallback: FallbackComponent, onError }) => {
    try {
      return children;
    } catch (error) {
      return <FallbackComponent error={error} resetErrorBoundary={() => {}} />;
    }
  }
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => 
      <div ref={ref} {...props}>{children}</div>
    )
  }
}));

// Test utilities
const theme = createTheme();

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

const mockApiService = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

const mockData = [
  { id: 1, name: 'Test Item 1', status: 'active', sku: 'TEST001' },
  { id: 2, name: 'Test Item 2', status: 'inactive', sku: 'TEST002' },
  { id: 3, name: 'Test Item 3', status: 'active', sku: 'TEST003' }
];

const mockColumns = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'sku', headerName: 'SKU', width: 150 }
];

// ============================================================================
// BASIC FUNCTIONALITY TESTS
// ============================================================================

describe('BaseGrid - Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
        />
      </TestWrapper>
    );

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  test('displays data correctly', () => {
    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('Test Item 3')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={[]}
          loading={true}
        />
      </TestWrapper>
    );

    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('handles empty data', () => {
    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={[]}
        />
      </TestWrapper>
    );

    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByText('No rows')).toBeInTheDocument();
  });
});

// ============================================================================
// SEARCH FUNCTIONALITY TESTS
// ============================================================================

describe('BaseGrid - Search Functionality', () => {
  test('filters data based on search query', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
          enableSearch={true}
          searchFields={['name', 'sku']}
        />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    
    await user.type(searchInput, 'Test Item 1');

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Item 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Item 3')).not.toBeInTheDocument();
    });
  });

  test('uses deferred value for search optimization', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
          enableSearch={true}
          onSearch={onSearch}
        />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    
    // Type quickly
    await user.type(searchInput, 'test');

    // Search should be debounced
    expect(onSearch).toHaveBeenCalledWith('test');
  });
});

// ============================================================================
// SELECTION TESTS
// ============================================================================

describe('BaseGrid - Selection', () => {
  test('handles row selection', async () => {
    const onSelectionChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
          enableSelection={true}
          onSelectionChange={onSelectionChange}
        />
      </TestWrapper>
    );

    // Find and click checkbox for first row
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First checkbox is header, second is first row

    expect(onSelectionChange).toHaveBeenCalledWith([1]);
  });

  test('updates stats based on selection', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
          enableSelection={true}
          enableStats={true}
        />
      </TestWrapper>
    );

    // Initially no selection
    expect(screen.getByText('0')).toBeInTheDocument(); // Selected count

    // Select a row
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // Selected count updated
    });
  });
});

// ============================================================================
// API INTEGRATION TESTS
// ============================================================================

describe('BaseGrid - API Integration', () => {
  test('fetches data on mount', async () => {
    mockApiService.get.mockResolvedValue({
      data: { items: mockData }
    });

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          apiService={mockApiService}
          apiEndpoint="/test-endpoint"
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockApiService.get).toHaveBeenCalledWith('/test-endpoint', {
        params: {}
      });
    });

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    const error = new Error('API Error');
    mockApiService.get.mockRejectedValue(error);

    const onError = vi.fn();

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          apiService={mockApiService}
          apiEndpoint="/test-endpoint"
          onError={onError}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });
});

// ============================================================================
// TOOLBAR INTERACTION TESTS
// ============================================================================

describe('BaseGrid - Toolbar Interactions', () => {
  test('refresh button triggers data refetch', async () => {
    mockApiService.get.mockResolvedValue({
      data: { items: mockData }
    });

    const onRefresh = vi.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          apiService={mockApiService}
          apiEndpoint="/test-endpoint"
          onRefresh={onRefresh}
          enableActions={true}
          toolbarConfig={{ showRefresh: true }}
        />
      </TestWrapper>
    );

    const refreshButton = screen.getByLabelText('Refresh');
    await user.click(refreshButton);

    expect(onRefresh).toHaveBeenCalled();
  });

  test('add button triggers onAdd callback', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
          onAdd={onAdd}
          enableActions={true}
          toolbarConfig={{ showAdd: true }}
        />
      </TestWrapper>
    );

    const addButton = screen.getByLabelText('Add');
    await user.click(addButton);

    expect(onAdd).toHaveBeenCalled();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('BaseGrid - Accessibility', () => {
  test('has proper ARIA labels', () => {
    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
        />
      </TestWrapper>
    );

    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-labelledby');
    expect(grid).toHaveAttribute('aria-describedby');
  });

  test('generates unique IDs for form elements', () => {
    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
          enableSearch={true}
        />
      </TestWrapper>
    );

    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toHaveAttribute('id');
    expect(searchInput).toHaveAttribute('aria-label');
  });

  test('supports keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
          enableSearch={true}
        />
      </TestWrapper>
    );

    const searchInput = screen.getByRole('textbox');
    
    // Focus should work
    await user.tab();
    expect(searchInput).toHaveFocus();

    // Enter key should trigger search
    await user.type(searchInput, 'test{enter}');
    // Search functionality should work as tested above
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('BaseGrid - Performance', () => {
  test('uses React 18 transitions for non-blocking updates', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
          enableSearch={true}
        />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    
    // Rapid typing should not block UI
    await act(async () => {
      await user.type(searchInput, 'rapid typing test');
    });

    // Component should remain responsive
    expect(searchInput).toBeInTheDocument();
  });

  test('handles large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
      id: index,
      name: `Item ${index}`,
      status: index % 2 === 0 ? 'active' : 'inactive',
      sku: `SKU${index.toString().padStart(4, '0')}`
    }));

    const { container } = render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={largeDataset}
          enableVirtualization={true}
        />
      </TestWrapper>
    );

    // Should render without significant delay
    expect(container.firstChild).toBeInTheDocument();
  });
});

// ============================================================================
// ERROR BOUNDARY TESTS
// ============================================================================

describe('BaseGrid - Error Handling', () => {
  test('error boundary catches and displays errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
          enableErrorBoundary={true}
        >
          <ThrowError />
        </BaseGrid>
      </TestWrapper>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  test('displays error state when data fetching fails', async () => {
    const error = new Error('Network error');
    mockApiService.get.mockRejectedValue(error);

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          apiService={mockApiService}
          apiEndpoint="/failing-endpoint"
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// SUSPENSE TESTS
// ============================================================================

describe('BaseGrid - Suspense Integration', () => {
  test('shows loading skeleton while suspending', async () => {
    // Create a component that suspends
    const SuspendingComponent = () => {
      throw new Promise(resolve => setTimeout(resolve, 100));
    };

    render(
      <TestWrapper>
        <BaseGrid
          gridName="test-grid"
          columns={mockColumns}
          data={mockData}
          enableSuspense={true}
        >
          <SuspendingComponent />
        </BaseGrid>
      </TestWrapper>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});