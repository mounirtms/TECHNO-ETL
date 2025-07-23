/**
 * cacheMiddleware.js
 *
 * Express middleware for automatic response caching.
 * Caches successful GET requests to Redis.
 */
import { URL } from 'url';
import { logger } from '../utils/logger.js';
import { getRedisClient } from '../utils/redisClient.js';
import { getFromCache, setInCache, deleteFromCache } from '../services/cacheService.js';

export const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `route:${req.originalUrl}`;
    const cachedResponse = await getFromCache(key);

    if (cachedResponse) {
      logger.debug('Cache hit', { key, component: 'CacheMiddleware' });
      return res.status(200).json(cachedResponse);
    }

    logger.debug('Cache miss', { key, component: 'CacheMiddleware' });
    const originalJson = res.json;

    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setInCache(key, body, duration);
      }
      return originalJson.call(res, body);
    };

    next();
  };
};

/**
 * A middleware factory that returns a handler to clear cache keys based on provided prefixes.
 * This should be used on mutation routes (POST, PUT, DELETE) to invalidate related GET caches.
 *
 * @param {...string} prefixesToClear - A list of cache key prefixes to invalidate.
 */
export const invalidateCache = (...prefixesToClear) => {
  return async (req, res, next) => {
    // This middleware should run *after* the main route handler has successfully completed.
    // We can hook into the 'finish' event on the response object.
    res.on('finish', async () => {
      // Only invalidate cache on successful mutation requests.
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (prefixesToClear.length > 0) {
          logger.info('[Cache Invalidation] Triggered', { path: req.path, prefixes: prefixesToClear });
          try {
            await clearKeysByPrefix(prefixesToClear);
          } catch (error) {
            logger.error('[Cache Invalidation] Failed to clear cache keys', { error: error.message, prefixes: prefixesToClear });
          }
        }
      }
    });

    next();
  };
};

/**
 * Finds and deletes keys in Redis based on a list of prefixes.
 * 
 * ⚠️ WARNING: This function uses `SCAN` which is safer than `KEYS` but can still
 * impact performance on very large Redis instances. Use with caution in production.
 * For high-performance needs, a strategy using Redis sets to track related keys is recommended.
 *
 * @param {string[]} prefixes - An array of key prefixes to clear.
 */
async function clearKeysByPrefix(prefixes) {
  const redis = getRedisClient();
  if (!redis) {
    logger.warn('[Cache Invalidation] Skipping Redis key clearing because client is not available.');
    return;
  }

  for (const prefix of prefixes) {
    const stream = redis.scanStream({
      match: `techno-etl:${prefix}*`, // keyv adds a namespace, so we match on `namespace:prefix*`
      count: 100,
    });

    stream.on('data', (keys) => {
      if (keys.length) {
        // `keys` is an array of strings, we need to remove the namespace for keyv
        const keysWithoutNamespace = keys.map(k => k.replace(/^techno-etl:/, ''));
        logger.info('[Cache Invalidation] Deleting keys', { keys: keysWithoutNamespace });
        // Use deleteFromCache which uses keyv's delete method
        keysWithoutNamespace.forEach(key => deleteFromCache(key));
      }
    });

    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }
}