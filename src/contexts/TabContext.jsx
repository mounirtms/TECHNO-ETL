import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Alert, Snackbar } from '@mui/material';
import { MENU_ITEMS } from '../components/Layout/MenuTree.js';
import { usePermissions } from './PermissionContext.jsx';

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

// Create context with default values
const DEFAULT_TABS = [{ id: 'Dashboard', title: 'Dashboard', closeable: false }];
const TabContext = createContext({
    tabs: DEFAULT_TABS,
    activeTab: 'Dashboard',
    openTab: () => {},
    closeTab: () => {},
    getActiveComponent: () => null,
    setActiveTab: () => {}
});

// Custom hook with error handling
export const useTab = () => {
    try {
        const context = useContext(TabContext);
        if (!context) {
            throw new Error('useTab must be used within a TabProvider');
        }
        return context;
    } catch (error) {
        console.error('Error using tab context:', error);
        // Return a safe fallback context
        return {
            tabs: DEFAULT_TABS, 
            activeTab: 'Dashboard',
            openTab: () => {},
            closeTab: () => {},
            getActiveComponent: () => null,
            setActiveTab: () => {}
        };
    }
};

// Tab Provider Component
export const TabProvider = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { canAccessMenuItem } = usePermissions();
    
    // State for tabs and active tab - Dashboard is default
    const [tabs, setTabs] = useState(DEFAULT_TABS);
    const [activeTab, setActiveTabState] = useState('Dashboard');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    // Show snackbar message
    const showSnackbar = useCallback((message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    // Close snackbar
    const closeSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    // Memoize component mapping function
    const getComponentForTab = useCallback((tabId) => {
        const Component = COMPONENT_MAP[tabId];
        return Component ? <Component key={tabId} /> : null;
    }, []);

    // Memoize active component
    const getActiveComponent = useMemo(() => () => {
        if (!activeTab) return null;
        return getComponentForTab(activeTab);
    }, [activeTab, getComponentForTab]);

    // Open a new tab
    const openTab = useCallback((tabId, tabTitle, force = false) => {
        // Check if tab already exists
        const existingTab = tabs.find(tab => tab.id === tabId);
        
        if (existingTab && !force) {
            // Tab exists, just activate it
            setActiveTabState(tabId);
            const url = TAB_TO_URL_MAP[tabId] || '/';
            navigate(url);
            return;
        }

        // Check permissions for the tab
        if (tabId !== 'Dashboard' && !canAccessMenuItem({ id: tabId })) {
            showSnackbar(`Access denied to ${tabTitle}`, 'error');
            return;
        }

        // Add new tab
        const newTab = { 
            id: tabId, 
            title: tabTitle || tabId,
            closeable: tabId !== 'Dashboard' // Dashboard tab is not closeable
        };

        setTabs(prevTabs => {
            // If tab already exists, just activate it
            if (prevTabs.some(tab => tab.id === tabId)) {
                return prevTabs;
            }
            // Otherwise add the new tab
            return [...prevTabs, newTab];
        });
        
        setActiveTabState(tabId);
        const url = TAB_TO_URL_MAP[tabId] || '/';
        navigate(url);
    }, [tabs, navigate, canAccessMenuItem, showSnackbar]);

    // Close a tab
    const closeTab = useCallback((tabId) => {
        // Prevent closing the dashboard tab
        if (tabId === 'Dashboard') return;

        setTabs(prevTabs => {
            const newTabs = prevTabs.filter(tab => tab.id !== tabId);
            
            // If we're closing the active tab, activate the previous one or dashboard
            if (activeTab === tabId) {
                const currentIndex = prevTabs.findIndex(tab => tab.id === tabId);
                const newActiveTab = currentIndex > 0 
                    ? prevTabs[currentIndex - 1].id 
                    : newTabs.length > 0 
                        ? newTabs[newTabs.length - 1].id 
                        : 'Dashboard';
                
                setActiveTabState(newActiveTab);
                const url = TAB_TO_URL_MAP[newActiveTab] || '/';
                navigate(url);
            }
            
            return newTabs;
        });
    }, [activeTab, navigate]);

    // Handle route changes
    useEffect(() => {
        const currentPath = location.pathname;
        const tabId = URL_TO_TAB_MAP[currentPath];
        
        // Always ensure dashboard tab exists
        const dashboardTabIndex = tabs.findIndex(tab => tab.id === 'Dashboard');
        if (dashboardTabIndex === -1) {
            // Add dashboard tab if it doesn't exist
            const dashboardTab = { id: 'Dashboard', title: 'Dashboard', closeable: false };
            setTabs(prevTabs => [dashboardTab, ...prevTabs]);
            setActiveTabState('Dashboard');
            navigate('/dashboard');
            return;
        }
        
        if (tabId) {
            // Find tab title from menu items
            const menuItem = MENU_ITEMS.find(item => item.path === currentPath);
            const tabTitle = menuItem ? menuItem.label : tabId;
            
            // Open the tab
            openTab(tabId, tabTitle);
        } else if (currentPath !== '/dashboard') {
            // If we're on a non-dashboard route but tab is not mapped, redirect to dashboard
            navigate('/dashboard');
        }
    }, [location.pathname, openTab, tabs, navigate]);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        tabs,
        activeTab,
        openTab,
        closeTab,
        getActiveComponent,
        setActiveTab: setActiveTabState
    }), [tabs, activeTab, openTab, closeTab, getActiveComponent]);

    return (
        <TabContext.Provider value={contextValue}>
            {children}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={closeSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </TabContext.Provider>
    );
};

export default TabContext;