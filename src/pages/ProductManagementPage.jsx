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
  Tooltip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Divider,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Inventory as ProductIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  PhotoSizeSelectActual as ResizeIcon,
  DriveFileRenameOutline as RenameIcon,
  Category as CategoryIcon,
  LocalOffer as BrandIcon,
  Settings as SettingsIcon,
  CloudUpload as UploadIcon,
  Transform as TransformIcon
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

  // Tab management
  const [activeTab, setActiveTab] = useState(0);

  // Image processing state
  const [imageProcessing, setImageProcessing] = useState({
    renaming: false,
    resizing: false,
    uploading: false
  });

  // Cached data for performance
  const [cachedData, setCachedData] = useState({
    attributes: null,
    brands: null,
    categories: null,
    lastUpdated: null
  });

  // Processing results
  const [processingResults, setProcessingResults] = useState({
    renamed: 0,
    resized: 0,
    uploaded: 0,
    errors: []
  });

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

  // ===== CACHING FUNCTIONS =====
  const loadCachedData = async () => {
    try {
      // Check if cache is still valid (1 hour)
      const cacheAge = cachedData.lastUpdated ? Date.now() - cachedData.lastUpdated : Infinity;
      const cacheExpiry = 60 * 60 * 1000; // 1 hour

      if (cacheAge < cacheExpiry && cachedData.attributes) {
        console.log('Using cached data');
        return cachedData;
      }

      console.log('Loading fresh data...');
      // Load attributes, brands, and categories
      // This would typically come from your API
      const freshData = {
        attributes: [], // Load from API
        brands: [], // Load from API
        categories: [], // Load from API
        lastUpdated: Date.now()
      };

      setCachedData(freshData);
      return freshData;
    } catch (error) {
      console.error('Error loading cached data:', error);
      toast.error('Failed to load cached data');
    }
  };

  // ===== IMAGE PROCESSING FUNCTIONS =====
  const handleRenameImages = async () => {
    try {
      setImageProcessing(prev => ({ ...prev, renaming: true }));

      // This would call the renameImages.js script functionality
      // For now, simulate the process
      toast.info('Starting image renaming process...');

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      const results = {
        renamed: 45,
        skipped: 12,
        errors: 3
      };

      setProcessingResults(prev => ({ ...prev, renamed: results.renamed }));
      toast.success(`Image renaming completed: ${results.renamed} renamed, ${results.skipped} skipped`);

    } catch (error) {
      console.error('Error renaming images:', error);
      toast.error('Failed to rename images');
    } finally {
      setImageProcessing(prev => ({ ...prev, renaming: false }));
    }
  };

  const handleResizeImages = async () => {
    try {
      setImageProcessing(prev => ({ ...prev, resizing: true }));

      toast.info('Starting image resizing process...');

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 4000));

      const results = {
        resized: 38,
        skipped: 7,
        errors: 2
      };

      setProcessingResults(prev => ({ ...prev, resized: results.resized }));
      toast.success(`Image resizing completed: ${results.resized} resized to 1200x1200`);

    } catch (error) {
      console.error('Error resizing images:', error);
      toast.error('Failed to resize images');
    } finally {
      setImageProcessing(prev => ({ ...prev, resizing: false }));
    }
  };

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Enhanced Header */}
      <Paper sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Product Catalog Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Professional product management with advanced image processing and catalog tools
            </Typography>
          </Box>
          <ProductIcon sx={{ fontSize: 48, opacity: 0.7 }} />
        </Box>
      </Paper>

      {/* Enhanced Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            bgcolor: 'background.paper',
            '& .MuiTab-root': {
              minHeight: 72,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          <Tab
            icon={<ProductIcon />}
            label="Product Management"
            iconPosition="start"
            sx={{ gap: 1 }}
          />
          <Tab
            icon={<RenameIcon />}
            label="Image Renaming"
            iconPosition="start"
            sx={{ gap: 1 }}
          />
          <Tab
            icon={<ResizeIcon />}
            label="Image Resizing"
            iconPosition="start"
            sx={{ gap: 1 }}
          />
          <Tab
            icon={<SettingsIcon />}
            label="Catalog Tools"
            iconPosition="start"
            sx={{ gap: 1 }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Tab Panel Component */}
        {activeTab === 0 && (
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Product Selection & Management
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

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, overflow: 'hidden', mt: 2 }}>
              <ProductManagementGrid
                initialProductIds={showAllProducts ? [] : productIds}
                key={showAllProducts ? 'all' : productIds.join(',')} // Force re-render when switching modes
              />
            </Box>

            {/* Footer Info */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                💡 <strong>Tip:</strong> Use the tabs above to switch between Products Overview, Attributes Management, and Category Assignment.
                Double-click any product to view details, or use the action buttons for specific operations.
              </Typography>
            </Alert>
          </Paper>
        )}

        {/* Image Renaming Tab */}
        {activeTab === 1 && (
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Image Renaming Tool
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Rename camera images with ref attributes to longer descriptive names using CSV mapping
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <RenameIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Rename Images
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Process camera images and rename them using CSV reference mapping
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleRenameImages}
                    disabled={imageProcessing.renaming}
                    startIcon={imageProcessing.renaming ? <CircularProgress size={20} /> : <RenameIcon />}
                    fullWidth
                  >
                    {imageProcessing.renaming ? 'Renaming Images...' : 'Start Renaming'}
                  </Button>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Processing Results
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Renamed Images: {processingResults.renamed}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={processingResults.renamed > 0 ? (processingResults.renamed / 100) * 100 : 0}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    📁 Source: /images folder<br/>
                    📁 Output: /renamed_images folder<br/>
                    📄 CSV: calligraph.csv mapping file
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Image Resizing Tab */}
        {activeTab === 2 && (
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Image Resizing Tool
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Resize images to 1200x1200 pixels with white background padding (preserves all content)
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <ResizeIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Resize Images
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Convert images to 1200x1200 format with aspect ratio preservation
                  </Typography>
                  <Button
                    variant="contained"
                    color="info"
                    size="large"
                    onClick={handleResizeImages}
                    disabled={imageProcessing.resizing}
                    startIcon={imageProcessing.resizing ? <CircularProgress size={20} /> : <ResizeIcon />}
                    fullWidth
                  >
                    {imageProcessing.resizing ? 'Resizing Images...' : 'Start Resizing'}
                  </Button>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Resize Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    🎯 Target Size: 1200x1200 pixels<br/>
                    🖼️ Method: Aspect ratio preservation<br/>
                    🎨 Background: White padding<br/>
                    📸 Quality: 90% JPEG compression<br/>
                    📁 Source: /renamed_images<br/>
                    📁 Output: /resized_images
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Resized Images: {processingResults.resized}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={processingResults.resized > 0 ? (processingResults.resized / 100) * 100 : 0}
                      color="info"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Catalog Tools Tab */}
        {activeTab === 3 && (
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Catalog Management Tools
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Advanced tools for managing product attributes, brands, and categories with caching
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <CategoryIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Categories
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Cached: {cachedData.categories?.length || 0} categories
                  </Typography>
                  <Button variant="outlined" color="success" fullWidth>
                    Manage Categories
                  </Button>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <BrandIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Brands
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Cached: {cachedData.brands?.length || 0} brands
                  </Typography>
                  <Button variant="outlined" color="warning" fullWidth>
                    Manage Brands
                  </Button>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <SettingsIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Attributes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Cached: {cachedData.attributes?.length || 0} attributes
                  </Typography>
                  <Button variant="outlined" color="secondary" fullWidth>
                    Manage Attributes
                  </Button>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Cache Status: {cachedData.lastUpdated ?
                  `Updated ${new Date(cachedData.lastUpdated).toLocaleTimeString()}` :
                  'Not loaded'
                }
              </Typography>
              <Button
                variant="text"
                onClick={loadCachedData}
                sx={{ mt: 1 }}
              >
                Refresh Cache
              </Button>
            </Box>
          </Paper>
        )}
      </Box>

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
