/**
 * Bug Bounty Page
 * Main page for the bug bounty program
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 */

import React, { useEffect } from 'react';
import BugBountyDashboard from '../components/bugBounty/BugBountyDashboard.tsx';

const BugBountyPage = () => {
  // Set document title
  useEffect(() => {
    document.title = 'Bug Bounty Program - TECHNO-ETL';

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if(metaDescription) {
      metaDescription.setAttribute('content', 'Join our bug bounty program and help improve TECHNO-ETL while earning rewards for finding and reporting bugs.');
  }, []);

  return <BugBountyDashboard />;
};

export default BugBountyPage;
