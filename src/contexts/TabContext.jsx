import React, { createContext, useState, useContext } from 'react';
import { MENU_ITEMS } from '../components/Layout/Constants';

// Import all components dynamically
import Dashboard from '../pages/Dashboard';
import ProductsGrid from '../components/grids/ProductsGrid';
import CustomersGrid from '../components/grids/CustomersGrid';
import OrdersGrid from '../components/grids/OrdersGrid';
import InvoicesGrid from '../components/grids/InvoicesGrid';

// Component mapping
const COMPONENT_MAP = {
    Dashboard: Dashboard,
    ProductsGrid: ProductsGrid,
    CustomersGrid: CustomersGrid,
    OrdersGrid: OrdersGrid,
    InvoicesGrid: InvoicesGrid
};

const TabContext = createContext();

export const TabProvider = ({ children }) => {
    const [tabs, setTabs] = useState([
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            component: 'Dashboard', 
            closeable: false 
        }
    ]);
    const [activeTab, setActiveTab] = useState('dashboard');

    const openTab = (tabId) => {
        const tabConfig = MENU_ITEMS.find(item => item.id === tabId);
        
        if (tabConfig) {
            // Check if tab already exists
            const existingTabIndex = tabs.findIndex(tab => tab.id === tabId);
            
            if (existingTabIndex === -1) {
                // Add new tab if it doesn't exist
                const newTab = {
                    id: tabId,
                    label: tabConfig.label,
                    component: tabConfig.component,
                    closeable: tabId !== 'dashboard'
                };
                
                setTabs(prevTabs => [...prevTabs, newTab]);
            }
            
            // Set as active tab
            setActiveTab(tabId);
        }
    };

    const closeTab = (tabId) => {
        // Prevent closing dashboard tab
        if (tabId === 'dashboard') return;

        setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
        
        // If closing active tab, switch to dashboard
        if (activeTab === tabId) {
            setActiveTab('dashboard');
        }
    };

    // Function to get the active component
    const getActiveComponent = () => {
        const tab = tabs.find(t => t.id === activeTab);
        return tab ? COMPONENT_MAP[tab.component] : Dashboard;
    };

    return (
        <TabContext.Provider value={{ 
            tabs, 
            activeTab, 
            setActiveTab,
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

export default TabContext;