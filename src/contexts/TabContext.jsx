import React, { createContext, useState, useContext } from 'react';
import { MENU_ITEMS } from '../components/Layout/Constants';

// Import all components dynamically
import Dashboard from '../pages/Dashboard';
import ProductsGrid from '../components/grids/ProductsGrid';
import CustomersGrid from '../components/grids/CustomersGrid';
import OrdersGrid from '../components/grids/OrdersGrid';
import InvoicesGrid from '../components/grids/InvoicesGrid';
import UserProfile from '../components/user/UserProfile';
import CategoryTree from '../components/grids/CategoryTree';

// Component mapping
const COMPONENT_MAP = {
    Dashboard: Dashboard,
    ProductsGrid: ProductsGrid,
    CustomersGrid: CustomersGrid,
    OrdersGrid: OrdersGrid,
    InvoicesGrid: InvoicesGrid,
    UserProfile: UserProfile,
    CategoryTree: CategoryTree
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
        return activeTabItem ? COMPONENT_MAP[activeTabItem.id] : null;
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