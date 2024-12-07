import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import magentoApi from '../../services/magentoService';
import { toast } from 'react-toastify';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { getStatusColumn } from '../../utils/gridUtils';

/**
 * ProductsGrid Component
 * Displays product data in a grid format with status cards
 */
const ProductsGrid = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        inStock: 0,
        outOfStock: 0
    });

    // Grid columns configuration
    const columns = [
        { 
            field: 'sku', 
            headerName: 'SKU', 
            width: 130 
        },
        { 
            field: 'name', 
            headerName: 'Product Name', 
            flex: 1 
        },
        {
            field:'type_id',
            headerName: 'Product Type', 
        },
        {
            field:'price',
            headerName: 'Price', 
            width: 100,
            type: 'money'
        },
        
        { 
            field: 'qty', 
            headerName: 'Quantity', 
            width: 100,
            type: 'number'
        },
        getStatusColumn('stock_status', {
            filterOptions: [
                { value: 'in_stock', label: 'In Stock' },
                { value: 'out_of_stock', label: 'Out of Stock' }
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

            if (filter?.stock_status) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'stock_status',
                        value: filter.stock_status,
                        condition_type: 'eq'
                    }]
                });
            }

            const response = await magentoApi.getProducts(searchCriteria);
            const products = response?.items || [];
            setData(products);
            updateStats(products);
        } catch (error) {
            toast.error(error.message || 'Failed to load products');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update product statistics
    const updateStats = useCallback((products) => {
        const newStats = products.reduce((acc, product) => ({
            total: acc.total + 1,
            inStock: acc.inStock + (product.stock_status === 'in_stock' ? 1 : 0),
            outOfStock: acc.outOfStock + (product.stock_status === 'out_of_stock' ? 1 : 0)
        }), {
            total: 0,
            inStock: 0,
            outOfStock: 0
        });
        setStats(newStats);
    }, []);

    // Stats cards configuration
    const statCards = [
        {
            title: "All Products",
            value: stats.total,
            icon: InventoryIcon,
            color: "primary",
            active: !filters.stock_status,
            onClick: () => setFilters({})
        },
        {
            title: "In Stock",
            value: stats.inStock,
            icon: CheckCircleIcon,
            color: "success",
            active: filters.stock_status === 'in_stock',
            onClick: () => setFilters({ stock_status: 'in_stock' })
        },
        {
            title: "Out of Stock",
            value: stats.outOfStock,
            icon: ErrorIcon,
            color: "error",
            active: filters.stock_status === 'out_of_stock',
            onClick: () => setFilters({ stock_status: 'out_of_stock' })
        }
    ];

    return (
        <Box>
            <StatsCards cards={statCards} />
            <BaseGrid
              gridName="ProductsGrid"
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

export default ProductsGrid;