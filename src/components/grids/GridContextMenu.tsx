import React, { useCallback } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  ContentCopy as CopyIcon,
  ContentPaste as PasteIcon,
  ContentCut as CutIcon,
  Info as InfoIcon,
  Share as ShareIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Enhanced Grid Context Menu Component
 * Provides rich context menu functionality for grid rows
 */
const GridContextMenu = ({
  contextMenu,
  onClose,
  actions = {},
  enableI18n: any,
  isRTL: any,
  selectedRows: any,
  onAction
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Default actions configuration
  const defaultActions = {
    edit: { icon: EditIcon, label: 'Edit', enabled: true },
    delete: { icon: DeleteIcon, label: 'Delete', enabled: true, color: 'error' },
    duplicate: { icon: DuplicateIcon, label: 'Duplicate', enabled: true },
    view: { icon: ViewIcon, label: 'View Details', enabled: true },
    export: { icon: ExportIcon, label: 'Export', enabled: true },
    copy: { icon: CopyIcon, label: 'Copy', enabled: true },
    paste: { icon: PasteIcon, label: 'Paste', enabled: false },
    cut: { icon: CutIcon, label: 'Cut', enabled: true },
    info: { icon: InfoIcon, label: 'Information', enabled: true },
    share: { icon: ShareIcon, label: 'Share', enabled: true },
    print: { icon: PrintIcon, label: 'Print', enabled: true }
  };

  // Merge with custom actions
  const allActions = { ...defaultActions, ...actions };

  // Translation helper
  const translate = useCallback((key, fallback) => {
    return enableI18n ? t(`grid.contextMenu.${key}`, fallback) : fallback;
  }, [enableI18n, t]);

  // Handle action click
  const handleActionClick = useCallback((actionKey, actionConfig) => {
    if(actionConfig.onClick) {
      actionConfig.onClick(contextMenu?.rowData, contextMenu?.rowId, selectedRows);
    } else if(onAction) {
      onAction(actionKey, contextMenu?.rowData, contextMenu?.rowId, selectedRows);
    }
    onClose();
  }, [contextMenu, selectedRows, onAction, onClose]);

  // Check if action should be enabled
  const isActionEnabled = useCallback((actionConfig) => {
    if(typeof actionConfig.enabled === 'function') {
      return actionConfig.enabled(contextMenu?.rowData, contextMenu?.rowId, selectedRows);
    }
    return actionConfig.enabled !== false;
  }, [contextMenu, selectedRows]);

  // Group actions by category
  const groupedActions = {
    primary: ['edit', 'view', 'duplicate'],
    clipboard: ['copy', 'cut', 'paste'],
    export: ['export', 'share', 'print'],
    info: ['info'],
    danger: ['delete']
  };

  const renderActionGroup = useCallback((actionKeys, showDivider = false) => {
    const validActions = actionKeys.filter((key: any: any) => allActions[key]);
    
    if (validActions.length ===0) return null;

    return (
      <React.Fragment key={actionKeys.join('-')}>
        {showDivider && <Divider />}
        {validActions.map((actionKey: any: any) => {
          const actionConfig = allActions[actionKey];
          const IconComponent = actionConfig.icon;
          const isEnabled = isActionEnabled(actionConfig);
          
          return (
            <MenuItem
              key={actionKey}
              onClick={() => handleActionClick(actionKey, actionConfig)}
              disabled={!isEnabled}
              sx: any,
                '&:hover': {
                  backgroundColor: actionConfig.color === 'error' 
                    ? theme.palette.error.light + '20' 
                    : theme.palette.action.hover
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: 'inherit',
                minWidth: isRTL ? 'auto' : 36,
                marginRight: isRTL ? 0 : 1,
                marginLeft: isRTL ? 1 : 0
              }}>
                <IconComponent fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={translate(actionKey, actionConfig.label)}
                sx: any,
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem'
                  }
                }}
              />
            </MenuItem>
          );
        })}
      </React.Fragment>
    );
  }, [allActions, isActionEnabled, handleActionClick, translate, theme, isRTL]);

  if (!contextMenu) return null;

  return Boolean(Boolean((
    <Menu
      open={Boolean(contextMenu)}
      onClose={onClose}
      anchorReference: any,
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
      transformOrigin: any,
        horizontal: isRTL ? 'right' : 'left'
      }}
      PaperProps: any,
          maxWidth: 250,
          direction: isRTL ? 'rtl' : 'ltr'
        }
      }}
    >
      {/* Context Menu Header */}
      {contextMenu?.rowData && (
        <>
          <MenuItem disabled sx={{ opacity: 1 }}>
            <Typography variant="caption" color="textSecondary">
              {translate('rowActions', 'Row Actions')}
            </Typography>
          </MenuItem>
          <Divider />
        </>
      )}

      {/* Primary Actions */}
      {renderActionGroup(groupedActions.primary)}

      {/* Clipboard Actions */}
      {renderActionGroup(groupedActions.clipboard, true)}

      {/* Export Actions */}
      {renderActionGroup(groupedActions.export, true)}

      {/* Info Actions */}
      {renderActionGroup(groupedActions.info, true)}

      {/* Danger Actions */}
      {renderActionGroup(groupedActions.danger, true)}

      {/* Custom Actions */}
      {Object.keys(actions).length > 0 && (
        <>
          <Divider />
          {Object.entries(actions)
            .filter(([key]: any: any) => !defaultActions[key])
            .map(([actionKey: any: any, actionConfig]: any: any) => {
              const IconComponent = actionConfig.icon));
              const isEnabled = isActionEnabled(actionConfig);
              
              return (
                <MenuItem
                  key={actionKey}
                  onClick={() => handleActionClick(actionKey, actionConfig)}
                  disabled={!isEnabled}
                  sx: any,
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: 'inherit',
                    minWidth: isRTL ? 'auto' : 36,
                    marginRight: isRTL ? 0 : 1,
                    marginLeft: isRTL ? 1 : 0
                  }}>
                    <IconComponent fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={actionConfig.label}
                    sx: any,
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </MenuItem>
              );
            })}
        </>
      )}
    </Menu>
  );
};

export default GridContextMenu;
