/**
 * User Workflow Integration Tests
 *
 * Tests complete end-to-end user workflows
 * Validates cross-module integration and realistic user journeys
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock React Router
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

// Mock all API services
vi.mock('../../services/magentoApi', () => ({
  default: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    getOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
    getCustomers: vi.fn(),
    getInventory: vi.fn(),
    updateStock: vi.fn(),
  },
}));

vi.mock('../../services/analyticsApi', () => ({
  default: {
    getAnalyticsData: vi.fn(),
    getSalesData: vi.fn(),
    getCustomerData: vi.fn(),
  },
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Import components
import App from '../../App';

// Test utilities
const theme = createTheme();

const renderApp = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>,
  );
};

// Mock data
const mockProduct = {
  id: 1,
  name: 'Test Product',
  sku: 'TEST-001',
  price: 99.99,
  status: 'enabled',
};

const mockOrder = {
  id: 1,
  increment_id: 'ORD-001',
  status: 'processing',
  customer_email: 'test@example.com',
  grand_total: 199.99,
};

const mockCustomer = {
  id: 1,
  email: 'customer@example.com',
  firstname: 'John',
  lastname: 'Doe',
};

// ============================================================================
// PRODUCT MANAGEMENT WORKFLOW
// ============================================================================

describe('Product Management Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockMagentoApi = require('../../services/magentoApi').default;

    mockMagentoApi.getProducts.mockResolvedValue({
      data: { items: [mockProduct], total_count: 1 },
    });
    mockMagentoApi.createProduct.mockResolvedValue(mockProduct);
    mockMagentoApi.updateProduct.mockResolvedValue(mockProduct);
    mockMagentoApi.deleteProduct.mockResolvedValue({ success: true });
  });

  it('completes full product lifecycle', async () => {
    const user = userEvent.setup();

    renderApp();

    // Navigate to products page
    await user.click(screen.getByText(/products/i));

    await waitFor(() => {
      expect(screen.getByText(/product management/i)).toBeInTheDocument();
    }, { timeout: 15000 });

    // Create new product
    await user.click(screen.getByText(/add product/i));
    // await user.type(screen.getByLabelText(/name/i), 'New Product');
    /await user.type(screen.getByLabelText(/sku/i), 'NEW-001');
    /await user.type(screen.getByLabelText(/price/i), '149.99');
    // await user.click(screen.getByText(/save/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));await new Promise(resolve => setTimeout(resolve, 50));mise(resolve => setTimeout(resolve, 50));omise(resolvawait user.click(screen.getByLabelText(/edit/i));
    // Add small delay to prevent act warnings
    await new Promise(resoawait user.clear(nameField);
    /await user.type(nameField, 'Updated Product');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));await new Promise(resolve => setTimeout(resolve, 50));0));t(resolve, 50));

    await user.type(screen.getByLabelText(/name/i), 'New Product');
    await usawait user.click(screen.getByLabelText(/delete/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));
    await user.type(screen.getByLabelText(/price/i), '149.99');

    await user.click(screen.getByText(/save/i));

    // Verify prawait waitFor(() => {
      expect(require('../../services/magentoApi').default.createProduct).toHaveBeenCalled();
    },await user.click(screen.getByText(/products/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); // Edit product
    await user.click(selectAllCheckbox);
    // Add small delay to prevent await user.click(screen.getByText(/bulk actions/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));eout(resolve, 50));xt(/edit/i));

    const nameField = screen.getByDisplayValue('Test Product');

    await user.clear(nameField);
    await user.type(nameField, 'Updated Product');

    await user.click(screen.getByText(/save/i)await waitFor(() => {
      expect(require('../../services/magentoApi').default.updateProduct).toHaveBeenCalled();
    }, { timeout: 15000 });ateProduct).toHaveBeenCalled();
    });

    // Delete product
    await user.click(screen.getByLabelText(/delete/i));
    await user.click(screen.getawait waitFor(() => {
      expect(require('../../services/magentoApi').default.deleteProduct).toHaveBeenCalled();
    }, { timeout: 15000 });ntoApi').default.deleteProduct).toHaveBeenCalled();
    });
  });

  it('handles bulk product operations', async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByText(/products/i));

    // Select multiple products
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });

    await user.click(selectAllCheckbox);

    // Bulk status update
    await user.click(screen.getByText(/bulk actions/i));
    await user.click(screen.getByText(/await waitFor(() => {
      expect(require('../../services/magentoApi').default.upawait user.click(screen.getByText(/close/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));meout: 1await user.click(checkbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));entoApi').default.updateProduct).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// ORDER PROCESSING WORKFLOW
// ============================================================================

describe('Order Processing Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockMagentoApi = require('../../services/magentoApi').default;

    mockMagentoApi.getOrders.mockResolvedValue({
      data: { items: [mockOrder], total_count: 1 },
    });
    mockMagentoApi.updateOrderStatus.mockResolvedValue({ success: true });
  });

  it('processes order from pending to complete', async () => {
    const user = userEvent.setup();

    rawait waitFor(() => {
      expect(screen.getByText(/order management/i)).toBeInTheDocument();
    }, { timeout: 15000 });t waitFor(() => {
      expect(screen.getByText(/order management/i)).toBeInTheawait waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
    }, { timeout: 15000 });/view details/i));

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
    });

    await user.click(screen.getByText(/close/i));

    // Update order status
    const checkbox = screen.getByRole('checkbox', { name: /select row/i });

    await user.click(checkbox);

    await useawait waitFor(() => {
      expect(require('../../services/magentoApi'await user.click(screen.getByLabelText(/view details/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));plete');
    }, { timeout: 15000 }); waitFor(() => {
      expect(require('../../services/magentoApi').default.updateOrderStatus).toHaveBeenCalledWith(1, 'complete');
    });
  });
});

// ============================================================================
// CUSTOMER MANAGEMENT WORKFLOW
// ============================================================================

describe('Customer Management Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockMagentoApi = require('../../services/magentoApi').default;

    mockMagentoApi.getCustomers.mockResolvedValue({
      data: { items: [mockCustomer], total_count: 1 },
    });
  });

  it('manages customer information', asynawait waitFor(() => {
      expect(screen.getByText(/customer management/i)).toBeInTheDocument();
    }, { timeout: 15000 });t user.click(screen.getByText(/customers/i));

    await waitFor(() => {
      expect(screen.getByText(/customer management/i)).toBeInTheawait user.click(checkbox);
    // await user.click(screen.getByLabelText(/update stock/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));mise(resolve => setTimeout(resolve, 50)); // Search for customer
    const searchInput = screen.getByPlaceholderText(/search customers/i);

    await user.type(searchInput, 'john@example.com');

    await waitFor(() => {
      expect(require('../../services/magentoApi').default.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'john@example.com' }),
      );
    });

    // View customer details
    await user.click(screen.getByLabelText(/view details/i));

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});

// ============================================================================
// INVENTORY MANAGEMENT WORKFLOW
// ============================================================================

describe('Inventory Management Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockMagentoApi = require('../../services/magentoApi').default;

    mockMagentoApi.getInventory.mockResolvedValue({
      data: { items: [{ sku: 'TEST-001', quantity: 100 }], total_count: 1 },
    });
    mockMagentoApi.updateStock.mockResolvedValue({ success: true });
  });

  it('updates invawait waitFor(() => {
      expect(screen.getByText(/inventory management/i)).toBeInTheDocument();
    }, { timeout: 15000 });inventory
    await user.click(screen.getByText(/inventory/i));

    await waitFor(() => {
      expect(screen.getByText(/inventory management/i)).toBeInTheDocument();
    });

    // Update stock
    const checkbox = screen.getByRole('checkbox', { name: /seawait user.click(screen.getByLabelText(/export/i));
    /await user.click(screen.getByText(/csv/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));   await new Promise(resolve => setTimeout(resolve, 50));
    await user.click(screen.getByLabelText(/update stock/i));

    const quantityInput = screen.getawait waitFor(() => {
      expect(require('../../services/magentoApi').default.updateStock).toHaveBeenCalledWith('TEST-001', {
        quantity: 150,
        source_code: 'default',
      }, { timeout: 15000 });    await waitFor(() => {
      expect(require('../../services/magentoApi').default.updateStock).toHaveBeenCalledWith('TEST-001', {
        quantity: 150,
        source_code: 'default',
      });
    });
  });
});

// ============================================================================
// ANALYTICS AND REPORTING WORKFLOW
// ============================================================================

describe('Analytics and Reporting Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockAnalyticsApi = require('../../services/analyticsApi').default;

    mockAnalyticsApi.getAnalyticsData.mockResolvedValue({
      overview: { totalRevenue: 125000, totalOrders: 890 },
      salesTrend: [{ date: '2025-01-01', sales: 5000 }],
   await waitFor(() => {
      expect(screen.getByText(/comprehensive analytics/i)).toBeInTheDocument();
    }, { timeout: 15000 });  renderApp();

    // Navigate to analytics
    await user.click(screen.getByText(/anaawait waitFor(() => {
      expect(require('../../services/analyticsApi').default.getSalesData).toHaveBeenCalled();
    }, { timeout: 15000 });  });

    // Switch between different analytics views
    await user.click(screen.getByText(/sales/i));

    await waitFor(() => {
      expect(require('../../services/analyticsApi').default.getSalesData).toHaveBeenCalled();
    });

    // Export analytics data
    await user.click(screen.getByLabelText(/export/i));
    await user.click(screen.getByText(/csv/i));

    expect(screen.getByText(/exporting/i)).toBeInTheDocument();
  });
});

// ============================================================================
// CROSS-MODULE INTEGRATION WORKFLOW
// ============================================================================

describe('Cross-Module Integration Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockMagentoApi = require('../../services/magentoApi').default;
    const mockAnalyticsApi = require('../../services/analyticsApi').default;

    mockMagentoApi.getProducts.mockResolvedValue({
      data: { items: [mockProduct], total_count: 1 },
    });
    mockMagentoApi.getOrders.mockResolvedValue({
      data: { items: [mockOrder], total_count: 1 },
    });
    mockAnalyticsApi.getAnalyticsData.mockResolvedValue({
      overview: { totalRevenue: 125000 },
    });
  });

  it('navigates between modules and maintains contextawait waitFor(() => {
      expect(screen.getByText(/product management/i)).toBeInTheDocument();
    }, { timeout: 15000 });   expect(screen.getByText(/welcome to/i)).toBeInTheDocument();

await waitFor(() => {
      expect(screen.getByText(/order management/i)).toBeInTheDocument();
    }, { timeout: 15000 });=> {
      expect(screen.getByText(/product management/i)).toBeInTheDocuawait waitFor(() => {
      expect(screen.getByText(/comprehensive analytics/i)).toBeInTheDocument();
    }, { timeout: 15000 });itFor(() => {
      expect(screen.getByText(/order management/i)).toBeInTheDocument();
    });

    // Navigate to analytics
    await user.click(screen.getByText(/analytics/i));
    await waitFor(() => {
      expect(screen.getByText(/comprehensive analytics/i)).toBeInTheDocument();
    });

    // Verify all API calls were made
    expect(require('../../services/maawait user.clear(screen.getByDisplayValue('Test Product'));
    /await user.type(screen.getByDisplayValue(''), 'Updated Product');
    /await user.click(screen.getByText(/save/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));  await new Promise(resolve => setTimeout(resolve, 50));esolve => setTimeout(resolve, 50));pect(require('../../services/magentoApi').default.getOrders).toHaveBeenCalled();
    expect(require('../../services/analyticsApi').default.getAnalyticsData).toHaveBeenCalled();
  });
});

// ============================================================================
// ERROR HANDLING AND RECOVERY WORKFLOW
// ============================================================================

describe('Error Handling and Recovery Workflow', () => {
  it('handles API errors gracefully across modules', async () => {
    const user = userEvent.seawait waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    }, { timeout: 15000 });fault;

    mockMagentoApi.getProducts.mockRejectedValue(new Error('Network Error'));

    renderApp();

    // Navigate to products - should show error
    await user.click(screen.getByText(/prodawait waitFor(() => {
      expect(screen.getByText(/product management/i)).toBeInTheDocument();
    }, { timeout: 15000 });();
    });

    // Retry should work after fixing API
    mockMagentoApi.getProducts.mockResolvedValue({
      data: { items: [mockProduct], total_count: 1 },
    });

    await user.click(screen.getByText(/retry/i));

    await waitFor(() => {
      expect(screen.getByText(/product management/i)).toBeInTheDocument();
    });
  });

  it('maintains application state during errors', async () => {
    const user = userEvent.setup();

    const mockMagentoApi = require('../../services/magentoApi').default;

    mockMagentoApi.getProducts.mockResolvedValue({
      data: { items: [mockProduct], total_count: 1 },
    });
    mockMagentoApi.updateProduct.mockRejectedValue(new Error('Update failed'));

    renderApp();

    // Navigate to products
    await user.click(screen.getByawait waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    }, { timeout: 15000 });Text(/edit/i));
    await user.clear(screen.getByDisplayValue('Test Product'));
    await user.type(screen.getByDisplayValue(''), 'Updated Product');
    await user.click(screen.getByText(/save/i));

    // Should show error but maintain form state
    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });

    // Form should still be open with data
    expect(screen.getByDisplayValue('Updated Product')).toBeInTheDocument();
  });
});
