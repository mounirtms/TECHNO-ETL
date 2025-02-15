const express = require('express');
const router = express.Router();
const mdmServices = require('./services');

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

module.exports = router;
