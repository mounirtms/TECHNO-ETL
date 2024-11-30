import React from 'react';
import { Box, Typography } from '@mui/material';

const CustomersGrid = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Customers
            </Typography>
            {/* Add customers grid content here */}
        </Box>
    );
};

export default CustomersGrid;
