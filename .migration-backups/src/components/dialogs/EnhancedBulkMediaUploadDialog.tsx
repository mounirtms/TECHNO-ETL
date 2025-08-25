import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Badge,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as CSVIcon,
  Image as ImageIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Visibility as PreviewIcon,
  Settings as SettingsIcon,
  Transform as ProcessIcon,
  PhotoSizeSelectActual as ResizeIcon,
  Speed as OptimizeIcon,
  ExpandMore as ExpandIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import enhancedMediaUploadService from '../../services/enhancedMediaUploadService';

/**
 * Enhanced Bulk Media Upload Dialog
 * Professional image processing with SKU matching, renaming, and resizing
 */
const EnhancedBulkMediaUploadDialog: React.FC<any> = ({ open, onClose, onComplete }) => {
  // ===== STATE MANAGEMENT =====
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  
  // File states
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [validationResults, setValidationResults] = useState(null);
  
  // Processing states
  const [matchingResults, setMatchingResults] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [processingStats, setProcessingStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Settings
  const [settings, setSettings] = useState({
    processImages: true,
    imageQuality: 90,
    targetSize: 1200,
    batchSize: 3,
    delayBetweenBatches: 2000,
    autoResize: true,
    preserveAspectRatio: true,
    backgroundColor: '#FFFFFF'
  });
  
  const fileInputRef = useRef(null);

  const steps = [
    'Upload CSV File',
    'Upload Images',
    'Review & Configure',
    'Process & Upload'
  ];

  // ===== CSV UPLOAD HANDLER =====
  const onCSVDrop = useCallback(async (acceptedFiles: any) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await enhancedMediaUploadService.parseCSVFile(file);
      setCsvFile(file);
      setCsvData(data);
      toast.success(`CSV parsed: ${data?.totalRows} products found`);
      setActiveStep(1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== IMAGE UPLOAD HANDLER =====
  const onImageDrop = useCallback(async (acceptedFiles: any) => {
    setLoading(true);
    
    try {
      // Validate all files
      const validation = await enhancedMediaUploadService.validateImageFiles(acceptedFiles: any);
      
      if (validation.invalid.length > 0) {
        const errorMessages = validation.invalid?.map(v => `${v.file?.name}: ${v.error}`);
        toast.error(`${validation.invalid.length} files rejected`);
        console.warn('Rejected files:', errorMessages);
      }
      
      if (validation.valid.length > 0) {
        const validFiles = validation.valid?.map(v => v.file);
        setImageFiles(prev => [...prev, ...validFiles]);
        setValidationResults(validation);
        toast.success(`${validation.valid.length} images added`);
      }
    } catch (error) {
      toast.error(`Validation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== MATCHING HANDLER =====
  const handleMatching = useCallback(() => {
    if (!csvData || imageFiles.length === 0) {
      toast.error('Please upload both CSV and images');
      return;
    }

    setLoading(true);
    try {
      const results = enhancedMediaUploadService.matchImagesWithCSV(csvData, imageFiles);
      setMatchingResults(results);
      setActiveStep(2);
      
      toast.success(
        `Matching complete: ${results?.stats.matched} matches for ${results?.stats?.uniqueProducts} products`
      );
    } catch (error) {
      toast.error(`Matching failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [csvData, imageFiles]);

  // ===== UPLOAD HANDLER =====
  const handleStartUpload = async () => {
    if (!matchingResults || matchingResults?.matches.length === 0) {
      toast.error('No matches to upload');
      return;
    }

    setActiveStep(3);
    setUploadProgress({ current: 0, total: matchingResults?.matches.length });

    try {
      const results = await enhancedMediaUploadService.bulkUploadImages(
        matchingResults?.matches,
        (progress: any) => setUploadProgress(progress: any),
        {
          processImages: settings.processImages,
          imageQuality: settings.imageQuality / 100,
          targetSize: settings.targetSize,
          batchSize: settings.batchSize,
          delayBetweenBatches: settings.delayBetweenBatches
        }
      );

      setUploadResults(results);
      
      // Generate statistics
      const stats = enhancedMediaUploadService.generateProcessingStats(results);
      setProcessingStats(stats);
      
      const successful = results.filter(r => r?.status === 'success').length;
      const failed = results.filter(r => r?.status === 'error').length;
      
      toast.success(`Upload complete: ${successful} successful, ${failed} failed`);
      
      if (onComplete) {
        onComplete(results);
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const handleReset = () => {
    setActiveStep(0);
    setActiveTab(0);
    setCsvFile(null);
    setCsvData(null);
    setImageFiles([]);
    setValidationResults(null);
    setMatchingResults(null);
    setUploadProgress(null);
    setUploadResults(null);
    setProcessingStats(null);
  };

  const removeImage = (index: any) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setValidationResults(null);
  };

  const downloadResults = () => {
    if (!uploadResults) return;
    
    const data = uploadResults?.map(result => ({
      SKU: result?.sku,
      OriginalFileName: result.file?.name,
      ProcessedFileName: result.processedFileName,
      Status: result?.status,
      Message: result.result.message,
      OriginalSize: `${(result.originalSize / 1024 / 1024).toFixed(2)}MB`,
      ProcessedSize: `${(result.processedSize / 1024 / 1024).toFixed(2)}MB`
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data?.map(row => Object.values(row: any).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upload-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===== DROPZONE CONFIGURATIONS =====
  const csvDropzone = useDropzone({
    onDrop: onCSVDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    disabled: loading
  });

  const imageDropzone = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    disabled: loading
  });

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        position: 'relative'
      } as any}>
        <ProcessIcon />
        Professional Bulk Media Upload
        <Box sx={{ position: 'absolute', right: 16 } as any}>
          <IconButton 
            onClick={onClose} 
            sx={{ color: 'inherit' } as any}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 } as any}>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ p: 3 } as any}>
          {/* Step 1: CSV Upload */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Upload CSV File</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload a CSV file with SKU and image filename columns. Supports flexible column naming.
              </Typography>
              
              <Paper
                {...csvDropzone.getRootProps()}
                sx={{
                  p: 4,
                  border: '2px dashed',
                  borderColor: csvDropzone.isDragActive ? 'primary.main' : 'grey.300',
                  bgcolor: csvDropzone.isDragActive ? 'primary.light' : 'background.default',
                  cursor: 'pointer',
                  textAlign: 'center',
                  mt: 2,
                  transition: 'all 0.2s ease'
                } as any}
              >
                <input {...csvDropzone.getInputProps()} />
                <CSVIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 } as any} />
                <Typography variant="h6" gutterBottom>
                  {csvDropzone.isDragActive
                    ? 'Drop CSV file here...'
                    : 'Drag & drop CSV file here, or click to select'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported columns: SKU, Reference, Image Name, Product Name
                </Typography>
              </Paper>

              {csvFile && csvData && (
                <Alert severity="success" sx={{ mt: 2 } as any}>
                  <Typography variant="body2">
                    <strong>{csvFile?.name}</strong> - {csvData?.totalRows} products loaded
                  </Typography>
                  <Typography variant="caption" display="block">
                    SKU Column: {csvData?.skuColumn} | 
                    {csvData?.imageColumn && ` Image Column: ${csvData?.imageColumn} |`}
                    {csvData?.nameColumn && ` Name Column: ${csvData?.nameColumn}`}
                  </Typography>
                </Alert>
              )}
            </StepContent>
          </Step>

          {/* Step 2: Image Upload */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Upload Images</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload raw product images. Supports reference_1.jpg, reference_2.jpg naming patterns.
              </Typography>
              
              <Paper
                {...imageDropzone.getRootProps()}
                sx={{
                  p: 4,
                  border: '2px dashed',
                  borderColor: imageDropzone.isDragActive ? 'success.main' : 'grey.300',
                  bgcolor: imageDropzone.isDragActive ? 'success.light' : 'background.default',
                  cursor: 'pointer',
                  textAlign: 'center',
                  mt: 2,
                  transition: 'all 0.2s ease'
                } as any}
              >
                <input {...imageDropzone.getInputProps()} />
                <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 } as any} />
                <Typography variant="h6" gutterBottom>
                  {imageDropzone.isDragActive
                    ? 'Drop images here...'
                    : 'Drag & drop images here, or click to select multiple'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports: JPG, PNG, GIF, WebP | Max: 10MB per file
                </Typography>
              </Paper>

              {imageFiles.length > 0 && (
                <Box sx={{ mt: 3 } as any}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 } as any}>
                    <Typography variant="subtitle1">
                      Selected Images ({imageFiles.length})
                    </Typography>
                    {validationResults && (
                      <Typography variant="body2" color="text.secondary">
                        Total Size: {(validationResults?.totalSize / 1024 / 1024).toFixed(2)}MB
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 } as any}>
                    <Grid {...{container: true} as any} spacing={1}>
                      {imageFiles?.map((file, index) => (
                        <Grid {...{item: true} as any} key={index}>
                          <Chip
                            label={file?.name}
                            onDelete={() => removeImage(index: any)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 } as any}>
                    <Button
                      variant="contained"
                      onClick={handleMatching}
                      disabled={!csvData || imageFiles.length === 0 || loading}
                      startIcon={loading ? <RefreshIcon className="spin" /> : <ProcessIcon />}
                    >
                      {loading ? 'Processing...' : 'Match Images with CSV'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setImageFiles([])}
                      disabled={imageFiles.length === 0}
                    >
                      Clear All Images
                    </Button>
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>

          {/* Step 3: Review & Configure */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Review & Configure</Typography>
            </StepLabel>
            <StepContent>
              {matchingResults && (
                <Box>
                  {/* Statistics Cards */}
                  <Grid {...{container: true} as any} spacing={2} sx={{ mb: 3 } as any}>
                    <Grid {...{item: true} as any} xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'success.light' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <SuccessIcon sx={{ fontSize: 32, color: 'success.main' } as any} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' } as any}>
                            {matchingResults?.stats.matched}
                          </Typography>
                          <Typography variant="caption">Matched Images</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid {...{item: true} as any} xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'info.light' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <InfoIcon sx={{ fontSize: 32, color: 'info.main' } as any} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' } as any}>
                            {matchingResults?.stats?.uniqueProducts}
                          </Typography>
                          <Typography variant="caption">Unique Products</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid {...{item: true} as any} xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'warning.light' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <WarningIcon sx={{ fontSize: 32, color: 'warning.main' } as any} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' } as any}>
                            {matchingResults?.stats?.unmatchedCSV}
                          </Typography>
                          <Typography variant="caption">Unmatched CSV</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid {...{item: true} as any} xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'error.light' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <ErrorIcon sx={{ fontSize: 32, color: 'error.main' } as any} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' } as any}>
                            {matchingResults?.stats?.unmatchedImages}
                          </Typography>
                          <Typography variant="caption">Unmatched Images</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Tabs for detailed view */}
                  <Paper sx={{ mb: 3 } as any}>
                    <Tabs value={activeTab} onChange={(e: any) => (e: any) => (e: any) => (e, v) => setActiveTab(v: any)}>
                      <Tab 
                        label={
                          <Badge badgeContent={matchingResults?.matches.length} color="success">
                            Matches
                          </Badge>
                        } 
                      />
                      <Tab label="Settings" />
                      {matchingResults?.stats?.unmatchedCSV > 0 && (
                        <Tab 
                          label={
                            <Badge badgeContent={matchingResults?.stats?.unmatchedCSV} color="warning">
                              Unmatched CSV
                            </Badge>
                          } 
                        />
                      )}
                    </Tabs>
                    
                    <Box sx={{ p: 2 } as any}>
                      {/* Matches Tab */}
                      {activeTab === 0 && (
                        <Box sx={{ maxHeight: 300, overflow: 'auto' } as any}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>SKU</TableCell>
                                  <TableCell>Product Name</TableCell>
                                  <TableCell>Image File</TableCell>
                                  <TableCell>Size</TableCell>
                                  <TableCell>Index</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {matchingResults?.matches.slice(0, 50)?.map((match, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{match?.sku}</TableCell>
                                    <TableCell>{match.productName || '-'}</TableCell>
                                    <TableCell>{match.file?.name}</TableCell>
                                    <TableCell>{(match.file.size / 1024 / 1024).toFixed(2)}MB</TableCell>
                                    <TableCell>
                                      {match.imageIndex + 1}/{match?.totalImages}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          {matchingResults?.matches.length > 50 && (
                            <Typography variant="caption" sx={{ p: 2, display: 'block', textAlign: 'center' } as any}>
                              ... and {matchingResults?.matches.length - 50} more matches
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Settings Tab */}
                      {activeTab === 1 && (
                        <Grid {...{container: true} as any} spacing={3}>
                          <Grid {...{item: true} as any} xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                              Image Processing
                            </Typography>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={settings.processImages}
                                  onChange={(e: any) => (e: any) => (e: any) => (e: any) => setSettings(prev => ({ ...prev, processImages: e.target.checked }))}
                                />
                              }
                              label="Enable image processing"
                            />
                            
                            {settings.processImages && (
                              <Box sx={{ mt: 2 } as any}>
                                <Typography variant="body2" gutterBottom>
                                  Target Size: {settings.targetSize}x{settings.targetSize}px
                                </Typography>
                                <Slider
                                  value={settings.targetSize}
                                  onChange={(e: any) => (e: any) => (e: any) => (e, v) => setSettings(prev => ({ ...prev, targetSize: v }))}
                                  min={800}
                                  max={2000}
                                  step={100}
                                  marks={[
                                    { value: 800, label: '800px' },
                                    { value: 1200, label: '1200px' },
                                    { value: 1600, label: '1600px' },
                                    { value: 2000, label: '2000px' }
                                  ]}
                                />
                                
                                <Typography variant="body2" gutterBottom sx={{ mt: 2 } as any}>
                                  Quality: {settings.imageQuality}%
                                </Typography>
                                <Slider
                                  value={settings.imageQuality}
                                  onChange={(e: any) => (e: any) => (e: any) => (e, v) => setSettings(prev => ({ ...prev, imageQuality: v }))}
                                  min={60}
                                  max={100}
                                  step={5}
                                  marks={[
                                    { value: 60, label: '60%' },
                                    { value: 80, label: '80%' },
                                    { value: 90, label: '90%' },
                                    { value: 100, label: '100%' }
                                  ]}
                                />
                              </Box>
                            )}
                          </Grid>
                          
                          <Grid {...{item: true} as any} xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                              Upload Settings
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              Batch Size: {settings.batchSize} concurrent uploads
                            </Typography>
                            <Slider
                              value={settings.batchSize}
                              onChange={(e: any) => (e: any) => (e: any) => (e, v) => setSettings(prev => ({ ...prev, batchSize: v }))}
                              min={1}
                              max={10}
                              step={1}
                              marks={[
                                { value: 1, label: '1' },
                                { value: 3, label: '3' },
                                { value: 5, label: '5' },
                                { value: 10, label: '10' }
                              ]}
                            />
                            
                            <Typography variant="body2" gutterBottom sx={{ mt: 2 } as any}>
                              Delay: {settings.delayBetweenBatches}ms between batches
                            </Typography>
                            <Slider
                              value={settings.delayBetweenBatches}
                              onChange={(e: any) => (e: any) => (e: any) => (e, v) => setSettings(prev => ({ ...prev, delayBetweenBatches: v }))}
                              min={500}
                              max={5000}
                              step={500}
                              marks={[
                                { value: 500, label: '0.5s' },
                                { value: 2000, label: '2s' },
                                { value: 5000, label: '5s' }
                              ]}
                            />
                          </Grid>
                        </Grid>
                      )}

                      {/* Unmatched CSV Tab */}
                      {activeTab === 2 && matchingResults?.unmatched.csvRows.length > 0 && (
                        <Box sx={{ maxHeight: 300, overflow: 'auto' } as any}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Products without matching images:
                          </Typography>
                          <List dense>
                            {matchingResults?.unmatched.csvRows?.map((row, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <WarningIcon color="warning" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`${row?.sku} - ${row.productName || 'No name'}`}
                                  secondary={`Expected image: ${row.imageName || 'Not specified'}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>
                  </Paper>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartUpload}
                    disabled={matchingResults?.matches.length === 0}
                    startIcon={<UploadIcon />}
                  >
                    Start Upload ({matchingResults?.matches.length} images)
                  </Button>
                </Box>
              )}
            </StepContent>
          </Step>

          {/* Step 4: Process & Upload */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Process & Upload</Typography>
            </StepLabel>
            <StepContent>
              {uploadProgress && (
                <Box sx={{ mb: 3 } as any}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 } as any}>
                    <Typography variant="body2">
                      Progress: {uploadProgress?.current} of {uploadProgress?.total}
                    </Typography>
                    <Typography variant="body2">
                      {((uploadProgress?.current / uploadProgress?.total) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(uploadProgress?.current / uploadProgress?.total) * 100}
                    sx={{ mb: 2, height: 8, borderRadius: 4 } as any}
                  />
                  {uploadProgress?.sku && (
                    <Box>
                      <Typography variant="body2" color="primary">
                        Current: {uploadProgress?.sku} - {uploadProgress?.fileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Stage: {uploadProgress?.stage || uploadProgress?.status}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {uploadResults && processingStats && (
                <Box>
                  <Alert severity="success" sx={{ mb: 3 } as any}>
                    <Typography variant="body1" gutterBottom>
                      Upload completed successfully!
                    </Typography>
                    <Typography variant="body2">
                      {processingStats?.successful} successful, {processingStats?.failed} failed
                      {processingStats?.compressionRatio > 0 && (
                        <> • {processingStats?.compressionRatio}% size reduction</>
                      )}
                    </Typography>
                  </Alert>

                  {/* Results Summary */}
                  <Grid {...{container: true} as any} spacing={2} sx={{ mb: 3 } as any}>
                    <Grid {...{item: true} as any} xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <Typography variant="h4" color="success.main">
                            {processingStats?.successful}
                          </Typography>
                          <Typography variant="caption">Successful</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid {...{item: true} as any} xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <Typography variant="h4" color="error.main">
                            {processingStats?.failed}
                          </Typography>
                          <Typography variant="caption">Failed</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid {...{item: true} as any} xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <Typography variant="h4" color="info.main">
                            {processingStats?.uniqueProducts}
                          </Typography>
                          <Typography variant="caption">Products</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid {...{item: true} as any} xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <Typography variant="h4" color="primary.main">
                            {processingStats?.averageImagesPerProduct}
                          </Typography>
                          <Typography variant="caption">Avg/Product</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 } as any}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={downloadResults}
                    >
                      Download Results CSV
                    </Button>
                  </Box>

                  {/* Detailed Results */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandIcon />}>
                      <Typography>View Detailed Results</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ maxHeight: 400, overflow: 'auto' } as any}>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Status</TableCell>
                                <TableCell>SKU</TableCell>
                                <TableCell>File</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Message</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {uploadResults?.map((result, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    {result?.status === 'success' ? (
                                      <SuccessIcon color="success" fontSize="small" />
                                    ) : (
                                      <ErrorIcon color="error" fontSize="small" />
                                    )}
                                  </TableCell>
                                  <TableCell>{result?.sku}</TableCell>
                                  <TableCell>{result.file?.name}</TableCell>
                                  <TableCell>
                                    {(result.originalSize / 1024 / 1024).toFixed(2)}MB
                                    {result.processedSize && result.processedSize !== result.originalSize && (
                                      <> → {(result.processedSize / 1024 / 1024).toFixed(2)}MB</>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="caption">
                                      {result.result.message}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )}
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'background.paper' } as any}>
        <Button onClick={onClose} disabled={loading}>
          {uploadResults ? 'Close' : 'Cancel'}
        </Button>
        {activeStep > 0 && !uploadResults && (
          <Button onClick={handleReset} color="secondary" disabled={loading}>
            Reset
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedBulkMediaUploadDialog;