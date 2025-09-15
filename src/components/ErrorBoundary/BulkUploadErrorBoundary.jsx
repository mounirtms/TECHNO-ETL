import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';

/**
 * Error Boundary specifically for Bulk Media Upload operations
 * Provides detailed error information and recovery options
 */
class BulkUploadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: `bulk-upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      errorInfo,
    });

    // Log error for debugging
    console.error('BulkUploadErrorBoundary caught an error:', error, errorInfo);

    // Report error to monitoring service if available
    if (window.errorReporting) {
      window.errorReporting.captureException(error, {
        context: 'bulk-media-upload',
        errorInfo,
        errorId: this.state.errorId,
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    // Call parent retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  getErrorCategory = (error) => {
    const message = error?.message?.toLowerCase() || '';

    if (message.includes('csv') || message.includes('parse')) {
      return 'CSV_PROCESSING';
    }
    if (message.includes('image') || message.includes('file')) {
      return 'FILE_PROCESSING';
    }
    if (message.includes('upload') || message.includes('network')) {
      return 'UPLOAD_ERROR';
    }
    if (message.includes('match') || message.includes('algorithm')) {
      return 'MATCHING_ERROR';
    }

    return 'UNKNOWN_ERROR';
  };

  getErrorSuggestions = (category) => {
    const suggestions = {
      CSV_PROCESSING: [
        'Ensure your CSV file has proper headers (SKU, Image, etc.)',
        'Check that the CSV file is not corrupted or empty',
        'Verify the CSV uses comma separators',
        'Make sure there are no special characters in column names',
      ],
      FILE_PROCESSING: [
        'Check that all image files are valid formats (JPG, PNG, GIF, WebP)',
        'Ensure image files are not corrupted',
        'Verify file sizes are under 10MB',
        'Check that file names don\'t contain invalid characters',
      ],
      UPLOAD_ERROR: [
        'Check your internet connection',
        'Verify you have sufficient storage space',
        'Try reducing the batch size in settings',
        'Ensure the server is accessible',
      ],
      MATCHING_ERROR: [
        'Check that SKU values in CSV match image filenames',
        'Verify image naming conventions (SKU.jpg, SKU_1.jpg, etc.)',
        'Try adjusting fuzzy matching threshold in settings',
        'Ensure CSV and image files are properly formatted',
      ],
      UNKNOWN_ERROR: [
        'Try refreshing the page and starting over',
        'Check browser console for additional error details',
        'Ensure you\'re using a supported browser',
        'Contact support if the problem persists',
      ],
    };

    return suggestions[category] || suggestions.UNKNOWN_ERROR;
  };

  render() {
    if (this.state.hasError) {
      const errorCategory = this.getErrorCategory(this.state.error);
      const suggestions = this.getErrorSuggestions(errorCategory);

      return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon />
              Bulk Upload Error Occurred
            </AlertTitle>
            <Typography variant="body2">
              An error occurred during the bulk media upload process. Please review the details below and try the suggested solutions.
            </Typography>
          </Alert>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BugIcon color="error" />
                <Typography variant="h6">Error Details</Typography>
                <Chip
                  label={errorCategory.replace('_', ' ')}
                  color="error"
                  size="small"
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 2, fontFamily: 'monospace', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                {this.state.error?.message || 'Unknown error occurred'}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Error ID: {this.state.errorId}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RefreshIcon color="primary" />
                Suggested Solutions
              </Typography>

              <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                {suggestions.map((suggestion, index) => (
                  <Typography component="li" variant="body2" key={index} sx={{ mb: 1 }}>
                    {suggestion}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>

          {this.state.errorInfo && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Technical Details (for developers)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" component="pre" sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  bgcolor: 'grey.50',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: 200,
                }}>
                  {this.state.errorInfo.componentStack}
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={this.handleRetry}
              startIcon={<RefreshIcon />}
            >
              Try Again
            </Button>

            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>

            {this.props.onClose && (
              <Button
                variant="text"
                onClick={this.props.onClose}
              >
                Close Dialog
              </Button>
            )}
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default BulkUploadErrorBoundary;
