import { syncStocks, syncSuccess } from '../services/syncService.js';
import { logger } from '../utils/logger.js';

/**
 * Triggers the syncStocks service for a given sourceCode.
 */
export const markStocksForSync = async (req, res, next) => {
    const { sourceCode } = req.query;
    if (!sourceCode) {
        return res.status(400).json({ message: 'sourceCode is required.' });
    }
    try {
        await syncStocks(sourceCode);
        res.status(200).json({ message: `Changed stocks for source ${sourceCode} marked for sync.` });
    } catch (error) {
        logger.error('Error marking changed stocks:', { error: error.message, sourceCode });
        next(error); // Pass error to central handler
    }
};

/**
 * Initiates a background sync for a single source.
 */
export const syncSingleSource = async (req, res, next) => {
    const { sourceCode } = req.body;
    if (!sourceCode) {
        return res.status(400).json({ message: 'sourceCode is required.' });
    }

    // Acknowledge the request immediately.
    res.status(202).json({ message: `Sync process for source ${sourceCode} has been queued. This will run in the background.` });

    // In a real production app, this should add a job to a queue (e.g., BullMQ).
    // Using setImmediate is NOT a robust solution for background jobs.
    setImmediate(async () => {
        try {
            logger.info(`Starting background sync for source: ${sourceCode}`);
            await syncStocks(sourceCode);
            // This function is not defined in the provided context, assuming it exists in syncService
            // await syncInventoryToMagento({ ... }); 
            await syncSuccess(sourceCode);
            logger.info(`✅ Background sync for source ${sourceCode} completed.`);
        } catch (error) {
            logger.error(`❌ Background sync for source ${sourceCode} failed:`, { error: error.message });
        }
    });
};

/**
 * Initiates a background sync for all sources.
 */
export const syncAllSources = (req, res, next) => {
    // Acknowledge the request immediately.
    res.status(202).json({ message: 'Sync process initiated for all sources. This will run in the background.' });

    // This is a placeholder for a proper job queue implementation.
    setImmediate(async () => {
        try {
            const { inventorySync } = await import('../services/syncService.js');
            await inventorySync();
            logger.info('✅ Background inventory sync for all sources completed.');
        } catch (error) {
            logger.error('❌ Background inventory sync for all sources failed:', { error: error.message });
        }
    });
};