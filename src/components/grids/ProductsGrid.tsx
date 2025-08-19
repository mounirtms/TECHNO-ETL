/**
 * Products Grid Component
 * Displays product data in a grid format
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Avatar
} from '@mui/material';
import {
  Inventory as ProductIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Mock product data
const mockProducts = [
  {
    id: 'PROD-001',
    name: 'Wireless Bluetooth Headphones',
    category: 'Electronics',
    price: '$99.99',
    stock: 45,
    status: 'active',
    rating: 4.5,
    image: null,
    description: 'High-quality wireless headphones with noise cancellation',
    sku: 'WBH-001'
  },
  {
    id: 'PROD-002',
    name: 'Ergonomic Office Chair',
    category: 'Furniture',
    price: '$299.99',
    stock: 12,
    status: 'active',
    rating: 4.8,
    image: null,
    description: 'Comfortable ergonomic chair for office use',
    sku: 'EOC-002'
  },
  {
    id: 'PROD-003',
    name: 'Stainless Steel Water Bottle',
    category: 'Home & Garden',
    price: '$24.99',
    stock: 0,
    status: 'out_of_stock',
    rating: 4.2,
    image: null,
    description: 'Insulated water bottle keeps drinks cold for 24 hours',
    sku: 'SSWB-003'
  },
  {
    id: 'PROD-004',
    name: 'Laptop Stand Adjustable',
    category: 'Electronics',
    price: '$49.99',
    stock: 28,
    status: 'active',
    rating: 4.6,
    image: null,
    description: 'Adjustable aluminum laptop stand for better ergonomics',
    sku: 'LSA-004'
  },
  {
    id: 'PROD-005',
    name: 'Organic Cotton T-Shirt',
    category: 'Clothing',
    price: '$19.99',
    stock: 5,
    status: 'low_stock',
    rating: 4.3,
    image: null,
    description: 'Comfortable organic cotton t-shirt in various colors',
    sku: 'OCT-005'
  }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'low_stock': return 'warning';
    case 'out_of_stock': return 'error';
    case 'discontinued': return 'default';
    default: return 'default';
  }
};

const getStockStatus = (stock) => {
  if (stock === 0) return 'out_of_stock';
  if (stock <= 10) return 'low_stock';
  return 'active';
};

const ProductsGrid = ({ data, onDataChange, onBadgeUpdate }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update badge count for low stock products
  useEffect(() => {
    const lowStockProducts = products.filter(p => p.stock <= 10 && p.stock > 0).length;
    onBadgeUpdate?.(lowStockProducts);
  }, [products, onBadgeUpdate]);

  const handleAddProduct = () => {
    console.log('Add new product');
  };

  const handleViewProduct = (productId) => {
    console.log('View product:', productId);
  };

  const handleEditProduct = (productId) => {
    console.log('Edit product:', productId);
  };

  const handleDeleteProduct = (productId) => {
    console.log('Delete product:', productId);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} sx={{ fontSize: 16, color: 'gold' }} />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" sx={{ fontSize: 16, color: 'gold', opacity: 0.5 }} />);
    }

    return stars;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2">
          {t('Product Catalog')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
        >
          {t('Add Product')}
        </Button>
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        placeholder={t('Search products...')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        sx={{ mb: 3 }}
      />

      {/* Products Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2 }}>
        {filteredProducts.map((product) => (
          <Card key={product.id} sx={{ height: 'fit-content' }}>
            {/* Product Image */}
            <CardMedia
              sx={{
                height: 200,
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {product.image ? (
                <img src={product.image} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%' }} />
              ) : (
                <ProductIcon sx={{ fontSize: 64, color: 'grey.400' }} />
              )}
            </CardMedia>

            <CardContent>
              <Stack spacing={2}>
                {/* Product Header */}
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      SKU: {product.sku}
                    </Typography>
                  </Box>
                  <Chip
                    label={product.status.replace('_', ' ')}
                    color={getStatusColor(product.status)}
                    size="small"
                  />
                </Stack>

                {/* Category */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CategoryIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {product.category}
                  </Typography>
                </Stack>

                {/* Rating */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {renderStars(product.rating)}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    ({product.rating})
                  </Typography>
                </Stack>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.description}
                </Typography>

                {/* Price and Stock */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {product.price}
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('Stock')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={product.stock === 0 ? 'error.main' : product.stock <= 10 ? 'warning.main' : 'success.main'}
                    >
                      {product.stock} {t('units')}
                    </Typography>
                  </Box>
                </Stack>

                {/* Actions */}
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Tooltip title={t('View Details')}>
                    <IconButton size="small" onClick={() => handleViewProduct(product.id)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Edit Product')}>
                    <IconButton size="small" onClick={() => handleEditProduct(product.id)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Delete Product')}>
                    <IconButton size="small" onClick={() => handleDeleteProduct(product.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ProductIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? t('No products found') : t('No products yet')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? t('Try adjusting your search') : t('Add your first product to get started')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProductsGrid;
