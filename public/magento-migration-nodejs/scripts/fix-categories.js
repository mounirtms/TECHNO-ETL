/**
 * Category Fixing Script
 *
 * Fixes category structure issues in the CSV file:
 * 1. Removes duplicate BUREAUTIQUE & INFORMATIQUE categories
 * 2. Maps to correct existing categories
 * 3. Ensures proper category hierarchy
 *
 * @author Magento Migration Tool
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Configuration for category mapping
const config = {
  // Correct category mappings based on typical Magento catalog structure
  categoryMappings: {
    // Calculator categories
    'CALCULATRICES SCIENTIFIQUES': 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES/CALCULATRICES SCIENTIFIQUES',
    'CALCULATRICES GRAPHIQUES': 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES/CALCULATRICES GRAPHIQUES',
    'CALCULATRICES DE POCHE': 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES/CALCULATRICES DE POCHE',
    'CALCULATRICES DE BUREAU': 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES/CALCULATRICES DE BUREAU',
    'CALCULATRICES IMPRIMANTES': 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES/CALCULATRICES IMPRIMANTES',

    // Writing instruments
    'STYLOS ENCRE GEL': 'Default Category/ECRITURE CORRECTION & COLORIAGE/STYLOS/STYLOS ENCRE GEL',
    'STYLOS ENCRE LIQUIDE': 'Default Category/ECRITURE CORRECTION & COLORIAGE/STYLOS/STYLOS ENCRE LIQUIDE',
    'STYLOS BILLE': 'Default Category/ECRITURE CORRECTION & COLORIAGE/STYLOS/STYLOS BILLE',

    // Markers and highlighters
    'FEUTRE POINTE FINE': 'Default Category/ECRITURE CORRECTION & COLORIAGE/FEUTRES/FEUTRE POINTE FINE',
    'FEUTRES DE COLORIAGE': 'Default Category/ECRITURE CORRECTION & COLORIAGE/FEUTRES/FEUTRES DE COLORIAGE',
    'SURLIGNEUR': 'Default Category/ECRITURE CORRECTION & COLORIAGE/SURLIGNEUR',

    // Art supplies
    'COULEURS ACRYLIQUES': 'Default Category/BEAUX ARTS/COULEURS ACRYLIQUES',
    'ACRYLIQUE STUDIO': 'Default Category/BEAUX ARTS/COULEURS ACRYLIQUES/ACRYLIQUE STUDIO',

    // Office supplies
    'ETIQUETEUSE': 'Default Category/BUREAUTIQUE & INFORMATIQUE/ETIQUETEUSE',
    'PLASTIFIEUSE': 'Default Category/BUREAUTIQUE & INFORMATIQUE/PLASTIFIEUSE',

    // School supplies
    'CAHIERS': 'Default Category/SCOLAIRE/CAHIERS',
    'CLASSEURS': 'Default Category/SCOLAIRE/CLASSEURS',
    'PROTEGE DOCUMENTS': 'Default Category/SCOLAIRE/PROTEGE DOCUMENTS'
  },

  // Fallback categories for products that don't match specific patterns
  fallbackCategories: {
    'CALCULATRICE': 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES',
    'STYLO': 'Default Category/ECRITURE CORRECTION & COLORIAGE/STYLOS',
    'FEUTRE': 'Default Category/ECRITURE CORRECTION & COLORIAGE/FEUTRES',
    'SURLIGNEUR': 'Default Category/ECRITURE CORRECTION & COLORIAGE/SURLIGNEUR',
    'CAHIER': 'Default Category/SCOLAIRE/CAHIERS',
    'DEFAULT': 'Default Category'
  }
};

class CategoryFixer {
  constructor() {
    this.fixedProducts = [];
    this.errors = [];
    this.categoryStats = {};
    this.summary = {
      totalProcessed: 0,
      categoriesFixed: 0,
      duplicatesRemoved: 0,
      validationErrors: 0
    };
  }

  /**
   * Main processing function
   */
  async processCSV() {
    console.log('🚀 Starting category fixing...');

    try {
      const inputFile = path.join(__dirname, '../new-sample-corrected.csv');
      const outputFile = path.join(__dirname, '../new-sample-categories-fixed.csv');

      // Read and process CSV
      await this.readAndProcessCSV(inputFile);

      // Write corrected CSV
      await this.writeFixedCSV(outputFile);

      // Generate summary report
      this.generateSummaryReport();

      console.log('✅ Category fixing completed successfully!');
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
   * Fix individual product categories
   */
  fixProduct(product, rowNumber) {
    const fixed = { ...product };

    // Fix categories
    const originalCategories = fixed.categories || '';
    const fixedCategories = this.fixCategories(originalCategories, fixed.name);

    if (fixedCategories !== originalCategories) {
      fixed.categories = fixedCategories;
      this.summary.categoriesFixed++;
    }

    // Track category usage
    this.trackCategoryUsage(fixedCategories);

    return fixed;
  }

  /**
   * Fix categories string
   */
  fixCategories(categoriesString, productName) {
    if (!categoriesString) return 'Default Category';

    // Split categories by comma
    const categories = categoriesString.split(',').map(cat => cat.trim());
    const fixedCategories = [];
    const seenCategories = new Set();

    // Process each category
    categories.forEach(category => {
      const fixedCategory = this.mapCategory(category, productName);

      // Avoid duplicates
      if (fixedCategory && !seenCategories.has(fixedCategory)) {
        fixedCategories.push(fixedCategory);
        seenCategories.add(fixedCategory);
      }
    });

    // If no valid categories found, use fallback
    if (fixedCategories.length === 0) {
      const fallbackCategory = this.getFallbackCategory(productName);
      fixedCategories.push(fallbackCategory);
    }

    // Remove duplicates and return
    const uniqueCategories = [...new Set(fixedCategories)];
    this.summary.duplicatesRemoved += (fixedCategories.length - uniqueCategories.length);

    return uniqueCategories.join(',');
  }

  /**
   * Map individual category to correct structure
   */
  mapCategory(category, productName) {
    // Remove common prefixes that cause issues
    let cleanCategory = category
      .replace(/^Default Category\/Tous les produits\//, '')
      .replace(/^Default Category\//, '')
      .trim();

    // Handle specific problematic patterns
    if (cleanCategory.includes('BUREAUTIQUE/CALCULATRICES/CALCULATRICES')) {
      // Fix the duplicate BUREAUTIQUE issue
      cleanCategory = cleanCategory.replace('BUREAUTIQUE/CALCULATRICES/CALCULATRICES', 'CALCULATRICES');
    }

    // Map to correct category structure
    for (const [pattern, correctCategory] of Object.entries(config.categoryMappings)) {
      if (cleanCategory.includes(pattern)) {
        return correctCategory;
      }
    }

    // Try fallback mapping based on product name
    return this.getFallbackCategory(productName);
  }

  /**
   * Get fallback category based on product name
   */
  getFallbackCategory(productName) {
    if (!productName) return config.fallbackCategories.DEFAULT;

    const name = productName.toUpperCase();

    // Check for specific product types in name
    for (const [pattern, category] of Object.entries(config.fallbackCategories)) {
      if (pattern !== 'DEFAULT' && name.includes(pattern)) {
        return category;
      }
    }

    return config.fallbackCategories.DEFAULT;
  }

  /**
   * Track category usage for reporting
   */
  trackCategoryUsage(categoriesString) {
    if (!categoriesString) return;

    const categories = categoriesString.split(',').map(cat => cat.trim());
    categories.forEach(category => {
      this.categoryStats[category] = (this.categoryStats[category] || 0) + 1;
    });
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
    const reportFile = path.join(__dirname, '../category-fixing-report.json');

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.summary,
      errors: this.errors,
      categoryStats: this.categoryStats,
      recommendations: this.generateRecommendations(),
      validationStatus: this.errors.length === 0 ? 'PASSED' : 'FAILED'
    };

    // Write report to file
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');

    // Display summary
    console.log('\n📊 CATEGORY FIXING SUMMARY:');
    console.log(`Total products processed: ${this.summary.totalProcessed}`);
    console.log(`Categories fixed: ${this.summary.categoriesFixed}`);
    console.log(`Duplicates removed: ${this.summary.duplicatesRemoved}`);
    console.log(`Validation errors: ${this.summary.validationErrors}`);

    // Display category usage
    console.log('\n📋 CATEGORY USAGE:');
    Object.entries(this.categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} products`);
      });

    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
  }

  /**
   * Generate recommendations
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

    if (this.summary.categoriesFixed > 0) {
      recommendations.push({
        issue: 'Categories were mapped to standard structure',
        count: this.summary.categoriesFixed,
        solution: 'Verify that the mapped categories exist in your Magento catalog'
      });
    }

    if (this.summary.duplicatesRemoved > 0) {
      recommendations.push({
        issue: 'Duplicate categories were removed',
        count: this.summary.duplicatesRemoved,
        solution: 'Review category assignments to ensure products are in correct categories'
      });
    }

    // Category creation recommendations
    const uniqueCategories = Object.keys(this.categoryStats);
    recommendations.push({
      issue: 'Categories that need to exist in Magento',
      count: uniqueCategories.length,
      solution: 'Ensure these categories are created in your Magento catalog before import',
      categories: uniqueCategories
    });

    return recommendations;
  }
}

// Main execution
async function main() {
  try {
    const fixer = new CategoryFixer();
    await fixer.processCSV();
  } catch (error) {
    console.error('❌ Category fixing script failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = CategoryFixer;