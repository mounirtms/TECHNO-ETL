/**
 * Bug Bounty Page
 * Main page for the bug bounty program
 *
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 */

import React, { useEffect } from 'react';
import GridPage from '../components/common/GridPage';
import { BugReport as BugReportIcon } from '@mui/icons-material';

const BugBountyPage = () => {
  return (
    <GridPage
      title="Bug Bounty"
      description="Bug reporting and tracking"
      icon={BugReportIcon}
      tabId="BugBounty"
    />
  );
};

export default BugBountyPage;
