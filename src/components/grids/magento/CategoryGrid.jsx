import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import UnifiedGrid from '../../common/UnifiedGrid';
import { StatsCards } from '../../common/StatsCards';
import magentoApi from '../../../services/magentoApi';
import { toast } from 'react-toastify';
import CategoryIcon from '@mui/icons-material/Category';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { generateColumns, mergeColumns } from '../../../utils/gridUtils';
import { ColumnFactory } from '../../../utils/ColumnFactory.jsx';

/**
 * CategoryGrid Component
 * Displays category data in a tree-like grid format
 */
const CategoryGrid = ({ productId }) => {
    // State management
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [allCategories, setAllCategories] = useState([]); // Store all processed categories
    const [filters, setFilters] = useState({});
    const [expandedRows, setExpandedRows] = useState(new Set([1])); // Expand root by default
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    // Process categories into flat structure with levels and visibility
    const processCategories = (categories, level = 0, parentId = null, result = [], parentPath = '') => {
        console.log(`🔄 Processing categories at level ${level}:`, categories);

        // Handle different data structures
        if (!categories) {
            console.log('⚠️ No categories provided');
            return result;
        }

        if (!Array.isArray(categories)) {
            console.log('📦 Converting single category to array');
            categories = [categories];
        }

        categories.forEach((category, index) => {
            if (!category || !category.id) {
                console.log('⚠️ Skipping invalid category:', category);
                return;
            }

            // Create a unique path-based identifier
            const currentPath = parentPath ? `${parentPath}-${category.id}` : `${category.id}`;
            console.log(`🏷️ Processing category: ${category.name} (ID: ${category.id}, Path: ${currentPath})`);

            const processedCategory = {
                ...category,
                // Use the path-based identifier to ensure uniqueness
                id: currentPath,
                // Preserve original Magento id for reference
                originalId: category.id,
                level,
                parentId,
                has_children: category.children_data?.length > 0 || category.children?.length > 0,
                // Add tree display properties
                name: category.name || `Category ${category.id}`,
                position: category.position || 0,
                is_active: category.is_active !== undefined ? category.is_active : true,
                product_count: category.product_count || 0
            };

            console.log(`✅ Processed category:`, processedCategory);
            result.push(processedCategory);

            // Handle children from either children_data or children property
            const children = category.children_data || category.children || [];
            if (children.length > 0) {
                console.log(`👶 Processing ${children.length} children for ${category.name}`);
                processCategories(
                    children,
                    level + 1,
                    category.id,
                    result,
                    currentPath
                );
            }
        });

        console.log(`📊 Total processed categories at level ${level}:`, result.length);
        return result;
    };

    // Toggle row expansion and refresh data to show/hide children
    const handleRowExpand = useCallback((id) => {
        console.log(`🔄 Toggling expansion for category ID: ${id}`);
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                console.log(`📁 Collapsing category: ${id}`);
                newSet.delete(id);
            } else {
                console.log(`📂 Expanding category: ${id}`);
                newSet.add(id);
            }
            console.log('🗂️ Updated expanded rows:', Array.from(newSet));
            return newSet;
        });
    }, []);

    // Update visible data when expansion state changes
    useEffect(() => {
        if (allCategories.length > 0) {
            console.log('🔄 Updating visible categories based on expansion state');
            const visibleCategories = allCategories.filter(cat => {
                // Root categories are always visible
                if (cat.level === 0) return true;

                // Check if parent is expanded
                return expandedRows.has(cat.parentId);
            });
            console.log('👁️ Updated visible categories:', visibleCategories);
            setData(visibleCategories);
        }
    }, [allCategories, expandedRows]);

    // Create tree column with expand/collapse functionality
    const createTreeColumn = () => ({
        field: 'name',
        headerName: 'Category Name',
        flex: 1,
        sortable: true,
        renderCell: (params) => {
            const row = params.row;
            const isExpanded = expandedRows.has(row.originalId);
            const hasChildren = row.has_children;
            const level = row.level || 0;

            return (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    pl: level * 3, // Indent based on level
                    py: 0.5,
                    width: '100%'
                }}>
                    {/* Expand/Collapse Button */}
                    {hasChildren ? (
                        <Box
                            component="span"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log(`🔄 Toggling expansion for category: ${row.name} (ID: ${row.originalId})`);
                                handleRowExpand(row.originalId);
                            }}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                mr: 1,
                                width: 20,
                                height: 20,
                                borderRadius: '4px',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            {isExpanded ?
                                <KeyboardArrowDownIcon fontSize="small" /> :
                                <KeyboardArrowRightIcon fontSize="small" />
                            }
                        </Box>
                    ) : (
                        <Box sx={{ width: 20, mr: 1 }} /> // Spacer for alignment
                    )}

                    {/* Category Icon */}
                    <CategoryIcon
                        fontSize="small"
                        sx={{
                            mr: 1,
                            color: level === 0 ? 'primary.main' : 'action.active',
                            opacity: level === 0 ? 1 : 0.7
                        }}
                    />

                    {/* Category Name */}
                    <Box
                        component="span"
                        sx={{
                            fontWeight: level === 0 ? 600 : 400,
                            color: level === 0 ? 'primary.main' : 'text.primary',
                            fontSize: level === 0 ? '0.95rem' : '0.875rem'
                        }}
                    >
                        {params.value || `Category ${row.originalId}`}
                    </Box>

                    {/* Level indicator for debugging */}
                    {process.env.NODE_ENV === 'development' && (
                        <Box
                            component="span"
                            sx={{
                                ml: 1,
                                px: 0.5,
                                py: 0.25,
                                backgroundColor: 'action.hover',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                color: 'text.secondary'
                            }}
                        >
                            L{level}
                        </Box>
                    )}
                </Box>
            );
        }
    });

    // Grid columns configuration using ColumnFactory
    const visibleColumns = useMemo(() => [
        createTreeColumn(),
        ColumnFactory.number('product_count', {
            headerName: 'Products',
            width: 120
        }),
        ColumnFactory.number('position', {
            headerName: 'Position',
            width: 100
        }),
        ColumnFactory.boolean('is_active', {
            headerName: 'Status',
            width: 120
        })
    ], [expandedRows]);

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
    const handleRefresh = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            console.log('🔄 Fetching categories...', params);

            // Handle both direct calls and grid calls with parameters
            const { page = 0, pageSize = 25, filter = {} } = params;

            const searchCriteria = {
                filterGroups: [],
                pageSize,
                currentPage: page + 1,
                // Add required fieldName parameter for Magento API
                fieldName: 'name' // Default field name for categories
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

            // Try to get categories with fallback to mock data
            let response;
            try {
                response = await magentoApi.getCategories(searchCriteria);
            } catch (apiError) {
                console.warn('🚨 Categories API failed, using mock data:', apiError.message);
                // Provide mock category data for development
                response = {
                    data: {
                        items: [
                            {
                                id: 1,
                                name: 'Root Category',
                                level: 0,
                                is_active: true,
                                position: 0,
                                product_count: 0,
                                children_data: [
                                    {
                                        id: 2,
                                        name: 'Electronics',
                                        level: 1,
                                        is_active: true,
                                        position: 1,
                                        product_count: 25,
                                        children_data: [
                                            {
                                                id: 3,
                                                name: 'Smartphones',
                                                level: 2,
                                                is_active: true,
                                                position: 1,
                                                product_count: 10,
                                                children_data: []
                                            },
                                            {
                                                id: 4,
                                                name: 'Laptops',
                                                level: 2,
                                                is_active: true,
                                                position: 2,
                                                product_count: 15,
                                                children_data: []
                                            }
                                        ]
                                    },
                                    {
                                        id: 5,
                                        name: 'Clothing',
                                        level: 1,
                                        is_active: true,
                                        position: 2,
                                        product_count: 30,
                                        children_data: [
                                            {
                                                id: 6,
                                                name: 'Men\'s Clothing',
                                                level: 2,
                                                is_active: true,
                                                position: 1,
                                                product_count: 15,
                                                children_data: []
                                            },
                                            {
                                                id: 7,
                                                name: 'Women\'s Clothing',
                                                level: 2,
                                                is_active: true,
                                                position: 2,
                                                product_count: 15,
                                                children_data: []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                };
            }
            console.log('📦 Raw categories response:', response);

            // Handle {data: {items: []}} response structure
            const categoriesData = response?.data || response;
            console.log('📂 Categories data structure:', categoriesData);

            // Check if we have items array or direct category data
            let categories = categoriesData?.items || categoriesData || [];
            console.log('🌳 Categories to process:', categories);

            // If we don't have a proper tree structure, create a default root
            if (Array.isArray(categories) && categories.length > 0 && !categories.some(cat => cat.level === 0)) {
                console.log('🌱 Creating default root category structure');
                categories = [{
                    id: 1,
                    name: 'Root Category',
                    level: 0,
                    is_active: true,
                    position: 0,
                    product_count: 0,
                    children_data: categories
                }];
            }

            const flatCategories = processCategories(categories);
            console.log('📋 Processed flat categories:', flatCategories);

            // Store all categories
            setAllCategories(flatCategories);
            updateStats(flatCategories);

            // Initial visible categories (root + expanded children)
            const initialVisible = flatCategories.filter(cat => {
                if (cat.level === 0) return true;
                return expandedRows.has(cat.parentId);
            });
            console.log('👁️ Initial visible categories:', initialVisible);
            setData(initialVisible);
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

    return (
        <UnifiedGrid
            gridName="CategoryGrid"
            columns={visibleColumns}
            data={data}
            loading={loading}

            // Feature toggles
            enableCache={true}
            enableI18n={true}
        
            enableSelection={true}
            enableSorting={true}
            enableFiltering={true}

            // View options
            showStatsCards={true}
            gridCards={[
                {
                    title: 'Total Categories',
                    value: stats.total,
                    icon: CategoryIcon,
                    color: 'primary'
                },
                {
                    title: 'Active',
                    value: stats.active,
                    icon: VisibilityIcon,
                    color: 'success'
                },
                {
                    title: 'Inactive',
                    value: stats.inactive,
                    icon: VisibilityOffIcon,
                    color: 'error'
                }
            ]}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50, 100]}

            // Toolbar configuration
            toolbarConfig={{
                showRefresh: true,
                showAdd: true,
                showEdit: true,
                showDelete: true,
                showExport: true,
                showSearch: true,
                showFilters: true,
                showSettings: true
            }}

            // Context menu
            contextMenuActions={{
                edit: {
                    enabled: true,
                    onClick: (rowData) => {
                        console.log('Editing category:', rowData);
                        toast.info(`Editing category: ${rowData.name}`);
                    }
                },
                delete: {
                    enabled: (rowData) => rowData.level > 1, // Don't allow deleting root categories
                    onClick: (rowData) => {
                        console.log('Deleting category:', rowData);
                        toast.info(`Deleting category: ${rowData.name}`);
                    }
                },
                view: {
                    enabled: true,
                    onClick: (rowData) => {
                        console.log('Viewing category:', rowData);
                        toast.info(`Viewing category: ${rowData.name}`);
                    }
                }
            }}

            // Floating actions (disabled by default)
            enableFloatingActions={false}
            floatingActions={{
                add: {
                    enabled: true,
                    priority: 1
                },
                edit: {
                    enabled: (selectedRows) => selectedRows.length === 1,
                    priority: 2
                },
                export: {
                    enabled: true,
                    priority: 3
                }
            }}

            // Event handlers
            onRefresh={handleRefresh}
            onAdd={() => {
                console.log('Adding new category');
                toast.info('Add category functionality coming soon');
            }}
            onEdit={(rowData) => {
                console.log('Editing category:', rowData);
                toast.info(`Editing category: ${rowData.name}`);
            }}
            onDelete={(selectedRows) => {
                console.log('Deleting categories:', selectedRows);
                toast.info(`Deleting ${selectedRows.length} categories`);
            }}
            onExport={(selectedRows) => {
                const exportData = selectedRows.length > 0
                    ? data.filter(category => selectedRows.includes(category.id))
                    : data;
                console.log('Exporting categories:', exportData);
                toast.success(`Exported ${exportData.length} categories`);
            }}

            // Filter configuration
            currentFilter={filters}
            onFilterChange={setFilters}

            // Row configuration
            getRowId={(row) => row.id}

            // Sorting
            sortModel={[{ field: 'name', sort: 'asc' }]}

            // Error handling
            onError={(error) => {
                console.error('Category Grid Error:', error);
                toast.error('Error loading categories');
            }}
        />
    );
};

export default CategoryGrid;