/**
 * Settings-specific Error Boundary Component
 * Specialized error handling for settings-related components
 * Includes settings recovery and reset options
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  RestoreFromTrash as ResetIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-toastify';

class SettingsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showResetDialog: false,
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

    // Log settings-specific error
    console.error('SettingsErrorBoundary caught an error:', error, errorInfo);
    
    // Check if it's a settings-related error
    const isSettingsError = error?.message?.toLowerCase().includes('settings') ||
                           error?.stack?.toLowerCase().includes('settings') ||
                           errorInfo?.componentStack?.toLowerCase().includes('settings');

    if (isSettingsError) {
      console.warn('Settings corruption detected, may need reset');
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

  handleShowResetDialog = () => {
    this.setState({ showResetDialog: true });
  };

  handleCloseResetDialog = () => {
    this.setState({ showResetDialog: false });
  };

  handleResetSettings = () => {
    try {
      // Clear all settings from localStorage
      const settingsKeys = [
        'techno-etl-settings',
        'techno-etl-unified-settings',
        'techno-etl-theme-settings',
        'settingsLastModified'
      ];

      settingsKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear user-specific settings if available
      const userKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('userSettings_') || key.startsWith('techno-etl-user-')
      );
      
      userKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        showResetDialog: false,
        retryCount: 0
      });

      // Reload the page to reinitialize with defaults
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (resetError) {
      console.error('Failed to reset settings:', resetError);
      toast.error('Failed to reset settings. Please try reloading the page.');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SettingsErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          showResetDialog={this.state.showResetDialog}
          onRetry={this.handleRetry}
          onShowResetDialog={this.handleShowResetDialog}
          onCloseResetDialog={this.handleCloseResetDialog}
          onResetSettings={this.handleResetSettings}
          componentName={this.props.componentName}
        />
      );
    }

    return this.props.children;
  }
}

// Functional component for the settings error fallback UI
const SettingsErrorFallback = ({
  error,
  errorInfo,
  retryCount,
  showResetDialog,
  onRetry,
  onShowResetDialog,
  onCloseResetDialog,
  onResetSettings,
  componentName
}) => {
  const theme = useTheme();
  const { translate } = useLanguage();
  const { animations } = useCustomTheme();

  const errorMessage = error?.message || translate('errors.settings.unknown');
  const isSettingsCorruption = errorMessage.toLowerCase().includes('settings') ||
                              errorMessage.toLowerCase().includes('parse') ||
                              errorMessage.toLowerCase().includes('invalid');

  const recoverySteps = [
    {
      icon: <RefreshIcon color="primary" />,
      title: translate('errors.settings.recovery.retry.title'),
      description: translate('errors.settings.recovery.retry.description'),
      action: onRetry,
      severity: 'info'
    },
    {
      icon: <ResetIcon color="warning" />,
      title: translate('errors.settings.recovery.reset.title'),
      description: translate('errors.settings.recovery.reset.description'),
      action: onShowResetDialog,
      severity: 'warning'
    }
  ];

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          p: 3,
          textAlign: 'center',
          animation: animations ? 'slideIn 0.3s ease-out' : 'none',
          '@keyframes slideIn': {
            from: { opacity: 0, transform: 'translateX(-20px)' },
            to: { opacity: 1, transform: 'translateX(0)' }
          }
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 700,
            width: '100%',
            borderRadius: 3,
            border: `2px solid ${theme.palette.warning.light}`,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.warning.light}05)`
          }}
        >
          <Stack spacing={3} alignItems="center">
            {/* Settings Error Icon */}
            <Box
              sx={{
                p: 2,
                borderRadius: '50%',
                backgroundColor: theme.palette.warning.light + '20',
                animation: animations ? 'bounce 1s ease-in-out' : 'none',
                '@keyframes bounce': {
                  '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                  '40%': { transform: 'translateY(-10px)' },
                  '60%': { transform: 'translateY(-5px)' }
                }
              }}
            >
              <SettingsIcon 
                sx={{ 
                  fontSize: 48, 
                  color: theme.palette.warning.main 
                }} 
              />
            </Box>

            {/* Error Title */}
            <Typography 
              variant="h5" 
              color="warning.main" 
              sx={{ fontWeight: 600 }}
            >
              {translate('errors.settings.title')}
            </Typography>

            {/* Error Description */}
            <Alert 
              severity={isSettingsCorruption ? "warning" : "error"}
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
                  translate('errors.settings.componentError', { component: componentName }) :
                  translate('errors.settings.genericError')
                }
              </AlertTitle>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                {isSettingsCorruption ? 
                  translate('errors.settings.corruption.description') :
                  translate('errors.settings.generic.description')
                }
              </Typography>

              {retryCount > 0 && (
                <Chip
                  size="small"
                  label={translate('errors.settings.retryCount', { count: retryCount })}
                  color="info"
                  sx={{ mt: 1 }}
                />
              )}
            </Alert>

            {/* Recovery Options */}
            <Box sx={{ width: '100%' }}>
              <Typography 
                variant="h6" 
                sx={{ mb: 2, textAlign: 'left' }}
              >
                {translate('errors.settings.recovery.title')}
              </Typography>

              <List sx={{ width: '100%' }}>
                {recoverySteps.map((step, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      mb: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        transform: 'translateX(4px)'
                      }
                    }}
                    onClick={step.action}
                  >
                    <ListItemIcon>
                      {step.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {step.title}
                        </Typography>
                      }
                      secondary={step.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Additional Help */}
            <Alert severity="info" sx={{ width: '100%' }}>
              <Typography variant="body2">
                {translate('errors.settings.help.description')}
              </Typography>
            </Alert>
          </Stack>
        </Paper>
      </Box>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={showResetDialog}
        onClose={onCloseResetDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `2px solid ${theme.palette.warning.main}`
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          {translate('errors.settings.reset.dialog.title')}
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>
              {translate('errors.settings.reset.dialog.warning')}
            </AlertTitle>
            {translate('errors.settings.reset.dialog.description')}
          </Alert>

          <Typography variant="body2" sx={{ mb: 2 }}>
            {translate('errors.settings.reset.dialog.consequences')}
          </Typography>

          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={translate('errors.settings.reset.dialog.benefits.stability')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={translate('errors.settings.reset.dialog.benefits.defaults')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ErrorIcon color="error" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={translate('errors.settings.reset.dialog.losses.customizations')}
              />
            </ListItem>
          </List>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={onCloseResetDialog}
            variant="outlined"
            size="large"
          >
            {translate('common.cancel')}
          </Button>
          <Button
            onClick={onResetSettings}
            variant="contained"
            color="warning"
            size="large"
            startIcon={<ResetIcon />}
          >
            {translate('errors.settings.reset.dialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsErrorBoundary;