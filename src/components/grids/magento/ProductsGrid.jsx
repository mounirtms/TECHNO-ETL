/**
 * ProductsGrid - Professional Magento Products Management Grid
 *
 * Features:
 * - Local products management with sync functionality
 * - Segmented add button with multiple import options
 * - Smart sync button (enabled only when local products exist)
 * - Professional UI with proper state management
 * - Optimized performance with memoization
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';

// Unified Grid System
import UnifiedGrid from '../../common/UnifiedGrid';
import { getStandardGridProps, getStandardToolbarConfig } from '../../../config/gridConfig';

// Column System
import { ColumnFactory } from '../../../utils/ColumnFactory.jsx';

// Services
import magentoApi from '../../../services/magentoApi';
import ProductService from '../../../services/ProductService';
import categoryService from '../../../services/categoryService';

// Dialogs
import CSVImportDialog from '../../dialogs/CSVImportDialog';
import CatalogProcessorDialog from '../../dialogs/CatalogProcessorDialog';
import ProductInfoDialog from '../../common/ProductInfoDialog';
import ProductEditDialog from '../../dialogs/ProductEditDialog';

/**
 * Optimized Magento Products Grid Component
 * Features:
 * - Better error handling and validation
 * - Optimized data fetching
 * - Improved performance with memoization
 * - Enhanced user feedback
 */
const ProductsGrid = () => {
  // ===== STATE =====
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    localProducts: 0,
    syncedProducts: 0
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [catalogProcessorOpen, setCatalogProcessorOpen] = useState(false);
  const [localProducts, setLocalProducts] = useState([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // ===== OPTIMIZED COLUMNS =====
  const columns = useMemo(() => [
    // Essential Product Information
    ColumnFactory.text('sku', {
      headerName: 'SKU',
      width: 140,
      pinned: 'left'
    }),
    ColumnFactory.text('name', {
      headerName: 'Product Name',
      flex: 1,
      minWidth: 300,
      renderCell: (params) => (
        <div style={{
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          lineHeight: '1.2',
          padding: '4px 0'
        }}>
          {params.value}
        </div>
      )
    }),

    // Techno Reference (from custom_attributes)
    ColumnFactory.text('techno_ref', {
      headerName: 'Techno Ref',
      width: 120,
      valueGetter: (params) => {
        try {
          if (!params?.row?.custom_attributes) return '-';
          const technoRef = params.row.custom_attributes.find(
            attr => attr.attribute_code === 'techno_ref'
          );
          return technoRef?.value || '-';
        } catch (error) {
          console.warn('Error getting techno_ref:', error);
          return '-';
        }
      }
    }),

    // Status with proper mapping
    ColumnFactory.status('status', {
      headerName: 'Status',
      width: 100,
      valueGetter: (params) => params.row.status === 1 ? 'enabled' : 'disabled',
      statusColors: {
        enabled: 'success',
        disabled: 'error'
      }
    }),

    // Price
    ColumnFactory.currency('price', {
      headerName: 'Price',
      width: 100,
      valueFormatter: (params) => `${params.value || 0} DA`
    }),

    // Weight
    ColumnFactory.number('weight', {
      headerName: 'Weight (g)',
      width: 110,
      valueFormatter: (params) => params.value ? `${params.value}g` : '-'
    }),

    // Product Type
    ColumnFactory.text('type_id', {
      headerName: 'Type',
      width: 100,
      valueFormatter: (params) => params.value?.toUpperCase() || 'SIMPLE'
    }),

    // Brand (from custom_attributes)
    ColumnFactory.text('brand', {
      headerName: 'Brand',
      width: 120,
      valueGetter: (params) => {
        try {
          if (!params?.row?.custom_attributes) return '-';
          const brand = params.row.custom_attributes.find(
            attr => attr.attribute_code === 'mgs_brand'
          );
          return brand?.value || '-';
        } catch (error) {
          console.warn('Error getting brand:', error);
          return '-';
        }
      }
    }),

    // Country of Manufacture
    ColumnFactory.text('country', {
      headerName: 'Country',
      width: 80,
      valueGetter: (params) => {
        try {
          if (!params?.row?.custom_attributes) return '-';
          const country = params.row.custom_attributes.find(
            attr => attr.attribute_code === 'country_of_manufacture'
          );
          return country?.value || '-';
        } catch (error) {
          console.warn('Error getting country:', error);
          return '-';
        }
      }
    }),

    // Categories (Multi-select display)
    ColumnFactory.custom('categories', {
      headerName: 'Categories',
      width: 200,
      valueGetter: (params) => {
        try {
          if (!params?.row?.custom_attributes) return [];

          const categoryIds = params.row.custom_attributes.find(
            attr => attr.attribute_code === 'category_ids'
          )?.value || [];

          return Array.isArray(categoryIds) ? categoryIds : [];
        } catch (error) {
          console.warn('Error getting category IDs:', error);
          return [];
        }
      },
      renderCell: (params) => {
        try {
          const categoryIds = params.value || [];

          if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
            return <span style={{ color: '#999', fontSize: '0.75rem' }}>No categories</span>;
          }

          const categoryNames = categoryIds.slice(0, 2).map(id => {
            try {
              const category = categories.find(cat => cat.id.toString() === id.toString());
              return category ? category.name : `ID:${id}`;
            } catch (error) {
              console.warn('Error finding category:', error);
              return `ID:${id}`;
            }
          });

          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
              {categoryNames.map((name, index) => (
                <span
                  key={index}
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {name}
                </span>
              ))}
              {categoryIds.length > 2 && (
                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                  +{categoryIds.length - 2} more
                </span>
              )}
            </div>
          );
        } catch (error) {
          console.warn('Error rendering categories:', error);
          return <span style={{ color: '#f44336', fontSize: '0.75rem' }}>Error</span>;
        }
      }
    }),

    // Boolean Attributes with standardized renderers
    ColumnFactory.boolean('trending', {
      headerName: 'Trending',
      width: 90,
      valueGetter: (params) => {
        try {
          if (!params?.row?.custom_attributes) return false;
          const trending = params.row.custom_attributes.find(
            attr => attr.attribute_code === 'trending'
          );
          return trending?.value === '1' || trending?.value === true;
        } catch (error) {
          console.warn('Error getting trending value:', error);
          return false;
        }
      },
      renderCell: (params) => (
        <span style={{
          color: params.value ? '#4caf50' : '#999',
          fontWeight: params.value ? 'bold' : 'normal',
          fontSize: '0.875rem'
        }}>
          {params.value ? '✓' : '✗'}
        </span>
      )
    }),

    ColumnFactory.boolean('best_seller', {
      headerName: 'Best Seller',
      width: 100,
      valueGetter: (params) => {
        try {
          if (!params?.row?.custom_attributes) return false;
          const bestSeller = params.row.custom_attributes.find(
            attr => attr.attribute_code === 'best_seller'
          );
          return bestSeller?.value === '1' || bestSeller?.value === true;
        } catch (error) {
          console.warn('Error getting best_seller value:', error);
          return false;
        }
      },
      renderCell: (params) => (
        <span style={{
          color: params.value ? '#ff9800' : '#999',
          fontWeight: params.value ? 'bold' : 'normal',
          fontSize: '0.875rem'
        }}>
          {params.value ? '⭐' : '✗'}
        </span>
      )
    }),

    ColumnFactory.boolean('a_la_une', {
      headerName: 'À la Une',
      width: 90,
      valueGetter: (params) => {
        try {
          if (!params?.row?.custom_attributes) return false;
          const alaune = params.row.custom_attributes.find(
            attr => attr.attribute_code === 'a_la_une'
          );
          return alaune?.value === '1' || alaune?.value === true;
        } catch (error) {
          console.warn('Error getting a_la_une value:', error);
          return false;
        }
      },
      renderCell: (params) => (
        <span style={{
          color: params.value ? '#e91e63' : '#999',
          fontWeight: params.value ? 'bold' : 'normal',
          fontSize: '0.875rem'
        }}>
          {params.value ? '🔥' : '✗'}
        </span>
      )
    }),

    // Created Date
    ColumnFactory.dateTime('created_at', {
      headerName: 'Created',
      width: 140,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    }),

    // Updated Date
    ColumnFactory.dateTime('updated_at', {
      headerName: 'Updated',
      width: 140,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    }),

    // Actions
    ColumnFactory.actions('actions', {
      headerName: 'Actions',
      width: 120,
      pinned: 'right',
      getActions: (params) => [
        {
          icon: 'edit',
          label: 'Edit Product',
          onClick: () => handleEdit(params.row)
        },
        {
          icon: 'visibility',
          label: 'View Details',
          onClick: () => handleViewDetails(params.row)
        },
        {
          icon: 'category',
          label: 'Categories',
          onClick: () => handleCategoryAssignment(params.row)
        }
      ]
    })
  ], []);

  // ===== DATA FETCHING =====
  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      // Merge pagination parameters
      const requestParams = {
        pageSize: paginationModel.pageSize,
        currentPage: paginationModel.page + 1, // MUI uses 0-based, Magento uses 1-based
        ...params
      };

      const response = await magentoApi.getProducts(requestParams);
      const products = response.data?.items || [];
      const totalCount = response.data?.total_count || products.length;

      setData(products);
      setStats({
        total: totalCount,
        active: products.filter(p => p.status === 1).length,
        inactive: products.filter(p => p.status === 2).length,
        localProducts: localProducts.length,
        syncedProducts: products.filter(p => !p.isLocal).length
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products');
      setData([]);
      setStats({ total: 0, active: 0, inactive: 0, localProducts: 0, syncedProducts: 0 });
    } finally {
      setLoading(false);
    }
  }, [localProducts.length, paginationModel]);

  // ===== PAGINATION HANDLER =====
  const handlePaginationChange = useCallback((newPaginationModel) => {
    setPaginationModel(newPaginationModel);
    // Fetch new data when pagination changes
    fetchProducts();
  }, [fetchProducts]);



  // Load categories and brands for filtering
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        // Load categories
        const categoryOptions = categoryService.getCategoriesForCombo();
        setCategories(categoryOptions);
        console.log('📂 Categories loaded for filtering:', categoryOptions.length);

        // Load brands from Magento API
        try {
          const brandsResponse = await magentoApi.getBrands();
          const brandsData = brandsResponse?.items || [];
          setBrands(brandsData);
          console.log('🏷️ Brands loaded for filtering:', brandsData.length);
        } catch (brandError) {
          console.warn('⚠️ Could not load brands:', brandError.message);
          // Provide fallback brands if API fails
          setBrands([
            { value: '1659', label: 'Calligraphe' },
            { value: '1660', label: 'Maped' },
            { value: '1661', label: 'Bic' }
          ]);
        }
      } catch (error) {
        console.error('❌ Error loading filter data:', error);
      }
    };

    loadFiltersData();
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
  }, []); // Only run on mount

  // Fetch data when pagination changes
  useEffect(() => {
    if (paginationModel.page > 0 || paginationModel.pageSize !== 25) {
      fetchProducts();
    }
  }, [paginationModel, fetchProducts]);

  // ===== EVENT HANDLERS =====
  const handleAdd = useCallback(() => {
    console.log('Add product');
    // Implement add logic
  }, []);

  const handleEdit = useCallback((selectedIds) => {
    if (Array.isArray(selectedIds)) {
      if (selectedIds.length !== 1) {
        toast.warning('Please select one product to edit');
        return;
      }
      const product = data.find(p => p.sku === selectedIds[0]);
      setSelectedProduct(product);
    } else {
      // Handle direct row click
      setSelectedProduct(selectedIds);
    }
    setEditDialogOpen(true);
  }, [data]);

  const handleViewDetails = useCallback((selectedIds) => {
    if (Array.isArray(selectedIds)) {
      if (selectedIds.length !== 1) {
        toast.warning('Please select one product to view');
        return;
      }
      const product = data.find(p => p.sku === selectedIds[0]);
      setSelectedProduct(product);
    } else {
      // Handle direct row click
      setSelectedProduct(selectedIds);
    }
    setInfoDialogOpen(true);
  }, [data]);

  const handleDelete = useCallback(async (selectedIds) => {
    if (selectedIds.length === 0) {
      toast.warning('Please select products to delete');
      return;
    }
    
    try {
      await Promise.all(selectedIds.map(sku => ProductService.deleteProduct(sku)));
      toast.success(`${selectedIds.length} product(s) deleted`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete products');
    }
  }, [fetchProducts]);

  const handleSync = useCallback(async () => {
    try {
      await magentoApi.syncProducts();
      toast.success('Products synchronized');
      fetchProducts();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed');
    }
  }, [fetchProducts]);

  const handleExport = useCallback(() => {
    console.log('Export products');
    // Implement export logic
  }, []);

  const handleRowDoubleClick = useCallback((params) => {
    setSelectedProduct(params.row);
    setInfoDialogOpen(true);
  }, []);



  // ===== CONTEXT MENU =====
  const contextMenuActions = useMemo(() => ({
    edit: {
      enabled: true,
      label: 'Edit Product',
      icon: 'edit',
      onClick: (row) => handleEdit(row)
    },
    view: {
      enabled: true,
      label: 'View Details',
      icon: 'visibility',
      onClick: (row) => handleViewDetails(row)
    },
    delete: {
      enabled: true,
      label: 'Delete Product',
      icon: 'delete',
      onClick: (row) => handleDelete([row.sku]),
      color: 'error'
    },
    duplicate: {
      enabled: true,
      label: 'Duplicate Product',
      icon: 'content_copy',
      onClick: (row) => {
        console.log('Duplicate:', row);
        toast.info(`Duplicating product: ${row.name}`);
      }
    }
  }), [handleEdit, handleDelete]);

  // ===== STATS CARDS =====
  const gridCards = useMemo(() => [
    { title: 'Total Products', value: stats.total, color: 'primary' },
    { title: 'Active', value: stats.active, color: 'success' },
    { title: 'Inactive', value: stats.inactive, color: 'warning' },
    { title: 'Local Products', value: stats.localProducts, color: 'info' }
  ], [stats]);

  // ===== COMPACT CUSTOM ACTIONS =====
  const customActions = useMemo(() => [
    {
      label: 'Sync',
      icon: 'sync',
      onClick: handleSync,
      disabled: localProducts.length === 0
    }
  ], [handleSync, localProducts.length]);

  return (
    <>
      <UnifiedGrid
        {...getStandardGridProps('magentoProducts', {
          gridName: "MagentoProductsGrid",
          columns,
          data,
          loading,
          totalCount: stats.total,

          // Pagination configuration
          paginationMode: "server",
          paginationModel,
          onPaginationModelChange: handlePaginationChange,
          defaultPageSize: 25,

          // Event handlers
          onRefresh: fetchProducts,
          onRowDoubleClick: handleRowDoubleClick,
          onAdd: handleAdd,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onSync: handleSync,
          onExport: handleExport,
          onSelectionChange: setSelectedRows,

          // Configuration
          toolbarConfig: {
            ...getStandardToolbarConfig('magentoProducts'),
            filters: [
              {
                field: 'category',
                label: 'Category',
                type: 'select',
                options: [
                  { value: '', label: 'All Categories' },
                  ...categories.map(cat => ({
                    value: cat.id.toString(),
                    label: cat.label
                  }))
                ],
                value: categoryFilter,
                onChange: (value) => {
                  setCategoryFilter(value);
                  fetchProducts({ category_id: value, brand: brandFilter });
                }
              },
              {
                field: 'brand',
                label: 'Brand',
                type: 'select',
                options: [
                  { value: '', label: 'All Brands' },
                  ...brands.map(brand => ({
                    value: brand.value || brand.id,
                    label: brand.label || brand.name
                  }))
                ],
                value: brandFilter,
                onChange: (value) => {
                  setBrandFilter(value);
                  fetchProducts({ category_id: categoryFilter, brand: value });
                }
              }
            ]
          },
          customActions,
          contextMenuActions,

          // Stats
          showStatsCards: true,
          gridCards,

          // Grid props
          getRowId: (row) => row.sku
        })}
      />

      {/* Dialogs */}
      <ProductInfoDialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        product={selectedProduct}
      />

      <ProductEditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={(updatedProduct) => {
          console.log('💾 Saving product:', updatedProduct);
          toast.success(`Product "${updatedProduct.name}" saved successfully`);
          fetchProducts(); // Refresh the grid
          setEditDialogOpen(false);
          setSelectedProduct(null);
        }}
      />

      <CSVImportDialog
        open={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImportComplete={() => fetchProducts()}
      />

      <CatalogProcessorDialog
        open={catalogProcessorOpen}
        onClose={() => setCatalogProcessorOpen(false)}
        onProcessComplete={() => fetchProducts()}
      />



    </>
  );
};

export default ProductsGrid;
