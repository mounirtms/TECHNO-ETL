import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { toast } from 'react-toastify';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SyncIcon from '@mui/icons-material/Sync';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import magentoApi from '../../services/magentoApi';
import sourceMapping from '../../utils/sources';
import axios from 'axios';


/**
 * ProductsGrid Component
 * Displays product data in a grid format with status cards
 */
const MDMProductsGrid = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [succursaleFilter, setSuccursaleFilter] = useState('16');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [showChangedOnly, setShowChangedOnly] = useState(true); // New state for changed filter
    const isMounted = useRef(false);

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
    const [selectedBaseGridRows, setSelectedBaseGridRows] = useState([]);

    const handleBaseGridSelectionChange = (selectedRows) => {
        setSelectedBaseGridRows(selectedRows);
    };

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

    const handleSuccursaleChange = (value) => {
        setSuccursaleFilter(value);
        setSourceFilter('all'); // Reset source filter when succursale changes

    };

    // Handle source change
    const handleSourceChange = (value) => {
        setSourceFilter(value);
    };

    const columns = useMemo(() => [
        { field: 'Code_MDM', headerName: 'SKU', width: 150, type: 'number' },
        { field: 'Code_JDE', headerName: 'JDE Code', width: 120, type: 'number' },
        { field: 'Code_Fil_JDE', headerName: 'JDE Fil.', width: 120, type: 'number' },
        { field: 'TypeProd', headerName: 'Type', width: 80, sortable: true },
        { field: 'Source', headerName: 'Source', width: 150, sortable: true },
        { field: 'syncedDate', headerName: 'Sync Date', width: 160, type: 'date', valueFormatter: (value) => value && new Date(value).toLocaleString('fr-DZ') },
        { field: 'Succursale', headerName: 'Branch', width: 100, type: 'number' },
        { field: 'QteStock', headerName: 'Stock', width: 100, type: 'number', sortable: true },
        { field: 'QteReceptionner', headerName: 'Received', width: 100, type: 'number' },
        { field: 'VenteMoyen', headerName: 'Avg Sales', width: 110, type: 'number', valueFormatter: (value) => value?.toFixed(2) },
        { field: 'QteV', headerName: 'Sales Qty', width: 110, type: 'number' },
        { field: 'QteVM_1', headerName: 'Sales M-1', width: 110, type: 'number' },
        { field: 'QteVM_2', headerName: 'Sales M-2', width: 110, type: 'number' },
        { field: 'QteVM_3', headerName: 'Sales M-3', width: 110, type: 'number' },
        { field: 'Tarif', headerName: 'Price', width: 100, type: 'number', valueFormatter: (value) => value && new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(value) },
        { field: 'DatePremierEntrer', headerName: 'First Entry', width: 160, type: 'date', valueFormatter: (value) => value && new Date(value).toLocaleDateString('fr-DZ') },
        { field: 'DateDernierMaJ', headerName: 'Last Update', width: 160, type: 'date', valueFormatter: (value) => value && new Date(value).toLocaleDateString('fr-DZ') },
        { field: 'ForAppro', headerName: 'For Supply', width: 100, type: 'boolean' },
        { field: 'Catalogue', headerName: 'Catalog', width: 100, type: 'boolean' }
    ], []);

    // NOTE: To style changed rows, add a CSS rule like: .row-changed { background-color: #fff3cd; }
    const getRowClassName = (params) => (params.row.changed ? 'row-changed' : '');

    // Fetch grid data and stats for the current filter/page
    const fetchProducts = useCallback(async ({ page = 0, pageSize = 25, sortModel = [], filterModel = { items: [] } }) => {
        try {
            setLoading(true);
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

            // Fetch paged grid data
            const response = await axios.get('http://localhost:5000/api/mdm/inventory', { params });
            const totalCount = response.data.totalCount ?? response.data.data.length;
            setData(response.data.data);

            // --- Fetch stats for the whole source (not just current page) ---
            let statsParams = { sourceCode: sourceFilter === 'all' ? '' : sourceFilter || 7 };
            // Remove paging, sorting, filtering for stats
            const statsResp = await axios.get('http://localhost:5000/api/mdm/inventory', { params: statsParams });
            const all = statsResp.data.data;
            const total = statsResp.data.totalCount ?? all.length;
            const inStock = all.filter(item => item.QteStock > 0).length;
            const outOfStock = all.filter(item => item.QteStock === 0).length;
            const lowStock = all.filter(item => item.QteStock > 0 && item.QteStock < 2).length;
            const emptyStock = all.filter(item => item.QteStock === 0).length;
            const zeroCount = all.filter(item => item.QteStock === 0).length;
            const newChanges = all.filter(item => item.changed === 1).length;
            const synced = all.filter(item => item.changed === 0).length;
            const totalValue = all.reduce((acc, curr) => acc + ((curr.Tarif || 0) * (curr.QteStock || 0)), 0);
            const averagePrice = all.reduce((acc, curr) => acc + ((curr.Tarif || 0) * (curr.QteStock || 0)), 0) / (all.length || 1);

            setStats({
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
            });
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to fetch inventory data');
        } finally {
            setLoading(false);
        }
    }, [succursaleFilter, sourceFilter, showChangedOnly]);

    // --- Enhanced Status Cards ---
    const statusCards = [
        { title: 'Total Products', value: stats.total, icon: InventoryIcon, color: 'primary' },
        { title: 'In Stock', value: stats.inStock, icon: CheckCircleIcon, color: 'success' },
        { title: 'Empty Stock', value: stats.emptyStock, icon: HighlightOffIcon, color: 'error' },
        { title: 'Low Stock', value: stats.lowStock, icon: TrendingDownIcon, color: 'warning' },
        { title: 'New Changes', value: stats.newChanges, icon: NewReleasesIcon, color: 'secondary' },
        { title: 'Synced', value: stats.synced, icon: DoneAllIcon, color: 'info' },
        { title: 'Average Value', value: stats.averagePrice.toFixed(2), icon: AttachMoneyIcon, color: 'info' },
        { title: 'Total Value', value: stats.totalValue.toFixed(2), icon: AttachMoneyIcon, color: 'info' }
    ];



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
            await axios.post('http://localhost:5000/api/mdm/inventory/sync-all-source');
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

    return (
        <BaseGrid
            gridName="MDMProductsGrid"
            columns={columns}
            data={data}
            gridCards={statusCards}
            getRowId={(row) => `${row.Source}-${row.Code_MDM}`}
            loading={loading}
            getRowClassName={getRowClassName}
            onRefresh={fetchProducts}
            toolbarProps={{
                succursaleOptions,
                currentSuccursale: succursaleFilter,
                onSuccursaleChange: handleSuccursaleChange,
                sourceOptions: sourceFilterOptions,
                currentSource: sourceFilter,
                onSourceChange: handleSourceChange,
                canSync: true,
                onSyncHandler: onSyncHandler,
                canSyncAll: sourceFilter !== 'all',
                onSyncAllHandler: onSyncAllHandler,
                onSyncAllStockHandler: onSyncAllStockHandler, // NEW: pass handler for all stock
                onSyncStocksHandler,
                showChangedOnly,
                setShowChangedOnly
            }}
            onSelectionChange={handleBaseGridSelectionChange}
            showCardView={false}
            totalCount={stats.total}
            defaultPageSize={25}
            onError={(error) => toast.error(error.message)}
        />
    );
};

export default MDMProductsGrid;