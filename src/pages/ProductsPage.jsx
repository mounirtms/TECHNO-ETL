/**
 * Products Page - Simple product catalog view
 */
import React from 'react';
import { Container, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import ProductsGrid from '../components/grids/ProductsGrid';

const ProductsPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <ProductsGrid />
        </Paper>
      </Container>
    </motion.div>
  );
};

export default ProductsPage;
