import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import UnifiedGrid from '../../common/UnifiedGrid';
import { StatsCards } from '../../common/StatsCards';
import { toast } from 'react-toastify';
import CategoryIcon from '@mui/icons-material/Category';
import { getStandardGridProps } from '../../../config/standardGridConfig';

/**
 * CategoryManagementGrid Component
 * Displays and manages categories in a grid format
 */
const CategoryManagementGrid = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    // Column definitions
    const columns = useMemo(() => [
        {
            field: 'id',
            headerName: 'ID',
            width: 100,
            type: 'number'
        },
        {
            field: 'name',
            headerName: 'Category Name',
            width: 250,
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon fontSize="small" color="action" />
                    <Typography variant="body2">{params.value}</Typography>
                </Box>
            )
        },
        {
            field: 'parent_category',
            headerName: 'Parent Category',
            width: 200
        },
        {
            field: 'product_count',
            headerName: 'Products',
            width: 120,
            type: 'number'
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Box sx={{ 
                    color: params.value === 'Active' ? 'success.main' : 'error.main',
                    fontWeight: 'bold'
                }}>
                    {params.value}
                </Box>
            )
        },
        {
            field: 'created_at',
            headerName: 'Created',
            width: 180,
            type: 'date'
        }
    ], []);

    // Stats cards configuration
    const gridCards = useMemo(() => [
        {
            title: "Total Categories",
            value: stats.total,
            icon: CategoryIcon,
            color: "primary",
            trend: "up"
        },
        {
            title: "Active Categories",
            value: stats.active,
            icon: CategoryIcon,
            color: "success",
            trend: "up"
        },
        {
            title: "Inactive Categories",
            value: stats.inactive,
            icon: CategoryIcon,
            color: "warning",
            trend: "down"
        }
    ], [stats]);

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockData = [
                { id: 1, name: 'Electronics', parent_category: 'Root', product_count: 125, status: 'Active', created_at: '2023-01-15' },
                { id: 2, name: 'Clothing', parent_category: 'Root', product_count: 89, status: 'Active', created_at: '2023-02-20' },
                { id: 3, name: 'Books', parent_category: 'Root', product_count: 210, status: 'Active', created_at: '2023-03-10' },
                { id: 4, name: 'Smartphones', parent_category: 'Electronics', product_count: 45, status: 'Active', created_at: '2023-04-05' },
                { id: 5, name: 'Laptops', parent_category: 'Electronics', product_count: 32, status: 'Active', created_at: '2023-05-12' },
                { id: 6, name: 'T-Shirts', parent_category: 'Clothing', product_count: 67, status: 'Active', created_at: '2023-06-18' },
                { id: 7, name: 'Jeans', parent_category: 'Clothing', product_count: 22, status: 'Inactive', created_at: '2023-07-22' }
            ];
            
            setData(mockData);
            setStats({
                total: mockData.length,
                active: mockData.filter(item => item.status === 'Active').length,
                inactive: mockData.filter(item => item.status === 'Inactive').length
            });
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Error loading categories');
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle row click
    const handleRowClick = useCallback((params) => {
        console.log('Category clicked:', params.row);
        toast.info(`Category: ${params.row.name}`);
    }, []);

    // Initialize data
    React.useEffect(() => {
        handleRefresh();
    }, [handleRefresh]);

    return (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <UnifiedGrid
                {...getStandardGridProps('category', {
                    gridName: "CategoryManagementGrid",
                    columns: columns,
                    data: data,
                    loading: loading,
                    showStatsCards: true,
                    gridCards: gridCards,
                    totalCount: stats.total,

                    // Event handlers
                    onRefresh: handleRefresh,
                    onRowClick: handleRowClick,
                    onRowDoubleClick: (params) => {
                        console.log('Category item double-clicked:', params.row);
                        // Handle category item details view
                    },
                    customActions: [
                        {
                            id: 'sync',
                            label: 'Sync Categories',
                            icon: 'sync',
                            onClick: handleSync,
                            color: 'primary'
                        }
                    ],

                    // Row configuration
                    getRowId: (row) => row?.id
                })}
            />
        </Box>
    );
};

export default CategoryManagementGrid;