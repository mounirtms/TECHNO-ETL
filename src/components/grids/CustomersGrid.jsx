import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import magentoApi from '../../services/magentoService';
import { toast } from 'react-toastify';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import { getStatusColumn } from '../../utils/gridUtils';

/**
 * CustomersGrid Component
 * Displays customer data in a grid format with status cards
 */
const CustomersGrid = () => {
    // State management
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
            field: 'email', 
            headerName: 'Email', 
            width: 250 
        },
        { 
            field: 'firstname', 
            headerName: 'First Name', 
            flex: 1 
        },
        { 
            field: 'lastname', 
            headerName: 'Last Name', 
            flex: 1 
        },
        
        getStatusColumn('status', {
            filterOptions: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
            ]
        })
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

            if (filter?.status) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'status',
                        value: filter.status,
                        condition_type: 'eq'
                    }]
                });
            }

            const response = await magentoApi.getCustomers(searchCriteria);
            const customers = response?.items || [];
            setData(customers);
            updateStats(customers);
        } catch (error) {
            toast.error(error.message || 'Failed to load customers');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update customer statistics
    const updateStats = useCallback((customers) => {
        const newStats = customers.reduce((acc, customer) => ({
            total: acc.total + 1,
            active: acc.active + (customer.status === 'active' ? 1 : 0),
            inactive: acc.inactive + (customer.status === 'inactive' ? 1 : 0)
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
            title: "All Customers",
            value: stats.total,
            icon: PeopleIcon,
            color: "primary",
            active: !filters.status,
            onClick: () => setFilters({})
        },
        {
            title: "Active",
            value: stats.active,
            icon: CheckCircleIcon,
            color: "success",
            active: filters.status === 'active',
            onClick: () => setFilters({ status: 'active' })
        },
        {
            title: "Inactive",
            value: stats.inactive,
            icon: BlockIcon,
            color: "error",
            active: filters.status === 'inactive',
            onClick: () => setFilters({ status: 'inactive' })
        }
    ];

    return (
        <Box>
            <StatsCards cards={statCards} />
            <BaseGrid
                gridName="CustomersGrid"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={handleRefresh}
                currentFilter={filters}
                onFilterChange={setFilters}
                onError={(error) => toast.error(error.message)}
            />
        </Box>
    );
};

export default CustomersGrid;
