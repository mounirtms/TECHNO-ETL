import React from 'react';
import BaseGrid from '../common/BaseGrid';
import { getCustomers } from '../../services/dataService';
import Avatar from '@mui/material/Avatar';

const columns = [
 
    { 
        field: 'name', 
        headerName: 'Customer Name', 
        width: 200,
        valueGetter: (params) => 
            `${params.row.firstname || ''} ${params.row.lastname || ''}`
    },
    { field: 'email', headerName: 'Email', width: 250 },
    { 
        field: 'created_at', 
        headerName: 'Created At', 
        width: 200,
        valueFormatter: (params) => 
            new Date(params.value).toLocaleString()
    },
    { 
        field: 'is_active', 
        headerName: 'Status', 
        width: 130,
        valueGetter: (params) => params.value ? 'Active' : 'Inactive'
    },
    { 
        field: 'orders_count', 
        headerName: 'Orders', 
        width: 100,
        valueGetter: (params) => params.row.orders?.length || 0
    },
    { 
        field: 'total_spent', 
        headerName: 'Total Spent', 
        width: 150,
        valueGetter: (params) => {
            const total = params.row.orders?.reduce((sum, order) => 
                sum + (parseFloat(order.grand_total) || 0), 0) || 0;
            return new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
            }).format(total);
        }
    }
];

const CustomersGrid = () => {
    const customersData = getCustomers();

    return (
        <BaseGrid
            title="Customers"
            columns={columns}
            data={customersData}
            initialSort={[{ field: 'created_at', sort: 'desc' }]}
        />
    );
};

export default CustomersGrid;
