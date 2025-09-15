
/**
 * Optimized Error Boundary
 * Enhanced error handling with performance monitoring
 */

import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Refresh as RefreshIcon, BugReport as BugIcon } from '@mui/icons-material';

class OptimizedErrorBoundary extends React.Component {
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
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error, errorInfo) {
    const { onError } = this.props;

    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || 'anonymous',
    };

    console.error('🛡️ Error Boundary caught error:', errorDetails);

    // Track error for analytics
    if (typeof onError === 'function') {
      onError(errorDetails);
    }

    // Report to error tracking service
    this.reportError(errorDetails);

    this.setState({
      errorInfo,
    });
  }

  reportError = (errorDetails) => {
    // Send to error tracking service (e.g., Sentry, LogRocket)
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorDetails),
      }).catch(() => {
        // Fail silently if error reporting fails
        console.warn('Failed to report error to server');
      });
    } catch (e) {
      // Fail silently
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    const { hasError, error, errorInfo, errorId } = this.state;
    const {
      fallback,
      children,
      showDetails = false,
      title = 'Something went wrong',
    } = this.props;

    if (hasError) {
      // Custom fallback component
      if (fallback) {
        return React.isValidElement(fallback)
          ? fallback
          : fallback({ error, errorInfo, errorId, onReset: this.handleReset });
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            padding: 3,
            textAlign: 'center',
          }}
        >
          <BugIcon
            sx={{
              fontSize: 48,
              color: 'error.main',
              marginBottom: 2,
            }}
          />

          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
                        We apologize for the inconvenience. The error has been reported automatically.
          </Typography>

          {errorId && (
            <Typography variant="body2" color="text.secondary" paragraph>
                            Error ID: {errorId}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRefresh}
            >
                            Refresh Page
            </Button>

            <Button
              variant="outlined"
              onClick={this.handleReset}
            >
                            Try Again
            </Button>
          </Box>

          {showDetails && error && (
            <Alert
              severity="error"
              sx={{
                marginTop: 3,
                textAlign: 'left',
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              <Typography variant="subtitle2">Error Details:</Typography>
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                {error.message}
              </Typography>
              {showDetails && errorInfo?.componentStack && (
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', marginTop: 1 }}>
                  {errorInfo.componentStack}
                </Typography>
              )}
            </Alert>
          )}
        </Box>
      );
    }

    return children;
  }
}

// Higher-order component for easy error boundary wrapping
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  const WrappedComponent = React.forwardRef((props, ref) => (
    <OptimizedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </OptimizedErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default OptimizedErrorBoundary;
