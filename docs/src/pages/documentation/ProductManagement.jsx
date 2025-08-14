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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore as ExpandMoreIcon,
  ShoppingCart as ProductIcon,
  Inventory as InventoryIcon,
  AttachMoney as PriceIcon,
  Category as CategoryIcon,
  Sync as SyncIcon,
  CheckCircle as CheckIcon,
  Code as CodeIcon
} from '@mui/icons-material';

const ProductManagement = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const productFeatures = [
    {
      title: 'Product CRUD Operations',
      description: 'Complete Create, Read, Update, Delete functionality',
      icon: <ProductIcon />,
      color: '#1976d2'
    },
    {
      title: 'Inventory Management',
      description: 'Real-time stock tracking across multiple sources',
      icon: <InventoryIcon />,
      color: '#388e3c'
    },
    {
      title: 'Price Management',
      description: 'Dynamic pricing with customer group support',
      icon: <PriceIcon />,
      color: '#f57c00'
    },
    {
      title: 'Category Management',
      description: 'Hierarchical category structure with mapping',
      icon: <CategoryIcon />,
      color: '#7b1fa2'
    },
    {
      title: 'MDM-Magento Sync',
      description: 'Bidirectional synchronization between systems',
      icon: <SyncIcon />,
      color: '#d32f2f'
    }
  ];

  const productWorkflow = [
    {
      step: '1. Product Creation',
      description: 'Create products in MDM with complete attributes',
      details: [
        'SKU generation and validation',
        'Product information and descriptions',
        'Category and brand assignment',
        'Attribute configuration',
        'Initial pricing setup'
      ]
    },
    {
      step: '2. Inventory Setup',
      description: 'Configure inventory across multiple sources',
      details: [
        'Source-specific stock levels',
        'Safety stock configuration',
        'Reorder point settings',
        'Location-based inventory',
        'Reserved quantity management'
      ]
    },
    {
      step: '3. Price Configuration',
      description: 'Set up pricing rules and customer groups',
      details: [
        'Base price configuration',
        'Customer group pricing',
        'Special price periods',
        'Markup rules application',
        'Currency conversion'
      ]
    },
    {
      step: '4. Magento Synchronization',
      description: 'Sync products to Magento platform',
      details: [
        'Product data mapping',
        'Attribute synchronization',
        'Category assignment',
        'Image and media sync',
        'SEO optimization'
      ]
    }
  ];

  const codeExamples = {
    productCreation: `// Product Creation Example
const createProduct = async (productData) => {
  try {
    const response = await fetch('/api/v1/mdm/products', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sku: productData.sku,
        name: productData.name,
        description: productData.description,
        category_id: productData.categoryId,
        brand_id: productData.brandId,
        price: productData.price,
        cost_price: productData.costPrice,
        status: 'active',
        attributes: {
          color: productData.color,
          size: productData.size,
          material: productData.material,
          weight: productData.weight
        }
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Product created:', result.data.id);
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Product creation failed:', error);
    throw error;
  }
};`,

    inventoryUpdate: `// Inventory Update Example
const updateInventory = async (sku, sourceCode, quantity) => {
  try {
    const response = await fetch(\`/api/v1/mdm/inventory/\${sku}/\${sourceCode}\`, {
      method: 'PUT',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantity: quantity,
        reservedQuantity: 0,
        lastUpdated: new Date().toISOString()
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Inventory updated:', result.data);
      
      // Trigger sync to Magento
      await syncInventoryToMagento(sku);
      
      return result.data;
    }
  } catch (error) {
    console.error('Inventory update failed:', error);
    throw error;
  }
};

// Sync inventory to Magento
const syncInventoryToMagento = async (sku) => {
  const response = await fetch('/api/v1/magento/sync/inventory', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      skus: [sku],
      forceUpdate: true
    })
  });
  
  return response.json();
};`,

    priceManagement: `// Price Management Example
const updateProductPricing = async (sku, pricingData) => {
  try {
    const response = await fetch(\`/api/v1/mdm/prices\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sku: sku,
        prices: [
          {
            customerGroup: 'general',
            price: pricingData.basePrice,
            specialPrice: pricingData.specialPrice,
            effectiveDate: pricingData.effectiveDate,
            expiryDate: pricingData.expiryDate
          },
          {
            customerGroup: 'wholesale',
            price: pricingData.basePrice * 0.85, // 15% discount
            effectiveDate: pricingData.effectiveDate
          }
        ]
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Sync prices to Magento
      await syncPricesToMagento(sku);
      return result.data;
    }
  } catch (error) {
    console.error('Price update failed:', error);
    throw error;
  }
};`,

    bulkOperations: `// Bulk Operations Example
const bulkUpdateProducts = async (products, operation) => {
  const batchSize = 50;
  const results = [];
  
  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (product) => {
      try {
        switch (operation.type) {
          case 'updateStatus':
            return await updateProductStatus(product.sku, operation.status);
          case 'updatePrices':
            return await updateProductPricing(product.sku, operation.pricing);
          case 'syncToMagento':
            return await syncProductToMagento(product.sku);
          default:
            throw new Error('Unknown operation type');
        }
      } catch (error) {
        return {
          sku: product.sku,
          success: false,
          error: error.message
        };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map(r => r.value || r.reason));
    
    // Rate limiting - wait between batches
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};`
  };

  const dataStructures = [
    {
      name: 'Product',
      fields: [
        { name: 'id', type: 'integer', description: 'Unique product identifier' },
        { name: 'sku', type: 'string', description: 'Stock Keeping Unit (unique)' },
        { name: 'name', type: 'string', description: 'Product name' },
        { name: 'description', type: 'text', description: 'Product description' },
        { name: 'category_id', type: 'integer', description: 'Category reference' },
        { name: 'brand_id', type: 'integer', description: 'Brand reference' },
        { name: 'status', type: 'enum', description: 'active, inactive, pending' },
        { name: 'created_date', type: 'datetime', description: 'Creation timestamp' },
        { name: 'modified_date', type: 'datetime', description: 'Last modification' }
      ]
    },
    {
      name: 'Inventory',
      fields: [
        { name: 'id', type: 'string', description: 'Composite key (SKU_SourceCode)' },
        { name: 'sku', type: 'string', description: 'Product SKU reference' },
        { name: 'sourceCode', type: 'string', description: 'Inventory source identifier' },
        { name: 'quantity', type: 'integer', description: 'Available quantity' },
        { name: 'reservedQuantity', type: 'integer', description: 'Reserved stock' },
        { name: 'availableQuantity', type: 'integer', description: 'Calculated available' },
        { name: 'lastUpdated', type: 'datetime', description: 'Last update timestamp' },
        { name: 'changed', type: 'boolean', description: 'Sync flag' }
      ]
    }
  ];

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
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
              🛍️ Product Management System
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Comprehensive product lifecycle management with MDM-Magento synchronization
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="CRUD Operations" color="primary" />
              <Chip label="Real-time Sync" color="success" />
              <Chip label="Multi-source Inventory" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* Overview */}
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>🎯 Product Management Overview</Typography>
            The TECHNO-ETL Product Management System provides comprehensive tools for managing product lifecycles, 
            inventory tracking, pricing strategies, and seamless synchronization between MDM and Magento platforms. 
            Built for enterprise-scale operations with real-time updates and advanced workflow automation.
          </Alert>
        </motion.div>

        {/* Key Features */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🌟 Key Features
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {productFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
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

        {/* Product Workflow */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🔄 Product Management Workflow
          </Typography>
          <Grid container spacing={2} sx={{ mb: 6 }}>
            {productWorkflow.map((workflow, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={index + 1} 
                        color="primary" 
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Typography variant="h6" fontWeight={600}>
                        {workflow.step}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {workflow.description}
                    </Typography>
                    <List dense>
                      {workflow.details.map((detail, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={detail} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Detailed Documentation Tabs */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📖 Implementation Guide
          </Typography>
          <Paper sx={{ mb: 6 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Product Creation" icon={<ProductIcon />} />
              <Tab label="Inventory Management" icon={<InventoryIcon />} />
              <Tab label="Price Management" icon={<PriceIcon />} />
              <Tab label="Bulk Operations" icon={<CodeIcon />} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>Product Creation & Management</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Create and manage products with complete attribute support, validation, and automatic SKU generation.
              </Typography>
              
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto', mb: 3 }}>
                <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {codeExamples.productCreation}
                </pre>
              </Paper>

              <Alert severity="success">
                <Typography variant="subtitle2" fontWeight={600}>Best Practices:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Always validate SKU uniqueness before creation" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Use consistent naming conventions for products" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Include all required attributes for Magento sync" />
                  </ListItem>
                </List>
              </Alert>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>Inventory Management</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Manage inventory across multiple sources with real-time updates and automatic synchronization.
              </Typography>
              
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto', mb: 3 }}>
                <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {codeExamples.inventoryUpdate}
                </pre>
              </Paper>

              <Alert severity="info">
                <Typography variant="subtitle2" fontWeight={600}>Inventory Sources:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="MAIN - Main warehouse inventory" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="POS - Point of sale locations" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="WH2, WH3 - Additional warehouses" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="RFID - Real-time RFID tracking" />
                  </ListItem>
                </List>
              </Alert>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>Price Management</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Configure dynamic pricing with customer group support, special pricing periods, and automatic markup rules.
              </Typography>
              
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto', mb: 3 }}>
                <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {codeExamples.priceManagement}
                </pre>
              </Paper>

              <Alert severity="warning">
                <Typography variant="subtitle2" fontWeight={600}>Pricing Rules:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Base prices are calculated from cost price + markup" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Customer group discounts are applied automatically" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Special prices override base prices during effective periods" />
                  </ListItem>
                </List>
              </Alert>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Bulk Operations</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Perform bulk operations on multiple products with batch processing and error handling.
              </Typography>
              
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto' }}>
                <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {codeExamples.bulkOperations}
                </pre>
              </Paper>
            </TabPanel>
          </Paper>
        </motion.div>

        {/* Data Structures */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🗄️ Data Structures
          </Typography>
          <Grid container spacing={3}>
            {dataStructures.map((structure, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary.main">
                      {structure.name} Structure
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Field</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {structure.fields.map((field, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <code style={{ fontSize: '0.75rem' }}>{field.name}</code>
                              </TableCell>
                              <TableCell>
                                <Chip label={field.type} size="small" color="info" />
                              </TableCell>
                              <TableCell>{field.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default ProductManagement;
