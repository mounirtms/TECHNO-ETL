import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import magentoApi from '../../services/magentoApi';
import { toast } from 'react-toastify';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { generateColumns, getStatusColumn } from '../../utils/gridUtils';
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
    const columns = useMemo(() => generateColumns(data[0] || {}, [
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
            type: 'money',
            hideable: false
        },
        {
            field: 'qty',
            headerName: 'Quantity',
            width: 100,
            type: 'number',
            hideable: false
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
        }
    ]), [data]);

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
    const fetchProducts = useCallback(async ({ page = 0, pageSize = 10 }) => {
        try {
            setLoading(true);
            const response = await magentoApi.getProducts({
                currentPage: page + 1,
                pageSize,
                filterGroups: filters.length > 0 ? [{ filters }] : []
            });

            if (response?.data?.items) {
                const products = response.data.items;
                setData(products);
                
                // Calculate stats
                const stats = products.reduce((acc, product) => ({
                    total: acc.total + 1,
                    inStock: acc.inStock + (product.quantity_and_stock_status === 'IN_STOCK' ? 1 : 0),
                    outOfStock: acc.outOfStock + (product.quantity_and_stock_status === 'OUT_OF_STOCK' ? 1 : 0),
                    lowStock: acc.lowStock + (product.qty < 10 ? 1 : 0),
                    totalPrice: acc.totalPrice + (parseFloat(product.price) || 0)
                }), { total: 0, inStock: 0, outOfStock: 0, lowStock: 0, totalPrice: 0 });

                setStats({
                    ...stats,
                    averagePrice: stats.total ? stats.totalPrice / stats.total : 0
                });
            }
        } catch (error) {
            toast.error('Error fetching products');
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Reset page when filters change
    useEffect(() => {
        fetchProducts({ page: 0, pageSize: 10 });
    }, [filters, fetchProducts]);

    const gridCards = [
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
            title: 'Average Price',
            value: new Intl.NumberFormat('fr-DZ', {
                style: 'currency',
                currency: 'DZD'
            }).format(stats.averagePrice),
            icon: AttachMoneyIcon,
            color: 'info'
        }
    ];

    return (
        <BaseGrid
            gridName="ProductsGrid"
            columns={columns}
            data={data}
            gridCards={gridCards}
            loading={loading}
            onRefresh={fetchProducts}
            filterOptions={filterOptions}
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
            totalCount={stats.total}
            defaultPageSize={10}
            onError={(error) => toast.error(error.message)}
        />
    );
};

export default ProductsGrid;