import React from 'react';
/**
 * MDM Filters Component
 * Professional filtering interface for MDM Products Grid
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import { Box, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Styled filter container for consistent spacing and layout
 */
const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexWrap: 'wrap',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(1)
  }
}));

/**
 * Styled form control for consistent filter styling
 */
const FilterFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 150,
  [theme.breakpoints.down('md')]: {
    minWidth: '100%'
  }
}));

/**
 * MDM Filters Component
 * Provides filtering interface for MDM inventory data
 * 
 * @param {Object} props - Component props
 * @param {string} props.sourceFilter - Current source filter value
 * @param {Function} props.onSourceChange - Source filter change handler
 * @param {string} props.succursaleFilter - Current branch filter value
 * @param {Function} props.onSuccursaleChange - Branch filter change handler
 * @param {boolean} props.showChangedOnly - Show only changed items flag
 * @param {Function} props.onShowChangedOnlyChange - Changed only filter handler
 * @param {Array} props.sources - Available source options
 * @param {Array} props.branches - Available branch options
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} MDM filters component
 */
const MDMFilters: React.FC<{sourceFilter onSourceChange succursaleFilter onSuccursaleChange showChangedOnly onShowChangedOnlyChange sources: any branches: any loading: any : any}> = ({ sourceFilter,
  onSourceChange,
  succursaleFilter,
  onSuccursaleChange,
  showChangedOnly,
  onShowChangedOnlyChange,
  sources
  branches
  loading
 }) => {
  return(<FilterContainer>
      {/* Source Filter */}
      <FilterFormControl size="small" disabled={loading}>
        <InputLabel id="source-filter-label">Source</InputLabel>
        <Select
          labelId
          value={sourceFilter || 'all'}
          label
          onChange={(e) => onSourceChange?.(e.target?.value)}
        >
          <MenuItem value="all">All Sources</MenuItem>
          {sources.map((source: any: any: any: any) => (
            <MenuItem key={source?.value} value={source?.value}>
              {source?.label}
            </MenuItem>
          ))}
        </Select>
      </FilterFormControl>

      {/* Branch Filter */}
      <FilterFormControl size="small" disabled={loading}>
        <InputLabel id="branch-filter-label">Branch</InputLabel>
        <Select
          labelId
          value={succursaleFilter || 'all'}
          label
          onChange={(e) => onSuccursaleChange?.(e.target?.value)}
        >
          <MenuItem value="all">All Branches</MenuItem>
          {branches.map((branch: any: any: any: any) => (
            <MenuItem key={branch?.value} value={branch?.value}>
              {branch?.label}
            </MenuItem>
          ))}
        </Select>
      </FilterFormControl>

      {/* Show Changed Only Filter */}
      <FormControlLabel
        control
            checked={showChangedOnly}
            onChange={(e) => onShowChangedOnlyChange?.(e.target.checked)}
            disabled={loading}
            size="small"
        }
        label
          '& .MuiFormControlLabel-label': {
            fontSize: '0.875rem',
            fontWeight: 500
          }
        }}
      />

      {/* Filter Summary */}
      <Box sx={{ 
        display: "flex", 
        ml: 'auto', 
        display: 'flex', 
        alignItems: 'center',
        color: 'text.secondary',
        fontSize: '0.875rem'
      }}>
        {sourceFilter && sourceFilter !== 'all' && (
          <Box component="span" sx={{ display: "flex", mr: 1 }}>
            Source: {sources.find(s => s?.value ===sourceFilter)?.label || sourceFilter}
          </Box>
        )}
        {succursaleFilter && succursaleFilter !== 'all' && (
          <Box component="span" sx={{ display: "flex", mr: 1 }}>
            Branch: {branches.find(b => b?.value ===succursaleFilter)?.label || succursaleFilter}
          </Box>
        )}
        {showChangedOnly && (
          <Box component="span" sx={{ display: "flex", mr: 1 }}>
            Recent Changes Only
          </Box>
        )}
      </Box>
    </FilterContainer>
  );
};

/**
 * Default source options for MDM filters
 */
export const defaultSources = [
  { value: '7', label: 'Source 7' },
  { value: '16', label: 'Source 16' },
  { value: '20', label: 'Source 20' },
  { value: '25', label: 'Source 25' }
];

/**
 * Default branch options for MDM filters
 */
export const defaultBranches = [
  { value: '16', label: 'Branch 16' },
  { value: '20', label: 'Branch 20' },
  { value: '25', label: 'Branch 25' },
  { value: '30', label: 'Branch 30' }
];

export default MDMFilters;
