/**
 * Magento Migration Node.js Application
 *
 * Main application server that provides RESTful web services for Magento migration.
 * Implements a modular architecture with separate services for each migration component.
 *
 * Migration Order (Optimized for Performance):
 * 1. Simple Products First - Basic product creation with default values
 * 2. Attributes Management - Custom attributes with predefined options
 * 3. Attribute Sets - Configure attribute sets and groups
 * 4. Enhanced Product Configuration - Add custom attributes to products
 * 5. Category Assignment - Optimize category-to-product relationships
 * 6. Configurable Products - Handle product variants and configurations
 * 7. Media Management - Product images and media gallery (final step)
 *
 * @author Magento Migration Tool
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('rate-limiter-flexible');
require('dotenv').config();

const logger = require('./utils/logger');
const config = require('./config/app-config');

// Import route handlers for each migration service
const productRoutes = require('./services/product-migration');
const attributeRoutes = require('./services/attribute-migration');
const categoryRoutes = require('./services/category-migration');
const orchestratorRoutes = require('./services/orchestrator');
const healthRoutes = require('./services/health-check');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting configuration
const rateLimiter = new rateLimit.RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Middleware setup
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orchestrator', orchestratorRoutes);

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Magento Migration API',
    version: '1.0.0',
    description: 'Node.js-based Magento migration system with web services architecture',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      attributes: '/api/attributes',
      categories: '/api/categories',
      orchestrator: '/api/orchestrator'
    },
    migrationOrder: [
      '1. Simple Products First',
      '2. Attributes Management',
      '3. Attribute Sets',
      '4. Enhanced Product Configuration',
      '5. Category Assignment',
      '6. Configurable Products',
      '7. Media Management'
    ],
    documentation: '/api/docs'
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Magento Migration API Documentation',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      'GET /health': 'Health check and system status',
      'POST /products/simple': 'Create simple products with default values',
      'POST /products/configurable': 'Create configurable products with variants',
      'POST /products/enhance': 'Add custom attributes to existing products',
      'POST /attributes/create': 'Create custom product attributes',
      'POST /attributes/sets': 'Create and configure attribute sets',
      'POST /categories/create': 'Create category hierarchy',
      'POST /categories/assign': 'Assign products to categories',
      'POST /orchestrator/migrate': 'Run complete migration process',
      'GET /orchestrator/status': 'Get migration status and progress'
    },
    examples: {
      simpleProduct: {
        url: '/api/products/simple',
        method: 'POST',
        payload: {
          sku: 'CASIO-FX-82MS-2',
          name: 'Calculatrice scientifique CASIO FX-82MS-2',
          price: 15.99,
          weight: 0.5,
          description: 'Calculatrice scientifique avec 240 fonctions'
        }
      },
      attribute: {
        url: '/api/attributes/create',
        method: 'POST',
        payload: {
          attribute_code: 'mgs_brand',
          frontend_input: 'select',
          frontend_label: 'Brand',
          options: ['CASIO', 'PILOT', 'ARK']
        }
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      '/api/health',
      '/api/products',
      '/api/attributes',
      '/api/categories',
      '/api/orchestrator'
    ]
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Magento Migration API server started on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;