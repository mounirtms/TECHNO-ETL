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
  TableRow,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Badge
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as CSVIcon,
  Image as ImageIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  PhotoLibrary as MultiImageIcon,
  Speed as SpeedIcon,
  Tune as TuneIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as AIIcon,
  Search as SearchIcon,
  CompareArrows as CompareIcon,
  AutoFixHigh as AutoIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import mediaUploadService, { DEFAULT_MATCHING_SETTINGS } from '../../services/mediaUploadServiceOptimized';

/**
 * Optimized Bulk Upload Dialog
 * Unified dialog for both Basic and Professional modes
 * Advanced matching settings and real-time configuration
 */
const OptimizedBulkUploadDialog: React.FC<any> = ({ open, onClose, onComplete, initialMode = 'basic' }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [mode, setMode] = useState(initialMode);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [matchingResults, setMatchingResults] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_MATCHING_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const steps = [
    'Upload CSV File',
    'Upload Images',
    'Configure Matching',
    'Review Matches',
    'Upload Process'
  ];

  // Mode descriptions for tooltips
  const modeDescriptions = {
    basic: {
      title: 'Basic Upload Mode',
      description: 'Simple SKU to image name matching. Perfect for straightforward CSV files with direct image name references.',
      features: ['SKU + Image Name matching', 'Multiple images per SKU (_1, _2, _3)', 'Fuzzy matching for variations', 'Fast processing']
    },
    professional: {
      title: 'Professional Upload Mode',
      description: 'Advanced matching with REF column support. Ideal for complex product catalogs with reference codes.',
      features: ['REF column matching (primary)', 'SKU + Image Name matching', 'Product name fallback', 'Advanced fuzzy algorithms', 'Multiple matching strategies']
    }
  };

  // CSV Upload
  const onCSVDrop = useCallback(async (acceptedFiles: any) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    try {
      console.log(`🧪 OPTIMIZED: Parsing CSV in ${mode} mode...`);
      const data = await mediaUploadService.parseCSVFile(file, mode);
      setCsvFile(file);
      setCsvData(data);
      toast.success(`CSV parsed successfully: ${data?.data.length} products found (${mode} mode)`);
      setActiveStep(1);
    } catch (error) {
      console.error('❌ OPTIMIZED: CSV parsing failed:', error);
      toast.error(`CSV parsing failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  // Image Upload
  const onImageDrop = useCallback(async (acceptedFiles: any) => {
    const validFiles = [];
    const errors = [];

    for (const file of acceptedFiles) {
      const validation = mediaUploadService.validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file?.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      toast.error(`Some files were rejected: ${errors.join(', ')}`);
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} images added (supports multiple per SKU)`);
    }
  }, []);

  // Process matching with current settings
  const handleMatching = () => {
    if (!csvData || imageFiles.length === 0) {
      toast.error('Please upload both CSV and images');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 OPTIMIZED: Starting advanced matching with settings:', settings);
      const results = mediaUploadService.matchImagesWithCSV(csvData, imageFiles, settings);
      setMatchingResults(results);
      setActiveStep(3);
      
      toast.success(`Advanced matching complete: ${results?.stats.matched} matches found for ${results?.stats.uniqueProducts} products`);
    } catch (error) {
      console.error('❌ OPTIMIZED: Matching failed:', error);
      toast.error(`Matching failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Start upload process
  const handleStartUpload = async () => {
    if (!matchingResults || matchingResults?.matches.length === 0) {
      toast.error('No matches to upload');
      return;
    }

    setActiveStep(4);
    setUploadProgress({ current: 0, total: matchingResults?.matches.length });

    try {
      console.log('🚀 OPTIMIZED: Starting advanced bulk upload...');
      const results = await mediaUploadService.bulkUploadImages(
        matchingResults?.matches,
        (progress: any) => {
          setUploadProgress(progress: any);
        },
        settings
      );

      setUploadResults(results);
      
      const successful = results?.filter(r => r?.status === 'success').length;
      const failed = results?.filter(r => r?.status === 'error').length;
      
      toast.success(`Upload complete: ${successful} successful, ${failed} failed`);
      
      if (onComplete) {
        onComplete(results);
      }
    } catch (error) {
      console.error('❌ OPTIMIZED: Upload failed:', error);
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
    setSettings(DEFAULT_MATCHING_SETTINGS);
  };

  // Update settings
  const updateSettings = (path, value) => {
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

  const removeImage = (index: any) => {
    setImageFiles(prev => prev?.filter((_, i) => i !== index));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '90vh', maxHeight: '95vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        pr: 1
      } as any}>
        <UploadIcon />
        <Box sx={{ flexGrow: 1 } as any}>
          <Typography variant="h6" component="span">
            Optimized Bulk Media Upload
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 } as any}>
            <Chip 
              label={`${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`}
              size="small" 
              sx={{ 
                bgcolor: mode === 'professional' ? 'secondary.main' : 'info.main',
                color: 'white'
              } as any} 
            />
            <Chip 
              label="Advanced Matching" 
              size="small" 
              sx={{ bgcolor: 'success.main', color: 'white' } as any} 
            />
          </Box>
        </Box>
        
        <Tooltip title="Configure matching settings">
          <IconButton 
            onClick={() => setShowSettings(!showSettings)}
            sx={{ color: 'inherit' } as any}
          >
            <Badge color="secondary" variant="dot" invisible={!showSettings}>
              <SettingsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        
        <IconButton 
          onClick={onClose} 
          sx={{ color: 'inherit' } as any}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, display: 'flex', height: '70vh' } as any}>
        {/* Settings Panel */}
        {showSettings && (
          <Paper sx={{ width: 350, p: 2, borderRight: 1, borderColor: 'divider', overflow: 'auto' } as any}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}>
              <TuneIcon color="primary" />
              Matching Settings
            </Typography>
            
            {/* Mode Selection */}
            <Box sx={{ mb: 3 } as any}>
              <Typography variant="subtitle2" gutterBottom>Upload Mode</Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(e: any) => (e: any) => (e: any) => (e, newMode) => newMode && setMode(newMode: any)}
                size="small"
                fullWidth
              >
                <ToggleButton value="basic">
                  <Tooltip title={modeDescriptions.basic.description}>
                    <Box sx={{ textAlign: 'center' } as any}>
                      <SpeedIcon fontSize="small" />
                      <Typography variant="caption" display="block">Basic</Typography>
                    </Box>
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="professional">
                  <Tooltip title={modeDescriptions.professional.description}>
                    <Box sx={{ textAlign: 'center' } as any}>
                      <AIIcon fontSize="small" />
                      <Typography variant="caption" display="block">Professional</Typography>
                    </Box>
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Matching Strategies */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Matching Strategies</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 } as any}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.strategies.exact}
                      onChange={(e: any) => (e: any) => (e: any) => (e: any) => updateSettings('strategies.exact', e.target.checked)}
                    />
                  }
                  label={
                    <Tooltip title="Exact filename matching - highest accuracy">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 } as any}>
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
                      onChange={(e: any) => (e: any) => (e: any) => (e: any) => updateSettings('strategies.normalized', e.target.checked)}
                    />
                  }
                  label={
                    <Tooltip title="Remove dashes, spaces, special characters for matching">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 } as any}>
                        <AutoIcon fontSize="small" />
                        <Typography variant="body2">Normalized</Typography>
                      </Box>
                    </Tooltip>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.strategies.fuzzy}
                      onChange={(e: any) => (e: any) => (e: any) => (e: any) => updateSettings('strategies.fuzzy', e.target.checked)}
                    />
                  }
                  label={
                    <Tooltip title="AI-powered similarity matching for variations">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 } as any}>
                        <AIIcon fontSize="small" />
                        <Typography variant="body2">Fuzzy Match</Typography>
                      </Box>
                    </Tooltip>
                  }
                />
                
                {mode === 'professional' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.strategies.ref}
                        onChange={(e: any) => (e: any) => (e: any) => (e: any) => updateSettings('strategies.ref', e.target.checked)}
                      />
                    }
                    label={
                      <Tooltip title="Match using REF column (Professional mode)">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 } as any}>
                          <CompareIcon fontSize="small" />
                          <Typography variant="body2">REF Column</Typography>
                        </Box>
                      </Tooltip>
                    }
                  />
                )}
              </AccordionDetails>
            </Accordion>

            {/* Matching Thresholds */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Matching Thresholds</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 } as any}>
                <Box sx={{ mb: 2 } as any}>
                  <Typography variant="body2" gutterBottom>
                    Fuzzy Similarity: {settings.thresholds.fuzzyThreshold}
                  </Typography>
                  <Slider
                    value={settings.thresholds.fuzzyThreshold}
                    onChange={(e: any) => (e: any) => (e: any) => (e, value) => updateSettings('thresholds.fuzzyThreshold', value)}
                    min={0.5}
                    max={1.0}
                    step={0.05}
                    marks={[
                      { value: 0.5, label: 'Loose' },
                      { value: 0.7, label: 'Balanced' },
                      { value: 0.9, label: 'Strict' }
                    ]}
                    size="small"
                  />
                </Box>
                
                <TextField
                  label="Partial Match Length"
                  type="number"
                  value={settings.thresholds.partialLength}
                  onChange={(e: any) => (e: any) => (e: any) => (e: any) => updateSettings('thresholds.partialLength', parseInt(e.target.value))}
                  size="small"
                  fullWidth
                  inputProps={{ min: 10, max: 50 }}
                  sx={{ mb: 2 } as any}
                />
              </AccordionDetails>
            </Accordion>

            {/* File Handling */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">File Handling</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 } as any}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.fileHandling.multipleImages}
                      onChange={(e: any) => (e: any) => (e: any) => (e: any) => updateSettings('fileHandling.multipleImages', e.target.checked)}
                    />
                  }
                  label={
                    <Tooltip title="Support _1, _2, _3 numbering for multiple images per SKU">
                      <Typography variant="body2">Multiple Images</Typography>
                    </Tooltip>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={!settings.fileHandling.caseSensitive}
                      onChange={(e: any) => (e: any) => (e: any) => (e: any) => updateSettings('fileHandling.caseSensitive', !e.target.checked)}
                    />
                  }
                  label={
                    <Tooltip title="Ignore case differences in filenames">
                      <Typography variant="body2">Case Insensitive</Typography>
                    </Tooltip>
                  }
                />
              </AccordionDetails>
            </Accordion>

            {/* Upload Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Upload Settings</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 } as any}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.upload.processImages}
                      onChange={(e: any) => (e: any) => (e: any) => (e: any) => updateSettings('upload.processImages', e.target.checked)}
                    />
                  }
                  label={
                    <Tooltip title="Resize and optimize images before upload">
                      <Typography variant="body2">Process Images</Typography>
                    </Tooltip>
                  }
                />
                
                {settings.upload.processImages && (
                  <>
                    <TextField
                      label="Target Size (px)"
                      type="number"
                      value={settings.upload.targetSize}
                      onChange={(e: any) => (e: any) => (e: any) => (e: any) => updateSettings('upload.targetSize', parseInt(e.target.value))}
                      size="small"
                      fullWidth
                      sx={{ mb: 1 } as any}
                    />
                    
                    <Box sx={{ mb: 2 } as any}>
                      <Typography variant="body2" gutterBottom>
                        Quality: {Math.round(settings.upload.imageQuality * 100)}%
                      </Typography>
                      <Slider
                        value={settings.upload.imageQuality}
                        onChange={(e: any) => (e: any) => (e: any) => (e, value) => updateSettings('upload.imageQuality', value)}
                        min={0.5}
                        max={1.0}
                        step={0.05}
                        size="small"
                      />
                    </Box>
                  </>
                )}
                
                <TextField
                  label="Batch Size"
                  type="number"
                  value={settings.upload.batchSize}
                  onChange={(e: any) => (e: any) => (e: any) => (e: any) => updateSettings('upload.batchSize', parseInt(e.target.value))}
                  size="small"
                  fullWidth
                  inputProps={{ min: 1, max: 10 }}
                />
              </AccordionDetails>
            </Accordion>
          </Paper>
        )}

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' } as any}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Step 1: CSV Upload */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Upload CSV File</Typography>
              </StepLabel>
              <StepContent>
                <Alert severity="info" sx={{ mb: 2 } as any}>
                  <Typography variant="body2">
                    <strong>{modeDescriptions[mode].title}:</strong> {modeDescriptions[mode].description}
                  </Typography>
                  <Box sx={{ mt: 1 } as any}>
                    {modeDescriptions[mode].features?.map((feature, index) => (
                      <Chip key={index} label={feature} size="small" sx={{ mr: 0.5, mb: 0.5 } as any} />
                    ))}
                  </Box>
                </Alert>
                
                <Paper
                  {...csvDropzone.getRootProps()}
                  sx={{
                    p: 4,
                    border: '2px dashed',
                    borderColor: csvDropzone.isDragActive ? 'primary.main' : 'grey.300',
                    bgcolor: csvDropzone.isDragActive ? 'primary.light' : 'background.default',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  } as any}
                >
                  <input {...csvDropzone.getInputProps()} />
                  <CSVIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 } as any} />
                  <Typography variant="h6" gutterBottom>
                    {csvDropzone.isDragActive
                      ? 'Drop CSV file here...'
                      : 'Drag & drop CSV file here, or click to select'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mode === 'professional' 
                      ? 'Requires: SKU, REF, Image Name columns'
                      : 'Requires: SKU, Image Name columns'
                    }
                  </Typography>
                </Paper>

                {csvFile && csvData && (
                  <Alert severity="success" sx={{ mt: 2 } as any}>
                    <Typography variant="body2">
                      <strong>{csvFile?.name}</strong> - {csvData?.data.length} products loaded ({mode} mode)
                    </Typography>
                    <Typography variant="caption" display="block">
                      Columns: {csvData?.skuColumn}, {csvData?.imageColumn}
                      {csvData?.refColumn && `, ${csvData?.refColumn}`}
                      {csvData?.processedRows && ` | Processed: ${csvData?.processedRows}, Skipped: ${csvData?.skippedRows}`}
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
                <Paper
                  {...imageDropzone.getRootProps()}
                  sx={{
                    p: 4,
                    border: '2px dashed',
                    borderColor: imageDropzone.isDragActive ? 'success.main' : 'grey.300',
                    bgcolor: imageDropzone.isDragActive ? 'success.light' : 'background.default',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  } as any}
                >
                  <input {...imageDropzone.getInputProps()} />
                  <MultiImageIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 } as any} />
                  <Typography variant="h6" gutterBottom>
                    {imageDropzone.isDragActive
                      ? 'Drop images here...'
                      : 'Drag & drop images here, or click to select multiple'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports: image.jpg, image_1.jpg, image_2.jpg patterns | Max: 10MB per file
                  </Typography>
                </Paper>

                {imageFiles.length > 0 && (
                  <Box sx={{ mt: 3 } as any}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 } as any}>
                      <Typography variant="subtitle1">
                        Selected Images ({imageFiles.length})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Size: {(imageFiles.reduce((sum, f) => sum + f?.size, 0) / 1024 / 1024).toFixed(2)}MB
                      </Typography>
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
                        onClick={() => setActiveStep(2)}
                        disabled={!csvData || imageFiles.length === 0}
                        startIcon={<TuneIcon />}
                        color="primary"
                      >
                        Configure Matching
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

            {/* Step 3: Configure Matching */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Configure Matching</Typography>
              </StepLabel>
              <StepContent>
                <Alert severity="info" sx={{ mb: 2 } as any}>
                  <Typography variant="body2">
                    Configure matching strategies and thresholds. Use the settings panel on the left for detailed configuration.
                  </Typography>
                </Alert>

                <Grid {...{container: true} as any} spacing={2} sx={{ mb: 3 } as any}>
                  <Grid {...{item: true} as any} xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Active Strategies
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 } as any}>
                          {settings.strategies.exact && <Chip label="Exact" color="primary" size="small" />}
                          {settings.strategies.normalized && <Chip label="Normalized" color="secondary" size="small" />}
                          {settings.strategies.fuzzy && <Chip label="Fuzzy" color="success" size="small" />}
                          {settings.strategies.ref && mode === 'professional' && <Chip label="REF" color="warning" size="small" />}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid {...{item: true} as any} xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Settings Summary
                        </Typography>
                        <Typography variant="body2">
                          Fuzzy Threshold: {settings.thresholds.fuzzyThreshold}<br/>
                          Multiple Images: {settings.fileHandling.multipleImages ? 'Yes' : 'No'}<br/>
                          Process Images: {settings.upload.processImages ? 'Yes' : 'No'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleMatching}
                  disabled={!csvData || imageFiles.length === 0 || loading}
                  startIcon={loading ? <SuccessIcon className="spin" /> : <SearchIcon />}
                  color="success"
                >
                  {loading ? 'Processing...' : 'Start Advanced Matching'}
                </Button>
              </StepContent>
            </Step>

            {/* Step 4: Review Matches */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Review Matches</Typography>
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
                            <Typography variant="caption">Total Matches</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid {...{item: true} as any} xs={6} sm={3}>
                        <Card sx={{ textAlign: 'center', bgcolor: 'info.light' } as any}>
                          <CardContent sx={{ py: 2 } as any}>
                            <MultiImageIcon sx={{ fontSize: 32, color: 'info.main' } as any} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' } as any}>
                              {matchingResults?.stats.uniqueProducts}
                            </Typography>
                            <Typography variant="caption">Products</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid {...{item: true} as any} xs={6} sm={3}>
                        <Card sx={{ textAlign: 'center', bgcolor: 'warning.light' } as any}>
                          <CardContent sx={{ py: 2 } as any}>
                            <WarningIcon sx={{ fontSize: 32, color: 'warning.main' } as any} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' } as any}>
                              {matchingResults?.stats.multipleImagesProducts}
                            </Typography>
                            <Typography variant="caption">Multi-Image</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid {...{item: true} as any} xs={6} sm={3}>
                        <Card sx={{ textAlign: 'center', bgcolor: 'secondary.light' } as any}>
                          <CardContent sx={{ py: 2 } as any}>
                            <AIIcon sx={{ fontSize: 32, color: 'secondary.main' } as any} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' } as any}>
                              {matchingResults?.stats.averageSimilarity}
                            </Typography>
                            <Typography variant="caption">Avg Similarity</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Strategy Breakdown */}
                    <Alert severity="success" sx={{ mb: 3 } as any}>
                      <Typography variant="body2">
                        <strong>Advanced Matching Complete:</strong> Found {matchingResults?.stats.matched} matches 
                        using {Object.values(matchingResults?.stats.matchStrategies)?.filter(v => v > 0).length} strategies.
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' } as any}>
                        {matchingResults?.stats.matchStrategies.ref > 0 && (
                          <Chip label={`REF: ${matchingResults?.stats.matchStrategies.ref}`} color="warning" size="small" />
                        )}
                        {matchingResults?.stats.matchStrategies.exact > 0 && (
                          <Chip label={`Exact: ${matchingResults?.stats.matchStrategies.exact}`} color="primary" size="small" />
                        )}
                        {matchingResults?.stats.matchStrategies.fuzzy > 0 && (
                          <Chip label={`Fuzzy: ${matchingResults?.stats.matchStrategies.fuzzy}`} color="success" size="small" />
                        )}
                        {matchingResults?.stats.matchStrategies.product > 0 && (
                          <Chip label={`Product: ${matchingResults?.stats.matchStrategies.product}`} color="info" size="small" />
                        )}
                      </Box>
                    </Alert>

                    {/* Matches Table */}
                    {matchingResults?.matches.length > 0 && (
                      <Box sx={{ mb: 3 } as any}>
                        <Typography variant="subtitle1" gutterBottom>
                          Matches to Upload ({matchingResults?.matches.length})
                        </Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 300 } as any}>
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>SKU</TableCell>
                                <TableCell>Image File</TableCell>
                                <TableCell>Strategy</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Similarity</TableCell>
                                <TableCell>Size</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {matchingResults?.matches.slice(0, 20)?.map((match, index) => (
                                <TableRow key={index}>
                                  <TableCell>{match?.sku}</TableCell>
                                  <TableCell>{match.file?.name}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={match.matchStrategy} 
                                      size="small" 
                                      color={
                                        match.matchStrategy === 'ref' ? 'warning' :
                                        match.matchStrategy === 'exact' ? 'primary' :
                                        match.matchStrategy === 'fuzzy' ? 'success' : 'info'
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {match.imageIndex + 1}/{match?.totalImagesForSku}
                                    {match.isMainImage && (
                                      <Chip label="Main" size="small" color="primary" sx={{ ml: 1 } as any} />
                                    )}
                                  </TableCell>
                                  <TableCell>{(match.similarity * 100).toFixed(0)}%</TableCell>
                                  <TableCell>{(match.file?.size / 1024 / 1024).toFixed(2)}MB</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        {matchingResults?.matches.length > 20 && (
                          <Typography variant="caption" sx={{ p: 2, display: 'block', textAlign: 'center' } as any}>
                            ... and {matchingResults?.matches.length - 20} more matches
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleStartUpload}
                      disabled={matchingResults?.matches.length === 0}
                      startIcon={<UploadIcon />}
                      color="primary"
                    >
                      Start Optimized Upload ({matchingResults?.matches.length} images)
                    </Button>
                  </Box>
                )}
              </StepContent>
            </Step>

            {/* Step 5: Upload Process */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Upload Process</Typography>
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
                          Current: SKU {uploadProgress?.sku} - {uploadProgress?.fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Status: {uploadProgress?.status} | Stage: {uploadProgress?.stage}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {uploadResults && (
                  <Box>
                    <Alert severity="success" sx={{ mb: 3 } as any}>
                      <Typography variant="body1" gutterBottom>
                        Optimized upload completed successfully!
                      </Typography>
                      <Typography variant="body2">
                        {uploadResults?.filter(r => r?.status === 'success').length} successful, {uploadResults?.filter(r => r?.status === 'error').length} failed
                      </Typography>
                    </Alert>
                    
                    <Box sx={{ maxHeight: 400, overflow: 'auto' } as any}>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Status</TableCell>
                              <TableCell>SKU</TableCell>
                              <TableCell>File</TableCell>
                              <TableCell>Strategy</TableCell>
                              <TableCell>Position</TableCell>
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
                                  <Chip 
                                    label={result.matchStrategy} 
                                    size="small" 
                                    color={
                                      result.matchStrategy === 'ref' ? 'warning' :
                                      result.matchStrategy === 'exact' ? 'primary' :
                                      result.matchStrategy === 'fuzzy' ? 'success' : 'info'
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {result.imageIndex + 1}/{result?.totalImagesForSku}
                                  {result.isMainImage && (
                                    <Chip label="Main" size="small" color="primary" sx={{ ml: 1 } as any} />
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
        </Box>
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
        {activeStep > 0 && activeStep < 2 && (
          <Button 
            onClick={() => setActiveStep(prev => prev - 1)} 
            disabled={loading}
          >
            Back
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OptimizedBulkUploadDialog;