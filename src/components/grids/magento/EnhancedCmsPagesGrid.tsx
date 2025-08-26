import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Box, Chip, IconButton, Tooltip, Alert, FormControl, InputLabel,
    Select, MenuItem, Switch, FormControlLabel, Tabs, Tab, Paper, Grid, Card,
    CardContent, CardHeader, Divider, ButtonGroup, Menu, ListItemIcon, ListItemText,
    Accordion, AccordionSummary, AccordionDetails, Slider, Autocomplete
} from '@mui/material';
import {
    Visibility, Edit, Delete, Add, Publish, Save, Cancel, Preview,
    Schedule, Analytics, ContentCopy, Article, FilterList,
    Search, Clear, ExpandMore, ViewModule, ViewList, Fullscreen
} from '@mui/icons-material';
import UnifiedGrid from '../../common/UnifiedGrid';
import { getStandardGridProps, getStandardToolbarConfig } from '../../../config/gridConfig';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import magentoApi from '../../../services/magentoApi';
import { formatDateTime } from '../../../utils/formatters';

const EnhancedCmsPagesGrid = () => {
    // Content type selection (Pages or Blocks)
    const [contentType, setContentType] = useState('pages'); // 'pages' or 'blocks'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [previewMode, setPreviewMode] = useState(false);
    const [fullscreenEditor, setFullscreenEditor] = useState(false);
    
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
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        url_key: '',
        sort_order: 0,
        store_id: [0] // All store views by default
    });

    // Professional stats for cards
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        recentlyModified: 0,
        totalViews: 0
    });

    // Enhanced data fetching with proper filtering to fix endpoint errors
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log(`🔍 EnhancedCmsPagesGrid: Fetching CMS ${contentType}...`);
            
            // Build search criteria with proper field names to fix "%fieldName" error
            const searchCriteria = {
                pageSize: 50,
                currentPage: 1,
                sortOrders: [{ 
                    field: filters.sortBy, 
                    direction: filters.sortOrder.toUpperCase() 
                }],
                filterGroups: []
            };

            // Add status filter with proper field name
            if(filters.status !== 'all') {
                searchCriteria.filterGroups.push({
                    filters: [{
                        field: 'is_active',
                        value: filters.status === 'active' ? '1' : '0',
                        conditionType: 'eq'
                    }]
                });
            // Add search filter with proper field names to prevent endpoint errors
            if (filters.search.trim()) {
                searchCriteria.filterGroups.push({
                    filters: [
                        {
                            field: 'title',
                            value: `%${filters.search}%`,
                            conditionType: 'like'
                        },
                        {
                            field: 'identifier', 
                            value: `%${filters.search}%`,
                            conditionType: 'like'
                    ]
                });
            // Fetch data based on content type with proper API calls
            let response;
            if(contentType === 'pages') {
                // Use proper endpoint for CMS pages
                response = await magentoApi.get('/cmsPage/search', { searchCriteria });
            } else {
                // Use proper endpoint for CMS blocks
                response = await magentoApi.get('/cmsBlock/search', { searchCriteria });
            console.log(`📦 EnhancedCmsPagesGrid: ${contentType} response:`, response);

            // Handle response structure properly
            const cmsData = response?.data || response;
            const items = cmsData?.items || [];

            if(items.length > 0) {
                setData(items);
                
                // Update professional stats
                const activeCount = items.filter((item: any) => item?.is_active).length;
                setStats({
                    total: items.length,
                    active: activeCount,
                    inactive: items.length - activeCount,
                    recentlyModified: items.filter((item: any) => {
                        const updateTime = new Date(item.update_time);
                        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                        return updateTime > dayAgo;
                    }).length,
                    totalViews: cmsData?.total_count || items.length
                });
                
                console.log(`✅ EnhancedCmsPagesGrid: Loaded ${items.length} ${contentType}`);
            } else {
                console.warn(`⚠️ No CMS ${contentType} found`);
                setData([]);
                setStats({ total: 0, active: 0, inactive: 0, recentlyModified: 0, totalViews: 0 });
        } catch(error: any) {
            console.error(`❌ EnhancedCmsPagesGrid: Error fetching ${contentType}:`, error);
            setError(error.message || `Failed to fetch CMS ${contentType}`);
            setData([]);
            setStats({ total: 0, active: 0, inactive: 0, recentlyModified: 0, totalViews: 0 });
            toast.error(`Failed to fetch CMS ${contentType}: ${error.message}`);
        } finally {
            setLoading(false);
    }, [contentType, filters]);

    // Filter handlers
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({
            status: 'all',
            search: '',
            dateRange: 'all',
            sortBy: 'creation_time',
            sortOrder: 'desc'
        });
    }, []);

    // Content type handler
    const handleContentTypeChange = useCallback((newType) => {
        setContentType(newType);
        setData([]);
        setStats({ total: 0, active: 0, inactive: 0, recentlyModified: 0, totalViews: 0 });
    }, []);

    // Enhanced Quill editor configuration for Magento-friendly HTML
    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean'],
                ['fullscreen']
            ],
            handlers: {
                'fullscreen': () => setFullscreenEditor(!fullscreenEditor)
        },
        clipboard: {
            matchVisual: false,
    }), [fullscreenEditor]);

    const quillFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video',
        'color', 'background', 'align'
    ];

    // Professional stats cards configuration
    const statsCards = useMemo(() => [
        {
            title: `Total ${contentType === 'pages' ? 'Pages' : 'Blocks'}`,
            value: stats.total,
            icon: contentType === 'pages' ? <Article /> : <ViewModule />,
            color: 'primary',
            trend: stats.total > 0 ? '+' : ''
        },
        {
            title: 'Active',
            value: stats.active,
            icon: <Visibility />,
            color: 'success',
            percentage: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0
        },
        {
            title: 'Inactive',
            value: stats.inactive,
            icon: <Article />,
            color: 'warning',
            percentage: stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0
        },
        {
            title: 'Recently Modified',
            value: stats.recentlyModified,
            icon: <Schedule />,
            color: 'info',
            subtitle: 'Last 24 hours'
    ], [contentType, stats]);

    // Professional columns configuration
    const columns = useMemo(() => [
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
            type: 'number'
        },
        {
            field: 'title',
            headerName: 'Title',
            width: 250,
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}></
                    <Typography variant="outlined" sx={{ display: "flex", fontWeight: 500 }}>
                        {params.value}
                    </Typography>
                </Box>
        },
        {
            field: 'identifier',
            headerName: 'Identifier',
            width: 200,
            renderCell: (params) => (
                <Chip label={params.value} 
                    size="small"
        },
        {
            field: 'is_active',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Active' : 'Inactive'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                    icon={params.value ? <Visibility /> : <Article />}
                />
        },
        {
            field: 'creation_time',
            headerName: 'Created',
            width: 150,
            renderCell: (params) => (
                <Typography variant="outlined">
                    {formatDateTime(params.value)}
                </Typography>
        },
        {
            field: 'update_time',
            headerName: 'Modified',
            width: 150,
            renderCell: (params) => (
                <Typography variant="outlined">
                    {formatDateTime(params.value)}
                </Typography>
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}></
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
                            <Edit fontSize="small" /></Edit>
                    </Tooltip>
                    <Tooltip title="Preview"></
                        <IconButton size="small" onClick={() => handlePreview(params.row)}>
                            <Preview fontSize="small" /></Preview>
                    </Tooltip>
                </Box>
    ], []);

    // Dialog handlers
    const handleOpenDialog = useCallback((item = null) => {
        setSelectedItem(item);
        setFormData(item ? {
            title: item.title || '',
            identifier: item?.identifier || '',
            content: item.content || '',
            is_active: item.is_active || true,
            meta_title: item.meta_title || '',
            meta_description: item.meta_description || '',
            meta_keywords: item.meta_keywords || '',
            url_key: item.url_key || '',
            sort_order: item.sort_order || 0,
            store_id: item.store_id || [0]
        } : {
            title: '',
            identifier: '',
            content: '',
            is_active: true,
            meta_title: '',
            meta_description: '',
            meta_keywords: '',
            url_key: '',
            sort_order: 0,
            store_id: [0]
        });
        setOpenDialog(true);
        setActiveTab(0);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setOpenDialog(false);
        setSelectedItem(null);
        setActiveTab(0);
        setPreviewMode(false);
        setFullscreenEditor(false);
    }, []);

    const handlePreview = useCallback((item) => {
        setSelectedItem(item);
        setPreviewMode(true);
        setOpenDialog(true);
    }, []);

    // Enhanced save functionality for POST and PUT operations
    const handleSave = useCallback(async () => {
        try {
            if(!formData.title || !formData?.identifier) {
                toast.error('Title and Identifier are required');
                return;
            const payload = {
                title: formData.title,
                identifier: formData?.identifier,
                content: formData.content,
                is_active: formData.is_active,
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
                meta_keywords: formData.meta_keywords,
                url_key: formData.url_key,
                sort_order: formData.sort_order,
                store_id: formData.store_id
            };

            if(selectedItem) {
                // UPDATE existing item
                if(contentType === 'pages') {
                    await magentoApi.put(`/cmsPage/${selectedItem.id}`, { page: payload });
                    toast.success('CMS Page updated successfully');
                } else {
                    await magentoApi.put(`/cmsBlock/${selectedItem.id}`, { block: payload });
                    toast.success('CMS Block updated successfully');
            } else {
                // CREATE new item (always POST to Magento API)
                if(contentType === 'pages') {
                    await magentoApi.post('/cmsPage', { page: payload });
                    toast.success('CMS Page created successfully');
                } else {
                    await magentoApi.post('/cmsBlock', { block: payload });
                    toast.success('CMS Block created successfully');
            handleCloseDialog();
            fetchData(); // Refresh the grid
        } catch(error: any) {
            console.error('Save error:', error);
            toast.error(`Failed to save CMS ${contentType.slice(0, -1)}: ${error.message}`);
    }, [formData, selectedItem, contentType, handleCloseDialog, fetchData]);

    // Enhanced delete functionality
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm(`Are you sure you want to delete this ${contentType.slice(0, -1)}?`)) {
            return;
        try {
            if(contentType === 'pages') {
                await magentoApi.delete(`/cmsPage/${id}`);
                toast.success('CMS Page deleted successfully');
            } else {
                await magentoApi.delete(`/cmsBlock/${id}`);
                toast.success('CMS Block deleted successfully');
            fetchData(); // Refresh the grid
        } catch(error: any) {
            console.error('Delete error:', error);
            toast.error(`Failed to delete CMS ${contentType.slice(0, -1)}: ${error.message}`);
    }, [contentType, fetchData]);

    // Form change handler
    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ===== RENDER =====
    return (
        <Box sx={{ display: "flex", p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Professional Header with Content Type Toggle */}
            <Box sx={{ display: "flex", mb: 3 }}></
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" sx={{ display: "flex", fontWeight: 600 }}>
                        CMS {contentType === 'pages' ? 'Pages' : 'Blocks'} Management
                    </Typography>

                    {/* Content Type Toggle */}
                    <ButtonGroup variant="outlined" size="large"></
                        <Button variant={contentType === 'pages' ? 'contained' : 'outlined'}
                            onClick={() => handleContentTypeChange('pages')}
                            startIcon={<Article />}
                        >
                            Pages
                        </Button>
                        <Button variant={contentType === 'blocks' ? 'contained' : 'outlined'}
                            onClick={() => handleContentTypeChange('blocks')}
                            startIcon={<ViewModule />}
                        >
                            Blocks
                        </Button>
                    </ButtonGroup>
                </Box>

                {/* Professional Stats Cards */}
                <Grid { ...{container: true}} spacing={2} sx={{ display: "flex", mb: 3 }}>
                    {statsCards.map((card: any index: any) => (
                        <Grid item xs={12} sm={6} md={3} key={index}></
                            <Card sx={{
                                display: "flex",
                                background: `linear-gradient(135deg, ${card.color === 'primary' ? '#1976d2' :
                                    card.color = == 'success' ? '#2e7d32' :
                                    card.color = == 'warning' ? '#ed6c02' : '#0288d1'} 0%, ${
                                    card.color = == 'primary' ? '#42a5f5' :
                                    card.color = == 'success' ? '#66bb6a' :
                                    card.color = == 'warning' ? '#ffb74d' : '#29b6f6'} 100%)`,
                                color: 'white',
                                height: 120
                            }}>
                                {/* Fix validateDOMNesting: Replace nested Typography <p> with <span> or <div> */}
                                {/* CardContent area */}
                                <CardContent sx={{ display: "flex", p: 2 }}></
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box></
                                            <Typography variant="h4" sx={{ display: "flex", fontWeight: 700, mb: 0.5 }} component="div">
                                                {card.value}
                                            </Typography>
                                            <Typography variant="outlined" sx={{ display: "flex", opacity: 0.9 }} component="div">
                                                {card.title}
                                            </Typography>
                                            {card.subtitle && (
                                                <Typography variant="caption" sx={{ display: "flex", opacity: 0.8 }} component="div">
                                                    {card.subtitle}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box sx={{ display: "flex", opacity: 0.8 }}>
                                            {card.icon}
                                        </Box>
                                    </Box>
                                    {card.percentage !== undefined && (
                                        <Typography variant="caption" sx={{ display: "flex", opacity: 0.9 }} component="div">
                                            {card.percentage}% of total
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {error && (
                <Alert severity="error" sx={{ display: "flex", mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Enhanced UnifiedGrid */}
            <UnifiedGrid
                { ...getStandardGridProps(contentType === 'pages' ? 'cmsPages' : 'cmsBlocks', {
                    // Data
                    data,
                    columns,
                    loading,

                    // Grid identification
                    gridName: `Cms${contentType === 'pages' ? 'Pages' : 'Blocks'}Grid`,

                    // Configuration
                    toolbarConfig: getStandardToolbarConfig(contentType === 'pages' ? 'cmsPages' : 'cmsBlocks'),

                    // Event handlers
                    onRowDoubleClick: (params) => handleOpenDialog(params.row),
                    onRefresh: fetchData,
                    onAdd: () => handleOpenDialog(),
                    onEdit: (items) => items.length ===1 && handleOpenDialog(data.find(item => item.id ===items[0])),
                    onDelete: (items) => items.forEach((id) => handleDelete(id)),

                    // Grid styling
                    sx: {
                        flexGrow: 1,
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #e0e0e0'
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)'
                })}
            />

            {/* Dialog for Editing CMS Page/Block */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth></
                <DialogTitle>{selectedItem ? `Edit ${contentType === 'pages' ? 'Page' : 'Block'}` : `Add ${contentType === 'pages' ? 'Page' : 'Block'}`}</DialogTitle>
                <DialogContent></
                    <Tabs value={activeTab} onChange={(e) => (_, v) => setActiveTab(v)} sx={{ display: "flex", mb: 2 }}>
                        <Tab label="General" /></
                        <Tab label="Content" />
                        <Tab label="SEO" /></
                        <Tab label="Advanced" /></Tab>
                    {activeTab ===0 && (<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}></
                            <TextField label="Title" value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)} fullWidth required />
                            <TextField label="Identifier" value={formData?.identifier} onChange={(e) => handleFormChange('identifier', e.target.value)} fullWidth required />
                            <FormControlLabel control={<Switch checked={formData.is_active} onChange={(e) => handleFormChange('is_active', e.target.checked)} />} label="Active" />
                        </Box>
                    )}
                    {activeTab ===1 && (<Box sx={{ display: "flex", mt: 2 }}></
                            <ReactQuill theme="snow" value={formData.content} onChange={(e) => v => handleFormChange('content', v)} modules={quillModules} formats={quillFormats} style={{ minHeight: 200 }} />
                        </Box>
                    )}
                    {activeTab ===2 && (<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}></
                            <TextField label="Meta Title" value={formData.meta_title} onChange={(e) => handleFormChange('meta_title', e.target.value)} fullWidth />
                            <TextField label="Meta Description" value={formData.meta_description} onChange={(e) => handleFormChange('meta_description', e.target.value)} fullWidth />
                            <TextField label="Meta Keywords" value={formData.meta_keywords} onChange={(e) => handleFormChange('meta_keywords', e.target.value)} fullWidth />
                        </Box>
                    )}
                    {activeTab ===3 && (<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}></
                            <TextField label="URL Key" value={formData.url_key} onChange={(e) => handleFormChange('url_key', e.target.value)} fullWidth />
                            <TextField label="Sort Order" type="number" value={formData.sort_order} onChange={(e) => handleFormChange('sort_order', Number(e.target.value))} fullWidth />
                            <TextField label="Store IDs (comma separated)" value={formData.store_id ? formData.store_id.join(',') : ''} onChange={(e) => handleFormChange('store_id', e.target.value.split(',').map((v: any) => v.trim()).filter(Boolean))} fullWidth />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions></
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Fix findDOMNode warning: ensure refs are attached directly to DOM elements, not React components */}
            {/* Fix validateDOMNesting warning: avoid <p> inside <p> in Typography */}
            {/* 1. Replace all <Typography component="p"> or default <Typography> (which renders <p>) inside another <Typography> or <p> with <span> or <div>. */}
            {/* 2. Check all refs passed to ReactQuill, UnifiedGrid, or other components and ensure they are attached to DOM elements, not React components. */}
        </Box>
    );
};

export default EnhancedCmsPagesGrid;
