import React, { Suspense, useMemo } from 'react';
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
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getRouteMetadata } from '../../config/routes';
import { useTab } from '../../contexts/TabContext';
import ErrorBoundary from './ErrorBoundary';

const pageChips = [
  { key: 'realTime', label: 'Real-time Updates', color: 'success' },
  { key: 'autoSave', label: 'Auto-save Enabled', color: 'info' },
];

const GridPage = ({ title, description, icon: Icon, showBreadcrumbs = true }) => {
  const { translate: t } = useLanguage();
  const location = useLocation();

  const tabContext = useTab();
  const { getActiveComponent } = tabContext || { getActiveComponent: () => null };

  const routeMetadata = useMemo(() => getRouteMetadata(location.pathname), [location.pathname]);

  const pageTitle = useMemo(() => title || routeMetadata.title || 'Page', [title, routeMetadata.title]);
  const pageDescription = useMemo(() => description || routeMetadata.description || '', [description, routeMetadata.description]);
  const PageIcon = useMemo(() => Icon || (() => null), [Icon]);

  // Optimize ActiveComponent with proper memoization and error handling
  const ActiveComponent = useMemo(() => {
    try {
      // Only call getActiveComponent if tabContext exists and getActiveComponent is a function
      if (!tabContext || typeof getActiveComponent !== 'function') {
        return null;
      }
      return getActiveComponent();
    } catch (error) {
      console.error('Error getting active component:', error);
      return null;
    }
  }, [tabContext, getActiveComponent]);

  return (
    <Box
      sx={{
        opacity: 0,
        transform: 'translateY(20px)',
        animation: 'fadeInUp 0.5s forwards',
        '@keyframes fadeInUp': {
          'to': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
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
            {pageChips.map(chip => (
              <Chip
                key={chip.key}
                label={t(chip.label)}
                color={chip.color}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>

        <Paper sx={{ p: 3, borderRadius: 2, minHeight: '60vh', height: '100%' }}>
          <ErrorBoundary fallback={<Alert severity="error">{t('An error occurred while loading the grid.')}</Alert>}>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography>{t('Loading grid...')}</Typography>
              </Box>
            }>
              <Box sx={{ height: '100%', width: '100%', minHeight: 400 }}>
                {ActiveComponent ? <ActiveComponent /> : (
                  <Alert severity="info">
                    <Typography variant="body1">
                      {t('This page is currently under development and will be available soon.')}
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Suspense>
          </ErrorBoundary>
        </Paper>
      </Container>
    </Box>
  );
};

export default GridPage;
