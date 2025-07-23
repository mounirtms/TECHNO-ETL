/**
 * Metrics API Routes
 * Provides endpoints for monitoring and metrics collection
 */
import express from 'express';
import metricsService from '../services/metricsService.js';
import { getFromCache } from '../services/cacheService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/metrics
 * Returns current application metrics
 */
router.get('/', async (req, res) => {
  try {
    const metrics = await metricsService.exportMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Failed to export metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

/**
 * GET /api/metrics/prometheus
 * Returns metrics in Prometheus format
 */
router.get('/prometheus', async (req, res) => {
  try {
    const stats = metricsService.getStatistics();
    
    const prometheusMetrics = `
# HELP techno_etl_requests_total Total number of HTTP requests
# TYPE techno_etl_requests_total counter
techno_etl_requests_total ${stats.requests.total}

# HELP techno_etl_requests_success_total Total number of successful HTTP requests
# TYPE techno_etl_requests_success_total counter
techno_etl_requests_success_total ${stats.requests.success}

# HELP techno_etl_requests_errors_total Total number of failed HTTP requests
# TYPE techno_etl_requests_errors_total counter
techno_etl_requests_errors_total ${stats.requests.errors}

# HELP techno_etl_request_duration_seconds HTTP request duration in seconds
# TYPE techno_etl_request_duration_seconds histogram
techno_etl_request_duration_seconds_avg ${(stats.requests.avgResponseTime / 1000).toFixed(3)}
techno_etl_request_duration_seconds_p95 ${(stats.requests.p95ResponseTime / 1000).toFixed(3)}

# HELP techno_etl_cache_hits_total Total number of cache hits
# TYPE techno_etl_cache_hits_total counter
techno_etl_cache_hits_total ${stats.cache.hits}

# HELP techno_etl_cache_misses_total Total number of cache misses
# TYPE techno_etl_cache_misses_total counter
techno_etl_cache_misses_total ${stats.cache.misses}

# HELP techno_etl_cache_hit_rate Cache hit rate ratio
# TYPE techno_etl_cache_hit_rate gauge
techno_etl_cache_hit_rate ${stats.cache.hitRate.toFixed(3)}

# HELP techno_etl_database_queries_total Total number of database queries
# TYPE techno_etl_database_queries_total counter
techno_etl_database_queries_total ${stats.database.queries}

# HELP techno_etl_database_errors_total Total number of database errors
# TYPE techno_etl_database_errors_total counter
techno_etl_database_errors_total ${stats.database.errors}

# HELP techno_etl_sync_jobs_total Total number of sync jobs
# TYPE techno_etl_sync_jobs_total counter
techno_etl_sync_jobs_total ${stats.sync.jobs}

# HELP techno_etl_sync_success_total Total number of successful sync jobs
# TYPE techno_etl_sync_success_total counter
techno_etl_sync_success_total ${stats.sync.success}

# HELP techno_etl_sync_failures_total Total number of failed sync jobs
# TYPE techno_etl_sync_failures_total counter
techno_etl_sync_failures_total ${stats.sync.failures}

# HELP techno_etl_uptime_seconds Application uptime in seconds
# TYPE techno_etl_uptime_seconds gauge
techno_etl_uptime_seconds ${(stats.uptime / 1000).toFixed(0)}
`.trim();

    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(prometheusMetrics);
  } catch (error) {
    logger.error('Failed to export Prometheus metrics', { error: error.message });
    res.status(500).send('# Failed to export metrics');
  }
});

/**
 * GET /api/metrics/cache
 * Returns cache-specific metrics
 */
router.get('/cache', async (req, res) => {
  try {
    const stats = metricsService.getStatistics();
    
    // Get additional cache info from Redis
    const cacheInfo = {
      ...stats.cache,
      lastSync: await getFromCache('cron:last_run'),
      activeKeys: await getFromCache('cache:key_count') || 0
    };
    
    res.json(cacheInfo);
  } catch (error) {
    logger.error('Failed to get cache metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve cache metrics' });
  }
});

/**
 * GET /api/metrics/performance
 * Returns performance-specific metrics
 */
router.get('/performance', async (req, res) => {
  try {
    const stats = metricsService.getStatistics();
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();
    
    const performance = {
      requests: {
        rate: stats.requests.rate,
        errorRate: stats.requests.errorRate,
        avgResponseTime: stats.requests.avgResponseTime,
        p95ResponseTime: stats.requests.p95ResponseTime
      },
      database: {
        avgResponseTime: stats.database.avgResponseTime,
        p95ResponseTime: stats.database.p95ResponseTime,
        errorRate: stats.database.errorRate
      },
      system: {
        memory: {
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
          external: Math.round(memory.external / 1024 / 1024),
          usagePercent: Math.round((memory.heapUsed / memory.heapTotal) * 100)
        },
        cpu: {
          user: cpu.user,
          system: cpu.system
        },
        uptime: process.uptime()
      }
    };
    
    res.json(performance);
  } catch (error) {
    logger.error('Failed to get performance metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve performance metrics' });
  }
});

/**
 * GET /api/metrics/sync
 * Returns sync job metrics
 */
router.get('/sync', async (req, res) => {
  try {
    const stats = metricsService.getStatistics();
    const lastRun = await getFromCache('cron:last_run');
    
    const syncMetrics = {
      ...stats.sync,
      lastRun,
      nextRun: lastRun ? new Date(new Date(lastRun.timestamp).getTime() + 24 * 60 * 60 * 1000) : null
    };
    
    res.json(syncMetrics);
  } catch (error) {
    logger.error('Failed to get sync metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve sync metrics' });
  }
});

/**
 * POST /api/metrics/reset
 * Resets current metrics (admin only)
 */
router.post('/reset', (req, res) => {
  try {
    // In production, add authentication/authorization here
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Metrics reset not allowed in production' });
    }
    
    metricsService.resetMetrics();
    logger.info('Metrics manually reset');
    
    res.json({ message: 'Metrics reset successfully' });
  } catch (error) {
    logger.error('Failed to reset metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to reset metrics' });
  }
});

export default router;
