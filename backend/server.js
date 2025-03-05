require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const router = require('./src/utils/routes');
const cron = require('node-cron');
const { createMdmPool, createCegidPool, createMdm360Pool, getPool } = require('./src/utils/database');
const mdm360dbConfig = require('./src/config/mdm360');
const mdmdbConfig = require('./src/config/mdm');
const cegiddbConfig = require('./src/config/cegid');
const jwt = require('jsonwebtoken');
const app = express();
const fs = require('fs');
const path = require('path');
const MagentoService = require('./src/services/magentoService');


app.use(cors({
    origin: ['http://localhost:82', 'https://techno-webapp.web.app', 'https://dashboard.technostationery.com'], // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Middleware to parse JSON requests

/*
// Serve static files from React build
//app.use(express.static(path.join(__dirname, '../dist')));

// API Routes (Add your API endpoints here)
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// Handle React routing (For SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});
*/

const {
    cloudConfig,
    betaConfig,
    getMagentoToken
} = require('./src/config/magento');





app.use(express.json()); // Enable parsing JSON request bodies
app.use(express.urlencoded({ extended: true })); // Enable parsing URL-encoded request bodies
app.use(router);
app.use(cors());

// Connection endpoints
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
        console.log(dbConfig)
        await createMdmPool(dbConfig); // Call createMdmPool with config
        res.json({ message: 'MDM connection successful' });
    } catch (error) {
        console.error('MDM connection failed:', error);
        res.status(500).json({ error: "MDM Connection failed" })
    }
});


app.post('/api/cegid/connect', authenticateToken, async (req, res) => {
    const dbConfig = req.body;
    console.log(dbConfig)
    try {
        await createCegidPool(dbConfig) // Pass dbConfig to createCegidPool
        res.json({ message: 'CEGID connection successful' })
    } catch (error) {
        console.error('CEGID connection failed', error);
        res.status(500).json({ error: "CEGID Connection failed" })
    }
});

app.post('/api/mdm/excel', authenticateToken, async (req, res) => {
    const data = req.body;
    debugger
    try {

        res.json({ message: 'CEGID connection successful' })
    } catch (error) {
        console.error('CEGID connection failed', error);
        res.status(500).json({ error: "CEGID Connection failed" })
    }
});


// Read SQL query from file
const readSQLQuery = (filePath) => {
    return fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
};

// Fetch product prices from MDM
app.get('/api/mdm/prices', async (req, res) => {
    try {
        const sqlQuery = readSQLQuery('./src/queries/prices.sql');
        const pool = getPool('mdm');
        const result = await pool.request().query(sqlQuery);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sync Prices to Magento (Bulk)
app.post('/api/techno/prices-sync', async (req, res) => {
    try {
        const priceData = req.body; // Expecting formatted price data
        const endpoint = '/async/bulk/V1/products';
        const magentoToken = await getMagentoToken(cloudConfig);

        console.log("📦 Sending bulk price update...");

        const response = await axios.post(cloudConfig.url + endpoint, priceData, {
            headers: { Authorization: `Bearer ${magentoToken}`, 'Content-Type': 'application/json' }
        });

        res.json({ success: true, response: response.data });
    } catch (error) {
        console.error("❌ Failed to sync prices:", error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

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

async function connectToDatabases() {
    try {

        await createMdmPool(mdmdbConfig); // Call createMdmPool with config
        await createMdm360Pool(mdm360dbConfig); // Call createMdmPool with config
        await createCegidPool(cegiddbConfig) // Pass dbConfig to createCegidPool
        const token = await getMagentoToken(cloudConfig);

    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

async function getMDMPrices() {
    try {
        // Read query from prices.sql
        const sqlQuery = readSQLQuery('./src/queries/prices.sql');

        const pool = getPool('mdm');
        const result = await pool.request().query(sqlQuery);
        return (result.recordset);
    } catch (error) {
        return ({ error: error.message });
    }
}

// Main function to run the operations
async function main() {
    await connectToDatabases();
    //const allSchemas = await getAllTableSchemas();
    //console.log("Fetched all table schemas:", allSchemas);
    //const schema = await getTableSchema();
    //console.log(schema);
    //const last10Records = await getLast10Records();
    //console.log("Fetched last 10 records:", last10Records);
    //const mockData = generateMockData(schema);
    //console.log(mockData);

     console.log(getMDMPrices())

    // Grant permissions to a specific user on the Objectifs_Agents table
    //await grantPermissions('YourUserName', 'Objectifs_Agents');

    //const permissions = await displayUserPermissions('Reporting_MDM', 'Objectifs_Agents');
    ///console.log("Fetched permissions:", permissions)


}

// Start the process
main();


app.listen(5000, () => {
    console.log(`Server is running ..... `);
});


module.exports = app;