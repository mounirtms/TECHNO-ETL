/**
 * Product Migration Service
 *
 * RESTful web service for migrating products to Magento.
 * Implements the first step in the migration order: Simple Products First.
 *
 * Migration Strategy:
 * 1. Create simple products with default values first (this service)
 * 2. Enhance products with custom attributes later (separate endpoint)
 * 3. Handle configurable products after simple products are established
 *
 * This approach minimizes API calls and ensures data integrity.
 *
 * @author Magento Migration Tool
 * @version 1.0.0
 */

const express = require('express');
const Joi = require('joi');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const config = require('../config/app-config');
const magentoClient = require('../utils/magento-client');
const { createOperationLogger, logProgress, logBatch, logSummary, logError } = require('../utils/logger');

const router = express.Router();
const logger = createOperationLogger('product-migration');

// Validation schemas
const simpleProductSchema = Joi.object({
  sku: Joi.string().required().pattern(/^[a-zA-Z0-9_-]+$/),
  name: Joi.string().required().max(255),
  price: Joi.number().min(0).required(),
  weight: Joi.number().min(0).default(1.0),
  description: Joi.string().allow('').max(2000),
  short_description: Joi.string().allow('').max(500),
  qty: Joi.number().integer().min(0).default(100),
  status: Joi.number().valid(1, 2).default(1), // 1 = enabled, 2 = disabled
  visibility: Joi.number().valid(1, 2, 3, 4).default(4), // 4 = catalog, search
  tax_class_id: Joi.number().default(2)
});

const batchProductSchema = Joi.object({
  products: Joi.array().items(simpleProductSchema).min(1).max(50).required(),
  options: Joi.object({
    skipExisting: Joi.boolean().default(false),
    updateExisting: Joi.boolean().default(false),
    validateOnly: Joi.boolean().default(false)
  }).default({})
});

/**
 * POST /api/products/simple
 * Create simple products with default values
 *
 * This endpoint handles the first step of migration: creating basic products
 * with minimal required fields and default values. Custom attributes and
 * complex configurations are handled in subsequent steps.
 */
router.post('/simple', async (req, res) => {
  try {
    logger.info('Starting simple product creation', {
      productCount: req.body.products?.length || 0
    });

    // Validate request body
    const { error, value } = batchProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }

    const { products, options } = value;

    // If validation only, return success without creating products
    if (options.validateOnly) {
      return res.json({
        success: true,
        message: 'Validation successful',
        validatedProducts: products.length,
        products: products.map(p => ({ sku: p.sku, name: p.name, valid: true }))
      });
    }

    // Process products in batches
    const batchSize = config.migration.batchSizes.simpleProducts;
    const batches = chunkArray(products, batchSize);
    const results = [];

    logger.info(`Processing ${products.length} products in ${batches.length} batches`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNumber = i + 1;

      logger.info(`Processing batch ${batchNumber}/${batches.length}`, {
        batchSize: batch.length
      });

      try {
        const batchResults = await processBatch(batch, options, batchNumber);
        results.push(...batchResults);

        logBatch('simple-products', batchNumber, batches.length, batch.length, {
          successful: batchResults.filter(r => r.success).length,
          failed: batchResults.filter(r => !r.success).length
        });

        // Progress reporting
        if (config.performance.enableProgressReporting) {
          logProgress('simple-products', results.length, products.length);
        }

        // Rate limiting between batches
        if (i < batches.length - 1) {
          await delay(config.migration.rateLimiting.delayBetweenBatches);
        }

      } catch (error) {
        logger.error(`Batch ${batchNumber} failed completely`, { error: error.message });

        // Add failed results for all products in batch
        const failedResults = batch.map(product => ({
          success: false,
          sku: product.sku,
          error: `Batch failed: ${error.message}`,
          batch: batchNumber
        }));
        results.push(...failedResults);

        // Continue with next batch if configured to do so
        if (!config.errorHandling.continueOnError) {
          break;
        }
      }
    }

    // Generate summary
    const summary = generateSummary(results);
    logSummary('simple-products', summary);

    res.json({
      success: true,
      message: 'Simple product creation completed',
      summary,
      results: results.map(r => ({
        sku: r.sku,
        success: r.success,
        action: r.action,
        error: r.error,
        id: r.id
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logError('simple-products', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Process a batch of products
 * @param {Array} products - Products to process
 * @param {Object} options - Processing options
 * @param {number} batchNumber - Batch number for logging
 * @returns {Array} Batch results
 */
async function processBatch(products, options, batchNumber) {
  const results = [];

  for (const productData of products) {
    try {
      const result = await createSimpleProduct(productData, options);
      results.push(result);

      // Log individual product result
      if (result.success) {
        logger.info(`✓ Product created: ${productData.sku}`, {
          action: result.action,
          id: result.id
        });
      } else {
        logger.warn(`✗ Product failed: ${productData.sku}`, {
          error: result.error
        });
      }

    } catch (error) {
      logger.error(`Product processing failed: ${productData.sku}`, {
        error: error.message
      });

      results.push({
        success: false,
        sku: productData.sku,
        error: error.message,
        batch: batchNumber
      });
    }
  }

  return results;
}

/**
 * Create a simple product with default values
 * @param {Object} productData - Product data
 * @param {Object} options - Processing options
 * @returns {Object} Creation result
 */
async function createSimpleProduct(productData, options) {
  try {
    // Check if product already exists
    if (options.skipExisting || options.updateExisting) {
      try {
        const existingProduct = await magentoClient.getProductBySku(productData.sku);

        if (options.skipExisting) {
          return {
            success: true,
            sku: productData.sku,
            action: 'skipped',
            message: 'Product already exists',
            id: existingProduct.id
          };
        }

        if (options.updateExisting) {
          // Update existing product
          const updatedProduct = await magentoClient.updateProduct(
            productData.sku,
            buildProductPayload(productData)
          );

          return {
            success: true,
            sku: productData.sku,
            action: 'updated',
            id: updatedProduct.id,
            message: 'Product updated successfully'
          };
        }
      } catch (error) {
        // Product doesn't exist, continue with creation
        if (error.status !== 404) {
          throw error;
        }
      }
    }

    // Create new product
    const productPayload = buildProductPayload(productData);
    const createdProduct = await magentoClient.createProduct(productPayload);

    return {
      success: true,
      sku: productData.sku,
      action: 'created',
      id: createdProduct.id,
      message: 'Product created successfully'
    };

  } catch (error) {
    return {
      success: false,
      sku: productData.sku,
      action: 'failed',
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Build Magento product payload with default values
 * @param {Object} productData - Input product data
 * @returns {Object} Magento product payload
 */
function buildProductPayload(productData) {
  const defaults = config.migration.defaults.product;

  // Build basic product structure with defaults
  const product = {
    sku: productData.sku,
    name: cleanText(productData.name),
    price: productData.price,
    status: productData.status || defaults.status,
    visibility: productData.visibility || defaults.visibility,
    type_id: defaults.typeId,
    attribute_set_id: defaults.attributeSetId,
    weight: productData.weight || defaults.weight,
    tax_class_id: productData.tax_class_id || defaults.taxClassId
  };

  // Add descriptions if provided
  if (productData.description) {
    product.description = cleanText(productData.description);
  }

  if (productData.short_description) {
    product.short_description = cleanText(productData.short_description);
  }

  // Add stock information
  product.extension_attributes = {
    stock_item: {
      qty: productData.qty || defaults.qty,
      is_in_stock: defaults.isInStock,
      manage_stock: defaults.manageStock,
      stock_status: defaults.stockStatus
    }
  };

  return product;
}

/**
 * Clean and normalize text content
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  if (!text) return '';

  const textProcessing = config.dataProcessing.textProcessing;

  let cleaned = text;

  // Strip HTML tags if configured
  if (textProcessing.stripHtml) {
    cleaned = cleaned.replace(/<[^>]*>/g, '');
  }

  // Normalize whitespace
  if (textProcessing.normalizeWhitespace) {
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
  }

  // Convert encoding if needed
  if (textProcessing.convertEncoding) {
    // Ensure UTF-8 encoding
    cleaned = Buffer.from(cleaned, 'utf8').toString('utf8');
  }

  return cleaned;
}

/**
 * Split array into chunks
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Generate migration summary
 * @param {Array} results - Migration results
 * @returns {Object} Summary object
 */
function generateSummary(results) {
  const total = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const created = results.filter(r => r.action === 'created').length;
  const updated = results.filter(r => r.action === 'updated').length;
  const skipped = results.filter(r => r.action === 'skipped').length;

  return {
    total,
    successful,
    failed,
    created,
    updated,
    skipped,
    successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
    failureRate: total > 0 ? Math.round((failed / total) * 100) : 0
  };
}

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Delay promise
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = router;