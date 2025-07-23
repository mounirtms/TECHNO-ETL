/**
 * Minimal Test Server for MDM Endpoints
 * Quick test to verify MDM sync endpoints are working
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Test server is working', timestamp: new Date().toISOString() });
});

// MDM Sync Routes
app.post('/api/mdm/sync/prices', async (req, res) => {
    try {
        console.log('🔄 Price sync request received');

        // Simulate price sync operation
        const startTime = Date.now();

        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = {
            success: true,
            message: 'Price synchronization completed successfully',
            itemsSynced: 53,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            details: {
                processed: 53,
                updated: 45,
                created: 8,
                errors: 0
            }
        };

        console.log('✅ Price sync completed:', result);
        res.json(result);

    } catch (error) {
        console.error('❌ Price sync error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'techno-etl-backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TECHNO-ETL Test Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔄 Price sync: POST http://localhost:${PORT}/api/mdm/sync/prices`);
});
