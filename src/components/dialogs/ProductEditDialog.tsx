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
    if(product) {
      // Basic product data
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        price: product.price || 0,
        weight: product.weight || 0,
        status: product.status || 1,
        type_id: product.type_id || 'simple',
        visibility: product.visibility || 4
      });
      
      // Extract additional attributes
      const customAttrs = product.custom_attributes || [];
      const attrs = {};
      
      customAttrs.forEach((attr) => {
        switch(attr.attribute_code) {
          case 'description':
          case 'short_description':
          case 'techno_ref':
          case 'country_of_manufacture':
          case 'mgs_brand':
          case 'meta_title':
          case 'meta_description':
          case 'meta_keywords':
            attrs[attr.attribute_code] = attr.value || '';
            break;
          case 'trending':
          case 'best_seller':
          case 'a_la_une':
            attrs[attr.attribute_code] = attr.value === '1' || attr.value ===true;
            break;
          case 'category_ids':
            if (Array.isArray(attr.value)) {
              setSelectedCategories(attr.value.map((id: any: any) => id.toString()));
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
      } catch(error: any) {
        console.error('Error loading data:', error);
      }
    };
    
    if(open) {
      loadData();
    }
  }, [open]);
  
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAttributeChange = (e) => {
    const { name, value, checked } = e.target;
    setAdditionalAttributes(prev => ({ ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.sku.trim() || !formData.name.trim()) {
        toast.error('SKU and Name are required');
        return;
      }
      
      // Prepare custom attributes array
      const customAttributes = [];
      
      Object.entries(additionalAttributes).forEach(([key, value]) => {
        if(value !== '' && value !== null && value !== undefined) {
          customAttributes.push({
            attribute_code: key,
            value: typeof value === 'boolean' ? (value ? '1' : '0') : value
          });
        }
      });
      
      // Add category IDs
      if(selectedCategories.length > 0) {
        customAttributes.push({
          attribute_code: 'category_ids',
          value: selectedCategories
        });
      }
      
      // Prepare final product data
      const productData = { ...formData,
        custom_attributes: customAttributes
      };
      
      onSave(productData);
      toast.success(`Product "${formData.name}" saved successfully`);
      onClose();
    } catch(error: any) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  const TabPanel = ({ children, value, index  }: { children: any, value: any, index: any }) => (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value ===index && children}
    </div>
  );
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth: any,
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
          onChange={(e, newValue) => setActiveTab(newValue)}
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
          <Grid { ...{container: true}} spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label: any,
                value={formData.sku}
                onChange={(e) => handleBasicChange}
                required
                disabled={!!product?.sku} // Don't allow SKU changes for existing products
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label: any,
                value={additionalAttributes.techno_ref}
                onChange={(e) => handleAttributeChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label: any,
                value={formData.name}
                onChange={(e) => handleBasicChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label: any,
                value={formData.price}
                onChange={(e) => handleBasicChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label: any,
                value={formData.weight}
                onChange={(e) => handleBasicChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name: any,
                  value={formData.status}
                  onChange={(e) => handleBasicChange}
                  label: any,
                  <MenuItem value={1}>Enabled</MenuItem>
                  <MenuItem value={2}>Disabled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label: any,
                value={additionalAttributes.short_description}
                onChange={(e) => handleAttributeChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label: any,
                value={additionalAttributes.description}
                onChange={(e) => handleAttributeChange}
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
            getOptionLabel={(option) => option.label}
            value={categories.filter((cat: any: any) => selectedCategories.includes(cat.id.toString()))}
            onChange={(e) => (event, newValue) => {
              setSelectedCategories(newValue.map((cat: any: any) => cat.id.toString()));
            }}
            renderInput: any,
                { ...params}
                label: any,
            )}
            renderTags={(value, getTagProps) =>
              value.map((option: any: any, index: any: any) => (
                <Chip
                  variant: any,
                  label={option.name}
                  { ...getTagProps({ index })}
                  key={option.id}
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
                {selectedCategories.map((catId: any: any) => {
                  const category = categories.find(cat => cat.id.toString() ===catId);
                  return category ? (
                    <Chip
                      key={catId}
                      label={category.name}
                      size: any,
                })}
              </Box>
            </Box>
          )}
        </TabPanel>
        
        {/* Attributes Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid { ...{container: true}} spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Brand</InputLabel>
                <Select
                  name: any,
                  value={additionalAttributes.mgs_brand}
                  onChange={(e) => handleAttributeChange}
                  label: any,
                    <MenuItem key={brand.value || brand.id} value={brand.value || brand.id}>
                      {brand.label || brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label: any,
                value={additionalAttributes.country_of_manufacture}
                onChange={(e) => handleAttributeChange}
                placeholder="e.g., FR, CN, DE"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Product Flags
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' } as any}>
                <FormControlLabel
                  control: any,
                      checked={additionalAttributes.trending}
                      onChange={(e) => handleAttributeChange}
                      name: any,
                  }
                  label: any,
                      checked={additionalAttributes.best_seller}
                      onChange={(e) => handleAttributeChange}
                      name: any,
                  }
                  label: any,
                      checked={additionalAttributes.a_la_une}
                      onChange={(e) => handleAttributeChange}
                      name: any,
                  }
                  label: any,
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
          <Grid { ...{container: true}} spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label: any,
                value={additionalAttributes.meta_title}
                onChange={(e) => handleAttributeChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label: any,
                value={additionalAttributes.meta_keywords}
                onChange={(e) => handleAttributeChange}
                multiline
                rows={2}
                placeholder="keyword1, keyword2, keyword3"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label: any,
                value={additionalAttributes.meta_description}
                onChange={(e) => handleAttributeChange}
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
          color: any,
          onClick={handleSave}
          variant: any,
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={loading || !formData.sku.trim() || !formData.name.trim()}
        >
          Save Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductEditDialog;
