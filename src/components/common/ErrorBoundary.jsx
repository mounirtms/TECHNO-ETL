/**
 * Enhanced Error Boundary Component with RTL Support
 * Provides comprehensive error handling for React components
 * Includes user-friendly error messages and recovery options
 */
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Paper,
  Stack,
  Chip,
  IconButton,
  Collapse,
  Divider,
  useTheme
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
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

    // Log error to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  copyErrorDetails = () => {
    const errorDetails = `
Error: ${this.state.error?.message || 'Unknown error'}
Stack: ${this.state.error?.stack || 'No stack trace'}
Component Stack: ${this.state.errorInfo?.componentStack || 'No component stack'}
Retry Count: ${this.state.retryCount}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      toast.success('Error details copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy error details');
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          showDetails={this.state.showDetails}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          onToggleDetails={this.toggleDetails}
          onCopyDetails={this.copyErrorDetails}
          componentName={this.props.componentName}
          fallbackComponent={this.props.fallbackComponent}
        />
      );
    }

    return this.props.children;
  }
}

// Functional component for the error fallback UI with RTL support
const ErrorBoundaryFallback = ({
  error,
  errorInfo,
  retryCount,
  showDetails,
  onRetry,
  onReload,
  onGoHome,
  onToggleDetails,
  onCopyDetails,
  componentName,
  fallbackComponent
}) => {
  const theme = useTheme();
  const { translate } = useLanguage();
  const { animations } = useCustomTheme();

  // If a custom fallback component is provided, render it
  if (fallbackComponent) {
    return React.createElement(fallbackComponent, {
      error,
      onRetry,
      onReload,
      onGoHome
    });
  }

  const errorMessage = error?.message || translate('errors.unknown');
  const isNetworkError = errorMessage.toLowerCase().includes('network') || 
                        errorMessage.toLowerCase().includes('fetch');
  const isChunkError = errorMessage.toLowerCase().includes('chunk') ||
                      errorMessage.toLowerCase().includes('loading');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        p: 3,
        textAlign: 'center',
        animation: animations ? 'fadeIn 0.3s ease-in-out' : 'none',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        }
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          borderRadius: 3,
          border: `2px solid ${theme.palette.error.light}`,
          background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.error.light}05)`
        }}
      >
        <Stack spacing={3} alignItems="center">
          {/* Error Icon */}
          <Box
            sx={{
              p: 2,
              borderRadius: '50%',
              backgroundColor: theme.palette.error.light + '20',
              animation: animations ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' }
              }
            }}
          >
            <ErrorIcon 
              sx={{ 
                fontSize: 48, 
                color: theme.palette.error.main 
              }} 
            />
          </Box>

          {/* Error Title */}
          <Typography 
            variant="h5" 
            color="error" 
            sx={{ fontWeight: 600 }}
          >
            {translate('errors.boundary.title')}
          </Typography>

          {/* Error Description */}
          <Alert 
            severity="error" 
            sx={{ 
              width: '100%',
              textAlign: 'left',
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <AlertTitle>
              {componentName ? 
                translate('errors.boundary.componentError', { component: componentName }) :
                translate('errors.boundary.genericError')
              }
            </AlertTitle>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              {isNetworkError ? 
                translate('errors.network.description') :
                isChunkError ?
                translate('errors.chunk.description') :
                translate('errors.boundary.description')
              }
            </Typography>

            {retryCount > 0 && (
              <Chip
                size="small"
                label={translate('errors.boundary.retryCount', { count: retryCount })}
                color="warning"
                sx={{ mt: 1 }}
              />
            )}
          </Alert>

          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ width: '100%' }}
          >
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              color="primary"
              size="large"
              sx={{ 
                flex: 1,
                minHeight: 48,
                borderRadius: 2
              }}
            >
              {translate('errors.boundary.retry')}
            </Button>

            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={onGoHome}
              size="large"
              sx={{ 
                flex: 1,
                minHeight: 48,
                borderRadius: 2
              }}
            >
              {translate('errors.boundary.goHome')}
            </Button>
          </Stack>

          {/* Secondary Actions */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={1} 
            sx={{ width: '100%' }}
          >
            <Button
              variant="text"
              startIcon={<RefreshIcon />}
              onClick={onReload}
              size="small"
              color="secondary"
            >
              {translate('errors.boundary.reload')}
            </Button>

            <Button
              variant="text"
              startIcon={<BugReportIcon />}
              onClick={() => window.open('/bug-bounty', '_blank')}
              size="small"
              color="secondary"
            >
              {translate('errors.boundary.reportBug')}
            </Button>
          </Stack>

          <Divider sx={{ width: '100%' }} />

          {/* Error Details Toggle */}
          <Box sx={{ width: '100%' }}>
            <Button
              variant="text"
              onClick={onToggleDetails}
              startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              size="small"
              color="secondary"
              sx={{ mb: 1 }}
            >
              {translate('errors.boundary.technicalDetails')}
            </Button>

            <Collapse in={showDetails}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.grey[50],
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  maxHeight: 200,
                  overflow: 'auto'
                }}
              >
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {translate('errors.boundary.errorDetails')}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={onCopyDetails}
                      title={translate('errors.boundary.copyDetails')}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: theme.palette.text.secondary,
                      backgroundColor: theme.palette.background.paper,
                      p: 1,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    {error?.stack || errorMessage}
                  </Typography>
                </Stack>
              </Paper>
            </Collapse>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ErrorBoundary;