import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Collapse,
    Typography,
    Divider,
    Alert,
    CircularProgress,
    FormControlLabel,
    Switch,
    Card,
    CardContent,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Stack,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    ExpandMore,
    Settings,
    Api,
    Storage as Database,
    Sync,
    CheckCircle,
    Error,
    Info,
    Warning,
    Refresh,
    Security,
    CloudSync
} from '@mui/icons-material';
import axios from 'axios';
import { useProfileController } from '../ProfileController';
import { useLanguage } from '../../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import cegidApi from '../../../services/cegidService';
import magentoService from '../../../services/magentoService';
import directMagentoClient from '../../../services/directMagentoClient';

/**
 * Professional API Settings Management Component
 * Provides unified configuration for all API endpoints and database connections
 */
const ApiSettingsTab = () => {
    const { userData, updateUserData, loading } = useProfileController();
    const { translate } = useLanguage();
    
    // Connection test states
    const [connectionTests, setConnectionTests] = useState({
        magento: { testing: false, status: null, lastTest: null },
        cegid: { testing: false, status: null, lastTest: null },
        cegidDb: { testing: false, status: null, lastTest: null },
        mdmDb: { testing: false, status: null, lastTest: null }
    });
    
    const [expandedSection, setExpandedSection] = useState('magento');
    const [isDirty, setIsDirty] = useState(false);
    // Professional API settings structure with validation and metadata
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
        databases: {
            cegid: {
                enabled: false,
                name: 'CEGID Database',
                description: 'Direct database connection for CEGID',
                type: 'mssql',
                server: '',
                username: '',
                password: '',
                database: '',
                port: 1433,
                connectionTimeout: 15000,
                requestTimeout: 30000,
                options: {
                    encrypt: true,
                    trustServerCertificate: true,
                    enableArithAbort: true,
                    instanceName: ''
                }
            },
            mdm: {
                enabled: false,
                name: 'MDM Database',
                description: 'Master Data Management database',
                type: 'mssql',
                server: '',
                username: '',
                password: '',
                database: '',
                port: 1433,
                connectionTimeout: 15000,
                requestTimeout: 30000,
                options: {
                    encrypt: true,
                    trustServerCertificate: true,
                    enableArithAbort: true,
                    instanceName: ''
                }
            }
        },
        general: {
            backendServer: '',
            globalTimeout: 30000,
            enableLogging: true,
            enableRetry: true,
            maxConcurrentRequests: 10
        }
    });

    // Professional settings initialization with environment variable support
    const initializeSettings = useCallback(() => {
        const remoteSettings = userData?.apiSettings;
        const localApiSettings = JSON.parse(localStorage.getItem('userApiSettings') || '{}');
        const unifiedSettings = JSON.parse(localStorage.getItem('techno-etl-settings') || '{}');
        
        console.log('🔄 Initializing API settings from sources:', { remoteSettings, localApiSettings, unifiedSettings });
        
        if(remoteSettings || localApiSettings.magento || unifiedSettings.apiSettings) {
            setFormData(prevData => ({ ...prevData,
                magento: { ...prevData.magento,
                    url: remoteSettings?.magento?.url || localApiSettings?.magento?.url || import.meta.env.VITE_MAGENTO_API_URL || '',
                    username: remoteSettings?.magento?.username || localApiSettings?.magento?.username || import.meta.env.VITE_MAGENTO_ADMIN_USERNAME || '',
                    password: remoteSettings?.magento?.password || localApiSettings?.magento?.password || import.meta.env.VITE_MAGENTO_ADMIN_PASSWORD || '',
                    authMode: remoteSettings?.magento?.authMode || localApiSettings?.magento?.authMode || 'basic',
                    consumerKey: remoteSettings?.magento?.consumerKey || localApiSettings?.magento?.consumerKey || import.meta.env.VITE_MAGENTO_CONSUMER_KEY || '',
                    consumerSecret: remoteSettings?.magento?.consumerSecret || localApiSettings?.magento?.consumerSecret || import.meta.env.VITE_MAGENTO_CONSUMER_SECRET || '',
                    accessToken: remoteSettings?.magento?.accessToken || localApiSettings?.magento?.accessToken || import.meta.env.VITE_MAGENTO_ACCESS_TOKEN || '',
                    accessTokenSecret: remoteSettings?.magento?.accessTokenSecret || localApiSettings?.magento?.accessTokenSecret || import.meta.env.VITE_MAGENTO_ACCESS_TOKEN_SECRET || '',
                    enableDirectConnection: remoteSettings?.magento?.enableDirectConnection || localApiSettings?.magento?.enableDirectConnection || unifiedSettings?.enableDirectConnection || false
                },
                cegid: { ...prevData.cegid,
                    enabled: remoteSettings?.cegid?.enabled || false,
                    url: remoteSettings?.cegid?.url || import.meta.env.VITE_Cegid_API_URL || '',
                    username: remoteSettings?.cegid?.username || import.meta.env.VITE_Cegid_ADMIN_USERNAME || '',
                    password: remoteSettings?.cegid?.password || import.meta.env.VITE_Cegid_ADMIN_PASSWORD || '',
                    database: remoteSettings?.cegid?.database || import.meta.env.VITE_Cegid_ADMIN_DATABASE || ''
                },
                databases: { ...prevData.databases,
                    cegid: { ...prevData.databases.cegid,
                        enabled: remoteSettings?.databases?.cegid?.enabled || false,
                        server: remoteSettings?.databases?.cegid?.server || import.meta.env.VITE_SQL_CEGID_SERVER || '',
                        username: remoteSettings?.databases?.cegid?.username || import.meta.env.VITE_SQL_CEGID_SERVER_USER || '',
                        password: remoteSettings?.databases?.cegid?.password || import.meta.env.VITE_SQL_CEGID_SERVER_PASSWORD || '',
                        database: remoteSettings?.databases?.cegid?.database || import.meta.env.VITE_SQL_CEGID_SERVER_DATABASE || '',
                        options: { ...prevData.databases.cegid.options,
                            instanceName: remoteSettings?.databases?.cegid?.options?.instanceName || import.meta.env.VITE_SQL_CEGID_SERVER_INSTANCE || ''
                        }
                    },
                    mdm: { ...prevData.databases.mdm,
                        enabled: remoteSettings?.databases?.mdm?.enabled || false,
                        server: remoteSettings?.databases?.mdm?.server || import.meta.env.VITE_SQL_MDM_SERVER || '',
                        username: remoteSettings?.databases?.mdm?.username || import.meta.env.VITE_SQL_MDM_SERVER_USER || '',
                        password: remoteSettings?.databases?.mdm?.password || import.meta.env.VITE_SQL_MDM_SERVER_PASSWORD || '',
                        database: remoteSettings?.databases?.mdm?.database || import.meta.env.VITE_SQL_MDM_SERVER_DATABASE || '',
                        options: { ...prevData.databases.mdm.options,
                            instanceName: remoteSettings?.databases?.mdm?.options?.instanceName || import.meta.env.VITE_SQL_MDM_SERVER_INSTANCE || ''
                        }
                    }
                },
                general: { ...prevData.general,
                    backendServer: remoteSettings?.general?.backendServer || import.meta.env.VITE_BACKEND_SERVER || ''
                }
            }));
        }
    }, [userData?.apiSettings]);
    
    useEffect(() => {
        initializeSettings();
    }, [initializeSettings]);

    const handleInputChange = (service, field, value) => {
        const updatedFormData = { ...formData,
            [service]: { ...formData[service],
                [field]: value
            }
        };
            setFormData(updatedFormData);

            // Toggle fields visibility based on enableDirectConnection
            if(service === 'magento' && field === 'enableDirectConnection') {
                if(!value) {
                    updatedFormData.magento.consumerKey = '';
                    updatedFormData.magento.consumerSecret = '';
                    updatedFormData.magento.accessToken = '';
                    updatedFormData.magento.accessTokenSecret = '';
                }
            }

        console.log('🔄 API Setting changed:', { service, field, value });

        // Save to multiple storage locations for persistence
        try {
            // 1. Save to userApiSettings (legacy)
            localStorage.setItem('userApiSettings', JSON.stringify(updatedFormData));
            
            // 2. Save to unified settings
            const unifiedSettings = JSON.parse(localStorage.getItem('techno-etl-settings') || '{}');
            unifiedSettings.apiSettings = updatedFormData;
            if(service === 'magento' && field === 'enableDirectConnection') {
                unifiedSettings.enableDirectConnection = value;
            }
            localStorage.setItem('techno-etl-settings', JSON.stringify(unifiedSettings));
            
            // 3. Update context
            updateUserData(updatedFormData, 'apiSettings');
            
            // 4. If this is a Magento setting change, update the service configurations
            if(service === 'magento') {
                try {
                    // Update unifiedMagentoService
                    import('../../../services/unifiedMagentoService').then(({ default: unifiedMagentoService }) => {
                        unifiedMagentoService.initialize(updatedFormData.magento);
                        console.log('✅ UnifiedMagentoService updated with new settings');
                    });
                    
                    // Update legacy magentoService
                    magentoService.updateConfiguration(updatedFormData.magento);
                } catch(error: any) {
                    console.error('Failed to update Magento service configuration:', error);
                }
            }
            
            console.log('✅ Settings saved to all locations');
        } catch(error: any) {
            console.error('❌ Failed to save settings:', error);
        }
    };

    const handleDbInputChange = (dbType, field, value) => {
        const updatedFormData = { ...formData,
            DB: { ...formData?.DB,
                [dbType]: { ...formData?.DB[dbType],
                    [field]: value
                }
            }
        };
        setFormData(updatedFormData);

        // Only update local storage
        localStorage.setItem('userApiSettings', JSON.stringify(updatedFormData));
    };

    // Helper function to update connection test state
    const updateConnectionTest = useCallback((service, updates) => {
        setConnectionTests(prev => ({ ...prev,
            [service]: { ...prev[service],
                ...updates
            }
        }));
    }, []);

    const handleMagentoBasicAuth = async () => {
        try {
            updateConnectionTest('magento', { testing: true, status: 'testing' });
            
            // Validate required fields
            if(!formData.magento.url || !formData.magento.username || !formData.magento.password) {
                toast.error('Please fill in all required fields (URL, Username, Password)');
                return;
            }
            
            let token;
            
            // If direct connection is enabled, use direct client
            if(formData.magento.enableDirectConnection) {
                console.log('🔄 Using direct connection for login');
                // Initialize direct client with current settings
                directMagentoClient.initialize(formData.magento);
                token: any,
                    formData.magento.password
                );
            } else {
                console.log('🔄 Using backend proxy for login');
                // Use backend proxy (original magentoService login)
                token: any,
                    formData.magento.password,
                    formData.magento.url
                );
            }
            
            // Update form data and context with the received token
            handleInputChange('magento', 'accessToken', token);
            updateUserData({ magento: { ...formData.magento, accessToken: token } }, 'apiSettings');
            
            const successMessage = formData.magento.enableDirectConnection 
                ? 'Successfully obtained access token via direct connection!' 
                : 'Successfully obtained access token via backend proxy!';
            toast.success(successMessage);
            
        } catch(error: any) {
            console.error('Magento authentication error:', error);
            const errorMessage = error.message || 'Failed to authenticate with Magento';
            toast.error(errorMessage);
        } finally {
            updateConnectionTest('magento', { testing: false, lastTest: new Date().toISOString() });
        }
    };

    const handleMagentoOAuthConnect = async () => {
        try {
            updateConnectionTest('magento', { testing: true, status: 'testing' });
            const success = await magentoApi.connectOAuth(
                formData.magento.url,
                formData.magento.consumerKey,
                formData.magento.consumerSecret,
                formData.magento.accessToken,
                formData.magento.accessTokenSecret
            );
            if(success) {
                toast.success(translate('profile.apiSettings.magento.oauthSuccess'));
            }
        } catch(error: any) {
            console.error('Magento OAuth error:', error);
            toast.error(error.message || translate('profile.apiSettings.magento.oauthError'));
        } finally {
            updateConnectionTest('magento', { testing: false, lastTest: new Date().toISOString() });
        }
    };

    const handleTestCegidConnection = async () => {
        try {
            updateConnectionTest('cegid', { testing: true, status: 'testing' });
            await cegidApi.handleCegidConnect(
                formData.cegid.url,
                formData.cegid.username,
                formData.cegid.password,
                formData.cegid.database
            );
            toast.success(translate('profile.apiSettings.cegid.testSuccess'));
        } catch(error: any) {
            console.error('Cegid connection error:', error);
            toast.error(error.message || translate('profile.apiSettings.cegid.testError'));
        } finally {
            updateConnectionTest('cegid', { testing: false, lastTest: new Date().toISOString() });
        }
    };

    const handleCegidDbConnection = async () => {
        try {
            updateConnectionTest('cegidDb', { testing: true, status: 'testing' });
            // Here you would implement your SQL Server connection test logic for CEGID
            // This might involve using a library like 'mssql' or a custom API call.

 
            try {
                // Send DB config from frontend to backend
                const dbConfig = {
                    server: formData?.DB.CEGID.server,
                    user: formData?.DB.CEGID.username,
                    password: formData?.DB.CEGID.password,
                    database: formData?.DB.CEGID.database,
                    options: {
                        encrypt: true,
                        trustServerCertificate: true
                    }
                };
               
                const response = await axios.post('api/cegid/connect', dbConfig); // POST request to backend
                console.log("Testing CEGID DB Connection:", formData?.DB.CEGID);  // Placeholder
                toast.success(translate('profile.apiSettings.cegidDb.testSuccess'));
                console.log('CEGID DB Tables:', response.data);
            } catch(error: any) {
                console.error('CEGID DB Test Failed:', error);
            } finally {
                updateConnectionTest('cegidDb', { testing: false, lastTest: new Date().toISOString() });
            }


        } catch(error: any) {
            console.error('CEGID DB connection error:', error);
            toast.error(error.message || translate('profile.apiSettings.cegidDb.testError'));
        } finally {
            updateConnectionTest('cegidDb', { testing: false, lastTest: new Date().toISOString() });
        }
    };

    const handleMdmDbConnection = async () => {
        try {
            updateConnectionTest('mdmDb', { testing: true, status: 'testing' });
            try {
                // Send DB config from frontend to backend
                const dbConfig = {
                    server: formData?.DB.MDM.server,
                    user: formData?.DB.MDM.username,
                    password: formData?.DB.MDM.password,
                    database: formData?.DB.MDM.database,
                    options: {
                        encrypt: true,
                        trustServerCertificate: true
                    }
                };

                const response = await axios.post('api/mdm/connect', dbConfig); // POST request to backend
                console.log("Testing MDM DB Connection:", formData?.DB.MDM);  // Placeholder
                toast.success(translate('profile.apiSettings.mdmDb.testSuccess'));
                console.log('MDM DB Tables:', response.data);
            } catch(error: any) {
                console.error('MDM DB Test Failed:', error);
            } finally {
                updateConnectionTest('mdmDb', { testing: false, lastTest: new Date().toISOString() });
            }
        } catch(error: any) {
            console.error('MDM DB connection error:', error);
            toast.error(error.message || translate('profile.apiSettings.mdmDb.testError'));
        } finally {
            updateConnectionTest('mdmDb', { testing: false, lastTest: new Date().toISOString() });
        }
    };

    // Connection status indicator component
    const ConnectionStatus: React.FC<any> = ({ service, status }) => {
        const getStatusColor = () => {
            switch(status?.status) {
                case 'success': return 'success';
                case 'error': return 'error';
                case 'testing': return 'warning';
                default: return 'default';
            }
        };
        
        const getStatusIcon = () => {
            switch(status?.status) {
                case 'success': return <CheckCircle fontSize="small" />;
                case 'error': return <Error fontSize="small" />;
                case 'testing': return <CircularProgress size={16} />;
                default: return <Database fontSize="small" />;
            }
        };
        
        return (
            <Chip
                icon={getStatusIcon()}
                label={status?.testing ? 'Testing...' : (status?.status || 'Not tested')}
                color={getStatusColor()}
                size: any,
    };

    return(<Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 } as any}>
            {/* Header */}
            <Box sx={{ mb: 4 } as any}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 } as any}>
                    <Api color="primary" sx={{ fontSize: 32 } as any} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' } as any}>
                            API Configuration
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Configure connections to external services and databases
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Magento API Settings */}
            <Accordion 
                expanded={expandedSection === 'magento'} 
                onChange={(e) => () => setExpandedSection(expandedSection === 'magento' ? null : 'magento')}
                sx: any,
                    boxShadow: 2,
                    '&:before': { display: 'none' },
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <AccordionSummary 
                    expandIcon={<ExpandMore />}
                    sx: any,
                        color: 'white',
                        minHeight: 64,
                        '&:hover': { bgcolor: 'primary.dark' },
                        '& .MuiAccordionSummary-content': { alignItems: 'center' }
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 } as any}>
                        <Api sx={{ fontSize: 28 } as any} />
                        <Box sx={{ flex: 1 } as any}>
                            <Typography variant="h6" sx={{ fontWeight: 600 } as any}>
                                Magento E-commerce API
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 } as any}>
                                {formData.magento.enableDirectConnection ? '🚀 Direct Connection' : '📡 Proxy Connection'}
                            </Typography>
                        </Box>
                        <ConnectionStatus service="magento" status={connectionTests.magento} />
                        <FormControlLabel
                            control: any,
                                    checked={formData.magento.enableDirectConnection}
                                    onChange: any,
                                        handleInputChange('magento', 'enableDirectConnection', e.target.checked);
                                    }}
                                    sx: any,
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                        }
                                    }}
                                />
                            }
                            label: any,
                            sx={{ color: 'white', mr: 0 } as any}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 } as any}>
                    <Stack spacing={3}>
                        {/* Connection Mode Info */}
                        <Alert 
                            severity={formData.magento.enableDirectConnection ? "success" : "info"}
                            icon={formData.magento.enableDirectConnection ? <CloudSync /> : <Database />}
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

                        {/* Direct Connection Settings */}
                        <Collapse in={formData.magento.enableDirectConnection}>
                            <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 } as any}>
                                <Stack spacing={3}>
                                    {/* URL and Auth Mode */}
                                    <Grid { ...{container: true}} spacing={2}>
                                        <Grid size={{ xs: 12, md: 8 }}>
                                            <TextField
                                                size: any,
                                                value={formData.magento.url}
                                                onChange={(e) => handleInputChange('magento', 'url', e.target.value)}
                                                placeholder: any,
                                                    startAdornment: <Api sx={{ color: 'text.secondary', mr: 1 } as any} />
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Authentication Mode</InputLabel>
                                                <Select
                                                    value={formData.magento.authMode}
                                                    onChange={(e) => handleInputChange('magento', 'authMode', e.target.value)}
                                                    label: any,
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Security fontSize="small" />
                                                            <span>Basic Auth</span>
                                                        </Stack>
                                                    </MenuItem>
                                                    <MenuItem value="oauth">
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Security fontSize="small" />
                                                            <span>OAuth 1.0</span>
                                                        </Stack>
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    {/* Basic Auth Fields */}
                                    <Collapse in={formData.magento.authMode === 'basic'}>
                                        <Card sx={{ p: 2, bgcolor: 'background.paper' } as any}>
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 } as any}>
                                                    Basic Authentication
                                                </Typography>
                                                <Grid { ...{container: true}} spacing={2}>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <TextField
                                                            size: any,
                                                            value={formData.magento.username}
                                                            onChange={(e) => handleInputChange('magento', 'username', e.target.value)}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <TextField
                                                            size: any,
                                                            value={formData.magento.password}
                                                            onChange={(e) => handleInputChange('magento', 'password', e.target.value)}
                                                        />
                                                    </Grid>
                                                    <Grid size={12}>
                                                        <Button
                                                            variant: any,
                                                            onClick={handleMagentoBasicAuth}
                                                            disabled={connectionTests.magento.testing}
                                                            startIcon={connectionTests.magento.testing ? <CircularProgress size={20} /> : <Security />}
                                                            sx={{ borderRadius: 2 } as any}
                                                        >
                                                            {connectionTests.magento.testing ? 'Authenticating...' : 'Get Access Token'}
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Collapse>

                                    {/* OAuth Fields */}
                                    <Collapse in={formData.magento.authMode === 'oauth'}>
                                        <Card sx={{ p: 2, bgcolor: 'background.paper' } as any}>
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 } as any}>
                                                    OAuth 1.0 Configuration
                                                </Typography>
                                                <Grid { ...{container: true}} spacing={2}>
                                                    {[
                                                        ['consumerKey', 'Consumer Key'],
                                                        ['consumerSecret', 'Consumer Secret'],
                                                        ['accessToken', 'Access Token'],
                                                        ['accessTokenSecret', 'Access Token Secret'],
                                                    ].map(([key: any: any, label]: any: any) => (<Grid size={{ xs: 12, sm: 6 }} key={key}>
                                                            <TextField
                                                                size: any,
                                                                label={label}
                                                                value={formData.magento[key] || ''}
                                                                onChange={(e) => handleInputChange('magento', key, e.target.value)}
                                                                type={key.includes('Secret') ? 'password' : 'text'}
                                                            />
                                                        </Grid>
                                                    ))}
                                                    <Grid size={12}>
                                                        <Button
                                                            variant: any,
                                                            onClick={handleMagentoOAuthConnect}
                                                            disabled={connectionTests.magento.testing}
                                                            startIcon={connectionTests.magento.testing ? <CircularProgress size={20} /> : <Security />}
                                                            sx={{ borderRadius: 2 } as any}
                                                        >
                                                            {connectionTests.magento.testing ? 'Connecting...' : 'Connect OAuth'}
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Collapse>

                                    {/* CORS Setup Guide */}
                                    <Alert severity="warning" icon={<Warning />} sx={{ borderRadius: 2 } as any}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 } as any}>
                                            CORS Configuration Required
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 } as any}>
                                            Add these headers to your Magento server for direct connection:
                                        </Typography>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', fontFamily: 'monospace', fontSize: '0.75rem' } as any}>
                                            Access-Control-Allow-Origin: {window.location.origin}<br />
                                            Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS<br />
                                            Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
                                        </Paper>
                                    </Alert>
                                </Stack>
                            </Paper>
                        </Collapse>

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button
                                variant: any,
                                startIcon={<Refresh />}
                                onClick: any,
                                        updateConnectionTest('magento', { testing: true, status: 'testing' });
                                        const result = await magentoService.testConnection();
                                        if(result.success) {
                                            toast.success(result.message);
                                            updateConnectionTest('magento', { status: 'success' });
                                        }
                                    } catch(error: any) {
                                        toast.error('Connection test failed: ' + error.message);
                                        updateConnectionTest('magento', { status: 'error' });
                                    } finally {
                                        updateConnectionTest('magento', { testing: false, lastTest: new Date().toISOString() });
                                    }
                                }}
                                disabled: any,
                                }
                                sx={{ borderRadius: 2 } as any}
                            >
                                {connectionTests.magento.testing ? 'Testing...' : 'Test Connection'}
                            </Button>
                        </Stack>
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* Additional API Sections can be added here */}
            {/* For now, keeping the interface focused on Magento */}
        </Box>
    );
};

export default ApiSettingsTab;