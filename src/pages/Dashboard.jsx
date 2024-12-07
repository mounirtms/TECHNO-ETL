import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, TextField, Button, Typography } from '@mui/material';
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
import SettingsIcon from '@mui/icons-material/Settings';
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

    return (
        <Box 
            sx={{ 
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                p: { xs: 2, sm: 3 },
                overflow: 'hidden'
            }}
        >
            {/* Date Filters and Actions */}
            <Paper 
                elevation={1}
                sx={{ 
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 2
                }}
            >
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arLocale}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
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
                <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
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
            </Paper>

            {/* Stats Cards */}
            <Box sx={{ width: '100%' }}>
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
            </Box>

            {/* Charts */}
            <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                width: '100%'
            }}>
                <Grid 
                    container 
                    spacing={3} 
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
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => {
                                                if (!value) return '';
                                                return formatDate(value);
                                            }}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip 
                                            formatter={(value) => [value, 'Orders']}
                                            labelFormatter={(label) => {
                                                if (!label) return '';
                                                return formatDate(label);
                                            }}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="orders" 
                                            stroke="#8884d8" 
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
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
                                Revenue Trend
                            </Typography>
                            <Box sx={{ flex: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="date" 
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => formatDate(value)}
                                        />
                                        <YAxis 
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => formatCurrency(value)}
                                        />
                                        <Tooltip 
                                            formatter={(value) => [formatCurrency(value), 'Revenue']}
                                            labelFormatter={(label) => formatDate(label)}
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