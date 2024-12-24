import React, { useState, useCallback, useEffect } from 'react';
import BaseGrid from '../common/BaseGrid';
import { generateColumns, getStatusColumn } from '../../utils/gridUtils';
import { formatDateTime } from '../../utils/formatters';
import { Box } from '@mui/material';
import { StatsCards } from '../common/StatsCards';
import PersonIcon from '@mui/icons-material/Person';
import ActiveIcon from '@mui/icons-material/CheckCircle';
import InactiveIcon from '@mui/icons-material/Cancel';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const columns = generateColumns({}, [
    { field: 'entity_id', headerName: 'ID', width: 90 },
    { field: 'email', headerName: 'Email', width: 200 },
    { 
        field: 'name',
        headerName: 'Name',
        width: 200,
        valueGetter: (params) => 
            `${params.row.firstname || ''} ${params.row.lastname || ''}`
    },
    {
        field: 'registration_date',
        headerName: 'Registration Date',
        width: 180,
        valueGetter: (params) => params.row.created_at,
        valueFormatter: (params) => formatDateTime(params.value)
    },
    {
        field: 'orders_count',
        headerName: 'Orders',
        width: 100,
        type: 'number'
    },
    getStatusColumn('is_active', {
        1: 'success',
        0: 'error'
    }, {
        1: 'Active',
        0: 'Inactive'
    })
]);

const CustomersGrid = ({ 
    data = [], 
    loading = false, 
    onRefresh,
    currentFilter,
    onFilterChange 
}) => {
    // State for filters
    const [filterModel, setFilterModel] = useState({
        items: []
    });

    // Available filter options
    const filterOptions = [
        { value: 'active', label: 'Active Customers' },
        { value: 'inactive', label: 'Inactive Customers' },
        { value: 'last7d', label: 'Registered Last 7 Days' },
        { value: 'last30d', label: 'Registered Last 30 Days' }
    ];

    // Handle filter changes
    const handleFilterChange = useCallback((filterValue) => {
        // Update the current filter and filter model
        let newFilter = [];
        
        if (filterValue === 'active') {
            newFilter = [
                {
                    field: 'is_active',
                    operator: 'equals',
                    value: 1
                }
            ];
        } else if (filterValue === 'inactive') {
            newFilter = [
                {
                    field: 'is_active',
                    operator: 'equals',
                    value: 0
                }
            ];
        } else if (filterValue === 'last7d') {
            const last7d = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
            newFilter = [
                {
                    field: 'created_at',
                    operator: 'gt',
                    value: last7d.toISOString()
                }
            ];
        } else if (filterValue === 'last30d') {
            const last30d = new Date(new Date() - 30 * 24 * 60 * 60 * 1000);
            newFilter = [
                {
                    field: 'created_at',
                    operator: 'gt',
                    value: last30d.toISOString()
                }
            ];
        }

        setFilterModel({ items: newFilter });
        onFilterChange(newFilter); // Pass the new filter to parent component or API
    }, [onFilterChange]);

    // Calculate additional statistics for the stats cards
    const activeCustomers = data.filter(customer => customer.is_active === 1).length;
    const inactiveCustomers = data.filter(customer => customer.is_active === 0).length;
    const totalOrders = data.reduce((acc, customer) => acc + (customer.orders_count || 0), 0);

    return (
  
            <BaseGrid
                gridName="CustomersGrid"
                columns={columns}
                data={data}
                gridCards=  {[
                    {
                        title: 'Total Customers',
                        value: data.length,
                        icon: PersonIcon,
                        color: 'primary'
                    },
                    {
                        title: 'Active Customers',
                        value: activeCustomers,
                        icon: ActiveIcon,
                        color: 'success'
                    },
                    {
                        title: 'Inactive Customers',
                        value: inactiveCustomers,
                        icon: InactiveIcon,
                        color: 'error'
                    },
                    {
                        title: 'Total Orders',
                        value: totalOrders,
                        icon: ShoppingCartIcon,
                        color: 'secondary'
                    }
                ]}
                loading={loading}
                onRefresh={onRefresh}
                currentFilter={currentFilter}
                onFilterChange={handleFilterChange} 
                filterModel={filterModel} // Pass the filter model here
                getRowId={(row) => row.entity_id}
                defaultSortModel={[
                    { field: 'registration_date', sort: 'desc' }
                ]}
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50, 100]}
                filterOptions={filterOptions} // Provide the filter options
            />
      
    );
};

export default CustomersGrid;
