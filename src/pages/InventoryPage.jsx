import React, { useEffect, useState } from 'react';
import { Container, Paper, Alert, Typography, Chip, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Warning, Inventory } from '@mui/icons-material';
import InventoryGrid from '../components/grids/InventoryGrid';
import { useDashboardParams } from '../hooks/useHashParams';

const InventoryPage = () => {
  const {
    getFilter,
    getView,
    getSortBy,
    isAlert,
    isLowStockView,
    params,
  } = useDashboardParams();

  const [gridProps, setGridProps] = useState({});

  // Update grid props based on hash parameters
  useEffect(() => {
    const newProps = {
      initialFilter: getFilter(),
      initialView: getView(),
      initialSortBy: getSortBy(),
      showAlert: isAlert(),
      highlightLowStock: isLowStockView(),
      dashboardParams: params,
    };

    setGridProps(newProps);
  }, [getFilter, getView, getSortBy, isAlert, isLowStockView, params]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Low Stock Alert */}
        {isLowStockView() && (
          <Alert
            severity="warning"
            icon={<Warning />}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                Dashboard alert: Showing items with low stock levels that need immediate attention
              </Typography>
              <Chip
                label="Low Stock Alert"
                color="warning"
                size="small"
                icon={<Inventory />}
              />
            </Box>
          </Alert>
        )}

        {/* Inventory Grid */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <InventoryGrid {...gridProps} />
        </Paper>
      </Container>
    </motion.div>
  );
};

export default InventoryPage;
