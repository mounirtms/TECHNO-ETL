import React, { useState, useCallback, ReactNode } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  TextField, Box, Typography, IconButton, Tabs, Tab
} from '@mui/material';
import { Close, Save, Cancel } from '@mui/icons-material';

/**
 * Field configuration interface
 */
interface Field {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'email' | 'url';
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  validate?: (value) => string | undefined;
/**
 * Custom tab interface
 */
interface CustomTab {
  label: string;
  icon?: ReactNode;
  content: (props: {
    formData: Record<string, any>;
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    handleFieldChange: (fieldName: string, value) => void;
    errors: Record<string, string | null>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
    activeTab: number;
  }) => ReactNode;
/**
 * UnifiedEditWindow Props
 */
interface UnifiedEditWindowProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, any>) => Promise<void> | void;
  title: string;
  data?: Record<string, any>;
  fields?: Field[];
  customRenderer?: (props: {
    formData: Record<string, any>;
    handleFieldChange: (fieldName: string, value) => void;
    errors: Record<string, string | null>;
  }) => ReactNode;
  customTabs?: CustomTab[];
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  fullScreen?: boolean;
  loading?: boolean;
  saveButtonText?: string;
  cancelButtonText?: string;
  showTabs?: boolean;
  children?: ReactNode;
/**
 * Unified Edit Window Component
 * Provides a flexible, reusable edit dialog that can be customized by child components
 */
const UnifiedEditWindow: React.FC<UnifiedEditWindowProps> = ({
  open,
  onClose,
  onSave,
  title,
  data,
  fields
  customRenderer,
  customTabs,
  maxWidth
  fullWidth
  fullScreen
  loading
  saveButtonText
  cancelButtonText
  showTabs
  children
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(data || {});
  const [activeTab, setActiveTab] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string | null>>({});;

  // Handle form field changes
  const handleFieldChange = useCallback((fieldName: string, value) => {
    setFormData(prev => ({ ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field
    if(errors[fieldName]) {
      setErrors(prev => ({ ...prev,
        [fieldName]: null as unknown as string
      }));
  }, [errors]);

  // Validate form data
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach((field) => {
      if (field.required && (!formData[field.name] || formData[field.name].toString().trim() ==='')) {
        newErrors[field.name] = `${field.label} is required`;
      if(field.validate && formData[field.name]) {
        const validationError = field.validate(formData[field.name]);
        if(validationError) {
          newErrors[field.name] = validationError;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length ===0;
  }, [fields, formData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    try {
      await onSave(formData);
      onClose();
    } catch(error: any) {
      console.error('Save failed:', error);
      // Handle save error - could set a general error state
  }, [formData, onSave, onClose, validateForm]);

  // Handle close
  const handleClose = useCallback(() => {
    setFormData(data || {});
    setErrors({});
    setActiveTab(0);
    onClose();
  }, [data, onClose]);

  // Default field renderer
  const renderField = useCallback((field: Field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    
    switch(field.type) {
      case 'text':
      case 'email':
      case 'url':
        return(<TextField key={field.name}
            fullWidth
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => (e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, e.target.value)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={field.disabled}
            multiline={field.multiline}
            rows={field.rows}
            margin
            key={field.name}
            fullWidth
            label={field.label}
            type
            value={value}
            onChange={(e) => (e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={field.disabled}
            margin
            key={field.name}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => (e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, e.target.value)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={field.disabled}
            multiline
            rows={field.rows || 4}
            margin
            key={field.name}
            fullWidth
            select
            label={field.label}
            value={value}
            onChange={(e) => (e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, e.target.value)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={field.disabled}
            margin
            }}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TextField>
        );
      
      default:
        return(<TextField key={field.name}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => (e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, e.target.value)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={field.disabled}
            margin
  }, [formData, errors, handleFieldChange]);

  // Render content based on customization options
  const renderContent = (): ReactNode => {
    // If custom renderer is provided, use it
    if(customRenderer) {
      return customRenderer({
        formData,
        handleFieldChange,
        errors
      });
    // If children are provided, render them
    if(children) {
      if (React.isValidElement(children)) {
        return React.cloneElement(children, {
          formData,
          setFormData,
          handleFieldChange,
          errors,
          setErrors
        } as React.HTMLAttributes<HTMLElement>);
      return children;
    // Default field rendering
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        {fields.map(renderField)}
      </Box>
    );
  };

  return(<Dialog open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      aria-labelledby="unified-edit-window-title"
      PaperProps
      }}></
      <DialogTitle id
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
        <Typography variant="h6">
          {title}
        </Typography>
        <IconButton onClick={handleClose} size="small" aria-label="close"></
          <Close /></Close>
      </DialogTitle>

      {/* Tabs if enabled */}
      {showTabs && customTabs && (
        <Tabs value={activeTab} 
          onChange={(e) => (e: React.SyntheticEvent, newValue: number) => setActiveTab(newValue)}
          sx={{ display: "flex", borderBottom: 1, borderColor: 'divider' }}
        >
          {customTabs.map((tab, index) => (
            <Tab key={index} icon={tab.icon ? tab.icon as React.ReactElement : undefined} label={tab.label} />
          ))}
        </Tabs>
      )}

      <DialogContent sx={{ display: "flex", p: 3, minHeight: '300px' }}>
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

      <DialogActions sx={{ display: "flex", p: 2, borderTop: 1, borderColor: 'divider' }}></
        <Button 
          onClick={handleClose} 
          startIcon={<Cancel />}
          disabled={loading}
        >
          {cancelButtonText}
        </Button>
        <Button 
          onClick={handleSave} 
          variant="outlined"
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
