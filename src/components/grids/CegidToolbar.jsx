import { useState } from 'react';
import { Box, TextField, Button, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

const CegidToolbar = ({ onSearch, loading }) => {
    const [reference, setReference] = useState('');
    const [store, setStore] = useState('218');

    const handleSearch = () => {
        onSearch({
            reference,
            store
        });
    };

    return (
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
                label="Reference"
                size="small"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Enter product reference"
            />
            <TextField
                label="Store"
                size="small"
                value={store}
                onChange={(e) => setStore(e.target.value)}
                placeholder="Store ID"
            />
            <Tooltip title="Search Products">
                <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                    disabled={loading}
                >
                    Search
                </Button>
            </Tooltip>
            <Tooltip title="Refresh">
                <IconButton 
                    onClick={() => handleSearch()} 
                    disabled={loading}
                >
                    <RefreshIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default CegidToolbar;