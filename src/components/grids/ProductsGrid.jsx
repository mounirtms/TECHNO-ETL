import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import magentoApi from '../../services/magentoService';
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
    // State management
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

    // Handle filter change
    const handleFilterChange = useCallback((filter) => {
        setCurrentFilter(filter);

        let filterParams = {};
        const now = new Date();

        switch(filter) {
            case 'inStock':
                filterParams = { stock: 'IN_STOCK' };
                break;
            case 'outOfStock':
                filterParams = { stock: 'OUT_OF_STOCK' };
                break;
            case 'lowStock':
                filterParams = { stock: 'LOW_STOCK' };
                break;
            case 'simple':
                filterParams = { type: 'simple' };
                break;
            case 'configurable':
                filterParams = { type: 'configurable' };
                break;
            case 'virtual':
                filterParams = { type: 'virtual' };
                break;
            case 'downloadable':
                filterParams = { type: 'downloadable' };
                break;
            case 'last7d':
                const last7d = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                filterParams = { created_at: { gt: last7d.toISOString() } };
                break;
            case 'last30d':
                const last30d = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                filterParams = { created_at: { gt: last30d.toISOString() } };
                break;
            default:
                filterParams = {};
        }
        setFilters(filterParams);
        fetchProducts(filterParams);
    }, []);

    // Fetch products with filters
    const fetchProducts = useCallback(async (filterParams = {}, page = 0, pageSize = 10) => {
        try {
            setLoading(true);
            const searchCriteria = {
                filterGroups: [],
                pageSize: pageSize,
                currentPage: page + 1
            };

            // Handle stock filters
            if (filterParams.stock) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'quantity_and_stock_status',
                        value: filterParams.stock,
                        conditionType: 'eq'
                    }]
                });
            }

            // Handle type filters
            if (filterParams.type) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'type_id',
                        value: filterParams.type,
                        conditionType: 'eq'
                    }]
                });
            }

            // Handle date filters
            if (filterParams.created_at) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'created_at',
                        value: filterParams.created_at,
                        conditionType: 'gt'
                    }]
                });
            }

            const response = await magentoApi.getProducts(searchCriteria);
            const products = response?.items || [];
            setData(products);
            updateStats(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products. Using local data.');
            // Use local data as fallback
            const localProducts = magentoApi.getLocalData('products');
            setData(localProducts);
            updateStats(localProducts);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle pagination change
    const handlePaginationChange = useCallback(({ page, pageSize }) => {
        fetchProducts(filters, page, pageSize);
    }, [filters, fetchProducts]);

    useEffect(() => {
        fetchProducts(filters);
    }, [filters, fetchProducts]);

    // Update stats
    const updateStats = (products) => {
        const totalCount = products.length;
        const inStockCount = products.filter(item => item.qty > 0).length;
        const outOfStockCount = products.filter(item => item.qty === 0).length;
        const lowStockCount = products.filter(item => item.qty > 0 && item.qty < 10).length;
        const averagePrice = totalCount > 0
            ? products.reduce((acc, item) => acc + parseFloat(item.price || 0), 0) / totalCount
            : 0;

        setStats({
            total: totalCount,
            inStock: inStockCount,
            outOfStock: outOfStockCount,
            lowStock: lowStockCount,
            averagePrice: averagePrice
        });
    };

    // Grid columns configuration
    const columns = [
        { field: 'sku', headerName: 'SKU', width: 130 },
        { field: 'name', headerName: 'Product Name', flex: 1 },
        { field: 'type_id', headerName: 'Product Type' },
        {
            field: 'price',
            headerName: 'Price',
            width: 100,
            type: 'number',
            valueFormatter: (params) => {
                return new Intl.NumberFormat('fr-DZ', {
                    style: 'currency',
                    currency: 'DZD'
                }).format(params.value);
            }
        },
        {
            field: 'qty',
            headerName: 'Stock',
            width: 100,
            type: 'number'
        },
        getStatusColumn('status', {
            'In Stock': 'success',
            'Out of Stock': 'error',
            'Low Stock': 'warning'
        })
    ];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <StatsCards 
                cards={[
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
                ]}
            />

            <BaseGrid
                gridName="ProductsGrid"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={handlePaginationChange}
                customFilters={filterOptions}
                currentCustomFilter={currentFilter}
                onCustomFilterChange={handleFilterChange}
                totalCount={stats.total}
                defaultSortField="created_at"
                defaultSortDirection="desc"
                defaultPageSize={10}
            />
        </Box>
    );
};

export default ProductsGrid;