import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, LinearProgress, Typography, Button } from '@mui/material';
import UnifiedGrid from '../common/UnifiedGrid';
import MDMFilterPanel from './MDMFilterPanel';
import { StatsCards } from '../common/StatsCards';
import { toast } from 'react-toastify';
import axios from 'axios';
import magentoApi from '../../services/magentoApi';
import sourceMapping from '../../utils/sources';
// Removed unused imports: fetchGridData, gridDataHandlers

// Icons

import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RefreshIcon from '@mui/icons-material/Refresh';
// Stylish and fancy icons for stats cards - smaller and more professional
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';


/**
 * MDMProductsGrid Component
 * Displays MDM product data from MSSQL STOCKCHANGE table
 * Features:
 * - Manual refresh only (no auto-loading)
 * - Optimized for local MSSQL backend
 * - Enhanced toolbar with more action space
 * - Responsive stats cards with proper icons
 */
const MDMProductsGrid = () => {
    console.log('🏗️ MDM Grid: Component initializing...');

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [succursaleFilter, setSuccursaleFilter] = useState('16');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [showChangedOnly, setShowChangedOnly] = useState(true); // New state for changed filter
    const [filterPanelExpanded, setFilterPanelExpanded] = useState(true); // Professional filter panel state
    const [selectedBaseGridRows, setSelectedBaseGridRows] = useState([]);

    const [stats, setStats] = useState({
        total: 0,
        inStock: 0,
        outOfStock: 0,
        lowStock: 0,
        emptyStock: 0,
        zeroCount: 0,
        newChanges: 0,
        synced: 0,
        averagePrice: 0,
        totalValue: 0
    });

    // Column visibility and settings state
    const [columnVisibility, setColumnVisibility] = useState({
        Code_MDM: true,
        Code_JDE: true,
        Code_Fil_JDE: false, // Hidden by default
        TypeProd: true,
        Source: true,
        Succursale: true,
        QteStock: true,
        Tarif: true,
        QteReceptionner: false, // Hidden by default
        VenteMoyen: false, // Hidden by default
        DateDernierMaJ: true,
        changed: true
    });

    // View mode state
    const [viewMode, setViewMode] = useState('grid');



    // Create succursale options
    const succursaleOptions = useMemo(() => {
        const uniqueSuccursales = [...new Set(sourceMapping.map(s => s.succursale))];
        return [
            ...uniqueSuccursales.map(succ => ({
                value: succ.toString(),
                label: `Branch ${succ}`
            }))
        ];
    }, []);

    // Create dynamic source options based on selected succursale
    const sourceFilterOptions = useMemo(() => {
        const filteredSources = succursaleFilter === 'all'
            ? sourceMapping
            : sourceMapping.filter(s => s.succursale.toString() === succursaleFilter);

        const sortedSources = [...filteredSources].sort((a, b) =>
            a.code_source.toString().localeCompare(b.code_source.toString())
        );

        return [
            { value: 'all', label: 'All Sources' },
            ...sortedSources.map(source => ({
                value: source.code_source.toString(),
                label: source.source
            }))
        ];
    }, [succursaleFilter]);



    // Handle source change
    const handleSourceChange = (value) => {
        setSourceFilter(value);
    };

    // Handle grid selection change
    const handleBaseGridSelectionChange = (selectedRows) => {
        setSelectedBaseGridRows(selectedRows);
    };

    // Sync progress toast component
    const SyncProgressToast = ({ current, total }) => (
        <Box sx={{ width: '100%', p: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                {`Syncing ${current}/${total} items...`}
            </Typography>
            <LinearProgress
                variant="determinate"
                value={(current / total) * 100}
                sx={{ height: 8, borderRadius: 4 }}
            />
        </Box>
    );

    // Prepare source items payload for Magento sync
    const prepareSourceItemsPayload = (gridData, sourceMappings) => {
        if (!Array.isArray(gridData)) {
            console.warn('Invalid grid data format');
            return { sourceItems: [] };
        }

        return {
            sourceItems: gridData
                .filter(item => {
                    const isValid = item.Code_MDM &&
                        item.QteStock !== null &&
                        item.Code_Source;
                    if (!isValid) {
                        console.warn(`Skipping invalid item: ${item.Code_MDM}`);
                    }
                    return isValid;
                })
                .map(item => {
                    const sourceInfo = sourceMappings.find(s =>
                        s.code_source === item.Code_Source
                    );

                    return {
                        sku: item.Code_MDM.toString(),
                        source_code: sourceInfo?.magentoSource || '',
                        quantity: Math.max(0, Number(item.QteStock) || 0),
                        status: (Number(item.QteStock) || 0) > 0 ? 1 : 0
                    };
                })
                .filter(item => (item.source_code)) // Remove items with invalid source codes
        }
    };

    // Process batch for Magento sync
    const processBatch = async (items) => {
        const payload = { sourceItems: items };
        try {
            const response = await magentoApi.post(
                'inventory/source-items',
                payload
            );
            console.log('Batch processing response:', response);
            toast.success('Items synced successfully.');
            return response.data;
        } catch (error) {
            console.error('Batch processing error:', error);
            throw error;
        }
    };

    const columns = useMemo(() => {
        console.log('🔧 MDM Grid: Generating columns with visibility:', columnVisibility);

        const allColumns = [
        {
            field: 'Code_MDM',
            headerName: 'SKU',
            width: 150,
            type: 'string',
            sortable: true,
            filterable: true
        },
        {
            field: 'Code_JDE',
            headerName: 'JDE Code',
            width: 120,
            type: 'string',
            sortable: true
        },
        {
            field: 'Code_Fil_JDE',
            headerName: 'JDE Fil.',
            width: 120,
            type: 'string'
        },
        {
            field: 'TypeProd',
            headerName: 'Type',
            width: 120,
            sortable: true,
            filterable: true
        },
        {
            field: 'Source',
            headerName: 'Source',
            width: 150,
            sortable: true,
            filterable: true
        },
        {
            field: 'Succursale',
            headerName: 'Branch',
            width: 100,
            type: 'number',
            sortable: true
        },
        {
            field: 'QteStock',
            headerName: 'Stock',
            width: 100,
            type: 'number',
            sortable: true,
            filterable: true,
            valueFormatter: (params) => {
                const value = params.value;
                return value !== null && value !== undefined ? value.toString() : '0';
            }
        },
        {
            field: 'Tarif',
            headerName: 'Price',
            width: 120,
            type: 'number',
            sortable: true,
            valueFormatter: (params) => {
                const value = params.value;
                if (value && !isNaN(value)) {
                    return new Intl.NumberFormat('fr-DZ', {
                        style: 'currency',
                        currency: 'DZD'
                    }).format(value);
                }
                return '0.00 DZD';
            }
        },
        {
            field: 'QteReceptionner',
            headerName: 'Received',
            width: 100,
            type: 'number'
        },
        {
            field: 'VenteMoyen',
            headerName: 'Avg Sales',
            width: 110,
            type: 'number',
            valueFormatter: (params) => {
                const value = params.value;
                return value !== null && value !== undefined ? value.toFixed(2) : '0.00';
            }
        },
        {
            field: 'DateDernierMaJ',
            headerName: 'Last Update',
            width: 160,
            type: 'date',
            valueFormatter: (params) => {
                const value = params.value;
                return value ? new Date(value).toLocaleDateString('fr-DZ') : '';
            }
        },
        {
            field: 'changed',
            headerName: 'Changed',
            width: 100,
            type: 'boolean',
            renderCell: (params) => {
                return params.value ? '✓' : '';
            }
        }
        ];

        // Filter columns based on visibility settings
        const visibleColumns = allColumns.filter(col => columnVisibility[col.field] !== false);

        console.log('📊 MDM Grid: Generated columns:', {
            total: allColumns.length,
            visible: visibleColumns.length,
            hidden: allColumns.length - visibleColumns.length,
            visibleFields: visibleColumns.map(col => col.field)
        });

        return visibleColumns;
    }, [columnVisibility]);

    // NOTE: To style changed rows, add a CSS rule like: .row-changed { background-color: #fff3cd; }
    const getRowClassName = (params) => (params.row.changed ? 'row-changed' : '');

    // Manual fetch function - optimized for MSSQL backend with generic data handling
    const fetchProducts = useCallback(async ({ page = 0, pageSize = 25, sortModel = [], filterModel = { items: [] } }) => {
        console.log('🚀 MDM Grid: Starting data fetch with parameters:', {
            page, pageSize, sortModel, filterModel,
            filters: { sourceFilter, succursaleFilter, showChangedOnly }
        });

        const sortParam = sortModel.length > 0 ? sortModel[0].field : null;
        const sortOrder = sortModel.length > 0 ? sortModel[0].sort : null;
        const filterParams = filterModel.items.reduce((acc, filter) => {
            if (filter.value) {
                acc[filter.field] = filter.value;
            }
            return acc;
        }, {});

        const params = {
            page,
            pageSize,
            sourceCode: sourceFilter === 'all' ? '' : sourceFilter || 7,
            succursale: succursaleFilter === 'all' ? '' : succursaleFilter || 16,
            sortField: sortParam,
            sortOrder: sortOrder,
            ...filterParams,
            ...(showChangedOnly ? { changed: 1 } : {}) // Add changed:1 if enabled
        };
        if (params.sourceCode) params.succursale = null;

        console.log('📡 MDM Grid: API request parameters:', params);

        try {
            setLoading(true);
            console.log('🚀 MDM Grid: Starting data fetch with parameters:', {
                page, pageSize, sortModel, filterModel,
                filters: { sourceFilter, succursaleFilter, showChangedOnly }
            });

            const sortParam = sortModel.length > 0 ? sortModel[0].field : null;
            const sortOrder = sortModel.length > 0 ? sortModel[0].sort : null;
            const filterParams = filterModel.items.reduce((acc, filter) => {
                if (filter.value) {
                    acc[filter.field] = filter.value;
                }
                return acc;
            }, {});

            const params = {
                page,
                pageSize,
                sourceCode: sourceFilter === 'all' ? '' : sourceFilter || 7,
                succursale: succursaleFilter === 'all' ? '' : succursaleFilter || 16,
                sortField: sortParam,
                sortOrder: sortOrder,
                ...filterParams,
                ...(showChangedOnly ? { changed: 1 } : {}) // Add changed:1 if enabled
            };
            if (params.sourceCode) params.succursale = null;

            console.log('📡 MDM Grid: Making API call to /api/mdm/inventory with params:', params);

            // Fetch paged grid data
            const response = await axios.get('/api/mdm/inventory', { params });

            console.log('📦 MDM Grid: Raw API response:', {
                status: response.status,
                statusText: response.statusText,
                dataType: typeof response.data,
                dataKeys: response.data ? Object.keys(response.data) : [],
                hasData: response.data && response.data.data,
                dataLength: response.data?.data?.length || 0
            });

            const totalCount = response.data.totalCount ?? response.data.data?.length ?? 0;
            const processedData = response.data.data || [];

            console.log('✅ MDM Grid: Processed data:', {
                count: processedData.length,
                totalCount,
                sampleRecord: processedData[0] || null,
                allFields: processedData.length > 0 ? Object.keys(processedData[0]) : []
            });

            setData(processedData);

            // Calculate stats from the fetched data
            const total = totalCount;
            const inStock = processedData.filter(item => item.QteStock > 0).length;
            const outOfStock = processedData.filter(item => item.QteStock === 0).length;
            const lowStock = processedData.filter(item => item.QteStock > 0 && item.QteStock < 2).length;
            const emptyStock = processedData.filter(item => item.QteStock === 0).length;
            const zeroCount = processedData.filter(item => item.QteStock === 0).length;
            const newChanges = processedData.filter(item => item.changed === 1).length;
            const synced = processedData.filter(item => item.changed === 0).length;
            const totalValue = processedData.reduce((acc, curr) => acc + ((curr.Tarif || 0) * (curr.QteStock || 0)), 0);
            const averagePrice = processedData.length > 0 ? totalValue / processedData.length : 0;

            const calculatedStats = {
                total,
                inStock,
                outOfStock,
                lowStock,
                emptyStock,
                zeroCount,
                newChanges,
                synced,
                totalValue,
                averagePrice
            };

            setStats(calculatedStats);
            console.log('📊 MDM Grid: Stats calculated:', calculatedStats);

        } catch (error) {
            console.error('❌ MDM Grid: API call failed:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data
            });

            setData([]);
            setStats({
                total: 0,
                inStock: 0,
                outOfStock: 0,
                lowStock: 0,
                emptyStock: 0,
                zeroCount: 0,
                newChanges: 0,
                synced: 0,
                averagePrice: 0,
                totalValue: 0
            });
            toast.error(`Failed to fetch inventory data: ${error.message}`);
        } finally {
            setLoading(false);
        }


        setLoading(false);
    }, []); // No dependencies - manual refresh only

    // Component lifecycle logging
    useEffect(() => {
        console.log('🎯 MDM Grid: Component mounted and ready');
        console.log('🎯 MDM Grid: Initial configuration:', {
            filters: { sourceFilter, succursaleFilter, showChangedOnly },
            viewMode,
            columnVisibility,
            dataCount: data.length
        });

        return () => {
            console.log('🎯 MDM Grid: Component unmounting...');
        };
    }, []);

    // Filter change logging
    useEffect(() => {
        console.log('🔧 MDM Grid: Filters changed:', {
            sourceFilter,
            succursaleFilter,
            showChangedOnly,
            timestamp: new Date().toISOString()
        });
    }, [sourceFilter, succursaleFilter, showChangedOnly]);

    // Data change logging
    useEffect(() => {
        console.log('📊 MDM Grid: Data updated:', {
            count: data.length,
            hasData: data.length > 0,
            sampleRecord: data[0] || null,
            timestamp: new Date().toISOString()
        });
    }, [data]);

    // --- Enhanced Status Cards (Max 8 cards with stylish icons) ---
    const statusCards = [
        { title: 'Total Products', value: stats.total, icon: CategoryIcon, color: 'primary' },
        { title: 'In Stock', value: stats.inStock, icon: CheckCircleOutlineIcon, color: 'success' },
        { title: 'Out of Stock', value: stats.outOfStock, icon: ErrorOutlineIcon, color: 'error' },
        { title: 'Low Stock', value: stats.lowStock, icon: ReportProblemIcon, color: 'warning' },
        { title: 'New Changes', value: stats.newChanges, icon: SyncAltIcon, color: 'secondary' },
        { title: 'Synced Items', value: stats.synced, icon: TrendingUpIcon, color: 'info' },
        { title: 'Avg Price', value: `${stats.averagePrice.toFixed(2)} DZD`, icon: AttachMoneyIcon, color: 'info' },
        { title: 'Total Value', value: `${(stats.totalValue / 1000).toFixed(1)}K DZD`, icon: AccountBalanceIcon, color: 'success' }
    ].slice(0, 8); // Ensure max 8 cards



    // Sync all for a specific source (prices)
    const onSyncAllHandler = async () => {
        if (sourceFilter === 'all' || !sourceFilter) {
            toast.warning('Please select a specific source to sync all items.');
            return;
        }
        try {
            setLoading(true);
            toast.info(<SyncProgressToast current={0} total={0} />, { autoClose: false, closeOnClick: false, draggable: false });
            await axios.post('http://localhost:5000/api/mdm/inventory/sync-all-source', {
                sourceCode: sourceFilter
            });
            toast.dismiss();
            toast.success(`Sync for source ${sourceFilter} initiated. The process is running in the background.`);
        } catch (error) {
            toast.dismiss();
            console.error('Sync all failed:', error);
            toast.error(`Failed to initiate sync for source ${sourceFilter}.`);
        } finally {
            setLoading(false);
        }
    };

    // Sync all stock (no sourceCode param)
    const onSyncAllStockHandler = async () => {
        try {
            setLoading(true);
            toast.info(<SyncProgressToast current={0} total={0} />, { autoClose: false, closeOnClick: false, draggable: false });
            await axios.post('/api/mdm/inventory/sync-all-source');
            toast.dismiss();
            toast.success('Sync for all stock initiated. The process is running in the background.');
        } catch (error) {
            toast.dismiss();
            console.error('Sync all stock failed:', error);
            toast.error('Failed to initiate sync for all stock.');
        } finally {
            setLoading(false);
        }
    };

    const onSyncHandler = async () => {
        try {
            if (!selectedBaseGridRows || selectedBaseGridRows.length === 0) {
                toast.warning('Please select items to sync');
                return;
            }

            const selectedData = data.filter(row => selectedBaseGridRows.includes(`${row.Source}-${row.Code_MDM}`));

            setLoading(true);
            const payload = prepareSourceItemsPayload(selectedData, sourceMapping);
            if (payload.sourceItems.length === 0) {
                toast.warning('No valid items to sync.');
                return;
            }

            toast.info(<SyncProgressToast current={0} total={payload.sourceItems.length} />, {
                autoClose: true,
                closeOnClick: true,
                draggable: false
            });


            await processBatch(payload.sourceItems);



        } catch (error) {
            console.error('Sync failed:', error);
            toast.error('Failed to sync selected items.');
        } finally {
            setLoading(false);
        }
    };



    // Handler for Sync Stocks (mark changed stocks for the selected source)
    const onSyncStocksHandler = async () => {
        if (sourceFilter === 'all' || !sourceFilter) {
            toast.warning('Please select a specific source to sync stocks.');
            return;
        }
        try {
            setLoading(true);
            toast.info(`Marking changed stocks for source: ${sourceFilter}...`);
            // Call backend endpoint to mark changed stocks for the selected source
            await axios.get('http://localhost:5000/api/mdm/inventory/sync-stocks', {
                params: { sourceCode: sourceFilter }
            });
            toast.success(`Changed stocks for source ${sourceFilter} marked for sync.`);
        } catch (error) {
            console.error('Sync stocks failed:', error);
            toast.error(`Failed to mark changed stocks for source ${sourceFilter}.`);
        } finally {
            setLoading(false);
        }
    };

    // Enhanced toolbar configuration - more space for custom actions
    const toolbarConfig = {
        showRefresh: true, // Enable built-in refresh button - PROMINENT
        showSync: false, // Move to custom actions for better organization
        showExport: true,
        showSearch: false, // Remove to save space - filters are in dedicated panel
        showFilters: false, // Use custom filter panel instead
        showSettings: true, // Enable settings for column management
        showAdd: false,
        showEdit: false,
        showDelete: false,
        showViewToggle: true, // Enable view mode toggle
        compact: false, // Disable compact for better visibility of refresh button
        size: 'medium', // Medium size for better button visibility
        spacing: 2, // More spacing for better UX
        maxWidth: '70%', // More space for toolbar
        actionAreaWidth: '30%' // Balanced space for custom actions
    };

    // Manual refresh handler with logging
    const handleManualRefresh = useCallback(() => {
        console.log('🔄 MDM Grid: Manual refresh triggered by user');
        console.log('🔄 MDM Grid: Current state:', {
            dataCount: data.length,
            filters: { sourceFilter, succursaleFilter, showChangedOnly },
            viewMode,
            columnVisibility
        });

        fetchProducts({});
        toast.info('Refreshing data...');
    }, [fetchProducts, data.length, sourceFilter, succursaleFilter, showChangedOnly, viewMode, columnVisibility]);

    // Professional custom actions - organized and streamlined with manual refresh
    const customActions = [
        {
            label: 'Refresh Data',
            icon: <RefreshIcon />,
            onClick: handleManualRefresh,
            tooltip: 'Manually refresh grid data with current filters',
            variant: 'contained',
            color: 'info',
            size: 'small',
            priority: 0 // Highest priority
        },
        {
            label: 'Sync All Products',
            icon: <SyncIcon />,
            onClick: onSyncAllHandler,
            tooltip: 'Synchronize all products from selected source',
            variant: 'contained',
            color: 'primary',
            size: 'small',
            disabled: sourceFilter === 'all',
            priority: 1
        },
        {
            label: 'Sync Stocks',
            icon: <AttachMoneyIcon />,
            onClick: onSyncStocksHandler,
            tooltip: 'Synchronize stock levels and pricing',
            variant: 'outlined',
            color: 'secondary',
            size: 'small',
            priority: 2
        }
    ];

    // Context menu actions
    const contextMenuActions = {
        sync: {
            icon: SyncIcon,
            label: 'Sync Product',
            enabled: true,
            onClick: (rowData) => onSyncHandler(rowData)
        },
        view: {
            enabled: true,
            onClick: (rowData) => {
                console.log('Viewing product:', rowData);
                toast.info(`Viewing product: ${rowData.Code_MDM}`);
            }
        }
    };

    // Floating actions
    const floatingActions = {
        sync: {
            enabled: true,
            priority: 1
        },
        export: {
            enabled: true,
            priority: 2
        },
        refresh: {
            enabled: true,
            priority: 3
        }
    };

    // ===== MANUAL REFRESH ONLY =====
    // No auto-loading - user must manually refresh
    // Initial load can be triggered by refresh button

    return (
        <Box sx={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            '@media (max-width: 768px)': {
                height: 'calc(100vh - 64px)' // Account for mobile header
            }
        }}>
            

            {/* Restored Full Filter Panel */}
            <Box sx={{ flexShrink: 0, mb: 0.5 }}>
                <MDMFilterPanel
                    succursaleOptions={succursaleOptions}
                    succursaleFilter={succursaleFilter}
                    onSuccursaleChange={setSuccursaleFilter}
                    sourceFilterOptions={sourceFilterOptions}
                    sourceFilter={sourceFilter}
                    onSourceChange={handleSourceChange}
                    showChangedOnly={showChangedOnly}
                    onShowChangedOnlyChange={setShowChangedOnly}
                    isExpanded={filterPanelExpanded}
                    onToggleExpanded={setFilterPanelExpanded}
                />
            </Box>

            {/* Main Grid Container */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0, // Important for flex child to shrink
                overflow: 'hidden'
            }}>
                <UnifiedGrid
            gridName="MDMProductsGrid"
            columns={columns}
            data={data}
            loading={loading}

            // Refresh handler
            onRefresh={handleManualRefresh}

            // Feature toggles
            enableCache={true}
            enableI18n={true}
            enableRTL={false} // English is left-to-right
            enableSelection={true}
            enableSorting={true}
            enableFiltering={true}
            enableColumnReordering={true}
            enableColumnResizing={true}

            // View options with settings
            showStatsCards={false} // Disable top stats cards
            showCardView={true} // Enable card view option
            defaultViewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={stats.total}
            defaultPageSize={25}

            // Column management
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}

            // Height optimization
            sx={{
                height: '100%',
                '& .MuiDataGrid-root': {
                    height: '100%'
                }
            }}

            // Professional toolbar configuration - streamlined
            toolbarConfig={toolbarConfig}
            customActions={customActions}

            // Context menu
            contextMenuActions={contextMenuActions}

            // Floating actions (disabled for cleaner look)
            enableFloatingActions={false}

            // Event handlers
            onSync={onSyncHandler}
            onSelectionChange={handleBaseGridSelectionChange}
            onExport={(selectedRows) => {
                const exportData = selectedRows.length > 0
                    ? data.filter(product => selectedRows.includes(`${product.Source}-${product.Code_MDM}`))
                    : data;
                console.log('Exporting MDM products:', exportData);
                toast.success(`Exported ${exportData.length} products`);
            }}

            // Row configuration
            getRowId={(row) => `${row.Source}-${row.Code_MDM}`}
            getRowClassName={getRowClassName}

            // Error handling
            onError={(error) => toast.error(error.message)}
                />

                {/* Stats Cards at Bottom */}
                <Box sx={{
                    flexShrink: 0,
                    mt: 1,
                    '@media (max-width: 768px)': {
                        mt: 0.5
                    }
                }}>
                    <StatsCards cards={statusCards} />
                </Box>
            </Box>
        </Box>
    );
};

export default MDMProductsGrid;