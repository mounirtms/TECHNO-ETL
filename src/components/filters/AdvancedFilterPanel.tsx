import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Button,
  Divider,
  Tooltip,
  Fade,
  Slide,
  Autocomplete,
  Slider,
  Switch,
  FormControlLabel,
  Menu,
  MenuList,
  ListItemText,
  ListItemIcon,
  Popover,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  BrandingWatermark as BrandIcon,
  Category as CategoryIcon,
  AttachMoney as PriceIcon,
  Search as SearchIcon,
  Tune as TuneIcon,
  Bookmark as PresetIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import FilterService from '../../services/FilterService';

/**
 * AdvancedFilterPanel - Comprehensive filtering system
 * Features: Compact design, floating panels, smooth animations, caching
 */
const AdvancedFilterPanel: React.FC<any> = ({ 
  filters, 
  onFiltersChange, 
  onSearch,
  compact,
  showPresets
}) => {
  // ===== STATE MANAGEMENT =====
  const [expanded, setExpanded] = useState(!compact);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [presetMenuAnchor, setPresetMenuAnchor] = useState(null);
  const [advancedPanelAnchor, setAdvancedPanelAnchor] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // ===== FILTER OPTIONS LOADING =====
  const loadFilterOptions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading filter options...');

      const [brandsData, categoriesData] = await Promise.all([
        FilterService.getBrands(),
        FilterService.getCategories()
      ]);

      setBrands(brandsData);
      setCategories(categoriesData);
      
      console.log('✅ Filter options loaded:', {
        brands: brandsData.length,
        categories: categoriesData.length
      });
    } catch(error: any) {
      console.error('❌ Error loading filter options:', error);
      toast.error('Failed to load filter options');
    } finally {
      setLoading(false);
  }, []);

  // ===== FILTER HANDLERS =====
  const handleFilterChange = useCallback((field, value) => {
    const newFilters = { ...filters, [field]: value };
    onFiltersChange(newFilters);
    
    // Trigger debounced search if search field
    if(field === 'search') {
      FilterService.debouncedSearch(value, onSearch);
    } else {
      FilterService.debouncedFilter(newFilters, onSearch);
  }, [filters, onFiltersChange, onSearch]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      search: '',
      brand: '',
      category: '',
      status: '',
      priceMin: '',
      priceMax: ''
    };
    onFiltersChange(clearedFilters);
    onSearch(clearedFilters);
    setPriceRange([0, 1000]);
    toast.info('Filters cleared');
  }, [onFiltersChange, onSearch]);

  const handlePriceRangeChange = useCallback((event, newValue) => {
    setPriceRange(newValue);
    handleFilterChange('priceMin', newValue[0] > 0 ? newValue[0].toString() : '');
    handleFilterChange('priceMax', newValue[1] < 1000 ? newValue[1].toString() : '');
  }, [handleFilterChange]);

  // ===== PRESET HANDLERS =====
  const handlePresetSelect = useCallback((preset) => {
    onFiltersChange(preset.filters);
    onSearch(preset.filters);
    setPresetMenuAnchor(null);
    toast.success(`Applied preset: ${preset.name}`);
  }, [onFiltersChange, onSearch]);

  // ===== EFFECTS =====
  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // ===== ACTIVE FILTERS COUNT =====
  const activeFiltersCount = useMemo(() => {
    return (Object?.values(filters).filter((value: any) => 
      value !== '' && value !== undefined && value !== null
    ).length);
  }, [filters]);

  // ===== RENDER ACTIVE FILTERS =====
  const renderActiveFilters = () => {
    const activeFilters = [];

    if(filters.search) {
      activeFilters.push(
        <Chip key
          label={`Search: ${filters.search}`}
          onDelete={() => handleFilterChange('search', '')}
          color
          icon={<SearchIcon />}
        />
      );
    if(filters.brand) {
      const brand = brands.find(b => b?.value ===filters.brand);
      activeFilters.push(
        <Chip key
          label={`Brand: ${brand?.label || filters.brand}`}
          onDelete={() => handleFilterChange('brand', '')}
          color
          icon={<BrandIcon />}
        />
      );
    if(filters.category) {
      const category = categories.find(c => c?.value.toString() ===filters.category.toString());
      activeFilters.push(
        <Chip key
          label={`Category: ${category?.label || filters.category}`}
          onDelete={() => handleFilterChange('category', '')}
          color
          icon={<CategoryIcon />}
        />
      );
    if(filters.status !== '' && filters.status !== undefined) {
      activeFilters.push(
        <Chip key
          label={`Status: ${filters.status === '1' ? 'Active' : 'Inactive'}`}
          onDelete={() => handleFilterChange('status', '')}
          color
    if(filters.priceMin || filters.priceMax) {
      const min = filters.priceMin || '0';
      const max = filters.priceMax || '∞';
      activeFilters.push(
        <Chip
          key
          label={`Price: $${min} - $${max}`}
          onDelete
            handleFilterChange('priceMin', '');
            handleFilterChange('priceMax', '');
            setPriceRange([0, 1000]);
          }}
          color
          icon={<PriceIcon />}
        />
      );
    return activeFilters;
  };

  return (
    <Paper elevation={2} 
      sx={{
        transition: 'all 0.3s ease-in-out'
      } as any}>
      {/* Filter Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        p: 2,
        backgroundColor: 'primary.main',
        color: 'primary.contrastText'
      } as any}></
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}>
          <FilterIcon /></
          <Typography variant="h6">
            Advanced Filters
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={activeFiltersCount}
              size="small"
              sx={{ display: "flex", color: 'white', backgroundColor: 'rgba(255,255,255,0.2)' } as any}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}>
          {showPresets && (<Tooltip title="Filter Presets"></
              <IconButton color
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => (e: React.MouseEvent<HTMLButtonElement>) => (e: React.MouseEvent<HTMLButtonElement>) => (e: React.MouseEvent<HTMLButtonElement>) => (e) => setPresetMenuAnchor(e.currentTarget)}
              >
                <PresetIcon /></PresetIcon>
            </Tooltip>
          )}
          
          <Tooltip title="Advanced Options"></
            <IconButton color
              onClick={(e) => setAdvancedPanelAnchor(e.currentTarget)}
            >
              <TuneIcon /></TuneIcon>
          </Tooltip>

          <Tooltip title="Refresh Options"></
            <IconButton color
              }}
              disabled={loading}>
              <RefreshIcon /></RefreshIcon>
          </Tooltip>

          <Tooltip title={expanded ? "Collapse" : "Expand"}></
            <IconButton color
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filter Content */}
      <Collapse in={expanded} timeout={300}></
        <Box sx={{ display: "flex", p: 2 } as any}>
          {/* Quick Search */}
          <Grid { ...{container: true}} spacing={2} sx={{ display: "flex", mb: 2 } as any}></
            <Grid item xs={12} md={6}>
              <TextField fullWidth
                size="small"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target?.value)}
                InputProps
                  startAdornment: <SearchIcon sx={{ display: "flex", mr: 1, color: 'action.active' } as any} />
                }}
                placeholder="Search by name, SKU, description..."
              />
            </Grid>
            <Grid item xs={12} md={6}></
              <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' } as any}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={activeFiltersCount ===0}
                  size="small"
                  startIcon={<SaveIcon />}
                  size="small"
                  onClick={() => toast.info('Save preset functionality coming soon')}
                >
                  Save Preset
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Filter Controls */}
          <Grid { ...{container: true}} spacing={2} sx={{ display: "flex", mb: 2 } as any}>
            {/* Brand Filter */}
            <Grid item xs={12} sm={6} md={3}></
              <FormControl fullWidth size="small">
                <InputLabel>Brand</InputLabel>
                <Select value={filters.brand || ''}
                  onChange={(e) => handleFilterChange('brand', e.target?.value)}
                  label
                  disabled={loading}
                >
                  <MenuItem value="">All Brands</MenuItem>
                  {brands.map((brand: any) => (
                    <MenuItem key={brand?.value} value={brand?.value}></
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' } as any}>
                        <BrandIcon fontSize="small" />
                        <span>{brand?.label}</span>
                        <Chip label={brand.count} size="small" variant="outlined" sx={{ display: "flex", ml: 'auto' } as any} /></Chip>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} sm={6} md={3}></
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target?.value)}
                  label
                  disabled={loading}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category: any) => (
                    <MenuItem key={category?.value} value={category?.value}></
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        width: '100%',
                        pl: category.level * 2 
                      } as any}>
                        <CategoryIcon fontSize="small" />
                        <span>{category?.label}</span>
                        <Chip label={category.count} size="small" variant="outlined" sx={{ display: "flex", ml: 'auto' } as any} /></Chip>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={2}></
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target?.value)}
                  label
            {/* Price Range */}
            <Grid item xs={12} sm={6} md={4}></
              <Box sx={{ display: "flex", px: 1 } as any}>
                <Typography variant="outlined" gutterBottom>
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </Typography>
                <Slider value={priceRange}
                  onChange={(e) => handlePriceRangeChange}
                  valueLabelDisplay
                  min={0}
                  max={1000}
                  step={10}
                  size="small"
          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <>
              <Divider sx={{ display: "flex", my: 2 } as any} /></
              <Box>
                <Typography variant="outlined" color="text.secondary" gutterBottom>
                  Active Filters ({activeFiltersCount}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 } as any}>
                  {renderActiveFilters()}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Collapse>

      {/* Preset Menu */}
      <Menu anchorEl={presetMenuAnchor}
        open={Boolean(presetMenuAnchor)}
        onClose={() => setPresetMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {FilterService.getFilterPresets().map((preset: any) => (
          <MenuItem key={preset.id}
            onClick={() => handlePresetSelect(preset)}
          >
            <ListItemIcon></
              <PresetIcon fontSize="small" /></PresetIcon>
            <ListItemText primary={preset.name} /></ListItemText>
        ))}
      </Menu>

      {/* Advanced Panel Popover */}
      <Popover open={Boolean(advancedPanelAnchor)}
        anchorEl={advancedPanelAnchor}
        onClose={() => setAdvancedPanelAnchor(null)}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Card sx={{ display: "flex", minWidth: 300 } as any}></
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Advanced Options
            </Typography>
            <FormControlLabel
              control={<Switch size="small" />}
              label
              control={<Switch size="small" />}
              label
              control={<Switch size="small" />}
              label
            <Button size="small" onClick={() => setAdvancedPanelAnchor(null)}>
              Close
            </Button>
          </CardActions>
        </Card>
      </Popover>
    </Paper>
  );
};

export default AdvancedFilterPanel;
