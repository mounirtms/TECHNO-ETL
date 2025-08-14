import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Grid,
  Link,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import CodeBlock from '../components/CodeBlock';
import {
  OpenInNew as OpenInNewIcon,
  ExpandMore as ExpandMoreIcon,
  Storefront as StorefrontIcon,
  Api as ApiIcon,
  Sync as SyncIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  ContentCopy as CopyIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const MagentoIntegration = () => {
  const [tabValue, setTabValue] = useState(0);
  const [copiedText, setCopiedText] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  const integrationFeatures = [
    {
      title: 'Product Synchronization',
      description: 'Bidirectional sync of product data, attributes, and media',
      icon: <StorefrontIcon />,
      color: '#1976d2'
    },
    {
      title: 'Inventory Management',
      description: 'Real-time inventory updates across multiple sources',
      icon: <SyncIcon />,
      color: '#388e3c'
    },
    {
      title: 'Order Processing',
      description: 'Automated order processing and fulfillment workflows',
      icon: <ApiIcon />,
      color: '#f57c00'
    },
    {
      title: 'Customer Data Sync',
      description: 'Customer information and segmentation synchronization',
      icon: <SecurityIcon />,
      color: '#7b1fa2'
    }
  ];

  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/rest/V1/products',
      description: 'Retrieve product list with search criteria',
      example: 'GET /rest/V1/products?searchCriteria[filter_groups][0][filters][0][field]=sku&searchCriteria[filter_groups][0][filters][0][value]=PROD-001'
    },
    {
      method: 'POST',
      endpoint: '/rest/V1/products',
      description: 'Create a new product',
      example: 'POST /rest/V1/products with product data payload'
    },
    {
      method: 'PUT',
      endpoint: '/rest/V1/products/{sku}',
      description: 'Update existing product by SKU',
      example: 'PUT /rest/V1/products/PROD-001 with updated product data'
    },
    {
      method: 'GET',
      endpoint: '/rest/V1/stockItems/{itemId}',
      description: 'Get stock information for a product',
      example: 'GET /rest/V1/stockItems/123'
    },
    {
      method: 'PUT',
      endpoint: '/rest/V1/products/{sku}/stockItems/{itemId}',
      description: 'Update stock quantity for a product',
      example: 'PUT /rest/V1/products/PROD-001/stockItems/1'
    }
  ];

  return (
    <Container maxWidth={false}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🛒 Magento Integration Guide
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Complete guide to integrating Adobe Commerce (Magento) with TECHNO-ETL
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Magento 2.4+" color="primary" />
              <Chip label="REST API" color="success" />
              <Chip label="Real-time Sync" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* Overview */}
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>🎯 Integration Overview</Typography>
            TECHNO-ETL provides seamless integration with Adobe Commerce (Magento) through REST API connections,
            enabling real-time synchronization of products, inventory, orders, and customer data between your
            MDM system and Magento e-commerce platform.
          </Alert>
        </motion.div>

        {/* Key Features */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🌟 Integration Features
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {integrationFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: `${feature.color}20`,
                          color: feature.color,
                          mr: 2
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* External Resources */}
        <motion.div variants={itemVariants}>
          <Card sx={{ mb: 4, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📚 Official Documentation
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Link
                  href="https://developer.adobe.com/commerce/webapi/rest"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'inherit' }}
                >
                  Adobe Commerce REST API Documentation
                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                </Link>
                <Link
                  href="https://devdocs.magento.com/guides/v2.4/get-started/authentication/gs-authentication-token.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'inherit' }}
                >
                  Authentication Guide
                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                </Link>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        <Divider sx={{ my: 4 }} />

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Overview
            </Typography>
            <Typography paragraph>
              The Magento integration enables seamless synchronization between your Adobe Commerce store and Techno's systems.
              This integration supports real-time product updates, order management, customer data synchronization, and inventory tracking.
            </Typography>
          </Paper>
        </motion.div>

        {/* API Documentation Tabs */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📋 API Documentation
          </Typography>
          <Paper sx={{ mb: 6 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="API Endpoints" icon={<ApiIcon />} />
              <Tab label="Authentication" icon={<SecurityIcon />} />
              <Tab label="Code Examples" icon={<StorefrontIcon />} />
              <Tab label="Error Handling" icon={<WarningIcon />} />
            </Tabs>

            {/* API Endpoints Tab */}
            <Box sx={{ p: 3 }} hidden={tabValue !== 0}>
              <Typography variant="h6" gutterBottom>Magento REST API Endpoints</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Key API endpoints for product, inventory, and order management in Magento.
              </Typography>

              <Grid container spacing={2}>
                {apiEndpoints.map((endpoint, index) => (
                  <Grid item xs={12} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Chip
                            label={endpoint.method}
                            color={
                              endpoint.method === 'GET' ? 'info' :
                              endpoint.method === 'POST' ? 'success' :
                              endpoint.method === 'PUT' ? 'warning' : 'error'
                            }
                            size="small"
                            sx={{ mr: 2 }}
                          />
                          <Typography variant="h6" component="code" sx={{ fontFamily: 'monospace' }}>
                            {endpoint.endpoint}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {endpoint.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" component="code" sx={{ fontFamily: 'monospace' }}>
                          {endpoint.example}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Authentication Tab */}
            <Box sx={{ p: 3 }} hidden={tabValue !== 1}>
              <Typography variant="h6" gutterBottom>Authentication Setup</Typography>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600}>Security Notice:</Typography>
                Store API tokens securely and never expose them in client-side code. Use environment variables for production deployments.
              </Alert>

              <List>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText
                    primary="Go to System > Extensions > Integrations"
                    secondary="Access the Magento admin panel and navigate to integrations"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText
                    primary="Click 'Add New Integration'"
                    secondary="Create a new integration for TECHNO-ETL"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText
                    primary="Configure API permissions"
                    secondary="Grant access to required resources (products, inventory, orders)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText
                    primary="Activate integration and copy token"
                    secondary="Save the access token securely for API authentication"
                  />
                </ListItem>
              </List>
            </Box>

            {/* Code Examples Tab */}
            <Box sx={{ p: 3 }} hidden={tabValue !== 2}>
              <Typography variant="h6" gutterBottom>Implementation Examples</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Ready-to-use code examples for common Magento integration scenarios.
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600}>Code Examples:</Typography>
                These examples demonstrate product synchronization, inventory updates, and error handling patterns.
              </Alert>
            </Box>

            {/* Error Handling Tab */}
            <Box sx={{ p: 3 }} hidden={tabValue !== 3}>
              <Typography variant="h6" gutterBottom>Error Handling & Troubleshooting</Typography>

              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600}>Common Error Scenarios:</Typography>
                Handle these common Magento API errors gracefully in your integration.
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="error.main">
                        Authentication Errors
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="401 Unauthorized"
                            secondary="Invalid or expired token"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="403 Forbidden"
                            secondary="Insufficient permissions"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="warning.main">
                        Data Validation Errors
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="400 Bad Request"
                            secondary="Invalid data format or missing required fields"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="422 Unprocessable Entity"
                            secondary="Business logic validation failed"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4" gutterBottom>
                  Authentication
                </Typography>
                <Typography paragraph>
                  Authentication is handled through OAuth 2.0 tokens. You'll need to generate an integration token
                  from your Magento admin panel:
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <Typography component="li" paragraph>
                    Go to System → Integrations
                  </Typography>
                  <Typography component="li" paragraph>
                    Click "Add New Integration"
                  </Typography>
                  <Typography component="li" paragraph>
                    Fill in the integration details
                  </Typography>
                  <Typography component="li" paragraph>
                    Select the required API resources
                  </Typography>
                </Box>
                <CodeBlock
                  language="bash"
                  code={`
# Example API request with token
curl -X GET \\
  "https://your-store.com/rest/V1/products" \\
  -H "Authorization: Bearer your_access_token"`}
                />
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4" gutterBottom>
                  API Endpoints
                </Typography>
                <Typography paragraph>
                  Common endpoints used in the integration:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" paragraph>
                    /V1/products - Product management
                  </Typography>
                  <Typography component="li" paragraph>
                    /V1/orders - Order processing
                  </Typography>
                  <Typography component="li" paragraph>
                    /V1/customers - Customer data
                  </Typography>
                  <Typography component="li" paragraph>
                    /V1/inventory - Stock management
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Inventory Management
            </Typography>
            <Typography paragraph>
              The inventory lifecycle in Magento integration follows a comprehensive flow that ensures accurate stock management across all channels.
            </Typography>
            <Box sx={{ my: 2 }}>
              <img
                src="/docs/images/inventory-lifecycle.svg"
                alt="Inventory Lifecycle"
                style={{ width: '100%', maxWidth: '100%', height: 'auto', margin: '0 auto', display: 'block' }}
              />
            </Box>
            <Typography paragraph>
              This diagram illustrates the complete lifecycle of inventory management, from initial stock updates to final order fulfillment.
            </Typography>
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, my: 4 }}>
            <Typography variant="h4" gutterBottom>
              Integration Example
            </Typography>
            <CodeBlock
              language="javascript"
              code={`
// Example: Product Sync with Magento
const axios = require('axios');

async function syncProducts() {
  const config = {
    baseURL: 'https://your-store.com/rest/V1',
    headers: {
      'Authorization': \`Bearer \${process.env.MAGENTO_ACCESS_TOKEN}\`,
      'Content-Type': 'application/json'
    }
  };

  try {
    // Fetch products from Magento
    const response = await axios.get('/products', config);
    
    // Process each product
    for (const product of response.data.items) {
      await updateLocalInventory(product);
    }
  } catch (error) {
    console.error('Magento API Error:', error);
    throw error;
  }
}

async function updateLocalInventory(product) {
  // Update local database with product data
  await db.products.upsert({
    sku: product.sku,
    name: product.name,
    price: product.price,
    stock: product.extension_attributes.stock_item.qty
  });
}`}
            />
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Webhook Configuration
            </Typography>
            <Typography paragraph>
              Configure webhooks to receive real-time updates:
            </Typography>
            <CodeBlock
              language="json"
              code={`
{
  "name": "Order Update Webhook",
  "endpoint": "https://api.technostationery.com/webhooks/magento/orders",
  "topics": [
    "sales_order_save_after",
    "sales_order_status_change"
  ],
  "authentication": {
    "type": "hmac",
    "secret": "your_webhook_secret"
  }
}`}
            />
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Testing Resources
            </Typography>
            <Typography paragraph>
              Use our testing environments to validate your integration:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" paragraph>
                <Link
                  href="https://beta.technostationery.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  Beta Environment
                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                </Link>
              </Typography>
              <Typography component="li" paragraph>
                <Link
                  href="https://www.postman.com/techno-e-commerce/techno-e-commerce-workspace/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  Postman Collection
                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default MagentoIntegration;
