// UnifiedGridToolbar - Optimized Toolbar System
// Combines the best features from CustomGridToolbar and GridToolbar
import React, { useState, useCallback } from 'react';
import {
  Box,
  Toolbar,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon,
  Sync as SyncIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Clear as ClearIcon,
  Info as InfoIcon
} from '@mui/icons-material';
// Removed useSafeTranslate import - using stable local translation function

// Toolbar sub-components
import GridToolbarActions from './GridToolbarActions';
import GridToolbarFilters from './GridToolbarFilters';
import GridToolbarSettings from './GridToolbarSettings';

// Standard configurations
import { getStandardToolbarConfig } from '../../config/standardToolbarConfig';

/**
 * UnifiedGridToolbar - The ultimate grid toolbar
 * Features:
 * - Modular design with separate components for actions, filters, settings
 * - Support for custom actions and configurations
 * - Search functionality with debouncing
 * - Filter management with custom filters
 * - View mode switching (grid/card)
 * - Responsive design with overflow menu
 * - i18n and RTL support
 */
const UnifiedGridToolbar = ({
  gridName,
  gridType = 'magento', // Default grid type
  config = {},
  customActions = [],
  customLeftActions = [],
  selectedRows = [],
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onSync,
  onExport,
  onImport,
  onSearch,
  searchValue = '',
  onClearSearch,
  onFiltersToggle,
  filtersVisible = false,
  columnVisibility = {},
  onColumnVisibilityChange,
  density,
  onDensityChange,
  enableI18n = true,
  isRTL = false,
  loading = false,
  viewMode = 'grid',
  onViewModeChange,
  showCardView = true,

  // Custom filter props (from CustomGridToolbar)
  filterModel = { items: [] },
  customFilters = [],
  onCustomFilterChange,
  currentCustomFilter,
  succursaleOptions,
  currentSuccursale,
  onSuccursaleChange,
  sourceOptions,
  currentSource,
  onSourceChange,
  showChangedOnly,
  setShowChangedOnly,
  onSyncStocksHandler,
  onSyncAllHandler,
  canInfo,
  mdmStocks,
  onInfo
}) => {
  const theme = useTheme();
  // Stable translation function that doesn't change on every render
  const translate = useCallback((key, fallback = key) => {
    try {
      // Simple fallback translation without excessive dependencies
      return enableI18n ? (fallback || key) : (fallback || key);
    } catch (error) {
      return fallback || key;
    }
  }, [enableI18n]);

  // Local state
  const [searchText, setSearchText] = useState(searchValue);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState(null);

  // Configuration with standard defaults based on grid type
  const standardConfig = getStandardToolbarConfig(gridType, config);
  const toolbarConfig = {
    ...standardConfig,
    // Ensure mdmStocks is properly set
    mdmStocks: mdmStocks || standardConfig.mdmStocks || false
  };

  const selectedCount = selectedRows.length;
  const hasSelection = selectedCount > 0;

  // Event handlers
  const handleSearch = useCallback((value) => {
    setSearchText(value);
    onSearch?.(value);
  }, [onSearch]);

  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchText(value);
    // Don't trigger search on every keystroke, only on Enter or when cleared
  }, []);

  const handleSearchKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch?.(searchText);
    }
  }, [onSearch, searchText]);

  const handleSearchSubmit = useCallback(() => {
    onSearch?.(searchText);
  }, [onSearch, searchText]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    onSearch?.('');
    onClearSearch?.();
  }, [onSearch, onClearSearch]);

  const handleMoreMenuOpen = useCallback((event) => {
    setMoreMenuAnchor(event.currentTarget);
  }, []);

  const handleMoreMenuClose = useCallback(() => {
    setMoreMenuAnchor(null);
  }, []);

  const handleSettingsMenuOpen = useCallback((event) => {
    setSettingsMenuAnchor(event.currentTarget);
  }, []);

  const handleSettingsMenuClose = useCallback(() => {
    setSettingsMenuAnchor(null);
  }, []);

  // Button size and spacing based on compact mode
  const buttonSize = toolbarConfig.compact ? 'small' : (toolbarConfig.size || 'medium');
  const spacing = toolbarConfig.compact ? 0.5 : 1;

  return (
    <Box sx={{ 
      borderBottom: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper
    }}>
      <Toolbar
        variant="dense"
        sx={{
          minHeight: toolbarConfig.compact ? 44 : 52, // More compact
          px: toolbarConfig.compact ? 1.5 : 2,
          py: toolbarConfig.compact ? 0.5 : 1,
          gap: spacing,
          direction: isRTL ? 'rtl' : 'ltr',
          flexWrap: 'wrap',
          // Enhanced responsive design
          '@media (max-width: 768px)': {
            minHeight: 40,
            px: 1,
            py: 0.5,
            gap: 0.5
          },
          '@media (max-width: 480px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 0.5,
            minHeight: 'auto'
          }
        }}
      >
        {/* Section 1: Refresh */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {toolbarConfig.showRefresh && (
            <Tooltip title={translate('refresh', 'Refresh Data')}>
              <IconButton
                onClick={onRefresh}
                disabled={loading}
                size="small"
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Section 2a: Custom Left Actions */}
        {customLeftActions.length > 0 && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {customLeftActions.map((action, index) => (
                <Box key={index}>
                  {action}
                </Box>
              ))}
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          </>
        )}

        {/* Section 2b: Action Buttons */}
        <GridToolbarActions
          config={toolbarConfig}
          selectedCount={selectedCount}
          hasSelection={hasSelection}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onSync={onSync}
          onExport={onExport}
          onImport={onImport}
          customActions={customActions}
          loading={loading}
          buttonSize={buttonSize}
          spacing={spacing}
          translate={translate}
          mdmStocks={mdmStocks}
          // Custom action handlers
          onSyncStocksHandler={onSyncStocksHandler}
          onSyncAllHandler={onSyncAllHandler}
          canInfo={canInfo}
          onInfo={onInfo}
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Section 3: Search */}
        {toolbarConfig.showSearch && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200, maxWidth: 350 }}>
            <TextField
              size="small"
              placeholder={translate('search', 'Search SKU, Name...')}
              value={searchText}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={handleSearchSubmit}
              disabled={!searchText.trim()}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              Search
            </Button>
          </Box>
        )}

        {/* Section 4: Custom Filters */}
        {toolbarConfig.showCustomFilters && (
          <GridToolbarFilters
            customFilters={customFilters}
            currentCustomFilter={currentCustomFilter}
            onCustomFilterChange={onCustomFilterChange}
            succursaleOptions={succursaleOptions}
            currentSuccursale={currentSuccursale}
            onSuccursaleChange={onSuccursaleChange}
            sourceOptions={sourceOptions}
            currentSource={currentSource}
            onSourceChange={onSourceChange}
            showChangedOnly={showChangedOnly}
            setShowChangedOnly={setShowChangedOnly}
            translate={translate}
          />
        )}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Section 5: View Controls */}
        {toolbarConfig.showViewToggle && showCardView && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={onViewModeChange}
            size="small"
          >
            <ToggleButton value="grid">
              <Tooltip title={translate('gridView', 'Grid View')}>
                <GridViewIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="card">
              <Tooltip title={translate('cardView', 'Card View')}>
                <ViewListIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {/* Section 6: Selection Info */}
        {toolbarConfig.showSelection && hasSelection && (
          <Chip
            label={translate('selectedCount', `${selectedCount} selected`)}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}

        {/* Section 7: Filter Toggle */}
        {toolbarConfig.showFilters && (
          <Tooltip title={translate('toggleFilters', 'Toggle Filters')}>
            <IconButton
              onClick={onFiltersToggle}
              color={filtersVisible ? 'primary' : 'default'}
              size="small"
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Section 8: Settings */}
        {toolbarConfig.showSettings && (
          <Tooltip title={translate('settings', 'Settings')}>
            <IconButton
              onClick={handleSettingsMenuOpen}
              size="small"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Section 9: More Menu  
        <Tooltip title={translate('more', 'More Options')}>
          <IconButton
            onClick={handleMoreMenuOpen}
            size="small"
          >
            <MoreIcon />
          </IconButton>
        </Tooltip>
        */}
      </Toolbar>

      {/* Settings Menu */}
      <GridToolbarSettings
        anchorEl={settingsMenuAnchor}
        open={Boolean(settingsMenuAnchor)}
        onClose={handleSettingsMenuClose}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        density={density}
        onDensityChange={onDensityChange}
        gridName={gridName}
        translate={translate}
        exportOptions={toolbarConfig.exportOptions || {}}
        onExport={onExport}
      />

      {/* More Menu */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={handleMoreMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: isRTL ? 'left' : 'right' }}
      >
        <MenuItem onClick={() => { onRefresh?.(); handleMoreMenuClose(); }}>
          <ListItemIcon><RefreshIcon /></ListItemIcon>
          <ListItemText primary={translate('refresh', 'Refresh')} />
        </MenuItem>
        {toolbarConfig.showExport && (
          <MenuItem onClick={() => { onExport?.(); handleMoreMenuClose(); }}>
            <ListItemIcon><ExportIcon /></ListItemIcon>
            <ListItemText primary={translate('export', 'Export')} />
          </MenuItem>
        )}
        {toolbarConfig.showImport && (
          <MenuItem onClick={() => { onImport?.(); handleMoreMenuClose(); }}>
            <ListItemIcon><ImportIcon /></ListItemIcon>
            <ListItemText primary={translate('import', 'Import')} />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default UnifiedGridToolbar;
