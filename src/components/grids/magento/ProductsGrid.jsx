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
import { fetchGridData, gridDataHandlers } from '../../../utils/gridDataHandlers';

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

      // Validate and transform data using Magento-specific handler
      const validationResult = gridDataHandlers.magentoProducts(products);
      
      console.log('🔍 Products Grid: Validation result:', {
        isValid: validationResult.isValid,
        dataCount: validationResult.data?.length || 0,
        errors: validationResult.errors,
        metadata: validationResult.metadata
      });

      if (validationResult.isValid) {
        const validatedProducts = validationResult.data;
        setData(validatedProducts);

      // Calculate statistics
      const total = validatedProducts.length;
      const inStock = validatedProducts.filter(p => p.status === 1 && p.qty > 0).length;
      const outOfStock = validatedProducts.filter(p => p.qty === 0).length;
      const lowStock = validatedProducts.filter(p => p.qty > 0 && p.qty < 10).length;
      const averagePrice = validatedProducts.reduce((sum, p) => sum + (p.price || 0), 0) / total || 0;

        const calculatedStats = { total, inStock, outOfStock, lowStock, averagePrice };
        setStats(calculatedStats);

        console.log('📊 Products Grid: Stats calculated:', calculatedStats);
        toast.success(`Loaded ${total} products successfully`);
      } else {
        console.error('❌ Products Grid: Data validation failed:', validationResult.errors);
        setData([]);
        setStats({ total: 0, inStock: 0, outOfStock: 0, lowStock: 0, averagePrice: 0 });
        toast.error('Data validation failed. Please check the data format.');
      }
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

  // ===== 4. MEMOIZED COMPONENTS =====
  const columns = useMemo(() => [
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
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          color={params.value > 10 ? 'success' : params.value > 0 ? 'warning' : 'error'}
          size="small"
        />
      )
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
      label: 'Bulk Import',
      onClick: () => toast.info('Bulk import coming soon'),
      icon: <ImportIcon />,
      color: 'secondary',
      variant: 'outlined'
    },
    {
      label: 'Sync Products',
      onClick: handleSync,
      icon: <SyncAltIcon />,
      color: 'secondary',
      variant: 'outlined'
    }
  ], [handleSync]);

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
    </Box>
  );
};

export default ProductsGrid;