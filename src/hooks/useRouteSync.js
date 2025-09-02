import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTab } from '../contexts/TabContext';
import { usePermissions } from '../contexts/PermissionContext';
import { MENU_ITEMS } from '../components/Layout/MenuTree.js';

/**
 * Hook to synchronize router state with tab system
 * Ensures consistent navigation behavior and permission checking
 */
export const useRouteSync = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openTab, activeTab, tabs, canOpenTab } = useTab();
    const { canAccessMenuItem, initialized: permissionsInitialized } = usePermissions();

    useEffect(() => {
        // Skip if permissions are not initialized yet
        if (!permissionsInitialized) return;

        // Find the menu item for current route
        const currentMenuItem = MENU_ITEMS.find(item => item.path === location.pathname);
        
        if (currentMenuItem) {
            // Check if user can access this route
            if (!canAccessMenuItem(currentMenuItem)) {
                console.warn(`Access denied for route: ${location.pathname}`);
                navigate('/dashboard', { replace: true });
                return;
            }

            // Check if tab can be opened
            if (canOpenTab(currentMenuItem.id)) {
                // Open tab if it's not already active
                if (activeTab !== currentMenuItem.id) {
                    openTab(currentMenuItem.id, true); // Skip navigation to avoid loop
                }
            } else {
                console.warn(`Cannot open tab for route: ${location.pathname}`);
                navigate('/dashboard', { replace: true });
            }
        } else {
            // Route not found in menu items, check if it's a valid system route
            const systemRoutes = ['/login', '/docs'];
            if (!systemRoutes.includes(location.pathname)) {
                console.warn(`Route not found in menu items: ${location.pathname}`);
                // Only redirect if we have no tabs or current route is invalid
                if (tabs.length === 0 || !tabs.some(tab => tab.id === activeTab)) {
                    navigate('/dashboard', { replace: true });
                }
            }
        }
    }, [location.pathname, permissionsInitialized, canAccessMenuItem, canOpenTab, openTab, activeTab, tabs, navigate]);

    return {
        currentRoute: location.pathname,
        isValidRoute: MENU_ITEMS.some(item => item.path === location.pathname)
    };
};

/**
 * Hook to handle deep linking and route restoration
 */
export const useDeepLinking = () => {
    const location = useLocation();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            // Store the current route for restoration after logout/login
            const routeData = {
                path: location.pathname,
                search: location.search,
                timestamp: Date.now()
            };
            localStorage.setItem('lastVisitedRoute', JSON.stringify(routeData));
        }
    }, [currentUser, location]);

    const restoreLastRoute = () => {
        try {
            const savedRoute = localStorage.getItem('lastVisitedRoute');
            if (savedRoute) {
                const routeData = JSON.parse(savedRoute);
                // Only restore if it's recent (within 24 hours)
                if (Date.now() - routeData.timestamp < 24 * 60 * 60 * 1000) {
                    return routeData.path + routeData.search;
                }
            }
        } catch (error) {
            console.warn('Failed to restore last route:', error);
        }
        return '/dashboard';
    };

    return { restoreLastRoute };
};

export default useRouteSync;