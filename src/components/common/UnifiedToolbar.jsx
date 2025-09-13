/**
 * Unified Grid Toolbar System
 * Base toolbar with inheritance pattern for consistent UI and functionality
 * 
 * @author Techno-ETL Team
 * @version 4.0.0
 */

import React, { useMemo } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Badge
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon,
  Inventory as InventoryIcon,
  SyncAlt as SyncAllIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

/**
 * Base Toolbar Action Class
 * Defines the structure and behavior of toolbar actions
 */
export class BaseToolbarAction {
  constructor(id, config = {}) {
    this.id = id;
    this.label = config.label || id;
    this.icon = config.icon || 'default';
    this.color = config.color || 'primary';
    this.variant = config.variant || 'outlined';
    this.enabled = config.enabled !== false;
    this.visible = config.visible !== false;
    this.tooltip = config.tooltip || this.label;
    this.badge = config.badge || null;
    this.onClick = config.onClick || (() => {});
  }

  /**
   * Render the action as a button
   */
  render(key, props = {}) {
    if (!this.visible) return null;

    const IconComponent = this.getIconComponent();
    
    const button = (
      <Button
        key={key}
        variant={this.variant}
        color={this.color}
        disabled={!this.enabled}
        onClick={this.onClick}
        startIcon={<IconComponent />}
        {...props}
      >
        {this.label}
      </Button>
    );

    if (this.badge) {
      return (
        <Badge key={key} badgeContent={this.badge} color="error">
          {button}
        </Badge>
      );
    }

    return this.tooltip ? (
      <Tooltip key={key} title={this.tooltip}>
        {button}
      </Tooltip>
    ) : button;
  }

  /**
   * Render as icon button for compact view
   */
  renderIcon(key, props = {}) {
    if (!this.visible) return null;

    const IconComponent = this.getIconComponent();
    
    const iconButton = (
      <IconButton
        key={key}
        color={this.color}
        disabled={!this.enabled}
        onClick={this.onClick}
        {...props}
      >
        <IconComponent />
      </IconButton>
    );

    if (this.badge) {
      return (
        <Badge key={key} badgeContent={this.badge} color="error">
          {iconButton}
        </Badge>
      );
    }

    return (
      <Tooltip key={key} title={this.tooltip}>
        {iconButton}
      </Tooltip>
    );
  }

  /**
   * Get the appropriate icon component
   */
  getIconComponent() {
    const iconMap = {
      refresh: RefreshIcon,
      search: SearchIcon,
      filter: FilterIcon,
      export: ExportIcon,
      add: AddIcon,
      edit: EditIcon,
      delete: DeleteIcon,
      sync: SyncIcon,
      upload: UploadIcon,
      settings: SettingsIcon,
      more: MoreIcon,
      inventory: InventoryIcon,
      sync_alt: SyncAllIcon,
      cloud_upload: CloudUploadIcon,
      default: SettingsIcon
    };

    return iconMap[this.icon] || iconMap.default;
  }
}

/**
 * Specialized toolbar actions for different grid types
 */
export class RefreshAction extends BaseToolbarAction {
  constructor(onRefresh, enabled = true) {
    super('refresh', {
      label: 'Refresh',
      icon: 'refresh',
      color: 'primary',
      tooltip: 'Refresh data',
      enabled,
      onClick: onRefresh
    });
  }
}

export class SearchAction extends BaseToolbarAction {
  constructor(onSearch, enabled = true) {
    super('search', {
      label: 'Search',
      icon: 'search',
      color: 'primary',
      tooltip: 'Search items',
      enabled,
      onClick: onSearch
    });
  }
}

export class ExportAction extends BaseToolbarAction {
  constructor(onExport, enabled = true) {
    super('export', {
      label: 'Export',
      icon: 'export',
      color: 'secondary',
      tooltip: 'Export data',
      enabled,
      onClick: onExport
    });
  }
}

export class SyncAction extends BaseToolbarAction {
  constructor(onSync, enabled = true, badge = null) {
    super('sync', {
      label: 'Sync',
      icon: 'sync',
      color: 'primary',
      tooltip: 'Sync selected items',
      enabled,
      badge,
      onClick: onSync
    });
  }
}

export class SyncStocksAction extends BaseToolbarAction {
  constructor(onSyncStocks, enabled = true) {
    super('syncStocks', {
      label: 'Sync Stocks',
      icon: 'inventory',
      color: 'warning',
      tooltip: 'Sync stock levels',
      enabled,
      onClick: onSyncStocks
    });
  }
}

export class SyncAllAction extends BaseToolbarAction {
  constructor(onSyncAll, enabled = true, badge = null) {
    super('syncAll', {
      label: 'Sync All',
      icon: 'sync_alt',
      color: 'error',
      tooltip: 'Sync all changes',
      enabled,
      badge,
      onClick: onSyncAll
    });
  }
}

export class AddAction extends BaseToolbarAction {
  constructor(onAdd, enabled = true) {
    super('add', {
      label: 'Add',
      icon: 'add',
      color: 'success',
      tooltip: 'Add new item',
      enabled,
      onClick: onAdd
    });
  }
}

export class ImportAction extends BaseToolbarAction {
  constructor(onImport, enabled = true) {
    super('import', {
      label: 'Import',
      icon: 'upload',
      color: 'info',
      tooltip: 'Import data',
      enabled,
      onClick: onImport
    });
  }
}

/**
 * Base Toolbar Class
 * Provides common toolbar functionality with inheritance
 */
export class BaseGridToolbar {
  constructor(config = {}) {
    this.config = {
      variant: 'standard', // standard, compact, minimal
      showLabels: true,
      groupActions: true,
      ...config
    };
    
    this.actions = [];
    this.menuActions = [];
  }

  /**
   * Add action to toolbar
   */
  addAction(action) {
    if (action instanceof BaseToolbarAction) {
      this.actions.push(action);
    }
    return this;
  }

  /**
   * Add multiple actions
   */
  addActions(actions) {
    actions.forEach(action => this.addAction(action));
    return this;
  }

  /**
   * Add action to overflow menu
   */
  addMenuAction(action) {
    if (action instanceof BaseToolbarAction) {
      this.menuActions.push(action);
    }
    return this;
  }

  /**
   * Get actions by group
   */
  getActionGroups() {
    if (!this.config.groupActions) {
      return [this.actions];
    }

    const groups = {
      primary: [],
      secondary: [],
      tertiary: []
    };

    this.actions.forEach(action => {
      switch (action.color) {
        case 'primary':
          groups.primary.push(action);
          break;
        case 'secondary':
        case 'info':
          groups.secondary.push(action);
          break;
        default:
          groups.tertiary.push(action);
      }
    });

    return Object.values(groups).filter(group => group.length > 0);
  }

  /**
   * Render toolbar
   */
  render(props = {}) {
    const { variant = this.config.variant, showLabels = this.config.showLabels } = props;
    const actionGroups = this.getActionGroups();

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          ...props.sx
        }}
      >
        {actionGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {groupIndex > 0 && <Divider orientation="vertical" flexItem />}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {group.map((action, actionIndex) => {
                const key = `${groupIndex}-${actionIndex}`;
                
                if (variant === 'compact' || !showLabels) {
                  return action.renderIcon(key);
                }
                
                return action.render(key);
              })}
            </Box>
          </React.Fragment>
        ))}
        
        {this.menuActions.length > 0 && this.renderOverflowMenu()}
      </Box>
    );
  }

  /**
   * Render overflow menu for additional actions
   */
  renderOverflowMenu() {
    return (
      <>
        <Divider orientation="vertical" flexItem />
        <OverflowMenu actions={this.menuActions} />
      </>
    );
  }
}

/**
 * Specialized Magento Toolbar
 */
export class MagentoGridToolbar extends BaseGridToolbar {
  constructor(config = {}) {
    super(config);
    this.setupMagentoActions(config.handlers || {});
  }

  setupMagentoActions(handlers) {
    // Primary actions
    if (handlers.onRefresh) {
      this.addAction(new RefreshAction(handlers.onRefresh));
    }
    
    if (handlers.onAdd) {
      this.addAction(new AddAction(handlers.onAdd));
    }
    
    if (handlers.onSync) {
      this.addAction(new SyncAction(handlers.onSync, true, handlers.syncBadge));
    }

    // Secondary actions
    if (handlers.onImport) {
      this.addAction(new ImportAction(handlers.onImport));
    }
    
    if (handlers.onExport) {
      this.addMenuAction(new ExportAction(handlers.onExport));
    }
  }
}

/**
 * Specialized MDM Toolbar
 */
export class MDMGridToolbar extends BaseGridToolbar {
  constructor(config = {}) {
    super(config);
    this.setupMDMActions(config.handlers || {});
  }

  setupMDMActions(handlers) {
    // Primary actions
    if (handlers.onRefresh) {
      this.addAction(new RefreshAction(handlers.onRefresh));
    }
    
    if (handlers.onSync) {
      this.addAction(new SyncAction(handlers.onSync, true, handlers.syncBadge));
    }
    
    if (handlers.onSyncStocks) {
      this.addAction(new SyncStocksAction(handlers.onSyncStocks, handlers.enableSyncStocks));
    }
    
    if (handlers.onSyncAll) {
      this.addAction(new SyncAllAction(handlers.onSyncAll, handlers.enableSyncAll, handlers.syncAllBadge));
    }

    // Menu actions
    if (handlers.onExport) {
      this.addMenuAction(new ExportAction(handlers.onExport));
    }
  }
}

/**
 * Overflow Menu Component
 */
const OverflowMenu = ({ actions }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => {
    action.onClick();
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {actions.map((action, index) => {
          const IconComponent = action.getIconComponent();
          
          return (
            <MenuItem
              key={index}
              onClick={() => handleMenuItemClick(action)}
              disabled={!action.enabled}
            >
              <ListItemIcon>
                <IconComponent fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={action.label} />
              {action.badge && (
                <Chip size="small" label={action.badge} color="error" />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

/**
 * Toolbar Factory
 * Creates appropriate toolbar based on grid type
 */
export class ToolbarFactory {
  static create(gridType, config = {}) {
    switch (gridType) {
      case 'magento':
        return new MagentoGridToolbar(config);
      case 'mdm':
        return new MDMGridToolbar(config);
      default:
        return new BaseGridToolbar(config);
    }
  }
}

/**
 * Hook for unified toolbar management
 */
export function useUnifiedToolbar(gridType, handlers = {}, config = {}) {
  const toolbar = useMemo(() => {
    return ToolbarFactory.create(gridType, { handlers, ...config });
  }, [gridType, handlers, config]);

  const renderToolbar = useMemo(() => {
    return (props = {}) => toolbar.render(props);
  }, [toolbar]);

  return {
    toolbar,
    renderToolbar,
    addAction: (action) => toolbar.addAction(action),
    addMenuAction: (action) => toolbar.addMenuAction(action)
  };
}