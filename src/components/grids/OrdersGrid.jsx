import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import magentoApi from '../../services/magentoApi';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Cancel';
import { generateColumns, getStatusColumn } from '../../utils/gridUtils';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

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
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

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

    const handleEditClick = (order) => {
        setSelectedOrder(order);
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setSelectedOrder(null);
    };

    const handleOrderUpdate = async () => {
        try {
            await magentoApi.updateOrder(selectedOrder.id, selectedOrder);
            toast.success('Order updated successfully');
            handleEditDialogClose();
        } catch (error) {
            toast.error('Failed to update order');
        }
    };

    const columns = generateColumns(data[0] || {}, [
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
            type: 'money',
        },
        getStatusColumn('status', {
            pending: 'warning',
            processing: 'info',
            complete: 'success',
            canceled: 'error',
            holded: 'default'
        }),
        {
            field: 'created_at_order',
            headerName: 'Order Date',
            width: 180,
            id: 'created_at_order'
        }
    ]);

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
        setLoading(true);
        try {
            const params = {
                pageSize: pageSize,
                currentPage: page + 1,
                sortOrders: [
                    {
                        field: 'created_at',
                        direction: 'DESC'
                    }
                ],
                filterGroups: []
            };

            if (filters.status) {
                params.filterGroups.push({
                    filters: [
                        {
                            field: 'status',
                            value: filters.status,
                            conditionType: 'eq'
                        }
                    ]
                });
            }

            if (filters.created_at) {
                params.filterGroups.push({
                    filters: [
                        {
                            field: 'created_at',
                            value: filters.created_at,
                            conditionType: 'gt'
                        }
                    ]
                });
            }

            const response = await magentoApi.getOrders(params);
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
                getRowId={(row) => row.increment_id}
                onEdit={handleEditClick}
            />
            <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
                <DialogTitle>Edit Order</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Order #"
                        value={selectedOrder?.increment_id || ''}
                        fullWidth
                        disabled
                    />
                    <TextField
                        label="Customer Name"
                        value={`${selectedOrder?.customer_firstname || ''} ${selectedOrder?.customer_lastname || ''}`}
                        fullWidth
                        disabled
                    />
                    {/* Add more fields as necessary for editing */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleOrderUpdate} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrdersGrid;