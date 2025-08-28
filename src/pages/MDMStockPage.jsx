import React from 'react';
import GridPage from '../components/common/GridPage';
import { Inventory2 as InventoryIcon } from '@mui/icons-material';

const MDMStockPage = () => {
  return (
    <GridPage
      title="MDM Stock"
      description="Master Data Management for stock levels across all channels"
      icon={InventoryIcon}
      tabId="MDMStock"
    />
  );
};

export default MDMStockPage;