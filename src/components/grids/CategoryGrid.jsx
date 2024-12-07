import React, { useState, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { StatsCards } from '../common/StatsCards';
import magentoApi from '../../services/magentoService';
import { toast } from 'react-toastify';
import CategoryIcon from '@mui/icons-material/Category';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { generateColumns, mergeColumns } from '../../utils/gridUtils';

/**
 * CategoryGrid Component
 * Displays category data in a tree-like grid format
 */
const CategoryGrid = ({ productId }) => {
    // State management
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    // Process categories into flat structure with levels and visibility
    const processCategories = (categories, level = 0, parentId = null, result = []) => {
        if (!Array.isArray(categories)) {
            categories = [categories]; // Handle root category case
        }

        categories.forEach(category => {
            const processedCategory = {
                ...category,
                id: category.id,
                level,
                parentId,
                has_children: category.children_data?.length > 0,
                isVisible: level === 0 || expandedRows.has(parentId)
            };
            result.push(processedCategory);

            if (category.children_data?.length > 0) {
                processCategories(category.children_data, level + 1, category.id, result);
            }
        });

        return result;
    };

    // Toggle row expansion
    const handleRowExpand = (id) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Grid columns configuration
    const visibleColumns = [
        { 
            field: 'name', 
            headerName: 'Category Name', 
            flex: 1,
            renderCell: (params) => {
                const isExpanded = expandedRows.has(params.row.id);
                return (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        pl: params.row.level * 4 // Indent based on level
                    }}>
                        {params.row.has_children && (
                            <Box 
                                component="span" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRowExpand(params.row.id);
                                }}
                                sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    mr: 1,
                                    '&:hover': {
                                        color: 'primary.main'
                                    }
                                }}
                            >
                                {isExpanded ? 
                                    <KeyboardArrowDownIcon color="action" /> : 
                                    <KeyboardArrowRightIcon color="action" />
                                }
                            </Box>
                        )}
                        <span>{params.value}</span>
                    </Box>
                );
            }
        },
        { 
            field: 'product_count', 
            headerName: 'Products', 
            width: 120,
            type: 'number'
        },
        { 
            field: 'position', 
            headerName: 'Position', 
            width: 100,
            type: 'number'
        },
        { 
            field: 'is_active', 
            headerName: 'Status',
            width: 120,
            type: 'singleSelect',
            valueOptions: [
                { value: true, label: 'Active' },
                { value: false, label: 'Inactive' }
            ],
            valueFormatter: (params) => params.value ? 'Active' : 'Inactive'
        }
    ];

    // Generate additional hidden columns
    const allColumns = useMemo(() => {
        if (!data.length) return visibleColumns;
        
        // Generate additional columns from the first data item
        const generatedColumns = generateColumns(data[0], visibleColumns);
        
        // Merge visible and generated columns, marking generated ones as hidden
        const mergedColumns = mergeColumns(visibleColumns, generatedColumns);
        
        // Ensure proper column configuration
        return mergedColumns.map(col => ({
            ...col,
            // Keep visible columns as is, hide generated ones
            hide: visibleColumns.some(vc => vc.field === col.field) ? false : true
        }));
    }, [data, visibleColumns]);

    // Data fetching handler
    const handleRefresh = useCallback(async ({ page, pageSize, filter }) => {
        try {
            setLoading(true);
            
            const searchCriteria = {
                filterGroups: [],
                pageSize,
                currentPage: page + 1
            };

            if (productId) {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'product_id',
                        value: productId,
                        condition_type: 'eq'
                    }]
                });
            }

            if (filter?.is_active !== undefined) {
                const isActive = filter.is_active === 'true' || filter.is_active === true;
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'is_active',
                        value: isActive,
                        condition_type: 'eq'
                    }]
                });
            }

            const response = await magentoApi.getCategories(searchCriteria);
            const flatCategories = processCategories(response);
            const visibleCategories = flatCategories.filter(cat => cat.isVisible);
            setData(visibleCategories);
            updateStats(flatCategories);
        } catch (error) {
            toast.error(error.message || 'Failed to load categories');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [productId, expandedRows]);

    // Update category statistics
    const updateStats = useCallback((categories) => {
        const newStats = categories.reduce((acc, category) => ({
            total: acc.total + 1,
            active: acc.active + (category.is_active ? 1 : 0),
            inactive: acc.inactive + (!category.is_active ? 1 : 0)
        }), {
            total: 0,
            active: 0,
            inactive: 0
        });
        setStats(newStats);
    }, []);

    // Stats cards configuration
    const statCards = [
        {
            title: "All Categories",
            value: stats.total,
            icon: CategoryIcon,
            color: "primary",
            active: !filters.is_active,
            onClick: () => setFilters({})
        },
        {
            title: "Active",
            value: stats.active,
            icon: VisibilityIcon,
            color: "success",
            active: filters.is_active === true,
            onClick: () => setFilters({ is_active: true })
        },
        {
            title: "Inactive",
            value: stats.inactive,
            icon: VisibilityOffIcon,
            color: "error",
            active: filters.is_active === false,
            onClick: () => setFilters({ is_active: false })
        }
    ];

    return (
        <Box>
            <StatsCards cards={statCards} />
            <BaseGrid
                gridName="CategoryGrid"
                columns={allColumns}
                data={data}
                loading={loading}
                onRefresh={handleRefresh}
                currentFilter={filters}
                onFilterChange={setFilters}
                onError={(error) => toast.error(error.message)}
                getRowId={(row) => row.id}
            />
        </Box>
    );
};

export default CategoryGrid;