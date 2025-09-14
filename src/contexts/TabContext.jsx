<<<<<<< HEAD
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePermissions } from './PermissionContext';
import ComprehensiveDashboard from '../components/dashboard/ComprehensiveDashboard';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import { 
  PROTECTED_ROUTES, 
  getRouteByPath, 
  getRouteByTabId, 
  hasRoutePermission, 
  hasRouteRole,
  DEFAULT_ROUTE 
} from '../router/RouteConfig';

const TabContext = createContext(undefined);

/**
 * Optimized Tab Provider with Route Configuration Integration
 * 
 * Features:
 * - Uses centralized route configuration
 * - Permission-aware tab management
 * - Performance optimizations with memoization
 * - Clean separation of concerns
 */
export const TabProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userPermissions, userRole } = usePermissions();

  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  // Memoized route mappings for performance
  const routeMappings = useMemo(() => {
    const pathToTab = {};
    const tabToPath = {};
    const componentMap = {};

    PROTECTED_ROUTES.forEach(route => {
      if (route.tabId) {
        pathToTab[route.path] = route.tabId;
        tabToPath[route.tabId] = route.path;
        componentMap[route.tabId] = route.component;
      }
    });

    return { pathToTab, tabToPath, componentMap };
  }, []);

  // Get component for active tab with enhanced error handling and memoization
  const getActiveComponent = useCallback(() => {
    // Return null early if no active tab
    if (!activeTabId) {
      console.warn('No active tab ID');
      return null;
    }
    
    // Use memoized component map for faster lookup
    const Component = routeMappings.componentMap[activeTabId];
    
    // Return null if component is undefined to prevent React errors
    if (!Component) {
      console.warn(`No component found for active tab: ${activeTabId}`);
      return null;
    }
    
    return Component;
  }, [activeTabId, routeMappings.componentMap]);

  // Check if user can access a tab
  const canAccessTab = useCallback((tabId) => {
    const route = getRouteByTabId(tabId);
    if (!route) {
      console.warn(`No route found for tabId: ${tabId}`);
      return false;
    }

    // Always allow Dashboard access
    if (tabId === 'Dashboard') {
      return true;
    }

    // Check permissions and roles
    const hasPermission = hasRoutePermission(route, userPermissions);
    const hasRole = hasRouteRole(route, userRole);
    
    if (!hasPermission) {
      console.warn(`Missing permissions for ${tabId}:`, route.permissions, 'User has:', userPermissions);
    }
    
    if (!hasRole) {
      console.warn(`Missing role for ${tabId}:`, route.roleRequired, 'User role:', userRole);
    }

    return hasPermission && hasRole;
  }, [userPermissions, userRole]);

  // Check if a tab can be opened (wrapper around canAccessTab)
  const canOpenTab = useCallback((tabId) => {
    return canAccessTab(tabId);
  }, [canAccessTab]);

  // Open a new tab with permission checking
  const openTab = useCallback((tabId) => {
    if (!tabId || typeof tabId !== 'string') {
      console.warn('Invalid tabId provided to openTab:', tabId);
      return;
    }

    const route = getRouteByTabId(tabId);
    
    if (!route) {
      // Special handling for profile and settings which might use different tab IDs
      if (tabId === 'profile' || tabId === 'UserProfile') {
        // Redirect to profile route
        navigate('/profile');
        return;
      }
      
      if (tabId === 'settings' || tabId === 'Settings') {
        // Redirect to settings route
        navigate('/settings');
        return;
      }
      
      console.warn('No route found for tabId:', tabId);
      return;
    }

    // Check permissions
    if (!canAccessTab(tabId)) {
      console.warn('Access denied for tab:', tabId);
      return;
    }

    // Check if tab already exists
    const tabExists = tabs.some(tab => tab.id === tabId);
    
    if (!tabExists) {
      // Add new tab with optimized state update
      setTabs(prevTabs => {
        // Always keep Dashboard as first tab
        const dashboardIndex = prevTabs.findIndex(tab => tab.id === 'Dashboard');
        const dashboardTab = dashboardIndex >= 0 ? prevTabs[dashboardIndex] : null;
        const otherTabs = prevTabs.filter(tab => tab.id !== 'Dashboard');
        
        return [
          ...(dashboardTab ? [dashboardTab] : []),
          ...otherTabs,
          { 
            id: tabId, 
            label: route.label, 
            closeable: route.closeable !== false && tabId !== 'Dashboard',
            path: route.path,
            category: route.category
          }
        ];
      });
    }

    // Set as active tab
    setActiveTabId(tabId);
    
    // Navigate to URL only if it's different from current
    if (location.pathname !== route.path) {
      navigate(route.path, { replace: true });
    }
  }, [tabs, location.pathname, navigate, canAccessTab]);

  // Close a tab
  const closeTab = useCallback((tabId) => {
    // Never close the dashboard tab
    if (tabId === 'dashboard') {
      return;
    }
    
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // If we're closing the active tab, switch to dashboard
      if (tabId === activeTabId) {
        setActiveTabId('dashboard');
      }
      
      return newTabs;
    });
  }, [activeTabId]);

  // Close all tabs except Dashboard
  const closeAllTabs = useCallback(() => {
    setTabs([{ id: 'Dashboard', label: 'Dashboard', closeable: false, path: '/dashboard' }]);
    setActiveTabId('Dashboard');
    navigate(DEFAULT_ROUTE, { replace: true });
  }, [navigate]);

  // Add a new tab
  const addTab = useCallback((tabConfig) => {
    if (!tabConfig || !tabConfig.id) {
      console.warn('Invalid tab configuration provided to addTab');
      return;
    }
    
    // Check if tab already exists
    const tabExists = tabs.some(tab => tab.id === tabConfig.id);
    if (tabExists) {
      // Just activate existing tab
      setActiveTabId(tabConfig.id);
      return;
    }
    
    // Add new tab
    setTabs(prevTabs => [
      ...prevTabs,
      {
        id: tabConfig.id,
        label: tabConfig.label || tabConfig.id,
        closeable: tabConfig.closeable !== false,
        path: tabConfig.path || '',
        category: tabConfig.category || 'default',
        ...tabConfig
      }
    ]);
    
    // Set as active tab
    setActiveTabId(tabConfig.id);
  }, [tabs]);
  
  // Close tabs by category
  const closeTabsByCategory = useCallback((category) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => 
        tab.id === 'Dashboard' || tab.category !== category
      );
      
      // If active tab was closed, switch to Dashboard
      const activeTabClosed = prevTabs.find(tab => tab.id === activeTabId)?.category === category;
      if (activeTabClosed) {
        setActiveTabId('Dashboard');
        navigate(DEFAULT_ROUTE, { replace: true });
      }
      
      return newTabs;
    });
  }, [activeTabId, navigate]);

  // Initialize with dashboard tab
  useEffect(() => {
    if (tabs.length === 0) {
      const dashboardTab = {
        id: 'Dashboard', // Use 'Dashboard' with capital D to match route config
        title: 'Dashboard',
        icon: <DashboardIcon />,
        content: <ComprehensiveDashboard />,
        closable: false
      };
      setTabs([dashboardTab]);
      setActiveTabId('Dashboard'); // Use 'Dashboard' with capital D
    }
  }, [tabs.length]);

  // Handle route changes - SECOND
  useEffect(() => {
    // Skip if tabs not initialized yet
    if (tabs.length === 0) return;
    
    const currentRoute = getRouteByPath(location.pathname);
    
    if (currentRoute?.tabId) {
      // Check if user can access this route
      if (canAccessTab(currentRoute.tabId)) {
        // Open the tab if it's not already active or doesn't exist
        if (!tabs.some(tab => tab.id === currentRoute.tabId) || activeTabId !== currentRoute.tabId) {
          openTab(currentRoute.tabId);
        }
      } else {
        // Redirect to dashboard if no access
        console.warn(`Access denied for route: ${location.pathname}`);
        navigate(DEFAULT_ROUTE, { replace: true });
      }
    } else if (location.pathname === '/' || location.pathname === DEFAULT_ROUTE || location.pathname === '/dashboard') {
      // Ensure Dashboard is active for root/dashboard paths
      if (activeTabId !== 'Dashboard') {
        setActiveTabId('Dashboard');
        // Also ensure the dashboard tab exists
        const hasDashboard = tabs.some(tab => tab.id === 'Dashboard');
        if (!hasDashboard) {
          const dashboardTab = {
            id: 'Dashboard',
            title: 'Dashboard',
            icon: <DashboardIcon />,
            content: <ComprehensiveDashboard />,
            closable: false
          };
          setTabs(prevTabs => {
            // Always keep Dashboard as first tab
            const dashboardIndex = prevTabs.findIndex(tab => tab.id === 'Dashboard');
            if (dashboardIndex >= 0) {
              // Dashboard already exists, just make sure it's at the beginning
              const otherTabs = prevTabs.filter(tab => tab.id !== 'Dashboard');
              return [prevTabs[dashboardIndex], ...otherTabs];
            } else {
              // Dashboard doesn't exist, add it
              return [dashboardTab, ...prevTabs];
            }
          });
        }
      }
    } else {
      // For non-tab routes, keep current tab active but don't navigate
      // Only log if we're not on a tab route
      const currentTabRoute = getRouteByTabId(activeTabId);
      if (currentTabRoute && location.pathname !== currentTabRoute.path) {
        console.log(`Navigating to non-tab route: ${location.pathname}`);
      }
    }
  }, [location.pathname, activeTabId, openTab, canAccessTab, navigate, tabs.length, tabs]);

  // Ensure Dashboard is always first tab
  useEffect(() => {
    if (tabs.length > 0 && tabs[0].id !== 'Dashboard') {
      setTabs(prevTabs => {
        const dashboardTab = { 
          id: 'Dashboard', 
          label: 'Dashboard', 
          closeable: false, 
          path: '/dashboard',
          category: 'core'
        };
        const otherTabs = prevTabs.filter(tab => tab.id !== 'Dashboard');
        return [dashboardTab, ...otherTabs];
      });
    }
  }, [tabs]);

  const updateTab = useCallback((tabId, updates) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId ? { ...tab, ...updates } : tab
      )
    );
  }, []);

  // Memoized context value with deep equality check for tabs
  const contextValue = useMemo(() => ({
    tabs,
    activeTabId,
    addTab,
    closeTab,
    updateTab,
    setActiveTabId,
    getActiveComponent,  // Add the missing getActiveComponent function
    canOpenTab,  // Add the missing canOpenTab function
    openTab  // Add the missing openTab function
  }), [
    // Use JSON.stringify for deep comparison of tabs array
    JSON.stringify(tabs),
    activeTabId,
    // Note: addTab, closeTab, updateTab, and setActiveTabId are already memoized with useCallback
    addTab,
    closeTab,
    updateTab,
    setActiveTabId,
    getActiveComponent,  // Add getActiveComponent to dependencies
    canOpenTab,  // Add canOpenTab to dependencies
    openTab  // Add openTab to dependencies
  ]);

  return (
    <TabContext.Provider value={contextValue}>
      {children}
    </TabContext.Provider>
  );
};

/**
 * Enhanced useTab hook with better error handling
 */
export const useTab = () => {
  const context = useContext(TabContext);
  
  if (!context) {
    console.warn('useTab must be used within a TabProvider');
    // Return safe default values with proper dashboard tab
    return {
      tabs: [{
        id: 'Dashboard', // Use 'Dashboard' with capital D
        title: 'Dashboard',
        icon: <DashboardIcon />,
        content: <ComprehensiveDashboard />,
        closable: false
      }],
      activeTabId: 'Dashboard', // Use 'Dashboard' with capital D
      addTab: () => {},
      closeTab: () => {},
      updateTab: () => {},
      setActiveTabId: () => {},
      getActiveComponent: () => () => <ComprehensiveDashboard />, // Return a function that renders the dashboard
      canOpenTab: () => true, // Add missing canOpenTab function
      openTab: () => {} // Add missing openTab function
    };
  }
  
  return context;
};

TabProvider.propTypes = {
  children: PropTypes.node.isRequired
};
=======
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
>>>>>>> c6441e2e3dfc49039556dc9f20f39448ef505c7e
