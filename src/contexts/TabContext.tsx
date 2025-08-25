import React, { createContext, useState, useContext, useEffect, ReactNode, ComponentType, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material'; // Add Box import for error rendering
import { MENU_TREE, MENU_ITEMS as MenuItemsImport } from '../components/Layout/MenuTree';

// Cast MENU_ITEMS to the correct type with fallback
const MENU_ITEMS: MenuItem[] = Array.isArray(MenuItemsImport) ? MenuItemsImport as MenuItem[] : [];

const Dashboard = lazy(() => import('../pages/Dashboard'));
const CmsPageGrid = lazy(() => import('../components/grids/magento/CmsPagesGrid'));
const ProductsGrid = lazy(() => import('../components/grids/magento/ProductsGrid').then(module => ({ default: module.default || module })));
const MDMProductsGrid = lazy(() => import('../components/grids/MDMProductsGrid/MDMProductsGrid').then(module => ({ default: module.default || module })));
const CustomersGrid = lazy(() => import('../components/grids/magento/CustomersGrid'));
const OrdersGrid = lazy(() => import('../components/grids/magento/OrdersGrid'));
const InvoicesGrid = lazy(() => import('../components/grids/magento/InvoicesGrid'));
const UserProfile = lazy(() => import('../components/UserProfile'));
const CategoryTree = lazy(() => import('../components/grids/magento/CategoryGrid'));
const StocksGrid = lazy(() => import('../components/grids/magento/StocksGrid'));
const SourcesGrid = lazy(() => import('../components/grids/magento/SourcesGrid'));
const CegidGrid = lazy(() => import('../components/grids/CegidGrid'));
const GridTestPage = lazy(() => import('../pages/GridTestPage').then(module => ({ default: module.default || module })));
const ProductManagementPage = lazy(() => import('../pages/ProductManagementPage'));
const VotingPage = lazy(() => import('../pages/VotingPage'));
const ChartsPage = lazy(() => import('../pages/ChartsPage').then(module => ({ default: module.default || module })));
const BugBountyPage = lazy(() => import('../pages/BugBountyPage'));
const LicenseManagement = lazy(() => import('../components/License/LicenseManagement'));
const LicenseStatus = lazy(() => import('../components/License/LicenseStatus'));

// Define interfaces for Tabs system
interface Tab {
  id: string;
  label: string;
  component: string;
  closeable: boolean;
  icon?: React.ElementType;
  path?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  path?: string;
  hidden?: boolean;
  licensed?: boolean;
  category?: string;
}

interface TabContextType {
  tabs: Tab[];
  activeTab: string;
  openTab: (tabId: string, skipNavigation?: boolean) => void;
  closeTab: (tabId: string) => void;
  getActiveComponent: () => React.ComponentType<any>;
}

// Create a reusable function for importing placeholder components
const importPlaceholder = (componentName: string) => 
  import('../components/placeholders/PlaceholderComponents')
    .then((module: any) => ({ default: module[componentName] }));

// Lazy load placeholder components
const SalesAnalytics = lazy(() => importPlaceholder('SalesAnalytics'));
const InventoryAnalytics = lazy(() => importPlaceholder('InventoryAnalytics'));
const SecureVault = lazy(() => importPlaceholder('SecureVault'));
const AccessControl = lazy(() => importPlaceholder('AccessControl'));
const MDMStock = lazy(() => importPlaceholder('MDMStock'));
const MDMSources = lazy(() => importPlaceholder('MDMSources'));

// URL to Tab ID mapping
const URL_TO_TAB_MAP: { [key: string]: string } = {
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
    Object.entries(URL_TO_TAB_MAP).map(([url, tabId]: any) => [tabId, url])
);

// Component mapping
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
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

// Create the context
const TabContext = createContext<TabContextType | null>(null);

export const TabProvider = ({ children, sidebarOpen }: { children: ReactNode; sidebarOpen: boolean }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get initial tab from current URL or default to Dashboard
    const getInitialTabFromURL = (): MenuItem => {
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

    const [tabs, setTabs] = useState<Tab[]>([
        {
            id: initialTab?.id || 'Dashboard',
            label: initialTab?.label || 'Dashboard',
            component: initialTab?.id || 'Dashboard',
            closeable: false
        }
    ]);
    const [activeTab, setActiveTab] = useState<string>(initialTab?.id || 'Dashboard');

    // Sync tab changes with URL
    useEffect(() => {
        const currentTabId = URL_TO_TAB_MAP[location.pathname];
        if(currentTabId && currentTabId !== activeTab) {
            // Skip navigation to prevent infinite loop
            const tabExists = tabs.some(tab => tab.id ===currentTabId);
            if(!tabExists) {
                const newTab = MENU_ITEMS?.find(item => item?.id === currentTabId);
                if(newTab && COMPONENT_MAP[newTab.id]) {
                    setTabs(prevTabs => [
                        ...prevTabs,
                        { ...newTab,
                            component: newTab.id, // Add the component property
                            closeable: newTab.id !== 'Dashboard'
                        }
                    ]);
                }
            }
            setActiveTab(currentTabId);
        }
    }, [location.pathname, activeTab, tabs]);

    const openTab = (tabId: string, skipNavigation = false) => {
        const tabExists = tabs.some(tab => tab.id ===tabId);

        if(!tabExists) {
            const newTab = MENU_ITEMS?.find(item => item?.id === tabId);
            if(newTab) {
                if(!COMPONENT_MAP[newTab.id]) {
                    console.error(`No component found for tab: ${newTab.id}`);
                    return;
                }

                setTabs(prevTabs => [
                    ...prevTabs,
                    { ...newTab,
                        component: newTab.id, // Add the component property
                        closeable: newTab.id !== 'Dashboard' // Dashboard is never closeable
                    }
                ]);
            }
        }

        setActiveTab(tabId);

        // Navigate to corresponding URL if not skipping navigation
        if(!skipNavigation) {
            const url = TAB_TO_URL_MAP[tabId];
            if(url && location.pathname !== url) {
                navigate(url);
            }
        }
    };

    const closeTab = (tabId: string) => {
        if (tabId === 'Dashboard') return;

        setTabs(prevTabs => prevTabs.filter((tab: any) => tab.id !== tabId));

        if(activeTab ===tabId) {
            setActiveTab('Dashboard');
            navigate('/dashboard');
        }
    };

    const getActiveComponent = (): React.ComponentType<any> => {
        const activeTabItem = tabs.find(tab => tab.id ===activeTab);
        
        if(!activeTabItem) {
            console.warn(`No tab found for activeTab: ${activeTab}`);
            return () => (
                <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
                    No component found for this tab.
                </Box>
            );
        }

        const Component = COMPONENT_MAP[activeTabItem.id];
        
        if(!Component) {
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

/**
 * Custom hook to access the tab context
 * @returns The TabContext value
 * @throws Error if used outside of a TabProvider
 */
export const useTab = (): TabContextType => {
    const context = useContext(TabContext);
    if(!context) {
        throw new Error('useTab must be used within a TabProvider');
    }
    return context;
};