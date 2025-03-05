import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import magentoApi from '../../services/magentoApi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BaseGrid from '../common/BaseGrid';

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
            const response = await magentoApi.getCmsPages({
                searchCriteria: {
                    pageSize: 10,
                    sortOrders: [{ field: 'creation_time', direction: 'DESC' }],
                    filterGroups: [{
                        filters: [{ field: 'is_active', value: '1', condition_type: 'eq' }]
                    }]
                }
            });

            if (!response || !response.items || response.items.length === 0) {
                await loadLocalData();
            } else {
                setPages(response.items);
            }
        } catch (error) {
            console.error('Failed to fetch CMS pages:', error);
            setError('Failed to load CMS pages. Please try again.');
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
        <Box sx={{ p: 1 }}>
            {error && <Typography color="error">{error}</Typography>}

            <BaseGrid
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
                onRefresh={fetchData}
                getRowId={(row) => row?.identifier ?? Math.random().toString(36).substr(2, 9)}
                defaultSortModel={[{ field: 'creation_time', sort: 'desc' }]}
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50, 100]}
                onRowDoubleClick={(params) => handleOpenDialog(params.row)}
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
                    <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} color="primary">{selectedPage ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CmsPage;
