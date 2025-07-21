const axios = require('axios');

const BASE_URL = 'https://technostationery.com/rest';
const ADMIN_TOKEN = "eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjU3LCJ1dHlwaWQiOjIsImlhdCI6MTc0ODE2MzMyNCwiZXhwIjoxNzQ4MjQ5NzI0fQ.6QmLrB57iGehT5_HvAf-6BD-UmVXTm92BWUu1Wt5nsY"
 
 

const CONFIGURABLE_SKU = "1140669600";
const ATTRIBUTE_ID = 166; // Capacity attribute ID
const OPTION_LABEL = "Contenance";
const ATTRIBUTE_VALUES = [418, 431, 440];
const CHILD_SKUS = [
  "1140666042",
  "1140666043",
  "1140666044"
];

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/V1`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_TOKEN}`
  }
});

async function getProductIdBySku(sku) {
  try {
    const res = await axiosInstance.get(`/products/${sku}`);
    return res.data.id || res.data.product?.id || null;
  } catch (error) {
    console.error(`Failed to get product ID for SKU ${sku}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

async function updateConfigurableProduct() {
  try {
    // Get child product IDs
    const childProductIds = [];
    for (const sku of CHILD_SKUS) {
      const id = await getProductIdBySku(sku);
      if (!id) throw new Error(`Product ID not found for SKU ${sku}`);
      childProductIds.push(id);
    }

    // Prepare configurable product options
    const configurableProductOptions = [
      {
        attribute_id: ATTRIBUTE_ID.toString(),
        label: OPTION_LABEL,
        position: 0,
        values: ATTRIBUTE_VALUES.map(value => ({ value_index: value }))
      }
    ];

    // Update configurable product with options and links (child products)
    const payload = {
      product: {
        sku: CONFIGURABLE_SKU,
        extension_attributes: {
          configurable_product_options: configurableProductOptions,
          configurable_product_links: childProductIds
        }
      }
    };

    const response = await axiosInstance.put(`/products/${CONFIGURABLE_SKU}`, payload);
    console.log('✅ Configurable product updated:', response.data);
  } catch (error) {
    console.error('❌ Failed to update configurable product:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function updateChildAttributes() {
  try {
    for (let i = 0; i < CHILD_SKUS.length; i++) {
      const sku = CHILD_SKUS[i];
      const capacityValue = ATTRIBUTE_VALUES[i];
      const payload = {
        product: {
          sku,
          custom_attributes: [
            {
              attribute_code: "capacity",
              value: capacityValue
            }
          ]
        }
      };
      await axiosInstance.put(`/products/${sku}`, payload);
      console.log(`✅ Updated capacity for child SKU: ${sku}`);
    }
  } catch (error) {
    console.error('❌ Failed to update child product attribute:', error.response?.data?.message || error.message);
    throw error;
  }
}

 
async function createAllChildren() {
    await createChildProduct({
        sku: "1140666042",
        name: "MARQUEUR DOUBLE TETE ARTMARK SACOCHE EN TOILE 96 COULEURS",
        weight: 1932,
        barcode: "6935023179744",
        description: "Les marqueurs TECHNO ont une base alcool [...]",
        short_description: "Les marqueurs TECHNO ont une base alcool [...]",
        capacityValueIndex: 418
    });

    await createChildProduct({
        sku: "1140666043",
        name: "MARQUEUR DOUBLE TETE ARTMARK SACOCHE EN TOILE 120 COULEURS",
        weight: 2469,
        barcode: "6935023179751",
        description: "Les marqueurs TECHNO ont une base alcool [...]",
        short_description: "Les marqueurs TECHNO ont une base alcool [...]",
        capacityValueIndex: 431
    });

    await createChildProduct({
        sku: "1140666044",
        name: "MARQUEUR DOUBLE TETE ARTMARK SACOCHE EN TOILE 168 COULEURS",
        weight: 3402,
        barcode: "6935023179768",
        description: "Les marqueurs TECHNO ont une base alcool [...]",
        short_description: "Les marqueurs TECHNO ont une base alcool [...]",
        capacityValueIndex: 440
    });
}

async function createChildProduct({ sku, name, weight, barcode, description, short_description, capacityValueIndex }) {
    const data = {
        product: {
            sku,
            name,
            type_id: "virtual",
            attribute_set_id: 4,
            price: 0,
            status: 1,
            visibility: 1,
            weight,
            extension_attributes: {
                stock_item: {
                    qty: 100,
                    is_in_stock: true
                }
            },
            custom_attributes: [
                { attribute_code: "description", value: description },
                { attribute_code: "short_description", value: short_description },
                { attribute_code: "meta_title", value: name },
                { attribute_code: "meta_description", value: short_description },
                { attribute_code: "meta_keyword", value: "Feutre,marqueur,stylo" },
                { attribute_code: "url_key", value: name.toLowerCase().replace(/\s+/g, '-') },
                { attribute_code: "mgs_brand", value: 121 }, // replace 121 with correct option_id for "TECHNO"
                { attribute_code: "country_of_manufacture", value: "CN" },
                { attribute_code: "capacity", value: capacityValueIndex }
            ]
        }
    };

    try {
        await axios.post(`${BASE_URL}/V1/products`, data, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        });
        console.log(`Child product ${sku} created.`);
    } catch (err) {
        console.error(`Error creating child product ${sku}:`, err.response?.data || err.message);
    }
}

async function main() {
  try {
    await createAllChildren();             // 🔁 Ensure children exist first
    await updateChildAttributes();         // ✅ Assign capacity to them
    await updateConfigurableProduct();     // 🔗 Link children to parent
    console.log("🎉 All done!");
  } catch {
    console.error("🚨 Operation failed.");
  }
}

main();