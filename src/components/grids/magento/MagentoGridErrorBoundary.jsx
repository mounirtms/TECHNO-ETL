/**
 * MagentoGridErrorBoundary
 * Provides consistent error handling across all Magento grid components
 * Integrates with user settings for error display preferences
 */

import React from 'react';
import { Box, Alert, Button, Typography, Collapse } from '@mui/material';
import { ErrorOutline, Refresh, BugReport } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { handleMagentoGridError } from '../../../utils/magentoGridSettingsManager';

class MagentoGridErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
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

    // Use settings-aware error handling
    if (this.props.userSettings) {
      handleMagentoGridError(error, `${this.props.gridType} Grid Error`, this.props.userSettings);
    } else {
      console.error('Magento Grid Error:', error, errorInfo);
      toast.error(`Error in ${this.props.gridType} grid`);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Log to error tracking service
      console.error('Production Grid Error:', {
        gridType: this.props.gridType,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });

    // Call retry callback if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      const { gridType = 'Magento', userSettings = {} } = this.props;
      const showDetailedErrors = userSettings.preferences?.showDetailedErrors === true;

      return (
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 400,
            justifyContent: 'center'
          }}
        >
          <Alert
            severity="error"
            icon={<ErrorOutline />}
            sx={{ mb: 2, width: '100%', maxWidth: 600 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={this.handleRetry}
                  startIcon={<Refresh />}
                  variant="outlined"
                >
                  Retry
                </Button>
                {showDetailedErrors && (
                  <Button
                    size="small"
                    onClick={this.toggleDetails}
                    startIcon={<BugReport />}
                    variant="text"
                  >
                    Details
                  </Button>
                )}
              </Box>
            }
          >
            <Typography variant="h6" gutterBottom>
              {gridType} Grid Error
            </Typography>
            <Typography variant="body2">
              Something went wrong while loading the {gridType.toLowerCase()} grid. 
              Please try refreshing or contact support if the problem persists.
            </Typography>
          </Alert>

          {showDetailedErrors && (
            <Collapse in={this.state.showDetails} sx={{ width: '100%', maxWidth: 600 }}>
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Error Details:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  maxHeight: 200,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  p: 1,
                  borderRadius: 1
                }}>
                  {this.state.error?.message || 'Unknown error'}
                  {this.state.error?.stack && (
                    <>
                      {'\n\nStack Trace:\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </Typography>
              </Alert>
            </Collapse>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            If this error persists, please check your network connection and API settings.
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of the error boundary for functional components
 */
export const useMagentoGridErrorHandler = (gridType, userSettings) => {
  const handleError = React.useCallback((error, operation = 'Grid Operation') => {
    handleMagentoGridError(error, `${gridType} ${operation}`, userSettings);
  }, [gridType, userSettings]);

  return { handleError };
};

/**
 * HOC to wrap components with Magento grid error boundary
 */
export const withMagentoGridErrorBoundary = (WrappedComponent, gridType) => {
  const EnhancedComponent = (props) => {
    return (
      <MagentoGridErrorBoundary 
        gridType={gridType}
        userSettings={props.userSettings}
        onRetry={props.onRetry}
      >
        <WrappedComponent {...props} />
      </MagentoGridErrorBoundary>
    );
  };

  EnhancedComponent.displayName = `withMagentoGridErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return EnhancedComponent;
};

export default MagentoGridErrorBoundary;