// GridToolbarFilters - Modular Filter Controls Component
import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';

/**
 * GridToolbarFilters - Filter controls section of the toolbar
 * Handles custom filters, dropdowns, and filter switches
 */
const GridToolbarFilters = ({
  customFilters = [],
  currentCustomFilter,
  onCustomFilterChange,
  succursaleOptions = [],
  currentSuccursale,
  onSuccursaleChange,
  sourceOptions = [],
  currentSource,
  onSourceChange,
  showChangedOnly,
  setShowChangedOnly,
  translate,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Custom Filters Dropdown */}
      {customFilters.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{translate('filter', 'Filter')}</InputLabel>
          <Select
            value={currentCustomFilter || 'all'}
            onChange={(e) => onCustomFilterChange?.(e.target.value)}
            label={translate('filter', 'Filter')}
          >
            <MenuItem value="all">{translate('all', 'All')}</MenuItem>
            {customFilters.map((filter) => (
              <MenuItem key={filter.value} value={filter.value}>
                {filter.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Succursale (Branch) Filter */}
      {succursaleOptions.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{translate('branch', 'Branch')}</InputLabel>
          <Select
            value={currentSuccursale || 'all'}
            onChange={(e) => onSuccursaleChange?.(e.target.value)}
            label={translate('branch', 'Branch')}
          >
            <MenuItem value="all">{translate('all', 'All')}</MenuItem>
            {succursaleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Source Filter */}
      {sourceOptions.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{translate('source', 'Source')}</InputLabel>
          <Select
            value={currentSource || 'all'}
            onChange={(e) => onSourceChange?.(e.target.value)}
            label={translate('source', 'Source')}
          >
            <MenuItem value="all">{translate('all', 'All')}</MenuItem>
            {sourceOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Show Changed Only Switch */}
      {typeof showChangedOnly !== 'undefined' && setShowChangedOnly && (
        <FormControlLabel
          control={
            <Switch
              checked={showChangedOnly}
              onChange={(e) => setShowChangedOnly(e.target.checked)}
              size="small"
            />
          }
          label={translate('changedOnly', 'Changed Only')}
          sx={{ ml: 1 }}
        />
      )}

      {/* Active Filters Display */}
      {(currentCustomFilter && currentCustomFilter !== 'all') && (
        <Chip
          label={`${translate('filter', 'Filter')}: ${currentCustomFilter}`}
          size="small"
          variant="outlined"
          onDelete={() => onCustomFilterChange?.('all')}
        />
      )}

      {(currentSuccursale && currentSuccursale !== 'all') && (
        <Chip
          label={`${translate('branch', 'Branch')}: ${currentSuccursale}`}
          size="small"
          variant="outlined"
          onDelete={() => onSuccursaleChange?.('all')}
        />
      )}

      {(currentSource && currentSource !== 'all') && (
        <Chip
          label={`${translate('source', 'Source')}: ${currentSource}`}
          size="small"
          variant="outlined"
          onDelete={() => onSourceChange?.('all')}
        />
      )}

      {showChangedOnly && (
        <Chip
          label={translate('changedOnly', 'Changed Only')}
          size="small"
          color="primary"
          variant="outlined"
          onDelete={() => setShowChangedOnly?.(false)}
        />
      )}
    </Box>
  );
};

export default GridToolbarFilters;
