import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Box,
    Typography,
    Divider,
    Switch,
    FormControlLabel
} from '@mui/material';
import { toast } from 'react-toastify';
import ProductService from '../../services/ProductService';

const AddProductDialog = ({ open, onClose, onSave }) => {
    const [productData, setProductData] = useState({
        sku: '',
        name: '',
        price: '',
        description: '',
        short_description: '',
        weight: '',
        status: 1, // Default to Enabled
        type_id: 'simple', // Default to Simple Product
        attribute_set_id: 4, // Default attribute set
        visibility: 4, // Catalog, Search
        country_of_manufacture: '',
        categories: [],
        qty: '0',
        manage_stock: true,
        additional_attributes: {}
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const { description, ...rest } = productData;

        const finalProductData = {
            ...rest,
            custom_attributes: [
                {
                    attribute_code: 'description',
                    value: description
                }
            ]
        };

        // Basic validation can be added here
        onSave(finalProductData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="SKU"
                            name="sku"
                            value={productData.sku}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Name"
                            name="name"
                            value={productData.name}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Price"
                            name="price"
                            type="number"
                            value={productData.price}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={productData.status}
                                onChange={handleChange}
                                label="Status"
                            >
                                <MenuItem value={1}>Enabled</MenuItem>
                                <MenuItem value={2}>Disabled</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            multiline
                            rows={4}
                            value={productData.description}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddProductDialog;
