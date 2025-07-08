import express from 'express';
import apiController from '../controllers/apiController.js';

const router = express.Router();

// Sample route for MDM queries
router.get('/api/mdm', apiController.getMdmData);

// Sample route for CEGI queries
router.get('/api/cegid', apiController.getCegiData); 


router.all('/api/magento/*', apiController.proxyMagentoRequest);


export default router;