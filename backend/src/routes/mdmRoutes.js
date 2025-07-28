/**
 * MDM Routes - Master Data Management API
 * Comprehensive API for price and inventory management
 * Separates Dashboard bulk operations from MDM Grid selective operations
 */

import express from 'express';
const router = express.Router();

// ===== PRICE MANAGEMENT =====

/**
 * GET /api/mdm/prices - Get price data from MDM
 * Used by: Dashboard to display price data in table
 */
router.get('/prices', async (req, res) => {
    try {
        const { sku, category, limit = 100, offset = 0 } = req.query;
        console.log('📊 Getting price data from MDM...', { sku, category, limit, offset });

        const mockPriceData = [
            {
                id: 1,
                sku: 'PROD-001',
                name: 'Sample Product 1',
                currentPrice: 29.99,
                newPrice: 32.99,
                currency: 'USD',
                status: 'pending',
                lastUpdated: new Date().toISOString(),
                source: 'MDM'
            },
            {
                id: 2,
                sku: 'PROD-002',
                name: 'Sample Product 2',
                currentPrice: 45.50,
                newPrice: 47.99,
                currency: 'USD',
                status: 'approved',
                lastUpdated: new Date().toISOString(),
                source: 'MDM'
            },
            {
                id: 3,
                sku: 'PROD-003',
                name: 'Sample Product 3',
                currentPrice: 15.75,
                newPrice: 16.99,
                currency: 'USD',
                status: 'rejected',
                lastUpdated: new Date().toISOString(),
                source: 'MDM'
            }
        ];

        res.json({
            success: true,
            message: 'Price data retrieved successfully from MDM',
            data: mockPriceData,
            pagination: {
                total: mockPriceData.length,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('❌ Error getting price data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve price data from MDM',
            error: error.message
        });
    }
});

/**
 * POST /api/mdm/prices/sync-to-magento - Sync prices to Magento
 * Used by: Dashboard after treating price data in table
 */
router.post('/prices/sync-to-magento', async (req, res) => {
    try {
        const { products = [], force = false } = req.body;
        console.log(`🔄 Syncing ${products.length} prices to Magento...`, { force });

        // Simulate Magento API calls
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockResults = {
            synced: products.length || 150,
            failed: Math.floor(Math.random() * 3),
            total: products.length || 152,
            target: 'magento',
            request_items: products.map((product, index) => ({
                sku: product.sku || `PROD-${String(index + 1).padStart(3, '0')}`,
                status: Math.random() > 0.1 ? 'accepted' : 'rejected',
                message: Math.random() > 0.1 ? 'Price updated in Magento' : 'Price validation failed',
                oldPrice: product.currentPrice,
                newPrice: product.newPrice
            }))
        };

        console.log('✅ Price sync to Magento completed', mockResults);

        res.json({
            success: true,
            message: 'Prices synced to Magento successfully',
            data: mockResults
        });

    } catch (error) {
        console.error('❌ Error syncing prices to Magento:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync prices to Magento',
            error: error.message
        });
    }
});

// ===== INVENTORY MANAGEMENT =====

/**
 * GET /api/mdm/inventory/stocks - Get stock data from MDM
 * Used by: Dashboard and MDM Grid to display stock levels
 */
router.get('/inventory/stocks', async (req, res) => {
    try {
        const { sourceCode, sku, limit = 100, offset = 0 } = req.query;
        console.log('📦 Getting stock data from MDM...', { sourceCode, sku, limit, offset });

        const mockStockData = [
            {
                id: 1,
                sku: 'PROD-001',
                name: 'Sample Product 1',
                sourceCode: 'main',
                sourceName: 'Main Warehouse',
                quantity: 150,
                reservedQuantity: 25,
                availableQuantity: 125,
                status: 'in_stock',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 2,
                sku: 'PROD-001',
                name: 'Sample Product 1',
                sourceCode: 'pos',
                sourceName: 'POS Store',
                quantity: 50,
                reservedQuantity: 5,
                availableQuantity: 45,
                status: 'in_stock',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 3,
                sku: 'PROD-002',
                name: 'Sample Product 2',
                sourceCode: 'main',
                sourceName: 'Main Warehouse',
                quantity: 0,
                reservedQuantity: 0,
                availableQuantity: 0,
                status: 'out_of_stock',
                lastUpdated: new Date().toISOString()
            }
        ];

        // Filter by sourceCode if provided
        let filteredData = mockStockData;
        if (sourceCode) {
            filteredData = mockStockData.filter(item => item.sourceCode === sourceCode);
        }

        res.json({
            success: true,
            message: 'Stock data retrieved successfully from MDM',
            data: filteredData,
            pagination: {
                total: filteredData.length,
                limit: parseInt(limit),
                offset: parseInt(offset)
            },
            filters: {
                sourceCode: sourceCode || 'all',
                sku: sku || 'all'
            }
        });

    } catch (error) {
        console.error('❌ Error getting stock data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve stock data from MDM',
            error: error.message
        });
    }
});

/**
 * POST /api/mdm/inventory/sync-stocks - Sync stocks for specific source
 * Used by: MDM Grid for selective stock sync per source code
 */
router.post('/inventory/sync-stocks', async (req, res) => {
    try {
        const { sourceCode, products = [] } = req.body;
        
        if (!sourceCode) {
            return res.status(400).json({
                success: false,
                message: 'sourceCode is required for stock sync'
            });
        }

        console.log(`🔄 Syncing stocks for source: ${sourceCode}`, {
            productCount: products.length
        });

        // Simulate sync operation
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockResults = {
            synced: products.length || 45,
            failed: Math.floor(Math.random() * 2),
            total: products.length || 46,
            sourceCode: sourceCode,
            details: products.map((product, index) => ({
                sku: product.sku || `PROD-${String(index + 1).padStart(3, '0')}`,
                status: Math.random() > 0.05 ? 'synced' : 'failed',
                oldStock: Math.floor(Math.random() * 100),
                newStock: Math.floor(Math.random() * 100),
                sourceCode: sourceCode
            }))
        };

        console.log(`✅ Stock sync completed for source: ${sourceCode}`, mockResults);

        res.json({
            success: true,
            message: `Stocks synced successfully for source: ${sourceCode}`,
            data: mockResults
        });

    } catch (error) {
        console.error('❌ Error syncing stocks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync stocks',
            error: error.message
        });
    }
});

/**
 * POST /api/mdm/inventory/sync-all-stocks - Dashboard bulk stock sync
 * Used by: Dashboard for bulk operations (like cron runner)
 */
router.post('/inventory/sync-all-stocks', async (req, res) => {
    try {
        console.log('🔄 Starting comprehensive stock sync from all sources...');

        // Simulate comprehensive sync operation
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockResults = {
            success: true,
            syncedSources: ['main', 'pos', 'warehouse', 'ecommerce'],
            totalProducts: 1247,
            syncedProducts: 1198,
            failedProducts: 49,
            duration: '2.1s',
            timestamp: new Date().toISOString(),
            details: {
                main: { synced: 450, failed: 12 },
                pos: { synced: 380, failed: 15 },
                warehouse: { synced: 200, failed: 8 },
                ecommerce: { synced: 168, failed: 14 }
            }
        };

        console.log('✅ Comprehensive stock sync completed', mockResults);

        res.json({
            success: true,
            message: 'All stock sources synchronized successfully',
            data: mockResults
        });

    } catch (error) {
        console.error('❌ Error in comprehensive stock sync:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync all stock sources',
            error: error.message
        });
    }
});

/**
 * POST /api/mdm/inventory/sync-sources - Sync inventory to Magento
 * Used by: Dashboard and MDM Grid to sync inventory data to Magento
 */
router.post('/inventory/sync-sources', async (req, res) => {
    try {
        const { sourceCode, target = 'magento' } = req.body;

        console.log(`🔄 Syncing inventory to ${target}`, {
            sourceCode: sourceCode || 'all'
        });

        // Simulate Magento inventory sync
        await new Promise(resolve => setTimeout(resolve, 1800));

        const mockResults = {
            synced: 234,
            failed: 8,
            total: 242,
            target: target,
            sourceCode: sourceCode || 'all',
            operations: [
                {
                    operation: 'stock_update',
                    processed: 180,
                    successful: 175,
                    failed: 5
                },
                {
                    operation: 'source_assignment',
                    processed: 62,
                    successful: 59,
                    failed: 3
                }
            ],
            timestamp: new Date().toISOString()
        };

        console.log(`✅ Inventory sync to ${target} completed`, mockResults);

        res.json({
            success: true,
            message: `Inventory synced to ${target} successfully`,
            data: mockResults
        });

    } catch (error) {
        console.error('❌ Error syncing inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync inventory',
            error: error.message
        });
    }
});

// ===== SOURCE MANAGEMENT =====

/**
 * GET /api/mdm/sources - Get available data sources
 * Used by: Dashboard and MDM Grid to display available sources
 */
router.get('/sources', async (req, res) => {
    try {
        console.log('📋 Getting available data sources...');

        const mockSources = [
            {
                id: 'main',
                code: 'main',
                name: 'Main Warehouse',
                type: 'warehouse',
                status: 'active',
                lastSync: new Date().toISOString(),
                productCount: 1247,
                enabled: true
            },
            {
                id: 'pos',
                code: 'pos',
                name: 'POS Store',
                type: 'retail',
                status: 'active',
                lastSync: new Date().toISOString(),
                productCount: 456,
                enabled: true
            },
            {
                id: 'warehouse',
                code: 'warehouse',
                name: 'Secondary Warehouse',
                type: 'warehouse',
                status: 'active',
                lastSync: new Date().toISOString(),
                productCount: 892,
                enabled: true
            },
            {
                id: 'ecommerce',
                code: 'ecommerce',
                name: 'E-commerce Platform',
                type: 'online',
                status: 'active',
                lastSync: new Date().toISOString(),
                productCount: 1156,
                enabled: true
            }
        ];

        res.json({
            success: true,
            message: 'Data sources retrieved successfully',
            data: mockSources
        });

    } catch (error) {
        console.error('❌ Error getting sources:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve data sources',
            error: error.message
        });
    }
});

/**
 * POST /api/mdm/sources/sync - Sync specific source
 * Used by: MDM Grid for selective source sync
 */
router.post('/sources/sync', async (req, res) => {
    try {
        const { sourceCode, operation = 'full' } = req.body;

        if (!sourceCode) {
            return res.status(400).json({
                success: false,
                message: 'sourceCode is required for source sync'
            });
        }

        console.log(`🔄 Syncing source: ${sourceCode} (${operation})...`);

        // Simulate source sync operation
        await new Promise(resolve => setTimeout(resolve, 1200));

        const mockResults = {
            sourceCode: sourceCode,
            operation: operation,
            synced: 156,
            failed: 4,
            total: 160,
            duration: '1.2s',
            timestamp: new Date().toISOString(),
            details: {
                products_updated: 120,
                stocks_updated: 156,
                prices_updated: 89,
                errors: [
                    'SKU PROD-045: Invalid price format',
                    'SKU PROD-078: Stock quantity negative',
                    'SKU PROD-123: Missing required attributes',
                    'SKU PROD-189: Duplicate entry'
                ]
            }
        };

        console.log(`✅ Source sync completed for: ${sourceCode}`, mockResults);

        res.json({
            success: true,
            message: `Source ${sourceCode} synced successfully`,
            data: mockResults
        });

    } catch (error) {
        console.error('❌ Error syncing source:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync source',
            error: error.message
        });
    }
});

export default router;
