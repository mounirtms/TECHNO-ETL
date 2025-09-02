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
    Visibility, Edit, Delete, Add
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
        // store_id is not used in the component, so it's removed
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
            
            const baseParams = getApiParams({
                pageSize: paginationModel.pageSize,
                currentPage: paginationModel.page + 1,
                sortOrders: [{ 
                    field: filters.sortBy, 
                    direction: filters.sortOrder 
                }]
            });

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
                    active: response.data.items.filter(item => item.is_active).length,
                    inactive: response.data.items.filter(item => !item.is_active).length,
                    recentlyModified: response.data.items.filter(item => {
                        const modifiedDate = new Date(item.update_time);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return modifiedDate > weekAgo;
                    }).length
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

    // ===== COLUMN DEFINITIONS =====
    const columns = useMemo(() => [
        { 
            field: 'title', 
            headerName: 'Title', 
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ py: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                        {params.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ID: {params.row.identifier}
                    </Typography>
                </Box>
            )
        },
        { 
            field: 'is_active', 
            headerName: 'Status', 
            width: 100,
            renderCell: (params) => (
                <Chip 
                    label={params.value ? 'Active' : 'Inactive'} 
                    color={params.value ? 'success' : 'default'} 
                    size="small" 
                />
            )
        },
        { 
            field: 'creation_time', 
            headerName: 'Created', 
            width: 180,
            valueFormatter: (params) => formatDateTime(params.value)
        },
        { 
            field: 'update_time', 
            headerName: 'Modified', 
            width: 180,
            valueFormatter: (params) => formatDateTime(params.value)
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <ButtonGroup size="small" variant="outlined">
                    <Tooltip title="View">
                        <IconButton size="small" onClick={() => handleView(params.row)}>
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(params.row)}>
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton 
                            size="small" 
                            onClick={() => handleDelete(params.row)}
                            color="error"
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>
            )
        }
    ], [handleView, handleEdit, handleDelete]); // Added missing dependencies

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
</original_code>```
