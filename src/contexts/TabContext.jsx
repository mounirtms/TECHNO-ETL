import React, { createContext, useState, useContext } from 'react';
import { MENU_ITEMS } from '../components/Layout/Constants';

// Import all components dynamically
// Import all components dynamically
import Dashboard from '../pages/Dashboard';
import ProductsGrid from '../components/grids/ProductsGrid';
import CustomersGrid from '../components/grids/CustomersGrid';
import OrdersGrid from '../components/grids/OrdersGrid';
import InvoicesGrid from '../components/grids/InvoicesGrid';
import UserProfile from '../components/UserProfile';
import CategoryTree from '../components/grids/CategoryGrid';
import StocksGrid from '../components/grids/StocksGrid';
import SourcesGrid from '../components/grids/SourcesGrid';
import CegidGrid from '../components/grids/CegidGrid';
// Component mapping
const COMPONENT_MAP = {
    Dashboard: Dashboard,
    ProductsGrid: ProductsGrid,
    CustomersGrid: CustomersGrid,
    OrdersGrid: OrdersGrid,
    InvoicesGrid: InvoicesGrid,
    UserProfile: UserProfile,
    CategoryTree: CategoryTree,
    StocksGrid: StocksGrid,
    SourcesGrid: SourcesGrid,
    CegidProductsGrid: CegidGrid
};

const TabContext = createContext();

export const TabProvider = ({ children }) => {
    // Initialize with only the Dashboard tab active
    const initialTab = MENU_ITEMS.find(item => item.id === 'Dashboard');
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
                // Check if component exists before adding tab
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
            } else {
                console.error(`No menu item found for tabId: ${tabId}`);
                return;
            }
        }
        
        setActiveTab(tabId);
    };

    const closeTab = (tabId) => {
        // Prevent closing Dashboard
        if (tabId === 'Dashboard') return;

        setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
        
        // Set active tab to Dashboard if closed tab was active
        if (activeTab === tabId) {
            setActiveTab('Dashboard');
        }
    };

    const getActiveComponent = () => {
        const activeTabItem = tabs.find(tab => tab.id === activeTab);
        
        if (!activeTabItem) {
            console.warn(`No tab found for activeTab: ${activeTab}`);
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
        <TabContext.Provider 
            value={{ 
                tabs, 
                activeTab, 
                setActiveTab, 
                openTab, 
                closeTab, 
                getActiveComponent 
            }}
        >
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