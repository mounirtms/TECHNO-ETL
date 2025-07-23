#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Testing Script
 * Tests all TECHNO-ETL backend endpoints and reports status
 */

const http = require('http');
const { performance } = require('perf_hooks');

const BASE_URL = 'localhost';
const PORT = 5000;

class EndpointTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async testEndpoint(path, method = 'GET', data = null) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const options = {
        hostname: BASE_URL,
        port: PORT,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TECHNO-ETL-Tester/1.0'
        },
        timeout: 10000
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          const responseTime = performance.now() - startTime;
          const result = {
            path,
            method,
            status: res.statusCode,
            responseTime: Math.round(responseTime),
            success: res.statusCode >= 200 && res.statusCode < 400,
            contentLength: responseData.length,
            headers: res.headers
          };

          try {
            result.data = JSON.parse(responseData);
          } catch (e) {
            result.data = responseData.substring(0, 100);
          }

          this.results.push(result);
          resolve(result);
        });
      });

      req.on('error', (error) => {
        const responseTime = performance.now() - startTime;
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
        const responseTime = performance.now() - startTime;
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

  async runAllTests() {
    console.log('🚀 Starting TECHNO-ETL API Endpoint Tests\n');

    const endpoints = [
      // Health & Monitoring
      { path: '/api/health', method: 'GET', category: 'Health & Monitoring' },
      { path: '/api/metrics', method: 'GET', category: 'Health & Monitoring' },
      { path: '/api/metrics/prometheus', method: 'GET', category: 'Health & Monitoring' },
      
      // Dashboard API
      { path: '/api/dashboard/health', method: 'GET', category: 'Dashboard' },
      { path: '/api/dashboard/stats', method: 'GET', category: 'Dashboard' },
      { path: '/api/dashboard/orders', method: 'GET', category: 'Dashboard' },
      { path: '/api/dashboard/products', method: 'GET', category: 'Dashboard' },
      { path: '/api/dashboard/customers', method: 'GET', category: 'Dashboard' },
      
      // MDM Sync Operations
      { path: '/api/mdm/sync/prices', method: 'POST', category: 'MDM Sync' },
      { path: '/api/mdm/sync/inventory', method: 'POST', category: 'MDM Sync' },
      { path: '/api/mdm/sync/status', method: 'GET', category: 'MDM Sync' },
      { path: '/api/mdm/inventory', method: 'GET', category: 'MDM Data' },
      
      // Magento Proxy
      { path: '/api/magento/orders', method: 'GET', category: 'Magento Proxy' },
      { path: '/api/magento/products', method: 'GET', category: 'Magento Proxy' },
      { path: '/api/magento/customers', method: 'GET', category: 'Magento Proxy' },
    ];

    // Group tests by category
    const categories = [...new Set(endpoints.map(e => e.category))];
    
    for (const category of categories) {
      console.log(`\n📋 Testing ${category} Endpoints:`);
      console.log('─'.repeat(50));
      
      const categoryEndpoints = endpoints.filter(e => e.category === category);
      
      for (const endpoint of categoryEndpoints) {
        process.stdout.write(`  ${endpoint.method} ${endpoint.path} ... `);
        
        const result = await this.testEndpoint(endpoint.path, endpoint.method);
        
        if (result.success) {
          console.log(`✅ ${result.status} (${result.responseTime}ms)`);
        } else {
          console.log(`❌ ${result.status || 'ERROR'} (${result.responseTime}ms)`);
          if (result.error) {
            console.log(`     Error: ${result.error}`);
          }
        }
      }
    }

    this.generateReport();
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const successCount = this.results.filter(r => r.success).length;
    const failureCount = this.results.length - successCount;
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length;

    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`⏱️  Total Test Time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`📈 Total Endpoints: ${this.results.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📊 Success Rate: ${((successCount / this.results.length) * 100).toFixed(1)}%`);
    console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);

    // Category breakdown
    console.log('\n📋 CATEGORY BREAKDOWN');
    console.log('-'.repeat(50));
    
    const categories = [...new Set(this.results.map(r => r.path.split('/')[2] || 'root'))];
    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.path.includes(category));
      const categorySuccess = categoryResults.filter(r => r.success).length;
      const categoryTotal = categoryResults.length;
      const categoryRate = ((categorySuccess / categoryTotal) * 100).toFixed(1);
      
      console.log(`  ${category}: ${categorySuccess}/${categoryTotal} (${categoryRate}%)`);
    });

    // Performance analysis
    console.log('\n⚡ PERFORMANCE ANALYSIS');
    console.log('-'.repeat(50));
    
    const fastEndpoints = this.results.filter(r => r.success && r.responseTime < 100);
    const slowEndpoints = this.results.filter(r => r.success && r.responseTime > 1000);
    
    console.log(`🚀 Fast endpoints (<100ms): ${fastEndpoints.length}`);
    console.log(`🐌 Slow endpoints (>1000ms): ${slowEndpoints.length}`);
    
    if (slowEndpoints.length > 0) {
      console.log('\n🐌 SLOW ENDPOINTS:');
      slowEndpoints.forEach(endpoint => {
        console.log(`  ${endpoint.method} ${endpoint.path}: ${endpoint.responseTime}ms`);
      });
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
    
    if (successCount === this.results.length) {
      console.log('🎉 EXCELLENT: All endpoints are working perfectly!');
    } else if (successCount / this.results.length >= 0.9) {
      console.log('✅ GOOD: Most endpoints are working well');
    } else if (successCount / this.results.length >= 0.7) {
      console.log('⚠️  FAIR: Some endpoints need attention');
    } else {
      console.log('❌ POOR: Many endpoints are failing');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-'.repeat(50));
    
    if (slowEndpoints.length > 0) {
      console.log('• Optimize slow endpoints for better performance');
    }
    
    if (failureCount > 0) {
      console.log('• Fix failed endpoints to improve reliability');
    }
    
    if (avgResponseTime > 500) {
      console.log('• Consider caching to improve response times');
    }
    
    console.log('• Monitor endpoints regularly for performance degradation');
    console.log('• Set up automated health checks for critical endpoints');

    return {
      totalEndpoints: this.results.length,
      successCount,
      failureCount,
      successRate: (successCount / this.results.length) * 100,
      avgResponseTime,
      passed: successCount / this.results.length >= 0.8
    };
  }
}

async function main() {
  const tester = new EndpointTester();
  
  try {
    const report = await tester.runAllTests();
    process.exit(report.passed ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
