import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Paper, Typography, Button, Stack, Alert } from '@mui/material';
import { Refresh as RefreshIcon, BugReport as BugIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  componentName?: string;
  fallbackMessage?: string;
  showRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component Error:', error, errorInfo);
    this.setState({ errorInfo });

    // Log error to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }

    // Log to external service if needed
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Implement your error logging service here
    console.log('Logging error to service:', { error, errorInfo });
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { componentName = 'Component', fallbackMessage, showRetry = true } = this.props;
      
      return (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            m: 2, 
            textAlign: 'center',
            backgroundColor: 'error.light',
            color: 'error.contrastText'
          }}
        >
          <Stack spacing={2} alignItems="center">
            <BugIcon sx={{ fontSize: 48, color: 'error.main' }} />
            
            <Typography variant="h6" component="h2">
              {componentName} Error
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {fallbackMessage || `Something went wrong in the ${componentName} component.`}
            </Typography>

            {showRetry && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
                sx={{ mt: 2 }}
              >
                Try Again
              </Button>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert severity="error" sx={{ mt: 2, textAlign: 'left', width: '100%' }}>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {this.state.error.toString()}
                </Typography>
              </Alert>
            )}
          </Stack>
        </Paper>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const WithErrorBoundaryComponent = (props: P) => (
    <ComponentErrorBoundary componentName={componentName}>
      <WrappedComponent {...props} />
    </ComponentErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundaryComponent;
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    
    // Log error
    console.error('Error caught by useErrorHandler:', error);
    
    // Log to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};

export default ComponentErrorBoundary;