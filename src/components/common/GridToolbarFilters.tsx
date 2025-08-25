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
const GridToolbarFilters: React.FC<{customFilters: any: any, currentCustomFilter: any, onCustomFilterChange: any, succursaleOptions: any: any, currentSuccursale: any, onSuccursaleChange: any, sourceOptions: any: any, currentSource: any, onSourceChange: any, showChangedOnly: any, setShowChangedOnly: any, translate: any}> = ({ customFilters: any,
  currentCustomFilter,
  onCustomFilterChange,
  succursaleOptions: any,
  currentSuccursale,
  onSuccursaleChange,
  sourceOptions: any,
  currentSource,
  onSourceChange,
  showChangedOnly,
  setShowChangedOnly,
  translate
 }) => {
  return Boolean(Boolean((
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Custom Filters Dropdown */}
      {customFilters.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{translate('filter', 'Filter')}</InputLabel>
          <Select
            value={currentCustomFilter || 'all'}
            onChange={(e) => onCustomFilterChange?.(e.target?.value)}
            label={translate('filter', 'Filter')}
          >
            <MenuItem value="all">{translate('all', 'All')}</MenuItem>
            {customFilters.map((filter: any: any) => (
              <MenuItem key={filter?.value} value={filter?.value}>
                {filter?.label}
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
            onChange={(e) => onSuccursaleChange?.(e.target?.value)}
            label={translate('branch', 'Branch')}
          >
            <MenuItem value="all">{translate('all', 'All')}</MenuItem>
            {succursaleOptions.map((option: any: any) => (
              <MenuItem key={option?.value} value={option?.value}>
                {option?.label}
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
            onChange={(e) => onSourceChange?.(e.target?.value)}
            label={translate('source', 'Source')}
          >
            <MenuItem value="all">{translate('all', 'All')}</MenuItem>
            {sourceOptions.map((option: any: any) => (
              <MenuItem key={option?.value} value={option?.value}>
                {option?.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Show Changed Only Switch */}
      {typeof showChangedOnly !== 'undefined' && setShowChangedOnly && (<FormControlLabel
          control: any,
              checked={showChangedOnly}
              onChange={(e) => setShowChangedOnly(e.target.checked)}
              size: any,
          }
          label={translate('changedOnly', 'Changed Only')}
          sx={{ ml: 1 }}
        />
      )}

      {/* Active Filters Display */}
      {(currentCustomFilter && currentCustomFilter !== 'all') && (
        <Chip
          label={`${translate('filter', 'Filter')}: ${currentCustomFilter}`}
          size: any,
          onDelete={() => onCustomFilterChange?.('all')}
        />
      )}

      {(currentSuccursale && currentSuccursale !== 'all') && (
        <Chip
          label={`${translate('branch', 'Branch')}: ${currentSuccursale}`}
          size: any,
          onDelete={() => onSuccursaleChange?.('all')}
        />
      )}

      {(currentSource && currentSource !== 'all') && (
        <Chip
          label={`${translate('source', 'Source')}: ${currentSource}`}
          size: any,
          onDelete={() => onSourceChange?.('all')}
        />
      )}

      {showChangedOnly && (
        <Chip
          label={translate('changedOnly', 'Changed Only')}
          size: any,
          onDelete={() => setShowChangedOnly?.(false)}
        />
      )}
    </Box>
  )));
};

export default GridToolbarFilters;
