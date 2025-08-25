/**
 * TypeScript Error Reporter
 * This script runs TypeScript type checking and generates a detailed error report
 * for use in CI/CD pipelines
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_FILE = 'typescript-error-report.json';
const SUMMARY_FILE = 'typescript-error-summary.md';
const MAX_ERRORS_TO_SHOW = 50;

console.log('🔎 Running TypeScript error reporter...');

try {
  // Run TypeScript compiler with --noEmit and other options to get errors
  console.log('⚙️  Running TypeScript compiler check...');
  
  try {
    execSync('npx tsc --noEmit --pretty false --extendedDiagnostics', { 
      stdio: ['ignore', 'pipe', 'pipe'] 
    });
    
    console.log('✅ No TypeScript errors found!');
    
    // Create success report
    const report = {
      success: true,
      timestamp: new Date().toISOString(),
      errors: [],
      errorCount: 0,
      warningCount: 0
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
    fs.writeFileSync(SUMMARY_FILE, '# TypeScript Check: Success ✅\n\nNo type errors found.');
    
    process.exit(0);
  } catch (error) {
    // Parse the error output to generate a structured report
    const errorOutput = error.stderr.toString() || error.stdout.toString();
    const errorLines = errorOutput.split('\n');
    
    const errors = [];
    let currentError = null;
    let errorCount = 0;
    let warningCount = 0;
    
    // Simple parsing of TypeScript error format
    errorLines.forEach(line => {
      if (line.includes('.ts(') || line.includes('.tsx(')) {
        // This is an error location line
        const match = line.match(/(.*)\((\d+),(\d+)\):\s+(error|warning)\s+TS(\d+):\s+(.*)/);
        if (match) {
          if (currentError) {
            errors.push(currentError);
          }
          
          const [, filePath, line, column, severity, code, message] = match;
          
          if (severity === 'error') errorCount++;
          if (severity === 'warning') warningCount++;
          
          currentError = {
            filePath: filePath.trim(),
            line: parseInt(line, 10),
            column: parseInt(column, 10),
            severity,
            code: `TS${code}`,
            message: message.trim(),
            details: []
          };
        }
      } else if (currentError && line.trim()) {
        // This is a detail line for the current error
        currentError.details.push(line.trim());
      }
    });
    
    // Add the last error if there is one
    if (currentError) {
      errors.push(currentError);
    }
    
    // Create the JSON report
    const report = {
      success: false,
      timestamp: new Date().toISOString(),
      errors: errors.slice(0, MAX_ERRORS_TO_SHOW),
      errorCount,
      warningCount,
      totalIssues: errorCount + warningCount,
      truncated: errors.length > MAX_ERRORS_TO_SHOW
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
    
    // Create markdown summary
    const summaryLines = [
      '# TypeScript Check: Failed ❌',
      '',
      `Found **${errorCount}** errors and **${warningCount}** warnings.`,
      '',
      '## Top Issues',
      ''
    ];
    
    errors.slice(0, 10).forEach((err, index) => {
      summaryLines.push(`${index + 1}. **${err.severity.toUpperCase()}**: ${err.message}`);
      summaryLines.push(`   * File: \`${err.filePath}\` (${err.line}:${err.column})`);
      summaryLines.push(`   * Code: ${err.code}`);
      summaryLines.push('');
    });
    
    if (errors.length > 10) {
      summaryLines.push(`... and ${errors.length - 10} more issues`);
    }
    
    summaryLines.push('');
    summaryLines.push('See the full report in the uploaded artifacts.');
    
    fs.writeFileSync(SUMMARY_FILE, summaryLines.join('\n'));
    
    console.log(`❌ Found ${errorCount} errors and ${warningCount} warnings`);
    console.log(`📝 Report saved to ${OUTPUT_FILE}`);
    console.log(`📝 Summary saved to ${SUMMARY_FILE}`);
    
    process.exit(1);
  }
} catch (error) {
  console.error('Failed to run TypeScript error reporter:', error);
  process.exit(1);
}