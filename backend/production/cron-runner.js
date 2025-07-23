/**
 * cron-runner.js
 *
 * This script is executed by PM2 on a schedule.
 * It runs long-running background tasks like data synchronization.
 */
import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabases } from './src/utils/database-setup.js';
import { syncPrices, inventorySync } from './src/services/syncService.js';
import { logger } from './src/utils/logger.js';

async function main() {
    logger.info('[CRON] Starting scheduled tasks.');
    try {
        await connectToDatabases();

        logger.info('[CRON] Starting price sync...');
        await syncPrices();
        logger.info('[CRON] Price sync finished.');

        logger.info('[CRON] Starting inventory sync...');
        await inventorySync();
        logger.info('[CRON] Inventory sync finished.');

        logger.info('[CRON] All scheduled tasks completed successfully.');
        process.exit(0);
    } catch (error) {
        logger.error('[CRON] A critical error occurred during scheduled tasks.', { error: error.message, stack: error.stack });
        process.exit(1);
    }
}

main();