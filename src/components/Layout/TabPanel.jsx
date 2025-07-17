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

const TabPanel = ({ sidebarOpen, isMobile = false, isTablet = false }) => {
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
                    variant={isMobile ? "scrollable" : "scrollable"}
                    scrollButtons={isMobile ? "auto" : "auto"}
                    allowScrollButtonsMobile
                    sx={{
                        '& .MuiTab-root': {
                            minWidth: isMobile ? 80 : 120,
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            padding: isMobile ? '4px 6px' : '8px 12px' // Reduced padding
                        }
                    }}
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.id}
                            label={isMobile ? tab.label.substring(0, 8) + (tab.label.length > 8 ? '...' : '') : tab.label}
                            value={tab.id}
                        />
                    ))}
                </Tabs>
            </Box>
            <Box sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: {
                    xs: 0.25, // Further reduced padding on mobile
                    sm: 0.5,
                    md: 1
                },
                height: `calc(${tabPanelHeight} - ${isMobile ? '40px' : '48px'})`, // Responsive tab header height
                '& .MuiDataGrid-root': {
                    '& .MuiDataGrid-toolbarContainer': {
                        padding: isMobile ? '4px' : '8px',
                        minHeight: isMobile ? '40px' : '56px'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        minHeight: isMobile ? '40px' : '56px'
                    },
                    '& .MuiDataGrid-row': {
                        minHeight: isMobile ? '36px' : '52px'
                    }
                }
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