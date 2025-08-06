import React, { useState } from 'react';
import {
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import TabPanel from './TabPanel';
import Footer from './Footer';
import { TabProvider } from '../../contexts/TabContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { DRAWER_WIDTH, COLLAPSED_WIDTH, FOOTER_HEIGHT } from './Constants';

const LayoutContent = () => {
    const theme = useTheme();
    const { currentLanguage, languages } = useLanguage();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    // Check if current language is RTL
    const isRTL = languages[currentLanguage]?.dir === 'rtl';

    // Auto-collapse sidebar on mobile/tablet
    React.useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [isMobile]);

    return (
        <TabProvider sidebarOpen={sidebarOpen}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: '100vh' 
                }}>
                    <Header
                        isDrawerCollapsed={!sidebarOpen}
                        handleDrawerToggle={() => setSidebarOpen(prev => !prev)}
                    />
                    <Box sx={{ 
                        display: 'flex', 
                        flexGrow: 1,
                        paddingBottom: `${FOOTER_HEIGHT}px` 
                    }}>
                        <Sidebar 
                            open={sidebarOpen} 
                            toggleDrawer={() => setSidebarOpen(prev => !prev)} 
                        />
                        <Box
                            component="main"
                            sx={{
                                flexGrow: 1,
                                width: {
                                    xs: '100%', // Full width on mobile
                                    sm: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)`
                                },
                                overflow: 'hidden',
                                transition: theme.transitions.create(['width', 'margin'], {
                                    easing: theme.transitions.easing.sharp,
                                    duration: theme.transitions.duration.leavingScreen,
                                }),
                                ...(isRTL ? {
                                    marginRight: {
                                        xs: 0, // No margin on mobile
                                        sm: sidebarOpen ? 0 : `-${COLLAPSED_WIDTH}px`
                                    }
                                } : {
                                    marginLeft: {
                                        xs: 0, // No margin on mobile
                                        sm: sidebarOpen ? 0 : `-${COLLAPSED_WIDTH}px`
                                    }
                                }),
                                padding: {
                                    xs: theme.spacing(0.5), // Reduced padding on mobile
                                    sm: theme.spacing(1),
                                    md: theme.spacing(1.5)
                                },
                                // Modern background with subtle gradient
                                background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
                                position: 'relative',
                                // Glass morphism effect
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.08) 0%, transparent 50%)',
                                    pointerEvents: 'none',
                                    zIndex: 0
                                },
                                // Enhanced mobile styles
                                [theme.breakpoints.down('sm')]: {
                                    minHeight: `calc(100vh - 56px - ${FOOTER_HEIGHT}px)`,
                                },
                                [theme.breakpoints.up('sm')]: {
                                    minHeight: `calc(100vh - 64px - ${FOOTER_HEIGHT}px)`,
                                }
                            }}
                        >
                            <TabPanel sidebarOpen={sidebarOpen} isMobile={isMobile} isTablet={isTablet} />
                        </Box>
                    </Box>
                    <Footer sidebarOpen={sidebarOpen} />
                </Box>
            </TabProvider>
    );
};

const Layout = () => {
    return <LayoutContent />;
};

export default Layout;