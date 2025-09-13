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
const MDMProductsPage = lazy(() => import('../pages/MDMProductsPage.jsx'));

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
    '/mdm-products': 'MDMProductsPage',
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
    MDMProductsPage: MDMProductsPage,
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

// Create context with default values - Dashboard is always the first tab
const DEFAULT_TABS = [{ id: 'Dashboard', title: 'Dashboard', closeable: false }];
const DEFAULT_ACTIVE_TAB = 'Dashboard';

const TabContext = createContext({
    tabs: DEFAULT_TABS,
    activeTab: DEFAULT_ACTIVE_TAB,
    openTab: () => {},
    closeTab: () => {},
    getActiveComponent: () => null,
    setActiveTab: () => {}
});

// Navigation throttling to prevent excessive navigation
let navigationTimestamps = [];
const MAX_NAVIGATIONS_PER_SECOND = 10;

const isNavigationAllowed = () => {
    const now = Date.now();
    // Remove timestamps older than 1 second
    navigationTimestamps = navigationTimestamps.filter(timestamp => now - timestamp < 1000);
    
    // Check if we're under the limit
    if (navigationTimestamps.length < MAX_NAVIGATIONS_PER_SECOND) {
        navigationTimestamps.push(now);
        return true;
    }
    
    console.warn('Navigation throttled to prevent browser hanging');
    return false;
};

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
            activeTab: DEFAULT_ACTIVE_TAB,
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
    
    // State for tabs and active tab - Dashboard is ALWAYS default and first
    const [tabs, setTabs] = useState(DEFAULT_TABS);
    const [activeTab, setActiveTabState] = useState(DEFAULT_ACTIVE_TAB);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    // Show snackbar message
    const showSnackbar = useCallback((message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    // Close snackbar
    const closeSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    // Get component for tab with error handling
    const getComponentForTab = useCallback((tabId) => {
        if (!tabId || !COMPONENT_MAP[tabId]) {
            console.warn(`Component not found for tab: ${tabId}`);
            return null;
        }
        
        try {
            const Component = COMPONENT_MAP[tabId];
            return Component;
        } catch (error) {
            console.error(`Error loading component for tab ${tabId}:`, error);
            return null;
        }
    }, []);

    // Get active component
    const getActiveComponent = useCallback(() => {
        if (!activeTab) {
            console.warn('No active tab set');
            return null;
        }
        
        try {
            const Component = getComponentForTab(activeTab);
            if (!Component) {
                console.warn(`No component found for active tab: ${activeTab}`);
                return null;
            }
            return Component;
        } catch (error) {
            console.error('Error getting active component:', error);
            return null;
        }
    }, [activeTab, getComponentForTab]);

    // Open a new tab
    const openTab = useCallback((tabId, tabTitle) => {
        // Ensure Dashboard tab always exists
        setTabs(prevTabs => {
            const hasDashboard = prevTabs.some(tab => tab.id === 'Dashboard');
            if (!hasDashboard) {
                return [
                    { id: 'Dashboard', title: 'Dashboard', closeable: false },
                    ...prevTabs
                ];
            }
            return prevTabs;
        });

        // Check if tab already exists and is already active
        const existingTab = tabs.find(tab => tab.id === tabId);
        
        if (existingTab && activeTab === tabId) {
            // Tab exists and is already active, no need to navigate
            return;
        }
        
        if (existingTab) {
            // Tab exists, just activate it
            setActiveTabState(tabId);
            const url = TAB_TO_URL_MAP[tabId] || '/';
            // Only navigate if we're not already on the correct URL
            if (location.pathname !== url) {
                if (isNavigationAllowed()) {
                    navigate(url);
                }
            }
            return;
        }

        // Check permissions for the tab
        if (tabId !== 'Dashboard' && !canAccessMenuItem({ id: tabId })) {
            showSnackbar(`Access denied: ${tabTitle || tabId}`, 'error');
            return;
        }

        // Add new tab
        const newTab = { 
            id: tabId, 
            title: tabTitle || tabId,
            closeable: tabId !== 'Dashboard' // Dashboard tab is not closeable
        };

        setTabs(prevTabs => {
            // Ensure Dashboard is always the first tab
            const hasDashboard = prevTabs.some(tab => tab.id === 'Dashboard');
            if (!hasDashboard) {
                return [
                    { id: 'Dashboard', title: 'Dashboard', closeable: false },
                    ...prevTabs,
                    newTab
                ];
            }
            return [...prevTabs, newTab];
        });
        
        setActiveTabState(tabId);
        const url = TAB_TO_URL_MAP[tabId] || '/';
        if (isNavigationAllowed()) {
            navigate(url);
        }
    }, [tabs, navigate, canAccessMenuItem, showSnackbar, activeTab, location.pathname]);

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
                if (isNavigationAllowed()) {
                    navigate(url);
                }
            }
            
            // Ensure Dashboard is always the first tab
            const hasDashboard = newTabs.some(tab => tab.id === 'Dashboard');
            if (!hasDashboard && newTabs.length > 0) {
                return [
                    { id: 'Dashboard', title: 'Dashboard', closeable: false },
                    ...newTabs
                ];
            }
            
            return newTabs;
        });
    }, [activeTab, navigate]);

    // Handle route changes
    useEffect(() => {
        const currentPath = location.pathname;
        
        // If on root path, ensure dashboard is active
        if (currentPath === '/' || currentPath === '') {
            if (activeTab !== 'Dashboard') {
                setActiveTabState('Dashboard');
            }
            if (isNavigationAllowed()) {
                navigate('/dashboard');
            }
            return;
        }
        
        const tabId = URL_TO_TAB_MAP[currentPath];
        
        if (tabId) {
            // Only open tab if it's not already the active tab
            if (tabId !== activeTab) {
                // Find tab title from menu items
                const menuItem = MENU_ITEMS.find(item => item.path === currentPath);
                const tabTitle = menuItem ? menuItem.label : tabId;
                
                // Open the tab
                openTab(tabId, tabTitle);
            }
        } else if (currentPath !== '/dashboard') {
            // If we're on a non-dashboard route but tab is not mapped, redirect to dashboard
            if (isNavigationAllowed()) {
                navigate('/dashboard');
            }
        }
    }, [location.pathname, openTab, navigate, activeTab]);

    // Additional effect to ensure Dashboard is always first tab
    useEffect(() => {
        // Only update if needed to prevent infinite loops
        if (tabs.length > 0 && tabs[0].id === 'Dashboard') {
            return;
        }
        
        setTabs(prevTabs => {
            // Check if Dashboard exists and is first
            if (prevTabs.length > 0 && prevTabs[0].id === 'Dashboard') {
                return prevTabs;
            }
            
            // Find Dashboard tab
            const dashboardTab = prevTabs.find(tab => tab.id === 'Dashboard');
            if (!dashboardTab) {
                // Dashboard doesn't exist, add it as first
                return [
                    { id: 'Dashboard', title: 'Dashboard', closeable: false },
                    ...prevTabs.filter(tab => tab.id !== 'Dashboard')
                ];
            }
            
            // Move Dashboard to first position
            const otherTabs = prevTabs.filter(tab => tab.id !== 'Dashboard');
            return [dashboardTab, ...otherTabs];
        });
    }, [tabs]);

    // Memoize context value
    const contextValue = useMemo(() => ({
        tabs: tabs.length > 0 ? tabs : DEFAULT_TABS,
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