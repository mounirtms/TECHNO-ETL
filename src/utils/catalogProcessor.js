/**
 * Catalog CSV Processor
 * Processes the full export_catalog_product.csv and creates import-ready CSV
 */

// Simple CSV parser for catalog processing - optimized for performance
const parseCSVContent = (csvContent) => {
  if (!csvContent || typeof csvContent !== 'string') {
    throw new Error('Invalid CSV content provided');
  }

  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const products = [];

  // Use a more efficient loop
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);

    if (values.length === 0) continue;

    // Use object literal instead of dynamic property assignment
    const product = {};

    for (let j = 0; j < headers.length; j++) {
      product[headers[j]] = values[j] || '';
    }

    if (product.sku && product.sku.trim() !== '') {
      products.push(product);
    }
  }

  return products;
};

// Parse a single CSV line handling quoted values and commas - optimized
const parseCsvLine = (line) => {
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
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

/**
 * Default values for Magento import based on the corrected sample
 */
const DEFAULT_VALUES = {
  attribute_set_code: 'Products',
  product_websites: 'base',
  product_online: '1',
  tax_class_name: 'Taxable Goods',
  visibility: 'Search',
  country_of_manufacture: 'France',
  out_of_stock_qty: '0',
  configurable_variations: '',
};

/**
 * Extract valid brand values from the catalog
 */
export const extractValidBrands = (catalogData) => {
  if (!Array.isArray(catalogData)) {
    return [];
  }

  const brands = new Set();

  catalogData.forEach(product => {
    if (product.additional_attributes) {
      const brandMatch = product.additional_attributes.match(/mgs_brand=([^,]+)/);

      if (brandMatch) {
        brands.add(brandMatch[1]);
      }
    }
  });

  return Array.from(brands).sort();
};

// Export the main functions
export { parseCSVContent, parseCsvLine, DEFAULT_VALUES };

// Main processor function - renamed from processCatalog to processCatalogToImportCSV
export const processCatalogToImportCSV = async (csvContent, options = {}) => {
  try {
    const catalogData = parseCSVContent(csvContent);
    
    // Extract metadata
    const validBrands = extractValidBrands(catalogData);
    const validDimensions = extractValidDimensions(catalogData);
    const validCategories = extractValidCategories(catalogData);
    
    // Filter products based on options
    let filteredProducts = [...catalogData];
    if (options.includeSimple === false) {
      filteredProducts = filteredProducts.filter(p => p.product_type !== 'simple');
    }
    if (options.includeConfigurable === false) {
      filteredProducts = filteredProducts.filter(p => p.product_type !== 'configurable');
    }
    
    // Process products
    const simpleProducts = filteredProducts.filter(p => p.product_type === 'simple');
    const configurableProducts = filteredProducts.filter(p => p.product_type === 'configurable');
    
    // Apply default values and process products
    const processedProducts = filteredProducts.map(product => ({
      ...DEFAULT_VALUES,
      ...product,
      // Add any additional processing needed here
    }));
    
    return {
      success: true,
      products: processedProducts,
      statistics: {
        total: processedProducts.length,
        simple: simpleProducts.length,
        configurable: configurableProducts.length,
        validProducts: processedProducts.length,
        skippedProducts: catalogData.length - filteredProducts.length,
        uniqueBrands: validBrands.length,
        uniqueCategories: validCategories.length
      },
      metadata: {
        validBrands,
        validDimensions,
        validCategories,
        simpleProducts: simpleProducts.length,
        configurableProducts: configurableProducts.length,
        totalProducts: catalogData.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to convert products array to CSV format
export const convertProductsToCSV = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return '';
  }
  
  // Get all unique headers from products
  const headers = new Set();
  products.forEach(product => {
    Object.keys(product).forEach(key => headers.add(key));
  });
  
  const headersArray = Array.from(headers);
  const csvRows = [];
  
  // Add header row
  csvRows.push(headersArray.join(','));
  
  // Add data rows
  products.forEach(product => {
    const values = headersArray.map(header => {
      const value = product[header] || '';
      // Escape commas and quotes in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

// Function to create batched CSVs
export const createBatchedCSVs = (products, batchSize = 100) => {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }
  
  const batches = [];
  for (let i = 0; i < products.length; i += batchSize) {
    batches.push(products.slice(i, i + batchSize));
  }
  
  return batches;
};

// Function to generate import report
export const generateImportReport = (processedData) => {
  if (!processedData || !processedData.statistics) {
    return {
      summary: {
        totalProducts: 0,
        simpleProducts: 0,
        configurableProducts: 0,
        uniqueBrands: 0
      },
      statistics: {
        validProducts: 0,
        skippedProducts: 0,
        uniqueCategories: 0,
        uniqueBrands: 0
      },
      warnings: []
    };
  }
  
  const warnings = [];
  if (processedData.statistics.skippedProducts > 0) {
    warnings.push(`Skipped ${processedData.statistics.skippedProducts} products due to filtering`);
  }
  
  return {
    summary: {
      totalProducts: processedData.statistics.total || 0,
      simpleProducts: processedData.statistics.simple || 0,
      configurableProducts: processedData.statistics.configurable || 0,
      uniqueBrands: processedData.statistics.uniqueBrands || 0
    },
    statistics: {
      validProducts: processedData.statistics.validProducts || 0,
      skippedProducts: processedData.statistics.skippedProducts || 0,
      uniqueCategories: processedData.statistics.uniqueCategories || 0,
      uniqueBrands: processedData.statistics.uniqueBrands || 0
    },
    warnings
  };
};

// Helper functions (implement these based on your needs)
const extractValidDimensions = (catalogData) => {
  // Implementation
  return [];
};

const extractValidCategories = (catalogData) => {
  // Implementation
  return [];
};