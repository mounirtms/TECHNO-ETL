/**
 * workerPool.js
 *
 * Initializes and exports a singleton worker pool for CPU-intensive tasks.
 * This prevents the overhead of spawning new processes for each request.
 */
import { Worker } from 'jest-worker';
import os from 'os';
import { fileURLToPath } from 'url';
import { URL } from 'url';
import { logger } from '../utils/logger.js';

const numWorkers = Math.max(1, os.cpus().length - 2); // Leave cores for main app and DB
const workerPath = fileURLToPath(new URL('../workers/imageProcessor.js', import.meta.url));

logger.info(`Initializing worker pool`, {
  numWorkers,
  workerPath,
  availableCPUs: os.cpus().length
});

let workerPool;

try {
  workerPool = new Worker(workerPath, {
    numWorkers,
    enableWorkerThreads: true,
    forkOptions: {
      silent: false,
      execArgv: ['--max-old-space-size=512'] // Limit worker memory
    }
  });

  // Handle worker errors
  workerPool.on('error', (error) => {
    logger.error('Worker pool error', {
      error: error.message,
      stack: error.stack
    });
  });

  logger.info('Worker pool initialized successfully', {
    numWorkers,
    status: 'ready'
  });

} catch (error) {
  logger.error('Failed to initialize worker pool', {
    error: error.message,
    workerPath
  });

  // Fallback: create a mock worker pool for development
  workerPool = {
    resizeImage: async (imageBuffer, options = {}) => {
      logger.warn('Using fallback image processing (worker pool unavailable)');
      await new Promise(resolve => setTimeout(resolve, 500));
      return Buffer.from('fallback-processed-image');
    },
    batchResizeImages: async (imageBuffers, options = {}) => {
      logger.warn('Using fallback batch processing (worker pool unavailable)');
      return imageBuffers.map(() => Buffer.from('fallback-processed-image'));
    },
    optimizeForWeb: async (imageBuffer, options = {}) => {
      logger.warn('Using fallback web optimization (worker pool unavailable)');
      return Buffer.from('fallback-optimized-image');
    },
    generateThumbnail: async (imageBuffer, options = {}) => {
      logger.warn('Using fallback thumbnail generation (worker pool unavailable)');
      return Buffer.from('fallback-thumbnail');
    },
    convertFormat: async (imageBuffer, options = {}) => {
      logger.warn('Using fallback format conversion (worker pool unavailable)');
      return Buffer.from('fallback-converted-image');
    },
    end: () => {
      logger.info('Fallback worker pool ended');
    }
  };
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down worker pool...');
  if (workerPool && typeof workerPool.end === 'function') {
    await workerPool.end();
  }
});

process.on('SIGINT', async () => {
  logger.info('Shutting down worker pool...');
  if (workerPool && typeof workerPool.end === 'function') {
    await workerPool.end();
  }
});

export default workerPool;