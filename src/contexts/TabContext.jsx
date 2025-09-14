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