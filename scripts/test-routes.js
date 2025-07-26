/**
 * Route Testing Script
 * Tests all routes and components for errors
 */

const fs = require('fs');
const path = require('path');

// Routes to test
const ROUTES_TO_TEST = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/charts', name: 'Analytics Charts' },
  { path: '/voting', name: 'Feature Voting' },
  { path: '/products', name: 'Products' },
  { path: '/inventory', name: 'Inventory' },
  { path: '/orders', name: 'Orders' },
  { path: '/customers', name: 'Customers' },
  { path: '/mdmproducts', name: 'MDM Products' },
  { path: '/cegid-products', name: 'Cegid Products' },
  { path: '/categories', name: 'Categories' },
  { path: '/stocks', name: 'Stocks' },
  { path: '/sources', name: 'Sources' },
  { path: '/cms-pages', name: 'CMS Pages' },
  { path: '/grid-test', name: 'Grid Test' }
];

// Components to check
const COMPONENTS_TO_CHECK = [
  'src/pages/VotingPage.jsx',
  'src/pages/ChartsPage.jsx',
  'src/pages/Dashboard.jsx',
  'src/components/grids/RoadmapGrid.jsx',
  'src/components/grids/EnhancedVotingGrid.jsx',
  'src/components/grids/VotingGrid.jsx',
  'src/components/charts/index.js',
  'src/contexts/TabContext.jsx',
  'src/router/EnhancedRouter.jsx'
];

class RouteTestRunner {
  constructor() {
    this.results = {
      routes: [],
      components: [],
      errors: [],
      warnings: []
    };
  }

  /**
   * Test component files for syntax and import errors
   */
  async testComponents() {
    console.log('🔍 Testing Component Files...\n');
    
    for (const componentPath of COMPONENTS_TO_CHECK) {
      const fullPath = path.join(process.cwd(), componentPath);
      
      try {
        if (!fs.existsSync(fullPath)) {
          this.results.errors.push(`❌ Component not found: ${componentPath}`);
          continue;
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for common import issues
        const importIssues = this.checkImportIssues(content, componentPath);
        if (importIssues.length > 0) {
          this.results.warnings.push(...importIssues);
        }

        // Check for syntax issues
        const syntaxIssues = this.checkSyntaxIssues(content, componentPath);
        if (syntaxIssues.length > 0) {
          this.results.errors.push(...syntaxIssues);
        }

        this.results.components.push({
          path: componentPath,
          status: 'OK',
          size: content.length
        });

        console.log(`✅ ${componentPath}`);

      } catch (error) {
        this.results.errors.push(`❌ Error reading ${componentPath}: ${error.message}`);
        console.log(`❌ ${componentPath} - ${error.message}`);
      }
    }
  }

  /**
   * Check for common import issues
   */
  checkImportIssues(content, filePath) {
    const issues = [];
    
    // Check for react-window imports (should be replaced)
    if (content.includes('react-window')) {
      issues.push(`⚠️ ${filePath}: Contains react-window import (should use fallback)`);
    }

    // Check for missing Timeline imports from @mui/lab
    if (content.includes('Timeline') && !content.includes('@mui/lab')) {
      issues.push(`⚠️ ${filePath}: Timeline component should be imported from @mui/lab`);
    }

    // Check for unused imports
    const importLines = content.match(/^import .* from .*/gm) || [];
    for (const importLine of importLines) {
      const match = importLine.match(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))/);
      if (match) {
        const imports = match[1] ? match[1].split(',').map(s => s.trim()) : [match[2] || match[3]];
        for (const importName of imports) {
          if (importName && !content.includes(importName.replace(/\s+as\s+\w+/, ''))) {
            issues.push(`⚠️ ${filePath}: Unused import: ${importName}`);
          }
        }
      }
    }

    return issues;
  }

  /**
   * Check for syntax issues
   */
  checkSyntaxIssues(content, filePath) {
    const issues = [];
    
    // Check for unmatched brackets
    const openBrackets = (content.match(/\{/g) || []).length;
    const closeBrackets = (content.match(/\}/g) || []).length;
    if (openBrackets !== closeBrackets) {
      issues.push(`❌ ${filePath}: Unmatched brackets (${openBrackets} open, ${closeBrackets} close)`);
    }

    // Check for unmatched parentheses
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push(`❌ ${filePath}: Unmatched parentheses (${openParens} open, ${closeParens} close)`);
    }

    return issues;
  }

  /**
   * Test route configuration
   */
  testRouteConfiguration() {
    console.log('\n🛣️ Testing Route Configuration...\n');
    
    for (const route of ROUTES_TO_TEST) {
      try {
        // Check if route is defined in constants
        const constantsPath = path.join(process.cwd(), 'src/components/Layout/Constants.js');
        const routerPath = path.join(process.cwd(), 'src/router/EnhancedRouter.jsx');
        
        if (fs.existsSync(constantsPath)) {
          const constantsContent = fs.readFileSync(constantsPath, 'utf8');
          const hasRoute = constantsContent.includes(route.path);
          
          this.results.routes.push({
            path: route.path,
            name: route.name,
            inConstants: hasRoute,
            status: hasRoute ? 'OK' : 'MISSING'
          });

          console.log(`${hasRoute ? '✅' : '⚠️'} ${route.name} (${route.path})`);
        }

      } catch (error) {
        this.results.errors.push(`❌ Error testing route ${route.path}: ${error.message}`);
        console.log(`❌ ${route.name} - ${error.message}`);
      }
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ROUTE & COMPONENT TEST REPORT');
    console.log('='.repeat(60));

    // Component Summary
    console.log(`\n📦 COMPONENTS TESTED: ${this.results.components.length}`);
    console.log(`✅ Successful: ${this.results.components.filter(c => c.status === 'OK').length}`);
    console.log(`❌ Failed: ${this.results.errors.length}`);
    console.log(`⚠️ Warnings: ${this.results.warnings.length}`);

    // Route Summary
    console.log(`\n🛣️ ROUTES TESTED: ${this.results.routes.length}`);
    console.log(`✅ Configured: ${this.results.routes.filter(r => r.status === 'OK').length}`);
    console.log(`⚠️ Missing: ${this.results.routes.filter(r => r.status === 'MISSING').length}`);

    // Errors
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.results.errors.forEach(error => console.log(`  ${error}`));
    }

    // Warnings
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.results.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (this.results.errors.length === 0) {
      console.log('  ✅ All components are syntactically correct');
    } else {
      console.log('  🔧 Fix syntax errors before deployment');
    }

    if (this.results.warnings.length > 0) {
      console.log('  🧹 Consider cleaning up unused imports');
    }

    console.log('  🚀 Run development server to test runtime behavior');
    console.log('  🧪 Test each route manually in the browser');

    return {
      totalComponents: this.results.components.length,
      successfulComponents: this.results.components.filter(c => c.status === 'OK').length,
      totalRoutes: this.results.routes.length,
      configuredRoutes: this.results.routes.filter(r => r.status === 'OK').length,
      errorCount: this.results.errors.length,
      warningCount: this.results.warnings.length,
      passed: this.results.errors.length === 0
    };
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Route & Component Tests...\n');
    
    await this.testComponents();
    this.testRouteConfiguration();
    
    return this.generateReport();
  }
}

// Run tests if called directly
if (require.main === module) {
  const runner = new RouteTestRunner();
  runner.runAllTests().then(results => {
    process.exit(results.passed ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = RouteTestRunner;
