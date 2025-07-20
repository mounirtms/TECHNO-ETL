import React, { useState, useCallback } from 'react';
import {
  Box,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Divider,
  Tooltip,
  Badge,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  GetApp as ExportIcon,
  Publish as ImportIcon,
  Clear as ClearIcon,
  MoreVert as MoreIcon,
  ViewColumn as ColumnsIcon,
  Sync as SyncIcon,
  ViewList as GridViewIcon,
  ViewModule as CardViewIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Enhanced Grid Toolbar Component
 * Provides a comprehensive toolbar with sections for different actions
 */
const GridToolbar = ({
  gridName,
  onRefresh,
  selectedRows = [],
  config = {},
  columnVisibility = {},
  onColumnVisibilityChange,
  density,
  onDensityChange,
  enableI18n = true,
  isRTL = false,
  onSearch,
  searchValue = '',
  onClearSearch,
  onExport,
  onImport,
  onAdd,
  onEdit,
  onDelete,
  onSync,
  onSettings,
  onFiltersToggle,
  filtersVisible = false,
  customActions = [],
  loading = false
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState(searchValue);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState(null);

  // Configuration with defaults
  const toolbarConfig = {
    showRefresh: true,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showExport: true,
    showImport: false,
    showSync: false,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showSelection: true,
    compact: false,
    size: 'medium',
    ...config
  };

  // Determine button size and spacing based on compact mode
  const buttonSize = toolbarConfig.compact ? 'small' : (toolbarConfig.size || 'medium');
  const spacing = toolbarConfig.compact ? 0.5 : 1;

  const selectedCount = selectedRows.length;
  const hasSelection = selectedCount > 0;

  // Event handlers
  const handleSearch = useCallback((value) => {
    setSearchText(value);
    onSearch?.(value);
  }, [onSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    onClearSearch?.();
  }, [onClearSearch]);

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

  // Translation helper
  const translate = useCallback((key, fallback) => {
    return enableI18n ? t(`grid.toolbar.${key}`, fallback) : fallback;
  }, [enableI18n, t]);

  return (
    <Box sx={{ 
      borderBottom: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper
    }}>
      <Toolbar 
        variant="dense" 
        sx={{ 
          minHeight: 56,
          px: 2,
          gap: 1,
          direction: isRTL ? 'rtl' : 'ltr'
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

        {/* Section 2: Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing }}>
          {toolbarConfig.showAdd && (
            <Tooltip title={translate('add', 'Add New')}>
              <Button
                startIcon={<AddIcon />}
                onClick={onAdd}
                variant="contained"
                size={buttonSize}
                disabled={loading}
              >
                {toolbarConfig.compact ? '' : translate('add', 'Add')}
              </Button>
            </Tooltip>
          )}

          {toolbarConfig.showEdit && (
            <Tooltip title={translate('edit', 'Edit Selected')}>
              <span>
                <Button
                  startIcon={<EditIcon />}
                  onClick={onEdit}
                  variant="outlined"
                  size={buttonSize}
                  disabled={!hasSelection || loading}
                >
                  {toolbarConfig.compact ? '' : translate('edit', 'Edit')}
                </Button>
              </span>
            </Tooltip>
          )}

          {toolbarConfig.showDelete && (
            <Tooltip title={translate('delete', 'Delete Selected')}>
              <Button
                startIcon={<DeleteIcon />}
                onClick={onDelete}
                variant="outlined"
                color="error"
                size={buttonSize}
                disabled={!hasSelection || loading}
              >
                {translate('delete', 'Delete')}
              </Button>
            </Tooltip>
          )}

          {toolbarConfig.showSync && (
            <Tooltip title={translate('sync', 'Sync Data')}>
              <IconButton
                onClick={onSync}
                disabled={loading}
                size="small"
                color="primary"
              >
                <SyncIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Custom Actions */}
          {customActions.map((action, index) => {
            // Safely render icon - ensure it's a valid React element
            const renderIcon = () => {
              if (!action.icon) return null;

              // Handle Material-UI icon components (functions)
              if (typeof action.icon === 'function') {
                const IconComponent = action.icon;
                return <IconComponent />;
              }

              // Handle React elements
              if (React.isValidElement(action.icon)) {
                return action.icon;
              }

              // Invalid icon type - return null to avoid prop type warning
              return null;
            };

            return (
              <Tooltip key={index} title={action.tooltip || action.label}>
                <span>
                  <Button
                    startIcon={renderIcon()}
                    onClick={action.onClick}
                    variant={action.variant || 'outlined'}
                    color={action.color || 'primary'}
                    size="small"
                    disabled={action.disabled || loading}
                  >
                    {action.label}
                  </Button>
                </span>
              </Tooltip>
            );
          })}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Section 3: Search and Filters */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          {toolbarConfig.showSearch && (
            <TextField
              size="small"
              placeholder={translate('search', 'Search...')}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{ minWidth: 200, maxWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          )}

          {toolbarConfig.showFilters && (
            <Tooltip title={translate('filters', 'Show Filters')}>
              <IconButton
                onClick={onFiltersToggle}
                size="small"
                color={filtersVisible ? 'primary' : 'default'}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Section 4: Selection Info */}
        {toolbarConfig.showSelection && hasSelection && (
          <Fade in={hasSelection}>
            <Chip
              label={translate('selectedCount', `${selectedCount} selected`).replace('{{count}}', selectedCount)}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Fade>
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Section 5: Settings and More */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {(toolbarConfig.showExport || toolbarConfig.showImport) && (
            <>
              <Tooltip title={translate('export', 'Export Data')}>
                <IconButton
                  onClick={onExport}
                  disabled={loading}
                  size="small"
                >
                  <ExportIcon />
                </IconButton>
              </Tooltip>

              {toolbarConfig.showImport && (
                <Tooltip title={translate('import', 'Import Data')}>
                  <IconButton
                    onClick={onImport}
                    disabled={loading}
                    size="small"
                  >
                    <ImportIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}

          {toolbarConfig.showSettings && (
            <Tooltip title={translate('settings', 'Grid Settings')}>
              <IconButton
                onClick={handleSettingsMenuOpen}
                size="small"
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="More options">
            <IconButton
              onClick={handleMoreMenuOpen}
              size="small"
            >
              <MoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsMenuAnchor}
        open={Boolean(settingsMenuAnchor)}
        onClose={handleSettingsMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: isRTL ? 'left' : 'right' }}
      >
        <MenuItem onClick={() => { onSettings?.('viewMode'); handleSettingsMenuClose(); }}>
          <ListItemIcon><GridViewIcon /></ListItemIcon>
          <ListItemText primary={translate('viewMode', 'View Mode')} />
        </MenuItem>
        <MenuItem onClick={() => { onSettings?.('columns'); handleSettingsMenuClose(); }}>
          <ListItemIcon><ColumnsIcon /></ListItemIcon>
          <ListItemText primary={translate('columns', 'Columns')} />
        </MenuItem>
        <MenuItem onClick={() => { onSettings?.('density'); handleSettingsMenuClose(); }}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary={translate('density', 'Density')} />
        </MenuItem>
        <MenuItem onClick={() => { onSettings?.('reset'); handleSettingsMenuClose(); }}>
          <ListItemIcon><ClearIcon /></ListItemIcon>
          <ListItemText primary={translate('reset', 'Reset Layout')} />
        </MenuItem>
      </Menu>

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
      </Menu>
    </Box>
  );
};

export default GridToolbar;
