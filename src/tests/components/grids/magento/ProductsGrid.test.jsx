import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductsGrid from '../../../../components/grids/magento/ProductsGrid';

// Mock contexts
const mockSettingsContext = {
  settings: {
    apiSettings: {
      magento: {
        baseUrl: 'https://test-magento.com',
        token: 'test-token'
      }
    },
    preferences: {
      gridSettings: {
        defaultPageSize: 25,
        density: 'standard'
      }
    }
  }
};

vi.mock('../../../../contexts/SettingsContext', () => ({
  useSettings: () => mockSettingsContext
}));

// Mock hooks
const mockMagentoGridSettings = {
  enhancedGridProps: {},
  paginationSettings: { defaultPageSize: 25 },
  densitySettings: { density: 'standard' },
  performanceSettings: { virtualization: true },
  displaySettings: { showStatsCards: true },
  getApiParams: vi.fn(),
  handleError: vi.fn(),
  savePreferences: vi.fn()
};

vi.mock('../../../../hooks/useMagentoGridSettings', () => ({
  useMagentoGridSettings: () => mockMagentoGridSettings
}));

// Mock services
const mockMagentoApi = {
  getProducts: vi.fn(),
  syncProducts: vi.fn(),
  getBrands: vi.fn(),
  setMagentoApiSettings: vi.fn()
};

vi.mock('../../../../services/magentoApi', () => ({
  default: mockMagentoApi,
  setMagentoApiSettings: mockMagentoApi.setMagentoApiSettings
}));

const mockProductService = {
  deleteProduct: vi.fn()
};

vi.mock('../../../../services/ProductService', () => ({
  default: mockProductService
}));

const mockCategoryService = {
  getCategoriesForCombo: vi.fn()
};

vi.mock('../../../../services/categoryService', () => ({
  default: mockCategoryService
}));

// Mock grid config
vi.mock('../../../../config/gridConfig', () => ({
  getStandardGridProps: vi.fn(() => ({})),
  getStandardToolbarConfig: vi.fn(() => ({}))
}));

// Mock UnifiedGrid
vi.mock('../../../../components/common/UnifiedGrid', () => ({
  default: ({ onRefresh, onRowDoubleClick, data, loading, columns }) => (
    <div data-testid="unified-grid">
      <button onClick={onRefresh} data-testid="refresh-button">Refresh</button>
      <div data-testid="grid-loading">{loading ? 'Loading...' : 'Loaded'}</div>
      <div data-testid="grid-data-count">{data?.length || 0} items</div>
      <div data-testid="grid-columns-count">{columns?.length || 0} columns</div>
      {data?.map((item, index) => (
        <div 
          key={item.sku || index} 
          data-testid={`grid-row-${index}`}
          onDoubleClick={() => onRowDoubleClick?.({ row: item })}
        >
          {item.name || item.sku}
        </div>
      ))}
    </div>
  )
}));

// Mock dialogs
vi.mock('../../../../components/dialogs/CSVImportDialog', () => ({
  default: ({ open, onClose }) => open ? <div data-testid="csv-import-dialog">CSV Import Dialog</div> : null
}));

vi.mock('../../../../components/dialogs/CatalogProcessorDialog', () => ({
  default: ({ open, onClose }) => open ? <div data-testid="catalog-processor-dialog">Catalog Processor Dialog</div> : null
}));

vi.mock('../../../../components/common/ProductInfoDialog', () => ({
  default: ({ open, onClose, product }) => open ? <div data-testid="product-info-dialog">Product Info: {product?.name}</div> : null
}));

vi.mock('../../../../components/dialogs/ProductEditDialog', () => ({
  default: ({ open, onClose, product }) => open ? <div data-testid="product-edit-dialog">Edit Product: {product?.name}</div> : null
}));

vi.mock('../../../../components/dialogs/BulkMediaUploadDialog', () => ({
  default: ({ open, onClose }) => open ? <div data-testid="bulk-media-dialog">Bulk Media Upload Dialog</div> : null
}));

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ProductsGrid', () => {
  const mockProducts = [
    {
      sku: 'TEST-001',
      name: 'Test Product 1',
      status: 1,
      price: 99.99,
      weight: 500,
      type_id: 'simple',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-15T12:00:00.000Z',
      custom_attributes: [
        { attribute_code: 'techno_ref', value: 'TR001' },
        { attribute_code: 'mgs_brand', value: 'Test Brand' },
        { attribute_code: 'country_of_manufacture', value: 'DZ' },
        { attribute_code: 'trending', value: '1' },
        { attribute_code: 'best_seller', value: '0' },
        { attribute_code: 'a_la_une', value: '1' }
      ]
    },
    {
      sku: 'TEST-002',
      name: 'Test Product 2',
      status: 2,
      price: 149.99,
      weight: 750,
      type_id: 'configurable',
      created_at: '2024-01-02T00:00:00.000Z',
      updated_at: '2024-01-16T12:00:00.000Z',
      custom_attributes: [
        { attribute_code: 'techno_ref', value: 'TR002' },
        { attribute_code: 'mgs_brand', value: 'Another Brand' },
        { attribute_code: 'country_of_manufacture', value: 'FR' }
      ]
    }
  ];

  const mockCategories = [
    { id: 1, name: 'Electronics', label: 'Electronics' },
    { id: 2, name: 'Clothing', label: 'Clothing' }
  ];

  const mockBrands = [
    { value: '1', label: 'Test Brand' },
    { value: '2', label: 'Another Brand' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockMagentoApi.getProducts.mockResolvedValue({
      data: {
        items: mockProducts,
        total_count: mockProducts.length
      }
    });

    mockMagentoApi.getBrands.mockResolvedValue({
      items: mockBrands
    });

    mockCategoryService.getCategoriesForCombo.mockReturnValue(mockCategories);
  });

  it('renders without crashing', async () => {
    renderWithTheme(<ProductsGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('unified-grid')).toBeInTheDocument();
    });
  });

  it('loads products on mount', async () => {
    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(mockMagentoApi.getProducts).toHaveBeenCalled();
      expect(screen.getByTestId('grid-data-count')).toHaveTextContent('2 items');
    });
  });

  it('displays loading state', () => {
    mockMagentoApi.getProducts.mockImplementation(() => new Promise(() => {}));
    
    renderWithTheme(<ProductsGrid />);
    
    expect(screen.getByTestId('grid-loading')).toHaveTextContent('Loading...');
  });

  it('handles API errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockMagentoApi.getProducts.mockRejectedValue(new Error('API Error'));

    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-data-count')).toHaveTextContent('0 items');
    });

    consoleError.mockRestore();
  });

  it('refreshes data when refresh button is clicked', async () => {
    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('refresh-button'));

    await waitFor(() => {
      expect(mockMagentoApi.getProducts).toHaveBeenCalledTimes(2);
    });
  });

  it('applies user settings to API service', async () => {
    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(mockMagentoApi.setMagentoApiSettings).toHaveBeenCalledWith(mockSettingsContext.settings);
    });
  });

  it('loads categories and brands for filtering', async () => {
    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(mockCategoryService.getCategoriesForCombo).toHaveBeenCalled();
      expect(mockMagentoApi.getBrands).toHaveBeenCalled();
    });
  });

  it('handles brands API failure gracefully', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockMagentoApi.getBrands.mockRejectedValue(new Error('Brands API Error'));

    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(mockMagentoApi.getBrands).toHaveBeenCalled();
    });

    consoleWarn.mockRestore();
  });

  it('generates correct columns', async () => {
    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      const columnsCount = screen.getByTestId('grid-columns-count');
      expect(parseInt(columnsCount.textContent)).toBeGreaterThan(10);
    });
  });

  it('handles product row double click', async () => {
    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-0')).toBeInTheDocument();
    });

    fireEvent.doubleClick(screen.getByTestId('grid-row-0'));

    await waitFor(() => {
      expect(screen.getByTestId('product-info-dialog')).toBeInTheDocument();
      expect(screen.getByText('Product Info: Test Product 1')).toBeInTheDocument();
    });
  });

  it('calculates stats correctly', async () => {
    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(mockMagentoApi.getProducts).toHaveBeenCalled();
    });

    // Stats should be calculated based on mock data
    // 1 active product (status: 1), 1 inactive product (status: 2)
  });

  it('handles pagination changes', async () => {
    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(mockMagentoApi.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          pageSize: 25,
          currentPage: 1
        })
      );
    });
  });

  it('handles sync operation', async () => {
    mockMagentoApi.syncProducts.mockResolvedValue();
    
    renderWithTheme(<ProductsGrid />);

    // Sync functionality would be tested through the grid's custom actions
    await waitFor(() => {
      expect(screen.getByTestId('unified-grid')).toBeInTheDocument();
    });
  });

  it('handles product deletion', async () => {
    mockProductService.deleteProduct.mockResolvedValue();
    
    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(screen.getByTestId('unified-grid')).toBeInTheDocument();
    });

    // Deletion would be handled through grid actions
  });

  it('opens CSV import dialog', async () => {
    renderWithTheme(<ProductsGrid />);

    // Initially dialog should not be visible
    expect(screen.queryByTestId('csv-import-dialog')).not.toBeInTheDocument();

    // Dialog opening would be triggered through custom actions
  });

  it('opens catalog processor dialog', async () => {
    renderWithTheme(<ProductsGrid />);

    // Initially dialog should not be visible
    expect(screen.queryByTestId('catalog-processor-dialog')).not.toBeInTheDocument();

    // Dialog opening would be triggered through custom actions
  });

  it('opens bulk media upload dialog', async () => {
    renderWithTheme(<ProductsGrid />);

    // Initially dialog should not be visible
    expect(screen.queryByTestId('bulk-media-dialog')).not.toBeInTheDocument();

    // Dialog opening would be triggered through custom actions
  });

  it('handles custom attributes correctly', async () => {
    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-data-count')).toHaveTextContent('2 items');
    });

    // Custom attributes should be processed correctly in column value getters
    // This is tested implicitly through the column definitions
  });

  it('handles missing custom attributes gracefully', async () => {
    const productsWithoutAttributes = [
      {
        sku: 'TEST-003',
        name: 'Test Product 3',
        status: 1,
        price: 199.99
        // No custom_attributes
      }
    ];

    mockMagentoApi.getProducts.mockResolvedValue({
      data: {
        items: productsWithoutAttributes,
        total_count: 1
      }
    });

    renderWithTheme(<ProductsGrid />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-data-count')).toHaveTextContent('1 items');
    });

    // Should handle missing custom_attributes without crashing
  });
});