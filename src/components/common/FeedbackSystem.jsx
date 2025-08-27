/**
 * Comprehensive Feedback System with RTL Support
 * Provides success messages, confirmations, and user feedback
 * Includes animations and accessibility features
 */
import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Slide,
  Fade,
  Zoom,
  Chip,
  Stack,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CloudDone as SyncIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCustomTheme } from '../../contexts/ThemeContext';

// Enhanced Success Message Component
export const SuccessMessage = ({ 
  open, 
  message, 
  onClose, 
  autoHideDuration = 4000,
  action,
  showIcon = true,
  variant = 'filled',
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' }
}) => {
  const theme = useTheme();
  const { translate, currentLanguage, languages } = useLanguage();
  const { animations } = useCustomTheme();
  const isRTL = languages[currentLanguage]?.dir === 'rtl';

  const TransitionComponent = (props) => {
    return <Slide {...props} direction={isRTL ? "left" : "right"} />;
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      TransitionComponent={animations ? TransitionComponent : undefined}
    >
      <Alert
        onClose={onClose}
        severity="success"
        variant={variant}
        icon={showIcon ? <SuccessIcon /> : false}
        action={action}
        sx={{
          minWidth: 300,
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }
        }}
      >
        <Typography variant="body2">
          {message || translate('feedback.success.default')}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

// Settings-specific Success Feedback
export const SettingsSuccessFeedback = ({ 
  open, 
  operation = 'save',
  details,
  onClose,
  showDetails = false
}) => {
  const theme = useTheme();
  const { translate, currentLanguage, languages } = useLanguage();
  const { animations } = useCustomTheme();
  const isRTL = languages[currentLanguage]?.dir === 'rtl';

  const getOperationIcon = () => {
    switch (operation) {
      case 'save':
        return <SaveIcon sx={{ color: theme.palette.success.main }} />;
      case 'sync':
        return <SyncIcon sx={{ color: theme.palette.info.main }} />;
      case 'reset':
        return <RefreshIcon sx={{ color: theme.palette.warning.main }} />;
      case 'import':
        return <SettingsIcon sx={{ color: theme.palette.primary.main }} />;
      default:
        return <SuccessIcon sx={{ color: theme.palette.success.main }} />;
    }
  };

  const getOperationMessage = () => {
    switch (operation) {
      case 'save':
        return translate('feedback.settings.saved');
      case 'sync':
        return translate('feedback.settings.synced');
      case 'reset':
        return translate('feedback.settings.reset');
      case 'import':
        return translate('feedback.settings.imported');
      default:
        return translate('feedback.success.default');
    }
  };

  const TransitionComponent = (props) => {
    return <Zoom {...props} />;
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
      TransitionComponent={animations ? TransitionComponent : undefined}
    >
      <Alert
        onClose={onClose}
        severity="success"
        variant="filled"
        sx={{
          minWidth: 350,
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: showDetails ? 1 : 0 }}>
          {getOperationIcon()}
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {getOperationMessage()}
          </Typography>
        </Box>
        
        {showDetails && details && (
          <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
            {details}
          </Typography>
        )}
      </Alert>
    </Snackbar>
  );
};

// Confirmation Dialog Component
export const ConfirmationDialog = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  severity = 'warning',
  showIcon = true,
  maxWidth = 'sm',
  confirmColor = 'primary',
  additionalInfo
}) => {
  const theme = useTheme();
  const { translate } = useLanguage();
  const { animations } = useCustomTheme();

  const getSeverityIcon = () => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <SuccessIcon color="success" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const TransitionComponent = (props) => {
    return <Fade {...props} />;
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth={maxWidth}
      fullWidth
      TransitionComponent={animations ? TransitionComponent : undefined}
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: `2px solid ${theme.palette[severity].main}`,
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        {showIcon && getSeverityIcon()}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title || translate('feedback.confirmation.title')}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" sx={{ mb: additionalInfo ? 2 : 0 }}>
          {message || translate('feedback.confirmation.message')}
        </Typography>
        
        {additionalInfo && (
          <Alert severity={severity} sx={{ mt: 2 }}>
            <Typography variant="body2">
              {additionalInfo}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          size="large"
          sx={{ minWidth: 100 }}
        >
          {cancelText || translate('common.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          size="large"
          sx={{ minWidth: 100 }}
        >
          {confirmText || translate('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Progress Feedback Component
export const ProgressFeedback = ({
  open,
  title,
  message,
  progress,
  onCancel,
  showCancel = false,
  indeterminate = false
}) => {
  const theme = useTheme();
  const { translate } = useLanguage();
  const { animations } = useCustomTheme();

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={!showCancel}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1
        }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {title || translate('feedback.progress.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {message || translate('feedback.progress.message')}
          </Typography>
        </Box>

        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress
            variant={indeterminate ? "indeterminate" : "determinate"}
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                transition: animations ? 'transform 0.4s ease-in-out' : 'none'
              }
            }}
          />
          {!indeterminate && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {Math.round(progress)}%
            </Typography>
          )}
        </Box>

        {showCancel && (
          <Button
            onClick={onCancel}
            variant="outlined"
            size="small"
          >
            {translate('common.cancel')}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Multi-step Feedback Component
export const MultiStepFeedback = ({
  open,
  steps,
  currentStep,
  onClose,
  onCancel,
  title
}) => {
  const theme = useTheme();
  const { translate } = useLanguage();
  const { animations } = useCustomTheme();

  const getStepIcon = (step, index) => {
    if (index < currentStep) {
      return <SuccessIcon color="success" />;
    } else if (index === currentStep) {
      return step.icon || <InfoIcon color="primary" />;
    } else {
      return <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'grey.300' }} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: 400
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {title || translate('feedback.multiStep.title')}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ py: 2 }}>
          {steps.map((step, index) => (
            <Box
              key={step.id || index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: index === currentStep ? 
                  theme.palette.primary.light + '20' : 
                  'transparent',
                border: index === currentStep ? 
                  `2px solid ${theme.palette.primary.light}` : 
                  '2px solid transparent',
                transition: 'all 0.3s ease-in-out',
                opacity: index > currentStep ? 0.6 : 1
              }}
            >
              {getStepIcon(step, index)}
              
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: index <= currentStep ? 600 : 400,
                    color: index <= currentStep ? 'text.primary' : 'text.secondary'
                  }}
                >
                  {step.title}
                </Typography>
                {step.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {step.description}
                  </Typography>
                )}
              </Box>

              {index < currentStep && (
                <Chip
                  label={translate('feedback.multiStep.completed')}
                  color="success"
                  size="small"
                  variant="outlined"
                />
              )}
              
              {index === currentStep && (
                <Chip
                  label={translate('feedback.multiStep.inProgress')}
                  color="primary"
                  size="small"
                />
              )}
            </Box>
          ))}
        </Stack>
      </DialogContent>

      {onCancel && (
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={onCancel}
            variant="outlined"
            size="large"
          >
            {translate('common.cancel')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

// Hook for managing feedback state
export const useFeedback = () => {
  const [feedback, setFeedback] = useState({
    success: { open: false, message: '', operation: 'save' },
    confirmation: { open: false, title: '', message: '', onConfirm: null },
    progress: { open: false, title: '', message: '', progress: 0 },
    multiStep: { open: false, steps: [], currentStep: 0 }
  });

  const showSuccess = (message, operation = 'save', details = null) => {
    setFeedback(prev => ({
      ...prev,
      success: { open: true, message, operation, details }
    }));
  };

  const hideSuccess = () => {
    setFeedback(prev => ({
      ...prev,
      success: { ...prev.success, open: false }
    }));
  };

  const showConfirmation = (title, message, onConfirm, options = {}) => {
    setFeedback(prev => ({
      ...prev,
      confirmation: { 
        open: true, 
        title, 
        message, 
        onConfirm,
        ...options
      }
    }));
  };

  const hideConfirmation = () => {
    setFeedback(prev => ({
      ...prev,
      confirmation: { ...prev.confirmation, open: false, onConfirm: null }
    }));
  };

  const showProgress = (title, message, progress = 0) => {
    setFeedback(prev => ({
      ...prev,
      progress: { open: true, title, message, progress }
    }));
  };

  const updateProgress = (progress) => {
    setFeedback(prev => ({
      ...prev,
      progress: { ...prev.progress, progress }
    }));
  };

  const hideProgress = () => {
    setFeedback(prev => ({
      ...prev,
      progress: { ...prev.progress, open: false }
    }));
  };

  const showMultiStep = (steps, title) => {
    setFeedback(prev => ({
      ...prev,
      multiStep: { open: true, steps, currentStep: 0, title }
    }));
  };

  const updateMultiStep = (currentStep) => {
    setFeedback(prev => ({
      ...prev,
      multiStep: { ...prev.multiStep, currentStep }
    }));
  };

  const hideMultiStep = () => {
    setFeedback(prev => ({
      ...prev,
      multiStep: { ...prev.multiStep, open: false }
    }));
  };

  return {
    feedback,
    showSuccess,
    hideSuccess,
    showConfirmation,
    hideConfirmation,
    showProgress,
    updateProgress,
    hideProgress,
    showMultiStep,
    updateMultiStep,
    hideMultiStep
  };
};

export default {
  SuccessMessage,
  SettingsSuccessFeedback,
  ConfirmationDialog,
  ProgressFeedback,
  MultiStepFeedback,
  useFeedback
};