import React, { useEffect, useState } from 'react';
import { Container, Paper, Alert, Typography, Chip, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { People } from '@mui/icons-material';
import CustomersGrid from '../components/grids/CustomersGrid';
import { useDashboardParams } from '../hooks/useHashParams';

const CustomersPage = () => {
  const {
    getStatus,
    getView,
    getSortBy,
    params,
  } = useDashboardParams();

  const [gridProps, setGridProps] = useState({});

  // Update grid props based on hash parameters
  useEffect(() => {
    const newProps = {
      initialStatus: getStatus(),
      initialView: getView(),
      initialSortBy: getSortBy(),
      dashboardParams: params,
    };

    setGridProps(newProps);
  }, [getStatus, getView, getSortBy, params]);

  const hasParams = Object.keys(params).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Dashboard Context Alert */}
        {hasParams && (
          <Alert
            severity="info"
            icon={<People />}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                Dashboard navigation: Viewing customers
              </Typography>
              {getStatus() !== 'all' && (
                <Chip
                  label={`Status: ${getStatus()}`}
                  color="primary"
                  size="small"
                />
              )}
              {getSortBy() !== 'name' && (
                <Chip
                  label={`Sorted by: ${getSortBy()}`}
                  color="secondary"
                  size="small"
                />
              )}
            </Box>
          </Alert>
        )}

        {/* Customers Grid */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <CustomersGrid {...gridProps} />
        </Paper>
      </Container>
    </motion.div>
  );
};

export default CustomersPage;
