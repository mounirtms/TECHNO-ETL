import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import {
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Category as CategoriesIcon,
  Storage as StockIcon,
  Settings as ManageIcon,
  Analytics as AnalyticsIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import refactored grids
import ProductsGrid from '../components/grids/magento/ProductsGridRefactored';
import OrdersGrid from '../components/grids/magento/OrdersGridRefactored';
import CustomersGrid from '../components/grids/magento/CustomersGridRefactored';
import CategoryGrid from '../components/grids/magento/CategoryGrid';
import StocksGrid from '../components/grids/magento/StocksGrid';

// Import dialogs
import ProductEditDialog from '../components/dialogs/ProductEditDialog';
import BulkMediaUploadDialog from '../components/dialogs/BulkMediaUploadDialog';
import CSVImportDialog from '../components/dialogs/CSVImportDialog';

// Error boundary for tab content
import ErrorBoundary from '../components/common/ErrorBoundary';

/**
 * Comprehensive Product Management Page
 * Integrates all Magento management functionality with perfect error handling
 */
const ProductManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active tab from URL or default to products
  const getTabFromPath = () => {
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    return ['products', 'orders', 'customers', 'categories', 'stock', 'analytics'].includes(lastSegment) 
      ? lastSegment 
      : 'products';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [globalError, setGlobalError] = useState(null);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Tab configuration
  const tabs = useMemo(() => [
    {
      id: 'products',
      label: 'Products',
      icon: <ProductsIcon />,
      component: ProductsGrid,
      description: 'Manage product catalog, inventory, and media'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <OrdersIcon />,
      component: OrdersGrid,
      description: 'Process orders, shipments, and fulfillment'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <CustomersIcon />,
      component: CustomersGrid,
      description: 'Manage customer accounts and relationships'
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: <CategoriesIcon />,
      component: CategoryGrid,
      description: 'Organize product categories and hierarchy'
    },
    {
      id: 'stock',
      label: 'Stock',
      icon: <StockIcon />,
      component: StocksGrid,
      description: 'Monitor inventory levels and stock movements'
    }
  ], []);

  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    setGlobalError(null); // Clear any previous errors
    
    // Update URL to reflect tab change
    const basePath = location.pathname.split('/').slice(0, -1).join('/');
    navigate(`${basePath}/${newValue}`, { replace: true });
  }, [navigate, location.pathname]);

  // Global error handler
  const handleGlobalError = useCallback((error, context = 'Operation') => {
    console.error(`${context} error:`, error);
    setGlobalError(`${context} failed: ${error.message || 'Unknown error'}`);
    toast.error(`${context} failed: ${error.message || 'Unknown error'}`);
  }, []);

  // Global success handler
  const handleGlobalSuccess = useCallback((message, context = 'Operation') => {
    console.log(`${context} success:`, message);
    toast.success(message);
    setGlobalError(null); // Clear any previous errors
  }, []);

  // Render active tab content
  const renderTabContent = () => {
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          Tab not found: {activeTab}
        </Alert>
      );
    }

    const TabComponent = activeTabConfig.component;
    
    return (
      <ErrorBoundary
        fallback={(error, errorInfo) => (
          <Alert severity="error" sx={{ m: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error in {activeTabConfig.label}
            </Typography>
            <Typography variant="body2">
              {error.message}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Component: {errorInfo.componentStack}
            </Typography>
          </Alert>
        )}
        onError={(error, errorInfo) => {
          handleGlobalError(error, `${activeTabConfig.label} Component`);
        }}
      >
        <TabComponent
          onError={handleGlobalError}
          onSuccess={handleGlobalSuccess}
          onEditRequest={(item) => {
            setSelectedItem(item);
            setEditDialogOpen(true);
          }}
          onBulkUploadRequest={() => setBulkUploadOpen(true)}
          onImportRequest={() => setCsvImportOpen(true)}
        />
      </ErrorBoundary>
    );
  };

  // Statistics summary
  const renderStats = () => {
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeTabConfig.icon}
          {activeTabConfig.label} Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {activeTabConfig.description}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <HomeIcon fontSize="small" />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ManageIcon fontSize="small" />
            Product Management
          </Typography>
        </Breadcrumbs>

        {/* Page Title */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Magento Management Center
          </Typography>
          <Chip
            label="Advanced Management"
            color="primary"
            variant="filled"
          />
        </Box>

        {/* Global Error Display */}
        {globalError && (
          <Alert 
            severity="error" 
            onClose={() => setGlobalError(null)}
            sx={{ mb: 2 }}
          >
            {globalError}
          </Alert>
        )}

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500
            }
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Stats Section */}
      {renderStats()}

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {renderTabContent()}
      </Box>

      {/* Global Dialogs */}
      <ProductEditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedItem(null);
        }}
        product={selectedItem}
        onSave={(updatedItem) => {
          handleGlobalSuccess(`${selectedItem?.name || 'Item'} updated successfully`, 'Save');
          setEditDialogOpen(false);
          setSelectedItem(null);
        }}
        onError={handleGlobalError}
      />

      <BulkMediaUploadDialog
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onComplete={(results) => {
          const successCount = results.filter(r => r.status === 'success').length;
          const failCount = results.filter(r => r.status === 'error').length;
          
          if (failCount === 0) {
            handleGlobalSuccess(`All ${successCount} media files uploaded successfully`, 'Bulk Upload');
          } else {
            handleGlobalError(
              new Error(`${successCount} successful, ${failCount} failed`),
              'Bulk Upload'
            );
          }
          setBulkUploadOpen(false);
        }}
        onError={handleGlobalError}
      />

      <CSVImportDialog
        open={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImportComplete={(results) => {
          handleGlobalSuccess(`CSV import completed: ${results.imported} items processed`, 'CSV Import');
          setCsvImportOpen(false);
        }}
        onError={handleGlobalError}
      />
    </Box>
  );
};

export default ProductManagementPage;