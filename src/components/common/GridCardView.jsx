import React from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Chip,
    IconButton,
    Tooltip,
    Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { formatDistanceToNow } from 'date-fns';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4]
    }
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    paddingTop: '75%', // 4:3 aspect ratio
    position: 'relative',
    backgroundColor: theme.palette.grey[200]
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1
}));

const InfoRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    '& svg': {
        fontSize: '1rem'
    }
}));

const GridCardView = ({ data = [], type = 'product' }) => {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'enabled':
            case 'in_stock':
                return 'success';
            case 'disabled':
            case 'out_of_stock':
                return 'error';
            default:
                return 'default';
        }
    };

    const renderProductCard = (item) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || item.sku}>
            <StyledCard>
                <Box sx={{ position: 'relative' }}>
                    <StyledCardMedia
                        image={item.image || 'https://via.placeholder.com/300x400?text=No+Image'}
                        title={item.name}
                    />
                    {item.status && (
                        <StyledChip
                            key={item.id || item.sku}
                            label={item.status}
                            color={getStatusColor(item.status)}
                            size="small"
                        />
                    )}
                </Box>
                <CardContent>
                    <Typography variant="h6" noWrap title={item.name}>
                        {item.name}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom noWrap>
                        SKU: {item.sku}
                    </Typography>
                    
                    <Stack spacing={1}>
                        <InfoRow>
                            <LocalOfferIcon />
                            <Typography variant="body2">
                                {item.price ? `$${parseFloat(item.price).toFixed(2)}` : 'N/A'}
                                {item.special_price && (
                                    <Typography component="span" color="error.main" sx={{ ml: 1 }}>
                                        ${parseFloat(item.special_price).toFixed(2)}
                                    </Typography>
                                )}
                            </Typography>
                        </InfoRow>
                        <InfoRow>
                            <InventoryIcon />
                            <Typography variant="body2">
                                Stock: {item.qty || 0} {item.is_in_stock ? '(In Stock)' : '(Out of Stock)'}
                            </Typography>
                        </InfoRow>
                        <InfoRow>
                            <CalendarTodayIcon />
                            <Typography variant="body2">
                                Added {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : 'Unknown'}
                            </Typography>
                        </InfoRow>
                    </Stack>
                </CardContent>
            </StyledCard>
        </Grid>
    );

    return (
        <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                {data.map(item => {
                    switch (type) {
                        case 'product':
                            return renderProductCard(item);
                        // Add more card types here as needed
                        default:
                            return renderProductCard(item);
                    }
                })}
                </Grid>
        </Box>
    );
};

export default GridCardView;
