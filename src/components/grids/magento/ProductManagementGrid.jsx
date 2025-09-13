import React, { useState, useCallback, useMemo, useEffect, useTransition, memo } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import {
  Inventory as ProductIcon,
  Category as CategoryIcon,
  Label as AttributeIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  BrandingWatermark as BrandIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Enhanced Base Components
import BaseGrid from '../../base/BaseGrid';
import BaseDialog from '../../base/BaseDialog';
import TooltipWrapper from '../../common/TooltipWrapper';

// Specialized Components
import ProductAttributesGrid from './ProductAttributesGrid';
import ProductCategoriesGrid from './ProductCategoriesGrid';
import BrandManagementDialog from '../../dialogs/BrandManagementDialog';

// Configuration and Services
import { getStandardGridProps, getStandardStatsCards } from '../../../config/baseGridConfig';
import magentoApi from '../../../services/magentoApi';

/**
 * ProductManagementGrid - Refactored with BaseGrid
 * 
 * Features:
 * - Uses BaseGrid for all grid functionality
 * - Eliminates code duplication
 * - Standardized configuration
 * - Enhanced performance with DRY principles
 * 
 * @author Techno-ETL Team
 * @version 3.0.0 - DRY Optimized
 */
const ProductManagementGrid = memo(({ initialProductIds = [] }) => {
  // ===== REACT 18 HOOKS =====
  const [isPending, startTransition] = useTransition();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState(initialProductIds);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [brandManagementOpen, setBrandManagementOpen] = useState(false);

  // ===== GRID CONFIGURATION =====
  const gridConfig = useMemo(() => getStandardGridProps('magento', {
    gridName: 'ProductManagementGrid',
    searchableFields: ['name', 'sku', 'brand'],
    showStatsCards: true,
    showCardView: true,
    defaultViewMode: 'grid',
    enableFloatingActions: true,
    contextMenuActions: {
      view: 'View Details',
      edit: 'Edit Product',
      delete: 'Delete Product',
      categories: 'Manage Categories'
    }
  }), []);

  // ===== STATS CARDS CONFIGURATION =====
  const statsCards = useMemo(() => getStandardStatsCards('magento', {
    products: 0,
    orders: 0,
    customers: 0,
    categories: 0
  }), []);

  // ===== PRODUCT COLUMNS =====
  const productColumns = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace" color="primary">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'sku',
      headerName: 'SKU',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" color="success.main">
          ${params.value?.toFixed(2) || '0.00'}
        </Typography>
      )
    },
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

  // ===== EVENT HANDLERS =====
  const handleViewProduct = useCallback((product) => {
    console.log('👁️ Viewing product:', product);
    setSelectedProduct(product);
    setProductDetailOpen(true);
  }, []);

  const handleEditProduct = useCallback(async (data) => {
    try {
      console.log('✏️ Editing product:', data);
      const updatedProduct = await magentoApi.updateProduct(data.id, data);
      toast.success('Product updated successfully');
      return updatedProduct;
    } catch (error) {
      console.error('❌ Error updating product:', error);
      toast.error('Failed to update product');
      throw error;
    }
  }, []);

  const handleManageCategories = useCallback((product) => {
    console.log('📂 Managing categories for product:', product);
    setCurrentTab(2); // Switch to categories tab
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    startTransition(() => {
      setCurrentTab(newValue);
    });
  }, []);

  const handleSelectionChange = useCallback((selection) => {
    startTransition(() => {
      setSelectedProducts(selection);
    });
  }, []);

  const handleOpenBrandManagement = useCallback(() => {
    setBrandManagementOpen(true);
  }, []);

  const handleBrandsUpdated = useCallback(() => {
    // Refresh will be handled by BaseGrid
    toast.success('Brands updated successfully');
  }, []);

  // ===== RENDER TAB CONTENT =====
  const renderTabContent = useCallback(() => {
    switch (currentTab) {
      case 0: // Products Overview
        return (
          <BaseGrid
            {...gridConfig}
            columns={productColumns}
            gridCards={statsCards}
            
            // Event Handlers
            onSelectionChange={handleSelectionChange}
            onEdit={handleEditProduct}
            
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
        );

      case 1: // Product Attributes
        return <ProductAttributesGrid />;

      case 2: // Category Assignment
        return <ProductCategoriesGrid productIds={selectedProducts} />;

      default:
        return null;
    }
  }, [currentTab, gridConfig, productColumns, statsCards, handleSelectionChange, handleEditProduct, handleManageCategories, handleOpenBrandManagement, selectedProducts]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Product Management System
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive product, attributes, and categories management powered by BaseGrid
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
        open={productDetailOpen}
        onClose={() => setProductDetailOpen(false)}
        title={`Product Details: ${selectedProduct?.name || ''}`}
        maxWidth="md"
        showActions={false}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Product Information
          </Typography>
          {selectedProduct && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Typography><strong>ID:</strong> {selectedProduct.id}</Typography>
              <Typography><strong>SKU:</strong> {selectedProduct.sku}</Typography>
              <Typography><strong>Name:</strong> {selectedProduct.name}</Typography>
              <Typography><strong>Price:</strong> ${selectedProduct.price?.toFixed(2) || '0.00'}</Typography>
              <Typography><strong>Status:</strong> {selectedProduct.status === 1 ? 'Active' : 'Inactive'}</Typography>
              <Typography><strong>Type:</strong> {selectedProduct.type_id || 'Simple'}</Typography>
              <Typography><strong>Brand:</strong> {selectedProduct.brand || 'Unknown'}</Typography>
            </Box>
          )}
        </Box>
      </BaseDialog>

      {/* Brand Management Dialog */}
      <BrandManagementDialog
        open={brandManagementOpen}
        onClose={() => setBrandManagementOpen(false)}
        onBrandsUpdated={handleBrandsUpdated}
      />
    </Box>
  );
});

// Set display name for debugging
ProductManagementGrid.displayName = 'ProductManagementGrid';

export default ProductManagementGrid;