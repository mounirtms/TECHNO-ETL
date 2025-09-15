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
  TextField,
  Grid,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Settings as BatchIcon,
  Transform as ProcessIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  processCatalogToImportCSV,
  convertProductsToCSV,
  createBatchedCSVs,
  generateImportReport,
} from '../../utils/catalogProcessor';

const CatalogProcessorDialog = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [catalogFile, setCatalogFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [importReport, setImportReport] = useState(null);
  const [batchSize, setBatchSize] = useState(100);
  const [createBatches, setCreateBatches] = useState(true);
  const [selectedProductTypes, setSelectedProductTypes] = useState({
    simple: true,
    configurable: true,
  });

  const steps = ['Upload Catalog', 'Process Data', 'Review Results', 'Generate CSV'];

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setCatalogFile(file);
    setActiveStep(1);
    toast.success(`Loaded catalog file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  }, []);

  const handleProcessCatalog = useCallback(async () => {
    if (!catalogFile) return;

    setProcessing(true);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const csvContent = e.target.result;
          console.log('📁 Processing catalog file...');

          const processed = await processCatalogToImportCSV(csvContent, {
            includeSimple: selectedProductTypes.simple,
            includeConfigurable: selectedProductTypes.configurable
          });
          
          const report = generateImportReport(processed);

          setProcessedData(processed);
          setImportReport(report);
          setActiveStep(2);

          toast.success(`Successfully processed ${processed.statistics.total} products!`);
        } catch (error) {
          console.error('Processing error:', error);
          toast.error(`Processing failed: ${error.message}`);
        }
        setProcessing(false);
      };

      reader.readAsText(catalogFile);
    } catch (error) {
      console.error('File reading error:', error);
      toast.error(`Failed to read file: ${error.message}`);
      setProcessing(false);
    }
  }, [catalogFile, selectedProductTypes]);

  const handleDownloadCSV = useCallback(() => {
    if (!processedData) return;

    try {
      const csvContent = convertProductsToCSV(processedData.products);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `processed_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSV file downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download CSV: ${error.message}`);
    }
  }, [processedData]);

  const handleDownloadBatchedCSVs = useCallback(async () => {
    if (!processedData) return;

    try {
      const batches = createBatchedCSVs(processedData.products, batchSize);
      
      // Download each batch
      batches.forEach((batch, index) => {
        const csvContent = convertProductsToCSV(batch);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `catalog_batch_${index + 1}_of_${batches.length}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });

      toast.success(`Downloaded ${batches.length} batch files successfully!`);
    } catch (error) {
      console.error('Batch download error:', error);
      toast.error(`Failed to download batch files: ${error.message}`);
    }
  }, [processedData, batchSize]);

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setCatalogFile(null);
    setProcessedData(null);
    setImportReport(null);
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
    case 0:
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="catalog-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="catalog-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              size="large"
              sx={{ mb: 2 }}
            >
              Select Catalog CSV
            </Button>
          </label>
          <Typography variant="body2" color="text.secondary">
            Upload the export_catalog_product.csv file (20MB) to process all products
          </Typography>
          {catalogFile && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Selected: {catalogFile.name} ({(catalogFile.size / 1024 / 1024).toFixed(2)} MB)
            </Alert>
          )}
        </Box>
      );

    case 1:
      return (
        <Box sx={{ py: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Ready to process {catalogFile?.name} and extract all products with proper default values
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Parse all products from the catalog" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Extract valid brands, dimensions, and categories" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Apply proper default values for Magento import" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Validate and normalize all product data" />
            </ListItem>
          </List>

          <Card sx={{ mt: 2, p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Processing Options
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedProductTypes.simple}
                      onChange={(e) => setSelectedProductTypes(prev => ({
                        ...prev,
                        simple: e.target.checked
                      }))}
                    />
                  }
                  label="Include Simple Products"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedProductTypes.configurable}
                      onChange={(e) => setSelectedProductTypes(prev => ({
                        ...prev,
                        configurable: e.target.checked
                      }))}
                    />
                  }
                  label="Include Configurable Products"
                />
              </Grid>
            </Grid>
          </Card>

          {processing && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Processing catalog... This may take a few moments for large files.
              </Typography>
            </Box>
          )}
        </Box>
      );

    case 2:
      return importReport ? (
        <Box sx={{ py: 2 }}>
          {/* Processing Summary */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Processing Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Chip
                    icon={<CheckIcon />}
                    label={`${importReport.summary.totalProducts} Total Products`}
                    color="primary"
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={`${importReport.summary.simpleProducts} Simple`}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={`${importReport.summary.configurableProducts} Configurable`}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    icon={<InfoIcon />}
                    label={`${importReport.summary.uniqueBrands} Brands`}
                    color="info"
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Detailed Statistics */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Statistics
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Valid Products"
                    secondary={importReport.statistics.validProducts}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Skipped Products (Missing SKU)"
                    secondary={importReport.statistics.skippedProducts}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Unique Categories"
                    secondary={importReport.statistics.uniqueCategories}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Unique Brands"
                    secondary={importReport.statistics.uniqueBrands}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Warnings and Errors */}
          {importReport.warnings.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Warnings
                </Typography>
                <List dense>
                  {importReport.warnings.slice(0, 5).map((warning, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={warning} />
                    </ListItem>
                  ))}
                  {importReport.warnings.length > 5 && (
                    <ListItem>
                      <ListItemText primary={`+ ${importReport.warnings.length - 5} more warnings`} />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
          <Typography>No processing results available</Typography>
        </Box>
      );

    case 3:
      return (
        <Box sx={{ py: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Catalog processing completed successfully!
          </Alert>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Download Options
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadCSV}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Download Full CSV
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Single file with all {processedData?.statistics?.total || 0} products
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    startIcon={<BatchIcon />}
                    onClick={handleDownloadBatchedCSVs}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Download Batches
                  </Button>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      type="number"
                      label="Batch Size"
                      value={batchSize}
                      onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 100))}
                      size="small"
                      sx={{ width: 100 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      products per batch
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              The generated CSV files are ready for import into Magento. Make sure to follow the import sequence:
              Categories → Products → Images → Inventory
            </Typography>
          </Alert>
        </Box>
      );

    default:
      return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProcessIcon color="primary" />
          <Typography variant="h6">
            Catalog Processor
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>

      <DialogActions>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={processing}>
            Back
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={
              (activeStep === 0 && !catalogFile) ||
              (activeStep === 1 && processing)
            }
          >
            {activeStep === 1 ? 'Process Catalog' : 'Next'}
          </Button>
        ) : (
          <Button onClick={onClose} variant="contained">
            Finish
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CatalogProcessorDialog;