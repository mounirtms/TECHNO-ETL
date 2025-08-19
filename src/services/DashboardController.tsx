import { useState, useEffect, useCallback, useMemo } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCustomTheme } from '../contexts/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useSettings } from '../contexts/SettingsContext';
import magentoApi from './magentoApi';
import { toast } from 'react-toastify';
import axios from 'axios';

// Enhanced caching system for dashboard data
class DashboardCache {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.maxCacheSize = 50;
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    }

    set(key, data, ttl = this.defaultTTL) {
        // Cleanup if cache is too large
        if (this.cache.size >= this.maxCacheSize) {
            this.cleanup();
        }

        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + ttl);
    }

    get(key) {
        const expiry = this.cacheExpiry.get(key);
        if (!expiry || Date.now() > expiry) {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            return null;
        }
        return this.cache.get(key);
    }

    has(key) {
        return this.get(key) !== null;
    }

    clear() {
        this.cache.clear();
        this.cacheExpiry.clear();
    }

    cleanup() {
        const now = Date.now();
        for (const [key, expiry] of this.cacheExpiry.entries()) {
            if (now > expiry) {
                this.cache.delete(key);
                this.cacheExpiry.delete(key);
            }
        }
    }

    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                this.cacheExpiry.delete(key);
            }
        }
    }
}

// Global cache instance
const dashboardCache = new DashboardCache();

 

export const useDashboardController = (startDate, endDate, refreshKey) => {
    const { currentUser } = useAuth();
    const { setLanguage } = useLanguage();
    const themeCtx = useCustomTheme();
    const theme = useMuiTheme();
    const { settings: globalSettings, updateSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({});
    const [chartData, setChartData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [customerData, setCustomerData] = useState([]);
    const [countryData, setCountryData] = useState([]);
    const [productTypeData, setProductTypeData] = useState([]);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            // Listen to user preferences in real-time
            const userPrefsRef = ref(database, `users/${currentUser.uid}/preferences`);
            const unsubscribe = onValue(userPrefsRef, (snapshot) => {
                const preferences = snapshot.val();
                
                if (preferences) {
                    // Apply language preference
                    if (preferences.language) {
                        setLanguage(preferences.language);
                        localStorage.setItem('userLanguage', preferences.language);
                    }
                    
                    // Apply theme preference
                    if (preferences.theme) {
                        // Only set theme if function exists and is different
                        if (typeof themeCtx.setThemeMode === 'function') {
                            themeCtx.setThemeMode(preferences.theme);
                        } else if (typeof themeCtx.setMode === 'function') {
                            themeCtx.setMode(preferences.theme);
                        } else if (typeof themeCtx.toggleTheme === 'function') {
                            if (themeCtx.mode !== preferences.theme) themeCtx.toggleTheme();
                        }
                        localStorage.setItem('theme', preferences.theme);
                    }
                } else {
                    // If no preferences found, use localStorage values or defaults
                    const localLang = localStorage.getItem('userLanguage') || 'en';
                    const localTheme = localStorage.getItem('theme') || 'light';
                    
                    setLanguage(localLang);
                    if (typeof themeCtx.setThemeMode === 'function') {
                        themeCtx.setThemeMode(localTheme);
                    } else if (typeof themeCtx.setMode === 'function') {
                        themeCtx.setMode(localTheme);
                    } else if (typeof themeCtx.toggleTheme === 'function') {
                        if (themeCtx.mode !== localTheme) themeCtx.toggleTheme();
                    }
                }
                
                setLoading(false);
            }, (error) => {
                console.error('Error loading preferences:', error);
                setError(error);
                setLoading(false);
                
                // Fallback to localStorage if Firebase fails
                const localLang = localStorage.getItem('userLanguage') || 'en';
                const localTheme = localStorage.getItem('theme') || 'light';
                
                setLanguage(localLang);
                if (typeof themeCtx.setThemeMode === 'function') {
                    themeCtx.setThemeMode(localTheme);
                } else if (typeof themeCtx.setMode === 'function') {
                    themeCtx.setMode(localTheme);
                } else if (typeof themeCtx.toggleTheme === 'function') {
                    if (themeCtx.mode !== localTheme) themeCtx.toggleTheme();
                }
            });

            return () => unsubscribe();
        } catch (err) {
            console.error('Error in dashboard controller:', err);
            setError(err);
            setLoading(false);
        }
    }, [currentUser, setLanguage, themeCtx]);
    
    // Enhanced fetch dashboard data with caching and optimization
    const fetchDashboardData = useCallback(async (forceRefresh = false) => {
        const cacheKey = `dashboard_${startDate.getTime()}_${endDate.getTime()}_${refreshKey || 'default'}`;
        
        // Check cache first if not forcing refresh
        if (!forceRefresh && dashboardCache.has(cacheKey)) {
            console.log('📋 Loading dashboard data from cache');
            const cachedData = dashboardCache.get(cacheKey);
            setStats(cachedData.stats);
            setChartData(cachedData.chartData);
            setRecentOrders(cachedData.recentOrders);
            setBestSellers(cachedData.bestSellers);
            setCustomerData(cachedData.customerData);
            setCountryData(cachedData.countryData);
            setProductTypeData(cachedData.productTypeData);
            setLoading(false);
            return cachedData;
        }

        setLoading(true);
        setError(null);
        const ordersByTime = {};
        
        try {
            console.log('🔄 Fetching fresh dashboard data...');
            const formattedStartDate = startDate.toISOString();
            const formattedEndDate = endDate.toISOString();

            // Optimized API parameters
            const ordersParams = {
                filterGroups: [{
                    filters: [{
                        field: 'created_at',
                        value: formattedStartDate,
                        conditionType: 'gteq'
                    }, {
                        field: 'created_at',
                        value: formattedEndDate,
                        conditionType: 'lteq'
                    }]
                }],
                pageSize: 150, // Increased for better data coverage
                currentPage: 1,
                sortOrders: [{
                    field: 'created_at',
                    direction: 'DESC'
                }]
            };

            // Parallel API calls with error handling
            const apiCalls = [
                magentoApi.getOrders(ordersParams).catch(error => {
                    console.warn('Orders API failed:', error);
                    return { items: [], total_count: 0 };
                }),
                magentoApi.getCustomers({ pageSize: 150 }).catch(error => {
                    console.warn('Customers API failed:', error);
                    return { items: [], total_count: 0 };
                }),
                magentoApi.getProducts({ pageSize: 150 }).catch(error => {
                    console.warn('Products API failed:', error);
                    return { items: [], total_count: 0 };
                })
            ];

            const [ordersResponse, customersResponse, productsResponse] = await Promise.all(apiCalls);

            const orders = ordersResponse?.items || [];
            const customers = customersResponse?.items || [];
            const products = productsResponse?.items || [];
            let totalRevenue = 0;

            // Optimized chart data processing
            const processChartData = () => {
                const startTimestamp = new Date(startDate).setHours(0, 0, 0, 0);
                const endTimestamp = new Date(endDate).setHours(0, 0, 0, 0);
                
                // Initialize time buckets
                let currentDate = new Date(startTimestamp);
                while (currentDate.getTime() <= endTimestamp) {
                    const timestamp = currentDate.getTime();
                    ordersByTime[timestamp] = {
                        count: 0,
                        revenue: 0,
                        key: `day-${timestamp}`
                    };
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // Process orders efficiently
                orders.forEach(order => {
                    const orderDate = new Date(order.created_at);
                    if (orderDate >= startDate && orderDate <= endDate) {
                        const timestamp = new Date(orderDate).setHours(0, 0, 0, 0);
                        if (ordersByTime[timestamp]) {
                            ordersByTime[timestamp].count++;
                            const orderTotal = parseFloat(order.grand_total || 0);
                            ordersByTime[timestamp].revenue += orderTotal;
                            totalRevenue += orderTotal;
                        }
                    }
                });

                return Object.entries(ordersByTime)
                    .map(([timestamp, data]) => ({
                        date: parseInt(timestamp),
                        orders: data.count || 0,
                        revenue: data.revenue || 0,
                        key: data.key
                    }))
                    .sort((a, b) => a.date - b.date);
            };

            const chartDataArr = processChartData();

            // Optimized stats calculation
            const calculateStats = () => {
                const newCustomers = customers.filter(c => {
                    const createdAt = new Date(c.created_at);
                    return createdAt >= startDate && createdAt <= endDate;
                }).length;

                const totalValue = products.reduce((acc, p) => {
                    const price = parseFloat(p.price || 0);
                    const qty = parseFloat(p.qty || 0);
                    return acc + (price * qty);
                }, 0);

                return {
                    totalOrders: orders.length,
                    totalCustomers: customersResponse?.total_count || 0,
                    totalProducts: productsResponse?.total_count || 0,
                    totalRevenue: totalRevenue,
                    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
                    totalValue: totalValue,
                    newCustomers: newCustomers,
                    growthRate: 0, // TODO: Calculate compared to previous period
                    conversionRate: orders.length > 0 ? (orders.length / customers.length) * 100 : 0
                };
            };

            // Optimized best sellers calculation
            const calculateBestSellers = () => {
                const productMap = new Map();
                orders.forEach(order => {
                    (order.items || []).forEach(item => {
                        const sku = item.sku;
                        if (!productMap.has(sku)) {
                            productMap.set(sku, { 
                                sku: sku, 
                                name: item.name, 
                                qty: 0,
                                revenue: 0
                            });
                        }
                        const existing = productMap.get(sku);
                        existing.qty += parseFloat(item.qty_ordered || 0);
                        existing.revenue += parseFloat(item.price || 0) * parseFloat(item.qty_ordered || 0);
                    });
                });
                return Array.from(productMap.values())
                    .sort((a, b) => b.qty - a.qty)
                    .slice(0, 10);
            };

            // Optimized country data processing
            const calculateCountryData = () => {
                const countryCount = new Map();
                products.forEach(product => {
                    if (product?.custom_attributes?.length) {
                        const countryAttr = product.custom_attributes.find(
                            attr => attr?.attribute_code === 'country_of_manufacture'
                        );
                        const country = countryAttr?.value || 'Unknown';
                        countryCount.set(country, (countryCount.get(country) || 0) + 1);
                    }
                });
                return Array.from(countryCount.entries())
                    .map(([country, count]) => ({ country_of_manufacture: country, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8); // Increased for better insights
            };

            // Optimized product type data processing
            const calculateProductTypeData = () => {
                const typeCount = new Map();
                products.forEach(product => {
                    const type = product?.type_id || 'unknown';
                    typeCount.set(type, (typeCount.get(type) || 0) + 1);
                });
                return Array.from(typeCount.entries())
                    .map(([type, count]) => ({
                        name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
                        value: count,
                        percentage: products.length > 0 ? (count / products.length) * 100 : 0
                    }))
                    .sort((a, b) => b.value - a.value);
            };

            // Calculate all metrics
            const stats = calculateStats();
            const bestSellers = calculateBestSellers();
            const recentOrders = [...orders]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 15); // Increased for better overview
            const countryData = calculateCountryData();
            const productTypeData = calculateProductTypeData();

            // Update state
            setStats(stats);
            setChartData(chartDataArr);
            setRecentOrders(recentOrders);
            setBestSellers(bestSellers);
            setCustomerData(customers);
            setCountryData(countryData);
            setProductTypeData(productTypeData);

            // Cache the results with shorter TTL for dynamic data
            const cacheData = {
                stats,
                chartData: chartDataArr,
                recentOrders,
                bestSellers,
                customerData: customers,
                countryData,
                productTypeData,
                timestamp: Date.now()
            };
            
            // Cache for 3 minutes for dashboard data (more dynamic)
            dashboardCache.set(cacheKey, cacheData, 3 * 60 * 1000);
            
            console.log('✅ Dashboard data fetched and cached successfully');
            return cacheData;

        } catch (error) {
            console.error('❌ Dashboard data fetch error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch dashboard data';
            setError(errorMessage);
            toast.error(`Dashboard Error: ${errorMessage}`);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, refreshKey]);
    
    // Enhanced progress tracking for stock sync
    const [syncProgress, setSyncProgress] = useState({ 
        current: 0, 
        total: 0, 
        isActive: false, 
        completed: false,
        currentStep: '',
        sources: [],
        completedSources: [],
        errorSources: [],
        message: ''
    });
    
    const reportsProgress = (completed, total) => parseInt((completed / total) * 100, 10);

    // Enhanced Sync Stocks from MDM with detailed progress tracking
    const syncAllStocks = async () => {
        try {
            console.log('🔄 Starting comprehensive stock sync from MDM...');
            
            // Initialize progress tracking
            setSyncProgress({ 
                current: 0, 
                total: 4, 
                isActive: true, 
                completed: false,
                currentStep: 'Initializing sync process...',
                sources: [],
                completedSources: [],
                errorSources: [],
                message: 'Starting comprehensive stock synchronization'
            });
            
            // Step 1: Mark stocks for sync (Local MDM level)
            setSyncProgress(prev => ({ 
                ...prev, 
                current: 0,
                currentStep: 'Marking stocks for sync',
                message: 'Preparing stock data for synchronization...'
            }));
            
            await axios.post('/api/mdm/sync-stocks');
            setSyncProgress(prev => ({ ...prev, current: 1 }));
            
            // Step 2: Get all sources
            setSyncProgress(prev => ({ 
                ...prev, 
                current: 1,
                currentStep: 'Fetching source configurations',
                message: 'Loading source configurations from MDM...'
            }));
            
            const sourcesResponse = await axios.get('/api/mdm/sources');
            const sources = sourcesResponse.data?.data || [];
            
            setSyncProgress(prev => ({ 
                ...prev, 
                current: 2, 
                sources: sources,
                message: `Found ${sources.length} sources to synchronize`
            }));
            
            // Step 3: Sync sources using the consolidated endpoint
            setSyncProgress(prev => ({ 
                ...prev, 
                current: 2,
                currentStep: 'Syncing sources to Magento',
                message: `Syncing ${sources.length} sources to Magento...`
            }));
            
            // Sync sources sequentially for better progress tracking
            const completedSources = [];
            const errorSources = [];
            
            for (let i = 0; i < sources.length; i++) {
                const source = sources[i];
                try {
                    setSyncProgress(prev => ({ 
                        ...prev,
                        message: `Syncing source ${i + 1}/${sources.length}: ${source.magentoSource || source.code_source}`
                    }));
                    
                    await axios.post('/api/mdm/sync/source', source);
                    completedSources.push(source.code_source);
                    
                    setSyncProgress(prev => ({ 
                        ...prev,
                        completedSources: [...completedSources],
                        message: `Synced ${completedSources.length}/${sources.length} sources`
                    }));
                    
                } catch (error) {
                    console.error(`Error syncing source ${source.code_source}:`, error);
                    errorSources.push(source.code_source);
                    setSyncProgress(prev => ({ 
                        ...prev,
                        errorSources: [...errorSources]
                    }));
                }
            }
            
            setSyncProgress(prev => ({ 
                ...prev, 
                current: 3,
                completedSources: completedSources,
                errorSources: errorSources,
                message: `Sync completed: ${completedSources.length} successful, ${errorSources.length} failed`
            }));
            
            // Step 4: Mark sync as successful
            setSyncProgress(prev => ({ 
                ...prev, 
                current: 3,
                currentStep: 'Finalizing sync process',
                message: 'Marking sync as successful...'
            }));
            
            await axios.post('/api/mdm/sync/success');
            
            // Complete the sync
            setSyncProgress(prev => ({ 
                ...prev, 
                current: 4,
                completed: true,
                isActive: false,
                currentStep: 'Sync completed successfully',
                message: `Successfully synchronized ${sources.length} sources to Magento`
            }));
            
            toast.success('🎉 Stock synchronization completed successfully!', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: false
            });
            // Refresh dashboard data after sync
            setTimeout(() => {
                fetchDashboardData();
                setSyncProgress({ 
                    current: 0, 
                    total: 0, 
                    isActive: false, 
                    completed: false,
                    currentStep: '',
                    sources: [],
                    completedSources: [],
                    errorSources: [],
                    message: ''
                });
            }, 3000);
            
            return { 
                success: true, 
                sourcesSynced: completedSources.length,
                totalSources: sources.length,
                failedSources: errorSources.length,
                completedSources,
                errorSources
            };
            
        } catch (error) {
            console.error('❌ Stock sync error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            
            // Update progress to show error state
            setSyncProgress(prev => ({ 
                ...prev, 
                isActive: false,
                completed: false,
                currentStep: 'Sync failed',
                message: `Sync failed: ${errorMessage}`,
                errorSources: prev.sources.map(s => s.code_source)
            }));
            
            toast.error(`❌ Failed to sync stocks: ${errorMessage}`);
            
            // Reset progress after showing error
            setTimeout(() => {
                setSyncProgress({ 
                    current: 0, 
                    total: 0, 
                    isActive: false, 
                    completed: false,
                    currentStep: '',
                    sources: [],
                    completedSources: [],
                    errorSources: [],
                    message: ''
                });
            }, 5000);
            
            throw error;
        }
    };

    // Get Prices from MDM
    const getPrices = async () => {
        try {
            console.log('🔄 Starting price sync from MDM...');
            const response = await axios.get('/api/mdm/prices');

            console.log('✅ Price sync response:', response.data);
            toast.success('✅ Price sync operation completed successfully');

            return response.data;
        } catch (error) {
            console.error('❌ Price sync error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            toast.error(`❌ Failed to sync prices: ${errorMessage}`);
            throw error;
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        stats,
        chartData,
        recentOrders,
        bestSellers,
        customerData,
        countryData,
        productTypeData,
        loading,
        error,
        getPrices,
        syncAllStocks,
        fetchDashboardData,
        syncProgress
    };
};