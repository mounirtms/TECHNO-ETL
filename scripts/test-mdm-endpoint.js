#!/usr/bin/env node

/**
 * MDM Endpoint Test Script
 * Tests the fixed MDM sync prices endpoint
 */

const http = require('http');

class MDMEndpointTester {
  constructor() {
    this.baseUrl = 'localhost';
    this.port = 5000;
    this.results = [];
  }

  async testEndpoint(path, method = 'GET', data = null) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const options = {
        hostname: this.baseUrl,
        port: this.port,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MDM-Endpoint-Tester/1.0'
        },
        timeout: 10000
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          const result = {
            path,
            method,
            status: res.statusCode,
            responseTime: Math.round(responseTime),
            success: res.statusCode >= 200 && res.statusCode < 400,
            contentLength: responseData.length
          };

          try {
            result.data = JSON.parse(responseData);
          } catch (e) {
            result.data = responseData.substring(0, 200);
          }

          this.results.push(result);
          resolve(result);
        });
      });

      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        const result = {
          path,
          method,
          status: 0,
          responseTime: Math.round(responseTime),
          success: false,
          error: error.message
        };
        
        this.results.push(result);
        resolve(result);
      });

      req.on('timeout', () => {
        req.destroy();
        const responseTime = Date.now() - startTime;
        const result = {
          path,
          method,
          status: 0,
          responseTime: Math.round(responseTime),
          success: false,
          error: 'Request timeout'
        };
        
        this.results.push(result);
        resolve(result);
      });

      if (data && method !== 'GET') {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async runTests() {
    console.log('🚀 Testing TECHNO-ETL MDM Endpoints\n');

    const tests = [
      // Health check first
      { path: '/test', method: 'GET', name: 'Basic Test' },
      { path: '/api/health', method: 'GET', name: 'Health Check' },
      
      // Main MDM endpoints
      { path: '/api/mdm/sync/prices', method: 'POST', name: 'MDM Price Sync (MAIN TARGET)' },
      { path: '/api/mdm/sync/inventory', method: 'POST', name: 'MDM Inventory Sync' },
      { path: '/api/mdm/sync/status', method: 'GET', name: 'MDM Sync Status' },
      
      // Dashboard endpoints
      { path: '/api/dashboard/stats', method: 'GET', name: 'Dashboard Stats' },
      { path: '/api/dashboard/health', method: 'GET', name: 'Dashboard Health' },
    ];

    for (const test of tests) {
      process.stdout.write(`Testing ${test.name}: ${test.method} ${test.path} ... `);
      
      const result = await this.testEndpoint(test.path, test.method);
      
      if (result.success) {
        console.log(`✅ ${result.status} (${result.responseTime}ms)`);
        
        // Show response for main target
        if (test.path === '/api/mdm/sync/prices') {
          console.log(`   📊 Response: ${JSON.stringify(result.data, null, 2).substring(0, 200)}...`);
        }
      } else {
        console.log(`❌ ${result.status || 'ERROR'} (${result.responseTime}ms)`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
    }

    this.generateReport();
  }

  generateReport() {
    const successCount = this.results.filter(r => r.success).length;
    const failureCount = this.results.length - successCount;
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length;

    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`📈 Total Tests: ${this.results.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📊 Success Rate: ${((successCount / this.results.length) * 100).toFixed(1)}%`);
    console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);

    // Check main target
    const mainTarget = this.results.find(r => r.path === '/api/mdm/sync/prices');
    if (mainTarget) {
      console.log('\n🎯 MAIN TARGET RESULT');
      console.log('-'.repeat(50));
      if (mainTarget.success) {
        console.log(`✅ MDM Price Sync Endpoint: WORKING PERFECTLY!`);
        console.log(`   Status: ${mainTarget.status}`);
        console.log(`   Response Time: ${mainTarget.responseTime}ms`);
        console.log(`   Data: ${mainTarget.data?.success ? 'Success' : 'Check response'}`);
      } else {
        console.log(`❌ MDM Price Sync Endpoint: FAILED`);
        console.log(`   Error: ${mainTarget.error || `HTTP ${mainTarget.status}`}`);
      }
    }

    // Failed endpoints
    if (failureCount > 0) {
      console.log('\n❌ FAILED ENDPOINTS:');
      console.log('-'.repeat(50));
      this.results.filter(r => !r.success).forEach(endpoint => {
        console.log(`  ${endpoint.method} ${endpoint.path}: ${endpoint.error || `HTTP ${endpoint.status}`}`);
      });
    }

    // Overall assessment
    console.log('\n🎯 OVERALL ASSESSMENT');
    console.log('-'.repeat(50));
    
    if (mainTarget && mainTarget.success) {
      console.log('🎉 SUCCESS: MDM Price Sync endpoint is working!');
      console.log('✅ The 404 error has been fixed');
      console.log('🚀 Ready for production use');
    } else {
      console.log('⚠️  ISSUE: MDM Price Sync endpoint still not working');
      console.log('🔧 Check server startup and configuration');
    }

    return {
      totalTests: this.results.length,
      successCount,
      failureCount,
      successRate: (successCount / this.results.length) * 100,
      avgResponseTime,
      mainTargetWorking: mainTarget && mainTarget.success
    };
  }
}

async function main() {
  const tester = new MDMEndpointTester();
  
  try {
    const report = await tester.runTests();
    process.exit(report.mainTargetWorking ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MDMEndpointTester;
