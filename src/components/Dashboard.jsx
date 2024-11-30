import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Box,
    useTheme,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import { format } from 'date-fns';
import { 
    getFilteredOrders, 
    calculateOrderStats, 
    prepareChartData,
    DATE_RANGES 
} from '../services/dashboardService';
import StatusRenderer from './common/StatusRenderer';

// Import sample data directly
import orders from '../resources/data/orders.json';

const StatCard = ({ title, value, subtitle, color }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Typography variant="h6" component="div" color="text.secondary">
                {title}
            </Typography>
            <Typography variant="h4" component="div" color={color || 'primary'}>
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
);

export default function Dashboard() {
    const [dateRange, setDateRange] = useState(DATE_RANGES.LAST_WEEK);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        revenue: 0,
        processing: 0,
        pending: 0,
        completed: 0,
        canceled: 0
    });
    const [chartData, setChartData] = useState([]);
    const theme = useTheme();

    useEffect(() => {
        // Use the imported orders data directly
        const filtered = getFilteredOrders(orders, dateRange);
        const orderStats = calculateOrderStats(filtered);
        const dailyData = prepareChartData(filtered);

        setFilteredOrders(filtered);
        setStats(orderStats);
        setChartData(dailyData);
    }, [dateRange]);

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={3}>
                {/* Date Range Filter */}
                <Grid item xs={12}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Date Range</InputLabel>
                        <Select
                            value={dateRange}
                            label="Date Range"
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <MenuItem value={DATE_RANGES.LAST_WEEK}>Last Week</MenuItem>
                            <MenuItem value={DATE_RANGES.LAST_MONTH}>Last Month</MenuItem>
                            <MenuItem value={DATE_RANGES.LAST_3_MONTHS}>Last 3 Months</MenuItem>
                            <MenuItem value={DATE_RANGES.LAST_YEAR}>Last Year</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Stats Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Orders"
                        value={stats.total}
                        subtitle={`In selected period`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Revenue"
                        value={new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        }).format(stats.revenue)}
                        color="success.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Processing Orders"
                        value={stats.processing}
                        color="warning.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Completed Orders"
                        value={stats.completed}
                        color="success.main"
                    />
                </Grid>

                {/* Revenue Chart */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Revenue Over Time
                        </Typography>
                        <ResponsiveContainer>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                                />
                                <YAxis 
                                    tickFormatter={(value) => 
                                        new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            notation: 'compact'
                                        }).format(value)
                                    }
                                />
                                <Tooltip 
                                    formatter={(value) => 
                                        new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        }).format(value)
                                    }
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={theme.palette.primary.main}
                                    fill={theme.palette.primary.light}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Orders Chart */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Daily Orders
                        </Typography>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    dataKey="orders"
                                    fill={theme.palette.secondary.main}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Recent Orders */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Orders
                        </Typography>
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: 2 
                        }}>
                            {filteredOrders.slice(0, 6).map((order) => (
                                <Card key={order.entity_id}>
                                    <CardContent>
                                        <Typography variant="subtitle1">
                                            Order #{order.increment_id}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {format(new Date(order.created_at), 'PPp')}
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            <StatusRenderer value={order.status} />
                                        </Box>
                                        <Typography variant="h6" sx={{ mt: 1 }}>
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD'
                                            }).format(order.grand_total)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
