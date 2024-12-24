import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

    const columns = useMemo(() => generateColumns(data[0] || {}, [
        {
            field: 'increment_id',
            headerName: 'Order #',
            width: 130,
            hideable: false
        },
        {
            field: 'customer_firstname',
            headerName: 'Customer Name',
            width: 200,
            hideable: false,
            valueGetter: (params) =>
                `${params.row.customer_firstname || ''} ${params.row.customer_lastname || ''}`
        },
        {
            field: 'grand_total',
            headerName: 'Total',
            width: 130,
            type: 'money',
            hideable: false
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
            type: 'date',
            hideable: false
        }
    ]), [data]);

    const handleEditClick = (order) => {
        setSelectedOrder(order);
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setSelectedOrder(null);
    };

    const handleFilterChange = useCallback((filter) => {
        setCurrentFilter(filter);
        setLoading(true);

        const filterParams = [];
        const now = new Date();

        switch (filter) {
            case 'last24h':
                filterParams.push({
                    field: 'created_at',
                    value: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
                    operator: 'gt'
                });
                break;
            case 'last7d':
                filterParams.push({
                    field: 'created_at',
                    value: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    operator: 'gt'
                });
                break;
            case 'last30d':
                filterParams.push({
                    field: 'created_at',
                    value: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    operator: 'gt'
                });
                break;
            default:
                if (['pending', 'processing', 'complete', 'canceled', 'holded'].includes(filter)) {
                    filterParams.push({
                        field: 'status',
                        value: filter,
                        operator: 'equals'
                    });
                }
        }

        setFilters(filterParams);
    }, []);

    const fetchOrders = useCallback(async ({ page = 0, pageSize = 10 }) => {
        try {
            setLoading(true);
            const response = await magentoApi.getOrders({
                currentPage: page + 1,
                pageSize,
                filterGroups: filters.length > 0 ? [{ filters }] : []
            });

            if (response?.data?.items) {
                const orders = response.data.items;
                setData(orders);

                // Calculate stats
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
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const handleOrderUpdate = async () => {
        try {
            setLoading(true);
            await magentoApi.updateOrder(selectedOrder.id, selectedOrder);
            toast.success('Order updated successfully');
            handleEditDialogClose();
            fetchOrders({ page: 0, pageSize: 10 }); // Refresh after update
        } catch (error) {
            toast.error('Failed to update order');
            console.error('Error updating order:', error);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
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
    ];

    useEffect(() => {
        fetchOrders({ page: 0, pageSize: 10 });
    }, [filters, fetchOrders]);

    return (
        <>
            <BaseGrid
                gridName="OrdersGrid"
                columns={columns}
                data={data}
                loading={loading}
                gridCards={cards}
                onRefresh={fetchOrders}
                filterOptions={filterOptions}
                currentFilter={currentFilter}
                onFilterChange={handleFilterChange}
                totalCount={stats.totalOrders}
                defaultPageSize={10}
                onError={(error) => toast.error(error.message)}
                onEdit={handleEditClick}
            />

            <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
                <DialogTitle>Edit Order #{selectedOrder?.increment_id}</DialogTitle>
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
                    <Button onClick={handleEditDialogClose}>Cancel</Button>
                    <Button onClick={handleOrderUpdate} color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default OrdersGrid;