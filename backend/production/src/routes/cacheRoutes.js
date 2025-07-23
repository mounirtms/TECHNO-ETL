import express from 'express';
import { getCacheStats } from '../services/cacheService.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const stats = await getCacheStats();
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
