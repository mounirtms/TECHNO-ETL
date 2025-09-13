/**
 * Metrics Collection Service
 * Collects and tracks application performance metrics
 */
import { logger } from '../utils/logger.js';
import { getFromCache, setInCache } from './cacheService.js';

class MetricsService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        responseTime: [],
      },
      cache: {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
      },
      database: {
        queries: 0,
        errors: 0,
        responseTime: [],
      },
      sync: {
        jobs: 0,
        success: 0,
        failures: 0,
        duration: [],
      },
    };

    this.startTime = Date.now();
    this.resetInterval = 5 * 60 * 1000; // Reset every 5 minutes

    // Auto-reset metrics periodically
    setInterval(() => this.resetMetrics(), this.resetInterval);
  }

  // Request metrics
  recordRequest(method, path, statusCode, responseTime) {
    this.metrics.requests.total++;

    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }

    this.metrics.requests.responseTime.push(responseTime);

    // Keep only last 100 response times
    if (this.metrics.requests.responseTime.length > 100) {
      this.metrics.requests.responseTime.shift();
    }
  }

  // Cache metrics
  recordCacheHit() {
    this.metrics.cache.hits++;
  }

  recordCacheMiss() {
    this.metrics.cache.misses++;
  }

  recordCacheSet() {
    this.metrics.cache.sets++;
  }

  recordCacheDelete() {
    this.metrics.cache.deletes++;
  }

  // Database metrics
  recordDatabaseQuery(responseTime, success = true) {
    this.metrics.database.queries++;

    if (!success) {
      this.metrics.database.errors++;
    }

    this.metrics.database.responseTime.push(responseTime);

    // Keep only last 100 response times
    if (this.metrics.database.responseTime.length > 100) {
      this.metrics.database.responseTime.shift();
    }
  }

  // Sync job metrics
  recordSyncJob(duration, success = true) {
    this.metrics.sync.jobs++;

    if (success) {
      this.metrics.sync.success++;
    } else {
      this.metrics.sync.failures++;
    }

    this.metrics.sync.duration.push(duration);

    // Keep only last 50 durations
    if (this.metrics.sync.duration.length > 50) {
      this.metrics.sync.duration.shift();
    }
  }

  // Calculate statistics
  getStatistics() {
    const now = Date.now();
    const uptime = now - this.startTime;

    return {
      uptime,
      timestamp: new Date().toISOString(),
      requests: {
        ...this.metrics.requests,
        rate: this.metrics.requests.total / (uptime / 1000), // requests per second
        errorRate: this.metrics.requests.errors / this.metrics.requests.total || 0,
        avgResponseTime: this.calculateAverage(this.metrics.requests.responseTime),
        p95ResponseTime: this.calculatePercentile(this.metrics.requests.responseTime, 95),
      },
      cache: {
        ...this.metrics.cache,
        hitRate: this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses) || 0,
      },
      database: {
        ...this.metrics.database,
        errorRate: this.metrics.database.errors / this.metrics.database.queries || 0,
        avgResponseTime: this.calculateAverage(this.metrics.database.responseTime),
        p95ResponseTime: this.calculatePercentile(this.metrics.database.responseTime, 95),
      },
      sync: {
        ...this.metrics.sync,
        successRate: this.metrics.sync.success / this.metrics.sync.jobs || 0,
        avgDuration: this.calculateAverage(this.metrics.sync.duration),
      },
    };
  }

  // Helper methods
  calculateAverage(array) {
    if (array.length === 0) return 0;

    return array.reduce((sum, val) => sum + val, 0) / array.length;
  }

  calculatePercentile(array, percentile) {
    if (array.length === 0) return 0;
    const sorted = [...array].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;

    return sorted[index] || 0;
  }

  resetMetrics() {
    logger.info('Resetting metrics', this.getStatistics());

    this.metrics = {
      requests: { total: 0, success: 0, errors: 0, responseTime: [] },
      cache: { hits: 0, misses: 0, sets: 0, deletes: 0 },
      database: { queries: 0, errors: 0, responseTime: [] },
      sync: { jobs: 0, success: 0, failures: 0, duration: [] },
    };

    this.startTime = Date.now();
  }

  // Export metrics for external monitoring
  async exportMetrics() {
    const stats = this.getStatistics();

    // Store in cache for external access
    await setInCache('metrics:current', stats, 60000); // 1 minute TTL

    return stats;
  }
}

// Singleton instance
const metricsService = new MetricsService();

export default metricsService;
