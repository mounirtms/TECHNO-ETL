import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import magentoApi from '../../services/magentoService';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import { getStatusColumn } from '../../utils/gridUtils';
import { toast } from 'react-toastify';

const CustomersGrid = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [currentFilter, setCurrentFilter] = useState('all');
    const [stats, setStats] = useState({
        totalCustomers: 0,
        newCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0
    });

    const filterOptions = [
        { value: 'all', label: 'All Customers' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'newToday', label: 'New Today' },
        { value: 'newWeek', label: 'New This Week' },
        { value: 'newMonth', label: 'New This Month' },
        { value: 'hasOrders', label: 'With Orders' },
        { value: 'noOrders', label: 'No Orders' },
        { value: 'newsletter', label: 'Newsletter Subscribers' }
    ];

    const handleFilterChange = (filter) => {
        setCurrentFilter(filter);
        
        let filterParams = {};
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch(filter) {
            case 'active':
                filterParams = { 'is_active[eq]': 1 };
                break;
            case 'inactive':
                filterParams = { 'is_active[eq]': 0 };
                break;
            case 'newToday':
                filterParams = { 'created_at[gt]': today.toISOString() };
                break;
            case 'newWeek':
                const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                filterParams = { 'created_at[gt]': weekAgo.toISOString() };
                break;
            case 'newMonth':
                const monthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                filterParams = { 'created_at[gt]': monthAgo.toISOString() };
                break;
            case 'hasOrders':
                filterParams = { 'orders_count[gt]': 0 };
                break;
            case 'noOrders':
                filterParams = { 'orders_count[eq]': 0 };
                break;
            case 'newsletter':
                filterParams = { 'is_subscribed[eq]': 1 };
                break;
            default:
                filterParams = {};
        }
        setFilters(filterParams);
        fetchCustomers(filterParams);
    };

    const columns = [
        { 
            field: 'id', 
            headerName: 'ID', 
            width: 70 
        },
        { 
            field: 'email', 
            headerName: 'Email', 
            width: 250 
        },
        { 
            field: 'firstname',
            headerName: 'Name',
            width: 200,
            valueGetter: (params) => 
                `${params.row.firstname || ''} ${params.row.lastname || ''}`
        },
        {
            field: 'created_at',
            headerName: 'Registration Date',
            width: 180,
            valueFormatter: (params) => 
                new Date(params.value).toLocaleString()
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

    const fetchCustomers = useCallback(async (filterParams) => {
        try {
            setLoading(true);
            const searchCriteria = {
                filterGroups: [],
                pageSize: 10,
                currentPage: 1
            };

            if (filterParams) {
                searchCriteria.filterGroups.push({
                    filters: Object.keys(filterParams).map(key => ({
                        field: key,
                        value: filterParams[key],
                        condition_type: 'eq'
                    }))
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

    const updateStats = useCallback((customers) => {
        const newStats = customers.reduce((acc, customer) => ({
            totalCustomers: acc.totalCustomers + 1,
            newCustomers: acc.newCustomers + (customer.created_at >= new Date().setDate(new Date().getDate() - 1) ? 1 : 0),
            activeCustomers: acc.activeCustomers + (customer.is_active === 1 ? 1 : 0),
            inactiveCustomers: acc.inactiveCustomers + (customer.is_active === 0 ? 1 : 0)
        }), {
            totalCustomers: 0,
            newCustomers: 0,
            activeCustomers: 0,
            inactiveCustomers: 0
        });
        setStats(newStats);
    }, []);

    return (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <StatsCards
                cards={[
                    {
                        title: 'Total Customers',
                        value: stats.totalCustomers,
                        icon: PeopleIcon,
                        color: 'primary'
                    },
                    {
                        title: 'New Customers',
                        value: stats.newCustomers,
                        icon: PersonAddIcon,
                        color: 'success'
                    },
                    {
                        title: 'Inactive',
                        value: stats.inactiveCustomers,
                        icon: BlockIcon,
                        color: 'error'
                    }
                ]}
            />
            <BaseGrid
                gridName="CustomersGrid"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={() => fetchCustomers(filters)}
                filterOptions={filterOptions}
                currentFilter={currentFilter}
                onFilterChange={handleFilterChange}
            />
        </Box>
    );
};

export default CustomersGrid;
