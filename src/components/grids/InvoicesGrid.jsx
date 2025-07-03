import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import magentoApi from '../../services/magentoApi';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaidIcon from '@mui/icons-material/Paid';
import PendingIcon from '@mui/icons-material/Pending';
import { toast } from 'react-toastify';
import { generateColumns } from '../../utils/gridUtils';

/**
 * InvoiceGrid Component
 * Displays invoice data in a grid format with status cards
 */
const InvoicesGrid = ({ orderId }) => {
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
    const columns = generateColumns(data[0] || {}, [
        { 
            field: 'increment_id', 
            headerName: 'Invoice #', 
            width: 130 
        },
        { 
            field: 'order_id', 
            headerName: 'Order #', 
            width: 130 
        }, 
        { 
            field: 'grand_total', 
            headerName: 'Total', 
            width: 130,
            valueFormatter: (params) => formatCurrency(params.value)
        },
        { 
            field: 'state', 
            headerName: 'Status', 
            width: 130,
            valueFormatter: (params) => params.value?.toUpperCase() || ''
        },
        { 
            field: 'invoice_date', 
            headerName: 'Invoice Date', 
            width: 180,
            valueGetter: (params) => params.row.created_at,
            valueFormatter: (params) => formatDateTime(params.value)
        }
    ]);

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

            if (filter?.state) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'state',
                        value: filter.state,
                        condition_type: 'eq'
                    }]
                });
            }

            const response = await magentoApi.getInvoices(searchCriteria);
            setData(response.items || []);
            updateStats(response.items || []);
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
            paid: acc.paid + (invoice.state === 'paid' ? 1 : 0),
            pending: acc.pending + (invoice.state === 'pending' ? 1 : 0)
        }), {
            total: 0,
            paid: 0,
            pending: 0
        });
        setStats(newStats);
    }, []);

    return (
             <BaseGrid
                gridName="InvoicesGrid"
                columns={columns}
                data={data}
                gridCards={[
                    {
                        title: 'Total Invoices',
                        value: stats.total,
                        icon: ReceiptIcon,
                        color: 'primary'
                    },
                    {
                        title: 'Paid',
                        value: stats.paid,
                        icon: PaidIcon,
                        color: 'success'
                    },
                    {
                        title: 'Pending',
                        value: stats.pending,
                        icon: PendingIcon,
                        color: 'warning'
                    }
                ]}
                loading={loading}
                onRefresh={handleRefresh}
                currentFilter={filters}
                onFilterChange={setFilters}
                getRowId={(row) => row.increment_id}
                defaultSortModel={[
                    { field: 'invoice_date', sort: 'desc' }
                ]}
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50, 100]}
            />
       
    );
};

export default InvoicesGrid;