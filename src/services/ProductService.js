import magentoApi from './magentoApi';
import { toast } from 'react-toastify';

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
        const lines = csvContent.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV file must contain at least a header and one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const products = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i]);
            if (values.length === 0) continue; // Skip empty lines

            const product = {};
            headers.forEach((header, index) => {
                product[header] = values[index] || '';
            });

            // Skip products without SKU
            if (!product.sku || product.sku.trim() === '') {
                console.warn(`Skipping product at line ${i + 1}: No SKU provided`);
                continue;
            }

            products.push(product);
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
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    /**
     * Transform CSV product data to Magento API format
     * @param {Object} csvProduct - Product data from CSV
     * @returns {Object} Magento API formatted product
     */
    transformToMagentoFormat(csvProduct) {
        const product = {
            sku: csvProduct.sku,
            name: csvProduct.name,
            attribute_set_id: this.getAttributeSetId(csvProduct.attribute_set_code),
            price: parseFloat(csvProduct.price) || 0,
            status: csvProduct.product_online === '1' ? 1 : 2, // 1 = enabled, 2 = disabled
            visibility: this.getVisibilityId(csvProduct.visibility),
            type_id: csvProduct.product_type || 'simple',
            weight: parseFloat(csvProduct.weight) || 0,
            custom_attributes: []
        };

        // Add description as custom attribute
        if (csvProduct.description) {
            product.custom_attributes.push({
                attribute_code: 'description',
                value: csvProduct.description
            });
        }

        // Add short description
        if (csvProduct.short_description) {
            product.custom_attributes.push({
                attribute_code: 'short_description',
                value: csvProduct.short_description
            });
        }

        // Add country of manufacture
        if (csvProduct.country_of_manufacture) {
            product.custom_attributes.push({
                attribute_code: 'country_of_manufacture',
                value: csvProduct.country_of_manufacture
            });
        }

        // Parse and add additional attributes
        if (csvProduct.additional_attributes) {
            this.parseAdditionalAttributes(csvProduct.additional_attributes, product.custom_attributes);
        }

        // Add categories
        if (csvProduct.categories) {
            product.extension_attributes = {
                category_links: this.parseCategoryLinks(csvProduct.categories)
            };
        }

        // Add stock information
        if (csvProduct.qty) {
            if (!product.extension_attributes) {
                product.extension_attributes = {};
            }
            product.extension_attributes.stock_item = {
                qty: parseInt(csvProduct.qty) || 0,
                is_in_stock: parseInt(csvProduct.qty) > 0,
                manage_stock: true
            };
        }

        return product;
    }

    /**
     * Parse additional attributes from CSV format (key=value,key=value)
     * @param {string} attributesString - Comma-separated key=value pairs
     * @param {Array} customAttributes - Array to add attributes to
     */
    parseAdditionalAttributes(attributesString, customAttributes) {
        const pairs = attributesString.split(',');
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value) {
                customAttributes.push({
                    attribute_code: key.trim(),
                    value: value.trim()
                });
            }
        });
    }

    /**
     * Parse category links from CSV format
     * @param {string} categoriesString - Category paths separated by commas
     * @returns {Array} Array of category links
     */
    parseCategoryLinks(categoriesString) {
        // This is a simplified version - in production, you'd need to map category paths to IDs
        const categoryPaths = categoriesString.split(',');
        return categoryPaths.map((path, index) => ({
            position: index,
            category_id: this.getCategoryIdFromPath(path.trim())
        }));
    }

    /**
     * Get category ID from category path (simplified - needs actual mapping)
     * @param {string} categoryPath - Category path
     * @returns {string} Category ID
     */
    getCategoryIdFromPath(categoryPath) {
        // This is a placeholder - implement actual category mapping
        // You would need to maintain a mapping of category paths to IDs
        return "2"; // Default category
    }

    /**
     * Get attribute set ID from code
     * @param {string} attributeSetCode - Attribute set code
     * @returns {number} Attribute set ID
     */
    getAttributeSetId(attributeSetCode) {
        const mapping = {
            'Default': 4,
            'Bag': 9,
            'Bottom': 10,
            'Downloadable': 11,
            'Gear': 12,
            'Top': 13
        };
        return mapping[attributeSetCode] || 4; // Default to 4
    }

    /**
     * Get visibility ID from string
     * @param {string} visibility - Visibility string
     * @returns {number} Visibility ID
     */
    getVisibilityId(visibility) {
        const mapping = {
            'Not Visible Individually': 1,
            'Catalog': 2,
            'Search': 3,
            'Catalog, Search': 4
        };
        return mapping[visibility] || 4; // Default to "Catalog, Search"
    }

    /**
     * Create a single product via Magento API
     * @param {Object} productData - Product data
     * @returns {Promise} API response
     */
    async createProduct(productData) {
        try {
            const response = await magentoApi.post('/products', {
                product: productData
            });
            return { success: true, data: response.data, sku: productData.sku };
        } catch (error) {
            console.error(`Failed to create product ${productData.sku}:`, error);
            return { 
                success: false, 
                error: error.response?.data?.message || error.message,
                sku: productData.sku 
            };
        }
    }

    /**
     * Process products in batches with retry logic
     * @param {Array} products - Array of products to create
     * @param {Function} onProgress - Progress callback
     * @returns {Promise} Results summary
     */
    async processBulkProducts(products, onProgress) {
        const results = {
            total: products.length,
            successful: 0,
            failed: 0,
            errors: []
        };

        // Process in batches
        for (let i = 0; i < products.length; i += this.batchSize) {
            const batch = products.slice(i, i + this.batchSize);
            const batchPromises = batch.map(product => this.createProductWithRetry(product));
            
            const batchResults = await Promise.allSettled(batchPromises);
            
            batchResults.forEach((result, index) => {
                const currentIndex = i + index;
                if (result.status === 'fulfilled' && result.value.success) {
                    results.successful++;
                } else {
                    results.failed++;
                    const error = result.status === 'rejected' 
                        ? result.reason 
                        : result.value.error;
                    results.errors.push({
                        sku: batch[index].sku,
                        error: error
                    });
                }
                
                // Call progress callback
                if (onProgress) {
                    onProgress({
                        current: currentIndex + 1,
                        total: products.length,
                        successful: results.successful,
                        failed: results.failed
                    });
                }
            });

            // Small delay between batches to avoid overwhelming the API
            if (i + this.batchSize < products.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        return results;
    }

    /**
     * Create product with retry logic
     * @param {Object} productData - Product data
     * @returns {Promise} Result
     */
    async createProductWithRetry(productData) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const result = await this.createProduct(productData);
                if (result.success) {
                    return result;
                }
                lastError = result.error;
            } catch (error) {
                lastError = error;
            }
            
            // Wait before retry (exponential backoff)
            if (attempt < this.retryAttempts) {
                await new Promise(resolve => 
                    setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
                );
            }
        }
        
        throw lastError;
    }
}

    /**
     * Process configurable products with their variations
     * @param {Object} csvProduct - Configurable product from CSV
     * @returns {Promise} Results of creating configurable product and variations
     */
    async processConfigurableProduct(csvProduct) {
        try {
            // First create the configurable product
            const configurableProduct = this.transformToMagentoFormat(csvProduct);
            configurableProduct.type_id = 'configurable';

            // Parse configurable variations
            const variations = this.parseConfigurableVariations(csvProduct.configurable_variations);

            // Create the main configurable product
            const mainProductResult = await this.createProduct(configurableProduct);
            if (!mainProductResult.success) {
                return {
                    success: false,
                    error: `Failed to create configurable product: ${mainProductResult.error}`,
                    sku: csvProduct.sku
                };
            }

            // Create variation products
            const variationResults = [];
            for (const variation of variations) {
                const variationProduct = {
                    ...configurableProduct,
                    sku: variation.sku,
                    type_id: 'simple',
                    visibility: 1, // Not visible individually
                    custom_attributes: [
                        ...configurableProduct.custom_attributes,
                        ...this.createVariationAttributes(variation.attributes)
                    ]
                };

                const result = await this.createProduct(variationProduct);
                variationResults.push(result);
            }

            // Link variations to configurable product
            await this.linkVariationsToConfigurable(csvProduct.sku, variations);

            return {
                success: true,
                mainProduct: mainProductResult,
                variations: variationResults,
                sku: csvProduct.sku
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                sku: csvProduct.sku
            };
        }
    }

    /**
     * Parse configurable variations from CSV format
     * @param {string} variationsString - Variations in format: sku=SKU1,attr=value|sku=SKU2,attr=value
     * @returns {Array} Array of variation objects
     */
    parseConfigurableVariations(variationsString) {
        if (!variationsString) return [];

        const variations = [];
        const variationParts = variationsString.split('|');

        variationParts.forEach(part => {
            const variation = { attributes: {} };
            const attributes = part.split(',');

            attributes.forEach(attr => {
                const [key, value] = attr.split('=');
                if (key && value) {
                    if (key.trim() === 'sku') {
                        variation.sku = value.trim();
                    } else {
                        variation.attributes[key.trim()] = value.trim();
                    }
                }
            });

            if (variation.sku) {
                variations.push(variation);
            }
        });

        return variations;
    }

    /**
     * Create custom attributes for variation products
     * @param {Object} attributes - Variation attributes
     * @returns {Array} Array of custom attributes
     */
    createVariationAttributes(attributes) {
        const customAttributes = [];

        Object.entries(attributes).forEach(([key, value]) => {
            customAttributes.push({
                attribute_code: key,
                value: value
            });
        });

        return customAttributes;
    }

    /**
     * Link variation products to configurable product
     * @param {string} configurableSku - SKU of configurable product
     * @param {Array} variations - Array of variations
     * @returns {Promise} API response
     */
    async linkVariationsToConfigurable(configurableSku, variations) {
        try {
            const linkData = {
                childSku: variations.map(v => v.sku)
            };

            const response = await magentoApi.post(
                `/configurable-products/${configurableSku}/children`,
                linkData
            );

            return { success: true, data: response.data };
        } catch (error) {
            console.error(`Failed to link variations to ${configurableSku}:`, error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Validate CSV data before processing
     * @param {Array} products - Array of products from CSV
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
            requiredFields.forEach(field => {
                if (!product[field] || product[field].trim() === '') {
                    errors.push(`Line ${lineNumber}: Missing required field '${field}'`);
                }
            });

            // Check for duplicate SKUs
            if (product.sku) {
                if (skuSet.has(product.sku)) {
                    errors.push(`Line ${lineNumber}: Duplicate SKU '${product.sku}'`);
                } else {
                    skuSet.add(product.sku);
                }
            }

            // Validate product type
            const validTypes = ['simple', 'configurable', 'virtual', 'downloadable'];
            if (product.product_type && !validTypes.includes(product.product_type)) {
                warnings.push(`Line ${lineNumber}: Unknown product type '${product.product_type}'`);
            }

            // Validate configurable products have variations
            if (product.product_type === 'configurable' && !product.configurable_variations) {
                warnings.push(`Line ${lineNumber}: Configurable product '${product.sku}' has no variations defined`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            totalProducts: products.length,
            configurableProducts: products.filter(p => p.product_type === 'configurable').length,
            simpleProducts: products.filter(p => p.product_type === 'simple').length
        };
    }
}

export default new ProductService();
