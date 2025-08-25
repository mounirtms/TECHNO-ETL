import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Card,
  CardContent,
  CardActions,
  Autocomplete,
  Stack,
  Fab,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  LinearProgress
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
  ViewColumn as ColumnIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Components
import ProductAttributesGrid from './ProductAttributesGrid';
import ProductCategoriesGrid from './ProductCategoriesGrid';
import BrandManagementDialog from '../../dialogs/BrandManagementDialog';
import UnifiedGrid from '../../common/UnifiedGrid';
import TooltipWrapper from '../../common/TooltipWrapper';
import { getStandardGridProps, getStandardToolbarConfig } from '../../../config/gridConfig';
import { ColumnFactory } from '../../../utils/ColumnFactory.tsx';

// Services
import magentoApi from '../../../services/magentoApi';

/**
 * ProductManagementGrid - Comprehensive Product Management
 * Combines Products, Attributes, and Categories like Magento Backend
 */
const ProductManagementGrid: React.FC<{initialProductIds = []: any}> = ({ initialProductIds = []  }) => {
  // ===== STATE MANAGEMENT =====
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
    setFloatingWindows(prev => ({ ...prev,
      [windowType]: { open: true, anchorEl: event.currentTarget }
    }));
  }, []);

  const closeFloatingWindow = useCallback((windowType) => {
    setFloatingWindows(prev => ({ ...prev,
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
      switch(type) {
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
    } catch(error: any) {
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
          label={params.value ===1 ? 'Active' : 'Inactive'}
          color={params.value ===1 ? 'success' : 'default'}
          size="small"
    },
    {
      field: 'type_id',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Simple'}
          color
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", display: 'flex', gap: 0.5 }}>
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
    } catch(error: any) {
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

      if(selectedProducts.length > 0) {
        // Fetch specific products
        console.log('📦 Fetching specific products:', selectedProducts);
        productsData
                additional_attributes: additionalAttrs?.additional_attributes || [],
                brand: additionalAttrs?.additional_attributes?.find(attr => attr.attribute_code === 'mgs_brand').label || 'Unknown'
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
            } catch(error: any) {
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
        productsData
                additional_attributes: additionalAttrs?.additional_attributes || [],
                brand: additionalAttrs?.additional_attributes?.find(attr => attr.attribute_code === 'mgs_brand').label || 'Unknown'
              };
            } catch(error: any) {
              return { ...product,
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

    } catch(error: any) {
      console.error('❌ Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [selectedProducts, filters]);

  // ===== FILTERING LOGIC =====
  const applyFilters = useCallback((productsData) => {
    return productsData.filter((product: any: any: any: any) => {
      // Brand filter
      if(filters.brand && product.brand !== filters.brand) {
        return false;
      }

      // Status filter
      if (filters.status !== '' && product.status.toString() !== filters.status) {
        return false;
      }

      // Type filter
      if(filters.type && product.type_id !== filters.type) {
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
    const newStats = productsData.reduce((acc: any product: any: any: any: any) => ({
      total: acc.total + 1,
      active: acc.active + (product.status ===1 ? 1 : 0),
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

  // ===== EVENT HANDLERS =====
  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const handleViewProduct = useCallback((product) => {
    console.log('👁️ Viewing product:', product);
    setSelectedProduct(product);
    setProductDetailOpen(true);
  }, []);

  const handleEditProduct = useCallback((product) => {
    console.log('✏️ Editing product:', product);
    toast.info(`Editing product: ${product.name}`);
  }, []);

  const handleManageCategories = useCallback((product) => {
    console.log('📂 Managing categories for product:', product);
    setSelectedProducts([product.id]);
    setCurrentTab(2); // Switch to categories tab
  }, []);

  // ===== FILTER HANDLERS =====
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev,
      [filterType]: value
    }));
  }, []);

  const handlePriceRangeChange = useCallback((type, value) => {
    setFilters(prev => ({ ...prev,
      priceRange: { ...prev.priceRange,
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
    if(brands.length > 0) { // Only fetch after brands are loaded
      fetchProducts();
    }
  }, [filters, fetchProducts, brands.length]);

  // ===== RENDER TAB CONTENT =====
  const renderTabContent = () => {
    switch(currentTab) {
      case 0: // Products Overview
        return (
          <UnifiedGrid
            { ...getStandardGridProps('products', {
              // Data
              data: products,
              columns: productColumns,
              loading,
              
              // Grid identification
              gridName: 'ProductManagementGrid',
              
              // Configuration
              toolbarConfig: getStandardToolbarConfig('products'),
              
              // Stats cards
              showStatsCards: true,
              gridCards: [
                {
                  title: 'Total Products',
                  value: stats.total,
                  icon: ProductIcon,
                  color: 'primary'
                },
                {
                  title: 'Active',
                  value: stats.active,
                  icon: SettingsIcon,
                  color: 'success'
                },
                {
                  title: 'Inactive',
                  value: stats.inactive,
                  icon: SettingsIcon,
                  color: 'warning'
                },
                {
                  title: 'With Categories',
                  value: stats.withCategories,
                  icon: CategoryIcon,
                  color: 'info'
                }
              ],
              
              // Event handlers
              onRefresh: fetchProducts,
              onRowDoubleClick: (params) => handleViewProduct(params.row),
              
              // Row configuration
              getRowId: (row) => row.id,
              
              // Selection
              checkboxSelection: true,
              onSelectionModelChange: (newSelection) => {
                setSelectedProducts(newSelection);
              },
              
              // Error handling
              onError: (error) => {
                console.error('Product Management Grid Error:', error);
                toast.error('Error in product management grid');
              }
            })}
          />
        );

      case 1: // Product Attributes
        return <ProductAttributesGrid />;

      case 2: // Category Assignment
        return <ProductCategoriesGrid productIds={selectedProducts} />;

      default:
        return null;
    }
  };

  return Boolean((
    <Box sx={{ display: "flex", height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ display: "flex", mb: 2, p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Product Management System
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive product, attributes, and categories management like Magento backend
        </Typography>
        
        {/* Selected Products Info */}
        {selectedProducts.length > 0 && (
          <Alert severity="info" sx={{ display: "flex", mt: 2 }}>
            <Typography variant="body2">
              Working with {selectedProducts.length} selected products: {selectedProducts.join(', ')}
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Built-in Filters */}
      {currentTab ===0 && (
        <Card sx={{ display: "flex", mb: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon color="primary" />
                <Typography variant="h6">
                  Product Filters
                </Typography>
              </Box>
              <Box sx={{ display: "flex", display: 'flex', gap: 1 }}>
                <Button
                  variant="body2"
                  startIcon={<BrandIcon />}
                  onClick={handleOpenBrandManagement}
                >
                  Manage Brands
                </Button>
                <Button
                  variant="body2"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={!Object.values(filters).some(v => v !== '' && !(typeof v === 'object' && !v.min && !v.max))}
                >
                  Clear Filters
                </Button>
              </Box>
            </Box>

            <Grid { ...{container: true}} spacing={2}>
              {/* Brand Filter */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    label
                    disabled={brandsLoading}
                  >
                    <MenuItem value="">All Brands</MenuItem>
                    {brands.map((brand: any: any: any: any) => (
                      <MenuItem key={brand.value} value={brand.label}>
                        <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BrandIcon fontSize="small" />
                          {brand.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label
              {/* Type Filter */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label
              {/* Price Range */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  label
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  label
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                />
              </Grid>

              {/* Active Filters Display */}
              <Grid size={12}>
                <Box sx={{ display: "flex", display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {filters.brand && (
                    <Chip
                      label={`Brand: ${filters.brand}`}
                      onDelete={() => handleFilterChange('brand', '')}
                      color
                  )}
                  {filters.status !== '' && (
                    <Chip
                      label={`Status: ${filters.status === '1' ? 'Active' : 'Inactive'}`}
                      onDelete={() => handleFilterChange('status', '')}
                      color
                  )}
                  {filters.type && (
                    <Chip
                      label={`Type: ${filters.type}`}
                      onDelete={() => handleFilterChange('type', '')}
                      color
                  )}
                  {(filters.priceRange.min || filters.priceRange.max) && (
                    <Chip
                      label={`Price: ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}`}
                      onDelete={() => handlePriceRangeChange('min', '') || handlePriceRangeChange('max', '')}
                      color
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Paper sx={{ display: "flex", mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(e) => handleTabChange}
          variant="body2"
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: 'hidden' }}>
        {renderTabContent()}
      </Box>

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        open={productDetailOpen}
        onClose={() => setProductDetailOpen(false)}
        product={selectedProduct}
      />

      {/* Brand Management Dialog */}
      <BrandManagementDialog
        open={brandManagementOpen}
        onClose={() => setBrandManagementOpen(false)}
        onBrandsUpdated={handleBrandsUpdated}
      />

      {/* Floating Action Buttons */}
      <Box sx={{ display: "flex", position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <Stack spacing={2}>
          {/* Quick Actions FAB */}
          <TooltipWrapper title="Quick Actions" placement="left">
            <Fab
              color
              onClick={(e) => openFloatingWindow('quickActions', e)}
            >
              <AddIcon />
            </Fab>
          </TooltipWrapper>

          {/* Bulk Operations FAB */}
          <TooltipWrapper 
            title
            disabled={selectedProducts.length ===0}
          >
            <Fab
              color
              onClick={(e) => openFloatingWindow('bulkOperations', e)}
              disabled={selectedProducts.length ===0}
            >
              <SettingsIcon />
            </Fab>
          </TooltipWrapper>

          {/* Data Management FAB */}
          <TooltipWrapper title="Data Management" placement="left">
            <Fab
              color
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
        <Paper sx={{ display: "flex", p: 2, minWidth: 250 }}>
          <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Quick Actions</Typography>
            <IconButton size="small" onClick={() => closeFloatingWindow('quickActions')}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List dense>
            <ListItem button onClick={() => { /* Add Product */ closeFloatingWindow('quickActions'))))); }}>
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
        <Paper sx={{ display: "flex", p: 2, minWidth: 250 }}>
          <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Bulk Operations</Typography>
            <IconButton size="small" onClick={() => closeFloatingWindow('bulkOperations')}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Alert severity="info" sx={{ display: "flex", mb: 2 }}>
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
        <Paper sx={{ display: "flex", p: 2, minWidth: 280 }}>
          <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Data Management</Typography>
            <IconButton size="small" onClick={() => closeFloatingWindow('dataManagement')}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ display: "flex", mb: 2 }}>
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
};

// ===== PRODUCT DETAIL DIALOG =====
const ProductDetailDialog: React.FC<{open onClose product: any}> = ({ open, onClose, product  }) => {
  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Product Details: {product.name}
      </DialogTitle>
      <DialogContent>
        <Grid { ...{container: true}} spacing={2} sx={{ display: "flex", mt: 1 }}>
          <Grid size={6}>
            <TextField
              label
              value={product.id}
              fullWidth
              disabled
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label
              value={product.sku}
              fullWidth
              disabled
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label
              value={product.name}
              fullWidth
              disabled
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label
              value={product.price || 0}
              fullWidth
              disabled
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label
              value={product.status ===1 ? 'Active' : 'Inactive'}
              fullWidth
              disabled
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label
              value={product.type_id || 'simple'}
              fullWidth
              disabled
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onClose}>
          Edit Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductManagementGrid;
