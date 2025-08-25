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
    Grid
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Download as DownloadIcon,
    Settings as BatchIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { 
    processCatalogToImportCSV,
    convertProductsToCSV,
    createBatchedCSVs,
    generateImportReport
} from '../../utils/catalogProcessor';

const CatalogProcessorDialog: React.FC<any> = ({ open, onClose, onProcessComplete }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [catalogFile, setCatalogFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [processedData, setProcessedData] = useState(null);
    const [importReport, setImportReport] = useState(null);
    const [batchSize, setBatchSize] = useState(100);
    const [createBatches, setCreateBatches] = useState(true);
    const [selectedProductTypes, setSelectedProductTypes] = useState({
        simple: true,
        configurable: true
    });

    const steps = ['Upload Catalog', 'Process Data', 'Review Results', 'Generate CSV'];

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file?..name.toLowerCase().endsWith('.csv')) {
            toast.error('Please select a CSV file');
            return;
        }

        setCatalogFile(file);
        setActiveStep(1);
        toast.success(`Loaded catalog file: ${file?..name} (${(file??.size / 1024 / 1024).toFixed(2)} MB)`);
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
                    
                    const processed = await processCatalogToImportCSV(csvContent);
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
            
            reader.onerror = () => {
                toast.error('Failed to read catalog file');
                setProcessing(false);
            };
            
            reader.readAsText(catalogFile);
            
        } catch (error) {
            toast.error(`Processing error: ${error.message}`);
            setProcessing(false);
        }
    }, [catalogFile]);

    const handleGenerateCSV = useCallback(() => {
        if (!processedData) return;

        try {
            // Filter products based on selection
            let productsToExport = [];
            
            if (selectedProductTypes.simple) {
                productsToExport.push(...processedData??.simpleProducts);
            }
            
            if (selectedProductTypes.configurable) {
                productsToExport.push(...processedData??.configurableProducts);
            }

            if (productsToExport.length === 0) {
                toast.warning('Please select at least one product type to export');
                return;
            }

            if (createBatches) {
                // Create batched CSV files
                const batches = createBatchedCSVs(productsToExport, batchSize);
                
                batches.forEach((batch, index) => {
                    const blob = new Blob([batch.csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `magento_import_batch_${batch.batchNumber}_products_${batch.startIndex + 1}-${batch.endIndex + 1}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                });
                
                toast.success(`Generated ${batches.length} batch files with ${productsToExport.length} products total`);
            } else {
                // Create single CSV file
                const csvContent = convertProductsToCSV(productsToExport);
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `magento_import_all_products_${productsToExport.length}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                toast.success(`Generated CSV file with ${productsToExport.length} products`);
            }

            setActiveStep(3);
            
            if (onProcessComplete) {
                onProcessComplete({
                    totalProducts: productsToExport.length,
                    batches: createBatches ? Math.ceil(productsToExport.length / batchSize) : 1,
                    processedData
                });
            }
            
        } catch (error) {
            toast.error(`CSV generation failed: ${error.message}`);
        }
    }, [processedData, selectedProductTypes, createBatches, batchSize, onProcessComplete]);

    const handleClose = () => {
        if (!processing) {
            // Reset state
            setActiveStep(0);
            setCatalogFile(null);
            setProcessedData(null);
            setImportReport(null);
            setProcessing(false);
            onClose();
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 } as any}>
                        <input
                            accept=".csv"
                            style={{ display: 'none' }}
                            id="catalog-upload"
                            type="file"
                            onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => handleFileUpload}
                        />
                        <label htmlFor="catalog-upload">
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<UploadIcon />}
                                size="large"
                                sx={{ mb: 2 } as any}
                            >
                                Select Catalog CSV
                            </Button>
                        </label>
                        <Typography variant="body2" color="text.secondary">
                            Upload the export_catalog_product.csv file (20MB) to process all products
                        </Typography>
                        {catalogFile && (
                            <Alert severity="info" sx={{ mt: 2 } as any}>
                                Selected: {catalogFile?..name} ({(catalogFile??.size / 1024 / 1024).toFixed(2)} MB)
                            </Alert>
                        )}
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ py: 2 } as any}>
                        <Alert severity="info" sx={{ mb: 2 } as any}>
                            Ready to process {catalogFile?..name} and extract all products with proper default values
                        </Alert>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 } as any}>
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
                        
                        {processing && (
                            <Box sx={{ mt: 2 } as any}>
                                <LinearProgress />
                                <Typography variant="body2" sx={{ mt: 1 } as any}>
                                    Processing catalog... This may take a few moments for large files.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                );

            case 2:
                return importReport ? (
                    <Box sx={{ py: 2 } as any}>
                        {/* Processing Summary */}
                        <Card sx={{ mb: 2 } as any}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Processing Summary
                                </Typography>
                                <Grid {...{container: true}} spacing={2}>
                                    <Grid {...{item: true}} xs={6}>
                                        <Chip 
                                            icon={<CheckIcon />} 
                                            label={`${importReport?.??.summary.totalProducts} Total Products`} 
                                            color="primary" 
                                            size="small" 
                                        />
                                    </Grid>
                                    <Grid {...{item: true}} xs={6}>
                                        <Chip 
                                            label={`${importReport?.??.summary??.simpleProducts} Simple`} 
                                            variant="outlined" 
                                            size="small" 
                                        />
                                    </Grid>
                                    <Grid {...{item: true}} xs={6}>
                                        <Chip 
                                            label={`${importReport?.??.summary??.configurableProducts} Configurable`} 
                                            variant="outlined" 
                                            size="small" 
                                        />
                                    </Grid>
                                    <Grid {...{item: true}} xs={6}>
                                        <Chip 
                                            label={`${importReport??.validation.totalBrands} Brands`} 
                                            variant="outlined" 
                                            size="small" 
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Export Options */}
                        <Card sx={{ mb: 2 } as any}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Export Options
                                </Typography>
                                
                                <Box sx={{ mb: 2 } as any}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Product Types:
                                    </Typography>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={selectedProductTypes.simple}
                                                onChange={(e) => (e as any) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setSelectedProductTypes(prev => ({
                                                    ...prev,
                                                    simple: e.target.checked
                                                }))}
                                            />
                                        }
                                        label={`Simple Products (${importReport?.??.summary??.simpleProducts})`}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={selectedProductTypes.configurable}
                                                onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setSelectedProductTypes(prev => ({
                                                    ...prev,
                                                    configurable: e.target.checked
                                                }))}
                                            />
                                        }
                                        label={`Configurable Products (${importReport?.??.summary??.configurableProducts})`}
                                    />
                                </Box>

                                <Box sx={{ mb: 2 } as any}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={createBatches}
                                                onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setCreateBatches(e.target.checked)}
                                            />
                                        }
                                        label="Create Batch Files"
                                    />
                                </Box>

                                {createBatches && (
                                    <TextField
                                        label="Batch Size"
                                        type="number"
                                        value={batchSize}
                                        onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setBatchSize(parseInt(e.target.value) || 100)}
                                        size="small"
                                        sx={{ width: 120 } as any}
                                        inputProps={{ min: 10, max: 500 }}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Recommendations */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Import Recommendations
                                </Typography>
                                <List dense>
                                    {importReport??.recommendations.map((rec, index) => (
                                        <ListItem key={index}>
                                            <InfoIcon color="info" sx={{ mr: 1 } as any} />
                                            <ListItemText primary={rec} />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Box>
                ) : null;

            case 3:
                return (
                    <Box sx={{ py: 2, textAlign: 'center' } as any}>
                        <CheckIcon color="success" sx={{ fontSize: 64, mb: 2 } as any} />
                        <Typography variant="h6" gutterBottom>
                            CSV Files Generated Successfully!
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Your import-ready CSV files have been downloaded. 
                            You can now import them into Magento using the admin panel or API.
                        </Typography>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Catalog CSV Processor
            </DialogTitle>
            
            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 3 } as any}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                
                {renderStepContent()}
            </DialogContent>
            
            <DialogActions>
                <Button onClick={handleClose} disabled={processing}>
                    {activeStep === 3 ? 'Close' : 'Cancel'}
                </Button>
                
                {activeStep === 1 && (
                    <Button 
                        onClick={handleProcessCatalog} 
                        variant="contained"
                        disabled={!catalogFile || processing}
                        startIcon={processing ? null : <BatchIcon />}
                    >
                        {processing ? 'Processing...' : 'Process Catalog'}
                    </Button>
                )}
                
                {activeStep === 2 && importReport && (
                    <Button 
                        onClick={handleGenerateCSV} 
                        variant="contained"
                        color="primary"
                        startIcon={<DownloadIcon />}
                    >
                        Generate CSV Files
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default CatalogProcessorDialog;
