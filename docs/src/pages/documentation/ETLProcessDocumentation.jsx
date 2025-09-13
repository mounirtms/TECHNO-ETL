import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore as ExpandMoreIcon,
  GetApp as ExtractIcon,
  Transform as TransformIcon,
  Publish as LoadIcon,
  Sync as SyncIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Speed as PerformanceIcon,
  Visibility as MonitorIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const ETLProcessDocumentation = () => {
  const [activeStep, setActiveStep] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const etlSteps = [
    {
      label: 'Extract Phase',
      icon: <ExtractIcon />,
      description: 'Data extraction from multiple sources',
      details: [
        'MDM Database - Products, inventory, prices',
        'Magento API - Orders, customers, categories',
        'RFID Systems - Real-time inventory tracking',
        'POS Systems - Sales data integration',
        'Warehouse Systems - Stock movements',
      ],
      code: `// Extract product data from MDM
export async function extractMdmProducts(filters = {}) {
  const query = \`
    SELECT p.ProductID, p.SKU, p.Name, p.Description,
           i.Quantity, i.SourceCode, pr.Price
    FROM Products p
    LEFT JOIN Inventory i ON p.ProductID = i.ProductID
    LEFT JOIN Prices pr ON p.ProductID = pr.ProductID
    WHERE p.Changed = 1 OR i.Changed = 1
    ORDER BY p.ModifiedDate DESC
  \`;
  
  const result = await executeQuery(query, filters);
  return result.recordset;
}`,
    },
    {
      label: 'Transform Phase',
      icon: <TransformIcon />,
      description: 'Data validation, cleansing, and business rule application',
      details: [
        'Data Validation & Cleansing',
        'Format Standardization',
        'Business Rule Application',
        'Conflict Resolution',
        'Data Enrichment',
      ],
      code: `// Apply business transformation rules
export function applyBusinessRules(product, context) {
  const transformedProduct = { ...product };
  
  // Price calculation with markup
  if (transformedProduct.cost_price) {
    const markup = getCategoryMarkup(transformedProduct.category_id);
    transformedProduct.selling_price = 
      transformedProduct.cost_price * (1 + markup);
  }
  
  // Inventory rules
  if (transformedProduct.quantity !== undefined) {
    transformedProduct.stock_status = 
      transformedProduct.quantity > 0 ? 'in_stock' : 'out_of_stock';
  }
  
  return transformedProduct;
}`,
    },
    {
      label: 'Load Phase',
      icon: <LoadIcon />,
      description: 'Loading processed data to target systems',
      details: [
        'Magento Product Updates',
        'Inventory Synchronization',
        'Price Updates',
        'Category Management',
        'Audit Trail Creation',
      ],
      code: `// Load product data to Magento
export async function loadProductToMagento(productData) {
  const magentoService = new MagentoService();
  
  const magentoPayload = {
    product: {
      sku: productData.sku,
      name: productData.name,
      price: productData.price,
      status: productData.status === 'active' ? 1 : 2,
      extension_attributes: {
        stock_item: {
          qty: productData.quantity,
          is_in_stock: productData.quantity > 0
        }
      }
    }
  };
  
  const result = await magentoService.post('/products', magentoPayload);
  return result;
}`,
    },
  ];

  const syncStrategies = [
    {
      title: 'Real-time Synchronization',
      description: 'WebSocket-based instant data sync',
      features: ['Change Detection', 'Event Broadcasting', 'Immediate Updates'],
      color: '#1976d2',
    },
    {
      title: 'Batch Synchronization',
      description: 'Scheduled bulk processing',
      features: ['Scheduled Jobs', 'Bulk Operations', 'Performance Optimized'],
      color: '#388e3c',
    },
    {
      title: 'Hybrid Approach',
      description: 'Combination of real-time and batch',
      features: ['Critical Data Real-time', 'Bulk Data Batched', 'Optimized Performance'],
      color: '#f57c00',
    },
  ];

  const performanceMetrics = [
    { label: 'ETL Throughput', value: '10,000+ records/min', color: 'primary' },
    { label: 'Sync Accuracy', value: '99.9%', color: 'success' },
    { label: 'Error Rate', value: '< 0.1%', color: 'info' },
    { label: 'Recovery Time', value: '< 30 seconds', color: 'warning' },
  ];

  const errorHandlingStrategies = [
    {
      type: 'Network Errors',
      strategy: 'Exponential Backoff',
      maxRetries: 5,
      description: 'Automatic retry with increasing delays',
    },
    {
      type: 'Validation Errors',
      strategy: 'Immediate Failure',
      maxRetries: 0,
      description: 'Log error and continue with next record',
    },
    {
      type: 'Rate Limit Errors',
      strategy: 'Fixed Delay',
      maxRetries: 3,
      description: 'Wait for rate limit reset',
    },
    {
      type: 'System Errors',
      strategy: 'Circuit Breaker',
      maxRetries: 2,
      description: 'Temporary system shutdown protection',
    },
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🔄 ETL Process Documentation
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Comprehensive Extract, Transform, Load process implementation
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Real-time Sync" color="primary" />
              <Chip label="High Performance" color="success" />
              <Chip label="Error Recovery" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* Process Overview */}
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              🎯 ETL Process Overview
            </Typography>
            The TECHNO-ETL system implements a sophisticated Extract, Transform, Load (ETL) process that ensures
            seamless data synchronization between Master Data Management (MDM) systems and Magento e-commerce platforms
            with 99.9% accuracy and real-time performance.
          </Alert>
        </motion.div>

        {/* ETL Steps */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📋 ETL Process Steps
          </Typography>
          <Paper sx={{ p: 3, mb: 6 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {etlSteps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      index === etlSteps.length - 1 ? (
                        <Typography variant="caption">Final step</Typography>
                      ) : null
                    }
                    icon={step.icon}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {step.description}
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Key Components:
                        </Typography>
                        <List dense>
                          {step.details.map((detail, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={detail} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Code Example:
                        </Typography>
                        <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto' }}>
                          <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                            {step.code}
                          </pre>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 1, mt: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={index === etlSteps.length - 1}
                        >
                          {index === etlSteps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            {activeStep === etlSteps.length && (
              <Paper square elevation={0} sx={{ p: 3 }}>
                <Typography>All ETL process steps completed!</Typography>
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  Reset
                </Button>
              </Paper>
            )}
          </Paper>
        </motion.div>

        {/* Synchronization Strategies */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🔄 Synchronization Strategies
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {syncStrategies.map((strategy, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderTop: `4px solid ${strategy.color}`,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: strategy.color, fontWeight: 600 }}>
                      {strategy.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {strategy.description}
                    </Typography>
                    <List dense>
                      {strategy.features.map((feature, idx) => (
                        <ListItem key={idx} sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📊 Performance Metrics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {performanceMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color={`${metric.color}.main`} fontWeight={700}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {metric.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Error Handling */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🚨 Error Handling & Recovery
          </Typography>
          <Grid container spacing={2}>
            {errorHandlingStrategies.map((strategy, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ErrorIcon color="error" />
                      <Typography variant="h6">{strategy.type}</Typography>
                      <Chip
                        label={`Max Retries: ${strategy.maxRetries}`}
                        size="small"
                        color={strategy.maxRetries > 0 ? 'warning' : 'error'}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Strategy: {strategy.strategy}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {strategy.description}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default ETLProcessDocumentation;
