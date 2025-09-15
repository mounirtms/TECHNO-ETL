/**
 * Dashboard Data Service
 * Provides data for various dashboard charts and analytics
 */

import categoryService from './categoryService';
import magentoApi from './magentoApi';

/**
 * Generate mock data for development and fallback
 */
const generateMockData = () => {
  return {
    productStats: [
      { name: 'Enabled', value: 8500 },
      { name: 'Disabled', value: 614 },
    ],
    productTypes: [
      { name: 'Simple', value: 7800 },
      { name: 'Configurable', value: 1200 },
      { name: 'Grouped', value: 100 },
      { name: 'Virtual', value: 14 },
    ],
    productAttributes: [
      { attribute: 'Trending', value: 450 },
      { attribute: 'Best Seller', value: 320 },
      { attribute: 'À la Une', value: 180 },
      { attribute: 'New Arrival', value: 280 },
      { attribute: 'Featured', value: 150 },
      { attribute: 'On Sale', value: 520 },
    ],
    brandDistribution: [
      { name: 'Calligraphe', value: 2500 },
      { name: 'Maped', value: 1800 },
      { name: 'Bic', value: 1200 },
      { name: 'Stabilo', value: 900 },
      { name: 'Faber-Castell', value: 700 },
      { name: 'Pilot', value: 600 },
      { name: 'Staedtler', value: 500 },
      { name: 'Papermate', value: 400 },
      { name: 'Uni-ball', value: 300 },
      { name: 'Others', value: 1214 },
    ],
    salesPerformance: [
      { period: 'Jan', revenue: 45000, orders: 120, customers: 85 },
      { period: 'Feb', revenue: 52000, orders: 140, customers: 95 },
      { period: 'Mar', revenue: 48000, orders: 130, customers: 88 },
      { period: 'Apr', revenue: 61000, orders: 165, customers: 110 },
      { period: 'May', revenue: 58000, orders: 155, customers: 105 },
      { period: 'Jun', revenue: 67000, orders: 180, customers: 125 },
      { period: 'Jul', revenue: 72000, orders: 195, customers: 135 },
    ],
    inventoryStatus: [
      { category: 'SCOLAIRE', inStock: 5200, lowStock: 800, outOfStock: 150, totalValue: 2500000 },
      { category: 'BUREAU', inStock: 1800, lowStock: 200, outOfStock: 50, totalValue: 900000 },
      { category: 'ART', inStock: 900, lowStock: 150, outOfStock: 30, totalValue: 450000 },
      { category: 'TECHNIQUE', inStock: 600, lowStock: 100, outOfStock: 20, totalValue: 800000 },
      { category: 'PAPETERIE', inStock: 1200, lowStock: 180, outOfStock: 40, totalValue: 600000 },
    ],
  };
};

/**
 * Get product statistics data
 */
export const getProductStatsData = async () => {
  try {
    // Try to get real data from API
    const response = await magentoApi.getProducts({ pageSize: 1 });
    const totalProducts = response?.total_count || 0;

    if (totalProducts > 0) {
      // Get a sample of products to analyze
      const sampleResponse = await magentoApi.getProducts({ pageSize: 100 });
      const products = sampleResponse?.items || [];

      const enabled = products.filter(p => p.status === 1).length;
      const disabled = products.filter(p => p.status === 2).length;

      // Extrapolate to total
      const ratio = totalProducts / products.length;

      return [
        { name: 'Enabled', value: Math.round(enabled * ratio) },
        { name: 'Disabled', value: Math.round(disabled * ratio) },
      ];
    }
  } catch (error) {
    console.warn('Using mock product stats data:', error.message);
  }

  return generateMockData().productStats;
};

/**
 * Get product types distribution
 */
export const getProductTypesData = async () => {
  try {
    const response = await magentoApi.getProducts({ pageSize: 100 });
    const products = response?.items || [];

    if (products.length > 0) {
      const types = {};

      products.forEach(product => {
        const type = product.type_id || 'simple';

        types[type] = (types[type] || 0) + 1;
      });

      return Object.entries(types).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
    }
  } catch (error) {
    console.warn('Using mock product types data:', error.message);
  }

  return generateMockData().productTypes;
};

/**
 * Get brand distribution data
 */
export const getBrandDistributionData = async () => {
  try {
    const response = await magentoApi.getProducts({ pageSize: 200 });
    const products = response?.items || [];

    if (products.length > 0) {
      const brands = {};

      products.forEach(product => {
        const brandAttr = product.custom_attributes?.find(
          attr => attr.attribute_code === 'mgs_brand',
        );
        const brand = brandAttr?.value || 'Unknown';

        brands[brand] = (brands[brand] || 0) + 1;
      });

      return Object.entries(brands)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    }
  } catch (error) {
    console.warn('Using mock brand distribution data:', error.message);
  }

  return generateMockData().brandDistribution;
};

/**
 * Get category distribution data
 */
export const getCategoryDistributionData = () => {
  try {
    const categories = categoryService.getAllCategories();

    return categories
      .filter(cat => cat.product_count > 0)
      .map(cat => ({
        name: cat.name,
        value: cat.product_count,
        level: cat.level,
        parent: cat.parentPath,
      }))
      .sort((a, b) => b.value - a.value);
  } catch (error) {
    console.warn('Error getting category data:', error);

    return [];
  }
};

/**
 * Get product attributes data
 */
export const getProductAttributesData = async () => {
  try {
    const response = await magentoApi.getProducts({ pageSize: 200 });
    const products = response?.items || [];

    if (products.length > 0) {
      const attributes = {
        'Trending': 0,
        'Best Seller': 0,
        'À la Une': 0,
        'Has Description': 0,
        'Has Images': 0,
        'Has Weight': 0,
      };

      products.forEach(product => {
        const customAttrs = product.custom_attributes || [];

        // Check boolean attributes
        const trending = customAttrs.find(attr => attr.attribute_code === 'trending');

        if (trending?.value === '1' || trending?.value === true) {
          attributes['Trending']++;
        }

        const bestSeller = customAttrs.find(attr => attr.attribute_code === 'best_seller');

        if (bestSeller?.value === '1' || bestSeller?.value === true) {
          attributes['Best Seller']++;
        }

        const alaune = customAttrs.find(attr => attr.attribute_code === 'a_la_une');

        if (alaune?.value === '1' || alaune?.value === true) {
          attributes['À la Une']++;
        }

        // Check other attributes
        const description = customAttrs.find(attr => attr.attribute_code === 'description');

        if (description?.value) {
          attributes['Has Description']++;
        }

        if (product.weight && product.weight > 0) {
          attributes['Has Weight']++;
        }

        if (product.media_gallery_entries && product.media_gallery_entries.length > 0) {
          attributes['Has Images']++;
        }
      });

      return Object.entries(attributes).map(([attribute, value]) => ({
        attribute,
        value,
      }));
    }
  } catch (error) {
    console.warn('Using mock attributes data:', error.message);
  }

  return generateMockData().productAttributes;
};

/**
 * Get sales performance data
 */
export const getSalesPerformanceData = async () => {
  try {
    // This would typically come from order/sales API
    // For now, return mock data
    return generateMockData().salesPerformance;
  } catch (error) {
    console.warn('Using mock sales performance data:', error.message);

    return generateMockData().salesPerformance;
  }
};

/**
 * Get inventory status data
 */
export const getInventoryStatusData = async () => {
  try {
    const categories = categoryService.getRootCategories();
    const inventoryData = [];

    for (const category of categories.slice(0, 5)) {
      // Mock inventory calculation based on category
      const totalProducts = category.product_count || 0;
      const inStock = Math.floor(totalProducts * 0.7);
      const lowStock = Math.floor(totalProducts * 0.2);
      const outOfStock = totalProducts - inStock - lowStock;
      const avgPrice = 150; // Mock average price

      inventoryData.push({
        category: category.name,
        inStock,
        lowStock,
        outOfStock,
        totalValue: totalProducts * avgPrice,
      });
    }

    return inventoryData;
  } catch (error) {
    console.warn('Using mock inventory data:', error.message);

    return generateMockData().inventoryStatus;
  }
};

/**
 * Get all dashboard data
 */
export const getAllDashboardData = async () => {
  try {
    const [
      productStats,
      productTypes,
      brandDistribution,
      categoryDistribution,
      productAttributes,
      salesPerformance,
      inventoryStatus,
    ] = await Promise.all([
      getProductStatsData(),
      getProductTypesData(),
      getBrandDistributionData(),
      getCategoryDistributionData(),
      getProductAttributesData(),
      getSalesPerformanceData(),
      getInventoryStatusData(),
    ]);

    return {
      productStats,
      productTypes,
      brandDistribution,
      categoryDistribution,
      productAttributes,
      salesPerformance,
      inventoryStatus,
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);

    return generateMockData();
  }
};

export default {
  getProductStatsData,
  getProductTypesData,
  getBrandDistributionData,
  getCategoryDistributionData,
  getProductAttributesData,
  getSalesPerformanceData,
  getInventoryStatusData,
  getAllDashboardData,
};
