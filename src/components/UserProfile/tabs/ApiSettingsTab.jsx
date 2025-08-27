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
    });
    
    const [expandedSection, setExpandedSection] = useState('magento');
    
    // API settings structure
    const [formData, setFormData] = useState({
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
            version: '2.4'
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
            version: '1.0'
        },
        general: {
            backendServer: '',
            globalTimeout: 30000,
            enableLogging: true,
            enableRetry: true,
            maxConcurrentRequests: 10
        }
    });

    // Initialize settings
    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                ...userData
            }));
        }
    }, [userData]);

    const handleInputChange = (service, field, value) => {
        const updatedFormData = {
            ...formData,
            [service]: {
                ...formData[service],
                [field]: value
            }
        };
        setFormData(updatedFormData);

        // Update parent component
        if (onUpdateUserData) {
            onUpdateUserData(updatedFormData);
        }
    };

    const handleTestConnection = async (service) => {
        setConnectionTests(prev => ({
            ...prev,
            [service]: { ...prev[service], testing: true, status: 'testing' }
        }));

        try {
            // Simulate connection test
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setConnectionTests(prev => ({
                ...prev,
                [service]: { 
                    ...prev[service], 
                    testing: false, 
                    status: 'success',
                    lastTest: new Date().toISOString()
                }
            }));
            
            toast.success(`${service} connection test successful!`);
        } catch (error) {
            setConnectionTests(prev => ({
                ...prev,
                [service]: { 
                    ...prev[service], 
                    testing: false, 
                    status: 'error',
                    lastTest: new Date().toISOString()
                }
            }));
            
            toast.error(`${service} connection test failed: ${error.message}`);
        }
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

            {/* Magento API Settings */}
            <Accordion 
                expanded={expandedSection === 'magento'} 
                onChange={() => setExpandedSection(expandedSection === 'magento' ? null : 'magento')}
                sx={{ 
                    mb: 2, 
                    boxShadow: 2,
                    '&:before': { display: 'none' },
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <AccordionSummary 
                    expandIcon={<ExpandMore />}
                    sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        minHeight: 64,
                        '&:hover': { bgcolor: 'primary.dark' },
                        '& .MuiAccordionSummary-content': { alignItems: 'center' }
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
                                        }
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
                            severity={formData.magento.enableDirectConnection ? "success" : "info"}
                            icon={formData.magento.enableDirectConnection ? <Security /> : <Api />}
                        >
                            <Typography variant="body2">
                                <strong>{formData.magento.enableDirectConnection ? 'Direct Mode:' : 'Proxy Mode:'}</strong>
                                {' '}
                                {formData.magento.enableDirectConnection 
                                    ? 'Frontend connects directly to Magento API (requires CORS setup)'
                                    : 'Requests are proxied through the backend server'
                                }
                            </Typography>
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
                    overflow: 'hidden'
                }}
            >
                <AccordionSummary 
                    expandIcon={<ExpandMore />}
                    sx={{ 
                        bgcolor: 'secondary.main', 
                        color: 'white',
                        minHeight: 64,
                        '&:hover': { bgcolor: 'secondary.dark' },
                        '& .MuiAccordionSummary-content': { alignItems: 'center' }
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
                                        }
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
        </Box>
    );
};

export default ApiSettingsTab;