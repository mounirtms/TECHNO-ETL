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

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    aria-labelledby={`settings-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Box sx={{ p: 3 } as any}>
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
  
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <Container maxWidth="xl" sx={{ py: 3 } as any}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 } as any}>
        <SettingsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' } as any} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600}>
            System Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure application preferences and system settings
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' } as any}>
        {/* Settings Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e: any) => (e) => (e) => (e) => (e) => (e) => handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
          } as any}
        >
          <Tab
            icon={<PersonIcon />}
            label="User Profile"
            iconPosition="start"
            sx={{ minHeight: 64 } as any}
          />
          <Tab
            icon={<ThemeIcon />}
            label="Appearance"
            iconPosition="start"
            sx={{ minHeight: 64 } as any}
          />
          <Tab
            icon={<LanguageIcon />}
            label="Language"
            iconPosition="start"
            sx={{ minHeight: 64 } as any}
          />
          <Tab
            icon={<NotificationsIcon />}
            label="Notifications"
            iconPosition="start"
            sx={{ minHeight: 64 } as any}
          />
          <Tab
            icon={<SecurityIcon />}
            label="License Status"
            iconPosition="start"
            sx={{ minHeight: 64 } as any}
          />
          {isAdmin && (
            <Tab
              icon={<AdminIcon />}
              label="Admin Panel"
              iconPosition="start"
              sx={{ minHeight: 64 } as any}
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
          <Grid {...{container: true}} spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Theme Settings
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mode === 'dark'}
                        onChange={(e: any) => (e) => (e) => (e) => (e) => (e) => toggleTheme}
                      />
                    }
                    label="Dark Mode"
                    sx={{ mb: 2 } as any}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Toggle between light and dark theme modes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Color Preset
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' } as any}>
                    {['default', 'purple', 'green', 'orange', 'blue'].map((preset) => (
                      <Button
                        key={preset}
                        variant={colorPreset === preset ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setColorPreset(preset)}
                        sx={{ textTransform: 'capitalize' } as any}
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
          <Grid {...{container: true}} spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Language Preferences
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 2, mt: 2 } as any}>
                    {Object.entries(languages).map(([code, lang]) => (
                      <Button
                        key={code}
                        variant={currentLanguage === code ? 'contained' : 'outlined'}
                        onClick={() => changeLanguage(code)}
                        startIcon={<span>{lang.flag}</span>}
                        sx={{ justifyContent: 'flex-start' } as any}
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
          <Alert severity="info" sx={{ mb: 3 } as any}>
            Notification settings will be implemented in future updates
          </Alert>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email notifications"
                sx={{ display: 'block', mb: 1 } as any}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Push notifications"
                sx={{ display: 'block', mb: 1 } as any}
              />
              <FormControlLabel
                control={<Switch />}
                label="SMS notifications"
                sx={{ display: 'block', mb: 1 } as any}
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
  );
};

export default React.memo(SettingsPage);
