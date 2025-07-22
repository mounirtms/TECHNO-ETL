/**
 * Final Error Fixing Script
 *
 * Fixes the remaining issues from the error report:
 * 1. Price is 0 - Set proper prices
 * 2. Category issues - Simplify category structure
 * 3. URL key conflicts - Generate unique URL keys
 *
 * @author Magento Migration Tool
 * @version 3.0.0
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Configuration for final fixes
const config = {
  // Default prices by product category (non-zero values)
  defaultPrices: {
    'CALCULATRICES SCIENTIFIQUES': { min: 15.99, max: 35.99 },
    'CALCULATRICES GRAPHIQUES': { min: 79.99, max: 125.99 },
    'CALCULATRICES DE POCHE': { min: 8.99, max: 12.99 },
    'CALCULATRICES DE BUREAU': { min: 45.99, max: 65.99 },
    'CALCULATRICES IMPRIMANTES': { min: 89.99, max: 149.99 },
    'STYLOS ENCRE GEL': { min: 2.50, max: 4.99 },
    'STYLOS ENCRE LIQUIDE': { min: 3.50, max: 6.99 },
    'SURLIGNEUR': { min: 1.99, max: 3.99 },
    'FEUTRE POINTE FINE': { min: 1.50, max: 2.99 },
    'FEUTRES DE COLORIAGE': { min: 8.99, max: 15.99 },
    'ETIQUETEUSE': { min: 45.99, max: 89.99 },
    'DEFAULT': { min: 12.99, max: 29.99 }
  },

  // Simplified category mapping to avoid creation issues
  categoryMapping: {
    'CALCULATRICES SCIENTIFIQUES': 'Default Category',
    'CALCULATRICES GRAPHIQUES': 'Default Category',
    'CALCULATRICES DE POCHE': 'Default Category',
    'CALCULATRICES DE BUREAU': 'Default Category',
    'CALCULATRICES IMPRIMANTES': 'Default Category',
    'STYLOS ENCRE GEL': 'Default Category',
    'STYLOS ENCRE LIQUIDE': 'Default Category',
    'SURLIGNEUR': 'Default Category',
    'FEUTRE POINTE FINE': 'Default Category',
    'FEUTRES DE COLORIAGE': 'Default Category',
    'ETIQUETEUSE': 'Default Category',
    'DEFAULT': 'Default Category'
  }
};

class FinalErrorFixer {
  constructor() {
    this.fixedProducts = [];
    this.errors = [];
    this.usedUrlKeys = new Set();
    this.summary = {
      totalProcessed: 0,
      pricesFixed: 0,
      categoriesSimplified: 0,
      urlKeysGenerated: 0,
      validationErrors: 0
    };
  }

  /**
   * Main processing function
   */
  async processCSV() {
    console.log('🚀 Starting final error fixing...');

    try {
      const inputFile = path.join(__dirname, '../sample-final-corrected.csv');
      const outputFile = path.join(__dirname, '../sample-production-ready.csv');

      // Read and process CSV
      await this.readAndProcessCSV(inputFile);

      // Write corrected CSV
      await this.writeFixedCSV(outputFile);

      // Generate summary report
      this.generateSummaryReport();

      console.log('✅ Final error fixing completed successfully!');
      console.log(`📄 Output file: ${outputFile}`);

    } catch (error) {
      console.error('❌ Error processing CSV:', error.message);
      throw error;
    }
  }

  /**
   * Read and process CSV file
   */
  async readAndProcessCSV(inputFile) {
    return new Promise((resolve, reject) => {
      const products = [];

      fs.createReadStream(inputFile)
        .pipe(csv())
        .on('data', (row) => {
          products.push(row);
        })
        .on('end', () => {
          console.log(`📊 Read ${products.length} products from CSV`);

          // Process each product
          products.forEach((product, index) => {
            try {
              const fixedProduct = this.fixProduct(product, index + 2);
              this.fixedProducts.push(fixedProduct);
              this.summary.totalProcessed++;
            } catch (error) {
              this.errors.push({
                row: index + 2,
                sku: product.sku,
                error: error.message
              });
              this.summary.validationErrors++;
            }
          });

          resolve();
        })
        .on('error', reject);
    });
  }

  /**
   * Fix individual product data
   */
  fixProduct(product, rowNumber) {
    const fixed = { ...product };

    // Fix price - ensure it's never 0 or empty
    if (!fixed.price || fixed.price.trim() === '' || parseFloat(fixed.price) === 0) {
      fixed.price = this.generatePrice(fixed);
      this.summary.pricesFixed++;
    } else {
      const price = parseFloat(fixed.price);
      if (price <= 0) {
        fixed.price = this.generatePrice(fixed);
        this.summary.pricesFixed++;
      } else {
        fixed.price = price.toFixed(2);
      }
    }

    // Simplify categories to avoid creation issues
    fixed.categories = this.simplifyCategories(fixed.categories);
    this.summary.categoriesSimplified++;

    // Generate unique URL key to avoid conflicts
    fixed.url_key = this.generateUniqueUrlKey(fixed.name, fixed.sku);
    this.summary.urlKeysGenerated++;

    // Ensure required fields are properly set
    fixed.product_online = '1'; // Enable product
    fixed.status = '1'; // Enable status
    fixed.qty = fixed.qty || '100';
    fixed.out_of_stock_qty = '0';
    fixed.tax_class_name = 'Taxable Goods';
    fixed.visibility = 'Catalog, Search';
    fixed.country_of_manufacture = 'France';

    return fixed;
  }

  /**
   * Generate appropriate price based on product category
   */
  generatePrice(product) {
    const categories = product.categories || '';
    const name = product.name || '';

    // Determine category from categories string or name
    let priceRange = config.defaultPrices.DEFAULT;

    // Check categories first
    Object.entries(config.defaultPrices).forEach(([category, range]) => {
      if (category !== 'DEFAULT' && (categories.includes(category) || name.includes(category))) {
        priceRange = range;
      }
    });

    // Special handling for specific product types
    if (name.includes('CALCULATRICE GRAPHIQUE')) {
      priceRange = config.defaultPrices['CALCULATRICES GRAPHIQUES'];
    } else if (name.includes('CALCULATRICE SCIENTIFIQUE')) {
      priceRange = config.defaultPrices['CALCULATRICES SCIENTIFIQUES'];
    } else if (name.includes('CALCULATRICE DE POCHE')) {
      priceRange = config.defaultPrices['CALCULATRICES DE POCHE'];
    } else if (name.includes('CALCULATRICE DE BUREAU')) {
      priceRange = config.defaultPrices['CALCULATRICES DE BUREAU'];
    } else if (name.includes('STYLO')) {
      priceRange = config.defaultPrices['STYLOS ENCRE GEL'];
    } else if (name.includes('FEUTRE')) {
      priceRange = config.defaultPrices['FEUTRE POINTE FINE'];
    }

    // Generate price within range (use minimum for consistency)
    return priceRange.min.toFixed(2);
  }

  /**
   * Simplify categories to avoid creation issues
   */
  simplifyCategories(categoriesString) {
    if (!categoriesString) return 'Default Category';

    // For now, use Default Category to avoid creation issues
    // In production, you would map to existing categories
    return 'Default Category';
  }

  /**
   * Generate unique URL key to avoid conflicts
   */
  generateUniqueUrlKey(name, sku) {
    if (!name) name = `product-${sku}`;

    // Create base URL key from name
    let baseKey = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length

    // Ensure uniqueness
    let urlKey = baseKey;
    let counter = 1;

    while (this.usedUrlKeys.has(urlKey)) {
      urlKey = `${baseKey}-${counter}`;
      counter++;
    }

    this.usedUrlKeys.add(urlKey);
    return urlKey;
  }

  /**
   * Write fixed CSV to file
   */
  async writeFixedCSV(outputFile) {
    if (this.fixedProducts.length === 0) {
      throw new Error('No products to write');
    }

    // Get headers from first product
    const headers = Object.keys(this.fixedProducts[0]);

    // Create CSV content
    let csvContent = headers.join(',') + '\n';

    this.fixedProducts.forEach(product => {
      const row = headers.map(header => {
        const value = product[header] || '';
        // Escape commas and quotes in values
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += row.join(',') + '\n';
    });

    // Write to file
    fs.writeFileSync(outputFile, csvContent, 'utf8');
    console.log(`📝 Written ${this.fixedProducts.length} products to ${outputFile}`);
  }

  /**
   * Generate summary report
   */
  generateSummaryReport() {
    const reportFile = path.join(__dirname, '../final-error-fixing-report.json');

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.summary,
      errors: this.errors,
      recommendations: this.generateRecommendations(),
      validationStatus: this.errors.length === 0 ? 'PASSED' : 'FAILED'
    };

    // Write report to file
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');

    // Display summary
    console.log('\n📊 FINAL ERROR FIXING SUMMARY:');
    console.log(`Total products processed: ${this.summary.totalProcessed}`);
    console.log(`Prices fixed: ${this.summary.pricesFixed}`);
    console.log(`Categories simplified: ${this.summary.categoriesSimplified}`);
    console.log(`URL keys generated: ${this.summary.urlKeysGenerated}`);
    console.log(`Validation errors: ${this.summary.validationErrors}`);
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
  }

  /**
   * Generate recommendations for remaining issues
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.errors.length > 0) {
      recommendations.push({
        issue: 'Validation errors detected',
        count: this.errors.length,
        solution: 'Review error details and fix manually',
        errors: this.errors
      });
    }

    if (this.summary.pricesFixed > 0) {
      recommendations.push({
        issue: 'Prices were set to category defaults',
        count: this.summary.pricesFixed,
        solution: 'Review and adjust prices based on actual product values'
      });
    }

    if (this.summary.categoriesSimplified > 0) {
      recommendations.push({
        issue: 'Categories were simplified to Default Category',
        count: this.summary.categoriesSimplified,
        solution: 'Create proper category structure in Magento and update product categories'
      });
    }

    return recommendations;
  }
}

// Main execution
async function main() {
  try {
    const fixer = new FinalErrorFixer();
    await fixer.processCSV();
  } catch (error) {
    console.error('❌ Final error fixing script failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = FinalErrorFixer;