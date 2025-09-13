#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 * Analyzes component usage and identifies unused code for removal
 * Helps optimize bundle size by eliminating dead code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔍 TECHNO-ETL BUNDLE ANALYZER');
console.log('=====================================');

// ===== CONFIGURATION =====

const config = {
  srcDir: path.join(projectRoot, 'src'),
  componentsDir: path.join(projectRoot, 'src', 'components'),
  outputDir: path.join(projectRoot, 'bundle-analysis'),
  excludePatterns: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '__tests__',
    '*.test.js',
    '*.test.jsx',
    '*.test.ts',
    '*.test.tsx'
  ]
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get all files matching pattern
 */
function getFiles(dir, pattern = /\.(js|jsx|ts|tsx)$/, exclude = []) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      // Skip excluded patterns
      if (exclude.some(pattern => fullPath.includes(pattern))) {
        continue;
      }
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (pattern.test(item)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Extract imports from file content
 */
function extractImports(content) {
  const imports = [];
  
  // ES6 imports
  const es6ImportRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
  
  // CommonJS requires
  const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  
  // Dynamic imports
  const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  
  let match;
  
  // Extract ES6 imports
  while ((match = es6ImportRegex.exec(content)) !== null) {
    imports.push({
      type: 'es6',
      module: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  // Extract CommonJS requires
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push({
      type: 'commonjs',
      module: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  // Extract dynamic imports
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push({
      type: 'dynamic',
      module: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return imports;
}

/**
 * Extract exports from file content
 */
function extractExports(content) {
  const exports = [];
  
  // Named exports
  const namedExportRegex = /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
  
  // Export statements
  const exportStatementRegex = /export\s+\{([^}]+)\}/g;
  
  // Default exports
  const defaultExportRegex = /export\s+default\s+(\w+)/g;
  
  let match;
  
  // Extract named exports
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push({
      type: 'named',
      name: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  // Extract export statements
  while ((match = exportStatementRegex.exec(content)) !== null) {
    const exportNames = match[1].split(',').map(name => name.trim().split(' as ')[0]);
    exportNames.forEach(name => {
      exports.push({
        type: 'statement',
        name: name.trim(),
        line: content.substring(0, match.index).split('\n').length
      });
    });
  }
  
  // Extract default exports
  while ((match = defaultExportRegex.exec(content)) !== null) {
    exports.push({
      type: 'default',
      name: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return exports;
}

/**
 * Analyze component usage
 */
function analyzeComponentUsage() {
  console.log('📊 Analyzing component usage...');
  
  const files = getFiles(config.srcDir, /\.(js|jsx|ts|tsx)$/, config.excludePatterns);
  const componentUsage = new Map();
  const componentDefinitions = new Map();
  
  // First pass: Find all component definitions
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const exports = extractExports(content);
      
      exports.forEach(exp => {
        if (exp.name && exp.name.match(/^[A-Z]/)) { // Component names start with uppercase
          componentDefinitions.set(exp.name, {
            file,
            type: exp.type,
            line: exp.line
          });
        }
      });
    } catch (error) {
      console.warn(`Warning: Could not read file ${file}:`, error.message);
    }
  });
  
  // Second pass: Find all component usages
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for component usage in JSX
      const jsxComponentRegex = /<(\w+)/g;
      let match;
      
      while ((match = jsxComponentRegex.exec(content)) !== null) {
        const componentName = match[1];
        if (componentName.match(/^[A-Z]/)) { // Component names start with uppercase
          if (!componentUsage.has(componentName)) {
            componentUsage.set(componentName, []);
          }
          componentUsage.get(componentName).push({
            file,
            line: content.substring(0, match.index).split('\n').length
          });
        }
      }
      
      // Look for component usage in imports
      const imports = extractImports(content);
      imports.forEach(imp => {
        if (imp.module.startsWith('./') || imp.module.startsWith('../')) {
          // Local component import
          const importContent = fs.readFileSync(file, 'utf8');
          const importMatch = importContent.match(new RegExp(`import\\s+(?:\\{[^}]*\\}|\\w+)\\s+from\\s+['"\`]${imp.module.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}['"\`]`));
          
          if (importMatch) {
            const importedNames = importMatch[0].match(/\{([^}]+)\}/) || [null, importMatch[0].match(/import\\s+(\\w+)/)?.[1]];
            if (importedNames[1]) {
              importedNames[1].split(',').forEach(name => {
                const cleanName = name.trim().split(' as ')[0];
                if (cleanName.match(/^[A-Z]/)) {
                  if (!componentUsage.has(cleanName)) {
                    componentUsage.set(cleanName, []);
                  }
                  componentUsage.get(cleanName).push({
                    file,
                    line: imp.line,
                    type: 'import'
                  });
                }
              });
            }
          }
        }
      });
    } catch (error) {
      console.warn(`Warning: Could not analyze file ${file}:`, error.message);
    }
  });
  
  return { componentUsage, componentDefinitions };
}

/**
 * Find unused components
 */
function findUnusedComponents(componentUsage, componentDefinitions) {
  console.log('🔍 Finding unused components...');
  
  const unusedComponents = [];
  
  componentDefinitions.forEach((definition, componentName) => {
    const usage = componentUsage.get(componentName);
    
    if (!usage || usage.length === 0) {
      unusedComponents.push({
        name: componentName,
        file: definition.file,
        line: definition.line,
        type: definition.type
      });
    }
  });
  
  return unusedComponents;
}

/**
 * Analyze bundle size impact
 */
function analyzeBundleSize() {
  console.log('📦 Analyzing bundle size...');
  
  try {
    // Run webpack bundle analyzer if available
    const webpackConfigPath = path.join(projectRoot, 'webpack.config.js');
    const viteConfigPath = path.join(projectRoot, 'vite.config.js');
    
    if (fs.existsSync(viteConfigPath)) {
      console.log('📊 Running Vite bundle analysis...');
      try {
        execSync('npm run build -- --analyze', { 
          cwd: projectRoot, 
          stdio: 'inherit' 
        });
      } catch (error) {
        console.warn('Could not run Vite bundle analysis:', error.message);
      }
    } else if (fs.existsSync(webpackConfigPath)) {
      console.log('📊 Running Webpack bundle analysis...');
      try {
        execSync('npx webpack-bundle-analyzer dist/static/js/*.js', { 
          cwd: projectRoot, 
          stdio: 'inherit' 
        });
      } catch (error) {
        console.warn('Could not run Webpack bundle analysis:', error.message);
      }
    }
  } catch (error) {
    console.warn('Bundle size analysis not available:', error.message);
  }
}

/**
 * Generate optimization report
 */
function generateOptimizationReport(componentUsage, componentDefinitions, unusedComponents) {
  console.log('📝 Generating optimization report...');
  
  // Create output directory
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalComponents: componentDefinitions.size,
      usedComponents: componentUsage.size,
      unusedComponents: unusedComponents.length,
      potentialSavings: `${unusedComponents.length} components (${((unusedComponents.length / componentDefinitions.size) * 100).toFixed(1)}%)`
    },
    unusedComponents: unusedComponents.map(comp => ({
      name: comp.name,
      file: path.relative(projectRoot, comp.file),
      line: comp.line,
      type: comp.type
    })),
    componentUsage: Array.from(componentUsage.entries()).map(([name, usage]) => ({
      name,
      usageCount: usage.length,
      usedIn: usage.map(u => ({
        file: path.relative(projectRoot, u.file),
        line: u.line,
        type: u.type || 'jsx'
      }))
    })),
    recommendations: [
      {
        type: 'remove-unused',
        description: 'Remove unused components to reduce bundle size',
        impact: 'High',
        components: unusedComponents.map(c => c.name)
      },
      {
        type: 'lazy-loading',
        description: 'Implement lazy loading for rarely used components',
        impact: 'Medium',
        components: Array.from(componentUsage.entries())
          .filter(([name, usage]) => usage.length <= 2)
          .map(([name]) => name)
      },
      {
        type: 'tree-shaking',
        description: 'Optimize imports to enable better tree-shaking',
        impact: 'Medium',
        suggestion: 'Use named imports instead of default imports where possible'
      }
    ]
  };
  
  // Write detailed report
  const reportPath = path.join(config.outputDir, 'bundle-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Write summary report
  const summaryPath = path.join(config.outputDir, 'bundle-analysis-summary.md');
  const summaryContent = `# Bundle Analysis Summary

**Generated:** ${report.timestamp}

## Overview

- **Total Components:** ${report.summary.totalComponents}
- **Used Components:** ${report.summary.usedComponents}
- **Unused Components:** ${report.summary.unusedComponents}
- **Potential Savings:** ${report.summary.potentialSavings}

## Unused Components

${unusedComponents.length === 0 ? 'No unused components found! 🎉' : unusedComponents.map(comp => 
  `- **${comp.name}** (${path.relative(projectRoot, comp.file)}:${comp.line})`
).join('\n')}

## Recommendations

${report.recommendations.map(rec => 
  `### ${rec.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
  
**Impact:** ${rec.impact}
**Description:** ${rec.description}
${rec.components ? `**Components:** ${rec.components.join(', ')}` : ''}
${rec.suggestion ? `**Suggestion:** ${rec.suggestion}` : ''}
`).join('\n')}

## Next Steps

1. Review unused components and remove if truly unused
2. Implement lazy loading for rarely used components
3. Optimize import statements for better tree-shaking
4. Run bundle analysis again to measure improvements

---

*Generated by Techno-ETL Bundle Analyzer*
`;
  
  fs.writeFileSync(summaryPath, summaryContent);
  
  return { reportPath, summaryPath };
}

/**
 * Clean up unused components (with confirmation)
 */
function cleanupUnusedComponents(unusedComponents) {
  if (unusedComponents.length === 0) {
    console.log('✅ No unused components to clean up!');
    return;
  }
  
  console.log(`\n🧹 Found ${unusedComponents.length} unused components:`);
  unusedComponents.forEach(comp => {
    console.log(`  - ${comp.name} (${path.relative(projectRoot, comp.file)}:${comp.line})`);
  });
  
  console.log('\n⚠️  Manual review recommended before deletion.');
  console.log('📄 Check the generated report for detailed analysis.');
}

// ===== MAIN EXECUTION =====

async function main() {
  try {
    console.log(`🔍 Analyzing project: ${projectRoot}`);
    console.log(`📁 Components directory: ${config.componentsDir}`);
    
    // Analyze component usage
    const { componentUsage, componentDefinitions } = analyzeComponentUsage();
    
    console.log(`\n📊 Analysis Results:`);
    console.log(`  - Total components defined: ${componentDefinitions.size}`);
    console.log(`  - Components with usage: ${componentUsage.size}`);
    
    // Find unused components
    const unusedComponents = findUnusedComponents(componentUsage, componentDefinitions);
    
    console.log(`  - Unused components: ${unusedComponents.length}`);
    
    // Generate optimization report
    const { reportPath, summaryPath } = generateOptimizationReport(
      componentUsage, 
      componentDefinitions, 
      unusedComponents
    );
    
    console.log(`\n📝 Reports generated:`);
    console.log(`  - Detailed report: ${reportPath}`);
    console.log(`  - Summary report: ${summaryPath}`);
    
    // Analyze bundle size
    analyzeBundleSize();
    
    // Cleanup suggestions
    cleanupUnusedComponents(unusedComponents);
    
    console.log('\n✅ Bundle analysis complete!');
    console.log(`📊 Check ${config.outputDir} for detailed reports.`);
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as analyzeBundles };
export default main;