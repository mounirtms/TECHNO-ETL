// src/routes.js
const express = require('express');
const apiController = require('../controllers/apiController');

const router = express.Router();

// Sample route for MDM queries
router.get('/api/mdm', apiController.getMdmData);

// Sample route for CEGI queries
router.get('/api/cegid', apiController.getCegiData);
/*router.options('/api/magento/*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});
*/
router.all('/api/magento/*', apiController.proxyMagentoRequest);


module.exports = router;