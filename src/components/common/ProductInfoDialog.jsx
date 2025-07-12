import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    Divider
} from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import ReactImageMagnify from 'react-image-magnify';

const MEDIA_PREFIX = 'https://technostationery.com/pub/media/catalog/product';

const ProductInfoDialog = ({ open, onClose, product }) => {
    if (!product) return null;

    // Safely get the main image
    const rawMainImage = product?.image || '';
    const mainImage = rawMainImage.startsWith('http') ? rawMainImage : MEDIA_PREFIX + rawMainImage;

    // Prepare media gallery
    const media = Array.isArray(product?.media_gallery_entries)
        ? product.media_gallery_entries
            .filter(entry => entry?.media_type === 'image' && entry?.file)
            .map(entry => ({
                ...entry,
                url: entry.file.startsWith('http') ? entry.file : MEDIA_PREFIX + entry.file
            }))
        : [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: 20, bgcolor: '#f5f5f5' }}>
                🧾 Product Details & Media
            </DialogTitle>

            <DialogContent dividers sx={{ bgcolor: '#fff' }}>
                {/* Thumbnail on left, details on right */}
                <Grid container spacing={3} alignItems="flex-start">
                    <Grid item xs={12} sm={5} md={4}>
                        <Box sx={{ width: '100%' }}>
                            <ReactImageMagnify
                                {...{
                                    smallImage: {
                                        alt: product?.name || 'Product Image',
                                        isFluidWidth: true,
                                        src: mainImage
                                    },
                                    largeImage: {
                                        src: mainImage,
                                        width: 1000,
                                        height: 1000
                                    },
                                    enlargedImageContainerDimensions: {
                                        width: '180%',
                                        height: '180%'
                                    },
                                    lensStyle: { backgroundColor: 'rgba(0,0,0,.2)' }
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={7} md={8}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {product?.name || 'Unknown Product'}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            SKU: {product?.sku}
                        </Typography>
                        <Typography variant="body2">
                            Type: {product?.type_id}
                        </Typography>
                        <Typography variant="body2">
                            Status: {product?.status === 'enabled' ? 'Enabled' : 'Disabled'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            <strong>Price:</strong>{' '}
                            <Typography component="span" variant="h6" sx={{ color: 'green', fontWeight: 700 }}>
                                {product?.price} DA
                            </Typography>
                        </Typography>
                    </Grid>
                </Grid>

                {/* Description */}
                {product?.description && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle1" fontWeight={600}>📄 Description:</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                            {product.description}
                        </Typography>
                    </Box>
                )}

                {/* Media Gallery */}
                {media.length > 1 && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            📷 Additional Images
                        </Typography>
                        <Carousel
                            autoPlay={false}
                            navButtonsAlwaysVisible
                            animation="slide"
                            swipe
                            indicators
                            navButtonsProps={{
                                style: {
                                    backgroundColor: '#fff',
                                    color: '#333',
                                    borderRadius: 4
                                }
                            }}
                        >
                            {media.map((item, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        p: 2,
                                        border: '1px solid #eee',
                                        borderRadius: 2,
                                        background: '#fafafa'
                                    }}
                                >
                                    <img
                                        src={item.url}
                                        alt={item.label || ''}
                                        style={{ width: '100%', maxHeight: 250, objectFit: 'contain', borderRadius: 8 }}
                                    />
                                    <Typography variant="caption" sx={{ mt: 1 }} color="text.secondary">
                                        {item.label || item.file}
                                    </Typography>
                                </Box>
                            ))}
                        </Carousel>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ bgcolor: '#f5f5f5' }}>
                <Button onClick={onClose} variant="contained" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductInfoDialog;
