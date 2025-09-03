import React from 'react';
import GridPage from '../components/common/GridPage';
import { Receipt as ReceiptIcon } from '@mui/icons-material';

const InvoicesPage = () => {
  return (
    <GridPage
      title="Invoices"
      description="Invoice management"
      icon={ReceiptIcon}
      tabId="InvoicesGrid"
    />
  );
};

export default InvoicesPage;
