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
  Chip
} from '@mui/material';

/**
 * GridToolbarFilters - Filter controls section of the toolbar
 * Handles custom filters, dropdowns, and filter switches
 */
const GridToolbarFilters: React.FC<{customFilters: any currentCustomFilter onCustomFilterChange succursaleOptions: any currentSuccursale onSuccursaleChange sourceOptions: any currentSource onSourceChange showChangedOnly setShowChangedOnly translate: any}> = ({ customFilters
  currentCustomFilter,
  onCustomFilterChange,
  succursaleOptions
  currentSuccursale,
  onSuccursaleChange,
  sourceOptions
  currentSource,
  onSourceChange,
  showChangedOnly,
  setShowChangedOnly,
  translate
 }) => {
  return Boolean((
    <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Custom Filters Dropdown */}
      {customFilters.length > 0 && (
        <FormControl size="small" sx={{ display: "flex", minWidth: 120 }}>
          <InputLabel>{translate('filter', 'Filter')}</InputLabel>
          <Select
            value={currentCustomFilter || 'all'}
            onChange={(e) => onCustomFilterChange?.(e.target?.value)}
            label={translate('filter', 'Filter')}
          >
            <MenuItem value="all">{translate('all', 'All')}</MenuItem>
            {customFilters.map((filter: any: any: any: any) => (
              <MenuItem key={filter?.value} value={filter?.value}>
                {filter?.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Succursale (Branch) Filter */}
      {succursaleOptions.length > 0 && (
        <FormControl size="small" sx={{ display: "flex", minWidth: 120 }}>
          <InputLabel>{translate('branch', 'Branch')}</InputLabel>
          <Select
            value={currentSuccursale || 'all'}
            onChange={(e) => onSuccursaleChange?.(e.target?.value)}
            label={translate('branch', 'Branch')}
          >
            <MenuItem value="all">{translate('all', 'All')}</MenuItem>
            {succursaleOptions.map((option: any: any: any: any) => (
              <MenuItem key={option?.value} value={option?.value}>
                {option?.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Source Filter */}
      {sourceOptions.length > 0 && (
        <FormControl size="small" sx={{ display: "flex", minWidth: 120 }}>
          <InputLabel>{translate('source', 'Source')}</InputLabel>
          <Select
            value={currentSource || 'all'}
            onChange={(e) => onSourceChange?.(e.target?.value)}
            label={translate('source', 'Source')}
          >
            <MenuItem value="all">{translate('all', 'All')}</MenuItem>
            {sourceOptions.map((option: any: any: any: any) => (
              <MenuItem key={option?.value} value={option?.value}>
                {option?.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Show Changed Only Switch */}
      {typeof showChangedOnly !== 'undefined' && setShowChangedOnly && (<FormControlLabel
          control
              checked={showChangedOnly}
              onChange={(e) => setShowChangedOnly(e.target.checked)}
              size="small"
          }
          label={translate('changedOnly', 'Changed Only')}
          sx={{ display: "flex", ml: 1 }}
        />
      )}

      {/* Active Filters Display */}
      {(currentCustomFilter && currentCustomFilter !== 'all') && (
        <Chip
          label={`${translate('filter', 'Filter')}: ${currentCustomFilter}`}
          size="small"
          onDelete={() => onCustomFilterChange?.('all')}
        />
      )}

      {(currentSuccursale && currentSuccursale !== 'all') && (
        <Chip
          label={`${translate('branch', 'Branch')}: ${currentSuccursale}`}
          size="small"
          onDelete={() => onSuccursaleChange?.('all')}
        />
      )}

      {(currentSource && currentSource !== 'all') && (
        <Chip
          label={`${translate('source', 'Source')}: ${currentSource}`}
          size="small"
          onDelete={() => onSourceChange?.('all')}
        />
      )}

      {showChangedOnly && (
        <Chip
          label={translate('changedOnly', 'Changed Only')}
          size="small"
          onDelete={() => setShowChangedOnly?.(false)}
        />
      )}
    </Box>
  )))));
};

export default GridToolbarFilters;
