const axios = require('axios');

const magentoUrl = "https://your-magento-url.com/rest/V1/inventory/source-items";
const token = "your_admin_token";

// Define SKUs
const skus = [
    "1120413", "1140605921", "2204103", "2204303", "1985504",
    "2203903", "2204403", "2413811", "111823822", "111823934"
];

// Define Sources
const sources = [
    "TechnoStationeryAinBenian",
    "TechnoStationeryAnnaba",
    "TechnoStationeryBatna",
    "TechnoStationeryBéjaia",
    "TechnoStationeryBirElDjir",
    "TechnoStationeryBlida",
    "TechnoStationeryBordjBouArreridj",
    "TechnoStationeryBoumerdes",
    "TechnoStationeryCheraga",
    "TechnoStationeryConstantine",
    "TechnoStationeryDelyIbrahim",
    "TechnoStationeryDjelfa",
    "TechnoStationeryDraria",
    "TechnoStationeryGhardaia",
    "TechnoStationeryHydra",
    "TechnoStationeryLaghouat",
    "TechnoStationeryMostaganem",
    "TechnoStationeryOran",
    "TechnoStationeryOuargla",
    "TechnoStationeryOuledFayet",
    "TechnoStationeryPinsMaritimes",
    "TechnoStationeryRouiba",
    "TechnoStationerySetif",
    "TechnoStationerySidiBelabes",
    "TechnoStationeryTiaret"
];

// Generate 100 stock updates
const stockUpdates = [];
for (let i = 0; i < 100; i++) {
    stockUpdates.push({
        sku: skus[Math.floor(Math.random() * skus.length)], // Random SKU
        source_code: sources[Math.floor(Math.random() * sources.length)], // Random Source
        quantity: Math.floor(Math.random() * 100) + 1, // Random Quantity (1-100)
        status: 1 // In Stock
    });
}

// Send API Request
axios.post(magentoUrl, { sourceItems: stockUpdates }, {
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
})
.then(response => {
    console.log("Stock Updated:", response.data);
})
.catch(error => {
    console.error("Error updating stock:", error.response ? error.response.data : error.message);
});
