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
    const { 
        tabs, 
        activeTab, 
        openTab, 
        closeTab, 
        getActiveComponent 
    } = useTab();

    const handleChange = (event, newValue) => {
        openTab(newValue);
    };

    const handleCloseTab = (e, tabId) => {
        e.stopPropagation();
        closeTab(tabId);
    };

    // Get the current active component
    const ActiveComponent = getActiveComponent();

    return (
        <Box sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Tabs Container */}
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
                    allowScrollButtonsMobile
                    sx={{
                        '& .MuiTabs-scrollButtons': {
                            color: theme.palette.text.secondary
                        }
                    }}
                >
                    {tabs.map((tab, index) => (
                        <Tab 
                            key={tab.id}
                            label={
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        gap: 1 
                                    }}
                                >
                                    {tab.label}
                                    {tab.closeable && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleCloseTab(e, tab.id)}
                                            sx={{ 
                                                ml: 1, 
                                                '&:hover': { 
                                                    backgroundColor: theme.palette.action.hover 
                                                } 
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            }
                            value={tab.id}
                            {...a11yProps(index)}
                            sx={{
                                textTransform: 'none',
                                minWidth: 120,
                                '&.Mui-selected': {
                                    fontWeight: 'bold'
                                }
                            }}
                        />
                    ))}
                </Tabs>
            </Box>

            {/* Active Component Container */}
            <Box 
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    p: theme.spacing(3),
                    backgroundColor: theme.palette.background.default
                }}
            >
                {ActiveComponent ? <ActiveComponent /> : (
                    <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
                        No component selected
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default TabPanel;