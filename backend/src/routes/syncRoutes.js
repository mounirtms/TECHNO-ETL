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

export default router;