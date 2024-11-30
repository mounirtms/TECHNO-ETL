import React from 'react';
import { 
    Box, 
    Typography, 
    Grid, 
    Paper, 
    Card, 
    CardContent,
    CardHeader,
    IconButton,
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

    const cards = [
        {
            title: translate('totalOrders'),
            value: '150',
            icon: <OrdersIcon />,
            color: theme.palette.primary.main
        },
        {
            title: translate('totalCustomers'),
            value: '1,250',
            icon: <CustomersIcon />,
            color: theme.palette.success.main
        },
        {
            title: translate('totalProducts'),
            value: '450',
            icon: <ProductsIcon />,
            color: theme.palette.warning.main
        },
        {
            title: translate('totalSales'),
            value: '$15,750',
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
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    mb: 4,
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
            >
                {translate('dashboard')}
            </Typography>

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
                            title={translate('salesOverTime')}
                            titleTypographyProps={{ 
                                variant: 'h6',
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                            }}
                        />
                        <CardContent>
                            {/* Chart component will go here */}
                            <Box sx={{ 
                                height: { xs: 200, sm: 300 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Typography color="textSecondary">
                                    {translate('chartComingSoon')}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardHeader
                            title={translate('recentOrders')}
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
                                    {translate('noRecentOrders')}
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
