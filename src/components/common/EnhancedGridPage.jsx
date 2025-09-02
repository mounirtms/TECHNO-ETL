import React, { Suspense, useMemo, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Refresh, 
  Settings, 
  Fullscreen, 
  FullscreenExit,
  Add,
  FilterList
} from '@mui/icons-material';
import { getRouteMetadata } from '../../config/routes';
import ErrorBoundary from './ErrorBoundary';

// Enhanced Grid Page Component with DRY principles
const EnhancedGridPage = ({ 
  title, 
  description, 
  icon: Icon, 
  showBreadcrumbs = true,
  tabs = [],
  defaultTab = 0,
  onTabChange,
  showRefreshButton = true,
  showSettingsButton = false,
  showFullscreenButton = true,
  showAddButton = false,
  showFilterButton = false,
  onRefresh,
  onSettings,
  onAdd,
  onFilter,
  children,
  loading = false,
  error = null,
  stats = [],
  actions = []
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const routeMetadata = useMemo(() => getRouteMetadata(location.pathname), [location.pathname]);

  const pageTitle = useMemo(() => title || routeMetadata.title || 'Page', [title, routeMetadata.title]);
  const pageDescription = useMemo(() => description || routeMetadata.description || '', [description, routeMetadata.description]);
  const PageIcon = useMemo(() => Icon || (() => null), [Icon]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress size={40} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : 'An error occurred while loading the content.'}
        </Alert>
      );
    }

    if (tabs.length > 0) {
      return (
        <Box>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={tab.id || index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
          <Box>
            {tabs[activeTab]?.content || children}
          </Box>
        </Box>
      );
    }

    return children;
  };

  const renderStats = () => {
    if (!stats || stats.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {stats.map((stat, index) => (
            <Chip
              key={index}
              label={`${stat.label}: ${stat.value}`}
              color={stat.color || 'default'}
              variant="outlined"
              size="small"
            />
          ))}
        </Stack>
      </Box>
    );
  };

  const renderActions = () => {
    const actionButtons = [];

    if (showRefreshButton) {
      actionButtons.push(
        <Tooltip key="refresh" title="Refresh">
          <IconButton onClick={handleRefresh} size="small">
            <Refresh />
          </IconButton>
        </Tooltip>
      );
    }

    if (showSettingsButton && onSettings) {
      actionButtons.push(
        <Tooltip key="settings" title="Settings">
          <IconButton onClick={onSettings} size="small">
            <Settings />
          </IconButton>
        </Tooltip>
      );
    }

    if (showFullscreenButton) {
      actionButtons.push(
        <Tooltip key="fullscreen" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
          <IconButton onClick={handleFullscreen} size="small">
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Tooltip>
      );
    }

    if (showAddButton && onAdd) {
      actionButtons.push(
        <Button
          key="add"
          variant="contained"
          startIcon={<Add />}
          onClick={onAdd}
          size="small"
        >
          Add
        </Button>
      );
    }

    if (showFilterButton && onFilter) {
      actionButtons.push(
        <Tooltip key="filter" title="Filter">
          <IconButton onClick={onFilter} size="small">
            <FilterList />
          </IconButton>
        </Tooltip>
      );
    }

    // Add custom actions
    actions.forEach((action, index) => {
      actionButtons.push(
        <Button
          key={`custom-${index}`}
          variant={action.variant || "outlined"}
          startIcon={action.icon}
          onClick={action.onClick}
          size="small"
          color={action.color}
        >
          {action.label}
        </Button>
      );
    });

    return actionButtons.length > 0 ? (
      <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        {actionButtons}
      </Box>
    ) : null;
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        height: isFullscreen ? '100vh' : 'auto',
        overflow: isFullscreen ? 'auto' : 'visible'
      }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {showBreadcrumbs && (
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/dashboard" color="inherit">
              {t('Dashboard')}
            </Link>
            <Typography color="text.primary">{t(pageTitle)}</Typography>
          </Breadcrumbs>
        )}

        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <PageIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              {t(pageTitle)}
            </Typography>
          </Stack>
          
          {pageDescription && (
            <Typography variant="h6" color="text.secondary">
              {t(pageDescription)}
            </Typography>
          )}
          
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Chip 
              label="Real-time Updates" 
              color="success" 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label="Auto-save Enabled" 
              color="info" 
              size="small" 
              variant="outlined" 
            />
          </Stack>
        </Box>

        {renderStats()}
        {renderActions()}

        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            minHeight: isFullscreen ? 'calc(100vh - 200px)' : '60vh',
            position: 'relative'
          }}
        >
          <ErrorBoundary 
            fallback={
              <Alert severity="error">
                {t('An error occurred while loading the content.')}
              </Alert>
            }
          >
            <Suspense 
              fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <CircularProgress />
                </Box>
              }
            >
              {renderContent()}
            </Suspense>
          </ErrorBoundary>
        </Paper>
      </Container>
    </Box>
  );
};

export default EnhancedGridPage;
