import React from 'react';
import GridPage from '../components/common/GridPage';
import { Inventory2 as InventoryIcon } from '@mui/icons-material';

const InventoryAnalyticsPage = () => {
  return (
    <GridPage
      title="Inventory Analytics"
      description="Inventory performance analytics"
      icon={InventoryIcon}
      tabId="InventoryAnalytics"
    />
  );
};

export default InventoryAnalyticsPage;