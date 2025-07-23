import express from 'express';
import { proxyMagentoRequest } from '../controllers/apiController.js';
import mdmRoutes from '../mdm/routes.js';
import syncRoutes from '../routes/syncRoutes.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// MDM routes - these likely contain GET endpoints that can be cached
// Example of applying cache middleware to all GET routes within mdmRoutes
// A more granular approach inside mdm/routes.js is even better.
router.use('/api/mdm', mdmRoutes);

// Sync routes - these are mostly POST/mutation routes
router.use('/api/mdm', syncRoutes);

// Example of a cacheable CEGID route
// router.get('/api/cegid', cacheMiddleware('15m'), apiController.getCegiData);

// Magento proxy routes
// The magentoService handles its own caching internally, so we don't need middleware here.
router.all('/api/magento/*', proxyMagentoRequest);

// Example of a generic /api/products route that could be cached
// router.get('/api/products', cacheMiddleware('10m'), getProductsController);
// router.put('/api/products/:id', invalidateCache('route:/api/products', 'magento:get:products'), updateProductController);

export default router;

 