import React, { useState, useCallback } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import { toast } from 'react-toastify';
import { getProductsFromCegid } from '../../services/CegidApi'; // Ensure this is the correct import

const CegidGrid = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [barcode, setBarcode] = useState('');

    const columns = [
        { field: 'itemCode', headerName: 'Item Code', width: 150 },
        { field: 'description', headerName: 'Description', flex: 1 },
        { field: 'price', headerName: 'Price', width: 120 },
        { field: 'stock', headerName: 'Stock', width: 100 },
        { field: 'store', headerName: 'Store', width: 100 },
        { field: 'status', headerName: 'Status', width: 120 }
    ];

    const handleSearch = useCallback(async () => {
        setLoading(true);
        try {
            const products = await getProductsFromCegid();
            setData(products);
            toast.success('Products loaded successfully');
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Error loading products');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Cegid Product Search
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        label="Barcode"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        size="small"
                        placeholder="Enter barcode..."
                        sx={{ minWidth: 200 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Load Products'}
                    </Button>
                </Box>
            </Paper>

            <BaseGrid
                gridName="CegidProductsGrid"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={handleSearch}
            />
        </Box>
    );
};

export default CegidGrid;