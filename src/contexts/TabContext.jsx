import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { MENU_ITEMS } from '../components/Layout/MenuTree.js';

// Import components lazily to avoid circular dependencies
import { lazy } from 'react';

const Dashboard = lazy(() => import('../components/dashboard/ComprehensiveDashboard.jsx'));
const CmsPageGrid = lazy(() => import('../components/grids/magento/CmsPagesGrid.jsx'));
const ProductsGrid = lazy(() => import('../components/grids/magento/ProductsGrid.jsx'));
const MDMProductsGrid = lazy(() => import('../components/grids/MDMProductsGrid/MDMProductsGrid.jsx'));
const CustomersGrid = lazy(() => import('../components/grids/magento/CustomersGrid.jsx'));
const OrdersGrid = lazy(() => import('../components/grids/magento/OrdersGrid.jsx'));
const InvoicesGrid = lazy(() => import('../components/grids/magento/InvoicesGrid.jsx'));
const UserProfile = lazy(() => import('../components/UserProfile/index.jsx'));
const CategoryTree = lazy(() => import('../components/grids/magento/CategoryGrid.jsx'));
const StocksGrid = lazy(() => import('../components/grids/magento/StocksGrid.jsx'));
const MDMStockGrid = lazy(() => import('../components/grids/MDMStockGrid.jsx'));
const SourcesGrid = lazy(() => import('../components/grids/magento/SourcesGrid.jsx'));
const CegidGrid = lazy(() => import('../components/grids/CegidGrid.jsx'));
const GridTestPage = lazy(() => import('../pages/GridTestPage.jsx'));
const ProductManagementPage = lazy(() => import('../pages/ProductManagementPage.jsx'));
const VotingPage = lazy(() => import('../pages/VotingPage.jsx'));
const ChartsPage = lazy(() => import('../pages/ChartsPage.jsx'));
const BugBountyPage = lazy(() => import('../pages/BugBountyPage.jsx'));
const LicenseManagement = lazy(() => import('../components/License/LicenseManagement.jsx'));
const LicenseStatus = lazy(() => import('../components/License/LicenseStatus.jsx'));

// URL to Tab ID mapping
const URL_TO_TAB_MAP = {
  '/dashboard': 'Dashboard',
  '/charts': 'Charts',
  '/voting': 'Voting',
  '/products': 'ProductsGrid',
  '/mdmproducts': 'MDMProductsGrid',
  '/cegid-products': 'CegidProductsGrid',
  '/customers': 'CustomersGrid',
  '/orders': 'OrdersGrid',
  '/invoices': 'InvoicesGrid',
  '/categories': 'CategoryTree',
  '/stocks': 'StocksGrid',
  '/sources': 'SourcesGrid',
  '/cms-pages': 'CmsPageGrid',
  '/grid-test': 'GridTestPage',
  '/bug-bounty': 'BugBountyPage',
  '/license-management': 'LicenseManagement',
  '/license': 'LicenseStatus',
  '/mdm-stock': 'MDMStockGrid',
  '/profile': 'UserProfile',
  '/settings': 'UserProfile',
  '/tasks': 'Voting'
};

// Tab ID to URL mapping
const TAB_TO_URL_MAP = Object.keys(URL_TO_TAB_MAP).reduce((acc, url) => {
  acc[URL_TO_TAB_MAP[url]] = url;
  return acc;
}, {});

// Component mapping
const COMPONENT_MAP = {
  Dashboard,
  Charts: ChartsPage,
  Voting: VotingPage,
  ProductsGrid,
  MDMProductsGrid,
  CegidProductsGrid: CegidGrid,
  CustomersGrid,
  OrdersGrid,
  InvoicesGrid,
  CategoryTree,
  StocksGrid,
  SourcesGrid,
  CmsPageGrid,
  GridTestPage,
  BugBountyPage,
  LicenseManagement,
  LicenseStatus,
  MDMStockGrid,
  UserProfile,
};

const TabContext = createContext();

export const TabProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tabs, setTabs] = useState([
    { id: 'Dashboard', label: 'Dashboard', closeable: false }
  ]);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Get component for active tab
  const getActiveComponent = useCallback(() => {
    const component = COMPONENT_MAP[activeTab];
    return component || Dashboard;
  }, [activeTab]);

  // Open a new tab
  const openTab = useCallback((tabId) => {
    if (!tabId || typeof tabId !== 'string') {
      console.warn('Invalid tabId provided to openTab:', tabId);
      return;
    }

    // Get URL for tab
    const url = TAB_TO_URL_MAP[tabId];
    if (!url) {
      console.warn('No URL mapping found for tabId:', tabId);
      return;
    }

    // Check if tab already exists
    const tabExists = tabs.some(tab => tab.id === tabId);
    
    if (!tabExists) {
      // Get label for tab
      const menuItem = MENU_ITEMS.find(item => item.id === tabId);
      const label = menuItem ? menuItem.label : tabId;
      
      // Add new tab
      setTabs(prevTabs => [
        ...prevTabs,
        { id: tabId, label, closeable: tabId !== 'Dashboard' }
      ]);
    }

    // Set as active tab
    setActiveTab(tabId);
    
    // Navigate to URL only if it's different from current
    if (location.pathname !== url) {
      navigate(url, { replace: true });
    }
  }, [tabs, location.pathname, navigate]);

  // Close a tab
  const closeTab = useCallback((tabId) => {
    // Prevent closing Dashboard tab
    if (tabId === 'Dashboard') return;

    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // If we're closing the active tab, switch to Dashboard
      if (activeTab === tabId) {
        setActiveTab('Dashboard');
        const dashboardUrl = TAB_TO_URL_MAP['Dashboard'] || '/dashboard';
        navigate(dashboardUrl);
      }
      
      return newTabs;
    });
  }, [activeTab, navigate]);

  // Handle route changes and ensure Dashboard is always first
  useEffect(() => {
    // Always ensure Dashboard is the first tab
    if (tabs.length === 0 || tabs[0].id !== 'Dashboard') {
      setTabs(prevTabs => {
        const dashboardTab = { id: 'Dashboard', label: 'Dashboard', closeable: false };
        const otherTabs = prevTabs.filter(tab => tab.id !== 'Dashboard');
        return [dashboardTab, ...otherTabs];
      });
    }

    // Find matching tab for current URL
    const matchingTabId = URL_TO_TAB_MAP[location.pathname];
    
    if (matchingTabId && matchingTabId !== activeTab) {
      // Open the matching tab
      openTab(matchingTabId);
    } else if ((location.pathname === '/' || location.pathname === '/dashboard') && activeTab !== 'Dashboard') {
      // Special case for root path or dashboard - ensure Dashboard is active
      setActiveTab('Dashboard');
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location.pathname, openTab, activeTab, tabs, navigate]);

  // Initialize with Dashboard tab on mount
  useEffect(() => {
    if (tabs.length === 0) {
      setTabs([{ id: 'Dashboard', label: 'Dashboard', closeable: false }]);
      setActiveTab('Dashboard');
    }
  }, []);

  // Provide value to context
  const value = {
    tabs,
    activeTab,
    openTab,
    closeTab,
    getActiveComponent,
  };

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    // Return default values if context is not available
    return {
      tabs: [{ id: 'Dashboard', label: 'Dashboard', closeable: false }],
      activeTab: 'Dashboard',
      openTab: () => {},
      closeTab: () => {},
      getActiveComponent: () => Dashboard,
    };
  }
  return context;
};