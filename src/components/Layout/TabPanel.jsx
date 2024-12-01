import React from 'react';
import { 
    Box, 
    Tabs, 
    Tab, 
    useTheme,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTab } from '../../contexts/TabContext';

/**
 * TabPanel Component
 * 
 * Features:
 * - Closeable tabs
 * - Scrollable tab bar
 * - Full-width content area
 * - Active tab highlighting
 * - Smooth transitions
 */

function a11yProps(index) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`,
    };
}

const TabPanel = () => {
    const theme = useTheme();
    const { tabs, activeTab, setActiveTab, closeTab } = useTab();

    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleCloseTab = (e, tabId) => {
        e.stopPropagation();
        closeTab(tabId);
    };

    // Get the current active component
    const ActiveComponent = useTab().getActiveComponent();

    return (
        <Box sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Tabs Navigation */}
            <Box sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                backgroundColor: theme.palette.background.paper,
                width: '100%'
            }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleChange}
                    aria-label="admin dashboard tabs"
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: theme.palette.primary.main,
                        },
                        '& .MuiTab-root': {
                            minHeight: 48,
                            textTransform: 'none',
                            '&.Mui-selected': {
                                color: theme.palette.primary.main,
                            }
                        }
                    }}
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.id}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {tab.label}
                                    {tab.closeable && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleCloseTab(e, tab.id)}
                                            sx={{
                                                ml: 1,
                                                fontSize: '0.875rem',
                                                '&:hover': {
                                                    color: theme.palette.error.main,
                                                }
                                            }}
                                        >
                                            <CloseIcon fontSize="inherit" />
                                        </IconButton>
                                    )}
                                </Box>
                            }
                            {...a11yProps(tab.id)}
                        />
                    ))}
                </Tabs>
            </Box>

            {/* Tab Content Area */}
            <Box sx={{ 
                flexGrow: 1,
                width: '100%',
                overflow: 'auto',
                p: 3,
                backgroundColor: theme.palette.background.default
            }}>
                {ActiveComponent && <ActiveComponent />}
            </Box>
        </Box>
    );
};

export default TabPanel;