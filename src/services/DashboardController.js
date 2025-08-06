import { useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCustomTheme } from '../contexts/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import magentoApi from './magentoApi';
import { toast } from 'react-toastify';
import axios from 'axios';

 

export const useDashboardController = (startDate, endDate, refreshKey) => {
    const { currentUser } = useAuth();
    const { setLanguage } = useLanguage();
    const themeCtx = useCustomTheme();
    const theme = useMuiTheme();
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
    
    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const ordersByTime = {};
        try {
            const formattedStartDate = startDate.toISOString();
            const formattedEndDate = endDate.toISOString();

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
                pageSize: 100,
                currentPage: 1,
                sortOrders: [{
                    field: 'created_at',
                    direction: 'DESC'
                }]
            };

            const [ordersResponse, customersResponse, productsResponse] = await Promise.all([
                magentoApi.getOrders(ordersParams),
                magentoApi.getCustomers({ pageSize: 100 }),
                magentoApi.getProducts({ pageSize: 100 })
            ]);

            const orders = ordersResponse?.items || [];
            const customers = customersResponse?.items || [];
            const products = productsResponse?.items || [];
            let totalRevenue = 0;

            // Build chart data
            const startTimestamp = startDate.setHours(0, 0, 0, 0);
            const endTimestamp = endDate.setHours(0, 0, 0, 0);
            ordersByTime[startTimestamp] = { count: 0, revenue: 0, key: `day-${startTimestamp}` };
            ordersByTime[endTimestamp] = { count: 0, revenue: 0, key: `day-${endTimestamp}` };

            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const timestamp = currentDate.setHours(0, 0, 0, 0);
                if (!ordersByTime[timestamp]) {
                    ordersByTime[timestamp] = {
                        count: 0,
                        revenue: 0,
                        key: `day-${timestamp}`
                    };
                }
                currentDate = new Date(currentDate.getTime() + 86400000);
            }

            orders.forEach(order => {
                const orderDate = new Date(order.created_at);
                if (orderDate >= startDate && orderDate <= endDate) {
                    const timestamp = orderDate.setHours(0, 0, 0, 0);
                    if (!ordersByTime[timestamp]) {
                        ordersByTime[timestamp] = {
                            count: 0,
                            revenue: 0,
                            key: `day-${timestamp}`
                        };
                    }
                    ordersByTime[timestamp].count++;
                    const orderTotal = parseFloat(order.grand_total || 0);
                    ordersByTime[timestamp].revenue += orderTotal;
                    totalRevenue += orderTotal;
                }
            });

            const chartDataArr = Object.entries(ordersByTime)
                .map(([timestamp, data]) => ({
                    date: parseInt(timestamp),
                    orders: data.count || 0,
                    revenue: data.revenue || 0,
                    key: data.key
                }))
                .sort((a, b) => a.date - b.date);

            setChartData(chartDataArr);

            // Stats
            const newCustomers = customers.filter(c =>
                new Date(c.created_at) >= startDate && new Date(c.created_at) <= endDate
            ).length;

            setStats({
                totalOrders: orders.length,
                totalCustomers: customersResponse?.total_count || 0,
                totalProducts: productsResponse?.total_count || 0,
                totalRevenue: totalRevenue,
                averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
                totalValue: products.reduce((acc, p) => acc + (parseFloat(p.price) * (p.qty || 0)), 0),
                newCustomers
            });

            // Recent Orders
            setRecentOrders([...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10));

            // Best Sellers
            const productMap = {};
            orders.forEach(order => {
                (order.items || []).forEach(item => {
                    if (!productMap[item.sku]) {
                        productMap[item.sku] = { sku: item.sku, name: item.name, qty: 0 };
                    }
                    productMap[item.sku].qty += item.qty_ordered || 0;
                });
            });
            setBestSellers(Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 10));

            setCustomerData(customers);

            // Country Data
            const countryCount = {};
            products.forEach(product => {
                if (product && Array.isArray(product.custom_attributes)) {
                    const countryAttr = product.custom_attributes.find(
                        attr => attr && attr.attribute_code === 'country_of_manufacture'
                    );
                    const country = countryAttr?.value || 'Unknown';
                    countryCount[country] = (countryCount[country] || 0) + 1;
                }
            });
            setCountryData(Object.entries(countryCount)
                .map(([country, count]) => ({
                    country_of_manufacture: country,
                    count: count
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5));

            // Product Type Data
            const typeCount = {};
            products.forEach(product => {
                const type = product?.type_id || 'unknown';
                typeCount[type] = (typeCount[type] || 0) + 1;
            });
            setProductTypeData(Object.entries(typeCount)
                .map(([type, count]) => ({
                    name: type.charAt(0).toUpperCase() + type.slice(1),
                    value: count
                }))
                .sort((a, b) => b.value - a.value));

        } catch (error) {
            setError('Failed to fetch dashboard data');
            toast.error('Failed to fetch dashboard data');
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
            
            await axios.post('/api/mdm/sync/stocks');
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