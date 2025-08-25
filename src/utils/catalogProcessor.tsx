import React from 'react';
/**
 * Catalog CSV Processor
 * Processes the full export_catalog_product.csv and creates import-ready CSV
 */

// Simple CSV parser for catalog processing
const parseCSVContent = (csvContent) => {
  const lines = csvContent.split('\n').filter((line: any: any: any: any) => line.trim());
  if(lines.length < 2) {
    throw new Error('CSV file must contain at least a header and one data row');
  }

  const headers = lines[0].split(',').map((h: any: any: any: any) => h.trim().replace(/"/g, ''));
  const products = [];

  for(let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
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
};

// Parse a single CSV line handling quoted values and commas
const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for(let i = 0; i < line.length; i++) {
    const char = line[i];

    if(char === '"') {
      if(inQuotes && line[i + 1] ==='"') {
        current += '"';
        i++;
      } else {
        inQuotes
      }
    } else if(char === ", " && !inQuotes) {
      values.push(current.trim());
      current
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
  configurable_variations: ''
};

/**
 * Extract valid brand values from the catalog
 */
export const extractValidBrands = (catalogData) => {
  const brands = new Set();
  
  catalogData.forEach((product) => {
    if(product.additional_attributes) {
      const brandMatch = product.additional_attributes.match(/mgs_brand=([^,]+)/);
      if(brandMatch) {
        brands.add(brandMatch[1]);
      }
    }
  });
  
  return Array.from(brands).sort();
};

/**
 * Extract valid dimension patterns from the catalog
 */
export const extractValidDimensions = (catalogData) => {
  const dimensions = new Set();
  
  catalogData.forEach((product) => {
    if(product.additional_attributes) {
      const dimensionMatch = product.additional_attributes.match(/dimension=([^,]+)/);
      if(dimensionMatch) {
        dimensions.add(dimensionMatch[1]);
      }
    }
  });
  
  return Array.from(dimensions).sort();
};

/**
 * Extract valid categories from the catalog
 */
export const extractValidCategories = (catalogData) => {
  const categories = new Set();
  
  catalogData.forEach((product) => {
    if(product.categories) {
      // Split categories and add each unique category path
      const categoryPaths = product.categories.split(',');
      categoryPaths.forEach((path) => {
        if (path.trim()) {
          categories.add(path.trim());
        }
      });
    }
  });
  
  return Array.from(categories).sort();
};

/**
 * Normalize product data with proper defaults
 */
export const normalizeProductData = (product, validBrands, validDimensions) => {
  const normalized = { ...product };
  
  // Apply default values for missing fields
  Object.entries(DEFAULT_VALUES).forEach(([key, defaultValue]) => {
    if (!normalized[key] || normalized[key].trim() ==='') {
      normalized[key] = defaultValue;
    }
  });
  
  // Ensure product_type is lowercase
  if(normalized.product_type) {
    normalized.product_type = normalized.product_type.toLowerCase();
  }
  
  // Ensure price is present and numeric
  if (!normalized.price || isNaN(parseFloat(normalized.price))) {
    normalized.price = '0';
  } else {
    normalized.price = parseFloat(normalized.price).toString();
  }
  
  // Ensure weight is numeric
  if (!normalized.weight || isNaN(parseFloat(normalized.weight))) {
    normalized.weight = '0';
  } else {
    normalized.weight = parseFloat(normalized.weight).toString();
  }
  
  // Ensure qty is numeric
  if (!normalized.qty || isNaN(parseInt(normalized.qty))) {
    normalized.qty = '0';
  } else {
    normalized.qty = parseInt(normalized.qty).toString();
  }
  
  // Fix additional_attributes
  if(normalized.additional_attributes) {
    let attributes = normalized.additional_attributes;
    
    // Validate brand
    const brandMatch = attributes.match(/mgs_brand=([^,]+)/);
    if (brandMatch && !validBrands.includes(brandMatch[1])) {
      // Replace with a valid brand or remove
      attributes = attributes.replace(/mgs_brand=[^,]+/, 'mgs_brand=TECHNO');
    }
    
    // Ensure dimension is present
    if (!attributes.includes('dimension=')) {
      attributes += ',dimension=Standard';
    }
    
    normalized.additional_attributes = attributes;
  } else {
    // Add default attributes if missing
    normalized.additional_attributes = 'mgs_brand=TECHNO,dimension=Standard';
  }
  
  return normalized;
};

/**
 * Process the full catalog and create import-ready CSV
 */
export const processCatalogToImportCSV = async(catalogCsvContent) => {
  try {
    console.log('🔄 Processing catalog CSV...');
    
    // Parse the catalog CSV
    const catalogData = parseCSVContent(catalogCsvContent);
    console.log(`📊 Parsed ${catalogData.length} products from catalog`);
    
    // Extract valid values from catalog
    const validBrands = extractValidBrands(catalogData);
    const validDimensions = extractValidDimensions(catalogData);
    const validCategories = extractValidCategories(catalogData);
    
    console.log(`✅ Found ${validBrands.length} valid brands`);
    console.log(`✅ Found ${validDimensions.length} valid dimensions`);
    console.log(`✅ Found ${validCategories.length} valid categories`);
    
    // Normalize all products
    const normalizedProducts = catalogData.map((product: any: any: any: any) => 
      normalizeProductData(product, validBrands, validDimensions)
    );
    
    // Separate by product type
    const simpleProducts = normalizedProducts.filter((p: any: any: any: any) => p.product_type === 'simple');
    const configurableProducts = normalizedProducts.filter((p: any: any: any: any) => p.product_type === 'configurable');
    
    console.log(`📦 Simple products: ${simpleProducts.length}`);
    console.log(`⚙️ Configurable products: ${configurableProducts.length}`);
    
    return {
      allProducts: normalizedProducts,
      simpleProducts,
      configurableProducts,
      validBrands,
      validDimensions,
      validCategories,
      statistics: {
        total: normalizedProducts.length,
        simple: simpleProducts.length,
        configurable: configurableProducts.length,
        brands: validBrands.length,
        dimensions: validDimensions.length,
        categories: validCategories.length
      }
    };
    
  } catch(error: any) {
    console.error('❌ Error processing catalog:', error);
    throw error;
  }
};

/**
 * Convert products array to CSV string
 */
export const convertProductsToCSV = (products) => {
  if(!products || products.length ===0) {
    return '';
  }
  
  // Get headers from the first product
  const headers = Object.keys(products[0]);
  
  // Create CSV content
  const csvLines = [
    headers.join(','), // Header row
    ...products.map((product: any: any: any: any) => 
      headers.map((header: any: any: any: any) => {
        const value = product[header] || '';
        // Escape commas and quotes in values
        if (value.toString().includes(',') || value.toString().includes('"')) {
          return `"${value.toString().replace(/"/g, '""')}"`;
        }
        return value.toString();
      }).join(',')
    )
  ];
  
  return csvLines.join('\n');
};

/**
 * Create batched CSV files for large datasets
 */
export const createBatchedCSVs = (products, batchSize = 100) => {
  const batches = [];
  
  for(let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const csvContent = convertProductsToCSV(batch);
    
    batches.push({
      batchNumber: Math.floor(i / batchSize) + 1,
      startIndex: i,
      endIndex: Math.min(i + batchSize - 1, products.length - 1),
      productCount: batch.length,
      csvContent
    });
  }
  
  return batches;
};

/**
 * Generate import summary report
 */
export const generateImportReport = (processedData) => {
  const { statistics, validBrands, validDimensions } = processedData;
  
  return {
    summary: {
      totalProducts: statistics.total,
      simpleProducts: statistics.simple,
      configurableProducts: statistics.configurable,
      readyForImport: statistics.simple + statistics.configurable
    },
    validation: {
      validBrands: validBrands.slice(0, 10), // Show first 10
      totalBrands: validBrands.length,
      validDimensions: validDimensions.slice(0, 10), // Show first 10
      totalDimensions: validDimensions.length
    },
    recommendations: [
      `Start with ${statistics.simple} simple products first`,
      `Import ${statistics.configurable} configurable products after simple products`,
      `Use batch import with 100 products per batch for better performance`,
      `Monitor import progress and handle any errors individually`
    ]
  };
};

export default {
  processCatalogToImportCSV,
  convertProductsToCSV,
  createBatchedCSVs,
  generateImportReport,
  extractValidBrands,
  extractValidDimensions,
  extractValidCategories
};
