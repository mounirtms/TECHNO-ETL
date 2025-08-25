// MDMFilterPanel - Professional filter panel for MDM Products Grid
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Collapse,
  Chip,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  Business as BranchIcon,
  Source as SourceIcon,
  ChangeCircle as ChangedIcon
} from '@mui/icons-material';

/**
 * MDMFilterPanel - Professional filter interface for MDM Products
 * Features:
 * - Collapsible design to save space
 * - Visual filter indicators
 * - Clear all filters option
 * - Professional styling
 */
const MDMFilterPanel: React.FC<any> = ({
  succursaleOptions = [],
  succursaleFilter,
  onSuccursaleChange,
  sourceFilterOptions = [],
  sourceFilter,
  onSourceChange,
  showChangedOnly,
  onShowChangedOnlyChange,
  isExpanded = false,
  onToggleExpanded
}) => {
  const theme = useTheme();
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  const handleToggle = () => {
    const newExpanded = !localExpanded;
    setLocalExpanded(newExpanded);
    if (onToggleExpanded) {
      onToggleExpanded(newExpanded);
    }
  };

  const handleClearFilters = () => {
    onSuccursaleChange('16'); // Default branch
    onSourceChange('all');
    onShowChangedOnlyChange(false);
  };

  const hasActiveFilters = succursaleFilter !== '16' || sourceFilter !== 'all' || showChangedOnly;
  const filterCount = [
    succursaleFilter !== '16',
    sourceFilter !== 'all',
    showChangedOnly
  ].filter(Boolean).length;

  return (
    <Paper 
      elevation={0}
      sx={{
        mb: 1, // Less margin for compactness
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        background: theme.palette.background.paper,
        boxShadow: 'none',
        minHeight: 40,
        p: 0.5,
      }}
    >
      {/* Filter Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5, // More compact
          backgroundColor: theme.palette.background.default,
          cursor: 'pointer',
          minHeight: 36, // More compact
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          },
          transition: 'background-color 0.2s ease'
        }}
        onClick={handleToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}>
          <FilterIcon color="primary" />
          <Typography variant="subtitle2" fontWeight={600}>
            Filters
          </Typography>
          {filterCount > 0 && (
            <Chip 
              label={filterCount} 
              size="small" 
              color="primary" 
              sx={{ minWidth: 24, height: 20 } as any}
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}>
          {hasActiveFilters && (
            <Tooltip title="Clear all filters">
              <IconButton 
                size="small" 
                onClick={(e: any) => {
                  e.stopPropagation();
                  handleClearFilters();
                }}
                sx={{ color: theme.palette.text.secondary } as any}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {localExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>

      {/* Filter Content */}
      <Collapse in={localExpanded}>
        <Box sx={{ p: 2 } as any}>
          <Box sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
            '@media (max-width: 768px)': {
              flexDirection: 'column',
              alignItems: 'stretch'
            }
          }}>

            {/* Branch Filter - Enhanced Combobox */}
            <FormControl
              size="small"
              sx={{
                minWidth: 180,
                '@media (max-width: 768px)': { minWidth: '100%' }
              }}
            >
              <InputLabel
                id="branch-filter-label"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 500
                } as any}
              >
                <BranchIcon fontSize="small" sx={{ mr: 0.5 } as any} />
                Branch
              </InputLabel>
              <Select
                labelId="branch-filter-label"
                value={succursaleFilter}
                onChange={(e: any) => (e: any) => (e: any) => (e: any) => (e: any) => (e: any) => onSuccursaleChange(e.target?.value)}
                label="Branch"
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }
                }}
              >
                {succursaleOptions.map((option) => (
                  <MenuItem
                    key={option?.value}
                    value={option?.value}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 1
                    } as any}
                  >
                    <BranchIcon fontSize="small" color="primary" />
                    {option?.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Source Filter - Enhanced Combobox */}
            <FormControl
              size="small"
              sx={{
                minWidth: 180,
                '@media (max-width: 768px)': { minWidth: '100%' }
              }}
            >
              <InputLabel
                id="source-filter-label"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 500
                } as any}
              >
                <SourceIcon fontSize="small" sx={{ mr: 0.5 } as any} />
                Source
              </InputLabel>
              <Select
                labelId="source-filter-label"
                value={sourceFilter}
                onChange={(e: any) => (e: any) => (e: any) => (e: any) => (e: any) => (e: any) => onSourceChange(e.target?.value)}
                label="Source"
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }
                }}
              >
                {sourceFilterOptions.map((option) => (
                  <MenuItem
                    key={option?.value}
                    value={option?.value}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 1
                    } as any}
                  >
                    <SourceIcon fontSize="small" color="secondary" />
                    {option?.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Changed Only Switch - Compact */}
            <FormControlLabel
              control={
                <Switch
                  checked={showChangedOnly}
                  onChange={(e: any) => (e: any) => (e: any) => (e: any) => (e: any) => (e: any) => onShowChangedOnlyChange(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 } as any}>
                  <ChangedIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={500}>
                    Changed Only
                  </Typography>
                </Box>
              }
              sx={{
                ml: 1,
                '@media (max-width: 768px)': {
                  ml: 0,
                  justifyContent: 'center'
                }
              }}
            />
          </Box>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <>
              <Divider sx={{ my: 2 } as any} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' } as any}>
                  Active Filters:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' } as any}>
                  {succursaleFilter !== '16' && (
                    <Chip
                      label={`Branch: ${succursaleOptions.find(o => o?.value === succursaleFilter)?.label || succursaleFilter}`}
                      size="small"
                      onDelete={() => onSuccursaleChange('16')}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {sourceFilter !== 'all' && (
                    <Chip
                      label={`Source: ${sourceFilterOptions.find(o => o?.value === sourceFilter)?.label || sourceFilter}`}
                      size="small"
                      onDelete={() => onSourceChange('all')}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {showChangedOnly && (
                    <Chip
                      label="Changed Only"
                      size="small"
                      onDelete={() => onShowChangedOnlyChange(false)}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default MDMFilterPanel;
