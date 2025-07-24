/**
 * Orders Grid Component
 * Displays order data in a grid format
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Mock order data
const mockOrders = [
  {
    id: 'ORD-001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@example.com',
    status: 'pending',
    total: '$245.99',
    items: 3,
    date: '2024-01-15',
    shippingAddress: '123 Main St, New York, NY',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ORD-002',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@example.com',
    status: 'shipped',
    total: '$189.50',
    items: 2,
    date: '2024-01-14',
    shippingAddress: '456 Oak Ave, Los Angeles, CA',
    paymentMethod: 'PayPal'
  },
  {
    id: 'ORD-003',
    customerName: 'Michael Brown',
    customerEmail: 'mike.brown@example.com',
    status: 'delivered',
    total: '$567.25',
    items: 5,
    date: '2024-01-13',
    shippingAddress: '789 Pine St, Chicago, IL',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ORD-004',
    customerName: 'Emily Davis',
    customerEmail: 'emily.d@example.com',
    status: 'pending',
    total: '$123.75',
    items: 1,
    date: '2024-01-16',
    shippingAddress: '321 Elm St, Houston, TX',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'ORD-005',
    customerName: 'David Wilson',
    customerEmail: 'david.w@example.com',
    status: 'processing',
    total: '$89.99',
    items: 2,
    date: '2024-01-15',
    shippingAddress: '654 Maple Dr, Phoenix, AZ',
    paymentMethod: 'Credit Card'
  }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'shipped': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

const OrdersGrid = ({
  data,
  onDataChange,
  onBadgeUpdate,
  initialStatus = 'all',
  initialView = 'grid',
  initialSortBy = 'date',
  initialPriority = 'normal',
  highlightPending = false,
  dashboardParams = {}
}) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortBy, setSortBy] = useState(initialSortBy);

  // Update state when initial props change (from hash parameters)
  useEffect(() => {
    console.log('OrdersGrid: Setting initial state from props:', {
      initialStatus,
      initialSortBy,
      dashboardParams
    });
    setStatusFilter(initialStatus);
    setSortBy(initialSortBy);
  }, [initialStatus, initialSortBy, dashboardParams]);

  // Filter orders based on search query and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'amount':
        return parseFloat(b.total.replace('$', '')) - parseFloat(a.total.replace('$', ''));
      case 'customer':
        return a.customerName.localeCompare(b.customerName);
      default:
        return 0;
    }
  });

  // Update badge count for pending orders
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    onBadgeUpdate?.(pendingOrders);
  }, [orders, onBadgeUpdate]);

  const handleAddOrder = () => {
    console.log('Add new order');
  };

  const handleViewOrder = (orderId) => {
    console.log('View order:', orderId);
  };

  const handleEditOrder = (orderId) => {
    console.log('Edit order:', orderId);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2">
          {t('Order Management')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddOrder}
        >
          {t('New Order')}
        </Button>
      </Stack>

      {/* Dashboard Context Alert */}
      {highlightPending && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Dashboard navigation: Showing {statusFilter} orders
            {Object.keys(dashboardParams).length > 0 && (
              <Chip
                label={`${Object.keys(dashboardParams).length} filters active`}
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Alert>
      )}

      {/* Search and Filters */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder={t('Search orders...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ flex: 1 }}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="amount">Amount</MenuItem>
            <MenuItem value="customer">Customer</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Orders Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 2 }}>
        {filteredOrders.map((order) => (
          <Card key={order.id} sx={{ height: 'fit-content' }}>
            <CardContent>
              <Stack spacing={2}>
                {/* Order Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <OrderIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {order.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.date}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </Stack>

                {/* Customer Info */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {order.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.customerEmail}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                {/* Order Details */}
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('Total Amount')}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {order.total}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('Items')}
                    </Typography>
                    <Typography variant="body2">
                      {order.items} {t('items')}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Shipping Info */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ShippingIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {order.shippingAddress}
                  </Typography>
                </Stack>

                {/* Payment Info */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PaymentIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {order.paymentMethod}
                  </Typography>
                </Stack>

                {/* Actions */}
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Tooltip title={t('View Details')}>
                    <IconButton size="small" onClick={() => handleViewOrder(order.id)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Edit Order')}>
                    <IconButton size="small" onClick={() => handleEditOrder(order.id)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <OrderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? t('No orders found') : t('No orders yet')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? t('Try adjusting your search') : t('Orders will appear here once customers place them')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OrdersGrid;
