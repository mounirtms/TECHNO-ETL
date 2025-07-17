import React, { useState, useCallback } from 'react';
import UnifiedGrid from '../../common/UnifiedGrid';
import magentoApi from '../../../services/magentoApi';
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

            // Handle {data: {items: []}} response structure
            const stocksData = response?.data || response;
            setData(stocksData?.items ?? []);
            setTotalCount(stocksData?.total_count ?? 0);
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
            <UnifiedGrid
                gridName="stocks"
                columns={columns}
                data={data}
                loading={loading}

                // Feature toggles
                enableCache={true}
                enableI18n={true}
                enableRTL={true}
                enableSelection={true}
                enableSorting={true}
                enableFiltering={true}

                // View options
                showStatsCards={true}
                gridCards={gridCards}
                totalCount={totalCount}
                defaultPageSize={25}

                // Toolbar configuration
                toolbarConfig={{
                    showRefresh: true,
                    showExport: true,
                    showSearch: true,
                    showFilters: true,
                    showSettings: true
                }}

                // Context menu
                contextMenuActions={{
                    view: {
                        enabled: true,
                        onClick: (rowData) => {
                            console.log('Viewing stock:', rowData);
                            toast.info(`Viewing stock: ${rowData.stock_id}`);
                        }
                    }
                }}

                // Floating actions (disabled by default)
                enableFloatingActions={false}
                floatingActions={{
                    export: {
                        enabled: true,
                        priority: 1
                    },
                    refresh: {
                        enabled: true,
                        priority: 2
                    }
                }}

                // Event handlers
                onRefresh={handleRefresh}
                onExport={(selectedRows) => {
                    const exportData = selectedRows.length > 0
                        ? data.filter(stock => selectedRows.includes(stock.stock_id))
                        : data;
                    console.log('Exporting stocks:', exportData);
                    toast.success(`Exported ${exportData.length} stocks`);
                }}

                // Row configuration
                getRowId={(row) => row?.stock_id ?? Math.random().toString(36).substr(2, 9)}

                // Error handling
                onError={(error) => {
                    console.error('Stocks Grid Error:', error);
                    toast.error('Error loading stocks');
                }}
            />
        </>
    );
};

export default StocksGrid;
