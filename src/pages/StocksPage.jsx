import React from 'react';
import GridPage from '../components/common/GridPage';
import { Inventory2 as InventoryIcon } from '@mui/icons-material';

const StocksPage = () => {
  return (
    <GridPage
      title="Stocks"
      description="Inventory and stock management"
      icon={InventoryIcon}
      tabId="StocksGrid"
    />
  );
};

export default StocksPage;