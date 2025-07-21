import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert,
  Button,
  TextField,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Inventory as ProductIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Components
import ProductManagementGrid from '../components/grids/magento/ProductManagementGrid';
import BulkMediaUploadDialog from '../components/dialogs/BulkMediaUploadDialog';

/**
 * ProductManagementPage - Main page for comprehensive product management
 * Allows users to specify product IDs or work with all products
 */
const ProductManagementPage = () => {
  // ===== STATE MANAGEMENT =====
  const [productIds, setProductIds] = useState([  ]); // Pre-populated with your provided IDs
  const [inputValue, setInputValue] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [bulkMediaDialogOpen, setBulkMediaDialogOpen] = useState(false);

  // ===== EVENT HANDLERS =====
  const handleAddProductId = () => {
    if (inputValue.trim() && !productIds.includes(inputValue.trim())) {
      setProductIds(prev => [...prev, inputValue.trim()]);
      setInputValue('');
      toast.success(`Product ID ${inputValue.trim()} added`);
    } else if (productIds.includes(inputValue.trim())) {
      toast.warning('Product ID already exists');
    }
  };

  const handleRemoveProductId = (idToRemove) => {
    setProductIds(prev => prev.filter(id => id !== idToRemove));
    toast.info(`Product ID ${idToRemove} removed`);
  };

  const handleClearAll = () => {
    setProductIds([]);
    toast.info('All product IDs cleared');
  };

  const handleShowAllProducts = () => {
    setShowAllProducts(true);
    setProductIds([]);
    toast.info('Switched to all products mode');
  };

  const handleShowSpecificProducts = () => {
    setShowAllProducts(false);
    toast.info('Switched to specific products mode');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddProductId();
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Page Header */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <ProductIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1">
              Product Management System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive product attributes and categories management like Magento backend
            </Typography>
          </Box>
        </Box>

        {/* Product ID Management */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Product Selection
          </Typography>
          
          {/* Mode Toggle */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant={!showAllProducts ? 'contained' : 'outlined'}
              onClick={handleShowSpecificProducts}
              startIcon={<SearchIcon />}
            >
              Specific Products
            </Button>
            <Button
              variant={showAllProducts ? 'contained' : 'outlined'}
              onClick={handleShowAllProducts}
              startIcon={<ProductIcon />}
            >
              All Products
            </Button>
          </Box>

          {/* Specific Products Mode */}
          {!showAllProducts && (
            <>
              {/* Add Product ID Input */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Product ID"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter product ID (e.g., 1140659762)"
                  size="small"
                  sx={{ minWidth: 200 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddProductId}
                  startIcon={<AddIcon />}
                  disabled={!inputValue.trim()}
                >
                  Add
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearAll}
                  startIcon={<ClearIcon />}
                  disabled={productIds.length === 0}
                  color="warning"
                >
                  Clear All
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setBulkMediaDialogOpen(true)}
                  startIcon={<ImageIcon />}
                  color="info"
                >
                  Bulk Media Upload
                </Button>
              </Box>

              {/* Current Product IDs */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Selected Product IDs ({productIds.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {productIds.length > 0 ? (
                    productIds.map((id) => (
                      <Chip
                        key={id}
                        label={id}
                        onDelete={() => handleRemoveProductId(id)}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      No product IDs selected. Add some above or switch to "All Products" mode.
                    </Typography>
                  )}
                </Box>
              </Box>
            </>
          )}

          {/* All Products Mode */}
          {showAllProducts && (
            <Alert severity="info">
              <Typography variant="body2">
                Working with all products in the system. This may take longer to load.
              </Typography>
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <ProductManagementGrid 
          initialProductIds={showAllProducts ? [] : productIds}
          key={showAllProducts ? 'all' : productIds.join(',')} // Force re-render when switching modes
        />
      </Box>

      {/* Footer Info */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          💡 <strong>Tip:</strong> Use the tabs above to switch between Products Overview, Attributes Management, and Category Assignment. 
          Double-click any product to view details, or use the action buttons for specific operations.
        </Typography>
      </Paper>

      {/* Bulk Media Upload Dialog */}
      <BulkMediaUploadDialog
        open={bulkMediaDialogOpen}
        onClose={() => setBulkMediaDialogOpen(false)}
        onComplete={(results) => {
          console.log('Bulk media upload completed:', results);
          toast.success(`Media upload completed: ${results.filter(r => r.status === 'success').length} successful`);
          setBulkMediaDialogOpen(false);
        }}
      />
    </Box>
  );
};

export default ProductManagementPage;
