import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Unified Grid System
import UnifiedGrid from '../../common/UnifiedGrid';
import { getStandardGridProps, getStandardToolbarConfig } from '../../../config/gridConfig';
import { ColumnFactory } from '../../../utils/ColumnFactory.jsx';

// Services
import magentoApi from '../../../services/magentoApi';

/**
 * ProductCategoriesGrid - Product Categories Assignment Management
 * Shows products and allows category assignment like Magento Backend
 */
const ProductCategoriesGrid = ({ productIds = [] }) => {
  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set([1])); // Expand root by default
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    unassigned: 0,
  });

  // ===== COLUMN DEFINITIONS =====
  const columns = useMemo(() => [
    ColumnFactory.text('id', {
      headerName: 'Product ID',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value}
        </Typography>
      ),
    }),
    ColumnFactory.text('sku', {
      headerName: 'SKU',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    }),
    ColumnFactory.text('name', {
      headerName: 'Product Name',
      flex: 1,
    }),
    {
      field: 'categories',
      headerName: 'Assigned Categories',
      flex: 1,
      renderCell: (params) => {
        const categories = params.value || [];

        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {categories.length > 0 ? (
              categories.slice(0, 3).map((category, index) => (
                <Chip
                  key={index}
                  label={category.name}
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<CategoryIcon />}
                />
              ))
            ) : (
              <Chip
                label="No categories"
                size="small"
                color="default"
                variant="outlined"
              />
            )}
            {categories.length > 3 && (
              <Chip
                label={`+${categories.length - 3} more`}
                size="small"
                color="info"
                variant="outlined"
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="Assign Categories">
          <IconButton
            size="small"
            onClick={() => handleAssignCategories(params.row)}
            color="primary"
          >
            <AssignmentIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ], []);

  // ===== DATA FETCHING =====
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products for category assignment...', params);

      // If specific product IDs provided, fetch those
      if (productIds.length > 0) {
        const products = await Promise.all(
          productIds.map(async (id) => {
            try {
              const product = await magentoApi.getProduct(id);
              const categories = await magentoApi.getProductCategories(id);

              return {
                ...product,
                categories: categories?.categories || [],
              };
            } catch (error) {
              console.warn(`Failed to fetch product ${id}:`, error);

              return {
                id,
                sku: `PRODUCT-${id}`,
                name: `Product ${id}`,
                categories: [],
              };
            }
          }),
        );

        setData(products);
        updateStats(products);
      } else {
        // Fetch all products
        const response = await magentoApi.getProducts(params);
        const products = response?.items || [];

        // Fetch categories for each product
        const productsWithCategories = await Promise.all(
          products.map(async (product) => {
            try {
              const categories = await magentoApi.getProductCategories(product.id);

              return {
                ...product,
                categories: categories?.categories || [],
              };
            } catch (error) {
              return {
                ...product,
                categories: [],
              };
            }
          }),
        );

        setData(productsWithCategories);
        updateStats(productsWithCategories);
      }

    } catch (error) {
      console.error('❌ Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [productIds]);

  const fetchCategories = useCallback(async () => {
    try {
      console.log('🔄 Fetching categories tree...');
      const response = await magentoApi.getCategories();
      const categoriesData = response?.data?.items || response?.items || [];

      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  }, []);

  // ===== STATISTICS UPDATE =====
  const updateStats = useCallback((products) => {
    const newStats = products.reduce((acc, product) => ({
      total: acc.total + 1,
      assigned: acc.assigned + (product.categories?.length > 0 ? 1 : 0),
      unassigned: acc.unassigned + (product.categories?.length === 0 ? 1 : 0),
    }), {
      total: 0,
      assigned: 0,
      unassigned: 0,
    });

    setStats(newStats);
  }, []);

  // ===== EVENT HANDLERS =====
  const handleAssignCategories = useCallback((product) => {
    console.log('📂 Assigning categories to product:', product);
    setSelectedProduct(product);

    // Set currently assigned categories as selected
    const currentCategoryIds = new Set(
      product.categories?.map(cat => cat.id.toString()) || [],
    );

    setSelectedCategories(currentCategoryIds);
    setAssignDialogOpen(true);
  }, []);

  const handleCategoryToggle = useCallback((categoryId) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);

      if (newSet.has(categoryId.toString())) {
        newSet.delete(categoryId.toString());
      } else {
        newSet.add(categoryId.toString());
      }

      return newSet;
    });
  }, []);

  const handleSaveAssignment = useCallback(async () => {
    if (!selectedProduct) return;

    try {
      const categoryIds = Array.from(selectedCategories).map(id => parseInt(id));

      console.log('💾 Saving category assignment:', {
        productId: selectedProduct.id,
        categoryIds,
      });

      await magentoApi.assignProductToCategories(selectedProduct.id, categoryIds);
      toast.success('Categories assigned successfully');

      // Refresh data
      await fetchProducts();
      setAssignDialogOpen(false);

    } catch (error) {
      console.error('❌ Error assigning categories:', error);
      toast.error('Failed to assign categories');
    }
  }, [selectedProduct, selectedCategories, fetchProducts]);

  // ===== EFFECTS =====
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Info */}
      {productIds.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Managing categories for {productIds.length} specific products: {productIds.join(', ')}
        </Alert>
      )}

      <UnifiedGrid
        {...getStandardGridProps('productCategories', {
          // Data
          data,
          columns,
          loading,

          // Grid identification
          gridName: 'ProductCategoriesGrid',

          // Configuration
          toolbarConfig: getStandardToolbarConfig('productCategories'),

          // Stats cards
          showStatsCards: true,
          gridCards: [
            {
              title: 'Total Products',
              value: stats.total,
              icon: AssignmentIcon,
              color: 'primary',
            },
            {
              title: 'With Categories',
              value: stats.assigned,
              icon: CategoryIcon,
              color: 'success',
            },
            {
              title: 'Unassigned',
              value: stats.unassigned,
              icon: CancelIcon,
              color: 'warning',
            },
          ],

          // Event handlers
          onRefresh: fetchProducts,
          onRowDoubleClick: (params) => handleAssignCategories(params.row),

          // Row configuration
          getRowId: (row) => row.id,

          // Error handling
          onError: (error) => {
            console.error('Product Categories Grid Error:', error);
            toast.error('Error in product categories grid');
          },
        })}
      />

      {/* Category Assignment Dialog */}
      <CategoryAssignmentDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        product={selectedProduct}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        onSave={handleSaveAssignment}
      />
    </Box>
  );
};

// ===== CATEGORY ASSIGNMENT DIALOG =====
const CategoryAssignmentDialog = ({
  open,
  onClose,
  product,
  categories,
  selectedCategories,
  onCategoryToggle,
  onSave,
}) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set([1]));

  const handleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);

      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }

      return newSet;
    });
  };

  const renderCategoryTree = (categoryList, level = 0) => {
    return categoryList.map((category) => {
      const hasChildren = category.children_data && category.children_data.length > 0;
      const isExpanded = expandedCategories.has(category.id);

      return (
        <React.Fragment key={category.id}>
          <ListItem
            sx={{
              pl: level * 3 + 1,
              py: 0.5,
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              {hasChildren ? (
                <IconButton
                  size="small"
                  onClick={() => handleCategoryExpand(category.id)}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ChevronRightIcon />}
                </IconButton>
              ) : (
                <Box sx={{ width: 32 }} />
              )}
            </ListItemIcon>

            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedCategories.has(category.id.toString())}
                  onChange={() => onCategoryToggle(category.id)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon fontSize="small" color={level === 0 ? 'primary' : 'action'} />
                  <Typography variant="body2" fontWeight={level === 0 ? 600 : 400}>
                    {category.name}
                  </Typography>
                  <Chip
                    label={`ID: ${category.id}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Box>
              }
              sx={{ flexGrow: 1, ml: 0 }}
            />
          </ListItem>

          {hasChildren && isExpanded && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              {renderCategoryTree(category.children_data, level + 1)}
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Assign Categories to: {product?.name}
        <Typography variant="body2" color="text.secondary">
          SKU: {product?.sku} | ID: {product?.id}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="h6" gutterBottom>
            Select Categories:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selected: {selectedCategories.size} categories
          </Typography>

          <Box sx={{
            maxHeight: 400,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}>
            <List dense>
              {renderCategoryTree(categories)}
            </List>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          startIcon={<SaveIcon />}
        >
          Save Assignment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductCategoriesGrid;
