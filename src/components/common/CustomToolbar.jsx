import React from 'react';
import { Box, IconButton } from '@mui/material';
import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';

const CustomToolbar = ({ showQuickFilter, onRefresh, onOpenSettings, customToolbar }) => {
    return (
        <GridToolbarContainer>
            <Box sx={{ flexGrow: 1 }}>
                {/* Render custom toolbar elements passed as a prop */}
                {customToolbar}
            </Box>
            
            {showQuickFilter && <GridToolbarQuickFilter sx={{ mr: 2 }} />}

            {onRefresh && (
                <IconButton onClick={onRefresh} title="Refresh data">
                    <RefreshIcon />
                </IconButton>
            )}

            {onOpenSettings && (
                <IconButton onClick={onOpenSettings} title="Column Settings">
                    <SettingsIcon />
                </IconButton>
            )}
        </GridToolbarContainer>
    );
};

export default CustomToolbar;
