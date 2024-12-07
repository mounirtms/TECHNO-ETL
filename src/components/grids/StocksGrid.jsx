import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import magentoApi from '../../services/magentoService';
import { toast } from 'react-toastify';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

const StocksGrid = ({ productId }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    // Grid columns configuration
    const columns = [
        { 
            field: 'stock_id', 
            headerName: 'Stock ID', 
            width: 120 
        },
        { 
            field: 'name', 
            headerName: 'Name', 
            flex: 1 
        },
        { 
            field: 'sales_channels', 
            headerName: 'Sales Channels',
            width: 200,
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.map(channel => channel.type).join(', ');
            }
        },
        { 
            field: 'sources_assigned', 
            headerName: 'Sources',
            width: 150,
            valueFormatter: (params) => params.value?.length || 0
        },
        { 
            field: 'is_active', 
            headerName: 'Status',
            width: 120,
            type: 'singleSelect',
            valueOptions: [
                { value: true, label: 'Active' },
                { value: false, label: 'Inactive' }
            ],
            valueFormatter: (params) => params.value ? 'Active' : 'Inactive'
        }
    ];

    // Data fetching handler
    const handleRefresh = useCallback(async ({ page, pageSize, filter }) => {
        try {
            setLoading(true);
            
            const searchCriteria = {
                filterGroups: [],
                pageSize,
                currentPage: page + 1
            };

            if (productId) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'product_id',
                        value: productId,
                        condition_type: 'eq'
                    }]
                });
            }

            if (filter?.is_active !== undefined) {
                const isActive = filter.is_active === 'true' || filter.is_active === true;
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'is_active',
                        value: isActive,
                        condition_type: 'eq'
                    }]
                });
            }

            const response = await magentoApi.getStocks(searchCriteria);
            setData(response.items || []);
            updateStats(response.items || []);
        } catch (error) {
            toast.error(error.message || 'Failed to load stocks');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [productId]);

    // Update stock statistics
    const updateStats = useCallback((stocks) => {
        const newStats = stocks.reduce((acc, stock) => ({
            total: acc.total + 1,
            active: acc.active + (stock.is_active ? 1 : 0),
            inactive: acc.inactive + (!stock.is_active ? 1 : 0)
        }), {
            total: 0,
            active: 0,
            inactive: 0
        });
        setStats(newStats);
    }, []);

    // Stats cards configuration
    const statCards = [
        {
            title: "All Stocks",
            value: stats.total,
            icon: Inventory2Icon,
            color: "primary",
            active: !filters.is_active,
            onClick: () => setFilters({})
        },
        {
            title: "Active",
            value: stats.active,
            icon: CheckCircleIcon,
            color: "success",
            active: filters.is_active === true,
            onClick: () => setFilters({ is_active: true })
        },
        {
            title: "Inactive",
            value: stats.inactive,
            icon: BlockIcon,
            color: "error",
            active: filters.is_active === false,
            onClick: () => setFilters({ is_active: false })
        }
    ];

    return (
        <Box>
            <StatsCards cards={statCards} />
            <BaseGrid
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={handleRefresh}
                currentFilter={filters}
                onFilterChange={setFilters}
                onError={(error) => toast.error(error.message)}
                getRowId={(row) => row.stock_id}
            />
        </Box>
    );
};

export default StocksGrid;