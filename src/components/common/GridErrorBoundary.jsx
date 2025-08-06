import React from 'react';
import { Alert, Box, Button, Typography, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

class GridErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error for debugging
    console.error(`Grid Error in ${this.props.gridName}:`, error, errorInfo);
    
    // Call parent error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state.retryCount + 1
    });
    
    // Call retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            m: 2, 
            textAlign: 'center',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ErrorOutline sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Grid Error Occurred
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {this.props.gridName && `Grid: ${this.props.gridName}`}
          </Typography>
          
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 2, mb: 2, textAlign: 'left', width: '100%' }}>
              <Alert severity="error" sx={{ textAlign: 'left' }}>
                <Typography variant="caption" component="div">
                  <strong>Error:</strong> {this.state.error?.message}
                </Typography>
                {this.state.errorInfo?.componentStack && (
                  <Typography variant="caption" component="pre" sx={{ mt: 1, fontSize: '0.7rem' }}>
                    {this.state.errorInfo.componentStack.split('\n').slice(0, 5).join('\n')}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<Refresh />}
              onClick={this.handleRetry}
              disabled={this.state.retryCount >= 3}
            >
              {this.state.retryCount >= 3 ? 'Max Retries Reached' : 'Retry'}
            </Button>
            
            {this.props.fallbackComponent && (
              <Button 
                variant="outlined" 
                onClick={() => this.setState({ hasError: false })}
              >
                Use Fallback
              </Button>
            )}
          </Box>
          
          {this.state.retryCount > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Retry attempts: {this.state.retryCount}/3
            </Typography>
          )}
        </Paper>
      );
    }

    // If there's a fallback component and we've exceeded retries, show it
    if (this.state.retryCount >= 3 && this.props.fallbackComponent) {
      return this.props.fallbackComponent;
    }

    return this.props.children;
  }
}

export default GridErrorBoundary;
