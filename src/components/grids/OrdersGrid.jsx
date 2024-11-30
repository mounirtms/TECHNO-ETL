import React, { useState, useEffect } from 'react';
import BaseGrid from '../common/BaseGrid';
import { getOrders } from '../../services/dataService';
import StatusRenderer from '../common/StatusRenderer';

const columns = [
    { field: 'increment_id', headerName: 'Order #', width: 130 },
    { 
        field: 'customer_firstname', 
        headerName: 'Customer', 
        width: 200,
        valueGetter: (params) => 
            `${params.row.customer_firstname || ''} ${params.row.customer_lastname || ''}`.trim() || 'Guest'
    },
    { 
        field: 'grand_total', 
        headerName: 'Total', 
        width: 130,
        valueFormatter: (params) => 
            new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: params.row.base_currency_code || 'USD'
            }).format(params.value)
    },
    { 
        field: 'status', 
        headerName: 'Status', 
        width: 150,
        renderCell: (params) => <StatusRenderer value={params.value} />
    },
    { 
        field: 'created_at', 
        headerName: 'Created At', 
        width: 200,
        valueFormatter: (params) => 
            new Date(params.value).toLocaleString()
    }
];

const OrdersGrid = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Get orders data from the service
        const ordersData = getOrders();
        // Add unique id to each order if not present
        const ordersWithIds = ordersData.map((order, index) => ({
            ...order,
            id: order.entity_id || order.increment_id || index + 1
        }));
        setOrders(ordersWithIds);
    }, []);

    return (
        <BaseGrid
            title="Orders"
            columns={columns}
            data={orders}
            initialSort={[{ field: 'created_at', sort: 'desc' }]}
        />
    );
};

export default OrdersGrid;
