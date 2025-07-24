/**
 * Customers Grid Component
 * Displays customer data in a grid format
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Mock customer data
const mockCustomers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    status: 'active',
    orders: 15,
    totalSpent: '$2,450.00',
    avatar: null
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 987-6543',
    location: 'Los Angeles, CA',
    status: 'active',
    orders: 8,
    totalSpent: '$1,230.00',
    avatar: null
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'mike.brown@example.com',
    phone: '+1 (555) 456-7890',
    location: 'Chicago, IL',
    status: 'inactive',
    orders: 3,
    totalSpent: '$567.00',
    avatar: null
  }
];

const CustomersGrid = ({
  data,
  onDataChange,
  onBadgeUpdate,
  initialStatus = 'all',
  initialView = 'grid',
  initialSortBy = 'name',
  dashboardParams = {}
}) => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortBy, setSortBy] = useState(initialSortBy);

  // Update state when initial props change (from hash parameters)
  useEffect(() => {
    console.log('CustomersGrid: Setting initial state from props:', {
      initialStatus,
      initialSortBy,
      dashboardParams
    });
    setStatusFilter(initialStatus);
    setSortBy(initialSortBy);
  }, [initialStatus, initialSortBy, dashboardParams]);

  // Filter customers based on search query and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'email':
        return a.email.localeCompare(b.email);
      case 'orders':
        return b.orders - a.orders;
      case 'spent':
        return parseFloat(b.totalSpent.replace('$', '').replace(',', '')) -
               parseFloat(a.totalSpent.replace('$', '').replace(',', ''));
      default:
        return 0;
    }
  });

  // Update badge count for active customers
  useEffect(() => {
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    onBadgeUpdate?.(activeCustomers);
  }, [customers, onBadgeUpdate]);

  const handleAddCustomer = () => {
    console.log('Add new customer');
  };

  const handleEditCustomer = (customerId) => {
    console.log('Edit customer:', customerId);
  };

  const handleDeleteCustomer = (customerId) => {
    console.log('Delete customer:', customerId);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2">
          {t('Customer Management')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCustomer}
        >
          {t('Add Customer')}
        </Button>
      </Stack>

      {/* Dashboard Context Alert */}
      {Object.keys(dashboardParams).length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Dashboard navigation: Viewing customers
            {statusFilter !== 'all' && (
              <Chip
                label={`Status: ${statusFilter}`}
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
          placeholder={t('Search customers...')}
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
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="orders">Orders</MenuItem>
            <MenuItem value="spent">Total Spent</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Customers Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} sx={{ height: 'fit-content' }}>
            <CardContent>
              <Stack spacing={2}>
                {/* Customer Header */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {customer.avatar || <PersonIcon />}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {customer.name}
                    </Typography>
                    <Chip
                      label={customer.status}
                      color={customer.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title={t('Edit')}>
                      <IconButton size="small" onClick={() => handleEditCustomer(customer.id)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('Delete')}>
                      <IconButton size="small" onClick={() => handleDeleteCustomer(customer.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                {/* Customer Details */}
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {customer.email}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {customer.phone}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {customer.location}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Customer Stats */}
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('Orders')}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {customer.orders}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('Total Spent')}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {customer.totalSpent}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? t('No customers found') : t('No customers yet')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? t('Try adjusting your search') : t('Add your first customer to get started')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CustomersGrid;
