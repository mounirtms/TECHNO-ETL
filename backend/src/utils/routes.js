import express from 'express';
import apiController from '../controllers/apiController.js';
import mdmRoutes from '../mdm/routes.js';

const router = express.Router();

// MDM routes
router.use('/api/mdm', mdmRoutes);

// Sample route for CEGI queries
router.get('/api/cegid', apiController.getCegiData);

// Magento proxy routes
router.all('/api/magento/*', apiController.proxyMagentoRequest);

export default router;