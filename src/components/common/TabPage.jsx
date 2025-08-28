import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Chip,
  Stack
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getRouteMetadata } from '../../config/routes';

const TabPage = ({ title, description, icon: Icon, children, showBreadcrumbs = true }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const routeMetadata = getRouteMetadata(location.pathname);

  const pageTitle = title || routeMetadata.title || 'Page';
  const pageDescription = description || routeMetadata.description || '';
  const PageIcon = Icon || (() => null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/dashboard" color="inherit">
              {t('Dashboard')}
            </Link>
            <Typography color="text.primary">{t(pageTitle)}</Typography>
          </Breadcrumbs>
        )}

        {/* Page Header */}
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
              label={t('Real-time Updates')} 
              color="success" 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={t('Auto-save Enabled')} 
              color="info" 
              size="small" 
              variant="outlined" 
            />
          </Stack>
        </Box>

        {/* Page Content */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          {children}
        </Paper>
      </Container>
    </motion.div>
  );
};

export default TabPage;