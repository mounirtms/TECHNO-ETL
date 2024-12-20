import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import magentoApi from '../../services/magentoService';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Cancel';
import { getStatusColumn } from '../../utils/gridUtils';

const OrdersGrid = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [currentFilter, setCurrentFilter] = useState('last7d');
    const [stats, setStats] = useState({
        totalOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        canceledOrders: 0
    });

    const filterOptions = [
        { value: 'all', label: 'All Orders' },
        { value: 'last24h', label: 'Last 24 Hours' },
        { value: 'last7d', label: 'Last 7 Days' },
        { value: 'last30d', label: 'Last 30 Days' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'complete', label: 'Complete' },
        { value: 'canceled', label: 'Canceled' },
        { value: 'holded', label: 'On Hold' }
    ];

    const columns = [
        {
            field: 'increment_id',
            headerName: 'Order #',
            width: 130,
            id: 'increment_id'
        },
        {
            field: 'customer_firstname',
            headerName: 'Customer Name',
            width: 200,
            id: 'customer_name',
            valueGetter: (params) =>
                `${params.row.customer_firstname || ''} ${params.row.customer_lastname || ''}`
        },
        {
            field: 'grand_total',
            headerName: 'Total',
            width: 130,
            id: 'grand_total',
            type: 'number',
            valueFormatter: (params) => {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(params.value);
            }
        },
        getStatusColumn('status', {
            pending: 'warning',
            processing: 'info',
            complete: 'success',
            canceled: 'error',
            holded: 'default'
        }),
        {
            field: 'created_at',
            headerName: 'Order Date',
            width: 180,
            id: 'created_at',
            valueFormatter: (params) =>
                new Date(params.value).toLocaleString()
        }
    ];

    const updateStats = useCallback((orders) => {
        const newStats = orders.reduce((acc, order) => ({
            totalOrders: acc.totalOrders + 1,
            processingOrders: acc.processingOrders + (order.status === 'processing' ? 1 : 0),
            completedOrders: acc.completedOrders + (order.status === 'complete' ? 1 : 0),
            canceledOrders: acc.canceledOrders + (order.status === 'canceled' ? 1 : 0)
        }), {
            totalOrders: 0,
            processingOrders: 0,
            completedOrders: 0,
            canceledOrders: 0
        });
        setStats(newStats);
    }, []);

    const fetchOrders = useCallback(async ({ page = 0, pageSize = 25 } = {}) => {
        try {
            setLoading(true);
            const searchCriteria = {
                filterGroups: [],
                pageSize: pageSize,
                currentPage: page + 1,
                filters: [{
                    field: 'created_at',
                    value: filters.created_at,
                    conditionType: 'gt'
                }]
            };

            if (filters.status) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'status',
                        value: filters.status,
                        conditionType: 'eq'
                    }]
                });
            }

            if (filters.created_at) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'created_at',
                        value: filters.created_at,
                        conditionType: 'gt'
                    }]
                });
            }

            const response = await magentoApi.getOrders(searchCriteria);
            const orders = response?.items || [];
            setData(orders);
            updateStats(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [filters, updateStats]);

    const handleFilterChange = useCallback((filter) => {
        setCurrentFilter(filter);
        let filterParams = {};
        const now = new Date();
        
        switch(filter) {
            case 'pending':
                filterParams = { status: 'pending' };
                break;
            case 'processing':
                filterParams = { status: 'processing' };
                break;
            case 'complete':
                filterParams = { status: 'complete' };
                break;
            case 'canceled':
                filterParams = { status: 'canceled' };
                break;
            case 'holded':
                filterParams = { status: 'holded' };
                break;
            case 'last24h':
                const last24h = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                filterParams = { created_at: last24h.toISOString() };
                break;
            case 'last7d':
                const last7d = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                filterParams = { created_at: last7d.toISOString() };
                break;
            case 'last30d':
                const last30d = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                filterParams = { created_at: last30d.toISOString() };
                break;
            default:
                filterParams = {};
        }
        setFilters(filterParams);
    }, []);

    // Set initial filter
    useEffect(() => {
        const now = new Date();
        const last7d = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const initialFilters = { created_at: last7d.toISOString() };
        setFilters(initialFilters);
    }, []);

    // Initial data fetch when filters change
    useEffect(() => {
        fetchOrders();
    }, [filters, fetchOrders]);

    return (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <StatsCards
                cards={[
                    {
                        title: 'Total Orders',
                        value: stats.totalOrders,
                        icon: ShoppingCartIcon,
                        color: 'primary'
                    },
                    {
                        title: 'Processing',
                        value: stats.processingOrders,
                        icon: LocalShippingIcon,
                        color: 'info'
                    },
                    {
                        title: 'Canceled',
                        value: stats.canceledOrders,
                        icon: CancelIcon,
                        color: 'error'
                    }
                ]}
            />
            <BaseGrid
                gridName="OrdersGrid"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={fetchOrders}
                filterOptions={filterOptions}
                currentFilter={currentFilter}
                onFilterChange={handleFilterChange}
                totalCount={stats.totalOrders}
            />
        </Box>
    );
};

export default OrdersGrid;