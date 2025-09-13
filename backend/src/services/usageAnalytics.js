/**
 * Usage Analytics and Monitoring Service
 * Tracks API usage, resource utilization, and generates analytics reports
 */

// Simple console logger for clean development
const logger = {
  info: (message, meta = {}) => console.log(`[INFO] ${message}`, meta),
  warn: (message, meta = {}) => console.warn(`[WARN] ${message}`, meta),
  error: (message, meta = {}) => console.error(`[ERROR] ${message}`, meta),
  debug: (message, meta = {}) => console.log(`[DEBUG] ${message}`, meta),
};

import os from 'os';
import fs from 'fs';

class UsageAnalytics {
  constructor() {
    this.apiMetrics = {
      endpoints: new Map(),
      totalRequests: 0,
      totalResponseTime: 0,
      statusCodes: new Map(),
      userAgents: new Map(),
      ips: new Map(),
      hourlyStats: new Map(),
      dailyStats: new Map(),
    };

    this.resourceMetrics = {
      cpu: [],
      memory: [],
      disk: [],
      network: [],
      database: [],
    };

    this.featureUsage = new Map();
    this.userBehavior = new Map();
    this.capacityMetrics = {
      peakConcurrentUsers: 0,
      peakRequestsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
    };

    this.startResourceMonitoring();
    this.startAnalyticsReporting();
  }

  // Track API endpoint usage
  trackApiUsage(req, res, responseTime) {
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    const timestamp = new Date();
    const hour = timestamp.getHours();
    const day = timestamp.toDateString();

    // Update endpoint metrics
    if (!this.apiMetrics.endpoints.has(endpoint)) {
      this.apiMetrics.endpoints.set(endpoint, {
        count: 0,
        totalResponseTime: 0,
        averageResponseTime: 0,
        statusCodes: new Map(),
        errors: 0,
        lastAccessed: null,
      });
    }

    const endpointMetrics = this.apiMetrics.endpoints.get(endpoint);

    endpointMetrics.count++;
    endpointMetrics.totalResponseTime += responseTime;
    endpointMetrics.averageResponseTime = endpointMetrics.totalResponseTime / endpointMetrics.count;
    endpointMetrics.lastAccessed = timestamp;

    // Track status codes
    const statusCode = res.statusCode;

    if (!endpointMetrics.statusCodes.has(statusCode)) {
      endpointMetrics.statusCodes.set(statusCode, 0);
    }
    endpointMetrics.statusCodes.set(statusCode, endpointMetrics.statusCodes.get(statusCode) + 1);

    if (statusCode >= 400) {
      endpointMetrics.errors++;
    }

    // Update global metrics
    this.apiMetrics.totalRequests++;
    this.apiMetrics.totalResponseTime += responseTime;

    // Track status codes globally
    if (!this.apiMetrics.statusCodes.has(statusCode)) {
      this.apiMetrics.statusCodes.set(statusCode, 0);
    }
    this.apiMetrics.statusCodes.set(statusCode, this.apiMetrics.statusCodes.get(statusCode) + 1);

    // Track user agents
    const userAgent = req.get('User-Agent') || 'Unknown';

    if (!this.apiMetrics.userAgents.has(userAgent)) {
      this.apiMetrics.userAgents.set(userAgent, 0);
    }
    this.apiMetrics.userAgents.set(userAgent, this.apiMetrics.userAgents.get(userAgent) + 1);

    // Track IPs
    const ip = req.ip || req.connection.remoteAddress;

    if (!this.apiMetrics.ips.has(ip)) {
      this.apiMetrics.ips.set(ip, 0);
    }
    this.apiMetrics.ips.set(ip, this.apiMetrics.ips.get(ip) + 1);

    // Track hourly stats
    if (!this.apiMetrics.hourlyStats.has(hour)) {
      this.apiMetrics.hourlyStats.set(hour, 0);
    }
    this.apiMetrics.hourlyStats.set(hour, this.apiMetrics.hourlyStats.get(hour) + 1);

    // Track daily stats
    if (!this.apiMetrics.dailyStats.has(day)) {
      this.apiMetrics.dailyStats.set(day, 0);
    }
    this.apiMetrics.dailyStats.set(day, this.apiMetrics.dailyStats.get(day) + 1);

    // Log usage analytics
    logger.info('API usage tracked', {
      endpoint,
      responseTime,
      statusCode,
      userAgent,
      ip,
      userId: req.user?.id,
      timestamp: timestamp.toISOString(),
    });
  }

  // Track feature usage
  trackFeatureUsage(feature, userId, metadata = {}) {
    const timestamp = new Date();

    if (!this.featureUsage.has(feature)) {
      this.featureUsage.set(feature, {
        totalUsage: 0,
        uniqueUsers: new Set(),
        lastUsed: null,
        metadata: [],
      });
    }

    const featureMetrics = this.featureUsage.get(feature);

    featureMetrics.totalUsage++;
    featureMetrics.uniqueUsers.add(userId);
    featureMetrics.lastUsed = timestamp;
    featureMetrics.metadata.push({
      userId,
      timestamp,
      ...metadata,
    });

    // Keep only last 1000 metadata entries
    if (featureMetrics.metadata.length > 1000) {
      featureMetrics.metadata.shift();
    }

    logger.info('Feature usage tracked', {
      category: 'feature_usage',
      feature,
      userId,
      timestamp: timestamp.toISOString(),
      ...metadata,
    });
  }

  // Track user behavior patterns
  trackUserBehavior(userId, action, context = {}) {
    const timestamp = new Date();

    if (!this.userBehavior.has(userId)) {
      this.userBehavior.set(userId, {
        actions: [],
        sessionCount: 0,
        totalTime: 0,
        lastActivity: null,
        patterns: new Map(),
      });
    }

    const userMetrics = this.userBehavior.get(userId);

    userMetrics.actions.push({
      action,
      timestamp,
      ...context,
    });
    userMetrics.lastActivity = timestamp;

    // Track action patterns
    if (!userMetrics.patterns.has(action)) {
      userMetrics.patterns.set(action, 0);
    }
    userMetrics.patterns.set(action, userMetrics.patterns.get(action) + 1);

    // Keep only last 500 actions per user
    if (userMetrics.actions.length > 500) {
      userMetrics.actions.shift();
    }

    logger.info('User behavior tracked', {
      userId,
      action,
      context,
      timestamp: timestamp.toISOString(),
    });
  }

  // Monitor resource utilization
  startResourceMonitoring() {
    setInterval(() => {
      this.collectResourceMetrics();
    }, 30000); // Every 30 seconds
  }

  // Collect resource metrics
  collectResourceMetrics() {
    const timestamp = new Date().toISOString();

    // CPU metrics
    const cpuUsage = process.cpuUsage();
    const cpuMetrics = {
      user: cpuUsage.user,
      system: cpuUsage.system,
      loadAverage: os.loadavg(),
      timestamp,
    };

    this.resourceMetrics.cpu.push(cpuMetrics);

    // Memory metrics
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memMetrics = {
      process: memUsage,
      system: {
        total: totalMem,
        free: freeMem,
        used: totalMem - freeMem,
        usagePercent: ((totalMem - freeMem) / totalMem) * 100,
      },
      timestamp,
    };

    this.resourceMetrics.memory.push(memMetrics);

    // Network metrics (basic)
    const networkInterfaces = os.networkInterfaces();
    const networkMetrics = {
      interfaces: Object.keys(networkInterfaces).length,
      timestamp,
    };

    this.resourceMetrics.network.push(networkMetrics);

    // Keep only last 100 entries for each metric (reduced from 1000)
    ['cpu', 'memory', 'network'].forEach(metric => {
      if (this.resourceMetrics[metric].length > 100) {
        this.resourceMetrics[metric] = this.resourceMetrics[metric].slice(-50); // Keep only last 50
      }
    });

    // Log resource metrics
    logger.info('Resource utilization tracked', {
      cpu: cpuMetrics,
      memory: memMetrics,
      network: networkMetrics,
    });
  }

  // Generate usage report
  generateUsageReport() {
    const now = new Date();
    const report = {
      generatedAt: now.toISOString(),
      period: {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
        end: now.toISOString(),
      },
      api: this.getApiReport(),
      features: this.getFeatureReport(),
      resources: this.getResourceReport(),
      capacity: this.getCapacityReport(),
      recommendations: this.generateRecommendations(),
    };

    logger.info('Usage report generated', {
      category: 'usage_report',
      report,
    });

    return report;
  }

  // Get API usage report
  getApiReport() {
    const topEndpoints = Array.from(this.apiMetrics.endpoints.entries())
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .map(([endpoint, metrics]) => ({
        endpoint,
        requests: metrics.count,
        averageResponseTime: Math.round(metrics.averageResponseTime),
        errorRate: (metrics.errors / metrics.count) * 100,
      }));

    const statusCodeDistribution = Array.from(this.apiMetrics.statusCodes.entries())
      .map(([code, count]) => ({ statusCode: code, count }));

    return {
      totalRequests: this.apiMetrics.totalRequests,
      averageResponseTime: Math.round(this.apiMetrics.totalResponseTime / this.apiMetrics.totalRequests),
      topEndpoints,
      statusCodeDistribution,
      uniqueIPs: this.apiMetrics.ips.size,
      uniqueUserAgents: this.apiMetrics.userAgents.size,
    };
  }

  // Get feature usage report
  getFeatureReport() {
    const features = Array.from(this.featureUsage.entries())
      .map(([feature, metrics]) => ({
        feature,
        totalUsage: metrics.totalUsage,
        uniqueUsers: metrics.uniqueUsers.size,
        lastUsed: metrics.lastUsed,
      }))
      .sort((a, b) => b.totalUsage - a.totalUsage);

    return { features };
  }

  // Get resource utilization report
  getResourceReport() {
    const recentCpu = this.resourceMetrics.cpu.slice(-100);
    const recentMemory = this.resourceMetrics.memory.slice(-100);

    const avgCpuLoad = recentCpu.length > 0
      ? recentCpu.reduce((sum, metric) => sum + metric.loadAverage[0], 0) / recentCpu.length
      : 0;

    const avgMemoryUsage = recentMemory.length > 0
      ? recentMemory.reduce((sum, metric) => sum + metric.system.usagePercent, 0) / recentMemory.length
      : 0;

    return {
      cpu: {
        averageLoad: avgCpuLoad,
        cores: os.cpus().length,
      },
      memory: {
        averageUsagePercent: avgMemoryUsage,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
      },
    };
  }

  // Get capacity planning report
  getCapacityReport() {
    return {
      peakConcurrentUsers: this.capacityMetrics.peakConcurrentUsers,
      peakRequestsPerSecond: this.capacityMetrics.peakRequestsPerSecond,
      averageResponseTime: this.capacityMetrics.averageResponseTime,
      errorRate: this.capacityMetrics.errorRate,
    };
  }

  // Generate optimization recommendations
  generateRecommendations() {
    const recommendations = [];

    // Check for slow endpoints
    const slowEndpoints = Array.from(this.apiMetrics.endpoints.entries())
      .filter(([, metrics]) => metrics.averageResponseTime > 1000)
      .map(([endpoint]) => endpoint);

    if (slowEndpoints.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `Optimize slow endpoints: ${slowEndpoints.join(', ')}`,
        endpoints: slowEndpoints,
      });
    }

    // Check for high error rates
    const errorEndpoints = Array.from(this.apiMetrics.endpoints.entries())
      .filter(([, metrics]) => (metrics.errors / metrics.count) > 0.05)
      .map(([endpoint]) => endpoint);

    if (errorEndpoints.length > 0) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `Fix high error rate endpoints: ${errorEndpoints.join(', ')}`,
        endpoints: errorEndpoints,
      });
    }

    return recommendations;
  }

  // Start automated reporting
  startAnalyticsReporting() {
    // Generate hourly reports
    setInterval(() => {
      this.generateUsageReport();
    }, 60 * 60 * 1000); // Every hour
  }

  // Get current metrics
  getMetrics() {
    return {
      api: this.apiMetrics,
      resources: this.resourceMetrics,
      features: this.featureUsage,
      userBehavior: this.userBehavior,
      capacity: this.capacityMetrics,
    };
  }
}

// Create singleton instance
const usageAnalytics = new UsageAnalytics();

export default usageAnalytics;
export { UsageAnalytics };
