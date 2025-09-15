import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid2 as Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
} from '@mui/material';
import {
  ExpandMore,
  Api,
  CheckCircle,
  Error,
  Security,
} from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';
import { toast } from 'react-toastify';

/**
 * API Settings Management Component
 * Provides configuration for API endpoints and database connections
 */
const ApiSettingsTab = ({ userData, onUpdateUserData, loading, error }) => {
  const { translate } = useLanguage();

  // Connection test states
  const [connectionTests, setConnectionTests] = useState({
    magento: { testing: false, status: null, lastTest: null },
    cegid: { testing: false, status: null, lastTest: null },
    mdm: { testing: false, status: null, lastTest: null },
  });

  const [expandedSection, setExpandedSection] = useState('mdm');

  // API settings structure
  const [formData, setFormData] = useState({
    mdm: {
      enabled: true,
      name: 'MDM System API',
      description: 'Master Data Management system for centralized data',
      url: '',
      apiKey: '',
      authMode: 'apikey',
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      timeout: 30000,
      retryAttempts: 3,
      version: '1.0',
      endpoints: {
        products: '/api/v1/products',
        categories: '/api/v1/categories',
        stocks: '/api/v1/stocks',
        sources: '/api/v1/sources',
        analytics: '/api/v1/analytics',
      },
    },
    magento: {
      enabled: true,
      name: 'Magento API',
      description: 'E-commerce platform integration',
      url: '',
      username: '',
      password: '',
      authMode: 'basic',
      consumerKey: '',
      consumerSecret: '',
      accessToken: '',
      accessTokenSecret: '',
      enableDirectConnection: false,
      timeout: 30000,
      retryAttempts: 3,
      version: '2.4',
    },
    cegid: {
      enabled: false,
      name: 'CEGID API',
      description: 'ERP system integration',
      url: '',
      username: '',
      password: '',
      database: '',
      timeout: 30000,
      retryAttempts: 3,
      version: '1.0',
    },
    general: {
      backendServer: '',
      globalTimeout: 30000,
      enableLogging: true,
      enableRetry: true,
      maxConcurrentRequests: 10,
    },
  });

  // Initialize settings
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        ...userData,
      }));
    }
  }, [userData]);

  const handleInputChange = (service, field, value) => {
    const updatedFormData = {
      ...formData,
      [service]: {
        ...formData[service],
        [field]: value,
      },
    };

    setFormData(updatedFormData);

    // Update parent component
    if (onUpdateUserData) {
      onUpdateUserData(updatedFormData);
    }
  };

  const handleTestConnection = async (service) => {
    // Validate required fields before testing
    const validation = validateServiceConfig(service);

    if (!validation.isValid) {
      toast.error(`Configuration incomplete: ${validation.errors.join(', ')}`);

      return;
    }

    setConnectionTests(prev => ({
      ...prev,
      [service]: { ...prev[service], testing: true, status: 'testing' },
    }));

    try {
      let testResult;

      switch (service) {
      case 'mdm':
        testResult = await testMDMConnection();
        break;
      case 'magento':
        testResult = await testMagentoConnection();
        break;
      case 'cegid':
        testResult = await testCegidConnection();
        break;
      default:
        throw new Error(`Unknown service: ${service}`);
      }

      setConnectionTests(prev => ({
        ...prev,
        [service]: {
          ...prev[service],
          testing: false,
          status: 'success',
          lastTest: new Date().toISOString(),
          details: testResult,
        },
      }));

      toast.success(`${service.toUpperCase()} connection test successful!`);
    } catch (error) {
      setConnectionTests(prev => ({
        ...prev,
        [service]: {
          ...prev[service],
          testing: false,
          status: 'error',
          lastTest: new Date().toISOString(),
          error: error.message,
        },
      }));

      toast.error(`${service.toUpperCase()} connection test failed: ${error.message}`);
    }
  };

  // Validation function for service configurations
  const validateServiceConfig = (service) => {
    const errors = [];
    const config = formData[service];

    if (!config.enabled) {
      errors.push(`${service} is disabled`);

      return { isValid: false, errors };
    }

    switch (service) {
    case 'mdm':
      if (!config.url) errors.push('MDM URL is required');
      if (!config.apiKey) errors.push('API Key is required');
      break;
    case 'magento':
      if (!config.url) errors.push('Magento URL is required');
      if (config.authMode === 'basic') {
        if (!config.username) errors.push('Username is required');
        if (!config.password) errors.push('Password is required');
      } else if (config.authMode === 'oauth') {
        if (!config.consumerKey) errors.push('Consumer Key is required');
        if (!config.consumerSecret) errors.push('Consumer Secret is required');
        if (!config.accessToken) errors.push('Access Token is required');
        if (!config.accessTokenSecret) errors.push('Access Token Secret is required');
      }
      break;
    case 'cegid':
      if (!config.url) errors.push('CEGID URL is required');
      if (!config.username) errors.push('Username is required');
      if (!config.password) errors.push('Password is required');
      if (!config.database) errors.push('Database is required');
      break;
    }

    return { isValid: errors.length === 0, errors };
  };

  // Individual connection test functions
  const testMDMConnection = async () => {
    const config = formData.mdm;

    // Simulate MDM API test
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In real implementation, this would make an actual API call
    if (!config.url.startsWith('http')) {
      throw new Error('Invalid URL format');
    }

    return {
      responseTime: '150ms',
      version: config.version,
      endpoints: Object.keys(config.endpoints).length,
    };
  };

  const testMagentoConnection = async () => {
    const config = formData.magento;

    // Simulate Magento API test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In real implementation, this would make an actual API call
    if (!config.url.includes('rest')) {
      throw new Error('URL should include REST API path (e.g., /rest/V1)');
    }

    return {
      responseTime: '250ms',
      version: config.version,
      authMode: config.authMode,
      directConnection: config.enableDirectConnection,
    };
  };

  const testCegidConnection = async () => {
    const config = formData.cegid;

    // Simulate CEGID API test
    await new Promise(resolve => setTimeout(resolve, 1800));

    return {
      responseTime: '300ms',
      version: config.version,
      database: config.database,
    };
  };

  // Connection status indicator component
  const ConnectionStatus = ({ service, status }) => {
    const getStatusColor = () => {
      switch (status?.status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'testing': return 'warning';
      default: return 'default';
      }
    };

    const getStatusIcon = () => {
      switch (status?.status) {
      case 'success': return <CheckCircle fontSize="small" />;
      case 'error': return <Error fontSize="small" />;
      case 'testing': return <CircularProgress size={16} />;
      default: return <Api fontSize="small" />;
      }
    };

    return (
      <Chip
        icon={getStatusIcon()}
        label={status?.testing ? 'Testing...' : (status?.status || 'Not tested')}
        color={getStatusColor()}
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Api color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            API Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary">
                            Configure connections to external services and databases
            </Typography>
          </Box>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* MDM System Settings */}
      <Accordion
        expanded={expandedSection === 'mdm'}
        onChange={() => setExpandedSection(expandedSection === 'mdm' ? null : 'mdm')}
        sx={{
          mb: 2,
          boxShadow: 2,
          '&:before': { display: 'none' },
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            bgcolor: 'success.main',
            color: 'white',
            minHeight: 64,
            '&:hover': { bgcolor: 'success.dark' },
            '& .MuiAccordionSummary-content': { alignItems: 'center' },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
            <Api sx={{ fontSize: 28 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                MDM System API
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Master Data Management - Primary data source
              </Typography>
            </Box>
            <ConnectionStatus service="mdm" status={connectionTests.mdm} />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.mdm.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleInputChange('mdm', 'enabled', e.target.checked);
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'white',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                />
              }
              label="Enabled"
              sx={{ color: 'white', mr: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* MDM Info */}
            <Alert
              severity="info"
              icon={<Api />}
            >
              <Typography variant="body2">
                <strong>MDM System:</strong>
                {' '}
                                Central data repository for products, categories, and analytics.
                                This is the primary data source for dashboard widgets and reporting.
              </Typography>
            </Alert>

            {/* Basic Settings */}
            <Card sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'success.main', fontWeight: 600 }}>
                                    MDM Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} md={8}>
                    <TextField
                      size="small"
                      fullWidth
                      label="MDM API Base URL"
                      value={formData.mdm.url}
                      onChange={(e) => handleInputChange('mdm', 'url', e.target.value)}
                      placeholder="https://mdm-server.com/api"
                      disabled={loading || !formData.mdm.enabled}
                    />
                  </Grid>
                  <Grid xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Authentication</InputLabel>
                      <Select
                        value={formData.mdm.authMode}
                        onChange={(e) => handleInputChange('mdm', 'authMode', e.target.value)}
                        label="Authentication"
                        disabled={loading || !formData.mdm.enabled}
                      >
                        <MenuItem value="apikey">API Key</MenuItem>
                        <MenuItem value="bearer">Bearer Token</MenuItem>
                        <MenuItem value="basic">Basic Auth</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12}>
                    <TextField
                      size="small"
                      fullWidth
                      type="password"
                      label="API Key / Token"
                      value={formData.mdm.apiKey}
                      onChange={(e) => handleInputChange('mdm', 'apiKey', e.target.value)}
                      placeholder="Enter your MDM API key or token"
                      disabled={loading || !formData.mdm.enabled}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'success.main', fontWeight: 600 }}>
                                    Performance Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      label="Cache Timeout (ms)"
                      value={formData.mdm.cacheTimeout}
                      onChange={(e) => handleInputChange('mdm', 'cacheTimeout', parseInt(e.target.value))}
                      disabled={loading || !formData.mdm.enabled}
                      helperText="How long to cache MDM responses"
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      label="Request Timeout (ms)"
                      value={formData.mdm.timeout}
                      onChange={(e) => handleInputChange('mdm', 'timeout', parseInt(e.target.value))}
                      disabled={loading || !formData.mdm.enabled}
                      helperText="Request timeout duration"
                    />
                  </Grid>
                  <Grid xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.mdm.enableCaching}
                          onChange={(e) => handleInputChange('mdm', 'enableCaching', e.target.checked)}
                          disabled={loading || !formData.mdm.enabled}
                        />
                      }
                      label="Enable Response Caching"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Test Connection Button */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleTestConnection('mdm')}
                disabled={loading || connectionTests.mdm.testing || !formData.mdm.enabled}
                startIcon={connectionTests.mdm.testing ? <CircularProgress size={16} /> : <Api />}
              >
                {connectionTests.mdm.testing ? 'Testing...' : 'Test MDM Connection'}
              </Button>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Magento API Settings */}
      <Accordion
        expanded={expandedSection === 'magento'}
        onChange={() => setExpandedSection(expandedSection === 'magento' ? null : 'magento')}
        sx={{
          mb: 2,
          boxShadow: 2,
          '&:before': { display: 'none' },
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            minHeight: 64,
            '&:hover': { bgcolor: 'primary.dark' },
            '& .MuiAccordionSummary-content': { alignItems: 'center' },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
            <Api sx={{ fontSize: 28 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Magento E-commerce API
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {formData.magento.enableDirectConnection ? '🚀 Direct Connection' : '📡 Proxy Connection'}
              </Typography>
            </Box>
            <ConnectionStatus service="magento" status={connectionTests.magento} />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.magento.enableDirectConnection}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleInputChange('magento', 'enableDirectConnection', e.target.checked);
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'white',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                />
              }
              label="Direct"
              sx={{ color: 'white', mr: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Connection Mode Info */}
            <Alert
              severity={formData.magento.enableDirectConnection ? 'warning' : 'info'}
              icon={formData.magento.enableDirectConnection ? <Security /> : <Api />}
            >
              <Typography variant="body2">
                <strong>{formData.magento.enableDirectConnection ? 'Direct Mode:' : 'Proxy Mode:'}</strong>
                {' '}
                {formData.magento.enableDirectConnection
                  ? 'Frontend connects directly to Magento API. Requires CORS configuration on your Magento server and exposes credentials to the browser.'
                  : 'Requests are securely proxied through the backend server (recommended for production)'
                }
              </Typography>
              {formData.magento.enableDirectConnection && (
                <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                                    ⚠️ Security Notice: Direct mode exposes API credentials in the browser. Only use for development or if CORS is properly configured.
                </Typography>
              )}
            </Alert>

            {/* Basic Settings */}
            <Card sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                                    Basic Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} md={8}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Magento API URL"
                      value={formData.magento.url}
                      onChange={(e) => handleInputChange('magento', 'url', e.target.value)}
                      placeholder="https://your-store.com/rest/V1"
                      disabled={loading}
                    />
                  </Grid>
                  <Grid xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Authentication Mode</InputLabel>
                      <Select
                        value={formData.magento.authMode}
                        onChange={(e) => handleInputChange('magento', 'authMode', e.target.value)}
                        label="Authentication Mode"
                        disabled={loading}
                      >
                        <MenuItem value="basic">Basic Auth</MenuItem>
                        <MenuItem value="oauth">OAuth 1.0</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Admin Username"
                      value={formData.magento.username}
                      onChange={(e) => handleInputChange('magento', 'username', e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      size="small"
                      fullWidth
                      type="password"
                      label="Admin Password"
                      value={formData.magento.password}
                      onChange={(e) => handleInputChange('magento', 'password', e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* OAuth Configuration (when OAuth mode is selected) */}
            {formData.magento.authMode === 'oauth' && (
              <Card sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2, border: '1px solid', borderColor: 'warning.200' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: 'warning.main', fontWeight: 600 }}>
                                        OAuth 1.0 Configuration
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                                            OAuth provides more secure authentication. You need to create an integration in Magento Admin → System → Extensions → Integrations.
                    </Typography>
                  </Alert>
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={6}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Consumer Key"
                        value={formData.magento.consumerKey}
                        onChange={(e) => handleInputChange('magento', 'consumerKey', e.target.value)}
                        disabled={loading}
                        placeholder="From Magento Integration"
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <TextField
                        size="small"
                        fullWidth
                        type="password"
                        label="Consumer Secret"
                        value={formData.magento.consumerSecret}
                        onChange={(e) => handleInputChange('magento', 'consumerSecret', e.target.value)}
                        disabled={loading}
                        placeholder="From Magento Integration"
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Access Token"
                        value={formData.magento.accessToken}
                        onChange={(e) => handleInputChange('magento', 'accessToken', e.target.value)}
                        disabled={loading}
                        placeholder="From Magento Integration"
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <TextField
                        size="small"
                        fullWidth
                        type="password"
                        label="Access Token Secret"
                        value={formData.magento.accessTokenSecret}
                        onChange={(e) => handleInputChange('magento', 'accessTokenSecret', e.target.value)}
                        disabled={loading}
                        placeholder="From Magento Integration"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Test Connection Button */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => handleTestConnection('magento')}
                disabled={loading || connectionTests.magento.testing}
                startIcon={connectionTests.magento.testing ? <CircularProgress size={16} /> : <Api />}
              >
                {connectionTests.magento.testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* CEGID API Settings */}
      <Accordion
        expanded={expandedSection === 'cegid'}
        onChange={() => setExpandedSection(expandedSection === 'cegid' ? null : 'cegid')}
        sx={{
          mb: 2,
          boxShadow: 2,
          '&:before': { display: 'none' },
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            minHeight: 64,
            '&:hover': { bgcolor: 'secondary.dark' },
            '& .MuiAccordionSummary-content': { alignItems: 'center' },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
            <Api sx={{ fontSize: 28 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                CEGID ERP API
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Enterprise Resource Planning integration
              </Typography>
            </Box>
            <ConnectionStatus service="cegid" status={connectionTests.cegid} />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.cegid.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleInputChange('cegid', 'enabled', e.target.checked);
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'white',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                />
              }
              label="Enabled"
              sx={{ color: 'white', mr: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'secondary.main', fontWeight: 600 }}>
                                    CEGID Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12}>
                    <TextField
                      size="small"
                      fullWidth
                      label="CEGID API URL"
                      value={formData.cegid.url}
                      onChange={(e) => handleInputChange('cegid', 'url', e.target.value)}
                      placeholder="https://your-cegid-server.com/api"
                      disabled={loading || !formData.cegid.enabled}
                    />
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Username"
                      value={formData.cegid.username}
                      onChange={(e) => handleInputChange('cegid', 'username', e.target.value)}
                      disabled={loading || !formData.cegid.enabled}
                    />
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <TextField
                      size="small"
                      fullWidth
                      type="password"
                      label="Password"
                      value={formData.cegid.password}
                      onChange={(e) => handleInputChange('cegid', 'password', e.target.value)}
                      disabled={loading || !formData.cegid.enabled}
                    />
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Database"
                      value={formData.cegid.database}
                      onChange={(e) => handleInputChange('cegid', 'database', e.target.value)}
                      disabled={loading || !formData.cegid.enabled}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Test Connection Button */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleTestConnection('cegid')}
                disabled={loading || connectionTests.cegid.testing || !formData.cegid.enabled}
                startIcon={connectionTests.cegid.testing ? <CircularProgress size={16} /> : <Api />}
              >
                {connectionTests.cegid.testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* General Settings */}
      <Accordion
        expanded={expandedSection === 'general'}
        onChange={() => setExpandedSection(expandedSection === 'general' ? null : 'general')}
        sx={{
          mb: 2,
          boxShadow: 2,
          '&:before': { display: 'none' },
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            bgcolor: 'grey.700',
            color: 'white',
            minHeight: 64,
            '&:hover': { bgcolor: 'grey.800' },
            '& .MuiAccordionSummary-content': { alignItems: 'center' },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
            <Security sx={{ fontSize: 28 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                General API Settings
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Backend server and global configuration
              </Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'grey.700', fontWeight: 600 }}>
                                    Backend Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Backend Server URL"
                      value={formData.general.backendServer}
                      onChange={(e) => handleInputChange('general', 'backendServer', e.target.value)}
                      placeholder="https://your-backend-server.com"
                      disabled={loading}
                      helperText="URL of your backend server for API proxying"
                    />
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      label="Global Timeout (ms)"
                      value={formData.general.globalTimeout}
                      onChange={(e) => handleInputChange('general', 'globalTimeout', parseInt(e.target.value))}
                      disabled={loading}
                      helperText="Default timeout for all API requests"
                    />
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      label="Max Concurrent Requests"
                      value={formData.general.maxConcurrentRequests}
                      onChange={(e) => handleInputChange('general', 'maxConcurrentRequests', parseInt(e.target.value))}
                      disabled={loading}
                      helperText="Maximum parallel API requests"
                    />
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <Box sx={{ pt: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.general.enableLogging}
                            onChange={(e) => handleInputChange('general', 'enableLogging', e.target.checked)}
                            disabled={loading}
                          />
                        }
                        label="Enable API Logging"
                      />
                    </Box>
                  </Grid>
                  <Grid xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.general.enableRetry}
                          onChange={(e) => handleInputChange('general', 'enableRetry', e.target.checked)}
                          disabled={loading}
                        />
                      }
                      label="Enable Automatic Retry on Failure"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Connection Status Summary */}
            <Card sx={{ p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'info.main', fontWeight: 600 }}>
                                    Connection Status Summary
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">MDM System:</Typography>
                    <ConnectionStatus service="mdm" status={connectionTests.mdm} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Magento API:</Typography>
                    <ConnectionStatus service="magento" status={connectionTests.magento} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">CEGID API:</Typography>
                    <ConnectionStatus service="cegid" status={connectionTests.cegid} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ApiSettingsTab;
