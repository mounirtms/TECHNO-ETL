import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import cmsService from '../services/cmsService';

const CmsManager = () => {
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

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const response = await cmsService.getCmsPages();
            setPages(response);
        } catch (error) {
            toast.error('Failed to fetch CMS pages');
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

    const handleSubmit = async () => {
        try {
            if (selectedPage) {
                await cmsService.updateCmsPage(selectedPage.id, formData);
                toast.success('CMS page updated successfully');
            } else {
                await cmsService.createCmsPage(formData);
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
                await cmsService.deleteCmsPage(id);
                toast.success('CMS page deleted successfully');
                fetchPages();
            } catch (error) {
                toast.error('Failed to delete CMS page');
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h1">
                    CMS Pages
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add New Page
                </Button>
            </Box>

            <Paper elevation={2}>
                <TableContainer>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Identifier</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pages.map((page) => (
                                    <TableRow key={page.id}>
                                        <TableCell>{page.title}</TableCell>
                                        <TableCell>{page.identifier}</TableCell>
                                        <TableCell>
                                            {page.is_active ? 'Active' : 'Inactive'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenDialog(page)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(page.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedPage ? 'Edit CMS Page' : 'Create New CMS Page'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Identifier"
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            multiline
                            rows={4}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedPage ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CmsManager;