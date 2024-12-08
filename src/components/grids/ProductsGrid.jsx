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
        { value: 'downloadable', label: 'Downloadable Products' }
    ];

    // Handle filter change
    const handleFilterChange = useCallback((filter) => {
        setCurrentFilter(filter);

        let filterParams = {};
        switch (filter) {
            case 'inStock':
                filterParams = { 'qty[gt]': 0 };
                break;
            case 'outOfStock':
                filterParams = { 'qty[eq]': 0 };
                break;
            case 'lowStock':
                filterParams = { 'qty[gt]': 0, 'qty[lt]': 10 };
                break;
            case 'simple':
                filterParams = { 'type_id[eq]': 'simple' };
                break;
            case 'configurable':
                filterParams = { 'type_id[eq]': 'configurable' };
                break;
            case 'virtual':
                filterParams = { 'type_id[eq]': 'virtual' };
                break;
            case 'downloadable':
                filterParams = { 'type_id[eq]': 'downloadable' };
                break;
            default:
                filterParams = {};
        }
        setFilters(filterParams);
        fetchProducts(filterParams);
    }, []);

    // Fetch products with filters
    const fetchProducts = useCallback(async (filterParams = {}) => {
        setLoading(true);
        try {
            const response = await magentoApi.getProducts(filterParams);
            setData(response.items || []);

            // Update stats
            const inStockCount = response.items.filter(item => item.qty > 0).length;
            setStats({
                total: response.total_count || 0,
                inStock: inStockCount,
                outOfStock: (response.total_count || 0) - inStockCount
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await magentoApi.getProducts(filters);
                setData(response.data.items);

                const totalCount = response.data.total_count;
                const inStockCount = response.data.items.filter(item => item.qty > 0).length;
                const outOfStockCount = response.data.items.filter(item => item.qty === 0).length;
                const lowStockCount = response.data.items.filter(item => item.qty < 10).length;
                const averagePrice = totalCount > 0
                    ? response.data.items.reduce((acc, item) => acc + item.price, 0) / totalCount
                    : 0; // Default to 0 if no products

                setStats({
                    total: totalCount,
                    inStock: inStockCount,
                    outOfStock: outOfStockCount,
                    lowStock: lowStockCount,
                    averagePrice: averagePrice // Ensure this is a number
                });
            } catch (error) {
                toast.error('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filters]);

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


            <BaseGrid
                gridName="ProductsGrid"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={() => fetchProducts(filters)}
                customFilters={filterOptions}
                currentCustomFilter={currentFilter}
                onCustomFilterChange={handleFilterChange}
            />
            <StatsCards
                cards={[
                    { title: 'Total Products', value: stats.total, icon: InventoryIcon },
                    { title: 'In Stock', value: stats.inStock, icon: CheckCircleIcon },
                    { title: 'Out of Stock', value: stats.outOfStock, icon: ErrorIcon },
                    { title: 'Low Stock', value: stats.lowStock, icon: TrendingDownIcon },
                    { title: 'Average Price', value: stats.averagePrice ? stats.averagePrice.toFixed(2) : 'N/A', icon: AttachMoneyIcon }
                ]}
            />
        </Box>
    );
};

export default ProductsGrid;