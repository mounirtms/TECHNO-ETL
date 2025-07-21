import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import router from './src/utils/routes.js';
import cron from 'node-cron';
import { createMdmPool, createCegidPool, createMdm360Pool, getPool } from './src/utils/database.js';
import sql from 'mssql';
import mdmdbConfig from './src/config/mdm.js';
import jwt from 'jsonwebtoken';
import { fetchInventoryData, syncInventoryToMagento, syncPricesToMagento } from './src/mdm/services.js';
import { proxyMagentoRequest } from './src/controllers/apiController.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { productionConfig } from './production.config.js';
import { logger } from './src/utils/logger.js';

import { cloudConfig, betaConfig, getMagentoToken } from './src/config/magento.js';
import * as sourcesModule from './src/config/sources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Use production CORS configuration
app.use(cors(productionConfig.cors));

// Add security headers
app.use(helmet(productionConfig.security.helmet));

// Add compression
app.use(compression(productionConfig.compression));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add user-agent middleware for Magento compatibility
app.use((req, res, next) => {
    // Set a proper user-agent for Techno ETL system
    req.headers['user-agent'] = req.headers['user-agent'] || productionConfig.magento.userAgent;

    // Add additional headers for Magento API compatibility
    if (req.path.includes('/api/magento')) {
        Object.assign(req.headers, productionConfig.magento.headers);
    }

    // Add CORS headers for all requests
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', productionConfig.cors.allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', 'true');

    next();
});
app.use(router);

// =========================
// 1. Helper Functions
// =========================

/**
 * Reads a SQL query from a file.
 * @param {string} filePath - Path to the SQL file.
 * @returns {string} The SQL query as a string.
 */
const readSQLQuery = (filePath) => {
    return fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
};

/**
 * Delays execution for a given number of milliseconds.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>}
 */function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Express middleware to authenticate JWT tokens (currently bypassed).
 */
function authenticateToken(req, res, next) {
    next()
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

// =========================
// 2. Service Functions (Business Logic)
// =========================

/**
 * Marks products as 'changed' by merging from the source of truth table.
 * This can be scoped to a specific source or run for all sources.
 * @param {string} [sourceCode] - The optional source code to update. If not provided, all sources are processed.
 */
async function syncStocks(sourceCode) {
    const logIdentifier = sourceCode ? `source: ${sourceCode}` : 'all sources';
    try {
        const mergeQuery = readSQLQuery('./queries/sync-stock.sql');
        const pool = getPool('mdm');

        // Execute the merge query. If sourceCode is null/undefined, it will be passed as NULL,
        // which the SQL query is designed to handle.
        await pool.request()
            .input('sourceCode', sql.NVarChar, sourceCode || null)
            .query(mergeQuery);

        logger.sync('stock changes', logIdentifier, 'success');
    } catch (error) {
        logger.sync('stock changes', logIdentifier, 'error', { error: error.message });
        // Re-throw the error so the calling process (like a BullMQ worker) can handle it
        throw error;
    }
}


/**
 * Updates the sync status (changed=0, syncedDate) after a successful sync.
 * This can be scoped to a specific source or run for all sources.
 * @param {string} [sourceCode] - The optional source code to update. If not provided, all sources are processed.
 */
async function syncSuccess(sourceCode) {
    const logIdentifier = sourceCode ? `source: ${sourceCode}` : 'all sources';
    try {
        const resetQuery = readSQLQuery('./queries/sync-success.sql');
        const pool = getPool('mdm');

        // Execute the reset query. If sourceCode is null/undefined, it will be passed as NULL.
        await pool.request()
            .input('sourceCode', sql.NVarChar, sourceCode || null)
            .query(resetQuery);

        logger.sync('success flags', logIdentifier, 'success');
    } catch (error) {
        logger.sync('success flags', logIdentifier, 'error', { error: error.message });
        // Re-throw for the caller to handle
        throw error;
    }
}

/**
 * Syncs inventory to Magento for all sources, one by one.
 */
async function syncSource(source) {
    try {
        await syncStocks(source);
        await syncSuccess(source);
        await syncInventoryToMagento({
            query: {
                changed: 1,
                page: 0,
                pageSize: 300,
                sortField: 'QteStock',
                sortOrder: 'desc',
                sourceCode: source
            }
        });

        logger.sync('inventory', source, 'success');

    } catch (error) {
        logger.sync('inventory', 'all sources', 'error', { error: error.message });
    }
}


/**
 * Fetches MDM prices from the database, optionally filtered by startDate.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<object>} SQL result
 */
async function fetchMdmPrices(req, res) {
    try {
        // Read the SQL query template
        let sqlQuery = readSQLQuery('./queries/prices.sql');

        // Only modify the query if startDate parameter exists
        if (req?.params?.startDate) {
            const startDate = `CAST('${req.params.startDate}' AS DATE)`;

            // Replace the @d1 declaration in the SQL query
            sqlQuery = sqlQuery.replace(
                /DECLARE @d1 AS DATE\s+SET @d1 = DATEADD\(DAY, -7, CAST\(GETDATE\(\) AS DATE\)\);/,
                `DECLARE @d1 AS DATE\nSET @d1 = ${startDate};`
            );
        }

        const pool = getPool('mdm');
        const result = await pool.request().query(sqlQuery);
        logger.database('fetch', 'MDM prices', { records: result.recordset.length });
        return result;
    } catch (error) {
        logger.error('Error fetching MDM prices', { error: error.message });
        throw error;
    }
}


// =========================
// 3. Route Handlers (API Endpoints)
// =========================

// --- Connection Endpoints ---

/**
 * Connect to MDM database.
 */
app.post('/api/mdm/connect', authenticateToken, async (req, res) => {
    const dbConfig = req.body;
    Object.assign(dbConfig, {
        options: {
            encrypt: false, // Disable encryption
            trustServerCertificate: true, // Trust self-signed certificates
            cryptoCredentialsDetails: {
                minVersion: 'TLSv1.2'
            },
            enableArithAbort: true,
            connectionTimeout: 30000
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    });
    try {
        await createMdmPool(dbConfig); // Call createMdmPool with config
        res.json({ message: 'MDM connection successful' });
    } catch (error) {
        console.error('MDM connection failed:', error);
        res.status(500).json({ error: "MDM Connection failed" })
    }
});

/**
 * Connect to CEGID database.
 */
app.post('/api/cegid/connect', authenticateToken, async (req, res) => {
    const dbConfig = req.body;
    try {
        await createCegidPool(dbConfig) // Pass dbConfig to createCegidPool
        res.json({ message: 'CEGID connection successful' })
    } catch (error) {
        console.error('CEGID connection failed', error);
        res.status(500).json({ error: "CEGID Connection failed" })
    }
});

// --- Inventory & Sync Endpoints ---

/**
 * Endpoint to mark changed stocks for a given source code.
 * Triggers the syncStocks service for the provided sourceCode.
 */
app.get('/api/mdm/inventory/sync-stocks', async (req, res) => {
    const { sourceCode } = req.query;
    if (!sourceCode) {
        return res.status(400).json({ message: 'sourceCode is required.' });
    }
    try {
        await syncStocks(sourceCode);
        res.status(200).json({ message: `Changed stocks for source ${sourceCode} marked for sync.` });
    } catch (error) {
        console.error('Error marking changed stocks:', error);
        res.status(500).json({ error: 'Failed to mark changed stocks.' });
    }
});


// --- Price Endpoints ---

/**
 * Fetch product prices from MDM.
 */
app.get('/api/mdm/sync/prices', async (req, res) => {
    try {
        let result = await fetchMdmPrices(req, res);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



/**
 * Sync prices to Magento (bulk operation).
 */
app.post('/api/techno/prices-sync', async (req, res) => {
    res.status(202).json({ message: 'Price sync started in background.' });
    setImmediate(async () => {
        try {
            await syncPricesToMagento(req);
            console.log('✅ Price sync completed.');
        } catch (error) {
            console.error('❌ Price sync failed:', error);
        }
    });
});

// Connect to all required databases and prefetch Magento token (cached)
async function connectToDatabases() {
    try {
        await createMdmPool(mdmdbConfig); // Call createMdmPool with config
        //await createMdm360Pool(mdm360dbConfig); // Call createMdmPool with config
        //await createCegidPool(cegiddbConfig) // Pass dbConfig to createCegidPool
        // Prefetch Magento token and store in cache for later use
        await getMagentoToken(cloudConfig);
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        port: productionConfig.server.port,
        version: '1.0.0'
    });
});

// Magento API Proxy
app.all('/api/magento/*', proxyMagentoRequest);

app.get('/api/mdm/inventory', async (req, res) => {
    try {

        let data = await fetchInventoryData(req);
        res.json(data);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory data' });
    }
});

app.post('/api/mdm/inventory/sync-all-source', async (req, res) => {
    const { sourceCode } = req.body;

    if (!sourceCode) {
        return res.status(400).json({ message: 'sourceCode is required.' });
    }

    // 1. Immediately respond to the client to avoid HTTP timeouts.
    res.status(202).json({ message: `Sync process initiated for source ${sourceCode}. This will run in the background.` });
    try {
        await syncStocks(sourceCode);
        await syncInventoryToMagento({
            query: {
                changed: 1,
                page: 0,
                pageSize: 300,
                sortField: 'QteStock',
                sortOrder: 'desc',
                sourceCode: sourceCode
            }
        });
        await syncSuccess(sourceCode);
    } catch (error) {

    }
});

app.post('/api/mdm/inventory/sync-all-stocks-sources', async (req, res) => {
    res.status(202).json({ message: 'Sync process initiated for all sources. This will run in the background.' });
    setImmediate(async () => {
        try {
            await inventorySync();
            console.log('✅ Inventory sync completed.');
        } catch (error) {
            console.error('❌ Inventory sync failed:', error);
        }
    });
});



async function syncSources() {
    try {
        const allSources = typeof sourcesModule.getAllSources === 'function' ? sourcesModule.getAllSources() : [];
        for (const source of allSources) {
            console.log(`🔄 Syncing inventory for source: ${source.magentoSource}`);

            await delay(1000); // ✅ Corrected timeout usage
            await syncInventoryToMagento({
                query: {
                    changed: 1,
                    page: 0,
                    pageSize: 300,
                    sortField: 'QteStock',
                    sortOrder: 'desc',
                    sourceCode: source.code_source
                }
            });

            console.log(`✅ Finished syncing for ${source.magentoSource}`);
        }
    } catch (error) {
        console.error('❌ Error syncing all sources:', error);
    }
}



async function syncPrices() {
    try {
        console.log("🚀 Starting price sync process...");

        // Fetch prices from MDM
        // Create mock req/res objects for the function call
        const mockReq = { query: {} };
        const mockRes = { json: () => {}, status: () => ({ json: () => {} }) };

        let prices = await fetchMdmPrices(mockReq, mockRes);
        console.log(`📊 Fetched ${prices.recordset.length} price records from MDM`);

        // Transform the data for Magento - simple format
        let priceData = prices.recordset.map(({ sku, price }) => ({
            sku: sku,
            price: parseFloat(price) // Ensure it's a valid number
        }));

        console.log("📦 Sample price data:", JSON.stringify(priceData.slice(0, 2), null, 2));

        // Sync to Magento
        await syncPricesToMagento({ body: priceData });
        console.log("✅ Price sync completed successfully");

    } catch (error) {
        console.error("❌ Error in syncPrices:", error.message);
        throw error;
    }
}


async function inventorySync() {
    await syncStocks();
    await syncSources();
    await syncSuccess();
}

// Main function to run the operations
async function main() {
    await connectToDatabases();

   // cron.schedule('0 2 * * *', async () => {
        await syncPrices();
      //  await inventorySync();
    //});



    //const allSchemas = await getAllTableSchemas();
    //console.log("Fetched all table schemas:", allSchemas);
    //const schema = await getTableSchema();
    //console.log(schema);
    //const last10Records = await getLast10Records();
    //console.log("Fetched last 10 records:", last10Records);
    //console.log(mockData);
    //const mockData = generateMockData(schema);

    //console.log(getMDMPrices())

    // Grant permissions to a specific user on the Objectifs_Agents table
    //await grantPermissions('YourUserName', 'Objectifs_Agents');

    //const permissions = await displayUserPermissions('Reporting_MDM', 'Objectifs_Agents');
    ///console.log("Fetched permissions:", permissions)


    //fetchMDMProducts({ limit: 10, offset: 0, sourceCode: 16})

}

// ...existing code...

// Start the process
main();


// Use production config for port and host
const PORT = productionConfig.server.port;
const HOST = productionConfig.server.host;

// Start server with proper error handling
const server = app.listen(PORT, HOST, () => {
    logger.startup(`Techno ETL Backend Server running on ${HOST}:${PORT}`, {
        environment: productionConfig.server.environment,
        corsOrigins: productionConfig.cors.origin,
        port: PORT,
        host: HOST
    });
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please:`);
        console.error(`   1. Kill the process using: taskkill /PID <PID> /F`);
        console.error(`   2. Or set a different PORT environment variable`);
        console.error(`   3. Or wait for the port to be released`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});


// No ESM export, use CommonJS if needed