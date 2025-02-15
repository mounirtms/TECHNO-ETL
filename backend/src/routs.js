// src/routes.js
const express = require('express');
const apiController = require('./controllers/apiController');

const router = express.Router();

// Sample route for MDM queries
router.get('/api/mdm', apiController.getMdmData);

// Sample route for CEGI queries
router.get('/api/cegid', apiController.getCegiData);

module.exports = router;