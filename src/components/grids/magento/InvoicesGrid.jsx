import { useState, useCallback, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import { useSettings } from '../../../contexts/SettingsContext';
import { useMagentoGridSettings } from '../../../hooks/useMagentoGridSettings';

// Icons
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaidIcon from '@mui/icons-material/Paid';
import PendingIcon from '@mui/icons-material/Pending';

// Unified Grid System
import UnifiedGrid from '../../common/UnifiedGrid';
import { getStandardGridProps, getStandardToolbarConfig, getStandardContextMenuActions } from '../../../config/gridConfig';
import { ColumnFactory } from '../../../utils/ColumnFactory.jsx';

// Services and Utils
import magentoApi from '../../../services/magentoApi';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { generateColumns } from '../../../utils/gridUtils';

/**
 * InvoiceGrid Component
 * Displays invoice data in a grid format with status cards
 * Enhanced with settings-aware configuration and API calls
 */
const InvoicesGrid = ({ orderId }) => {
    // ===== SETTINGS INTEGRATION =====
    const { settings } = useSettings();
    const {
        paginationSettings,
        getApiParams,
        handleError
    } = useMagentoGridSettings('magentoInvoices', {});
    
    // Apply user settings to API service
    useEffect(() => {
        import('../../../services/magentoApi').then(({ setMagentoApiSettings }) => {
            setMagentoApiSettings(settings);
        });
    }, [settings]);

    // State management
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0
    });
    const [paginationModel, setPaginationModel] = useState({ 
        page: 0, 
        pageSize: paginationSettings.defaultPageSize 
    });

    // Grid columns configuration
    const columns = useMemo(() => [
        ColumnFactory.text('increment_id', {
            headerName: 'Invoice #',
            width: 130
        }),
        ColumnFactory.text('order_id', {
            headerName: 'Order #',
            width: 130
        }),
        ColumnFactory.currency('grand_total', {
            headerName: 'Total',
            width: 130,
            currency: 'USD'
        }),
        ColumnFactory.status('state', {
            headerName: 'Status',
            width: 130,
            valueOptions: ['paid', 'pending', 'canceled'],
            statusColors: {
                paid: 'success',
                pending: 'warning',
                canceled: 'error'
            }
        }),
        ColumnFactory.dateTime('created_at', {
            headerName: 'Invoice Date',
            width: 180
        })
    ], []);

    // Data fetching handler with settings integration
    const handleRefresh = useCallback(async ({ page, pageSize, filter }) => {
        try {
            setLoading(true);
            
            // Get settings-aware API parameters
            const baseParams = getApiParams({
                pageSize: pageSize || paginationModel.pageSize,
                currentPage: (page || paginationModel.page) + 1
            });

            const searchCriteria = {
                ...baseParams,
                filterGroups: []
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

            // Use settings-aware API method
            const response = await magentoApi.getInvoicesWithSettings('magentoInvoices', searchCriteria);
            // Handle {data: {items: []}} response structure
            const invoicesData = response?.data || response;
            const items = invoicesData?.items || [];
            setData(items);
            updateStats(items);
        } catch (error) {
            // Use settings-aware error handling
            handleError(error, 'Load Invoices');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [orderId, paginationModel, getApiParams, handleError]);

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
         <UnifiedGrid
                {...getStandardGridProps('magentoOrders', {
                    gridName: "InvoicesGrid",
                    columns,
                    data,
                    loading,

                    // Event handlers
                    onRowDoubleClick: (params) => {
                        console.log('Invoice double-clicked:', params.row);
                    },

                    // Configuration
                    toolbarConfig: getStandardToolbarConfig('magentoOrders'),

                    // Stats
                    showStatsCards: true,
                    gridCards: [
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
                    ],

                    // Configuration
                    contextMenuActions: getStandardContextMenuActions('magentoOrders', {
                        view: {
                            enabled: true,
                            onClick: (rowData) => {
                                console.log('Viewing invoice:', rowData);
                                toast.info(`Viewing invoice: ${rowData.increment_id}`);
                            }
                        }
                    }),

                    // Event handlers
                    onRefresh: () => {
                        console.log('Refreshing invoices...');
                        toast.info('Refreshing invoices...');
                    },
                    onExport: (selectedRows) => {
                        const exportData = selectedRows.length > 0
                            ? data.filter(invoice => selectedRows.includes(invoice.increment_id))
                            : data;
                        console.log('Exporting invoices:', exportData);
                        toast.success(`Exported ${exportData.length} invoices`);
                    },

                    // Floating actions
                    enableFloatingActions: false,
                    floatingActions: {
                        export: {
                            enabled: true,
                            priority: 1
                        },
                        refresh: {
                            enabled: true,
                            priority: 2
                        }
                    },

                    // Filter configuration
                    currentFilter: filters,
                    onFilterChange: setFilters,

                    // Row configuration
                    getRowId: (row) => row.increment_id,

                    // Sorting
                    sortModel: [{ field: 'invoice_date', sort: 'desc' }],

                    // Error handling
                    onError: (error) => {
                        console.error('Invoices Grid Error:', error);
                        toast.error('Error loading invoices');
                    }
                })}
        />
    );
};

export default InvoicesGrid;