import React from 'react';
import GridPage from '../components/common/GridPage';
import { AccountCircle as ProfileIcon } from '@mui/icons-material';

const UserProfilePage = () => {
  return (
    <GridPage
      title="User Profile"
      description="Manage your profile settings and preferences"
      icon={ProfileIcon}
      tabId="UserProfile"
    />
  );
};

export default UserProfilePage;
