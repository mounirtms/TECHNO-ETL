/**
 * Super Simple Test Server
 * No imports, just basic Express server to test MDM endpoints
 */

const express = require('express');
const app = express();
const PORT = 3001;

// Basic middleware
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Test route
app.get('/test', (req, res) => {
    console.log('✅ Test route accessed');
    res.json({ 
        message: 'Simple server is working', 
        timestamp: new Date().toISOString() 
    });
});

// MDM Sync Prices endpoint
app.post('/api/mdm/sync/prices', async (req, res) => {
    try {
        console.log('🔄 Price sync request received');
        
        const startTime = Date.now();
        
        // Simulate processing time
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

// MDM Sync Inventory endpoint
app.post('/api/mdm/sync/inventory', async (req, res) => {
    try {
        console.log('🔄 Inventory sync request received');
        
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const result = {
            success: true,
            message: 'Inventory synchronization completed successfully',
            itemsSynced: 127,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            details: {
                processed: 127,
                updated: 98,
                created: 29,
                errors: 0
            }
        };
        
        console.log('✅ Inventory sync completed:', result);
        res.json(result);
        
    } catch (error) {
        console.error('❌ Inventory sync error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// MDM Sync Status endpoint
app.get('/api/mdm/sync/status', (req, res) => {
    console.log('📊 Sync status requested');
    res.json({
        status: 'active',
        lastPriceSync: new Date(Date.now() - 300000).toISOString(),
        lastInventorySync: new Date(Date.now() - 600000).toISOString(),
        nextScheduledSync: new Date(Date.now() + 3600000).toISOString(),
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/api/health', (req, res) => {
    console.log('🏥 Health check requested');
    res.json({
        status: 'healthy',
        service: 'techno-etl-backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
    });
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
    console.log('📊 Dashboard stats requested');
    res.json({
        success: true,
        data: {
            orders: { total: 1234, status: 'fulfilled' },
            products: { total: 9234, status: 'fulfilled' },
            customers: { total: 5132, status: 'fulfilled' },
            lastUpdated: new Date().toISOString()
        },
        cached: false,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    console.log('❌ 404 Not Found:', req.method, req.originalUrl);
    res.status(404).json({
        error: 'Not Found',
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TECHNO-ETL Simple Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔄 Price sync: POST http://localhost:${PORT}/api/mdm/sync/prices`);
    console.log(`📦 Inventory sync: POST http://localhost:${PORT}/api/mdm/sync/inventory`);
    console.log(`📈 Dashboard stats: http://localhost:${PORT}/api/dashboard/stats`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
});

module.exports = app;
