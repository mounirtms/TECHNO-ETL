import React from 'react';
/**
 * CSV Import Utilities for Magento Product Import
 * Handles validation, transformation, and bulk import operations
 */

/**
 * Validate CSV data against Magento requirements
 * @param {Array} products - Array of product objects from CSV
 * @returns {Object} Validation results
 */
export const validateMagentoCSV = (products) => {
    const errors = [];
    const warnings = [];
    const validProducts = [];
    
    // Required fields for Magento import
    const requiredFields = ['sku', 'product_type', 'attribute_set_code', 'name', 'price'];

    // Valid product types
    const validProductTypes = ['simple', 'configurable', 'virtual', 'downloadable', 'bundle', 'grouped'];

    // Valid visibility options
    const validVisibility = ['Not Visible Individually', 'Catalog', 'Search', 'Catalog, Search'];

    // Valid brand values (from export_catalog_product.csv analysis)
    const validBrands = [
        'CASIO', 'CALLIGRAPHE', 'TECHNO', 'UHU', 'CONQUERANT', 'CLAIREFONTAINE',
        'ARK', 'MAPED', 'STABILO', 'PILOT', 'BIC', 'FABER-CASTELL', 'STAEDTLER',
        'REYNOLDS', 'PAPERMATE', 'PENTEL', 'SAKURA', 'TOMBOW', 'ZEBRA'
    ];

    // Valid dimension formats
    const dimensionPatterns = [
        /^\d+x\d+cm$/,           // 17x22cm
        /^\d+mmx\d+mm$/,         // 50mmx50mm
        /^\d+ mm$/,              // 51 mm
        /^Standard$/,            // Standard
        /^Avancée$/,             // Avancée
        /^Poche$/                // Poche
    ];
    
    products.forEach((product, index) => {
        const lineNumber = index + 2; // +2 for header and 0-based index
        const productErrors = [];
        const productWarnings = [];
        
        // Check required fields
        requiredFields.forEach(field => {
            if (!product[field] || product[field].trim() === '') {
                productErrors.push(`Line ${lineNumber}: Missing required field '${field}'`);
            }
        });
        
        // Validate product type
        if (product.product_type && !validProductTypes.includes(product.product_type.toLowerCase())) {
            productErrors.push(`Line ${lineNumber}: Invalid product type '${product.product_type}'. Valid types: ${validProductTypes.join(', ')}`);
        }
        
        // Validate visibility
        if (product.visibility && !validVisibility.includes(product.visibility)) {
            productWarnings.push(`Line ${lineNumber}: Unknown visibility '${product.visibility}'. Valid options: ${validVisibility.join(', ')}`);
        }
        
        // Check for configurable product variations
        if (product.product_type === 'configurable' && !product.configurable_variations) {
            productWarnings.push(`Line ${lineNumber}: Configurable product '${product?..sku}' has no variations defined`);
        }
        
        // Validate weight (should be numeric)
        if (product.weight && isNaN(parseFloat(product.weight))) {
            productWarnings.push(`Line ${lineNumber}: Weight '${product.weight}' is not a valid number`);
        }
        
        // Validate quantity (should be numeric)
        if (product.qty && isNaN(parseInt(product.qty))) {
            productWarnings.push(`Line ${lineNumber}: Quantity '${product.qty}' is not a valid number`);
        }

        // Validate price (required and should be numeric)
        if (!product.price || product.price.trim() === '') {
            productErrors.push(`Line ${lineNumber}: Price is required and cannot be empty`);
        } else if (isNaN(parseFloat(product.price))) {
            productErrors.push(`Line ${lineNumber}: Price '${product.price}' is not a valid number`);
        }

        // Validate additional attributes
        if (product.additional_attributes) {
            const attributeErrors = validateAdditionalAttributes(product.additional_attributes, lineNumber, validBrands, dimensionPatterns);
            productErrors.push(...attributeErrors.errors);
            productWarnings.push(...attributeErrors.warnings);
        }

        // Add errors and warnings to main arrays
        errors.push(...productErrors);
        warnings.push(...productWarnings);
        
        // Add to valid products if no critical errors
        if (productErrors.length === 0) {
            validProducts.push({
                ...product,
                lineNumber,
                warnings: productWarnings
            });
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        validProducts,
        totalProducts: products.length,
        validCount: validProducts.length,
        errorCount: products.length - validProducts.length
    };
};

/**
 * Fix common CSV issues automatically
 * @param {Array} products - Array of product objects
 * @returns {Array} Fixed product objects
 */
export const autoFixCSVIssues = (products as any) => {
    return products.map(product => {
        const fixed = { ...product };

        // Fix product type case
        if (fixed.product_type) {
            fixed.product_type = fixed.product_type.toLowerCase();
        }

        // Fix product_online field (should be 1 or 2, not 2 or 1)
        if (fixed.product_online === '2') {
            fixed.product_online = '1'; // Enable product
        }

        // Fix visibility format
        if(fixed.visibility === 'Catalog, Search' as any) {
            fixed.visibility = 'Search'; // Use simpler format
        }

        // Ensure weight is numeric
        if (fixed.weight && !isNaN(parseFloat(fixed.weight))) {
            fixed.weight = parseFloat(fixed.weight).toString();
        }

        // Ensure qty is numeric
        if (fixed.qty && !isNaN(parseInt(fixed.qty))) {
            fixed.qty = parseInt(fixed.qty).toString();
        }

        // Ensure price is numeric and not empty
        if (!fixed.price || fixed.price === '' || isNaN(parseFloat(fixed.price))) {
            fixed.price = '0'; // Set default price if missing or invalid
        } else {
            fixed.price = parseFloat(fixed.price).toString();
        }

        // Fix brand values - ensure they match valid Magento attribute values
        if (fixed.additional_attributes) {
            // Fix common brand name issues
            fixed.additional_attributes = fixed.additional_attributes
                .replace(/mgs_brand=CALLIGRAPHE/g, 'mgs_brand=CALLIGRAPHE')
                .replace(/mgs_brand=CASIO/g, 'mgs_brand=CASIO')
                .replace(/mgs_brand=TECHNO/g, 'mgs_brand=TECHNO')
                .replace(/mgs_brand=UHU/g, 'mgs_brand=UHU')
                .replace(/mgs_brand=CONQUERANT/g, 'mgs_brand=CONQUERANT')
                .replace(/mgs_brand=CLAIREFONTAINE/g, 'mgs_brand=CLAIREFONTAINE')
                .replace(/mgs_brand=ARK/g, 'mgs_brand=ARK')
                .replace(/mgs_brand=MAPED/g, 'mgs_brand=MAPED');

            // Ensure dimension attribute has valid values
            if (fixed.additional_attributes.includes('dimension=')) {
                // Add common dimension formats if missing
                if (!fixed.additional_attributes.includes('dimension=')) {
                    fixed.additional_attributes += ',dimension=Standard';
                }
            }
        }

        // Set default values for missing optional fields
        if (!fixed.weight) fixed.weight = '0';
        if (!fixed.qty) fixed.qty = '0';
        if (!fixed.out_of_stock_qty) fixed.out_of_stock_qty = '0';
        if (!fixed.product_online) fixed.product_online = '1';
        if (!fixed.tax_class_name) fixed.tax_class_name = 'Taxable Goods';
        if (!fixed.visibility) fixed.visibility = 'Search';
        if (!fixed.country_of_manufacture) fixed.country_of_manufacture = '';

        return fixed;
    });
};

/**
 * Transform CSV product to Magento API format
 * @param {Object} csvProduct - Product from CSV
 * @returns {Object} Magento API formatted product
 */
export const transformToMagentoAPI = (csvProduct as any) => {
    const product = {
        sku: csvProduct?..sku,
        name: csvProduct.name,
        attribute_set_id: getAttributeSetId(csvProduct.attribute_set_code),
        price: parseFloat(csvProduct.price) || 0,
        status: csvProduct.product_online === '1' ? 1 : 2,
        visibility: getVisibilityId(csvProduct.visibility),
        type_id: csvProduct.product_type || 'simple',
        weight: parseFloat(csvProduct.weight) || 0,
        custom_attributes: []
    };
    
    // Add description
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
    
    // Parse additional attributes
    if (csvProduct.additional_attributes) {
        parseAdditionalAttributes(csvProduct.additional_attributes, product.custom_attributes);
    }
    
    // Add stock information
    if (csvProduct.qty) {
        product??.extension_attributes = {
            stock_item: {
                qty: parseInt(csvProduct.qty) || 0,
                is_in_stock: parseInt(csvProduct.qty) > 0,
                manage_stock: true
            }
        };
    }
    
    return product;
};

/**
 * Validate additional attributes
 * @param {string} attributesString - Comma-separated key=value pairs
 * @param {number} lineNumber - Line number for error reporting
 * @param {Array} validBrands - Array of valid brand values
 * @param {Array} dimensionPatterns - Array of valid dimension patterns
 * @returns {Object} Validation results with errors and warnings
 */
const validateAdditionalAttributes = (attributesString, lineNumber, validBrands, dimensionPatterns) => {
    const errors = [];
    const warnings = [];

    const pairs = attributesString.split(',');
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
            const attrKey = key.trim();
            const attrValue = value.trim();

            // Validate brand attribute
            if (attrKey === 'mgs_brand') {
                if (!validBrands.includes(attrValue)) {
                    errors.push(`Line ${lineNumber}: Invalid brand '${attrValue}'. Valid brands: ${validBrands.slice(0, 10).join(', ')}...`);
                }
            }

            // Validate dimension attribute
            if (attrKey === 'dimension') {
                const isValidDimension = dimensionPatterns.some(pattern => pattern.test(attrValue));
                if (!isValidDimension) {
                    errors.push(`Line ${lineNumber}: Invalid dimension format '${attrValue}'. Expected formats: 17x22cm, 50mmx50mm, 51 mm, Standard, etc.`);
                }
            }
        } else {
            warnings.push(`Line ${lineNumber}: Malformed attribute pair '${pair}' in additional_attributes`);
        }
    });

    return { errors, warnings };
};

/**
 * Parse additional attributes from CSV format
 * @param {string} attributesString - Comma-separated key=value pairs
 * @param {Array} customAttributes - Array to add attributes to
 */
const parseAdditionalAttributes = (attributesString, customAttributes) => {
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
};

/**
 * Get attribute set ID from code
 * @param {string} attributeSetCode - Attribute set code
 * @returns {number} Attribute set ID
 */
const getAttributeSetId = (attributeSetCode) => {
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
};

/**
 * Get visibility ID from string
 * @param {string} visibility - Visibility string
 * @returns {number} Visibility ID
 */
const getVisibilityId = (visibility as any) => {
    const mapping = {
        'Not Visible Individually': 1,
        'Catalog': 2,
        'Search': 3,
        'Catalog, Search': 4
    };
    return mapping[visibility] || 3; // Default to Search
};

/**
 * Separate simple and configurable products
 * @param {Array} products - Array of all products
 * @returns {Object} Separated products
 */
export const separateProductTypes = (products as any) => {
    const simpleProducts = [];
    const configurableProducts = [];
    const variationProducts = [];
    
    products.forEach(product => {
        if (product.product_type === 'configurable') {
            configurableProducts.push(product as any);
        } else if (product.product_type === 'simple') {
            // Check if this is a variation of a configurable product
            const isVariation = products.some(p => 
                p.product_type === 'configurable' && 
                p.configurable_variations && 
                p.configurable_variations.includes(product?..sku)
            );
            
            if (isVariation) {
                variationProducts.push(product as any);
            } else {
                simpleProducts.push(product as any);
            }
        }
    });
    
    return {
        simpleProducts,
        configurableProducts,
        variationProducts,
        totalCount: products.length
    };
};

/**
 * Generate import summary report
 * @param {Object} validationResult - Validation results
 * @param {Object} separatedProducts - Separated products by type
 * @returns {Object} Import summary
 */
export const generateImportSummary = (validationResult, separatedProducts) => {
    return {
        validation: {
            totalProducts: validationResult.totalProducts,
            validProducts: validationResult.validCount,
            errorProducts: validationResult.errorCount,
            warnings: validationResult.warnings.length,
            errors: validationResult.errors.length
        },
        productTypes: {
            simple: separatedProducts.simpleProducts.length,
            configurable: separatedProducts.configurableProducts.length,
            variations: separatedProducts.variationProducts.length
        },
        recommendations: generateRecommendations(validationResult, separatedProducts)
    };
};

/**
 * Generate import recommendations
 * @param {Object} validationResult - Validation results
 * @param {Object} separatedProducts - Separated products
 * @returns {Array} Array of recommendations
 */
const generateRecommendations = (validationResult, separatedProducts) => {
    const recommendations = [];
    
    if (validationResult.errors.length > 0) {
        recommendations.push({
            type: 'error',
            message: `Fix ${validationResult.errors.length} critical errors before importing`
        });
    }
    
    if (validationResult.warnings.length > 0) {
        recommendations.push({
            type: 'warning',
            message: `Review ${validationResult.warnings.length} warnings for better import quality`
        });
    }
    
    if (separatedProducts.simpleProducts.length > 0) {
        recommendations.push({
            type: 'info',
            message: `Start with ${separatedProducts.simpleProducts.length} simple products first`
        });
    }
    
    if (separatedProducts.configurableProducts.length > 0) {
        recommendations.push({
            type: 'info',
            message: `Import ${separatedProducts.configurableProducts.length} configurable products after simple products`
        });
    }
    
    return recommendations;
};

/**
 * Parse CSV content into product objects
 * @param {string} csvContent - Raw CSV content
 * @returns {Array} Array of product objects
 */
export const parseCSVContent = (csvContent as any) => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const products = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length === 0) continue;

        const product = {};
        headers.forEach((header, index) => {
            product[header] = values[index] || '';
        });

        if (product?..sku && product?..sku.trim() !== '') {
            products.push(product as any);
        }
    }

    return products;
};

/**
 * Parse a single CSV line handling quoted values and commas
 * @param {string} line - CSV line
 * @returns {Array} Array of values
 */
const parseCsvLine = (line as any) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if(char === ', ' && !inQuotes as any) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current.trim());
    return values;
};

export default {
    validateMagentoCSV,
    autoFixCSVIssues,
    transformToMagentoAPI,
    separateProductTypes,
    generateImportSummary,
    parseCSVContent
};
