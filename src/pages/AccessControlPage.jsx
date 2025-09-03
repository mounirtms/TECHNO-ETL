import React from 'react';
import GridPage from '../components/common/GridPage';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

const AccessControlPage = () => {
  return (
    <GridPage
      title="Access Control"
      description="User access management"
      icon={AdminIcon}
      tabId="AccessControl"
    />
  );
};

export default AccessControlPage;
