import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, TextField, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import arLocale from 'date-fns/locale/ar';
import { StatsCards } from '../components/common/StatsCards';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import magentoApi from '../services/magentoService';
import { toast } from 'react-toastify';

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
    return new Intl.DateTimeFormat('ar', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
};
const Dashboard = () => {
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
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const fetchDashboardData = async (force = false) => {
        try {
            if (!force && lastFetch && (Date.now() - lastFetch) < CACHE_DURATION) {
                return;
            }

            setLoading(true);
            
            // Fetch orders within date range
            const orderResponse = await magentoApi.getOrders({
                filterGroups: [{
                    filters: [{
                        field: 'created_at',
                        value: startDate.toISOString(),
                        condition_type: 'gteq'
                    }, {
                        field: 'created_at',
                        value: endDate.toISOString(),
                        condition_type: 'lteq'
                    }]
                }]
            });

            const orders = orderResponse.items || [];
            const totalRevenue = orders.reduce((sum, order) => sum + Number(order.grand_total), 0);

            // Fetch customers count
            const customerResponse = await magentoApi.getCustomers({});
            
            // Fetch products count
            const productResponse = await magentoApi.getProducts({});

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
            const date = formatDate(order.created_at);
            ordersByDate[date] = (ordersByDate[date] || 0) + 1;
            revenueByDate[date] = (revenueByDate[date] || 0) + Number(order.grand_total);
        });

        const orderTrends = Object.entries(ordersByDate).map(([date, count]) => ({
            date,
            orders: count
        }));

        const revenueTrends = Object.entries(revenueByDate).map(([date, revenue]) => ({
            date,
            revenue,
            formattedRevenue: formatCurrency(revenue)
        }));

        return { orderTrends, revenueTrends };
    };

    useEffect(() => {
        fetchDashboardData();
    }, [startDate, endDate]);

    const statCards = [
        {
            title: "Total Orders",
            value: stats.totalOrders,
            icon: ShoppingCartIcon,
            color: "primary"
        },
        {
            title: "Total Customers",
            value: stats.totalCustomers,
            icon: PeopleIcon,
            color: "success"
        },
        {
            title: "Total Products",
            value: stats.totalProducts,
            icon: InventoryIcon,
            color: "info"
        },
        {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            icon: AttachMoneyIcon,
            color: "warning"
        },
        {
            title: "Avg Order Value",
            value: formatCurrency(stats.averageOrderValue),
            icon: TrendingUpIcon,
            color: "error"
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            {/* Date Range Selector */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={setStartDate}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={setEndDate}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => fetchDashboardData(true)}
                                startIcon={<RefreshIcon />}
                                sx={{ minWidth: 120 }}
                            >
                                Refresh
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Stats Cards */}
            <StatsCards cards={statCards} />

            {/* Charts */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <h3>Orders Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={orderTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="orders" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <h3>Revenue Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;