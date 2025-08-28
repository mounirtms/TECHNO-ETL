#!/usr/bin/env node

/**
 * TECHNO-ETL Performance Monitor
 * Monitors memory usage, response times, and provides optimization suggestions
 */

import { performance } from 'perf_hooks';
import { execSync } from 'child_process';

class PerformanceMonitor {
  constructor() {
    this.startTime = performance.now();
    this.metrics = {
      memory: [],
      responseTime: [],
      requests: 0
    };
    
    console.log('🚀 TECHNO-ETL Performance Monitor Started');
    this.startMonitoring();
  }

  startMonitoring() {
    // Monitor memory every 5 seconds
    setInterval(() => {
      this.checkMemoryUsage();
    }, 5000);

    // Monitor system performance every 30 seconds
    setInterval(() => {
      this.checkSystemPerformance();
    }, 30000);

    // Show summary every 2 minutes
    setInterval(() => {
      this.showSummary();
    }, 120000);
  }

  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);

    this.metrics.memory.push({
      timestamp: Date.now(),
      heapUsed: heapUsedMB,
      heapTotal: heapTotalMB,
      rss: rssMB
    });

    // Keep only last 20 measurements
    if (this.metrics.memory.length > 20) {
      this.metrics.memory.shift();
    }

    // Alert on high memory usage
    if (heapUsedMB > 150) {
      console.log(`⚠️  HIGH MEMORY USAGE: ${heapUsedMB}MB heap, ${rssMB}MB RSS`);
      this.suggestOptimizations();
    } else if (heapUsedMB > 100) {
      console.log(`🟡 Memory usage: ${heapUsedMB}MB heap, ${rssMB}MB RSS`);
    }
  }

  checkSystemPerformance() {
    try {
      // Check available system memory (Windows)
      const output = execSync('wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value', { encoding: 'utf8' });
      const lines = output.split('\n');
      
      let totalMemory = 0;
      let freeMemory = 0;
      
      lines.forEach(line => {
        if (line.startsWith('TotalVisibleMemorySize=')) {
          totalMemory = parseInt(line.split('=')[1]) * 1024; // Convert KB to bytes
        }
        if (line.startsWith('FreePhysicalMemory=')) {
          freeMemory = parseInt(line.split('=')[1]) * 1024; // Convert KB to bytes
        }
      });

      if (totalMemory && freeMemory) {
        const usedMemoryPercent = ((totalMemory - freeMemory) / totalMemory * 100).toFixed(1);
        console.log(`💻 System Memory: ${usedMemoryPercent}% used`);
        
        if (usedMemoryPercent > 85) {
          console.log('⚠️  SYSTEM MEMORY HIGH - Consider closing other applications');
        }
      }
    } catch (error) {
      // Fallback for non-Windows systems or command errors
      console.log('ℹ️  System memory check not available');
    }
  }

  recordRequest(responseTime) {
    this.metrics.requests++;
    this.metrics.responseTime.push({
      timestamp: Date.now(),
      time: responseTime
    });

    // Keep only last 50 response times
    if (this.metrics.responseTime.length > 50) {
      this.metrics.responseTime.shift();
    }

    // Alert on slow responses
    if (responseTime > 3000) {
      console.log(`🐌 SLOW RESPONSE: ${responseTime}ms - Check backend optimization`);
    }
  }

  showSummary() {
    console.log('\n📊 PERFORMANCE SUMMARY');
    console.log('========================');
    
    const uptime = Math.round((performance.now() - this.startTime) / 1000);
    console.log(`⏱️  Uptime: ${uptime}s`);
    console.log(`📡 Requests: ${this.metrics.requests}`);

    if (this.metrics.memory.length > 0) {
      const latestMemory = this.metrics.memory[this.metrics.memory.length - 1];
      console.log(`💾 Memory: ${latestMemory.heapUsed}MB heap, ${latestMemory.rss}MB RSS`);
    }

    if (this.metrics.responseTime.length > 0) {
      const avgResponseTime = this.metrics.responseTime.reduce((sum, r) => sum + r.time, 0) / this.metrics.responseTime.length;
      console.log(`⚡ Avg Response: ${Math.round(avgResponseTime)}ms`);
    }

    console.log('========================\n');
  }

  suggestOptimizations() {
    console.log('\n🔧 OPTIMIZATION SUGGESTIONS:');
    console.log('- Restart the development server');
    console.log('- Close unused browser tabs');
    console.log('- Check for memory leaks in React components');
    console.log('- Consider using React.memo for heavy components');
    console.log('- Review data fetching patterns\n');
  }
}

// Start monitoring if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  new PerformanceMonitor();
}

export default PerformanceMonitor;