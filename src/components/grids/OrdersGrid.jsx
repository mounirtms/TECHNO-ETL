import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import magentoApi from '../../services/magentoService';
import { toast } from 'react-toastify';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import { getStatusColumn } from '../../utils/gridUtils';

/**
 * OrdersGrid Component
 * Displays orders data in a grid format with status cards
 */
const OrdersGrid = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        processing: 0,
        shipped: 0,
        completed: 0,
        cancelled: 0
    });

    // Grid columns configuration
    const columns = [
        { 
            field: 'increment_id', 
            headerName: 'Order #', 
            width: 130 
        },
        { 
            field: 'customer_name', 
            headerName: 'Customer', 
            flex: 1,
            valueGetter: (params) => 
                `${params.row.customer_firstname || ''} ${params.row.customer_lastname || ''}`
        },
       
        getStatusColumn('status', {
            filterOptions: [
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'complete', label: 'Complete' },
                { value: 'cancelled', label: 'Cancelled' }
            ]
        })
    ];

    // Data fetching handler
    const handleRefresh = useCallback(async ({ page, pageSize, filter }) => {
        try {
            setLoading(true);
            const searchCriteria = {
                filterGroups: [],
                pageSize,
                currentPage: page + 1
            };

            if (filter?.status) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'status',
                        value: filter.status,
                        condition_type: 'eq'
                    }]
                });
            }

            const response = await magentoApi.getOrders(searchCriteria);
            const orders = response?.items || [];
            setData(orders);
            updateStats(orders);
        } catch (error) {
            toast.error(error.message || 'Failed to load orders');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update order statistics
    const updateStats = useCallback((orders) => {
        const newStats = orders.reduce((acc, order) => ({
            total: acc.total + 1,
            processing: acc.processing + (order.status === 'processing' ? 1 : 0),
            shipped: acc.shipped + (order.status === 'shipped' ? 1 : 0),
            completed: acc.completed + (order.status === 'complete' ? 1 : 0),
            cancelled: acc.cancelled + (order.status === 'cancelled' ? 1 : 0)
        }), {
            total: 0,
            processing: 0,
            shipped: 0,
            completed: 0,
            cancelled: 0
        });
        setStats(newStats);
    }, []);

    // Stats cards configuration
    const statCards = [
        {
            title: "All Orders",
            value: stats.total,
            icon: ShoppingCartIcon,
            color: "primary",
            active: !filters.status,
            onClick: () => setFilters({})
        },
        {
            title: "Processing",
            value: stats.processing,
            icon: PendingIcon,
            color: "warning",
            active: filters.status === 'processing',
            onClick: () => setFilters({ status: 'processing' })
        },
        {
            title: "Shipped",
            value: stats.shipped,
            icon: LocalShippingIcon,
            color: "info",
            active: filters.status === 'shipped',
            onClick: () => setFilters({ status: 'shipped' })
        },
        {
            title: "Completed",
            value: stats.completed,
            icon: CheckCircleIcon,
            color: "success",
            active: filters.status === 'complete',
            onClick: () => setFilters({ status: 'complete' })
        },
        {
            title: "Cancelled",
            value: stats.cancelled,
            icon: CancelIcon,
            color: "error",
            active: filters.status === 'cancelled',
            onClick: () => setFilters({ status: 'cancelled' })
        }
    ];

    return (
        <Box>
            <StatsCards cards={statCards} />
            <BaseGrid
                gridName="OrdersGrid"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={handleRefresh}
                currentFilter={filters}
                onFilterChange={setFilters}
                onError={(error) => toast.error(error.message)}
            />
        </Box>
    );
};

export default OrdersGrid;