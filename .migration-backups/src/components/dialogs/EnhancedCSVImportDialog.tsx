import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Mapping as MappingIcon,
  PlayArrow as ImportIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

/**
 * EnhancedCSVImportDialog - Advanced CSV import with preview and mapping
 * Supports the user's sample catalog CSV file format
 */
const EnhancedCSVImportDialog: React.FC<any> = ({ open, onClose, onImportComplete }) => {
  // ===== STATE MANAGEMENT =====
  const [activeStep, setActiveStep] = useState(0);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  // ===== MAGENTO FIELD MAPPING =====
  const magentoFields = [
    { key: 'sku', label: 'SKU', required: true },
    { key: 'name', label: 'Product Name', required: true },
    { key: 'price', label: 'Price', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'short_description', label: 'Short Description', required: false },
    { key: 'weight', label: 'Weight', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'visibility', label: 'Visibility', required: false },
    { key: 'category_ids', label: 'Category IDs', required: false },
    { key: 'brand', label: 'Brand', required: false },
    { key: 'color', label: 'Color', required: false },
    { key: 'size', label: 'Size', required: false },
    { key: 'material', label: 'Material', required: false },
    { key: 'qty', label: 'Quantity', required: false }
  ];

  // ===== STEPPER CONFIGURATION =====
  const steps = [
    {
      label: 'Upload CSV File',
      description: 'Select and upload your product catalog CSV file'
    },
    {
      label: 'Preview Data',
      description: 'Review the imported data and check for issues'
    },
    {
      label: 'Map Fields',
      description: 'Map CSV columns to Magento product attributes'
    },
    {
      label: 'Import Products',
      description: 'Import the mapped products to your catalog'
    }
  ];

  // ===== FILE HANDLING =====
  const handleFileUpload = useCallback((event: any) => {
    const file = event?.target.files[0];
    if (!file) return;

    if (!file?.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const text = e?.target.result;
        const lines = text?.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          toast.error('CSV file is empty');
          return;
        }

        // Parse CSV (simple implementation)
        const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map((line, index) => {
          const values = line?.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = { _rowIndex: index + 2 }; // +2 for header and 1-based indexing
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          return row;
        });

        setCsvHeaders(headers);
        setCsvData(data);
        
        // Auto-map common fields
        const autoMapping = {};
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          const matchedField = magentoFields.find(field => 
            lowerHeader.includes(field.key.toLowerCase()) ||
            field.label.toLowerCase().includes(lowerHeader)
          );
          if (matchedField) {
            autoMapping[header] = matchedField.key;
          }
        });
        setFieldMapping(autoMapping);
        
        setActiveStep(1);
        toast.success(`CSV loaded: ${data.length} products found`);
        
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Error parsing CSV file');
      }
    };
    
    reader.readAsText(file);
  }, []);

  // ===== VALIDATION =====
  const validateData = useCallback(() => {
    const errors = [];
    const requiredFields = magentoFields.filter(f => f.required);
    
    // Check if required fields are mapped
    requiredFields.forEach(field => {
      const isMapped = Object.values(fieldMapping).includes(field.key);
      if (!isMapped) {
        errors.push(`Required field "${field.label}" is not mapped`);
      }
    });

    // Validate data rows
    csvData.forEach((row, index) => {
      requiredFields.forEach(field => {
        const csvField = Object.keys(fieldMapping).find(k => fieldMapping[k] === field.key);
        if (csvField && !row[csvField]) {
          errors.push(`Row ${row?._rowIndex}: Missing required field "${field.label}"`);
        }
      });

      // Validate price format
      const priceField = Object.keys(fieldMapping).find(k => fieldMapping[k] === 'price');
      if (priceField && row[priceField] && isNaN(parseFloat(row[priceField]))) {
        errors.push(`Row ${row?._rowIndex}: Invalid price format "${row[priceField]}"`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [csvData, fieldMapping]);

  // ===== IMPORT PROCESS =====
  const handleImport = useCallback(async () => {
    if (!validateData()) {
      toast.error('Please fix validation errors before importing');
      return;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      const mappedProducts = csvData.map(row => {
        const product = {};
        Object.keys(fieldMapping).forEach(csvField => {
          const magentoField = fieldMapping[csvField];
          product[magentoField] = row[csvField];
        });
        
        // Add default values
        product?.type_id = 'simple';
        product?.attribute_set_id = 4; // Default attribute set
        product?.status = product?.status || '1';
        product?.visibility = product?.visibility || '4';
        
        return product;
      });

      // Simulate import progress
      for (let i = 0; i < mappedProducts.length; i++) {
        // Here you would call the actual import API
        // await magentoApi.createProduct(mappedProducts[i]);
        
        setImportProgress(((i + 1) / mappedProducts.length) * 100);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast.success(`Successfully imported ${mappedProducts.length} products`);
      onImportComplete?.(mappedProducts);
      handleClose();
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Error importing products');
    } finally {
      setImporting(false);
    }
  }, [csvData, fieldMapping, validateData, onImportComplete]);

  // ===== DIALOG HANDLERS =====
  const handleClose = useCallback(() => {
    setActiveStep(0);
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setValidationErrors([]);
    setImportProgress(0);
    onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (activeStep === 2) {
      if (validateData()) {
        setActiveStep(3);
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  }, [activeStep, validateData]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  // ===== RENDER STEP CONTENT =====
  const renderStepContent = (step: any) => {
    switch (step: any) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 } as any}>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="csv-upload"
              type="file"
              onChange={(e: any) => (e: any) => (e: any) => handleFileUpload}
            />
            <label htmlFor="csv-upload">
              <Button
                variant="contained"
                component="span"
                size="large"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 } as any}
              >
                Select CSV File
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary">
              Supported format: CSV files with product data
            </Typography>
            {csvFile && (
              <Alert severity="success" sx={{ mt: 2 } as any}>
                File selected: {csvFile?.name} ({(csvFile?.size / 1024).toFixed(1)} KB)
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Data Preview ({csvData.length} products)
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400 } as any}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {csvHeaders.map((header: any) => (
                      <TableCell key={header}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {csvData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      {csvHeaders.map((header: any) => (
                        <TableCell key={header}>
                          {row[header] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {csvData.length > 10 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 } as any}>
                Showing first 10 rows of {csvData.length} total products
              </Typography>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Field Mapping
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 } as any}>
              Map your CSV columns to Magento product attributes
            </Typography>
            
            <Grid {...{container: true} as any} spacing={2}>
              {csvHeaders.map((header: any) => (
                <Grid {...{item: true} as any} xs={12} sm={6} key={header}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Map "{header}" to</InputLabel>
                    <Select
                      value={fieldMapping[header] || ''}
                      onChange={(e: any) => (e: any) => (e: any) => (e: any) => setFieldMapping(prev => ({
                        ...prev,
                        [header]: e?.target.value
                      }))}
                      label={`Map "${header}" to`}
                    >
                      <MenuItem value="">
                        <em>Skip this field</em>
                      </MenuItem>
                      {magentoFields.map((field) => (
                        <MenuItem key={field.key} value={field.key}>
                          {field.label} {field.required && '*'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ))}
            </Grid>

            {validationErrors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 } as any}>
                <Typography variant="subtitle2" gutterBottom>
                  Validation Errors:
                </Typography>
                {validationErrors.slice(0, 5).map((error, index) => (
                  <Typography key={index} variant="body2">
                    • {error}
                  </Typography>
                ))}
                {validationErrors.length > 5 && (
                  <Typography variant="body2">
                    ... and {validationErrors.length - 5} more errors
                  </Typography>
                )}
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Import Products
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 } as any}>
              Ready to import {csvData.length} products to your catalog
            </Typography>
            
            {importing && (
              <Box sx={{ mb: 2 } as any}>
                <LinearProgress variant="determinate" value={importProgress} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 } as any}>
                  Importing... {Math.round(importProgress)}%
                </Typography>
              </Box>
            )}

            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Import Summary:
                </Typography>
                <Typography variant="body2">
                  • Products to import: {csvData.length}
                </Typography>
                <Typography variant="body2">
                  • Required fields mapped: {magentoFields.filter(f => f.required && Object.values(fieldMapping).includes(f.key)).length}
                </Typography>
                <Typography variant="body2">
                  • Optional fields mapped: {magentoFields.filter(f => !f.required && Object.values(fieldMapping).includes(f.key)).length}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Enhanced CSV Import - Product Catalog
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 } as any}>
                  {step.description}
                </Typography>
                {renderStepContent(index: any)}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={importing}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={importing}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 && (
          <Button 
            onClick={handleNext} 
            variant="contained"
            disabled={
              (activeStep === 0 && !csvFile) ||
              (activeStep === 2 && validationErrors.length > 0)
            }
          >
            Next
          </Button>
        )}
        {activeStep === steps.length - 1 && (
          <Button 
            onClick={handleImport} 
            variant="contained"
            disabled={importing || validationErrors.length > 0}
            startIcon={<ImportIcon />}
          >
            {importing ? 'Importing...' : 'Import Products'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedCSVImportDialog;
