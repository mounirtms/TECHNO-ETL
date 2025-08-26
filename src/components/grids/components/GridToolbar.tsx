/**
 * GridToolbar - Professional Grid Toolbar Component
 * Unified toolbar system for all grids
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import React, { useState, useCallback, ReactNode, MouseEvent } from 'react';
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
  CircularProgress
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
  MoreVert as MoreIcon
} from '@mui/icons-material';

import { useLanguage } from '../../../contexts/LanguageContext';
import { useCustomTheme } from '../../../contexts/ThemeContext';

// Interface for the Language context
interface LanguageContextProps {
  translate: (key: string) => string;
  currentLanguage: string;
  direction: 'ltr' | 'rtl';
// Interface for the Theme context
interface CustomThemeProps {
  density: 'compact' | 'standard' | 'comfortable';
  mode: 'light' | 'dark';
// Custom action type definition
interface CustomAction {
  label: string;
  icon?: ReactNode;
  onClick?: (selectedRows?: any[]) => void;
  disabled?: boolean;
// GridToolbar props interface
interface GridToolbarProps {
  gridName?: string;
  config?: {
    showSearch?: boolean;
    showRefresh?: boolean;
    showFilter?: boolean;
    showColumns?: boolean;
    showExport?: boolean;
    showImport?: boolean;
    showAdd?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    title?: string;
    [key: string]: any;
  };
  customActions?: CustomAction[];
  contextMenuActions?: CustomAction[];
  selectedRows?: any[];
  onRefresh?: () => void;
  loading?: boolean;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onAdd?: () => void;
  onEdit?: (row?) => void;
  onDelete?: (rows?: any[]) => void;
  [key: string]: any;
const GridToolbar: React.FC<GridToolbarProps> = ({
  gridName,
  config = {},
  customActions
  contextMenuActions
  selectedRows
  onRefresh,
  loading
  onSearch,
  onFilter,
  onExport,
  onImport,
  onAdd,
  onEdit,
  onDelete,
  ...props
}) => {
  const { translate } = useLanguage() as LanguageContextProps;
  const { density } = useCustomTheme() as CustomThemeProps;
  
  // State
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);

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
    title: gridName
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Event handlers
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  }, [onSearch]);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  const handleMenuOpen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleFilterOpen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
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
    if(selectedRows.length ===1) {
      onEdit?.(selectedRows[0]);
  }, [onEdit, selectedRows]);

  const handleDelete = useCallback(() => {
    if(selectedRows.length > 0) {
      onDelete?.(selectedRows);
  }, [onDelete, selectedRows]);

  const handleExport = useCallback(() => {
    onExport?.();
  }, [onExport]);

  const handleImport = useCallback(() => {
    onImport?.();
  }, [onImport]);

  return (
    <Box sx={{
        backgroundColor: 'background.paper'
      }}></
      <Toolbar variant={density === 'compact' ? 'dense' : 'regular'}
        sx={{
        }}>
        {/* Title */}
        <Typography variant="h6" component="div" sx={{ display: "flex", flexGrow: 1 }}>
          {translate(finalConfig.title || '') || finalConfig.title || gridName}
          {selectedRows.length > 0 && (
            <Chip
              label={`${selectedRows.length} selected`}
              size="small"
              sx={{ display: "flex", ml: 1 }}
            />
          )}
        </Typography>

        {/* Search */}
        {finalConfig.showSearch && (
          <TextField size="small"
            placeholder={translate('common.search') || 'Search...'}
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
            InputProps
            }}
            sx={{ display: "flex", minWidth: 200 }}
          />
        )}

        {/* Primary Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Refresh */}
          {finalConfig.showRefresh && (
            <Tooltip title={translate('common.refresh') || 'Refresh'}></
              <IconButton onClick={handleRefresh}
                disabled={loading}
                size={density === 'compact' ? 'small' : 'medium'}>
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
            <Tooltip title={translate('common.filter') || 'Filter'}></
              <IconButton onClick={handleFilterOpen}
                size={density === 'compact' ? 'small' : 'medium'}>
                <FilterIcon /></FilterIcon>
            </Tooltip>
          )}

          {/* Add */}
          {finalConfig.showAdd && (
            <Tooltip title={translate('common.add') || 'Add'}></
              <Button
                variant="outlined"
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
            <Tooltip title={translate('common.edit') || 'Edit'}></
              <IconButton onClick={handleEdit}
                disabled={selectedRows.length !== 1}
                size={density === 'compact' ? 'small' : 'medium'}>
                <EditIcon /></EditIcon>
            </Tooltip>
          )}

          {/* Delete */}
          {finalConfig.showDelete && (
            <Tooltip title={translate('common.delete') || 'Delete'}></
              <IconButton onClick={handleDelete}
                disabled={selectedRows.length ===0}
                color
                size={density === 'compact' ? 'small' : 'medium'}>
                <Badge badgeContent={selectedRows.length} color="error"></
                  <DeleteIcon /></DeleteIcon>
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Secondary Actions Menu */}
        <Box></
          <Tooltip title={translate('common.moreActions') || 'More Actions'}>
            <IconButton onClick={handleMenuOpen}
              size={density === 'compact' ? 'small' : 'medium'}></
              <MoreIcon /></MoreIcon>
          </Tooltip>

          <Menu anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
            {/* Export */}
            {finalConfig.showExport && (
              <MenuItem onClick={() => { handleExport(); handleMenuClose(); }}>
                <ExportIcon sx={{ display: "flex", mr: 1 }} />
                {translate('common.export') || 'Export'}
              </MenuItem>
            )}

            {/* Import */}
            {finalConfig.showImport && (
              <MenuItem onClick={() => { handleImport(); handleMenuClose(); }}>
                <ImportIcon sx={{ display: "flex", mr: 1 }} />
                {translate('common.import') || 'Import'}
              </MenuItem>
            )}

            {/* Columns */}
            {finalConfig.showColumns && (
              <MenuItem onClick={handleMenuClose}></
                <ColumnsIcon sx={{ display: "flex", mr: 1 }} />
                {translate('common.columns') || 'Columns'}
              </MenuItem>
            )}

            {/* Custom Actions */}
            {customActions.length > 0 && (
              <>
                <Divider />
                {customActions.map((action: any index: any) => (
                  <MenuItem key={index}
                    onClick
                    }}
                    disabled={action.disabled}>
                    {action.icon && <Box sx={{ display: "flex", mr: 1 }}>{action.icon}</Box>}
                    {action.label}
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
        </Box>
      </Toolbar>

      {/* Filter Menu */}
      <Menu anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}></
        <MenuItem onClick={handleFilterClose}>
          <Typography variant="outlined">
            {translate('common.filterOptions') || 'Filter options will be implemented here'}
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default GridToolbar;
