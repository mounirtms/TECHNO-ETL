import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Sync as SyncIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';

/**
 * Price Sync Dialog Component
 * Displays price sync operations with real-time progress and results
 */
const PriceSyncDialog = ({ open, onClose, priceData = [], syncStatus: propSyncStatus, syncResults: propSyncResults, progress: propProgress, setSyncStatus: propSetSyncStatus, setSyncResults: propSetSyncResults, setProgress: propSetProgress, onSync }) => {
  // Use props if provided, otherwise fallback to internal state
  const [internalSyncStatus, internalSetSyncStatus] = useState('idle');
  const [internalSyncResults, internalSetSyncResults] = useState(null);
  const [internalShowDetails, setShowDetails] = useState(false);
  const [internalProgress, internalSetProgress] = useState(0);

  const syncStatus = propSyncStatus !== undefined ? propSyncStatus : internalSyncStatus;
  const setSyncStatus = propSetSyncStatus || internalSetSyncStatus;
  const syncResults = propSyncResults !== undefined ? propSyncResults : internalSyncResults;
  const setSyncResults = propSetSyncResults || internalSetSyncResults;
  const progress = propProgress !== undefined ? propProgress : internalProgress;
  const setProgress = propSetProgress || internalSetProgress;

  // Only use internal handleSync if onSync is not provided
  const handleSync = async () => {
    if (onSync) return onSync();
    if (!priceData || priceData.length === 0) {
      alert('No price data to sync');
      return;
    }
    setSyncStatus('loading');
    setProgress(0);
    setSyncResults(null);
    try {
      console.log('🚀 Starting price sync with data:', priceData.slice(0, 2));
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      const response = await axios.post('/api/mdm/sync/prices', priceData);
      clearInterval(progressInterval);
      setProgress(100);
      setSyncResults({
        success: true,
        method: response.data.method || 'bulk',
        total: priceData.length,
        successful: response.data.successful || priceData.length,
        failed: response.data.failed || 0,
        bulkId: response.data.bulkId,
        results: response.data.results || [],
        message: response.data.message || 'Sync completed successfully'
      });
      setSyncStatus('success');
    } catch (error) {
      setSyncStatus('error');
      setSyncResults({
        success: false,
        error: error.response?.data?.message || error.message,
        total: priceData.length,
        successful: 0,
        failed: priceData.length
      });
    }
  };

  const handleClose = () => {
    setSyncStatus('idle');
    setSyncResults(null);
    setProgress(0);
    setShowDetails(false);
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'loading': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <SuccessIcon />;
      case 'error': return <ErrorIcon />;
      case 'loading': return <SyncIcon />;
      default: return <InfoIcon />;
    }
  };

  const exportResults = () => {
    if (!syncResults?.results) return;
    
    const csvContent = [
      ['SKU', 'Price', 'Status', 'Method', 'Error'],
      ...syncResults.results.map(result => [
        result.sku,
        result.price,
        result.status,
        result.method || 'bulk',
        result.error || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price-sync-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: '60vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        pb: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <SyncIcon />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Price Sync to Magento
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Bulk sync prices using Magento async API
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Sync Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" fontWeight={700}>
                  {priceData.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Products to Sync
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {syncResults && (
            <>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight={700}>
                      {syncResults.successful || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Successful
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main" fontWeight={700}>
                      {syncResults.failed || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Failed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>

        {/* Progress Bar */}
        {syncStatus === 'loading' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Syncing prices... {progress}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Status Alert */}
        {syncResults && (
          <Alert 
            severity={syncResults.success ? 'success' : 'error'} 
            sx={{ mb: 3 }}
            action={
              syncResults.results && (
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={exportResults}
                >
                  <DownloadIcon />
                </IconButton>
              )
            }
          >
            <Typography variant="body2">
              {syncResults.message || (syncResults.success ? 'Sync completed successfully' : 'Sync failed')}
            </Typography>
            {syncResults.method && (
              <Typography variant="caption" display="block">
                Method: {syncResults.method} | 
                {syncResults.bulkId && ` Bulk ID: ${syncResults.bulkId}`}
              </Typography>
            )}
          </Alert>
        )}

        {/* Results Details */}
        {syncResults?.results && syncResults.results.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Sync Results
              </Typography>
              <IconButton
                onClick={() => setShowDetails(!internalShowDetails)}
                sx={{ ml: 1 }}
              >
                {internalShowDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={internalShowDetails}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>SKU</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {syncResults.results.slice(0, 20).map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.sku}</TableCell>
                        <TableCell>{result.price}</TableCell>
                        <TableCell>
                          <Chip
                            label={result.status}
                            color={result.status === 'success' ? 'success' : 'error'}
                            size="small"
                            icon={result.status === 'success' ? <SuccessIcon /> : <ErrorIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={result.method || 'bulk'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {result.error || result.response || 'OK'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {syncResults.results.length > 20 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Showing first 20 results. Export CSV for complete data.
                </Typography>
              )}
            </Collapse>
          </Box>
        )}

        {/* Sample Data Preview */}
        {priceData.length > 0 && syncStatus === 'idle' && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sample Data Preview
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {priceData.slice(0, 5).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {priceData.length > 5 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Showing first 5 items. Total: {priceData.length} products
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose}>
          Close
        </Button>
        <Button 
          onClick={handleSync} 
          variant="contained"
          disabled={syncStatus === 'loading' || priceData.length === 0}
          startIcon={syncStatus === 'loading' ? <SyncIcon /> : <RefreshIcon />}
        >
          {syncStatus === 'loading' ? 'Syncing...' : 'Start Sync'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PriceSyncDialog;
