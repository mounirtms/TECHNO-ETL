import { getPool } from '../utils/database.js';
import sqlQueryBuilder from '../utils/sqlQueryBuilder.js';
import MagentoService from '../services/magentoService.js';
import { cloudConfig } from '../config/magento.js';
import { sourceMapping, getAllSources } from '../config/sources.js';
import { MDM } from '../queries/index.js';

const magento = new MagentoService(cloudConfig);

// Helper: Only add searchCriteria for endpoints that support it
function shouldAddSearchCriteria(endpoint) {
  // Add more endpoints as needed
  return /V1\/(products|orders|customers|categories|cms|stockItems|inventory\/source-items)/.test(endpoint);
}

async function syncInventoryToMagento(req) {
  try {
    let page = 0;
    const pageSize = parseInt(req.query.pageSize, 10) || 100;
    let { data, totalCount } = await fetchInventoryData({ ...req, query: { ...req.query, page, pageSize } });

    if (!totalCount) {
      console.log("✅ No inventory data to sync.");
      return { message: "No inventory data to sync" }
    }

    let totalSynced = 0;

    while (data.length) {
      const sourceItems = data
        .map(item => {
          const sourceInfo = getAllSources().find(s => s.code_source === item.Code_Source);
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
          try {
            // Bulk endpoint, no searchCriteria
            const response = await magento.post("V1/inventory/source-items", { sourceItems: batch }); // Remove leading slash from endpoint
            console.log("✅ Batch Synced Successfully:", response);
            totalSynced += batch.length;
          } catch (error) {
            console.error("❌ Error syncing batch:", error.response?.data || error.message);
          }
        }
      }

      page++;
      const nextBatch = await fetchInventoryData({ ...req, query: { ...req.query, page, pageSize } });
      data = nextBatch.data;
    }

    console.log(`🎉 Successfully synced ${totalSynced} items.`);
  } catch (error) {
    console.error("❌ Error syncing inventory:", error);
    throw error;
  }
}

async function syncPricesToMagento(req) {
  try {
    const priceData = req.body;
    console.log("📦 Preparing bulk price update for", priceData.length, "products...");

    // For Magento bulk API, we need to send individual product update operations
    // Each operation should be a complete REST API call
    const bulkOperations = priceData.map((item, index) => ({
      "id": index + 1,
      "dataObject": {
        "product": {
          "sku": item.sku,
          "price": parseFloat(item.price)
        }
      },
      "operationType": "update"
    }));

    console.log("📦 Sample bulk operation:", JSON.stringify(bulkOperations[0], null, 2));

    // Try using the correct Magento bulk endpoint
    const endpoint = "async/bulk/V1/products";
    console.log("📦 Sending bulk price update to endpoint:", endpoint);

    const response = await magento.post(endpoint, bulkOperations);
    console.log("✅ Prices Synced Successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error syncing prices:", error.response?.data || error.message);

    // Fallback: Try individual product updates if bulk fails
    console.log("🔄 Bulk update failed, trying individual updates...");
    const results = [];

    for (const item of priceData.slice(0, 5)) { // Limit to 5 for testing
      try {
        const individualEndpoint = `products/${encodeURIComponent(item.sku)}`;
        const productData = {
          "product": {
            "sku": item.sku,
            "price": parseFloat(item.price)
          }
        };

        console.log(`📦 Updating individual product: ${item.sku} with price: ${item.price}`);
        const individualResponse = await magento.put(individualEndpoint, productData);
        results.push({ sku: item.sku, status: 'success', response: individualResponse });
      } catch (individualError) {
        console.error(`❌ Failed to update ${item.sku}:`, individualError.message);
        results.push({ sku: item.sku, status: 'error', error: individualError.message });
      }
    }

    return { fallback: true, results };
  }
}

async function fetchInventoryData(req) {
    try {
        console.log('🚀 [MDM Service] Starting inventory data fetch');

        let params = { ...req.query };
        console.log('📋 [MDM Service] Original params:', params);

        Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === '') {
                delete params[key];
            }
        });

        const sortModel = params.sortModel ? JSON.parse(params.sortModel) : [];
        const page = params.page ? parseInt(params.page, 10) : 0;
        const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 25;

        console.log('📊 [MDM Service] Processed params:', {
            page,
            pageSize,
            sortModel,
            cleanedParams: params,
            paramCount: Object.keys(params).length
        });

        const { query, inputs } = sqlQueryBuilder.buildQuery(params, sortModel, page, pageSize);

        console.log('🔍 [MDM Service] SQL Query built:', {
            queryLength: query.length,
            inputsCount: Object.keys(inputs).length,
            inputKeys: Object.keys(inputs)
        });

        const pool = await getPool('mdm');
        const request = pool.request();

        Object.keys(inputs).forEach(key => {
            request.input(key, inputs[key].type, inputs[key].value);
        });

        console.log('📡 [MDM Service] Executing SQL query...');
        const result = await request.query(query);
        const totalCount = result.recordset.length > 0 ? result.recordset[0].TotalCount : 0;

        console.log('✅ [MDM Service] Query executed successfully:', {
            recordsReturned: result.recordset.length,
            totalCount,
            sampleRecord: result.recordset[0] || null,
            recordFields: result.recordset.length > 0 ? Object.keys(result.recordset[0]) : []
        });

        return { data: result.recordset, totalCount };
    } catch (error) {
        console.error('❌ [MDM Service] Error fetching inventory:', {
            message: error.message,
            stack: error.stack,
            sqlState: error.state,
            sqlNumber: error.number
        });
        throw new Error('Failed to fetch inventory data');
    }
}

export {
  fetchInventoryData,
  syncInventoryToMagento,
  syncPricesToMagento
};
