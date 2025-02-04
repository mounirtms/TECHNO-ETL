import React, { useState, useCallback } from 'react';
import BaseGrid from '../common/BaseGrid';
import  magentoApi  from '../../services/magentoApi';

const columns = [
    {
        field: 'stock_id',
        headerName: 'Stock ID',
        width: 120,
        type: 'number'
    },
    {
        field: 'name',
        headerName: 'Name',
        width: 200,
        flex: 1
    },
    {
        field: 'sales_channels',
        headerName: 'Sales Channels',
        width: 300,
        flex: 1,
        valueGetter: (params) => {
            if (!params.row.sales_channels) return 'None';
            return params.row.sales_channels
                .map(channel => channel.type + ': ' + channel.code)
                .join(', ');
        }
    },
    {
        field: 'source_codes',
        headerName: 'Sources',
        width: 300,
        flex: 1,
        valueGetter: (params) => {
            if (!params.row.source_codes || params.row.source_codes.length === 0) {
                return 'No sources assigned';
            }
            return params.row.source_codes.join(', ');
        }
    }
];

const StocksGrid = () => {
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [data, setData] = useState([]);

    const handleRefresh = useCallback(async (params) => {
        try {
            setLoading(true);
            const response = await magentoApi.getStocks(params);
            setData(response.items || []);
            setTotalCount(response.total_count || 0);
        } catch (error) {
            console.error('Error fetching stocks:', error);
            // You might want to show an error message to the user here
        } finally {
            setLoading(false);
        }
    }, []);

    const gridCards = [
        {
            title: 'Total Stocks',
            value: totalCount,
            color: 'primary'
        },
        {
            title: 'Stocks with Sources',
            value: data.filter(stock => stock.source_codes?.length > 0).length,
            color: 'success'
        },
        {
            title: 'Stocks without Sources',
            value: data.filter(stock => !stock.source_codes?.length).length,
            color: 'warning'
        }
    ];

    return (
        <BaseGrid
            gridName="stocks"
            columns={columns}
            data={data}
            loading={loading}
            onRefresh={handleRefresh}
            totalCount={totalCount}
            gridCards={gridCards}
            getRowId={(row) => row.stock_id}
        />
    );
};

export default StocksGrid;