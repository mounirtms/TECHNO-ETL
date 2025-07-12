import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import router from './src/utils/routes.js';
import cron from 'node-cron';
import { createMdmPool, createCegidPool, createMdm360Pool, getPool } from './src/utils/database.js';
import sql from 'mssql';
import mdmdbConfig from './src/config/mdm.js';
import jwt from 'jsonwebtoken';
import { fetchInventoryData, syncInventoryToMagento, syncPricesToMagento } from './src/mdm/services.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { cloudConfig, betaConfig, getMagentoToken } from './src/config/magento.js';
import { sourceMapping, getAllSources } from './src/config/sources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: ['http://localhost:4173', 'http://localhost:82', 'https://techno-webapp.web.app', 'https://dashboard.technostationery.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

        console.log(`Stock changes synced successfully for ${logIdentifier}`);
    } catch (error) {
        console.error(`Error syncing stock changes for ${logIdentifier}:`, error);
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

        console.log(`Success flags updated successfully for ${logIdentifier}`);
    } catch (error) {
        console.error(`Error updating success flags for ${logIdentifier}:`, error);
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

        console.log(`✅ Finished syncing for ${source}`);

    } catch (error) {
        console.error('❌ Error syncing all sources:', error);
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
        return result;
    } catch (error) {
        console.error('Error fetching MDM prices:', error);
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
app.get('/api/mdm/prices', async (req, res) => {
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
        for (const source of sourceMapping.getAllSources()) {
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
    // Calculate yesterday's date (YYYY-MM-DD format)


    // Fetch prices with yesterday as default startDate
    let prices = await fetchMdmPrices();
    // Transform the data for Magento
    let priceData = prices.recordset.map(({ sku, price }) => ({
        product: {
            sku,
            price: parseFloat(price) // Ensure it's a valid number
        }
    }));

    // Sync to Magento
    await syncPricesToMagento({ body: priceData });

}



async function inventorySync() {
    await syncStocks();
    await syncSources();
    await syncSuccess();
}

// Main function to run the operations
async function main() {
    await connectToDatabases();

    cron.schedule('0 2 * * *', async () => {
        await syncPrices();
        await inventorySync();
    });


    //const allSchemas = await getAllTableSchemas();
    //console.log("Fetched all table schemas:", allSchemas);
    //const schema = await getTableSchema();
    //console.log(schema);
    //const last10Records = await getLast10Records();
    //console.log("Fetched last 10 records:", last10Records);
    //const mockData = generateMockData(schema);
    //console.log(mockData);

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


app.listen(5000, () => {
    console.log(`Server is running ..... `);
});


// No ESM export, use CommonJS if needed