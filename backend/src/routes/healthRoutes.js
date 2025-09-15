import express from 'express';
import { getPool } from '../utils/database.js';
import { getRedisClient } from '../utils/redisClient.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Basic health check
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      checks: {},
    };

    // Database health check
    try {
      const pool = getPool('mdm');

      await pool.request().query('SELECT 1');
      health.checks.database = { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      health.checks.database = { status: 'unhealthy', error: error.message };
      health.status = 'degraded';
    }

    // Redis health check
    try {
      const redis = getRedisClient();

      if (redis) {
        await redis.ping();
        health.checks.redis = { status: 'healthy' };
      } else {
        health.checks.redis = { status: 'unavailable' };
      }
    } catch (error) {
      health.checks.redis = { status: 'unhealthy', error: error.message };
      health.status = 'degraded';
    }

    // Memory check
    const memory = process.memoryUsage();
    const memoryUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;

    health.checks.memory = {
      status: memoryUsagePercent > 90 ? 'warning' : 'healthy',
      usage: memory,
      usagePercent: Math.round(memoryUsagePercent),
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Detailed health check with metrics
router.get('/health/detailed', async (req, res) => {
  try {
    const startTime = Date.now();

    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        pid: process.pid,
      },
      checks: {},
      metrics: {
        responseTime: 0,
        activeConnections: 0,
        cacheHitRate: 0,
      },
    };

    // Database detailed check
    try {
      const dbStart = Date.now();
      const pool = getPool('mdm');
      const result = await pool.request().query('SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES');
      const dbResponseTime = Date.now() - dbStart;

      detailedHealth.checks.database = {
        status: 'healthy',
        responseTime: dbResponseTime,
        tableCount: result.recordset[0].count,
        connectionPool: {
          size: pool.size,
          available: pool.available,
          pending: pool.pending,
        },
      };
    } catch (error) {
      detailedHealth.checks.database = {
        status: 'unhealthy',
        error: error.message,
      };
      detailedHealth.status = 'degraded';
    }

    // Redis detailed check
    try {
      const redis = getRedisClient();

      if (redis) {
        const redisStart = Date.now();
        const info = await redis.info('memory');
        const redisResponseTime = Date.now() - redisStart;

        detailedHealth.checks.redis = {
          status: 'healthy',
          responseTime: redisResponseTime,
          memory: info.split('\r\n').find(line => line.startsWith('used_memory_human'))?.split(':')[1],
        };
      }
    } catch (error) {
      detailedHealth.checks.redis = {
        status: 'unhealthy',
        error: error.message,
      };
    }

    detailedHealth.metrics.responseTime = Date.now() - startTime;

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json(detailedHealth);

  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;
