/**
 * BaseToolbar - Modern React 18 Base Toolbar Component
 * 
 * Features:
 * - Standardized action buttons with smart state management
 * - Advanced search with debouncing and deferred values
 * - Responsive design with overflow menu
 * - Accessibility compliant
 * - Modern React patterns (memo, useCallback, useMemo)
 * - TypeScript-ready prop interfaces
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React, { 
  useState, 
  useCallback, 
  useMemo, 
  useId,
  useDeferredValue,
  useTransition,
  memo
} from 'react';
import {
  Box,
  Toolbar,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Badge,
  useTheme,
  useMediaQuery,
  Tooltip,
  CircularProgress
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

// Import TooltipWrapper for proper disabled button handling
import TooltipWrapper from '../common/TooltipWrapper';

/**
 * Standard Action Button Configuration
 */
const STANDARD_ACTIONS = {
  refresh: {
    icon: RefreshIcon,
    label: 'Refresh',
    color: 'primary',
    variant: 'outlined'
  },
  add: {
    icon: AddIcon,
    label: 'Add',
    color: 'primary',
    variant: 'contained'
  },
  edit: {
    icon: EditIcon,
    label: 'Edit',
    color: 'secondary',
    variant: 'outlined',
    requiresSelection: true
  },
  delete: {
    icon: DeleteIcon,
    label: 'Delete',
    color: 'error',
    variant: 'outlined',
    requiresSelection: true
  },
  sync: {
    icon: SyncIcon,
    label: 'Sync',
    color: 'info',
    variant: 'outlined'
  },
  export: {
    icon: ExportIcon,
    label: 'Export',
    color: 'success',
    variant: 'outlined'
  },
  import: {
    icon: ImportIcon,
    label: 'Import',
    color: 'warning',
    variant: 'outlined'
  }
};

/**
 * Action Button Component with modern patterns
 */
const ActionButton = memo(({ 
  action, 
  config, 
  onClick, 
  disabled, 
  loading,
  size = 'medium',
  showLabel = true,
  ...props 
}) => {
  const Icon = config.icon;
  const isDisabled = disabled || loading;
  
  const button = (
    <Button
      startIcon={loading ? <CircularProgress size={16} /> : <Icon />}
      variant={config.variant}
      color={config.color}
      size={size}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    >
      {showLabel && config.label}
    </Button>
  );
  
  // Wrap disabled buttons with TooltipWrapper for proper event handling
  return isDisabled ? (
    <TooltipWrapper title={`${config.label} ${disabled ? '(Selection Required)' : '(Loading...)'}`}>
      {button}
    </TooltipWrapper>
  ) : (
    <Tooltip title={config.label}>
      {button}
    </Tooltip>
  );
});

ActionButton.displayName = 'ActionButton';

/**
 * Search Component with deferred value optimization
 */
const SearchInput = memo(({ 
  searchId,
  value, 
  onChange, 
  onClear, 
  placeholder = "Search...",
  disabled = false,
  size = 'small'
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isPending, startTransition] = useTransition();
  const deferredValue = useDeferredValue(localValue);
  
  const handleChange = useCallback((event) => {
    const newValue = event.target.value;
    setLocalValue(newValue);
    
    startTransition(() => {
      onChange?.(newValue);
    });
  }, [onChange]);
  
  const handleClear = useCallback(() => {
    setLocalValue('');
    startTransition(() => {
      onChange?.('');
      onClear?.();
    });
  }, [onChange, onClear]);
  
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onChange?.(localValue);
    }
  }, [onChange, localValue]);
  
  return (
    <TextField
      id={searchId}
      size={size}
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      disabled={disabled}
      sx={{ minWidth: 200, maxWidth: 300 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: localValue && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              edge="end"
              aria-label="clear search"
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        )
      }}
      aria-label="Search grid data"
    />
  );
});

SearchInput.displayName = 'SearchInput';

/**
 * BaseToolbar Component
 */
const BaseToolbar = memo(({
  // Core props
  id,
  searchId,
  config = {},
  customActions = [],
  
  // State props
  selectedCount = 0,
  searchQuery = '',
  loading = false,
  
  // Feature toggles
  enableSearch = true,
  enableActions = true,
  enableResponsive = true,
  
  // Event handlers
  onSearchChange,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onSync,
  onExport,
  onImport,
  onCustomAction,
  
  // Style props
  size = 'medium',
  variant = 'standard',
  spacing = 1,
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const toolbarId = useId();
  
  // Local state
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [isPending, startTransition] = useTransition();
  
  // Merge configuration with defaults
  const toolbarConfig = useMemo(() => ({
    showRefresh: true,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showSync: false,
    showExport: false,
    showImport: false,
    compact: isMobile,
    ...config
  }), [config, isMobile]);
  
  // Calculate which actions should be shown
  const availableActions = useMemo(() => {
    const actions = [];
    
    if (toolbarConfig.showRefresh) {
      actions.push({
        key: 'refresh',
        ...STANDARD_ACTIONS.refresh,
        onClick: onRefresh,
        disabled: loading
      });
    }
    
    if (toolbarConfig.showAdd) {
      actions.push({
        key: 'add',
        ...STANDARD_ACTIONS.add,
        onClick: onAdd,
        disabled: loading
      });
    }
    
    if (toolbarConfig.showEdit) {
      actions.push({
        key: 'edit',
        ...STANDARD_ACTIONS.edit,
        onClick: onEdit,
        disabled: loading || selectedCount !== 1
      });
    }
    
    if (toolbarConfig.showDelete) {
      actions.push({
        key: 'delete',
        ...STANDARD_ACTIONS.delete,
        onClick: onDelete,
        disabled: loading || selectedCount === 0
      });
    }
    
    if (toolbarConfig.showSync) {
      actions.push({
        key: 'sync',
        ...STANDARD_ACTIONS.sync,
        onClick: onSync,
        disabled: loading
      });
    }
    
    if (toolbarConfig.showExport) {
      actions.push({
        key: 'export',
        ...STANDARD_ACTIONS.export,
        onClick: onExport,
        disabled: loading
      });
    }
    
    if (toolbarConfig.showImport) {
      actions.push({
        key: 'import',
        ...STANDARD_ACTIONS.import,
        onClick: onImport,
        disabled: loading
      });
    }
    
    // Add custom actions
    customActions.forEach(action => {
      actions.push({
        ...action,
        disabled: action.disabled || loading
      });
    });
    
    return actions;
  }, [
    toolbarConfig, 
    onRefresh, 
    onAdd, 
    onEdit, 
    onDelete, 
    onSync, 
    onExport, 
    onImport,
    customActions,
    loading, 
    selectedCount
  ]);
  
  // Determine primary and overflow actions based on screen size
  const { primaryActions, overflowActions } = useMemo(() => {
    if (!enableResponsive || !isMobile) {
      return { primaryActions: availableActions, overflowActions: [] };
    }
    
    // On mobile, show only essential actions
    const essential = ['refresh', 'add'];
    const primary = availableActions.filter(action => essential.includes(action.key));
    const overflow = availableActions.filter(action => !essential.includes(action.key));
    
    return { primaryActions: primary, overflowActions: overflow };
  }, [availableActions, enableResponsive, isMobile]);
  
  // Event handlers
  const handleMoreMenuOpen = useCallback((event) => {
    setMoreMenuAnchor(event.currentTarget);
  }, []);
  
  const handleMoreMenuClose = useCallback(() => {
    setMoreMenuAnchor(null);
  }, []);
  
  const handleActionClick = useCallback((action) => {
    startTransition(() => {
      if (action.onClick) {
        action.onClick();
      } else if (onCustomAction) {
        onCustomAction(action.key, action);
      }
    });
    handleMoreMenuClose();
  }, [onCustomAction, handleMoreMenuClose]);
  
  return (
    <Box sx={{ 
      borderBottom: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      ...sx 
    }}>
      <Toolbar
        id={id || toolbarId}
        variant={toolbarConfig.compact ? "dense" : "regular"}
        sx={{
          minHeight: toolbarConfig.compact ? 48 : 64,
          px: spacing,
          gap: spacing,
          opacity: isPending ? 0.7 : 1,
          transition: 'opacity 0.2s ease'
        }}
      >
        {/* Left Section - Primary Actions */}
        <Box sx={{ display: 'flex', gap: spacing, alignItems: 'center' }}>
          {enableActions && primaryActions.map((action) => (
            <ActionButton
              key={action.key}
              action={action}
              config={action}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              loading={loading && action.key === 'refresh'}
              size={size}
              showLabel={!toolbarConfig.compact}
            />
          ))}
          
          {/* Selection indicator */}
          {selectedCount > 0 && (
            <Chip
              label={`${selectedCount} selected`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        
        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Right Section - Search and Settings */}
        <Box sx={{ display: 'flex', gap: spacing, alignItems: 'center' }}>
          {/* Search */}
          {enableSearch && (
            <SearchInput
              searchId={searchId}
              value={searchQuery}
              onChange={onSearchChange}
              disabled={loading}
              size={size}
            />
          )}
          
          {/* Overflow Menu */}
          {overflowActions.length > 0 && (
            <>
              <IconButton
                onClick={handleMoreMenuOpen}
                size={size}
                aria-label="More actions"
                aria-controls="toolbar-more-menu"
                aria-haspopup="true"
              >
                <Badge badgeContent={overflowActions.length} color="primary">
                  <MoreIcon />
                </Badge>
              </IconButton>
              
              <Menu
                id="toolbar-more-menu"
                anchorEl={moreMenuAnchor}
                open={Boolean(moreMenuAnchor)}
                onClose={handleMoreMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {overflowActions.map((action) => (
                  <MenuItem
                    key={action.key}
                    onClick={() => handleActionClick(action)}
                    disabled={action.disabled}
                  >
                    <ListItemIcon>
                      <action.icon />
                    </ListItemIcon>
                    <ListItemText primary={action.label} />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </Box>
  );
});

BaseToolbar.displayName = 'BaseToolbar';

export default BaseToolbar;