import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  TextField, Box, Typography, IconButton, Tabs, Tab
} from '@mui/material';
import { Close, Save, Cancel } from '@mui/icons-material';

/**
 * Unified Edit Window Component
 * Provides a flexible, reusable edit dialog that can be customized by child components
 */
const UnifiedEditWindow = ({
  open,
  onClose,
  onSave,
  title,
  data,
  fields = [],
  customRenderer,
  customTabs,
  maxWidth = 'md',
  fullWidth = true,
  fullScreen = false,
  loading = false,
  saveButtonText = 'Save',
  cancelButtonText = 'Cancel',
  showTabs = false,
  children
}) => {
  const [formData, setFormData] = useState(data || {});
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState({});

  // Handle form field changes
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  }, [errors]);

  // Validate form data
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      if (field.validate && formData[field.name]) {
        const validationError = field.validate(formData[field.name]);
        if (validationError) {
          newErrors[field.name] = validationError;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, formData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      // Handle save error - could set a general error state
    }
  }, [formData, onSave, onClose, validateForm]);

  // Handle close
  const handleClose = useCallback(() => {
    setFormData(data || {});
    setErrors({});
    setActiveTab(0);
    onClose();
  }, [data, onClose]);

  // Default field renderer
  const renderField = useCallback((field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={field.disabled}
            multiline={field.multiline}
            rows={field.rows}
            margin="normal"
          />
        );
      
      case 'number':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={field.disabled}
            margin="normal"
          />
        );
      
      case 'textarea':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={field.disabled}
            multiline
            rows={field.rows || 4}
            margin="normal"
          />
        );
      
      case 'select':
        return (
          <TextField
            key={field.name}
            fullWidth
            select
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={field.disabled}
            margin="normal"
            SelectProps={{
              native: true
            }}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TextField>
        );
      
      default:
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={field.disabled}
            margin="normal"
          />
        );
    }
  }, [formData, errors, handleFieldChange]);

  // Render content based on customization options
  const renderContent = () => {
    // If custom renderer is provided, use it
    if (customRenderer) {
      return customRenderer({
        formData,
        setFormData,
        handleFieldChange,
        errors,
        setErrors
      });
    }
    
    // If children are provided, render them
    if (children) {
      return React.cloneElement(children, {
        formData,
        setFormData,
        handleFieldChange,
        errors,
        setErrors
      });
    }
    
    // Default field rendering
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        {fields.map(renderField)}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          minHeight: '400px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6">
          {title}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Tabs if enabled */}
      {showTabs && customTabs && (
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {customTabs.map((tab, index) => (
            <Tab key={index} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      )}

      <DialogContent sx={{ p: 3, minHeight: '300px' }}>
        {showTabs && customTabs ? (
          // Render tab content
          customTabs[activeTab]?.content({
            formData,
            setFormData,
            handleFieldChange,
            errors,
            setErrors,
            activeTab
          })
        ) : (
          // Render regular content
          renderContent()
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button 
          onClick={handleClose} 
          startIcon={<Cancel />}
          disabled={loading}
        >
          {cancelButtonText}
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          startIcon={<Save />}
          disabled={loading}
        >
          {saveButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnifiedEditWindow;
