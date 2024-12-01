import React, { useState, useEffect } from 'react';
import { 
    Box, 
    useTheme, 
    useMediaQuery 
} from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import TabPanel from './TabPanel';
import { TabProvider } from '../../contexts/TabContext';

// Layout dimensions
const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

/**
 * Main Layout Component
 * 
 * Structure:
 * ┌─────────────────────────────────────────┐
 * │                 Header                   │
 * ├────────┬────────────────────────────────┤
 * │        │                                │
 * │        │                                │
 * │Sidebar │           TabPanel             │
 * │        │     (Main Content Area)        │
 * │        │                                │
 * │        │                                │
 * ├────────┴────────────────────────────────┤
 * │                 Footer                   │
 * └─────────────────────────────────────────┘
 */
const Layout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState(null);

    // Handle responsive sidebar state
    useEffect(() => {
        setSidebarOpen(!isMobile);
    }, [isMobile]);

    // Sidebar toggle handler
    const handleDrawerToggle = () => {
        setSidebarOpen(prevState => !prevState);
    };

    // Profile menu handlers
    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <TabProvider>
         
                {/* Sidebar Component */}
                <Sidebar 
                    open={sidebarOpen} 
                />
                
                {/* Main Content Area */}
                <Box 
                    component="main" 
                   
                >
                    {/* Header Component */}
                    <Header    />

                    {/* TabPanel Component (Main Content) */}
                    <Box 
                     sx={{
                        flexGrow: 1,
                        width: { 
                            xs: '100%', 
                            sm: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)` 
                        },
                        marginLeft: { 
                            xs: 0,
                            sm: sidebarOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px` 
                        },
                        transition: theme.transitions.create(['width', 'margin-left'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100vh',
                        overflow: 'hidden'
                    }}>
                        <TabPanel />
                    </Box>

                    {/* Footer Component */}
                    <Footer />
                </Box>
         
        </TabProvider>
    );
};

export default Layout;