/**
 * Dashboard Statistics Cards Component
 * Displays key metrics and statistics for the dashboard
 */

import React from 'react';
import { Box } from '@mui/material';
import { StatsCards } from '../common/StatsCards';
import {
    ShoppingBag, SupervisorAccount, Category, CurrencyExchange,
    PersonAddAlt, RocketLaunch, Store, AutoGraph
} from '@mui/icons-material';
import { formatCurrency } from '../../services/dashboardService';

/**
 * Dashboard Statistics Component
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics data
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} Dashboard statistics cards
 */
const DashboardStats = ({ stats, loading }) => {
    // Prepare stats cards configuration
    const statsCards = [
        {
            title: 'Total Orders',
            value: stats.totalOrders || 0,
            icon: ShoppingBag,
            color: 'primary',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            description: 'All time orders'
        },
        {
            title: 'Active Customers',
            value: stats.totalCustomers || 0,
            icon: SupervisorAccount,
            color: 'success',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            description: 'Registered users'
        },
        {
            title: 'Products',
            value: stats.totalProducts || 0,
            icon: Category,
            color: 'info',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            description: 'In inventory'
        },
        {
            title: 'Revenue',
            value: formatCurrency(stats.totalRevenue || 0),
            icon: CurrencyExchange,
            color: 'warning',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            description: 'Total revenue (DZD)'
        },
        {
            title: 'Avg Order Value',
            value: formatCurrency(stats.avgOrderValue || 0),
            icon: AutoGraph,
            color: 'secondary',
            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            description: 'Average order value'
        },
        {
            title: 'New Customers',
            value: stats.newCustomers || 0,
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
        },
        {
            title: 'Active Stores',
            value: stats.activeStores || 0,
            icon: Store,
            color: 'primary',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            description: 'Operating locations'
        }
    ];

    if (loading) {
        return (
            <Box sx={{ mt: 3 }}>
                <StatsCards 
                    cards={statsCards.map(card => ({ ...card, value: '...' }))} 
                />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 3 }}>
            <StatsCards cards={statsCards.slice(0, 8)} />
        </Box>
    );
};

export default DashboardStats;
