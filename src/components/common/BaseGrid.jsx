import { useState, useEffect, useMemo } from 'react';
import {
    DataGrid,
    GridToolbar,
    GridRowModes,
    GridActionsCellItem,
} from '@mui/x-data-grid';
import {
    Paper,
    Typography,
    Box,
    Menu,
    MenuItem,
    IconButton,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { generateColumns } from '../../utils/gridUtils';

const StyledBox = styled(Box)(({ theme }) => ({
    height: 600,
    width: '100%',
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
}));

const StyledPre = styled('pre')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto',
    maxHeight: '300px',
    '& code': {
        fontFamily: 'monospace',
    },
}));

const StyledFab = styled(Fab)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
}));

const ActionsCell = ({ row, onView, onEdit, onDelete }) => {
    return (
        <Box className="actions" sx={{ 
            display: 'flex', 
            gap: 1, 
            justifyContent: 'flex-end',
            alignItems: 'center',
            pr: 2
        }}>
            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    onView(row);
                }}
                sx={{ 
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.lighter' }
                }}
            >
                <VisibilityIcon fontSize="small" />
            </IconButton>
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
        </Box>
    );
};

export default function BaseGrid({
    title,
    columns: userColumns,
    data,
    pageSize = 20,
    currency = 'DZD',
    onAdd,
    onEdit,
    onDelete,
    onView,
}) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize,
    });
    const [sortModel, setSortModel] = useState([]);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [detailsDialog, setDetailsDialog] = useState(null);

    // Generate columns if not provided
    const columns = useMemo(() => {
        const baseColumns = userColumns || (data?.[0] ? generateColumns(data[0], currency) : []);
        
        // Add actions column that's only visible on hover
        return [
            ...baseColumns,
            {
                field: 'actions',
                headerName: '',
                width: 150,
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                renderCell: (params) => (
                    <ActionsCell
                        row={params.row}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ),
            },
        ];
    }, [userColumns, data, currency]);

    useEffect(() => {
        setRows(data || []);
        setLoading(false);
    }, [data]);

    const handleContextMenu = (event, row) => {
        event.preventDefault();
        setSelectedRow(row);
        setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
        });
    };

    const handleContextMenuClose = () => {
        setContextMenu(null);
        setSelectedRow(null);
    };

    const handleView = (row) => {
        setDetailsDialog(row);
    };

    const handleEdit = (row) => {
        if (onEdit) onEdit(row);
        handleContextMenuClose();
    };

    const handleDelete = (row) => {
        if (onDelete) onDelete(row);
        handleContextMenuClose();
    };

    const handleAdd = () => {
        if (onAdd) onAdd();
    };

    const toggleRowExpansion = (id) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <Paper sx={{ p: 2, position: 'relative' }}>
            <Typography variant="h5" gutterBottom component="div">
                {title}
            </Typography>
            <StyledBox>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 20, 50, 100]}
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    getRowId={(row) => row.entity_id || row.id}
                    disableRowSelectionOnClick
                    getRowClassName={(params) => 
                        expandedRows.has(params.id) ? 'row-expanded' : ''
                    }
                    onRowClick={(params, event) => {
                        if (event.detail === 2) { // Double click
                            toggleRowExpansion(params.id);
                        }
                    }}
                    slots={{
                        toolbar: GridToolbar,
                    }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                    getDetailPanelHeight={() => 'auto'}
                    getDetailPanelContent={(params) => 
                        expandedRows.has(params.id) ? (
                            <Box className="row-details" p={2}>
                                <StyledPre>
                                    <code>
                                        {JSON.stringify(params.row, null, 2)}
                                    </code>
                                </StyledPre>
                            </Box>
                        ) : null
                    }
                    onRowContextMenu={(params, event) => 
                        handleContextMenu(event, params.row)
                    }
                />
            </StyledBox>

            {/* Context Menu */}
            <Menu
                open={contextMenu !== null}
                onClose={handleContextMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={() => handleView(selectedRow)}>
                    <VisibilityIcon sx={{ mr: 1 }} /> View Details
                </MenuItem>
                <MenuItem onClick={() => handleEdit(selectedRow)}>
                    <EditIcon sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={() => handleDelete(selectedRow)}>
                    <DeleteIcon sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>

            {/* Details Dialog */}
            <Dialog
                open={!!detailsDialog}
                onClose={() => setDetailsDialog(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Row Details</DialogTitle>
                <DialogContent>
                    <StyledPre>
                        <code>
                            {detailsDialog && JSON.stringify(detailsDialog, null, 2)}
                        </code>
                    </StyledPre>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsDialog(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Floating Action Button */}
            {onAdd && (
                <StyledFab color="primary" onClick={handleAdd}>
                    <AddIcon />
                </StyledFab>
            )}
        </Paper>
    );
}
