/**
 * Health Check Service
 *
 * Provides system health monitoring and API connectivity testing.
 * Essential for ensuring the migration system is ready for operation.
 *
 * @author Magento Migration Tool
 * @version 1.0.0
 */

const express = require('express');
const config = require('../config/app-config');
const magentoClient = require('../utils/magento-client');
const { createOperationLogger } = require('../utils/logger');

const router = express.Router();
const logger = createOperationLogger('health-check');

/**
 * GET /api/health
 * Basic health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: config.app.version,
      environment: config.app.environment,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        api: 'checking',
        magento: 'checking',
        configuration: 'checking'
      }
    };

    // Check API connectivity
    try {
      const isConnected = await magentoClient.testConnection();
      healthStatus.checks.magento = isConnected ? 'healthy' : 'unhealthy';
    } catch (error) {
      healthStatus.checks.magento = 'unhealthy';
      healthStatus.checks.magentoError = error.message;
    }

    // Check configuration
    try {
      validateConfiguration();
      healthStatus.checks.configuration = 'healthy';
    } catch (error) {
      healthStatus.checks.configuration = 'unhealthy';
      healthStatus.checks.configurationError = error.message;
    }

    // Overall status
    const allHealthy = Object.values(healthStatus.checks)
      .filter(check => typeof check === 'string')
      .every(check => check === 'healthy');

    healthStatus.status = allHealthy ? 'healthy' : 'degraded';
    healthStatus.checks.api = 'healthy';

    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json(healthStatus);

  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /api/health/detailed
 * Detailed health check with system information
 */
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        version: config.app.version,
        environment: config.app.environment,
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      configuration: {
        magento: {
          baseUrl: config.magento.baseUrl,
          hasToken: !!config.magento.adminToken,
          timeout: config.magento.timeout,
          retryAttempts: config.magento.retryAttempts
        },
        migration: {
          batchSizes: config.migration.batchSizes,
          rateLimiting: config.migration.rateLimiting
        }
      },
      checks: {}
    };

    // Test Magento API connection
    try {
      const startTime = Date.now();
      const storeConfig = await magentoClient.getStoreConfig();
      const responseTime = Date.now() - startTime;

      detailedHealth.checks.magento = {
        status: 'healthy',
        responseTime,
        storeCount: storeConfig.length,
        message: 'Successfully connected to Magento API'
      };
    } catch (error) {
      detailedHealth.checks.magento = {
        status: 'unhealthy',
        error: error.message,
        message: 'Failed to connect to Magento API'
      };
    }

    // Check file system permissions
    try {
      const fs = require('fs');
      const path = require('path');

      const testPaths = [
        config.paths.logs,
        config.paths.data,
        config.paths.uploads
      ];

      for (const testPath of testPaths) {
        const fullPath = path.resolve(testPath);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
        fs.accessSync(fullPath, fs.constants.R_OK | fs.constants.W_OK);
      }

      detailedHealth.checks.filesystem = {
        status: 'healthy',
        message: 'All required directories are accessible'
      };
    } catch (error) {
      detailedHealth.checks.filesystem = {
        status: 'unhealthy',
        error: error.message,
        message: 'File system access issues detected'
      };
    }

    // Overall status
    const allHealthy = Object.values(detailedHealth.checks)
      .every(check => check.status === 'healthy');

    detailedHealth.status = allHealthy ? 'healthy' : 'degraded';

    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json(detailedHealth);

  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Validate system configuration
 */
function validateConfiguration() {
  const errors = [];

  // Check required Magento settings
  if (!config.magento.baseUrl || config.magento.baseUrl === 'https://your-magento-store.com') {
    errors.push('Magento base URL not configured');
  }

  if (!config.magento.adminToken) {
    errors.push('Magento admin token not configured');
  }

  // Check batch sizes
  Object.entries(config.migration.batchSizes).forEach(([key, value]) => {
    if (value <= 0 || value > 100) {
      errors.push(`Invalid batch size for ${key}: ${value}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`);
  }
}

module.exports = router;