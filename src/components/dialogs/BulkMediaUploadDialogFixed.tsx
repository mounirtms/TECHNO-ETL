import React, { useState, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  PhotoLibrary as MultiImageIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import mediaUploadService from '../../services/mediaUploadServiceFixed';

/**
 * FIXED Bulk Media Upload Dialog
 * Now properly handles multiple images per SKU (image_1, image_2, etc.)
 * Enhanced CSV parsing and matching logic
 */
const BulkMediaUploadDialogFixed = ({ open, onClose, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [matchingResults, setMatchingResults] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const steps = [
    'Upload CSV File',
    'Upload Images',
    'Review Matches',
    'Upload Process'
  ];

  // CSV Upload
  const onCSVDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    try {
      console.log('🧪 FIXED: Parsing CSV with enhanced parser...');
      const data = await mediaUploadService.parseCSVFile(file);
      setCsvFile(file);
      setCsvData(data);
      toast.success(`FIXED: CSV parsed successfully: ${data.data.length} products found`);
      setActiveStep(1);
    } catch (error) {
      console.error('❌ FIXED: CSV parsing failed:', error);
      toast.error(`CSV parsing failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Image Upload
  const onImageDrop = useCallback(async (acceptedFiles) => {
    const validFiles = [];
    const errors = [];

    for (const file of acceptedFiles) {
      const validation = mediaUploadService.validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      toast.error(`Some files were rejected: ${errors.join(', ')}`);
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    
    if (validFiles.length > 0) {
      toast.success(`FIXED: ${validFiles.length} images added (supports multiple per SKU)`);
    }
  }, []);

  // Process matching
  const handleMatching = () => {
    if (!csvData || imageFiles.length === 0) {
      toast.error('Please upload both CSV and images');
      return;
    }

    console.log('🔍 FIXED: Starting enhanced matching...');
    const results = mediaUploadService.matchImagesWithCSV(csvData, imageFiles);
    setMatchingResults(results);
    setActiveStep(2);
    
    toast.success(`FIXED: Matching complete: ${results.stats.matched} matches found for ${results.stats.uniqueProducts} products`);
  };

  // Start upload process
  const handleStartUpload = async () => {
    if (!matchingResults || matchingResults.matches.length === 0) {
      toast.error('No matches to upload');
      return;
    }

    setActiveStep(3);
    setUploadProgress({ current: 0, total: matchingResults.matches.length });

    try {
      console.log('🚀 FIXED: Starting enhanced bulk upload...');
      const results = await mediaUploadService.bulkUploadImages(
        matchingResults.matches,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setUploadResults(results);
      
      const successful = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'error').length;
      
      toast.success(`FIXED: Upload complete: ${successful} successful, ${failed} failed`);
      
      if (onComplete) {
        onComplete(results);
      }
    } catch (error) {
      console.error('❌ FIXED: Upload failed:', error);
      toast.error(`Upload failed: ${error.message}`);
    }
  };

  // Reset dialog
  const handleReset = () => {
    setActiveStep(0);
    setCsvFile(null);
    setCsvData(null);
    setImageFiles([]);
    setMatchingResults(null);
    setUploadProgress(null);
    setUploadResults(null);
  };

  // Dropzone configurations
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
    multiple: true
  });

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      }}>
        <UploadIcon />
        FIXED Bulk Media Upload
        <Chip 
          label="Multiple Images per SKU" 
          size="small" 
          sx={{ 
            bgcolor: 'primary.dark', 
            color: 'primary.contrastText',
            ml: 1
          }} 
        />
        <Box sx={{ position: 'absolute', right: 16 }}>
          <IconButton 
            onClick={onClose} 
            sx={{ color: 'inherit' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ p: 3 }}>
          {/* Step 1: CSV Upload */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Upload Calligraph CSV</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload the Calligraph CSV file with SKU and image name columns. Enhanced parser handles complex CSV structures.
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
                }}
              >
                <input {...csvDropzone.getInputProps()} />
                <CSVIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {csvDropzone.isDragActive
                    ? 'Drop CSV file here...'
                    : 'Drag & drop CSV file here, or click to select'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enhanced parser handles quoted fields and complex CSV structures
                </Typography>
              </Paper>

              {csvFile && csvData && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>{csvFile.name}</strong> - {csvData.data.length} products loaded
                  </Typography>
                  <Typography variant="caption" display="block">
                    SKU Column: {csvData.skuColumn} | Image Column: {csvData.imageColumn}
                    {csvData.processedRows && ` | Processed: ${csvData.processedRows}, Skipped: ${csvData.skippedRows}`}
                  </Typography>
                </Alert>
              )}
            </StepContent>
          </Step>

          {/* Step 2: Image Upload */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Upload Multiple Images</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload product images. Supports multiple images per SKU (image_name.jpg, image_name_1.jpg, image_name_2.jpg, etc.)
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
                }}
              >
                <input {...imageDropzone.getInputProps()} />
                <MultiImageIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {imageDropzone.isDragActive
                    ? 'Drop images here...'
                    : 'Drag & drop images here, or click to select multiple'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports: image.jpg, image_1.jpg, image_2.jpg patterns | Max: 8MB per file
                </Typography>
              </Paper>

              {imageFiles.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">
                      Selected Images ({imageFiles.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Size: {(imageFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)}MB
                    </Typography>
                  </Box>
                  
                  <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                    <Grid container spacing={1}>
                      {imageFiles.map((file, index) => (
                        <Grid item key={index}>
                          <Chip
                            label={file.name}
                            onDelete={() => removeImage(index)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleMatching}
                      disabled={!csvData || imageFiles.length === 0 || loading}
                      startIcon={loading ? <SuccessIcon className="spin" /> : <MultiImageIcon />}
                      color="success"
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

          {/* Step 3: Review Matches */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Review Enhanced Matches</Typography>
            </StepLabel>
            <StepContent>
              {matchingResults && (
                <Box>
                  {/* Enhanced Statistics Cards */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'success.light' }}>
                        <CardContent sx={{ py: 2 }}>
                          <SuccessIcon sx={{ fontSize: 32, color: 'success.main' }} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {matchingResults.stats.matched}
                          </Typography>
                          <Typography variant="caption">Total Matches</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'info.light' }}>
                        <CardContent sx={{ py: 2 }}>
                          <MultiImageIcon sx={{ fontSize: 32, color: 'info.main' }} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {matchingResults.stats.uniqueProducts}
                          </Typography>
                          <Typography variant="caption">Products</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'warning.light' }}>
                        <CardContent sx={{ py: 2 }}>
                          <WarningIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {matchingResults.stats.multipleImagesProducts}
                          </Typography>
                          <Typography variant="caption">Multi-Image</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ textAlign: 'center', bgcolor: 'secondary.light' }}>
                        <CardContent sx={{ py: 2 }}>
                          <ImageIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {matchingResults.stats.averageImagesPerProduct}
                          </Typography>
                          <Typography variant="caption">Avg/Product</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Enhanced Matching:</strong> Found {matchingResults.stats.matched} total image matches 
                      for {matchingResults.stats.uniqueProducts} products. 
                      {matchingResults.stats.multipleImagesProducts} products have multiple images.
                    </Typography>
                  </Alert>

                  {matchingResults.matches.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Matches to Upload ({matchingResults.matches.length})
                      </Typography>
                      <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>SKU</TableCell>
                              <TableCell>Image File</TableCell>
                              <TableCell>CSV Image Name</TableCell>
                              <TableCell>Position</TableCell>
                              <TableCell>Size</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {matchingResults.matches.slice(0, 20).map((match, index) => (
                              <TableRow key={index}>
                                <TableCell>{match.sku}</TableCell>
                                <TableCell>{match.file.name}</TableCell>
                                <TableCell>{match.imageName}</TableCell>
                                <TableCell>
                                  {match.imageIndex + 1}/{match.totalImagesForSku}
                                  {match.isMainImage && (
                                    <Chip label="Main" size="small" color="primary" sx={{ ml: 1 }} />
                                  )}
                                </TableCell>
                                <TableCell>{(match.file.size / 1024 / 1024).toFixed(2)}MB</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {matchingResults.matches.length > 20 && (
                        <Typography variant="caption" sx={{ p: 2, display: 'block', textAlign: 'center' }}>
                          ... and {matchingResults.matches.length - 20} more matches
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartUpload}
                    disabled={matchingResults.matches.length === 0}
                    startIcon={<UploadIcon />}
                    color="primary"
                  >
                    Start Enhanced Upload ({matchingResults.matches.length} images)
                  </Button>
                </Box>
              )}
            </StepContent>
          </Step>

          {/* Step 4: Upload Process */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Enhanced Upload Process</Typography>
            </StepLabel>
            <StepContent>
              {uploadProgress && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Progress: {uploadProgress.current} of {uploadProgress.total}
                    </Typography>
                    <Typography variant="body2">
                      {((uploadProgress.current / uploadProgress.total) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(uploadProgress.current / uploadProgress.total) * 100}
                    sx={{ mb: 2, height: 8, borderRadius: 4 }}
                  />
                  {uploadProgress.sku && (
                    <Box>
                      <Typography variant="body2" color="primary">
                        Current: SKU {uploadProgress.sku} - {uploadProgress.fileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Status: {uploadProgress.status}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {uploadResults && (
                <Box>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="body1" gutterBottom>
                      Enhanced upload completed successfully!
                    </Typography>
                    <Typography variant="body2">
                      {uploadResults.filter(r => r.status === 'success').length} successful, {uploadResults.filter(r => r.status === 'error').length} failed
                    </Typography>
                  </Alert>
                  
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Status</TableCell>
                            <TableCell>SKU</TableCell>
                            <TableCell>File</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell>Message</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {uploadResults.map((result, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {result.status === 'success' ? (
                                  <SuccessIcon color="success" fontSize="small" />
                                ) : (
                                  <ErrorIcon color="error" fontSize="small" />
                                )}
                              </TableCell>
                              <TableCell>{result.sku}</TableCell>
                              <TableCell>{result.file.name}</TableCell>
                              <TableCell>
                                {result.imageIndex + 1}/{result.totalImagesForSku}
                                {result.isMainImage && (
                                  <Chip label="Main" size="small" color="primary" sx={{ ml: 1 }} />
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
                </Box>
              )}
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
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

export default BulkMediaUploadDialogFixed;