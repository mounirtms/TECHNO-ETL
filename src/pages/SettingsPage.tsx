import React, { Suspense, lazy, useState, useCallback } from 'react';
import {
  Box, Typography, Container, Paper, Tabs, Tab,
  Grid, Card, CardContent, Switch, FormControlLabel,
  Button, Alert, CircularProgress, Skeleton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useCustomTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import ComponentErrorBoundary from '../components/common/ComponentErrorBoundary';

// Lazy load heavy settings components
const OptimizedUserProfile = lazy(() => import('../components/Profile/OptimizedUserProfile'));
const LicenseManagement = lazy(() => import('../components/License/LicenseManagement'));
const LicenseStatus = lazy(() => import('../components/License/LicenseStatus'));

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
  [key: string]: any;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div
    role = {}; // Fixed invalid assignment
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    aria-labelledby={`settings-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Box sx={{ display: "flex", p: 3 }}>
        {children}
      </Box>
    )}
  </div>
);

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { mode, colorPreset, toggleTheme, setColorPreset } = useCustomTheme();
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return Boolean((
    <Container maxWidth="xl" sx={{ display: "flex", py: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ display: "flex", mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600}>
            System Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure application preferences and system settings
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ display: "flex", borderRadius: 2, overflow: 'hidden' }}>
        {/* Settings Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="body2"
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Tab
            icon={<PersonIcon />}
            label = {}; // Fixed invalid assignment
            sx={{ display: "flex", minHeight: 64 }}
          />
          <Tab
            icon={<ThemeIcon />}
            label = {}; // Fixed invalid assignment
            sx={{ display: "flex", minHeight: 64 }}
          />
          <Tab
            icon={<LanguageIcon />}
            label = {}; // Fixed invalid assignment
            sx={{ display: "flex", minHeight: 64 }}
          />
          <Tab
            icon={<NotificationsIcon />}
            label = {}; // Fixed invalid assignment
            sx={{ display: "flex", minHeight: 64 }}
          />
          <Tab
            icon={<SecurityIcon />}
            label = {}; // Fixed invalid assignment
            sx={{ display: "flex", minHeight: 64 }}
          />
          {isAdmin && (
            <Tab
              icon={<AdminIcon />}
              label = {}; // Fixed invalid assignment
              sx={{ display: "flex", minHeight: 64 }}
            />
          )}
        </Tabs>

        {/* User Profile Tab */}
        <TabPanel value={activeTab} index={0}>
          <ComponentErrorBoundary componentName="User Profile">
            <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
              <OptimizedUserProfile />
            </Suspense>
          </ComponentErrorBoundary>
        </TabPanel>

        {/* Appearance Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Theme Settings
                  </Typography>
                  <FormControlLabel
                    control = {}; // Fixed invalid assignment
                        checked={mode === 'dark'}
                        onChange={toggleTheme}
                      />
                    }
                    label = {}; // Fixed invalid assignment
                    sx={{ display: "flex", mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Toggle between light and dark theme modes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Color Preset
                  </Typography>
                  <Box sx={{ display: "flex", display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(['default', 'purple', 'green', 'orange', 'blue'] as const).map((preset: any: any) => (
                      <Button
                        key={preset}
                        variant={colorPreset === preset ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setColorPreset(preset)}
                        sx={{ display: "flex", textTransform: 'capitalize' }}
                      >
                        {preset}
                      </Button>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Language Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Language Preferences
                  </Typography>
                  <Box sx={{ display: "flex", display: 'grid', gap: 2, mt: 2 }}>
                    {Object.entries(languages || {}).map(([code: any = {}; // Fixed invalid assignment lang]: [string, any]: any: any) => (
                      <Button
                        key={code}
                        variant={currentLanguage === code ? 'contained' : 'outlined'}
                        onClick={() => changeLanguage(code)}
                        startIcon={<span>{lang.flag}</span>}
                        sx={{ display: "flex", justifyContent: 'flex-start' }}
                      >
                        {lang.name} ({lang.nativeName})
                      </Button>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={3}>
          <Alert severity="info" sx={{ display: "flex", mb: 3 }}>
            Notification settings will be implemented in future updates
          </Alert>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label = {}; // Fixed invalid assignment
                sx={{ display: "flex", display: 'block', mb: 1 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label = {}; // Fixed invalid assignment
                sx={{ display: "flex", display: 'block', mb: 1 }}
              />
              <FormControlLabel
                control={<Switch />}
                label = {}; // Fixed invalid assignment
                sx={{ display: "flex", display: 'block', mb: 1 }}
              />
            </CardContent>
          </Card>
        </TabPanel>

        {/* License Status Tab */}
        <TabPanel value={activeTab} index={4}>
          <ComponentErrorBoundary componentName="License Status">
            <Suspense fallback={<CircularProgress />}>
              <LicenseStatus />
            </Suspense>
          </ComponentErrorBoundary>
        </TabPanel>

        {/* Admin Panel Tab */}
        {isAdmin && (
          <TabPanel value={activeTab} index={5}>
            <ComponentErrorBoundary componentName="License Management">
              <Suspense fallback={<CircularProgress />}>
                <LicenseManagement />
              </Suspense>
            </ComponentErrorBoundary>
          </TabPanel>
        )}
      </Paper>
    </Container>
  )));
};

export default React.memo(SettingsPage);
