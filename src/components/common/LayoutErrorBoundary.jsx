/**
 * Layout Error Boundary Component
 * Comprehensive error handling for layout components
 * 
 * Features:
 * - Error boundaries for tab components
 * - Graceful fallbacks for layout calculation failures
 * - Error recovery mechanisms for sidebar state
 * - User-friendly error messages and recovery options
 * - Performance monitoring and error reporting
 * - Accessibility-compliant error states
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import React, { Component, createContext, useContext, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Enhanced imports
import { useRTL } from '../../contexts/RTLContext';
import TooltipWrapper from './TooltipWrapper';

// ===== ERROR TYPES =====

export const ERROR_TYPES = {
  LAYOUT_CALCULATION: 'layout_calculation',
  SIDEBAR_STATE: 'sidebar_state',
  TAB_RENDERING: 'tab_rendering',
  VIEWPORT_HEIGHT: 'viewport_height',
  RTL_CONFIGURATION: 'rtl_configuration',
  PERFORMANCE: 'performance',
  NETWORK: 'network',
  UNKNOWN: 'unknown'
};

export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// ===== ERROR CONTEXT =====

const ErrorContext = createContext({
  errors: [],
  addError: () => {},
  removeError: () => {},
  clearErrors: () => {},
  reportError: () => {}
});

// ===== STYLED COMPONENTS =====

const ErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: alpha(theme.palette.error.main, 0.05),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
}));

const ErrorIcon = styled(ErrorIcon)(({ theme }) => ({
  fontSize: '4rem',
  color: theme.palette.error.main,
  marginBottom: theme.spacing(2)
}));

const ErrorDetails = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  textAlign: 'left',
  maxWidth: '100%',
  overflow: 'auto'
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  flexWrap: 'wrap',
  justifyContent: 'center'
}));

// ===== ERROR BOUNDARY CLASS =====

class LayoutErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      showDetails: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      errorInfo
    });

    // Report error to monitoring service
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      type: this.props.errorType || ERROR_TYPES.UNKNOWN,
      severity: this.props.severity || ERROR_SEVERITY.MEDIUM,
      context: this.props.context || {}
    };

    // Call error reporting callback
    this.props.onError?.(errorReport);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Layout Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Report:', errorReport);
      console.groupEnd();
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      showDetails: false,
      retryCount: prevState.retryCount + 1
    }));

    // Call retry callback
    this.props.onRetry?.();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      showDetails: false,
      retryCount: 0
    });

    // Call reset callback
    this.props.onReset?.();
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          showDetails={this.state.showDetails}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          onToggleDetails={this.toggleDetails}
          fallbackComponent={this.props.fallbackComponent}
          title={this.props.title}
          message={this.props.message}
          showRetry={this.props.showRetry}
          showReset={this.props.showReset}
          showDetails={this.props.showDetails}
          maxRetries={this.props.maxRetries}
        />
      );
    }

    return this.props.children;
  }
}

// ===== ERROR FALLBACK COMPONENT =====

const ErrorFallback = ({
  error,
  errorInfo,
  errorId,
  showDetails,
  retryCount,
  onRetry,
  onReset,
  onToggleDetails,
  fallbackComponent,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try refreshing the page.',
  showRetry = true,
  showReset = true,
  showDetailsToggle = true,
  maxRetries = 3
}) => {
  const theme = useTheme();
  const { isRTL } = useRTL();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  // Custom fallback component
  if (fallbackComponent) {
    return fallbackComponent({ error, errorInfo, onRetry, onReset });
  }

  const handleReportError = () => {
    setReportDialogOpen(true);
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const canRetry = retryCount < maxRetries;

  return (
    <ErrorContainer>
      <ErrorIcon />
      
      <Typography variant="h5" component="h2" gutterBottom color="error">
        {title}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 600 }}>
        {message}
      </Typography>

      {errorId && (
        <Chip
          label={`Error ID: ${errorId}`}
          size="small"
          variant="outlined"
          sx={{ mb: 2, fontFamily: 'monospace' }}
        />
      )}

      <ActionButtons>
        {showRetry && canRetry && (
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            color="primary"
          >
            Try Again
          </Button>
        )}

        {showReset && (
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={onReset}
          >
            Reset
          </Button>
        )}

        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
        >
          Go Home
        </Button>

        <Button
          variant="outlined"
          startIcon={<BugReportIcon />}
          onClick={handleReportError}
          color="error"
        >
          Report Issue
        </Button>
      </ActionButtons>

      {!canRetry && retryCount >= maxRetries && (
        <Alert severity="warning" sx={{ mt: 2, maxWidth: 600 }}>
          <AlertTitle>Maximum retry attempts reached</AlertTitle>
          Please refresh the page or contact support if the problem persists.
        </Alert>
      )}

      {showDetailsToggle && (
        <Box sx={{ mt: 2, width: '100%', maxWidth: 800 }}>
          <Button
            onClick={onToggleDetails}
            startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            size="small"
            color="inherit"
          >
            {showDetails ? 'Hide' : 'Show'} Error Details
          </Button>
          
          <Collapse in={showDetails}>
            <ErrorDetails>
              <Typography variant="subtitle2" gutterBottom>
                Error Message:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'error.main' }}>
                {error?.message || 'Unknown error'}
              </Typography>

              {error?.stack && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Stack Trace:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {error.stack}
                  </Typography>
                </>
              )}

              {errorInfo?.componentStack && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Component Stack:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {errorInfo.componentStack}
                  </Typography>
                </>
              )}
            </ErrorDetails>
          </Collapse>
        </Box>
      )}

      {/* Error Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Report Error</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Help us improve by reporting this error. The following information will be sent:
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
              {JSON.stringify({
                errorId,
                message: error?.message,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
              }, null, 2)}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            No personal information will be collected.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // Here you would send the error report
              setReportDialogOpen(false);
            }}
          >
            Send Report
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorContainer>
  );
};

// ===== ERROR PROVIDER =====

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const addError = useCallback((error) => {
    const errorWithId = {
      ...error,
      id: error.id || `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: error.timestamp || new Date().toISOString()
    };
    
    setErrors(prev => [...prev, errorWithId]);
  }, []);

  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const reportError = useCallback((error, context = {}) => {
    const errorReport = {
      ...error,
      context,
      reported: true,
      reportedAt: new Date().toISOString()
    };

    // Add to error list
    addError(errorReport);

    // Report to external service (implement as needed)
    console.warn('Error reported:', errorReport);
  }, [addError]);

  const contextValue = {
    errors,
    addError,
    removeError,
    clearErrors,
    reportError
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

// ===== HOOKS =====

export const useErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }
  return context;
};

// ===== MAIN COMPONENT =====

export const LayoutErrorBoundary = ({
  children,
  errorType = ERROR_TYPES.UNKNOWN,
  severity = ERROR_SEVERITY.MEDIUM,
  title,
  message,
  fallbackComponent,
  showRetry = true,
  showReset = true,
  showDetails = true,
  maxRetries = 3,
  context = {},
  onError,
  onRetry,
  onReset
}) => {
  return (
    <LayoutErrorBoundaryClass
      errorType={errorType}
      severity={severity}
      title={title}
      message={message}
      fallbackComponent={fallbackComponent}
      showRetry={showRetry}
      showReset={showReset}
      showDetails={showDetails}
      maxRetries={maxRetries}
      context={context}
      onError={onError}
      onRetry={onRetry}
      onReset={onReset}
    >
      {children}
    </LayoutErrorBoundaryClass>
  );
};

// ===== SPECIALIZED ERROR BOUNDARIES =====

export const TabErrorBoundary = ({ children, tabId, ...props }) => (
  <LayoutErrorBoundary
    errorType={ERROR_TYPES.TAB_RENDERING}
    title="Tab Error"
    message="This tab encountered an error and couldn't be displayed properly."
    context={{ tabId }}
    {...props}
  >
    {children}
  </LayoutErrorBoundary>
);

export const SidebarErrorBoundary = ({ children, ...props }) => (
  <LayoutErrorBoundary
    errorType={ERROR_TYPES.SIDEBAR_STATE}
    title="Sidebar Error"
    message="The sidebar encountered an error. Try refreshing the page."
    {...props}
  >
    {children}
  </LayoutErrorBoundary>
);

export const LayoutCalculationErrorBoundary = ({ children, ...props }) => (
  <LayoutErrorBoundary
    errorType={ERROR_TYPES.LAYOUT_CALCULATION}
    title="Layout Error"
    message="There was an error calculating the layout. The page may not display correctly."
    severity={ERROR_SEVERITY.HIGH}
    {...props}
  >
    {children}
  </LayoutErrorBoundary>
);

export default LayoutErrorBoundary;