/**
 * Integration Tests - Complete System Validation
 *
 * End-to-end integration tests for the entire frontend system
 * Tests port configuration, component integration, and modern React patterns
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import axios from 'axios';

// Test utilities
import {
  TestWrapper,
  AsyncTestWrapper,
  createMockApiService,
  createMockGridData,
  createMockColumns,
  createMockHandlers,
  ThrowError,
  SuspendingComponent,
} from '../setup';

// Components under test
import BaseGrid from '../../components/base/BaseGrid';
import BaseToolbar from '../../components/base/BaseToolbar';
import BaseDialog from '../../components/base/BaseDialog';
import BaseCard from '../../components/base/BaseCard';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { EnhancedSuspense } from '../../components/common/SuspenseWrapper';

// Modern React hooks
import {
  useDeferredSearch,
  useTransitionState,
  useUniqueIds,
  useErrorHandler,
} from '../../hooks/useModernReact';

// Configuration
import {
  getGridConfig,
  getToolbarConfig,
  createGridConfiguration,
} from '../../components/base/config';

// Mock axios for API testing
vi.mock('axios');
const mockedAxios = axios;

// ============================================================================
// SYSTEM INTEGRATION TESTS
// ============================================================================

describe('System Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful API responses
    mockedAxios.get.mockResolvedValue({
      data: { items: createMockGridData(10) },
    });
  });

  test('complete grid system integration', async () => {
    const user = userEvent.setup();
    const mockHandlers = createMockHandlers();
    const mockData = createMockGridData(10);
    const mockColumns = createMockColumns();

    render(
      <TestWrapper>
        <BaseGrid
          gridName="integration-test-grid"
          columns={mockColumns}
          data={mockData}
          enableSuspense={true}
          enableErrorBoundary={true}
          enableSearch={true}
          enableStats={true}
          enableActions={true}
          toolbarConfig={{
            showRefresh: true,
            showAdd: true,
            showEdit: true,
            showDelete: true,
            showSearch: true,
          }}
          onAdd={mockHandlers.onAdd}
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onRefresh={mockHandlers.onRefresh}
          onSearch={mockHandlers.onSearch}
          onSelectionChange={mockHandlers.onSelectionChange}
        />
      </TestWrapper>,
    );

    // 1. Verify grid renders with data
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();

    // 2. Test stats cards
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Total count

    // 3. Test toolbar functionality
    const refreshButton = screen.getByLabelText('Refresh');

    await user.click(refreshButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockHandlers.onRefresh).toHaveBeenCalled();

    // 4. Test search functionality
    const searchInput = screen.getByRole('textbox');

    await user.type(searchInput, 'Item 1');

    await waitFor(() => {
      expect(mockHandlers.onSearch).toHaveBeenCalledWith('Item 1');
    }, { timeout:await user.click(checkboxes[1]);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); selection
    const checkboxes = screen.getAllByRole('checkbox');

 await user.click(addButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));es[1]); // First row checkbox

    expect(mockHandlers.onSelectionChange).toHaveBeenCalled();

    // 6. Test add button
    const addButton = screen.getByLabelText('Add');

    await user.click(addButton);
    expect(mockHandlers.onAdd).toHaveBeenCalled();
  });

  test('API service integration with error handling', async () => {
    const mockApiService = createMockApiService();
    const mockData = createMockGridData(5);

    // Mock successful response
    mockApiService.get.mockResolvedValue({
      data: { items: mockData },
    });

    render(
      <TestWrapper>
        <BaseGrid
          gridName="api-test-grid"
          columns={createMockColumns()}
          apiService={mockApiService}
          apiEndpoint="/test-endpoint"
          enableErrorBoundary={true}
        />
      </TestWrapper>,
    );

    // Verify API call was made
    await waitFor(() => {
      expect(mockApiService.get).toHaveBeenCalledWith('/test-endpoint', {
        params: {},
      });
    });

    // Verify data is displayed
    expect(screen.getByText('Item 1')).toBeInTheDocument();

    // Test error handling
    const error = new Error('Network error');

    mockApiService.get.mockRejectedValue(error);

    // Trigger refresh to cause error
    const refreshButton = screen.getByLabelText('Refresh');

    await userEvent.setup().click(refawait waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    }, { timeout: 15000 });Document();
    });
  });

  test('React 18 Suspense integration', async () => {
    render(
      <AsyncTestWrapper>
        <EnhancedSuspense
          fallback={<div>Loading component...</div>}
          delay={100}
        >
          <SuspendingComponent delay={200} result="Suspense works!" />
        </EnhancedSuspense>
      </AsyncTestWrapper>,
    );

    // Should show loading initially
    expect(screen.getByText('Loading component...')).toBeInTheDocument();

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Suspense works!')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('Error Boundary integration', () => {
    const onError = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <ErrorBoundary onError={onError}>
          <ThrowError message="Integration test error" />
        </ErrorBoundary>
      </TestWrapper>,
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

// ============================================================================
// CONFIGURATION SYSTEM TESTS
// ============================================================================

describe('Configuration System Integration', () => {
  test('grid type configurations work correctly', () => {
    // Test Magento products configuration
    const magentoConfig = getGridConfig('magentoProducts');

    expect(magentoConfig.toolbar.showAdd).toBe(true);
    expect(magentoConfig.toolbar.showSync).toBe(true);
    expect(magentoConfig.enableStats).toBe(true);

    // Test MDM configuration
    const mdmConfig = getGridConfig('mdm');

    expect(mdmConfig.toolbar.showSyncStocks).toBe(true);
    expect(mdmConfig.defaultPageSize).toBe(50);

    // Test default configuration
    const defaultConfig = getGridConfig('unknown-type');

    expect(defaultConfig.enableStats).toBe(false);
  });

  test('configuration merging works correctly', () => {
    const config = createGridConfiguration('magentoProducts', 'crud', {
      enableVirtualization: false,
      toolbarConfig: {
        showImport: false,
      },
    });

    expect(config.enableVirtualization).toBe(false);
    expect(config.toolbarConfig.showAdd).toBe(true); // From type config
    expect(config.toolbarConfig.showImport).toBe(false); // From override
  });
});

// ============================================================================
// MODERN REACT PATTERNS TESTS
// ============================================================================

describe('Modern React Patterns Integration', () => {
  test('useId hook generates unique IDs', () => {
    const TestComponent = () => {
      const ids = useUniqueIds(3, 'test-');

      return (
        <div>
          {ids.map(id => (
            <div key={id} data-testid={id}>
              {id}
            </div>
          ))}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Should have unique IDs
    const elements = screen.getAllByTestId(/test-/);

    expect(elements).toHaveLength(3);

    const ids = elements.map(el => el.getAttribute('data-testid'));
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(3); // All IDs should be unique
  });

  test('useTransition for non-blocking updates', async () => {
    const TestComponent = () => {
      const [count, setCount, isPending] = useTransitionState(0);

      return (
        <div>
          <div data-testid="count">{count}</div>
          <div data-testid="pending">{isPending ? 'pending' : 'idle'}</div>
          <button onClick={() => setCount(c => c + 1)}>
            Increment
          </button>
        </div>
      );
    };

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    const button = screen.getByText('Increment');
    const countDisplay = screen.getByTestId('count');

    expect(countDisplay).toHaveTextContent('0');await waitFor(() => {
      expect(countDisplay).toHaveTextContent('1');
    }, { timeout: 15000 });isplay).toHaveTextContent('1');
    });
  });

  test('useDeferredValue for search optimization', async () => {
    const TestComponent = () => {
      const {
        query,
        deferredQuery,
        updateQuery,
        isPending,
      } = useDeferredSearch('', vi.fn(), 300);

      return (
        <div>
          <input
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            data-testid="search-input"
          />
          <div data-testid="query">{query}</div>
          <div data-testid="deferred-query">{deferredQuery}</div>
          <div data-testid="pending">{isPending ? 'pending' : 'idle'}</div>
        </div>
      );
    };

   await user.type(input, 'test');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));;

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    const input = screen.getByTestId('search-input');
    const queryDisplay = screen.getByTestId('query');
    const deferredQueryDisplay = screen.getByTestId('deferred-query');

    await user.type(input, 'test');

    // Query should update immediately
    expect(queryDisplay).toHaveTextContent('test');

    // Deferred query should update after delay
    await waitFor(() => {
      expect(deferredQueryDisplay).toHaveTextContent('test');
    }, { timeout: 1000 });
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance Integration Tests', () => {
  test('handles large datasets efficiently', async () => {
    const largeDataset = createMockGridData(1000);
    const startTime = performance.now();

    render(
      <TestWrapper>
        <BaseGrid
          gridName="performance-test-grid"
          columns={createMockColumns()}
          data={largeDataset}
          enableVirtualization={true}
        />
      </TestWrapper>,
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within reasonable time (less than 1 second)
    expect(renderTime).toBeLessThan(1000);

    // Grid should be present
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  test('search performance with large datasets', async () => {
    const largeDataset = createMockGridData(1000);
    coawait user.type(searchInput, 'Item 100');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));er(
      <TestWrapper>
        <BaseGrid
          gridName="search-performance-grid"
          columns={createMockColumns()}
          data={largeDataset}
          enableSearch={true}
          searchFields={['name', 'sku']}
        />
      </TestWrapper>,
    );

    const searchInput = screen.getByRole('textbox');
    const startTime = performance.now();

    await user.type(searchInput, 'Item 100');

    const endTime = performance.now();
    const searchTime = endTime - startTime;

    // Search should be fast (less than 500ms)
    expect(searchTime).toBawait waitFor(() => {
      expect(screen.getByText('Item 100')).toBeInTheDocument();
    }, { timeout: 15000 });(screen.getByText('Item 100')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// ACCESSIBILITY INTEGRATION TESTS
// ============================================================================

describe('Accessibility Integration Tests', () => {
  test('complete accessibility compliance', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseGrid
          gridName="accessibility-test-grid"
          columns={createMockColumns()}
          data={createMockGridData(5)}
          enableSearch={true}
          enableActions={true}
          toolbarConfig={{
            showRefresh: true,
            showAdd: true,
          }}
        />
      </TestWrapper>,
    );

    // 1. Grid has proper ARIA attributes
    const grid = screen.getByRole('grid');

    expect(grid).toHaveAttribute('aria-labelledby');
    expect(grid).toHaveAttribute('aria-describedby');

    // 2. Toolbar is accessible
    consawait user.tab();
    // Add small delay to prevent act warnings
  await user.tab();
    // Add small delay to prevent act warningawait user.tab();
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTawait user.type(searchInput, 'test{enter}');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));meout(resolve, 50));se(resolve => setTimeout(resolve, 50));n.getByRole('toolbar');

    expect(toolbar).toBeInTheDocument();

    // 3. Search input has proper labels
    const searchInput = screen.getByRole('textbox');

    expect(searchInput).toHaveAttribute('aria-label');

    // 4. Buttons have proper labels
    const refreshButton = screen.getByLabelText('Refresh');
    const addButton = screen.getByLabelText('Add');

    expect(refreshButton).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();

    // 5. Keyboard navigation works
    await user.tab();
    expect(refreshButton).toHaveFocus();

    await user.tab();
    expect(addButton).toHaveFocus();

    await user.tab();
    expect(searchInput).toHaveFocus();

    // 6. Enter key triggers search
    await user.type(searchInput, 'test{enter}');
    // Should not throw errors
  });
});

// ============================================================================
// PORT CONFIGURATION TESTS
// ============================================================================

describe('Port Configuration Integration', () => {
  test('environment configuration is loaded correctly', () => {
    // Mock environment variables
    const originalEnv = process.env;

    process.env = {
      ...originalEnv,
      VITE_PORT: '80',
      VITE_API_BASE_URL: 'http://localhost:5000',
    };

    // Test that configuration values are accessible
    expect(process.env.VITE_PORT).toBe('80');
    expect(process.env.VITE_API_BASE_URL).toBe('http://localhost:5000');

    // Restore original environment
    process.env = originalEnv;
  });

  test('API calls use correct base URL', async () => {
    const mockApiService = createMockApiService();

    mockApiService.get.mockResolvedValue({
      data: { items: [] },
    });

    render(
      <TestWrapper>
        <BaseGrid
          gridName="api-url-test-grid"
          columns={createMockColumns()}
          apiService={mockApiService}
          apiEndpoint="/test"
          apiParams={{ port: 5000 }}
        />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(mockApiService.get).toHaveBeenCalledWith('/test', {
        params: { port: 5000 },
      });
    });
  });
});

// ============================================================================
// END-TO-END WORKFLOW TESTS
// ============================================================================

describe('End-to-End Workflow Tests', () => {
  test('complete CRUD workflow', async () => {
    const user = userEvent.setup();
    const mockHandlers = createMockHandlers();
    const mockData = createMockGridData(3);

    // Mock dialog component for add/edit operations
    const MockDialog = ({ type, open, onClose, onSubmit }) => {
      if (!open) return null;

      return (
        <div data-testid={`${type}-dialog`}>
          <h2>{type === 'add' ? 'Add Item' : 'Edit Item'}</h2>
          <button
            onClick={() => {
              onSubmit({ name: 'New Item', sku: 'NEW001' }, type);
              onClose();
            }}
          >
            Save
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      );
    };

    const TestGrid = () => {
      const [dialogState, setDialogState] = React.useState({
        add: false,
        edit: false,
        delete: false,
      });

      return (
        <>
          <BaseGrid
            gridName="crud-workflow-grid"
            columns={createMockColumns()}
            data={mockData}
            enableActions={true}
            toolbarConfig={{
              showAdd: true,
              showEdit: true,
              showDelete: true,
            }}
            onAawait user.click(addButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));v => ({ ...prev, add: await user.click(saveButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));={() => setDialogState(prev => ({ ...prev, edit: true }))}
            onDelete={() => setDialogState(prev => ({ ...prev, delete: true }))await user.click(checkboxes[1]);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));={mockHandlers.onSelectionChange}
         await user.click(editButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));
            type="add"
            open={dialogState.add}
            onClose={() => setDialogState(prev => ({ ...prev, add: false }))}
            onSubmit={mockHandlers.onAdd}
          />

          <MockDialog
            type="edit"
            open={dialogState.edit}
            onClose={() => setDialogState(prev => ({ ...prev, edit: false }))}
            onSubmit={mockHandlers.onEdit}
          />
        </>
      );
    };

    render(
      <TestWrapper>
        <TestGrid />
      </TestWrapper>,
    );

    // 1. Test Add workflow
    const addButton = screen.getByLabelText('Add');

    await user.click(addButton);

    expect(screen.getByTestId('add-dialog')).toBeInTheDocument();

    const saveButton = screen.getByText('Save');

    await user.click(saveButton);

    expect(mockHandlers.onAdd).toHaveBeenCalledWith(
      { name: 'New Item', sku: 'NEW001' },
      'add',
    );

    // 2. Test Edit workflow
    // First select a row
    const checkboxes = screen.getAllByRole('checkbox');

    await user.click(checkboxes[1]); // Select first row

    expect(mockHandlers.onSelectionChange).toHaveBeenCalled();

    const editButton = screen.getByLabelText('Edit');

    await user.click(editButton);

    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();

    // 3. Test workflow completion
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});
