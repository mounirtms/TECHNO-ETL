/**
 * database-setup.js
 *
 * Centralized function to initialize all database connections.
 */
import { createMdmPool } from './database.js';
import mdmdbConfig from '../config/mdm.js';
import { cloudConfig, getMagentoToken } from '../config/magento.js';
import { logger } from './logger.js';

export async function connectToDatabases() {
    try {
        await createMdmPool(mdmdbConfig);
        // Prefetch Magento token and store in cache for later use
        await getMagentoToken(cloudConfig);
        logger.info('✅ All database connections and tokens initialized successfully.');
    } catch (err) {
        logger.error('❌ Initial database or token connection failed. Server may not function correctly.', { error: err.message });
        throw err; // Re-throw to prevent server from starting in a bad state
    }
}