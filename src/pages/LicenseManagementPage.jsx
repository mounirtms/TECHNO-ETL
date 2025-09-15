import React from 'react';
import GridPage from '../components/common/GridPage';
import { VerifiedUser as LicenseIcon } from '@mui/icons-material';

const LicenseManagementPage = () => {
  return (
    <GridPage
      title="License Management"
      description="Manage and configure your software licenses"
      icon={LicenseIcon}
      tabId="LicenseManagement"
    />
  );
};

export default LicenseManagementPage;
