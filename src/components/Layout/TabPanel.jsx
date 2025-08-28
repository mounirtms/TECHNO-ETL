import React, { useState, useEffect, Suspense, useMemo } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    useTheme,
    CircularProgress
} from '@mui/material';
import { useTab } from '../../contexts/TabContext';
import { HEADER_HEIGHT, FOOTER_HEIGHT } from './Constants';
import { useRoutePerformance, useDocumentTitle } from '../../hooks/useRoutePerformance';

const TabPanel = () => {
    const theme = useTheme();
    
    // Safely use the tab context with error handling
    let tabContext;
    try {
        tabContext = useTab();
    } catch (error) {
        // If useTab fails (outside of TabProvider), create a fallback context
        tabContext = { 
            tabs: [], 
            activeTab: null, 
            openTab: () => {}, 
            getActiveComponent: () => null 
        };
    }
    
    const { tabs, activeTab, openTab, getActiveComponent } = tabContext;
    const [tabPanelHeight, setTabPanelHeight] = useState('100%');

    // Add route performance monitoring
    const routePerformance = useRoutePerformance();
    useDocumentTitle();

    useEffect(() => {
        const calculateHeight = () => {
            const windowHeight = window.innerHeight;
            const calculatedHeight = windowHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
            setTabPanelHeight(`${calculatedHeight}px`);
        };

        calculateHeight();
        window.addEventListener('resize', calculateHeight);
        return () => window.removeEventListener('resize', calculateHeight);
    }, []);

    const handleChange = (event, newValue) => {
        // Validate newValue before opening tab
        if (typeof newValue === 'string' && newValue.trim() !== '') {
            // Only update if the new value exists in our tabs
            const tabExists = tabs.some(tab => tab.id === newValue);
            if (tabExists) {
                openTab(newValue);
            } else {
                // Fallback to first tab if not found
                openTab(tabs[0]?.id || 'Dashboard');
            }
        }
    };

    // Safety check for activeTab validity
    const validTabIds = tabs?.map(tab => tab.id) || [];
    const safeActiveTab = validTabIds.includes(activeTab) ? activeTab : (validTabIds.length > 0 ? validTabIds[0] : 'Dashboard');
    
    // Get the active component safely
    const ActiveComponent = useMemo(() => {
        try {
            return getActiveComponent ? getActiveComponent() : null;
        } catch (error) {
            return null;
        }
    }, [activeTab, getActiveComponent]);

    return (
        <Box sx={{
            width: '100%',
            marginTop: `${HEADER_HEIGHT}px`,
            height: tabPanelHeight,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {!activeTab ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: tabPanelHeight,
                    width: '100%'
                }}>
                    <Typography>No active tab</Typography>
                </Box>
            ) : (
                <Box 
                    sx={{ 
                        height: tabPanelHeight,
                        width: '100%',
                        overflow: 'hidden'
                    }}
                >
                    <Suspense fallback={
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: '100%',
                            width: '100%'
                        }}>
                            <CircularProgress />
                        </Box>
                    }>
                        {ActiveComponent ? <ActiveComponent /> : (
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                height: '100%',
                                width: '100%'
                            }}>
                                <Typography>Component not found</Typography>
                            </Box>
                        )}
                    </Suspense>
                </Box>
            )}
        </Box>
    );
};

export default TabPanel;