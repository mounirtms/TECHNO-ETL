import React, { useState, useCallback, useEffect, useMemo } from 'react';
import BaseGrid from '../common/BaseGrid';
import { generateColumns, getStatusColumn } from '../../utils/gridUtils';
import { formatDateTime } from '../../utils/formatters';
import magentoApi from '../../services/magentoApi';
import PersonIcon from '@mui/icons-material/Person';
import ActiveIcon from '@mui/icons-material/CheckCircle';
import InactiveIcon from '@mui/icons-material/Cancel';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const columns = (data = []) => generateColumns(data[0] || {}, [
  
    { field: 'email', headerName: 'Email', width: 200 },
 
   
   
    getStatusColumn('is_active', {
        1: 'success',
        0: 'error'
    }, {
        1: 'Active',
        0: 'Inactive'
    })
    // You can add more columns for addresses, custom_attributes, etc.
]);

const CustomersGrid = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState([]);
    const [currentFilter, setCurrentFilter] = useState('all');

    const filterOptions = [
        { value: 'all', label: 'All Customers' },
        { value: 'active', label: 'Active Customers' },
        { value: 'inactive', label: 'Inactive Customers' },
        { value: 'last7d', label: 'Registered Last 7 Days' },
        { value: 'last30d', label: 'Registered Last 30 Days' }
    ];

    const handleFilterChange = useCallback((filter) => {
        setCurrentFilter(filter);
        let filterParams = [];
        const now = new Date();
        switch (filter) {
            case 'active':
                filterParams.push({ field: 'is_active', operator: 'equals', value: 1 });
                break;
            case 'inactive':
                filterParams.push({ field: 'is_active', operator: 'equals', value: 0 });
                break;
            case 'last7d':
                filterParams.push({ field: 'created_at', operator: 'gt', value: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString() });
                break;
            case 'last30d':
                filterParams.push({ field: 'created_at', operator: 'gt', value: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString() });
                break;
            default:
                break;
        }
        setFilters(filterParams);
    }, []);

    const fetchCustomers = useCallback(async ({ page = 0, pageSize = 10 } = {}) => {
        try {
            setLoading(true);
            const response = await magentoApi.getCustomers({
                currentPage: page + 1,
                pageSize,
                filterGroups: filters.length > 0 ? [{ filters: filters.map(f => ({
                    field: f.field,
                    value: f.value,
                    conditionType: f.operator === 'equals' ? 'eq' : (f.operator === 'gt' ? 'gt' : 'eq')
                })) }] : []
            });
            setData(response?.items || response?.data?.items || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (filters.length === 0 && currentFilter === 'all') {
            setFilters([]);
        } else {
            fetchCustomers({ page: 0, pageSize: 10 });
        }
    }, [filters, fetchCustomers, currentFilter]);

    // Stats
    const activeCustomers = data.filter(customer => customer.is_active === 1).length;
    const inactiveCustomers = data.filter(customer => customer.is_active === 0).length;
    const totalOrders = data.reduce((acc, customer) => acc + (customer.orders_count || 0), 0);


    return (
        <BaseGrid
            gridName="CustomersGrid"
            columns={columns(data)}
            data={data}
            gridCards={[
                {
                    title: 'Total Customers',
                    value: data.length,
                    icon: PersonIcon,
                    color: 'primary'
                },
                {
                    title: 'Active Customers',
                    value: activeCustomers,
                    icon: ActiveIcon,
                    color: 'success'
                },
                {
                    title: 'Inactive Customers',
                    value: inactiveCustomers,
                    icon: InactiveIcon,
                    color: 'error'
                },
                {
                    title: 'Total Orders',
                    value: totalOrders,
                    icon: ShoppingCartIcon,
                    color: 'secondary'
                }
            ]}
            loading={loading}
            onRefresh={fetchCustomers}
            filterOptions={filterOptions}
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
            getRowId={(row) => row.entity_id || row.id}
            defaultSortModel={[
                { field: 'registration_date', sort: 'desc' }
            ]}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50, 100]}
        />
    );
};

export default CustomersGrid;
