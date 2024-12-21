import React, { useState, useEffect } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    useTheme
} from '@mui/material';
import { useTab } from '../../contexts/TabContext';
import { HEADER_HEIGHT, FOOTER_HEIGHT } from './Constants';

const TabPanel = ({ sidebarOpen }) => {
    const theme = useTheme();
    const { tabs, activeTab, openTab, getActiveComponent } = useTab();
    const [tabPanelHeight, setTabPanelHeight] = useState('100%');

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
        openTab(newValue);
    };

    const ActiveComponent = getActiveComponent();

    return (
        <Box sx={{
            width: '100%',
            marginTop: `${HEADER_HEIGHT}px`,
            height: tabPanelHeight,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <Box sx={{
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: theme.palette.background.paper
            }}>
                <Tabs
                    value={activeTab}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((tab) => (

                        <Tab
                            key={tab.id}
                            label={tab.label}
                            value={tab.id}
                        />

                    ))}
                </Tabs>
            </Box>
            <Box sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
                height: `calc(${tabPanelHeight} - 48px)` // Subtract tab header height
            }}>
                {ActiveComponent ? <ActiveComponent /> : (
                    <Typography variant="body1" color="error">
                        No active component found
                    </Typography>
                )}
            </Box>
        </Box>
    );
};
export default TabPanel;