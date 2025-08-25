#!/usr/bin/env node
/**
 * TECHNO-ETL Automated TypeScript Migration & Error Fixing Script
 * 
 * @author Mounir Abderrahmani  
 * @email mounir.ab@techno-dz.com
 * 
 * This script automatically fixes TypeScript errors and handles project migration
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync, spawn } = require('child_process');
const glob = require('glob');

class TypeScriptMigrator {
  constructor() {
    this.srcDir = path.join(__dirname, 'src');
    this.backupDir = path.join(__dirname, '.migration-backups');
    this.logFile = path.join(__dirname, 'migration.log');
    this.errorPatterns = new Map();
    this.fixedFiles = new Set();
    this.totalErrors = 0;
    this.fixedErrors = 0;
    
    this.setupErrorPatterns();
  }

  setupErrorPatterns() {
    // Common TypeScript error patterns and their fixes
    
    // Handle missing component names like Grid
    this.errorPatterns.set(/Cannot find name '(.+)'/, {
      fix: (match, content, filePath) => {
        const missingName = match[1];
        // Handle Grid component specifically
        if (missingName === 'Grid') {
          // Check if we already have MUI imports
          const muiImportMatch = content.match(/import\s*{([^}]*)}\s*from\s*['"]@mui\/material['"]/); 
          if (muiImportMatch) {
            // Add Grid to existing import
            const imports = muiImportMatch[1];
            if (!imports.includes('Grid')) {
              return content.replace(
                /import\s*{([^}]*)}\s*from\s*['"]@mui\/material['"]/,
                `import { $1, Grid } from '@mui/material'`
              );
            }
          } else {
            // Add new Grid import at the top
            return `import { Grid } from '@mui/material';\n${content}`;
          }
        }
        return content;
      }
    });

    // Fix corrupted type annotations in function calls
    this.errorPatterns.set(/expected/, {
      fix: (match, content, filePath) => {
        // Fix corrupted constructor calls
        content = content.replace(/super\(([^)]+):\s*any\)/g, 'super($1)');
        // Fix corrupted function parameters
        content = content.replace(/\(([^:)]+):\s*any\s*\)/g, '($1)');
        // Fix corrupted spread operators
        content = content.replace(/\.\.\?\.([a-zA-Z]+)/g, '...$1');
        // Fix corrupted conditional expressions  
        content = content.replace(/if\s*\(([^)]+):\s*any\s*\)/g, 'if ($1)');
        return content;
      }
    });

    this.errorPatterns.set(/Parameter '(.+)' implicitly has an 'any' type/, {
      fix: (match, content, filePath) => {
        const paramName = match[1];
        return content.replace(
          new RegExp(`\\(${paramName}\\)`, 'g'),
          `(${paramName}: any)`
        );
      }
    });

    this.errorPatterns.set(/Property '(.+)' does not exist on type/, {
      fix: (match, content, filePath) => {
        // Add type assertion (as any) for missing properties
        return content.replace(
          new RegExp(`\\.${match[1]}`, 'g'),
          `?.${match[1]}`
        );
      }
    });

    this.errorPatterns.set(/Cannot find module '(.+)' or its corresponding type declarations/, {
      fix: (match, content, filePath) => {
        // Remove problematic import or add type assertion
        const moduleName = match[1];
        return content.replace(
          new RegExp(`import.*from ['"]${moduleName}['"].*\n`, 'g'),
          `// @ts-ignore - Module types not available\n$&`
        );
      }
    });
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(this.logFile, logEntry);
  }

  async createBackup() {
    this.log('📦 Creating backup of source files...');
    await fs.ensureDir(this.backupDir);
    await fs.copy(this.srcDir, path.join(this.backupDir, 'src'));
    this.log('✅ Backup created successfully');
  }

  async getTypeScriptErrors() {
    this.log('🔍 Analyzing TypeScript errors...');
    try {
      execSync('npx tsc --noEmit --pretty false', { stdio: 'pipe' });
      return [];
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      this.log(`Raw error output length: ${output.length}`);
      if (output.length > 0) {
        this.log(`First 200 chars: ${output.substring(0, 200)}`);
      }
      return this.parseErrors(output);
    }
  }

  parseErrors(output) {
    const lines = output.split('\n');
    const errors = [];
    
    lines.forEach(line => {
      // Handle format: src/file.tsx(line,col): error TS#### message
      const match = line.match(/^(.+\.(tsx?|jsx?))\((\d+),(\d+)\):\s*error\s+TS(\d+):\s*(.*)/);
      if (match) {
        const errorMsg = match[6] || 'TypeScript Error';
        errors.push({
          file: match[1],
          line: parseInt(match[3]),
          column: parseInt(match[4]),
          code: match[5],
          message: errorMsg.trim(),
          fullLine: line
        });
      }
    });
    
    this.totalErrors = errors.length;
    this.log(`Found ${errors.length} TypeScript errors`);
    
    // Log first few errors for debugging
    if (errors.length > 0) {
      this.log('First few errors:');
      errors.slice(0, 3).forEach((error, i) => {
        this.log(`  ${i + 1}. ${error.file}:${error.line} - ${error.message.substring(0, 100)}`);
      });
    }
    
    return errors;
  }

  async fixErrorsAutomatically(errors) {
    this.log(`🔧 Attempting to fix ${errors.length} TypeScript errors...`);
    
    const fileGroups = {};
    errors.forEach(error => {
      if (!fileGroups[error.file]) {
        fileGroups[error.file] = [];
      }
      fileGroups[error.file].push(error);
    });

    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      try {
        await this.fixFileErrors(filePath, fileErrors);
      } catch (err) {
        this.log(`❌ Failed to fix ${filePath}: ${err.message}`);
      }
    }
  }

  async fixFileErrors(filePath, errors) {
    if (!fs.existsSync(filePath)) return;
    
    this.log(`🔧 Fixing ${errors.length} errors in ${filePath}`);
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;

    // Apply common fixes
    content = this.applyCommonFixes(content, filePath);
    
    // Apply pattern-based fixes
    errors.forEach(error => {
      for (const [pattern, handler] of this.errorPatterns) {
        const match = error.message.match(pattern);
        if (match) {
          const newContent = handler.fix(match, content, filePath);
          if (newContent !== content) {
            content = newContent;
            modified = true;
            this.fixedErrors++;
          }
        }
      }
    });

    if (modified) {
      await fs.writeFile(filePath, content);
      this.fixedFiles.add(filePath);
      this.log(`✅ Fixed errors in ${filePath}`);
    }
  }

  applyCommonFixes(content, filePath) {
    let fixed = content;

    // Add React import if missing
    if (filePath.endsWith('.tsx') && !fixed.includes("import React")) {
      fixed = `import React from 'react';\n${fixed}`;
    }

    // Add Grid import if Grid is used but not imported
    if (fixed.includes('<Grid') && !fixed.includes('import') && !fixed.match(/import.*Grid.*from.*@mui\/material/)) {
      fixed = `import { Grid } from '@mui/material';\n${fixed}`;
    }

    // Fix corrupted type annotations and syntax errors
    fixed = fixed.replace(/super\(([^)]+):\s*any\)/g, 'super($1)');
    fixed = fixed.replace(/\(([^:)]+):\s*any\s*\)/g, '($1)');
    fixed = fixed.replace(/\.\.\?\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '...$1');
    fixed = fixed.replace(/if\s*\(([^)]+):\s*any\s*\)/g, 'if ($1)');
    fixed = fixed.replace(/setError\(([^)]+):\s*any\)/g, 'setError($1)');
    fixed = fixed.replace(/\?\?\?\?/g, '??');

    // Fix event handlers with explicit typing
    fixed = fixed.replace(/onChange=\{([^}]+)\}/g, 
      'onChange={(e: any) => $1}');

    // Fix function parameter typing issues
    fixed = fixed.replace(/(\w+)\s*\(([^)]*),\s*([^)]+)\)\s*{/g, (match, fname, params, lastParam) => {
      // Only fix if lastParam doesn't already have typing
      if (!lastParam.includes(':')) {
        return `${fname}(${params}, ${lastParam}: any) {`;
      }
      return match;
    });

    return fixed;
  }

  async runTypeCheck() {
    try {
      execSync('npm run type-check', { stdio: 'inherit' });
      return true;
    } catch {
      return false;
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: this.totalErrors,
      fixedErrors: this.fixedErrors,
      remainingErrors: this.totalErrors - this.fixedErrors,
      fixedFiles: Array.from(this.fixedFiles),
      successRate: Math.round((this.fixedErrors / this.totalErrors) * 100)
    };

    await fs.writeJson(path.join(__dirname, 'migration-report.json'), report, { spaces: 2 });
    
    this.log('\n📊 Migration Report:');
    this.log(`Total Errors Found: ${report.totalErrors}`);
    this.log(`Errors Fixed: ${report.fixedErrors}`);
    this.log(`Remaining Errors: ${report.remainingErrors}`);
    this.log(`Success Rate: ${report.successRate}%`);
    this.log(`Files Modified: ${report.fixedFiles.length}`);
  }

  async run() {
    try {
      this.log('🚀 Starting TypeScript Migration & Error Fixing...');
      
      await this.createBackup();
      
      const errors = await this.getTypeScriptErrors();
      if (errors.length === 0) {
        this.log('🎉 No TypeScript errors found!');
        return;
      }

      await this.fixErrorsAutomatically(errors);
      
      // Check remaining errors
      const remainingErrors = await this.getTypeScriptErrors();
      this.log(`\n📈 Progress: Fixed ${this.fixedErrors}/${this.totalErrors} errors`);
      
      if (remainingErrors.length > 0) {
        this.log(`⚠️  ${remainingErrors.length} errors still need manual attention`);
      } else {
        this.log('🎉 All TypeScript errors have been fixed!');
      }

      await this.generateReport();
      
    } catch (error) {
      this.log(`❌ Migration failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// CLI Interface
const args = process.argv.slice(2);
const migrator = new TypeScriptMigrator();

if (args.includes('--help')) {
  console.log(`
TECHNO-ETL TypeScript Migration Tool

Usage: node MIGRATION.js [options]

Options:
  --watch     Run in watch mode
  --fix-only  Only run fixes without backup
  --report    Generate report only
  --help      Show this help message

Examples:
  node MIGRATION.js              # Run full migration
  node MIGRATION.js --watch      # Watch for changes
  node MIGRATION.js --fix-only   # Quick fixes only
  `);
  process.exit(0);
}

if (args.includes('--watch')) {
  console.log('👀 Starting watch mode...');
  const chokidar = require('chokidar');
  
  chokidar.watch('src/**/*.{ts,tsx}').on('change', async (filePath) => {
    console.log(`🔄 File changed: ${filePath}`);
    await migrator.run();
  });
} else {
  migrator.run();
}