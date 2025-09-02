#!/usr/bin/env node

/**
 * TECHNO-ETL Performance Monitor (Simplified)
 * Basic memory and performance monitoring
 */

import { performance } from 'perf_hooks';

class PerformanceMonitor {
  constructor() {
    this.startTime = performance.now();
    this.metrics = {
      memory: [],
      requests: 0
    };
    
    console.log('🚀 TECHNO-ETL Performance Monitor Started');
    this.startMonitoring();
  }

  startMonitoring() {
    // Monitor memory every 10 seconds
    setInterval(() => {
      this.checkMemoryUsage();
    }, 10000);

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

    // Keep only last 10 measurements
    if (this.metrics.memory.length > 10) {
      this.metrics.memory.shift();
    }

    // Alert on high memory usage
    if (heapUsedMB > 150) {
      console.log(`⚠️  HIGH MEMORY USAGE: ${heapUsedMB}MB heap, ${rssMB}MB RSS`);
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

    console.log('========================\n');
  }
}

// Start monitoring if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  new PerformanceMonitor();
}

export default PerformanceMonitor;