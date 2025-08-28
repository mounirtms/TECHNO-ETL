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
    syncProducts: vi.fn()
  }
}));

vi.mock('../../components/grids/magento/ProductManagementGrid', () => ({
  default: vi.fn(() => <div data-testid="product-management-grid">Product Grid</div>)
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

const renderProductManagementPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <ProductManagementPage {...props} />
      </ThemeProvider>
    </BrowserRouter>
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
    categories: ['Electronics']
  },
  {
    id: 2,
    sku: 'PROD-002',
    name: 'Test Product 2',
    price: 149.99,
    status: 1,
    type_id: 'configurable',
    brand: 'Another Brand',
    categories: ['Electronics', 'Computers']
  }
];

const mockAttributes = [
  { id: 1, code: 'color', label: 'Color', type: 'select' },
  { id: 2, code: 'size', label: 'Size', type: 'select' }
];

const mockCategories = [
  { id: 1, name: 'Electronics', parent_id: null },
  { id: 2, name: 'Computers', parent_id: 1 }
];

const mockBrands = [
  { value: 'test-brand', label: 'Test Brand' },
  { value: 'another-brand', label: 'Another Brand' }
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
      data: { items: mockProducts, total_count: mockProducts.length }
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
      });
    });

    it('displays loading state while fetching data', () => {
      mockMagentoApi.getProducts.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderProductManagementPage();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles data loading errors gracefully', async () => {
      const error = new Error('Failed to load products');
      mockMagentoApi.getProducts.mockRejectedValue(error);
      
      renderProductManagementPage();
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      });
    });

    it('refreshes data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      renderProductManagementPage();
      
      // Wait for initial load
      await waitFor(() => {
        expect(mockMagentoApi.getProducts).toHaveBeenCalledTimes(1);
      });
      
      // Click refresh
      const refreshButton = screen.getByLabelText(/refresh/i);
      await user.click(refreshButton);
      
      await waitFor(() => {
        expect(mockMagentoApi.getProducts).toHaveBeenCalledTimes(2);
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
      
      expect(attributesTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to categories tab', async () => {
      const user = userEvent.setup();
      renderProductManagementPage();
      
      const categoriesTab = screen.getByText(/category assignment/i);
      await user.click(categoriesTab);
      
      expect(categoriesTab).toHaveAttribute('aria-selected', 'true');
    });

    it('loads appropriate data for each tab', async () => {
      const user = userEvent.setup();
      renderProductManagementPage();
      
      // Switch to attributes tab
      const attributesTab = screen.getByText(/product attributes/i);
      await user.click(attributesTab);
      
      await waitFor(() => {
        expect(mockMagentoApi.getProductAttributes).toHaveBeenCalled();
      });
      
      // Switch to categories tab
      const categoriesTab = screen.getByText(/category assignment/i);
      await user.click(categoriesTab);
      
      await waitFor(() => {
        expect(mockMagentoApi.getCategories).toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // PRODUCT CRUD OPERATIONS
  // ============================================================================

  describe('Product CRUD Operations', () => {
    describe('Create Product', () => {
      it('opens add product dialog', async () => {
        const user = userEvent.setup();
        renderProductManagementPage();
        
        const addButton = screen.getByLabelText(/add product/i);
        await user.click(addButton);
        
        expect(screen.getByText(/add new product/i)).toBeInTheDocument();
      });

      it('creates new product with valid data', async () => {
        const user = userEvent.setup();
        renderProductManagementPage();
        
        // Open add dialog
        const addButton = screen.getByLabelText(/add product/i);
        await user.click(addButton);
        
        // Fill form
        await user.type(screen.getByLabelText(/sku/i), 'NEW-PROD-001');
        await user.type(screen.getByLabelText(/product name/i), 'New Test Product');
        await user.type(screen.getByLabelText(/price/i), '199.99');
        
        // Submit form
        const submitButton = screen.getByText(/save/i);
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(mockMagentoApi.createProduct).toHaveBeenCalledWith({
            sku: 'NEW-PROD-001',
            name: 'New Test Product',
            price: '199.99'
          });
        });
      });

      it('validates required fields', async () => {
        const user = userEvent.setup();
        renderProductManagementPage();
        
        // Open add dialog
        const addButton = screen.getByLabelText(/add product/i);
        await user.click(addButton);
        
        // Try to submit without required fields
        const submitButton = screen.getByText(/save/i);
        await user.click(submitButton);
        
        expect(screen.getByText(/sku is required/i)).toBeInTheDocument();
        expect(screen.getByText(/product name is required/i)).toBeInTheDocument();
      });
    });

    describe('Update Product', () => {
      it('opens edit dialog with product data', async () => {
        const user = userEvent.setup();
        renderProductManagementPage();
        
        // Wait for products to load
        await waitFor(() => {
          expect(screen.getByTestId('product-management-grid')).toBeInTheDocument();
        });
        
        // Select product and edit
        const editButton = screen.getByLabelText(/edit/i);
        await user.click(editButton);
        
        expect(screen.getByText(/edit product/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('PROD-001')).toBeInTheDocument();
      });

      it('updates product with changes', async () => {
        const user = userEvent.setup();
        renderProductManagementPage();
        
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
              name: 'Updated Product Name'
            })
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
        
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      it('deletes selected products', async () => {
        const user = userEvent.setup();
        renderProductManagementPage();
        
        // Select product
        const checkbox = screen.getByRole('checkbox', { name: /select row/i });
        await user.click(checkbox);
        
        // Delete
        const deleteButton = screen.getByLabelText(/delete/i);
        await user.click(deleteButton);
        
        // Confirm deletion
        const confirmButton = screen.getByText(/delete/i);
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
  // ============================================================================

  describe('Filtering and Search', () => {
    it('filters products by brand', async () => {
      const user = userEvent.setup();
      renderProductManagementPage();
      
      // Wait for brands to load
      await waitFor(() => {
        expect(screen.getByLabelText(/brand/i)).toBeInTheDocument();
      });
      
      // Select brand filter
      const brandFilter = screen.getByLabelText(/brand/i);
      await user.click(brandFilter);
      await user.click(screen.getByText('Test Brand'));
      
      // Should filter products
      expect(mockMagentoApi.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            brand: 'Test Brand'
          })
        })
      );
    });

    it('filters products by status', async () => {
      const user = userEvent.setup();
      renderProductManagementPage();
      
      const statusFilter = screen.getByLabelText(/status/i);
      await user.click(statusFilter);
      await user.click(screen.getByText('Active'));
      
      expect(mockMagentoApi.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            status: '1'
          })
        })
      );
    });

    it('searches products by name', async () => {
      const user = userEvent.setup();
      renderProductManagementPage();
      
      const searchInput = screen.getByPlaceholderText(/search products/i);
      await user.type(searchInput, 'Test Product');
      
      await waitFor(() => {
        expect(mockMagentoApi.getProducts).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'Test Product'
          })
        );
      }, { timeout: 1000 }); // Debounced search
    });

    it('clears all filters', async () => {
      const user = userEvent.setup();
      renderProductManagementPage();
      
      // Apply some filters first
      const brandFilter = screen.getByLabelText(/brand/i);
      await user.click(brandFilter);
      await user.click(screen.getByText('Test Brand'));
      
      // Clear filters
      const clearButton = screen.getByText(/clear filters/i);
      await user.click(clearButton);
      
      expect(mockMagentoApi.getProducts).toHaveBeenCalledWith(
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
    it('enables bulk actions when products are selected', async () => {
      const user = userEvent.setup();
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
      const bulkDeleteButton = screen.getByText(/delete selected/i);
      await user.click(bulkDeleteButton);
      
      // Confirm
      const confirmButton = screen.getByText(/delete/i);
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(mockMagentoApi.deleteProduct).toHaveBeenCalledTimes(mockProducts.length);
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
            status: 0
          })
        );
      });
    });
  });

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
        price: 99.99,
        status: 1
      }));
      
      mockMagentoApi.getProducts.mockResolvedValue({
        data: { items: largeProductList, total_count: 1000 }
      });
      
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
      
      await user.type(screen.getByLabelText(/sku/i), 'DUPLICATE-SKU');
      await user.type(screen.getByLabelText(/product name/i), 'Test Product');
      
      const submitButton = screen.getByText(/save/i);
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/sku already exists/i)).toBeInTheDocument();
      });
    });

    it('shows network error messages', async () => {
      const networkError = new Error('Network Error');
      mockMagentoApi.getProducts.mockRejectedValue(networkError);
      
      renderProductManagementPage();
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });
    });

    it('recovers from errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Start with error
      mockMagentoApi.getProducts.mockRejectedValue(new Error('Server Error'));
      
      renderProductManagementPage();
      
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
      
      // Fix the API and retry
      mockMagentoApi.getProducts.mockResolvedValue({
        data: { items: mockProducts, total_count: mockProducts.length }
      });
      
      const retryButton = screen.getByText(/retry/i);
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('product-management-grid')).toBeInTheDocument();
      });
    });
  });
});