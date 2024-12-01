import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Grid, 
    Paper, 
    Card, 
    CardContent,
    CardHeader,
    IconButton,
    Button,
    Select,
    MenuItem,
    useTheme
} from '@mui/material';
import {
    ShoppingCart as OrdersIcon,
    People as CustomersIcon,
    Inventory as ProductsIcon,
    TrendingUp as SalesIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard = () => {
    const { translate } = useLanguage();
    const theme = useTheme();

    // Local data for cards and charts
    const localData = {
        totalOrders: 200,
        totalCustomers: 1300,
        totalProducts: 500,
        totalSales: 20000,
        salesOverTime: [
            { date: '2023-10-01', sales: 500 },
            { date: '2023-10-02', sales: 450 },
            { date: '2023-10-03', sales: 600 },
            // Add more data points as needed
        ]
    };

    const [period, setPeriod] = useState('last_week'); // Default period

    const handlePeriodChange = (event) => {
        setPeriod(event.target.value);
        // Logic to update data based on period
    };

    const handleRefresh = () => {
        // Logic to refresh data
        console.log('Data refreshed');
    };
    const cards = [
        {
            title: translate('dashboard.totalOrders'),
            value: localData.totalOrders,
            icon: <OrdersIcon />, 
            color: theme.palette.primary.main
        },
        {
            title: translate('dashboard.totalCustomers'),
            value: localData.totalCustomers,
            icon: <CustomersIcon />, 
            color: theme.palette.success.main
        },
        {
            title: translate('dashboard.totalProducts'),
            value: localData.totalProducts,
            icon: <ProductsIcon />, 
            color: theme.palette.warning.main
        },
        {
            title: translate('dashboard.totalSales'),
            value: `$${localData.totalSales.toLocaleString()}`,
            icon: <SalesIcon />, 
            color: theme.palette.info.main
        }
    ];

    return (
        <Box sx={{ 
            p: { xs: 2, sm: 3 },
            width: '100%',
            maxWidth: '100%',
            overflow: 'auto'
        }}>
            {/* Toolbar for period selection and refresh */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Select
                    value={period}
                    onChange={handlePeriodChange}
                    sx={{ minWidth: 120 }}
                >
                    <MenuItem value="last_week">{translate('dashboard.lastWeek')}</MenuItem>
                    <MenuItem value="last_month">{translate('dashboard.lastMonth')}</MenuItem>
                    <MenuItem value="last_year">{translate('dashboard.lastYear')}</MenuItem>
                </Select>
                <Button variant="contained" color="primary" onClick={handleRefresh}>
                    {translate('dashboard.refresh')}
                </Button>
            </Box>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
                {cards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card 
                            elevation={2}
                            sx={{ 
                                height: '100%',
                                '&:hover': {
                                    boxShadow: 6
                                }
                            }}
                        >
                            <CardHeader
                                avatar={
                                    <Box
                                        sx={{
                                            width: { xs: 32, sm: 40 },
                                            height: { xs: 32, sm: 40 },
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: `${card.color}20`,
                                            color: card.color
                                        }}
                                    >
                                        {card.icon}
                                    </Box>
                                }
                                action={
                                    <IconButton 
                                        aria-label="settings"
                                        sx={{ 
                                            display: { xs: 'none', sm: 'inline-flex' }
                                        }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                }
                                title={card.title}
                                titleTypographyProps={{ 
                                    variant: 'subtitle2', 
                                    color: 'textSecondary',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                            />
                            <CardContent>
                                <Typography 
                                    variant="h4" 
                                    component="div"
                                    sx={{
                                        fontSize: { xs: '1.5rem', sm: '2rem' }
                                    }}
                                >
                                    {card.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%', minHeight: { xs: 300, sm: 400 } }}>
                        <CardHeader
                            title={translate('dashboard.salesOverTime')}
                            titleTypographyProps={{ 
                                variant: 'h6',
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                            }}
                        />
                        <CardContent>
                            {/* Example chart implementation */}
                            <Box sx={{ 
                                height: { xs: 200, sm: 300 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Typography color="textSecondary">
                                    {translate('dashboard.chartComingSoon')}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardHeader
                            title={translate('dashboard.recentOrders')}
                            titleTypographyProps={{ 
                                variant: 'h6',
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                            }}
                        />
                        <CardContent>
                            {/* Recent orders list will go here */}
                            <Box sx={{ 
                                height: { xs: 200, sm: 300 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Typography color="textSecondary">
                                    {translate('dashboard.noRecentOrders')}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
