import React from 'react';
import { Box, Typography } from '@mui/material';

const OrdersGrid = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Orders
            </Typography>
            {/* Add orders grid content here */}
        </Box>
    );
};

export default OrdersGrid;
