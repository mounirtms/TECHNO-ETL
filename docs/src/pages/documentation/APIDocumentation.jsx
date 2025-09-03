import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Paper,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore as ExpandMoreIcon,
  Api as ApiIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Sync as SyncIcon,
  ShoppingCart as MagentoIcon,
} from '@mui/icons-material';

const APIDocumentation = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const apiEndpoints = {
    auth: [
      { method: 'POST', path: '/auth/login', description: 'User authentication' },
      { method: 'POST', path: '/auth/logout', description: 'User logout' },
      { method: 'POST', path: '/auth/refresh', description: 'Token refresh' },
      { method: 'GET', path: '/auth/profile', description: 'User profile' },
    ],
    mdm: [
      { method: 'GET', path: '/mdm/products', description: 'Get products with pagination and filters' },
      { method: 'POST', path: '/mdm/products', description: 'Create new product' },
      { method: 'PUT', path: '/mdm/products/:id', description: 'Update product' },
      { method: 'DELETE', path: '/mdm/products/:id', description: 'Delete product' },
      { method: 'GET', path: '/mdm/inventory', description: 'Get inventory data' },
      { method: 'PUT', path: '/mdm/inventory/:sku/:sourceCode', description: 'Update inventory' },
    ],
    magento: [
      { method: 'GET', path: '/magento/products', description: 'Get Magento products' },
      { method: 'POST', path: '/magento/sync', description: 'Sync to Magento' },
      { method: 'GET', path: '/magento/orders', description: 'Get orders' },
      { method: 'GET', path: '/magento/customers', description: 'Get customers' },
    ],
    sync: [
      { method: 'POST', path: '/sync/inventory', description: 'Full inventory sync' },
      { method: 'POST', path: '/sync/prices', description: 'Price synchronization' },
      { method: 'GET', path: '/sync/status/:syncId', description: 'Sync status' },
      { method: 'POST', path: '/sync/source/:code', description: 'Source-specific sync' },
    ],
  };

  const errorCodes = [
    { code: '400', type: 'BAD_REQUEST', description: 'Invalid request parameters' },
    { code: '401', type: 'UNAUTHORIZED', description: 'Authentication required' },
    { code: '403', type: 'FORBIDDEN', description: 'Insufficient permissions' },
    { code: '404', type: 'NOT_FOUND', description: 'Resource not found' },
    { code: '429', type: 'TOO_MANY_REQUESTS', description: 'Rate limit exceeded' },
    { code: '500', type: 'INTERNAL_SERVER_ERROR', description: 'Server error' },
  ];

  const rateLimits = [
    { endpoint: 'Standard Endpoints', limit: '1000 requests/hour' },
    { endpoint: 'Sync Endpoints', limit: '100 requests/hour' },
    { endpoint: 'Authentication', limit: '50 requests/hour' },
    { endpoint: 'Bulk Operations', limit: '20 requests/hour' },
  ];

  const codeExamples = {
    auth: `// Authentication Example
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@techno-dz.com',
    password: 'securePassword123'
  })
});

const data = await response.json();
// Store token for future requests
localStorage.setItem('token', data.data.token);`,

    products: `// Get Products with Filters
const response = await fetch('/api/v1/mdm/products?' + new URLSearchParams({
  page: 1,
  pageSize: 50,
  search: 'PROD',
  status: 'active',
  sortBy: 'modified_date',
  sortOrder: 'desc'
}), {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  }
});

const products = await response.json();`,

    sync: `// Inventory Synchronization
const response = await fetch('/api/v1/sync/inventory', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sourceCode: 'MAIN',
    dryRun: false,
    batchSize: 50
  })
});

const syncResult = await response.json();
console.log('Sync ID:', syncResult.data.syncId);`,
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🔌 API Documentation
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Comprehensive RESTful API for TECHNO-ETL data synchronization
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="RESTful" color="primary" />
              <Chip label="JWT Authentication" color="success" />
              <Chip label="Rate Limited" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* API Overview */}
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>🎯 API Overview</Typography>
            The TECHNO-ETL API provides comprehensive endpoints for managing data synchronization between MDM systems
            and Magento platforms. Built with RESTful principles, it offers robust authentication, comprehensive error
            handling, and high-performance data operations with 1000+ requests/hour rate limiting.
          </Alert>
        </motion.div>

        {/* Base Configuration */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            ⚙️ Base Configuration
          </Typography>
          <Card sx={{ mb: 6 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="primary.main">API Details</Typography>
                  <Typography><strong>Base URL:</strong> https://api.techno-etl.com/v1</Typography>
                  <Typography><strong>Content-Type:</strong> application/json</Typography>
                  <Typography><strong>Authentication:</strong> Bearer Token (JWT)</Typography>
                  <Typography><strong>Rate Limit:</strong> 1000 requests/hour per API key</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="secondary.main">Response Format</Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <pre style={{ fontSize: '0.75rem', margin: 0 }}>
                      {`{
  "success": true,
  "data": { ... },
  "pagination": { ... },
  "meta": {
    "timestamp": "2025-08-11T10:30:00Z",
    "version": "2.1.0",
    "requestId": "req_123456"
  }
}`}
                    </pre>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Endpoints Tabs */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📋 API Endpoints
          </Typography>
          <Paper sx={{ mb: 6 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Authentication" icon={<SecurityIcon />} />
              <Tab label="MDM Endpoints" icon={<StorageIcon />} />
              <Tab label="Magento Endpoints" icon={<MagentoIcon />} />
              <Tab label="Sync Endpoints" icon={<SyncIcon />} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>Authentication Endpoints</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Method</strong></TableCell>
                      <TableCell><strong>Endpoint</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiEndpoints.auth.map((endpoint, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip
                            label={endpoint.method}
                            color={endpoint.method === 'GET' ? 'info' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '4px' }}>
                            {endpoint.path}
                          </code>
                        </TableCell>
                        <TableCell>{endpoint.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Code Example</Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto' }}>
                <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {codeExamples.auth}
                </pre>
              </Paper>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>MDM Endpoints</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Method</strong></TableCell>
                      <TableCell><strong>Endpoint</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiEndpoints.mdm.map((endpoint, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip
                            label={endpoint.method}
                            color={
                              endpoint.method === 'GET' ? 'info' :
                                endpoint.method === 'POST' ? 'success' :
                                  endpoint.method === 'PUT' ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '4px' }}>
                            {endpoint.path}
                          </code>
                        </TableCell>
                        <TableCell>{endpoint.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Code Example</Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto' }}>
                <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {codeExamples.products}
                </pre>
              </Paper>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>Magento Endpoints</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Method</strong></TableCell>
                      <TableCell><strong>Endpoint</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiEndpoints.magento.map((endpoint, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip
                            label={endpoint.method}
                            color={endpoint.method === 'GET' ? 'info' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '4px' }}>
                            {endpoint.path}
                          </code>
                        </TableCell>
                        <TableCell>{endpoint.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Sync Endpoints</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Method</strong></TableCell>
                      <TableCell><strong>Endpoint</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiEndpoints.sync.map((endpoint, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip
                            label={endpoint.method}
                            color={endpoint.method === 'GET' ? 'info' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '4px' }}>
                            {endpoint.path}
                          </code>
                        </TableCell>
                        <TableCell>{endpoint.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Code Example</Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto' }}>
                <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {codeExamples.sync}
                </pre>
              </Paper>
            </TabPanel>
          </Paper>
        </motion.div>

        {/* Error Handling & Rate Limiting */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                🚨 Error Codes
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Code</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {errorCodes.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip
                            label={error.code}
                            color={
                              error.code.startsWith('2') ? 'success' :
                                error.code.startsWith('4') ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <code style={{ fontSize: '0.75rem' }}>{error.type}</code>
                        </TableCell>
                        <TableCell>{error.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                ⚡ Rate Limits
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Endpoint Type</strong></TableCell>
                      <TableCell><strong>Limit</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rateLimits.map((limit, index) => (
                      <TableRow key={index}>
                        <TableCell>{limit.endpoint}</TableCell>
                        <TableCell>
                          <Chip label={limit.limit} color="info" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Rate Limit Headers:</strong><br />
                  X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default APIDocumentation;
