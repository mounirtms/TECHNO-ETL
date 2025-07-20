import React, { createContext, useState, useContext } from 'react';
import { Box } from '@mui/material'; // Add Box import for error rendering
import { MENU_ITEMS } from '../components/Layout/Constants';

// Import all components dynamically
import Dashboard from '../pages/Dashboard'; 

import CmsPageGrid from '../components/grids/magento/CmsPagesGrid'; 
import ProductsGrid from '../components/grids/magento/ProductsGrid';
import MDMProductsGrid from '../components/grids/MDMProductsGrid/MDMProductsGrid';
import CustomersGrid from '../components/grids/magento/CustomersGrid';
import OrdersGrid from '../components/grids/magento/OrdersGrid';
import InvoicesGrid from '../components/grids/magento/InvoicesGrid';
import UserProfile from '../components/UserProfile';
import CategoryTree from '../components/grids/magento/CategoryGrid';
import StocksGrid from '../components/grids/magento/StocksGrid';
import SourcesGrid from '../components/grids/magento/SourcesGrid';
import CegidGrid from '../components/grids/CegidGrid';
import GridTestPage from '../pages/GridTestPage';
import ProductManagementPage from '../pages/ProductManagementPage';

// Component mapping
const COMPONENT_MAP = {
    Dashboard: Dashboard,
    ProductsGrid: ProductsGrid,
    ProductCatalog: ProductManagementPage,
    MDMProductsGrid: MDMProductsGrid,
    CustomersGrid: CustomersGrid,
    OrdersGrid: OrdersGrid,
    InvoicesGrid: InvoicesGrid,
    UserProfile: UserProfile,
    CategoryTree: CategoryTree,
    StocksGrid: StocksGrid,
    SourcesGrid: SourcesGrid,
    CegidProductsGrid: CegidGrid,
    CmsPageGrid: CmsPageGrid,
    GridTestPage: GridTestPage
};

const TabContext = createContext();

export const TabProvider = ({ children, sidebarOpen }) => {
    // Ensure initial tab is always set
    const initialTab = MENU_ITEMS.find(item => item.id === 'Dashboard') || MENU_ITEMS[0];
    
    console.log('Initial Tab:', initialTab); // Debugging log

    const [tabs, setTabs] = useState([
        { 
            id: initialTab.id, 
            label: initialTab.label, 
            component: initialTab.id, 
            closeable: false 
        }
    ]);
    const [activeTab, setActiveTab] = useState(initialTab.id);

    const openTab = (tabId) => {
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
                        closeable: true 
                    }
                ]);
            }
        }
        
        setActiveTab(tabId);
    };

    const closeTab = (tabId) => {
        if (tabId === 'Dashboard') return;

        setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
        
        if (activeTab === tabId) {
            setActiveTab('Dashboard');
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