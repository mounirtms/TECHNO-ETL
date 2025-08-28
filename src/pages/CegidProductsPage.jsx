import React from 'react';
import GridPage from '../components/common/GridPage';
import { Storefront as StorefrontIcon } from '@mui/icons-material';

const CegidProductsPage = () => {
  return (
    <GridPage
      title="Cegid Products"
      description="Cegid product integration"
      icon={StorefrontIcon}
      tabId="CegidProductsGrid"
    />
  );
};

export default CegidProductsPage;