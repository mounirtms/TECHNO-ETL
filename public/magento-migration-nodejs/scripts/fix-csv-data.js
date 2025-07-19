/**
 * CSV Data Fixing Script
 *
 * Comprehensive script to fix all validation errors in the sample.csv file
 * for successful Magento import. Processes all 196 products systematically.
 *
 * @author Magento Migration Tool
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Configuration for data fixing
const config = {
  // Valid brand values (lowercase)
  validBrands: {
    'CASIO': 'casio',
    'PILOT': 'pilot',
    'ARK': 'ark',
    'CALLIGRAPHE': 'calligraphe',
    'STABILO': 'stabilo',
    'MAPED': 'maped',
    'BIC': 'bic',
    'FABER-CASTELL': 'faber_castell',
    'FABER_CASTELL': 'faber_castell',
    'STAEDTLER': 'staedtler',
    'PENTEL': 'pentel'
  },

  // Valid color values (French, lowercase)
  validColors: {
    'NOIR': 'noir',
    'BLEU': 'bleu',
    'ROUGE': 'rouge',
    'VERT': 'vert',
    'JAUNE': 'jaune',
    'ORANGE': 'orange',
    'VIOLET': 'violet',
    'ROSE': 'rose',
    'MARRON': 'marron',
    'GRIS': 'gris',
    'BLANC': 'blanc',
    'TRANSPARENT': 'transparent',
    'MULTICOLORE': 'multicolore',
    'ASSORTIS': 'assortis',
    'BLEU TURQUOISE': 'bleu_turquoise',
    'BLEU CIEL': 'bleu_ciel',
    'VERT CLAIR': 'vert_clair'
  },

  // Default prices by product category
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
    'DEFAULT': { min: 5.99, max: 19.99 }
  },

  // Default weights by product type (in grams)
  defaultWeights: {
    'CALCULATRICES': 250,
    'STYLOS': 15,
    'FEUTRES': 12,
    'SURLIGNEUR': 18,
    'ETIQUETEUSE': 400,
    'DEFAULT': 50
  }
};

class CSVDataFixer {
  constructor() {
    this.fixedProducts = [];
    this.errors = [];
    this.summary = {
      totalProcessed: 0,
      brandsFixed: 0,
      colorsFixed: 0,
      pricesAdded: 0,
      dimensionsFixed: 0,
      weightsAdded: 0,
      descriptionsAdded: 0,
      validationErrors: 0
    };
  }

  /**
   * Main processing function
   */
  async processCSV() {
    console.log('🚀 Starting comprehensive CSV data fixing...');

    try {
      const inputFile = path.join(__dirname, '../../assets/data/templates/sample.csv');
      const outputFile = path.join(__dirname, '../sample-corrected-complete.csv');

      // Read and process CSV
      await this.readAndProcessCSV(inputFile);

      // Write corrected CSV
      await this.writeFixedCSV(outputFile);

      // Generate summary report
      this.generateSummaryReport();

      console.log('✅ CSV data fixing completed successfully!');
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
              const fixedProduct = this.fixProduct(product, index + 1);
              this.fixedProducts.push(fixedProduct);
              this.summary.totalProcessed++;
            } catch (error) {
              this.errors.push({
                row: index + 1,
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

    // Add price column if missing
    if (!fixed.hasOwnProperty('price')) {
      fixed.price = '';
    }

    // Fix additional attributes
    if (fixed.additional_attributes) {
      fixed.additional_attributes = this.fixAdditionalAttributes(fixed.additional_attributes, rowNumber);
    }

    // Add missing price
    if (!fixed.price || fixed.price.trim() === '') {
      fixed.price = this.generatePrice(fixed);
      this.summary.pricesAdded++;
    }

    // Add missing weight
    if (!fixed.weight || fixed.weight.trim() === '') {
      fixed.weight = this.generateWeight(fixed);
      this.summary.weightsAdded++;
    }

    // Add missing description
    if (!fixed.description || fixed.description.trim() === '') {
      fixed.description = fixed.name || 'Product description';
      this.summary.descriptionsAdded++;
    }

    // Add missing short description
    if (!fixed.short_description || fixed.short_description.trim() === '') {
      fixed.short_description = this.generateShortDescription(fixed.name);
    }

    // Add missing quantity
    if (!fixed.qty || fixed.qty.trim() === '') {
      fixed.qty = '100';
    }

    // Ensure required fields have values
    fixed.product_online = fixed.product_online || '2';
    fixed.tax_class_name = fixed.tax_class_name || 'Taxable Goods';
    fixed.visibility = fixed.visibility || 'Catalog, Search';
    fixed.country_of_manufacture = fixed.country_of_manufacture || 'France';
    fixed.out_of_stock_qty = fixed.out_of_stock_qty || '';

    return fixed;
  }

  /**
   * Fix additional attributes string
   */
  fixAdditionalAttributes(attributesString, rowNumber) {
    if (!attributesString) return '';

    let fixed = attributesString;
    let hasChanges = false;

    // Fix brand values
    Object.entries(config.validBrands).forEach(([original, corrected]) => {
      const brandPattern = new RegExp(`mgs_brand=${original}`, 'gi');
      if (brandPattern.test(fixed)) {
        fixed = fixed.replace(brandPattern, `mgs_brand=${corrected}`);
        hasChanges = true;
        this.summary.brandsFixed++;
      }
    });

    // Fix color values
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
    return priceRange.min.toString();
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
    const reportFile = path.join(__dirname, '../csv-fixing-report.json');

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.summary,
      errors: this.errors,
      recommendations: this.generateRecommendations()
    };

    // Write report to file
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');

    // Display summary
    console.log('\n📊 FIXING SUMMARY:');
    console.log(`Total products processed: ${this.summary.totalProcessed}`);
    console.log(`Brands fixed: ${this.summary.brandsFixed}`);
    console.log(`Colors fixed: ${this.summary.colorsFixed}`);
    console.log(`Prices added: ${this.summary.pricesAdded}`);
    console.log(`Dimensions fixed: ${this.summary.dimensionsFixed}`);
    console.log(`Weights added: ${this.summary.weightsAdded}`);
    console.log(`Descriptions added: ${this.summary.descriptionsAdded}`);
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

    if (this.summary.pricesAdded > 0) {
      recommendations.push({
        issue: 'Default prices were added',
        count: this.summary.pricesAdded,
        solution: 'Review and adjust prices based on actual product values'
      });
    }

    return recommendations;
  }
}

// Main execution
async function main() {
  try {
    const fixer = new CSVDataFixer();
    await fixer.processCSV();
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = CSVDataFixer;