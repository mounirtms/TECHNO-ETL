import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import TabPanel from './TabPanel';
import Footer from './Footer';
import { TabProvider } from '../../contexts/TabContext';
import { LanguageProvider, useLanguage } from '../../contexts/LanguageContext'; // Import LanguageProvider
import { DRAWER_WIDTH, COLLAPSED_WIDTH } from './constants'; // Use shared constants for consistent layout

const Layout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile); // Sidebar open state based on screen size
    const [anchorEl, setAnchorEl] = useState(null); // Anchor element for profile menu
    const { language, changeLanguage } = useLanguage(); // Use language context
    const [mainContentStyles, setMainContentStyles] = useState({
        marginTop: '64px', // Adjust this value to match your header's height
        width: { 
            xs: '100%', 
            sm: `calc(100% - ${DRAWER_WIDTH}px)` 
        },
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    });

    // Toggle sidebar open/close state
    const handleDrawerToggle = () => {
        console.log('Toggling sidebar');
        setSidebarOpen((prevOpen) => !prevOpen);
        console.log('Sidebar open:', !sidebarOpen);
    };

    // Open profile menu
    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Close profile menu
    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    // Adjust sidebar state on mobile screen size change
    useEffect(() => {
        setSidebarOpen(!isMobile);
        setMainContentStyles(prev => ({
            ...prev,
            width: { 
                xs: '100%', 
                sm: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)` 
            },
        }));
    }, [isMobile, sidebarOpen]);

    useEffect(() => {
        const updateTabPanelHeight = () => {
            const headerHeight = 64; // Example height, adjust according to your actual header height
            const footerHeight = 28; // Example height, adjust according to your actual footer height
            const tabPanelHeight = window.innerHeight - headerHeight - footerHeight;
            setMainContentStyles(prev => ({
                ...prev,
                height: tabPanelHeight,
            }));
        };

        updateTabPanelHeight();
        window.addEventListener('resize', updateTabPanelHeight);

        return () => {
            window.removeEventListener('resize', updateTabPanelHeight);
        };
    }, []);

    return (
        <LanguageProvider>
        <TabProvider>
            <Box sx={{ 
                display: 'flex',
                flexDirection: 'column', // Ensure the footer is always at the bottom
                minHeight: '100vh', // Full viewport height
                backgroundColor: theme.palette.background.default 
            }}>
                <Header 
                    sidebarOpen={sidebarOpen}
                    onDrawerToggle={handleDrawerToggle}
                    handleProfileMenuOpen={handleProfileMenuOpen}
                    handleProfileMenuClose={handleProfileMenuClose}
                    anchorEl={anchorEl}
                />

                <Box sx={{ display: 'flex', flexGrow: 1 }}>
                    {/* Sidebar on the left */}
                    <Sidebar open={sidebarOpen} />

                    {/* Main content area */}
                    <Box 
                        component="main"
                        sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            flexGrow: 1,
                            overflow: 'hidden',
                            ...mainContentStyles // Apply dynamic width and margin based on sidebar state
                        }}
                    >
                        {/* Main content (TabPanel) in the center */}
                        <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                            <TabPanel />
                        </Box>
                    </Box>
                </Box>

                {/* Footer at the bottom */}
                <Footer 
                    sidebarOpen={sidebarOpen} 
                    sx={{ position: 'sticky', bottom: 0 }}
                />
            </Box>
        </TabProvider>
    </LanguageProvider>
);
};

export default Layout;