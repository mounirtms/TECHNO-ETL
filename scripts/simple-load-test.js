#!/usr/bin/env node

/**
 * Simple Load Testing Script for TECHNO-ETL Backend
 * Tests basic functionality with concurrent users
 */

const http = require('http');
const { performance } = require('perf_hooks');

const BASE_URL = 'localhost';
const PORT = 5000;
const CONCURRENT_USERS = 15;
const REQUESTS_PER_USER = 5;

class SimpleLoadTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };
  }

  makeRequest(path) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const options = {
        hostname: BASE_URL,
        port: PORT,
        path: path,
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const responseTime = performance.now() - startTime;
          this.results.totalRequests++;
          
          if (res.statusCode >= 200 && res.statusCode < 400) {
            this.results.successfulRequests++;
            this.results.responseTimes.push(responseTime);
          } else {
            this.results.failedRequests++;
            this.results.errors.push(`${path}: HTTP ${res.statusCode}`);
          }
          
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 400,
            responseTime,
            statusCode: res.statusCode
          });
        });
      });

      req.on('error', (error) => {
        const responseTime = performance.now() - startTime;
        this.results.totalRequests++;
        this.results.failedRequests++;
        this.results.errors.push(`${path}: ${error.message}`);
        
        resolve({
          success: false,
          responseTime,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const responseTime = performance.now() - startTime;
        this.results.totalRequests++;
        this.results.failedRequests++;
        this.results.errors.push(`${path}: Request timeout`);
        
        resolve({
          success: false,
          responseTime,
          error: 'Timeout'
        });
      });

      req.end();
    });
  }

  async simulateUser(userId) {
    console.log(`👤 User ${userId} starting...`);
    
    const endpoints = ['/api/health', '/api/metrics'];
    const userResults = [];
    
    for (let i = 0; i < REQUESTS_PER_USER; i++) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const result = await this.makeRequest(endpoint);
      userResults.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ User ${userId} completed`);
    return userResults;
  }

  async runTest() {
    console.log('🚀 Starting Simple Load Test');
    console.log(`👥 Concurrent Users: ${CONCURRENT_USERS}`);
    console.log(`📊 Requests per User: ${REQUESTS_PER_USER}`);
    console.log(`🎯 Total Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}\n`);

    const startTime = Date.now();
    
    // Create user simulations
    const userPromises = [];
    for (let i = 1; i <= CONCURRENT_USERS; i++) {
      userPromises.push(this.simulateUser(i));
    }
    
    // Wait for all users to complete
    await Promise.all(userPromises);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    this.generateReport(duration);
  }

  generateReport(duration) {
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    const avgResponseTime = this.results.responseTimes.length > 0 
      ? this.results.responseTimes.reduce((sum, time) => sum + time, 0) / this.results.responseTimes.length
      : 0;
    const requestsPerSecond = this.results.totalRequests / duration;
    
    console.log('\n📊 LOAD TEST RESULTS');
    console.log('='.repeat(40));
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`📈 Total Requests: ${this.results.totalRequests}`);
    console.log(`✅ Successful: ${this.results.successfulRequests}`);
    console.log(`❌ Failed: ${this.results.failedRequests}`);
    console.log(`📊 Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`🚀 Requests/sec: ${requestsPerSecond.toFixed(2)}`);
    console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.results.errors.slice(0, 3).forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      if (this.results.errors.length > 3) {
        console.log(`... and ${this.results.errors.length - 3} more errors`);
      }
    }
    
    console.log('\n🎯 PERFORMANCE ASSESSMENT');
    console.log('-'.repeat(40));
    
    if (successRate >= 95) {
      console.log('✅ Excellent reliability');
    } else if (successRate >= 90) {
      console.log('⚠️  Good reliability');
    } else {
      console.log('❌ Poor reliability');
    }
    
    if (avgResponseTime <= 200) {
      console.log('✅ Excellent response time');
    } else if (avgResponseTime <= 500) {
      console.log('⚠️  Good response time');
    } else {
      console.log('❌ Poor response time');
    }
    
    if (requestsPerSecond >= 20) {
      console.log('✅ Excellent throughput');
    } else if (requestsPerSecond >= 10) {
      console.log('⚠️  Good throughput');
    } else {
      console.log('❌ Poor throughput');
    }
    
    const passed = successRate >= 90 && avgResponseTime <= 500;
    console.log(`\n🏁 RESULT: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (passed) {
      console.log('🎉 Backend successfully handles 10+ concurrent users!');
    } else {
      console.log('⚠️  Backend needs optimization for concurrent load');
    }
    
    return passed;
  }
}

async function main() {
  console.log('🎯 TECHNO-ETL Simple Load Test\n');
  
  const tester = new SimpleLoadTester();
  
  try {
    // Quick health check
    console.log('🔍 Checking server availability...');
    const healthResult = await tester.makeRequest('/api/health');
    
    if (!healthResult.success) {
      throw new Error('Server is not responding. Please start the backend server.');
    }
    
    console.log('✅ Server is available\n');
    
    // Run the load test
    const passed = await tester.runTest();
    
    process.exit(passed ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Load test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
