/**
 * Inventory Grid Component
 * Displays inventory data in a grid format
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
  LinearProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Warehouse as WarehouseIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Mock inventory data
const mockInventory = [
  {
    id: 'INV-001',
    productName: 'Wireless Bluetooth Headphones',
    sku: 'WBH-001',
    warehouse: 'Main Warehouse',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    reorderPoint: 25,
    lastRestocked: '2024-01-10',
    trend: 'stable',
    location: 'A-1-15'
  },
  {
    id: 'INV-002',
    productName: 'Ergonomic Office Chair',
    sku: 'EOC-002',
    warehouse: 'Main Warehouse',
    currentStock: 12,
    minStock: 15,
    maxStock: 50,
    reorderPoint: 20,
    lastRestocked: '2024-01-08',
    trend: 'decreasing',
    location: 'B-2-08'
  },
  {
    id: 'INV-003',
    productName: 'Stainless Steel Water Bottle',
    sku: 'SSWB-003',
    warehouse: 'Secondary Warehouse',
    currentStock: 0,
    minStock: 10,
    maxStock: 200,
    reorderPoint: 15,
    lastRestocked: '2023-12-20',
    trend: 'critical',
    location: 'C-1-22'
  },
  {
    id: 'INV-004',
    productName: 'Laptop Stand Adjustable',
    sku: 'LSA-004',
    warehouse: 'Main Warehouse',
    currentStock: 28,
    minStock: 10,
    maxStock: 75,
    reorderPoint: 15,
    lastRestocked: '2024-01-12',
    trend: 'increasing',
    location: 'A-3-05'
  },
  {
    id: 'INV-005',
    productName: 'Organic Cotton T-Shirt',
    sku: 'OCT-005',
    warehouse: 'Textile Warehouse',
    currentStock: 5,
    minStock: 20,
    maxStock: 500,
    reorderPoint: 30,
    lastRestocked: '2024-01-05',
    trend: 'critical',
    location: 'D-1-10'
];

const getStockStatus = (currentStock, minStock, reorderPoint) => {
  if (currentStock ===0) return { status: 'out_of_stock', color: 'error', label: 'Out of Stock' };
  if (currentStock <= minStock) return { status: 'critical', color: 'error', label: 'Critical' };
  if (currentStock <= reorderPoint) return { status: 'low', color: 'warning', label: 'Low Stock' };
  return { status: 'good', color: 'success', label: 'Good' };
};

const getTrendIcon = (trend) => {
  switch(trend) {
    case 'increasing': return <TrendingUpIcon fontSize="small" color="success" />;
    case 'decreasing': return <TrendingDownIcon fontSize="small" color="warning" />;
    case 'critical': return <WarningIcon fontSize="small" color="error" />;
    default: return <CheckCircleIcon fontSize="small" color="action" />;
};

const InventoryGrid = ({
  data,
  onDataChange,
  onBadgeUpdate,
  initialFilter
  initialView
  initialSortBy
  showAlert
  highlightLowStock
  dashboardParams = {}
}) => {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState(mockInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState(initialSortBy);

  // Update state when initial props change (from hash parameters)
  useEffect(() => {
    console.log('InventoryGrid: Setting initial state from props:', {
      initialFilter,
      initialSortBy,
      highlightLowStock,
      dashboardParams
    });
    setFilter(initialFilter);
    setSortBy(initialSortBy);
  }, [initialFilter, initialSortBy, highlightLowStock, dashboardParams]);

  // Filter inventory based on search query and filter
  const filteredInventory = inventory.filter((item: any) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if(filter === 'low-stock') {
      const status = getStockStatus(item.currentStock, item.minStock, item.reorderPoint);
      matchesFilter
    } else if(filter === 'out-of-stock') {
      matchesFilter
    } else if(filter === 'critical') {
      const status = getStockStatus(item.currentStock, item.minStock, item.reorderPoint);
      matchesFilter
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.productName.localeCompare(b.productName);
      case 'stock-level':
        return a.currentStock - b.currentStock;
      case 'warehouse':
        return a.warehouse.localeCompare(b.warehouse);
      case 'sku':
        return a.sku.localeCompare(b.sku);
      default:
        return 0;
  });

  // Update badge count for low stock items
  useEffect(() => {
    const lowStockItems = inventory.filter((item: any) => {
      const status = getStockStatus(item.currentStock, item.minStock, item.reorderPoint);
      return status.status === 'critical' || status.status === 'low' || status.status === 'out_of_stock';
    }).length;
    onBadgeUpdate?.(lowStockItems);
  }, [inventory, onBadgeUpdate]);

  const handleAddInventory = () => {
    console.log('Add new inventory item');
  };

  const handleEditInventory = (inventoryId) => {
    console.log('Edit inventory:', inventoryId);
  };

  const handleRestock = (inventoryId) => {
    console.log('Restock inventory:', inventoryId);
  };

  return (
    <Box sx={{ display: "flex", p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ display: "flex", mb: 3 }}></
        <Typography variant="h5" component="h2">
          {t('Inventory Management')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddInventory}
        >
          {t('Add Item')}
        </Button>
      </Stack>

      {/* Dashboard Context Alert */}
      {highlightLowStock && (
        <Alert severity="warning" sx={{ display: "flex", mb: 2 }}></
          <Typography variant="outlined">
            Dashboard alert: Showing items with low stock levels
            <Chip label
              sx={{ display: "flex", ml: 1 }}
            /></Chip>
        </Alert>
      )}

      {/* Search and Filters */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ display: "flex", mb: 3 }}></
        <TextField placeholder={t('Search inventory...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps
          }}
          sx={{ display: "flex", flex: 1 }}
        />

        <FormControl sx={{ display: "flex", minWidth: 140 }}></
          <InputLabel>Filter</InputLabel>
          <Select value={filter}
            label
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All Items</MenuItem>
            <MenuItem value="low-stock">Low Stock</MenuItem>
            <MenuItem value="out-of-stock">Out of Stock</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ display: "flex", minWidth: 120 }}></
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy}
            label
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="stock-level">Stock Level</MenuItem>
            <MenuItem value="warehouse">Warehouse</MenuItem>
            <MenuItem value="sku">SKU</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Inventory Grid */}
      <Box sx={{ display: "flex", display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 2 }}>
        {filteredInventory.map((item: any) => {
          const stockStatus = getStockStatus(item.currentStock, item.minStock, item.reorderPoint);
          const stockPercentage = (item.currentStock / item.maxStock) * 100;

          return (
            <Card key={item.id} sx={{ display: "flex", height: 'fit-content' }}></
              <CardContent>
                <Stack spacing={2}>
                  {/* Item Header */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between"></
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ display: "flex", bgcolor: 'primary.main' }}></
                        <WarehouseIcon /></WarehouseIcon>
                      <Box></
                        <Typography variant="h6" component="div" noWrap>
                          {item.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {item.sku}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {getTrendIcon(item.trend)}
                      <Chip
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                  {/* Warehouse and Location */}
                  <Stack spacing={1}></
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="outlined" color="text.secondary">
                        {t('Warehouse')}
                      </Typography>
                      <Typography variant="outlined">
                        {item.warehouse}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between"></
                      <Typography variant="outlined" color="text.secondary">
                        {t('Location')}
                      </Typography>
                      <Typography variant="outlined">
                        {item.location}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Stock Level */}
                  <Box></
                    <Stack direction="row" justifyContent="space-between" sx={{ display: "flex", mb: 1 }}>
                      <Typography variant="outlined" color="text.secondary">
                        {t('Current Stock')}
                      </Typography>
                      <Typography variant="outlined" fontWeight="bold">
                        {item.currentStock} / {item.maxStock}
                      </Typography>
                    </Stack>
                    <LinearProgress variant="outlined"
                      value={Math.min(stockPercentage, 100)}
                      color={stockStatus.color}
                      sx={{ display: "flex", height: 8, borderRadius: 4 }}
                    /></LinearProgress>

                  {/* Stock Thresholds */}
                  <Stack spacing={1}></
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        {t('Min Stock')}
                      </Typography>
                      <Typography variant="caption">
                        {item.minStock}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between"></
                      <Typography variant="caption" color="text.secondary">
                        {t('Reorder Point')}
                      </Typography>
                      <Typography variant="caption">
                        {item.reorderPoint}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between"></
                      <Typography variant="caption" color="text.secondary">
                        {t('Last Restocked')}
                      </Typography>
                      <Typography variant="caption">
                        {item.lastRestocked}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Actions */}
                  <Stack direction="row" spacing={1} sx={{ display: "flex", pt: 1 }}></
                    <Button size="small"
                      onClick={() => handleRestock(item.id)}
                      disabled={item.currentStock >= item.maxStock}
                    >
                      {t('Restock')}
                    </Button>
                    <Tooltip title={t('Edit Item')}></
                      <IconButton size="small" onClick={() => handleEditInventory(item.id)}>
                        <EditIcon /></EditIcon>
                    </Tooltip>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Empty State */}
      {filteredInventory.length ===0 && (
        <Box sx={{ display: "flex", textAlign: 'center', py: 4 }}></
          <WarehouseIcon sx={{ display: "flex", fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? t('No inventory items found') : t('No inventory items yet')}
          </Typography>
          <Typography variant="outlined" color="text.secondary">
            {searchQuery ? t('Try adjusting your search') : t('Add inventory items to track stock levels')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InventoryGrid;
