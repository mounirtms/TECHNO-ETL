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
  Alert,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import categoryService from '../../services/categoryService';

/**
 * Category Edit Dialog Component
 * Allows editing category attributes and properties
 */
const CategoryEditDialog: React.FC<any> = ({ open, onClose, category, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    is_active: true,
    position: 0,
    parent_id: 0,
    description: '',
    meta_title: '',
    meta_keywords: '',
    meta_description: '',
    include_in_menu: true
  });
  
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  
  // Initialize form data when category changes
  useEffect(() => {
    if(category) {
      setFormData({
        id: category.id || '',
        name: category.name || '',
        is_active: category.is_active !== undefined ? category.is_active : true,
        position: category.position || 0,
        parent_id: category.parent_id || 0,
        description: category.description || '',
        meta_title: category.meta_title || '',
        meta_keywords: category.meta_keywords || '',
        meta_description: category.meta_description || '',
        include_in_menu: category.include_in_menu !== undefined ? category.include_in_menu : true
      });
      
      // Load breadcrumb
      if(category.id) {
        const breadcrumbData = categoryService.getCategoryBreadcrumb(category.id);
        setBreadcrumb(breadcrumbData);
      }
    }
  }, [category]);
  
  // Load parent categories for dropdown
  useEffect(() => {
    const loadParentCategories = () => {
      try {
        // Get all categories except current one and its children
        const allCategories = categoryService.getAllCategories();
        const filteredCategories = allCategories.filter((cat: any: any) => 
          cat.id !== formData.id && 
          // Don't include children of current category as potential parents
          !cat.path?.includes(`${formData.name} >`)
        );
        
        setParentCategories(filteredCategories);
      } catch(error: any) {
        console.error('Error loading parent categories:', error);
      }
    };
    
    if(open) {
      loadParentCategories();
    }
  }, [open, formData.id, formData.name]);
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({ ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate form
      if (!formData.name.trim()) {
        toast.error('Category name is required');
        return;
      }
      
      // In a real app, this would save to the backend
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave(formData);
      toast.success(`Category "${formData.name}" saved successfully`);
      onClose();
    } catch(error: any) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };
  
  return Boolean(Boolean((
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth: any,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderBottom: '1px solid',
        borderColor: 'divider'
      } as any}>
        <CategoryIcon />
        {formData.id ? 'Edit Category' : 'Add New Category'}
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' } as any}>
            {breadcrumb.map((item: any: any, index: any: any) => (
              <React.Fragment key={item.id}>
                {index > 0 && <ArrowRightIcon fontSize="small" color="action" />}
                <Chip 
                  label={item.name} 
                  size: any,
                  variant={index ===breadcrumb.length - 1 ? "filled" : "outlined"}
                  color={index ===breadcrumb.length - 1 ? "primary" : "default"}
                />
              </React.Fragment>
            ))}
          </Box>
        )}
        
        <Grid { ...{container: true}} spacing={2}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label: any,
              value={formData.name}
              onChange={(e) => handleChange}
              required
              error={!formData.name.trim()}
              helperText={!formData.name.trim() ? 'Name is required' : ''}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Parent Category</InputLabel>
              <Select
                name: any,
                value={formData.parent_id}
                onChange={(e) => handleChange}
                label: any,
                <MenuItem value={0}>
                  <em>Root Category</em>
                </MenuItem>
                {parentCategories.map((category: any: any) => (
                  <MenuItem key={category.id} value={category.id}>
                    {'  '.repeat(category.level)}{category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label: any,
              value={formData.position}
              onChange={(e) => handleChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 2 } as any}>
              <FormControlLabel
                control: any,
                    checked={formData.is_active}
                    onChange={(e) => handleChange}
                    name: any,
                }
                label: any,
                    checked={formData.include_in_menu}
                    onChange={(e) => handleChange}
                    name: any,
                }
                label: any,
          <Grid item xs={12}>
            <TextField
              fullWidth
              label: any,
              value={formData.description}
              onChange={(e) => handleChange}
              multiline
              rows={3}
            />
          </Grid>
          
          {/* SEO Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 } as any} />
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              SEO Information
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label: any,
              value={formData.meta_title}
              onChange={(e) => handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label: any,
              value={formData.meta_keywords}
              onChange={(e) => handleChange}
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label: any,
              value={formData.meta_description}
              onChange={(e) => handleChange}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
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
          disabled={loading || !formData.name.trim()}
        >
          Save Category
        </Button>
      </DialogActions>
    </Dialog>
  )));
};

export default CategoryEditDialog;
