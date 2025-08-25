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
const MDMFilters: React.FC<any> = ({
  sourceFilter,
  onSourceChange,
  succursaleFilter,
  onSuccursaleChange,
  showChangedOnly,
  onShowChangedOnlyChange,
  sources = [],
  branches = [],
  loading = false
}) => {
  return (
    <FilterContainer>
      {/* Source Filter */}
      <FilterFormControl size="small" disabled={loading}>
        <InputLabel id="source-filter-label">Source</InputLabel>
        <Select
          labelId="source-filter-label"
          value={sourceFilter || 'all'}
          label="Source"
          onChange={(e: any) => (e: any) => (e: any) => (e: any) => (e: any) => (e: any) => onSourceChange?.(e.target?.value)}
        >
          <MenuItem value="all">All Sources</MenuItem>
          {sources.map((source) => (
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
          labelId="branch-filter-label"
          value={succursaleFilter || 'all'}
          label="Branch"
          onChange={(e: any) => (e: any) => (e: any) => (e: any) => (e: any) => (e: any) => onSuccursaleChange?.(e.target?.value)}
        >
          <MenuItem value="all">All Branches</MenuItem>
          {branches.map((branch) => (
            <MenuItem key={branch?.value} value={branch?.value}>
              {branch?.label}
            </MenuItem>
          ))}
        </Select>
      </FilterFormControl>

      {/* Show Changed Only Filter */}
      <FormControlLabel
        control={
          <Switch
            checked={showChangedOnly}
            onChange={(e: any) => (e: any) => (e: any) => (e: any) => (e: any) => (e: any) => onShowChangedOnlyChange?.(e.target.checked)}
            disabled={loading}
            size="small"
          />
        }
        label="Show Recent Changes Only"
        sx={{ 
          ml: 1,
          '& .MuiFormControlLabel-label': {
            fontSize: '0.875rem',
            fontWeight: 500
          }
        }}
      />

      {/* Filter Summary */}
      <Box sx={{ 
        ml: 'auto', 
        display: 'flex', 
        alignItems: 'center',
        color: 'text.secondary',
        fontSize: '0.875rem'
      } as any}>
        {sourceFilter && sourceFilter !== 'all' && (
          <Box component="span" sx={{ mr: 1 } as any}>
            Source: {sources.find(s => s?.value === sourceFilter)?.label || sourceFilter}
          </Box>
        )}
        {succursaleFilter && succursaleFilter !== 'all' && (
          <Box component="span" sx={{ mr: 1 } as any}>
            Branch: {branches.find(b => b?.value === succursaleFilter)?.label || succursaleFilter}
          </Box>
        )}
        {showChangedOnly && (
          <Box component="span" sx={{ mr: 1 } as any}>
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
