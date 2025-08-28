/**
 * Modern Error Boundary Component
 * 
 * Enhanced error boundary with React 18 features
 * Includes error recovery, logging, and user-friendly error displays
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React, { 
  Component, 
  ErrorInfo, 
  ReactNode, 
  PropsWithChildren,
  lazy,
  Suspense
} from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Collapse,
  IconButton,
  Divider,
  useTheme
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon
} from '@mui/icons-material';

// ============================================================================
// PROP TYPES AND JSDOC DOCUMENTATION
// ============================================================================

/**
 * @typedef {Object} ErrorBoundaryState
 * @property {boolean} hasError - Whether an error has occurred
 * @property {Error|null} error - The error object
 * @property {ErrorInfo|null} errorInfo - React error info
 * @property {string} errorId - Unique error identifier
 * @property {number} retryCount - Number of retry attempts
 * @property {boolean} showDetails - Whether to show error details
 */

/**
 * @typedef {Object} ErrorBoundaryProps
 * @property {ReactNode} children - Child components
 * @property {React.ComponentType} [fallback] - Custom error fallback component
 * @property {function} [onError] - Error handler callback
 * @property {function} [onReset] - Reset handler callback
 * @property {Array<string|number>} [resetKeys] - Keys that trigger reset
 * @property {boolean} [resetOnPropsChange] - Reset on prop changes
 * @property {boolean} [isolate] - Isolate error boundary
 * @property {number} [maxRetries] - Maximum retry attempts
 */

/**
 * @typedef {Object} ErrorFallbackProps
 * @property {Error} error - The error object
 * @property {ErrorInfo|null} errorInfo - React error info
 * @property {function} resetError - Function to reset error state
 * @property {number} retryCount - Current retry count
 * @property {number} maxRetries - Maximum retry attempts
 * @property {string} errorId - Unique error identifier
 */

// ============================================================================
// DEFAULT ERROR FALLBACK COMPONENT
// ============================================================================

const DefaultErrorFallback = ({
  error,
  errorInfo,
  resetError,
  retryCount,
  maxRetries,
  errorId
}) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = React.useState(false);

  const handleReportError = () => {
    // Implement error reporting logic
    console.log('Reporting error:', { error, errorInfo, errorId });
    
    // Could integrate with error reporting service
    // e.g., Sentry, LogRocket, etc.
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      resetError();
    }
  };

  const canRetry = retryCount < maxRetries;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        m: 2,
        textAlign: 'center',
        border: `2px solid ${theme.palette.error.main}`,
        borderRadius: 2
      }}
    >
      <Box sx={{ mb: 2 }}>
        <ErrorIcon 
          sx={{ 
            fontSize: 64, 
            color: 'error.main',
            mb: 2
          }} 
        />
        
        <Typography variant="h5" component="h2" gutterBottom color="error">
          Oops! Something went wrong
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {error.message || 'An unexpected error occurred'}
        </Typography>

        {retryCount > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Retry attempt {retryCount} of {maxRetries}
          </Alert>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
        {canRetry && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
          >
            Try Again
          </Button>
        )}
        
        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          onClick={() => window.location.href = '/'}
        >
          Go Home
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<BugReportIcon />}
          onClick={handleReportError}
        >
          Report Issue
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Button
          variant="text"
          endIcon={<ExpandMoreIcon sx={{ 
            transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s'
          }} />}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Show'} Error Details
        </Button>

        <Collapse in={showDetails}>
          <Box sx={{ mt: 2, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Error ID: {errorId}
            </Typography>
            
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" component="pre" sx={{ 
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}>
                {error.stack}
              </Typography>
            </Alert>

            {errorInfo && (
              <Alert severity="info">
                <Typography variant="body2" component="pre" sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }}>
                  Component Stack:
                  {errorInfo.componentStack}
                </Typography>
              </Alert>
            )}
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};

// ============================================================================
// ERROR BOUNDARY CLASS COMPONENT
// ============================================================================

class ErrorBoundary extends Component {
  resetTimeoutId = null;

  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    // Generate unique error ID
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      errorInfo
    });

    // Call error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report error to monitoring service
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && !prevProps.hasError) {
      // New error occurred
      return;
    }

    if (hasError && resetOnPropsChange) {
      // Reset on any prop change if specified
      this.resetError();
      return;
    }

    if (hasError && resetKeys) {
      // Reset if any reset key changed
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.resetError();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  reportError = (error, errorInfo) => {
    // Implement error reporting logic
    // This could send errors to Sentry, LogRocket, or custom service
    
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Example: Send to monitoring service
    // monitoringService.captureException(error, errorReport);
    
    console.log('Error Report:', errorReport);
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: this.state.retryCount + 1,
      showDetails: false
    });

    this.props.onReset?.();
  };

  autoRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetError();
      }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
    }
  };

  render() {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state;
    const { children, fallback: FallbackComponent, maxRetries = 3, isolate } = this.props;

    if (hasError && error) {
      const ErrorFallback = FallbackComponent || DefaultErrorFallback;

      const errorElement = (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
          retryCount={retryCount}
          maxRetries={maxRetries}
          errorId={errorId}
        />
      );

      // If isolate is true, wrap in error boundary to prevent error propagation
      if (isolate) {
        return (
          <Box sx={{ isolation: 'isolate' }}>
            {errorElement}
          </Box>
        );
      }

      return errorElement;
    }

    return children;
  }
}

// ============================================================================
// HIGHER-ORDER COMPONENT
// ============================================================================

/**
 * HOC to wrap components with error boundary
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Object} errorBoundaryProps - Error boundary props
 * @returns {React.Component} Wrapped component
 */
export const withErrorBoundary = (
  Component,
  errorBoundaryProps
) => {
  const WrappedComponent = React.forwardRef((props, ref) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// ============================================================================
// SUSPENSE + ERROR BOUNDARY WRAPPER
// ============================================================================

/**
 * Combined Suspense and Error Boundary wrapper
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @param {ReactNode} [props.suspenseFallback] - Suspense fallback
 * @param {React.ComponentType} [props.errorFallback] - Error fallback component
 * @param {function} [props.onError] - Error handler
 * @returns {React.Component} Wrapped component
 */
export const SafeAsyncComponent = ({
  children,
  suspenseFallback = <div>Loading...</div>,
  errorFallback,
  onError
}) => {
  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense fallback={suspenseFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// ============================================================================
// REACT 18 ENHANCED ERROR BOUNDARY HOOK
// ============================================================================

/**
 * Hook for programmatic error handling
 * @returns {Object} Error handling functions
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ErrorBoundary;
export { ErrorBoundary };