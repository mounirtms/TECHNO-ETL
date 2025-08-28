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
  Alert
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getRouteMetadata } from '../../config/routes';
import { useTab } from '../../contexts/TabContext';
import ErrorBoundary from './ErrorBoundary'; // Assuming ErrorBoundary is in the same folder

const pageChips = [
  { key: 'realTime', label: 'Real-time Updates', color: 'success' },
  { key: 'autoSave', label: 'Auto-save Enabled', color: 'info' },
];

const GridPage = ({ title, description, icon: Icon, showBreadcrumbs = true }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const tabContext = useTab();
  const { getActiveComponent } = tabContext || { getActiveComponent: () => null };

  const routeMetadata = useMemo(() => getRouteMetadata(location.pathname), [location.pathname]);

  const pageTitle = useMemo(() => title || routeMetadata.title || 'Page', [title, routeMetadata.title]);
  const pageDescription = useMemo(() => description || routeMetadata.description || '', [description, routeMetadata.description]);
  const PageIcon = useMemo(() => Icon || (() => null), [Icon]);

  const ActiveComponent = useMemo(() => getActiveComponent(), [getActiveComponent]);

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

        <Paper sx={{ p: 3, borderRadius: 2, minHeight: '60vh' }}>
          <ErrorBoundary fallback={<Alert severity="error">{t('An error occurred while loading the grid.')}</Alert>}>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography>{t('Loading grid...')}</Typography>
              </Box>
            }>
              {ActiveComponent ? <ActiveComponent /> : (
                <Alert severity="info">
                  <Typography variant="body1">
                    {t('This page is currently under development and will be available soon.')}
                  </Typography>
                </Alert>
              )}
            </Suspense>
          </ErrorBoundary>
        </Paper>
      </Container>
    </Box>
  );
};

export default GridPage;