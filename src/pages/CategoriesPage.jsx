import React, { useState, useCallback, Suspense } from 'react';
import { 
  Category as CategoryIcon,
  AccountTree,
  ViewList,
  Settings as SettingsIcon,
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import EnhancedGridPage from '../components/common/EnhancedGridPage';
import { toast } from 'react-toastify';

// Lazy load the grid components
const CategoryTree = React.lazy(() => import('../components/grids/magento/CategoryGrid'));
const CategoryManagementGrid = React.lazy(() => import('../components/grids/magento/CategoryManagementGrid'));

const CategoriesPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([
    { label: 'Total Categories', value: '0', color: 'primary' },
    { label: 'Active Categories', value: '0', color: 'success' },
    { label: 'Root Categories', value: '0', color: 'info' },
    { label: 'Sub Categories', value: '0', color: 'warning' }
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
      toast.success('Categories refreshed successfully');
    } catch (err) {
      setError('Failed to refresh categories');
      toast.error('Failed to refresh categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSettings = useCallback(() => {
    toast.info('Category settings panel will be implemented soon');
  }, []);

  const handleAdd = useCallback(() => {
    if (activeTab === 0) {
      toast.info('Add new category');
    } else {
      toast.info('Add new category with management features');
    }
  }, [activeTab]);

  const handleFilter = useCallback(() => {
    toast.info('Category filter panel will be implemented soon');
  }, []);

  const tabs = [
    {
      id: 'tree',
      label: 'Category Tree',
      icon: <AccountTree />,
      content: (
        <Suspense fallback={<div>Loading Category Tree...</div>}>
          <CategoryTree />
        </Suspense>
      )
    },
    {
      id: 'management',
      label: 'Category Management',
      icon: <ViewList />,
      content: (
        <Suspense fallback={<div>Loading Category Management...</div>}>
          <CategoryManagementGrid />
        </Suspense>
      )
    }
  ];

  const actions = [
    {
      label: 'Export Categories',
      variant: 'outlined',
      onClick: () => toast.info('Export categories functionality coming soon'),
      color: 'secondary'
    },
    {
      label: 'Import Categories',
      variant: 'outlined',
      onClick: () => toast.info('Import categories functionality coming soon'),
      color: 'secondary'
    }
  ];

  return (
    <EnhancedGridPage
      title="Categories"
      description="Manage product categories and hierarchy"
      icon={CategoryIcon}
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

export default CategoriesPage;