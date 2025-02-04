import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

/**
 * ProductsGrid Component
 * Displays product data in a grid format with status cards
 */
const ProductsGrid = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [currentFilter, setCurrentFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        inStock: 0,
        outOfStock: 0,
        lowStock: 0,
        averagePrice: 0
    });

    // Custom filter options for products
    const filterOptions = [
        { value: 'all', label: 'All Products' },
        { value: 'inStock', label: 'In Stock' },
        { value: 'outOfStock', label: 'Out of Stock' },
        { value: 'lowStock', label: 'Low Stock (< 10)' },
        { value: 'simple', label: 'Simple Products' },
        { value: 'configurable', label: 'Configurable Products' },
        { value: 'virtual', label: 'Virtual Products' },
        { value: 'downloadable', label: 'Downloadable Products' },
        { value: 'last7d', label: 'Added Last 7 Days' },
        { value: 'last30d', label: 'Added Last 30 Days' }
    ];

    // Memoize columns to prevent unnecessary re-renders
    const columns = useMemo(() => [
        {
            field: 'sku',
            headerName: 'SKU',
            width: 150,
            hideable: false
        },
        {
            field: 'name',
            headerName: 'Product Name',
            flex: 1,
            minWidth: 200,
            hideable: false
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 120,
            type: 'number',
            valueFormatter: (params) => {
                if (params.value == null) return '';
                return `$${params.value.toFixed(2)}`;
            },
            hideable: false
        },
        {
            field: 'qty',
            headerName: 'Quantity',
            width: 100,
            type: 'number',
            hideable: false
        },
        {
            field: 'visibility',
            headerName: 'Visibility',
            width: 120,
            type: 'singleSelect',
            valueOptions: ['1', '2', '3', '4']
        },
        {
            field: 'special_price',
            headerName: 'Special Price',
            width: 120,
            type: 'number',
            valueFormatter: (params) => {
                if (params.value == null) return '';
                return `$${params.value.toFixed(2)}`;
            }
        },
        {
            field: 'weight',
            headerName: 'Weight',
            width: 100,
            type: 'number'
        },
        getStatusColumn('status', {
            enabled: 'success',
            disabled: 'error'
        }),
        {
            field: 'type_id',
            headerName: 'Type',
            width: 130,
            type: 'singleSelect',
            valueOptions: ['simple', 'configurable', 'virtual', 'downloadable']
        },
        {
            field: 'created_at',
            headerName: 'Created At',
            width: 180,
            type: 'date',
            valueGetter: (params) => {
                return params.value ? new Date(params.value) : null;
            }
        },
        {
            field: 'updated_at',
            headerName: 'Updated At',
            width: 180,
            type: 'date',
            valueGetter: (params) => {
                return params.value ? new Date(params.value) : null;
            }
        }
    ], []);

    // Optimized filter change handler
    const handleFilterChange = useCallback((filter) => {
        setCurrentFilter(filter);
        setLoading(true);

        const filterParams = [];
        const now = new Date();

        switch (filter) {
            case 'inStock':
                filterParams.push({
                    field: 'quantity_and_stock_status',
                    value: 'IN_STOCK',
                    operator: 'equals'
                });
                break;
            case 'outOfStock':
                filterParams.push({
                    field: 'quantity_and_stock_status',
                    value: 'OUT_OF_STOCK',
                    operator: 'equals'
                });
                break;
            case 'lowStock':
                filterParams.push({
                    field: 'qty',
                    value: '10',
                    operator: 'lt'
                });
                break;
            case 'last7d':
                filterParams.push({
                    field: 'created_at',
                    value: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    operator: 'gt'
                });
                break;
            case 'last30d':
                filterParams.push({
                    field: 'created_at',
                    value: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    operator: 'gt'
                });
                break;
            default:
                if (['simple', 'configurable', 'virtual', 'downloadable'].includes(filter)) {
                    filterParams.push({
                        field: 'type_id',
                        value: filter,
                        operator: 'equals'
                    });
                }
        }

        setFilters(filterParams);
    }, []);

    // Optimized data fetching
    const fetchProducts = useCallback(async ({ page = 0, pageSize = 25, sortModel, filterModel }) => {
        try {
            setLoading(true);
            const response = await magentoApi.getProducts({
                currentPage: page + 1,
                pageSize,
                filterGroups: filters.length > 0 ? [{ filters }] : [],
                sortOrders: sortModel?.map(sort => ({
                    field: sort.field,
                    direction: sort.sort.toUpperCase()
                }))
            });

            if (response?.data?.items) {
                const products = response.data.items.map(product => ({
                    ...product,
                    id: product.id || product.entity_id,
                    qty: product.qty || 0,
                    is_in_stock: product.is_in_stock || false,
                    status: product.status === 1 ? 'enabled' : 'disabled',
                    price: parseFloat(product.price) || 0,
                    special_price: product.special_price ? parseFloat(product.special_price) : null,
                    created_at: product.created_at ? new Date(product.created_at).toISOString() : null,
                    updated_at: product.updated_at ? new Date(product.updated_at).toISOString() : null
                }));

                setData(products);
                
                // Calculate stats
                const stats = {
                    total: response.data.total_count || products.length,
                    inStock: products.filter(p => p.is_in_stock && p.qty > 0).length,
                    outOfStock: products.filter(p => !p.is_in_stock || p.qty <= 0).length,
                    lowStock: products.filter(p => p.is_in_stock && p.qty > 0 && p.qty < 10).length,
                    averagePrice: products.reduce((acc, p) => acc + p.price, 0) / products.length || 0
                };

                setStats(stats);
            } else {
                setData([]);
                setStats({
                    total: 0,
                    inStock: 0,
                    outOfStock: 0,
                    lowStock: 0,
                    averagePrice: 0
                });
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products. Using local data.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Reset page when filters change
    useEffect(() => {
        fetchProducts({ page: 0, pageSize: 25 });
    }, [filters, fetchProducts]);

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
            gridName="ProductsGrid"
            columns={columns}
            data={data}
            gridCards={statusCards}
            loading={loading}
            onRefresh={fetchProducts}
            filterOptions={filterOptions}
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
            totalCount={stats.total}
            defaultPageSize={25}
            onError={(error) => toast.error(error.message)}
        />
    );
};

export default ProductsGrid;