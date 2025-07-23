/**
 * cacheService.js
 *
 * Provides a centralized caching service backed by Redis.
 * Uses 'keyv' for a simple and consistent API.
 * This service is safe for use in a clustered environment.
 */
import Keyv from 'keyv';
import { logger } from '../utils/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

if (!process.env.REDIS_URL) {
  logger.warn('REDIS_URL not found in .env, falling back to in-memory cache. This is not recommended for production clusters.');
}

const cache = new Keyv(REDIS_URL, {
  namespace: 'techno-etl',
  ttl: CACHE_TTL,
});

cache.on('error', err => {
  logger.error('Keyv Connection Error', { error: err.message });
});

export const getFromCache = (key) => cache.get(key);

export const setInCache = (key, value, ttl = CACHE_TTL) => cache.set(key, value, ttl);

export const deleteFromCache = (key) => cache.delete(key);

export const clearCacheNamespace = (namespace) => {
  const nsCache = new Keyv(REDIS_URL, { namespace });
  return nsCache.clear();
};