import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import magentoApi from '../../services/magentoApi';
import { toast } from 'react-toastify';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { getStatusColumn } from '../../utils/gridUtils';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import sourceMapping, { getSourceInfo, getAllSources } from '../../utils/sources';
import axios from 'axios';
import { cancelSync } from 'framer-motion';
    
/**
 * ProductsGrid Component
 * Displays product data in a grid format with status cards
 */
const MDMProductsGrid = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [succursaleFilter, setSuccursaleFilter] = useState('16');
    const [sourceFilter, setSourceFilter] = useState('all');
    const isMounted = useRef(false);
    const [stats, setStats] = useState({    
        total: 0,
        inStock: 0,
        outOfStock: 0,
        lowStock: 0,
        averagePrice: 0
    });


    // Create succursale options
    const succursaleOptions = useMemo(() => {
        const uniqueSuccursales = [...new Set(sourceMapping.map(s => s.succursale))];
        return [
            { value: 'all', label: 'All Succursales' },
            ...uniqueSuccursales.map(succ => ({
                value: succ.toString(),
                label: `Succursale ${succ}`
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
        isMounted.current = false;
    };

    // Memoize columns to prevent unnecessary re-renders
    const columns = useMemo(() => [
        {
            field: 'Code_MDM',
            headerName: 'SKU',
            width: 150,
            type: 'number'
        },
        {
            field: 'Code_JDE',
            headerName: 'JDE Code',
            width: 120,
            type: 'number'
        },
        {
            field: 'Code_Fil_JDE',
            headerName: 'JDE Fil.',
            width: 120,
            type: 'number'
        },
        {
            field: 'TypeProd',
            headerName: 'Type',
            width: 80,
            sortable: true
        },
        {
            field: 'Source',
            headerName: 'Source',
            width: 150,
            sortable: true
        },
        {
            field: 'Succursale',
            headerName: 'Branch',
            width: 100,
            type: 'number'
        },
        {
            field: 'QteStock',
            headerName: 'Stock',
            width: 100,
            type: 'number',
            sortable: true
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
            valueFormatter: (value) => value?.toFixed(2)
        },
        {
            field: 'QteV',
            headerName: 'Sales Qty',
            width: 110,
            type: 'number'
        },
        {
            field: 'QteVM_1',
            headerName: 'Sales M-1',
            width: 110,
            type: 'number'
        },
        {
            field: 'QteVM_2',
            headerName: 'Sales M-2',
            width: 110,
            type: 'number'
        },
        {
            field: 'QteVM_3',
            headerName: 'Sales M-3',
            width: 110,
            type: 'number'
        },
        {
            field: 'Tarif',
            headerName: 'Price',
            width: 100,
            type: 'number',
            valueFormatter: (value) => 
                value && new Intl.NumberFormat('fr-DZ', {
                    style: 'currency',
                    currency: 'DZD'
                }).format(value)
        },
        {
            field: 'DatePremierEntrer',
            headerName: 'First Entry',
            width: 160,
            type: 'date',
            valueFormatter: (value) =>
                value && new Date(value).toLocaleDateString('fr-DZ')
        },
        {
            field: 'DateDernierMaJ',
            headerName: 'Last Update',
            width: 160,
            type: 'date',
            valueFormatter: (value) =>
                value && new Date(value).toLocaleDateString('fr-DZ')
        },
        {
            field: 'ForAppro',
            headerName: 'For Supply',
            width: 100,
            type: 'boolean'
        },
        {
            field: 'Catalogue',
            headerName: 'Catalog',
            width: 100,
            type: 'boolean'
        }
    ], []);


    const fetchProducts = useCallback(async ({ page = 0, pageSize = 25, sortModel = [], filterModel = { items: [] } }) => {
        if (isMounted.current) return;
        isMounted.current = true;
    
        try {
            setLoading(true);
    
            // Extract sorting parameters (field & order)
            const sortParam = sortModel.length > 0 ? sortModel[0].field : null;
            const sortOrder = sortModel.length > 0 ? sortModel[0].sort : null;
    
            // Extract filtering parameters
            const filterParams = filterModel.items.reduce((acc, filter) => {
                if (filter.value) {
                    acc[filter.columnField] = filter.value;
                }
                return acc;
            }, {});
    
            // Construct API request parameters
            const params = {
                page,
                pageSize,
                sourceCode: sourceFilter === 'all' ? '' : sourceFilter,
                succursale: succursaleFilter === 'all' ? 16 : succursaleFilter,
                sortField: sortParam,
                sortOrder: sortOrder,
                ...filterParams // Add filter values dynamically
            };
            if(params.sourceCode) params.succursale = null;
    
            const response = await axios.get('http://localhost:5000/api/mdm/inventory', { params });
    
            // Ensure API response has a totalCount field
            const totalCount = response.data.totalCount ?? response.data.data.length; 
    
            setData(response.data.data);
    
            // Update stats
            const newStats = {
                total: totalCount,
                inStock: response.data.data.filter(item => item.QteStock > 0).length,
                outOfStock: response.data.data.filter(item => item.QteStock === 0).length,
                lowStock: response.data.data.filter(item => item.QteStock > 0 && item.QteStock < 10).length,
                averagePrice: response.data.data.reduce((acc, curr) => acc + (curr.Price || 0), 0) / (response.data.data.length || 1)
            };
    
            setStats(newStats);
    
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to fetch inventory data');
        } finally {
            setLoading(false);
        }
    }, [succursaleFilter, sourceFilter]);
    
    

    useEffect(() => {
        fetchProducts({ page: 0, pageSize: 25 });
    }, [fetchProducts, succursaleFilter, sourceFilter]);

    // Status cards data
    const statusCards = [
        {
            title: 'Total Products',
            value: stats.total,
            icon: InventoryIcon,
            color: 'primary'
        },
        {
            title: 'In Stock',
            value: stats.inStock,
            icon: CheckCircleIcon,
            color: 'success'
        },
        {
            title: 'Out of Stock',
            value: stats.outOfStock,
            icon: ErrorIcon,
            color: 'error'
        },
        {
            title: 'Low Stock',
            value: stats.lowStock,
            icon: TrendingDownIcon,
            color: 'warning'
        },
        {
            title: 'Total Value',
            value: stats.averagePrice.toFixed(2),
            icon: AttachMoneyIcon,
            color: 'info'
        }
    ];

    return (
        <BaseGrid
        gridName="MDMProductsGrid"
        columns={columns}
        data={data}
        gridCards={statusCards}
        getRowId={(row) => `${row.Source}-${row.Code_MDM}`}
        loading={loading}
        onRefresh={fetchProducts} // This will now include sorting & filtering
        toolbarProps={{
            succursaleOptions,
            currentSuccursale: succursaleFilter,
            onSuccursaleChange: handleSuccursaleChange,
            sourceOptions: sourceFilterOptions,
            currentSource: sourceFilter,
            onSourceChange: handleSourceChange,
            canSync:true
        }}
        showCardView={false}
        totalCount={stats.total}
        defaultPageSize={25}
        onError={(error) => toast.error(error.message)}
        onSortModelChange={(newModel) => fetchProducts({ sortModel: newModel })} // Sorting event
        onFilterModelChange={(newModel) => fetchProducts({ filterModel: newModel })} // Filtering event
    />
    );
};

export default MDMProductsGrid;