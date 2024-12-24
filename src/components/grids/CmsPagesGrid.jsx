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
    const [formData, setFormData] = useState({
        title: '',
        identifier: '',
        content: '',
        is_active: true
    });
    const [hasFetched, setHasFetched] = useState(false); // New flag to prevent repeated fetches

    const loadLocalData = async () => {
        try {
            const pagesResponse = await fetch('/assets/data/cmsPages.json');
            const pagesData = await pagesResponse.json();

            setPages(pagesData.items);
        } catch (error) {
            console.error('Failed to load local data:', error);
        }
    };


    const fetchData = async () => {
        if (hasFetched) return; // Prevent multiple fetches
        setHasFetched(true);
        try {
            const response = await magentoApi.getCmsPages({
                searchCriteria: {
                    pageSize: 10,
                    sortOrders: [{
                        field: 'creation_time', // Correct field name
                        direction: 'DESC'
                    }],
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
                    ]
                }
            });

            if (response.items.items.length === 0) {
                await loadLocalData();
            } else {
                setPages(response.items.items);
            }
        } catch (error) {
            console.error('Failed to fetch CMS pages:', error);
            await loadLocalData();
        } finally {
            setLoading(false);
        }
    };




    const handleOpenDialog = (page = null) => {
        if (page) {
            setSelectedPage(page);
            setFormData({
                title: page.title,
                identifier: page.identifier,
                content: page.content,
                is_active: page.is_active
            });
        } else {
            setSelectedPage(null);
            setFormData({
                title: '',
                identifier: '',
                content: '',
                is_active: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPage(null);
        setFormData({
            title: '',
            identifier: '',
            content: '',
            is_active: true
        });
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (selectedPage) {
                await magentoApi.updateCmsPage(selectedPage.id,{page: formData});
                toast.success('CMS page updated successfully');
            } else {
                await magentoApi.createCmsPage({page: formData});
                toast.success('CMS page created successfully');
            }
            handleCloseDialog();
            fetchPages();
        } catch (error) {
            toast.error(selectedPage ? 'Failed to update CMS page' : 'Failed to create CMS page');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this page?')) {
            try {
                await magentoApi.deleteCmsPage(id);
                toast.success('CMS page deleted successfully');
                fetchPages();
            } catch (error) {
                toast.error('Failed to delete CMS page');
            }
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <BaseGrid
                gridName="CmsPagesGrid"
                columns={[
                    { field: 'title', headerName: 'Title', width: 200 },
                    {
                        field: 'creation_time',
                        headerName: 'Creation Date',
                        width: 180,
                        valueGetter: (params) => params.row.creation_time,
                        valueFormatter: (params) => new Date(params.value).toLocaleString()
                    }
                ]}
                data={pages}
                loading={loading}
                onRefresh={fetchData} // Allow refresh to trigger a new fetch
                currentFilter={{ is_active: true }}
                onFilterChange={(filter) => setFormData({ ...formData, ...filter })}
                getRowId={(row) => row.identifier}
                defaultSortModel={[
                    { field: 'creation_time', sort: 'desc' }
                ]}
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
                            margin="normal"
                        />
                        <TextField
                            label="Identifier"
                            value={formData.identifier}
                            onChange={(e) => handleFormChange('identifier', e.target.value)}
                            fullWidth
                            margin="normal"
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