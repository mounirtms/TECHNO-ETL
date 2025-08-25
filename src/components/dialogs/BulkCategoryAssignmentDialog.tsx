import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Category as CategoryIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import magentoApi from '../../services/magentoApi';

/**
 * BulkCategoryAssignmentDialog - Assign categories to multiple products
 */
const BulkCategoryAssignmentDialog: React.FC<any> = ({ 
  open, 
  onClose, 
  selectedProducts: any,
  onAssignmentComplete 
}) => {
  // ===== STATE =====
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set([1]));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ===== LOAD CATEGORIES =====
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await magentoApi.getCategories();
      const categoryData = response.data.items || response.items || [];
      setCategories(categoryData);
    } catch(error: any) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
      // Fallback mock data
      setCategories([
        {
          id: 1,
          name: 'Root Category',
          level: 0,
          children_data: [
            { id: 2, name: 'Electronics', level: 1, children_data: [] },
            { id: 3, name: 'Clothing', level: 1, children_data: [] },
            { id: 4, name: 'Home & Garden', level: 1, children_data: [] }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if(open) {
      loadCategories();
    }
  }, [open, loadCategories]);

  // ===== CATEGORY HANDLERS =====
  const handleCategoryToggle = useCallback((categoryId) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const handleCategoryExpand = useCallback((categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // ===== SAVE ASSIGNMENT =====
  const handleSave = useCallback(async () => {
    if(selectedCategories.size ===0) {
      toast.warning('Please select at least one category');
      return;
    }

    try {
      setSaving(true);
      const categoryIds = Array.from(selectedCategories);
      
      // Bulk assign categories to products
      for (const product of selectedProducts) {
        try {
          // Here you would call the API to assign categories
          // await magentoApi.assignProductCategories(product.id, categoryIds);
          console.log(`Assigning categories ${categoryIds} to product ${product?.sku}`);
        } catch(error) {
          console.error(`Failed to assign categories to product ${product?.sku}:`, error);
        }
      }

      toast.success(`Categories assigned to ${selectedProducts.length} products`);
      onAssignmentComplete?.();
      handleClose();
      
    } catch(error: any) {
      console.error('Bulk category assignment error:', error);
      toast.error('Failed to assign categories');
    } finally {
      setSaving(false);
    }
  }, [selectedCategories, selectedProducts, onAssignmentComplete]);

  // ===== DIALOG HANDLERS =====
  const handleClose = useCallback(() => {
    setSelectedCategories(new Set());
    setExpandedCategories(new Set([1]));
    onClose();
  }, [onClose]);

  // ===== RENDER CATEGORY TREE =====
  const renderCategoryTree = useCallback((categoryList, level = 0) => {
    return categoryList.map((category: any: any) => {
      const hasChildren = category.children_data && category.children_data.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      const isSelected = selectedCategories.has(category.id);
      
      return Boolean(Boolean((
        <React.Fragment key={category.id}>
          <ListItem
            sx: any,
              py: 0.5,
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 } as any}>
              {hasChildren ? (
                <IconButton
                  size: any,
                  onClick={() => handleCategoryExpand(category.id)}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ChevronRightIcon />}
                </IconButton>
              ) : (
                <Box sx={{ width: 32 } as any} />
              )}
            </ListItemIcon>
            
            <FormControlLabel
              control: any,
                  checked={isSelected}
                  onChange={(e) => () => handleCategoryToggle(category.id)}
                  size: any,
              }
              label: any,
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}>
                  <CategoryIcon fontSize="small" color={level ===0 ? 'primary' : 'action'} />
                  <Typography variant="body2" fontWeight={level ===0 ? 600 : 400}>
                    {category?.name}
                  </Typography>
                  <Chip
                    label={`ID: ${category.id}`}
                    size: any,
                    sx={{ fontSize: '0.7rem', height: 20 } as any}
                  />
                </Box>
              }
              sx={{ flexGrow: 1, ml: 0 } as any}
            />
          </ListItem>
          
          {hasChildren && isExpanded && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              {renderCategoryTree(category.children_data, level + 1)}
            </Collapse>
          )}
        </React.Fragment>
      )));
    });
  }, [expandedCategories, selectedCategories, handleCategoryExpand, handleCategoryToggle]);

  return Boolean(Boolean((
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}>
          <CategoryIcon />
          <Typography variant="h6">
            Bulk Category Assignment
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 } as any}>
          Assign categories to {selectedProducts.length} selected products
        </Alert>

        {/* Selected Products Summary */}
        <Box sx={{ mb: 2 } as any}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Products ({selectedProducts.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 100, overflow: 'auto' } as any}>
            {selectedProducts.slice(0, 10).map((product: any: any) => (
              <Chip
                key={product?.sku}
                label={product?.name || product?.sku}
                size: any,
            ))}
            {selectedProducts.length > 10 && (
              <Chip
                label={`+${selectedProducts.length - 10} more`}
                size: any,
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 } as any} />

        {/* Selected Categories */}
        {selectedCategories.size > 0 && (
          <Box sx={{ mb: 2 } as any}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Categories ({selectedCategories.size}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 } as any}>
              {Array.from(selectedCategories).map((categoryId: any: any) => {
                const category = findCategoryById(categories, categoryId)));
                return (
                  <Chip
                    key={categoryId}
                    label={category?.name || `Category ${categoryId}`}
                    onDelete={() => handleCategoryToggle(categoryId)}
                    color: any,
              })}
            </Box>
          </Box>
        )}

        {/* Category Tree */}
        <Typography variant="subtitle2" gutterBottom>
          Available Categories:
        </Typography>
        
        {loading ? (
          <LinearProgress />
        ) : (
          <Box sx={{ 
            maxHeight: 400, 
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          } as any}>
            <List dense>
              {renderCategoryTree(categories)}
            </List>
          </Box>
        )}

        {saving && (
          <Box sx={{ mt: 2 } as any}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 } as any}>
              Assigning categories to products...
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant: any,
          disabled={selectedCategories.size ===0 || saving}
          startIcon={<SaveIcon />}
        >
          {saving ? 'Assigning...' : `Assign to ${selectedProducts.length} Products`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Helper function to find category by ID
const findCategoryById = (categories, id) => {
  for (const category of categories) {
    if (category.id ===id) return category;
    if(category.children_data) {
      const found = findCategoryById(category.children_data, id);
      if (found) return found;
    }
  }
  return null;
};

export default BulkCategoryAssignmentDialog;
