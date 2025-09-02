import React, { useState, useCallback, Suspense } from 'react';
import { 
  Description as DescriptionIcon,
  Article,
  ViewModule,
  Settings as SettingsIcon,
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import EnhancedGridPage from '../components/common/EnhancedGridPage';
import { toast } from 'react-toastify';

// Lazy load the grid components
const CmsPagesGrid = React.lazy(() => import('../components/grids/magento/EnhancedCmsPagesGrid'));
const CmsBlocksGrid = React.lazy(() => import('../components/grids/magento/CmsBlocksGrid'));

const CmsPagesPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([
    { label: 'Total Pages', value: '0', color: 'primary' },
    { label: 'Active Pages', value: '0', color: 'success' },
    { label: 'Draft Pages', value: '0', color: 'warning' },
    { label: 'Total Blocks', value: '0', color: 'info' }
  ]);

  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab);
    setError(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate refresh - in real implementation, this would refetch data
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Content refreshed successfully');
    } catch (err) {
      setError('Failed to refresh content');
      toast.error('Failed to refresh content');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSettings = useCallback(() => {
    toast.info('Settings panel will be implemented soon');
  }, []);

  const handleAdd = useCallback(() => {
    if (activeTab === 0) {
      toast.info('Add new CMS page');
    } else {
      toast.info('Add new CMS block');
    }
  }, [activeTab]);

  const handleFilter = useCallback(() => {
    toast.info('Filter panel will be implemented soon');
  }, []);

  const tabs = [
    {
      id: 'pages',
      label: 'CMS Pages',
      icon: <Article />,
      content: (
        <Suspense fallback={<div>Loading CMS Pages...</div>}>
          <CmsPagesGrid />
        </Suspense>
      )
    },
    {
      id: 'blocks',
      label: 'CMS Blocks',
      icon: <ViewModule />,
      content: (
        <Suspense fallback={<div>Loading CMS Blocks...</div>}>
          <CmsBlocksGrid />
        </Suspense>
      )
    }
  ];

  const actions = [
    {
      label: 'Export',
      variant: 'outlined',
      onClick: () => toast.info('Export functionality coming soon'),
      color: 'secondary'
    },
    {
      label: 'Import',
      variant: 'outlined',
      onClick: () => toast.info('Import functionality coming soon'),
      color: 'secondary'
    }
  ];

  return (
    <EnhancedGridPage
      title="CMS Pages"
      description="Manage content management system pages and blocks"
      icon={DescriptionIcon}
      tabs={tabs}
      defaultTab={activeTab}
      onTabChange={handleTabChange}
      loading={loading}
      error={error}
      stats={stats}
      actions={actions}
      showRefreshButton={true}
      showSettingsButton={true}
      showFullscreenButton={true}
      showAddButton={true}
      showFilterButton={true}
      onRefresh={handleRefresh}
      onSettings={handleSettings}
      onAdd={handleAdd}
      onFilter={handleFilter}
    />
  );
};

export default CmsPagesPage;