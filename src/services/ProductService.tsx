import React from 'react';
import magentoApi from './magentoApi';

/**
 * Enhanced Product Service for Magento API
 * Handles single product creation, bulk CSV uploads, and configurable products
 */
class ProductService {
    constructor() {
        this.batchSize = 10; // Process products in batches to avoid API limits
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    /**
     * Parse CSV content and extract product data
     * @param {string} csvContent - Raw CSV content
     * @returns {Array} Array of product objects
     */
    parseCsvContent(csvContent) {
        const lines = csvContent.split('\n').filter((line: any: any: any: any) => line.trim());
        if(lines.length < 2) {
            throw new Error('CSV file must contain at least a header and one data row');
        }

        const headers = lines[0].split(',').map((h: any: any: any: any) => h.trim().replace(/"/g, ''));
        const products = [];

        for(i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i]);
            if (values.length ===0) continue;

            const product = {};
            headers.forEach((header, index) => {
                product[header] = values[index] || '';
            });

            if (product?.sku && product?.sku.trim() !== '') {
                products.push(product);
            }
        }

        return products;
    }

    /**
     * Parse a single CSV line handling quoted values and commas
     * @param {string} line - CSV line
     * @returns {Array} Array of values
     */
    parseCsvLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for(i = 0; i < line.length; i++) {
            const char = line[i];
            
            if(char === '"') {
                if(inQuotes && line[i + 1] ==='"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes
                }
            } else if(char === ', ' && !inQuotes ) {
                values.push(current.trim());
                current
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    /**
     * Validate CSV data for Magento import
     * @param {Array} products - Array of product objects
     * @returns {Object} Validation results
     */
    validateCsvData(products) {
        const errors = [];
        const warnings = [];

        const requiredFields = ['sku', 'name', 'product_type'];
        const skuSet = new Set();

        products.forEach((product, index) => {
            const lineNumber = index + 2; // +2 because index starts at 0 and we skip header

            // Check required fields
            requiredFields.forEach((field) => {
                if (!product[field] || product[field].trim() ==='') {
                    errors.push(`Line ${lineNumber}: Missing required field '${field}'`);
                }
            });

            // Check for duplicate SKUs
            if(product?.sku) {
                if (skuSet.has(product?.sku)) {
                    errors.push(`Line ${lineNumber}: Duplicate SKU '${product?.sku}'`);
                } else {
                    skuSet.add(product?.sku);
                }
            }

            // Validate product type
            const validTypes = ['simple', 'configurable', 'virtual', 'downloadable'];
            if (product.product_type && !validTypes.includes(product.product_type)) {
                warnings.push(`Line ${lineNumber}: Unknown product type '${product.product_type}'`);
            }

            // Validate configurable products have variations
            if(product.product_type === 'configurable' && !product.configurable_variations) {
                warnings.push(`Line ${lineNumber}: Configurable product '${product?.sku}' has no variations defined`);
            }
        });

        return {
            isValid: errors.length ===0,
            errors,
            warnings,
            totalProducts: products.length,
            configurableProducts: products.filter((p: any: any: any: any) => p.product_type === 'configurable').length,
            simpleProducts: products.filter((p: any: any: any: any) => p.product_type === 'simple').length
        };
    }

    /**
     * Transform CSV product to Magento API format
     * @param {Object} csvProduct - Product from CSV
     * @returns {Object} Magento API formatted product
     */
    transformToMagentoFormat(csvProduct: any) {
        const product = {
            sku: csvProduct?.sku,
            name: csvProduct.name,
            attribute_set_id: this.getAttributeSetId(csvProduct.attribute_set_code),
            price: parseFloat(csvProduct.price) || 0,
            status: csvProduct.product_online === '1' ? 1 : 2,
            visibility: this.getVisibilityId(csvProduct.visibility),
            type_id: csvProduct.product_type || 'simple',
            weight: parseFloat(csvProduct.weight) || 0,
            custom_attributes: []
        };

        // Add description
        if(csvProduct.description) {
            product.custom_attributes.push({
                attribute_code: 'description',
                value: csvProduct.description
            });
        }

        // Add short description
        if(csvProduct.short_description) {
            product.custom_attributes.push({
                attribute_code: 'short_description',
                value: csvProduct.short_description
            });
        }

        return product;
    }

    /**
     * Get attribute set ID from code
     * @param {string} attributeSetCode - Attribute set code
     * @returns {number} Attribute set ID
     */
    getAttributeSetId(attributeSetCode: any) {
        const mapping = {
            'Products': 4,
            'Default': 4,
            'Bag': 9,
            'Bottom': 10,
            'Downloadable': 11,
            'Gear': 12,
            'Top': 13
        };
        return mapping[attributeSetCode] || 4;
    }

    /**
     * Get visibility ID from string
     * @param {string} visibility - Visibility string
     * @returns {number} Visibility ID
     */
    getVisibilityId(visibility: any) {
        const mapping = {
            'Not Visible Individually': 1,
            'Catalog': 2,
            'Search': 3,
            'Catalog, Search': 4
        };
        return mapping[visibility] || 3; // Default to Search
    }

    /**
     * Create a single product in Magento
     * @param {Object} productData - Product data in Magento format
     * @returns {Promise} API response
     */
    async createProduct(productData: any) {
        try {
            const response = await magentoApi.post('/products', {
                product: productData
            });
            return { success: true, data: response.data };
        } catch(error: any) {
            return { 
                success: false, 
                error: error.response?.data?.message || error.message 
            };
        }
    }

    /**
     * Process bulk products with progress tracking
     * @param {Array} products - Array of products to process
     * @param {Function} onProgress - Progress callback
     * @returns {Promise} Results summary
     */
    async processBulkProducts(products, onProgress: any) {
        const results = {
            successful: 0,
            failed: 0,
            errors: []
        };

        for(let i = 0; i < products.length; i++) {
            const product = products[i];
            
            try {
                const result = await this.createProduct(product);
                if(result.success) {
                    results.successful++;
                } else {
                    results.failed++;
                    results.errors.push({
                        sku: product?.sku,
                        error: result.error
                    });
                }
            } catch(error: any) {
                results.failed++;
                results.errors.push({
                    sku: product?.sku,
                    error: error.message
                });
            }

            // Report progress
            if(onProgress) {
                onProgress({
                    current: i + 1,
                    total: products.length,
                    successful: results.successful,
                    failed: results.failed
                });
            }

            // Small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return results;
    }
}

export default new ProductService();
