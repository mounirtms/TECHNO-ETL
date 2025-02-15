const storeMap = {
    "Techno Ghardaia": 3,
    "Techno Laghouat": 4,
    "Techno Setif": 5,
    "Techno Ain Benian": 6,
    "Techno Annaba": 7,
    "Techno Draria": 8,
    "Techno Cheraga": 9
};

async function getStockData() {
    try {
        const query = `SELECT Code_Source, CleProduit, Societe, Qte FROM Stock_Filiales_TMS WHERE Qte IS NOT NULL;`;
        const result = await mdmDbPool.request().query(query);
        return result.recordset;
    } catch (error) {
        console.error('Error fetching stock:', error);
        return [];
    }
}

async function syncStockToMagento() {
    const stockData = await getStockData();
    const payload = {
        sourceItems: stockData.map(item => ({
            sku: `SKU-${item.CleProduit}`,
            source_code: `store_${storeMap[item.Societe] || 0}`,
            quantity: item.Qte,
            status: item.Qte > 0 ? 1 : 0
        }))
    };

    try {
        const response = await axios.post(
            'https://your-magento-store.com/rest/V1/inventory/source-items',
            payload,
            { headers: { 'Authorization': `Bearer ${process.env.MAGENTO_TOKEN}` } }
        );

        console.log('Stock updated:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating stock:', error.response?.data || error.message);
        throw error;
    }
}

app.get('/api/mdm/sync-stock', async (req, res) => {
    try {
        const response = await syncStockToMagento();
        res.json({ message: 'Stock synced successfully', data: response });
    } catch (error) {
        res.status(500).json({ error: 'Failed to sync stock' });
    }
});
