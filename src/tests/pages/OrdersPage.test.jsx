/**
 * Orders Page Tests
 * 
 * Comprehensive tests for the Orders page
 * Tests order management, status updates, and workflows
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import OrdersPage from '../../pages/OrdersPage';

// Mock dependencies
vi.mock('../../services/magentoApi', () => ({
  default: {
    getOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
    getOrderDetails: vi.fn(),
    createInvoice: vi.fn(),
    createShipment: vi.fn(),
    cancelOrder: vi.fn(),
    syncOrders: vi.fn()
  }
}));

vi.mock('../../components/grids/magento/OrdersGrid', () => ({
  default: vi.fn(() => <div data-testid="orders-grid">Orders Grid</div>)
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

const renderOrdersPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <OrdersPage {...props} />
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Mock data
const mockOrders = [
  {
    id: 1,
    increment_id: 'ORD-001',
    status: 'processing',
    state: 'processing',
    customer_email: 'customer1@example.com',
    customer_firstname: 'John',
    customer_lastname: 'Doe',
    created_at: '2025-01-01T10:00:00Z',
    grand_total: 299.99,
    currency_code: 'USD',
    items_count: 3
  },
  {
    id: 2,
    increment_id: 'ORD-002',
    status: 'complete',
    state: 'complete',
    customer_email: 'customer2@example.com',
    customer_firstname: 'Jane',
    customer_lastname: 'Smith',
    created_at: '2025-01-02T10:00:00Z',
    grand_total: 199.99,
    currency_code: 'USD',
    items_count: 2
  }
];

const mockOrderDetails = {
  id: 1,
  increment_id: 'ORD-001',
  items: [
    { name: 'Product A', qty: 2, price: 99.99 },
    { name: 'Product B', qty: 1, price: 100.00 }
  ],
  billing_address: {
    firstname: 'John',
    lastname: 'Doe',
    street: ['123 Main St'],
    city: 'New York',
    postcode: '10001',
    country_id: 'US'
  },
  shipping_address: {
    firstname: 'John',
    lastname: 'Doe',
    street: ['123 Main St'],
    city: 'New York',
    postcode: '10001',
    country_id: 'US'
  }
};

// ============================================================================
// ORDERS PAGE TESTS
// ============================================================================

describe('Orders Page', () => {
  let mockMagentoApi;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockMagentoApi = require('../../services/magentoApi').default;
    
    // Setup default mock responses
    mockMagentoApi.getOrders.mockResolvedValue({
      data: { items: mockOrders, total_count: mockOrders.length }
    });
    mockMagentoApi.getOrderDetails.mockResolvedValue(mockOrderDetails);
    mockMagentoApi.updateOrderStatus.mockResolvedValue({ success: true });
    mockMagentoApi.createInvoice.mockResolvedValue({ id: 123 });
    mockMagentoApi.createShipment.mockResolvedValue({ id: 456 });
    mockMagentoApi.cancelOrder.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders orders page without crashing', () => {
      renderOrdersPage();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('displays page title and description', () => {
      renderOrdersPage();
      expect(screen.getByText(/order management/i)).toBeInTheDocument();
      expect(screen.getByText(/manage orders/i)).toBeInTheDocument();
    });

    it('renders orders grid', () => {
      renderOrdersPage();
      expect(screen.getByTestId('orders-grid')).toBeInTheDocument();
    });

    it('renders toolbar with action buttons', () => {
      renderOrdersPage();
      expect(screen.getByLabelText(/refresh/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/export/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sync/i)).toBeInTheDocument();
    });

    it('renders status filter tabs', () => {
      renderOrdersPage();
      expect(screen.getByText(/all orders/i)).toBeInTheDocument();
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
      expect(screen.getByText(/complete/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DATA LOADING TESTS
  // ============================================================================

  describe('Data Loading', () => {
    it('loads orders on page mount', async () => {
      renderOrdersPage();
      
      await waitFor(() => {
        expect(mockMagentoApi.getOrders).toHaveBeenCalledTimes(1);
      });
    });

    it('displays loading state while fetching data', () => {
      mockMagentoApi.getOrders.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderOrdersPage();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles data loading errors gracefully', async () => {
      const error = new Error('Failed to load orders');
      mockMagentoApi.getOrders.mockRejectedValue(error);
      
      renderOrdersPage();
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      });
    });

    it('refreshes data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      // Wait for initial load
      await waitFor(() => {
        expect(mockMagentoApi.getOrders).toHaveBeenCalledTimes(1);
      });
      
      // Click refresh
      const refreshButton = screen.getByLabelText(/refresh/i);
      await user.click(refreshButton);
      
      await waitFor(() => {
        expect(mockMagentoApi.getOrders).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ============================================================================
  // STATUS FILTERING TESTS
  // ============================================================================

  describe('Status Filtering', () => {
    it('filters orders by status when tab is clicked', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      // Click processing tab
      const processingTab = screen.getByText(/processing/i);
      await user.click(processingTab);
      
      await waitFor(() => {
        expect(mockMagentoApi.getOrders).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              status: 'processing'
            })
          })
        );
      });
    });

    it('shows all orders when all tab is clicked', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      // First click a status filter
      const processingTab = screen.getByText(/processing/i);
      await user.click(processingTab);
      
      // Then click all orders
      const allTab = screen.getByText(/all orders/i);
      await user.click(allTab);
      
      await waitFor(() => {
        expect(mockMagentoApi.getOrders).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: {}
          })
        );
      });
    });

    it('updates tab badge counts based on data', async () => {
      renderOrdersPage();
      
      await waitFor(() => {
        // Should show count badges for each status
        expect(screen.getByText(/processing/i)).toBeInTheDocument();
        expect(screen.getByText(/complete/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // ORDER OPERATIONS TESTS
  // ============================================================================

  describe('Order Operations', () => {
    describe('View Order Details', () => {
      it('opens order details dialog', async () => {
        const user = userEvent.setup();
        renderOrdersPage();
        
        // Wait for orders to load
        await waitFor(() => {
          expect(screen.getByTestId('orders-grid')).toBeInTheDocument();
        });
        
        // Click view details
        const viewButton = screen.getByLabelText(/view details/i);
        await user.click(viewButton);
        
        await waitFor(() => {
          expect(mockMagentoApi.getOrderDetails).toHaveBeenCalledWith(1);
          expect(screen.getByText(/order details/i)).toBeInTheDocument();
          expect(screen.getByText('ORD-001')).toBeInTheDocument();
        });
      });

      it('displays order items in details', async () => {
        const user = userEvent.setup();
        renderOrdersPage();
        
        const viewButton = screen.getByLabelText(/view details/i);
        await user.click(viewButton);
        
        await waitFor(() => {
          expect(screen.getByText('Product A')).toBeInTheDocument();
          expect(screen.getByText('Product B')).toBeInTheDocument();
        });
      });

      it('displays billing and shipping addresses', async () => {
        const user = userEvent.setup();
        renderOrdersPage();
        
        const viewButton = screen.getByLabelText(/view details/i);
        await user.click(viewButton);
        
        await waitFor(() => {
          expect(screen.getByText(/billing address/i)).toBeInTheDocument();
          expect(screen.getByText(/shipping address/i)).toBeInTheDocument();
          expect(screen.getByText('123 Main St')).toBeInTheDocument();
        });
      });
    });

    describe('Update Order Status', () => {
      it('updates order status', async () => {
        const user = userEvent.setup();
        renderOrdersPage();
        
        // Select order
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });
        await user.click(checkbox);
        
        // Update status
        const statusButton = screen.getByLabelText(/update status/i);
        await user.click(statusButton);
        await user.click(screen.getByText('Complete'));
        
        await waitFor(() => {
          expect(mockMagentoApi.updateOrderStatus).toHaveBeenCalledWith(1, 'complete');
        });
      });

      it('shows confirmation dialog for status updates', async () => {
        const user = userEvent.setup();
        renderOrdersPage();
        
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });
        await user.click(checkbox);
        
        const statusButton = screen.getByLabelText(/update status/i);
        await user.click(statusButton);
        await user.click(screen.getByText('Cancelled'));
        
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });

    describe('Invoice Operations', () => {
      it('creates invoice for order', async () => {
        const user = userEvent.setup();
        renderOrdersPage();
        
        // Select order
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });
        await user.click(checkbox);
        
        // Create invoice
        const invoiceButton = screen.getByLabelText(/create invoice/i);
        await user.click(invoiceButton);
        
        await waitFor(() => {
          expect(mockMagentoApi.createInvoice).toHaveBeenCalledWith(1);
        });
      });

      it('shows invoice creation progress', async () => {
        const user = userEvent.setup();
        mockMagentoApi.createInvoice.mockImplementation(() => new Promise(() => {})); // Never resolves
        
        renderOrdersPage();
        
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });
        await user.click(checkbox);
        
        const invoiceButton = screen.getByLabelText(/create invoice/i);
        await user.click(invoiceButton);
        
        expect(screen.getByText(/creating invoice/i)).toBeInTheDocument();
      });
    });

    describe('Shipment Operations', () => {
      it('creates shipment for order', async () => {
        const user = userEvent.setup();
        renderOrdersPage();
        
        // Select order
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });
        await user.click(checkbox);
        
        // Create shipment
        const shipmentButton = screen.getByLabelText(/create shipment/i);
        await user.click(shipmentButton);
        
        await waitFor(() => {
          expect(mockMagentoApi.createShipment).toHaveBeenCalledWith(1);
        });
      });

      it('allows tracking number input for shipment', async () => {
        const user = userEvent.setup();
        renderOrdersPage();
        
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });
        await user.click(checkbox);
        
        const shipmentButton = screen.getByLabelText(/create shipment/i);
        await user.click(shipmentButton);
        
        // Should show tracking number input
        expect(screen.getByLabelText(/tracking number/i)).toBeInTheDocument();
        
        await user.type(screen.getByLabelText(/tracking number/i), 'TRK123456');
        
        const createButton = screen.getByText(/create shipment/i);
        await user.click(createButton);
        
        await waitFor(() => {
          expect(mockMagentoApi.createShipment).toHaveBeenCalledWith(1, {
            trackingNumber: 'TRK123456'
          });
        });
      });
    });
  });

  // ============================================================================
  // BULK OPERATIONS TESTS
  // ============================================================================

  describe('Bulk Operations', () => {
    it('enables bulk actions when orders are selected', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      // Select multiple orders
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      
      // Bulk actions should be enabled
      expect(screen.getByText(/bulk operations/i)).toBeInTheDocument();
      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    });

    it('performs bulk status update', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      // Select orders
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
      await user.click(selectAllCheckbox);
      
      // Bulk status update
      const bulkStatusButton = screen.getByText(/update status/i);
      await user.click(bulkStatusButton);
      await user.click(screen.getByText('Processing'));
      
      await waitFor(() => {
        expect(mockMagentoApi.updateOrderStatus).toHaveBeenCalledTimes(mockOrders.length);
      });
    });

    it('performs bulk invoice creation', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      // Select orders
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      await user.click(checkboxes[0]);
      
      // Bulk invoice creation
      const bulkInvoiceButton = screen.getByText(/create invoices/i);
      await user.click(bulkInvoiceButton);
      
      await waitFor(() => {
        expect(mockMagentoApi.createInvoice).toHaveBeenCalledWith(1);
      });
    });
  });

  // ============================================================================
  // SEARCH AND FILTERING TESTS
  // ============================================================================

  describe('Search and Filtering', () => {
    it('searches orders by order number', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      const searchInput = screen.getByPlaceholderText(/search orders/i);
      await user.type(searchInput, 'ORD-001');
      
      await waitFor(() => {
        expect(mockMagentoApi.getOrders).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'ORD-001'
          })
        );
      }, { timeout: 1000 }); // Debounced search
    });

    it('searches orders by customer email', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      const searchInput = screen.getByPlaceholderText(/search orders/i);
      await user.type(searchInput, 'customer1@example.com');
      
      await waitFor(() => {
        expect(mockMagentoApi.getOrders).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'customer1@example.com'
          })
        );
      }, { timeout: 1000 });
    });

    it('filters orders by date range', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      const dateFilter = screen.getByLabelText(/date range/i);
      await user.click(dateFilter);
      await user.click(screen.getByText(/last 7 days/i));
      
      expect(mockMagentoApi.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            created_at: expect.any(Object)
          })
        })
      );
    });

    it('filters orders by amount range', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      const amountFilter = screen.getByLabelText(/amount range/i);
      await user.click(amountFilter);
      
      const minAmount = screen.getByLabelText(/minimum amount/i);
      const maxAmount = screen.getByLabelText(/maximum amount/i);
      
      await user.type(minAmount, '100');
      await user.type(maxAmount, '500');
      
      const applyButton = screen.getByText(/apply/i);
      await user.click(applyButton);
      
      expect(mockMagentoApi.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            grand_total: {
              from: 100,
              to: 500
            }
          })
        })
      );
    });
  });

  // ============================================================================
  // EXPORT TESTS
  // ============================================================================

  describe('Export', () => {
    it('exports orders to CSV', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      const exportButton = screen.getByLabelText(/export/i);
      await user.click(exportButton);
      await user.click(screen.getByText(/csv/i));
      
      // Should trigger download
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });

    it('exports orders to Excel', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      const exportButton = screen.getByLabelText(/export/i);
      await user.click(exportButton);
      await user.click(screen.getByText(/excel/i));
      
      // Should trigger download
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });

    it('exports selected orders only', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      // Select specific orders
      const checkbox = screen.getByRole('checkbox', { name: /select row/i });
      await user.click(checkbox);
      
      const exportButton = screen.getByLabelText(/export/i);
      await user.click(exportButton);
      await user.click(screen.getByText(/export selected/i));
      
      // Should export only selected orders
      expect(screen.getByText(/exporting selected/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('handles order status update errors', async () => {
      const user = userEvent.setup();
      const error = new Error('Status update failed');
      mockMagentoApi.updateOrderStatus.mockRejectedValue(error);
      
      renderOrdersPage();
      
      const checkbox = screen.getByRole('checkbox', { name: /select row/i });
      await user.click(checkbox);
      
      const statusButton = screen.getByLabelText(/update status/i);
      await user.click(statusButton);
      await user.click(screen.getByText('Complete'));
      
      await waitFor(() => {
        expect(screen.getByText(/status update failed/i)).toBeInTheDocument();
      });
    });

    it('handles invoice creation errors', async () => {
      const user = userEvent.setup();
      const error = new Error('Invoice creation failed');
      mockMagentoApi.createInvoice.mockRejectedValue(error);
      
      renderOrdersPage();
      
      const checkbox = screen.getByRole('checkbox', { name: /select row/i });
      await user.click(checkbox);
      
      const invoiceButton = screen.getByLabelText(/create invoice/i);
      await user.click(invoiceButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invoice creation failed/i)).toBeInTheDocument();
      });
    });

    it('shows network error messages', async () => {
      const networkError = new Error('Network Error');
      mockMagentoApi.getOrders.mockRejectedValue(networkError);
      
      renderOrdersPage();
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // SYNC OPERATIONS TESTS
  // ============================================================================

  describe('Sync Operations', () => {
    it('syncs orders with external system', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      const syncButton = screen.getByLabelText(/sync/i);
      await user.click(syncButton);
      
      await waitFor(() => {
        expect(mockMagentoApi.syncOrders).toHaveBeenCalled();
      });
    });

    it('shows sync progress', async () => {
      const user = userEvent.setup();
      mockMagentoApi.syncOrders.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderOrdersPage();
      
      const syncButton = screen.getByLabelText(/sync/i);
      await user.click(syncButton);
      
      expect(screen.getByText(/syncing orders/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderOrdersPage();
      
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-labelledby');
      
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-controls');
      });
    });

    it('supports keyboard navigation for tabs', async () => {
      const user = userEvent.setup();
      renderOrdersPage();
      
      const allTab = screen.getByText(/all orders/i);
      const processingTab = screen.getByText(/processing/i);
      
      // Focus on first tab
      allTab.focus();
      expect(allTab).toHaveFocus();
      
      // Navigate with keyboard
      await user.keyboard('{ArrowRight}');
      expect(processingTab).toHaveFocus();
    });

    it('announces status changes to screen readers', async () => {
      renderOrdersPage();
      
      await waitFor(() => {
        const statusRegion = screen.getByRole('status');
        expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      });
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
      
      renderOrdersPage();
      
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
      
      renderOrdersPage();
      
      expect(screen.getByLabelText(/more actions/i)).toBeInTheDocument();
    });

    it('stacks status tabs vertically on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderOrdersPage();
      
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('vertical-tabs');
    });
  });
});