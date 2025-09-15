import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  parseCSVContent,
  validateMagentoCSV,
  autoFixCSVIssues,
  separateProductTypes,
  generateImportSummary,
} from '../../utils/csvImportUtils';
import ProductService from '../../services/ProductService';

const CSVImportDialog = ({ open, onClose, onImportComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [separatedProducts, setSeparatedProducts] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResults, setImportResults] = useState(null);
  const [autoFix, setAutoFix] = useState(true);

  const steps = ['Upload CSV', 'Validate Data', 'Review & Import', 'Import Results'];

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');

      return;
    }

    setCsvFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const products = parseCSVContent(content);

        setCsvData(products);
        setActiveStep(1);
        toast.success(`Loaded ${products.length} products from CSV`);
      } catch (error) {
        toast.error(`Error parsing CSV: ${error.message}`);
      }
    };

    reader.readAsText(file);
  }, []);

  const handleValidation = useCallback(() => {
    if (csvData.length === 0) return;

    try {
      // Auto-fix common issues if enabled
      const dataToValidate = autoFix ? autoFixCSVIssues(csvData) : csvData;

      // Validate the data
      const validation = validateMagentoCSV(dataToValidate);

      setValidationResult(validation);

      // Separate product types
      const separated = separateProductTypes(validation.validProducts);

      setSeparatedProducts(separated);

      // Generate summary
      const summary = generateImportSummary(validation, separated);

      setImportSummary(summary);

      setActiveStep(2);

      if (validation.isValid) {
        toast.success('CSV validation passed successfully');
      } else {
        toast.warning(`Validation completed with ${validation.errors.length} errors`);
      }
    } catch (error) {
      toast.error(`Validation error: ${error.message}`);
    }
  }, [csvData, autoFix]);

  const handleImport = useCallback(async () => {
    if (!separatedProducts || !validationResult.isValid) return;

    setImporting(true);
    setActiveStep(3);

    try {
      const results = {
        simple: { successful: 0, failed: 0, errors: [] },
        configurable: { successful: 0, failed: 0, errors: [] },
        total: { successful: 0, failed: 0, errors: [] },
      };

      const totalProducts = separatedProducts.simpleProducts.length +
                                separatedProducts.configurableProducts.length;
      let processedCount = 0;

      // Import simple products first
      if (separatedProducts.simpleProducts.length > 0) {
        const simpleResults = await ProductService.processBulkProducts(
          separatedProducts.simpleProducts.map(p => ProductService.transformToMagentoFormat(p)),
          (progress) => {
            setImportProgress({
              current: processedCount + progress.current,
              total: totalProducts,
              phase: 'Simple Products',
              ...progress,
            });
          },
        );

        results.simple = simpleResults;
        processedCount += separatedProducts.simpleProducts.length;
      }

      // Import configurable products
      if (separatedProducts.configurableProducts.length > 0) {
        for (const configurableProduct of separatedProducts.configurableProducts) {
          try {
            const result = await ProductService.processConfigurableProduct(configurableProduct);

            if (result.success) {
              results.configurable.successful++;
            } else {
              results.configurable.failed++;
              results.configurable.errors.push({
                sku: configurableProduct.sku,
                error: result.error,
              });
            }
          } catch (error) {
            results.configurable.failed++;
            results.configurable.errors.push({
              sku: configurableProduct.sku,
              error: error.message,
            });
          }

          processedCount++;
          setImportProgress({
            current: processedCount,
            total: totalProducts,
            phase: 'Configurable Products',
          });
        }
      }

      // Calculate totals
      results.total.successful = results.simple.successful + results.configurable.successful;
      results.total.failed = results.simple.failed + results.configurable.failed;
      results.total.errors = [...results.simple.errors, ...results.configurable.errors];

      setImportResults(results);

      if (results.total.successful > 0) {
        toast.success(`Successfully imported ${results.total.successful} products`);
        if (onImportComplete) {
          onImportComplete(results);
        }
      }

      if (results.total.failed > 0) {
        toast.warning(`${results.total.failed} products failed to import`);
      }

    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  }, [separatedProducts, validationResult, onImportComplete]);

  const handleClose = () => {
    if (!importing) {
      // Reset state
      setActiveStep(0);
      setCsvFile(null);
      setCsvData([]);
      setValidationResult(null);
      setSeparatedProducts(null);
      setImportSummary(null);
      setImportResults(null);
      setImportProgress({ current: 0, total: 0 });
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
    case 0:
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="csv-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              size="large"
              sx={{ mb: 2 }}
            >
                                Select CSV File
            </Button>
          </label>
          <Typography variant="body2" color="text.secondary">
                            Upload a CSV file with product data for Magento import
          </Typography>
          {csvFile && (
            <Alert severity="info" sx={{ mt: 2 }}>
                                Selected: {csvFile.name} ({csvData.length} products)
            </Alert>
          )}
        </Box>
      );

    case 1:
      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoFix}
                  onChange={(e) => setAutoFix(e.target.checked)}
                />
              }
              label="Auto-fix common issues"
            />
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
                            Ready to validate {csvData.length} products from {csvFile?.name}
          </Alert>

          <Typography variant="body2" color="text.secondary">
                            Validation will check for required fields, valid product types, and other Magento requirements.
          </Typography>
        </Box>
      );

    case 2:
      return validationResult && importSummary ? (
        <Box sx={{ py: 2 }}>
          {/* Validation Summary */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                                    Validation Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  icon={<CheckIcon />}
                  label={`${importSummary.validation.validProducts} Valid`}
                  color="success"
                  size="small"
                />
                {importSummary.validation.errorProducts > 0 && (
                  <Chip
                    icon={<ErrorIcon />}
                    label={`${importSummary.validation.errorProducts} Errors`}
                    color="error"
                    size="small"
                  />
                )}
                {importSummary.validation.warnings > 0 && (
                  <Chip
                    icon={<WarningIcon />}
                    label={`${importSummary.validation.warnings} Warnings`}
                    color="warning"
                    size="small"
                  />
                )}
              </Box>

              {/* Product Types */}
              <Typography variant="subtitle2" gutterBottom>
                                    Product Types:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={`${importSummary.productTypes.simple} Simple`} variant="outlined" size="small" />
                <Chip label={`${importSummary.productTypes.configurable} Configurable`} variant="outlined" size="small" />
                <Chip label={`${importSummary.productTypes.variations} Variations`} variant="outlined" size="small" />
              </Box>
            </CardContent>
          </Card>

          {/* Errors and Warnings */}
          {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                                        Issues Found
                </Typography>
                <List dense>
                  {validationResult.errors.slice(0, 10).map((error, index) => (
                    <ListItem key={index}>
                      <ErrorIcon color="error" sx={{ mr: 1 }} />
                      <ListItemText primary={error} />
                    </ListItem>
                  ))}
                  {validationResult.warnings.slice(0, 5).map((warning, index) => (
                    <ListItem key={index}>
                      <WarningIcon color="warning" sx={{ mr: 1 }} />
                      <ListItemText primary={warning} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {importSummary.recommendations.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                                        Recommendations
                </Typography>
                <List dense>
                  {importSummary.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <InfoIcon color="info" sx={{ mr: 1 }} />
                      <ListItemText primary={rec.message} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      ) : null;

    case 3:
      return (
        <Box sx={{ py: 2 }}>
          {importing ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                                    Importing Products...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {importProgress.phase}: {importProgress.current} / {importProgress.total}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(importProgress.current / importProgress.total) * 100}
                sx={{ mb: 2 }}
              />
            </Box>
          ) : importResults ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                                    Import Complete
              </Typography>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      icon={<CheckIcon />}
                      label={`${importResults.total.successful} Successful`}
                      color="success"
                    />
                    {importResults.total.failed > 0 && (
                      <Chip
                        icon={<ErrorIcon />}
                        label={`${importResults.total.failed} Failed`}
                        color="error"
                      />
                    )}
                  </Box>

                  {importResults.total.errors.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                                                    Failed Products:
                      </Typography>
                      <List dense>
                        {importResults.total.errors.slice(0, 10).map((error, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={error.sku}
                              secondary={error.error}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ) : null}
        </Box>
      );

    default:
      return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
                CSV Product Import
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={importing}>
          {importResults ? 'Close' : 'Cancel'}
        </Button>

        {activeStep === 1 && (
          <Button
            onClick={handleValidation}
            variant="contained"
            disabled={csvData.length === 0}
          >
                        Validate Data
          </Button>
        )}

        {activeStep === 2 && validationResult?.isValid && (
          <Button
            onClick={handleImport}
            variant="contained"
            color="primary"
          >
                        Start Import
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CSVImportDialog;
