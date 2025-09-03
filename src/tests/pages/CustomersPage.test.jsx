/**
 * Customers Page Tests
 *
 * Comprehensive tests for the Customers page
 * Tests customer management, filtering, and CRUD operations
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CustomersPage from '../../pages/CustomersPage';

// Mock dependencies
vi.mock('../../services/magentoApi', () => ({
  default: {
    getCustomers: vi.fn(),
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
    getCustomerGroups: vi.fn(),
    syncCustomers: vi.fn(),
  },
}));

vi.mock('../../components/grids/magento/CustomersGrid', () => ({
  default: vi.fn(() => <div data-testid="customers-grid">Customers Grid</div>),
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

const renderCustomersPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CustomersPage {...props} />
      </ThemeProvider>
    </BrowserRouter>,
  );
};

// Mock data
const mockCustomers = [
  {
    id: 1,
    email: 'john.doe@example.com',
    firstname: 'John',
    lastname: 'Doe',
    group_id: 1,
    created_at: '2025-01-01T10:00:00Z',
    is_active: true,
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    firstname: 'Jane',
    lastname: 'Smith',
    group_id: 2,
    created_at: '2025-01-02T10:00:00Z',
    is_active: true,
  },
];

const mockCustomerGroups = [
  { id: 1, code: 'general', name: 'General' },
  { id: 2, code: 'wholesale', name: 'Wholesale' },
  { id: 3, code: 'retailer', name: 'Retailer' },
];

// ============================================================================
// CUSTOMERS PAGE TESTS
// ============================================================================

describe('Customers Page', () => {
  let mockMagentoApi;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMagentoApi = require('../../services/magentoApi').default;

    // Setup default mock responses
    mockMagentoApi.getCustomers.mockResolvedValue({
      data: { items: mockCustomers, total_count: mockCustomers.length },
    });
    mockMagentoApi.getCustomerGroups.mockResolvedValue(mockCustomerGroups);
    mockMagentoApi.createCustomer.mockResolvedValue({ id: 3, email: 'new@example.com' });
    mockMagentoApi.updateCustomer.mockResolvedValue({ id: 1, email: 'updated@example.com' });
    mockMagentoApi.deleteCustomer.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders customers page without crashing', () => {
      renderCustomersPage();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('displays page title and description', () => {
      renderCustomersPage();
      expect(screen.getByText(/customer management/i)).toBeInTheDocument();
      expect(screen.getByText(/manage customers/i)).toBeInTheDocument();
    });

    it('renders customers grid', () => {
      renderCustomersPage();
      expect(screen.getByTestId('customers-grid')).toBeInTheDocument();
    });

    it('renders toolbar with action buttons', () => {
      renderCustomersPage();
      expect(screen.getByLabelText(/add customer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/refresh/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/export/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DATA LOADING TESTS
  // ============================================================================

  describe('Data Loading', () => {
    it('loads customers on page mount', async () => {
      renderCustomersPage();

      await waitFor(() => {
        expect(mockMagentoApi.getCustomers).toHaveBeenCalledTimes(1);
        expect(mockMagentoApi.getCustomerGroups).toHaveBeenCalledTimes(1);
      }, { timeout: 15000 });
    });

    it('displays loading state while fetching data', () => {
      mockMagentoApi.getCustomers.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderCustomersPage();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles data loading errors gracefully', async () => {
      const error = new Error('Failed to load customers');

      mockMagentoApi.getCustomers.mockRejectedValue(error);

      renderCustomawait waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      }, { timeout: 15000 });cument();
      });
    });

    it('refreshes data when refresh button is clicked', async () => {
      const user = userEvent.setup();

      renderCustomersPage();
await waitFor(() => {
        expect(mockMagentoApi.getCustomers).toHaveBeenCalledTimes(1);
      }, { timeout: 15000 });rs).toHaveBeenCalledTimes(1);
      });

      // Click refresh
      const refreshButton = screen.getByLabelText(/reawait waitFor(() => {
        expect(mockMagentoApi.getCustomers).toHaveBeenCalledTimes(2);
      }, { timeout: 15000 });agentoApi.getCustomers).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ============================================================================
  // CUSTOMER CRUD OPERATIONS
  // ============================================================================

  describe('Customer CRUD Operations', () => {
    describe('Create Customer', () => {
      it('opens add customer dialog', async () => {
        const user = userEvent.setup();

        renderCustomersPage();

        const addButton = screen.getByLabelText(/add customer/i);

        await user.click(addButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));

        expect(screen.getByText(/add new customer/i)).toBeInTheDocument();
      });

      it('creates new customer with valid data', async () => {
        const user = userEvent.setup();

        renderCustomersPage();
await user.click(addButton);
    // Add small delay to preventawait user.type(screen.getByLabelText(/email/i), 'new@example.com');
    // Adawait user.type(screen.getByLabelText(/first name/i), 'New');
    // Adawait user.type(screen.getByLabelText(/last name/i), 'Customer');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));ve => setTimeout(resolve, 50));esolve => setTimeout(resolve, 50));0));
        const addButton = screen.getByLabelText(/add customer/i);

        await user.click(addButton);

        // Fill form
        await user.type(screen.getByLabelText(/email/i), 'new@example.com');
        await user.type(screen.getByLabelText(/first name/i), 'New');
        await user.type(screen.getByLabelText(/last name/i), 'Customer');

        // Submit form
        const submitButton = await waitFor(() => {
          expect(mockawait user.click(addButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));oHaveBeenCalleawait user.click(submitButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));w@example.com',
            firstname: 'New',
            lastname: 'Customer',
          }, { timeout: 15000 });
            firstname: 'New',
            lastname: 'Customer',
          });
        });
      });

      it('validates required fields', async () => {
        const user = userEvent.setup();

        renderCustomersPage();

        // Open add dialog
        const addButton = screen.getByLabelText(/add customer/i);

        await user.click(addButton);

        // Try to submit without required fields
        cawait user.click(editButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));tByText(/save/i);

        await user.click(submitButton);

        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });

    describe('Update Customer', () => {
      it('opens eawait user.click(editButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));', async () => {
 await user.clear(emailField);
    // Adawait user.type(emailField, 'updated@example.com');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); Promise(resolve => setTimeout(resolve, 50));aitFor(() => {
          expect(screen.getByTestId('customers-grid')).toBeInTheDocument();
        }, { timeout: 15000 });or(() => {
          expect(screen.getByTestId('customers-grid')).toBeInTheDocument();
        });

        // Select customer and edit
        const editButton = screen.getByLabelText(/edit/i);

        await user.click(editButton);

        expect(screen.getByText(/edit customer/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      });

    await user.click(checkbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 5await user.click(deleteButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));       const user = userEvent.setup();

        renderCustomersPage();

        // Open edit dialog
        const editButton = screen.getByLabelText(/edit/i);

        await user.click(editButton);

        // Modify customeawait user.click(checkbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resoawait user.click(deleteButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));DisplayValue('john.doe@example.com');

        await user.clear(emailField);
        await user.type(emailField, 'updated@example.com');

        // Submit changes
        const submitButton = screen.getByText(/save/i);

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockMagentoApi.updateCustomer).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
              email: 'updated@example.com',
            }),
          );
        });
      });
    });

    describe('Delete Customer', () => {
      it('opens delete confirmation dialog', async () => {
        const user = userEvent.setup();

        renderCustomersPage();

        // Select customer
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });

        await user.click(checkboxawait user.click(groupFilter);
    // await user.click(screen.getByText('Wholesale'));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));t new Promise(resolve => setTimeout(resolve, 50));
        const deleteButton = screen.getByLabelText(/delete/i);

        await user.click(deleteButton);

        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      it('deletes selected customers', async () => {
        const user = userEvent.setup();

       await user.click(statusFilter);
    // await user.click(screen.getByText('Active'));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));wait new Promise(resolve => setTimeout(resolve, 50));    // Select customer
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });

        await user.click(checkbox);

        // Delete
        const deleteButton = screen.getByLabelText(/delete/i);

        await user.click(deleteButton);

        // Confirm delawait waitFor(() => {
          expect(mockMagentoApi.deleteCustomer).toHaveBeenCalledWith(1);
        }, { timeout: 15000 });

        await waitFor(() => {
          expect(mockMagentoApi.deleteCustomer).toHaveBeenCalledWith(1);
        });
      });
    });
  });

  // ============================================================================
  // FILTERING AND SEARCH TESTS
  // ============================================================================

  describe('Filtering and Search', () => {
    it('filters customers by grouawait waitFor(() => {
        expect(screen.getByLabelText(/customer group/i)).toBeInTheDocument();
      }, { timeout: 15000 });stomer groups to load
      await waitFor(() => {
        expect(screen.getByLabelText(/customer group/i)).toBeInTheDocument();
      });

      // Select group filter
      const groupFilter = screen.getByLabelText(/customer group/i);

      await user.click(groupFilter);
      await user.click(screeawait user.click(groupFilter);
    // await user.click(screen.getByText('Wholesale'));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolvawait user.click(clearButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));=> setTimeout(resolve, 50));      // Should filter customers
      expect(mockMagentoApi.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            group_id: 2,
          }),
        }),
      );
    });

    it('filters customers by status', async () => {
      const user = userEvent.setup();

      renderCustomersPage();

      const statusFilter = screen.getByLabelText(/status/i);

      await user.click(statusFilter);
      await user.click(screen.getByText('Active'));

      await user.click(checkboxes[0]);
    // await user.click(checkboxes[1]);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));arnings
    await new Promise(resolve => setTimeout(resolve, 50));rs).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            is_active: true,
          }),
        }),
      );
    });

    it('searches customers by email', async () => {
      const user = userEvent.setup(await user.click(selectAllCheckbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));
      const searchInput = screen.getByPlaceholderText(/search customers/i);

      await user.type(searchInput, 'john.doe');

      await waitFor(() => {
        expect(mockMagentoApi.getCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'john.doe',
          }),
        );
      }, { timeout: 1000 }); // Debounced search
    });

    it('searches customers by name', async () => {
      const user = userEvent.setup();

      renderCustomersPage();

      const searchInput = screen.getByPlaceholderText(/sawait user.click(checkboxes[0]);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50))await user.click(bulkGroupButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));e');

      await waitFor(() => {
        expect(mockMagentoApi.getCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'John Doe',
          }),
        );
      }, { timeout: 1000 });
    });

    it('clears all filters', async () => {
      const user = userEvent.setup();

      renderCustomersPage();

      // Apply some filters first
      const groupFilter = screen.getByLabelText(/customer group/i);

      await user.click(groupFilter);
      await user.click(screen.getByText('Wholesale'));

      // Clear filters
      const clearButton = screen.getByText(/clear filters/i);

      await user.click(clearButton);

      expect(mockMagentoApi.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: {},
        }),
      );
    });
  });

  // ============================================================================
  // BULK OPERATIONS TESTS
  // ============================================================================

  describe('Bulk Operations'await user.click(syncButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));lk actions when customers are selected', async () => {
      const user = userEvent.setup();

      renderCustomersPage();

      // Select multiple customers
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });

      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      // Bulk actions should be enabled
      expect(screen.getByTeawait user.click(exportButton);
    // await user.click(screen.getByText(/csv/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); await new Promise(resolve => setTimeout(resolve, 50));heDocument();
      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    });

    it('performs bulk delete operation', async () => {await user.click(exportButton);
    // await user.click(screen.getByText(/excel/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));wait new Promise(resolve => setTimeout(resolve, 50));setup();

      renderCustomersPage();

      // Select customers
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });

      await user.click(selectAllCheckbox);

      // Bulk delete
      const bulkDeleteButton = screen.getByText(/delete selected/i);

      awaiawait waitFor(() => {
        expect(mockMagentoApi.deleteCustomer).toHaveBeenCalledTimes(mockCustomers.length);
      }, { timeout: 15000 });user.click(confirmButton);

      await waitFor(() => {
        expect(mockMagentoApi.deleteCustomawait user.click(addButton);
    // Adawait user.type(screen.getByLabelText(/email/i), 'duplicate@example.com');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));Timeout(resolve, 50));ckCustomers.length);
      });
    });

    it('performs bulk group assignment', async () => {
      const user = userEvent.setup();

      renderCustomersPage();

      // Select customers
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });

      await user.click(checkboxes[0]);

      // Bulk group change
      const bulkGroupButton = screen.getByText(/assign group/i);

      await user.click(bulkGroupButton);
      await user.click(screen.getByText('Wholesale'));

      await waitFor(() => {
        expect(mockMagentoApi.updateCustomer).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            group_id: 2,
          }),
        );
      });
    });
  });

  // ============================================================================
  // SYNC OPERATIONS TESTS
  // ============================================================================

  describe('Sync Operations', () => {
    it('syncs customers with external system', async () =>await waitFor(() => {
        expect(mockMagentoApi.syncCustomers).toHaveBeenCalled();
      }, { timeout: 15000 }); = screen.getByLabelText(/sync/i);

      await user.click(syncButton);

      await waitFor(() => {
        expect(mockMagentoApi.syncCustomers).toHaveBeenCalled();
      });
    });

    it('shows sync progress', async () => {
      const user = userEvent.setup();

      mockMagentoApi.syncCustomers.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderCustomersPage();

      const syncButton = screen.getByLabelText(/sync/i);

      await user.click(syncButton);

      expect(screen.getByText(/syncing customers/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // EXPORT TESTS
  // ============================================================================

  describe('Export', () => {
    it('exports customers to CSV', async () => {
      const user = userEvent.setup();

      renderCustomersPage();

      const exportButton = screen.getByLabelText(/export/i);

      await user.click(exportButton);
      await user.click(screen.getByText(/csv/i));

      // Should trigger download
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });

  await user.keyboard('{Tab}');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));cel', async () => {
      const user = userEvent.setup();

      renderCustomersPage();

      const exportButton = screen.getByLabelText(/export/i);

      await user.click(exportButton);
      await user.click(screen.getByText(/excel/i));

      // Should trigger download
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('handles customer creation errors', async () => {
      const user = userEvent.setup();
      const error = new Error('Email already exists');

      mockMagentoApi.createCustomer.mockRejectedValue(error);

      renderCustomersPage();

      // Try to create customer
      const addButton = screen.getByLabelText(/add customer/i);

      await user.click(addButton);

      await user.type(screen.getByLabelText(/email/i), 'duplicate@example.com');
      await user.type(screen.getByLabelText(/firawait waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      }, { timeout: 15000 });mitButton = screen.getByText(/save/i);

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });
await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      }, { timeout: 15000 });kError);

      renderCustomersPage();

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });
    });

    itawait waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      }, { timeout: 15000 });rt with error
      mockMagentoApi.getCustomers.mockRejectedValue(new Error('Server Error'));

      renderCustomersPage();

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      // Fix the Aawait waitFor(() => {
        expect(screen.getByTestId('customers-grid')).toBeInTheDocument();
      }, { timeout: 15000 });total_count: mockCustomers.length },
      });

      const retryButton = screen.getByText(/retry/i);

      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('customers-grid')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderCustomersPage();

      const main = screen.getByRole('main');

      expect(main).toHaveAttribute('aria-labelledby');

      const grid = screen.getByTestId('customers-grid');

      expect(grid).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      renderCustomersPage();

      const addButton = screen.getByLabelText(/add customer/i);
      const refreshButton = screen.getByLabelText(/refresh/i);

      // Tab navigation should work
      addButton.focus();
      expect(addButton).toHaveFocus();

      await user.keyboard('{Tab}');
      expect(refreshButton).toHaveFocus();
    });
  });

  // ============================================================================
  // RESPONSIVE DESIGN TESTS
  // ============================================================================

  describe('Responsive Design', () => {
    it('adapts layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderCustomersPage();

      const container = screen.getByRole('main');

      expect(container).toHaveClass('mobile-layout');
    });

    it('shows collapsed toolbar on small screens', () => {
      // Mock small screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      renderCustomersPage();

      expect(screen.getByLabelText(/more actions/i)).toBeInTheDocument();
    });
  });
});
