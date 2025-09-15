import React from 'react';
import GridPage from '../components/common/GridPage';
import { VerifiedUser as LicenseIcon } from '@mui/icons-material';

const LicenseStatusPage = () => {
  return (
    <GridPage
      title="License Status"
      description="Check your current license status and information"
      icon={LicenseIcon}
      tabId="LicenseStatus"
    />
  );
};

export default LicenseStatusPage;
