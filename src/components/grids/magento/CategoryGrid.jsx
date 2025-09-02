import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import UnifiedGrid from '../../common/UnifiedGrid';
import categoryService from '../../../services/categoryService';
import { toast } from 'react-toastify';
import CategoryIcon from '@mui/icons-material/Category';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { generateColumns, mergeColumns } from '../../../utils/gridUtils';
import { ColumnFactory } from '../../../utils/ColumnFactory';
import CategoryEditDialog from '../../dialogs/CategoryEditDialog';

/**
 * CategoryGrid Component
 * Displays category data in a tree-like grid format.
 */
const CategoryGrid = ({ productId }) => {
    // State management
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({});
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Memoize constant props
    const defaultPageSize = useMemo(() => 10, []);
    const pageSizeOptions = useMemo(() => [10, 25, 50, 100], []);

    // Toggle row expansion
    const handleRowExpand = useCallback((id) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    // Update visible data when expansion state changes
    useEffect(() => {
        const visibleCategories = categoryService.getVisibleCategories(expandedRows);
        setData(visibleCategories);
    }, [expandedRows]);

    // Create tree column with expand/collapse functionality
    const createTreeColumn = useMemo(() => ({
        field: 'name',
        headerName: 'Category Name',
        flex: 1,
        sortable: true,
        renderCell: (params) => {
            const { row } = params;
            const isExpanded = expandedRows.has(row.id);
            const hasChildren = row.has_children;
            const level = row.level || 0;

            return (
                <Box sx={{ display: 'flex', alignItems: 'center', pl: level * 3, py: 0.5, width: '100%' }}>
                    {hasChildren ? (
                        <Box
                            component="span"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRowExpand(row.id);
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
                                '&:hover': { backgroundColor: 'action.hover', color: 'primary.main' }
                            }}
                        >
                            {isExpanded ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                        </Box>
                    ) : (
                        <Box sx={{ width: 20, mr: 1 }} />
                    )}
                    <CategoryIcon fontSize="small" sx={{ mr: 1, color: level === 0 ? 'primary.main' : 'action.active', opacity: level === 0 ? 1 : 0.7 }} />
                    <Box component="span" sx={{ fontWeight: level === 0 ? 600 : 400, color: level === 0 ? 'primary.main' : 'text.primary', fontSize: level === 0 ? '0.95rem' : '0.875rem' }}>
                        {params.value || `Category ${row.originalId}`}
                    </Box>
                    {process.env.NODE_ENV === 'development' && (
                        <Box component="span" sx={{ ml: 1, px: 0.5, py: 0.25, backgroundColor: 'action.hover', borderRadius: '4px', fontSize: '0.75rem', color: 'text.secondary' }}>
                            L{level}
                        </Box>
                    )}
                </Box>
            );
        }
    }), [expandedRows, handleRowExpand]);

    // Grid columns configuration
    const visibleColumns = useMemo(() => [
        createTreeColumn,
        ColumnFactory.number('product_count', { headerName: 'Products', width: 120 }),
        ColumnFactory.number('position', { headerName: 'Position', width: 100 }),
        ColumnFactory.boolean('is_active', { headerName: 'Status', width: 120 })
    ], [createTreeColumn]);

    // Data fetching handler
    const handleRefresh = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const { filter = {} } = params;
            
            // Fetch, filter, and search categories via service
            const { categories, stats } = await categoryService.fetchAndProcessCategories({ ...filter, expandedRows });
            
            setData(categories);
            setStats(stats);

            // Dynamically expand root categories on initial load
            if (expandedRows.size === 0) {
                const rootCategoryIds = categoryService.getRootCategories().map(c => c.id);
                setExpandedRows(new Set(rootCategoryIds));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, [expandedRows]);

    // Grid cards for stats display
    const gridCards = useMemo(() => [
        { key: 'total', title: 'Total Categories', value: stats.total, icon: CategoryIcon, color: 'primary' },
        { key: 'active', title: 'Active', value: stats.active, icon: VisibilityIcon, color: 'success' },
        { key: 'inactive', title: 'Inactive', value: stats.inactive, icon: VisibilityOffIcon, color: 'error' }
    ], [stats]);

    return (
        <Box>
            <UnifiedGrid
                gridName="CategoryGrid"
                columns={visibleColumns}
                data={data}
                loading={loading}
                enableCache
                enableI18n
                enableSelection
                enableSorting
                enableFiltering
                showStatsCards
                gridCards={gridCards}
                defaultPageSize={defaultPageSize}
                pageSizeOptions={pageSizeOptions}
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
                contextMenuActions={{
                    edit: {
                        enabled: true,
                        onClick: (rowData) => {
                            const category = categoryService.findCategoryById(rowData.id);
                            setSelectedCategory(category);
                            setEditDialogOpen(true);
                        }
                    },
                    delete: {
                        enabled: (rowData) => rowData.level > 1,
                        onClick: (rowData) => toast.info(`Deleting category: ${rowData.name} (Not implemented yet)`)
                    },
                    view: {
                        enabled: true,
                        onClick: (rowData) => {
                            const category = categoryService.findCategoryById(rowData.id);
                            setSelectedCategory(category);
                            setEditDialogOpen(true);
                        }
                    }
                }}
                enableFloatingActions={false}
                onRefresh={handleRefresh}
                onAdd={() => toast.info('Add category functionality coming soon')}
                onEdit={(rowData) => {
                    const category = categoryService.findCategoryById(rowData.id);
                    setSelectedCategory(category);
                    setEditDialogOpen(true);
                }}
                onDelete={(selectedRows) => toast.info(`Deleting ${selectedRows.length} categories`)}
                onExport={(selectedRows) => {
                    const exportData = selectedRows.length > 0 ? selectedRows : data;
                    toast.success(`Exported ${exportData.length} categories`);
                }}
                currentFilter={filters}
                onFilterChange={setFilters}
                getRowId={(row) => row.id}
                sortModel={[{ field: 'name', sort: 'asc' }]}
                onError={(error) => toast.error('An error occurred in the category grid.')}
            />

            <CategoryEditDialog
                open={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setSelectedCategory(null);
                }}
                category={selectedCategory}
                onSave={(updatedCategory) => {
                    toast.success(`Category "${updatedCategory.name}" saved successfully`);
                    handleRefresh();
                    setEditDialogOpen(false);
                    setSelectedCategory(null);
                }}
            />
        </Box>
    );
};

export default CategoryGrid;