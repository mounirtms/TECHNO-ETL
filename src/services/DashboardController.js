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

// Configure axios base URL for backend API
const API_BASE_URL = 'http://localhost:5000/api';
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

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

    // Sync Prices
    const syncPrices = async (prices) => {
        try {
            const response = await apiClient.post('/mdm/sync-prices', prices);
            const requestItems = response.data?.request_items || [];
            const acceptedCount = requestItems.filter(item => item.status === 'accepted').length;
            if (acceptedCount === prices.length) {
                toast.success(`Prices synced successfully (${acceptedCount} items accepted)`);
            } else {
                toast.warn(`Partial sync: ${acceptedCount} of ${prices.length} items accepted`);
            }
        } catch (error) {
            console.error('❌ Price sync error:', error);
            toast.error('Failed to sync prices');
        }
    };

    // Sync Stocks from MDM
    const syncAllStocks = async () => {
        try {
            console.log('🔄 Starting stock sync from MDM...');
            const response = await apiClient.post('/mdm/sync-stocks');

            console.log('✅ Stock sync response:', response.data);
            toast.success('✅ Stock sync operation completed successfully');

            // Refresh dashboard data after sync
            setTimeout(() => {
                fetchDashboardData();
            }, 2000);

            return response.data;
        } catch (error) {
            console.error('❌ Stock sync error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            toast.error(`❌ Failed to sync stocks: ${errorMessage}`);
            throw error;
        }
    };

    // Get Prices from MDM
    const getPrices = async () => {
        try {
            console.log('🔄 Starting price sync from MDM...');
            const response = await apiClient.get('/mdm/sync-prices');

            console.log('✅ Price sync response:', response.data);
            toast.success('✅ Price sync operation completed successfully');

            // Refresh dashboard data after sync
            setTimeout(() => {
                fetchDashboardData();
            }, 2000);

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
        fetchDashboardData
    };
};