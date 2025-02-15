
const stores = ["Techno Ghardaia", "Techno Laghouat", "Techno Setif", "Techno Ain Benian", "Techno Annaba", "Techno Draria", "Techno Cheraga"];
let mdmDbPool;

 // Route to test MDM DB connection
app.post('/api/mdm/test-connection', async (req, res) => {
  
    const dbConfig = req.body; // Get MDM DB config from frontend
    try {
        // Test connection by querying some basic data
        // Connect to MDM Database
        mdmDbPool = await sql.connect(dbConfig);
        console.log('Connected to MDM DB successfully');
        getStockData();
        res.status(200).json({ message: 'Connection successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




async function getStockData() {
    try {
        if (!mdmDbPool) {
            throw new Error('MDM DB connection not established.');
        }

        const query = `
            SELECT Code_Source, CleProduit, Societe, Qte
            FROM Stock_Filiales_TMS
            WHERE Qte IS NOT NULL;
        `;

        const result = await mdmDbPool.request().query(query);
        return result.recordset; // Returns stock data
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}





app.get('/api/mdm/stock/:storeId', async (req, res) => {
    const { storeId } = req.params;

    try {
        const query = `SELECT Code_Source, CleProduit, Societe, Qte 
                       FROM Stock_Filiales_TMS 
                       WHERE Code_Source = @storeId`;

        const result = await mdmDbPool.request()
            .input('storeId', sql.Int, storeId)
            .query(query);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching stock:', error);
        res.status(500).json({ error: 'Database error' });
    }
});


app.get('/api/mdm/stock', async (req, res) => {
    try {
        const query = `SELECT Code_Source, CleProduit, Societe, Qte FROM Stock_Filiales_TMS`;
        const result = await mdmDbPool.request().query(query);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching stock:', error);
        res.status(500).json({ error: 'Database error' });
    }
});


app.get('/api/mdm/products/:sku', async (req, res) => {
    const { sku } = req.params;

    try {
        const query = `SELECT * FROM Products WHERE SKU = @sku`;

        const result = await mdmDbPool.request()
            .input('sku', sql.VarChar, sku)
            .query(query);

        res.json(result.recordset[0] || {});
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get updated prices from MDM
app.get('/api/mdm/prices', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT Code_MDM, Tarif 
            FROM Tarif
            WHERE Code_TarifType=9 AND
            DateModif >= DATEADD(DAY, -10, GETDATE())
        `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sync prices to Magento
app.post('/api/prices/sync', async (req, res) => {
    try {
        const priceData = req.body; // Expecting formatted price data
        const magentoUrl = 'https://your-magento.com/rest/V1/products/base-prices';
        const magentoToken = 'your_magento_api_token';

        const response = await axios.post(magentoUrl, priceData, {
            headers: { Authorization: `Bearer ${magentoToken}` }
        });

        res.json({ success: true, response: response.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Schedule nightly price sync (Runs at 2 AM)
cron.schedule('0 2 * * *', async () => {
    console.log('Running nightly price sync...');
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT Code_MDM, Tarif 
            FROM Tarif
            WHERE DateModif >= DATEADD(DAY, -2, GETDATE())
        `);

        const priceData = result.recordset.map(row => ({
            sku: row.Code_MDM,
            price: row.Tarif
        }));

        await axios.post('https://your-magento.com/rest/V1/products/base-prices', priceData, {
            headers: { Authorization: `Bearer your_magento_api_token` }
        });

        console.log('Price sync completed successfully.');
    } catch (error) {
        console.error('Price sync failed:', error.message);
    }
});

export default mdmDbPool;   