/**
 * Dashboard API Routes
 * Provides optimized endpoints for dashboard widgets with error handling and caching
 */
import express from 'express';
import { logger } from '../utils/logger.js';
import { getFromCache, setInCache } from '../services/cacheService.js';
import MagentoService from '../services/magentoService.js';
import { cloudConfig } from '../config/magento.js';

const router = express.Router();

// Initialize Magento service
let magentoService = null;

const initMagentoService = () => {
  if (!magentoService) {
    magentoService = new MagentoService(cloudConfig);
  }
  return magentoService;
};

/**
 * GET /api/dashboard/stats
 * Returns dashboard statistics with caching and error handling
 */
router.get('/stats', async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'dashboard:stats';
    const cached = await getFromCache(cacheKey);
    
    if (cached) {
      logger.info('Dashboard stats served from cache');
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // Fetch fresh data with error handling
    const stats = await fetchDashboardStats();
    
    // Cache for 5 minutes
    await setInCache(cacheKey, stats, 300);
    
    res.json({
      success: true,
      data: stats,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Dashboard stats error', { error: error.message });
    
    // Return fallback data
    res.json({
      success: false,
      data: getFallbackStats(),
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/dashboard/orders
 * Returns recent orders with pagination and error handling
 */
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const cacheKey = `dashboard:orders:${page}:${limit}`;
    
    // Check cache
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // Fetch from Magento
    const magento = initMagentoService();
    const ordersData = await magento.get(`orders?searchCriteria[pageSize]=${limit}&searchCriteria[currentPage]=${page}&searchCriteria[sortOrders][0][field]=created_at&searchCriteria[sortOrders][0][direction]=DESC`);
    
    // Cache for 2 minutes
    await setInCache(cacheKey, ordersData, 120);
    
    res.json({
      success: true,
      data: ordersData,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Dashboard orders error', { error: error.message });
    
    res.json({
      success: false,
      data: { items: [], total_count: 0 },
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/dashboard/products
 * Returns product statistics with error handling
 */
router.get('/products', async (req, res) => {
  try {
    const cacheKey = 'dashboard:products';
    
    // Check cache
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // Fetch from Magento with timeout
    const magento = initMagentoService();
    
    // Use Promise.race to implement timeout
    const productPromise = magento.get('products?searchCriteria[pageSize]=100');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    
    const productsData = await Promise.race([productPromise, timeoutPromise]);
    
    // Cache for 10 minutes
    await setInCache(cacheKey, productsData, 600);
    
    res.json({
      success: true,
      data: productsData,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Dashboard products error', { error: error.message });
    
    // Return fallback data
    res.json({
      success: false,
      data: { 
        items: [], 
        total_count: 0,
        message: 'Products service temporarily unavailable'
      },
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/dashboard/customers
 * Returns customer statistics
 */
router.get('/customers', async (req, res) => {
  try {
    const cacheKey = 'dashboard:customers';
    
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const magento = initMagentoService();
    const customersData = await magento.get('customers/search?searchCriteria[pageSize]=50');
    
    await setInCache(cacheKey, customersData, 300);
    
    res.json({
      success: true,
      data: customersData,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Dashboard customers error', { error: error.message });
    
    res.json({
      success: false,
      data: { items: [], total_count: 0 },
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Helper function to fetch dashboard statistics
 */
async function fetchDashboardStats() {
  const magento = initMagentoService();
  
  try {
    // Fetch data with timeouts
    const [ordersResult, productsResult, customersResult] = await Promise.allSettled([
      Promise.race([
        magento.get('orders?searchCriteria[pageSize]=1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Orders timeout')), 5000))
      ]),
      Promise.race([
        magento.get('products?searchCriteria[pageSize]=1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Products timeout')), 5000))
      ]),
      Promise.race([
        magento.get('customers/search?searchCriteria[pageSize]=1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Customers timeout')), 5000))
      ])
    ]);

    return {
      orders: {
        total: ordersResult.status === 'fulfilled' ? ordersResult.value?.total_count || 0 : 0,
        status: ordersResult.status,
        error: ordersResult.status === 'rejected' ? ordersResult.reason.message : null
      },
      products: {
        total: productsResult.status === 'fulfilled' ? productsResult.value?.total_count || 0 : 0,
        status: productsResult.status,
        error: productsResult.status === 'rejected' ? productsResult.reason.message : null
      },
      customers: {
        total: customersResult.status === 'fulfilled' ? customersResult.value?.total_count || 0 : 0,
        status: customersResult.status,
        error: customersResult.status === 'rejected' ? customersResult.reason.message : null
      },
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error fetching dashboard stats', { error: error.message });
    return getFallbackStats();
  }
}

/**
 * Fallback statistics when services are unavailable
 */
function getFallbackStats() {
  return {
    orders: { total: 0, status: 'unavailable', error: 'Service unavailable' },
    products: { total: 0, status: 'unavailable', error: 'Service unavailable' },
    customers: { total: 0, status: 'unavailable', error: 'Service unavailable' },
    lastUpdated: new Date().toISOString(),
    fallback: true
  };
}

/**
 * GET /api/dashboard/health
 * Dashboard-specific health check
 */
router.get('/health', async (req, res) => {
  try {
    const magento = initMagentoService();
    
    // Quick health check
    const healthPromise = magento.get('store/storeConfigs');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Health check timeout')), 3000)
    );
    
    await Promise.race([healthPromise, timeoutPromise]);
    
    res.json({
      status: 'healthy',
      magento: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      magento: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
