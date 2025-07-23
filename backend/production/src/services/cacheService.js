/**
 * cacheService.js
 *
 * Provides a centralized caching service with Redis support and in-memory fallback.
 * Automatically detects Redis availability and falls back to in-memory cache.
 * This service is safe for use in a clustered environment.
 */
import { logger } from '../utils/logger.js';
import { getRedisClient } from '../utils/redisClient.js';

const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

// Enhanced cache service with Redis support
class EnhancedCacheService {
  constructor() {
    this.namespace = 'techno-etl';
    this.memoryCache = new Map();
    this.redisClient = null;
    this.useRedis = false;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };

    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      this.redisClient = getRedisClient();
      if (this.redisClient) {
        // Test Redis connection
        await this.redisClient.ping();
        this.useRedis = true;
        logger.info('✅ Redis cache initialized successfully');
      } else {
        logger.warn('⚠️ Redis not available, using in-memory cache');
      }
    } catch (error) {
      logger.warn('⚠️ Redis connection failed, falling back to in-memory cache', { error: error.message });
      this.useRedis = false;
    }
  }

  async get(key) {
    const fullKey = `${this.namespace}:${key}`;

    try {
      if (this.useRedis && this.redisClient) {
        const value = await this.redisClient.get(fullKey);
        if (value !== null) {
          this.stats.hits++;
          return JSON.parse(value);
        }
      } else {
        // In-memory cache fallback
        const item = this.memoryCache.get(fullKey);
        if (item) {
          // Check TTL
          if (item.expires && Date.now() > item.expires) {
            this.memoryCache.delete(fullKey);
            this.stats.misses++;
            return undefined;
          }
          this.stats.hits++;
          return item.value;
        }
      }

      this.stats.misses++;
      return undefined;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache get error', { key, error: error.message });
      return undefined;
    }
  }

  async set(key, value, ttl = CACHE_TTL) {
    const fullKey = `${this.namespace}:${key}`;

    try {
      if (this.useRedis && this.redisClient) {
        const ttlSeconds = Math.floor(ttl / 1000);
        await this.redisClient.setex(fullKey, ttlSeconds, JSON.stringify(value));
      } else {
        // In-memory cache fallback
        const expires = ttl ? Date.now() + ttl : null;
        this.memoryCache.set(fullKey, { value, expires });
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  async delete(key) {
    const fullKey = `${this.namespace}:${key}`;

    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(fullKey);
      } else {
        this.memoryCache.delete(fullKey);
      }

      this.stats.deletes++;
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  async clear() {
    try {
      if (this.useRedis && this.redisClient) {
        const keys = await this.redisClient.keys(`${this.namespace}:*`);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } else {
        this.memoryCache.clear();
      }

      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache clear error', { error: error.message });
      return false;
    }
  }

  getStats() {
    return {
      ...this.stats,
      cacheType: this.useRedis ? 'Redis' : 'In-Memory',
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      totalOperations: this.stats.hits + this.stats.misses + this.stats.sets + this.stats.deletes
    };
  }

  on(event, callback) {
    // No-op for compatibility
  }
}

// Create singleton cache instance
const cache = new EnhancedCacheService();

// Export cache functions
export const getFromCache = (key) => cache.get(key);
export const setInCache = (key, value, ttl = CACHE_TTL) => cache.set(key, value, ttl);
export const deleteFromCache = (key) => cache.delete(key);
export const clearCache = () => cache.clear();
export const getCacheStats = () => cache.getStats();

export const clearCacheNamespace = async (namespace) => {
  try {
    if (cache.useRedis && cache.redisClient) {
      const keys = await cache.redisClient.keys(`${cache.namespace}:${namespace}:*`);
      if (keys.length > 0) {
        await cache.redisClient.del(...keys);
      }
    } else {
      // For in-memory cache, clear all keys with the namespace prefix
      const fullPrefix = `${cache.namespace}:${namespace}:`;
      for (const key of cache.memoryCache.keys()) {
        if (key.startsWith(fullPrefix)) {
          cache.memoryCache.delete(key);
        }
      }
    }
    return true;
  } catch (error) {
    logger.error('Cache namespace clear error', { namespace, error: error.message });
    return false;
  }
};

// Export cache instance for direct access
export default cache;