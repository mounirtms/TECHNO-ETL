import React, { useState, useCallback, useEffect } from 'react';
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
  TableRow,
  Switch,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as CSVIcon,
  Image as ImageIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  PhotoLibrary as MultiImageIcon,
  Tune as TuneIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  Search as SearchIcon,
  CompareArrows as CompareArrowsIcon,
  AutoFixHigh as AutoIcon,
  Crop as CropIcon,
  TextFields as RenameIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import mediaUploadService, { DEFAULT_MATCHING_SETTINGS } from '../../services/mediaUploadService';
import professionalBulkImageUploadService from '../../services/professionalBulkImageUpload';

/**
 * OPTIMIZED Bulk Media Upload Dialog
 * Enhanced with advanced matching, configurable settings, and professional features
 * Automatically detects and handles both Basic and Professional modes
 */
const BulkMediaUploadDialog = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [mode, setMode] = useState('basic'); // Auto-detected based on CSV
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [matchingResults, setMatchingResults] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_MATCHING_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [renamedImages, setRenamedImages] = useState([]);
  const [resizedImages, setResizedImages] = useState([]);

  const steps = [
    'Upload CSV File',
    'Upload Images',
    'Review Matches',
    'Process Images',
    'Upload Process',
  ];

  // Auto-detect mode based on CSV columns
  const detectMode = (csvData) => {
    if (csvData.headers && csvData.headers.includes('ref') && csvData.refColumn) {
      return 'professional';
    }
    return 'basic';
  };

  // Handle CSV file upload
  const onCSVDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setLoading(true);
    try {
      const csvContent = await file.text();
      const parsedData = mediaUploadService.parseCSV(csvContent);
      
      if (!parsedData || !parsedData.data || parsedData.data.length === 0) {
        throw new Error('CSV file is empty or invalid');
      }

      const detectedMode = detectMode(parsedData);
      setMode(detectedMode);
      setCsvFile(file);
      setCsvData(parsedData);
      setActiveStep(1);
      toast.success(`Loaded CSV with ${parsedData.data.length} rows`);
    } catch (error) {
      console.error('CSV parsing error:', error);
      toast.error(`Failed to parse CSV: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle image files upload
  const onImagesDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    // Filter only image files
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
    );

    if (imageFiles.length === 0) {
      toast.error('No valid image files found');
      return;
    }

    setImageFiles(prev => [...prev, ...imageFiles]);
    toast.success(`Added ${imageFiles.length} images`);
  }, []);

  // CSV Dropzone
  const csvDropzone = useDropzone({
    onDrop: onCSVDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    disabled: loading
  });

  // Images Dropzone
  const imagesDropzone = useDropzone({
    onDrop: onImagesDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    disabled: loading
  });

  // Process matching
  const handleProcessMatching = useCallback(async () => {
    if (!csvData || imageFiles.length === 0) return;

    setLoading(true);
    try {
      const results = await mediaUploadService.matchImagesWithCSV(
        csvData,
        imageFiles,
        settings
      );

      setMatchingResults(results);
      setActiveStep(2);
      toast.success(`Matched ${results.matchedImages.length} images with products`);
    } catch (error) {
      console.error('Matching error:', error);
      toast.error(`Matching failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [csvData, imageFiles, settings]);

  // Process uploads
  const handleProcessUploads = useCallback(async () => {
    if (!matchingResults) return;

    setLoading(true);
    setUploadProgress({ current: 0, total: matchingResults.matchedImages.length });
    
    try {
      const results = await mediaUploadService.uploadMatchedImages(
        matchingResults.matchedImages,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setUploadResults(results);
      setActiveStep(4);
      toast.success(`Uploaded ${results.successfulUploads.length} images successfully`);
      
      if (results.failedUploads.length > 0) {
        toast.warn(`${results.failedUploads.length} images failed to upload`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }, [matchingResults]);

  // Reset the dialog
  const handleReset = useCallback(() => {
    setActiveStep(0);
    setCsvFile(null);
    setCsvData(null);
    setImageFiles([]);
    setMatchingResults(null);
    setUploadProgress(null);
    setUploadResults(null);
    setMode('basic');
    setRenamedImages([]);
    setResizedImages([]);
  }, []);

  // Update Settings
  const updateSettings = useCallback((path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      return newSettings;
    });
  }, []);

  // Extend the settings with image processing options if not already defined
  useEffect(() => {
    if (!settings.fileHandling?.hasOwnProperty('renameImages')) {
      setSettings(prev => ({
        ...prev,
        fileHandling: {
          ...prev.fileHandling,
          renameImages: true
        }
      }));
    }
    
    if (!settings.fileHandling?.hasOwnProperty('resizeImages')) {
      setSettings(prev => ({
        ...prev,
        fileHandling: {
          ...prev.fileHandling,
          resizeImages: false
        }
      }));
    }
    
    if (!settings.resizeOptions?.hasOwnProperty('width') || !settings.resizeOptions?.hasOwnProperty('height')) {
      setSettings(prev => ({
        ...prev,
        resizeOptions: {
          width: 800,
          height: 600
        }
      }));
    }
  }, [settings]);

  // Remove Image
  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Add the missing handleProcessImages function
  const handleProcessImages = useCallback(async () => {
    if (!matchingResults?.matches) {
      toast.error('No matching results to process');
      return;
    }

    setLoading(true);
    try {
      // Process images using the professional service
      const processedMatches = professionalBulkImageUploadService.processImages(matchingResults.matches);
      
      // Update state with processed images
      setRenamedImages(processedMatches.filter(match => match.processed));
      
      // Move to next step
      setActiveStep(4);
      
      toast.success(`Processed ${processedMatches.length} images successfully`);
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process images: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [matchingResults]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { minHeight: '85vh', maxHeight: '95vh' },
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        pr: 1,
      }}>
        <UploadIcon />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="span">
            Optimized Bulk Media Upload
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Chip
              label={`${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`}
              size="small"
              sx={{
                bgcolor: mode === 'professional' ? 'secondary.main' : 'info.main',
                color: 'white',
              }}
            />
            <Chip
              label="Advanced Matching"
              size="small"
              sx={{ bgcolor: 'success.main', color: 'white' }}
            />
          </Box>
        </Box>

        <Tooltip title="Configure matching settings">
          <IconButton
            onClick={() => setShowSettings(!showSettings)}
            sx={{ color: 'inherit' }}
          >
            <Badge color="secondary" variant="dot" invisible={!showSettings}>
              <SettingsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <IconButton
          onClick={onClose}
          sx={{ color: 'inherit' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, display: 'flex', height: '70vh' }}>
        {/* Settings Panel */}
        {showSettings && (
          <Paper sx={{ width: 320, p: 2, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneIcon color="primary" />
              Advanced Settings
            </Typography>

            <Alert severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
              <strong>Unified Advanced Matching:</strong> All strategies automatically enabled based on CSV structure
            </Alert>

            {/* Matching Strategies */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Matching Strategies</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.strategies.exact}
                      onChange={(e) => updateSettings('strategies.exact', e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Tooltip title="Exact filename matching - highest accuracy">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SearchIcon fontSize="small" />
                        <Typography variant="body2">Exact Match</Typography>
                      </Box>
                    </Tooltip>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.strategies.normalized}
                      onChange={(e) => updateSettings('strategies.normalized', e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Tooltip title="Normalized matching (remove special chars)">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AutoIcon fontSize="small" />
                        <Typography variant="body2">Normalized</Typography>
                      </Box>
                    </Tooltip>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.strategies.partial}
                      onChange={(e) => updateSettings('strategies.partial', e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Tooltip title="Partial matching (first N chars)">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CompareArrowsIcon fontSize="small" />
                        <Typography variant="body2">Partial</Typography>
                      </Box>
                    </Tooltip>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.strategies.fuzzy}
                      onChange={(e) => updateSettings('strategies.fuzzy', e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Tooltip title="Fuzzy matching (similarity-based)">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PsychologyIcon fontSize="small" />
                        <Typography variant="body2">Fuzzy</Typography>
                      </Box>
                    </Tooltip>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.strategies.ref}
                      onChange={(e) => updateSettings('strategies.ref', e.target.checked)}
                      size="small"
                      disabled={!csvData?.refColumn}
                    />
                  }
                  label={
                    <Tooltip title="REF column matching (professional mode)">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <InfoIcon fontSize="small" />
                        <Typography variant="body2">REF Matching</Typography>
                      </Box>
                    </Tooltip>
                  }
                />
              </AccordionDetails>
            </Accordion>

            {/* Performance Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Performance</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Batch Size: {settings.performance.batchSize}
                  </Typography>
                  <Slider
                    value={settings.performance.batchSize}
                    onChange={(e, value) => updateSettings('performance.batchSize', value)}
                    min={10}
                    max={200}
                    step={10}
                    size="small"
                    marks={[
                      { value: 10, label: '10' },
                      { value: 100, label: '100' },
                      { value: 200, label: '200' },
                    ]}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.performance.enableCaching}
                      onChange={(e) => updateSettings('performance.enableCaching', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Enable Caching"
                />
              </AccordionDetails>
            </Accordion>

            {/* File Handling */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">File Handling</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.fileHandling.multipleImages}
                      onChange={(e) => updateSettings('fileHandling.multipleImages', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Multiple Images Per SKU"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.fileHandling.caseSensitive}
                      onChange={(e) => updateSettings('fileHandling.caseSensitive', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Case Sensitive"
                />
              </AccordionDetails>
            </Accordion>

            {/* Image Processing */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Image Processing</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.fileHandling.renameImages}
                      onChange={(e) => updateSettings('fileHandling.renameImages', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Enable Image Renaming"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.fileHandling.resizeImages}
                      onChange={(e) => updateSettings('fileHandling.resizeImages', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Enable Image Resizing"
                />

                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Resize Dimensions: {settings.resizeOptions.width}x{settings.resizeOptions.height}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Slider
                        value={settings.resizeOptions.width}
                        onChange={(e, value) => updateSettings('resizeOptions.width', value)}
                        min={100}
                        max={2000}
                        step={50}
                        size="small"
                        marks={[
                          { value: 400, label: '400' },
                          { value: 800, label: '800' },
                          { value: 1600, label: '1600' },
                        ]}
                      />
                    </Box>
                    <Box sx={{ width: 50 }}>
                      <TextField
                        size="small"
                        value={settings.resizeOptions.width}
                        onChange={(e) => updateSettings('resizeOptions.width', parseInt(e.target.value))}
                        inputProps={{ style: { textAlign: 'center' } }}
                      />
                    </Box>
                    <Box sx={{ mx: 1 }}>x</Box>
                    <Box sx={{ flex: 1 }}>
                      <Slider
                        value={settings.resizeOptions.height}
                        onChange={(e, value) => updateSettings('resizeOptions.height', value)}
                        min={100}
                        max={2000}
                        step={50}
                        size="small"
                        marks={[
                          { value: 400, label: '400' },
                          { value: 600, label: '600' },
                          { value: 1200, label: '1200' },
                        ]}
                      />
                    </Box>
                    <Box sx={{ width: 50 }}>
                      <TextField
                        size="small"
                        value={settings.resizeOptions.height}
                        onChange={(e) => updateSettings('resizeOptions.height', parseInt(e.target.value))}
                        inputProps={{ style: { textAlign: 'center' } }}
                      />
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Paper>
        )}

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ p: 3 }}>
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
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input {...csvDropzone.getInputProps()} />
                  <CSVIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
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
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>{csvFile.name}</strong> - {csvData.totalRows} products loaded
                    </Typography>
                    <Typography variant="caption" display="block">
                      SKU Column: {csvData.skuColumn} |
                      {csvData.imageColumn && ` Image Column: ${csvData.imageColumn} |`}
                      {csvData.nameColumn && ` Name Column: ${csvData.nameColumn} |`}
                      {csvData.refColumn && ` REF Column: ${csvData.refColumn}`}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Detected Mode: <strong>{mode}</strong>
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
                  Upload product images. Supports JPG, PNG, GIF, and WebP formats.
                </Typography>

                <Paper
                  {...imagesDropzone.getRootProps()}
                  sx={{
                    p: 4,
                    border: '2px dashed',
                    borderColor: imagesDropzone.isDragActive ? 'primary.main' : 'grey.300',
                    bgcolor: imagesDropzone.isDragActive ? 'primary.light' : 'background.default',
                    cursor: 'pointer',
                    textAlign: 'center',
                    mt: 2,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input {...imagesDropzone.getInputProps()} />
                  <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {imagesDropzone.isDragActive
                      ? 'Drop images here...'
                      : 'Drag & drop images here, or click to select'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports JPG, PNG, GIF, WebP (Max 10MB each)
                  </Typography>
                </Paper>

                {imageFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Images ({imageFiles.length})
                    </Typography>
                    <Grid container spacing={1}>
                      {imageFiles.map((file, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Card>
                            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                <ImageIcon fontSize="small" color="primary" />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    flexGrow: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {file.name}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => removeImage(index)}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {mediaUploadService.formatFileSize(file.size)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(2)}
                    disabled={imageFiles.length === 0 || !csvData}
                  >
                    Next: Review Matches
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: Review Matches */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Review Matches</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Review the matching results before processing
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleProcessMatching}
                    disabled={loading}
                  >
                    {loading ? 'Matching...' : 'Match Images'}
                  </Button>
                </Box>

                {matchingResults && (
                  <Box>
                    <Alert
                      severity={matchingResults.stats.unmatchedCSV === 0 && matchingResults.stats.unmatchedImages === 0 ? 'success' : 'warning'}
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2">
                        Matched: {matchingResults.stats.matched} |
                        Unmatched Products: {matchingResults.stats.unmatchedCSV} |
                        Unmatched Images: {matchingResults.stats.unmatchedImages}
                      </Typography>
                    </Alert>

                    <TableContainer sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>SKU</TableCell>
                            <TableCell>Image File</TableCell>
                            <TableCell>Match Strategy</TableCell>
                            <TableCell>Confidence</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {matchingResults.matches.slice(0, 10).map((match, index) => (
                            <TableRow key={index}>
                              <TableCell>{match.sku}</TableCell>
                              <TableCell>{match.file?.name || match.originalFileName}</TableCell>
                              <TableCell>
                                <Chip
                                  label={match.matchStrategy || (mode === 'professional' ? 'ref' : 'auto')}
                                  size="small"
                                  color={
                                    (match.matchStrategy === 'ref' || mode === 'professional') ? 'warning' :
                                      match.matchStrategy === 'exact' ? 'primary' :
                                        match.matchStrategy === 'fuzzy' ? 'success' : 'info'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {match.similarity ? (match.similarity * 100).toFixed(1) + '%' : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {matchingResults.matches.length > 10 && (
                      <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                        Showing 10 of {matchingResults.matches.length} matches
                      </Typography>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(3)}
                        disabled={matchingResults?.matches?.length === 0}
                      >
                        Next: Process Images
                      </Button>
                    </Box>
                  </Box>
                )}
              </StepContent>
            </Step>

            {/* Step 4: Process Images (Rename and Resize) */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Process Images</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Rename and resize images according to specifications
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip
                      icon={<RenameIcon />}
                      label="Rename Images"
                      color="primary"
                      variant={renamedImages.length > 0 ? 'filled' : 'outlined'}
                    />
                    <Chip
                      icon={<CropIcon />}
                      label="Resize Images"
                      color="secondary"
                      variant={resizedImages.length > 0 ? 'filled' : 'outlined'}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    onClick={handleProcessImages}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? 'Processing...' : 'Process Images (Rename & Resize)'}
                  </Button>
                </Box>

                {renamedImages.length > 0 && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Renamed {renamedImages.length} images
                    </Typography>
                  </Alert>
                )}

                {resizedImages.length > 0 && (
                  <Alert severity="success">
                    <Typography variant="body2">
                      Resized {resizedImages.length} images
                    </Typography>
                  </Alert>
                )}
              </StepContent>
            </Step>

            {/* Step 5: Upload Process */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Upload Process</Typography>
              </StepLabel>
              <StepContent>
                {!uploadResults ? (
                  <Box>
                    {uploadProgress && (
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(uploadProgress.current / uploadProgress.total) * 100}
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2">
                          {uploadProgress.stage} ({uploadProgress.current}/{uploadProgress.total})
                        </Typography>
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      onClick={handleProcessUploads}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? 'Uploading...' : 'Start Upload'}
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Alert
                      severity={uploadResults.filter(r => r.status === 'error').length === 0 ? 'success' : 'warning'}
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2">
                        Upload completed: {uploadResults.filter(r => r.status === 'success').length} successful,
                        {uploadResults.filter(r => r.status === 'error').length} failed
                      </Typography>
                    </Alert>

                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Status</TableCell>
                              <TableCell>SKU</TableCell>
                              <TableCell>File</TableCell>
                              <TableCell>Strategy</TableCell>
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
                                <TableCell>{result.file?.name || result.originalFileName}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={result.matchStrategy || (mode === 'professional' ? 'ref' : 'auto')}
                                    size="small"
                                    color={
                                      (result.matchStrategy === 'ref' || mode === 'professional') ? 'warning' :
                                        result.matchStrategy === 'exact' ? 'primary' :
                                          result.matchStrategy === 'fuzzy' ? 'success' : 'info'
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="caption">
                                    {result.result?.message || result.message}
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
        </Box>
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

export default BulkMediaUploadDialog;
