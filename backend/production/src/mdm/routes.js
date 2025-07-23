import express from 'express';
const router = express.Router();
import { fetchInventoryData } from './services.js';
import { logger } from '../utils/logger.js';

// Inventory endpoint for MDMProductsGrid
router.get('/inventory', async (req, res, next) => {
  try {
    logger.info('MDM Inventory API: Received request', { params: req.query });
    const result = await fetchInventoryData(req);
    logger.info('MDM Inventory API: Sending response', { itemCount: result.data?.length || 0 });
    res.json(result);
  } catch (error) {
    logger.error("MDM Inventory API: Error fetching inventory", { error: error.message, stack: error.stack });
    next(error); // Pass the error to the global error handler
  }
});

export default router;
