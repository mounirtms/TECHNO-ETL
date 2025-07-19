import React, { useState, useEffect } from 'react';
import {
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Box
} from '@mui/material';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import UnifiedGrid from '../../common/UnifiedGrid';
import magentoApi from '../../../services/magentoApi';

const CmsPage = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        identifier: '',
        content: '',
        is_active: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const loadLocalData = async () => {
        try {
            const response = await fetch('/assets/data/cmsPages.json');
            const data = await response.json();
            setPages(data?.items ?? []);
        } catch (error) {
            console.error('Failed to load local data:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔍 CmsPagesGrid: Fetching CMS pages...');
            const response = await magentoApi.getCmsPages({
                searchCriteria: {
                    pageSize: 10,
                    sortOrders: [{ field: 'creation_time', direction: 'DESC' }],
                    filterGroups: [{
                        filters: [{ field: 'is_active', value: '1', conditionType: 'eq' }]
                    }]
                }
            });

            console.log('📦 CmsPagesGrid: API response:', response);

            // Handle {data: {items: []}} response structure
            const cmsData = response?.data || response;
            const items = cmsData?.items || [];

            console.log('✅ CmsPagesGrid: Processed items:', items.length);

            if (!items || items.length === 0) {
                console.warn('No CMS pages found - loading local data as fallback');
                await loadLocalData();
            } else {
                setPages(items);
            }
        } catch (error) {
            console.error('Failed to fetch CMS pages:', error);
            // Don't set error state for empty data - it's normal
            if (error.message !== 'No data returned from API') {
                setError('Failed to load CMS pages. Please try again.');
            }
            console.log('Loading local CMS data as fallback...');
            await loadLocalData();
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (page = null) => {
        setSelectedPage(page);
        setFormData({
            title: page?.title ?? '',
            identifier: page?.identifier ?? '',
            content: page?.content ?? '',
            is_active: page?.is_active ?? true
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPage(null);
        setFormData({ title: '', identifier: '', content: '', is_active: true });
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (selectedPage) {
                await magentoApi.updateCmsPage(selectedPage.id, { page: formData });
                toast.success('CMS page updated successfully');
            } else {
                await magentoApi.createCmsPage({ page: formData });
                toast.success('CMS page created successfully');
            }
            handleCloseDialog();
            fetchData();
        } catch (error) {
            console.error('Error submitting CMS page:', error);
            toast.error(selectedPage ? 'Failed to update CMS page' : 'Failed to create CMS page');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this page?')) return;

        try {
            await magentoApi.deleteCmsPage(id);
            toast.success('CMS page deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Error deleting CMS page:', error);
            toast.error('Failed to delete CMS page');
        }
    };

    return (
        <>
            {error && <Typography color="error">{error}</Typography>}

            <UnifiedGrid
                gridName="CmsPagesGrid"
                columns={[
                    { field: 'title', headerName: 'Title', width: 200 },
                    {
                        field: 'creation_time',
                        headerName: 'Creation Date',
                        width: 180,
                        valueGetter: (params) => params.row?.creation_time,
                        valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
                    }
                ]}
                data={pages}
                loading={loading}

                // Feature toggles
                enableCache={true}
                enableI18n={true}
             
                enableSelection={true}
                enableSorting={true}
                enableFiltering={true}

                // View options
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
                    showSettings: true
                }}

                // Context menu
                contextMenuActions={{
                    edit: {
                        enabled: true,
                        onClick: (rowData) => handleOpenDialog(rowData)
                    },
                    delete: {
                        enabled: true,
                        onClick: (rowData) => handleDelete(rowData.id)
                    },
                    view: {
                        enabled: true,
                        onClick: (rowData) => handleOpenDialog(rowData)
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
                onRefresh={fetchData}
                onAdd={() => handleOpenDialog()}
                onEdit={(rowData) => handleOpenDialog(rowData)}
                onDelete={(selectedRows) => {
                    selectedRows.forEach(id => {
                        const page = pages.find(p => p.identifier === id);
                        if (page) handleDelete(page.id);
                    });
                }}
                onRowDoubleClick={(params) => handleOpenDialog(params.row)}
                onExport={(selectedRows) => {
                    const exportData = selectedRows.length > 0
                        ? pages.filter(page => selectedRows.includes(page.identifier))
                        : pages;
                    console.log('Exporting CMS pages:', exportData);
                    toast.success(`Exported ${exportData.length} CMS pages`);
                }}

                // Row configuration
                getRowId={(row) => row?.identifier ?? Math.random().toString(36).substr(2, 9)}

                // Sorting
                sortModel={[{ field: 'creation_time', sort: 'desc' }]}

                // Error handling
                onError={(error) => {
                    console.error('CMS Pages Grid Error:', error);
                    toast.error('Error loading CMS pages');
                }}
            />

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>{selectedPage ? 'Edit Page' : 'Add New Page'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Identifier"
                            value={formData.identifier}
                            onChange={(e) => handleFormChange('identifier', e.target.value)}
                            fullWidth
                        />
                        <ReactQuill
                            value={formData.content}
                            onChange={(value) => handleFormChange('content', value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} color="primary">{selectedPage ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CmsPage;
