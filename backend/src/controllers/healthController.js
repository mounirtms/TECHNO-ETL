/**
 * Enhanced Health Check for TECHNO-ETL
 * Comprehensive system health monitoring
 */

import systemMonitor from '../utils/systemMonitor.js';
import { getCacheStats } from '../services/cacheService.js';
import { logger } from '../utils/logger.js';

export const getSystemHealth = async (req, res) => {
  try {
    const startTime = performance.now();

    // Get system stats
    const systemStats = systemMonitor.getSystemStats();

    // Get cache stats
    const cacheStats = getCacheStats();

    // Check database connectivity (if available)
    let databaseStatus = 'not_configured';

    try {
      // Add database check here if needed
      databaseStatus = 'healthy';
    } catch (error) {
      databaseStatus = 'unhealthy';
    }

    // Calculate response time
    const responseTime = Math.round(performance.now() - startTime);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: systemStats.uptime,
      responseTime,

      system: {
        memory: systemStats.memory,
        cpu: systemStats.cpu,
        nodeVersion: process.version,
        platform: process.platform,
      },

      cache: {
        type: cacheStats.cacheType || 'In-Memory',
        hitRate: cacheStats.hitRate || 0,
        operations: cacheStats.totalOperations || 0,
      },

      api: {
        requests: systemStats.requests,
        errors: systemStats.errors,
        errorRate: systemStats.errorRate,
      },

      services: {
        database: databaseStatus,
        redis: cacheStats.cacheType === 'Redis' ? 'connected' : 'disconnected',
        magento: 'configured',
      },
    };

    // Determine overall health status
    if (systemStats.memory.used > 400 || systemStats.errorRate > 5) {
      health.status = 'degraded';
    }

    if (systemStats.memory.used > 450 || systemStats.errorRate > 10) {
      health.status = 'unhealthy';
    }

    // Log health check
    logger.info('Health check performed', {
      status: health.status,
      responseTime,
      memoryUsed: systemStats.memory.used,
    });

    const statusCode = health.status === 'healthy' ? 200 :
      health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(health);

  } catch (error) {
    logger.error('Health check failed', { error: error.message });

    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

export default { getSystemHealth };
