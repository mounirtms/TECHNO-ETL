import React, { useState } from 'react';
import {
    Box, Paper, Button, Typography, IconButton, CircularProgress,
    Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Chip,
    Collapse
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import arLocale from 'date-fns/locale/ar-SA';
import { StatsCards } from '../components/common/StatsCards';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart,
    Scatter, RadialBarChart, RadialBar, PolarAngleAxis, AreaChart, Area
} from 'recharts';
import {
    ShoppingBag, SupervisorAccount, Category, CurrencyExchange,
    Refresh, SyncAlt, Settings, BarChart as BarChartIcon,
    PieChart as PieChartIcon, TableChart, ShowChart, Diamond,
    Groups, Dashboard as DashboardIcon, ShoppingCart, People,
    Inventory, Receipt, AccountCircle, LocationOn, Warehouse,
    Inventory2, Storefront, Description, BugReport, Star,
    AccountBalance, PersonAddAlt, Insights, Paid,
    RocketLaunch, Store, AutoGraph, ExpandMore, ExpandLess
} from '@mui/icons-material';
import { useDashboardController } from '../services/DashboardController';
import {
    formatCurrency, formatDate, prepareCustomerChartData,
    formatChartDate, formatTooltipDate
} from '../services/dashboardService';
import { calculateDashboardHeight, createHeightStyles } from '../utils/heightCalculator';

// Import new chart components
import {
    ProductStatsChart,
    BrandDistributionChart,
    CategoryTreeChart,
    ProductAttributesChart,
    SalesPerformanceChart,
    InventoryStatusChart
} from '../components/charts';

// Import dashboard data service
import dashboardDataService from '../services/dashboardDataService';

const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return { start, end };
};

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#FF6699', '#FF33CC', '#A4DE6C', '#D0ED57',
    '#8884D8', '#82CA9D', '#FFC658', '#FF7F50'
];

const chartTypeOptions = [
    { value: 'line', label: 'Line', icon: <ShowChart /> },
    { value: 'area', label: 'Area', icon: <ShowChart /> },
    { value: 'bar', label: 'Bar', icon: <BarChartIcon /> },
    { value: 'pie', label: 'Pie', icon: <PieChartIcon /> },
    { value: 'radial', label: 'Radial', icon: <PieChartIcon /> },
    { value: 'table', label: 'Table', icon: <TableChart /> }
];

const Dashboard = () => {
    const theme = useTheme();
    const defaultRange = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultRange.start);
    const [endDate, setEndDate] = useState(defaultRange.end);
    const [refreshKey, setRefreshKey] = useState(0);
    const [chartType, setChartType] = useState('line');
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
    const [visibleCharts, setVisibleCharts] = useState({
        orders: true,
        customers: true,
        products: true,
        attributes: true,
        recentOrders: true,
        bestSellers: true,
        // New enhanced charts
        productStats: true,
        brandDistribution: true,
        categoryTree: true,
        productAttributes: true,
        salesPerformance: true,
        inventoryStatus: true
    });

    // State for new dashboard data
    const [enhancedData, setEnhancedData] = useState({
        productStats: [],
        brandDistribution: [],
        categoryDistribution: [],
        productAttributes: [],
        salesPerformance: [],
        inventoryStatus: []
    });
    const [enhancedLoading, setEnhancedLoading] = useState(false);

    // Individual chart collapse state
    const [collapsedCharts, setCollapsedCharts] = useState({
        orders: false,
        customers: false,
        products: false,
        attributes: false
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

    // Load enhanced dashboard data
    const loadEnhancedData = async () => {
        try {
            setEnhancedLoading(true);
            const data = await dashboardDataService.getAllDashboardData();
            setEnhancedData(data);
        } catch (error) {
            console.error('Error loading enhanced dashboard data:', error);
        } finally {
            setEnhancedLoading(false);
        }
    };

    // Load enhanced data on component mount and when refresh key changes
    React.useEffect(() => {
        loadEnhancedData();
    }, [refreshKey]);

    const handleSettingsOpen = (event) => {
        setSettingsAnchorEl(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setSettingsAnchorEl(null);
    };

    const handleToggleChart = (chartKey) => {
        setVisibleCharts(prev => ({ ...prev, [chartKey]: !prev[chartKey] }));
    };

    const handleCollapseChart = (chartKey) => {
        setCollapsedCharts(prev => ({ ...prev, [chartKey]: !prev[chartKey] }));
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Paper sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                    background: theme.palette.background.paper
                }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {formatTooltipDate(label)}
                    </Typography>
                    {payload.map((item, index) => (
                        <Box key={index} sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: item.color,
                            my: 0.5
                        }}>
                            <Box sx={{
                                width: 12,
                                height: 8,
                                bgcolor: item.color,
                                borderRadius: '50%',
                                mr: 1
                            }} />
                            <Typography variant="body2">
                                {item.name}: {item.name === 'revenue' ? 
                                    formatCurrency(item.value) : 
                                    Math.round(item.value)}
                            </Typography>
                        </Box>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arLocale}>
            <Box sx={{
                p: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto'
            }}>
                {/* Header with Date Range and Controls */}
                <Paper sx={{
                    p: 2,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: theme.palette.background.paper,
                    boxShadow: theme.shadows[2],
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.primary.main}`
                }}>
                    <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={setStartDate}
                        maxDate={endDate}
                        slotProps={{
                            textField: {
                                size: "small",
                                sx: { 
                                    width: 150, 
                                    background: theme.palette.background.default,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }
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
                                sx: { 
                                    width: 150, 
                                    background: theme.palette.background.default,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }
                            }
                        }}
                    />
                    <Box sx={{ flexGrow: 1 }} />        
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={getPrices}
                            startIcon={<SyncAlt />}
                            variant="contained"
                            color="primary"
                            sx={{
                                px: 2.5,
                                py: 1,
                                borderRadius: 2,
                                fontWeight: 600,
                                textTransform: 'none',
                                minWidth: 140
                            }}
                        >
                            Sync Prices
                        </Button>
                        <Button
                            onClick={syncAllStocks}
                            startIcon={<SyncAlt />}
                            variant="contained"
                            color="success"
                            sx={{
                                px: 2.5,
                                py: 1,
                                borderRadius: 2,
                                fontWeight: 600,
                                textTransform: 'none',
                                minWidth: 140
                            }}
                        >
                            Sync Stocks
                        </Button>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Tooltip title="Refresh Data">
                        <IconButton
                            onClick={handleRefresh}
                            disabled={loading}
                            sx={{
                                bgcolor: theme.palette.background.default,
                                '&:hover': { 
                                    bgcolor: theme.palette.action.hover 
                                }
                            }}
                        >
                            <Refresh color="primary" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Dashboard Settings">
                        <IconButton 
                            onClick={handleSettingsOpen} 
                            sx={{
                                bgcolor: theme.palette.background.default,
                                '&:hover': { 
                                    bgcolor: theme.palette.action.hover 
                                }
                            }}
                        >
                            <Settings color="action" />
                        </IconButton>
                    </Tooltip>
                    
                    <Menu
                        anchorEl={settingsAnchorEl}
                        open={Boolean(settingsAnchorEl)}
                        onClose={handleSettingsClose}
                        PaperProps={{ 
                            sx: { 
                                minWidth: 240, 
                                borderRadius: 2, 
                                boxShadow: theme.shadows[4],
                                mt: 1
                            } 
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ 
                            px: 2, 
                            pt: 1, 
                            fontWeight: 700,
                            color: theme.palette.text.secondary
                        }}>
                            Show/Hide Charts
                        </Typography>
                        
                        <MenuItem onClick={() => handleToggleChart('orders')}>
                            <ListItemIcon><BarChartIcon color={visibleCharts.orders ? 'primary' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Orders Chart</ListItemText>
                            {visibleCharts.orders && <Chip size="small" label="On" color="primary" />}
                        </MenuItem>
                        
                        <MenuItem onClick={() => handleToggleChart('customers')}>
                            <ListItemIcon><People color={visibleCharts.customers ? 'success' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Customers Chart</ListItemText>
                            {visibleCharts.customers && <Chip size="small" label="On" color="success" />}
                        </MenuItem>
                        
                        <MenuItem onClick={() => handleToggleChart('products')}>
                            <ListItemIcon><Inventory color={visibleCharts.products ? 'info' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Products Chart</ListItemText>
                            {visibleCharts.products && <Chip size="small" label="On" color="info" />}
                        </MenuItem>
                        
                        <MenuItem onClick={() => handleToggleChart('attributes')}>
                            <ListItemIcon><Settings color={visibleCharts.attributes ? 'secondary' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Attributes Chart</ListItemText>
                            {visibleCharts.attributes && <Chip size="small" label="On" color="secondary" />}
                        </MenuItem>
                        
                        <MenuItem onClick={() => handleToggleChart('recentOrders')}>
                            <ListItemIcon><ShoppingCart color={visibleCharts.recentOrders ? 'primary' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Recent Orders</ListItemText>
                            {visibleCharts.recentOrders && <Chip size="small" label="On" color="primary" />}
                        </MenuItem>
                        
                        <MenuItem onClick={() => handleToggleChart('bestSellers')}>
                            <ListItemIcon><Star color={visibleCharts.bestSellers ? 'warning' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Best Sellers</ListItemText>
                            {visibleCharts.bestSellers && <Chip size="small" label="On" color="warning" />}
                        </MenuItem>

                        <Divider sx={{ my: 1 }} />

                        <Typography variant="caption" sx={{
                            px: 2,
                            py: 1,
                            display: 'block',
                            fontWeight: 600,
                            color: theme.palette.text.secondary
                        }}>
                            Enhanced Analytics
                        </Typography>

                        <MenuItem onClick={() => handleToggleChart('productStats')}>
                            <ListItemIcon><PieChartIcon color={visibleCharts.productStats ? 'primary' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Product Statistics</ListItemText>
                            {visibleCharts.productStats && <Chip size="small" label="On" color="primary" />}
                        </MenuItem>

                        <MenuItem onClick={() => handleToggleChart('brandDistribution')}>
                            <ListItemIcon><BarChartIcon color={visibleCharts.brandDistribution ? 'info' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Brand Distribution</ListItemText>
                            {visibleCharts.brandDistribution && <Chip size="small" label="On" color="info" />}
                        </MenuItem>

                        <MenuItem onClick={() => handleToggleChart('categoryTree')}>
                            <ListItemIcon><Category color={visibleCharts.categoryTree ? 'success' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Category Tree</ListItemText>
                            {visibleCharts.categoryTree && <Chip size="small" label="On" color="success" />}
                        </MenuItem>

                        <MenuItem onClick={() => handleToggleChart('productAttributes')}>
                            <ListItemIcon><Diamond color={visibleCharts.productAttributes ? 'secondary' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Product Attributes</ListItemText>
                            {visibleCharts.productAttributes && <Chip size="small" label="On" color="secondary" />}
                        </MenuItem>

                        <MenuItem onClick={() => handleToggleChart('salesPerformance')}>
                            <ListItemIcon><ShowChart color={visibleCharts.salesPerformance ? 'primary' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Sales Performance</ListItemText>
                            {visibleCharts.salesPerformance && <Chip size="small" label="On" color="primary" />}
                        </MenuItem>

                        <MenuItem onClick={() => handleToggleChart('inventoryStatus')}>
                            <ListItemIcon><Warehouse color={visibleCharts.inventoryStatus ? 'warning' : 'disabled'} /></ListItemIcon>
                            <ListItemText>Inventory Status</ListItemText>
                            {visibleCharts.inventoryStatus && <Chip size="small" label="On" color="warning" />}
                        </MenuItem>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="subtitle2" sx={{ 
                            px: 2, 
                            pt: 1, 
                            fontWeight: 700,
                            color: theme.palette.text.secondary
                        }}>
                            Chart Type
                        </Typography>
                        
                        {chartTypeOptions.map(opt => (
                            <MenuItem 
                                key={opt.value} 
                                onClick={() => { 
                                    setChartType(opt.value); 
                                    handleSettingsClose(); 
                                }} 
                                selected={chartType === opt.value}
                            >
                                <ListItemIcon>{opt.icon}</ListItemIcon>
                                <ListItemText>{opt.label}</ListItemText>
                                {chartType === opt.value && <Chip size="small" label="Active" color="primary" />}
                            </MenuItem>
                        ))}
                    </Menu>
                </Paper>

                {loading && (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        height: '60vh'
                    }}>
                        <CircularProgress size={60} />
                    </Box>
                )}

                {!loading && (
                    <>
                        {/* Stats Cards */}
                        <Box sx={{ mt: 3 }}>
                            <StatsCards
                                cards={[
                                    {
                                        title: 'Total Orders',
                                        value: stats.totalOrders,
                                        icon: ShoppingBag,
                                        color: 'primary',
                                        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        description: 'All time orders'
                                    },
                                    {
                                        title: 'Active Customers',
                                        value: stats.totalCustomers,
                                        icon: SupervisorAccount,
                                        color: 'success',
                                        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        description: 'Registered users'
                                    },
                                    {
                                        title: 'Products',
                                        value: stats.totalProducts,
                                        icon: Category,
                                        color: 'info',
                                        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                        description: 'In inventory'
                                    },
                                    {
                                        title: 'Revenue',
                                        value: formatCurrency(stats.totalRevenue),
                                        icon: Paid,
                                        color: 'warning',
                                        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                        description: 'Total earnings'
                                    },
                                    {
                                        title: 'Avg Order',
                                        value: formatCurrency(stats.averageOrderValue),
                                        icon: Insights,
                                        color: 'secondary',
                                        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                        description: 'Per order value'
                                    },
                                    {
                                        title: 'Portfolio Value',
                                        value: formatCurrency(stats.totalValue),
                                        icon: AccountBalance,
                                        color: 'error',
                                        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                                        description: 'Total assets'
                                    },
                                    {
                                        title: 'New Customers',
                                        value: stats.newCustomers,
                                        icon: PersonAddAlt,
                                        color: 'info',
                                        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                        description: 'This period'
                                    },
                                    {
                                        title: 'Growth Rate',
                                        value: `${((stats.totalOrders / Math.max(stats.totalCustomers, 1)) * 100).toFixed(1)}%`,
                                        icon: RocketLaunch,
                                        color: 'success',
                                        gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                                        description: 'Monthly growth'
                                    }
                                ].slice(0, 8)}
                            />
                        </Box>

                        {/* Main Orders Chart */}
                        {visibleCharts.orders && (
                            <Box sx={{ mt: 3 }}>
                                <Paper sx={{ 
                                    p: 3, 
                                    height: '420px', 
                                    background: theme.palette.background.paper,
                                    boxShadow: theme.shadows[1],
                                    borderRadius: 2,
                                    borderLeft: `4px solid ${theme.palette.primary.main}`
                                }}>
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 600, 
                                        mb: 2,
                                        color: theme.palette.text.primary
                                    }}>
                                        Orders & Revenue Overview
                                    </Typography>
                                    
                                    <ResponsiveContainer width="100%" height="85%">
                                        {chartType === 'line' && (
                                            <LineChart data={chartData}>
                                                <CartesianGrid 
                                                    strokeDasharray="3 3" 
                                                    stroke={theme.palette.divider} 
                                                    vertical={false}
                                                />
                                                <XAxis 
                                                    dataKey="date" 
                                                    tickFormatter={formatChartDate} 
                                                    interval="preserveStartEnd" 
                                                    angle={-35} 
                                                    textAnchor="end" 
                                                    height={60} 
                                                    stroke={theme.palette.text.secondary}
                                                    tickMargin={10}
                                                />
                                                <YAxis 
                                                    yAxisId="left" 
                                                    tickFormatter={value => Math.round(value)} 
                                                    stroke={theme.palette.primary.main} 
                                                    tickMargin={10}
                                                />
                                                <YAxis 
                                                    yAxisId="right" 
                                                    orientation="right" 
                                                    tickFormatter={formatCurrency} 
                                                    stroke={theme.palette.secondary.main} 
                                                    tickMargin={10}
                                                />
                                                <RechartsTooltip 
                                                    content={<CustomTooltip />}
                                                />
                                                <Legend 
                                                    iconType="circle" 
                                                    verticalAlign="top" 
                                                    height={36}
                                                    wrapperStyle={{ paddingBottom: 20 }}
                                                />
                                                <Line 
                                                    yAxisId="left" 
                                                    type="monotone" 
                                                    dataKey="orders" 
                                                    stroke={theme.palette.primary.main} 
                                                    name="Orders" 
                                                    strokeWidth={2}
                                                    dot={{ 
                                                        r: 4, 
                                                        stroke: theme.palette.primary.main, 
                                                        strokeWidth: 2,
                                                        fill: theme.palette.background.paper
                                                    }} 
                                                    activeDot={{ 
                                                        r: 6, 
                                                        stroke: theme.palette.primary.dark, 
                                                        strokeWidth: 2,
                                                        fill: theme.palette.primary.main
                                                    }} 
                                                />
                                                <Line 
                                                    yAxisId="right" 
                                                    type="monotone" 
                                                    dataKey="revenue" 
                                                    stroke={theme.palette.secondary.main} 
                                                    name="Revenue" 
                                                    strokeWidth={2}
                                                    dot={{ 
                                                        r: 4, 
                                                        stroke: theme.palette.secondary.main, 
                                                        strokeWidth: 2,
                                                        fill: theme.palette.background.paper
                                                    }} 
                                                    activeDot={{ 
                                                        r: 6, 
                                                        stroke: theme.palette.secondary.dark, 
                                                        strokeWidth: 2,
                                                        fill: theme.palette.secondary.main
                                                    }} 
                                                />
                                            </LineChart>
                                        )}
                                        
                                        {chartType === 'area' && (
                                            <AreaChart data={chartData}>
                                                <CartesianGrid 
                                                    strokeDasharray="3 3" 
                                                    stroke={theme.palette.divider} 
                                                    vertical={false}
                                                />
                                                <XAxis 
                                                    dataKey="date" 
                                                    tickFormatter={formatChartDate} 
                                                    interval="preserveStartEnd" 
                                                    angle={-35} 
                                                    textAnchor="end" 
                                                    height={60} 
                                                    stroke={theme.palette.text.secondary}
                                                    tickMargin={10}
                                                />
                                                <YAxis 
                                                    yAxisId="left" 
                                                    tickFormatter={value => Math.round(value)} 
                                                    stroke={theme.palette.primary.main} 
                                                    tickMargin={10}
                                                />
                                                <YAxis 
                                                    yAxisId="right" 
                                                    orientation="right" 
                                                    tickFormatter={formatCurrency} 
                                                    stroke={theme.palette.secondary.main} 
                                                    tickMargin={10}
                                                />
                                                <RechartsTooltip 
                                                    content={<CustomTooltip />}
                                                />
                                                <Legend 
                                                    iconType="circle" 
                                                    verticalAlign="top" 
                                                    height={36}
                                                    wrapperStyle={{ paddingBottom: 20 }}
                                                />
                                                <Area 
                                                    yAxisId="left" 
                                                    type="monotone" 
                                                    dataKey="orders" 
                                                    stroke={theme.palette.primary.main} 
                                                    fill={theme.palette.primary.light} 
                                                    fillOpacity={0.2}
                                                    name="Orders" 
                                                    strokeWidth={2}
                                                    activeDot={{ 
                                                        r: 6, 
                                                        stroke: theme.palette.primary.dark, 
                                                        strokeWidth: 2,
                                                        fill: theme.palette.primary.main
                                                    }} 
                                                />
                                                <Area 
                                                    yAxisId="right" 
                                                    type="monotone" 
                                                    dataKey="revenue" 
                                                    stroke={theme.palette.secondary.main} 
                                                    fill={theme.palette.secondary.light} 
                                                    fillOpacity={0.2}
                                                    name="Revenue" 
                                                    strokeWidth={2}
                                                    activeDot={{ 
                                                        r: 6, 
                                                        stroke: theme.palette.secondary.dark, 
                                                        strokeWidth: 2,
                                                        fill: theme.palette.secondary.main
                                                    }} 
                                                />
                                            </AreaChart>
                                        )}
                                        
                                        {chartType === 'bar' && (
                                            <BarChart data={chartData}>
                                                <CartesianGrid 
                                                    strokeDasharray="3 3" 
                                                    stroke={theme.palette.divider} 
                                                    vertical={false}
                                                />
                                                <XAxis 
                                                    dataKey="date" 
                                                    tickFormatter={formatChartDate} 
                                                    interval="preserveStartEnd" 
                                                    angle={-35} 
                                                    textAnchor="end" 
                                                    height={60} 
                                                    stroke={theme.palette.text.secondary}
                                                    tickMargin={10}
                                                />
                                                <YAxis 
                                                    yAxisId="left" 
                                                    tickFormatter={value => Math.round(value)} 
                                                    stroke={theme.palette.primary.main} 
                                                    tickMargin={10}
                                                />
                                                <YAxis 
                                                    yAxisId="right" 
                                                    orientation="right" 
                                                    tickFormatter={formatCurrency} 
                                                    stroke={theme.palette.secondary.main} 
                                                    tickMargin={10}
                                                />
                                                <RechartsTooltip 
                                                    content={<CustomTooltip />}
                                                />
                                                <Legend 
                                                    iconType="circle" 
                                                    verticalAlign="top" 
                                                    height={36}
                                                    wrapperStyle={{ paddingBottom: 20 }}
                                                />
                                                <Bar 
                                                    yAxisId="left" 
                                                    dataKey="orders" 
                                                    name="Orders" 
                                                    fill={theme.palette.primary.main} 
                                                    radius={[4, 4, 0, 0]} 
                                                    barSize={24} 
                                                />
                                                <Bar 
                                                    yAxisId="right" 
                                                    dataKey="revenue" 
                                                    name="Revenue" 
                                                    fill={theme.palette.secondary.main} 
                                                    radius={[4, 4, 0, 0]} 
                                                    barSize={24} 
                                                />
                                            </BarChart>
                                        )}
                                        
                                        {chartType === 'pie' && (
                                            <PieChart>
                                                <Pie 
                                                    data={chartData} 
                                                    dataKey="orders" 
                                                    nameKey="date" 
                                                    cx="50%" 
                                                    cy="50%" 
                                                    outerRadius={120} 
                                                    label={entry => `${formatChartDate(entry.date)}: ${entry.orders}`}
                                                    labelLine={false}
                                                >
                                                    {chartData.map((entry, idx) => (
                                                        <Cell 
                                                            key={`cell-${idx}`} 
                                                            fill={COLORS[idx % COLORS.length]} 
                                                        />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip 
                                                    formatter={(value, name, props) => [
                                                        value, 
                                                        formatChartDate(props.payload.date)
                                                    ]}
                                                    contentStyle={{
                                                        background: theme.palette.background.paper,
                                                        borderRadius: 8,
                                                        boxShadow: theme.shadows[2],
                                                        border: `1px solid ${theme.palette.divider}`
                                                    }}
                                                />
                                                <Legend 
                                                    layout="vertical" 
                                                    verticalAlign="middle" 
                                                    align="right"
                                                    wrapperStyle={{ paddingLeft: 20 }}
                                                />
                                            </PieChart>
                                        )}
                                        
                                        {chartType === 'radial' && (
                                            <RadialBarChart
                                                width={600}
                                                height={300}
                                                innerRadius="20%"
                                                outerRadius="80%"
                                                data={chartData.map(item => ({
                                                    ...item,
                                                    fullValue: Math.max(...chartData.map(d => d.orders)) * 1.2
                                                }))}
                                                startAngle={180}
                                                endAngle={-180}
                                            >
                                                <PolarAngleAxis 
                                                    type="number" 
                                                    domain={[0, 'dataMax']} 
                                                    angleAxisId={0} 
                                                    tick={false}
                                                />
                                                <RadialBar
                                                    label={{ 
                                                        position: 'insideStart', 
                                                        fill: theme.palette.text.primary,
                                                        formatter: (value) => formatChartDate(chartData[value.index].date)
                                                    }}
                                                    background
                                                    clockWise
                                                    dataKey="orders"
                                                    nameKey="date"
                                                />
                                                <Legend 
                                                    iconSize={10} 
                                                    layout="vertical" 
                                                    verticalAlign="middle" 
                                                    align="right"
                                                    wrapperStyle={{ paddingLeft: 20 }}
                                                />
                                                <RechartsTooltip 
                                                    formatter={(value, name, props) => [
                                                        value, 
                                                        formatChartDate(props.payload.date)
                                                    ]}
                                                    contentStyle={{
                                                        background: theme.palette.background.paper,
                                                        borderRadius: 8,
                                                        boxShadow: theme.shadows[2],
                                                        border: `1px solid ${theme.palette.divider}`
                                                    }}
                                                />
                                            </RadialBarChart>
                                        )}
                                        
                                        {chartType === 'table' && (
                                            <Box sx={{ 
                                                height: '100%', 
                                                overflow: 'auto',
                                                '&::-webkit-scrollbar': {
                                                    width: '6px',
                                                    height: '6px'
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    backgroundColor: theme.palette.action.disabled,
                                                    borderRadius: '4px'
                                                }
                                            }}>
                                                <table style={{ 
                                                    width: '100%', 
                                                    borderCollapse: 'collapse',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    <thead>
                                                        <tr style={{ 
                                                            background: theme.palette.background.default,
                                                            position: 'sticky',
                                                            top: 0,
                                                            zIndex: 1
                                                        }}>
                                                            <th style={{ 
                                                                padding: '12px 16px', 
                                                                textAlign: 'left',
                                                                borderBottom: `1px solid ${theme.palette.divider}`
                                                            }}>
                                                                Date
                                                            </th>
                                                            <th style={{ 
                                                                padding: '12px 16px', 
                                                                textAlign: 'right',
                                                                borderBottom: `1px solid ${theme.palette.divider}`
                                                            }}>
                                                                Orders
                                                            </th>
                                                            <th style={{ 
                                                                padding: '12px 16px', 
                                                                textAlign: 'right',
                                                                borderBottom: `1px solid ${theme.palette.divider}`
                                                            }}>
                                                                Revenue
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {chartData.map((row, index) => (
                                                            <tr 
                                                                key={row.key}
                                                                style={{ 
                                                                    '&:hover': {
                                                                        background: theme.palette.action.hover
                                                                    }
                                                                }}
                                                            >
                                                                <td style={{ 
                                                                    padding: '12px 16px', 
                                                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                                                    color: theme.palette.text.primary
                                                                }}>
                                                                    {formatChartDate(row.date)}
                                                                </td>
                                                                <td style={{ 
                                                                    padding: '12px 16px', 
                                                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                                                    textAlign: 'right',
                                                                    color: theme.palette.primary.main,
                                                                    fontWeight: 500
                                                                }}>
                                                                    {row.orders}
                                                                </td>
                                                                <td style={{ 
                                                                    padding: '12px 16px', 
                                                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                                                    textAlign: 'right',
                                                                    color: theme.palette.secondary.main,
                                                                    fontWeight: 500
                                                                }}>
                                                                    {formatCurrency(row.revenue)}
                                                                </td>
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

                        {/* Secondary Charts */}
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: 3, 
                            mt: 3 
                        }}>
                            {/* Country of Manufacture Chart */}
                            {visibleCharts.products && (
                                <Paper sx={{ 
                                    p: 3, 
                                    height: '420px', 
                                    background: theme.palette.background.paper,
                                    boxShadow: theme.shadows[1],
                                    borderRadius: 2,
                                    borderLeft: `4px solid ${theme.palette.info.main}`
                                }}>
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 600, 
                                        mb: 2,
                                        color: theme.palette.text.primary
                                    }}>
                                        Products by Country
                                    </Typography>
                                    
                                    <ResponsiveContainer width="100%" height="85%">
                                        <BarChart 
                                            data={countryData} 
                                            layout="vertical"
                                            margin={{ left: 30 }}
                                        >
                                            <CartesianGrid 
                                                strokeDasharray="3 3" 
                                                stroke={theme.palette.divider} 
                                                horizontal={true}
                                                vertical={false}
                                            />
                                            <XAxis 
                                                type="number" 
                                                stroke={theme.palette.text.secondary}
                                                tickMargin={10}
                                            />
                                            <YAxis 
                                                dataKey="country_of_manufacture" 
                                                type="category" 
                                                stroke={theme.palette.text.secondary}
                                                width={100}
                                                tickMargin={10}
                                            />
                                            <RechartsTooltip 
                                                content={<CustomTooltip />}
                                                formatter={(value) => [value, 'Products']}
                                            />
                                            <Legend />
                                            <Bar 
                                                dataKey="count" 
                                                name="Products" 
                                                fill={theme.palette.info.main} 
                                                radius={[0, 4, 4, 0]} 
                                                barSize={24}
                                            >
                                                {countryData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={COLORS[index % COLORS.length]} 
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            )}

                            {/* Product Types Chart */}
                            {visibleCharts.attributes && (
                                <Paper sx={{ 
                                    p: 3, 
                                    height: '420px', 
                                    background: theme.palette.background.paper,
                                    boxShadow: theme.shadows[1],
                                    borderRadius: 2,
                                    borderLeft: `4px solid ${theme.palette.warning.main}`
                                }}>
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 600, 
                                        mb: 2,
                                        color: theme.palette.text.primary
                                    }}>
                                        Product Types Distribution
                                    </Typography>
                                    
                                    <ResponsiveContainer width="100%" height="85%">
                                        <PieChart>
                                            <Pie 
                                                data={productTypeData} 
                                                cx="50%" 
                                                cy="50%" 
                                                outerRadius={100} 
                                                innerRadius={60}
                                                paddingAngle={5}
                                                dataKey="value" 
                                                nameKey="name"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {productTypeData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={COLORS[index % COLORS.length]} 
                                                    />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                formatter={(value, name, props) => [
                                                    value, 
                                                    `${(props.payload.percent * 100).toFixed(1)}%`
                                                ]}
                                                contentStyle={{
                                                    background: theme.palette.background.paper,
                                                    borderRadius: 8,
                                                    boxShadow: theme.shadows[2],
                                                    border: `1px solid ${theme.palette.divider}`
                                                }}
                                            />
                                            <Legend 
                                                layout="vertical" 
                                                verticalAlign="middle" 
                                                align="right"
                                                wrapperStyle={{ paddingLeft: 20 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
                            )}
                        </Box>

                        {/* Customer Growth Chart */}
                        {visibleCharts.customers && (
                            <Box sx={{ mt: 3 }}>
                                <Paper sx={{ 
                                    p: 3, 
                                    height: '420px', 
                                    background: theme.palette.background.paper,
                                    boxShadow: theme.shadows[1],
                                    borderRadius: 2,
                                    borderLeft: `4px solid ${theme.palette.success.main}`
                                }}>
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 600, 
                                        mb: 2,
                                        color: theme.palette.text.primary
                                    }}>
                                        Customer Growth
                                    </Typography>
                                    
                                    <ResponsiveContainer width="100%" height="85%">
                                        <AreaChart 
                                            data={prepareCustomerChartData(customerData, startDate, endDate)}
                                            margin={{ right: 30 }}
                                        >
                                            <defs>
                                                <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid 
                                                strokeDasharray="3 3" 
                                                stroke={theme.palette.divider} 
                                                vertical={false}
                                            />
                                            <XAxis 
                                                dataKey="date" 
                                                stroke={theme.palette.text.secondary}
                                                tickFormatter={formatChartDate}
                                                tickMargin={10}
                                            />
                                            <YAxis 
                                                stroke={theme.palette.text.secondary}
                                                tickMargin={10}
                                            />
                                            <RechartsTooltip 
                                                content={<CustomTooltip />}
                                                formatter={(value) => [value, 'New Customers']}
                                            />
                                            <Legend />
                                            <Area 
                                                type="monotone" 
                                                dataKey="count" 
                                                name="New Customers" 
                                                stroke={theme.palette.success.main} 
                                                strokeWidth={2}
                                                fillOpacity={1} 
                                                fill="url(#customerGradient)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Box>
                        )}

                        {/* Best Sellers Chart */}
                        {visibleCharts.bestSellers && (
                            <Box sx={{ mt: 3 }}>
                                <Paper sx={{ 
                                    p: 3, 
                                    height: '420px', 
                                    background: theme.palette.background.paper,
                                    boxShadow: theme.shadows[1],
                                    borderRadius: 2,
                                    borderLeft: `4px solid ${theme.palette.warning.main}`
                                }}>
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 600, 
                                        mb: 2,
                                        color: theme.palette.text.primary
                                    }}>
                                        Top Selling Products
                                    </Typography>
                                    
                                    <ResponsiveContainer width="100%" height="85%">
                                        <BarChart 
                                            data={bestSellers} 
                                            layout="vertical"
                                            margin={{ left: 80, right: 30 }}
                                        >
                                            <CartesianGrid 
                                                strokeDasharray="3 3" 
                                                stroke={theme.palette.divider} 
                                                horizontal={true}
                                                vertical={false}
                                            />
                                            <XAxis 
                                                type="number" 
                                                stroke={theme.palette.text.secondary}
                                                tickMargin={10}
                                            />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                stroke={theme.palette.text.secondary}
                                                width={150}
                                                tickMargin={10}
                                            />
                                            <RechartsTooltip 
                                                content={<CustomTooltip />}
                                                formatter={(value) => [value, 'Quantity Sold']}
                                            />
                                            <Legend />
                                            <Bar 
                                                dataKey="qty" 
                                                name="Quantity Sold" 
                                                fill={theme.palette.warning.main} 
                                                radius={[0, 4, 4, 0]} 
                                                barSize={24}
                                            >
                                                {bestSellers.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={COLORS[index % COLORS.length]} 
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Box>
                        )}

                        {/* Recent Orders Table */}
                        {visibleCharts.recentOrders && (
                            <Box sx={{ mt: 3 }}>
                                <Paper sx={{ 
                                    p: 3, 
                                    background: theme.palette.background.paper,
                                    boxShadow: theme.shadows[1],
                                    borderRadius: 2,
                                    borderLeft: `4px solid ${theme.palette.primary.main}`
                                }}>
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 600, 
                                        mb: 2,
                                        color: theme.palette.text.primary
                                    }}>
                                        Recent Orders
                                    </Typography>
                                    
                                    <Box sx={{ 
                                        overflow: 'auto',
                                        maxHeight: 400,
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                            height: '6px'
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: theme.palette.action.disabled,
                                            borderRadius: '4px'
                                        }
                                    }}>
                                        <table style={{ 
                                            width: '100%', 
                                            borderCollapse: 'collapse',
                                            fontSize: '0.875rem'
                                        }}>
                                            <thead>
                                                <tr style={{ 
                                                    background: theme.palette.background.default,
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 1
                                                }}>
                                                    <th style={{ 
                                                        padding: '12px 16px', 
                                                        textAlign: 'left',
                                                        borderBottom: `1px solid ${theme.palette.divider}`
                                                    }}>
                                                        Date
                                                    </th>
                                                    <th style={{ 
                                                        padding: '12px 16px', 
                                                        textAlign: 'left',
                                                        borderBottom: `1px solid ${theme.palette.divider}`
                                                    }}>
                                                        Order #
                                                    </th>
                                                    <th style={{ 
                                                        padding: '12px 16px', 
                                                        textAlign: 'left',
                                                        borderBottom: `1px solid ${theme.palette.divider}`
                                                    }}>
                                                        Customer
                                                    </th>
                                                    <th style={{ 
                                                        padding: '12px 16px', 
                                                        textAlign: 'right',
                                                        borderBottom: `1px solid ${theme.palette.divider}`
                                                    }}>
                                                        Total
                                                    </th>
                                                    <th style={{ 
                                                        padding: '12px 16px', 
                                                        textAlign: 'center',
                                                        borderBottom: `1px solid ${theme.palette.divider}`
                                                    }}>
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentOrders.map((order, index) => (
                                                    <tr 
                                                        key={order.entity_id}
                                                        style={{ 
                                                            '&:hover': {
                                                                background: theme.palette.action.hover
                                                            }
                                                        }}
                                                    >
                                                        <td style={{ 
                                                            padding: '12px 16px', 
                                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                                            color: theme.palette.text.primary
                                                        }}>
                                                            {formatDate(order.created_at)}
                                                        </td>
                                                        <td style={{ 
                                                            padding: '12px 16px', 
                                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                                            color: theme.palette.primary.main,
                                                            fontWeight: 500
                                                        }}>
                                                            {order.increment_id}
                                                        </td>
                                                        <td style={{ 
                                                            padding: '12px 16px', 
                                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                                            color: theme.palette.text.primary
                                                        }}>
                                                            {order.customer_firstname} {order.customer_lastname}
                                                        </td>
                                                        <td style={{ 
                                                            padding: '12px 16px', 
                                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                                            textAlign: 'right',
                                                            color: theme.palette.success.main,
                                                            fontWeight: 500
                                                        }}>
                                                            {formatCurrency(order.grand_total)}
                                                        </td>
                                                        <td style={{ 
                                                            padding: '12px 16px', 
                                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                                            textAlign: 'center'
                                                        }}>
                                                            <Chip 
                                                                label={order.status} 
                                                                size="small" 
                                                                color={
                                                                    order.status === 'complete' ? 'success' : 
                                                                    order.status === 'processing' ? 'primary' : 
                                                                    order.status === 'pending' ? 'warning' : 
                                                                    'default'
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </Box>
                                </Paper>
                            </Box>
                        )}

                        {/* Enhanced Analytics Charts */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h5" sx={{
                                mb: 3,
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Analytics />
                                Enhanced Analytics
                            </Typography>

                            {/* Enhanced Charts Grid */}
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    md: '1fr 1fr',
                                    lg: '1fr 1fr 1fr'
                                },
                                gap: 3
                            }}>
                                {/* Product Statistics */}
                                {visibleCharts.productStats && (
                                    <ProductStatsChart
                                        data={enhancedData.productStats}
                                        title="Product Status Distribution"
                                    />
                                )}

                                {/* Brand Distribution */}
                                {visibleCharts.brandDistribution && (
                                    <BrandDistributionChart
                                        data={enhancedData.brandDistribution}
                                        title="Top Brands"
                                    />
                                )}

                                {/* Product Attributes */}
                                {visibleCharts.productAttributes && (
                                    <ProductAttributesChart
                                        data={enhancedData.productAttributes}
                                        title="Product Features"
                                    />
                                )}
                            </Box>

                            {/* Second Row of Enhanced Charts */}
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    md: '1fr 1fr'
                                },
                                gap: 3,
                                mt: 3
                            }}>
                                {/* Category Tree */}
                                {visibleCharts.categoryTree && (
                                    <CategoryTreeChart
                                        data={enhancedData.categoryDistribution}
                                        title="Category Distribution"
                                    />
                                )}

                                {/* Sales Performance */}
                                {visibleCharts.salesPerformance && (
                                    <SalesPerformanceChart
                                        data={enhancedData.salesPerformance}
                                        title="Sales Trends"
                                        type="area"
                                    />
                                )}
                            </Box>

                            {/* Full Width Charts */}
                            <Box sx={{ mt: 3 }}>
                                {/* Inventory Status */}
                                {visibleCharts.inventoryStatus && (
                                    <InventoryStatusChart
                                        data={enhancedData.inventoryStatus}
                                        title="Inventory Overview"
                                    />
                                )}
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default Dashboard;