import React, { useState, useCallback } from 'react';
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  Zoom,
  useTheme,
  Box
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  Sync as SyncIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Enhanced Floating Action Buttons Component
 * Provides floating action buttons with speed dial functionality
 */
const FloatingActionButtons = ({
  actions = {},
  selectedRows = [],
  isRTL = false,
  enableI18n = true,
  position = 'bottom-right',
  variant = 'speedDial', // 'speedDial' | 'individual'
  onAction
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Default actions configuration
  const defaultActions = {
    add: {
      icon: AddIcon,
      label: 'Add New',
      color: 'primary',
      enabled: true,
      priority: 1
    },
    edit: {
      icon: EditIcon,
      label: 'Edit Selected',
      color: 'secondary',
      enabled: (selectedRows) => selectedRows.length === 1,
      priority: 2
    },
    delete: {
      icon: DeleteIcon,
      label: 'Delete Selected',
      color: 'error',
      enabled: (selectedRows) => selectedRows.length > 0,
      priority: 3
    },
    export: {
      icon: ExportIcon,
      label: 'Export',
      color: 'info',
      enabled: true,
      priority: 4
    },
    sync: {
      icon: SyncIcon,
      label: 'Sync Data',
      color: 'warning',
      enabled: true,
      priority: 5
    },
    refresh: {
      icon: RefreshIcon,
      label: 'Refresh',
      color: 'success',
      enabled: true,
      priority: 6
    },
    settings: {
      icon: SettingsIcon,
      label: 'Settings',
      color: 'default',
      enabled: true,
      priority: 7
    }
  };

  // Merge with custom actions, ensuring icons are provided
  const allActions = Object.keys({ ...defaultActions, ...actions }).reduce((acc, key) => {
    const defaultAction = defaultActions[key] || {};
    const customAction = actions[key] || {};

    acc[key] = {
      ...defaultAction,
      ...customAction,
      // Ensure icon is always defined
      icon: customAction.icon || defaultAction.icon || MoreIcon,
      // Ensure label is always defined
      label: customAction.label || defaultAction.label || key
    };

    return acc;
  }, {});

  // Translation helper
  const translate = useCallback((key, fallback) => {
    return enableI18n ? t(`grid.floating.${key}`, fallback) : fallback;
  }, [enableI18n, t]);

  // Check if action should be enabled
  const isActionEnabled = useCallback((actionConfig as any) => {
    if (typeof actionConfig.enabled === 'function') {
      return actionConfig.enabled(selectedRows);
    }
    return actionConfig.enabled !== false;
  }, [selectedRows]);

  // Handle action click
  const handleActionClick = useCallback((actionKey, actionConfig) => {
    if (actionConfig.onClick) {
      actionConfig.onClick(selectedRows);
    } else if (onAction) {
      onAction(actionKey, selectedRows);
    }
    setSpeedDialOpen(false);
  }, [selectedRows, onAction]);

  // Get position styles
  const getPositionStyles = useCallback(() => {
    const baseStyles = {
      position: 'fixed',
      zIndex: theme.zIndex.speedDial
    };

    switch (position) {
      case 'bottom-right':
        return {
          ...baseStyles,
          bottom: 16,
          right: isRTL ? 'auto' : 16,
          left: isRTL ? 16 : 'auto'
        };
      case 'bottom-left':
        return {
          ...baseStyles,
          bottom: 16,
          left: isRTL ? 'auto' : 16,
          right: isRTL ? 16 : 'auto'
        };
      case 'top-right':
        return {
          ...baseStyles,
          top: 80,
          right: isRTL ? 'auto' : 16,
          left: isRTL ? 16 : 'auto'
        };
      case 'top-left':
        return {
          ...baseStyles,
          top: 80,
          left: isRTL ? 'auto' : 16,
          right: isRTL ? 16 : 'auto'
        };
      default:
        return {
          ...baseStyles,
          bottom: 16,
          right: isRTL ? 'auto' : 16,
          left: isRTL ? 16 : 'auto'
        };
    }
  }, [position, isRTL, theme.zIndex.speedDial]);

  // Filter and sort actions
  const enabledActions = Object.entries(allActions)
    .filter(([, actionConfig]) => isActionEnabled(actionConfig as any))
    .sort(([, a], [, b]) => (a.priority || 999) - (b.priority || 999));

  if (enabledActions.length === 0) return null;

  // Speed Dial variant
  if (variant === 'speedDial') {
    return (
      <SpeedDial
        ariaLabel="Grid Actions"
        sx={getPositionStyles()}
        icon={<SpeedDialIcon icon={<MoreIcon />} openIcon={<CloseIcon />} />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
        direction={position.includes('top') ? 'down' : 'up'}
        FabProps={{
          color: 'primary',
          size: 'medium'
        }}
      >
        {enabledActions.map(([actionKey, actionConfig]) => {
          const IconComponent = actionConfig.icon || MoreIcon;
          return (
            <SpeedDialAction
              key={actionKey}
              icon={<IconComponent />}
              tooltipTitle={translate(actionKey, actionConfig.label)}
              tooltipPlacement={isRTL ? 'right' : 'left'}
              onClick={() => handleActionClick(actionKey, actionConfig)}
              FabProps={{
                color: actionConfig.color || 'default',
                size: 'small'
              }}
            />
          );
        })}
      </SpeedDial>
    );
  }

  // Individual FABs variant
  return (
    <Box sx={getPositionStyles()}>
      {enabledActions.map(([actionKey, actionConfig], index) => {
        const IconComponent = actionConfig.icon || MoreIcon;
        const bottomOffset = index * 64; // Stack vertically
        
        return (
          <Zoom
            key={actionKey}
            in={true}
            timeout={200 + index * 100}
            style={{
              transitionDelay: `${index * 100}ms`
            }}
          >
            <Tooltip
              title={translate(actionKey, actionConfig.label)}
              placement={isRTL ? 'right' : 'left'}
            >
              <Fab
                color={actionConfig.color || 'primary'}
                size={index === 0 ? 'medium' : 'small'}
                onClick={() => handleActionClick(actionKey, actionConfig)}
                sx={{
                  position: 'absolute',
                  bottom: bottomOffset,
                  right: 0,
                  transition: theme.transitions.create(['transform', 'box-shadow'], {
                    duration: theme.transitions.duration.short
                  }),
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <IconComponent />
              </Fab>
            </Tooltip>
          </Zoom>
        );
      })}
    </Box>
  );
};

export default FloatingActionButtons;
