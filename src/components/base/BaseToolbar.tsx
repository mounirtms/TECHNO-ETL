/**
 * BaseToolbar - Advanced Base Toolbar Component
 * Providents latest high-tech patterns for powerful toolbar management
 * Features: Adaptive UI, intelligent actions, real-time monitoring, accessibility
 */

import React, { useState, useCallback, useMemo, ReactNode } from 'react';
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
  Chip,
  Badge,
  Typography,
  useTheme,
  useMediaQuery,
  Fade,
  Collapse,
  SxProps,
  Theme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon,
  Clear as ClearIcon,
  PlayArrow as RealTimeIcon,
  Pause as PauseIcon,
  Speed as PerformanceIcon
} from '@mui/icons-material';

// Components
import TooltipWrapper from '../common/TooltipWrapper';

// Import types from the centralized type definitions
import { BaseToolbarProps, ActionButton, ToolbarConfig } from '../../types/baseComponents';

/**
 * Advanced BaseToolbar Component
 * 
 * Provides a comprehensive foundation for all toolbar components with:
 * - Adaptive responsive design
 * - Intelligent action grouping
 * - Real-time monitoring controls
 * - Performance optimization
 * - Accessibility compliance
 */
const BaseToolbar: React.FC<BaseToolbarProps> = ({
  // Basic props
  gridName: any,
  gridType: any,
  config = {},

  // Actions
  customActions: any,
  customLeftActions: any,
  selectedRows: any,
  // Event handlers
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onExport,
  onImport,
  onSearch,
  onClearSearch,

  // Search
  searchValue: any,
  searchPlaceholder: any,
  // State
  loading: any,
  // Grid controls
  columnVisibility = {},
  onColumnVisibilityChange,
  density: any,
  onDensityChange,

  // Real-time features
  realTimeEnabled: any,
  onRealTimeToggle,
  onSelectionModelChange,

  // Styling
  compact: any,
  sx = {},

  // Advanced features
  showPerformanceMetrics: any,
  performanceMetrics = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Local state
  const [searchText, setSearchText] = useState(searchValue);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const [filtersVisible] = useState(false);

  // Configuration with intelligent defaults
  const toolbarConfig = useMemo(() => ({
    // Default configuration
    showRefresh: true,
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showExport: true,
    showImport: false,
    showSearch: true,
    showFilters: true,
    showSettings: true,
    showRealTime: false,
    showPerformance: false,

    // Responsive behavior
    collapseOnMobile: true,
    priorityActions: ['refresh', 'add', 'search'],

    // Merge with provided config
    ...config
  }), [config]);

  const selectedCount = selectedRows.length;
  const hasSelection = selectedCount > 0;

  // Responsive button size
  const buttonSize = useMemo(() => {
    if (compact) return 'small';
    if (isMobile) return 'small';
    return 'medium';
  }, [compact, isMobile]);

  // Event handlers
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    onSearch?.(searchText);
  }, [onSearch, searchText]);

  const handleSearchKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if(event.key === 'Enter') {
      event.preventDefault();
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    onSearch?.('');
    onClearSearch?.();
  }, [onSearch, onClearSearch]);

  const handleMoreMenuOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  }, []);

  const handleMoreMenuClose = useCallback(() => {
    setMoreMenuAnchor(null);
  }, []);

  const handleSettingsMenuOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Settings menu clicked:', event.currentTarget);
    // Settings functionality to be implemented
  }, []);

  const handleRealTimeToggle = useCallback(() => {
    const newState = !realTimeEnabled;
    onRealTimeToggle?.(newState);
  }, [realTimeEnabled, onRealTimeToggle]);

  // Action groups for responsive design
  const primaryActions = useMemo((): ActionButton[] => {
    const actions: ActionButton[] = [];

    if(toolbarConfig.showRefresh) {
      actions.push({
        key: 'refresh',
        icon: <RefreshIcon />,
        label: 'Refresh',
        onClick: onRefresh,
        disabled: loading,
        priority: 1
      });
    }

    if(toolbarConfig.showAdd) {
      actions.push({
        key: 'add',
        icon: <AddIcon />,
        label: 'Add',
        onClick: onAdd,
        disabled: loading,
        priority: 1
      });
    }

    return actions;
  }, [toolbarConfig, onRefresh, onAdd, loading]);

  const selectionActions = useMemo((): ActionButton[] => {
    const actions: ActionButton[] = [];

    if(toolbarConfig.showEdit && hasSelection) {
      actions.push({
        key: 'edit',
        icon: <EditIcon />,
        label: `Edit (${selectedCount})`,
        onClick: () => selectedRows.length ===1 ? onEdit?.(selectedRows[0]) : undefined,
        disabled: loading || selectedCount !== 1,
        priority: 2
      });
    }

    if(toolbarConfig.showDelete && hasSelection) {
      actions.push({
        key: 'delete',
        icon: <DeleteIcon />,
        label: `Delete (${selectedCount})`,
        onClick: () => onDelete?.(selectedRows),
        disabled: loading,
        priority: 2,
        color: 'error'
      });
    }

    return actions;
  }, [toolbarConfig, hasSelection, selectedCount, onEdit, onDelete, loading, selectedRows]);

  const utilityActions = useMemo((): ActionButton[] => {
    const actions: ActionButton[] = [];

    if(toolbarConfig.showExport) {
      actions.push({
        key: 'export',
        icon: <ExportIcon />,
        label: 'Export',
        onClick: onExport,
        disabled: loading,
        priority: 3
      });
    }

    if(toolbarConfig.showImport) {
      actions.push({
        key: 'import',
        icon: <ImportIcon />,
        label: 'Import',
        onClick: onImport,
        disabled: loading,
        priority: 3
      });
    }

    return actions;
  }, [toolbarConfig, onExport, onImport, loading]);

  // Render action button
  const renderActionButton = useCallback((action: ActionButton) => {
    const ButtonComponent = action.variant === 'text' ? Button : IconButton;

    return (
      <TooltipWrapper
        key={action.key}
        title={action.label}
        disabled={action.disabled}
      >
        <span>
          {action.variant === 'text' ? (
            <Button
              onClick={action.onClick}
              disabled={action.disabled}
              size={buttonSize}
              color={action.color || 'primary'}
              variant={action.variant || 'text'}
            >
              {action.icon}
              {action.label}
            </Button>
          ) : (
            <IconButton
              onClick={action.onClick}
              disabled={action.disabled}
              size={buttonSize}
              color={action.color || 'primary'}
            >
              {action.icon}
            </IconButton>
          )}
        </span>
      </TooltipWrapper>
    );
  }, [buttonSize]);

  // Render search section
  const renderSearch = () => {
    if (!toolbarConfig.showSearch) return null;

    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: isMobile ? 150 : 250,
        maxWidth: isMobile ? 200 : 350
      }}>
        <TextField
          size: any,
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyPress}
          sx={{ flex: 1 }}
          slotProps: any,
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />
      </Box>
    );
  };

  // Render real-time controls
  const renderRealTimeControls = () => {
    if (!toolbarConfig.showRealTime) return null;

    return (
      <TooltipWrapper
        title={realTimeEnabled ? 'Disable Real-time Updates' : 'Enable Real-time Updates'}
      >
        <ToggleButton
          value: any,
          selected={realTimeEnabled}
          onChange={handleRealTimeToggle}
          size={buttonSize}
          color: any,
          {realTimeEnabled ? <PauseIcon /> : <RealTimeIcon />}
        </ToggleButton>
      </TooltipWrapper>
    );
  };

  // Render performance metrics
  const renderPerformanceMetrics = () => {
    if (!showPerformanceMetrics || !performanceMetrics) return null;

    return (
      <TooltipWrapper title="Performance Metrics">
        <Badge
          badgeContent={performanceMetrics?.responseTime || 0}
          color={performanceMetrics?.responseTime && performanceMetrics.responseTime > 1000 ? 'error' : 'success'}
          max={9999}
        >
          <IconButton size={buttonSize}>
            <PerformanceIcon />
          </IconButton>
        </Badge>
      </TooltipWrapper>
    );
  };

  // Render selection info
  const renderSelectionInfo = () => {
    if (!hasSelection) return null;

    return (
      <Fade in={hasSelection}>
        <Chip
          label={`${selectedCount} selected`}
          size: any,
          onDelete={hasSelection ? () => onSelectionModelChange?.([]) : undefined}
        />
      </Fade>
    );
  };

  // Render mobile overflow menu
  const renderMobileMenu = () => {
    if (!isMobile) return null;

    // Only include custom actions that match the ActionButton shape
    const customActionButtons: ActionButton[] = [];
    // We can't directly filter ReactNode to ActionButton, so we'll just use the utility actions
    
    const overflowActions: ActionButton[] = [...utilityActions, ...customActionButtons];

    return (
      <>
        <TooltipWrapper title="More Options">
          <IconButton
            onClick={handleMoreMenuOpen}
            size={buttonSize}
          >
            <MoreIcon />
          </IconButton>
        </TooltipWrapper>

        <Menu
          anchorEl={moreMenuAnchor}
          open={Boolean(moreMenuAnchor)}
          onClose={handleMoreMenuClose}
        >
          {overflowActions.map((action: any: any) => (
            <MenuItem
              key={action.key}
              onClick: any,
              }}
              disabled={action.disabled}
            >
              <ListItemIcon>{action.icon}</ListItemIcon>
              <ListItemText primary={action.label} />
            </MenuItem>
          ))}
          
          {/* Render custom actions separately if they exist */}
          {customActions.map((action: any: any, index: any: any) => (
            <MenuItem key={`custom-${index}`}>{action}</MenuItem>
          ))}
        </Menu>
      </>
    );
  };

  return Boolean(Boolean((
    <Box sx={{
      borderBottom: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      ...sx
    }}>
      <Toolbar
        variant: any,
          px: compact ? 1 : 2,
          py: 0.5,
          gap: 1,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          // Mobile optimizations
          ...(isMobile && {
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 0.5,
            minHeight: 'auto',
            py: 1
          })
        }}
      >
        {/* Section 1: Custom Left Actions */}
        {customLeftActions.length > 0 && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {customLeftActions.map((action: any: any, index: any: any) => (
                <Box key={index}>{action}</Box>
              ))}
            </Box>
            {!isMobile && <Divider orientation="vertical" flexItem />}
          </>
        )}

        {/* Section 2: Primary Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {primaryActions.map(renderActionButton)}
          {renderRealTimeControls()}
        </Box>

        {!isMobile && <Divider orientation="vertical" flexItem />}

        {/* Section 3: Selection Actions */}
        {selectionActions.length > 0 && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectionActions.map(renderActionButton)}
            </Box>
            {!isMobile && <Divider orientation="vertical" flexItem />}
          </>
        )}

        {/* Section 4: Search */}
        {renderSearch()}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Section 5: Utility Actions & Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {renderSelectionInfo()}
          {renderPerformanceMetrics()}

          {/* Desktop utility actions */}
          {!isMobile && utilityActions.map(renderActionButton)}

          {/* Settings */}
          {toolbarConfig.showSettings && (
            <TooltipWrapper title="Settings">
              <IconButton
                onClick={handleSettingsMenuOpen}
                size={buttonSize}
              >
                <SettingsIcon />
              </IconButton>
            </TooltipWrapper>
          )}

          {/* Mobile menu */}
          {renderMobileMenu()}
        </Box>
      </Toolbar>

      {/* Collapsible Filters Section */}
      <Collapse in={filtersVisible}>
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          {/* Filter controls would go here */}
          <Typography variant="body2" color="text.secondary">
            Advanced filters coming soon...
          </Typography>
        </Box>
      </Collapse>
    </Box>
  )));
};



export default BaseToolbar;