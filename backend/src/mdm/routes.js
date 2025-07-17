import express from 'express';
const router = express.Router();
import { fetchInventoryData } from './services.js';

router.get('/prices', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7; // Default to 7 days
    const updatedPrices = await mdmServices.getUpdatedPrices(days);
    res.json(updatedPrices);
  } catch (error) {
    console.error("Error fetching prices:", error); // Log the error
    res.status(500).json({ error: error.message }); // Send error response
  }
});

// Inventory endpoint for MDMProductsGrid
router.get('/inventory', async (req, res) => {
  try {
    console.log('MDM Inventory API: Received request with params:', req.query);
    const result = await fetchInventoryData(req);
    console.log('MDM Inventory API: Sending response with', result.data?.length || 0, 'items');
    res.json(result);
  } catch (error) {
    console.error("MDM Inventory API: Error fetching inventory:", error);
    res.status(500).json({
      error: error.message,
      data: [],
      totalCount: 0
    });
  }
});

export default router;
