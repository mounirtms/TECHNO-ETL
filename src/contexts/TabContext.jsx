import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { MENU_TREE, MENU_ITEMS } from '../components/Layout/MenuTree.js';

// Import components lazily to avoid circular dependencies
import { lazy } from 'react';

const Dashboard = lazy(() => import('../pages/Dashboard.jsx'));
const CmsPageGrid = lazy(() => import('../components/grids/magento/CmsPagesGrid.jsx'));
const ProductsGrid = lazy(() => import('../components/grids/magento/ProductsGrid.jsx'));
const MDMProductsGrid = lazy(() => import('../components/grids/MDMProductsGrid/MDMProductsGrid.jsx'));
const CustomersGrid = lazy(() => import('../components/grids/magento/CustomersGrid.jsx'));
const OrdersGrid = lazy(() => import('../components/grids/magento/OrdersGrid.jsx'));
const InvoicesGrid = lazy(() => import('../components/grids/magento/InvoicesGrid.jsx'));
const UserProfile = lazy(() => import('../components/UserProfile/index.jsx'));
const CategoryTree = lazy(() => import('../components/grids/magento/CategoryGrid.jsx'));
const CategoryManagementGrid = lazy(() => import('../components/grids/magento/CategoryManagementGrid.jsx'));
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

// Lazy load placeholder components
const SalesAnalytics = lazy(() => import('../components/placeholders/PlaceholderComponents.jsx').then(module => ({ default: module.SalesAnalytics })));
const InventoryAnalytics = lazy(() => import('../components/placeholders/PlaceholderComponents.jsx').then(module => ({ default: module.InventoryAnalytics })));
const SecureVault = lazy(() => import('../components/placeholders/PlaceholderComponents.jsx').then(module => ({ default: module.SecureVault })));
const AccessControl = lazy(() => import('../components/placeholders/PlaceholderComponents.jsx').then(module => ({ default: module.AccessControl })));
const MDMStock = lazy(() => import('../components/placeholders/PlaceholderComponents.jsx').then(module => ({ default: module.MDMStock })));
const MDMSources = lazy(() => import('../components/placeholders/PlaceholderComponents.jsx').then(module => ({ default: module.MDMSources })));

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
    '/category-management': 'CategoryManagementGrid',
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
    '/mdm-stock': 'MDMStockGrid',
    '/mdm-sources': 'MDMSources',
    '/profile': 'UserProfile'
};

// Tab ID to URL mapping
const TAB_TO_URL_MAP = Object.fromEntries(
    Object.entries(URL_TO_TAB_MAP).map(([url, tabId]) => [tabId, url])
);

export { TAB_TO_URL_MAP };

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
    CategoryManagementGrid: CategoryManagementGrid,
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
    MDMStockGrid: MDMStockGrid,
    MDMSources: MDMSources,
    UserProfile: UserProfile
};

// Safe context creation with error handling
const TabContext = (() => {
    try {
        const context = createContext();
        context.displayName = 'TabContext';
        return context;
    } catch (error) {
        console.error('Failed to create TabContext:', error);
        throw error;
    }
})();

export const TabProvider = ({ children, sidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get initial tab from current URL or default to Dashboard
    const getInitialTabFromURL = () => {
        // Ensure MENU_ITEMS is available and not empty
        if (!MENU_ITEMS || !Array.isArray(MENU_ITEMS) || MENU_ITEMS.length === 0) {
            console.warn('MENU_ITEMS is empty or undefined, creating default dashboard item');
            return {
                id: 'Dashboard',
                label: 'Dashboard',
                path: '/dashboard'
            };
        }
        
        const tabId = URL_TO_TAB_MAP[location.pathname];
        if (tabId) {
            const menuItem = MENU_ITEMS.find(item => item?.id === tabId);
            if (menuItem) return menuItem;
        }
        
        // Fallback to Dashboard from MENU_ITEMS
        const dashboardItem = MENU_ITEMS.find(item => item?.id === 'Dashboard');
        if (dashboardItem) return dashboardItem;
        
        // Create a default dashboard item if none found
        return {
            id: 'Dashboard',
            label: 'Dashboard',
            path: '/dashboard'
        };
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
        
        // If we have a valid tab ID from URL
        if (currentTabId) {
            const tabExists = tabs.some(tab => tab.id === currentTabId);
            
            // If tab doesn't exist, try to add it
            if (!tabExists) {
                const newTab = MENU_ITEMS.find(item => item.id === currentTabId);
                
                if (newTab && COMPONENT_MAP[newTab.id]) {
                    setTabs(prevTabs => [
                        ...prevTabs,
                        {
                            id: newTab.id,
                            label: newTab.label,
                            component: newTab.id,
                            closeable: newTab.id !== 'Dashboard'
                        }
                    ]);
                } else if (!tabExists) {
                    // Invalid tab, redirect to Dashboard only if no tabs exist
                    console.warn(`Invalid tab: ${currentTabId}, redirecting to Dashboard`);
                    if (tabs.length === 0) {
                        navigate('/dashboard');
                    }
                    return;
                }
            }
            
            // Set active tab only if it's different
            if (currentTabId !== activeTab) {
                setActiveTab(currentTabId);
            }
        } else if (tabs.length > 0 && !tabs.some(tab => tab.id === activeTab)) {
            // Emergency fallback - if activeTab is invalid, switch to first available tab
            const fallbackTab = tabs[0].id;
            setActiveTab(fallbackTab);
            const fallbackUrl = TAB_TO_URL_MAP[fallbackTab];
            if (fallbackUrl) {
                navigate(fallbackUrl);
            }
        }
    }, [location.pathname, navigate, activeTab, tabs]);

    const openTab = (tabId, skipNavigation = false) => {
        // Validate tabId
        if (!tabId) {
            console.error('Cannot open tab: tabId is undefined or null');
            return;
        }

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
                        id: newTab.id,
                        label: newTab.label,
                        component: newTab.id,
                        closeable: newTab.id !== 'Dashboard' // Dashboard is never closeable
                    }
                ]);
            } else {
                console.warn(`Tab ${tabId} not found in MENU_ITEMS`);
                return;
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
        // If no tabs, return a default component
        if (tabs.length === 0) {
            console.warn('No tabs available');
            return () => (
                <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
                    No tabs available.
                </Box>
            );
        }

        const activeTabItem = tabs.find(tab => tab.id === activeTab);
        
        // If activeTabItem not found, try to find the first tab as fallback
        if (!activeTabItem) {
            console.warn(`No tab found for activeTab: ${activeTab}`);
            const firstTab = tabs[0];
            if (firstTab) {
                // Try to set the first tab as active
                setActiveTab(firstTab.id);
                const Component = COMPONENT_MAP[firstTab.id];
                if (Component) {
                    return Component;
                }
            }
            return () => (
                <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
                    No component found for this tab.
                </Box>
            );
        }

        const Component = COMPONENT_MAP[activeTabItem.id];
        
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