import { useState } from 'react';
import { Box, TextField, Button, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

const CegidToolbar = ({ onSearch, loading  }: { onSearch loading: any }) => {
    const [reference, setReference] = useState('');
    const [store, setStore] = useState('218');

    const handleSearch = () => {
        onSearch({
            reference,
            store
        });
    };

    return(<Box sx={{ display: "flex", p: 2, display: 'flex', gap: 2, alignItems: 'center' }}></
            <TextField label
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder
                value={store}
                onChange={(e) => setStore(e.target.value)}
                placeholder
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                    disabled={loading}
                >
                    Search
                </Button>
            </Tooltip>
            <Tooltip title="Refresh"></
                <IconButton onClick={() => handleSearch()} 
                    disabled={loading}
                >
                    <RefreshIcon /></RefreshIcon>
            </Tooltip>
        </Box>
    );
};

export default CegidToolbar;