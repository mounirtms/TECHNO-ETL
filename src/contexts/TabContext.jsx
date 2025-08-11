import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material'; // Add Box import for error rendering
import { MENU_TREE, MENU_ITEMS } from '../components/Layout/MenuTree';

// Import components lazily to avoid circular dependencies
import { lazy } from 'react';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const CmsPageGrid = lazy(() => import('../components/grids/magento/CmsPagesGrid'));
const ProductsGrid = lazy(() => import('../components/grids/magento/ProductsGrid'));
const MDMProductsGrid = lazy(() => import('../components/grids/MDMProductsGrid/MDMProductsGrid'));
const CustomersGrid = lazy(() => import('../components/grids/magento/CustomersGrid'));
const OrdersGrid = lazy(() => import('../components/grids/magento/OrdersGrid'));
const InvoicesGrid = lazy(() => import('../components/grids/magento/InvoicesGrid'));
const UserProfile = lazy(() => import('../components/UserProfile'));
const CategoryTree = lazy(() => import('../components/grids/magento/CategoryGrid'));
const StocksGrid = lazy(() => import('../components/grids/magento/StocksGrid'));
const SourcesGrid = lazy(() => import('../components/grids/magento/SourcesGrid'));
const CegidGrid = lazy(() => import('../components/grids/CegidGrid'));
const GridTestPage = lazy(() => import('../pages/GridTestPage'));
const ProductManagementPage = lazy(() => import('../pages/ProductManagementPage'));
const VotingPage = lazy(() => import('../pages/VotingPage'));
const ChartsPage = lazy(() => import('../pages/ChartsPage'));
const BugBountyPage = lazy(() => import('../pages/BugBountyPage'));
const LicenseManagement = lazy(() => import('../components/License/LicenseManagement'));
const LicenseStatus = lazy(() => import('../components/License/LicenseStatus'));

// Lazy load placeholder components
const SalesAnalytics = lazy(() => import('../components/placeholders/PlaceholderComponents').then(module => ({ default: module.SalesAnalytics })));
const InventoryAnalytics = lazy(() => import('../components/placeholders/PlaceholderComponents').then(module => ({ default: module.InventoryAnalytics })));
const SecureVault = lazy(() => import('../components/placeholders/PlaceholderComponents').then(module => ({ default: module.SecureVault })));
const AccessControl = lazy(() => import('../components/placeholders/PlaceholderComponents').then(module => ({ default: module.AccessControl })));
const MDMStock = lazy(() => import('../components/placeholders/PlaceholderComponents').then(module => ({ default: module.MDMStock })));
const MDMSources = lazy(() => import('../components/placeholders/PlaceholderComponents').then(module => ({ default: module.MDMSources })));

// URL to Tab ID mapping
const URL_TO_TAB_MAP = {
    '/dashboard': 'Dashboard',
    '/charts': 'Charts',
    '/voting': 'Voting',
    '/products': 'ProductsGrid',
    '/productsManagement': 'ProductCatalog',
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
    '/bug-bounty': 'BugBounty',
    '/license-management': 'LicenseManagement',
    '/license': 'LicenseStatus',
    '/analytics/sales': 'SalesAnalytics',
    '/analytics/inventory': 'InventoryAnalytics',
    '/locker/vault': 'SecureVault',
    '/locker/access': 'AccessControl',
    '/mdm-stock': 'MDMStock',
    '/mdm-sources': 'MDMSources',
    '/profile': 'UserProfile'
};

// Tab ID to URL mapping
const TAB_TO_URL_MAP = Object.fromEntries(
    Object.entries(URL_TO_TAB_MAP).map(([url, tabId]) => [tabId, url])
);

// Component mapping
const COMPONENT_MAP = {
    Dashboard: Dashboard,
    Charts: ChartsPage,
    Voting: VotingPage,
    ProductsGrid: ProductsGrid,
    ProductCatalog: ProductManagementPage,
    MDMProductsGrid: MDMProductsGrid,
    CustomersGrid: CustomersGrid,
    OrdersGrid: OrdersGrid,
    InvoicesGrid: InvoicesGrid,
    CategoryTree: CategoryTree,
    StocksGrid: StocksGrid,
    SourcesGrid: SourcesGrid,
    CegidProductsGrid: CegidGrid,
    CmsPageGrid: CmsPageGrid,
    GridTestPage: GridTestPage,
    BugBounty: BugBountyPage,
    LicenseManagement: LicenseManagement,
    LicenseStatus: LicenseStatus,
    SalesAnalytics: SalesAnalytics,
    InventoryAnalytics: InventoryAnalytics,
    SecureVault: SecureVault,
    AccessControl: AccessControl,
    MDMStock: MDMStock,
    MDMSources: MDMSources,
    UserProfile: UserProfile
};

const TabContext = createContext();

export const TabProvider = ({ children, sidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get initial tab from current URL or default to Dashboard
    const getInitialTabFromURL = () => {
        const tabId = URL_TO_TAB_MAP[location.pathname];
        if (tabId) {
            const menuItem = MENU_ITEMS.find(item => item.id === tabId);
            if (menuItem) return menuItem;
        }
        return MENU_ITEMS.find(item => item.id === 'Dashboard') || MENU_ITEMS[0];
    };

    const initialTab = getInitialTabFromURL();

    const [tabs, setTabs] = useState([
        {
            id: initialTab.id,
            label: initialTab.label,
            component: initialTab.id,
            closeable: false
        }
    ]);
    const [activeTab, setActiveTab] = useState(initialTab.id);

    // Sync tab changes with URL
    useEffect(() => {
        const currentTabId = URL_TO_TAB_MAP[location.pathname];
        if (currentTabId && currentTabId !== activeTab) {
            // Skip navigation to prevent infinite loop
            const tabExists = tabs.some(tab => tab.id === currentTabId);
            if (!tabExists) {
                const newTab = MENU_ITEMS.find(item => item.id === currentTabId);
                if (newTab && COMPONENT_MAP[newTab.id]) {
    // Ensure activeTab is always valid
    useEffect(() => {
        const validTabIds = tabs.map(tab => tab.id);
        if (!validTabIds.includes(activeTab)) {
            setActiveTab(validTabIds.includes('Dashboard') ? 'Dashboard' : validTabIds[0]);
        }
    }, [activeTab, tabs]);

                    setTabs(prevTabs => [
                        ...prevTabs,
                        {
                            ...newTab,
                            closeable: newTab.id !== 'Dashboard'
                        }
                    ]);
                }
            }
            setActiveTab(currentTabId);
        }
    }, [location.pathname, activeTab, tabs]);

    const openTab = (tabId, skipNavigation = false) => {
        const tabExists = tabs.some(tab => tab.id === tabId);

        if (!tabExists) {
            const newTab = MENU_ITEMS.find(item => item.id === tabId);
            if (newTab) {
                if (!COMPONENT_MAP[newTab.id]) {
                    console.error(`No component found for tab: ${newTab.id}`);
                    return;
                }

                setTabs(prevTabs => [
                    ...prevTabs,
                    {
                        ...newTab,
                        closeable: newTab.id !== 'Dashboard' // Dashboard is never closeable
                    }
                ]);
            }
        }

        setActiveTab(tabId);

        // Navigate to corresponding URL if not skipping navigation
        if (!skipNavigation) {
            const url = TAB_TO_URL_MAP[tabId];
            if (url && location.pathname !== url) {
                navigate(url);
            }
        }
    };

    const closeTab = (tabId) => {
        if (tabId === 'Dashboard') return;

        setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));

        if (activeTab === tabId) {
            setActiveTab('Dashboard');
            navigate('/dashboard');
        }
    };

    const getActiveComponent = () => {
        const activeTabItem = tabs.find(tab => tab.id === activeTab);
        
        console.log('Active Tab Item:', activeTabItem); // Debugging log

        if (!activeTabItem) {
            console.warn(`No tab found for activeTab: ${activeTab}`);
            return () => (
                <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
                    No component found for this tab.
                </Box>
            );
        }

        const Component = COMPONENT_MAP[activeTabItem.id];
        
        console.log('Component:', Component); // Debugging log

        if (!Component) {
            console.warn(`No component mapped for tab: ${activeTabItem.id}`);
            return () => (
                <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
                    Component not found for {activeTabItem.label}
                </Box>
            );
        }

        return Component;
    };

    return (
        <TabContext.Provider value={{ 
            tabs, 
            activeTab, 
            openTab, 
            closeTab, 
            getActiveComponent 
        }}>
            {children}
        </TabContext.Provider>
    );
};

export const useTab = () => {
    const context = useContext(TabContext);
    if (!context) {
        throw new Error('useTab must be used within a TabProvider');
    }
    return context;
};