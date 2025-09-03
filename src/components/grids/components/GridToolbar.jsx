/**
 * GridToolbar - Professional Grid Toolbar Component
 * Unified toolbar system for all grids
 *
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ViewColumn as ColumnsIcon,
  Download as ExportIcon,
  Upload as ImportIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';

import { useLanguage } from '../../../contexts/LanguageContext';
import { useCustomTheme } from '../../../contexts/ThemeContext';

const GridToolbar = ({
  gridName,
  config = {},
  customActions = [],
  contextMenuActions = [],
  selectedRows = [],
  onRefresh,
  loading = false,
  onSearch,
  onFilter,
  onExport,
  onImport,
  onAdd,
  onEdit,
  onDelete,
  ...props
}) => {
  const { translate } = useLanguage();
  const { density } = useCustomTheme();

  // State
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  // Default configuration
  const defaultConfig = {
    showSearch: true,
    showRefresh: true,
    showFilter: true,
    showColumns: true,
    showExport: true,
    showImport: false,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    title: gridName,
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Event handlers
  const handleSearch = useCallback((value) => {
    setSearchValue(value);
    onSearch?.(value);
  }, [onSearch]);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleFilterOpen = useCallback((event) => {
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

  // Action handlers
  const handleAdd = useCallback(() => {
    onAdd?.();
  }, [onAdd]);

  const handleEdit = useCallback(() => {
    if (selectedRows.length === 1) {
      onEdit?.(selectedRows[0]);
    }
  }, [onEdit, selectedRows]);

  const handleDelete = useCallback(() => {
    if (selectedRows.length > 0) {
      onDelete?.(selectedRows);
    }
  }, [onDelete, selectedRows]);

  const handleExport = useCallback(() => {
    onExport?.();
  }, [onExport]);

  const handleImport = useCallback(() => {
    onImport?.();
  }, [onImport]);

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Toolbar
        variant={density === 'compact' ? 'dense' : 'regular'}
        sx={{
          gap: 1,
          minHeight: density === 'compact' ? 48 : 64,
        }}
      >
        {/* Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {translate(finalConfig.title) || finalConfig.title}
          {selectedRows.length > 0 && (
            <Chip
              label={`${selectedRows.length} selected`}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>

        {/* Search */}
        {finalConfig.showSearch && (
          <TextField
            size="small"
            placeholder={translate('common.search') || 'Search...'}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
        )}

        {/* Primary Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Refresh */}
          {finalConfig.showRefresh && (
            <Tooltip title={translate('common.refresh') || 'Refresh'}>
              <IconButton
                onClick={handleRefresh}
                disabled={loading}
                size={density === 'compact' ? 'small' : 'medium'}
              >
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </Tooltip>
          )}

          {/* Filter */}
          {finalConfig.showFilter && (
            <Tooltip title={translate('common.filter') || 'Filter'}>
              <IconButton
                onClick={handleFilterOpen}
                size={density === 'compact' ? 'small' : 'medium'}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Add */}
          {finalConfig.showAdd && (
            <Tooltip title={translate('common.add') || 'Add'}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                size={density === 'compact' ? 'small' : 'medium'}
              >
                {translate('common.add') || 'Add'}
              </Button>
            </Tooltip>
          )}

          {/* Edit */}
          {finalConfig.showEdit && (
            <Tooltip title={translate('common.edit') || 'Edit'}>
              <IconButton
                onClick={handleEdit}
                disabled={selectedRows.length !== 1}
                size={density === 'compact' ? 'small' : 'medium'}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Delete */}
          {finalConfig.showDelete && (
            <Tooltip title={translate('common.delete') || 'Delete'}>
              <IconButton
                onClick={handleDelete}
                disabled={selectedRows.length === 0}
                color="error"
                size={density === 'compact' ? 'small' : 'medium'}
              >
                <Badge badgeContent={selectedRows.length} color="error">
                  <DeleteIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Secondary Actions Menu */}
        <Box>
          <Tooltip title={translate('common.moreActions') || 'More Actions'}>
            <IconButton
              onClick={handleMenuOpen}
              size={density === 'compact' ? 'small' : 'medium'}
            >
              <MoreIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* Export */}
            {finalConfig.showExport && (
              <MenuItem onClick={() => { handleExport(); handleMenuClose(); }}>
                <ExportIcon sx={{ mr: 1 }} />
                {translate('common.export') || 'Export'}
              </MenuItem>
            )}

            {/* Import */}
            {finalConfig.showImport && (
              <MenuItem onClick={() => { handleImport(); handleMenuClose(); }}>
                <ImportIcon sx={{ mr: 1 }} />
                {translate('common.import') || 'Import'}
              </MenuItem>
            )}

            {/* Columns */}
            {finalConfig.showColumns && (
              <MenuItem onClick={handleMenuClose}>
                <ColumnsIcon sx={{ mr: 1 }} />
                {translate('common.columns') || 'Columns'}
              </MenuItem>
            )}

            {/* Custom Actions */}
            {customActions.length > 0 && (
              <>
                <Divider />
                {customActions.map((action, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => {
                      action.onClick?.(selectedRows);
                      handleMenuClose();
                    }}
                    disabled={action.disabled}
                  >
                    {action.icon && <Box sx={{ mr: 1 }}>{action.icon}</Box>}
                    {action.label}
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
        </Box>
      </Toolbar>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleFilterClose}>
          <Typography variant="body2">
            {translate('common.filterOptions') || 'Filter options will be implemented here'}
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default GridToolbar;
