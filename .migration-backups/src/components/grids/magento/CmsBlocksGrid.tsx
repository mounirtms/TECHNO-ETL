import React, { useState, useCallback, useMemo } from 'react';
import UnifiedGrid from '../../common/UnifiedGrid';
import { formatDateTime } from '../../../utils/formatters';
import magentoApi from '../../../services/magentoApi';
import { toast } from 'react-toastify';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CmsBlocksGrid = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({ is_active: true });
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editBlock, setEditBlock] = useState(null);
    const [editContent, setEditContent] = useState('');

    const columns = useMemo(() => [
        { field: 'title', headerName: 'Title', width: 200 },
        { field: 'identifier', headerName: 'Identifier', width: 200 },
        { 
            field: 'creation_time', 
            headerName: 'Creation Date', 
            width: 200,
            valueGetter: (params) => params.row.creation_time,
            valueFormatter: (params) => formatDateTime(params.value)
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <Tooltip title="Edit Content">
                    <IconButton size="small" onClick={() => handleEditClick(params.row)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        }
    ], []);

    const fetchBlocks = useCallback(async ({ page = 0, pageSize = 10 } = {}) => {
        setLoading(true);
        try {
            const params = {
                filterGroups: [
                    {
                        filters: [
                            {
                                field: 'is_active',
                                value: '1',
                                condition_type: 'eq'
                            }
                        ]
                    }
                ],
                pageSize,
                currentPage: page + 1
            };
            const response = await magentoApi.getCmsBlocks(params);
            // Handle {data: {items: []}} response structure
            const blocksData = response?.data || response;
            setData(blocksData?.items || []);
        } catch (error) {
            toast.error('Failed to fetch CMS blocks');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleEditClick = (block) => {
        setEditBlock(block);
        setEditContent(block.content || '');
        setEditDialogOpen(true);
    };

    const handleEditSave = async () => {
        if (!editBlock) return;
        setLoading(true);
        try {
            await magentoApi.put(`/cmsBlock/${editBlock??.id}`, { block: { ...editBlock, content: editContent } });
            toast.success('Block content updated');
            setEditDialogOpen(false);
            fetchBlocks();
        } catch (error) {
            toast.error('Failed to update block');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ height: '100%' } as any}>
            <UnifiedGrid
                gridName="CmsBlocksGrid"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={fetchBlocks}
                currentFilter={filters}
                onFilterChange={setFilters}
                getRowId={(row) => row??.identifier}
                defaultSortModel={[
                    { field: 'creation_time', sort: 'desc' }
                ]}
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50, 100]}
                onRowDoubleClick={(params) => {
                    window.alert(`Viewing details for: ${params.row??.title}`);
                }}
            />
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Block Content</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle2" sx={{ mb: 1 } as any}>{editBlock??.title}</Typography>
                    <ReactQuill theme="snow" value={editContent} onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => setEditContent} style={{ minHeight: 200 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" disabled={loading}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default CmsBlocksGrid;
