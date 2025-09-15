/**
 * BaseDialog - Modern React 18 Base Dialog Component
 *
 * Features:
 * - Standardized dialog patterns (add, edit, delete, confirm)
 * - Form validation and submission handling
 * - Loading states and error handling
 * - Accessibility compliant
 * - Responsive design
 * - Modern React patterns (memo, useCallback, useMemo, useId)
 * - TypeScript-ready interfaces
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useId,
  useTransition,
  memo,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Form validation utilities
import { validateField, validateForm } from '../../utils/formValidation';

/**
 * Transition component for dialog animations
 */
const SlideTransition = memo(React.forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
}));

/**
 * Dialog Header Component
 */
const DialogHeader = memo(({
  id,
  title,
  subtitle,
  onClose,
  showCloseButton = true,
  icon: Icon,
}) => (
  <DialogTitle
    id={id}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      pb: 1,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {Icon && <Icon color="primary" />}
      <Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>

    {showCloseButton && (
      <IconButton
        onClick={onClose}
        size="small"
        aria-label="close dialog"
        sx={{ color: 'text.secondary' }}
      >
        <CloseIcon />
      </IconButton>
    )}
  </DialogTitle>
));

DialogHeader.displayName = 'DialogHeader';

/**
 * Form Field Component with validation
 */
const FormField = memo(({
  field,
  value,
  onChange,
  error,
  disabled,
  required = false,
}) => {
  const fieldId = useId();

  const handleChange = useCallback((event) => {
    const newValue = event.target.value;

    onChange(field.key, newValue);
  }, [field.key, onChange]);

  return (
    <TextField
      id={fieldId}
      name={field.key}
      label={field.label}
      type={field.type || 'text'}
      value={value || ''}
      onChange={handleChange}
      error={!!error}
      helperText={error || field.helperText}
      disabled={disabled}
      required={required}
      fullWidth
      margin="normal"
      variant="outlined"
      multiline={field.multiline}
      rows={field.rows || 1}
      inputProps={{
        maxLength: field.maxLength,
        min: field.min,
        max: field.max,
        step: field.step,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&:hover fieldset': {
            borderColor: error ? 'error.main' : 'primary.main',
          },
        },
      }}
    />
  );
});

FormField.displayName = 'FormField';

/**
 * BaseDialog Component
 */
const BaseDialog = memo(({
  // Core props
  type = 'form', // 'add', 'edit', 'delete', 'confirm', 'form'
  open = false,
  onClose,
  onSubmit,

  // Content props
  title,
  subtitle,
  content,
  data = {},

  // Configuration
  config = {},
  fields = [],
  validationRules = {},

  // State props
  loading = false,
  error = null,

  // Style props
  maxWidth = 'sm',
  fullWidth = true,
  disableEscapeKeyDown = false,

  // Custom props
  children,
  ...props
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const dialogId = useId();
  const titleId = useId();

  // React 18 transitions
  const [isPending, startTransition] = useTransition();

  // Local state
  const [formData, setFormData] = useState(data);
  const [formErrors, setFormErrors] = useState({});
  const [localError, setLocalError] = useState(error);
  const [submitting, setSubmitting] = useState(false);

  // Dialog configuration based on type
  const dialogConfig = useMemo(() => {
    const configs = {
      add: {
        title: title || 'Add New Item',
        icon: SaveIcon,
        submitLabel: 'Add',
        submitColor: 'primary',
        submitVariant: 'contained',
      },
      edit: {
        title: title || 'Edit Item',
        icon: SaveIcon,
        submitLabel: 'Save Changes',
        submitColor: 'primary',
        submitVariant: 'contained',
      },
      delete: {
        title: title || 'Confirm Delete',
        icon: WarningIcon,
        submitLabel: 'Delete',
        submitColor: 'error',
        submitVariant: 'contained',
        dangerous: true,
      },
      confirm: {
        title: title || 'Confirm Action',
        icon: InfoIcon,
        submitLabel: 'Confirm',
        submitColor: 'primary',
        submitVariant: 'contained',
      },
      form: {
        title: title || 'Form',
        icon: SaveIcon,
        submitLabel: 'Submit',
        submitColor: 'primary',
        submitVariant: 'contained',
      },
    };

    return { ...configs[type], ...config };
  }, [type, title, config]);

  // Form field handlers
  const handleFieldChange = useCallback((fieldKey, value) => {
    startTransition(() => {
      setFormData(prev => ({ ...prev, [fieldKey]: value }));

      // Clear field error on change
      if (formErrors[fieldKey]) {
        setFormErrors(prev => ({ ...prev, [fieldKey]: null }));
      }
    });
  }, [formErrors]);

  // Form validation
  const validateFormData = useCallback(() => {
    const errors = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field.key];
      const rules = validationRules[field.key];

      if (rules) {
        const error = validateField(value, rules);

        if (error) {
          errors[field.key] = error;
          isValid = false;
        }
      }
    });

    setFormErrors(errors);

    return isValid;
  }, [formData, fields, validationRules]);

  // Submit handler
  const handleSubmit = useCallback(async (event) => {
    event?.preventDefault();

    if (type !== 'delete' && type !== 'confirm') {
      if (!validateFormData()) {
        return;
      }
    }

    setSubmitting(true);
    setLocalError(null);

    try {
      await onSubmit?.(formData, type);
      onClose?.();
    } catch (error) {
      console.error('Dialog submit error:', error);
      setLocalError(error.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }, [formData, type, validateFormData, onSubmit, onClose]);

  // Cancel handler
  const handleCancel = useCallback(() => {
    if (submitting) return;

    startTransition(() => {
      setFormData(data);
      setFormErrors({});
      setLocalError(null);
    });

    onClose?.();
  }, [submitting, data, onClose]);

  // Keyboard handlers
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Effects
  useEffect(() => {
    if (open) {
      setFormData(data);
      setFormErrors({});
      setLocalError(null);
      setSubmitting(false);
    }
  }, [open, data]);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  // Render content based on type
  const renderContent = () => {
    if (children) {
      return children;
    }

    if (content) {
      return (
        <Typography variant="body1" sx={{ mb: 2 }}>
          {content}
        </Typography>
      );
    }

    if (type === 'delete') {
      return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <WarningIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Are you sure you want to delete this item?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </Box>
      );
    }

    if (fields.length > 0) {
      return (
        <Box component="form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          {fields.map(field => (
            <FormField
              key={field.key}
              field={field}
              value={formData[field.key]}
              onChange={handleFieldChange}
              error={formErrors[field.key]}
              disabled={submitting}
              required={field.required}
            />
          ))}
        </Box>
      );
    }

    return null;
  };

  const isFormDisabled = submitting || loading;

  return (
    <Dialog
      {...props}
      open={open}
      onClose={handleCancel}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      disableEscapeKeyDown={disableEscapeKeyDown || submitting}
      TransitionComponent={SlideTransition}
      aria-labelledby={titleId}
      aria-describedby={dialogId}
      sx={{
        '& .MuiDialog-paper': {
          minHeight: '200px',
          opacity: isPending ? 0.7 : 1,
          transition: 'opacity 0.2s ease',
        },
      }}
    >
      {/* Header */}
      <DialogHeader
        id={titleId}
        title={dialogConfig.title}
        subtitle={subtitle}
        onClose={handleCancel}
        icon={dialogConfig.icon}
        showCloseButton={!submitting}
      />

      <Divider />

      {/* Content */}
      <DialogContent id={dialogId} sx={{ pt: 2 }}>
        {/* Error display */}
        {localError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {localError}
          </Alert>
        )}

        {/* Main content */}
        {renderContent()}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleCancel}
          disabled={isFormDisabled}
          startIcon={<CancelIcon />}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          variant={dialogConfig.submitVariant}
          color={dialogConfig.submitColor}
          disabled={isFormDisabled}
          startIcon={
            submitting ? (
              <CircularProgress size={16} />
            ) : (
              dialogConfig.dangerous ? <DeleteIcon /> : <SaveIcon />
            )
          }
        >
          {submitting ? 'Processing...' : dialogConfig.submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

BaseDialog.displayName = 'BaseDialog';

export default BaseDialog;
