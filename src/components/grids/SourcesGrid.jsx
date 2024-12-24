import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import magentoApi from '../../services/magentoApi';
import { toast } from 'react-toastify';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

const SourcesGrid = ({ productId }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        enabled: 0,
        disabled: 0
    });

    // Grid columns configuration
    const columns = [
        {
            field: 'source_code',
            headerName: 'Source Code',
            width: 150
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1
        },
        {
            field: 'country_id',
            headerName: 'Country',
            width: 120
        },
        {
            field: 'city',
            headerName: 'City',
            width: 150
        },
        {
            field: 'postcode',
            headerName: 'Postcode',
            width: 120
        },
        {
            field: 'enabled',
            headerName: 'Status',
            width: 120,
            type: 'singleSelect',
            valueOptions: [
                { value: true, label: 'Enabled' },
                { value: false, label: 'Disabled' }
            ],
            valueFormatter: (params) => params.value ? 'Enabled' : 'Disabled'
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

            if (filter?.enabled !== undefined) {
                const isEnabled = filter.enabled === 'true' || filter.enabled === true;
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'enabled',
                        value: isEnabled,
                        condition_type: 'eq'
                    }]
                });
            }

            const response = await magentoApi.getSources(searchCriteria);
            setData(response.items || []);
            updateStats(response.items || []);
        } catch (error) {
            toast.error(error.message || 'Failed to load sources');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [productId]);

    // Update source statistics
    const updateStats = useCallback((sources) => {
        const newStats = sources.reduce((acc, source) => ({
            total: acc.total + 1,
            enabled: acc.enabled + (source.enabled ? 1 : 0),
            disabled: acc.disabled + (!source.enabled ? 1 : 0)
        }), {
            total: 0,
            enabled: 0,
            disabled: 0
        });
        setStats(newStats);
    }, []);

    // Stats cards configuration
    const statCards = [
        {
            title: "All Sources",
            value: stats.total,
            icon: WarehouseIcon,
            color: "primary",
            active: !filters.enabled,
            onClick: () => setFilters({})
        },
        {
            title: "Enabled",
            value: stats.enabled,
            icon: CheckCircleIcon,
            color: "success",
            active: filters.enabled === true,
            onClick: () => setFilters({ enabled: true })
        },
        {
            title: "Disabled",
            value: stats.disabled,
            icon: BlockIcon,
            color: "error",
            active: filters.enabled === false,
            onClick: () => setFilters({ enabled: false })
        }
    ];

    return (

        <BaseGrid
            columns={columns}
            data={data}
            loading={loading}
            gridCards={statCards}
            onRefresh={handleRefresh}
            currentFilter={filters}
            onFilterChange={setFilters}
            onError={(error) => toast.error(error.message)}
            getRowId={(row) => row.source_code}
        />

    );
};

export default SourcesGrid;