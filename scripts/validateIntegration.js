#!/usr/bin/env node

/**
 * Integration Validation Script
 * Tests and validates complete integration of all optimizations
 * Verifies port configurations, service routing, component functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🧪 TECHNO-ETL INTEGRATION VALIDATION');
console.log('=====================================');

// ===== CONFIGURATION =====

const config = {
  ports: {
    frontend: 80,
    backend: 5000,
    preview: 4173
  },
  timeouts: {
    startup: 30000,
    request: 10000,
    shutdown: 5000
  },
  endpoints: {
    frontend: 'http://localhost:80',
    backend: 'http://localhost:5000',
    health: 'http://localhost:5000/api/health',
    dashboard: 'http://localhost:5000/api/dashboard',
    mdm: 'http://localhost:5000/api/mdm',
    magento: 'http://localhost:5000/api/magento'
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Check if port is available
 */
function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Wait for service to be available
 */
function waitForService(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkService = () => {
      const client = net.createConnection({ port }, () => {
        client.end();
        resolve(true);
      });
      
      client.on('error', () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Service on port ${port} not available after ${timeout}ms`));
        } else {
          setTimeout(checkService, 1000);
        }
      });
    };
    
    checkService();
  });
}

/**
 * Make HTTP request
 */
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      timeout: config.timeouts.request,
      ...options
    });
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: await response.text()
    };
  } catch (error) {
    return {
      error: error.message,
      status: 0
    };
  }
}

/**
 * Run command with timeout
 */
function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 30000;
    
    try {
      const result = execSync(command, {
        cwd: projectRoot,
        encoding: 'utf8',
        timeout,
        ...options
      });
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// ===== VALIDATION TESTS =====

/**
 * Test 1: Validate port configurations
 */
async function validatePortConfigurations() {
  console.log('\n🔍 Test 1: Validating port configurations...');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  // Check frontend port configuration
  try {
    const viteConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.js'), 'utf8');
    const hasPort80 = viteConfig.includes('port: 80') || viteConfig.includes('VITE_PORT');
    
    if (hasPort80) {
      results.passed++;
      results.details.push('✅ Frontend configured for port 80');
    } else {
      results.failed++;
      results.details.push('❌ Frontend port 80 configuration not found');
    }
  } catch (error) {
    results.failed++;
    results.details.push('❌ Could not read vite.config.js');
  }
  
  // Check backend port configuration
  try {
    const backendPackage = JSON.parse(fs.readFileSync(path.join(projectRoot, 'backend', 'package.json'), 'utf8'));
    const hasPort5000 = JSON.stringify(backendPackage.scripts).includes('PORT=5000');
    
    if (hasPort5000) {
      results.passed++;
      results.details.push('✅ Backend configured for port 5000');
    } else {
      results.failed++;
      results.details.push('❌ Backend port 5000 configuration not found');
    }
  } catch (error) {
    results.failed++;
    results.details.push('❌ Could not read backend package.json');
  }
  
  // Check environment files
  try {
    const envDev = fs.readFileSync(path.join(projectRoot, '.env.development'), 'utf8');
    const hasCorrectEnv = envDev.includes('VITE_PORT=80') && envDev.includes('localhost:5000');
    
    if (hasCorrectEnv) {
      results.passed++;
      results.details.push('✅ Environment configuration correct');
    } else {
      results.failed++;
      results.details.push('❌ Environment configuration incorrect');
    }
  } catch (error) {
    results.failed++;
    results.details.push('❌ Could not read .env.development');
  }
  
  return results;
}

/**
 * Test 2: Validate service routing
 */
async function validateServiceRouting() {
  console.log('\n🔍 Test 2: Validating service routing...');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  // Check if services are running
  const backendRunning = await checkPortAvailable(config.ports.backend).then(available => !available);
  
  if (!backendRunning) {
    results.failed++;
    results.details.push('❌ Backend service not running on port 5000');
    return results;
  }
  
  // Test health endpoint
  try {
    const healthResponse = await makeRequest(config.endpoints.health);
    if (healthResponse.status === 200) {
      results.passed++;
      results.details.push('✅ Health endpoint responding');
    } else {
      results.failed++;
      results.details.push(`❌ Health endpoint failed: ${healthResponse.status}`);
    }
  } catch (error) {
    results.failed++;
    results.details.push(`❌ Health endpoint error: ${error.message}`);
  }
  
  // Test API endpoints
  const endpoints = [
    { name: 'Dashboard API', url: config.endpoints.dashboard },
    { name: 'MDM API', url: config.endpoints.mdm },
    { name: 'Magento API', url: config.endpoints.magento }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.url);
      if (response.status < 500) { // Accept 200, 404, etc. but not 500+
        results.passed++;
        results.details.push(`✅ ${endpoint.name} accessible`);
      } else {
        results.failed++;
        results.details.push(`❌ ${endpoint.name} server error: ${response.status}`);
      }
    } catch (error) {
      results.failed++;
      results.details.push(`❌ ${endpoint.name} error: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Test 3: Validate tooltip fixes
 */
async function validateTooltipFixes() {
  console.log('\n🔍 Test 3: Validating tooltip fixes...');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  // Check TooltipWrapper component exists
  try {
    const tooltipWrapper = fs.readFileSync(
      path.join(projectRoot, 'src', 'components', 'common', 'TooltipWrapper.jsx'), 
      'utf8'
    );
    
    if (tooltipWrapper.includes('forwardRef') && tooltipWrapper.includes('disabled')) {
      results.passed++;
      results.details.push('✅ TooltipWrapper component implemented correctly');
    } else {
      results.failed++;
      results.details.push('❌ TooltipWrapper component missing key features');
    }
  } catch (error) {
    results.failed++;
    results.details.push('❌ TooltipWrapper component not found');
  }
  
  // Check UnifiedGridToolbar uses TooltipWrapper
  try {
    const unifiedToolbar = fs.readFileSync(
      path.join(projectRoot, 'src', 'components', 'common', 'UnifiedGridToolbar.jsx'), 
      'utf8'
    );
    
    if (unifiedToolbar.includes('TooltipWrapper')) {
      results.passed++;
      results.details.push('✅ UnifiedGridToolbar uses TooltipWrapper');
    } else {
      results.failed++;
      results.details.push('❌ UnifiedGridToolbar not using TooltipWrapper');
    }
  } catch (error) {
    results.failed++;
    results.details.push('❌ Could not check UnifiedGridToolbar');
  }
  
  // Check ProductManagementGrid uses TooltipWrapper
  try {
    const productGrid = fs.readFileSync(
      path.join(projectRoot, 'src', 'components', 'grids', 'magento', 'ProductManagementGrid.jsx'), 
      'utf8'
    );
    
    if (productGrid.includes('TooltipWrapper')) {
      results.passed++;
      results.details.push('✅ ProductManagementGrid uses TooltipWrapper');
    } else {
      results.failed++;
      results.details.push('❌ ProductManagementGrid not using TooltipWrapper');
    }
  } catch (error) {
    results.failed++;
    results.details.push('❌ Could not check ProductManagementGrid');
  }
  
  return results;
}

/**
 * Test 4: Validate DRY optimizations
 */
async function validateDRYOptimizations() {
  console.log('\n🔍 Test 4: Validating DRY optimizations...');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  // Check base components exist
  const baseComponents = ['BaseGrid', 'BaseToolbar', 'BaseDialog', 'BaseCard'];
  
  for (const component of baseComponents) {
    try {
      const componentPath = path.join(projectRoot, 'src', 'components', 'base', `${component}.jsx`);
      if (fs.existsSync(componentPath)) {
        results.passed++;
        results.details.push(`✅ ${component} component exists`);
      } else {
        results.failed++;
        results.details.push(`❌ ${component} component missing`);
      }
    } catch (error) {
      results.failed++;
      results.details.push(`❌ Error checking ${component}: ${error.message}`);
    }
  }
  
  // Check configuration files
  try {
    const configPath = path.join(projectRoot, 'src', 'config', 'baseGridConfig.js');
    if (fs.existsSync(configPath)) {
      results.passed++;
      results.details.push('✅ Base grid configuration exists');
    } else {
      results.failed++;
      results.details.push('❌ Base grid configuration missing');
    }
  } catch (error) {
    results.failed++;
    results.details.push('❌ Error checking configuration');
  }
  
  // Check TypeScript interfaces
  try {
    const typesPath = path.join(projectRoot, 'src', 'components', 'base', 'types.ts');
    if (fs.existsSync(typesPath)) {
      results.passed++;
      results.details.push('✅ TypeScript interfaces exist');
    } else {
      results.failed++;
      results.details.push('❌ TypeScript interfaces missing');
    }
  } catch (error) {
    results.failed++;
    results.details.push('❌ Error checking TypeScript interfaces');
  }
  
  // Check centralized exports
  try {
    const indexPath = path.join(projectRoot, 'src', 'components', 'index.js');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      if (indexContent.includes('BaseGrid') && indexContent.includes('export')) {
        results.passed++;
        results.details.push('✅ Centralized component exports exist');
      } else {
        results.failed++;
        results.details.push('❌ Centralized exports incomplete');
      }
    } else {
      results.failed++;
      results.details.push('❌ Centralized component index missing');
    }
  } catch (error) {
    results.failed++;
    results.details.push('❌ Error checking centralized exports');
  }
  
  return results;
}

/**
 * Test 5: Development environment startup
 */
async function validateDevelopmentStartup() {
  console.log('\n🔍 Test 5: Validating development environment startup...');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  // Check if npm run dev works
  try {
    console.log('   Starting development server (this may take a moment)...');
    
    // Start dev server in background
    const devProcess = spawn('npm', ['run', 'dev'], {
      cwd: projectRoot,
      stdio: 'pipe',
      detached: false
    });
    
    let output = '';
    let errorOutput = '';
    
    devProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    devProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Wait for startup or timeout
    const startupPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        devProcess.kill();
        reject(new Error('Development server startup timeout'));
      }, config.timeouts.startup);
      
      devProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') || output.includes('ready') || output.includes('localhost')) {
          clearTimeout(timeout);
          devProcess.kill();
          resolve(true);
        }
      });
      
      devProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
    
    await startupPromise;
    
    results.passed++;
    results.details.push('✅ Development server starts successfully');
    
  } catch (error) {
    results.failed++;
    results.details.push(`❌ Development server startup failed: ${error.message}`);
  }
  
  return results;
}

/**
 * Test 6: Build process validation
 */
async function validateBuildProcess() {
  console.log('\n🔍 Test 6: Validating build process...');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  try {
    console.log('   Running build process (this may take a moment)...');
    
    const buildOutput = await runCommand('npm run build', {
      timeout: 120000 // 2 minutes
    });
    
    if (buildOutput.includes('built') || buildOutput.includes('success')) {
      results.passed++;
      results.details.push('✅ Build process completes successfully');
    } else {
      results.failed++;
      results.details.push('❌ Build process completed but with warnings');
    }
    
    // Check if dist folder exists
    const distPath = path.join(projectRoot, 'dist');
    if (fs.existsSync(distPath)) {
      results.passed++;
      results.details.push('✅ Build output directory created');
    } else {
      results.failed++;
      results.details.push('❌ Build output directory not found');
    }
    
  } catch (error) {
    results.failed++;
    results.details.push(`❌ Build process failed: ${error.message}`);
  }
  
  return results;
}

/**
 * Generate integration report
 */
function generateIntegrationReport(testResults) {
  console.log('\n📝 Generating integration report...');
  
  const totalPassed = testResults.reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = testResults.reduce((sum, result) => sum + result.failed, 0);
  const totalTests = totalPassed + totalFailed;
  const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passed: totalPassed,
      failed: totalFailed,
      successRate: `${successRate}%`,
      status: totalFailed === 0 ? 'PASSED' : 'FAILED'
    },
    testResults: testResults.map((result, index) => ({
      testNumber: index + 1,
      testName: [
        'Port Configurations',
        'Service Routing',
        'Tooltip Fixes',
        'DRY Optimizations',
        'Development Startup',
        'Build Process'
      ][index],
      passed: result.passed,
      failed: result.failed,
      details: result.details
    })),
    recommendations: []
  };
  
  // Add recommendations based on failures
  if (totalFailed > 0) {
    report.recommendations.push({
      priority: 'High',
      description: 'Fix failing tests before deployment',
      action: 'Review failed test details and address issues'
    });
  }
  
  if (successRate < 100) {
    report.recommendations.push({
      priority: 'Medium',
      description: 'Improve test coverage and reliability',
      action: 'Investigate intermittent failures and add more robust error handling'
    });
  }
  
  // Write report
  const reportDir = path.join(projectRoot, 'integration-test-results');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, 'integration-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Write summary
  const summaryPath = path.join(reportDir, 'integration-test-summary.md');
  const summaryContent = `# Integration Test Summary

**Generated:** ${report.timestamp}
**Status:** ${report.summary.status}
**Success Rate:** ${report.summary.successRate}

## Overview

- **Total Tests:** ${report.summary.totalTests}
- **Passed:** ${report.summary.passed}
- **Failed:** ${report.summary.failed}

## Test Results

${report.testResults.map(test => `
### ${test.testNumber}. ${test.testName}

**Passed:** ${test.passed} | **Failed:** ${test.failed}

${test.details.map(detail => `- ${detail}`).join('\n')}
`).join('\n')}

## Recommendations

${report.recommendations.length === 0 ? 'All tests passed! No recommendations.' : 
  report.recommendations.map(rec => `
### ${rec.priority} Priority

**Description:** ${rec.description}
**Action:** ${rec.action}
`).join('\n')}

---

*Generated by Techno-ETL Integration Validator*
`;
  
  fs.writeFileSync(summaryPath, summaryContent);
  
  return { reportPath, summaryPath, report };
}

// ===== MAIN EXECUTION =====

async function main() {
  try {
    console.log(`🧪 Running integration validation for: ${projectRoot}`);
    
    const testResults = [];
    
    // Run all validation tests
    testResults.push(await validatePortConfigurations());
    testResults.push(await validateServiceRouting());
    testResults.push(await validateTooltipFixes());
    testResults.push(await validateDRYOptimizations());
    testResults.push(await validateDevelopmentStartup());
    testResults.push(await validateBuildProcess());
    
    // Generate report
    const { reportPath, summaryPath, report } = generateIntegrationReport(testResults);
    
    // Display results
    console.log('\n📊 INTEGRATION TEST RESULTS');
    console.log('============================');
    console.log(`Status: ${report.summary.status}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    
    console.log('\n📝 Reports generated:');
    console.log(`  - Detailed report: ${reportPath}`);
    console.log(`  - Summary report: ${summaryPath}`);
    
    if (report.summary.status === 'PASSED') {
      console.log('\n🎉 All integration tests passed!');
      console.log('✅ System is ready for deployment.');
    } else {
      console.log('\n⚠️  Some integration tests failed.');
      console.log('❌ Please review the report and fix issues before deployment.');
    }
    
    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Integration validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as validateIntegration };
export default main;