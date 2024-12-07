import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Paper, Box, Menu, MenuItem, IconButton, Button,
    Select, FormControl, InputLabel, Tooltip, TextField,
    InputAdornment, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, Typography
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
    GridToolbarDensitySelector
} from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; 
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { generateColumns, mergeColumns } from '../../utils/gridUtils';
import InvoiceGrid from '../grids/InvoicesGrid';
import CategoryGrid from '../grids/CategoryGrid';
import { toast } from 'react-toastify';
import CustomersGrid from '../grids/CustomersGrid';

/**
 * Styled wrapper for the DataGrid component
 * Provides consistent styling across all grid instances
 */
const StyledBox = styled(Box)(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    '& .MuiDataGrid-root': {
        border: 'none',
        backgroundColor: theme.palette.background.paper,
        '& .MuiDataGrid-cell': {
            borderColor: theme.palette.divider
        },
        '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`
        },
        '& .MuiDataGrid-virtualScroller': {
            backgroundColor: theme.palette.background.paper
        },
        '& .MuiDataGrid-footerContainer': {
            backgroundColor: theme.palette.background.default,
            borderTop: `1px solid ${theme.palette.divider}`,
            position: 'sticky',
            bottom: 0,
            zIndex: 2
        },
        '& .MuiDataGrid-row:hover': {
            backgroundColor: theme.palette.action.hover
        },
        '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            '&:hover': {
                backgroundColor: theme.palette.action.selected
            }
        }
    }
}));

/**
 * Status Cell Component
 * Renders a status chip with appropriate color based on status value
 */
export const StatusCell = ({ value, statusColors, className }) => {
    const theme = useTheme();
    
    const getStatusColor = (status) => {
        const color = statusColors?.[status] || 'default';
        switch (color) {
            case 'success':
                return theme.palette.success.main;
            case 'error':
                return theme.palette.error.main;
            case 'warning':
                return theme.palette.warning.main;
            case 'info':
                return theme.palette.info.main;
            default:
                return theme.palette.grey[500];
        }
    };

    return (
        <Chip
            label={value?.toString().replace(/_/g, ' ')}
            size="small"
            className={className}
            sx={{
                backgroundColor: `${getStatusColor(value)}15`,
                color: getStatusColor(value),
                borderRadius: '4px',
                fontWeight: 600,
                textTransform: 'capitalize',
                '&.inProgress': {
                    backgroundColor: `${theme.palette.info.main}15`,
                    color: theme.palette.info.main,
                },
                '&.pending': {
                    backgroundColor: `${theme.palette.warning.main}15`,
                    color: theme.palette.warning.main,
                },
                '&.delivered': {
                    backgroundColor: `${theme.palette.success.main}15`,
                    color: theme.palette.success.main,
                },
                '&.canceled': {
                    backgroundColor: `${theme.palette.error.main}15`,
                    color: theme.palette.error.main,
                },
                '&.closed': {
                    backgroundColor: `${theme.palette.grey[500]}15`,
                    color: theme.palette.grey[500],
                },
                '&.fraud': {
                    backgroundColor: `${theme.palette.error.dark}15`,
                    color: theme.palette.error.dark,
                },
                '&.confirmationPending': {
                    backgroundColor: `${theme.palette.warning.light}15`,
                    color: theme.palette.warning.light,
                },
                '&.deliveryInProgress': {
                    backgroundColor: `${theme.palette.info.light}15`,
                    color: theme.palette.info.light,
                },
                '&.deliveryConfirmed': {
                    backgroundColor: `${theme.palette.success.light}15`,
                    color: theme.palette.success.light,
                },
                '&.orderCompleted': {
                    backgroundColor: `${theme.palette.success.dark}15`,
                    color: theme.palette.success.dark,
                }
            }}
        />
    );
};

/**
 * Custom Grid Toolbar Component
 * Provides search and filter controls
 */
const CustomGridToolbar = ({
    onRefresh,
    onFilter,
    onAdd,
    onEdit,
    onDelete,
    selectedCount,
    filterModel
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    
    return (
        <GridToolbarContainer>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                {onRefresh && (
                    <IconButton onClick={onRefresh} size="small">
                        <RefreshIcon />
                    </IconButton>
                )}
                
                {/* Column visibility menu - built-in MUI-X feature */}
                <GridToolbarColumnsButton />
                
                {/* Filter button */}
                <GridToolbarFilterButton />
                
                {/* Export button */}
                <GridToolbarExport />
                
                {/* Density selector */}
                <GridToolbarDensitySelector />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
                {selectedCount > 0 && (
                    <>
                        {onEdit && (
                            <IconButton
                                onClick={onEdit}
                                size="small"
                                color="primary"
                            >
                                <EditIcon />
                            </IconButton>
                        )}
                        {onDelete && (
                            <IconButton
                                onClick={onDelete}
                                size="small"
                                color="error"
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </>
                )}
                {onAdd && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={onAdd}
                    >
                        Add New
                    </Button>
                )}
            </Box>
        </GridToolbarContainer>
    );
};

/**
 * Actions Cell Component
 * Renders edit and delete actions for grid rows
 */
const ActionsCell = ({ row, onEdit, onDelete }) => (
    <Box className="actions" sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        pr: 2
    }}>
        {onEdit && (
            <Tooltip title="Edit">
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(row);
                    }}
                    sx={{
                        color: 'info.main',
                        '&:hover': { backgroundColor: 'info.lighter' }
                    }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        )}
        {onDelete && (
            <Tooltip title="Delete">
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row);
                    }}
                    sx={{
                        color: 'error.main',
                        '&:hover': { backgroundColor: 'error.lighter' }
                    }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        )}
    </Box>
);

/**
 * Record Details Dialog Component
 * Displays JSON details of a record
 */
const RecordDetailsDialog = ({ open, onClose, record }) => {
    const isOrder = record?.entity_type === 'order' || 
                   record?.increment_id?.startsWith('1');
    const isProduct = record?.entity_type === 'product' ||
                     record?.sku;

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                {isOrder ? `Order #${record?.increment_id} Details` : 
                 isProduct ? `Product ${record?.sku || record?.name} Details` :
                 'Record Details'}
            </DialogTitle>
            <DialogContent>
                <Box
                    component="pre"
                    sx={{
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                        padding: 2,
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: '70vh'
                    }}
                >
                    <Typography component="code" variant="body2">
                        {JSON.stringify(record, null, 2)}
                    </Typography>
                </Box>
                
                {isOrder && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Invoices
                        </Typography>
                        <InvoiceGrid orderId={record.entity_id} />
                    </Box>
                )}

                {isProduct && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Categories
                        </Typography>
                        <CategoryGrid productId={record.entity_id} />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

const staticPrimaryKeys = {
    OrdersGrid: 'increment_id',
    InvoicesGrid: 'entity_id',
    ProductsGrid: 'sku',
    CustomersGrid: 'id',
    CategoryGrid: 'id' // Example for CategoryGrid
};

/**
 * Base Grid Component
 * Provides core grid functionality with customizable features
 */
const BaseGrid = ({
    gridName, // New prop for grid name
    columns: userColumns,
    data,
    loading: externalLoading = false,
    onRefresh,
    filterOptions = [],
    currentFilter = 'all',
    onFilterChange,
    getRowId = (row) => {
        return row[staticPrimaryKeys[gridName]]; // Use the gridName prop
    },
    totalCount = 0,
    preColumns = [],
    endColumns = [
        { 
            field: 'created_at', 
            headerName: 'Created At', 
            width: 180,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString()
        }
    ],
    initialVisibleColumns = [],
    onError
}) => {
    // State management
    const [sortModel, setSortModel] = useState([{ field: 'id', sort: 'desc' }]);
    const [internalLoading, setInternalLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10
    });
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectionModel, setSelectionModel] = useState({});

    // Process and enhance columns
    const finalColumns = useMemo(() => {
        try {
            // Combine all column types
            let baseColumns = [...preColumns, ...userColumns, ...endColumns];
            
            if (!data?.length) return baseColumns;
            
            // Generate additional columns and merge them
            const generatedColumns = generateColumns(data[0], baseColumns);
            const mergedColumns = mergeColumns(baseColumns, generatedColumns);
            
            // Process all columns with standard configurations
            return mergedColumns.map(column => ({
                ...column,
                filterable: column.filterable !== false,
                sortable: column.sortable !== false,
                hideable: true, // Allow all columns to be hidden/shown
                // Keep explicitly defined hide status or use default (hidden for generated)
                hide: column.hide === undefined ? 
                    !baseColumns.some(bc => bc.field === column.field) : 
                    column.hide,
                // Add any other default column properties here
                minWidth: column.minWidth || 100,
                flex: column.flex || (column.width ? undefined : 1)
            }));
        } catch (error) {
            console.error('Error processing columns:', error);
            return [];
        }
    }, [preColumns, userColumns, endColumns, data]);
    // Event handlers
    const handleRefresh = async () => {
        if (!onRefresh) return;
        
        setInternalLoading(true);
        try {
            await onRefresh({
                page: paginationModel.page,
                pageSize: paginationModel.pageSize,
                sortModel,
                filter: currentFilter
            });
        } catch (err) {
            onError?.(err);
        } finally {
            setInternalLoading(false);
        }
    };

    const handleFilterChange = (newFilter) => {
        onFilterChange?.(newFilter);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
        handleRefresh();
    };

    const handlePaginationModelChange = (newModel) => {
        setPaginationModel(newModel);
        handleRefresh();
    };

    const handleSortModelChange = (newSortModel) => {
        setSortModel(newSortModel);
        handleRefresh();
    };

    const handleRowDoubleClick = (params) => {
        setSelectedRecord(params.row);
        setDetailsDialogOpen(true);
    };

    const handleSelectionModelChange = (newSelectionModel) => {
        setSelectionModel(newSelectionModel);
    };

    useEffect(() => {
        const fetchData = async () => {
            await handleRefresh(); // Call handleRefresh to fetch data on mount
        };

        fetchData();
    }, []); // Empty dependency array to run only once on mount

    return (
        <Box>
            <Box sx={{ 
                width: '100%',
                pb: 16, 
                '& .MuiDataGrid-root': {
                    minHeight: 400,
                    maxHeight: 'calc(100vh - 248px)', 
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}>
                <StyledBox>
                    <DataGrid
                        rows={data}
                        columns={finalColumns}
                        loading={internalLoading || externalLoading}
                        paginationMode="server"
                        filterMode="server"
                        rowCount={totalCount}
                        page={paginationModel.page}
                        pageSize={paginationModel.pageSize}
                        onPageChange={handlePaginationModelChange}
                        onPageSizeChange={(pageSize) => setPaginationModel(prev => ({ ...prev, pageSize }))}
                        getRowId={getRowId} // Use the updated getRowId function
                        components={{
                            Toolbar: () => (
                                <CustomGridToolbar
                                    onRefresh={handleRefresh}
                                    onFilter={handleFilterChange}
                                    onAdd={null}
                                    onEdit={null}
                                    onDelete={null}
                                    selectedCount={selectionModel.length}
                                    filterModel={currentFilter}
                                />
                            )
                        }}
                        componentsProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: { debounceMs: 500 },
                            }
                        }}
                        pageSizeOptions={[10, 25, 50, 100]}
                        disableRowSelectionOnClick
                        onRowDoubleClick={handleRowDoubleClick}
                        checkboxSelection
                        onSelectionModelChange={handleSelectionModelChange}
                        selectionModel={selectionModel}
                        sx={{
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none'
                            }
                        }}
                    />
                </StyledBox>
            </Box>
            
            <RecordDetailsDialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                record={selectedRecord}
            />
        </Box>
    );
};

export default BaseGrid;
