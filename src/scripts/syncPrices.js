const axios = require('axios');

// Magento API settings
const apiUrl = 'http://technostationery.com/rest/V1';
const accessToken = 'your_access_token_here';

// JSON data containing the list of products with updated prices 
const jsonData = [

    {
        "Code_Tarif": 261074,
        "Code_MDM": 1140659753,
        "Code_JDE": 25946,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 261074,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 970.00,
        "DateDebut": "2024-08-10T00:00:00",
        "DateFin": "2044-08-10T00:00:00",
        "DateModif": "2024-08-10T00:00:00",
        "UserID": "merouan.by"
    },
    {
        "Code_Tarif": 261088,
        "Code_MDM": 1140659756,
        "Code_JDE": 25943,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 261088,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 970.00,
        "DateDebut": "2024-08-10T00:00:00",
        "DateFin": "2044-08-10T00:00:00",
        "DateModif": "2024-08-10T00:00:00",
        "UserID": "merouan.by"
    },
    {
        "Code_Tarif": 261144,
        "Code_MDM": 1140659750,
        "Code_JDE": 25949,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 261144,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 900.00,
        "DateDebut": "2024-08-10T00:00:00",
        "DateFin": "2044-08-10T00:00:00",
        "DateModif": "2024-08-10T00:00:00",
        "UserID": "merouan.by"
    },
    {
        "Code_Tarif": 261158,
        "Code_MDM": 1140659752,
        "Code_JDE": 25947,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 261158,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 900.00,
        "DateDebut": "2024-08-10T00:00:00",
        "DateFin": "2044-08-10T00:00:00",
        "DateModif": "2024-08-10T00:00:00",
        "UserID": "merouan.by"
    },
    {
        "Code_Tarif": 261410,
        "Code_MDM": 1140659657,
        "Code_JDE": 26035,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 261410,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 1550.00,
        "DateDebut": "2024-08-10T00:00:00",
        "DateFin": "2044-08-10T00:00:00",
        "DateModif": "2024-08-10T00:00:00",
        "UserID": "merouan.by"
    },
    {
        "Code_Tarif": 261424,
        "Code_MDM": 1140659658,
        "Code_JDE": 26034,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 261424,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 1550.00,
        "DateDebut": "2024-08-10T00:00:00",
        "DateFin": "2044-08-10T00:00:00",
        "DateModif": "2024-08-10T00:00:00",
        "UserID": "merouan.by"
    },
    {
        "Code_Tarif": 261508,
        "Code_MDM": 1140659661,
        "Code_JDE": 26031,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 261508,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 1250.00,
        "DateDebut": "2024-08-10T00:00:00",
        "DateFin": "2044-08-10T00:00:00",
        "DateModif": "2024-08-10T00:00:00",
        "UserID": "merouan.by"
    },
    {
        "Code_Tarif": 261522,
        "Code_MDM": 1140659662,
        "Code_JDE": 26030,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 261522,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 1250.00,
        "DateDebut": "2024-08-10T00:00:00",
        "DateFin": "2044-08-10T00:00:00",
        "DateModif": "2024-08-10T00:00:00",
        "UserID": "merouan.by"
    },
    {
        "Code_Tarif": 261725,
        "Code_MDM": 1140659794,
        "Code_JDE": 25910,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 261725,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 2080.00,
        "DateDebut": "2024-08-10T00:00:00",
        "DateFin": "2044-08-10T00:00:00",
        "DateModif": "2024-08-10T00:00:00",
        "UserID": "merouan.by"
    },
    {
        "Code_Tarif": 261732,
        "Code_MDM": 1140659798,
        "Code_JDE": 25909,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 261732,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 2080.00,
        "DateDebut": "2024-08-10T00:00:00",
        "DateFin": "2044-08-10T00:00:00",
        "DateModif": "2024-08-10T00:00:00",
        "UserID": "merouan.by"
    },
    {
        "Code_Tarif": 269997,
        "Code_MDM": 1140661265,
        "Code_JDE": 221924,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 269997,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 2100.00,
        "DateDebut": "2024-10-15T00:00:00",
        "DateFin": "2044-10-15T00:00:00",
        "DateModif": "2024-10-15T00:00:00",
        "UserID": "merouan.by"
    },
    {
        "Code_Tarif": 269998,
        "Code_MDM": 1140661264,
        "Code_JDE": 221923,
        "Code_TarifType": 9,
        "C_ORIGINE": "I",
        "Code_TarifRef": 269998,
        "TauxTarif": 0,
        "Arrandi": 0,
        "Tarif": 1390.00,
        "DateDebut": "2024-10-15T00:00:00",
        "DateFin": "2044-10-15T00:00:00",
        "DateModif": "2024-10-15T00:00:00",
        "UserID": "merouan.by"
    }
];

// Set up Axios instance with Magento API credentials
const instance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Update prices in bulk
jsonData.forEach(async(product) => {
  const productId = await instance.get(`products/${product.Code_MDM}`);
  const productIdValue = productId.data.id;
  const updateResponse = await instance.put(`products/${product.Code_MDM}`, {
    product: {
      extension_attributes: {
        Tarif: product.Tarif
      }
    }
  });
  console.log(`Updated price for product ${product.Code_MDM} to ${product.Tarif}`);
});