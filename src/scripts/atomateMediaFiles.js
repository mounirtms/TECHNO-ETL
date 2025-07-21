const axios = require('axios');

 
const CLOUD_BASE_URL = 'https://technostationery.com/rest';
const BETA_BASE_URL = 'https://beta.technostationery.com/rest';
const TOKEN_CLOUD = "eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjU3LCJ1dHlwaWQiOjIsImlhdCI6MTczODQ4MjA1MiwiZXhwIjoxNzM4NTY4NDUyfQ.kzRwhk37hLN6x05SLzXyP6KlrVaXMuv6_uZ7WfFUC84"
const TOKEN_BETA = "eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjMsInV0eXBpZCI6MiwiaWF0IjoxNzM4NDgyMDIzLCJleHAiOjM4OTg0ODIwMjN9.-FSEkM-G4oTvHyMw-jSZW6z7P6LHH_pVSSFAveJfxKE"
const IMAGE_BASE_PATH = '/home/beta/public_html/pub/media/catalog/product';

async function fetchProductMediaFromCloud(sku) {
    try {
      const response = await axios.get(`${CLOUD_BASE_URL}/V1/products/${sku}/media`, {
        headers: { Authorization: `Bearer ${TOKEN_CLOUD}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching media for SKU ${sku}:`, error.response?.data || error.message);
      return [];
    }
  }
  
  async function createMediaEntryOnBeta(sku, mediaEntry) {
    try {
      const response = await axios.post(
        `${BETA_BASE_URL}/V1/products/${sku}/media`,
        { entry: mediaEntry },
        { headers: { Authorization: `Bearer ${TOKEN_BETA}` } }
      );
      console.log(`Media entry created for SKU ${sku}:`, response.data);
    } catch (error) {
      console.error(`Error creating media for SKU ${sku}:`, error.response?.data || error.message);
    }
  }
  
  async function syncProductMedia(sku) {
    const mediaData = await fetchProductMediaFromCloud(sku);
    if (mediaData.length > 0) {
      for (const entry of mediaData) {
        const mediaEntry = {
          media_type: entry.media_type,
          label: entry.label,
          position: entry.position,
          disabled: entry.disabled,
          types: entry.types,
          file: `${IMAGE_BASE_PATH}${entry.file}`
        };
        await createMediaEntryOnBeta(sku, mediaEntry);
      }
    } else {
      console.log(`No media entries found for SKU ${sku}`);
    }
  }
  
  async function clearCache() {
    console.log('Skipping cache clearing via API. Please clear the cache manually:');
    console.log('Commands to run:');
    console.log('php bin/magento cache:clean');
    console.log('php bin/magento cache:flush');
  }
  
  (async () => {
    const productSkus = ['1140612161']; // Add more SKUs as needed
    for (const sku of productSkus) {
      await syncProductMedia(sku);
    }
    await clearCache();
  })();