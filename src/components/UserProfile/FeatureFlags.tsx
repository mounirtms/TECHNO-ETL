import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Switch, FormControlLabel, Alert, Snackbar,
  Grid, Card, CardContent, CardHeader, Divider, Chip, List,
  ListItem, ListItemText, ListItemSecondaryAction, Button,
  Accordion, AccordionSummary, AccordionDetails, Tooltip
} from '@mui/material';
import {
  Flag, Science, BugReport, Analytics, CloudUpload, CloudDownload,
  Notifications, Dashboard, Api, Speed, Security, ExpandMore,
  Save, RestoreFromTrash, Warning, NewReleases
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const FeatureFlags = ({ user, onSettingsChange  }: { user onSettingsChange: any }) => {
  const theme = useTheme();

  // Feature flags configuration
  const [featureFlags, setFeatureFlags] = useState({
    // Advanced Operations
    advancedBulkOperations: false,
    dataExportImport: false,
    advancedReporting: false,
    customDashboardWidgets: false,
    
    // Real-time Features
    realTimeNotifications: false,
    liveDataSync: false,
    collaborativeEditing: false,
    
    // API & Integration
    apiIntegrations: false,
    webhookSupport: false,
    customConnectors: false,
    
    // Developer Tools
    debugMode: false,
    developerConsole: false,
    performanceProfiler: false,
    apiTesting: false,
    
    // Experimental Features
    experimentalUI: false,
    betaFeatures: false,
    aiAssistant: false,
    predictiveAnalytics: false,
    
    // Security & Compliance
    advancedSecurity: false,
    auditTrail: false,
    dataEncryption: false,
    complianceReporting: false
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Feature categories with descriptions and warnings
  const featureCategories = {
    advanced: {
      title: 'Advanced Operations',
      icon: <Speed />,
      color: 'primary',
      features: {
        advancedBulkOperations: {
          name: 'Advanced Bulk Operations',
          description: 'Enable complex bulk operations across multiple grids',
          warning: 'May impact performance with large datasets',
          requiresRestart: false
        },
        dataExportImport: {
          name: 'Data Export/Import',
          description: 'Advanced data export and import capabilities',
          warning: 'Requires proper data validation',
          requiresRestart: false
        },
        advancedReporting: {
          name: 'Advanced Reporting',
          description: 'Custom reports and analytics dashboard',
          warning: 'May require additional server resources',
          requiresRestart: false
        },
        customDashboardWidgets: {
          name: 'Custom Dashboard Widgets',
          description: 'Create and customize dashboard widgets',
          warning: 'Experimental feature',
          requiresRestart: true
    },
    realtime: {
      title: 'Real-time Features',
      icon: <Notifications />,
      color: 'secondary',
      features: {
        realTimeNotifications: {
          name: 'Real-time Notifications',
          description: 'Live notifications for data changes',
          warning: 'Requires WebSocket connection',
          requiresRestart: false
        },
        liveDataSync: {
          name: 'Live Data Synchronization',
          description: 'Real-time data updates across all grids',
          warning: 'High bandwidth usage',
          requiresRestart: true
        },
        collaborativeEditing: {
          name: 'Collaborative Editing',
          description: 'Multiple users can edit simultaneously',
          warning: 'Beta feature - may have conflicts',
          requiresRestart: true
    },
    integration: {
      title: 'API & Integration',
      icon: <Api />,
      color: 'info',
      features: {
        apiIntegrations: {
          name: 'API Integrations',
          description: 'Connect with external APIs and services',
          warning: 'Requires API credentials configuration',
          requiresRestart: false
        },
        webhookSupport: {
          name: 'Webhook Support',
          description: 'Send and receive webhook notifications',
          warning: 'Requires server configuration',
          requiresRestart: true
        },
        customConnectors: {
          name: 'Custom Connectors',
          description: 'Build custom data connectors',
          warning: 'Advanced feature for developers',
          requiresRestart: true
    },
    developer: {
      title: 'Developer Tools',
      icon: <BugReport />,
      color: 'warning',
      features: {
        debugMode: {
          name: 'Debug Mode',
          description: 'Enable detailed logging and debugging',
          warning: 'May impact performance',
          requiresRestart: false
        },
        developerConsole: {
          name: 'Developer Console',
          description: 'Advanced developer tools and console',
          warning: 'For developers only',
          requiresRestart: false
        },
        performanceProfiler: {
          name: 'Performance Profiler',
          description: 'Monitor and profile application performance',
          warning: 'May slow down the application',
          requiresRestart: false
        },
        apiTesting: {
          name: 'API Testing Tools',
          description: 'Built-in API testing and debugging tools',
          warning: 'Developer feature',
          requiresRestart: false
    },
    experimental: {
      title: 'Experimental Features',
      icon: <Science />,
      color: 'error',
      features: {
        experimentalUI: {
          name: 'Experimental UI',
          description: 'Try new user interface components',
          warning: 'Unstable - may cause issues',
          requiresRestart: true
        },
        betaFeatures: {
          name: 'Beta Features',
          description: 'Access to beta and preview features',
          warning: 'Not recommended for production',
          requiresRestart: false
        },
        aiAssistant: {
          name: 'AI Assistant',
          description: 'AI-powered assistance and suggestions',
          warning: 'Requires AI service connection',
          requiresRestart: true
        },
        predictiveAnalytics: {
          name: 'Predictive Analytics',
          description: 'AI-powered predictive insights',
          warning: 'Experimental AI feature',
          requiresRestart: true
    },
    security: {
      title: 'Security & Compliance',
      icon: <Security />,
      color: 'success',
      features: {
        advancedSecurity: {
          name: 'Advanced Security',
          description: 'Enhanced security features and monitoring',
          warning: 'May require additional configuration',
          requiresRestart: true
        },
        auditTrail: {
          name: 'Audit Trail',
          description: 'Comprehensive audit logging',
          warning: 'Increases storage requirements',
          requiresRestart: false
        },
        dataEncryption: {
          name: 'Data Encryption',
          description: 'Enhanced data encryption at rest',
          warning: 'May impact performance',
          requiresRestart: true
        },
        complianceReporting: {
          name: 'Compliance Reporting',
          description: 'Generate compliance and regulatory reports',
          warning: 'Requires compliance configuration',
          requiresRestart: false
  };

  // Load feature flags on component mount
  useEffect(() => {
    const savedFlags = localStorage.getItem(`featureFlags_${user?.id}`);
    if(savedFlags) {
      setFeatureFlags(JSON.parse(savedFlags));
  }, [user]);

  const handleFeatureToggle = (featureKey, enabled) => {
    setFeatureFlags(prev => ({ ...prev,
      [featureKey]: enabled
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      localStorage.setItem(`featureFlags_${user?.id}`, JSON.stringify(featureFlags));
      
      if(onSettingsChange) {
        onSettingsChange({ featureFlags });
      setIsDirty(false);
      setShowSuccess(true);
    } catch(error: any) {
      console.error('Failed to save feature flags:', error);
      setShowError(true);
  };

  const handleReset = () => {
    const defaultFlags = Object.keys(featureFlags).reduce((acc: any key: any) => {
      acc[key] = false;
      return acc;
    }, {});
    
    setFeatureFlags(defaultFlags);
    setIsDirty(true);
  };

  const getEnabledFeaturesCount = () => {
    return Object.values(featureFlags).filter(Boolean).length;
  };

  const getFeaturesRequiringRestart = () => {
    const restartFeatures = [];
    Object.entries(featureCategories).forEach(([categoryKey, category]) => {
      Object.entries(category.features).forEach(([featureKey, feature]) => {
        if(featureFlags[featureKey] && feature.requiresRestart) {
          restartFeatures.push(feature.name);
      });
    });
    return restartFeatures;
  };

  const restartRequired = getFeaturesRequiringRestart().length > 0;

  return (
    <Box sx={{ display: "flex", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: "column", mb: 4 }}></
        <Typography variant="h5" sx={{ display: "flex", mb: 1, fontWeight: 600 }}>
          Feature Flags & Advanced Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enable experimental and advanced features for enhanced functionality
        </Typography>
        
        {/* Summary */}
        <Box sx={{ display: "flex", mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}></
          <Chip 
            icon={<Flag />} 
            label={`${getEnabledFeaturesCount()} features enabled`} 
            color
              icon={<Warning />} 
              label
          )}
        </Box>
      </Box>

      {/* Feature Categories */}
      {Object.entries(featureCategories).map(([categoryKey, category]: any) => (
        <Accordion key={categoryKey} defaultExpanded={categoryKey === 'advanced'}></
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {category.icon}
              <Typography variant="h6">{category.title}</Typography>
              <Chip size="small"
                label={Object.keys(category.features).filter((key: any) => featureFlags[key]).length}
                color={category.color}
                variant="outlined"
                <ListItem key={featureKey} divider></
                  <ListItemText primary
                      <Box sx={{ display: "flex", alignItems: 'center', gap: 1 }}></
                        <Typography variant="subtitle1" fontWeight={600}>
                          {feature.name}
                        </Typography>
                        {feature.requiresRestart && (
                          <Chip size="small" label="Restart" color="warning" variant="outlined" />
                        )}
                        {featureFlags[featureKey] && feature.warning && (
                          <Tooltip title={feature.warning}></
                            <Warning color="warning" fontSize="small" /></Warning>
                        )}
                      </Box>
                    secondary
                          {feature.description}
                        </Typography>
                        {feature.warning && featureFlags[featureKey] && (
                          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                            ⚠️ {feature.warning}
                          </Typography>
                        )}
                      </Box>
                  />
                  <ListItemSecondaryAction></
                    <Switch checked={featureFlags[featureKey]}
                      onChange={(e) => handleFeatureToggle(featureKey, e.target.checked)}
                      color={category.color}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Restart Warning */}
      {restartRequired && (
        <Alert severity="warning" sx={{ display: "flex", mt: 3 }}></
          <Typography variant="subtitle2" sx={{ display: "flex", mb: 1 }}>
            Application restart required
          </Typography>
          <Typography variant="outlined">
            The following features require an application restart to take effect:
          </Typography>
          <Box component="ul" sx={{ display: "flex", mt: 1, mb: 0 }}>
            {getFeaturesRequiringRestart().map((featureName, index) => (
              <li key={index}>
                <Typography variant="outlined">{featureName}</Typography>
              </li>
            ))}
          </Box>
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        justifyContent: 'flex-end',
        pt: 3,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 3
      }}></
        <Button
          variant="outlined"
          startIcon={<RestoreFromTrash />}
          onClick={handleReset}
        >
          Reset All
        </Button>
        <Button
          variant="outlined"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={!isDirty}
        >
          Save Feature Settings
        </Button>
      </Box>

      {/* Success/Error Notifications */}
      <Snackbar open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Feature flags saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar open={showError}
        autoHideDuration={5000}
        onClose={() => setShowError(false)}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          Failed to save feature flags. Please try again.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeatureFlags;
