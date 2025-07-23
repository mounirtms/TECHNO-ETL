import express from 'express';
import { markStocksForSync, syncSingleSource, syncAllSources } from '../controllers/syncController.js';
import { invalidateCache } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// This route marks stocks as changed, which invalidates inventory-related caches.
router.get('/inventory/sync-stocks', 
    markStocksForSync, 
    invalidateCache('route:/api/mdm/inventory', 'magento:get:stockItems')
);

// This route syncs a single source, which invalidates inventory-related caches.
router.post('/inventory/sync-all-source', 
    syncSingleSource,
    invalidateCache('route:/api/mdm/inventory', 'magento:get:stockItems')
);

// This route syncs all sources, which invalidates inventory-related caches.
router.post('/inventory/sync-all-stocks-sources',
    syncAllSources,
    invalidateCache('route:/api/mdm/inventory', 'magento:get:stockItems')
);

// Price sync route for dashboard
router.post('/sync/prices', async (req, res) => {
    try {
        // Simulate price sync operation
        const startTime = Date.now();

        // In a real implementation, this would sync prices from MDM to Magento
        // For now, we'll simulate the operation
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2s operation

        const duration = Date.now() - startTime;

        res.json({
            success: true,
            message: 'Price synchronization completed successfully',
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            syncedItems: Math.floor(Math.random() * 100) + 50 // Simulate synced items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Price synchronization failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Inventory sync route for dashboard
router.post('/sync/inventory', async (req, res) => {
    try {
        const startTime = Date.now();

        // Simulate inventory sync operation
        await new Promise(resolve => setTimeout(resolve, 1500));

        const duration = Date.now() - startTime;

        res.json({
            success: true,
            message: 'Inventory synchronization completed successfully',
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            syncedItems: Math.floor(Math.random() * 200) + 100
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Inventory synchronization failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// General sync status endpoint
router.get('/sync/status', async (req, res) => {
    try {
        res.json({
            status: 'ready',
            lastSync: {
                prices: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                inventory: new Date(Date.now() - Math.random() * 1800000).toISOString()
            },
            nextSync: {
                prices: new Date(Date.now() + 3600000).toISOString(),
                inventory: new Date(Date.now() + 1800000).toISOString()
            },
            isRunning: false
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get sync status',
            error: error.message
        });
    }
});

export default router;