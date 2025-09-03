import React from 'react';
import GridPage from '../components/common/GridPage';
import { Security as SecurityIcon } from '@mui/icons-material';

const SecureVaultPage = () => {
  return (
    <GridPage
      title="Secure Vault"
      description="Encrypted document storage"
      icon={SecurityIcon}
      tabId="SecureVault"
    />
  );
};

export default SecureVaultPage;
