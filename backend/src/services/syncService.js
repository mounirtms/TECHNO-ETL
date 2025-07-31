/**
 * syncService.js
 *
 * Handles all business logic related to data synchronization between MDM and Magento.
 * This includes inventory, prices, and success flag management.
 */
import sql from 'mssql';
import pLimit from 'p-limit';
import { getPool } from '../utils/database.js';
import { logger } from '../utils/logger.js';
import { SQL_QUERIES } from '../constants/sqlQueries.js';
import * as sourcesModule from '../config/sources.js'
import { syncInventoryToMagento, syncPricesToMagento } from '../mdm/services.js';

const getSQLQuery = (queryKey) => {
    const query = SQL_QUERIES[queryKey];
    if (!query) {
        throw new Error(`SQL query not found for key: ${queryKey}`);
    }
    return query;
};

/**
 * Marks products as 'changed' by merging from the source of truth table.
 * @param {string} [sourceCode] - The optional source code to update.
 */
export async function syncStocks(sourceCode) {
    const logIdentifier = sourceCode ? `source: ${sourceCode}` : 'all sources';
    try {
        const mergeQuery = getSQLQuery('SYNC_STOCK');
        const pool = getPool('mdm');
        const stockSync = await pool.request()
            .input('sourceCode', sql.NVarChar, sourceCode || null)
            .query(mergeQuery);
        logger.sync('stock changes', logIdentifier, 'success');
        return stockSync
    } catch (error) {
        logger.sync('stock changes', logIdentifier, 'error', { error: error.message });
        throw error;
    }
}

/**
 * Updates the sync status (changed=0, syncedDate) after a successful sync.
 * @param {string} [sourceCode] - The optional source code to update.
 */
export async function syncSuccess(sourceCode) {
    const logIdentifier = sourceCode ? `source: ${sourceCode}` : 'all sources';
    try {
        const resetQuery = getSQLQuery('SYNC_SUCCESS');
        const pool = getPool('mdm');
        await pool.request()
            .input('sourceCode', sql.NVarChar, sourceCode || null)
            .query(resetQuery);
        logger.sync('success flags', logIdentifier, 'success');
    } catch (error) {
        logger.sync('success flags', logIdentifier, 'error', { error: error.message });
        throw error;
    }
}

/**
 * Fetches MDM prices from the database.
 */
export async function fetchMdmPrices() {
    try {
        const sqlQuery = getSQLQuery('PRICES');
        const pool = getPool('mdm');
        const result = await pool.request().query(sqlQuery);
        logger.database('fetch', 'MDM prices', { records: result.recordset.length });
        return result;
    } catch (error) {
        logger.error('Error fetching MDM prices', { error: error.message });
        throw error;
    }
}

/**
 * Syncs all sources concurrently to Magento.
 */
async function syncSources() {
    const limit = pLimit(3); // Limit to 3 concurrent syncs
    try {
        const allSources = typeof sourcesModule.getAllSources === 'function' ? sourcesModule.getAllSources() : [];
        const syncPromises = allSources.map(source => {
            return limit(async () => {
                logger.info(`🔄 [Concurrent] Syncing inventory for source: ${source.magentoSource}`);
                await syncInventoryToMagento({
                    query: {
                        changed: 1,
                        page: 0,
                        pageSize: 300,
                        sortField: 'QteStock',
                        sortOrder: 'desc',
                        sourceCode: source.code_source
                    }
                });
                logger.info(`✅ [Concurrent] Finished syncing for ${source.magentoSource}`);
            });
        });
        await Promise.all(syncPromises);
        logger.info('✅ All sources have been synced concurrently.');
    } catch (error) {
        logger.error('❌ Error syncing all sources:', { error: error.message });
    }
}

/**
 * Orchestrates the full inventory sync process.
 */
export async function inventorySync() {
    logger.info('Starting full inventory sync process...');
    await syncStocks();
    await syncSources();
    await syncSuccess();
    logger.info('Full inventory sync process completed.');
}

/**
 * Orchestrates the full price sync process.
 */
export async function syncPrices() {
    logger.info("🚀 Starting price sync process...");
    try {
        const prices = await fetchMdmPrices();
        logger.info(`📊 Fetched ${prices.recordset.length} price records from MDM`);

        const priceData = prices.recordset.map(({ sku, price }) => ({
            sku: sku,
            price: parseFloat(price)
        }));

        await syncPricesToMagento({ body: priceData });
        logger.info("✅ Price sync completed successfully");
    } catch (error) {
        logger.error("❌ Error in syncPrices:", { error: error.message });
        throw error;
    }
}