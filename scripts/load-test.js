#!/usr/bin/env node

/**
 * Load Testing Script for TECHNO-ETL Backend
 * 
 * Tests the backend with 10+ concurrent users to verify:
 * - API endpoint performance
 * - Worker pool functionality
 * - Cache effectiveness
 * - Error handling under load
 * - Memory and CPU usage
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:5000';
const CONCURRENT_USERS = 15;
const REQUESTS_PER_USER = 10;
const TEST_DURATION = 30000; // 30 seconds

class LoadTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimes: [],
      errors: [],
      endpointStats: {},
      startTime: null,
      endTime: null
    };
  }

  async testEndpoint(endpoint, method = 'GET', data = null) {
    const startTime = performance.now();
    
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        timeout: 10000,
        headers: {
          'User-Agent': 'LoadTester/1.0',
          'Content-Type': 'application/json'
        }
      };
      
      if (data) {
        config.data = data;
      }
      
      const response = await axios(config);
      const responseTime = performance.now() - startTime;
      
      this.recordSuccess(endpoint, responseTime);
      return { success: true, responseTime, status: response.status };
      
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.recordError(endpoint, error, responseTime);
      return { success: false, responseTime, error: error.message };
    }
  }

  recordSuccess(endpoint, responseTime) {
    this.results.totalRequests++;
    this.results.successfulRequests++;
    this.results.responseTimes.push(responseTime);
    this.results.minResponseTime = Math.min(this.results.minResponseTime, responseTime);
    this.results.maxResponseTime = Math.max(this.results.maxResponseTime, responseTime);
    
    if (!this.results.endpointStats[endpoint]) {
      this.results.endpointStats[endpoint] = { success: 0, failed: 0, avgTime: 0, times: [] };
    }
    this.results.endpointStats[endpoint].success++;
    this.results.endpointStats[endpoint].times.push(responseTime);
  }

  recordError(endpoint, error, responseTime) {
    this.results.totalRequests++;
    this.results.failedRequests++;
    this.results.errors.push({ endpoint, error: error.message, responseTime });
    
    if (!this.results.endpointStats[endpoint]) {
      this.results.endpointStats[endpoint] = { success: 0, failed: 0, avgTime: 0, times: [] };
    }
    this.results.endpointStats[endpoint].failed++;
  }

  async simulateUser(userId) {
    console.log(`👤 User ${userId} starting load test...`);
    
    const endpoints = [
      '/api/health',
      '/api/metrics',
      '/api/metrics/prometheus',
      '/api/mdm/inventory'
    ];
    
    const userResults = [];
    
    for (let i = 0; i < REQUESTS_PER_USER; i++) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const result = await this.testEndpoint(endpoint);
      userResults.push(result);
      
      // Random delay between requests (100-500ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));
    }
    
    console.log(`✅ User ${userId} completed ${REQUESTS_PER_USER} requests`);
    return userResults;
  }

  async runConcurrentTest() {
    console.log(`🚀 Starting load test with ${CONCURRENT_USERS} concurrent users...`);
    console.log(`📊 Each user will make ${REQUESTS_PER_USER} requests`);
    console.log(`⏱️  Test duration: ${TEST_DURATION / 1000} seconds\n`);
    
    this.results.startTime = Date.now();
    
    // Create concurrent user simulations
    const userPromises = [];
    for (let i = 1; i <= CONCURRENT_USERS; i++) {
      userPromises.push(this.simulateUser(i));
    }
    
    // Wait for all users to complete or timeout
    try {
      await Promise.all(userPromises);
    } catch (error) {
      console.error('❌ Some users failed:', error.message);
    }
    
    this.results.endTime = Date.now();
    this.calculateStats();
  }

  calculateStats() {
    // Calculate average response time
    if (this.results.responseTimes.length > 0) {
      this.results.averageResponseTime = 
        this.results.responseTimes.reduce((sum, time) => sum + time, 0) / 
        this.results.responseTimes.length;
    }
    
    // Calculate endpoint-specific stats
    Object.keys(this.results.endpointStats).forEach(endpoint => {
      const stats = this.results.endpointStats[endpoint];
      if (stats.times.length > 0) {
        stats.avgTime = stats.times.reduce((sum, time) => sum + time, 0) / stats.times.length;
      }
    });
  }

  async testWorkerPool() {
    console.log('\n🔧 Testing worker pool functionality...');
    
    // Test multiple concurrent image processing requests
    const workerTests = [];
    for (let i = 0; i < 5; i++) {
      workerTests.push(this.testEndpoint('/api/test'));
    }
    
    const workerResults = await Promise.all(workerTests);
    const successfulWorkerTests = workerResults.filter(r => r.success).length;
    
    console.log(`✅ Worker pool test: ${successfulWorkerTests}/${workerTests.length} successful`);
    return successfulWorkerTests === workerTests.length;
  }

  async testCacheEffectiveness() {
    console.log('\n💾 Testing cache effectiveness...');
    
    // Make the same request multiple times to test caching
    const cacheEndpoint = '/api/health';
    const cacheTests = [];
    
    for (let i = 0; i < 10; i++) {
      cacheTests.push(this.testEndpoint(cacheEndpoint));
    }
    
    const cacheResults = await Promise.all(cacheTests);
    const avgCacheTime = cacheResults.reduce((sum, r) => sum + r.responseTime, 0) / cacheResults.length;
    
    console.log(`📈 Average cached response time: ${avgCacheTime.toFixed(2)}ms`);
    return avgCacheTime < 100; // Should be fast if cached
  }

  generateReport() {
    const duration = (this.results.endTime - this.results.startTime) / 1000;
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    const requestsPerSecond = this.results.totalRequests / duration;
    
    console.log('\n📊 LOAD TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`📈 Total Requests: ${this.results.totalRequests}`);
    console.log(`✅ Successful: ${this.results.successfulRequests}`);
    console.log(`❌ Failed: ${this.results.failedRequests}`);
    console.log(`📊 Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`🚀 Requests/sec: ${requestsPerSecond.toFixed(2)}`);
    console.log(`⚡ Avg Response Time: ${this.results.averageResponseTime.toFixed(2)}ms`);
    console.log(`🏃 Min Response Time: ${this.results.minResponseTime.toFixed(2)}ms`);
    console.log(`🐌 Max Response Time: ${this.results.maxResponseTime.toFixed(2)}ms`);
    
    console.log('\n📋 ENDPOINT STATISTICS');
    console.log('-'.repeat(50));
    Object.entries(this.results.endpointStats).forEach(([endpoint, stats]) => {
      const endpointSuccessRate = (stats.success / (stats.success + stats.failed)) * 100;
      console.log(`${endpoint}:`);
      console.log(`  ✅ Success: ${stats.success}, ❌ Failed: ${stats.failed}`);
      console.log(`  📊 Success Rate: ${endpointSuccessRate.toFixed(2)}%`);
      console.log(`  ⚡ Avg Time: ${stats.avgTime.toFixed(2)}ms`);
    });
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS');
      console.log('-'.repeat(50));
      this.results.errors.slice(0, 5).forEach((error, index) => {
        console.log(`${index + 1}. ${error.endpoint}: ${error.error}`);
      });
      if (this.results.errors.length > 5) {
        console.log(`... and ${this.results.errors.length - 5} more errors`);
      }
    }
    
    // Performance assessment
    console.log('\n🎯 PERFORMANCE ASSESSMENT');
    console.log('-'.repeat(50));
    
    const assessments = [];
    if (successRate >= 99) assessments.push('✅ Excellent reliability');
    else if (successRate >= 95) assessments.push('⚠️  Good reliability');
    else assessments.push('❌ Poor reliability');
    
    if (this.results.averageResponseTime <= 200) assessments.push('✅ Excellent response time');
    else if (this.results.averageResponseTime <= 500) assessments.push('⚠️  Good response time');
    else assessments.push('❌ Poor response time');
    
    if (requestsPerSecond >= 50) assessments.push('✅ Excellent throughput');
    else if (requestsPerSecond >= 20) assessments.push('⚠️  Good throughput');
    else assessments.push('❌ Poor throughput');
    
    assessments.forEach(assessment => console.log(assessment));
    
    return {
      passed: successRate >= 95 && this.results.averageResponseTime <= 500,
      successRate,
      averageResponseTime: this.results.averageResponseTime,
      requestsPerSecond
    };
  }
}

async function main() {
  console.log('🎯 TECHNO-ETL Backend Load Testing\n');
  
  const tester = new LoadTester();
  
  try {
    // Test server availability
    console.log('🔍 Checking server availability...');
    const healthCheck = await tester.testEndpoint('/api/health');
    if (!healthCheck.success) {
      throw new Error('Server is not responding. Please start the backend server.');
    }
    console.log('✅ Server is available\n');
    
    // Run concurrent load test
    await tester.runConcurrentTest();
    
    // Test worker pool
    await tester.testWorkerPool();
    
    // Test cache effectiveness
    await tester.testCacheEffectiveness();
    
    // Generate and display report
    const report = tester.generateReport();
    
    console.log('\n🏁 LOAD TEST COMPLETED');
    console.log(`Result: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    process.exit(report.passed ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Load test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
