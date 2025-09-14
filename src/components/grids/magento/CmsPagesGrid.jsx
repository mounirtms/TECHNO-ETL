import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';

/**
 * CMS Pages Grid Component
 * Placeholder for CMS Pages management
 */
const CmsPagesGrid = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                    CMS Pages Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    CMS Pages grid component is under development.
                </Typography>
            </Paper>
        </Box>
    );
};

export default CmsPagesGrid;
