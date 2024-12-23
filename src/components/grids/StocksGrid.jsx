import React from 'react';
import BaseGrid from '../common/BaseGrid';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import { generateColumns } from '../../utils/gridUtils';

const columns = generateColumns({}, [
    { field: 'product_id', headerName: 'Product ID', width: 130 },
    { field: 'sku', headerName: 'SKU', width: 150 },
    { field: 'name', headerName: 'Name', width: 200 },
    { 
        field: 'qty', 
        headerName: 'Quantity', 
        width: 130,
        type: 'number',
        valueFormatter: (params) => formatNumber(params.value)
    },
    { 
        field: 'is_in_stock', 
        headerName: 'In Stock', 
        width: 130,
        type: 'boolean'
    },
    { 
        field: 'stock_update_date', 
        headerName: 'Last Updated', 
        width: 180,
        valueGetter: (params) => params.row.updated_at,
        valueFormatter: (params) => formatDateTime(params.value)
    }
]);

const StocksGrid = ({ 
    data = [], 
    loading = false,
    onRefresh,
    currentFilter,
    onFilterChange 
}) => {
    return (
        <BaseGrid
            gridName="StocksGrid"
            columns={columns}
            data={data}
            loading={loading}
            onRefresh={onRefresh}
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            getRowId={(row) => row.product_id}
            defaultSortModel={[
                { field: 'stock_update_date', sort: 'desc' }
            ]}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50, 100]}
        />
    );
};

export default StocksGrid;