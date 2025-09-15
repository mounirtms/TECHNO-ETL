/**
 * Inventory Page Tests
 *
 * Comprehensive tests for the Inventory page
 * Tests inventory management, stock tracking, and operations
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InventoryPage from '../../pages/InventoryPage';

// Mock dependencies
vi.mock('../../services/magentoApi', () => ({
  default: {
    getInventory: vi.fn(),
    updateStock: vi.fn(),
    getStockSources: vi.fn(),
    createStockMovement: vi.fn(),
    syncInventory: vi.fn(),
  },
}));

vi.mock('../../components/grids/magento/InventoryGrid', () => ({
  default: vi.fn(() => <div data-testid="inventory-grid">Inventory Grid</div>),
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

const renderInventoryPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <InventoryPage {...props} />
      </ThemeProvider>
    </BrowserRouter>,
  );
};

// Mock data
const mockInventory = [
  {
    sku: 'PROD-001',
    name: 'Product 1',
    quantity: 100,
    reserved_quantity: 5,
    available_quantity: 95,
    source_code: 'default',
    status: 'in_stock',
    min_qty: 10,
    max_qty: 1000,
  },
  {
    sku: 'PROD-002',
    name: 'Product 2',
    quantity: 25,
    reserved_quantity: 2,
    available_quantity: 23,
    source_code: 'warehouse1',
    status: 'low_stock',
    min_qty: 20,
    max_qty: 500,
  },
];

const mockStockSources = [
  { code: 'default', name: 'Default Source', enabled: true },
  { code: 'warehouse1', name: 'Warehouse 1', enabled: true },
  { code: 'warehouse2', name: 'Warehouse 2', enabled: false },
];

// ============================================================================
// INVENTORY PAGE TESTS
// ============================================================================

describe('Inventory Page', () => {
  let mockMagentoApi;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMagentoApi = require('../../services/magentoApi').default;

    // Setup default mock responses
    mockMagentoApi.getInventory.mockResolvedValue({
      data: { items: mockInventory, total_count: mockInventory.length },
    });
    mockMagentoApi.getStockSources.mockResolvedValue(mockStockSources);
    mockMagentoApi.updateStock.mockResolvedValue({ success: true });
    mockMagentoApi.createStockMovement.mockResolvedValue({ id: 123 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders inventory page without crashing', () => {
      renderInventoryPage();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('displays page title and description', () => {
      renderInventoryPage();
      expect(screen.getByText(/inventory management/i)).toBeInTheDocument();
      expect(screen.getByText(/manage stock levels/i)).toBeInTheDocument();
    });

    it('renders inventory grid', () => {
      renderInventoryPage();
      expect(screen.getByTestId('inventory-grid')).toBeInTheDocument();
    });

    it('renders toolbar with action buttons', () => {
      renderInventoryPage();
      expect(screen.getByLabelText(/refresh/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/export/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sync/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bulk update/i)).toBeInTheDocument();
    });

    it('renders stock status filters', () => {
      renderInventoryPage();
      expect(screen.getByText(/all items/i)).toBeInTheDocument();
      expect(screen.getByText(/in stock/i)).toBeInTheDocument();
      expect(screen.getByText(/low stock/i)).toBeInTheDocument();
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DATA LOADING TESTS
  // ============================================================================

  describe('Data Loading', () => {
    it('loads inventory on page mount', async () => {
      renderInventoryPage();

      await waitFor(() => {
        expect(mockMagentoApi.getInventory).toHaveBeenCalledTimes(1);
        expect(mockMagentoApi.getStockSources).toHaveBeenCalledTimes(1);
      }, { timeout: 15000 });
    });

    it('displays loading state while fetching data', () => {
      mockMagentoApi.getInventory.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderInventoryPage();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles data loading errors gracefully', async () => {
      const error = new Error('Failed to load inventory');

      mockMagentoApi.getInventory.mockRejectedValue(error);

      renderInventawait waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      }, { timeout: 15000 });cument();
      });
    });

    it('refreshes data when refresh button is clicked', async () => {
      const user = userEvent.setup();

      renderInventoryPage();
await waitFor(() => {
        expect(mockMagentoApi.getInventory).toHaveBeenCalledTimes(1);
      }, { timeout: 15000 });ry).toHaveBeenCalledTimes(1);
      });

      // Click refresh
      const refreshButton = screen.getByLabelText(/reawait waitFor(() => {
        expect(mockMagentoApi.getInventory).toHaveBeenCalledTimes(2);
      }, { timeout: 15000 });agentoApi.getInventory).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ============================================================================
  // STOCK STATUS FILTERING TESTS
  // ============================================================================

  describe('Stock Status Filtering', () => {
    it('filters by in stock status', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      const inStockTab = screen.getByText(/in stock/i);

      await user.click(inStockTab);

      await waitFor(() => {
        expect(mockMagentoApi.getInventory).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              status: 'in_stock',
            }),
          }),
        );
      });
    });

    it('filters by low stock status', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      const lowStockTab = screen.getByText(/low stock/i);

      await user.click(lowStockTab);

      await waitFor(() => {
        expect(mockMagentoApi.getInventory).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              status: 'low_stock',
            }),
          }),
        );
      });
    });

    it('filters by out of stock status', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      const outOfStockTab = screen.getByText(/out of stock/i);

      await user.click(outOfStockTab);

      await waitFor(() => {
        expect(mockMagentoApi.getInventory).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              status: 'out_of_stock',
            }),
          }),
        );
      });
    });

    it('shows all items when all tab is clicked', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      // First click a filter
      const inStockTab = screen.getByText(/in stock/i);

      await user.click(inStockTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));

      // Then click all items
      const allTab = screen.getByText(/all items/i);

      await user.click(allTab);

      await waitFor(() => {
        expect(mockMagentoApi.getInventory).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: {},
          }),
        );
      });
    });
  });

  // ============================================================================
  // STOCK OPERATIONS TESTS
  // ============================================================================

  describe('Stock Operations', () => {
    describe('Update Stock Quantity', () => {
      it('opens stock update dialog', async () => {
        const user = userEvent.setup();

 await waitFor(() => {
          expect(screen.getByTestId('inventory-grid')).toBeInTheDocument();
        }, { timeout: 15000 });  expect(screen.getByTestId('inventory-grid')).toBeInTheDocument();
        });

    await user.click(updateButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));    const updateButton = screen.getByLabelText(/update stock/i);

        await user.click(updateButton);

        expect(screen.getByText(/update stock quantity/i)).toBeInTheDocument();
      });

      it('updates stock quantity', asyawait user.click(checkbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));seawait user.click(updateButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));  renderIawait user.clear(quantityInput);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));lect inventory item
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });

        await user.click(checkbox);

        // Update stock
        const updateButton = screen.getByLabelText(/update stock/i);

        await user.click(updateButton);

        // Enter new quantity
        const quantityInput = screen.getByLabelText(/new quantity/i);

        await user.clear(quantityInput);
        await user.type(quantityInput, '150');

     await waitFor(() => {
 await user.click(checkbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => seawait user.click(updateButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));teStock).toHaawait user.clear(quantityInput);
    // Adawait user.type(quantityInput, '-10');
    // Add small delay to prevent act warnings
    await new Promisawait user.click(saveButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));ve, 50));    await new Promise(resolve => setTimeout(resolve, 50));            quantity: 150,
            source_code: 'default',
          }, { timeout: 15000 });edWith('PROD-001', {
            quantity: 150,
            source_code: 'default',
          await user.click(checkbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimawait user.click(movementButton);
    // Add small delay to prevent act warningawait user.type(screen.getByLabelText(/quantity/i), '10');
    // Adawait user.type(screen.getByLabelText(/reason/i), 'Damaged goods');
    // Add small delay to prevent act warnings
    await new Promise(resolve => sawait user.click(typeSelect);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));etTimeout(resolve, 50)););validates stock quantity input', async () => {
        const user = userEvent.setup();

        renderInventoryPage();

        const checkbox = screen.getByRole('checkbox', { name: /select row/i });

        await user.click(checkbox);

        const updateButton = screen.getByLabelText(/update stock/i);

        await user.click(updateButton);

        // Enter invalid quantity
        const quantityInput = screen.getByLabelText(/new quantity/i);

        await user.clear(quantityInput);
        await user.type(quantityInput, '-10');await user.click(checkbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimawait user.click(movementButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => sawait user.click(typeSelect);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));t(/save/i);

        await user.click(saveButton);

        expect(screen.getByText(/quantity must be positive/i)).toBeInTheDocument();
      });
    });

    describe('Stock Movements', () => {
      it('creates stock movement', async () => {
        const user = userEvent.setup();

        renderInventoryPage();

        const checkbox = screen.getByRole('checkbox', { name: /select row/i });

        await user.click(checkbox);

        const movementButton = screen.getByLabelText(/stock movement/i);

        await user.click(movementButton);

        // Fill movement details
        await user.type(sawait user.click(checkboxes[0]);
    // await user.click(checkboxes[1]);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));arnings
    await new Promise(resolve => setTimeout(resolve, 50));), '10');
        await user.type(screen.getByLabelText(/reason/i), 'Damaged goods');

        const typeSelect = screen.getByLabelText(/movement type/i);

        await user.click(typeSelect);
        await user.click(screen.getByText('Adjustment'));

await wawait user.click(selectAllCheckbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolveawait user.click(bulkUpdateButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));ent).toHaveBeenCalledWith({
            sku: 'PROD-001',
            quantity: 10,
            type: 'adjustment',
            reason: 'Damaged goods',
          }, { timeout: 15000 });D-001',
            quantity: 10,
            type: 'adjustment',
            reason: 'Damaged goods',
          });
        });
      });

      it('shows movement types', async () => {
        const user = userEvent.setup();

        renderInventoryPage();

        const checkbox = screen.getByRole('checkbox', { name: /select row/i });
await user.click(selectAllCheckbox);
    // Add small delay to prevent act warnings
    await new Promise(resolveawait user.click(bulkUpdateButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeouawait user.click(adjustmentTypeSelect);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));ton = screen.getByLabelText(/stock movement/i);

        await user.click(movementButton);

        const typeSelect = screen.getByLabelText(/movement type/i);

        await user.click(typeSelect);

        expect(screen.getByText('Adjustment')).toBeInTheDocument();
        expect(screen.getByText('Damaged')).toBeInTheDocument();
        expect(screen.getByText('Transfer')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // BULK OPERATIONS TESTS
  // ============================================================================

  describe('Bulk Operations', () => {
    it('enables bulk actions when items are selected', async ()await user.click(sourceFilter);
    // await user.click(screen.getByText('Warehouse 1'));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));new Promise(resolve => setTimeout(resolve, 50));vent.setup();

      renderInventoryPage();

      // Select multiple items
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });

      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      // Bulk actions should be enabled
      expect(screen.getByText(/bulk operations/i)).toBeInTheDocument();
      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    await user.click(sourceFilter);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));ock update', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      // Select items
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });

      await user.click(selectAllCheckbox);

      // Bulk update
      const bulkUpdateButton = screen.getByText(/bulk update/i);

      await user.click(bulkUpdateButton);

      // Enter adjustment
      const adjustmentInput = screen.getByLabelText(/quantity adjustment/i);

      await await waitFor(() => {
        expect(mockMagentoApi.updateStock).toHaveBeenCalledTimes(mockInventory.length);
      }, { timeout: 15000 });yButton);

      await waitFor(() => {
        expect(mockMagentoApi.updateStock).toHaveBeenCalledTimes(mockInventory.length);
      });
    });

    it('supports different bulk adjustment types', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });

      await user.click(selectAllCheckbox);

      const bulkUpdateButton = screen.getByText(/bulk update/i);

      await user.click(bulkUpdateButton);

      const adjustmentTypeSelect = screen.getByLabelText(/adjustment type/i);

      await user.click(adjustmentTypeSelect);

      expect(screen.getByText('Set Quantity')).toBeInTheDocument();
      expect(screen.getByText('Add Quantity')).toBeInTheDocument();
      expect(screen.getByText('Subtract Quantity')).toBeInTheDocument();
    });
  });

  // ======================================await user.click(quantityFilter);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));=====
  // SOURCE FILTERING TESTS
  await user.type(minQty, '50');
    // await user.type(maxQty, '200');
    // Add small delay to prevent act warnings
    await new Promawait user.click(applyButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));lve, 50));warnings
    await new Promise(resolve => setTimeout(resolve, 50));=================================================

  describe('Source Filtering', () => {
  await waitFor(() => {
        expect(screen.getByLabelText(/stock source/i)).toBeInTheDocument();
      }, { timeout: 15000 });age();

      // Wait for sources to load
      await waitFor(() => {
        expect(screen.getByLabelText(/stock source/i)).toBeInTheDocument();
      });

      const sourceFilter = screen.getByLabelText(/stock source/i);

      await user.click(sourceFilter);
      await user.click(scawait user.click(exportButton);
    // await user.click(screen.getByText(/csv/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockMagentoApi.getInventory).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({await user.click(exportButton);
    // await user.click(screen.getByText(/excel/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));wait new Promise(resolve => setTimeout(resolve, 50));ehouse1',
         await waitFor(() => {
        expect(screen.getByLabelText(/stock source/i)).toBeInTheDocument();
      }, { timeout: 15000 });onst user = userEvent.setup();

      renderInventoryPage();await user.click(checkbox);
    // Add small delay to prevent act warnings
    await new Promise(resawait user.click(exportButton);
    // await user.click(screen.getByText(/export selected/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));romise(resolve => setTimeout(resolve, 50)););> {
        expect(screen.getByLabelText(/stock source/i)).toBeInTheDocument();
      });

      const sourceFilter = screen.getByLabelText(/stock source/i);

      await user.click(sourceFilter);

      expect(screen.getByText('Default Source')).toBeInTheDocument();
      expect(screen.getByText('Warehouse 1')).toBeInTheDocument();
      expect(screen.queryByText('Warehouse 2')).not.toBeInTheDocument(); // Disabled
    });
  });

  // ============================================================================
  // SEARCH AND FILTERING TESTS
  // ============================================================================

  describe('Search and Filtering', () => {
    it('searches inventory by SKU', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      const searchInput = screen.getByPlaceholderText(/search inveawait user.click(syncButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));type(searchInput, 'PROD-001');

      await waitFor(() => {
        expect(mockMagentoApi.getInventory).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'PROD-001',
          }),
        );
      }, { timeout: 1000 }); // Debounced search
    });

    it('searches inventory by product name', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      const searchInput = screen.getByPlaceholderText(/search inventory/i);

      await user.type(searchInput, 'Product 1');

  await user.click(checkbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve =await user.click(updateButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));    expect(mockMagentoApi.getInventory).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'Product 1',
          }),
        );
      }, { timeout: 1000 });
    });

    it('filters by quantity range', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      const quantityFilter = screen.getByLabelText(/quantity range/i);

      await user.click(quantityFilter);

      const minQty = screen.getByLabelText(/minimum quantity/i);
      const maxQty = screen.getByLabelText(/maximum quantity/i);

      await user.type(minQty, '50');
      await user.type(maxQty, '200');

      const applyButton = screen.getByText(/apply/i);

      await user.click(applyButton);

      expect(mockMagentoApi.getInventory).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            quantity: {
              from: 50,
              to: 200,
            },
          }),
        }),
      );
    });
  });

  // ============================================================================
  // EXPORT TESTS
  // ============================================================================

  describe('Export', () => {
    it('exports inventory to CSV', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      const exportButton = screen.getByLabelText(/export/i);

      await user.click(exportButton);
      await user.click(screen.getByText(/csv/i));

      // Should trigger download
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });

    it('exports inventory to Excel', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      const exportButton = screen.getByLabelText(/export/i);

      await user.click(exportButton);
      await user.click(screen.getByText(/excel/i));

      // Should trigger download
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });

    it('includes only selected items in export', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      // Select specific items
      const checkbox = screen.getByRole('checkbox', { name: /select row/i });

      await user.click(checkbox);

      const exportButton = screen.getByLabelText(/export/i);

      await user.click(exportButton);
      await user.click(screen.getByText(/export selected/i));

      // Should export only selected items
      expect(screen.getByText(/exporting selected/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SYNC OPERATIONS TESTS
  // ============================================================================

  describe('Sync Operations', () => {
    it('syncs inventory with external await waitFor(() => {
        expect(mockMagentoApi.syncInventory).toHaveBeenCalled();
      }, { timeout: 15000 });    const syncButton = screen.getByLabelText(/sync/i);

      await user.click(syncButton);

      await waitFor(() => {
        expect(mockMagentoApi.syncInventory).toHaveBeenCalled();
      });
    });

    it('shows sync progress', async () => {
      const user = userEvent.setup();

      mockMagentoApi.syncInventory.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderInventoryPage();

      const syncButton = screen.getByLabelText(/sync/i);

      await user.click(syncButton);

      expect(screen.getByText(/syncing inventory/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('handles stock update errors', async () => {
      const user = userEvent.setup();
      const error = new Error('Stock update failed');

      mockMagentoApi.updateStock.mockRejectedValue(error);

      renderInventoryPage();

      const checkbox = screen.getByRole('checkbox', { name: /select row/i });

      await user.click(checkbox);

      const updateButton = screen.getByLabelText(/update stock/i);

      await user.click(updateButton);

      const quantityInput = screen.geawait waitFor(() => {
        expect(screen.getByText(/stock update failed/i)).toBeInTheDocument();
      }, { timeout: 15000 });150');

      const saveButton = screen.getByText(/save/i);

      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/stock update failed/i)).toBeInTheDocument();
 await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      }, { timeout: 15000 });RejectedValue(networkError);

      renderInventoryPage();

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      })await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      }, { timeout: 15000 });p();

      // Start with error
      mockMagentoApi.getInventory.mockRejectedValue(new Error('Server Error'));

      renderInventoryPage();

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
await waitFor(() => {
        expect(screen.getByTestId('inventory-grid')).toBeInTheDocument();
      }, { timeout: 15000 });ems: mockInventory, total_count: mockInventory.length },
      });

      const retryButton = screen.getByText(/retry/i);

      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('inventory-grid')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderInventoryPage();

      const main = screen.getByRole('main');

      expect(main).toHaveAttribute('aria-labelledby');

      const tabs = screen.getAllByRole('tab');

      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-controls');
      });
    });

    it('supports keyboard navigation for tabs', async () => {
      const user = userEvent.setup();

      renderInventoryPage();

      const allTab = screen.getByText(/all items/i);
      const inStockTab = screen.getByText(/in stock/i);

      // Focus on first tab
   await waitFor(() => {
        const alertRegion = screen.getByRole('alert');

        expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
      }, { timeout: 15000 });toHaveFocus();
    });

    it('announces stock level warnings to screen readers', async () => {
      renderInventoryPage();

      await waitFor(() => {
        const alertRegion = screen.getByRole('alert');

        expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
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

      renderInventoryPage();

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

      renderInventoryPage();

      expect(screen.getByLabelText(/more actions/i)).toBeInTheDocument();
    });
  });
});
