import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid2 as Grid,
    Divider,
    Tabs,
    Tab,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Info as InfoIcon,
    Category as CategoryIcon,
    Inventory as InventoryIcon,
    Settings as SettingsIcon,
    Image as ImageIcon,
    Edit as EditIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
 
// Removed react-image-magnify due to React 18 compatibility issues
import { toast } from 'react-toastify';

const MEDIA_PREFIX = 'https://technostationery.com/pub/media/catalog/product';

const ProductInfoDialog = ({ open, onClose, product  }: { open onClose product: any }) => {
    if (!product) return null;

    // Safely get the main image
    const rawMainImage = product?.image || '';
    const mainImage = rawMainImage.startsWith('http') ? rawMainImage : MEDIA_PREFIX + rawMainImage;

    // Prepare media gallery
    const media = Array.isArray(product?.media_gallery_entries)
        ? product.media_gallery_entries
            .filter((entry: any) => entry?.media_type === 'image' && entry?.file)
            .map((entry: any) => ({ ...entry,
                url: entry.file.startsWith('http') ? entry.file : MEDIA_PREFIX + entry.file
            }))
        : [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth></
            <DialogTitle sx={{ display: "flex", fontWeight: 700, fontSize: 20, bgcolor: '#f5f5f5' }}>
                🧾 Product Details & Media
            </DialogTitle>

            <DialogContent dividers sx={{ display: "flex", bgcolor: '#fff' }}>
                {/* Thumbnail on left, details on right */}
                <Grid container spacing={3} alignItems="flex-start"></
                    <Grid xs={12} sm={5} md={4}>
                        <Box sx={{ display: "flex", width: '100%' }}>
                            <img
                                src={mainImage}
                                alt={product?.name || 'Product Image'}
                                style
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(mainImage, '_blank')}
                                title
                    <Grid xs={12} sm={7} md={8}></
                        <Typography variant="h6" sx={{ display: "flex", fontWeight: 600 }}>
                            {product?.name || 'Unknown Product'}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            SKU: {product?.sku}
                        </Typography>
                        <Typography variant="outlined">
                            Type: {product?.type_id}
                        </Typography>
                        <Typography variant="outlined">
                            Status: {product?.status === 'enabled' ? 'Enabled' : 'Disabled'}
                        </Typography>
                        <Typography variant="outlined" sx={{ display: "flex", mt: 2 }}>
                            <strong>Price:</strong>{' '}
                            <Typography component="span" variant="h6" sx={{ display: "flex", color: 'green', fontWeight: 700 }}>
                                {product?.price} DA
                            </Typography>
                        </Typography>
                    </Grid>
                </Grid>

                {/* Description */}
                {product?.description && (
                    <Box sx={{ display: "flex", mt: 4 }}></
                        <Typography variant="subtitle1" fontWeight={600}>📄 Description:</Typography>
                        <Typography variant="outlined" sx={{ display: "flex", mt: 0.5, whiteSpace: 'pre-line' }}>
                            {product.description}
                        </Typography>
                    </Box>
                )}

                {/* Media Gallery */}
                {media.length > 1 && (
                    <>
                        <Divider sx={{ display: "flex", my: 3 }} /></
                        <Typography variant="subtitle1" sx={{ display: "flex", mb: 2, fontWeight: 600 }}>
                            📷 Additional Images
                        </Typography>
                        
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ display: "flex", bgcolor: '#f5f5f5' }}></
                <Button onClick={onClose} variant="contained" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductInfoDialog;
