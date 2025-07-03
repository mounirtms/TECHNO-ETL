import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    useMediaQuery,
    IconButton,
    CircularProgress,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Chip
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import arLocale from 'date-fns/locale/ar-SA';
import { StatsCards } from '../components/common/StatsCards';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/SyncAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import magentoApi from '../services/magentoApi';
import { toast } from 'react-toastify';
import { DRAWER_WIDTH, COLLAPSED_WIDTH, HEADER_HEIGHT, FOOTER_HEIGHT, DASHBOARD_TAB_HEIGHT } from '../components/Layout/Constants';
import { sync } from 'framer-motion';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

// Format currency in DZD

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-DZ', {
        style: 'currency',
        currency: 'DZD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// Format date in Arabic
const formatDate = (date) => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return '';
        }

        return new Intl.DateTimeFormat('ar', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(dateObj);
    } catch (error) {
        console.warn('Date formatting error:', error);
        return '';
    }
};

// Format date for chart display
const formatChartDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    }).format(dateObj);
};

// Format date for tooltip
const formatTooltipDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(dateObj);
};

// Smart tick formatter for X axis
const formatXAxis = (tickItem, days) => {
    if (!tickItem) return '';

    // If we have more than 14 days, only show every other day
    if (days > 14) {
        const date = tickItem.split('/');
        const dayNum = parseInt(date[0]);
        // Only show even numbered days
        if (dayNum % 2 !== 0) {
            return '';
        }
    }
    return tickItem;
};

const initialStats = {
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalValue: 0
};

const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return { start, end };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6699', '#FF33CC'];


const Dashboard = () => {
    const theme = useTheme();
    const defaultRange = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultRange.start);
    const [endDate, setEndDate] = useState(defaultRange.end);
    const [stats, setStats] = useState(initialStats);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [error, setError] = useState(null);
    const [productData, setProductData] = useState([]);
    const [countryData, setCountryData] = useState([]);
    const [productTypeData, setProductTypeData] = useState([]);
    const [excelData, setExcelData] = useState(null);
    const [chartType, setChartType] = useState('line'); // 'line', 'bar', 'pie', 'table'
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
    const [visibleCharts, setVisibleCharts] = useState({
        orders: true,
        customers: false,
        products: true,
        attributes: true
    });

    // Chart type options for menu and toolbar
    const chartTypeOptions = [
        { value: 'line', label: 'Line', icon: <ShowChartIcon color="primary" /> },
        { value: 'bar', label: 'Bar', icon: <BarChartIcon color="info" /> },
        { value: 'pie', label: 'Pie', icon: <PieChartIcon color="secondary" /> },
        { value: 'table', label: 'Table', icon: <TableChartIcon color="action" /> }
    ];

    // Settings menu handlers
    const handleSettingsOpen = (event) => {
        setSettingsAnchorEl(event.currentTarget);
    };
    const handleSettingsClose = () => {
        setSettingsAnchorEl(null);
    };
    const handleToggleChart = (chartKey) => {
        setVisibleCharts(prev => ({ ...prev, [chartKey]: !prev[chartKey] }));
    };

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            setExcelData(json);
            // Send data to the server
            axios.post('/api/mdm/excel', json)
                .then(response => {
                    toast.success('Excel file uploaded successfully');
                })
                .catch(error => {
                    toast.error('Failed to upload Excel file');
                });
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Format dates for API with time
            const formattedStartDate = startDate.toISOString();
            const formattedEndDate = endDate.toISOString();

            console.log('Fetching data with date range:', { formattedStartDate, formattedEndDate });

            // Fetch orders with date range
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
                magentoApi.getCustomers({ pageSize: 1 }),
                magentoApi.getProducts({ pageSize: 1 })
            ]);

            console.log('Orders response:', ordersResponse);
            console.log('Customers response:', customersResponse);
            console.log('Products response:', productsResponse);

            // Process orders data with exact timestamps
            const orders = ordersResponse?.items || [];
            const ordersByTime = {};
            let totalRevenue = 0;

            // Create initial data points for start and end dates
            const startTimestamp = startDate.setHours(0, 0, 0, 0);
            const endTimestamp = endDate.setHours(0, 0, 0, 0);
            ordersByTime[startTimestamp] = { count: 0, revenue: 0, key: `day-${startTimestamp}` };
            ordersByTime[endTimestamp] = { count: 0, revenue: 0, key: `day-${endTimestamp}` };

            // Add intermediate points every day
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
                currentDate = new Date(currentDate.getTime() + 86400000); // Add one day
            }

            orders.forEach(order => {
                const orderDate = new Date(order.created_at);
                // Only process orders within the date range
                if (orderDate >= startDate && orderDate <= endDate) {
                    const timestamp = orderDate.setHours(0, 0, 0, 0); // Group by day
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

            // Create chart data with exact timestamps and unique keys
            const chartData = Object.entries(ordersByTime)
                .map(([timestamp, data]) => ({
                    date: parseInt(timestamp),
                    orders: data.count || 0,
                    revenue: data.revenue || 0,
                    key: data.key
                }))
                .sort((a, b) => a.date - b.date);

            console.log('Processed chart data:', chartData);

            setChartData(chartData);
            setStats({
                totalOrders: orders.length,
                totalCustomers: customersResponse?.total_count || 0,
                totalProducts: productsResponse?.total_count || 0,
                totalRevenue: totalRevenue,
                averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
            });

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Try to get local data if API fails
            const localData = await magentoApi.getLocalData('orders');
            if (localData) {
                processLocalData(localData);
            } else {
                setError('Failed to fetch dashboard data');
                toast.error('Failed to fetch dashboard data');
            }
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    const processLocalData = (localData) => {
        const filteredData = localData.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= startDate && orderDate <= endDate;
        });

        const ordersByTime = {};
        let totalRevenue = 0;

        // Create initial data points for start and end dates
        const startTimestamp = startDate.setHours(0, 0, 0, 0);
        const endTimestamp = endDate.setHours(0, 0, 0, 0);
        ordersByTime[startTimestamp] = { count: 0, revenue: 0, key: `day-${startTimestamp}` };
        ordersByTime[endTimestamp] = { count: 0, revenue: 0, key: `day-${endTimestamp}` };

        // Add intermediate points every day
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
            currentDate = new Date(currentDate.getTime() + 86400000); // Add one day
        }

        filteredData.forEach(order => {
            const orderDate = new Date(order.created_at);
            const timestamp = orderDate.setHours(0, 0, 0, 0); // Group by day
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
        });

        // Create chart data with exact timestamps and unique keys
        const chartData = Object.entries(ordersByTime)
            .map(([timestamp, data]) => ({
                date: parseInt(timestamp),
                orders: data.count || 0,
                revenue: data.revenue || 0,
                key: data.key
            }))
            .sort((a, b) => a.date - b.date);

        setChartData(chartData);
        setStats({
            totalOrders: filteredData.length,
            totalCustomers: 0, // Set to 0 or fetch from local data
            totalProducts: 0, // Set to 0 or fetch from local data
            totalRevenue: totalRevenue,
            averageOrderValue: filteredData.length > 0 ? totalRevenue / filteredData.length : 0
        });
    };

    const getPrices = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/mdm/prices');

            // Convert data into Magento bulk format
            const priceData = response.data.map(({ sku, price }) => ({
                product: {
                    sku,
                    price: parseFloat(price) // Ensure it's a valid number
                }
            }));

            console.log('📊 Price data:', priceData);
            await syncPrices(priceData);
        } catch (error) {
            console.error('❌ Failed to fetch prices:', error);
            toast.error('Failed to fetch prices');
        }
    };
    const syncPrices = async (prices) => {
        try {
            const response = await axios.post('http://localhost:5000/api/techno/prices-sync', prices);
            console.log('📦 Sync response:', response.data);
            toast.success('Prices synced successfully');
        } catch (error) {
            console.error('❌ Failed to sync prices:', error);
            toast.error('Failed to sync prices');
        }
    };


    const fetchProductData = async () => {
        try {
            const response = await magentoApi.getProducts({
                pageSize: 100,
                currentPage: 1
            });

            if (response?.data?.items) {
                const products = response.data.items.map(product => ({
                    ...product,
                    id: product.id || product.entity_id,
                    qty: product.qty || 0,
                    is_in_stock: product.is_in_stock || false,
                    status: product.status === 1 ? 'enabled' : 'disabled',
                    price: parseFloat(product.price) || 0,
                    special_price: product.special_price ? parseFloat(product.special_price) : null,
                    created_at: product.created_at ? new Date(product.created_at).toISOString() : null,
                    updated_at: product.updated_at ? new Date(product.updated_at).toISOString() : null
                }));
                setProductData(products);
                processCountryData(products);
                processProductCountData(products);

                // Update stats with product data
                setStats(prevStats => ({
                    ...prevStats,
                    totalProducts: products.length,
                    totalValue: products.reduce((acc, p) => acc + (p.price * (p.qty || 0)), 0)
                }));
            } else {
                throw new Error('Invalid product data format');
            }
        } catch (error) {
            console.error('Failed to fetch product data:', error);
            toast.error('Failed to load product data');
            // Set default values on error
            setProductData([]);
            setStats(prevStats => ({
                ...prevStats,
                totalProducts: 0,
                totalValue: 0
            }));
        }
    };

    const processCountryData = (products) => {
        if (!Array.isArray(products)) {
            console.error('Products data is not an array:', products);
            return;
        }

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

        const formattedData = Object.entries(countryCount)
            .map(([country, count]) => ({
                country_of_manufacture: country,
                count: count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Only take top 5 countries

        setCountryData(formattedData);
    };

    const processProductCountData = (products) => {
        if (!Array.isArray(products)) {
            console.error('Products data is not an array:', products);
            return;
        }

        const typeCount = {};
        products.forEach(product => {
            const type = product?.type_id || 'unknown';
            typeCount[type] = (typeCount[type] || 0) + 1;
        });

        const formattedData = Object.entries(typeCount)
            .map(([type, count]) => ({
                name: type.charAt(0).toUpperCase() + type.slice(1),
                value: count
            }))
            .sort((a, b) => b.value - a.value);

        setProductTypeData(formattedData);
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    useEffect(() => {
        fetchDashboardData();
        fetchProductData();
    }, [fetchDashboardData, refreshKey]);


    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arLocale}>


            <Box sx={{ p: 3, height: '100%' }}>
                {/* Date Range and Controls */}
                <Paper
                    sx={{
                        p: 2,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        background: 'linear-gradient(90deg, #f5f7fa 0%, #c3cfe2 100%)',
                        boxShadow: 8,
                        borderRadius: 3
                    }}
                >
                    <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={setStartDate}
                        maxDate={endDate}
                        slotProps={{
                            textField: {
                                size: "small",
                                sx: { width: 150, background: '#fff', borderRadius: 2 }
                            }
                        }}
                    />
                    <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={setEndDate}
                        minDate={startDate}
                        slotProps={{
                            textField: {
                                size: "small",
                                sx: { width: 150, background: '#fff', borderRadius: 2 }
                            }
                        }}
                    />

                    {/* Slick Sync Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, ml: 3 }}>
                        <Button
                            onClick={getPrices}
                            startIcon={<SyncIcon />}
                            variant="contained"
                            color="primary"
                            sx={{
                                px: 2.5,
                                py: 1,
                                borderRadius: 3,
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(25,118,210,0.10)',
                                textTransform: 'none',
                                background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                                '&:hover': { background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)' }
                            }}
                        >
                            Sync Prices
                        </Button>
                        <Button
                            onClick={async () => {
                                try {
                                    await axios.post('http://localhost:5000/api/mdm/inventory/sync-all-stocks-sources');
                                    toast.success('Sync all sources operation started.');
                                } catch (error) {
                                    toast.error('Failed to sync all sources.');
                                }
                            }}
                            startIcon={<SyncIcon />}
                            variant="contained"
                            color="success"
                            sx={{
                                px: 2.5,
                                py: 1,
                                borderRadius: 3,
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(76,175,80,0.10)',
                                textTransform: 'none',
                                background: 'linear-gradient(90deg, #43a047 0%, #a5d6a7 100%)',
                                '&:hover': { background: 'linear-gradient(90deg, #388e3c 0%, #81c784 100%)' }
                            }}
                        >
                            Sync Stocks
                        </Button>
                    </Box>

                    {/* Refresh Button */}
                    <IconButton
                        onClick={handleRefresh}
                        disabled={loading}
                        sx={{ ml: 2, background: '#fff', borderRadius: 2, boxShadow: 2, '&:hover': { background: '#e3f2fd' } }}
                    >
                        <RefreshIcon color="primary" />
                    </IconButton>

                    {/* Settings Button with Menu */}
                    <Tooltip title="Dashboard Settings" arrow>
                        <IconButton onClick={handleSettingsOpen} sx={{ ml: 2, background: '#fff', borderRadius: 2, boxShadow: 2, '&:hover': { background: '#fce4ec' } }}>
                            <SettingsIcon color="action" />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={settingsAnchorEl}
                        open={Boolean(settingsAnchorEl)}
                        onClose={handleSettingsClose}
                        PaperProps={{ sx: { minWidth: 240, borderRadius: 2, boxShadow: 6 } }}
                    >
                        <Typography variant="subtitle2" sx={{ px: 2, pt: 1, fontWeight: 700 }}>Show/Hide Charts</Typography>
                        <MenuItem onClick={() => handleToggleChart('orders')}> <ListItemIcon><BarChartIcon color={visibleCharts.orders ? 'primary' : 'disabled'} /></ListItemIcon> <ListItemText>Orders Chart</ListItemText> {visibleCharts.orders && <Chip size="small" label="On" color="primary" />} </MenuItem>
                        <MenuItem onClick={() => handleToggleChart('customers')}> <ListItemIcon><PeopleIcon color={visibleCharts.customers ? 'success' : 'disabled'} /></ListItemIcon> <ListItemText>Customers Chart</ListItemText> {visibleCharts.customers && <Chip size="small" label="On" color="success" />} </MenuItem>
                        <MenuItem onClick={() => handleToggleChart('products')}> <ListItemIcon><InventoryIcon color={visibleCharts.products ? 'info' : 'disabled'} /></ListItemIcon> <ListItemText>Products Chart</ListItemText> {visibleCharts.products && <Chip size="small" label="On" color="info" />} </MenuItem>
                        <MenuItem onClick={() => handleToggleChart('attributes')}> <ListItemIcon><SettingsIcon color={visibleCharts.attributes ? 'secondary' : 'disabled'} /></ListItemIcon> <ListItemText>Attributes Chart</ListItemText> {visibleCharts.attributes && <Chip size="small" label="On" color="secondary" />} </MenuItem>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" sx={{ px: 2, pt: 1, fontWeight: 700 }}>Chart Type</Typography>
                        {chartTypeOptions.map(opt => (
                            <MenuItem key={opt.value} onClick={() => { setChartType(opt.value); handleSettingsClose(); }} selected={chartType === opt.value}>
                                <ListItemIcon>{opt.icon}</ListItemIcon>
                                <ListItemText>{opt.label}</ListItemText>
                                {chartType === opt.value && <Chip size="small" label="Active" color="primary" />}
                            </MenuItem>
                        ))}
                    </Menu>
                </Paper>



                {/* Loading Indicator */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Stats Cards */}
                <Box sx={{ mt: 3 }}>
                    <StatsCards
                        cards={[
                            { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCartIcon, color: 'primary' },
                            { title: 'Total Customers', value: stats.totalCustomers, icon: PeopleIcon, color: 'success' },
                            { title: 'Total Products', value: stats.totalProducts, icon: InventoryIcon, color: 'info' },
                            { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: AttachMoneyIcon, color: 'warning' },
                            { title: 'Avg. Order Value', value: formatCurrency(stats.averageOrderValue), icon: TrendingUpIcon, color: 'secondary' },
                            { title: 'Total Value', value: formatCurrency(stats.totalValue), icon: AttachMoneyIcon, color: 'warning' }
                        ]}
                    />
                </Box>

                {/* Charts */}
                {visibleCharts.orders && (
                    <Box sx={{ mt: 3 }}>
                        <Paper sx={{ p: 2, height: '420px', background: 'linear-gradient(120deg, #e3f2fd 0%, #fce4ec 100%)', boxShadow: 6, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                                {chartTypeOptions.map(opt => (
                                    <Tooltip key={opt.value} title={opt.label + ' Chart'} arrow>
                                        <IconButton
                                            onClick={() => setChartType(opt.value)}
                                            color={chartType === opt.value ? 'primary' : 'default'}
                                            sx={{
                                                mx: 0.5,
                                                border: chartType === opt.value ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                                background: chartType === opt.value ? '#e3f2fd' : '#fff',
                                                borderRadius: 2,
                                                boxShadow: chartType === opt.value ? 2 : 0
                                            }}
                                        >
                                            {opt.icon}
                                        </IconButton>
                                    </Tooltip>
                                ))}
                            </Box>
                            <ResponsiveContainer>
                                {chartType === 'line' && (
                                    <LineChart data={chartData} margin={{ top: 30, right: 40, left: 10, bottom: 30 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#bdbdbd" />
                                        <XAxis dataKey="date" tickFormatter={formatChartDate} interval="preserveStartEnd" angle={-35} textAnchor="end" height={60} stroke="#1976d2" fontSize={13} />
                                        <YAxis yAxisId="left" tickFormatter={value => Math.round(value)} stroke="#1976d2" fontSize={13} />
                                        <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} stroke="#d32f2f" fontSize={13} />
                                        <RechartsTooltip 
                                            contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                                            labelFormatter={formatTooltipDate}
                                            formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : Math.round(value), name === 'revenue' ? 'Revenue' : 'Orders']}
                                        />
                                        <Legend iconType="circle" verticalAlign="top" height={36} />
                                        <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#1976d2" name="Orders" dot={{ r: 5, fill: '#fff', stroke: '#1976d2', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#1976d2', stroke: '#fff', strokeWidth: 2 }} strokeWidth={3} />
                                        <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#d32f2f" name="Revenue" dot={{ r: 5, fill: '#fff', stroke: '#d32f2f', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#d32f2f', stroke: '#fff', strokeWidth: 2 }} strokeWidth={3} />
                                    </LineChart>
                                )}
                                {chartType === 'bar' && (
                                    <BarChart data={chartData} margin={{ top: 30, right: 40, left: 10, bottom: 30 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#bdbdbd" />
                                        <XAxis dataKey="date" tickFormatter={formatChartDate} interval="preserveStartEnd" angle={-35} textAnchor="end" height={60} stroke="#1976d2" fontSize={13} />
                                        <YAxis yAxisId="left" tickFormatter={value => Math.round(value)} stroke="#1976d2" fontSize={13} />
                                        <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} stroke="#d32f2f" fontSize={13} />
                                        <RechartsTooltip 
                                            contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                                            labelFormatter={formatTooltipDate}
                                            formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : Math.round(value), name === 'revenue' ? 'Revenue' : 'Orders']}
                                        />
                                        <Legend iconType="circle" verticalAlign="top" height={36} />
                                        <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#1976d2" radius={[8, 8, 0, 0]} barSize={24} />
                                        <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#d32f2f" radius={[8, 8, 0, 0]} barSize={24} />
                                    </BarChart>
                                )}
                                {chartType === 'pie' && (
                                    <PieChart>
                                        <Pie data={chartData} dataKey="orders" nameKey="date" cx="50%" cy="50%" outerRadius={120} fill="#1976d2" label={entry => formatChartDate(entry.date)}>
                                            {chartData.map((entry, idx) => (
                                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                    </PieChart>
                                )}
                                {chartType === 'table' && (
                                    <Box sx={{ p: 2, overflow: 'auto', maxHeight: 340 }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                            <thead>
                                                <tr style={{ background: '#e3f2fd' }}>
                                                    <th style={{ padding: 8, border: '1px solid #bdbdbd' }}>Date</th>
                                                    <th style={{ padding: 8, border: '1px solid #bdbdbd' }}>Orders</th>
                                                    <th style={{ padding: 8, border: '1px solid #bdbdbd' }}>Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {chartData.map(row => (
                                                    <tr key={row.key}>
                                                        <td style={{ padding: 8, border: '1px solid #bdbdbd' }}>{formatChartDate(row.date)}</td>
                                                        <td style={{ padding: 8, border: '1px solid #bdbdbd' }}>{row.orders}</td>
                                                        <td style={{ padding: 8, border: '1px solid #bdbdbd' }}>{formatCurrency(row.revenue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </Box>
                                )}
                            </ResponsiveContainer>
                        </Paper>
                    </Box>
                )}
                {/* Enhanced Bar Charts for Country of Manufacture and Product Counts */}
                {(visibleCharts.products || visibleCharts.attributes) && (
                  <Box sx={{ display: 'flex', flexWrap: "wrap", gap: 3, mt: 3 }}>
                    {visibleCharts.products && (
                      <Box sx={{ flex: 1, minWidth: 300 }}>
                        <Paper sx={{ p: 2, boxShadow: 6, borderRadius: 3, background: 'linear-gradient(120deg, #e3f2fd 0%, #fce4ec 100%)' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>Country of Manufacture</Typography>
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={countryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#bdbdbd" />
                              <XAxis dataKey="country_of_manufacture" stroke="#1976d2" fontSize={13} />
                              <YAxis stroke="#1976d2" fontSize={13} />
                              <RechartsTooltip cursor={{ fill: 'rgba(25, 118, 210, 0.08)' }} contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
                              <Legend verticalAlign="top" height={36} iconType="circle" />
                              <Bar dataKey="count" fill="#1976d2" barSize={30} radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Box>
                    )}
                    {visibleCharts.attributes && (
                      <Box sx={{ flex: 1, minWidth: 300 }}>
                        <Paper sx={{ p: 2, boxShadow: 6, borderRadius: 3, background: 'linear-gradient(120deg, #fce4ec 0%, #e3f2fd 100%)' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>Product Types</Typography>
                          <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                              <Pie data={productTypeData} cx="50%" cy="50%" outerRadius={90} fill="#d32f2f" dataKey="value" label={entry => entry.name}
                                labelLine={false}
                                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))' }}
                              >
                                {productTypeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
                              <Legend verticalAlign="top" height={36} iconType="circle" />
                            </PieChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default Dashboard;