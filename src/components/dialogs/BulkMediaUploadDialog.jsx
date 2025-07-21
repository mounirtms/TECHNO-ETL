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
  Tooltip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as CSVIcon,
  Image as ImageIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import mediaUploadService from '../../services/mediaUploadService';

/**
 * Bulk Media Upload Dialog
 * Handles CSV upload, image matching, and bulk upload process
 */
const BulkMediaUploadDialog = ({ open, onClose, onComplete }) => {
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
      const data = await mediaUploadService.parseCSVFile(file);
      setCsvFile(file);
      setCsvData(data);
      toast.success(`CSV parsed successfully: ${data.data.length} products found`);
      setActiveStep(1);
    } catch (error) {
      toast.error(error.message);
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
      toast.success(`${validFiles.length} images added`);
    }
  }, []);

  // Process matching
  const handleMatching = () => {
    if (!csvData || imageFiles.length === 0) {
      toast.error('Please upload both CSV and images');
      return;
    }

    const results = mediaUploadService.matchImagesWithCSV(csvData, imageFiles);
    setMatchingResults(results);
    setActiveStep(2);
    
    toast.info(`Matching complete: ${results.stats.matched} matches found`);
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
      const results = await mediaUploadService.bulkUploadImages(
        matchingResults.matches,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setUploadResults(results);
      
      const successful = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'error').length;
      
      toast.success(`Upload complete: ${successful} successful, ${failed} failed`);
      
      if (onComplete) {
        onComplete(results);
      }
    } catch (error) {
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
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
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
        Bulk Media Upload
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: CSV Upload */}
          <Step>
            <StepLabel>Upload CSV File</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload a CSV file with SKU and image filename columns
                </Typography>
                
                <Paper
                  {...csvDropzone.getRootProps()}
                  sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor: csvDropzone.isDragActive ? 'primary.main' : 'grey.300',
                    bgcolor: csvDropzone.isDragActive ? 'primary.light' : 'background.default',
                    cursor: 'pointer',
                    textAlign: 'center',
                    mt: 2
                  }}
                >
                  <input {...csvDropzone.getInputProps()} />
                  <CSVIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography>
                    {csvDropzone.isDragActive
                      ? 'Drop CSV file here...'
                      : 'Drag & drop CSV file here, or click to select'
                    }
                  </Typography>
                </Paper>

                {csvFile && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>{csvFile.name}</strong> - {csvData?.data.length} products found
                    </Typography>
                    <Typography variant="caption" display="block">
                      SKU Column: {csvData?.skuColumn} | Image Column: {csvData?.imageColumn}
                    </Typography>
                  </Alert>
                )}
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Image Upload */}
          <Step>
            <StepLabel>Upload Images</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload product images that match the filenames in your CSV
                </Typography>
                
                <Paper
                  {...imageDropzone.getRootProps()}
                  sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor: imageDropzone.isDragActive ? 'primary.main' : 'grey.300',
                    bgcolor: imageDropzone.isDragActive ? 'primary.light' : 'background.default',
                    cursor: 'pointer',
                    textAlign: 'center',
                    mt: 2
                  }}
                >
                  <input {...imageDropzone.getInputProps()} />
                  <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography>
                    {imageDropzone.isDragActive
                      ? 'Drop images here...'
                      : 'Drag & drop images here, or click to select multiple'
                    }
                  </Typography>
                </Paper>

                {imageFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Images ({imageFiles.length})
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {imageFiles.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => removeImage(index)}
                          sx={{ m: 0.5 }}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleMatching}
                    disabled={!csvData || imageFiles.length === 0}
                  >
                    Match Images with CSV
                  </Button>
                </Box>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Review Matches */}
          <Step>
            <StepLabel>Review Matches</StepLabel>
            <StepContent>
              {matchingResults && (
                <Box sx={{ mb: 2 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <SuccessIcon color="success" sx={{ fontSize: 32 }} />
                          <Typography variant="h6">{matchingResults.stats.matched}</Typography>
                          <Typography variant="caption">Matched</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <WarningIcon color="warning" sx={{ fontSize: 32 }} />
                          <Typography variant="h6">{matchingResults.stats.unmatchedCSV}</Typography>
                          <Typography variant="caption">Unmatched CSV</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <ErrorIcon color="error" sx={{ fontSize: 32 }} />
                          <Typography variant="h6">{matchingResults.stats.unmatchedImages}</Typography>
                          <Typography variant="caption">Unmatched Images</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {matchingResults.matches.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Matches to Upload ({matchingResults.matches.length})
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        <List dense>
                          {matchingResults.matches.slice(0, 10).map((match, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <ImageIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`${match.sku} → ${match.file.name}`}
                                secondary={`CSV Row: ${match.csvRow}`}
                              />
                            </ListItem>
                          ))}
                          {matchingResults.matches.length > 10 && (
                            <ListItem>
                              <ListItemText
                                primary={`... and ${matchingResults.matches.length - 10} more`}
                                sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleStartUpload}
                      disabled={matchingResults.matches.length === 0}
                    >
                      Start Upload ({matchingResults.matches.length} items)
                    </Button>
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>

          {/* Step 4: Upload Process */}
          <Step>
            <StepLabel>Upload Process</StepLabel>
            <StepContent>
              {uploadProgress && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Uploading: {uploadProgress.current} of {uploadProgress.total}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(uploadProgress.current / uploadProgress.total) * 100}
                    sx={{ mb: 1 }}
                  />
                  {uploadProgress.sku && (
                    <Typography variant="caption" color="text.secondary">
                      Current: {uploadProgress.sku} - {uploadProgress.fileName}
                    </Typography>
                  )}
                </Box>
              )}

              {uploadResults && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Upload completed: {uploadResults.filter(r => r.status === 'success').length} successful, {uploadResults.filter(r => r.status === 'error').length} failed
                  </Alert>
                  
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <List dense>
                      {uploadResults.map((result, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            {result.status === 'success' ? (
                              <SuccessIcon color="success" />
                            ) : (
                              <ErrorIcon color="error" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={`${result.sku} - ${result.file.name}`}
                            secondary={result.result.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {uploadResults ? 'Close' : 'Cancel'}
        </Button>
        {activeStep > 0 && !uploadResults && (
          <Button onClick={handleReset} color="secondary">
            Reset
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkMediaUploadDialog;
