import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import calligraphService from '../services/calligraphMediaUploadServiceFixed';

/**
 * Debug page for Calligraph CSV parsing and image matching
 * This page helps identify and fix CSV parsing and matching issues
 */
const CalligraphDebugPage = () => {
  const [csvData, setCsvData] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [matchingResults, setMatchingResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // CSV Upload Handler
  const onCSVDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setCsvData(null);

    try {
      console.log('🧪 DEBUGGING: Testing CSV parsing with file:', file.name);
      const data = await calligraphService.parseCalligraphCSV(file);
      setCsvData(data);
      console.log('✅ DEBUGGING: CSV parsing successful:', data);
    } catch (err) {
      console.error('❌ DEBUGGING: CSV parsing failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Handler
  const onImageDrop = async (acceptedFiles) => {
    setImageFiles(prev => [...prev, ...acceptedFiles]);
    console.log('📁 DEBUGGING: Added images:', acceptedFiles.map(f => f.name));
  };

  // Test Matching
  const testMatching = () => {
    if (!csvData || imageFiles.length === 0) {
      setError('Please upload both CSV and image files first');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 DEBUGGING: Testing image matching...');
      const results = calligraphService.matchImagesWithCalligraphCSV(csvData, imageFiles);
      setMatchingResults(results);
      console.log('✅ DEBUGGING: Matching complete:', results);
    } catch (err) {
      console.error('❌ DEBUGGING: Matching failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const csvDropzone = useDropzone({
    onDrop: onCSVDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  });

  const imageDropzone = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🐛 Calligraph Debug Center
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This debug page helps identify and fix CSV parsing and image matching issues.
        Upload your files and see detailed parsing information.
      </Typography>

      <Grid container spacing={3}>
        {/* CSV Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📄 Step 1: Upload CSV
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
                  mb: 2
                }}
              >
                <input {...csvDropzone.getInputProps()} />
                <Typography variant="body1">
                  {csvDropzone.isDragActive
                    ? 'Drop CSV here...'
                    : 'Drop Calligraph CSV or click to select'
                  }
                </Typography>
              </Paper>

              {csvData && (
                <Alert severity="success">
                  ✅ CSV loaded: {csvData.totalRows} products
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Image Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📁 Step 2: Upload Images
              </Typography>
              
              <Paper
                {...imageDropzone.getRootProps()}
                sx={{
                  p: 3,
                  border: '2px dashed',
                  borderColor: imageDropzone.isDragActive ? 'info.main' : 'grey.300',
                  bgcolor: imageDropzone.isDragActive ? 'info.light' : 'background.default',
                  cursor: 'pointer',
                  textAlign: 'center',
                  mb: 2
                }}
              >
                <input {...imageDropzone.getInputProps()} />
                <Typography variant="body1">
                  {imageDropzone.isDragActive
                    ? 'Drop images here...'
                    : 'Drop test images or click to select'
                  }
                </Typography>
              </Paper>

              {imageFiles.length > 0 && (
                <Alert severity="info">
                  📁 {imageFiles.length} images loaded
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Test Matching Button */}
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={testMatching}
              disabled={!csvData || imageFiles.length === 0 || loading}
              color="success"
            >
              🔍 Test REF Matching
            </Button>
          </Box>
        </Grid>
      </Grid>

      {loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Processing...
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Error:</strong> {error}
          </Typography>
        </Alert>
      )}

      {/* CSV Data Display */}
      {csvData && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📊 CSV Parsing Results
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Chip label={`${csvData.totalRows} Products`} color="primary" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Chip label={`${csvData.headers.length} Columns`} color="info" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Chip label={`${csvData.processedRows || 0} Processed`} color="success" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Chip label={`${csvData.skippedRows || 0} Skipped`} color="warning" />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" gutterBottom>
            📋 Column Mapping:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="SKU Column" 
                secondary={csvData.skuColumn || 'Not found'} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="REF Column" 
                secondary={csvData.refColumn || 'Not found'} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Image Name Column" 
                secondary={csvData.imageNameColumn || 'Not found'} 
              />
            </ListItem>
          </List>

          <Typography variant="subtitle1" gutterBottom>
            📝 Sample Products:
          </Typography>
          <List dense>
            {csvData.data.slice(0, 5).map((item, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={`SKU: ${item.sku} | REF: ${item.ref}`}
                  secondary={`Image: ${item.imageName || 'No image name'}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Image Files Display */}
      {imageFiles.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📁 Uploaded Images
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {imageFiles.map((file, index) => (
              <Chip 
                key={index}
                label={file.name}
                variant="outlined"
                color="info"
                size="small"
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Matching Results Display */}
      {matchingResults && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            🎯 Matching Results
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', bgcolor: 'success.light' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {matchingResults.stats.matched}
                  </Typography>
                  <Typography variant="caption">Matches</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', bgcolor: 'info.light' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" color="info.main">
                    {matchingResults.stats.uniqueProducts}
                  </Typography>
                  <Typography variant="caption">Products</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', bgcolor: 'warning.light' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {matchingResults.stats.unmatchedCSV}
                  </Typography>
                  <Typography variant="caption">Unmatched CSV</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', bgcolor: 'error.light' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" color="error.main">
                    {matchingResults.stats.unmatchedImages}
                  </Typography>
                  <Typography variant="caption">Unmatched Images</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" gutterBottom>
            🎯 Match Strategies:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip 
              label={`REF: ${matchingResults.stats.matchStrategies.ref}`} 
              color="success" 
            />
            <Chip 
              label={`Image Name: ${matchingResults.stats.matchStrategies.imageName}`} 
              color="info" 
            />
            <Chip 
              label={`Fuzzy: ${matchingResults.stats.matchStrategies.fuzzy}`} 
              color="warning" 
            />
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            ✅ Successful Matches:
          </Typography>
          <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
            {matchingResults.matches.slice(0, 10).map((match, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={`${match.file.name} → ${match.finalImageName}`}
                  secondary={`SKU: ${match.sku} | REF: ${match.ref} | Strategy: ${match.matchStrategy}`}
                />
              </ListItem>
            ))}
          </List>

          {matchingResults.unmatched.csvRows.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                ❌ Unmatched CSV Rows:
              </Typography>
              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {matchingResults.unmatched.csvRows.slice(0, 5).map((row, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={`SKU: ${row.sku} | REF: ${row.ref}`}
                      secondary={`Image: ${row.imageName || 'No image name'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default CalligraphDebugPage;