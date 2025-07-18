import NodeCache from 'node-cache';
import Redis from 'ioredis';

const memoryCache = new NodeCache({ stdTTL: 3600*24, checkperiod: 120 }); // In-memory

class CacheClient {
    /**
     * @param {object} [options]
     * @param {number} [options.ttl] Default TTL in seconds
     * @param {boolean} [options.enableRedis] Enable Redis layer
     * @param {object} [options.redisOptions] Redis config for ioredis
     */
    constructor(options = {}) {
        this.ttl = options.ttl || 3600*15;
        this.useRedis = options.enableRedis || false;
        this.prefix = options.prefix || 'cache';

        if (this.useRedis) {
            this.redis = new Redis(options.redisOptions || {});
            this.redis.on('error', err => {
                console.error('[CacheClient][Redis] Connection Error:', err.message);
            });
        }
    }

    async get(key) {
        const namespacedKey = `${this.prefix}:${key}`;

        // 1. Try memory cache
        const mem = memoryCache.get(namespacedKey);
        if (mem !== undefined) {
            console.log(`[CacheClient] Memory HIT: ${namespacedKey}`);
            return mem;
        }

        // 2. Try Redis if enabled
        if (this.useRedis) {
            const val = await this.redis.get(namespacedKey);
            if (val !== null) {
                try {
                    const parsed = JSON.parse(val);
                    memoryCache.set(namespacedKey, parsed, this.ttl); // rehydrate memory
                    console.log(`[CacheClient] Redis HIT: ${namespacedKey}`);
                    return parsed;
                } catch (e) {
                    return val; // fallback
                }
            }
        }

        console.log(`[CacheClient] MISS: ${namespacedKey}`);
        return null;
    }

    async set(key, value, ttl = this.ttl) {
        const namespacedKey = `${this.prefix}:${key}`;
        memoryCache.set(namespacedKey, value, ttl);

        if (this.useRedis) {
            try {
                const val = JSON.stringify(value);
                await this.redis.set(namespacedKey, val, 'EX', ttl);
            } catch (err) {
                console.warn(`[CacheClient] Redis set failed for ${namespacedKey}`, err);
            }
        }

        console.log(`[CacheClient] SET: ${namespacedKey} (TTL: ${ttl}s)`);
    }

    async del(key) {
        const namespacedKey = `${this.prefix}:${key}`;
        memoryCache.del(namespacedKey);
        if (this.useRedis) {
            await this.redis.del(namespacedKey);
        }
    }

    async flush() {
        memoryCache.flushAll();
        if (this.useRedis) {
            await this.redis.flushdb(); // ⚠️ optional; can be dangerous in shared environments
        }
    }
}

export default CacheClient;
