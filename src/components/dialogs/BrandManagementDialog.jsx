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
const BrandManagementDialog = ({ open, onClose, onBrandsUpdated }) => {
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
    } catch (error) {
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
      brand.label.toLowerCase() === newBrandName.trim().toLowerCase()
    );
    
    if (exists) {
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
      
    } catch (error) {
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
      
    } catch (error) {
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
      
    } catch (error) {
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
    if (open) {
      fetchBrands();
    }
  }, [open, fetchBrands]);

  // ===== FILTERED BRANDS =====
  const filteredBrands = brands.filter(brand =>
    brand.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== RENDER BRAND ITEM =====
  const renderBrandItem = (brand, index) => {
    const isEditing = editingBrand === brand.value;
    
    return (
      <ListItem key={brand.value} divider>
        {isEditing ? (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
            <TextField
              size="small"
              defaultValue={brand.label}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleEditBrand(brand.value, e.target.value);
                }
              }}
              sx={{ flexGrow: 1 }}
              autoFocus
            />
            <IconButton
              size="small"
              onClick={(e) => {
                const input = e.target.closest('.MuiBox-root').querySelector('input');
                handleEditBrand(brand.value, input.value);
              }}
              color="primary"
            >
              <SaveIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setEditingBrand(null)}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BrandIcon fontSize="small" color="primary" />
                  <Typography variant="body1">
                    {brand.label}
                  </Typography>
                  <Chip
                    label={brand.value}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              }
              secondary={`Sort Order: ${brand.sort_order || index + 1}`}
            />
            <ListItemSecondaryAction>
              <Tooltip title="Edit Brand">
                <IconButton
                  size="small"
                  onClick={() => setEditingBrand(brand.value)}
                  disabled={loading}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Brand">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteBrand(brand.value, brand.label)}
                  disabled={loading}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </>
        )}
      </ListItem>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BrandIcon color="primary" />
            <Typography variant="h6">
              Brand Management
            </Typography>
            <Chip
              label={`${brands.length} brands`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          <Tooltip title="Refresh Brands">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Manage brands for the <code>mgs_brand</code> additional attribute. 
            Changes will be cached and available immediately in filters.
          </Alert>

          {/* Search and Add Controls */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={loading}
            >
              Add Brand
            </Button>
          </Box>

          {/* Add Brand Form */}
          {showAddForm && (
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Add New Brand
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Brand Name"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddBrand();
                    }
                  }}
                  size="small"
                  sx={{ flexGrow: 1 }}
                  autoFocus
                />
                <Button
                  variant="contained"
                  onClick={handleAddBrand}
                  disabled={loading || !newBrandName.trim()}
                  startIcon={<SaveIcon />}
                >
                  Add
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewBrandName('');
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
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading && brands.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredBrands.length > 0 ? (
            <List>
              {filteredBrands.map((brand, index) => renderBrandItem(brand, index))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', p: 3 }}>
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
