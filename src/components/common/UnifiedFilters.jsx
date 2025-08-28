/**
 * Unified Grid Filter System
 * Base filter components with inheritance pattern for consistent filtering
 * 
 * @author Techno-ETL Team
 * @version 4.0.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
  Chip,
  IconButton,
  Collapse,
  Typography,
  Divider,
  Button,
  Tooltip
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  Business as BranchIcon,
  Source as SourceIcon,
  ChangeCircle as ChangedIcon,
  Category as CategoryIcon,
  LocalOffer as BrandIcon
} from '@mui/icons-material';

/**
 * Base Filter Class
 * Defines structure and behavior for filter components
 */
export class BaseFilter {
  constructor(id, config = {}) {
    this.id = id;
    this.type = config.type || 'select'; // select, switch, text, date, range
    this.label = config.label || id;
    this.options = config.options || [];
    this.value = config.value || (this.type === 'switch' ? false : '');
    this.placeholder = config.placeholder || `Filter by ${this.label}`;
    this.icon = config.icon || null;
    this.visible = config.visible !== false;
    this.enabled = config.enabled !== false;
    this.fullWidth = config.fullWidth || false;
    this.size = config.size || 'small';
    this.onChange = config.onChange || (() => {});
  }

  /**
   * Render the filter component
   */
  render(key, value, onChange) {
    if (!this.visible) return null;

    // Extract key from common props to avoid spreading it to DOM elements
    const commonProps = {
      disabled: !this.enabled,
      size: this.size
    };

    switch (this.type) {
      case 'select':
        return this.renderSelect(value, onChange, { ...commonProps, key });
      case 'switch':
        return this.renderSwitch(value, onChange, { ...commonProps, key });
      case 'text':
        return this.renderTextField(value, onChange, { ...commonProps, key });
      default:
        return this.renderSelect(value, onChange, { ...commonProps, key });
    }
  }

  /**
   * Render select filter
   */
  renderSelect(value, onChange, props) {
    const { key, ...restProps } = props; // Extract key to avoid passing it to DOM elements
    const IconComponent = this.getIconComponent();
    
    return (
      <FormControl {...restProps} key={key} sx={{ minWidth: 150 }}>
        <InputLabel>
          {IconComponent && <IconComponent sx={{ mr: 1, fontSize: 16 }} />}
          {this.label}
        </InputLabel>
        <Select
          value={value || this.value}
          onChange={(e) => onChange(e.target.value)}
          label={this.label}
        >
          {this.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  /**
   * Render switch filter
   */
  renderSwitch(value, onChange, props) {
    const { key, ...restProps } = props; // Extract key to avoid passing it to DOM elements
    const IconComponent = this.getIconComponent();
    
    return (
      <FormControlLabel
        key={key}
        control={
          <Switch
            checked={value !== undefined ? value : this.value}
            onChange={(e) => onChange(e.target.checked)}
            {...restProps}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {IconComponent && <IconComponent sx={{ mr: 1, fontSize: 16 }} />}
            {this.label}
          </Box>
        }
      />
    );
  }

  /**
   * Render text field filter
   */
  renderTextField(value, onChange, props) {
    const { key, ...restProps } = props; // Extract key to avoid passing it to DOM elements
    const IconComponent = this.getIconComponent();
    
    return (
      <TextField
        {...restProps}
        key={key}
        label={this.label}
        placeholder={this.placeholder}
        value={value || this.value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: IconComponent ? <IconComponent sx={{ mr: 1, fontSize: 16 }} /> : null
        }}
      />
    );
  }

  /**
   * Get icon component
   */
  getIconComponent() {
    const iconMap = {
      business: BranchIcon,
      source: SourceIcon,
      changed: ChangedIcon,
      category: CategoryIcon,
      brand: BrandIcon,
      filter: FilterIcon
    };

    return iconMap[this.icon] || null;
  }

  /**
   * Get filter value for API
   */
  getApiValue(value) {
    return value;
  }
}

/**
 * Specialized filter classes
 */
export class SourceFilter extends BaseFilter {
  constructor(options = [], value = 'all', onChange = () => {}) {
    super('source', {
      type: 'select',
      label: 'Source',
      icon: 'source',
      options: [
        { value: 'all', label: 'All Sources' },
        ...options
      ],
      value,
      onChange
    });
  }
}

export class SuccursaleFilter extends BaseFilter {
  constructor(options = [], value = 'all', onChange = () => {}) {
    super('succursale', {
      type: 'select',
      label: 'Branch',
      icon: 'business',
      options: [
        { value: 'all', label: 'All Branches' },
        ...options
      ],
      value,
      onChange
    });
  }
}

export class CategoryFilter extends BaseFilter {
  constructor(options = [], value = '', onChange = () => {}) {
    super('category', {
      type: 'select',
      label: 'Category',
      icon: 'category',
      options: [
        { value: '', label: 'All Categories' },
        ...options
      ],
      value,
      onChange
    });
  }
}

export class BrandFilter extends BaseFilter {
  constructor(options = [], value = '', onChange = () => {}) {
    super('brand', {
      type: 'select',
      label: 'Brand',
      icon: 'brand',
      options: [
        { value: '', label: 'All Brands' },
        ...options
      ],
      value,
      onChange
    });
  }
}

export class ChangedOnlyFilter extends BaseFilter {
  constructor(value = false, onChange = () => {}) {
    super('showChangedOnly', {
      type: 'switch',
      label: 'Show Changed Only',
      icon: 'changed',
      value,
      onChange
    });
  }
}

export class StatusFilter extends BaseFilter {
  constructor(value = '', onChange = () => {}) {
    super('status', {
      type: 'select',
      label: 'Status',
      options: [
        { value: '', label: 'All Status' },
        { value: '1', label: 'Enabled' },
        { value: '2', label: 'Disabled' }
      ],
      value,
      onChange
    });
  }
}

/**
 * Base Filter Panel Class
 * Provides common filter panel functionality
 */
export class BaseFilterPanel {
  constructor(config = {}) {
    this.config = {
      collapsible: true,
      defaultExpanded: false,
      showClearAll: true,
      variant: 'outlined', // outlined, elevation, none
      ...config
    };
    
    this.filters = [];
    this.activeFilters = {};
  }

  /**
   * Add filter to panel
   */
  addFilter(filter) {
    if (filter instanceof BaseFilter) {
      this.filters.push(filter);
    }
    return this;
  }

  /**
   * Add multiple filters
   */
  addFilters(filters) {
    filters.forEach(filter => this.addFilter(filter));
    return this;
  }

  /**
   * Set filter values
   */
  setFilterValues(values) {
    this.activeFilters = { ...this.activeFilters, ...values };
    return this;
  }

  /**
   * Get current filter values
   */
  getFilterValues() {
    return this.activeFilters;
  }

  /**
   * Clear all filters
   */
  clearAllFilters() {
    this.activeFilters = {};
    this.filters.forEach(filter => {
      if (filter.onChange) {
        filter.onChange(filter.type === 'switch' ? false : '');
      }
    });
    return this;
  }

  /**
   * Get active filter count
   */
  getActiveFilterCount() {
    return Object.values(this.activeFilters).filter(value => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value !== '' && value !== 'all';
      return value != null;
    }).length;
  }

  /**
   * Render filter panel
   */
  render(props = {}) {
    const [expanded, setExpanded] = useState(this.config.defaultExpanded);
    const activeCount = this.getActiveFilterCount();

    const toggleExpanded = () => {
      if (this.config.collapsible) {
        setExpanded(!expanded);
      }
    };

    const handleClearAll = () => {
      this.clearAllFilters();
      if (props.onFiltersChange) {
        props.onFiltersChange({});
      }
    };

    return (
      <Paper
        variant={this.config.variant}
        sx={{
          mb: 1,
          overflow: 'hidden',
          ...props.sx
        }}
      >
        {/* Filter Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            cursor: this.config.collapsible ? 'pointer' : 'default',
            bgcolor: 'grey.50',
            borderBottom: expanded ? 1 : 0,
            borderColor: 'divider'
          }}
          onClick={toggleExpanded}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon color="action" />
            <Typography variant="subtitle2">
              Filters
              {activeCount > 0 && (
                <Chip
                  size="small"
                  label={activeCount}
                  color="primary"
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {this.config.showClearAll && activeCount > 0 && (
              <Tooltip title="Clear all filters">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {this.config.collapsible && (
              <IconButton size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Filter Content */}
        <Collapse in={expanded || !this.config.collapsible}>
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center'
              }}
            >
              {this.filters.map((filter, index) => {
                const value = this.activeFilters[filter.id];
                const onChange = (newValue) => {
                  this.activeFilters[filter.id] = newValue;
                  if (filter.onChange) {
                    filter.onChange(newValue);
                  }
                  if (props.onFiltersChange) {
                    props.onFiltersChange(this.activeFilters);
                  }
                };

                return filter.render(`filter-${index}`, value, onChange);
              })}
            </Box>
          </Box>
        </Collapse>
      </Paper>
    );
  }
}

/**
 * Specialized filter panels
 */
export class MagentoFilterPanel extends BaseFilterPanel {
  constructor(config = {}) {
    super(config);
    this.setupMagentoFilters(config.options || {});
  }

  setupMagentoFilters(options) {
    // Add common Magento filters
    if (options.categories) {
      this.addFilter(new CategoryFilter(options.categories, '', options.onCategoryChange));
    }
    
    if (options.brands) {
      this.addFilter(new BrandFilter(options.brands, '', options.onBrandChange));
    }
    
    this.addFilter(new StatusFilter('', options.onStatusChange));
  }
}

export class MDMFilterPanel extends BaseFilterPanel {
  constructor(config = {}) {
    super(config);
    this.setupMDMFilters(config.options || {});
  }

  setupMDMFilters(options) {
    // Add MDM-specific filters
    if (options.sources) {
      this.addFilter(new SourceFilter(
        options.sources, 
        options.sourceFilter || 'all', 
        options.onSourceChange
      ));
    }
    
    if (options.succursales) {
      this.addFilter(new SuccursaleFilter(
        options.succursales, 
        options.succursaleFilter || 'all', 
        options.onSuccursaleChange
      ));
    }
    
    this.addFilter(new ChangedOnlyFilter(
      options.showChangedOnly || false, 
      options.onShowChangedOnlyChange
    ));
  }
}

/**
 * Filter Factory
 * Creates appropriate filter panel based on grid type
 */
export class FilterFactory {
  static create(gridType, config = {}) {
    switch (gridType) {
      case 'magento':
        return new MagentoFilterPanel(config);
      case 'mdm':
        return new MDMFilterPanel(config);
      default:
        return new BaseFilterPanel(config);
    }
  }
}

/**
 * Hook for unified filter management
 */
export function useUnifiedFilters(gridType, options = {}, config = {}) {
  const [filterValues, setFilterValues] = useState({});
  
  const filterPanel = useMemo(() => {
    const panel = FilterFactory.create(gridType, { options, ...config });
    panel.setFilterValues(filterValues);
    return panel;
  }, [gridType, options, config, filterValues]);

  const handleFiltersChange = useCallback((newValues) => {
    setFilterValues(newValues);
    if (options.onFiltersChange) {
      options.onFiltersChange(newValues);
    }
  }, [options]);

  const renderFilters = useMemo(() => {
    return (props = {}) => filterPanel.render({
      onFiltersChange: handleFiltersChange,
      ...props
    });
  }, [filterPanel, handleFiltersChange]);

  const clearFilters = useCallback(() => {
    filterPanel.clearAllFilters();
    setFilterValues({});
  }, [filterPanel]);

  return {
    filterPanel,
    filterValues,
    renderFilters,
    clearFilters,
    activeFilterCount: filterPanel.getActiveFilterCount(),
    addFilter: (filter) => filterPanel.addFilter(filter),
    setFilterValues: (values) => {
      setFilterValues(values);
      filterPanel.setFilterValues(values);
    }
  };
}