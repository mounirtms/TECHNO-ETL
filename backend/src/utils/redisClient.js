/**
 * redisClient.js
 *
 * Manages a singleton Redis client connection for the application.
 * This prevents creating multiple connections and ensures proper handling.
 */
import Redis from 'ioredis';
import { logger } from './logger.js';

let redisClient;

function createClient() {
    if (!process.env.REDIS_URL) {
        logger.warn('[Redis Client] REDIS_URL not set. Cannot create client for cache invalidation.');
        return null;
    }
    
    const client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 5,
        enableReadyCheck: true,
        showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
        reconnectOnError: (err) => {
            logger.warn('Reconnecting on Redis error', { error: err.message });
            return true;
        },
        retryStrategy: (times) => Math.min(times * 100, 5000),
        maxLoadingRetryTime: 30000
    });

    client.on('error', (err) => {
        logger.error('[Redis Client] Connection Error', { error: err.message });
    });

    client.on('connect', () => {
        logger.info('[Redis Client] Connected to Redis.');
    });
    
    return client;
}

export function getRedisClient() {
    if (!redisClient) {
        redisClient = createClient();
    }
    return redisClient;
}

export async function quitRedisClient() {
    if (redisClient) {
        logger.info('[Redis Client] Closing Redis connection.');
        try {
            await redisClient.quit();
        } catch (err) {
            logger.error('[Redis Client] Error during shutdown', { error: err.message });
        }
        redisClient = null;
    }
}