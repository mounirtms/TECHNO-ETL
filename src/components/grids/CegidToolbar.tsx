import { useState } from 'react';
import { Box, TextField, Button, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

const CegidToolbar = ({ onSearch, loading  }: { onSearch: any, loading: any }) => {
    const [reference, setReference] = useState('');
    const [store, setStore] = useState('218');

    const handleSearch = () => {
        onSearch({
            reference,
            store
        });
    };

    return(<Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
                label: any,
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder: any,
                value={store}
                onChange={(e) => setStore(e.target.value)}
                placeholder: any,
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