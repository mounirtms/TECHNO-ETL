/**
 * MDM Routes - Master Data Management API
 * Comprehensive API for price and inventory management
 * Separates Dashboard bulk operations from MDM Grid selective operations
 * Uses real data from MDM database via syncService
 */

import express from 'express';
import { fetchMdmPrices, syncStocks, inventorySync, syncSource, syncSuccess } from '../services/syncService.js';
import { syncPricesToMagento, fetchInventoryData } from '../mdm/services.js';
import { getAllSources } from '../config/sources.js';

const router = express.Router();

// ===== PRICE MANAGEMENT =====

/**
 * GET /api/mdm/prices - Get price data from MDM
 * Used by: Dashboard to display price data in table
 */
router.get('/prices', async (req, res) => {
  try {
    const { sku, category, limit = 100, offset = 0 } = req.query;

    console.log('📊 Getting real price data from MDM database...', { sku, category, limit, offset });
    debugger;
    // Use real data service instead of mock data
    const result = await fetchMdmPrices({ sku, category, limit, offset });

    res.json({
      success: true,
      message: 'Price data retrieved successfully from MDM database',
      data: result.recordset,
    });

  } catch (error) {
    console.error('❌ Error getting price data from MDM database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve price data from MDM database',
      error: error.message,
    });
  }
});

/**
 * POST /api/mdm/sync/prices-to-magento - Sync prices to Magento
 * Used by: Dashboard after treating price data in table
 */
router.post('/sync/prices', async (req, res) => {
  try {

    // Use real syncService instead of mock data
    const result = await syncPricesToMagento(req);

    console.log('✅ Price sync to Magento completed via syncService', result);

    res.json({
      success: true,
      message: 'Prices synced to Magento successfully via syncService',
      data: result,
    });

  } catch (error) {
    console.error('❌ Error syncing prices to Magento via syncService:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync prices to Magento via syncService',
      error: error.message,
    });
  }
});

// ===== INVENTORY MANAGEMENT =====


/**
 * POST /api/mdm/inventory/sync/stocks - Sync stocks for specific source
 * Used by: MDM Grid for selective stock sync per source code
 */
router.post('/sync/stocks', async (req, res) => {
  try {
    const { sourceCode } = req.body;
    const result = await syncStocks(sourceCode);

    console.log(`✅ Stock sync completed for source: ${sourceCode} via syncService`, result);

    res.json({
      success: true,
      message: `Stocks synced successfully for source: ${sourceCode} via syncService`,
      data: result,
    });

  } catch (error) {
    console.error(`❌ Error syncing stocks for source: ${sourceCode} via syncService:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync stocks via syncService',
      error: error.message,
    });
  }
});

/**
 * POST /api/mdm/inventory/sync-all-stocks - Dashboard bulk stock sync
 * Used by: Dashboard for bulk operations (like cron runner)
 */
router.post('/inventory/sync-all-stocks', async (req, res) => {
  try {
    console.log('🔄 Starting comprehensive stock sync using real syncService...');

    const result = await inventorySync();

    console.log('✅ Comprehensive stock sync completed via syncService', result);

    res.json({
      success: true,
      message: 'All stock sources synchronized successfully via MdM Magento ETL syncService',
      data: result,
    });

  } catch (error) {
    console.error('❌ Error in comprehensive stock sync via syncService:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync all stock sources via syncService',
      error: error.message,
    });
  }
});

/**
 * POST /api/mdm/inventory/sync-sources - Sync inventory to Magento
 * Used by: Dashboard and MDM Grid to sync inventory data to Magento
 */
router.post('/sync/source', async (req, res) => {
  try {
    const source = req.body;
    const startTime = Date.now();

    console.log(`🔄 Starting sync for source: ${source.code_source || source.magentoSource}`);

    const response = await syncSource(source.code_source);
    const duration = Date.now() - startTime;

    console.log(`✅ Source ${source.code_source} synced in ${duration}ms`);

    res.json({
      success: true,
      message: `Source ${source.code_source || source.magentoSource} synced successfully`,
      data: response,
      source: source,
      syncTime: duration,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error(`❌ Error syncing source ${req.body?.code_source || 'unknown'}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to sync source ${req.body?.code_source || 'unknown'}`,
      error: error.message,
      source: req.body,
    });
  }
});


router.get('/inventory', async (req, res) => {
  try {
    console.log('�� Getting real inventory sources from MDM database...');
    // Use real data service instead of mock data

    const result = await fetchInventoryData(req);

    res.json({
      success: true,
      message: 'Data sources retrieved successfully from MDM database',
      data: result.data,
    });
    console.log('Data sources retrieved successfully:', result.data);
  } catch (error) {
    console.error('Error getting sources from MDM database:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve data sources from MDM database',
      error: error.message,
    });
  }
});


// ===== SOURCE MANAGEMENT =====

/**
 * GET /api/mdm/sources - Get all available sources
 * Used by: Dashboard to fetch source configurations for sync progress
 */
router.get('/sources', async (req, res) => {
  try {
    console.log('📋 Getting all sources configuration...');
    const sources = getAllSources();

    res.json({
      success: true,
      message: 'Sources retrieved successfully',
      data: sources,
    });

  } catch (error) {
    console.error('❌ Error getting sources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sources',
      error: error.message,
    });
  }
});

/**
 * POST /api/mdm/sync/success - Mark sync as successful
 * Used by: Dashboard after completing sync operations
 */
router.post('/sync/success', async (req, res) => {
  // Prevent multiple responses with a flag
  if (res.headersSent) {
    console.warn('Headers already sent for sync/success endpoint');

    return;
  }

  try {
    const { sourceCode } = req.body;

    await syncSuccess(sourceCode);

    console.log(`✅ Sync success marked for ${sourceCode ? `source: ${sourceCode}` : 'all sources'}`);

    if (!res.headersSent) {
      res.json({
        success: true,
        message: `Sync success marked for ${sourceCode ? `source: ${sourceCode}` : 'all sources'}`,
      });
    }

  } catch (error) {
    console.error('❌ Error marking sync success:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark sync success',
        error: error.message,
      });
    }
  }
});

export default router;
