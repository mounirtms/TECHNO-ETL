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

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Chip,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileUpload as ImportIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  AttachMoney as AttachMoneyIcon,
  ReportProblem as ReportProblemIcon,
  SyncAlt as SyncAltIcon,
  Info as InfoIcon,
  ArrowDropDown as ArrowDropDownIcon,
  PostAdd as PostAddIcon
} from '@mui/icons-material';
import UnifiedGrid from '../../common/UnifiedGrid';
import ProductInfoDialog from '../../common/ProductInfoDialog';
import magentoApi from '../../../services/magentoApi';
import { toast } from 'react-toastify';
// Removed gridDataHandlers import - skipping validation for now
import CSVImportDialog from '../../dialogs/CSVImportDialog';
import CatalogProcessorDialog from '../../dialogs/CatalogProcessorDialog';
import ProductService from '../../../services/ProductService';
import CategoryIcon from '@mui/icons-material/Category';
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
    averagePrice: 0,
    localProducts: 0 // Track local products count
  });

  // Local products management (products added locally but not synced to Magento)
  const [localProducts, setLocalProducts] = useState([]);
  const [syncLoading, setSyncLoading] = useState(false);

  // Computed values
  const hasLocalProducts = localProducts.length > 0;
  const selectedLocalProducts = selectedRows.filter(sku =>
    localProducts.some(product => product.sku === sku)
  );
  const canSync = hasLocalProducts || selectedLocalProducts.length > 0;

  // Dialog states
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [catalogProcessorOpen, setCatalogProcessorOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  // Add menu state
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const addMenuOpen = Boolean(addMenuAnchor);

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
      setInfoDialogOpen(true); // Using info dialog for now - edit dialog can be added later
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

  // Add menu handlers
  const handleAddMenuOpen = useCallback((event) => {
    setAddMenuAnchor(event.currentTarget);
  }, []);

  const handleAddMenuClose = useCallback(() => {
    setAddMenuAnchor(null);
  }, []);

  const handleAddSingle = useCallback(() => {
    handleAddMenuClose();
    handleAdd();
  }, [handleAdd, handleAddMenuClose]);

  const handleCsvImport = useCallback(() => {
    handleAddMenuClose();
    setCsvImportOpen(true);
  }, [handleAddMenuClose]);

  const handleCatalogProcessorFromMenu = useCallback(() => {
    handleAddMenuClose();
    handleCatalogProcessor();
  }, [handleAddMenuClose, handleCatalogProcessor]);

  // ===== LOCAL PRODUCTS MANAGEMENT =====

  /**
   * Add a product to local storage (not synced to Magento yet)
   * @param {Object} product - Product data
   */
  const addLocalProduct = useCallback((product) => {
    const localProduct = {
      ...product,
      isLocal: true,
      localId: `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
      status: 'pending_sync'
    };

    setLocalProducts(prev => [...prev, localProduct]);

    // Add to grid data with special styling
    setData(prev => [...prev, localProduct]);

    // Update stats
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      localProducts: prev.localProducts + 1
    }));

    toast.success(`Product "${product.name}" added locally. Use sync to upload to Magento.`);
  }, []);

  /**
   * Handle CSV import completion - add products as local
   * @param {Array} importedProducts - Products from CSV import
   */
  const handleCsvImportComplete = useCallback((importedProducts) => {
    if (importedProducts && importedProducts.length > 0) {
      const localProductsToAdd = importedProducts.map(product => ({
        ...product,
        isLocal: true,
        localId: `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        createdAt: new Date().toISOString(),
        status: 'pending_sync'
      }));

      setLocalProducts(prev => [...prev, ...localProductsToAdd]);
      setData(prev => [...prev, ...localProductsToAdd]);

      setStats(prev => ({
        ...prev,
        total: prev.total + localProductsToAdd.length,
        localProducts: prev.localProducts + localProductsToAdd.length
      }));

      toast.success(`${localProductsToAdd.length} products imported locally. Use sync to upload to Magento.`);
    }
    setCsvImportOpen(false);
  }, []);

  /**
   * Sync local products to Magento
   * @param {Array} productsToSync - Specific products to sync, or all local products if empty
   */
  const handleSyncProducts = useCallback(async (productsToSync = null) => {
    const products = productsToSync || localProducts;

    if (products.length === 0) {
      toast.warning('No local products to sync');
      return;
    }

    setSyncLoading(true);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Process products in batches for better performance
      const batchSize = 5;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);

        await Promise.all(batch.map(async (product) => {
          try {
            // Remove local-specific fields before sending to Magento
            const { isLocal, localId, createdAt, status, ...magentoProduct } = product;

            const result = await ProductService.createProduct(magentoProduct);

            if (result.success) {
              successCount++;

              // Update product in grid data (remove isLocal flag)
              setData(prev => prev.map(p =>
                p.localId === product.localId
                  ? { ...p, isLocal: false, status: 'synced', magentoId: result.data.id }
                  : p
              ));

              // Remove from local products
              setLocalProducts(prev => prev.filter(p => p.localId !== product.localId));

            } else {
              errorCount++;
              errors.push(`${product.sku}: ${result.error}`);
            }
          } catch (error) {
            errorCount++;
            errors.push(`${product.sku}: ${error.message}`);
          }
        }));

        // Small delay between batches
        if (i + batchSize < products.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        localProducts: prev.localProducts - successCount,
        syncedProducts: prev.syncedProducts + successCount
      }));

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully synced ${successCount} product(s) to Magento`);
      }

      if (errorCount > 0) {
        toast.error(`Failed to sync ${errorCount} product(s). Check console for details.`);
        console.error('Sync errors:', errors);
      }

      // Refresh grid to get latest data from Magento
      fetchProducts();

    } catch (error) {
      console.error('Sync operation failed:', error);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setSyncLoading(false);
    }
  }, [localProducts, fetchProducts]);

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

  // Custom segmented add button component
  const SegmentedAddButton = useMemo(() => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ButtonGroup variant="contained" color="primary">
        <Button
          onClick={handleAddSingle}
          startIcon={<AddIcon />}
          sx={{ minWidth: 120 }}
        >
          Add Product
        </Button>
        <Button
          size="small"
          onClick={handleAddMenuOpen}
          sx={{ px: 1, minWidth: 32 }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      <Menu
        anchorEl={addMenuAnchor}
        open={addMenuOpen}
        onClose={handleAddMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleAddSingle}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Add Single Product" secondary="Create one product manually" />
        </MenuItem>

        <MenuItem onClick={handleCsvImport}>
          <ListItemIcon>
            <PostAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="CSV Import" secondary="Import from CSV file" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleCatalogProcessorFromMenu}>
          <ListItemIcon>
            <ImportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Process Full Catalog" secondary="Process 20MB catalog file" />
        </MenuItem>
      </Menu>
    </Box>
  ), [
    handleAddSingle,
    handleAddMenuOpen,
    addMenuAnchor,
    addMenuOpen,
    handleAddMenuClose,
    handleCsvImport,
    handleCatalogProcessorFromMenu
  ]);

  // Toolbar configuration with custom segmented add button
  const toolbarConfig = useMemo(() => ({
    showRefresh: true,
    showAdd: false, // Disabled - using custom segmented add button
    showEdit: true,
    showDelete: true,
    showExport: true,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showViewToggle: true,
    compact: false,
    size: 'medium',
    customLeftActions: [SegmentedAddButton] // Add our custom segmented button
  }), [SegmentedAddButton]);

  // Smart sync button - only enabled when local products exist
  const SyncButton = useMemo(() => {
    if (!canSync) return null;

    const syncCount = selectedLocalProducts.length > 0 ? selectedLocalProducts.length : localProducts.length;
    const buttonText = selectedLocalProducts.length > 0
      ? `Sync Selected (${selectedLocalProducts.length})`
      : `Sync All Local (${localProducts.length})`;

    return (
      <Tooltip title={`Sync ${syncCount} local product(s) to Magento`}>
        <Badge badgeContent={localProducts.length} color="warning" max={99}>
          <Button
            onClick={() => handleSyncProducts(
              selectedLocalProducts.length > 0
                ? localProducts.filter(p => selectedLocalProducts.includes(p.sku))
                : null
            )}
            startIcon={<SyncAltIcon />}
            variant="contained"
            color="success"
            disabled={syncLoading}
            sx={{
              minWidth: 140,
              '& .MuiBadge-badge': {
                right: -8,
                top: -8
              }
            }}
          >
            {syncLoading ? 'Syncing...' : buttonText}
          </Button>
        </Badge>
      </Tooltip>
    );
  }, [canSync, selectedLocalProducts, localProducts, handleSyncProducts, syncLoading]);

  const customActions = useMemo(() => {
    const actions = [];

    // Add sync button if there are local products
    if (SyncButton) {
      actions.push({
        component: SyncButton,
        key: 'sync-local-products'
      });
    }

    return actions;
  }, [SyncButton]);

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
        setInfoDialogOpen(true); // Using info dialog for now - edit dialog can be added later
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
    { key: 'outofstock', label: 'Out of Stock', value: 'outofstock' },
    { key: 'local', label: 'Local Products', value: 'local' },
    { key: 'synced', label: 'Synced Products', value: 'synced' }
  ], []);

  // Custom row styling for local products
  const getRowClassName = useCallback((params) => {
    if (params.row?.isLocal) {
      return 'local-product-row';
    }
    return '';
  }, []);

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
        getRowClassName={getRowClassName}

        // Custom styling for local products
        sx={{
          '& .local-product-row': {
            backgroundColor: 'rgba(255, 193, 7, 0.1)', // Light amber background
            borderLeft: '4px solid #ffc107', // Amber left border
            '&:hover': {
              backgroundColor: 'rgba(255, 193, 7, 0.2)',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(255, 193, 7, 0.3)',
            }
          }
        }}
      />

      <ProductInfoDialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        product={selectedProduct}
      />

      <CSVImportDialog
        open={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImportComplete={handleCsvImportComplete}
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