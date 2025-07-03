import React, { useState, useCallback, useEffect, useMemo } from 'react';
import BaseGrid from '../common/BaseGrid';
import GridCardView from '../common/GridCardView';
import magentoApi from '../../services/magentoApi';
import { toast } from 'react-toastify';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { generateColumns, applySavedColumnSettings } from '../../utils/gridUtils';

/**
 * ProductsGrid Component
 * Displays product data in a grid format with status cards
 */
const ProductsGrid = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState([]); // Array of filter objects for Magento API
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
    // Define base columns for gridUtils.generateColumns
    const baseColumns = useMemo(() => [
        { field: 'sku', headerName: 'SKU', width: 150 },
        { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 200 },
        { field: 'price', headerName: 'Price', width: 120, type: 'number' },
        { field: 'qty', headerName: 'Quantity', width: 100, type: 'number' },
        { field: 'visibility', headerName: 'Visibility', width: 120, type: 'singleSelect', valueOptions: ['1', '2', '3', '4'] },
        { field: 'special_price', headerName: 'Special Price', width: 120, type: 'number' },
        { field: 'weight', headerName: 'Weight', width: 100, type: 'number' },
        { field: 'status', headerName: 'Status', width: 120 },
        { field: 'type_id', headerName: 'Type', width: 130, type: 'singleSelect', valueOptions: ['simple', 'configurable', 'virtual', 'downloadable'] },
        {
            field: 'created_at',
            headerName: 'Created At',
            width: 180,
            type: 'date',
            valueGetter: (params) => {
                const v = params.value;
                if (!v) return null;
                if (v instanceof Date) return v;
                const d = new Date(v);
                return isNaN(d.getTime()) ? null : d;
            }
        },
        {
            field: 'updated_at',
            headerName: 'Updated At',
            width: 180,
            type: 'date',
            valueGetter: (params) => {
                const v = params.value;
                if (!v) return null;
                if (v instanceof Date) return v;
                const d = new Date(v);
                return isNaN(d.getTime()) ? null : d;
            }
        }
    ], []);

    // Generate columns from data and baseColumns, and apply saved settings
    const [columns, setColumns] = useState(baseColumns);
    useEffect(() => {
        if (data && data.length > 0) {
            (async () => {
                const generated = generateColumns(data[0], baseColumns);
                const applied = await applySavedColumnSettings('ProductsGrid', generated);
                setColumns(applied);
            })();
        } else {
            setColumns(baseColumns);
        }
    }, [data, baseColumns]);

    // Optimized filter change handler
    // Magento API filterGroups builder
    const handleFilterChange = useCallback((filter) => {
        setCurrentFilter(filter);
        setLoading(true);
        const now = new Date();
        let filterGroups = [];
        switch (filter) {
            case 'inStock':
                filterGroups.push({ filters: [{ field: 'quantity_and_stock_status', value: 'IN_STOCK', condition_type: 'eq' }] });
                break;
            case 'outOfStock':
                filterGroups.push({ filters: [{ field: 'quantity_and_stock_status', value: 'OUT_OF_STOCK', condition_type: 'eq' }] });
                break;
            case 'lowStock':
                filterGroups.push({ filters: [{ field: 'qty', value: '10', condition_type: 'lt' }] });
                break;
            case 'last7d':
                filterGroups.push({ filters: [{ field: 'created_at', value: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(), condition_type: 'gt' }] });
                break;
            case 'last30d':
                filterGroups.push({ filters: [{ field: 'created_at', value: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(), condition_type: 'gt' }] });
                break;
            default:
                if (['simple', 'configurable', 'virtual', 'downloadable'].includes(filter)) {
                    filterGroups.push({ filters: [{ field: 'type_id', value: filter, condition_type: 'eq' }] });
                }
        }
        setFilters(filterGroups);
    }, []);

    // Optimized data fetching
    // Fetch products with Magento API filterGroups and robust mapping
    const fetchProducts = useCallback(async ({ page = 0, pageSize = 25, sortModel, filterModel }) => {
        try {
            setLoading(true);
            const response = await magentoApi.getProducts({
                currentPage: page + 1,
                pageSize,
                filterGroups: filters.length > 0 ? filters : [],
                sortOrders: sortModel?.map(sort => ({
                    field: sort.field,
                    direction: sort.sort.toUpperCase()
                }))
            });

            if (response?.data?.items) {
                const products = response.data.items.map(product => {
                    // Flatten custom_attributes
                    let customAttrs = {};
                    if (Array.isArray(product.custom_attributes)) {
                        for (const attr of product.custom_attributes) {
                            if (attr && attr.attribute_code) {
                                customAttrs[attr.attribute_code] = attr.value;
                            }
                        }
                    }
                    // Defensive: get qty and is_in_stock from all possible locations
                    let qty = product.qty;
                    let is_in_stock = product.is_in_stock;
                    // Try extension_attributes.stock_item if present
                    if (product.extension_attributes && product.extension_attributes.stock_item) {
                        if (typeof product.extension_attributes.stock_item.qty !== "undefined") {
                            qty = product.extension_attributes.stock_item.qty;
                        }
                        if (typeof product.extension_attributes.stock_item.is_in_stock !== "undefined") {
                            is_in_stock = product.extension_attributes.stock_item.is_in_stock;
                        }
                    }
                    // Try extension_attributes directly
                    if (typeof product.extension_attributes?.qty !== "undefined") {
                        qty = product.extension_attributes.qty;
                    }
                    if (typeof product.extension_attributes?.is_in_stock !== "undefined") {
                        is_in_stock = product.extension_attributes.is_in_stock;
                    }
                    // Fallbacks
                    qty = typeof qty === "number" ? qty : Number(qty) || 0;
                    is_in_stock = typeof is_in_stock === "boolean" ? is_in_stock : Boolean(Number(is_in_stock));
                    // Defensive: get name, image, etc. from custom_attributes if missing
                    const name = product.name || customAttrs.name || '';
                    const image = product.image || customAttrs.image || '';
                    // Defensive: parse price
                    const price = typeof product.price === "number" ? product.price : parseFloat(product.price) || 0;
                    const special_price = product.special_price
                        ? parseFloat(product.special_price)
                        : (customAttrs.special_price ? parseFloat(customAttrs.special_price) : null);
                    // Defensive: status
                    const status = (typeof product.status === "number"
                        ? (product.status === 1 ? 'enabled' : 'disabled')
                        : (customAttrs.status === "1" ? 'enabled' : 'disabled'));
                    // Defensive: type_id
                    const type_id = product.type_id || customAttrs.type_id || '';
                    // Defensive: weight
                    const weight = typeof product.weight === "number"
                        ? product.weight
                        : (customAttrs.weight ? parseFloat(customAttrs.weight) : null);
                    // Defensive: date parsing
                    function parseDate(val) {
                        if (!val) return null;
                        // Accepts "YYYY-MM-DD HH:mm:ss" or ISO
                        const d = new Date(val.replace(' ', 'T'));
                        return isNaN(d.getTime()) ? null : d.toISOString();
                    }
                    const created_at = parseDate(product.created_at || customAttrs.created_at);
                    const updated_at = parseDate(product.updated_at || customAttrs.updated_at);
                    // Defensive: visibility
                    const visibility = product.visibility || customAttrs.visibility || '';
                    // Defensive: id
                    const id = product.id || product.entity_id || customAttrs.id;
                    // Merge all fields for grid
                    return {
                        ...product,
                        ...customAttrs,
                        id,
                        name,
                        image,
                        qty,
                        is_in_stock,
                        status,
                        price,
                        special_price,
                        type_id,
                        weight,
                        created_at,
                        updated_at,
                        visibility
                    };
                });

                setData(products);

                // Calculate stats defensively
                const validProducts = products.filter(p => typeof p.price === "number" && !isNaN(p.price));
                const stats = {
                    total: response.data.total_count || products.length,
                    inStock: products.filter(p => p.is_in_stock && p.qty > 0).length,
                    outOfStock: products.filter(p => !p.is_in_stock || p.qty <= 0).length,
                    lowStock: products.filter(p => p.is_in_stock && p.qty > 0 && p.qty < 10).length,
                    averagePrice: validProducts.length > 0
                        ? validProducts.reduce((acc, p) => acc + p.price, 0) / validProducts.length
                        : 0
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

    // Custom card view renderer for products
    const renderProductCards = (cardData) => (
        <GridCardView data={cardData} type="product" />
    );

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
            showCardView={false}
            cardViewRenderer={renderProductCards}
            onError={(error) => toast.error(error.message)}
        />
    );
};

export default ProductsGrid;