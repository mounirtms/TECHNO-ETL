import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Chip } from '@mui/material';
import { toast } from 'react-toastify';
import BaseMagentoGrid from '../base/BaseMagentoGrid';
import { useSettings } from '../../../contexts/SettingsContext';
import { ColumnFactory } from '../../../utils/ColumnFactory';
import magentoApi from '../../../services/magentoApi';
import categoryService from '../../../services/categoryService';

// Dialogs
import CSVImportDialog from '../../dialogs/CSVImportDialog';
import CatalogProcessorDialog from '../../dialogs/CatalogProcessorDialog';
import ProductInfoDialog from '../../common/ProductInfoDialog';
import ProductEditDialog from '../../dialogs/ProductEditDialog';
import BulkMediaUploadDialog from '../../dialogs/BulkMediaUploadDialog';

/**
 * Refactored ProductsGrid using BaseMagentoGrid
 * Implements DRY principles and proper inheritance
 */
const ProductsGrid = () => {
  const { settings } = useSettings();
  
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Dialog states
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkMediaDialogOpen, setBulkMediaDialogOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [catalogProcessorOpen, setCatalogProcessorOpen] = useState(false);
  
  // Filter states
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Statistics
  const stats = useMemo(() => ({
    total: data.length,
    active: data.filter(p => p.status === 1).length,
    inactive: data.filter(p => p.status === 2).length,
    local: data.filter(p => p.isLocal).length
  }), [data]);

  // Optimized columns definition
  const columns = useMemo(() => [
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
        <Box sx={{ 
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          lineHeight: 1.2,
          py: 0.5
        }}>
          {params.value}
        </Box>
      )
    }),
    {
      field: 'techno_ref',
      headerName: 'Techno Ref',
      width: 120,
      valueGetter: (params) => {
        const technoRef = params.row.custom_attributes?.find(
          attr => attr.attribute_code === 'techno_ref'
        );
        return technoRef?.value || '-';
      }
    },
    ColumnFactory.status('status', {
      headerName: 'Status',
      width: 100,
      valueGetter: (params) => params.row.status === 1 ? 'enabled' : 'disabled',
      statusColors: {
        enabled: 'success',
        disabled: 'error'
      }
    }),
    ColumnFactory.currency('price', {
      headerName: 'Price',
      width: 100,
      valueFormatter: (params) => `${params.value || 0} DA`
    }),
    {
      field: 'categories',
      headerName: 'Categories',
      width: 200,
      valueGetter: (params) => {
        const categoryIds = params.row.custom_attributes?.find(
          attr => attr.attribute_code === 'category_ids'
        )?.value || [];
        return Array.isArray(categoryIds) ? categoryIds : [];
      },
      renderCell: (params) => {
        const categoryIds = params.value || [];
        if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
          return <Chip size="small" label="No categories" variant="outlined" />;
        }

        const categoryNames = categoryIds.slice(0, 2).map(id => {
          const category = categories.find(cat => cat.id.toString() === id.toString());
          return category ? category.name : `ID:${id}`;
        });

        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
            {categoryNames.map((name, index) => (
              <Chip
                key={index}
                size="small"
                label={name}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
            {categoryIds.length > 2 && (
              <Chip
                size="small"
                label={`+${categoryIds.length - 2}`}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
        );
      }
    },
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
        }
      ]
    })
  ], [categories]);

  // Data fetching
  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await magentoApi.getProducts({
        pageSize: 25,
        currentPage: 1,
        ...params
      });
      
      const products = response.data?.items || [];
      setData(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load filter data
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        // Load categories
        const categoryOptions = categoryService.getCategoriesForCombo();
        setCategories(categoryOptions);

        // Load brands
        try {
          const brandsResponse = await magentoApi.getBrands();
          setBrands(brandsResponse?.items || []);
        } catch (brandError) {
          console.warn('Could not load brands:', brandError.message);
          setBrands([
            { value: '1659', label: 'Calligraphe' },
            { value: '1660', label: 'Maped' },
            { value: '1661', label: 'Bic' }
          ]);
        }
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };

    loadFiltersData();
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRowClick = useCallback((params) => {
    setSelectedProduct(params.row);
    setInfoDialogOpen(true);
  }, []);

  const handleEdit = useCallback((product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((product) => {
    setSelectedProduct(product);
    setInfoDialogOpen(true);
  }, []);

  const handleExport = useCallback((selectedRows) => {
    console.log('Export products:', selectedRows);
    toast.info('Export functionality will be implemented');
  }, []);

  const handleImport = useCallback(() => {
    setCsvImportOpen(true);
  }, []);

  const handleBulkAction = useCallback((actionType, selectedRows) => {
    switch (actionType) {
      case 'delete':
        console.log('Delete products:', selectedRows);
        toast.info(`Delete ${selectedRows.length} products`);
        break;
      case 'enable':
        console.log('Enable products:', selectedRows);
        toast.info(`Enable ${selectedRows.length} products`);
        break;
      case 'disable':
        console.log('Disable products:', selectedRows);
        toast.info(`Disable ${selectedRows.length} products`);
        break;
      default:
        toast.warning(`Unknown action: ${actionType}`);
    }
  }, []);

  // Bulk actions configuration
  const bulkActions = useMemo(() => [
    { id: 'enable', label: 'Enable Products', icon: 'visibility' },
    { id: 'disable', label: 'Disable Products', icon: 'visibility_off' },
    { id: 'delete', label: 'Delete Products', icon: 'delete', color: 'error' }
  ], []);

  // Toolbar configuration
  const toolbarConfig = useMemo(() => ({
    customActions: [
      {
        label: 'Bulk Media Upload',
        icon: 'image',
        onClick: () => setBulkMediaDialogOpen(true),
        color: 'info'
      },
      {
        label: 'Catalog Processor',
        icon: 'settings',
        onClick: () => setCatalogProcessorOpen(true)
      }
    ],
    filters: [
      {
        field: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { value: '', label: 'All Categories' },
          ...categories.map(cat => ({
            value: cat.id?.toString() || '',
            label: cat.label || `Category ${cat.id}`
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
  }), [categories, brands, categoryFilter, brandFilter, fetchProducts]);

  return (
    <>
      <BaseMagentoGrid
        title="Magento Products"
        columns={columns}
        rows={data}
        loading={loading}
        error={error}
        onRowClick={handleRowClick}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onImport={handleImport}
        onBulkAction={handleBulkAction}
        toolbarConfig={toolbarConfig}
        bulkActions={bulkActions}
        enableSettings={true}
        enableExport={true}
        enableImport={true}
        enableBulkActions={true}
        gridConfig={{
          getRowId: (row) => row.sku,
          rowHeight: 60
        }}
      >
        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Chip label={`Total: ${stats.total}`} color="primary" />
          <Chip label={`Active: ${stats.active}`} color="success" />
          <Chip label={`Inactive: ${stats.inactive}`} color="warning" />
          <Chip label={`Local: ${stats.local}`} color="info" />
        </Box>
      </BaseMagentoGrid>

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
          toast.success(`Product "${updatedProduct.name}" saved successfully`);
          fetchProducts();
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

      <BulkMediaUploadDialog
        open={bulkMediaDialogOpen}
        onClose={() => setBulkMediaDialogOpen(false)}
        onComplete={(results) => {
          console.log('Bulk media upload completed:', results);
          toast.success(`Media upload completed: ${results.filter(r => r.status === 'success').length} successful`);
          setBulkMediaDialogOpen(false);
          fetchProducts(); // Refresh grid after upload
        }}
      />
    </>
  );
};

export default ProductsGrid;