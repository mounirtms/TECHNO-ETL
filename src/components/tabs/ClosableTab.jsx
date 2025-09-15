/**
 * ClosableTab Component
 * Enhanced tab component with close functionality and visual feedback
 * 
 * Features:
 * - Close button with hover states
 * - Confirmation dialog for unsaved changes
 * - RTL support
 * - Accessibility compliance
 * - Visual feedback and animations
 * - Keyboard navigation support
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import {
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

// Enhanced components
import { useRTL } from '../../contexts/RTLContext';
import TooltipWrapper from '../common/TooltipWrapper';

// ===== STYLED COMPONENTS =====

const StyledTab = styled(Tab, {
  shouldForwardProp: (prop) => !['hasUnsavedChanges', 'isClosable', 'isRTL'].includes(prop)
})(({ theme, hasUnsavedChanges, isClosable, isRTL }) => ({
  position: 'relative',
  minHeight: 48,
  padding: theme.spacing(1, isClosable ? 6 : 2, 1, 2),
  transition: theme.transitions.create(['background-color', 'box-shadow', 'transform'], {
    duration: theme.transitions.duration.short
  }),
  
  // RTL support
  ...(isRTL && {
    padding: theme.spacing(1, 2, 1, isClosable ? 6 : 2)
  }),
  
  // Unsaved changes indicator
  ...(hasUnsavedChanges && {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 8,
      [isRTL ? 'right' : 'left']: 8,
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: theme.palette.warning.main,
      animation: 'pulse 2s infinite'
    }
  }),
  
  // Hover effects
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    transform: 'translateY(-1px)',
    
    '& .closable-tab-close-button': {
      opacity: 1,
      transform: 'scale(1)'
    }
  },
  
  // Selected state
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    
    '& .closable-tab-close-button': {
      opacity: 0.7
    }
  },
  
  // Focus state
  '&.Mui-focusVisible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2
  },
  
  // Animations
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.5 },
    '100%': { opacity: 1 }
  }
}));

const CloseButton = styled(IconButton, {
  shouldForwardProp: (prop) => !['isRTL'].includes(prop)
})(({ theme, isRTL }) => ({
  position: 'absolute',
  top: '50%',
  [isRTL ? 'left' : 'right']: 4,
  transform: 'translateY(-50%) scale(0.8)',
  opacity: 0,
  transition: theme.transitions.create(['opacity', 'transform', 'background-color'], {
    duration: theme.transitions.duration.short
  }),
  padding: 4,
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    transform: 'translateY(-50%) scale(1)',
    
    '& .MuiSvgIcon-root': {
      color: theme.palette.error.main
    }
  },
  
  '&:focus': {
    opacity: 1,
    transform: 'translateY(-50%) scale(1)'
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: 16,
    transition: theme.transitions.create('color', {
      duration: theme.transitions.duration.short
    })
  }
}));

const ConfirmationDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1)
  }
}));

// ===== MAIN COMPONENT =====

/**
 * ClosableTab Component
 * 
 * Enhanced tab with close functionality, unsaved changes detection,
 * and comprehensive accessibility support
 */
const ClosableTab = memo(({
  // Tab props
  label = '',
  value,
  icon,
  disabled = false,
  selected = false,
  
  // Close functionality
  closable = true,
  onClose,
  hasUnsavedChanges = false,
  confirmClose = false,
  confirmMessage = 'You have unsaved changes. Are you sure you want to close this tab?',
  confirmTitle = 'Unsaved Changes',
  
  // Visual props
  tooltip = '',
  maxWidth = 200,
  showFullTitle = false,
  
  // Event handlers
  onClick,
  onDoubleClick,
  onContextMenu,
  
  // Accessibility
  ariaLabel,
  ariaDescribedBy,
  
  // Advanced props
  closeButtonProps = {},
  tabProps = {},
  
  ...otherProps
}) => {
  const theme = useTheme();
  const { isRTL, rtlUtils } = useRTL();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tabRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Handle close button click
  const handleCloseClick = useCallback((event) => {
    event.stopPropagation();
    
    if (hasUnsavedChanges && confirmClose) {
      setConfirmDialogOpen(true);
    } else {
      onClose?.(value, event);
    }
  }, [hasUnsavedChanges, confirmClose, onClose, value]);

  // Handle confirmation dialog
  const handleConfirmClose = useCallback(() => {
    setConfirmDialogOpen(false);
    onClose?.(value);
  }, [onClose, value]);

  const handleCancelClose = useCallback(() => {
    setConfirmDialogOpen(false);
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Delete' || (event.key === 'w' && (event.ctrlKey || event.metaKey))) {
      event.preventDefault();
      if (closable && !disabled) {
        handleCloseClick(event);
      }
    }
  }, [closable, disabled, handleCloseClick]);

  // Handle mouse events
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Handle tab click
  const handleTabClick = useCallback((event) => {
    // Don't trigger tab selection if close button was clicked
    if (closeButtonRef.current?.contains(event.target)) {
      return;
    }
    onClick?.(event, value);
  }, [onClick, value]);

  // Truncate label if needed
  const displayLabel = useMemo(() => {
    if (showFullTitle || !maxWidth) return label;
    
    // Simple truncation - in a real app, you might want more sophisticated text measurement
    const maxChars = Math.floor(maxWidth / 8); // Rough estimate
    return label.length > maxChars ? `${label.substring(0, maxChars)}...` : label;
  }, [label, maxWidth, showFullTitle]);

  // Determine tooltip content
  const tooltipContent = useMemo(() => {
    if (tooltip) return tooltip;
    if (displayLabel !== label) return label;
    return '';
  }, [tooltip, displayLabel, label]);

  // Accessibility props
  const accessibilityProps = useMemo(() => ({
    'aria-label': ariaLabel || `${label} tab${hasUnsavedChanges ? ' (unsaved changes)' : ''}${closable ? ' (closable)' : ''}`,
    'aria-describedby': ariaDescribedBy,
    'aria-selected': selected,
    'role': 'tab',
    'tabIndex': selected ? 0 : -1
  }), [ariaLabel, label, hasUnsavedChanges, closable, ariaDescribedBy, selected]);

  // Render close button
  const renderCloseButton = () => {
    if (!closable || disabled) return null;

    return (
      <TooltipWrapper 
        title={hasUnsavedChanges ? 'Close tab (unsaved changes)' : 'Close tab'}
        placement={isRTL ? 'bottom-end' : 'bottom-start'}
      >
        <CloseButton
          ref={closeButtonRef}
          className="closable-tab-close-button"
          size="small"
          onClick={handleCloseClick}
          isRTL={isRTL}
          aria-label={`Close ${label} tab`}
          {...closeButtonProps}
        >
          <CloseIcon />
        </CloseButton>
      </TooltipWrapper>
    );
  };

  // Render confirmation dialog
  const renderConfirmationDialog = () => (
    <ConfirmationDialog
      open={confirmDialogOpen}
      onClose={handleCancelClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="close-confirmation-title"
      aria-describedby="close-confirmation-description"
    >
      <DialogTitle id="close-confirmation-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6">{confirmTitle}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography id="close-confirmation-description">
          {confirmMessage}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleCancelClose}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmClose}
          variant="contained"
          color="error"
          autoFocus
        >
          Close Tab
        </Button>
      </DialogActions>
    </ConfirmationDialog>
  );

  // Main tab content
  const tabContent = (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      minWidth: 0,
      ...rtlUtils.flexDirection('row')
    }}>
      {icon && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          ...rtlUtils.mirrorIcon()
        }}>
          {icon}
        </Box>
      )}
      
      <Typography
        variant="body2"
        sx={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...rtlUtils.textAlign('start')
        }}
      >
        {displayLabel}
      </Typography>
    </Box>
  );

  return (
    <>
      <TooltipWrapper
        title={tooltipContent}
        placement="bottom"
        disabled={!tooltipContent}
      >
        <StyledTab
          ref={tabRef}
          label={tabContent}
          value={value}
          disabled={disabled}
          hasUnsavedChanges={hasUnsavedChanges}
          isClosable={closable}
          isRTL={isRTL}
          onClick={handleTabClick}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
          onKeyDown={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...accessibilityProps}
          {...tabProps}
          {...otherProps}
        >
          {renderCloseButton()}
        </StyledTab>
      </TooltipWrapper>
      
      {renderConfirmationDialog()}
    </>
  );
});

ClosableTab.displayName = 'ClosableTab';

ClosableTab.propTypes = {
  // Tab props
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  selected: PropTypes.bool,
  
  // Close functionality
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  hasUnsavedChanges: PropTypes.bool,
  confirmClose: PropTypes.bool,
  confirmMessage: PropTypes.string,
  confirmTitle: PropTypes.string,
  
  // Visual props
  tooltip: PropTypes.string,
  maxWidth: PropTypes.number,
  showFullTitle: PropTypes.bool,
  
  // Event handlers
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onContextMenu: PropTypes.func,
  
  // Accessibility
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  
  // Advanced props
  closeButtonProps: PropTypes.object,
  tabProps: PropTypes.object
};

export default ClosableTab;