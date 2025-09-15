import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  Fade,
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile/index';
import PermissionTest from '../components/test/PermissionTest';
import { useLanguage } from '../contexts/LanguageContext';
import { useCustomTheme } from '../contexts/ThemeContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { getDirectionalAnimation } from '../utils/rtlAnimations';

const SettingsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { translate, currentLanguage, languages } = useLanguage();
  const { animations } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isRTL = languages[currentLanguage]?.dir === 'rtl';

  // Set page title
  useEffect(() => {
    document.title = 'Settings - TECHNO-ETL';

    return () => {
      document.title = 'TECHNO-ETL';
    };
  }, []);

  // Breadcrumb navigation with translations
  const breadcrumbs = [
    {
      label: translate('navigation.dashboard'),
      path: '/dashboard',
      icon: <HomeIcon sx={{ fontSize: 16, mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }} />,
    },
    {
      label: translate('navigation.settings'),
      path: '/settings',
      isActive: true,
    },
  ];

  const handleBreadcrumbClick = (path) => {
    if (path !== '/settings') {
      navigate(path);
    }
  };

  return (
    <ErrorBoundary componentName="SettingsPage">
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 1, sm: 2, md: 3 },
          px: { xs: 1, sm: 2, md: 3 },
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        <Fade in timeout={animations ? 300 : 0}>
          <Box
            sx={{
              ...getDirectionalAnimation('fadeIn', 'up', isRTL, {
                duration: animations ? '0.5s' : '0s',
                easing: 'ease-out',
              }),
            }}
          >
            {/* Breadcrumb Navigation */}
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <MuiBreadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb navigation"
                sx={{
                  '& .MuiBreadcrumbs-ol': {
                    alignItems: 'center',
                  },
                  mb: 1,
                }}
              >
                {breadcrumbs.map((breadcrumb) => {
                  const isLast = breadcrumb.isActive;

                  if (isLast) {
                    return (
                      <Chip
                        key={breadcrumb.path}
                        icon={<SettingsIcon sx={{ fontSize: 16 }} />}
                        label={breadcrumb.label}
                        size="small"
                        color="primary"
                        variant="filled"
                        sx={{
                          height: 28,
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      />
                    );
                  }

                  return (
                    <Link
                      key={breadcrumb.path}
                      component="button"
                      onClick={() => handleBreadcrumbClick(breadcrumb.path)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                        textDecoration: 'none',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 1,
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        transition: theme.transitions.create(['color', 'background-color']),
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      {breadcrumb.icon}
                      {breadcrumb.label}
                    </Link>
                  );
                })}
              </MuiBreadcrumbs>
            </Box>

            {/* Page Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: { xs: 2, sm: 3 },
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' },
                gap: { xs: 1, sm: 2 },
              }}
            >
              <SettingsIcon
                sx={{
                  fontSize: { xs: 28, sm: 32, md: 36 },
                  color: 'primary.main',
                }}
              />
              <Box>
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 0.5,
                  }}
                >
                  {translate('settings.title')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: { xs: 'block', sm: 'block' },
                    maxWidth: { xs: '100%', sm: 600 },
                  }}
                >
                  {translate('settings.description')}
                </Typography>
              </Box>
            </Box>

            {/* Enhanced UserProfile Component */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                '& .MuiPaper-root': {
                  borderRadius: { xs: 2, sm: 3 },
                  boxShadow: theme.shadows[3],
                  overflow: 'hidden',
                },
                ...getDirectionalAnimation('slideAndFade', 'up', isRTL, {
                  duration: animations ? '0.4s' : '0s',
                  delay: '0.2s',
                }),
              }}
            >
              <UserProfile />
            </Box>

            {/* Development Permission Test - Only in development mode */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 3 }}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="permission-test-content"
                    id="permission-test-header"
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SecurityIcon color="primary" />
                      <Typography variant="h6">
                      Permission System Test (Development)
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <PermissionTest />
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}

            {/* Mobile-specific spacing */}
            {isMobile && (
              <Box sx={{ height: theme.spacing(2) }} />
            )}
          </Box>
        </Fade>
      </Container>
    </ErrorBoundary>
  );
};

export default SettingsPage;
