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
  Divider
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import calligraphService from '../../services/calligraphMediaUploadServiceFixed';

/**
 * Test component for Calligraph CSV parsing
 * This component helps debug CSV parsing issues
 */
const CalligraphCSVTest = () => {
  const [csvData, setCsvData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setCsvData(null);

    try {
      console.log('🧪 Testing CSV parsing with file:', file.name);
      const data = await calligraphService.parseCalligraphCSV(file);
      setCsvData(data);
      console.log('✅ CSV parsing successful:', data);
    } catch (err) {
      console.error('❌ CSV parsing failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Calligraph CSV Parser Test
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This test page helps debug CSV parsing issues. Upload your Calligraph CSV file to see how it's parsed.
      </Typography>

      {/* File Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'primary.light' : 'background.default',
          cursor: 'pointer',
          textAlign: 'center',
          mb: 3,
          transition: 'all 0.2s ease'
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? 'Drop CSV file here...'
            : 'Drag & drop Calligraph CSV file here, or click to select'
          }
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload the calligraph_updated.csv file to test parsing
        </Typography>
      </Paper>

      {loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Parsing CSV file...
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Parsing Error:</strong> {error}
          </Typography>
        </Alert>
      )}

      {csvData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            ✅ CSV Parsing Results
          </Typography>
          
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Successfully parsed {csvData.totalRows} products from CSV file
            </Typography>
          </Alert>

          <Typography variant="subtitle1" gutterBottom>
            📋 Column Information:
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
            <ListItem>
              <ListItemText 
                primary="Product Name Column" 
                secondary={csvData.productNameColumn || 'Not found'} 
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            📊 Statistics:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Total Headers" 
                secondary={csvData.headers.length} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Valid Products" 
                secondary={csvData.totalRows} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Processed Rows" 
                secondary={csvData.processedRows || 'N/A'} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Skipped Rows" 
                secondary={csvData.skippedRows || 'N/A'} 
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            📝 Sample Data (First 5 products):
          </Typography>
          <List dense>
            {csvData.data.slice(0, 5).map((item, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={`${index + 1}. SKU: ${item.sku}`}
                  secondary={`REF: ${item.ref} | Image: ${item.imageName || 'No image name'} | Product: ${item.productName || 'No product name'}`}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            🔍 All Headers Found:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
            {csvData.headers.join(', ')}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CalligraphCSVTest;