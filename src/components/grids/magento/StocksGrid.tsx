import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import UnifiedGrid from '../../common/UnifiedGrid';
import magentoApi from '../../../services/magentoApi';
import { toast } from 'react-toastify';
import {
    getStandardGridProps,
    getStandardToolbarConfig,
    STANDARD_GRID_CONTAINER_STYLES,
    STANDARD_GRID_AREA_STYLES,
    STANDARD_STATS_CONTAINER_STYLES
} from '../../../config/standardGridConfig';

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
                ? params.row.sales_channels.map((channel: any: any: any: any) => `${channel?.type ?? 'Unknown'}: ${channel?.code ?? 'N/A'}`).join(', ')
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
                ? params.row?.source_codes.join(', ')
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

            if(!response) {
                throw new Error('No response received from the server.');
            }

            // Handle {data: {items: []}} response structure
            const stocksData = response?.data || response;
            setData(stocksData?.items ?? []);
            setTotalCount(stocksData?.total_count ?? 0);
        } catch(error: any) {
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
            value: data?.filter((stock: any: any: any: any) => stock.source_codes?.length > 0)?.length ?? 0,
            color: 'success'
        },
        {
            title: 'Stocks without Sources',
            value: data?.filter((stock: any: any: any: any) => !stock.source_codes?.length)?.length ?? 0,
            color: 'warning'
        }
    ];

    return(<UnifiedGrid
            { ...getStandardGridProps('stocks', {
                gridName: "StocksGrid",
                columns: columns,
                data: data,
                loading: loading,
                showStatsCards: true,
                gridCards: gridCards,
                totalCount: totalCount,

                // Event handlers
                onRefresh: handleRefresh,
                onRowDoubleClick: (params) => {
                    console.log('Stock double-clicked for details:', params.row);
                    // Handle stock details view
                },

                // Row configuration
                getRowId: (row) => row?.stock_id ?? Math.random().toString(36).substr(2, 9)
            })}
        />

    );
};

export default StocksGrid;
