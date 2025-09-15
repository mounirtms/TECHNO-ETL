#!/usr/bin/env node

/**
 * Comprehensive Test Runner for TECHNO-ETL
 *
 * This script runs all test suites and generates a comprehensive report
 * covering unit tests, integration tests, e2e tests, and performance benchmarks.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const runCommand = (command, description) => {
  log(`\n${description}`, 'cyan');
  log('='.repeat(50), 'blue');

  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    log(`✅ ${description} completed successfully`, 'green');

    return { success: true, output };
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    log(`Error: ${error.message}`, 'red');

    return { success: false, error: error.message };
  }
};

const checkPageAccessibility = () => {
  log('\n🔍 Checking Page Accessibility', 'magenta');
  log('='.repeat(50), 'blue');

  const problematicPages = [
    'src/pages/SettingsPage.jsx',
    'src/components/License/LicenseStatus.jsx',
    'src/components/License/LicenseManagement.jsx',
    'src/components/grids/magento/ProductsGrid.jsx',
  ];

  const issues = [];

  problematicPages.forEach(pagePath => {
    if (fs.existsSync(pagePath)) {
      const content = fs.readFileSync(pagePath, 'utf8');

      // Check for common issues
      const checks = [
        {
          name: 'Unused imports',
          pattern: /import.*from.*(?=\n)/g,
          severity: 'warning',
        },
        {
          name: 'Console.log statements',
          pattern: /console\.log/g,
          severity: 'info',
        },
        {
          name: 'TODO comments',
          pattern: /\/\/\s*TODO/gi,
          severity: 'info',
        },
        {
          name: 'FIXME comments',
          pattern: /\/\/\s*FIXME/gi,
          severity: 'warning',
        },
        {
          name: 'Missing error boundaries',
          pattern: /componentDidCatch|ErrorBoundary/g,
          severity: 'info',
          invert: true,
        },
      ];

      checks.forEach(check => {
        const matches = content.match(check.pattern);

        if ((matches && !check.invert) || (!matches && check.invert)) {
          issues.push({
            file: pagePath,
            issue: check.name,
            severity: check.severity,
            count: matches ? matches.length : 0,
          });
        }
      });

      log(`✅ Analyzed ${pagePath}`, 'green');
    } else {
      log(`⚠️  File not found: ${pagePath}`, 'yellow');
    }
  });

  if (issues.length > 0) {
    log('\n📋 Issues Found:', 'yellow');
    issues.forEach(issue => {
      const icon = issue.severity === 'warning' ? '⚠️' : 'ℹ️';

      log(`${icon} ${issue.file}: ${issue.issue} (${issue.count || 'missing'})`, 'yellow');
    });
  } else {
    log('✅ No major issues found in problematic pages', 'green');
  }

  return issues;
};

const generateTestReport = (results) => {
  log('\n📊 Test Report Summary', 'bright');
  log('='.repeat(50), 'blue');

  const report = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    },
  };

  log(`Total Test Suites: ${report.summary.total}`, 'cyan');
  log(`Passed: ${report.summary.passed}`, 'green');
  log(`Failed: ${report.summary.failed}`, report.summary.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((report.summary.passed / report.summary.total) * 100).toFixed(1)}%`,
    report.summary.failed === 0 ? 'green' : 'yellow');

  // Save report to file
  const reportPath = path.join(process.cwd(), 'test-report.json');

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');

  return report;
};

const main = async () => {
  log('🚀 Starting Comprehensive Test Suite for TECHNO-ETL', 'bright');
  log('='.repeat(60), 'blue');

  const testSuites = [
    {
      name: 'Unit Tests - Components',
      command: 'npm run test:components',
      description: 'Running component unit tests',
    },
    {
      name: 'Unit Tests - Pages',
      command: 'npm run test:pages',
      description: 'Running page unit tests',
    },
    {
      name: 'Integration Tests',
      command: 'npm run test:integration',
      description: 'Running integration tests for settings persistence',
    },
    {
      name: 'End-to-End Tests',
      command: 'npm run test:e2e',
      description: 'Running end-to-end workflow tests',
    },
    {
      name: 'Performance Benchmarks',
      command: 'npm run test:performance',
      description: 'Running performance benchmark tests',
    },
    {
      name: 'Coverage Report',
      command: 'npm run test:coverage',
      description: 'Generating test coverage report',
    },
  ];

  const results = [];

  // Check page accessibility first
  const accessibilityIssues = checkPageAccessibility();

  // Run all test suites
  for (const suite of testSuites) {
    const result = runCommand(suite.command, suite.description);

    results.push({
      name: suite.name,
      ...result,
    });
  }

  // Generate final report
  const report = generateTestReport(results);

  // Final summary
  log('\n🎯 Final Summary', 'bright');
  log('='.repeat(50), 'blue');

  if (report.summary.failed === 0 && accessibilityIssues.length === 0) {
    log('🎉 All tests passed! The application is ready for production.', 'green');
  } else if (report.summary.failed === 0) {
    log('✅ All tests passed, but some accessibility issues were found.', 'yellow');
    log('📝 Review the issues above and consider fixing them.', 'yellow');
  } else {
    log('❌ Some tests failed. Please review and fix the issues.', 'red');
    log(`📊 ${report.summary.failed} out of ${report.summary.total} test suites failed.`, 'red');
  }

  // Exit with appropriate code
  process.exit(report.summary.failed > 0 ? 1 : 0);
};

// Run the test suite
main().catch(error => {
  log(`💥 Test runner failed: ${error.message}`, 'red');
  process.exit(1);
});
