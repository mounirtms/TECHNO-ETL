/**
 * Data Grids Page - Comprehensive grid interface with tabbed navigation
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  GridView as GridIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import the grid tab navigation component
import GridTabNavigation from '../components/Navigation/GridTabNavigation';
// Remove the useIntelligentRouting import for now to avoid circular dependencies
// import { useIntelligentRouting } from '../hooks/useIntelligentRouting';

/**
 * Page Header Component
 */
const DataGridsHeader = ({ isFullscreen, onToggleFullscreen, onExport, onImport, onRefreshAll  }: { isFullscreen: any, onToggleFullscreen: any, onExport: any, onImport: any, onRefreshAll: any }) => {
  const { t } = useTranslation();
  const [menuAnchor, setMenuAnchor] = useState(null);

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('Data Management')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {t('Comprehensive data grid interface with advanced features')}
          </Typography>
          
          {/* Status Indicators */}
          <Stack direction="row" spacing={1}>
            <Chip 
              label={t('Real-time Updates')} 
              color: any,
              label={t('Auto-save Enabled')} 
              color: any,
              label={t('5 Active Grids')} 
              color: any,
        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('Refresh All Grids')}>
            <IconButton onClick={onRefreshAll}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isFullscreen ? t('Exit Fullscreen') : t('Enter Fullscreen')}>
            <IconButton onClick={onToggleFullscreen}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={t('More Options')}>
            <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => (e: React.MouseEvent<HTMLButtonElement>) => (e) => setMenuAnchor(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={() => { onExport(); setMenuAnchor(null); }}>
              <ListItemIcon><DownloadIcon /></ListItemIcon>
              <ListItemText>{t('Export Data')}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onImport(); setMenuAnchor(null); }}>
              <ListItemIcon><UploadIcon /></ListItemIcon>
              <ListItemText>{t('Import Data')}</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setMenuAnchor(null); }}>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText>{t('Grid Settings')}</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};

/**
 * Performance Metrics Component
 */
const PerformanceMetrics = ({ metrics  }: { metrics: any }) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
      <Typography variant="subtitle2" gutterBottom>
        {t('Performance Metrics')}
      </Typography>
      <Stack direction="row" spacing={3}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('Load Time')}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {metrics.loadTime || '< 200ms'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('Memory Usage')}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {metrics.memoryUsage || '52MB'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('Cache Hit Rate')}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {metrics.cacheHitRate || '87%'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('Active Connections')}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {metrics.activeConnections || '3'}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

/**
 * Main Data Grids Page Component
 */
const DataGridsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  // const { trackPageView } = useIntelligentRouting();
  
  // State management
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Track page view for analytics
  useEffect(() => {
    // trackPageView({ page: 'data-grids', section: 'grid-management' });
    console.log('Data Grids page loaded');
  }, []);

  // Mock performance metrics update
  useEffect(() => {
    const updateMetrics = () => {
      setPerformanceMetrics({
        loadTime: `${Math.floor(Math.random() * 100 + 150)}ms`,
        memoryUsage: `${Math.floor(Math.random() * 20 + 45)}MB`,
        cacheHitRate: `${Math.floor(Math.random() * 15 + 80)}%`,
        activeConnections: Math.floor(Math.random() * 5 + 1).toString()
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle fullscreen toggle
  const handleToggleFullscreen = () => {
    if(!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle export functionality
  const handleExport = () => {
    console.log('Exporting data...');
    // Implement export functionality
  };

  // Handle import functionality
  const handleImport = () => {
    console.log('Importing data...');
    // Implement import functionality
  };

  // Handle refresh all grids
  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
    console.log('Refreshing all grids...');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Page Header */}
        <DataGridsHeader
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onExport={handleExport}
          onImport={handleImport}
          onRefreshAll={handleRefreshAll}
        />

        {/* Performance Metrics */}
        <PerformanceMetrics metrics={performanceMetrics} />

        {/* Main Grid Navigation */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <GridTabNavigation
            key={refreshKey}
            defaultTabs={['customers', 'orders', 'products', 'inventory']}
            enableDynamicTabs={true}
            maxTabs={8}
          />
        </Paper>

        {/* Footer Information */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('Data grids powered by TECHNO-ETL with real-time synchronization and intelligent caching')}
          </Typography>
        </Box>
      </Container>
    </motion.div>
  );
};

export default DataGridsPage;
