import React, { useState } from 'react';
import { Box, Paper, Button, Typography, IconButton, CircularProgress, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import arLocale from 'date-fns/locale/ar-SA';
import { StatsCards } from '../components/common/StatsCards';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
// Stylish and fancy dashboard icons - smaller and more professional
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import CategoryIcon from '@mui/icons-material/Category';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/SyncAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import DiamondIcon from '@mui/icons-material/Diamond';
import GroupsIcon from '@mui/icons-material/Groups';
// Enhanced stylish dashboard icons
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import InsightsIcon from '@mui/icons-material/Insights';
import PaidIcon from '@mui/icons-material/Paid';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StoreIcon from '@mui/icons-material/Store';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { useDashboardController } from '../services/DashboardController';
import { formatCurrency, formatDate, prepareCustomerChartData, formatChartDate, formatTooltipDate } from '../services/dashboardService';

const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return { start, end };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6699', '#FF33CC'];

const chartTypeOptions = [
    { value: 'line', label: 'Line', icon: <ShowChartIcon /> },
    { value: 'bar', label: 'Bar', icon: <BarChartIcon /> },
    { value: 'pie', label: 'Pie', icon: <PieChartIcon /> },
    { value: 'table', label: 'Table', icon: <TableChartIcon /> }
];

const Dashboard = () => {
    const theme = useTheme();
    const defaultRange = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultRange.start);
    const [endDate, setEndDate] = useState(defaultRange.end);
    const [refreshKey, setRefreshKey] = useState(0);
    const [chartType, setChartType] = useState('line');
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

    // FIX: Add visibleCharts state
    const [visibleCharts, setVisibleCharts] = useState({
        orders: true,
        customers: true,
        products: true,
        attributes: true,
        recentOrders: true,
        bestSellers: true
    });

    const {
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
    } = useDashboardController(startDate, endDate, refreshKey);

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

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

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

                    {/* Slick Sync Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                                '&:hover': {
                                    background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)'
                                }
                            }}
                        >
                            Sync Prices
                        </Button>
                        <Button
                            onClick={syncAllStocks}
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
                                '&:hover': {
                                    background: 'linear-gradient(90deg, #388e3c 0%, #81c784 100%)'
                                }
                            }}
                        >
                            Sync Stocks
                        </Button>
                    </Box>

                    {/* Space filler */}
                    <Box sx={{ flexGrow: 1 }} />

                    {/* Refresh Button */}
                    <IconButton
                        onClick={handleRefresh}
                        disabled={loading}
                        sx={{
                            ml: 2,
                            background: '#fff',
                            borderRadius: 2,
                            boxShadow: 2,
                            '&:hover': { background: '#e3f2fd' }
                        }}
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
                        {/* New: Recent Orders and Best Sellers */}
                        <MenuItem onClick={() => handleToggleChart('recentOrders')}> <ListItemIcon><ShoppingCartIcon color={visibleCharts.recentOrders ? 'primary' : 'disabled'} /></ListItemIcon> <ListItemText>Recent Orders</ListItemText> {visibleCharts.recentOrders && <Chip size="small" label="On" color="primary" />} </MenuItem>
                        <MenuItem onClick={() => handleToggleChart('bestSellers')}> <ListItemIcon><StarIcon color={visibleCharts.bestSellers ? 'warning' : 'disabled'} /></ListItemIcon> <ListItemText>Best Sellers</ListItemText> {visibleCharts.bestSellers && <Chip size="small" label="On" color="warning" />} </MenuItem>
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
                            {
                                title: 'Total Orders',
                                value: stats.totalOrders,
                                icon: ShoppingBagIcon,
                                color: 'primary',
                                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                description: 'All time orders'
                            },
                            {
                                title: 'Active Customers',
                                value: stats.totalCustomers,
                                icon: SupervisorAccountIcon,
                                color: 'success',
                                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                description: 'Registered users'
                            },
                            {
                                title: 'Products',
                                value: stats.totalProducts,
                                icon: CategoryIcon,
                                color: 'info',
                                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                description: 'In inventory'
                            },
                            {
                                title: 'Revenue',
                                value: formatCurrency(stats.totalRevenue),
                                icon: PaidIcon,
                                color: 'warning',
                                gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                description: 'Total earnings'
                            },
                            {
                                title: 'Avg Order',
                                value: formatCurrency(stats.averageOrderValue),
                                icon: InsightsIcon,
                                color: 'secondary',
                                gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                description: 'Per order value'
                            },
                            {
                                title: 'Portfolio Value',
                                value: formatCurrency(stats.totalValue),
                                icon: AccountBalanceIcon,
                                color: 'error',
                                gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                                description: 'Total assets'
                            },
                            {
                                title: 'New Customers',
                                value: stats.newCustomers,
                                icon: PersonAddAltIcon,
                                color: 'info',
                                gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                description: 'This period'
                            },
                            {
                                title: 'Growth Rate',
                                value: `${((stats.totalOrders / Math.max(stats.totalCustomers, 1)) * 100).toFixed(1)}%`,
                                icon: RocketLaunchIcon,
                                color: 'success',
                                gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                                description: 'Monthly growth'
                            }
                        ].slice(0, 8)} // Ensure max 8 cards
                    />
                </Box>

                {/* Charts */}
                {visibleCharts.orders && (
                    <Box sx={{ mt: 3 }}>
                        <Paper sx={{ p: 2, height: '420px', background: 'linear-gradient(120deg, #e3f2fd 0%, #fce4ec 100%)', boxShadow: 6, borderRadius: 3 }}>

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

                {/* Recent Orders Table */}
                {visibleCharts.recentOrders && (
                    <Box sx={{ mt: 3 }}>
                        <Paper sx={{ p: 2, boxShadow: 6, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>Recent Orders</Typography>
                            <Box sx={{ overflow: 'auto', maxHeight: 300 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Order #</th>
                                            <th>Customer</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map(order => (
                                            <tr key={order.entity_id}>
                                                <td>{formatDate(order.created_at)}</td>
                                                <td>{order.increment_id}</td>
                                                <td>{order.customer_firstname} {order.customer_lastname}</td>
                                                <td>{formatCurrency(order.grand_total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>
                        </Paper>
                    </Box>
                )}

                {/* Best Sellers Bar Chart */}
                {visibleCharts.bestSellers && (
                    <Box sx={{ mt: 3 }}>
                        <Paper sx={{ p: 2, boxShadow: 6, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>Best Sellers</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={bestSellers}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Bar dataKey="qty" fill="#1976d2" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Box>
                )}

                {/* Customer Chart */}
                {visibleCharts.customers && (
                    <Box sx={{ mt: 3 }}>
                        <Paper sx={{ p: 2, boxShadow: 6, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#388e3c', mb: 2 }}>New Customers</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={prepareCustomerChartData(customerData, startDate, endDate)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Bar dataKey="count" fill="#388e3c" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Box>
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default Dashboard;
