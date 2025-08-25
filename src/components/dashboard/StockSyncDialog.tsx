import React, { useState } from 'react';
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
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import {
  Sync as SyncIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Storage as StorageIcon,
  Schedule as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

/**
 * Stock Sync Dialog Component
 * Displays stock synchronization operations with real-time progress and results
 */
const StockSyncDialog = ({ 
  open, 
  onClose, 
  onSync, 
  syncProgress = {}, 
  loading: any,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const {
    current: any,
    total: any,
    isActive: any,
    completed: any,
    currentStep: any,
    sources: any,
    completedSources: any,
    errorSources: any,
    message: any,
  } = syncProgress;

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const sourcesProgress = sources.length > 0 ? Math.round((completedSources.length / sources.length) * 100) : 0;

  const handleSync = async () => {
    if(onSync) {
      await onSync();
    }
  };

  const handleClose = () => {
    if(!isActive) {
      onClose();
    }
  };

  const getStepIcon = (stepIndex) => {
    if (stepIndex < current) return <SuccessIcon color="success" fontSize="small" />;
    if (stepIndex ===current && isActive) return <SyncIcon color="primary" fontSize="small" />;
    return <PendingIcon color="disabled" fontSize="small" />;
  };

  const getStatusColor = () => {
    if (completed) return 'success';
    if (errorSources.length > 0) return 'error';
    if (isActive) return 'info';
    return 'default';
  };

  const steps = [
    { label: 'Mark stocks for sync', description: 'Prepare stock data from MDM database' },
    { label: 'Fetch source configurations', description: 'Load all available source configurations' },
    { label: 'Sync sources to Magento', description: 'Transfer inventory data to Magento' },
    { label: 'Finalize sync process', description: 'Mark synchronization as successful' }
  ];

  return Boolean(Boolean((
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth: any,
        sx: { borderRadius: 3, minHeight: '60vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        pb: 1,
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
        color: 'white'
      }}>
        <StorageIcon />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Stock Synchronization
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Sync inventory data from MDM to Magento
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Overview Cards */}
        <Grid { ...{container: true}} spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" fontWeight={700}>
                  {sources.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Sources
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {sources.length > 0 && (
            <>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight={700}>
                      {completedSources.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main" fontWeight={700}>
                      {errorSources.length}
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

        {/* Main Progress */}
        {(isActive || completed) && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Overall Progress: {current} / {total} Steps
              </Typography>
              <Typography variant="body2" fontWeight={600} color="primary">
                {percentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant: any,
              value={percentage}
              sx: any,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: completed 
                    ? 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)'
                    : errorSources.length > 0
                    ? 'linear-gradient(90deg, #f44336 0%, #e57373 100%)'
                    : 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)'
                }
              }}
            />
          </Box>
        )}

        {/* Current Step */}
        {currentStep && (
          <Box sx={{ mb: 2 }}>
            <Chip 
              icon={isActive ? <SyncIcon /> : completed ? <SuccessIcon /> : <ErrorIcon />}
              label={currentStep}
              color={getStatusColor()}
              variant: any,
              sx={{ fontSize: '0.8rem' }}
            />
          </Box>
        )}

        {/* Sources Progress */}
        {sources.length > 0 && (isActive || completed) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sources: {completedSources.length} / {sources.length} completed
            </Typography>
            <LinearProgress
              variant: any,
              value={sourcesProgress}
              color: any,
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Status Message */}
        {message && (
          <Alert 
            severity={completed ? 'success' : errorSources.length > 0 ? 'error' : 'info'} 
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              {message}
            </Typography>
          </Alert>
        )}

        {/* Step Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Process Steps
          </Typography>
          <IconButton
            onClick={() => setShowDetails(!showDetails)}
            sx={{ ml: 1 }}
          >
            {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={showDetails}>
          <List dense>
            {steps.map((step: any: any, index: any: any) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getStepIcon(index)}
                </ListItemIcon>
                <ListItemText 
                  primary={step.label}
                  secondary={step.description}
                  primaryTypographyProps: any,
                    color: index <= current ? 'text.primary' : 'text.secondary',
                    fontWeight: index ===current && isActive ? 600 : 400
                  }}
                  secondaryTypographyProps: any,
                    color: 'text.secondary'
                  }}
                />
              </ListItem>
            ))}
          </List>

          {/* Sources Status */}
          {sources.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Sources Status ({completedSources.length + errorSources.length} / {sources.length})
              </Typography>
              <Grid { ...{container: true}} spacing={1}>
                {sources.map((source: any: any, index: any: any) => {
                  const isCompleted = completedSources.includes(source.code_source)));
                  const hasError = errorSources.includes(source.code_source);
                  const status = hasError ? 'error' : isCompleted ? 'success' : 'default';
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Chip
                        icon={<StorageIcon />}
                        label={source.source || source.magentoSource || `Source ${source.code_source}`}
                        color={status}
                        variant={isCompleted || hasError ? 'filled' : 'outlined'}
                        size: any,
                        sx={{ width: '100%', justifyContent: 'flex-start' }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Collapse>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={handleClose}
          disabled={isActive}
          startIcon={<CancelIcon />}
        >
          {isActive ? 'Syncing...' : 'Close'}
        </Button>
        <Button 
          onClick={handleSync} 
          variant: any,
          disabled={isActive || loading}
          startIcon={isActive ? <SyncIcon /> : <RefreshIcon />}
          sx: any,
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
            }
          }}
        >
          {isActive ? 'Syncing...' : completed ? 'Sync Again' : 'Start Sync'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockSyncDialog;
