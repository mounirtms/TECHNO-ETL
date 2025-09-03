
/**
 * Performance Monitoring Dashboard
 * Real-time performance metrics and alerts
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: { total: 0, successful: 0, failed: 0 },
      memory: { current: 0, peak: 0, gcCount: 0 },
      responseTime: { total: 0, average: 0, min: Infinity, max: 0 },
      errors: new Map(),
    };

    this.startTime = Date.now();
    this.lastReport = Date.now();

    // Start monitoring
    this.startReporting();
  }

  trackRequest(responseTime, success = true) {
    this.metrics.requests.total++;
    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Track response times
    this.metrics.responseTime.total += responseTime;
    this.metrics.responseTime.average = this.metrics.responseTime.total / this.metrics.requests.total;
    this.metrics.responseTime.min = Math.min(this.metrics.responseTime.min, responseTime);
    this.metrics.responseTime.max = Math.max(this.metrics.responseTime.max, responseTime);
  }

  trackError(error, endpoint) {
    const key = `${endpoint}:${error.message}`;
    const count = this.metrics.errors.get(key) || 0;

    this.metrics.errors.set(key, count + 1);
  }

  updateMemoryMetrics() {
    const usage = process.memoryUsage();
    const currentMB = Math.round(usage.heapUsed / 1024 / 1024);

    this.metrics.memory.current = currentMB;
    if (currentMB > this.metrics.memory.peak) {
      this.metrics.memory.peak = currentMB;
    }
  }

  generateReport() {
    this.updateMemoryMetrics();

    const uptime = Date.now() - this.startTime;
    const uptimeHours = Math.round(uptime / (1000 * 60 * 60) * 100) / 100;

    const errorRate = this.metrics.requests.total > 0
      ? Math.round((this.metrics.requests.failed / this.metrics.requests.total) * 100 * 100) / 100
      : 0;

    return {
      uptime: `${uptimeHours} hours`,
      requests: {
        total: this.metrics.requests.total,
        successful: this.metrics.requests.successful,
        failed: this.metrics.requests.failed,
        errorRate: `${errorRate}%`,
      },
      memory: {
        current: `${this.metrics.memory.current}MB`,
        peak: `${this.metrics.memory.peak}MB`,
      },
      performance: {
        avgResponseTime: `${Math.round(this.metrics.responseTime.average)}ms`,
        minResponseTime: `${this.metrics.responseTime.min}ms`,
        maxResponseTime: `${this.metrics.responseTime.max}ms`,
      },
      topErrors: Array.from(this.metrics.errors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([error, count]) => ({ error, count })),
    };
  }

  startReporting() {
    setInterval(() => {
      const report = this.generateReport();

      console.log('📈 Performance Report:', JSON.stringify(report, null, 2));
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  getHealthStatus() {
    const report = this.generateReport();
    const errorRate = parseFloat(report.requests.errorRate);
    const memoryMB = this.metrics.memory.current;
    const avgResponseTime = this.metrics.responseTime.average;

    let status = 'healthy';
    const issues = [];

    if (errorRate > 10) {
      status = 'degraded';
      issues.push(`High error rate: ${errorRate}%`);
    }

    if (memoryMB > 200) {
      status = 'degraded';
      issues.push(`High memory usage: ${memoryMB}MB`);
    }

    if (avgResponseTime > 5000) {
      status = 'degraded';
      issues.push(`Slow response time: ${Math.round(avgResponseTime)}ms`);
    }

    return {
      status,
      issues,
      metrics: report,
      timestamp: new Date().toISOString(),
    };
  }
}

// Global performance monitor
export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
