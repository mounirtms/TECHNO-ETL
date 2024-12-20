import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Paper,
    TextField,
    Button,
    Typography,
    useMediaQuery
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
import magentoApi from '../services/magentoService';
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

const initialStats = {
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    averageOrderValue: 0
};

const getLastMonthDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
};

const Dashboard = () => {
    // Calculate available height for content
    const calculateContentHeight = () => {
        const windowHeight = window.innerHeight;
        const statsCardHeight = DASHBOARD_TAB_HEIGHT;
        const headerHeight = HEADER_HEIGHT;
        const footerHeight = FOOTER_HEIGHT;
        return windowHeight - (headerHeight + statsCardHeight + footerHeight + 40); // Extra padding
    };

    // State declarations
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(initialStats);
    const [orderTrends, setOrderTrends] = useState([]);
    const [revenueTrends, setRevenueTrends] = useState([]);
    const [contentHeight, setContentHeight] = useState(calculateContentHeight());
    const [startDate, setStartDate] = useState(getLastMonthDate());
    const [endDate, setEndDate] = useState(new Date());
    const [lastFetch, setLastFetch] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchDashboardData = async (force = false) => {
        try {
            if (!force && lastFetch && (Date.now() - lastFetch) < CACHE_DURATION) {
                return; // Use cached dashboard state
            }

            setLoading(true);

            // Format dates for API requests
            const formattedStartDate = startDate.toISOString();
            const formattedEndDate = endDate.toISOString();

            // Create date filter object
            const dateFilter = {
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
                }]
            };

            // Parallel fetch all required data
            const [orderResponse, customerResponse, productResponse] = await Promise.all([
                magentoApi.getOrders(dateFilter),
                magentoApi.getCustomers(dateFilter),
                magentoApi.getProducts({})
            ]);

            // Ensure we have valid data
            const orders = orderResponse?.items || [];
            const totalRevenue = orders.reduce((sum, order) => sum + Number(order.grand_total || 0), 0);

            // Calculate stats
            const newStats = {
                totalOrders: orderResponse?.total_count || 0,
                totalCustomers: customerResponse?.total_count || 0,
                totalProducts: productResponse?.total_count || 0,
                totalRevenue: totalRevenue,
                averageOrderValue: orders.length ? totalRevenue / orders.length : 0
            };

            setStats(newStats);

            // Calculate trends
            if (orders.length > 0) {
                const trends = calculateTrends(orders, startDate, endDate);
                setOrderTrends(trends.orderTrends);
                setRevenueTrends(trends.revenueTrends);
            }

            setLastFetch(Date.now());
            toast.success('Dashboard data updated successfully');
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load some dashboard data');
            
            // Still update UI with any partial data we have
            if (error.response?.data) {
                const { orders, customers, products } = error.response.data;
                setStats(prev => ({
                    ...prev,
                    totalOrders: orders?.total_count || prev.totalOrders,
                    totalCustomers: customers?.total_count || prev.totalCustomers,
                    totalProducts: products?.total_count || prev.totalProducts
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateTrends = useCallback((orders, startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        // Initialize arrays for all dates in range, excluding Fridays
        const dateArray = Array.from({ length: days + 1 }, (_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            // Skip Fridays (5 is Friday in JavaScript's getDay())
            return date.getDay() !== 5 ? date.toISOString().split('T')[0] : null;
        }).filter(Boolean); // Remove null values (Fridays)

        // Initialize data objects with 0 values for all dates except Fridays
        const ordersByDate = Object.fromEntries(dateArray.map(date => [date, 0]));
        const revenueByDate = Object.fromEntries(dateArray.map(date => [date, 0]));

        // Aggregate orders within date range, excluding Fridays
        orders.forEach(order => {
            const orderDate = new Date(order.created_at);
            if (orderDate >= start && orderDate <= end && orderDate.getDay() !== 5) {
                const dateKey = orderDate.toISOString().split('T')[0];
                if (dateKey in ordersByDate) {
                    ordersByDate[dateKey] = (ordersByDate[dateKey] || 0) + 1;
                    revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + Number(order.grand_total || 0);
                }
            }
        });

        // Format date as DD/MM
        const formatChartDate = (dateStr) => {
            const date = new Date(dateStr);
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        };

        // Convert to arrays for charts, sort by date
        const orderTrends = Object.entries(ordersByDate)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, count]) => ({
                date: formatChartDate(date),
                Orders: count
            }));

        const revenueTrends = Object.entries(revenueByDate)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, revenue]) => ({
                date: formatChartDate(date),
                Revenue: revenue
            }));

        return { orderTrends, revenueTrends };
    }, []);

    const renderCharts = useCallback(() => {
        if (!orderTrends.length || !revenueTrends.length) return null;

        const height = Math.max(300, (contentHeight - DASHBOARD_TAB_HEIGHT - 32));

        return (
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2, height }}>
                        <Typography variant="h6" gutterBottom>
                            Orders
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart
                                data={orderTrends}
                                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={0}
                                    tickFormatter={(value) => value}
                                />
                                <YAxis domain={[0, 'auto']} />
                                <Tooltip labelFormatter={(value) => `Date: ${value}`} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="Orders"
                                    stroke="#8884d8"
                                    activeDot={{ r: 8 }}
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2, height }}>
                        <Typography variant="h6" gutterBottom>
                            Revenue
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart
                                data={revenueTrends}
                                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={0}
                                    tickFormatter={(value) => value}
                                />
                                <YAxis 
                                    domain={[0, 'auto']}
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip 
                                    labelFormatter={(value) => `Date: ${value}`}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="Revenue"
                                    stroke="#82ca9d"
                                    activeDot={{ r: 8 }}
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        );
    }, [orderTrends, revenueTrends, contentHeight]);

    useEffect(() => {
        const handleResize = () => {
            setContentHeight(calculateContentHeight());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Refresh data when dates change
    useEffect(() => {
        fetchDashboardData(true);
    }, [startDate, endDate]);

    // Initial data fetch
    useEffect(() => {
        fetchDashboardData(true);
    }, []);

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: { xs: 2, sm: 3 },
                overflow: 'hidden'
            }}
        >
            {/* Date Filters and Actions */}
            <Box
                sx={{
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 2
                }}
            >
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arLocale}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                            renderInput={(params) =>
                                <TextField
                                    {...params}
                                    size="small"
                                    sx={{ minWidth: { xs: '100%', sm: 200 } }}
                                />
                            }
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={setEndDate}
                            renderInput={(params) =>
                                <TextField
                                    {...params}
                                    size="small"
                                    sx={{ minWidth: { xs: '100%', sm: 200 } }}
                                />
                            }
                        />
                    </Box>
                </LocalizationProvider>
                <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={() => fetchDashboardData(true)}
                        disabled={loading}
                        variant="contained"
                        size="small"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button
                        startIcon={<SettingsIcon />}
                        onClick={() => setShowSettings(!showSettings)}
                        variant="outlined"
                        size="small"
                    >
                        Settings
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <StatsCards
                cards={[
                    {
                        title: 'Total Orders',
                        value: stats.totalOrders,
                        icon: ShoppingCartIcon,
                        color: 'primary'
                    },
                    {
                        title: 'Total Revenue',
                        value: formatCurrency(stats.totalRevenue),
                        icon: AttachMoneyIcon,
                        color: 'success'
                    },
                    {
                        title: 'Average Order',
                        value: formatCurrency(stats.averageOrderValue),
                        icon: TrendingUpIcon,
                        color: 'info'
                    },
                    {
                        title: 'Total Products',
                        value: stats.totalProducts,
                        icon: InventoryIcon,
                        color: 'warning'
                    }
                ]}
            />

            {/* Dashboard Content with Scrollable Area */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    height: `${contentHeight}px`,
                    mt: 2, // Space between stats cards and content
                    pr: 1 // Scrollbar space
                }}
            >
                <Grid
                    container
                    spacing={0}
                    sx={{
                        height: '100%',
                        alignItems: 'stretch'
                    }}
                >
                    {renderCharts()}
                </Grid>
            </Box>
        </Box>
    );
};

export default Dashboard;