import React from 'react';
import GridPage from '../components/common/GridPage';
import { Description as DescriptionIcon } from '@mui/icons-material';

const CmsPagesPage = () => {
  return (
    <GridPage
      title="CMS Pages"
      description="Content management system pages"
      icon={DescriptionIcon}
      tabId="CmsPageGrid"
    />
  );
};

export default CmsPagesPage;