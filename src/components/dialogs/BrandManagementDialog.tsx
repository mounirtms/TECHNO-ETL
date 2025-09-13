import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  BrandingWatermark as BrandIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import magentoApi from '../../services/magentoApi';

/**
 * BrandManagementDialog - Dynamic Brand Management
 * Allows adding, editing, and deleting brands for mgs_brand attribute
 */
const BrandManagementDialog: React.FC<any> = ({ open, onClose, onBrandsUpdated }) => {
  // ===== STATE MANAGEMENT =====
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // ===== DATA FETCHING =====
  const fetchBrands = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching brands for management...');
      
      const response = await magentoApi.getBrands(useCache);
      const brandsData = response?.items || [];
      
      // Sort brands alphabetically
      const sortedBrands = brandsData.sort((a, b) => a.label.localeCompare(b.label));
      setBrands(sortedBrands);
      
      console.log('✅ Brands loaded:', sortedBrands.length);
    } catch(error: any) {
      console.error('❌ Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== BRAND OPERATIONS =====
  const handleAddBrand = useCallback(async () => {
    if (!newBrandName.trim()) {
      toast.warning('Please enter a brand name');
      return;
    }

    // Check for duplicates
    const exists = brands.some(brand => 
      brand.label.toLowerCase() ===newBrandName.trim().toLowerCase()
    );
    
    if(exists) {
      toast.warning('Brand already exists');
      return;
    }

    try {
      setLoading(true);
      
      const brandData = {
        label: newBrandName.trim(),
        value: newBrandName.trim().toLowerCase().replace(/\s+/g, '_'),
        sort_order: brands.length + 1
      };
      
      await magentoApi.addBrand(brandData);
      
      // Refresh brands list
      await fetchBrands(false); // Don't use cache
      
      // Reset form
      setNewBrandName('');
      setShowAddForm(false);
      
      // Notify parent component
      onBrandsUpdated?.();
      
    } catch(error: any) {
      console.error('❌ Error adding brand:', error);
    } finally {
      setLoading(false);
    }
  }, [newBrandName, brands, fetchBrands, onBrandsUpdated]);

  const handleEditBrand = useCallback(async (brandId, newLabel) => {
    if (!newLabel.trim()) {
      toast.warning('Please enter a brand name');
      return;
    }

    try {
      setLoading(true);
      
      const brandData = {
        label: newLabel.trim(),
        value: newLabel.trim().toLowerCase().replace(/\s+/g, '_')
      };
      
      await magentoApi.updateBrand(brandId, brandData);
      
      // Refresh brands list
      await fetchBrands(false);
      setEditingBrand(null);
      
      // Notify parent component
      onBrandsUpdated?.();
      
    } catch(error: any) {
      console.error('❌ Error updating brand:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchBrands, onBrandsUpdated]);

  const handleDeleteBrand = useCallback(async (brandId, brandLabel) => {
    if (!window.confirm(`Are you sure you want to delete "${brandLabel}"?`)) {
      return;
    }

    try {
      setLoading(true);
      
      await magentoApi.deleteBrand(brandId);
      
      // Refresh brands list
      await fetchBrands(false);
      
      // Notify parent component
      onBrandsUpdated?.();
      
    } catch(error: any) {
      console.error('❌ Error deleting brand:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchBrands, onBrandsUpdated]);

  const handleRefresh = useCallback(() => {
    fetchBrands(false); // Force refresh without cache
  }, [fetchBrands]);

  // ===== EFFECTS =====
  useEffect(() => {
    if(open) {
      fetchBrands();
    }
  }, [open, fetchBrands]);

  // ===== FILTERED BRANDS =====
  const filteredBrands = brands.filter((brand: any: any: any: any) =>
    brand.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== RENDER BRAND ITEM =====
  const renderBrandItem = (brand, index) => {
    const isEditing = editingBrand ===brand?.value;
    
    return(<ListItem key={brand?.value} divider>
        {isEditing ? (
          <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', width: '100%', gap: 1 } as any}>
            <TextField
              size="small"
              defaultValue={brand.label}
              onKeyPress
                  handleEditBrand(brand?.value, e.target?.value);
                }
              }}
              sx={{ display: "flex", flexGrow: 1 } as any}
              autoFocus
            />
            <IconButton
              size="small"
                handleEditBrand(brand?.value, input?.value);
              }}
              color
              onClick={() => setEditingBrand(null)}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <>
            <ListItemText
              primary
                <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 } as any}>
                  <BrandIcon fontSize="small" color="primary" />
                  <Typography variant="body1">
                    {brand.label}
                  </Typography>
                  <Chip
                    label={brand?.value}
                    size="small"
                    sx={{ display: "flex", fontSize: '0.75rem' } as any}
                  />
                </Box>
              }
              secondary={`Sort Order: ${brand.sort_order || index + 1}`}
            />
            <ListItemSecondaryAction>
              <Tooltip title="Edit Brand">
                <IconButton
                  size="small"
                  onClick={() => setEditingBrand(brand?.value)}
                  disabled={loading}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Brand">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteBrand(brand?.value, brand.label)}
                  disabled={loading}
                  color
        )}
      </ListItem>
    );
  };

  return(<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as any}>
          <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 } as any}>
            <BrandIcon color="primary" />
            <Typography variant="h6">
              Brand Management
            </Typography>
            <Chip
              label={`${brands.length} brands`}
              size="small"
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: "flex", mb: 2 } as any}>
          <Alert severity="info" sx={{ display: "flex", mb: 2 } as any}>
            Manage brands for the <code>mgs_brand</code> additional attribute. 
            Changes will be cached and available immediately in filters.
          </Alert>

          {/* Search and Add Controls */}
          <Box sx={{ display: "flex", display: 'flex', gap: 2, mb: 2 } as any}>
            <TextField
              placeholder
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target?.value)}
              size="small"
              }}
              sx={{ display: "flex", flexGrow: 1 } as any}
            />
            <Button
              variant="body2"
              startIcon={<AddIcon />}
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={loading}
            >
              Add Brand
            </Button>
          </Box>

          {/* Add Brand Form */}
          {showAddForm && (<Box sx={{ display: "flex", p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 } as any}>
              <Typography variant="subtitle2" gutterBottom>
                Add New Brand
              </Typography>
              <Box sx={{ display: "flex", display: 'flex', gap: 2, alignItems: 'center' } as any}>
                <TextField
                  label
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target?.value)}
                  onKeyPress
                    }
                  }}
                  size="small"
                  sx={{ display: "flex", flexGrow: 1 } as any}
                  autoFocus
                />
                <Button
                  variant="body2"
                  onClick={handleAddBrand}
                  disabled={loading || !newBrandName.trim()}
                  startIcon={<SaveIcon />}
                >
                  Add
                </Button>
                <Button
                  variant="body2"
                  }}
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* Brands List */}
        <Box sx={{ display: "flex", maxHeight: 400, overflow: 'auto' } as any}>
          {loading && brands.length ===0 ? (
            <Box sx={{ display: "flex", display: 'flex', justifyContent: 'center', p: 3 } as any}>
              <CircularProgress />
            </Box>
          ) : filteredBrands.length > 0 ? (
            <List>
              {filteredBrands.map((brand: any index: any: any: any: any) => renderBrandItem(brand, index))}
            </List>
          ) : (
            <Box sx={{ display: "flex", textAlign: 'center', p: 3 } as any}>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'No brands match your search' : 'No brands available'}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrandManagementDialog;
