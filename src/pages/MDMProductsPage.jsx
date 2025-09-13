import React from 'react';
import GridPage from '../components/common/GridPage';
import { Inventory as InventoryIcon } from '@mui/icons-material';

const MDMProductsPage = () => {
  return (
    <GridPage
      title="MDM Products"
      description="Master Data Management for products across all channels"
      icon={InventoryIcon}
      tabId="MDMProductsGrid"
    />
  );
};

export default MDMProductsPage;