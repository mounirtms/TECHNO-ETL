/**
 * Monitoring and Analytics Routes
 * Provides endpoints for accessing logs, metrics, and analytics data
 */

import express from 'express';
import productionLogger from '../services/productionLogger.js';
import usageAnalytics from '../services/usageAnalytics.js';
import errorCollector from '../middleware/errorCollector.js';
import workerLogger from '../services/workerLogger.js';
import userActivityTracker from '../middleware/userActivityLogger.js';
import requestResponseLogger from '../middleware/requestResponseLogger.js';

const router = express.Router();

/**
 * GET /api/monitoring/health
 * Comprehensive health check with logging system status
 */
router.get('/health', (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      logging: {
        productionLogger: 'active',
        errorCollector: 'active',
        usageAnalytics: 'active',
        workerLogger: 'active'
      },
      correlationId: req.correlationId
    };

    productionLogger.info('Health check performed', {
      category: 'health_check',
      result: 'healthy',
      correlationId: req.correlationId
    });

    res.json(health);
  } catch (error) {
    productionLogger.error('Health check failed', {
      category: 'health_check',
      error: error.message,
      correlationId: req.correlationId
    });

    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId
    });
  }
});

/**
 * GET /api/monitoring/metrics
 * Get comprehensive system metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        pid: process.pid
      },
      logging: productionLogger.getMetrics(),
      usage: usageAnalytics.getMetrics(),
      errors: errorCollector.getErrorStats(),
      warnings: errorCollector.getWarningStats(),
      workers: workerLogger.getMetrics(),
      requests: requestResponseLogger.getMetrics(),
      correlationId: req.correlationId
    };

    productionLogger.info('Metrics retrieved', {
      category: 'metrics_access',
      correlationId: req.correlationId
    });

    res.json(metrics);
  } catch (error) {
    productionLogger.error('Metrics retrieval failed', {
      category: 'metrics_error',
      error: error.message,
      correlationId: req.correlationId
    });

    res.status(500).json({
      error: 'Failed to retrieve metrics',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/monitoring/analytics/usage
 * Get usage analytics report
 */
router.get('/analytics/usage', (req, res) => {
  try {
    const report = usageAnalytics.generateUsageReport();
    
    productionLogger.info('Usage analytics report generated', {
      category: 'analytics_access',
      reportType: 'usage',
      correlationId: req.correlationId
    });

    res.json(report);
  } catch (error) {
    productionLogger.error('Usage analytics report failed', {
      category: 'analytics_error',
      error: error.message,
      correlationId: req.correlationId
    });

    res.status(500).json({
      error: 'Failed to generate usage report',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/monitoring/analytics/errors
 * Get error analytics
 */
router.get('/analytics/errors', (req, res) => {
  try {
    const errorStats = errorCollector.getErrorStats();
    const warningStats = errorCollector.getWarningStats();
    
    const report = {
      timestamp: new Date().toISOString(),
      errors: errorStats,
      warnings: warningStats,
      summary: {
        totalErrors: errorStats.total,
        totalWarnings: warningStats.total,
        errorRate: errorStats.errorRate,
        topErrorCategories: errorStats.topErrors
      },
      correlationId: req.correlationId
    };

    productionLogger.info('Error analytics report generated', {
      category: 'analytics_access',
      reportType: 'errors',
      correlationId: req.correlationId
    });

    res.json(report);
  } catch (error) {
    productionLogger.error('Error analytics report failed', {
      category: 'analytics_error',
      error: error.message,
      correlationId: req.correlationId
    });

    res.status(500).json({
      error: 'Failed to generate error report',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/monitoring/analytics/performance
 * Get performance analytics
 */
router.get('/analytics/performance', (req, res) => {
  try {
    const requestMetrics = requestResponseLogger.getMetrics();
    const workerMetrics = workerLogger.getMetrics();
    
    const report = {
      timestamp: new Date().toISOString(),
      requests: {
        total: requestMetrics.totalRequests,
        averageResponseTime: requestMetrics.averageResponseTime,
        activeRequests: requestMetrics.activeRequests,
        statusCodes: requestMetrics.statusCodes,
        topEndpoints: Object.entries(requestMetrics.endpoints)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
      },
      workers: {
        activeJobs: workerMetrics.activeJobs.length,
        completedJobs: workerMetrics.metrics.completedJobs,
        failedJobs: workerMetrics.metrics.failedJobs,
        averageExecutionTime: workerMetrics.metrics.averageExecutionTime,
        successRate: workerMetrics.metrics.totalJobs > 0 
          ? (workerMetrics.metrics.completedJobs / workerMetrics.metrics.totalJobs) * 100 
          : 0
      },
      correlationId: req.correlationId
    };

    productionLogger.info('Performance analytics report generated', {
      category: 'analytics_access',
      reportType: 'performance',
      correlationId: req.correlationId
    });

    res.json(report);
  } catch (error) {
    productionLogger.error('Performance analytics report failed', {
      category: 'analytics_error',
      error: error.message,
      correlationId: req.correlationId
    });

    res.status(500).json({
      error: 'Failed to generate performance report',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/monitoring/user-activity/:userId
 * Get user activity patterns
 */
router.get('/user-activity/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const patterns = userActivityTracker.getUserActivityPatterns(userId);
    
    productionLogger.info('User activity patterns retrieved', {
      category: 'user_analytics',
      targetUserId: userId,
      correlationId: req.correlationId
    });

    res.json({
      userId,
      patterns,
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId
    });
  } catch (error) {
    productionLogger.error('User activity retrieval failed', {
      category: 'user_analytics_error',
      error: error.message,
      correlationId: req.correlationId
    });

    res.status(500).json({
      error: 'Failed to retrieve user activity',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/monitoring/workers/status
 * Get worker and background job status
 */
router.get('/workers/status', (req, res) => {
  try {
    const workerMetrics = workerLogger.getMetrics();
    
    productionLogger.info('Worker status retrieved', {
      category: 'worker_monitoring',
      correlationId: req.correlationId
    });

    res.json({
      ...workerMetrics,
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId
    });
  } catch (error) {
    productionLogger.error('Worker status retrieval failed', {
      category: 'worker_monitoring_error',
      error: error.message,
      correlationId: req.correlationId
    });

    res.status(500).json({
      error: 'Failed to retrieve worker status',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/monitoring/logs/recent
 * Get recent log entries (last 100)
 */
router.get('/logs/recent', (req, res) => {
  try {
    const { level = 'info', category, limit = 100 } = req.query;
    
    // This would typically read from log files or a log aggregation service
    // For now, return a placeholder response
    const logs = {
      level,
      category,
      limit: parseInt(limit),
      entries: [], // Would contain actual log entries
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
      message: 'Log aggregation service integration required'
    };

    productionLogger.info('Recent logs retrieved', {
      category: 'log_access',
      level,
      requestedCategory: category,
      limit,
      correlationId: req.correlationId
    });

    res.json(logs);
  } catch (error) {
    productionLogger.error('Log retrieval failed', {
      category: 'log_access_error',
      error: error.message,
      correlationId: req.correlationId
    });

    res.status(500).json({
      error: 'Failed to retrieve logs',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
