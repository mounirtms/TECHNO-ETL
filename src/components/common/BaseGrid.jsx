import React, { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Paper, Box, Menu, MenuItem, IconButton, Button,
    Select, FormControl, InputLabel, Tooltip, TextField,
    InputAdornment, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, Typography
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; 
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'react-toastify';

/**
 * Styled wrapper for the DataGrid component
 * Provides consistent styling across all grid instances
 */
const StyledBox = styled(Box)(({ theme }) => ({
    height: 600,
    width: '100%',
    '& .MuiDataGrid-root': {
        border: 'none',
        backgroundColor: theme.palette.background.paper,
        '& .MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus': {
            outline: 'none'
        }
    },
    '& .MuiDataGrid-toolbarContainer': {
        padding: theme.spacing(2),
        gap: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.divider}`
    },
    '& .row-expanded': {
        backgroundColor: theme.palette.action.hover,
    },
    '& .MuiDataGrid-row': {
        '& .actions': {
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
        },
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
            '& .actions': {
                opacity: 1,
            },
        },
    },
    '& .row-details': {
        backgroundColor: theme.palette.grey[50],
    },
    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
        borderBottom: `1px solid ${theme.palette.divider}`
    }
}));

/**
 * Status Cell Component
 * Renders a status chip with appropriate color based on status value
 */
const StatusCell = ({ value, statusColors = {} }) => {
    const getStatusColor = (status) => {
        if (statusColors[status]) return statusColors[status];
        
        switch (status?.toLowerCase()) {
            case 'active':
            case 'enabled':
            case 'complete':
            case 'completed':
            case 'success':
                return 'success';
            case 'processing':
            case 'pending':
            case 'in_progress':
                return 'warning';
            case 'inactive':
            case 'disabled':
            case 'cancelled':
            case 'failed':
                return 'error';
            case 'shipped':
            case 'delivering':
                return 'info';
            default:
                return 'default';
        }
    };

    return (
        <Chip
            label={value}
            size="small"
            color={getStatusColor(value)}
            sx={{ minWidth: 85, justifyContent: 'center' }}
        />
    );
};

/**
 * Custom Toolbar Component
 * Provides search and filter controls
 */
const CustomToolbar = ({
    onRefresh,
    filterOptions = [],
    currentFilter = {},
    onFilterChange
}) => {
    const [searchValue, setSearchValue] = useState('');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchValue(value);
        onFilterChange?.({
            ...(currentFilter || {}),
            search: value
        });
    };

    return (
        <Box sx={{
            p: 2,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider'
        }}>
            {onRefresh && (
                <Tooltip title="Refresh">
                    <IconButton onClick={onRefresh}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            )}
            
            <TextField
                size="small"
                placeholder="Search..."
                value={searchValue}
                onChange={handleSearch}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    )
                }}
            />

            {filterOptions.length > 0 && (
                <>
                    <Button
                        startIcon={<FilterListIcon />}
                        onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                        size="small"
                        color="primary"
                    >
                        Filter
                    </Button>
                    <Menu
                        anchorEl={filterAnchorEl}
                        open={Boolean(filterAnchorEl)}
                        onClose={() => setFilterAnchorEl(null)}
                    >
                        {filterOptions.map((option) => (
                            <MenuItem
                                key={option.value}
                                onClick={() => {
                                    onFilterChange?.(option.value);
                                    setFilterAnchorEl(null);
                                }}
                                selected={currentFilter === option.value}
                            >
                                {option.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </>
            )}
        </Box>
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
                   record?.increment_id?.startsWith('1'); // Simple check for order

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                {isOrder ? `Order #${record?.increment_id} Details` : 'Record Details'}
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
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
/**
 * Base Grid Component
 * Provides core grid functionality with customizable features
 */
const BaseGrid = ({
    columns: userColumns,
    data,
    loading: externalLoading = false,
    onRefresh,
    filterOptions = [],
    currentFilter = 'all',
    onFilterChange,
    getRowId = (row) => row.entity_id || row.id,
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

    // Process and enhance columns
    const finalColumns = useMemo(() => {
        try {
            if (!data?.length) return [];
            
            const allColumns = [...preColumns, ...userColumns, ...endColumns];
            return allColumns.map(column => ({
                ...column,
                filterable: column.filterable !== false,
                hide: initialVisibleColumns.length > 0 && 
                      !initialVisibleColumns.includes(column.field)
            }));
        } catch (err) {
            onError?.(err);
            return [];
        }
    }, [data, preColumns, userColumns, endColumns, initialVisibleColumns]);

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

    return (
        <Paper elevation={2}>
            <CustomToolbar
                onRefresh={handleRefresh}
                filterOptions={filterOptions}
                currentFilter={currentFilter}
                onFilterChange={handleFilterChange}
            />
            <StyledBox>
                <DataGrid
                    rows={data || []}
                    columns={finalColumns}
                    loading={internalLoading || externalLoading}
                    paginationModel={paginationModel}
                    onPaginationModelChange={handlePaginationModelChange}
                    sortModel={sortModel}
                    onSortModelChange={handleSortModelChange}
                    getRowId={getRowId}
                    rowCount={totalCount}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    onRowDoubleClick={handleRowDoubleClick}
                />
            </StyledBox>
            
            <RecordDetailsDialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                record={selectedRecord}
            />
        </Paper>
    );
};

export { StatusCell };
export default BaseGrid;
