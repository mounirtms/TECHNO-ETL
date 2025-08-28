import React, { useState, useCallback, useMemo, useEffect, useId, useTransition, Suspense, memo } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Alert,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Fab,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Inventory as ProductIcon,
  Category as CategoryIcon,
  Label as AttributeIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  BrandingWatermark as BrandIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Sync as SyncIcon,
  Close as CloseIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Modern Base Components
import BaseGrid from '../../base/BaseGrid';
import BaseDialog from '../../base/BaseDialog';
import { ErrorBoundary } from '../../common/ErrorBoundary';
import { SuspenseWrapper } from '../../common/SuspenseWrapper';

// Other Components
import ProductAttributesGrid from './ProductAttributesGrid';
import ProductCategoriesGrid from './ProductCategoriesGrid';
import BrandManagementDialog from '../../dialogs/BrandManagementDialog';
import TooltipWrapper from '../../common/TooltipWrapper';
import { ColumnFactory } from '../../../utils/ColumnFactory.jsx';

// Services
import magentoApi from '../../../services/magentoApi';

/**
 * ProductManagementGrid - Modern React 18 Product Management
 * 
 * Features:
 * - BaseGrid integration with React 18 patterns
 * - Enhanced state management with useTransition
 * - Comprehensive product, attributes, and categories management
 * - Modern error boundaries and suspense handling
 * - Optimized performance with memoization
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */
const ProductManagementGrid = memo(({ initialProductIds = [] }) => {
  // ===== REACT 18 HOOKS =====
  const gridId = useId();
  const [isPending, startTransition] = useTransition();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(initialProductIds);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [brandManagementOpen, setBrandManagementOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withCategories: 0
  });

  // ===== FILTER STATE =====
  const [filters, setFilters] = useState({
    brand: '',
    status: '',
    type: '',
    priceRange: { min: '', max: '' }
  });

  // ===== FLOATING WINDOWS STATE =====
  const [floatingWindows, setFloatingWindows] = useState({
    quickActions: { open: false, anchorEl: null },
    bulkOperations: { open: false, anchorEl: null },
    dataManagement: { open: false, anchorEl: null },
    settings: { open: false, anchorEl: null }
  });

  // ===== MANUAL REFRESH STATE =====
  const [refreshing, setRefreshing] = useState({
    attributes: false,
    categories: false,
    brands: false
  });

  // ===== FLOATING WINDOW HANDLERS =====
  const openFloatingWindow = useCallback((windowType, event) => {
    setFloatingWindows(prev => ({
      ...prev,
      [windowType]: { open: true, anchorEl: event.currentTarget }
    }));
  }, []);

  const closeFloatingWindow = useCallback((windowType) => {
    setFloatingWindows(prev => ({
      ...prev,
      [windowType]: { open: false, anchorEl: null }
    }));
  }, []);

  const closeAllFloatingWindows = useCallback(() => {
    setFloatingWindows({
      quickActions: { open: false, anchorEl: null },
      bulkOperations: { open: false, anchorEl: null },
      dataManagement: { open: false, anchorEl: null },
      settings: { open: false, anchorEl: null }
    });
  }, []);

  // ===== MANUAL REFRESH HANDLERS =====
  const handleManualRefresh = useCallback(async (type) => {
    setRefreshing(prev => ({ ...prev, [type]: true }));

    try {
      switch (type) {
        case 'attributes':
          await magentoApi.getProductAttributes();
          toast.success('Attributes refreshed successfully');
          break;
        case 'categories':
          await magentoApi.getCategories();
          toast.success('Categories refreshed successfully');
          break;
        case 'brands':
          await magentoApi.getBrands();
          toast.success('Brands refreshed successfully');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error refreshing ${type}:`, error);
      toast.error(`Failed to refresh ${type}`);
    } finally {
      setRefreshing(prev => ({ ...prev, [type]: false }));
    }
  }, []);
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);

  // ===== TAB CONFIGURATION =====
  const tabs = [
    {
      label: 'Products Overview',
      icon: <ProductIcon />,
      component: 'products'
    },
    {
      label: 'Product Attributes',
      icon: <AttributeIcon />,
      component: 'attributes'
    },
    {
      label: 'Category Assignment',
      icon: <CategoryIcon />,
      component: 'categories'
    }
  ];

  // ===== PRODUCT COLUMNS =====
  const productColumns = useMemo(() => [
    ColumnFactory.text('id', { 
      headerName: 'ID', 
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace" color="primary">
          {params.value}
        </Typography>
      )
    }),
    ColumnFactory.text('sku', { 
      headerName: 'SKU', 
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      )
    }),
    ColumnFactory.text('name', { 
      headerName: 'Product Name', 
      flex: 1
    }),
    ColumnFactory.currency('price', {
      headerName: 'Price',
      width: 120
    }),
    {
      field: 'brand',
      headerName: 'Brand',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Unknown'}
          color={params.value && params.value !== 'Unknown' ? 'primary' : 'default'}
          size="small"
          variant="outlined"
          icon={<BrandIcon />}
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === 1 ? 'Active' : 'Inactive'}
          color={params.value === 1 ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'type_id',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Simple'}
          color="info"
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <TooltipWrapper title="View Details">
            <IconButton
              size="small"
              onClick={() => handleViewProduct(params.row)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </TooltipWrapper>
          <TooltipWrapper title="Edit Product">
            <IconButton
              size="small"
              onClick={() => handleEditProduct(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </TooltipWrapper>
          <TooltipWrapper title="Manage Categories">
            <IconButton
              size="small"
              onClick={() => handleManageCategories(params.row)}
            >
              <AssignmentIcon fontSize="small" />
            </IconButton>
          </TooltipWrapper>
        </Box>
      )
    }
  ], []);

  // ===== BRANDS FETCHING =====
  const fetchBrands = useCallback(async () => {
    try {
      setBrandsLoading(true);
      console.log('🔄 Fetching brands for filters...');

      const response = await magentoApi.getBrands();
      const brandsData = response?.items || [];

      // Sort brands alphabetically
      const sortedBrands = brandsData.sort((a, b) => a.label.localeCompare(b.label));
      setBrands(sortedBrands);

      console.log('✅ Brands loaded for filters:', sortedBrands.length);
    } catch (error) {
      console.error('❌ Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setBrandsLoading(false);
    }
  }, []);

  // ===== DATA FETCHING =====
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products...', params, 'Filters:', filters);

      let productsData = [];

      if (selectedProducts.length > 0) {
        // Fetch specific products
        console.log('📦 Fetching specific products:', selectedProducts);
        productsData = await Promise.all(
          selectedProducts.map(async (id) => {
            try {
              const product = await magentoApi.getProduct(id);
              // Get additional attributes including brand
              const additionalAttrs = await magentoApi.getAdditionalAttributes(id);

              return {
                ...product,
                additional_attributes: additionalAttrs?.additional_attributes || [],
                brand: additionalAttrs?.additional_attributes?.find(attr => attr.attribute_code === 'mgs_brand')?.label || 'Unknown'
              } || {
                id,
                sku: `PRODUCT-${id}`,
                name: `Product ${id}`,
                price: 0,
                status: 1,
                type_id: 'simple',
                brand: 'Unknown',
                additional_attributes: []
              };
            } catch (error) {
              console.warn(`Failed to fetch product ${id}:`, error);
              return {
                id,
                sku: `PRODUCT-${id}`,
                name: `Product ${id}`,
                price: 0,
                status: 1,
                type_id: 'simple',
                brand: 'Unknown',
                additional_attributes: []
              };
            }
          })
        );
      } else {
        // Fetch all products
        const response = await magentoApi.getProducts(params);
        productsData = response?.items || [];

        // Enhance with additional attributes
        productsData = await Promise.all(
          productsData.map(async (product) => {
            try {
              const additionalAttrs = await magentoApi.getAdditionalAttributes(product.id);
              return {
                ...product,
                additional_attributes: additionalAttrs?.additional_attributes || [],
                brand: additionalAttrs?.additional_attributes?.find(attr => attr.attribute_code === 'mgs_brand')?.label || 'Unknown'
              };
            } catch (error) {
              return {
                ...product,
                brand: 'Unknown',
                additional_attributes: []
              };
            }
          })
        );
      }

      // Apply filters
      const filteredProducts = applyFilters(productsData);
      setProducts(filteredProducts);
      updateStats(filteredProducts);

    } catch (error) {
      console.error('❌ Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [selectedProducts, filters]);

  // ===== FILTERING LOGIC =====
  const applyFilters = useCallback((productsData) => {
    return productsData.filter(product => {
      // Brand filter
      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }

      // Status filter
      if (filters.status !== '' && product.status.toString() !== filters.status) {
        return false;
      }

      // Type filter
      if (filters.type && product.type_id !== filters.type) {
        return false;
      }

      // Price range filter
      if (filters.priceRange.min && product.price < parseFloat(filters.priceRange.min)) {
        return false;
      }
      if (filters.priceRange.max && product.price > parseFloat(filters.priceRange.max)) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // ===== STATISTICS UPDATE =====
  const updateStats = useCallback((productsData) => {
    const newStats = productsData.reduce((acc, product) => ({
      total: acc.total + 1,
      active: acc.active + (product.status === 1 ? 1 : 0),
      inactive: acc.inactive + (product.status !== 1 ? 1 : 0),
      withCategories: acc.withCategories + (product.categories?.length > 0 ? 1 : 0)
    }), {
      total: 0,
      active: 0,
      inactive: 0,
      withCategories: 0
    });
    setStats(newStats);
  }, []);

  // ===== ENHANCED EVENT HANDLERS FOR BASEGRID =====
  const handleAddProduct = useCallback(async (data) => {
    try {
      console.log('🆕 Adding new product:', data);
      const newProduct = await magentoApi.createProduct(data);
      toast.success('Product created successfully');
      fetchProducts(); // Refresh the grid
      return newProduct;
    } catch (error) {
      console.error('❌ Error creating product:', error);
      toast.error('Failed to create product');
      throw error;
    }
  }, [fetchProducts]);

  const handleEditProduct = useCallback(async (data) => {
    try {
      console.log('✏️ Editing product:', data);
      const updatedProduct = await magentoApi.updateProduct(data.id, data);
      toast.success('Product updated successfully');
      fetchProducts(); // Refresh the grid
      return updatedProduct;
    } catch (error) {
      console.error('❌ Error updating product:', error);
      toast.error('Failed to update product');
      throw error;
    }
  }, [fetchProducts]);

  const handleDeleteProducts = useCallback(async (productIds) => {
    try {
      console.log('🗑️ Deleting products:', productIds);
      await Promise.all(
        productIds.map(id => magentoApi.deleteProduct(id))
      );
      toast.success(`${productIds.length} product(s) deleted successfully`);
      fetchProducts(); // Refresh the grid
    } catch (error) {
      console.error('❌ Error deleting products:', error);
      toast.error('Failed to delete products');
      throw error;
    }
  }, [fetchProducts]);

  const handleSearchProducts = useCallback((query) => {
    console.log('🔍 Searching products:', query);
    // Search is handled by BaseGrid internally
  }, []);

  const handleSelectionChange = useCallback((selection) => {
    startTransition(() => {
      setSelectedProducts(selection);
    });
  }, []);

  const handleGridError = useCallback((error) => {
    console.error('🚨 Product Management Grid Error:', error);
    toast.error('Error in product management grid');
  }, []);

  // ===== ADDITIONAL EVENT HANDLERS =====
  const handleTabChange = useCallback((event, newValue) => {
    startTransition(() => {
      setCurrentTab(newValue);
    });
  }, []);

  const handleViewProduct = useCallback((product) => {
    console.log('👁️ Viewing product:', product);
    setSelectedProduct(product);
    setProductDetailOpen(true);
  }, []);

  const handleManageCategories = useCallback(() => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select products first');
      return;
    }
    console.log('📂 Managing categories for products:', selectedProducts);
    setCurrentTab(2); // Switch to categories tab
  }, [selectedProducts]);

  // ===== FILTER HANDLERS =====
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handlePriceRangeChange = useCallback((type, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value
      }
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      brand: '',
      status: '',
      type: '',
      priceRange: { min: '', max: '' }
    });
  }, []);

  // ===== BRAND MANAGEMENT HANDLERS =====
  const handleOpenBrandManagement = useCallback(() => {
    setBrandManagementOpen(true);
  }, []);

  const handleBrandsUpdated = useCallback(() => {
    // Refresh brands list
    fetchBrands();
    // Refresh products to get updated brand data
    fetchProducts();
  }, [fetchBrands, fetchProducts]);

  // ===== EFFECTS =====
  useEffect(() => {
    fetchBrands();
    fetchProducts();
  }, [fetchBrands, fetchProducts]);

  // Re-fetch products when filters change
  useEffect(() => {
    if (brands.length > 0) { // Only fetch after brands are loaded
      fetchProducts();
    }
  }, [filters, fetchProducts, brands.length]);

  // ===== RENDER TAB CONTENT =====
  const renderTabContent = useCallback(() => {
    switch (currentTab) {
      case 0: // Products Overview
        return (
          <ErrorBoundary>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
              <BaseGrid
                gridName="ProductManagementGrid"
                columns={productColumns}
                data={products}
                loading={loading}
                
                // API Configuration
                apiService={magentoApi}
                apiEndpoint="products"
                apiParams={{}}
                
                // Feature Configuration
                enableSuspense={true}
                enableErrorBoundary={true}
                enableVirtualization={true}
                enableSelection={true}
                enableSorting={true}
                enableFiltering={true}
                enableSearch={true}
                enableStats={true}
                enableActions={true}
                
                // Toolbar Configuration
                toolbarConfig={{
                  showRefresh: true,
                  showAdd: true,
                  showEdit: true,
                  showDelete: true,
                  showExport: true,
                  showImport: true,
                  showSearch: true,
                  showFilters: true,
                  compact: false
                }}
                
                // Stats Configuration
                statsConfig={{
                  stats: [
                    {
                      key: 'total',
                      title: 'Total Products',
                      color: 'primary',
                      icon: ProductIcon
                    },
                    {
                      key: 'active',
                      title: 'Active',
                      color: 'success',
                      icon: SettingsIcon
                    },
                    {
                      key: 'inactive',
                      title: 'Inactive',
                      color: 'warning',
                      icon: SettingsIcon
                    },
                    {
                      key: 'withCategories',
                      title: 'With Categories',
                      color: 'info',
                      icon: CategoryIcon
                    }
                  ]
                }}
                
                // Dialog Configuration
                dialogConfig={{
                  add: {
                    title: 'Add New Product',
                    fields: [
                      { key: 'sku', label: 'SKU', required: true },
                      { key: 'name', label: 'Product Name', required: true },
                      { key: 'price', label: 'Price', type: 'number' },
                      { key: 'status', label: 'Status', type: 'select' }
                    ]
                  },
                  edit: {
                    title: 'Edit Product',
                    fields: [
                      { key: 'sku', label: 'SKU', disabled: true },
                      { key: 'name', label: 'Product Name', required: true },
                      { key: 'price', label: 'Price', type: 'number' },
                      { key: 'status', label: 'Status', type: 'select' }
                    ]
                  },
                  delete: {
                    title: 'Delete Products',
                    confirmMessage: 'Are you sure you want to delete the selected products?'
                  }
                }}
                
                // Event Handlers
                onRefresh={fetchProducts}
                onAdd={handleAddProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProducts}
                onSearch={handleSearchProducts}
                onSelectionChange={handleSelectionChange}
                onError={handleGridError}
                
                // Data Configuration
                searchFields={['name', 'sku', 'brand']}
                getRowId={(row) => row.id}
                
                // Custom Actions
                customActions={[
                  {
                    key: 'manage-categories',
                    label: 'Manage Categories',
                    icon: CategoryIcon,
                    color: 'primary',
                    requiresSelection: true,
                    onClick: handleManageCategories
                  },
                  {
                    key: 'manage-brands',
                    label: 'Manage Brands',
                    icon: BrandIcon,
                    color: 'secondary',
                    onClick: handleOpenBrandManagement
                  }
                ]}
                
                // Style
                sx={{ height: '100%' }}
              />
            </Suspense>
          </ErrorBoundary>
        );

      case 1: // Product Attributes
        return <ProductAttributesGrid />;

      case 2: // Category Assignment
        return <ProductCategoriesGrid productIds={selectedProducts} />;

      default:
        return null;
    }
  }, [currentTab, productColumns, products, loading, fetchProducts, handleAddProduct, handleEditProduct, handleDeleteProducts, handleSearchProducts, handleSelectionChange, handleGridError, selectedProducts, handleManageCategories, handleOpenBrandManagement]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Product Management System
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive product, attributes, and categories management like Magento backend
        </Typography>
        
        {/* Selected Products Info */}
        {selectedProducts.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Working with {selectedProducts.length} selected products: {selectedProducts.join(', ')}
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Built-in Filters */}
      {currentTab === 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon color="primary" />
                <Typography variant="h6">
                  Product Filters
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<BrandIcon />}
                  onClick={handleOpenBrandManagement}
                >
                  Manage Brands
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={!Object.values(filters).some(v => v !== '' && !(typeof v === 'object' && !v.min && !v.max))}
                >
                  Clear Filters
                </Button>
              </Box>
            </Box>

            <Grid container spacing={2}>
              {/* Brand Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    label="Brand"
                    disabled={brandsLoading}
                  >
                    <MenuItem value="">All Brands</MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand.value} value={brand.label}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BrandIcon fontSize="small" />
                          {brand.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="1">Active</MenuItem>
                    <MenuItem value="0">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Type Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="simple">Simple</MenuItem>
                    <MenuItem value="configurable">Configurable</MenuItem>
                    <MenuItem value="grouped">Grouped</MenuItem>
                    <MenuItem value="virtual">Virtual</MenuItem>
                    <MenuItem value="bundle">Bundle</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Price Range */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Min Price"
                  type="number"
                  size="small"
                  fullWidth
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Max Price"
                  type="number"
                  size="small"
                  fullWidth
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                />
              </Grid>

              {/* Active Filters Display */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {filters.brand && (
                    <Chip
                      label={`Brand: ${filters.brand}`}
                      onDelete={() => handleFilterChange('brand', '')}
                      color="primary"
                      size="small"
                    />
                  )}
                  {filters.status !== '' && (
                    <Chip
                      label={`Status: ${filters.status === '1' ? 'Active' : 'Inactive'}`}
                      onDelete={() => handleFilterChange('status', '')}
                      color="primary"
                      size="small"
                    />
                  )}
                  {filters.type && (
                    <Chip
                      label={`Type: ${filters.type}`}
                      onDelete={() => handleFilterChange('type', '')}
                      color="primary"
                      size="small"
                    />
                  )}
                  {(filters.priceRange.min || filters.priceRange.max) && (
                    <Chip
                      label={`Price: ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}`}
                      onDelete={() => handlePriceRangeChange('min', '') || handlePriceRangeChange('max', '')}
                      color="primary"
                      size="small"
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {renderTabContent()}
      </Box>

      {/* Product Detail Dialog using BaseDialog */}
      <BaseDialog
        type="form"
        open={productDetailOpen}
        onClose={() => setProductDetailOpen(false)}
        title={`Product Details: ${selectedProduct?.name || ''}`}
        maxWidth="md"
        fields={[
          { key: 'id', label: 'Product ID', disabled: true },
          { key: 'sku', label: 'SKU', disabled: true },
          { key: 'name', label: 'Product Name', disabled: true },
          { key: 'price', label: 'Price', type: 'number', disabled: true },
          { key: 'status', label: 'Status', disabled: true },
          { key: 'type_id', label: 'Type', disabled: true },
          { key: 'brand', label: 'Brand', disabled: true }
        ]}
        data={selectedProduct || {}}
        config={{
          title: `Product Details: ${selectedProduct?.name || ''}`,
          submitLabel: 'Edit Product',
          submitColor: 'primary'
        }}
        onSubmit={async (data) => {
          // Handle edit action
          console.log('Edit product:', data);
          toast.info('Edit functionality to be implemented');
        }}
      />

      {/* Brand Management Dialog */}
      <BrandManagementDialog
        open={brandManagementOpen}
        onClose={() => setBrandManagementOpen(false)}
        onBrandsUpdated={handleBrandsUpdated}
      />

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <Stack spacing={2}>
          {/* Quick Actions FAB */}
          <TooltipWrapper title="Quick Actions" placement="left">
            <Fab
              color="primary"
              size="medium"
              onClick={(e) => openFloatingWindow('quickActions', e)}
            >
              <AddIcon />
            </Fab>
          </TooltipWrapper>

          {/* Bulk Operations FAB */}
          <TooltipWrapper 
            title="Bulk Operations" 
            placement="left"
            disabled={selectedProducts.length === 0}
          >
            <Fab
              color="secondary"
              size="medium"
              onClick={(e) => openFloatingWindow('bulkOperations', e)}
              disabled={selectedProducts.length === 0}
            >
              <SettingsIcon />
            </Fab>
          </TooltipWrapper>

          {/* Data Management FAB */}
          <TooltipWrapper title="Data Management" placement="left">
            <Fab
              color="info"
              size="medium"
              onClick={(e) => openFloatingWindow('dataManagement', e)}
            >
              <RefreshIcon />
            </Fab>
          </TooltipWrapper>
        </Stack>
      </Box>

      {/* Quick Actions Popover */}
      <Popover
        open={floatingWindows.quickActions.open}
        anchorEl={floatingWindows.quickActions.anchorEl}
        onClose={() => closeFloatingWindow('quickActions')}
        anchorOrigin={{ vertical: 'center', horizontal: 'left' }}
        transformOrigin={{ vertical: 'center', horizontal: 'right' }}
      >
        <Paper sx={{ p: 2, minWidth: 250 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Quick Actions</Typography>
            <IconButton size="small" onClick={() => closeFloatingWindow('quickActions')}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List dense>
            <ListItem button onClick={() => { /* Add Product */ closeFloatingWindow('quickActions'); }}>
              <ListItemIcon><AddIcon /></ListItemIcon>
              <ListItemText primary="Add Product" />
            </ListItem>
            <ListItem button onClick={() => { /* Import CSV */ closeFloatingWindow('quickActions'); }}>
              <ListItemIcon><UploadIcon /></ListItemIcon>
              <ListItemText primary="Import CSV" />
            </ListItem>
            <ListItem button onClick={() => { /* Export Data */ closeFloatingWindow('quickActions'); }}>
              <ListItemIcon><DownloadIcon /></ListItemIcon>
              <ListItemText primary="Export Data" />
            </ListItem>
            <ListItem button onClick={() => { /* Sync All */ closeFloatingWindow('quickActions'); }}>
              <ListItemIcon><SyncIcon /></ListItemIcon>
              <ListItemText primary="Sync All" />
            </ListItem>
          </List>
        </Paper>
      </Popover>

      {/* Bulk Operations Popover */}
      <Popover
        open={floatingWindows.bulkOperations.open}
        anchorEl={floatingWindows.bulkOperations.anchorEl}
        onClose={() => closeFloatingWindow('bulkOperations')}
        anchorOrigin={{ vertical: 'center', horizontal: 'left' }}
        transformOrigin={{ vertical: 'center', horizontal: 'right' }}
      >
        <Paper sx={{ p: 2, minWidth: 250 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Bulk Operations</Typography>
            <IconButton size="small" onClick={() => closeFloatingWindow('bulkOperations')}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            {selectedProducts.length} products selected
          </Alert>
          <List dense>
            <ListItem button onClick={() => { /* Bulk Activate */ closeFloatingWindow('bulkOperations'); }}>
              <ListItemIcon><ActivateIcon color="success" /></ListItemIcon>
              <ListItemText primary="Activate Selected" />
            </ListItem>
            <ListItem button onClick={() => { /* Bulk Deactivate */ closeFloatingWindow('bulkOperations'); }}>
              <ListItemIcon><DeactivateIcon color="error" /></ListItemIcon>
              <ListItemText primary="Deactivate Selected" />
            </ListItem>
            <ListItem button onClick={() => { /* Assign Categories */ closeFloatingWindow('bulkOperations'); }}>
              <ListItemIcon><CategoryIcon /></ListItemIcon>
              <ListItemText primary="Assign Categories" />
            </ListItem>
            <ListItem button onClick={() => { /* Update Attributes */ closeFloatingWindow('bulkOperations'); }}>
              <ListItemIcon><AttributeIcon /></ListItemIcon>
              <ListItemText primary="Update Attributes" />
            </ListItem>
          </List>
        </Paper>
      </Popover>

      {/* Data Management Popover */}
      <Popover
        open={floatingWindows.dataManagement.open}
        anchorEl={floatingWindows.dataManagement.anchorEl}
        onClose={() => closeFloatingWindow('dataManagement')}
        anchorOrigin={{ vertical: 'center', horizontal: 'left' }}
        transformOrigin={{ vertical: 'center', horizontal: 'right' }}
      >
        <Paper sx={{ p: 2, minWidth: 280 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Data Management</Typography>
            <IconButton size="small" onClick={() => closeFloatingWindow('dataManagement')}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manually refresh data from Magento
          </Typography>
          <List dense>
            <ListItem
              button
              onClick={() => { handleManualRefresh('attributes'); closeFloatingWindow('dataManagement'); }}
              disabled={refreshing.attributes}
            >
              <ListItemIcon>
                {refreshing.attributes ? <CircularProgress size={20} /> : <AttributeIcon />}
              </ListItemIcon>
              <ListItemText primary="Refresh Attributes" />
            </ListItem>
            <ListItem
              button
              onClick={() => { handleManualRefresh('categories'); closeFloatingWindow('dataManagement'); }}
              disabled={refreshing.categories}
            >
              <ListItemIcon>
                {refreshing.categories ? <CircularProgress size={20} /> : <CategoryIcon />}
              </ListItemIcon>
              <ListItemText primary="Refresh Categories" />
            </ListItem>
            <ListItem
              button
              onClick={() => { handleManualRefresh('brands'); closeFloatingWindow('dataManagement'); }}
              disabled={refreshing.brands}
            >
              <ListItemIcon>
                {refreshing.brands ? <CircularProgress size={20} /> : <BrandIcon />}
              </ListItemIcon>
              <ListItemText primary="Refresh Brands" />
            </ListItem>
          </List>
        </Paper>
      </Popover>
    </Box>
  );
});

// Set display name for debugging
ProductManagementGrid.displayName = 'ProductManagementGrid';

export default ProductManagementGrid;
