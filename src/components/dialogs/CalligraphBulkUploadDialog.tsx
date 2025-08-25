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
  Info as InfoIcon,
  Assignment as RefIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import calligraphMediaUploadService from '../../services/calligraphMediaUploadService';

/**
 * Calligraph Bulk Upload Dialog
 * Specialized for Calligraph CSV structure with REF-based image matching
 */
const CalligraphBulkUploadDialog: React.FC<any> = ({ open, onClose, onComplete }) => {
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
    'Upload Calligraph CSV',
    'Upload Raw Images',
    'Review REF Matching',
    'Process & Upload'
  ];

  // ===== CSV UPLOAD HANDLER =====
  const onCSVDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await calligraphMediaUploadService.parseCalligraphCSV(file);
      setCsvFile(file);
      setCsvData(data);
      toast.success(`Calligraph CSV parsed: ${data.totalRows} products found`);
      setActiveStep(1);
    } catch(error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== IMAGE UPLOAD HANDLER =====
  const onImageDrop = useCallback(async (acceptedFiles) => {
    setLoading(true);
    
    try {
      // Validate all files
      const validation = await calligraphMediaUploadService.validateImageFiles(acceptedFiles);
      
      if(validation.invalid.length > 0) {
        const errorMessages = validation.invalid.map((v: any: any) => `${v.file.name}: ${v.error}`);
        toast.error(`${validation.invalid.length} files rejected`);
        console.warn('Rejected files:', errorMessages);
      }
      
      if(validation.valid.length > 0) {
        const validFiles = validation.valid.map((v: any: any) => v.file);
        setImageFiles(prev => [...prev, ...validFiles]);
        setValidationResults(validation);
        toast.success(`${validation.valid.length} raw images added`);
      }
    } catch(error: any) {
      toast.error(`Validation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== MATCHING HANDLER =====
  const handleMatching = useCallback(() => {
    if(!csvData || imageFiles.length ===0) {
      toast.error('Please upload both Calligraph CSV and raw images');
      return;
    }

    setLoading(true);
    try {
      const results = calligraphMediaUploadService.matchImagesWithCalligraphCSV(csvData, imageFiles);
      setMatchingResults(results);
      setActiveStep(2);
      
      toast.success(
        `REF matching complete: ${results.stats.matched} matches for ${results.stats.uniqueProducts} products`
      );
    } catch(error: any) {
      toast.error(`Matching failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [csvData, imageFiles]);

  // ===== UPLOAD HANDLER =====
  const handleStartUpload = async () => {
    if(!matchingResults || matchingResults.matches.length ===0) {
      toast.error('No matches to upload');
      return;
    }

    setActiveStep(3);
    setUploadProgress({ current: 0, total: matchingResults.matches.length });

    try {
      const results = await calligraphMediaUploadService.bulkUploadCalligraphImages(matchingResults.matches,
        (progress) => setUploadProgress(progress),
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
      const stats = calligraphMediaUploadService.generateProcessingStats(results);
      setProcessingStats(stats);
      
      const successful = results.filter((r: any: any) => r.status === 'success').length;
      const failed = results.filter((r: any: any) => r.status === 'error').length;
      
      toast.success(`Calligraph upload complete: ${successful} successful, ${failed} failed`);
      
      if(onComplete) {
        onComplete(results);
      }
    } catch(error: any) {
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

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i: any: any) => i !== index));
    setValidationResults(null);
  };

  const downloadResults = () => {
    if (!uploadResults) return;
    
    const data = uploadResults.map((result: any: any) => ({
      SKU: result.sku,
      REF: result.ref,
      OriginalFileName: result.file.name,
      FinalFileName: result.processedFileName,
      Status: result.status,
      MatchStrategy: result.matchStrategy,
      Message: result.result.message,
      OriginalSize: `${(result.originalSize / 1024 / 1024).toFixed(2)}MB`,
      ProcessedSize: `${(result.processedSize / 1024 / 1024).toFixed(2)}MB`,
      CompressionRatio: `${result.compressionRatio}%`
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map((row: any: any) => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calligraph-upload-results-${new Date().toISOString().split('T')[0]}.csv`;
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

  return Boolean(Boolean((
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth: any,
        sx: { minHeight: '80vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: 'success.main',
        color: 'success.contrastText',
        position: 'relative'
      } as any}>
        <RefIcon />
        Calligraph Professional Bulk Upload
        <Chip 
          label: any,
            color: 'success.contrastText',
            ml: 1
          } as any} 
        />
        <Box sx={{ position: 'absolute', right: 16 } as any}>
          <IconButton 
            onClick={onClose} 
            sx={{ color: 'inherit' } as any}
            size: any,
      <DialogContent dividers sx={{ p: 0 } as any}>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ p: 3 } as any}>
          {/* Step 1: Calligraph CSV Upload */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Upload Calligraph CSV</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload the Calligraph CSV file with SKU, REF, and image name columns.
              </Typography>
              
              <Paper
                { ...csvDropzone.getRootProps()}
                sx: any,
                  border: '2px dashed',
                  borderColor: csvDropzone.isDragActive ? 'success.main' : 'grey.300',
                  bgcolor: csvDropzone.isDragActive ? 'success.light' : 'background.default',
                  cursor: 'pointer',
                  textAlign: 'center',
                  mt: 2,
                  transition: 'all 0.2s ease'
                } as any}
              >
                <input { ...csvDropzone.getInputProps()} />
                <CSVIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 } as any} />
                <Typography variant="h6" gutterBottom>
                  {csvDropzone.isDragActive
                    ? 'Drop Calligraph CSV here...'
                    : 'Drag & drop Calligraph CSV file here, or click to select'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Required columns: sku, ref, image name (optional: name)
                </Typography>
              </Paper>

              {csvFile && csvData && (
                <Alert severity="success" sx={{ mt: 2 } as any}>
                  <Typography variant="body2">
                    <strong>{csvFile.name}</strong> - {csvData.totalRows} products loaded
                  </Typography>
                  <Typography variant="caption" display="block">
                    SKU Column: {csvData.skuColumn} | 
                    REF Column: {csvData.refColumn} |
                    {csvData.imageNameColumn && ` Image Name: ${csvData.imageNameColumn} |`}
                    {csvData.productNameColumn && ` Product Name: ${csvData.productNameColumn}`}
                  </Typography>
                </Alert>
              )}
            </StepContent>
          </Step>

          {/* Step 2: Raw Image Upload */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Upload Raw Images</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload raw product images with reference naming (e.g., 7203C_1.jpg, 7203C_2.jpg, 7203C.jpg).
              </Typography>
              
              <Paper
                { ...imageDropzone.getRootProps()}
                sx: any,
                  border: '2px dashed',
                  borderColor: imageDropzone.isDragActive ? 'primary.main' : 'grey.300',
                  bgcolor: imageDropzone.isDragActive ? 'primary.light' : 'background.default',
                  cursor: 'pointer',
                  textAlign: 'center',
                  mt: 2,
                  transition: 'all 0.2s ease'
                } as any}
              >
                <input { ...imageDropzone.getInputProps()} />
                <ImageIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 } as any} />
                <Typography variant="h6" gutterBottom>
                  {imageDropzone.isDragActive
                    ? 'Drop raw images here...'
                    : 'Drag & drop raw images here, or click to select multiple'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports: 7203C.jpg, 7203C_1.jpg, 7203C_2.jpg patterns | Max: 10MB per file
                </Typography>
              </Paper>

              {imageFiles.length > 0 && (
                <Box sx={{ mt: 3 } as any}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 } as any}>
                    <Typography variant="subtitle1">
                      Raw Images ({imageFiles.length})
                    </Typography>
                    {validationResults && (
                      <Typography variant="body2" color="text.secondary">
                        Total Size: {(validationResults?.totalSize / 1024 / 1024).toFixed(2)}MB
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 } as any}>
                    <Grid { ...{container: true}} spacing={1}>
                      {imageFiles.map((file: any: any, index: any: any) => (
                        <Grid item key={index}>
                          <Chip
                            label={file.name}
                            onDelete={() => removeImage(index)}
                            size: any,
                      ))}
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 } as any}>
                    <Button
                      variant: any,
                      onClick={handleMatching}
                      disabled={!csvData || imageFiles.length ===0 || loading}
                      startIcon={loading ? <RefreshIcon className="spin" /> : <RefIcon />}
                      color: any,
                      {loading ? 'Processing...' : 'Match with REF Column'}
                    </Button>
                    <Button
                      variant: any,
                      onClick={() => setImageFiles([])}
                      disabled={imageFiles.length ===0}
                    >
                      Clear All Images
                    </Button>
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>

          {/* Step 3: Review REF Matching */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Review REF Matching</Typography>
            </StepLabel>
            <StepContent>
              {matchingResults && (<Box>
                  {/* Enhanced Statistics Cards */}
                  <Grid { ...{container: true}} spacing={2} sx={{ mb: 3 } as any}>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'success.light' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <SuccessIcon sx={{ fontSize: 32, color: 'success.main' } as any} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' } as any}>
                            {matchingResults.stats.matched}
                          </Typography>
                          <Typography variant="caption">REF Matches</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'info.light' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <InfoIcon sx={{ fontSize: 32, color: 'info.main' } as any} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' } as any}>
                            {matchingResults.stats.uniqueProducts}
                          </Typography>
                          <Typography variant="caption">Products</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'warning.light' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <WarningIcon sx={{ fontSize: 32, color: 'warning.main' } as any} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' } as any}>
                            {matchingResults.stats.multipleImagesProducts}
                          </Typography>
                          <Typography variant="caption">Multi-Image</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'secondary.light' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <ProcessIcon sx={{ fontSize: 32, color: 'secondary.main' } as any} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' } as any}>
                            {matchingResults.stats.averageImagesPerProduct}
                          </Typography>
                          <Typography variant="caption">Avg/Product</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Match Strategy Breakdown */}
                  <Alert severity="info" sx={{ mb: 3 } as any}>
                    <Typography variant="body2">
                      <strong>Match Strategies:</strong> REF Column: {matchingResults.stats.matchStrategies.ref}, 
                      Image Name: {matchingResults.stats.matchStrategies.imageName}, 
                      Fuzzy: {matchingResults.stats.matchStrategies.fuzzy}
                    </Typography>
                  </Alert>

                  {/* Tabs for detailed view */}
                  <Paper sx={{ mb: 3 } as any}>
                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                      <Tab 
                        label: any,
                          <Badge badgeContent={matchingResults.matches.length} color="success">
                            REF Matches
                          </Badge>
                        } 
                      />
                      <Tab label="Processing Settings" />
                      {matchingResults.stats.unmatchedCSV > 0 && (
                        <Tab 
                          label: any,
                            <Badge badgeContent={matchingResults.stats.unmatchedCSV} color="warning">
                              Unmatched
                            </Badge>
                          } 
                        />
                      )}
                    </Tabs>
                    
                    <Box sx={{ p: 2 } as any}>
                      {/* REF Matches Tab */}
                      {activeTab ===0 && (
                        <Box sx={{ maxHeight: 300, overflow: 'auto' } as any}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>SKU</TableCell>
                                  <TableCell>REF</TableCell>
                                  <TableCell>Raw Image</TableCell>
                                  <TableCell>Final Name</TableCell>
                                  <TableCell>Strategy</TableCell>
                                  <TableCell>Size</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {matchingResults.matches.slice(0, 50).map((match: any: any, index: any: any) => (
                                  <TableRow key={index}>
                                    <TableCell>{match.sku}</TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={match.ref} 
                                        size: any,
                                    <TableCell>{match.file.name}</TableCell>
                                    <TableCell>{match.finalImageName}</TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={match.matchStrategy} 
                                        size: any,
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>{(match.file.size / 1024 / 1024).toFixed(2)}MB</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          {matchingResults.matches.length > 50 && (
                            <Typography variant="caption" sx={{ p: 2, display: 'block', textAlign: 'center' } as any}>
                              ... and {matchingResults.matches.length - 50} more matches
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Processing Settings Tab */}
                      {activeTab ===1 && (<Grid { ...{container: true}} spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                              Image Processing
                            </Typography>
                            <FormControlLabel
                              control: any,
                                  checked={settings.processImages}
                                  onChange={(e) => setSettings(prev => ({ ...prev, processImages: e.target.checked }))}
                                />
                              }
                              label: any,
                            {settings.processImages && (<Box sx={{ mt: 2 } as any}>
                                <Typography variant="body2" gutterBottom>
                                  Target Size: {settings.targetSize}x{settings.targetSize}px
                                </Typography>
                                <Slider
                                  value={settings.targetSize}
                                  onChange={(e, v) => setSettings(prev => ({ ...prev, targetSize: v }))}
                                  min={800}
                                  max={2000}
                                  step={100}
                                  marks: any,
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
                                  onChange={(e, v) => setSettings(prev => ({ ...prev, imageQuality: v }))}
                                  min={60}
                                  max={100}
                                  step={5}
                                  marks: any,
                                    { value: 60, label: '60%' },
                                    { value: 80, label: '80%' },
                                    { value: 90, label: '90%' },
                                    { value: 100, label: '100%' }
                                  ]}
                                />
                              </Box>
                            )}
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                              Upload Settings
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              Batch Size: {settings.batchSize} concurrent uploads
                            </Typography>
                            <Slider
                              value={settings.batchSize}
                              onChange={(e, v) => setSettings(prev => ({ ...prev, batchSize: v }))}
                              min={1}
                              max={10}
                              step={1}
                              marks: any,
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
                              onChange={(e, v) => setSettings(prev => ({ ...prev, delayBetweenBatches: v }))}
                              min={500}
                              max={5000}
                              step={500}
                              marks: any,
                                { value: 500, label: '0.5s' },
                                { value: 2000, label: '2s' },
                                { value: 5000, label: '5s' }
                              ]}
                            />
                          </Grid>
                        </Grid>
                      )}

                      {/* Unmatched Tab */}
                      {activeTab ===2 && matchingResults.unmatched.csvRows.length > 0 && (
                        <Box sx={{ maxHeight: 300, overflow: 'auto' } as any}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Products without matching images:
                          </Typography>
                          <List dense>
                            {matchingResults.unmatched.csvRows.map((row: any: any, index: any: any) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <WarningIcon color="warning" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`SKU: ${row.sku} - REF: ${row.ref}`}
                                  secondary={`Product: ${row.productName || 'No name'} | Expected: ${row.imageName || 'Not specified'}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>
                  </Paper>

                  <Button
                    variant: any,
                    onClick={handleStartUpload}
                    disabled={matchingResults.matches.length ===0}
                    startIcon={<UploadIcon />}
                    color: any,
                    Start Calligraph Upload ({matchingResults.matches.length} images)
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
                      Progress: {uploadProgress.current} of {uploadProgress.total}
                    </Typography>
                    <Typography variant="body2">
                      {((uploadProgress.current / uploadProgress.total) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant: any,
                    value={(uploadProgress.current / uploadProgress.total) * 100}
                    sx={{ mb: 2, height: 8, borderRadius: 4 } as any}
                  />
                  {uploadProgress.sku && (
                    <Box>
                      <Typography variant="body2" color="primary">
                        Current: SKU {uploadProgress.sku} - {uploadProgress.fileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Stage: {uploadProgress.stage || uploadProgress.status}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {uploadResults && processingStats && (
                <Box>
                  <Alert severity="success" sx={{ mb: 3 } as any}>
                    <Typography variant="body1" gutterBottom>
                      Calligraph upload completed successfully!
                    </Typography>
                    <Typography variant="body2">
                      {processingStats.successful} successful, {processingStats.failed} failed
                      {processingStats.compressionRatio > 0 && (
                        <> • {processingStats.compressionRatio}% size reduction</>
                      )}
                      • Success rate: {processingStats.successRate}%
                    </Typography>
                  </Alert>

                  {/* Enhanced Results Summary */}
                  <Grid { ...{container: true}} spacing={2} sx={{ mb: 3 } as any}>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <Typography variant="h4" color="success.main">
                            {processingStats.successful}
                          </Typography>
                          <Typography variant="caption">Successful</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <Typography variant="h4" color="error.main">
                            {processingStats.failed}
                          </Typography>
                          <Typography variant="caption">Failed</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <Typography variant="h4" color="info.main">
                            {processingStats.uniqueProducts}
                          </Typography>
                          <Typography variant="caption">Products</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center' } as any}>
                        <CardContent sx={{ py: 2 } as any}>
                          <Typography variant="h4" color="primary.main">
                            {processingStats.averageImagesPerProduct}
                          </Typography>
                          <Typography variant="caption">Avg/Product</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 } as any}>
                    <Button
                      variant: any,
                      startIcon={<DownloadIcon />}
                      onClick={downloadResults}
                    >
                      Download Calligraph Results CSV
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
                                <TableCell>REF</TableCell>
                                <TableCell>Raw File</TableCell>
                                <TableCell>Final Name</TableCell>
                                <TableCell>Strategy</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Message</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {uploadResults.map((result: any: any, index: any: any) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    {result.status === 'success' ? (
                                      <SuccessIcon color="success" fontSize="small" />
                                    ) : (
                                      <ErrorIcon color="error" fontSize="small" />
                                    )}
                                  </TableCell>
                                  <TableCell>{result.sku}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={result.ref} 
                                      size: any,
                                  <TableCell>{result.file.name}</TableCell>
                                  <TableCell>{result.processedFileName}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={result.matchStrategy} 
                                      size: any,
                                      }
                                    />
                                  </TableCell>
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
  )));
};

export default CalligraphBulkUploadDialog;