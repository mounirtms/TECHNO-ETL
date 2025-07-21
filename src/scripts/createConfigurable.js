const axios = require('axios');

const BASE_URL = 'https://technostationery.com/rest';
const ADMIN_TOKEN = "eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjU3LCJ1dHlwaWQiOjIsImlhdCI6MTc0ODE2MzMyNCwiZXhwIjoxNzQ4MjQ5NzI0fQ.6QmLrB57iGehT5_HvAf-6BD-UmVXTm92BWUu1Wt5nsY"

const CONFIGURABLE_SKU = "1140669600";
const ATTRIBUTE_ID = 166; // 'capacity' attribute
const OPTION_LABEL = "Contenance";
const ATTRIBUTE_VALUES = [418, 431, 440];
const CHILD_SKUS = [
    "1140666042",
    "1140666043",
    "1140666044"
];

// Step 1: Create the configurable product
async function createConfigurableProduct() {
    const data = {
        product: {
            sku: "1140669600",
            name: 'MARQUEUR DOUBLE TETE ARTMARK SACOCHE EN TOILE "TECHNO"',
            price: 0,
            status: 1,
            type_id: "configurable",
            attribute_set_id: 4,
            weight: 0,
            visibility: 4,
            extension_attributes: {
                category_links: [
                    { position: 0, category_id: "23" },
                    { position: 0, category_id: "45" }
                    // Add all category IDs here
                ]
            },
            custom_attributes: [
                {
                    attribute_code: "description",
                    value:
                        'Les marqueurs TECHNO ont une base alcool qui permet la fusion des couleurs et leur superposition sans trace afin de réaliser facilement toutes les mises en couleurs, esquisses et illustrations. A double pointe (une pointe fine et une pointe large), ils permettent de travailler les détails, précisions et les aplats de couleur.\nAttention : À utiliser dans des locaux bien aérés.\nTenir hors de portée des enfants, présence de petites pièces, risque d’étouffement.\nBien refermer les capuchons après chaque utilisation.'
                },
                {
                    attribute_code: "short_description",
                    value:
                        "Les marqueurs TECHNO ont une base alcool qui permet la fusion des couleurs et leur superposition sans trace."
                },
                {
                    attribute_code: "meta_title",
                    value: 'MARQUEUR DOUBLE TETE ARTMARK SACOCHE EN TOILE "TECHNO"'
                },
                {
                    attribute_code: "meta_description",
                    value: "Les marqueurs TECHNO ont une base alcool qui permet la fusion des couleurs et leur superposition sans trace."
                },
                {
                    attribute_code: "meta_keyword",
                    value: "Feutre,marqueur ,stylo"
                },
                {
                    attribute_code: "url_key",
                    value: "marqueur-double-tete-artmark-sacoche-en-toile-techno"
                },
                {
                    attribute_code: "mgs_brand",
                    value: "TECHNO"
                },
                {
                    attribute_code: "country_of_manufacture",
                    value: "CN"
                }
            ]

        }
    };

    try {
        await axios.post(`${BASE_URL}/V1/products`, data, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        });
        console.log("Configurable product created.");
    } catch (err) {
        console.error("Error creating configurable product:", err.response?.data || err.message);
    }
}

// Step 2: Set configurable product options
async function setConfigurableOptions() {
    const optionData = {
        option: {
            attribute_id: ATTRIBUTE_ID.toString(),
            label: OPTION_LABEL,
            values: ATTRIBUTE_VALUES.map(v => ({ value_index: v }))
        }
    };

    try {
        await axios.post(`${BASE_URL}/V1/configurable-products/${CONFIGURABLE_SKU}/options`, optionData, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        });
        console.log("Configurable option set.");
    } catch (err) {
        console.error("Error setting configurable option:", err.response?.data || err.message);
    }
}

// Step 3: Associate simple products
async function linkSimpleProducts() {
    for (let i = 0; i < CHILD_SKUS.length; i++) {
        const sku = CHILD_SKUS[i];
        const valueIndex = ATTRIBUTE_VALUES[i];

        const payload = {
            childSku: sku,
            optionValues: [
                {
                    attribute_id: ATTRIBUTE_ID.toString(),
                    value_index: valueIndex
                }
            ]
        };

        try {
            await axios.put(`${BASE_URL}/V1/configurable-products/${CONFIGURABLE_SKU}/child/${sku}`, payload, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
            });
            console.log(`Linked child SKU: ${sku}`);
        } catch (err) {
            console.error(`Error linking ${sku}:`, err.response?.data || err.message);
        }
    }
}


// Run all steps
(async () => {
    await createConfigurableProduct();
    await setConfigurableOptions();
    await linkSimpleProducts();
})();
