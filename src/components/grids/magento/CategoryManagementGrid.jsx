import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import UnifiedGrid from '../../common/UnifiedGrid';
import { toast } from 'react-toastify';
import CategoryIcon from '@mui/icons-material/Category';
import { getStandardGridProps } from '../../../config/standardGridConfig';
import categoryService from '../../../services/categoryService';

/**
 * CategoryManagementGrid Component
 * Displays and manages categories in a grid format
 */
const CategoryManagementGrid = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

    // Column definitions
    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 100, type: 'number' },
        {
            field: 'name',
            headerName: 'Category Name',
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon fontSize="small" color="action" />
                    <Typography variant="body2">{params.value}</Typography>
                </Box>
            )
        },
        { field: 'parent_category', headerName: 'Parent Category', width: 200 },
        { field: 'product_count', headerName: 'Products', width: 120, type: 'number' },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Box sx={{ color: params.value === 'Active' ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                    {params.value}
                </Box>
            )
        },
        { field: 'created_at', headerName: 'Created', width: 180, type: 'date' }
    ], []);

    // Stats cards configuration
    const gridCards = useMemo(() => [
        { key: 'total', title: "Total Categories", value: stats.total, icon: CategoryIcon, color: "primary" },
        { key: 'active', title: "Active Categories", value: stats.active, icon: CategoryIcon, color: "success" },
        { key: 'inactive', title: "Inactive Categories", value: stats.inactive, icon: CategoryIcon, color: "warning" }
    ], [stats]);

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        setLoading(true);
        try {
            const { categories, stats: newStats } = await categoryService.fetchAndProcessCategories(filters);
            setData(categories.map(c => ({ ...c, status: c.is_active ? 'Active' : 'Inactive' })));
            setStats(newStats);
        } catch (error) {
            toast.error('Error loading categories');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Handle sync
    const handleSync = useCallback(async () => {
        toast.info('Syncing categories...');
        await handleRefresh();
        toast.success('Categories synced successfully!');
    }, [handleRefresh]);

    // Handle row click
    const handleRowClick = useCallback((params) => {
        toast.info(`Category: ${params.row.name}`);
    }, []);

    const handleRowDoubleClick = useCallback((params) => {
        // Handle category item details view
    }, []);

    // Initial data load
    useEffect(() => {
        handleRefresh();
    }, [handleRefresh]);

    const gridProps = useMemo(() => getStandardGridProps('category', {
        gridName: "CategoryManagementGrid",
        columns: columns,
        data: data,
        loading: loading,
        showStatsCards: true,
        gridCards: gridCards,
        totalCount: stats.total,
        onRefresh: handleRefresh,
        onRowClick: handleRowClick,
        onRowDoubleClick: handleRowDoubleClick,
        customActions: [
            { id: 'sync', label: 'Sync Categories', icon: 'sync', onClick: handleSync, color: 'primary' }
        ],
        getRowId: (row) => row?.id
    }), [columns, data, loading, gridCards, stats.total, handleRefresh, handleRowClick, handleRowDoubleClick, handleSync]);

    return (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <UnifiedGrid {...gridProps} />
        </Box>
    );
};

export default CategoryManagementGrid;