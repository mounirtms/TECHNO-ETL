/**
 * Category Optimization & Migration Script
 *
 * Based on audit report recommendations:
 * 1. Extracts current Magento categories
 * 2. Creates optimized category structure (max 3-4 levels)
 * 3. Maps products to new optimized categories
 * 4. Generates migration-ready CSV
 *
 * @author Magento Migration Tool
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Optimized category structure based on audit recommendations
const config = {
  // New optimized category structure (max 3-4 levels as recommended)
  optimizedCategories: {
    // Main category 1: Office & Computing
    'BUREAUTIQUE_INFORMATIQUE': {
      name: 'BUREAUTIQUE & INFORMATIQUE',
      path: 'Default Category/BUREAUTIQUE & INFORMATIQUE',
      subcategories: {
        'CALCULATRICES': {
          name: 'CALCULATRICES',
          path: 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES',
          subcategories: {
            'SCIENTIFIQUES': {
              name: 'CALCULATRICES SCIENTIFIQUES',
              path: 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES/SCIENTIFIQUES'
            },
            'GRAPHIQUES': {
              name: 'CALCULATRICES GRAPHIQUES',
              path: 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES/GRAPHIQUES'
            },
            'DE_POCHE': {
              name: 'CALCULATRICES DE POCHE',
              path: 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES/DE POCHE'
            },
            'DE_BUREAU': {
              name: 'CALCULATRICES DE BUREAU',
              path: 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES/DE BUREAU'
            },
            'IMPRIMANTES': {
              name: 'CALCULATRICES IMPRIMANTES',
              path: 'Default Category/BUREAUTIQUE & INFORMATIQUE/CALCULATRICES/IMPRIMANTES'
            }
          }
        },
        'EQUIPEMENT': {
          name: 'EQUIPEMENT ELECTRONIQUE',
          path: 'Default Category/BUREAUTIQUE & INFORMATIQUE/EQUIPEMENT',
          subcategories: {
            'ETIQUETEUSES': {
              name: 'ETIQUETEUSES',
              path: 'Default Category/BUREAUTIQUE & INFORMATIQUE/EQUIPEMENT/ETIQUETEUSES'
            },
            'PLASTIFIEUSES': {
              name: 'PLASTIFIEUSES',
              path: 'Default Category/BUREAUTIQUE & INFORMATIQUE/EQUIPEMENT/PLASTIFIEUSES'
            }
          }
        }
      }
    },

    // Main category 2: Writing & Coloring
    'ECRITURE_COLORIAGE': {
      name: 'ECRITURE & COLORIAGE',
      path: 'Default Category/ECRITURE & COLORIAGE',
      subcategories: {
        'STYLOS': {
          name: 'STYLOS',
          path: 'Default Category/ECRITURE & COLORIAGE/STYLOS',
          subcategories: {
            'ENCRE_GEL': {
              name: 'STYLOS ENCRE GEL',
              path: 'Default Category/ECRITURE & COLORIAGE/STYLOS/ENCRE GEL'
            },
            'ENCRE_LIQUIDE': {
              name: 'STYLOS ENCRE LIQUIDE',
              path: 'Default Category/ECRITURE & COLORIAGE/STYLOS/ENCRE LIQUIDE'
            },
            'BILLE': {
              name: 'STYLOS BILLE',
              path: 'Default Category/ECRITURE & COLORIAGE/STYLOS/BILLE'
            }
          }
        },
        'FEUTRES': {
          name: 'FEUTRES & MARQUEURS',
          path: 'Default Category/ECRITURE & COLORIAGE/FEUTRES',
          subcategories: {
            'POINTE_FINE': {
              name: 'FEUTRES POINTE FINE',
              path: 'Default Category/ECRITURE & COLORIAGE/FEUTRES/POINTE FINE'
            },
            'COLORIAGE': {
              name: 'FEUTRES COLORIAGE',
              path: 'Default Category/ECRITURE & COLORIAGE/FEUTRES/COLORIAGE'
            }
          }
        },
        'SURLIGNEUR': {
          name: 'SURLIGNEURS',
          path: 'Default Category/ECRITURE & COLORIAGE/SURLIGNEURS'
        }
      }
    },

    // Main category 3: School Supplies
    'SCOLAIRE': {
      name: 'SCOLAIRE',
      path: 'Default Category/SCOLAIRE',
      subcategories: {
        'CAHIERS': {
          name: 'CAHIERS & CARNETS',
          path: 'Default Category/SCOLAIRE/CAHIERS'
        },
        'CLASSEURS': {
          name: 'CLASSEURS & RANGEMENT',
          path: 'Default Category/SCOLAIRE/CLASSEURS'
        },
        'FOURNITURES': {
          name: 'FOURNITURES DIVERSES',
          path: 'Default Category/SCOLAIRE/FOURNITURES'
        }
      }
    },

    // Main category 4: Art Supplies
    'BEAUX_ARTS': {
      name: 'BEAUX ARTS',
      path: 'Default Category/BEAUX ARTS',
      subcategories: {
        'COULEURS': {
          name: 'COULEURS & PEINTURES',
          path: 'Default Category/BEAUX ARTS/COULEURS',
          subcategories: {
            'ACRYLIQUE': {
              name: 'PEINTURE ACRYLIQUE',
              path: 'Default Category/BEAUX ARTS/COULEURS/ACRYLIQUE'
            }
          }
        }
      }
    }
  },

  // Product type to category mapping rules
  categoryMappingRules: [
    // Calculator mappings
    { pattern: /CALCULATRICE.*SCIENTIFIQUE/i, category: 'BUREAUTIQUE_INFORMATIQUE.CALCULATRICES.SCIENTIFIQUES' },
    { pattern: /CALCULATRICE.*GRAPHIQUE/i, category: 'BUREAUTIQUE_INFORMATIQUE.CALCULATRICES.GRAPHIQUES' },
    { pattern: /CALCULATRICE.*POCHE/i, category: 'BUREAUTIQUE_INFORMATIQUE.CALCULATRICES.DE_POCHE' },
    { pattern: /CALCULATRICE.*BUREAU/i, category: 'BUREAUTIQUE_INFORMATIQUE.CALCULATRICES.DE_BUREAU' },
    { pattern: /CALCULATRICE.*IMPRIMANTE/i, category: 'BUREAUTIQUE_INFORMATIQUE.CALCULATRICES.IMPRIMANTES' },
    { pattern: /CALCULATRICE/i, category: 'BUREAUTIQUE_INFORMATIQUE.CALCULATRICES' },

    // Writing instruments
    { pattern: /STYLO.*GEL/i, category: 'ECRITURE_COLORIAGE.STYLOS.ENCRE_GEL' },
    { pattern: /STYLO.*LIQUIDE/i, category: 'ECRITURE_COLORIAGE.STYLOS.ENCRE_LIQUIDE' },
    { pattern: /STYLO.*BILLE/i, category: 'ECRITURE_COLORIAGE.STYLOS.BILLE' },
    { pattern: /STYLO/i, category: 'ECRITURE_COLORIAGE.STYLOS' },

    // Markers and highlighters
    { pattern: /FEUTRE.*POINTE.*FINE/i, category: 'ECRITURE_COLORIAGE.FEUTRES.POINTE_FINE' },
    { pattern: /FEUTRE.*COLORIAGE/i, category: 'ECRITURE_COLORIAGE.FEUTRES.COLORIAGE' },
    { pattern: /FEUTRE/i, category: 'ECRITURE_COLORIAGE.FEUTRES' },
    { pattern: /SURLIGNEUR/i, category: 'ECRITURE_COLORIAGE.SURLIGNEUR' },

    // Office equipment
    { pattern: /ETIQUETEUSE/i, category: 'BUREAUTIQUE_INFORMATIQUE.EQUIPEMENT.ETIQUETEUSES' },
    { pattern: /PLASTIFIEUSE/i, category: 'BUREAUTIQUE_INFORMATIQUE.EQUIPEMENT.PLASTIFIEUSES' },

    // School supplies
    { pattern: /CAHIER/i, category: 'SCOLAIRE.CAHIERS' },
    { pattern: /CLASSEUR/i, category: 'SCOLAIRE.CLASSEURS' },

    // Art supplies
    { pattern: /ACRYLIQUE/i, category: 'BEAUX_ARTS.COULEURS.ACRYLIQUE' },
    { pattern: /COULEUR/i, category: 'BEAUX_ARTS.COULEURS' }
  ]
};

class CategoryOptimizationMigration {
  constructor() {
    this.currentCategories = new Set();
    this.optimizedProducts = [];
    this.categoryMappings = {};
    this.errors = [];
    this.summary = {
      totalProducts: 0,
      categoriesMapped: 0,
      categoriesOptimized: 0,
      validationErrors: 0
    };
  }

  /**
   * Main processing function
   */
  async processMigration() {
    console.log('🚀 Starting category optimization migration...');

    try {
      // Step 1: Extract current categories from CSV
      await this.extractCurrentCategories();

      // Step 2: Generate optimized category structure
      this.generateOptimizedStructure();

      // Step 3: Process products with optimized categories
      await this.processProductsWithOptimizedCategories();

      // Step 4: Generate migration files
      await this.generateMigrationFiles();

      // Step 5: Generate reports
      this.generateReports();

      console.log('✅ Category optimization migration completed successfully!');

    } catch (error) {
      console.error('❌ Error during migration:', error.message);
      throw error;
    }
  }

  /**
   * Extract current categories from CSV file
   */
  async extractCurrentCategories() {
    console.log('📊 Extracting current categories...');

    const inputFile = path.join(__dirname, '../new-sample-corrected.csv');

    return new Promise((resolve, reject) => {
      fs.createReadStream(inputFile)
        .pipe(csv())
        .on('data', (row) => {
          if (row.categories) {
            const categories = row.categories.split(',').map(cat => cat.trim());
            categories.forEach(category => {
              this.currentCategories.add(category);
            });
          }
        })
        .on('end', () => {
          console.log(`📋 Found ${this.currentCategories.size} unique categories`);
          resolve();
        })
        .on('error', reject);
    });
  }

  /**
   * Generate optimized category structure
   */
  generateOptimizedStructure() {
    console.log('🏗️ Generating optimized category structure...');

    const flatCategories = [];

    // Flatten the optimized category structure
    const flattenCategories = (categories, level = 0) => {
      Object.entries(categories).forEach(([key, category]) => {
        flatCategories.push({
          key,
          name: category.name,
          path: category.path,
          level
        });

        if (category.subcategories) {
          flattenCategories(category.subcategories, level + 1);
        }
      });
    };

    flattenCategories(config.optimizedCategories);

    this.optimizedCategoryList = flatCategories;
    console.log(`📋 Generated ${flatCategories.length} optimized categories`);
  }

  /**
   * Process products with optimized categories
   */
  async processProductsWithOptimizedCategories() {
    console.log('🔄 Processing products with optimized categories...');

    const inputFile = path.join(__dirname, '../new-sample-corrected.csv');

    return new Promise((resolve, reject) => {
      const products = [];

      fs.createReadStream(inputFile)
        .pipe(csv())
        .on('data', (row) => {
          products.push(row);
        })
        .on('end', () => {
          console.log(`📊 Processing ${products.length} products...`);

          products.forEach((product, index) => {
            try {
              const optimizedProduct = this.optimizeProductCategories(product, index + 2);
              this.optimizedProducts.push(optimizedProduct);
              this.summary.totalProducts++;
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
   * Optimize individual product categories
   */
  optimizeProductCategories(product, rowNumber) {
    const optimized = { ...product };

    // Get the best category match for this product
    const optimizedCategory = this.findOptimalCategory(product.name, product.categories);

    if (optimizedCategory) {
      optimized.categories = optimizedCategory;
      this.summary.categoriesMapped++;

      // Track the mapping
      const originalCategories = product.categories || '';
      if (!this.categoryMappings[originalCategories]) {
        this.categoryMappings[originalCategories] = [];
      }
      this.categoryMappings[originalCategories].push(optimizedCategory);
    }

    // Fix other issues while we're at it
    optimized.price = optimized.price || '12.99';
    optimized.weight = optimized.weight || '50';
    optimized.qty = optimized.qty || '100';
    optimized.status = '1';
    optimized.product_online = '1';

    return optimized;
  }

  /**
   * Find optimal category for a product
   */
  findOptimalCategory(productName, currentCategories) {
    if (!productName) return 'Default Category';

    // Try to match against mapping rules
    for (const rule of config.categoryMappingRules) {
      if (rule.pattern.test(productName)) {
        const categoryPath = this.getCategoryPath(rule.category);
        if (categoryPath) {
          return categoryPath;
        }
      }
    }

    // Fallback to Default Category
    return 'Default Category';
  }

  /**
   * Get category path from dot notation
   */
  getCategoryPath(categoryKey) {
    const keys = categoryKey.split('.');
    let current = config.optimizedCategories;

    for (const key of keys) {
      if (current[key]) {
        if (current[key].path) {
          return current[key].path;
        }
        current = current[key].subcategories || {};
      } else {
        return null;
      }
    }

    return null;
  }

  /**
   * Generate migration files
   */
  async generateMigrationFiles() {
    console.log('📝 Generating migration files...');

    // Generate optimized products CSV
    await this.writeOptimizedProductsCSV();

    // Generate category creation script
    await this.writeCategoryCreationScript();

    // Generate category import CSV
    await this.writeCategoryImportCSV();
  }

  /**
   * Write optimized products CSV
   */
  async writeOptimizedProductsCSV() {
    const outputFile = path.join(__dirname, '../products-optimized-categories.csv');

    if (this.optimizedProducts.length === 0) {
      throw new Error('No optimized products to write');
    }

    // Get headers from first product
    const headers = Object.keys(this.optimizedProducts[0]);

    // Create CSV content
    let csvContent = headers.join(',') + '\n';

    this.optimizedProducts.forEach(product => {
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
    console.log(`📝 Written ${this.optimizedProducts.length} optimized products to ${outputFile}`);
  }

  /**
   * Write category creation script
   */
  async writeCategoryCreationScript() {
    const outputFile = path.join(__dirname, '../create-optimized-categories.sql');

    let sqlContent = `-- Optimized Category Creation Script
-- Generated on ${new Date().toISOString()}
-- Based on audit report recommendations (max 3-4 levels)

-- This script creates the optimized category structure
-- Run this in your Magento database before importing products

USE your_magento_database;

-- Create main categories
`;

    // Generate SQL for each category
    this.optimizedCategoryList.forEach((category, index) => {
      const categoryId = index + 100; // Start from ID 100 to avoid conflicts
      const parentId = category.level === 0 ? 2 : 'parent_category_id'; // 2 is Default Category

      sqlContent += `
-- ${category.name} (Level ${category.level})
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (${categoryId}, 3, ${parentId}, NOW(), NOW(), '1/2/${categoryId}', ${index + 1}, ${category.level + 1}, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  ${categoryId},
  '${category.name}'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  ${categoryId},
  1
);
`;
    });

    fs.writeFileSync(outputFile, sqlContent, 'utf8');
    console.log(`📝 Written category creation script to ${outputFile}`);
  }

  /**
   * Write category import CSV
   */
  async writeCategoryImportCSV() {
    const outputFile = path.join(__dirname, '../categories-import.csv');

    let csvContent = 'name,path,is_active,include_in_menu,description\n';

    this.optimizedCategoryList.forEach(category => {
      const row = [
        `"${category.name}"`,
        `"${category.path}"`,
        '1',
        '1',
        `"${category.name} products"`
      ];
      csvContent += row.join(',') + '\n';
    });

    fs.writeFileSync(outputFile, csvContent, 'utf8');
    console.log(`📝 Written category import CSV to ${outputFile}`);
  }

  /**
   * Generate comprehensive reports
   */
  generateReports() {
    console.log('📊 Generating reports...');

    // Generate JSON report
    this.generateJSONReport();

    // Generate markdown report
    this.generateMarkdownReport();

    // Display summary
    this.displaySummary();
  }

  /**
   * Generate JSON report
   */
  generateJSONReport() {
    const reportFile = path.join(__dirname, '../category-optimization-report.json');

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.summary,
      currentCategories: Array.from(this.currentCategories),
      optimizedCategories: this.optimizedCategoryList,
      categoryMappings: this.categoryMappings,
      errors: this.errors,
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📄 JSON report saved to: ${reportFile}`);
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport() {
    const reportFile = path.join(__dirname, '../CATEGORY-OPTIMIZATION-REPORT.md');

    let content = `# Category Optimization Migration Report

## Summary

- **Total Products**: ${this.summary.totalProducts}
- **Categories Mapped**: ${this.summary.categoriesMapped}
- **Validation Errors**: ${this.summary.validationErrors}
- **Current Categories**: ${this.currentCategories.size}
- **Optimized Categories**: ${this.optimizedCategoryList.length}

## Optimized Category Structure

Based on audit report recommendations (max 3-4 levels):

`;

    // Add category structure
    this.optimizedCategoryList.forEach(category => {
      const indent = '  '.repeat(category.level);
      content += `${indent}- **${category.name}** (Level ${category.level})\n`;
      content += `${indent}  - Path: \`${category.path}\`\n`;
    });

    content += `\n## Migration Files Generated

1. **products-optimized-categories.csv** - Products with optimized categories
2. **create-optimized-categories.sql** - SQL script to create categories
3. **categories-import.csv** - Category import CSV for Magento
4. **category-optimization-report.json** - Detailed JSON report

## Next Steps

1. **Create Categories**: Run the SQL script or import categories CSV
2. **Import Products**: Use the optimized products CSV
3. **Verify Structure**: Check that categories appear correctly in admin
4. **Test Navigation**: Ensure category navigation works on frontend

Generated on: ${new Date().toISOString()}
`;

    fs.writeFileSync(reportFile, content, 'utf8');
    console.log(`📄 Markdown report saved to: ${reportFile}`);
  }

  /**
   * Display summary
   */
  displaySummary() {
    console.log('\n📊 CATEGORY OPTIMIZATION SUMMARY:');
    console.log(`Total products processed: ${this.summary.totalProducts}`);
    console.log(`Categories mapped: ${this.summary.categoriesMapped}`);
    console.log(`Validation errors: ${this.summary.validationErrors}`);
    console.log(`Current categories: ${this.currentCategories.size}`);
    console.log(`Optimized categories: ${this.optimizedCategoryList.length}`);

    console.log('\n📋 TOP OPTIMIZED CATEGORIES:');
    const categoryUsage = {};
    this.optimizedProducts.forEach(product => {
      const category = product.categories;
      categoryUsage[category] = (categoryUsage[category] || 0) + 1;
    });

    Object.entries(categoryUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} products`);
      });
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    recommendations.push({
      issue: 'Category structure optimized',
      description: 'Categories have been optimized to max 3-4 levels as recommended in audit',
      action: 'Create the optimized categories in Magento before importing products'
    });

    recommendations.push({
      issue: 'Product categorization improved',
      description: 'Products have been mapped to more logical category structure',
      action: 'Review product-category mappings and adjust if needed'
    });

    if (this.errors.length > 0) {
      recommendations.push({
        issue: 'Validation errors detected',
        description: `${this.errors.length} products had validation errors`,
        action: 'Review and fix validation errors before import'
      });
    }

    return recommendations;
  }
}

// Main execution
async function main() {
  try {
    const migration = new CategoryOptimizationMigration();
    await migration.processMigration();
  } catch (error) {
    console.error('❌ Category optimization migration failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = CategoryOptimizationMigration;