/**
 * Product Management Page Tests
 *
 * Comprehensive tests for the Product Management page
 * Tests product CRUD operations, grid functionality, and workflows
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductManagementPage from '../../pages/ProductManagementPage';

// Mock dependencies
vi.mock('../../services/magentoApi', () => ({
  default: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    getProductAttributes: vi.fn(),
    getCategories: vi.fn(),
    getBrands: vi.fn(),
    syncProducts: vi.fn(),
  },
}));

vi.mock('../../components/grids/magento/ProductManagementGrid', () => ({
  default: vi.fn(() => <div data-testid="product-management-grid">Product Grid</div>),
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

const renderProductManagementPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <ProductManagementPage {...props} />
      </ThemeProvider>
    </BrowserRouter>,
  );
};

// Mock data
const mockProducts = [
  {
    id: 1,
    sku: 'PROD-001',
    name: 'Test Product 1',
    price: 99.99,
    status: 1,
    type_id: 'simple',
    brand: 'Test Brand',
    categories: ['Electronics'],
  },
  {
    id: 2,
    sku: 'PROD-002',
    name: 'Test Product 2',
    price: 149.99,
    status: 1,
    type_id: 'configurable',
    brand: 'Another Brand',
    categories: ['Electronics', 'Computers'],
  },
];

const mockAttributes = [
  { id: 1, code: 'color', label: 'Color', type: 'select' },
  { id: 2, code: 'size', label: 'Size', type: 'select' },
];

const mockCategories = [
  { id: 1, name: 'Electronics', parent_id: null },
  { id: 2, name: 'Computers', parent_id: 1 },
];

const mockBrands = [
  { value: 'test-brand', label: 'Test Brand' },
  { value: 'another-brand', label: 'Another Brand' },
];

// ============================================================================
// PRODUCT MANAGEMENT PAGE TESTS
// ============================================================================

describe('Product Management Page', () => {
  let mockMagentoApi;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMagentoApi = require('../../services/magentoApi').default;

    // Setup default mock responses
    mockMagentoApi.getProducts.mockResolvedValue({
      data: { items: mockProducts, total_count: mockProducts.length },
    });
    mockMagentoApi.getProductAttributes.mockResolvedValue(mockAttributes);
    mockMagentoApi.getCategories.mockResolvedValue(mockCategories);
    mockMagentoApi.getBrands.mockResolvedValue(mockBrands);
    mockMagentoApi.createProduct.mockResolvedValue({ id: 3, sku: 'PROD-003' });
    mockMagentoApi.updateProduct.mockResolvedValue({ id: 1, sku: 'PROD-001' });
    mockMagentoApi.deleteProduct.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders product management page without crashing', () => {
      renderProductManagementPage();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('displays page title and description', () => {
      renderProductManagementPage();
      expect(screen.getByText(/product management/i)).toBeInTheDocument();
      expect(screen.getByText(/comprehensive product/i)).toBeInTheDocument();
    });

    it('renders product management grid', () => {
      renderProductManagementPage();
      expect(screen.getByTestId('product-management-grid')).toBeInTheDocument();
    });

    it('renders navigation tabs', () => {
      renderProductManagementPage();
      expect(screen.getByText(/products overview/i)).toBeInTheDocument();
      expect(screen.getByText(/product attributes/i)).toBeInTheDocument();
      expect(screen.getByText(/category assignment/i)).toBeInTheDocument();
    });

    it('renders toolbar with action buttons', () => {
      renderProductManagementPage();
      expect(screen.getByLabelText(/add product/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/refresh/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/export/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DATA LOADING TESTS
  // ============================================================================

  describe('Data Loading', () => {
    it('loads products on page mount', async () => {
      renderProductManagementPage();

      await waitFor(() => {
        expect(mockMagentoApi.getProducts).toHaveBeenCalledTimes(1);
        expect(mockMagentoApi.getBrands).toHaveBeenCalledTimes(1);
      }, { timeout: 15000 });
    });

    it('displays loading state while fetching data', () => {
      mockMagentoApi.getProducts.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderProductManagementPage();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles data loading errors gracefully', async () => {
      const error = new Error('Failed to load products');

      mockMagentoApi.getProducts.mockRejectedValue(error);

      renderProductManagemawait waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      }, { timeout: 15000 });cument();
      });
    });

    it('refreshes data when refresh button is clicked', async () => {
      const user = userEvent.setup();

      renderProductManagementPage();
await waitFor(() => {
        expect(mockMagentoApi.getProducts).toHaveBeenCalledTimes(1);
      }, { timeout: 15000 });ts).toHaveBeenCalledTimes(1);
      });

      // Click refresh
      const refreshButton = screen.getByLabelText(/reawait waitFor(() => {
        expect(mockMagentoApi.getProducts).toHaveBeenCalledTimes(2);
      }, { timeout: 15000 });MagentoApi.getProducts).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ============================================================================
  // TAB NAVIGATION TESTS
  // ============================================================================

  describe('Tab Navigation', () => {
    it('switches to attributes tab', async () => {
      const user = userEvent.setup();

      renderProductManagementPage();

      const attributesTab = screen.getByText(/product attributes/i);

      await user.click(attributesTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));

      expect(attributesTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to categories tab', async () => {
      const user = userEvent.setup();

      renderawait user.click(categoriesTab);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));  const categoriesTab = screen.getByText(/category assignment/i);

      await user.click(categoriesTab);

      expect(categoriesTab).toHaveAttribute('aria-selected', 'true');
    });

    it('loads appropriate data for each tab', async () => {
      const user = userEvent.setup();

      renderProductManagementPage();

      // Switch to attributes tab
      const attributesTab = screen.getBawait waitFor(() => {
        expect(mockMagentoApi.getProductAttributes).toHaveBeenCalled();
      }, { timeout: 15000 });      expect(mockMagentoApi.getProductAttributes).toHaveBeenCalled();
      });

      // Switch to categories tab
      const categoriawait waitFor(() => {
        expect(mockMagentoApi.getCategories).toHaveBeenCalled();
      }, { timeout: 15000 });  await waitFor(() => {
        expect(mockMagentoApi.getCategories).toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // PRODUCT CRUD OPERATIONS
  // ============================================================================

  describe('Product CRUD Operations', () => {
    describe('Create Product', () => {await user.click(addButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); dialog', async () => {
        const user = userEvent.setup();

        renderProductManagementPage();

        const addButton = screen.getByLabelText(/add product/i);

        await user.click(addButton);

        expect(screeawait user.click(addButton);
    // Add small delay to preventawait user.type(screen.getByLabelText(/sku/i), 'NEW-PROD-001');
    // Adawait user.type(screen.getByLabelText(/product name/i), 'New Test Product');
    // Adawait user.type(screen.getByLabelText(/price/i), '199.99');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));(resolve => setTimeout(resolve, 50));meout(resolve, 50));ve, 50));/i)).toBeInTheDocument();
      });

      it('creates new product with valid data', async () => {
        const user = userEvent.setup();

        renderProductManagementPage();

        // Open add dialog
        const addButton = screen.getByLabelText(/add product/i);

        await user.click(addButton);

        // Fill form
        await user.type(screen.getByLabelText(/sku/i), 'NEW-PROD-001');
        await user.type(screen.getByLabelText(await user.click(addButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));Product');
  await user.click(submitButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));tByLabelText(/price/i), '199.99');

        // Suawait waitFor(() => {
          expect(mockMagentoApi.createProduct).toHaveBeenCalledWith({
            sku: 'NEW-PROD-001',
            name: 'New Test Product',
            price: '199.99',
          }, { timeout: 15000 });({
            sku: 'NEW-PROD-001',
            name: 'New Test Product',
            price: '199.99',
          });
        });
      });

      it('validates required fields', async () => {
        const user = userEvent.setup();

        renderProductManagementPage()await user.click(editButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));og
        const addButton = screen.getByLabelText(/add product/i);

        await user.click(addButton);

        // Try to submit without required fields
        const submitButton = screen.getByText(/save/i);

        await user.click(submitButton);

        expect(screen.getByText(/sawait user.click(editButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));ocument();await user.clear(nameField);
    // Adawait user.type(nameField, 'Updated Product Name');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); Promise(resolve => setTimeout(resolve, 50));yText(/product name is required/i)).toBeInTheDocument();
      });
    });

    describe('Update Product', () => {
      it('opens edit dialog with product data', asyncawait waitFor(() => {
          expect(screen.getByTestId('product-management-grid')).toBeInTheDocument();
        }, { timeout: 15000 });ts to load
        await waitFor(() => {
          expect(screen.getByTestId('product-management-grid')).toBeInTheDocument();
        });

        // Select product and edit
        const editButton = screen.getByLabelText(/edit/iawait user.click(checkbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 5await user.click(deleteButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));expect(screen.getByText(/edit product/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('PROD-001')).toBeInTheDocument();
      });

      it('updates product with changes', async () => {
        const user = userEvenawait user.click(checkbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));ProductManagementPage();

        // Open edit dialog
        const editButton = screen.getByLabelText(/edit/i);

        await user.click(editButton);

        // Modify product name
        const nameField = screen.getByDisplayValue('Test Product 1');

        await user.clear(nameField);
        await user.type(nameField, 'Updated Product Name');

        // Submit changes
        const submitButton = screen.getByText(/save/i);

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockMagentoApi.updateProduct).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
              name: 'Updated Product Name',
            }),
          );
        });
      });
    });

    describe('Delete Product', () => {
      it('opens delete confirmation dialog', async () => {
        const user = userEvent.setup();

        renderProductManagementPage();

        // Select product
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });

        await user.click(checkbox);

        // Click delete
        const deleteButton = screen.getByLabelText(/delete/i);

        await user.click(deleteButton);

        expect(screawait user.click(brandFilter);
    // await user.click(screen.getByText('Test Brand'));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); new Promise(resolve => setTimeout(resolve, 50));.toBeInTheDocument();
      });

      it('deletes selected products', async () => {
        const user = userEvent.setup();

        renderProductManagementPage();

        // Select product
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });

        await user.click(checawait user.click(statusFilter);
    // await user.click(screen.getByText('Active'));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));wait new Promise(resolve => setTimeout(resolve, 50));      const deleteButton = screen.getByLabelText(/delete/i);

        await user.click(await waitFor(() => {
          expect(mockMagentoApi.deleteProduct).toHaveBeenCalledWith(1);
        }, { timeout: 15000 });
        await user.click(confirmButton);

        await waitFor(() => {
          expect(mockMagentoApi.deleteProduct).toHaveBeenCalledWith(1);
        });
      });

      it('prevents deletion when no products selected', async () => {
        const user = userEvent.setup();

        renderProductManagementPage();

        const deleteButton = screen.getByLabelText(/delete/i);

        expect(deleteButton).toBeDisabled();
      });
    });
  });

  // ============================================================================
  // FILTERING AND SEARCH TESTS
  // =====await user.click(brandFilter);
    // await user.click(screen.getByText('Test Brand'));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolvawait user.click(clearButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));> setTimeout(resolve, 50));=========================================

  describe('Filtering and Search', await waitFor(() => {
        expect(screen.getByLabelText(/brand/i)).toBeInTheDocument();
      }, { timeout: 15000 });    renderProductManagementPage();

      // Wait for brands to load
      await waitFor(() => {
        expect(screen.getByLabelText(/brand/i)).toBeInTheDocument();
      });

      // Select brand filter
      const brandFilter = screen.getByLabelText(/brand/i);

      await user.click(brandFilter);
      await user.click(screen.getBawait user.click(checkboxes[0]);
    // await user.click(checkboxes[1]);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));arnings
    await new Promise(resolve => setTimeout(resolve, 50));/ Should filter products
      expect(mockMagentoApi.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            brand: 'Test Brand',
          }),
        }),
      );
    });

    it('filters products by await user.click(selectAllCheckbox);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));user = userEvent.setup();

      renderProductManagementPage();

      const statusFilter = screen.getByLabelText(/status/i);

      await user.click(statusFilter);
      await user.click(screen.getByText('Active'));

      expect(mockMagentoApi.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            status: '1',
          }),
        }),
      );
    });

    it('searches products by name', async () => {
      const user = userEvent.setup();

      renderProductManagementPawait user.click(checkboxes[0]);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));t await user.click(bulkStatusButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));ch products/i);

      await user.type(searchInput, 'Test Product');

      await waitFor(() => {
        expect(mockMagentoApi.getProducts).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'Test Product',
          }),
        );
      }, { timeout: 1000 }); // Debounced search
    });

    it('clears all filters', async () => {
      const user = userEvent.setup();

      renderProductManagementPage();

      // Apply some filters first
      const brandFilter = screen.getByLabelText(/brand/i);

      await user.click(brandFilter);
      await user.clickawait user.click(exportButton);
    // await user.click(screen.getByText(/csv/i));
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); await new Promise(resolve => setTimeout(resolve, 50)););

      // Clear filters
      const clearButton = screen.getByText(/clear filters/i);

      await user.click(clearButton);

      expect(moawait user.click(importButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));eBeenCalledWith(
        expect.objectContaining({
          filters: {},
        }),
      );
    });
  });

  // ============================================================================
  // BULK OPERATIONS TESTS
  // =================================================await user.click(importButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));  describe('Bulk Operations', () => {
    it('enables bulk actions when products are await user.upload(fileInput, invalidFile);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); = userEvent.setup();

      renderProductManagementPage();

      // Select multiple products
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });

      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      // Bulk actions should be enabled
      expect(screen.getByText(/bulk operations/i)).toBeInTheDocument();
      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    });

    it('performs bulk delete operation', async () => {
      const user = userEvent.setup();

      renderProductManagementPage();

      // Select products
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });

      await user.click(selectAllCheckbox);

      // Bulk delete
      const bulkDeleteButton = screen.getawait waitFor(() => {
        expect(mockMagentoApi.deleteProduct).toHaveBeenCalledTimes(mockProducts.length);
      }, { timeout: 15000 });creen.getByText(/delete/i);

      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockMagentoApi.deleteProawait user.type(searchInput, 'test');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));cts.length);
      });
    });

    it('performs bulk status update', async () => {
      const user = userEvent.setup();

      renderProductManagementPage();

      // Select products
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });

      await user.click(checkboxes[0]);

      // Bulk status change
      const bulkStatusButton = screen.getByText(/change status/i);

      await user.click(bulkStatusButton);
      await user.click(screen.getByText('Inactive'));

      await waitFor(() => {
        expect(mockMagentoApi.updateProduct).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            status: 0,
          }),
        )await user.click(addButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));

  // ============================================================================
  // IMPORT/EXPORT TESTS
  // ============================================================================

  describe('Import/Export', () => {
    it('exports products to CSV', async () => {
      const user = userEvent.setup();

      renderProductManagementPage();

      const exportButton = screen.getByLabelText(/export/i);

      await user.click(exportButton);
      await user.click(screen.getByText(/csv/i));

      // Should trigger download
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });

    it('opens import dialog', async () => {
      const user = userEvent.setup();

      renderProductManagementPage();

      const importButton = screen.getByLabelText(/import/i);

      await user.click(importButton);

      expect(screen.getByText(/import products/i)).toBeInTheDocument();
      expect(screen.getByText(/choose file/i)).toBeInTheDocument();
    });

    it('validates import file format', async () => {
      const user = userEvent.setup();

      renderProductManagementPage();

      // Open import dialog
      const importButton = screen.getByLabelText(/import/i);

      await user.click(importButton);

      // Upload invalid file
      const fileInput = screen.getByLabelText(/choose file/i);
      const invalidFile = new File(['invalid'], 'test.txt', { type: 'text/plain' });

      await user.upload(fileInput, invalidFile);

      expect(screen.getByText(/invalid file format/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance', () => {
    it('virtualizes large product lists', async () => {
      const largeProductList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        sku: `PROD-${i + 1}`,
        name: `Product ${i + 1}`,
        priceawait waitFor(() => {
        // Should use virtualization for large lists
        expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();
      }, { timeout: 15000 });    });

      renderProductManagementPage();

      await waitFor(() => {
        // Should use virtualization for large lists
        expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();
      });
    });

    it('debounces search input', async () => {
      const user = userEvent.setup();

      renderProductManagementPage();

      const searchInput = screen.getByPlaceholderText(/search products/i);

      // Type rapidly
      await user.type(searchInput, 'test');

      // Should only make one API call after debounce
      await waitFor(() => {
        expect(mockMagentoApi.getProducts).toHaveBeenCalledTimes(2); // Initial load + search
      }, { timeout: 1000 });
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('handles product creation errors', async () => {
      const user = userEvent.setup();
      const error = new Error('SKU already exists');

      mockMagentoApi.createProduct.mockRejectedValue(error);

      renderProductManagementPage();

      // Try to create product
      const addButton = screen.getByLabelText(/add product/i);

      await user.click(addButton);

      await user.await waitFor(() => {
        expect(screen.getByText(/sku already exists/i)).toBeInTheDocument();
      }, { timeout: 15000 });me/i), 'Test Product');

      const submitButton = screen.getByText(/save/i);

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/sku already exists/i)).toBeInTheDawait waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      }, { timeout: 15000 });roducts.mockRejectedValue(networkError);

      renderProductManagementPage();

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByText(/retry/i)).toBeInTheDocumentawait waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      }, { timeout: 15000 });serEvent.setup();

      // Start with error
      mockMagentoApi.getProducts.mockRejectedValue(new Error('Server Error'));

      renderProductManagementPage();

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDawait waitFor(() => {
        expect(screen.getByTestId('product-management-grid')).toBeInTheDocument();
      }, { timeout: 15000 });   data: { items: mockProducts, total_count: mockProducts.length },
      });

      const retryButton = screen.getByText(/retry/i);

      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('product-management-grid')).toBeInTheDocument();
      });
    });
  });
});
