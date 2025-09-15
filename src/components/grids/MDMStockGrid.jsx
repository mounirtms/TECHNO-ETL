import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import UnifiedGrid from '../common/UnifiedGrid';
import { StatsCards } from '../common/StatsCards';
import { toast } from 'react-toastify';
import InventoryIcon from '@mui/icons-material/Inventory';
import SyncIcon from '@mui/icons-material/Sync';
import { getStandardGridProps } from '../../config/standardGridConfig';

/**
 * MDMStockGrid Component
 * Displays and manages MDM stock data in a grid format
 */
const MDMStockGrid = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
  });

  // Column definitions
  const columns = useMemo(() => [
    {
      field: 'sku',
      headerName: 'SKU',
      width: 150,
      type: 'string',
    },
    {
      field: 'product_name',
      headerName: 'Product Name',
      width: 250,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 120,
    },
    {
      field: 'branch',
      headerName: 'Branch',
      width: 120,
    },
    {
      field: 'stock_quantity',
      headerName: 'Quantity',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const quantity = params.value || 0;
        let color = 'success.main';

        if (quantity === 0) {
          color = 'error.main';
        } else if (quantity < 10) {
          color = 'warning.main';
        }

        return (
          <Box sx={{
            color: color,
            fontWeight: 'bold',
          }}>
            {quantity}
          </Box>
        );
      },
    },
    {
      field: 'reserved_quantity',
      headerName: 'Reserved',
      width: 120,
      type: 'number',
    },
    {
      field: 'available_quantity',
      headerName: 'Available',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const quantity = params.value || 0;
        let color = 'success.main';

        if (quantity === 0) {
          color = 'error.main';
        } else if (quantity < 5) {
          color = 'warning.main';
        }

        return (
          <Box sx={{
            color: color,
            fontWeight: 'bold',
          }}>
            {quantity}
          </Box>
        );
      },
    },
    {
      field: 'last_updated',
      headerName: 'Last Updated',
      width: 180,
      type: 'date',
    },
  ], []);

  // Stats cards configuration
  const gridCards = useMemo(() => [
    {
      title: 'Total Products',
      value: stats.total,
      icon: InventoryIcon,
      color: 'primary',
      trend: 'up',
    },
    {
      title: 'In Stock',
      value: stats.inStock,
      icon: InventoryIcon,
      color: 'success',
      trend: 'up',
    },
    {
      title: 'Low Stock',
      value: stats.lowStock,
      icon: InventoryIcon,
      color: 'warning',
      trend: 'down',
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStock,
      icon: InventoryIcon,
      color: 'error',
      trend: 'down',
    },
  ], [stats]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockData = [
        { sku: 'SKU001', product_name: 'Smartphone XYZ', source: 'Source 7', branch: 'Branch 16', stock_quantity: 25, reserved_quantity: 5, available_quantity: 20, last_updated: '2023-06-15' },
        { sku: 'SKU002', product_name: 'Laptop ABC', source: 'Source 16', branch: 'Branch 20', stock_quantity: 0, reserved_quantity: 0, available_quantity: 0, last_updated: '2023-06-10' },
        { sku: 'SKU003', product_name: 'Headphones DEF', source: 'Source 20', branch: 'Branch 25', stock_quantity: 8, reserved_quantity: 2, available_quantity: 6, last_updated: '2023-06-18' },
        { sku: 'SKU004', product_name: 'Tablet GHI', source: 'Source 25', branch: 'Branch 30', stock_quantity: 15, reserved_quantity: 3, available_quantity: 12, last_updated: '2023-06-12' },
        { sku: 'SKU005', product_name: 'Smartwatch JKL', source: 'Source 7', branch: 'Branch 16', stock_quantity: 3, reserved_quantity: 1, available_quantity: 2, last_updated: '2023-06-17' },
        { sku: 'SKU006', product_name: 'Camera MNO', source: 'Source 16', branch: 'Branch 20', stock_quantity: 12, reserved_quantity: 2, available_quantity: 10, last_updated: '2023-06-14' },
        { sku: 'SKU007', product_name: 'Speaker PQR', source: 'Source 20', branch: 'Branch 25', stock_quantity: 0, reserved_quantity: 0, available_quantity: 0, last_updated: '2023-06-09' },
      ];

      setData(mockData);
      setStats({
        total: mockData.length,
        inStock: mockData.filter(item => item.available_quantity > 0).length,
        outOfStock: mockData.filter(item => item.available_quantity === 0).length,
        lowStock: mockData.filter(item => item.available_quantity > 0 && item.available_quantity < 5).length,
      });
    } catch (error) {
      console.error('Error loading stock data:', error);
      toast.error('Error loading stock data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle row click
  const handleRowClick = useCallback((params) => {
    console.log('Stock item clicked:', params.row);
    toast.info(`Product: ${params.row.product_name}`);
  }, []);

  // Handle sync
  const handleSync = useCallback(async () => {
    toast.info('Syncing stock data...');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Stock data synced successfully');
      handleRefresh();
    } catch (error) {
      console.error('Error syncing stock data:', error);
      toast.error('Error syncing stock data');
    }
  }, [handleRefresh]);

  // Initialize data
  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <UnifiedGrid
        {...getStandardGridProps('mdmstock', {
          gridName: 'MDMStockGrid',
          columns: columns,
          data: data,
          loading: loading,
          showStatsCards: true,
          gridCards: gridCards,
          totalCount: stats.total,

          // Event handlers
          onRefresh: handleRefresh,
          onRowClick: handleRowClick,
          onRowDoubleClick: (params) => {
            console.log('Stock item double-clicked:', params.row);
            // Handle stock item details view
          },
          customActions: [
            {
              id: 'sync',
              label: 'Sync Stock',
              icon: 'sync',
              onClick: handleSync,
              color: 'primary',
            },
          ],

          // Row configuration
          getRowId: (row) => row?.sku,
        })}
      />
    </Box>
  );
};

export default MDMStockGrid;
