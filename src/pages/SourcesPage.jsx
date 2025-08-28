import React from 'react';
import GridPage from '../components/common/GridPage';
import { Warehouse as WarehouseIcon } from '@mui/icons-material';

const SourcesPage = () => {
  return (
    <GridPage
      title="Sources"
      description="Warehouse and source management"
      icon={WarehouseIcon}
      tabId="SourcesGrid"
    />
  );
};

export default SourcesPage;