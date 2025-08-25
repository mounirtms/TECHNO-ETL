/**
 * AnalyticsPage - Looker Studio Dashboard Integration
 * Dynamic and responsive Looker Studio embed with professional UI
 */
import React, { useState, useEffect } from 'react';
import unifiedMagentoService from '../services/unifiedMagentoService';
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Analytics,
  Fullscreen,
  FullscreenExit,
  Refresh,
  OpenInNew,
  Settings,
  Visibility,
  VisibilityOff,
  Dashboard,
  TrendingUp,
  Assessment
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ComponentErrorBoundary from '../components/common/ComponentErrorBoundary';

/**
 * Looker Studio Dashboard Configuration
 */
const LOOKER_DASHBOARDS = {
  main: {
    id: 'main-dashboard',
    title: 'Main Business Dashboard',
    description: 'Comprehensive business intelligence overview',
    url: 'https://lookerstudio.google.com/embed/reporting/45a3e0db-5da3-47c7-8d97-8aaf9ddd87de/page/p_8jvxmorodd',
    category: 'Business Intelligence',
    icon: <Dashboard />,
    defaultSize: { width: '100%', height: '838px' }
  },
  // Add more dashboards here as needed
  sales: {
    id: 'sales-dashboard',
    title: 'Sales Analytics',
    description: 'Sales performance and trends',
    url: 'https://lookerstudio.google.com/embed/reporting/45a3e0db-5da3-47c7-8d97-8aaf9ddd87de/page/p_sales',
    category: 'Sales',
    icon: <TrendingUp />,
    defaultSize: { width: '100%', height: '700px' }
  },
  reports: {
    id: 'reports-dashboard',
    title: 'Custom Reports',
    description: 'Detailed analytical reports',
    url: 'https://lookerstudio.google.com/embed/reporting/45a3e0db-5da3-47c7-8d97-8aaf9ddd87de/page/p_reports',
    category: 'Reports',
    icon: <Assessment />,
    defaultSize: { width: '100%', height: '900px' }
  }
};

/**
 * LookerStudioEmbed Component
 */
const LookerStudioEmbed: React.FC<any> = ({ dashboard, isFullscreen, onLoad, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLoad = () => {
    setLoading(false);
    setError(null);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError('Failed to load dashboard');
    onError?.();
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : dashboard.defaultSize.height,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.paper'
      } as any}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            zIndex: 1
          } as any}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading {dashboard.title}...
            </Typography>
          </Stack>
        </Box>
      )}

      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            zIndex: 1
          } as any}
        >
          <Alert severity="error" sx={{ maxWidth: 400 } as any}>
            <Typography variant="h6">Dashboard Load Error</Typography>
            <Typography variant="body2">{error}</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              sx={{ mt: 1 } as any}
            >
              Retry
            </Button>
          </Alert>
        </Box>
      )}

      <iframe
        src={dashboard.url}
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        onLoad={handleLoad}
        onError={handleError}
        title={dashboard.title}
      />
    </Box>
  );
};

/**
 * AnalyticsPage Component
 */
const AnalyticsPage = () => {
  const { t } = useTranslation();
  const [selectedDashboard, setSelectedDashboard] = useState('main');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 minutes
  const [dashboardVisible, setDashboardVisible] = useState(true);

  const currentDashboard = LOOKER_DASHBOARDS[selectedDashboard];

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Refresh the iframe by updating its src
      const iframe = document.querySelector('iframe[title="' + currentDashboard.title + '"]');
      if (iframe) {
        const src = iframe?.src;
        iframe?.?..src = '';
        setTimeout(() => {
          iframe?.?..src = src;
        }, 100);
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, currentDashboard.title]);

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleRefresh = () => {
    const iframe = document.querySelector('iframe[title="' + currentDashboard.title + '"]');
    if (iframe) {
      const src = iframe?.?..src;
      iframe?.?..src = '';
      setTimeout(() => {
        iframe?.?..src = src;
      }, 100);
    }
  };

  const handleOpenInNew = () => {
    window.open(currentDashboard.url, '_blank', 'noopener,noreferrer');
  };

  if (isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'background.default',
          zIndex: 9999
        } as any}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10000,
            display: 'flex',
            gap: 1
          } as any}
        >
          <Tooltip title="Exit Fullscreen">
            <IconButton
              onClick={handleFullscreenToggle}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': { bgcolor: 'background.paper' }
              }}
            >
              <FullscreenExit />
            </IconButton>
          </Tooltip>
        </Box>
        
        <ComponentErrorBoundary>
          <LookerStudioEmbed
            dashboard={currentDashboard}
            isFullscreen={true}
          />
        </ComponentErrorBoundary>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 } as any}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 } as any}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 } as any}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 } as any}>
            <Analytics sx={{ fontSize: 32, color: 'primary.main' } as any} />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Interactive business intelligence powered by Looker Studio
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Dashboard Settings">
              <IconButton onClick={() => setSettingsOpen(true)}>
                <Settings />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Refresh Dashboard">
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>

            <Tooltip title="Open in New Tab">
              <IconButton onClick={handleOpenInNew}>
                <OpenInNew />
              </IconButton>
            </Tooltip>

            <Tooltip title={dashboardVisible ? "Hide Dashboard" : "Show Dashboard"}>
              <IconButton onClick={() => setDashboardVisible(!dashboardVisible)}>
                {dashboardVisible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Fullscreen">
              <IconButton onClick={handleFullscreenToggle}>
                <Fullscreen />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Dashboard Selection */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {Object.entries(LOOKER_DASHBOARDS).map(([key, dashboard]) => (
            <Chip
              key={key}
              icon={dashboard.icon}
              label={dashboard.title}
              variant={selectedDashboard === key ? "filled" : "outlined"}
              color={selectedDashboard === key ? "primary" : "default"}
              onClick={() => setSelectedDashboard(key)}
              sx={{ mb: 1 } as any}
            />
          ))}
        </Stack>
      </Paper>

      {/* Dashboard Info */}
      <Card sx={{ mb: 3 } as any}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 } as any}>
            {currentDashboard.icon}
            <Box>
              <Typography variant="h6">{currentDashboard.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {currentDashboard.description}
              </Typography>
            </Box>
            <Chip label={currentDashboard.category} size="small" />
          </Box>
        </CardContent>
      </Card>

      {/* Dashboard Embed */}
      {dashboardVisible && (
        <ComponentErrorBoundary>
          <LookerStudioEmbed
            dashboard={currentDashboard}
            isFullscreen={false}
          />
        </ComponentErrorBoundary>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dashboard Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 } as any}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Auto Refresh"
            />

            {autoRefresh && (
              <FormControl fullWidth>
                <InputLabel>Refresh Interval</InputLabel>
                <Select
                  value={refreshInterval}
                  label="Refresh Interval"
                  onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => setRefreshInterval(e.target.value)}
                >
                  <MenuItem value={60}>1 minute</MenuItem>
                  <MenuItem value={300}>5 minutes</MenuItem>
                  <MenuItem value={600}>10 minutes</MenuItem>
                  <MenuItem value={1800}>30 minutes</MenuItem>
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Default Dashboard</InputLabel>
              <Select
                value={selectedDashboard}
                label="Default Dashboard"
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => setSelectedDashboard(e.target.value)}
              >
                {Object.entries(LOOKER_DASHBOARDS).map(([key, dashboard]) => (
                  <MenuItem key={key} value={key}>
                    {dashboard.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AnalyticsPage;
