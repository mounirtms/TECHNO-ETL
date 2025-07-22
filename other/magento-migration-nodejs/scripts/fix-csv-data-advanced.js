/**
 * Advanced CSV Data Fixing Script
 *
 * Enhanced script to fix validation errors based on actual Magento catalog values
 * Addresses brand and color attribute validation issues
 *
 * @author Magento Migration Tool
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Enhanced configuration based on actual Magento catalog values
const config = {
  // Valid brand values - updated based on Magento admin settings
  validBrands: {
    'CASIO': 'Casio',
    'casio': 'Casio',
    'PILOT': 'Pilot',
    'pilot': 'Pilot',
    'ARK': 'Ark',
    'ark': 'Ark',
    'CALLIGRAPHE': 'Calligraphe',
    'calligraphe': 'Calligraphe',
    'STABILO': 'Stabilo',
    'stabilo': 'Stabilo',
    'MAPED': 'Maped',
    'maped': 'Maped',
    'BIC': 'Bic',
    'bic': 'Bic',
    'FABER-CASTELL': 'Faber-Castell',
    'FABER_CASTELL': 'Faber-Castell',
    'faber_castell': 'Faber-Castell',
    'STAEDTLER': 'Staedtler',
    'staedtler': 'Staedtler',
    'PENTEL': 'Pentel',
    'pentel': 'Pentel'
  },

  // Valid color values - updated based on Magento admin settings
  validColors: {
    'NOIR': 'Noir',
    'noir': 'Noir',
    'BLEU': 'Bleu',
    'bleu': 'Bleu',
    'ROUGE': 'Rouge',
    'rouge': 'Rouge',
    'VERT': 'Vert',
    'vert': 'Vert',
    'JAUNE': 'Jaune',
    'jaune': 'Jaune',
    'ORANGE': 'Orange',
    'orange': 'Orange',
    'VIOLET': 'Violet',
    'violet': 'Violet',
    'ROSE': 'Rose',
    'rose': 'Rose',
    'MARRON': 'Marron',
    'marron': 'Marron',
    'GRIS': 'Gris',
    'gris': 'Gris',
    'BLANC': 'Blanc',
    'blanc': 'Blanc',
    'TRANSPARENT': 'Transparent',
    'transparent': 'Transparent',
    'MULTICOLORE': 'Multicolore',
    'multicolore': 'Multicolore',
    'ASSORTIS': 'Assortis',
    'assortis': 'Assortis',
    'BLEU TURQUOISE': 'Bleu Turquoise',
    'bleu_turquoise': 'Bleu Turquoise',
    'BLEU CIEL': 'Bleu Ciel',
    'bleu_ciel': 'Bleu Ciel',
    'VERT CLAIR': 'Vert Clair',
    'vert_clair': 'Vert Clair'
  },

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
    'DEFAULT': { min: 9.99, max: 19.99 } // Changed from 5.99 to avoid low prices
  },

  // Default weights by product type (in grams)
  defaultWeights: {
    'CALCULATRICES': 250,
    'STYLOS': 15,
    'FEUTRES': 12,
    'SURLIGNEUR': 18,
    'ETIQUETEUSE': 400,
    'DEFAULT': 50
  },

  // Default values for missing fields
  defaults: {
    weight: '50',
    qty: '100',
    product_online: '1', // Changed to enabled
    tax_class_name: 'Taxable Goods',
    visibility: 'Catalog, Search',
    country_of_manufacture: 'France',
    out_of_stock_qty: '0',
    status: '1' // Enabled
  }
};

class AdvancedCSVDataFixer {
  constructor() {
    this.fixedProducts = [];
    this.errors = [];
    this.summary = {
      totalProcessed: 0,
      brandsFixed: 0,
      colorsFixed: 0,
      pricesFixed: 0,
      dimensionsFixed: 0,
      weightsAdded: 0,
      descriptionsAdded: 0,
      defaultsApplied: 0,
      validationErrors: 0
    };
  }

  /**
   * Main processing function
   */
  async processCSV() {
    console.log('🚀 Starting advanced CSV data fixing...');

    try {
      const inputFile = path.join(__dirname, '../sample-corrected-complete.csv');
      const outputFile = path.join(__dirname, '../sample-final-corrected.csv');

      // Read and process CSV
      await this.readAndProcessCSV(inputFile);

      // Write corrected CSV
      await this.writeFixedCSV(outputFile);

      // Generate summary report
      this.generateSummaryReport();

      console.log('✅ Advanced CSV data fixing completed successfully!');
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
              const fixedProduct = this.fixProduct(product, index + 2); // +2 for header and 1-based indexing
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

    // Fix additional attributes
    if (fixed.additional_attributes) {
      fixed.additional_attributes = this.fixAdditionalAttributes(fixed.additional_attributes, rowNumber);
    }

    // Fix price - ensure it's never 0 or empty
    if (!fixed.price || fixed.price.trim() === '' || parseFloat(fixed.price) === 0) {
      fixed.price = this.generatePrice(fixed);
      this.summary.pricesFixed++;
    } else {
      // Ensure price is properly formatted
      const price = parseFloat(fixed.price);
      if (price < 1) {
        fixed.price = this.generatePrice(fixed);
        this.summary.pricesFixed++;
      } else {
        fixed.price = price.toFixed(2);
      }
    }

    // Apply defaults for missing fields
    Object.entries(config.defaults).forEach(([key, defaultValue]) => {
      if (!fixed[key] || fixed[key].trim() === '') {
        fixed[key] = defaultValue;
        this.summary.defaultsApplied++;
      }
    });

    // Fix weight
    if (!fixed.weight || fixed.weight.trim() === '') {
      fixed.weight = this.generateWeight(fixed);
      this.summary.weightsAdded++;
    }

    // Fix description
    if (!fixed.description || fixed.description.trim() === '') {
      fixed.description = fixed.name || 'Product description';
      this.summary.descriptionsAdded++;
    }

    // Fix short description
    if (!fixed.short_description || fixed.short_description.trim() === '') {
      fixed.short_description = this.generateShortDescription(fixed.name);
    }

    return fixed;
  }

  /**
   * Fix additional attributes string
   */
  fixAdditionalAttributes(attributesString, rowNumber) {
    if (!attributesString) return '';

    let fixed = attributesString;
    let hasChanges = false;

    // Fix brand values - use proper case matching
    Object.entries(config.validBrands).forEach(([original, corrected]) => {
      const brandPattern = new RegExp(`mgs_brand=${original}`, 'gi');
      if (brandPattern.test(fixed)) {
        fixed = fixed.replace(brandPattern, `mgs_brand=${corrected}`);
        hasChanges = true;
        this.summary.brandsFixed++;
      }
    });

    // Fix color values - use proper case matching
    Object.entries(config.validColors).forEach(([original, corrected]) => {
      const colorPattern = new RegExp(`color=${original}`, 'gi');
      if (colorPattern.test(fixed)) {
        fixed = fixed.replace(colorPattern, `color=${corrected}`);
        hasChanges = true;
        this.summary.colorsFixed++;
      }
    });

    // Fix dimension formatting (remove spaces before units)
    const dimensionPattern = /dimension=([^,]+)\s+(mm|cm|g|kg)/gi;
    if (dimensionPattern.test(fixed)) {
      fixed = fixed.replace(dimensionPattern, 'dimension=$1$2');
      hasChanges = true;
      this.summary.dimensionsFixed++;
    }

    // Fix capacity formatting (standardize)
    fixed = fixed.replace(/capacity=([^,]+)\s+CHIFFRES/gi, 'capacity=$1 CHIFFRES');

    return fixed;
  }

  /**
   * Generate appropriate price based on product category
   */
  generatePrice(product) {
    const categories = product.categories || '';

    // Determine category from categories string
    let priceRange = config.defaultPrices.DEFAULT;

    Object.entries(config.defaultPrices).forEach(([category, range]) => {
      if (category !== 'DEFAULT' && categories.includes(category)) {
        priceRange = range;
      }
    });

    // Generate price within range (use minimum for consistency)
    return priceRange.min.toFixed(2);
  }

  /**
   * Generate appropriate weight based on product type
   */
  generateWeight(product) {
    const name = (product.name || '').toUpperCase();
    const categories = (product.categories || '').toUpperCase();

    let weight = config.defaultWeights.DEFAULT;

    // Determine weight based on product type
    if (name.includes('CALCULATRICE') || categories.includes('CALCULATRICES')) {
      weight = config.defaultWeights.CALCULATRICES;
    } else if (name.includes('STYLO') || categories.includes('STYLOS')) {
      weight = config.defaultWeights.STYLOS;
    } else if (name.includes('FEUTRE') || categories.includes('FEUTRES')) {
      weight = config.defaultWeights.FEUTRES;
    } else if (name.includes('SURLIGNEUR') || categories.includes('SURLIGNEUR')) {
      weight = config.defaultWeights.SURLIGNEUR;
    } else if (name.includes('ETIQUETEUSE') || categories.includes('ETIQUETEUSE')) {
      weight = config.defaultWeights.ETIQUETEUSE;
    }

    return weight.toString();
  }

  /**
   * Generate short description from product name
   */
  generateShortDescription(name) {
    if (!name) return 'Product description';

    // Extract key information from name
    const words = name.split(' ');
    const shortDesc = words.slice(0, 5).join(' '); // First 5 words

    return shortDesc.length > 100 ? shortDesc.substring(0, 97) + '...' : shortDesc;
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
    const reportFile = path.join(__dirname, '../advanced-csv-fixing-report.json');

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
    console.log('\n📊 ADVANCED FIXING SUMMARY:');
    console.log(`Total products processed: ${this.summary.totalProcessed}`);
    console.log(`Brands fixed: ${this.summary.brandsFixed}`);
    console.log(`Colors fixed: ${this.summary.colorsFixed}`);
    console.log(`Prices fixed: ${this.summary.pricesFixed}`);
    console.log(`Dimensions fixed: ${this.summary.dimensionsFixed}`);
    console.log(`Weights added: ${this.summary.weightsAdded}`);
    console.log(`Descriptions added: ${this.summary.descriptionsAdded}`);
    console.log(`Defaults applied: ${this.summary.defaultsApplied}`);
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
        issue: 'Prices were adjusted or set to defaults',
        count: this.summary.pricesFixed,
        solution: 'Review and adjust prices based on actual product values'
      });
    }

    if (this.summary.brandsFixed > 0) {
      recommendations.push({
        issue: 'Brand values were corrected to match Magento options',
        count: this.summary.brandsFixed,
        solution: 'Verify brand values match your Magento attribute configuration'
      });
    }

    if (this.summary.colorsFixed > 0) {
      recommendations.push({
        issue: 'Color values were corrected to match Magento options',
        count: this.summary.colorsFixed,
        solution: 'Verify color values match your Magento attribute configuration'
      });
    }

    return recommendations;
  }
}

// Main execution
async function main() {
  try {
    const fixer = new AdvancedCSVDataFixer();
    await fixer.processCSV();
  } catch (error) {
    console.error('❌ Advanced script failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = AdvancedCSVDataFixer;