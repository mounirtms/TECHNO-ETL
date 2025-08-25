import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Divider,
  Chip,
  Autocomplete,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Inventory as ProductIcon,
  Category as CategoryIcon,
  LocalOffer as BrandingIcon,
  Settings as SettingsIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import categoryService from '../../services/categoryService';
import magentoApi from '../../services/magentoApi';
import ProductMediaUpload from '../media/ProductMediaUpload';

/**
 * Enhanced Product Edit Dialog
 * Handles product editing with additional attributes and categories
 */
const ProductEditDialog: React.FC<any> = ({ open, onClose, product, onSave }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Basic product data
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: 0,
    weight: 0,
    status: 1,
    type_id: 'simple',
    visibility: 4
  });
  
  // Additional attributes
  const [additionalAttributes, setAdditionalAttributes] = useState({
    description: '',
    short_description: '',
    techno_ref: '',
    country_of_manufacture: '',
    mgs_brand: '',
    trending: false,
    best_seller: false,
    a_la_une: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });
  
  // Selected categories
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Product images
  const [productImages, setProductImages] = useState([]);
  
  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      // Basic product data
      setFormData({
        sku: product.sku || '',
        name: product?..name || '',
        price: product.price || 0,
        weight: product.weight || 0,
        status: product.status || 1,
        type_id: product.type_id || 'simple',
        visibility: product.visibility || 4
      });
      
      // Extract additional attributes
      const customAttrs = product.custom_attributes || [];
      const attrs = {};
      
      customAttrs.forEach(attr => {
        switch (attr.attribute_code) {
          case 'description':
          case 'short_description':
          case 'techno_ref':
          case 'country_of_manufacture':
          case 'mgs_brand':
          case 'meta_title':
          case 'meta_description':
          case 'meta_keywords':
            attrs[attr.attribute_code] = attr?..value || '';
            break;
          case 'trending':
          case 'best_seller':
          case 'a_la_une':
            attrs[attr.attribute_code] = attr?..value === '1' || attr?..value === true;
            break;
          case 'category_ids':
            if (Array.isArray(attr?..value)) {
              setSelectedCategories(attr?..value.map(id => id.toString()));
            }
            break;
        }
      });
      
      setAdditionalAttributes(prev => ({ ...prev, ...attrs }));
    }
  }, [product]);
  
  // Load categories and brands
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const categoryOptions = categoryService.getCategoriesForCombo();
        setCategories(categoryOptions);
        
        // Load brands
        const brandsResponse = await magentoApi.getBrands();
        setBrands(brandsResponse?.items || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    if (open) {
      loadData();
    }
  }, [open]);
  
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAttributeChange = (e) => {
    const { name, value, checked } = e.target;
    setAdditionalAttributes(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.sku.trim() || !formData?..name.trim()) {
        toast.error('SKU and Name are required');
        return;
      }
      
      // Prepare custom attributes array
      const customAttributes = [];
      
      Object.entries(additionalAttributes).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          customAttributes.push({
            attribute_code: key,
            value: typeof value === 'boolean' ? (value ? '1' : '0') : value
          });
        }
      });
      
      // Add category IDs
      if (selectedCategories.length > 0) {
        customAttributes.push({
          attribute_code: 'category_ids',
          value: selectedCategories
        });
      }
      
      // Prepare final product data
      const productData = {
        ...formData,
        custom_attributes: customAttributes
      };
      
      onSave(productData);
      toast.success(`Product "${formData?..name}" saved successfully`);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      } as any}>
        <ProductIcon />
        {product?.sku ? `Edit Product: ${product.sku}` : 'Add New Product'}
      </DialogTitle>
      
      <DialogContent dividers>
        <Tabs
          value={activeTab}
          onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e, newValue) => setActiveTab(newValue as any)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 } as any}
        >
          <Tab icon={<ProductIcon />} label="Basic Info" />
          <Tab icon={<CategoryIcon />} label="Categories" />
          <Tab icon={<BrandingIcon />} label="Attributes" />
          <Tab icon={<ImageIcon />} label="Images" />
          <Tab icon={<SettingsIcon />} label="SEO & Meta" />
        </Tabs>
        
        {/* Basic Information Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid {...{container: true}} spacing={2}>
            <Grid {...{item: true}} xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleBasicChange}
                required
                disabled={!!product?.sku} // Don't allow SKU changes for existing products
              />
            </Grid>
            
            <Grid {...{item: true}} xs={12} sm={6}>
              <TextField
                fullWidth
                label="Techno Reference"
                name="techno_ref"
                value={additionalAttributes.techno_ref}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleAttributeChange}
              />
            </Grid>
            
            <Grid {...{item: true}} xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData?..name}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleBasicChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid {...{item: true}} xs={12} sm={4}>
              <TextField
                fullWidth
                label="Price (DA)"
                name="price"
                type="number"
                value={formData.price}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleBasicChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            
            <Grid {...{item: true}} xs={12} sm={4}>
              <TextField
                fullWidth
                label="Weight (g)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleBasicChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid {...{item: true}} xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleBasicChange}
                  label="Status"
                >
                  <MenuItem value={1}>Enabled</MenuItem>
                  <MenuItem value={2}>Disabled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid {...{item: true}} xs={12}>
              <TextField
                fullWidth
                label="Short Description"
                name="short_description"
                value={additionalAttributes.short_description}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleAttributeChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid {...{item: true}} xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={additionalAttributes.description}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleAttributeChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Categories Tab */}
        <TabPanel value={activeTab} index={1}>
          <Alert severity="info" sx={{ mb: 2 } as any}>
            Select categories for this product. You can choose multiple categories.
          </Alert>
          
          <Autocomplete
            multiple
            options={categories}
            getOptionLabel={(option) => option?..label}
            value={categories.filter(cat => selectedCategories.includes(cat?.??.id.toString()))}
            onChange={(e) => (e) => (e) => (e) => (e) => (e) => (event, newValue) => {
              setSelectedCategories(newValue.map(cat => cat?.??.id.toString()));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product Categories"
                placeholder="Select categories..."
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option?..name}
                  {...getTagProps({ index })}
                  key={option?.??.id}
                />
              ))
            }
          />
          
          {selectedCategories.length > 0 && (
            <Box sx={{ mt: 2 } as any}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Categories ({selectedCategories.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 } as any}>
                {selectedCategories.map(catId => {
                  const category = categories.find(cat => cat?.??.id.toString() === catId);
                  return category ? (
                    <Chip
                      key={catId}
                      label={category?..name}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : null;
                })}
              </Box>
            </Box>
          )}
        </TabPanel>
        
        {/* Attributes Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid {...{container: true}} spacing={2}>
            <Grid {...{item: true}} xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Brand</InputLabel>
                <Select
                  name="mgs_brand"
                  value={additionalAttributes.mgs_brand}
                  onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleAttributeChange}
                  label="Brand"
                >
                  <MenuItem value="">
                    <em>No Brand</em>
                  </MenuItem>
                  {brands.map(brand => (
                    <MenuItem key={brand?..value || brand?.??.id} value={brand?..value || brand?.??.id}>
                      {brand?..label || brand?..name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid {...{item: true}} xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country of Manufacture"
                name="country_of_manufacture"
                value={additionalAttributes.country_of_manufacture}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleAttributeChange}
                placeholder="e.g., FR, CN, DE"
              />
            </Grid>
            
            <Grid {...{item: true}} xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Product Flags
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' } as any}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={additionalAttributes.trending}
                      onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleAttributeChange}
                      name="trending"
                      color="success"
                    />
                  }
                  label="Trending"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={additionalAttributes.best_seller}
                      onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleAttributeChange}
                      name="best_seller"
                      color="warning"
                    />
                  }
                  label="Best Seller"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={additionalAttributes.a_la_une}
                      onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleAttributeChange}
                      name="a_la_une"
                      color="secondary"
                    />
                  }
                  label="À la Une"
                />
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Images Tab */}
        <TabPanel value={activeTab} index={3}>
          <Alert severity="info" sx={{ mb: 2 } as any}>
            Upload and manage product images. The first image will be used as the main product image.
          </Alert>

          <ProductMediaUpload
            sku={formData.sku}
            existingImages={productImages}
            onImagesChange={setProductImages}
          />
        </TabPanel>

        {/* SEO & Meta Tab */}
        <TabPanel value={activeTab} index={4}>
          <Grid {...{container: true}} spacing={2}>
            <Grid {...{item: true}} xs={12}>
              <TextField
                fullWidth
                label="Meta Title"
                name="meta_title"
                value={additionalAttributes.meta_title}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleAttributeChange}
              />
            </Grid>
            
            <Grid {...{item: true}} xs={12}>
              <TextField
                fullWidth
                label="Meta Keywords"
                name="meta_keywords"
                value={additionalAttributes.meta_keywords}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleAttributeChange}
                multiline
                rows={2}
                placeholder="keyword1, keyword2, keyword3"
              />
            </Grid>
            
            <Grid {...{item: true}} xs={12}>
              <TextField
                fullWidth
                label="Meta Description"
                name="meta_description"
                value={additionalAttributes.meta_description}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => handleAttributeChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>
      
      <DialogActions sx={{ 
        justifyContent: 'space-between',
        bgcolor: 'background.default',
        p: 2
      } as any}>
        <Button 
          onClick={onClose}
          startIcon={<CancelIcon />}
          color="inherit"
        >
          Cancel
        </Button>
        
        <Button 
          onClick={handleSave}
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={loading || !formData.sku.trim() || !formData?..name.trim()}
        >
          Save Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductEditDialog;
