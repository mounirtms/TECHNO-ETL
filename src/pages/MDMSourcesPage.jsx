import React from 'react';
import GridPage from '../components/common/GridPage';
import { Warehouse as WarehouseIcon } from '@mui/icons-material';

const MDMSourcesPage = () => {
  return (
    <GridPage
      title="MDM Sources"
      description="Master Data Management for data sources and warehouse management"
      icon={WarehouseIcon}
      tabId="MDMSources"
    />
  );
};

export default MDMSourcesPage;
