import React from 'react';
import { Box, Typography } from '@mui/material';

const ProductsGrid = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Products
            </Typography>
            {/* Add products grid content here */}
        </Box>
    );
};

export default ProductsGrid;
