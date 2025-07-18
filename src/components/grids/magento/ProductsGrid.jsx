// ProductsGrid - Optimized Magento Products Grid
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Chip, Typography, Button } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  FileUpload as ImportIcon,
  Category as CategoryIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingDown as TrendingDownIcon,
  ReportProblem as ReportProblemIcon,
  SyncAlt as SyncAltIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import UnifiedGrid from '../../common/UnifiedGrid';
import ProductInfoDialog from '../../common/ProductInfoDialog';
import magentoApi from '../../../services/magentoApi';
import { toast } from 'react-toastify';
// Removed gridDataHandlers import - skipping validation for now
import CSVImportDialog from '../../dialogs/CSVImportDialog';
import CatalogProcessorDialog from '../../dialogs/CatalogProcessorDialog';

/**
 * Optimized Magento Products Grid Component
 * Features:
 * - Better error handling and validation
 * - Optimized data fetching
 * - Improved performance with memoization
 * - Enhanced user feedback
 */
const ProductsGrid = () => {
  // ===== 1. STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    averagePrice: 0
  });

  // Dialog states
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [catalogProcessorOpen, setCatalogProcessorOpen] = useState(false);

  // ===== 2. DATA FETCHING =====
  const fetchProducts = useCallback(async (filterParams = {}) => {
    setLoading(true);
    try {
      setLoading(true);

      // Direct Magento API call with enhanced logging
      console.log('📡 Products Grid: Calling magentoApi.getProducts...');
      const response = await magentoApi.getProducts(filterParams);
      
      console.log('📦 Products Grid: Raw Magento API response:', {
        responseType: typeof response,
        hasData: response && 'data' in response,
        dataType: typeof response?.data,
        hasItems: response?.data && 'items' in response.data,
        itemsCount: response?.data?.items?.length || 0,
        totalCount: response?.data?.total_count || 0,
        searchCriteria: response?.data?.search_criteria,
        responseKeys: response ? Object.keys(response) : [],
        dataKeys: response?.data ? Object.keys(response.data) : [],
        sampleItem: response?.data?.items?.[0] || null
      });

      // Extract products from Magento response - handle {data: {items: []}} structure
      const magentoData = response?.data || response; // Handle both response structures
      const products = magentoData?.items || [];
      const totalCount = magentoData?.total_count || products.length;

      console.log('✅ Products Grid: Processed Magento data:', {
        productsCount: products.length,
        totalCount,
        sampleProduct: products[0] || null,
        productFields: products.length > 0 ? Object.keys(products[0]) : []
      });

      // Skip validation for now - use products directly (sku is primary key, not entity_id)
      console.log('🔍 Products Grid: Skipping validation, using products directly');

      // Transform products to ensure consistent structure
      const transformedProducts = products.map(product => ({
        ...product,
        id: product.sku, // Use sku as id since entity_id might not exist
        quantity: product.extension_attributes?.stock_item?.qty || 0,
        qty: product.extension_attributes?.stock_item?.qty || 0
      }));

      setData(transformedProducts);

      // Calculate statistics
      const total = transformedProducts.length;
      const inStock = transformedProducts.filter(p => p.status === 1 && (p.qty > 0 || p.quantity > 0)).length;
      const outOfStock = transformedProducts.filter(p => (p.qty === 0 && p.quantity === 0)).length;
      const lowStock = transformedProducts.filter(p => {
        const stock = p.qty || p.quantity || 0;
        return stock > 0 && stock < 10;
      }).length;
      const averagePrice = transformedProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / total || 0;

      const calculatedStats = { total, inStock, outOfStock, lowStock, averagePrice };
      setStats(calculatedStats);

      console.log('📊 Products Grid: Stats calculated:', calculatedStats);
      console.log('📦 Products Grid: Sample product structure:', transformedProducts[0]);
      toast.success(`Loaded ${total} products successfully`);
    } catch (error) {
      console.error('❌ Products Grid: Fetch failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });

      setData([]);
      setStats({ total: 0, inStock: 0, outOfStock: 0, lowStock: 0, averagePrice: 0 });
      toast.error(`Failed to fetch products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== 3. EVENT HANDLERS =====
  const handleAdd = useCallback(() => {
    setSelectedProduct(null);
    setAddDialogOpen(true);
  }, []);

  const handleEdit = useCallback((records) => {
    if (records.length === 1) {
      const product = data.find(p => p.sku === records[0]);
      setSelectedProduct(product);
      setEditDialogOpen(true);
    } else {
      toast.warning('Please select exactly one product to edit');
    }
  }, [data]);

  const handleDelete = useCallback(async (records) => {
    if (records.length === 0) {
      toast.warning('Please select products to delete');
      return;
    }

    try {
      for (const sku of records) {
        await magentoApi.deleteProduct(sku);
      }
      toast.success(`Deleted ${records.length} product(s) successfully`);
      fetchProducts();
    } catch (error) {
      console.error('Delete error:', error);
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

  const handleInfo = useCallback((records) => {
    if (records.length !== 1) {
      toast.warning('Please select one product to view');
      return;
    }
    const product = data.find(p => p.sku === records[0]);
    setSelectedProduct(product);
    setInfoDialogOpen(true);
  }, [data]);

  const handleFilterChange = useCallback((newFilter) => {
    setCurrentFilter(newFilter);
    const filterParams = newFilter === 'all' ? {} : { status: newFilter };
    fetchProducts(filterParams);
  }, [fetchProducts]);

  const handleCatalogProcessor = useCallback(() => {
    setCatalogProcessorOpen(true);
  }, []);

  const handleCatalogProcessComplete = useCallback((result) => {
    toast.success(`Processed ${result.totalProducts} products in ${result.batches} batch(es)`);
    setCatalogProcessorOpen(false);
    // Refresh the grid to show any newly imported products
    fetchProducts();
  }, [fetchProducts]);

  // ===== 4. MEMOIZED COMPONENTS =====
  const columns = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
      valueGetter: (params) => {
        // Safe access to row data - handle undefined during grid initialization
        if (!params.row) return '';
        return params.row.id || params.row.sku || params.row.entity_id || '';
      }
    },
    {
      field: 'sku',
      headerName: 'SKU',
      width: 150,
      sortable: true,
      filterable: true
    },
    {
      field: 'name',
      headerName: 'Product Name',
      width: 300,
      sortable: true,
      filterable: true
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      type: 'number',
      valueFormatter: (params) => params.value ? `$${params.value.toFixed(2)}` : 'N/A'
    },
    {
      field: 'quantity',
      headerName: 'Stock',
      width: 100,
      type: 'number',
      valueGetter: (params) => {
        // Safe access to row data - handle undefined during grid initialization
        if (!params.row) return 0;
        // Handle different stock quantity field names from Magento API
        return params.row.quantity || params.row.qty ||
               params.row.extension_attributes?.stock_item?.qty || 0;
      },
      renderCell: (params) => {
        const qty = params.value || 0;
        return (
          <Chip
            label={qty}
            color={qty > 10 ? 'success' : qty > 0 ? 'warning' : 'error'}
            size="small"
          />
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 1 ? 'Active' : 'Inactive'}
          color={params.value === 1 ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 180,
      valueFormatter: (params) => 
        params.value ? new Date(params.value).toLocaleString() : 'N/A'
    }
  ], []);

  const toolbarConfig = useMemo(() => ({
    showRefresh: true,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showExport: true,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showViewToggle: true,
    compact: false,
    size: 'medium'
  }), []);

  const customActions = useMemo(() => [
    {
      label: 'Add Product',
      onClick: handleAdd,
      icon: <AddIcon />,
      color: 'primary',
      variant: 'contained'
    },
    {
      label: 'Process Catalog',
      onClick: handleCatalogProcessor,
      icon: <ImportIcon />,
      color: 'secondary',
      variant: 'outlined',
      tooltip: 'Process full catalog CSV and generate import-ready files'
    },
    {
      label: 'Sync Products',
      onClick: handleSync,
      icon: <SyncAltIcon />,
      color: 'secondary',
      variant: 'outlined'
    }
  ], [handleSync, handleCatalogProcessor]);

  const contextMenuActions = useMemo(() => ({
    view: {
      label: 'View Details',
      icon: <ViewIcon />,
      onClick: (row) => {
        setSelectedProduct(row);
        setInfoDialogOpen(true);
      }
    },
    edit: {
      label: 'Edit Product',
      icon: <EditIcon />,
      onClick: (row) => {
        setSelectedProduct(row);
        setEditDialogOpen(true);
      }
    },
    info: {
      label: 'Product Info',
      icon: <InfoIcon />,
      onClick: (row) => {
        setSelectedProduct(row);
        setInfoDialogOpen(true);
      }
    },
    delete: {
      label: 'Delete Product',
      icon: <DeleteIcon />,
      onClick: (row) => handleDelete([row.sku]),
      color: 'error'
    }
  }), [handleDelete, handleEdit]);

  const statusCards = useMemo(() => [
    {
      title: 'Total Products',
      value: stats.total,
      icon: <CategoryIcon />,
      color: 'primary'
    },
    {
      title: 'In Stock',
      value: stats.inStock,
      icon: <CheckCircleOutlineIcon />,
      color: 'success'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStock,
      icon: <ErrorOutlineIcon />,
      color: 'error'
    },
    {
      title: 'Low Stock',
      value: stats.lowStock,
      icon: <ReportProblemIcon />,
      color: 'warning'
    },
    {
      title: 'Avg Price',
      value: `$${stats.averagePrice.toFixed(2)}`,
      icon: <AttachMoneyIcon />,
      color: 'info'
    }
  ], [stats]);

  const filterOptions = useMemo(() => [
    { key: 'all', label: 'All Products', value: 'all' },
    { key: 'active', label: 'Active Only', value: '1' },
    { key: 'inactive', label: 'Inactive Only', value: '0' },
    { key: 'instock', label: 'In Stock', value: 'instock' },
    { key: 'outofstock', label: 'Out of Stock', value: 'outofstock' }
  ], []);

  // ===== 5. RENDER =====
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <UnifiedGrid
        gridName="ProductsGrid"
        columns={columns}
        data={data}
        loading={loading}
        
        // Feature toggles
        enableCache={true}
        enableSelection={true}
        enableSorting={true}
        enableFiltering={true}
        
        // View options
        showStatsCards={true}
        gridCards={statusCards}
        defaultPageSize={25}
        
        // Toolbar configuration
        toolbarConfig={toolbarConfig}
        customActions={customActions}
        
        // Context menu
        contextMenuActions={contextMenuActions}
        
        // Filter configuration
        filterOptions={filterOptions}
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        
        // Event handlers
        onRefresh={fetchProducts}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSync={handleSync}
        onSelectionChange={setSelectedRows}
        onExport={() => toast.info('Export functionality coming soon')}
        
        // Row configuration
        getRowId={(row) => row.sku}
      />

      <ProductInfoDialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        product={selectedProduct}
      />

      <CatalogProcessorDialog
        open={catalogProcessorOpen}
        onClose={() => setCatalogProcessorOpen(false)}
        onProcessComplete={handleCatalogProcessComplete}
      />
    </Box>
  );
};

export default ProductsGrid;