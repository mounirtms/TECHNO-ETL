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
    syncCustomers: vi.fn()
  }
}));

vi.mock('../../components/grids/magento/CustomersGrid', () => ({
  default: vi.fn(() => <div data-testid="customers-grid">Customers Grid</div>)
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// Test utilities
const theme = createTheme();

const renderCustomersPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CustomersPage {...props} />
      </ThemeProvider>
    </BrowserRouter>
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
    is_active: true
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    firstname: 'Jane',
    lastname: 'Smith',
    group_id: 2,
    created_at: '2025-01-02T10:00:00Z',
    is_active: true
  }
];

const mockCustomerGroups = [
  { id: 1, code: 'general', name: 'General' },
  { id: 2, code: 'wholesale', name: 'Wholesale' },
  { id: 3, code: 'retailer', name: 'Retailer' }
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
      data: { items: mockCustomers, total_count: mockCustomers.length }
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
      });
    });

    it('displays loading state while fetching data', () => {
      mockMagentoApi.getCustomers.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderCustomersPage();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles data loading errors gracefully', async () => {
      const error = new Error('Failed to load customers');
      mockMagentoApi.getCustomers.mockRejectedValue(error);
      
      renderCustomersPage();
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      });
    });

    it('refreshes data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      renderCustomersPage();
      
      // Wait for initial load
      await waitFor(() => {
        expect(mockMagentoApi.getCustomers).toHaveBeenCalledTimes(1);
      });
      
      // Click refresh
      const refreshButton = screen.getByLabelText(/refresh/i);
      await user.click(refreshButton);
      
      await waitFor(() => {
        expect(mockMagentoApi.getCustomers).toHaveBeenCalledTimes(2);
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
        
        expect(screen.getByText(/add new customer/i)).toBeInTheDocument();
      });

      it('creates new customer with valid data', async () => {
        const user = userEvent.setup();
        renderCustomersPage();
        
        // Open add dialog
        const addButton = screen.getByLabelText(/add customer/i);
        await user.click(addButton);
        
        // Fill form
        await user.type(screen.getByLabelText(/email/i), 'new@example.com');
        await user.type(screen.getByLabelText(/first name/i), 'New');
        await user.type(screen.getByLabelText(/last name/i), 'Customer');
        
        // Submit form
        const submitButton = screen.getByText(/save/i);
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(mockMagentoApi.createCustomer).toHaveBeenCalledWith({
            email: 'new@example.com',
            firstname: 'New',
            lastname: 'Customer'
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
        const submitButton = screen.getByText(/save/i);
        await user.click(submitButton);
        
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });

    describe('Update Customer', () => {
      it('opens edit dialog with customer data', async () => {
        const user = userEvent.setup();
        renderCustomersPage();
        
        // Wait for customers to load
        await waitFor(() => {
          expect(screen.getByTestId('customers-grid')).toBeInTheDocument();
        });
        
        // Select customer and edit
        const editButton = screen.getByLabelText(/edit/i);
        await user.click(editButton);
        
        expect(screen.getByText(/edit customer/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      });

      it('updates customer with changes', async () => {
        const user = userEvent.setup();
        renderCustomersPage();
        
        // Open edit dialog
        const editButton = screen.getByLabelText(/edit/i);
        await user.click(editButton);
        
        // Modify customer email
        const emailField = screen.getByDisplayValue('john.doe@example.com');
        await user.clear(emailField);
        await user.type(emailField, 'updated@example.com');
        
        // Submit changes
        const submitButton = screen.getByText(/save/i);
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(mockMagentoApi.updateCustomer).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
              email: 'updated@example.com'
            })
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
        await user.click(checkbox);
        
        // Click delete
        const deleteButton = screen.getByLabelText(/delete/i);
        await user.click(deleteButton);
        
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      it('deletes selected customers', async () => {
        const user = userEvent.setup();
        renderCustomersPage();
        
        // Select customer
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });
        await user.click(checkbox);
        
        // Delete
        const deleteButton = screen.getByLabelText(/delete/i);
        await user.click(deleteButton);
        
        // Confirm deletion
        const confirmButton = screen.getByText(/delete/i);
        await user.click(confirmButton);
        
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
    it('filters customers by group', async () => {
      const user = userEvent.setup();
      renderCustomersPage();
      
      // Wait for customer groups to load
      await waitFor(() => {
        expect(screen.getByLabelText(/customer group/i)).toBeInTheDocument();
      });
      
      // Select group filter
      const groupFilter = screen.getByLabelText(/customer group/i);
      await user.click(groupFilter);
      await user.click(screen.getByText('Wholesale'));
      
      // Should filter customers
      expect(mockMagentoApi.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            group_id: 2
          })
        })
      );
    });

    it('filters customers by status', async () => {
      const user = userEvent.setup();
      renderCustomersPage();
      
      const statusFilter = screen.getByLabelText(/status/i);
      await user.click(statusFilter);
      await user.click(screen.getByText('Active'));
      
      expect(mockMagentoApi.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            is_active: true
          })
        })
      );
    });

    it('searches customers by email', async () => {
      const user = userEvent.setup();
      renderCustomersPage();
      
      const searchInput = screen.getByPlaceholderText(/search customers/i);
      await user.type(searchInput, 'john.doe');
      
      await waitFor(() => {
        expect(mockMagentoApi.getCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'john.doe'
          })
        );
      }, { timeout: 1000 }); // Debounced search
    });

    it('searches customers by name', async () => {
      const user = userEvent.setup();
      renderCustomersPage();
      
      const searchInput = screen.getByPlaceholderText(/search customers/i);
      await user.type(searchInput, 'John Doe');
      
      await waitFor(() => {
        expect(mockMagentoApi.getCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'John Doe'
          })
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
          filters: {}
        })
      );
    });
  });

  // ============================================================================
  // BULK OPERATIONS TESTS
  // ============================================================================

  describe('Bulk Operations', () => {
    it('enables bulk actions when customers are selected', async () => {
      const user = userEvent.setup();
      renderCustomersPage();
      
      // Select multiple customers
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      
      // Bulk actions should be enabled
      expect(screen.getByText(/bulk operations/i)).toBeInTheDocument();
      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    });

    it('performs bulk delete operation', async () => {
      const user = userEvent.setup();
      renderCustomersPage();
      
      // Select customers
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
      await user.click(selectAllCheckbox);
      
      // Bulk delete
      const bulkDeleteButton = screen.getByText(/delete selected/i);
      await user.click(bulkDeleteButton);
      
      // Confirm
      const confirmButton = screen.getByText(/delete/i);
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(mockMagentoApi.deleteCustomer).toHaveBeenCalledTimes(mockCustomers.length);
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
            group_id: 2
          })
        );
      });
    });
  });

  // ============================================================================
  // SYNC OPERATIONS TESTS
  // ============================================================================

  describe('Sync Operations', () => {
    it('syncs customers with external system', async () => {
      const user = userEvent.setup();
      renderCustomersPage();
      
      const syncButton = screen.getByLabelText(/sync/i);
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

    it('exports customers to Excel', async () => {
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
      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'Customer');
      
      const submitButton = screen.getByText(/save/i);
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });

    it('shows network error messages', async () => {
      const networkError = new Error('Network Error');
      mockMagentoApi.getCustomers.mockRejectedValue(networkError);
      
      renderCustomersPage();
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });
    });

    it('recovers from errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Start with error
      mockMagentoApi.getCustomers.mockRejectedValue(new Error('Server Error'));
      
      renderCustomersPage();
      
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
      
      // Fix the API and retry
      mockMagentoApi.getCustomers.mockResolvedValue({
        data: { items: mockCustomers, total_count: mockCustomers.length }
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