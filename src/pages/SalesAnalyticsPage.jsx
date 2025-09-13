import React from 'react';
import GridPage from '../components/common/GridPage';
import { Analytics as AnalyticsIcon } from '@mui/icons-material';

const SalesAnalyticsPage = () => {
  return (
    <GridPage
      title="Sales Analytics"
      description="Sales performance analytics"
      icon={AnalyticsIcon}
      tabId="SalesAnalytics"
    />
  );
};

export default SalesAnalyticsPage;