import React, { useState, useCallback } from 'react';
import BaseGrid from '../common/BaseGrid';
import magentoApi from '../../services/magentoApi';
import { toast } from 'react-toastify';

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
            return params?.row?.sales_channels?.length
                ? params.row.sales_channels.map(channel => `${channel?.type ?? 'Unknown'}: ${channel?.code ?? 'N/A'}`).join(', ')
                : 'None';
        }
    },
    {
        field: 'source_codes',
        headerName: 'Sources',
        width: 300,
        flex: 1,
        valueGetter: (params) => {
            return params?.row?.source_codes?.length
                ? params.row.source_codes.join(', ')
                : 'No sources assigned';
        }
    }
];

const StocksGrid = () => {
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null); // Error state

    const handleRefresh = useCallback(async (params) => {
        try {
            setLoading(true);
            setError(null); // Reset error on new request

            const response = await magentoApi.getStocks(params);
            
            if (!response) {
                throw new Error('No response received from the server.');
            }

            setData(response?.items ?? []);
            setTotalCount(response?.total_count ?? 0);
        } catch (error) {
            console.error('Error fetching stocks:', error);
            setError('Failed to load stocks. Please try again.');
            toast.error('Error loading stocks.');
        } finally {
            setLoading(false);
        }
    }, []);

    const gridCards = [
        {
            title: 'Total Stocks',
            value: totalCount ?? 0,
            color: 'primary'
        },
        {
            title: 'Stocks with Sources',
            value: data?.filter(stock => stock?.source_codes?.length > 0)?.length ?? 0,
            color: 'success'
        },
        {
            title: 'Stocks without Sources',
            value: data?.filter(stock => !stock?.source_codes?.length)?.length ?? 0,
            color: 'warning'
        }
    ];

    return (
        <>
            {error && <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '10px' }}>{error}</div>}
            <BaseGrid
                gridName="stocks"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={handleRefresh}
                totalCount={totalCount}
                gridCards={gridCards}
                getRowId={(row) => row?.stock_id ?? Math.random().toString(36).substr(2, 9)}
            />
        </>
    );
};

export default StocksGrid;
