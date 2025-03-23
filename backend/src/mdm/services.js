const { getPool } = require('../utils/database');
const sqlQueryBuilder = require('../utils/sqlQueryBuilder');
const MagentoService = require('../services/magentoService'); // Magento API wrapper
const sourceMapping = require('../config/sources');
const { cloudConfig } = require('../config/magento');

const magento = new MagentoService(cloudConfig); // ✅ Create an instance

async function syncInventoryToMagento(req, res) {
  try {
    let page = 0;
    const pageSize = parseInt(req.query.pageSize, 10) || 100; // Default batch size

 

    let { data, totalCount } = await fetchInventoryData({ ...req, query: { ...req.query, page, pageSize } });

    if (!totalCount) {
      console.log("✅ No inventory data to sync.");
      return res.json({ message: 'No inventory data to sync' });
    }

    let totalSynced = 0;

    while (data.length) { 

      const sourceItems = data
        .map(item => {
          const sourceInfo = sourceMapping.getAllSources().find(s => s.code_source === item.Code_Source);
          return {
            sku: item.Code_MDM.toString(),
            source_code: sourceInfo?.magentoSource || '',
            quantity: Math.max(0, Number(item.QteStock) || 0),
            status: (Number(item.QteStock) || 0) > 0 ? 1 : 0
          };
        })
        .filter(item => item.source_code); // Remove items with invalid source codes

      if (sourceItems.length) {
        const batchSize = 300;
        for (let i = 0; i < sourceItems.length; i += batchSize) {
          const batch = sourceItems.slice(i, i + batchSize);
          console.log(`🚀 Syncing batch (${i + 1}-${Math.min(i + batchSize, sourceItems.length)})...`);
          console.log("📤 Sending Data:", JSON.stringify(batch, null, 2));

          try {
            const response = await magento.post('V1/inventory/source-items', { sourceItems: batch }); // ✅ Use the instance
            console.log("✅ Batch Synced Successfully:", response);
            totalSynced += batch.length;
          } catch (error) {
            console.error('❌ Error syncing batch:', error.response?.data || error.message);
          }
        }
      }

      page++;
      const nextBatch = await fetchInventoryData({ ...req, query: { ...req.query, page, pageSize } });
      data = nextBatch.data;
    }

    console.log(`🎉 Successfully synced ${totalSynced} items. to Source ` + req.query.sourceCode);
    res.json({ message: `Successfully synced ${totalSynced} items.` });

  } catch (error) {
    console.error('❌ Error syncing inventory:', error);
    res.status(500).json({ error: 'Failed to sync inventory' });
  }
}

async function fetchInventoryData(req) {
  try {
    let params = { ...req.query };
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === '') {
        delete params[key];
      }
    });

    const sortModel = params.sortModel ? JSON.parse(params.sortModel) : [];
    const page = params.page ? parseInt(params.page, 10) : 0;
    const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 25;

    //console.log(`📊 Fetching inventory data (page: ${page}, pageSize: ${pageSize})`);

    const { query, inputs } = sqlQueryBuilder.buildQuery(params, sortModel, page, pageSize);
    const pool = await getPool('mdm');
    const request = pool.request();

    Object.keys(inputs).forEach(key => {
      request.input(key, inputs[key].type, inputs[key].value);
    });

    const result = await request.query(query);
    const totalCount = result.recordset.length > 0 ? result.recordset[0].TotalCount : 0;

    //console.log(`🔍 Retrieved ${result.recordset.length} records (Total: ${totalCount})`);

    return { data: result.recordset, totalCount };
  } catch (error) {
    console.error('❌ Error fetching inventory:', error);
    throw new Error('Failed to fetch inventory data');
  }
}

module.exports = {
  fetchInventoryData,
  syncInventoryToMagento
};
