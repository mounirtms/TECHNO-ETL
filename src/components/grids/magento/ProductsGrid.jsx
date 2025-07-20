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

// Dialogs
import CSVImportDialog from '../../dialogs/CSVImportDialog';
import CatalogProcessorDialog from '../../dialogs/CatalogProcessorDialog';
import ProductInfoDialog from '../../common/ProductInfoDialog';

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
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [catalogProcessorOpen, setCatalogProcessorOpen] = useState(false);
  const [localProducts, setLocalProducts] = useState([]);

  // ===== COLUMNS =====
  const columns = useMemo(() => [
    ColumnFactory.text('sku', { headerName: 'SKU', width: 150 }),
    ColumnFactory.text('name', { headerName: 'Name', flex: 1 }),
    ColumnFactory.text('type_id', { headerName: 'Type', width: 120 }),
    ColumnFactory.status('status', {
      headerName: 'Status',
      width: 100,
      valueOptions: ['enabled', 'disabled'],
      statusColors: {
        enabled: 'success',
        disabled: 'error'
      }
    }),
    ColumnFactory.currency('price', { headerName: 'Price', width: 120 }),
    ColumnFactory.number('qty', { headerName: 'Quantity', width: 100 }),
    ColumnFactory.dateTime('created_at', { headerName: 'Created', width: 180 }),
    ColumnFactory.actions('actions', {
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        {
          icon: 'edit',
          label: 'Edit',
          onClick: () => handleEdit(params.row)
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
      const response = await magentoApi.getProducts(params);
      const products = response.data?.items || [];

      setData(products);
      setStats({
        total: products.length,
        active: products.filter(p => p.status === 1).length,
        inactive: products.filter(p => p.status === 2).length,
        localProducts: localProducts.length,
        syncedProducts: products.filter(p => !p.isLocal).length
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [localProducts.length]);



  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ===== EVENT HANDLERS =====
  const handleAdd = useCallback(() => {
    console.log('Add product');
    // Implement add logic
  }, []);

  const handleEdit = useCallback((selectedIds) => {
    if (selectedIds.length !== 1) {
      toast.warning('Please select one product to edit');
      return;
    }
    const product = data.find(p => p.sku === selectedIds[0]);
    setSelectedProduct(product);
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
    view: {
      enabled: true,
      label: 'View Product',
      icon: 'visibility',
      onClick: (row) => {
        setSelectedProduct(row);
        setInfoDialogOpen(true);
      }
    },
    edit: {
      enabled: true,
      label: 'Edit Product',
      icon: 'edit',
      onClick: (row) => handleEdit(row)
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
          toolbarConfig: getStandardToolbarConfig('magentoProducts'),
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
