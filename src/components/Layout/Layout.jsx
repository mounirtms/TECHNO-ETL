import React, { useState, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import TabPanel from './TabPanel';

import { HEADER_HEIGHT, DRAWER_WIDTH, COLLAPSED_WIDTH, FOOTER_HEIGHT } from './Constants';

const Layout = () => {
    const theme = useTheme();
    const isRTL = theme.direction === 'rtl';
    
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleDrawerToggle = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            bgcolor: 'background.default'
        }}>
            {/* Header at the top */}
            <Header 
                sidebarOpen={sidebarOpen} 
                handleDrawerToggle={handleDrawerToggle} 
            />
            
            {/* Main content area with sidebar and tab panel */}
            <Box sx={{ 
                display: 'flex', 
                flex: 1,
                minHeight: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`
            }}>
                {/* Sidebar on the left (or right for RTL) */}
                <Sidebar 
                    open={sidebarOpen} 
                    isRTL={isRTL}
                />
                
                {/* Tab Panel in the center */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
                        transition: theme.transitions.create(['margin', 'width'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        ...(isRTL ? {
                            marginRight: {
                                sm: sidebarOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`
                            }
                        } : {
                            marginLeft: {
                                sm: sidebarOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`
                            }
                        }),
                        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `radial-gradient(circle at 10% 20%, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0) 20%), 
                                         radial-gradient(circle at 90% 80%, rgba(255, 152, 0, 0.05) 0%, rgba(255, 152, 0, 0) 20%)`,
                            pointerEvents: 'none'
                        }
                    }}
                >
                    <TabPanel />
                </Box>
            </Box>
            
            {/* Footer at the bottom */}
            <Footer />
        </Box>
    );
};

export default Layout;