/**
 * Component Error Boundary
 * Provides error handling for individual components
 */
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Paper,
  Stack
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  Home
} from '@mui/icons-material';

class ComponentErrorBoundary extends React.Component {
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
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
    this.setState({ errorInfo });

    // Log error to analytics if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Component Error: ${error.toString()}`,
        fatal: false,
        custom_map: {
          component: this.props.componentName || 'Unknown',
          retry_count: this.state.retryCount
        }
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const { componentName = 'Component', fallbackMessage, showRetry = true } = this.props;
      
      return (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            m: 2, 
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'error.light'
          }}
        >
          <Stack spacing={2} alignItems="center">
            <ErrorOutline color="error" sx={{ fontSize: 48 }} />
            
            <Alert severity="error" sx={{ width: '100%' }}>
              <AlertTitle>Error in {componentName}</AlertTitle>
              {fallbackMessage || `There was an error loading the ${componentName.toLowerCase()}.`}
            </Alert>

            <Typography variant="body2" color="text.secondary">
              {this.state.retryCount > 0 && `Retry attempt: ${this.state.retryCount}`}
            </Typography>

            <Stack direction="row" spacing={2}>
              {showRetry && (
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                  disabled={this.state.retryCount >= 3}
                >
                  {this.state.retryCount >= 3 ? 'Max Retries' : 'Try Again'}
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={this.handleGoHome}
              >
                Go to Dashboard
              </Button>
            </Stack>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'grey.100', 
                  borderRadius: 1, 
                  maxWidth: '100%',
                  overflow: 'auto'
                }}
              >
                <Typography variant="caption" component="pre" sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}>
                  <strong>Error:</strong> {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      <br /><br />
                      <strong>Component Stack:</strong>
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export const withErrorBoundary = (WrappedComponent, componentName) => {
  const WithErrorBoundaryComponent = (props) => (
    <ComponentErrorBoundary componentName={componentName}>
      <WrappedComponent {...props} />
    </ComponentErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundaryComponent;
};

/**
 * Hook-based error boundary for functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error) => {
    console.error('Component Error:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      // Log error to analytics
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.toString(),
          fatal: false
        });
      }
    }
  }, [error]);

  return { error, resetError, handleError };
};

export default ComponentErrorBoundary;
