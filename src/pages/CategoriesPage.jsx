import React from 'react';
import GridPage from '../components/common/GridPage';
import { Category as CategoryIcon } from '@mui/icons-material';

const CategoriesPage = () => {
  return (
    <GridPage
      title="Categories"
      description="Product category management"
      icon={CategoryIcon}
      tabId="CategoryTree"
    />
  );
};

export default CategoriesPage;