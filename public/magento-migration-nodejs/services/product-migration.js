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
  sku: Joi.string().required().pattern(/^[a-zA-Z0-9_-]+$/).messages({
    'string.pattern.base': 'SKU must contain only alphanumeric characters, hyphens, and underscores',
    'any.required': 'SKU is required'
  }),
  name: Joi.string().required().max(255).messages({
    'string.max': 'Product name must not exceed 255 characters',
    'any.required': 'Product name is required'
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price must be 0 or greater',
    'any.required': 'Price is required and cannot be empty'
  }),
  weight: Joi.number().min(0).default(1.0).messages({
    'number.min': 'Weight must be 0 or greater'
  }),
  description: Joi.string().allow('').max(2000).messages({
    'string.max': 'Description must not exceed 2000 characters'
  }),
  short_description: Joi.string().allow('').max(500).messages({
    'string.max': 'Short description must not exceed 500 characters'
  }),
  qty: Joi.number().integer().min(0).default(100).messages({
    'number.min': 'Quantity must be 0 or greater',
    'number.integer': 'Quantity must be a whole number'
  }),
  status: Joi.number().valid(1, 2).default(1).messages({
    'any.only': 'Status must be 1 (enabled) or 2 (disabled)'
  }),
  visibility: Joi.number().valid(1, 2, 3, 4).default(4).messages({
    'any.only': 'Visibility must be 1, 2, 3, or 4'
  }),
  tax_class_id: Joi.number().default(2),
  // Additional attributes for French office supplies
  mgs_brand: Joi.string().valid('casio', 'pilot', 'ark', 'calligraphe', 'stabilo', 'maped', 'bic', 'faber_castell', 'staedtler', 'pentel').messages({
    'any.only': 'Brand must be one of: casio, pilot, ark, calligraphe, stabilo, maped, bic, faber_castell, staedtler, pentel'
  }),
  color: Joi.string().valid('noir', 'bleu', 'rouge', 'vert', 'jaune', 'orange', 'violet', 'rose', 'marron', 'gris', 'blanc', 'transparent', 'multicolore', 'assortis').messages({
    'any.only': 'Color must be a valid French color name'
  }),
  techno_ref: Joi.string().allow(''),
  dimension: Joi.string().allow(''),
  capacity: Joi.string().allow('')
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
 * POST /api/products/validate-csv
 * Validate CSV data before migration
 *
 * This endpoint validates CSV data and provides detailed error reports
 * for fixing data issues before attempting migration.
 */
router.post('/validate-csv', async (req, res) => {
  try {
    logger.info('Starting CSV validation');

    const { csvData, options = {} } = req.body;

    if (!csvData || !Array.isArray(csvData)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'csvData must be an array of product objects'
      });
    }

    const validationResults = [];
    const errors = [];

    for (let i = 0; i < csvData.length; i++) {
      const rowIndex = i + 1; // 1-based row numbering
      const product = csvData[i];

      try {
        // Parse additional attributes if present
        const processedProduct = processAdditionalAttributes(product);

        // Validate against schema
        const { error, value } = simpleProductSchema.validate(processedProduct, {
          abortEarly: false,
          allowUnknown: true
        });

        if (error) {
          const rowErrors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }));

          errors.push({
            row: rowIndex,
            sku: product.sku || 'N/A',
            errors: rowErrors
          });

          validationResults.push({
            row: rowIndex,
            sku: product.sku || 'N/A',
            valid: false,
            errors: rowErrors
          });
        } else {
          validationResults.push({
            row: rowIndex,
            sku: value.sku,
            valid: true
          });
        }

      } catch (parseError) {
        errors.push({
          row: rowIndex,
          sku: product.sku || 'N/A',
          errors: [{
            field: 'parsing',
            message: parseError.message,
            value: null
          }]
        });

        validationResults.push({
          row: rowIndex,
          sku: product.sku || 'N/A',
          valid: false,
          errors: [{
            field: 'parsing',
            message: parseError.message
          }]
        });
      }
    }

    const summary = {
      totalRows: csvData.length,
      validRows: validationResults.filter(r => r.valid).length,
      invalidRows: validationResults.filter(r => !r.valid).length,
      errorCount: errors.length
    };

    // Group errors by type for better reporting
    const errorsByType = {};
    errors.forEach(error => {
      error.errors.forEach(err => {
        if (!errorsByType[err.field]) {
          errorsByType[err.field] = [];
        }
        errorsByType[err.field].push({
          row: error.row,
          sku: error.sku,
          message: err.message,
          value: err.value
        });
      });
    });

    res.json({
      success: true,
      message: 'CSV validation completed',
      summary,
      validationResults: options.includeDetails ? validationResults : undefined,
      errors: errors.length > 0 ? errors : undefined,
      errorsByType: Object.keys(errorsByType).length > 0 ? errorsByType : undefined,
      recommendations: generateValidationRecommendations(errorsByType),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logError('csv-validation', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Process additional attributes from CSV format
 * @param {Object} product - Raw product data from CSV
 * @returns {Object} Processed product data
 */
function processAdditionalAttributes(product) {
  const processed = { ...product };

  // Parse additional_attributes field if present
  if (product.additional_attributes) {
    const attributes = parseAdditionalAttributes(product.additional_attributes);
    Object.assign(processed, attributes);
  }

  // Ensure price is a number
  if (processed.price !== undefined && processed.price !== '') {
    processed.price = parseFloat(processed.price);
  }

  // Ensure weight is a number
  if (processed.weight !== undefined && processed.weight !== '') {
    processed.weight = parseFloat(processed.weight);
  }

  // Ensure qty is a number
  if (processed.qty !== undefined && processed.qty !== '') {
    processed.qty = parseInt(processed.qty);
  }

  return processed;
}

/**
 * Parse additional attributes string
 * @param {string} attributesString - Comma-separated key=value pairs
 * @returns {Object} Parsed attributes
 */
function parseAdditionalAttributes(attributesString) {
  const attributes = {};

  if (!attributesString) return attributes;

  const pairs = attributesString.split(',');
  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      attributes[key.trim()] = value.trim();
    }
  });

  return attributes;
}

/**
 * Generate validation recommendations
 * @param {Object} errorsByType - Errors grouped by type
 * @returns {Array} Recommendations
 */
function generateValidationRecommendations(errorsByType) {
  const recommendations = [];

  if (errorsByType.price) {
    recommendations.push({
      issue: 'Missing or invalid prices',
      solution: 'Ensure all products have valid numeric prices. Empty price fields must be filled.',
      affectedRows: errorsByType.price.length,
      example: 'price: 15.99'
    });
  }

  if (errorsByType.mgs_brand) {
    recommendations.push({
      issue: 'Invalid brand values',
      solution: 'Brand values must be lowercase and match predefined options.',
      affectedRows: errorsByType.mgs_brand.length,
      validValues: ['casio', 'pilot', 'ark', 'calligraphe', 'stabilo', 'maped', 'bic', 'faber_castell', 'staedtler', 'pentel'],
      example: 'mgs_brand=casio (not CASIO)'
    });
  }

  if (errorsByType.color) {
    recommendations.push({
      issue: 'Invalid color values',
      solution: 'Color values must be in French and lowercase.',
      affectedRows: errorsByType.color.length,
      validValues: ['noir', 'bleu', 'rouge', 'vert', 'jaune', 'orange', 'violet', 'rose', 'marron', 'gris', 'blanc', 'transparent', 'multicolore', 'assortis'],
      example: 'color=bleu (not BLEU or blue)'
    });
  }

  if (errorsByType.sku) {
    recommendations.push({
      issue: 'Invalid SKU format',
      solution: 'SKUs must contain only alphanumeric characters, hyphens, and underscores.',
      affectedRows: errorsByType.sku.length,
      example: 'sku: CASIO-FX-82MS-2'
    });
  }

  return recommendations;
}

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