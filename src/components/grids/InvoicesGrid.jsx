import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import magentoApi from '../../services/magentoService';
import { toast } from 'react-toastify';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { getStatusColumn } from '../../utils/gridUtils';

/**
 * InvoiceGrid Component
 * Displays invoice data in a grid format with status cards
 */
const InvoiceGrid = ({ orderId }) => {
    // State management
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0
    });

    // Grid columns configuration
    const columns = [
        { 
            field: 'increment_id', 
            headerName: 'Invoice #', 
            width: 130 
        },
        { 
            field: 'order_increment_id', 
            headerName: 'Order #', 
            width: 130 
        },
        { 
            field: 'grand_total', 
            headerName: 'Total', 
            width: 120,
            valueFormatter: (params) => `$${params.value.toFixed(2)}`
        },
       
        getStatusColumn('status', {
            filterOptions: [
                { value: 'paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' }
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

            if (orderId) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'order_id',
                        value: orderId,
                        condition_type: 'eq'
                    }]
                });
            }

            if (filter?.status) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'status',
                        value: filter.status,
                        condition_type: 'eq'
                    }]
                });
            }

            const response = await magentoApi.getInvoices(searchCriteria);
            const invoices = response?.items || [];
            setData(invoices);
            updateStats(invoices);
        } catch (error) {
            toast.error(error.message || 'Failed to load invoices');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    // Update invoice statistics
    const updateStats = useCallback((invoices) => {
        const newStats = invoices.reduce((acc, invoice) => ({
            total: acc.total + 1,
            paid: acc.paid + (invoice.status === 'paid' ? 1 : 0),
            pending: acc.pending + (invoice.status === 'pending' ? 1 : 0)
        }), {
            total: 0,
            paid: 0,
            pending: 0
        });
        setStats(newStats);
    }, []);

    // Stats cards configuration
    const statCards = [
        {
            title: "All Invoices",
            value: stats.total,
            icon: ReceiptIcon,
            color: "primary",
            active: !filters.status,
            onClick: () => setFilters({})
        },
        {
            title: "Paid",
            value: stats.paid,
            icon: CheckCircleIcon,
            color: "success",
            active: filters.status === 'paid',
            onClick: () => setFilters({ status: 'paid' })
        },
        {
            title: "Pending",
            value: stats.pending,
            icon: PendingIcon,
            color: "warning",
            active: filters.status === 'pending',
            onClick: () => setFilters({ status: 'pending' })
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
            />
        </Box>
    );
};

export default InvoiceGrid;