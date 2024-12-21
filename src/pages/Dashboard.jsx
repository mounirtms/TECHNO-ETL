import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Paper,
    TextField,
    Button,
    Typography,
    useMediaQuery,
    IconButton,
    CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import arLocale from 'date-fns/locale/ar-SA';
import { StatsCards } from '../components/common/StatsCards';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import magentoApi from '../services/magentoApi';
import { toast } from 'react-toastify';
import { DRAWER_WIDTH, COLLAPSED_WIDTH, HEADER_HEIGHT, FOOTER_HEIGHT, DASHBOARD_TAB_HEIGHT } from '../components/Layout/Constants';

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
    averageOrderValue: 0
};

const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return { start, end };
};

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

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Format dates for API
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];

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

            // Process orders data
            const orders = ordersResponse?.items || [];
            const ordersByDate = {};
            let totalRevenue = 0;

            orders.forEach(order => {
                const date = new Date(order.created_at).toLocaleDateString();
                if (!ordersByDate[date]) {
                    ordersByDate[date] = {
                        count: 0,
                        revenue: 0
                    };
                }
                ordersByDate[date].count++;
                ordersByDate[date].revenue += parseFloat(order.grand_total || 0);
                totalRevenue += parseFloat(order.grand_total || 0);
            });

            // Create chart data
            const chartData = Object.keys(ordersByDate).map(date => ({
                date: new Date(date),
                orders: ordersByDate[date].count,
                revenue: ordersByDate[date].revenue
            })).sort((a, b) => a.date - b.date);

            setChartData(chartData);
            setStats({
                totalOrders: orders.length,
                totalCustomers: customersResponse?.total_count || 0,
                totalProducts: productsResponse?.total_count || 0,
                totalRevenue: totalRevenue,
                averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
            });

        } catch (error) {
            console.error('API fetch failed, attempting to load from local data:', error);
            const localData = await magentoApi.getLocalData('orders');
            if (localData) {
                processLocalData(localData);
            } else {
                setError('Failed to fetch dashboard data');
                toast.error('Error loading dashboard data');
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

        const ordersByDate = {};
        let totalRevenue = 0;

        filteredData.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString();
            if (!ordersByDate[date]) {
                ordersByDate[date] = {
                    count: 0,
                    revenue: 0
                };
            }
            ordersByDate[date].count++;
            ordersByDate[date].revenue += parseFloat(order.grand_total || 0);
            totalRevenue += parseFloat(order.grand_total || 0);
        });

        const chartData = Object.keys(ordersByDate).map(date => ({
            date: new Date(date),
            orders: ordersByDate[date].count,
            revenue: ordersByDate[date].revenue
        })).sort((a, b) => a.date - b.date);

        setChartData(chartData);
        setStats({
            totalOrders: filteredData.length,
            totalCustomers: 0, // Set to 0 or fetch from local data
            totalProducts: 0, // Set to 0 or fetch from local data
            totalRevenue: totalRevenue,
            averageOrderValue: filteredData.length > 0 ? totalRevenue / filteredData.length : 0
        });
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    useEffect(() => {
        fetchDashboardData();
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
                        gap: 2
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
                                sx: { width: 150 }
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
                                sx: { width: 150 }
                            }
                        }}
                    />
                    <IconButton 
                        onClick={handleRefresh}
                        disabled={loading}
                        sx={{ ml: 'auto' }}
                    >
                        <RefreshIcon />
                    </IconButton>
                    <IconButton>
                        <SettingsIcon />
                    </IconButton>
                </Paper>

                {/* Loading Indicator */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Stats Cards */}
                <Grid item xs={12}>
                    <StatsCards
                        cards={[
                            {
                                title: 'Total Orders',
                                value: stats.totalOrders,
                                icon: ShoppingCartIcon,
                                color: 'primary'
                            },
                            {
                                title: 'Total Customers',
                                value: stats.totalCustomers,
                                icon: PeopleIcon,
                                color: 'success'
                            },
                            {
                                title: 'Total Products',
                                value: stats.totalProducts,
                                icon: InventoryIcon,
                                color: 'info'
                            },
                            {
                                title: 'Total Revenue',
                                value: formatCurrency(stats.totalRevenue),
                                icon: AttachMoneyIcon,
                                color: 'warning'
                            },
                            {
                                title: 'Average Order Value',
                                value: formatCurrency(stats.averageOrderValue),
                                icon: TrendingUpIcon,
                                color: 'secondary'
                            }
                        ]}
                    />
                </Grid>

                {/* Charts */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, height: '400px' }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date"
                                    tickFormatter={(date) => formatChartDate(date)}
                                    interval="preserveStartEnd"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis 
                                    yAxisId="left" 
                                    tickFormatter={(value) => Math.round(value)}
                                />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right"
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip 
                                    labelFormatter={(date) => formatTooltipDate(date)}
                                    formatter={(value, name) => [
                                        name === 'revenue' ? formatCurrency(value) : Math.round(value),
                                        name === 'revenue' ? 'Revenue' : 'Orders'
                                    ]}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="orders"
                                    stroke={theme.palette.primary.main}
                                    name="Orders"
                                    dot={false}
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={theme.palette.secondary.main}
                                    name="Revenue"
                                    dot={false}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default Dashboard;