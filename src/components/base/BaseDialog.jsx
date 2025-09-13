/**
 * BaseDialog - Enhanced Dialog Component Foundation
 * Provides standardized modal behavior for all dialog components
 * Features: Consistent styling, accessibility, responsive design, form handling
 */

import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Slide,
  Fade,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';

// Enhanced components
import TooltipWrapper from '../common/TooltipWrapper';

// Transition components
const SlideTransition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FadeTransition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />;
});

/**
 * Enhanced BaseDialog Component
 * 
 * Provides a comprehensive foundation for all dialog components with:
 * - Consistent styling and behavior
 * - Responsive design and mobile optimization
 * - Form handling and validation
 * - Loading states and error handling
 * - Accessibility compliance
 * - Customizable actions and content
 */
const BaseDialog = forwardRef(({
  // Core props
  open = false,
  onClose,
  title = '',
  children,

  // Dialog configuration
  maxWidth = 'sm',
  fullWidth = true,
  fullScreen = false,
  disableEscapeKeyDown = false,
  disableBackdropClick = false,

  // Actions
  showActions = true,
  primaryAction = null,
  secondaryAction = null,
  customActions = [],
  
  // Primary action (Save/Submit)
  primaryLabel = 'Save',
  primaryIcon = <SaveIcon />,
  onPrimaryAction,
  primaryDisabled = false,
  primaryLoading = false,
  primaryColor = 'primary',
  primaryVariant = 'contained',

  // Secondary action (Cancel)
  secondaryLabel = 'Cancel',
  secondaryIcon = <CancelIcon />,
  onSecondaryAction,
  secondaryDisabled = false,
  secondaryColor = 'inherit',
  secondaryVariant = 'outlined',

  // State management
  loading = false,
  error = null,
  success = false,
  
  // Form handling
  formId = null,
  onSubmit,
  
  // Styling
  transition = 'slide', // 'slide', 'fade', 'none'
  sx = {},
  titleSx = {},
  contentSx = {},
  actionsSx = {},

  // Advanced features
  showCloseButton = true,
  preventClose = false,
  autoFocus = true,
  restoreFocus = true,

  // Accessibility
  ariaLabelledBy,
  ariaDescribedBy,

  ...otherProps
}, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Local state
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState(null);

  // Determine if dialog should be fullscreen on mobile
  const isFullScreen = fullScreen || isMobile;

  // Select transition component
  const TransitionComponent = transition === 'slide' ? SlideTransition : 
                             transition === 'fade' ? FadeTransition : 
                             undefined;

  // Handle close with prevention
  const handleClose = useCallback((event, reason) => {
    if (preventClose) return;
    if (disableBackdropClick && reason === 'backdropClick') return;
    if (disableEscapeKeyDown && reason === 'escapeKeyDown') return;
    
    onClose?.(event, reason);
  }, [onClose, preventClose, disableBackdropClick, disableEscapeKeyDown]);

  // Handle primary action
  const handlePrimaryAction = useCallback(async (event) => {
    if (primaryLoading || internalLoading) return;

    try {
      setInternalLoading(true);
      setInternalError(null);

      if (onPrimaryAction) {
        await onPrimaryAction(event);
      } else if (onSubmit && formId) {
        // Submit form if formId is provided
        const form = document.getElementById(formId);
        if (form) {
          form.requestSubmit();
        }
      }
    } catch (error) {
      console.error('BaseDialog: Primary action error:', error);
      setInternalError(error.message || 'An error occurred');
    } finally {
      setInternalLoading(false);
    }
  }, [onPrimaryAction, onSubmit, formId, primaryLoading, internalLoading]);

  // Handle secondary action
  const handleSecondaryAction = useCallback((event) => {
    if (onSecondaryAction) {
      onSecondaryAction(event);
    } else {
      handleClose(event, 'secondaryAction');
    }
  }, [onSecondaryAction, handleClose]);

  // Clear internal error when dialog opens
  useEffect(() => {
    if (open) {
      setInternalError(null);
    }
  }, [open]);

  // Imperative handle for ref
  useImperativeHandle(ref, () => ({
    close: () => handleClose(null, 'imperative'),
    submit: () => handlePrimaryAction(null),
    setLoading: setInternalLoading,
    setError: setInternalError,
    clearError: () => setInternalError(null)
  }), [handleClose, handlePrimaryAction]);

  // Determine loading state
  const isLoading = loading || internalLoading || primaryLoading;

  // Determine error state
  const currentError = error || internalError;

  // Render dialog title
  const renderTitle = () => {
    if (!title && !showCloseButton) return null;

    return (
      <DialogTitle
        id={ariaLabelledBy || `${title}-dialog-title`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          ...titleSx
        }}
      >
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        {showCloseButton && (
          <TooltipWrapper title="Close" disabled={preventClose}>
            <IconButton
              onClick={(e) => handleClose(e, 'closeButton')}
              disabled={preventClose}
              size="small"
              sx={{ ml: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </TooltipWrapper>
        )}
      </DialogTitle>
    );
  };

  // Render dialog content
  const renderContent = () => {
    return (
      <DialogContent
        sx={{
          position: 'relative',
          ...contentSx
        }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Error display */}
        {currentError && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setInternalError(null)}
          >
            {currentError}
          </Alert>
        )}

        {/* Success display */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Operation completed successfully
          </Alert>
        )}

        {/* Main content */}
        {children}
      </DialogContent>
    );
  };

  // Render dialog actions
  const renderActions = () => {
    if (!showActions) return null;

    // Use custom actions if provided
    if (customActions.length > 0) {
      return (
        <DialogActions sx={{ p: 2, pt: 1, ...actionsSx }}>
          {customActions.map((action, index) => (
            <Box key={index}>{action}</Box>
          ))}
        </DialogActions>
      );
    }

    // Use custom primary/secondary actions if provided
    if (primaryAction || secondaryAction) {
      return (
        <DialogActions sx={{ p: 2, pt: 1, ...actionsSx }}>
          {secondaryAction}
          {primaryAction}
        </DialogActions>
      );
    }

    // Default actions
    return (
      <DialogActions sx={{ p: 2, pt: 1, ...actionsSx }}>
        <Button
          onClick={handleSecondaryAction}
          disabled={secondaryDisabled || isLoading}
          color={secondaryColor}
          variant={secondaryVariant}
          startIcon={secondaryIcon}
        >
          {secondaryLabel}
        </Button>
        
        <Button
          onClick={handlePrimaryAction}
          disabled={primaryDisabled || isLoading}
          color={primaryColor}
          variant={primaryVariant}
          startIcon={isLoading ? <CircularProgress size={16} /> : primaryIcon}
          type={formId ? 'submit' : 'button'}
          form={formId}
        >
          {primaryLabel}
        </Button>
      </DialogActions>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isFullScreen}
      TransitionComponent={TransitionComponent}
      disableEscapeKeyDown={disableEscapeKeyDown}
      aria-labelledby={ariaLabelledBy || `${title}-dialog-title`}
      aria-describedby={ariaDescribedBy}
      sx={{
        '& .MuiDialog-paper': {
          minHeight: isFullScreen ? '100vh' : 'auto',
          ...sx
        }
      }}
      {...otherProps}
    >
      {renderTitle()}
      {renderContent()}
      {renderActions()}
    </Dialog>
  );
});

BaseDialog.displayName = 'BaseDialog';

BaseDialog.propTypes = {
  // Core props
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.node,

  // Dialog configuration
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  fullScreen: PropTypes.bool,
  disableEscapeKeyDown: PropTypes.bool,
  disableBackdropClick: PropTypes.bool,

  // Actions
  showActions: PropTypes.bool,
  primaryAction: PropTypes.node,
  secondaryAction: PropTypes.node,
  customActions: PropTypes.array,
  
  // Primary action
  primaryLabel: PropTypes.string,
  primaryIcon: PropTypes.node,
  onPrimaryAction: PropTypes.func,
  primaryDisabled: PropTypes.bool,
  primaryLoading: PropTypes.bool,
  primaryColor: PropTypes.string,
  primaryVariant: PropTypes.string,

  // Secondary action
  secondaryLabel: PropTypes.string,
  secondaryIcon: PropTypes.node,
  onSecondaryAction: PropTypes.func,
  secondaryDisabled: PropTypes.bool,
  secondaryColor: PropTypes.string,
  secondaryVariant: PropTypes.string,

  // State management
  loading: PropTypes.bool,
  error: PropTypes.string,
  success: PropTypes.bool,
  
  // Form handling
  formId: PropTypes.string,
  onSubmit: PropTypes.func,
  
  // Styling
  transition: PropTypes.oneOf(['slide', 'fade', 'none']),
  sx: PropTypes.object,
  titleSx: PropTypes.object,
  contentSx: PropTypes.object,
  actionsSx: PropTypes.object,

  // Advanced features
  showCloseButton: PropTypes.bool,
  preventClose: PropTypes.bool,
  autoFocus: PropTypes.bool,
  restoreFocus: PropTypes.bool,

  // Accessibility
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string
};

export default BaseDialog;