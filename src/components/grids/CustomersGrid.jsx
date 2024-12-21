import React from 'react';
import BaseGrid from '../common/BaseGrid';
import { getStatusColumn } from '../../utils/gridUtils';
import { formatDateTime } from '../../utils/formatters';

const columns = [
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
];

const CustomersGrid = ({ 
    data = [], 
    loading = false, 
    onRefresh,
    currentFilter,
    onFilterChange 
}) => {
    return (
        <BaseGrid
            gridName="CustomersGrid"
            columns={columns}
            data={data}
            loading={loading}
            onRefresh={onRefresh}
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            getRowId={(row) => row.entity_id}
            defaultSortModel={[
                { field: 'registration_date', sort: 'desc' }
            ]}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50, 100]}
        />
    );
};

export default CustomersGrid;
