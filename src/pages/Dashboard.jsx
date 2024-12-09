import React, { useState, useEffect } from 'react';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
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

const Dashboard = () => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [endDate, setEndDate] = useState(new Date());
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalRevenue: 0,
        averageOrderValue: 0
    });
    const [orderTrends, setOrderTrends] = useState([]);
    const [revenueTrends, setRevenueTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastFetch, setLastFetch] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const fetchDashboardData = async (force = false) => {
        try {
            if (!force && lastFetch && (Date.now() - lastFetch) < CACHE_DURATION) {
                return;
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
                        condition_type: 'gteq'
                    }, {
                        field: 'created_at',
                        value: formattedEndDate,
                        condition_type: 'lteq'
                    }]
                }]
            };

            // Fetch orders with date filter
            const orderResponse = await magentoApi.getOrders(dateFilter);

            // Fetch customers with date filter
            const customerResponse = await magentoApi.getCustomers(dateFilter);

            // Fetch products (products don't typically need date filtering)
            const productResponse = await magentoApi.getProducts({});

            // Rest of your existing code...
            const orders = orderResponse.items || [];
            const totalRevenue = orders.reduce((sum, order) => sum + Number(order.grand_total), 0);

            // Calculate stats
            const newStats = {
                totalOrders: orders.length,
                totalCustomers: customerResponse.total_count || 0,
                totalProducts: productResponse.total_count || 0,
                totalRevenue: totalRevenue,
                averageOrderValue: orders.length ? totalRevenue / orders.length : 0
            };
            setStats(newStats);

            // Calculate trends
            const trends = calculateTrends(orders);
            setOrderTrends(trends.orderTrends);
            setRevenueTrends(trends.revenueTrends);

            setLastFetch(Date.now());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const calculateTrends = (orders) => {
        const ordersByDate = {};
        const revenueByDate = {};

        orders.forEach(order => {
            const date = new Date(order.created_at);
            const dateKey = date.toISOString().split('T')[0]; // Use ISO date as key

            ordersByDate[dateKey] = (ordersByDate[dateKey] || 0) + 1;
            revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + Number(order.grand_total);
        });

        const orderTrends = Object.entries(ordersByDate)
            .map(([date, count]) => ({
                date: new Date(date), // Store as Date object
                orders: count
            }))
            .sort((a, b) => a.date - b.date);

        const revenueTrends = Object.entries(revenueByDate)
            .map(([date, revenue]) => ({
                date: new Date(date), // Store as Date object
                revenue,
                formattedRevenue: formatCurrency(revenue)
            }))
            .sort((a, b) => a.date - b.date);

        return { orderTrends, revenueTrends };
    };

    useEffect(() => {
        fetchDashboardData(true);
    }, [startDate, endDate]);



    // Calculate available height for content
    const calculateContentHeight = () => {
        const windowHeight = window.innerHeight;
        const statsCardHeight = DASHBOARD_TAB_HEIGHT;
        const headerHeight = HEADER_HEIGHT;
        const footerHeight = FOOTER_HEIGHT;

        return windowHeight - (headerHeight + statsCardHeight + footerHeight + 40); // Extra padding
    };

    const [contentHeight, setContentHeight] = useState(calculateContentHeight());

    useEffect(() => {
        const handleResize = () => {
            setContentHeight(calculateContentHeight());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
                    spacing={1}
                    sx={{
                        height: '100%',
                        alignItems: 'stretch'
                    }}
                >
                    <Grid item xs={12} lg={6}>
                        <Paper
                            elevation={1}
                            sx={{
                                p: { xs: 2, sm: 3 },
                                height: '100%',
                                minHeight: 400,
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 2,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: (theme) => theme.shadows[4]
                                }
                            }}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    mb: 3
                                }}
                            >
                                Orders Trend
                            </Typography>
                            <Box sx={{ flex: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={orderTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            type="date"
                                            scale="time"
                                            domain={['auto', 'auto']}
                                            tickFormatter={(date) => formatDate(date)}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            labelFormatter={(date) => formatDate(date)}
                                            formatter={(value) => [value, 'Orders']}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="orders"
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <Paper
                            elevation={1}
                            sx={{
                                p: { xs: 2, sm: 3 },
                                height: '100%',
                                minHeight: 300,
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 2,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: (theme) => theme.shadows[4]
                                }
                            }}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    mb: 3
                                }}
                            >
                                Revenue Trend
                            </Typography>
                            <Box sx={{ flex: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            type="date"
                                            scale="time"
                                            domain={['auto', 'auto']}
                                            tickFormatter={(date) => formatDate(date)}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => formatCurrency(value)}
                                        />
                                        <Tooltip
                                            labelFormatter={(date) => formatDate(date)}
                                            formatter={(value) => [formatCurrency(value), 'Revenue']}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#82ca9d"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Dashboard;