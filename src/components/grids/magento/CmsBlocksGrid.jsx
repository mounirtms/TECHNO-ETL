import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Box, Chip, IconButton, Tooltip, Alert, FormControl, InputLabel,
    Select, MenuItem, Switch, FormControlLabel, Paper, Grid, Card,
    CardContent, CardHeader, Divider, ButtonGroup, Menu, ListItemIcon, ListItemText,
    Accordion, AccordionSummary, AccordionDetails, Slider, Autocomplete
} from '@mui/material';
import { useSettings } from '../../../contexts/SettingsContext';
import { useMagentoGridSettings } from '../../../hooks/useMagentoGridSettings';
import {
    Visibility, Edit, Delete, Add, Publish, Save, Cancel, Preview,
    Schedule, Analytics, ContentCopy, Article, FilterList,
    Search, Clear, ExpandMore, ViewModule, ViewList, Fullscreen, FullscreenExit
} from '@mui/icons-material';
import UnifiedGrid from '../../common/UnifiedGrid';
import { getStandardGridProps, getStandardToolbarConfig } from '../../../config/gridConfig';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import magentoApi from '../../../services/magentoApi';
import { formatDateTime } from '../../../utils/formatters';

const CmsBlocksGrid = () => {
    // ===== SETTINGS INTEGRATION =====
    const { settings } = useSettings();
    const {
        paginationSettings,
        getApiParams,
        handleError
    } = useMagentoGridSettings('magentoCmsBlocks', {});
    
    // Apply user settings to API service
    useEffect(() => {
        import('../../../services/magentoApi').then(({ setMagentoApiSettings }) => {
            setMagentoApiSettings(settings);
        });
    }, [settings]);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [error, setError] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [fullscreenEditor, setFullscreenEditor] = useState(false);
    const [paginationModel, setPaginationModel] = useState({ 
        page: 0, 
        pageSize: paginationSettings.defaultPageSize 
    });
    
    // Professional filtering system
    const [filters, setFilters] = useState({
        status: 'all', // all, active, inactive
        search: '',
        dateRange: 'all', // all, today, week, month, custom
        sortBy: 'creation_time',
        sortOrder: 'desc'
    });
    
    // Enhanced form data with SEO and scheduling
    const [formData, setFormData] = useState({
        title: '',
        identifier: '',
        content: '',
        is_active: true,
        store_id: [0] // All store views by default
    });

    // Professional stats for cards
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        recentlyModified: 0
    });

    // Enhanced data fetching with proper filtering
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔍 CmsBlocksGrid: Fetching CMS blocks...');
            
            // Get settings-aware API parameters
            const baseParams = getApiParams({
                pageSize: paginationModel.pageSize,
                currentPage: paginationModel.page + 1,
                sortOrders: [{ 
                    field: filters.sortBy, 
                    direction: filters.sortOrder 
                }]
            });

            // Add filters
            const filterParams = {};
            if (filters.status !== 'all') {
                filterParams.is_active = filters.status === 'active' ? 1 : 0;
            }
            if (filters.search) {
                filterParams.searchCriteria = {
                    filterGroups: [{
                        filters: [{
                            field: 'title',
                            value: `%${filters.search}%`,
                            conditionType: 'like'
                        }]
                    }]
                };
            }

            const response = await magentoApi.getCmsBlocks({
                ...baseParams,
                ...filterParams
            });

            if (response.success) {
                setData(response.data.items || []);
                setStats({
                    total: response.data.total_count || 0,
                    active: response.data.items?.filter(item => item.is_active)?.length || 0,
                    inactive: response.data.items?.filter(item => !item.is_active)?.length || 0,
                    recentlyModified: response.data.items?.filter(item => {
                        const modifiedDate = new Date(item.update_time);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return modifiedDate > weekAgo;
                    })?.length || 0
                });
            } else {
                throw new Error(response.message || 'Failed to fetch CMS blocks');
            }
        } catch (err) {
            console.error('❌ CmsBlocksGrid: Error fetching data:', err);
            setError(handleError(err));
            toast.error('Failed to load CMS blocks');
        } finally {
            setLoading(false);
        }
    }, [paginationModel, filters, getApiParams, handleError]);

    // Load data on mount and when dependencies change
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Grid columns configuration
    const columns = useMemo(() => [
        {
            field: 'block_id',
            headerName: 'ID',
            width: 80,
            sortable: true
        },
        {
            field: 'title',
            headerName: 'Title',
            width: 200,
            sortable: true,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight="medium">
                        {params.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ID: {params.row.identifier}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'identifier',
            headerName: 'Identifier',
            width: 150,
            sortable: true
        },
        {
            field: 'is_active',
            headerName: 'Status',
            width: 120,
            sortable: true,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Active' : 'Inactive'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'creation_time',
            headerName: 'Created',
            width: 150,
            sortable: true,
            renderCell: (params) => formatDateTime(params.value)
        },
        {
            field: 'update_time',
            headerName: 'Updated',
            width: 150,
            sortable: true,
            renderCell: (params) => formatDateTime(params.value)
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            renderCell: (params) => (
                <ButtonGroup size="small" variant="outlined">
                    <Tooltip title="View">
                        <IconButton onClick={() => handleView(params.row)}>
                            <Visibility />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(params.row)}>
                            <Edit />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(params.row)} color="error">
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>
            )
        }
    ], []);

    // Action handlers
    const handleView = useCallback((item) => {
        setSelectedItem(item);
        setPreviewMode(true);
        setOpenDialog(true);
    }, []);

    const handleEdit = useCallback((item) => {
        setSelectedItem(item);
        setFormData({
            title: item.title || '',
            identifier: item.identifier || '',
            content: item.content || '',
            is_active: item.is_active || true,
            store_id: item.store_id || [0]
        });
        setPreviewMode(false);
        setOpenDialog(true);
    }, []);

    const handleDelete = useCallback(async (item) => {
        if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
            try {
                const response = await magentoApi.deleteCmsBlock(item.block_id);
                if (response.success) {
                    toast.success('CMS block deleted successfully');
                    fetchData();
                } else {
                    throw new Error(response.message);
                }
            } catch (err) {
                console.error('Error deleting CMS block:', err);
                toast.error('Failed to delete CMS block');
            }
        }
    }, [fetchData]);

    const handleSave = useCallback(async () => {
        try {
            const blockData = {
                ...formData,
                block_id: selectedItem?.block_id
            };

            const response = selectedItem?.block_id 
                ? await magentoApi.updateCmsBlock(selectedItem.block_id, blockData)
                : await magentoApi.createCmsBlock(blockData);

            if (response.success) {
                toast.success(`CMS block ${selectedItem?.block_id ? 'updated' : 'created'} successfully`);
                setOpenDialog(false);
                fetchData();
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            console.error('Error saving CMS block:', err);
            toast.error('Failed to save CMS block');
        }
    }, [formData, selectedItem, fetchData]);

    const handleAddNew = useCallback(() => {
        setSelectedItem(null);
        setFormData({
            title: '',
            identifier: '',
            content: '',
            is_active: true,
            store_id: [0]
        });
        setPreviewMode(false);
        setOpenDialog(true);
    }, []);

    // Grid configuration
    const gridProps = getStandardGridProps({
        rows: data,
        columns,
        loading,
        paginationModel,
        onPaginationModelChange: setPaginationModel,
        pageSizeOptions: paginationSettings.pageSizeOptions,
        rowCount: stats.total
    });

    const toolbarConfig = getStandardToolbarConfig({
        onAdd: handleAddNew,
        onRefresh: fetchData,
        searchValue: filters.search,
        onSearchChange: (value) => setFilters(prev => ({ ...prev, search: value })),
        showFilters: true,
        filterOptions: [
            {
                label: 'Status',
                value: filters.status,
                options: [
                    { value: 'all', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                ],
                onChange: (value) => setFilters(prev => ({ ...prev, status: value }))
            }
        ]
    });

    return (
        <Box>
            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Blocks
                            </Typography>
                            <Typography variant="h4">
                                {stats.total}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Active Blocks
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {stats.active}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Inactive Blocks
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {stats.inactive}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Recently Modified
                            </Typography>
                            <Typography variant="h4" color="info.main">
                                {stats.recentlyModified}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Main Grid */}
            <UnifiedGrid {...gridProps} toolbarConfig={toolbarConfig} />

            {/* Add/Edit Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
                fullScreen={fullscreenEditor}
            >
                <DialogTitle>
                    {previewMode ? 'Preview CMS Block' : (selectedItem ? 'Edit CMS Block' : 'Add New CMS Block')}
                    <IconButton
                        onClick={() => setFullscreenEditor(!fullscreenEditor)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        {fullscreenEditor ? <FullscreenExit /> : <Fullscreen />}
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {previewMode ? (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                {selectedItem?.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Identifier: {selectedItem?.identifier}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box 
                                dangerouslySetInnerHTML={{ __html: selectedItem?.content || '' }}
                                sx={{ 
                                    border: 1, 
                                    borderColor: 'divider', 
                                    borderRadius: 1, 
                                    p: 2,
                                    minHeight: 200
                                }}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Identifier"
                                        value={formData.identifier}
                                        onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                                        required
                                        helperText="Unique identifier for the block"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                            />
                                        }
                                        label="Active"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Content
                                    </Typography>
                                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                        <ReactQuill
                                            value={formData.content}
                                            onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                                            style={{ height: 300 }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>
                        Cancel
                    </Button>
                    {!previewMode && (
                        <Button onClick={handleSave} variant="contained">
                            {selectedItem ? 'Update' : 'Create'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CmsBlocksGrid;
