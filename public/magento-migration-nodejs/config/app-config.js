/**
 * Application Configuration
 *
 * Central configuration management for the Magento migration system.
 * Handles environment variables, default values, and configuration validation.
 *
 * @author Magento Migration Tool
 * @version 1.0.0
 */

require('dotenv').config();

const config = {
  // Application settings
  app: {
    name: 'Magento Migration API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000,
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // Magento API configuration
  magento: {
    baseUrl: process.env.MAGENTO_BASE_URL || 'https://your-magento-store.com',
    adminToken: process.env.MAGENTO_ADMIN_TOKEN || '',
    storeId: parseInt(process.env.MAGENTO_STORE_ID) || 1,
    websiteId: parseInt(process.env.MAGENTO_WEBSITE_ID) || 1,
    storeViewCode: process.env.MAGENTO_STORE_VIEW_CODE || 'default',
    timeout: parseInt(process.env.MAGENTO_TIMEOUT) || 30000,
    retryAttempts: parseInt(process.env.MAGENTO_RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.MAGENTO_RETRY_DELAY) || 2000
  },

  // Migration settings optimized for performance
  migration: {
    // Batch sizes for different operations (optimized for API performance)
    batchSizes: {
      simpleProducts: parseInt(process.env.BATCH_SIZE_SIMPLE_PRODUCTS) || 20,
      configurableProducts: parseInt(process.env.BATCH_SIZE_CONFIGURABLE_PRODUCTS) || 10,
      attributes: parseInt(process.env.BATCH_SIZE_ATTRIBUTES) || 15,
      categories: parseInt(process.env.BATCH_SIZE_CATEGORIES) || 25,
      mediaFiles: parseInt(process.env.BATCH_SIZE_MEDIA) || 5
    },

    // Rate limiting to prevent API overload
    rateLimiting: {
      requestsPerSecond: parseInt(process.env.REQUESTS_PER_SECOND) || 2,
      burstLimit: parseInt(process.env.BURST_LIMIT) || 10,
      delayBetweenBatches: parseInt(process.env.DELAY_BETWEEN_BATCHES) || 1000
    },

    // Migration order configuration
    migrationOrder: [
      'simpleProducts',    // Step 1: Create basic products first
      'attributes',        // Step 2: Create custom attributes
      'attributeSets',     // Step 3: Configure attribute sets
      'enhanceProducts',   // Step 4: Add custom attributes to products
      'categories',        // Step 5: Create category hierarchy
      'categoryAssignment', // Step 6: Assign products to categories
      'configurableProducts', // Step 7: Create configurable products
      'mediaManagement'    // Step 8: Handle images and media (final step)
    ],

    // Default product values for French office supplies store
    defaults: {
      product: {
        status: 1,           // Enabled
        visibility: 4,       // Catalog, Search
        taxClassId: 2,       // Taxable Goods
        weight: 1.0,
        attributeSetId: 4,   // Default attribute set
        typeId: 'simple',
        stockStatus: 1,      // In Stock
        manageStock: true,
        qty: 100,
        isInStock: true
      },

      category: {
        isActive: true,
        includeInMenu: true,
        position: 1
      },

      attribute: {
        scope: 'global',
        isRequired: false,
        isUserDefined: true,
        isUnique: false,
        isVisible: true,
        isSearchable: true,
        isFilterable: true,
        isComparable: true,
        isVisibleOnFront: true,
        usedInProductListing: true
      }
    }
  },

  // Data processing configuration
  dataProcessing: {
    csvEncoding: 'utf8',
    maxFileSize: '50MB',
    supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxImageSize: '5MB',

    // French localization settings
    localization: {
      locale: 'fr_FR',
      currency: 'EUR',
      timezone: 'Europe/Paris',
      decimalSeparator: ',',
      thousandsSeparator: ' ',
      dateFormat: 'DD/MM/YYYY'
    },

    // Text processing rules
    textProcessing: {
      stripHtml: true,
      convertEncoding: true,
      normalizeWhitespace: true,
      maxDescriptionLength: 2000,
      maxNameLength: 255
    }
  },

  // Error handling and logging
  errorHandling: {
    continueOnError: process.env.CONTINUE_ON_ERROR === 'true',
    maxErrorsPerBatch: parseInt(process.env.MAX_ERRORS_PER_BATCH) || 5,
    createErrorReports: process.env.CREATE_ERROR_REPORTS !== 'false',
    logRetentionDays: parseInt(process.env.LOG_RETENTION_DAYS) || 30
  },

  // Performance monitoring
  performance: {
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    metricsInterval: parseInt(process.env.METRICS_INTERVAL) || 60000,
    memoryThreshold: process.env.MEMORY_THRESHOLD || '512MB',
    enableProgressReporting: process.env.ENABLE_PROGRESS_REPORTING !== 'false',
    progressReportInterval: parseInt(process.env.PROGRESS_REPORT_INTERVAL) || 50
  },

  // File paths
  paths: {
    data: './data',
    logs: './logs',
    templates: './templates',
    uploads: './uploads',
    exports: './exports'
  }
};

/**
 * Validate configuration on startup
 */
function validateConfig() {
  const errors = [];

  // Validate required Magento settings
  if (!config.magento.baseUrl || config.magento.baseUrl === 'https://your-magento-store.com') {
    errors.push('MAGENTO_BASE_URL is required and must be set to your actual Magento store URL');
  }

  if (!config.magento.adminToken) {
    errors.push('MAGENTO_ADMIN_TOKEN is required for API authentication');
  }

  // Validate batch sizes
  Object.entries(config.migration.batchSizes).forEach(([key, value]) => {
    if (value <= 0 || value > 100) {
      errors.push(`Invalid batch size for ${key}: ${value}. Must be between 1 and 100.`);
    }
  });

  // Validate rate limiting
  if (config.migration.rateLimiting.requestsPerSecond <= 0) {
    errors.push('Requests per second must be greater than 0');
  }

  if (errors.length > 0) {
    console.error('Configuration validation errors:');
    errors.forEach(error => console.error(`- ${error}`));

    if (config.app.environment === 'production') {
      process.exit(1);
    } else {
      console.warn('Running in development mode with configuration warnings');
    }
  }
}

// Validate configuration on module load
validateConfig();

module.exports = config;